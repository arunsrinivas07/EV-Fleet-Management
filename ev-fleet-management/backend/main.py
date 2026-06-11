"""
main.py — FastAPI backend for EV Range Prediction
Run:  python -m backend.start
"""
import logging
import os
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

from .services.model_service import load_model
from .services.range_predictor import predict_range
from .services.route_service import get_route
from .services.charging_service import find_stations_along_route, calculate_charging_plan

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ── Startup ───────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Loading range_model.pkl …")
    try:
        load_model()
        logger.info("Model ready.")
    except FileNotFoundError as exc:
        logger.critical("STARTUP FAILED: %s", exc)
        raise
    yield


app = FastAPI(title="EV Fleet Range Prediction API", version="2.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Vehicle spec table (capacity + weight — not in Supabase vehicles table) ───
VEHICLE_SPECS = {
    "Creta EV":         {"capacity_kwh": 45.0, "weight_kg": 1577, "brand": "Hyundai"},
    "Ioniq 5":          {"capacity_kwh": 72.6, "weight_kg": 1910, "brand": "Hyundai"},
    "Carens Clavis EV": {"capacity_kwh": 51.4, "weight_kg": 1690, "brand": "Kia"},
    "EV6":              {"capacity_kwh": 77.4, "weight_kg": 1960, "brand": "Kia"},
    "EV9":              {"capacity_kwh": 99.8, "weight_kg": 2585, "brand": "Kia"},
    "Comet EV":         {"capacity_kwh": 17.3, "weight_kg":  950, "brand": "MG"},
    "Windsor EV":       {"capacity_kwh": 38.0, "weight_kg": 1580, "brand": "MG"},
    "ZS EV":            {"capacity_kwh": 50.3, "weight_kg": 1592, "brand": "MG"},
    "BE 6":             {"capacity_kwh": 59.0, "weight_kg": 1890, "brand": "Mahindra"},
    "XEV 9e":           {"capacity_kwh": 79.0, "weight_kg": 2070, "brand": "Mahindra"},
    "XUV400 EV":        {"capacity_kwh": 39.4, "weight_kg": 1528, "brand": "Mahindra"},
    "Curvv EV":         {"capacity_kwh": 55.0, "weight_kg": 1680, "brand": "Tata"},
    "Nexon EV":         {"capacity_kwh": 40.5, "weight_kg": 1445, "brand": "Tata"},
    "Punch EV":         {"capacity_kwh": 35.0, "weight_kg": 1315, "brand": "Tata"},
    "Tiago EV":         {"capacity_kwh": 24.0, "weight_kg": 1150, "brand": "Tata"},
}


def _resolve_spec(model_name: str) -> dict:
    if model_name in VEHICLE_SPECS:
        return VEHICLE_SPECS[model_name]
    for key, spec in VEHICLE_SPECS.items():
        if key.lower() in model_name.lower() or model_name.lower() in key.lower():
            return spec
    raise HTTPException(
        422,
        f"Model '{model_name}' not recognised. Known: {list(VEHICLE_SPECS.keys())}"
    )


def _clean_model_name(raw: str) -> str:
    """Strip brand prefix if present: 'Tata Nexon EV' → 'Nexon EV'."""
    for key in VEHICLE_SPECS:
        if key.lower() in raw.lower():
            return key
    return raw


def _estimate_battery_temp(battery_health: float, speed: float) -> float:
    base = 28.0 + (100.0 - battery_health) * 0.05 + speed * 0.02
    return round(min(45.0, max(15.0, base)), 1)


# ── Request / Response schemas ────────────────────────────────────────────────

class PredictRequest(BaseModel):
    # All vehicle data sent from the frontend (already fetched from Supabase via AppContext)
    vehicle_id:       str
    model:            str
    manufacturer:     str
    battery_percent:  float = Field(..., ge=0, le=100)
    battery_health:   float = Field(..., ge=0, le=105)
    speed:            float = Field(..., ge=0)
    total_distance:   float = Field(..., ge=0)
    # Road type selected by the user
    road_type: str = Field("City", description="'City' or 'Highway'")
    # Optional route
    origin_lat: Optional[float] = None
    origin_lng: Optional[float] = None
    dest_lat:   Optional[float] = None
    dest_lng:   Optional[float] = None

    @field_validator("road_type")
    @classmethod
    def validate_road_type(cls, v):
        if v not in ("City", "Highway"):
            raise ValueError("road_type must be 'City' or 'Highway'")
        return v


class StationOut(BaseModel):
    id:              str
    name:            str
    address:         str
    lat:             float
    lng:             float
    connector_types: List[str]
    power_kw:        float
    operator:        str
    available:       Optional[bool] = None


class ChargingStopOut(BaseModel):
    station:                StationOut
    distance_from_start_km: float


class PredictResponse(BaseModel):
    # ML output
    predicted_range_km: float
    effective_mileage:  float
    confidence_score:   float
    confidence_level:   str
    road_type:          str
    # Vehicle info echoed back for display
    vehicle_id:         str
    model:              str
    manufacturer:       str
    battery_percent:    float
    battery_health:     float
    speed:              float
    total_distance:     float
    battery_capacity_kwh: float
    vehicle_weight_kg:  float
    battery_temp_c:     float
    # Route
    route_distance_km:    Optional[float]      = None
    route_duration:       Optional[str]        = None
    route_road_type:      Optional[str]        = None
    route_coordinates:    Optional[List[dict]] = None
    # Trip feasibility
    can_complete_trip:     Optional[bool]  = None
    charging_required:     Optional[bool]  = None
    stops_needed:          Optional[int]   = None
    remaining_battery_pct: Optional[float] = None
    consumed_pct:          Optional[float] = None
    # Stations
    charging_stations:  Optional[List[StationOut]]      = None
    recommended_stops:  Optional[List[ChargingStopOut]] = None


# ── Endpoint ──────────────────────────────────────────────────────────────────

@app.post("/api/predict", response_model=PredictResponse)
async def predict(req: PredictRequest):

    spec       = _resolve_spec(req.model)
    model_name = _clean_model_name(req.model)
    brand      = spec["brand"]
    battery_temp = _estimate_battery_temp(req.battery_health, req.speed)
    road_type  = req.road_type

    # ── ML prediction ─────────────────────────────────────────────────────────
    try:
        ml = predict_range(
            battery_level_pct    = req.battery_percent,
            current_speed_kmh    = req.speed,
            battery_temp_c       = battery_temp,
            battery_capacity_kwh = spec["capacity_kwh"],
            vehicle_weight_kg    = spec["weight_kg"],
            road_type            = road_type,
            brand                = brand,
            model_name           = model_name,
            trip                 = 0.0,
        )
    except ValueError as exc:
        raise HTTPException(422, str(exc))
    except Exception as exc:
        logger.exception("ML prediction error")
        raise HTTPException(500, f"Prediction failed: {exc}")

    # Build the base response (no route)
    base = dict(
        **ml,
        vehicle_id          = req.vehicle_id,
        model               = req.model,
        manufacturer        = req.manufacturer,
        battery_percent     = req.battery_percent,
        battery_health      = req.battery_health,
        speed               = req.speed,
        total_distance      = req.total_distance,
        battery_capacity_kwh= spec["capacity_kwh"],
        vehicle_weight_kg   = spec["weight_kg"],
        battery_temp_c      = battery_temp,
    )

    # ── Route (optional) ─────────────────────────────────────────────────────
    has_route = all(
        v is not None
        for v in [req.origin_lat, req.origin_lng, req.dest_lat, req.dest_lng]
    )
    if not has_route:
        return PredictResponse(**base)

    try:
        route = await get_route(req.origin_lat, req.origin_lng, req.dest_lat, req.dest_lng)
    except RuntimeError as exc:
        raise HTTPException(502, str(exc))

    # Re-predict with TomTom-detected road type if it differs
    detected = route["road_type"]
    if detected != road_type:
        try:
            ml = predict_range(
                battery_level_pct    = req.battery_percent,
                current_speed_kmh    = req.speed,
                battery_temp_c       = battery_temp,
                battery_capacity_kwh = spec["capacity_kwh"],
                vehicle_weight_kg    = spec["weight_kg"],
                road_type            = detected,
                brand                = brand,
                model_name           = model_name,
                trip                 = route["distance_km"],
            )
            base.update(ml)
        except Exception:
            pass

    # ── Charging stations ─────────────────────────────────────────────────────
    try:
        raw_stations = await find_stations_along_route(route["coordinates"])
    except Exception as exc:
        logger.warning("Charging station search failed: %s", exc)
        raw_stations = []

    # ── Charging plan ─────────────────────────────────────────────────────────
    plan = calculate_charging_plan(
        predicted_range_km  = base["predicted_range_km"],
        route_distance_km   = route["distance_km"],
        current_battery_pct = req.battery_percent,
        stations            = raw_stations,
        coordinates         = route["coordinates"],
    )

    return PredictResponse(
        **base,
        route_distance_km  = route["distance_km"],
        route_duration     = route["duration_text"],
        route_road_type    = route["road_type"],
        route_coordinates  = route["coordinates"],
        can_complete_trip  = plan["can_complete_trip"],
        charging_required  = plan["charging_required"],
        stops_needed       = plan["stops_needed"],
        remaining_battery_pct = plan["remaining_battery_pct"],
        consumed_pct       = plan["consumed_pct"],
        charging_stations  = [StationOut(**s) for s in raw_stations],
        recommended_stops  = [
            ChargingStopOut(
                station=StationOut(**stop["station"]),
                distance_from_start_km=stop["distance_from_start_km"],
            )
            for stop in plan["recommended_stops"]
        ],
    )


@app.get("/api/health")
async def health():
    from .services.model_service import _model
    return {"status": "ok", "model_loaded": _model is not None}
