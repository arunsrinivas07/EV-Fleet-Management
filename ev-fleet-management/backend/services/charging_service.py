"""
charging_service.py
TomTom Search API — find EV charging stations along a route corridor,
calculate charging stops needed, and build an optimised charging plan.
"""

import os
import math
import logging
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

SEARCH_BASE = "https://api.tomtom.com/search/2/nearbySearch"
CORRIDOR_KM = 5.0   # search radius each side of sampled route points
MAX_STATIONS = 20   # cap per search call


def _key() -> str:
    k = os.getenv("TOMTOM_API_KEY", "")
    if not k:
        raise RuntimeError("TOMTOM_API_KEY environment variable is not set.")
    return k


# ── Public API ─────────────────────────────────────────────────────────────────

async def find_stations_along_route(
    coordinates: list,
    corridor_km: float = CORRIDOR_KM,
) -> list:
    """
    Sample ~6 evenly-spaced points along the route polyline and search
    for EV charging stations within corridor_km of each point.
    Returns a deduplicated list of station dicts.
    """
    if not coordinates:
        return []

    step   = max(1, len(coordinates) // 6)
    sample = coordinates[::step]
    # always include the last point (near destination)
    if sample[-1] != coordinates[-1]:
        sample.append(coordinates[-1])

    seen_ids: set  = set()
    stations: list = []

    async with httpx.AsyncClient(timeout=15.0) as client:
        for pt in sample:
            batch = await _search_ev_stations(client, pt["lat"], pt["lng"], corridor_km)
            for s in batch:
                if s["id"] not in seen_ids:
                    seen_ids.add(s["id"])
                    stations.append(s)

    return stations


async def _search_ev_stations(client: httpx.AsyncClient, lat: float, lng: float, radius_km: float) -> list:
    """Search TomTom for EV charging POIs near a coordinate."""
    url = f"{SEARCH_BASE}/.json"
    params = {
        "key":         _key(),
        "lat":         lat,
        "lon":         lng,
        "radius":      int(radius_km * 1000),
        "limit":       MAX_STATIONS,
        "categorySet": "7309",   # EV Charging Station POI category
        "view":        "IN",
    }
    try:
        resp = await client.get(url, params=params)
        if resp.status_code != 200:
            logger.warning("TomTom station search HTTP %s at (%.4f, %.4f)", resp.status_code, lat, lng)
            return []
        return [_parse_station(r) for r in resp.json().get("results", [])]
    except Exception as exc:
        logger.error("Station search exception: %s", exc)
        return []


def _parse_station(result: dict) -> dict:
    """Normalise a TomTom POI result into a flat station dict."""
    poi      = result.get("poi", {})
    address  = result.get("address", {})
    position = result.get("position", {})

    # Extract connector types and power rating from classifications if present
    connector_types: list[str] = []
    power_kw: float = 50.0
    for cls in poi.get("classifications", []):
        for code in cls.get("codes", []):
            name = str(code.get("name", "")).lower()
            if any(t in name for t in ("type 2", "ccs", "chademo", "type2", "ac", "dc")):
                connector_types.append(code.get("name", ""))
            if "kw" in name:
                try:
                    power_kw = float(name.replace("kw", "").strip())
                except ValueError:
                    pass

    brand_list = poi.get("brand", [])
    operator   = brand_list[0].get("name", "Unknown") if brand_list else "Unknown"

    return {
        "id":              result.get("id", f"{position.get('lat','')},{position.get('lon','')}"),
        "name":            poi.get("name", "EV Charging Station"),
        "address":         address.get("freeformAddress", ""),
        "lat":             float(position.get("lat", 0.0)),
        "lng":             float(position.get("lon", 0.0)),
        "connector_types": connector_types or ["Type 2", "CCS"],
        "power_kw":        power_kw,
        "operator":        operator,
        "available":       None,
    }


# ── Charging plan ──────────────────────────────────────────────────────────────

def calculate_charging_plan(
    predicted_range_km:  float,
    route_distance_km:   float,
    current_battery_pct: float,
    stations:            list,
    coordinates:         list,
) -> dict:
    """
    Decide if the trip needs charging, how many stops, and which stations.

    consumed_pct  = (route_distance_km / predicted_range_km) * current_battery_pct
    remaining_pct = current_battery_pct - consumed_pct  (clamped 0-100)
    """
    if predicted_range_km <= 0:
        predicted_range_km = 1.0  # guard against division by zero

    can_complete = predicted_range_km >= route_distance_km

    consumed_pct  = min(100.0, round(
        (route_distance_km / predicted_range_km) * current_battery_pct, 1
    ))
    remaining_pct = max(0.0, round(current_battery_pct - consumed_pct, 1))

    if can_complete:
        return {
            "charging_required":     False,
            "stops_needed":          0,
            "recommended_stops":     [],
            "remaining_battery_pct": remaining_pct,
            "can_complete_trip":     True,
            "consumed_pct":          consumed_pct,
        }

    # Number of additional full-range legs needed beyond the first
    remaining_distance = route_distance_km - predicted_range_km
    stops_needed = max(1, math.ceil(remaining_distance / predicted_range_km) + 1)

    recommended = _select_optimal_stations(
        stations, coordinates, predicted_range_km, route_distance_km, stops_needed
    )

    return {
        "charging_required":     True,
        "stops_needed":          stops_needed,
        "recommended_stops":     recommended,
        "remaining_battery_pct": 0.0,
        "can_complete_trip":     False,
        "consumed_pct":          consumed_pct,
    }


# ── Internal helpers ───────────────────────────────────────────────────────────

def _select_optimal_stations(
    stations:           list,
    coordinates:        list,
    predicted_range_km: float,
    route_distance_km:  float,
    stops_needed:       int,
) -> list:
    """
    For each ideal stop position (80% of range intervals), pick the station
    closest to that position along the route, avoiding repeats.
    """
    if not stations or not coordinates:
        return []

    cum_dist     = _cumulative_distances(coordinates)
    total_km     = cum_dist[-1] if cum_dist else route_distance_km
    interval_km  = predicted_range_km * 0.8

    ideal_positions = [
        interval_km * (i + 1)
        for i in range(stops_needed)
        if interval_km * (i + 1) < total_km
    ]

    recommended: list = []
    used_ids:    set  = set()

    for ideal_km in ideal_positions:
        best_station  = None
        best_score    = float("inf")
        best_dist_km  = 0.0

        for s in stations:
            if s["id"] in used_ids:
                continue
            route_km = _closest_route_km(s["lat"], s["lng"], coordinates, cum_dist)
            score    = abs(route_km - ideal_km)
            if score < best_score:
                best_score    = score
                best_station  = s
                best_dist_km  = route_km

        # Only include if within half a range-leg of the ideal position
        if best_station and best_score < predicted_range_km * 0.5:
            used_ids.add(best_station["id"])
            recommended.append({
                "station":                best_station,
                "distance_from_start_km": round(best_dist_km, 1),
            })

    return recommended


def _cumulative_distances(coords: list) -> list[float]:
    dists = [0.0]
    for i in range(1, len(coords)):
        dists.append(
            dists[-1] + _haversine(
                coords[i - 1]["lat"], coords[i - 1]["lng"],
                coords[i]["lat"],     coords[i]["lng"],
            )
        )
    return dists


def _closest_route_km(
    s_lat: float, s_lng: float,
    coords: list, cum_dist: list[float],
) -> float:
    min_d    = float("inf")
    best_cum = 0.0
    for i, pt in enumerate(coords):
        d = _haversine(s_lat, s_lng, pt["lat"], pt["lng"])
        if d < min_d:
            min_d    = d
            best_cum = cum_dist[i]
    return best_cum


def _haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R  = 6371.0
    φ1 = math.radians(lat1)
    φ2 = math.radians(lat2)
    dφ = math.radians(lat2 - lat1)
    dλ = math.radians(lng2 - lng1)
    a  = math.sin(dφ / 2) ** 2 + math.cos(φ1) * math.cos(φ2) * math.sin(dλ / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
