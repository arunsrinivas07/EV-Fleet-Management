"""
route_service.py
TomTom Routing API — fetch route geometry, distance, duration, road-type.
"""

import os
import math
import logging
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

ROUTING_BASE = "https://api.tomtom.com/routing/1/calculateRoute"


def _key() -> str:
    k = os.getenv("VITE_TOMTOM_API_KEY", "")
    if not k:
        raise RuntimeError("VITE_TOMTOM_API_KEY environment variable is not set.")
    return k


async def get_route(
    origin_lat: float,
    origin_lng: float,
    dest_lat: float,
    dest_lng: float,
) -> dict:
    """
    Call TomTom Routing API and return structured route data.

    Returns
    -------
    {
        distance_km       : float,
        duration_seconds  : int,
        duration_text     : str,       e.g. "2 hrs 14 min"
        road_type         : str,       "Highway" | "City"
        coordinates       : list[{lat, lng}],
        sections          : list[dict],
        traffic_delay_sec : int,
    }
    """
    tomtom_key = _key()
    url = f"{ROUTING_BASE}/{origin_lat},{origin_lng}:{dest_lat},{dest_lng}/json"
    params = {
        "key":                  tomtom_key,
        "routeRepresentation":  "polyline",
        "computeTravelTimeFor": "all",
        "routeType":            "fastest",
        "traffic":              "true",
        "travelMode":           "car",
        "sectionType":          "motorway",   # valid: motorway, tollRoad, tunnel, etc.
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(url, params=params)

    if resp.status_code != 200:
        raise RuntimeError(
            f"TomTom Routing API error {resp.status_code}: {resp.text[:300]}"
        )

    data = resp.json()
    routes = data.get("routes", [])
    if not routes:
        raise RuntimeError("TomTom returned no routes for the given coordinates.")

    route = routes[0]
    summary  = route.get("summary", {})
    legs     = route.get("legs", [])
    sections = route.get("sections", [])

    # ── Distance & duration ──────────────────────────────────────────────────
    distance_m       = summary.get("lengthInMeters", 0)
    travel_time_s    = summary.get("travelTimeInSeconds", 0)
    traffic_delay_s  = summary.get("trafficDelayInSeconds", 0)
    distance_km      = round(distance_m / 1000, 2)

    # ── Duration text ─────────────────────────────────────────────────────────
    total_min  = math.ceil(travel_time_s / 60)
    hours      = total_min // 60
    minutes    = total_min % 60
    if hours > 0:
        duration_text = f"{hours} hr {minutes} min"
    else:
        duration_text = f"{minutes} min"

    # ── Coordinates (polyline) ────────────────────────────────────────────────
    coordinates = []
    for leg in legs:
        for pt in leg.get("points", []):
            coordinates.append({"lat": pt["latitude"], "lng": pt["longitude"]})

    # ── Road-type detection ────────────────────────────────────────────────────
    road_type = _detect_road_type(sections, legs)

    return {
        "distance_km":       distance_km,
        "duration_seconds":  travel_time_s,
        "duration_text":     duration_text,
        "road_type":         road_type,
        "coordinates":       coordinates,
        "sections":          sections,
        "traffic_delay_sec": traffic_delay_s,
    }


def _detect_road_type(sections: list, legs: list) -> str:
    """
    TomTom returns sections of type 'motorway' when sectionType=motorway is requested.
    If any motorway sections exist and cover a meaningful portion → Highway.
    Otherwise → City.
    """
    if not sections and not legs:
        return "City"

    # Count motorway section points vs total route points
    total_points    = sum(
        len(leg.get("points", [])) for leg in legs
    )
    motorway_points = 0

    for section in sections:
        s_type = str(section.get("sectionType", "")).lower()
        if s_type == "motorway":
            start = section.get("startPointIndex", 0)
            end   = section.get("endPointIndex", 0)
            motorway_points += max(0, end - start)

    if total_points > 0 and (motorway_points / total_points) >= 0.35:
        return "Highway"
    return "City"
