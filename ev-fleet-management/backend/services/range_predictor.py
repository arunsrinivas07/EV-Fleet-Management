"""
range_predictor.py
Build the 9-feature DataFrame in exact training order and predict remaining range.

Features (from predict_range.py):
    Battery Level (%)
    Current Speed (km/h)
    Battery Temperature (°C)
    Battery Capacity (kWh)
    Vehicle Weight (kg)
    City                   — 1 if city road, 0 otherwise
    Highway                — 1 if highway, 0 otherwise  (column has trailing space)
    Brand_enc              — integer encoded brand
    Model_enc              — integer encoded model
"""
import logging
import numpy as np
import pandas as pd

from .model_service import get_model, get_encoders, get_features

logger = logging.getLogger(__name__)

# Training-set stats for confidence scoring (from daata.csv)
TRAIN_STATS = {
    "Current Battery Level (%)":  {"mean": 50.0,  "std": 29.0},
    "Current Speed (km/h)":       {"mean": 65.0,  "std": 35.0},
    "Battery Temperature (Â°C)":  {"mean": 29.0,  "std": 4.0},
    "Vehicle Weight (kg)":        {"mean": 1620.0,"std": 270.0},
}


def predict_range(
    battery_level_pct: float,
    current_speed_kmh: float,
    battery_temp_c: float,
    battery_capacity_kwh: float,
    vehicle_weight_kg: float,
    road_type: str,           # "City" | "Highway"
    brand: str,
    model_name: str,
) -> dict:
    """
    Predict remaining range (km) using the trained GradientBoostingRegressor.

    Returns
    -------
    {
        predicted_range_km : float,
        effective_mileage  : float,   km per full charge
        confidence_score   : float,   0-100
        confidence_level   : str,     High / Medium / Low
        road_type          : str,
    }
    """
    # ── Encode road_type using encoders from the model pickle ─────────────────
    encoders = get_encoders()
    le_city_highway = encoders.get("City/Highway")
    if le_city_highway is not None:
        road_type_str = "0" if road_type == "City" else "1"
        try:
            city_highway_enc = int(le_city_highway.transform([road_type_str])[0])
        except Exception:
            city_highway_enc = 0 if road_type == "City" else 1
    else:
        city_highway_enc = 0 if road_type == "City" else 1

    row = {
        "Current Battery Level (%)": float(battery_level_pct),
        "Vehicle Weight (kg)":       float(vehicle_weight_kg),
        "Current Speed (km/h)":      float(current_speed_kmh),
        "Battery Temperature (Â°C)": float(battery_temp_c),
        "City/Highway_enc":          float(city_highway_enc),
    }

    # ── Build DataFrame in exact column order ─────────────────────────────────
    df = pd.DataFrame([row], columns=get_features())

    # ── Predict ───────────────────────────────────────────────────────────────
    model = get_model()
    raw = float(model.predict(df)[0])
    predicted_range_km = max(0.0, round(raw, 1))

    # ── Effective mileage (km per full 100 % charge) ──────────────────────────
    battery_frac = battery_level_pct / 100.0
    effective_mileage = (
        round(predicted_range_km / battery_frac, 1) if battery_frac > 0 else 0.0
    )

    # ── Confidence ────────────────────────────────────────────────────────────
    confidence_score = _compute_confidence(row)
    confidence_level = (
        "High"   if confidence_score >= 85
        else "Medium" if confidence_score >= 70
        else "Low"
    )

    return {
        "predicted_range_km": predicted_range_km,
        "effective_mileage":  effective_mileage,
        "confidence_score":   confidence_score,
        "confidence_level":   confidence_level,
        "road_type":          road_type,
    }


def _compute_confidence(row: dict) -> float:
    z_scores = []
    for feat, stats in TRAIN_STATS.items():
        if stats["std"] > 0:
            z = abs(row[feat] - stats["mean"]) / stats["std"]
            z_scores.append(z)
    if not z_scores:
        return 75.0
    mean_z = float(np.mean(z_scores))
    return round(max(40.0, min(98.0, 98.0 - mean_z * 15.0)), 1)
