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

from .model_service import get_model, get_car_specs

logger = logging.getLogger(__name__)

# Training-set stats for confidence scoring (approximate or fallback)
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
    trip: float = 0.0,        # Default trip length to 0.0 if not provided
) -> dict:
    """
    Predict remaining range (km) using the loaded custom model package.
    """
    # Rule 1: If battery is 0, predicted remaining range is exactly 0.0
    if battery_level_pct == 0:
        predicted_range_km = 0.0
    else:
        car_specs = get_car_specs()
        
        # Robust lookup in car_specs for the model row
        matches = car_specs[car_specs['Model'] == model_name]
        if len(matches) == 0:
            matches = car_specs[car_specs['Model'].str.lower() == model_name.lower()]
        if len(matches) == 0:
            matches = car_specs[car_specs['Model'].str.lower().str.contains(model_name.lower())]
        
        if len(matches) == 0:
            specs = car_specs.iloc[0]
        else:
            specs = matches.iloc[0]

        # Convert city/highway string input into 0 or 1
        city_highway_val = 0 if road_type == "City" else 1

        # Build feature vector in exact order:
        # ["Trip (km)", "Current Battery Level (%)", "Car_Encoded", "City/Highway", "Current Speed (km/h)", 
        #  "Battery_Capacity", "Claimed_Range", "Vehicle_Weight", "Energy_Consumption", "Max_Power", "Brand_Encoded"]
        feature_vector = {
            "Trip (km)": float(trip),
            "Current Battery Level (%)": float(battery_level_pct),
            "Car_Encoded": float(specs["Car_Encoded"]),
            "City/Highway": float(city_highway_val),
            "Current Speed (km/h)": float(current_speed_kmh),
            "Battery_Capacity": float(specs["Battery_Capacity"]),
            "Claimed_Range": float(specs["Claimed_Range"]),
            "Vehicle_Weight": float(specs["Vehicle_Weight"]),
            "Energy_Consumption": float(specs["Energy_Consumption"]),
            "Max_Power": float(specs["Max_Power"]),
            "Brand_Encoded": float(specs["Brand_Encoded"])
        }

        # Predict range per percent battery, then scale by multiplying by battery level
        model = get_model()
        df_features = pd.DataFrame([feature_vector])
        predicted_range_per_percent = float(model.predict(df_features)[0])
        predicted_range = predicted_range_per_percent * battery_level_pct
        predicted_range_km = max(0.0, round(predicted_range, 1))

    # ── Effective mileage (km per full 100 % charge) ──────────────────────────
    battery_frac = battery_level_pct / 100.0
    effective_mileage = (
        round(predicted_range_km / battery_frac, 1) if battery_frac > 0 else 0.0
    )

    # ── Confidence ────────────────────────────────────────────────────────────
    # Fallback/estimate check
    row_for_conf = {
        "Current Battery Level (%)": float(battery_level_pct),
        "Current Speed (km/h)":      float(current_speed_kmh),
        "Battery Temperature (Â°C)": float(battery_temp_c),
        "Vehicle Weight (kg)":        float(vehicle_weight_kg),
    }
    confidence_score = _compute_confidence(row_for_conf)
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

