# EV Fleet — ML Range Prediction Backend

FastAPI service that wraps the trained ElasticNet model, TomTom Routing API, and TomTom Search API.

## Quick start

```bash
# 1. Install dependencies (from project root)
pip install -r backend/requirements.txt

# 2. Ensure ML/elastic_net_model.pkl is present (already committed)

# 3. Start the server (reads TOMTOM_API_KEY from .env automatically)
python -m backend.start
```

Server runs at **http://localhost:8000**

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/predict` | Full ML prediction + optional route analysis |
| `GET`  | `/api/health`  | Liveness check — confirms model is loaded |

## POST /api/predict — request body

```json
{
  "battery_level_pct":      80,
  "battery_capacity_kwh":   51.4,
  "claimed_range_km":       473,
  "battery_health_pct":     95,
  "energy_consumption":     15.49,
  "vehicle_weight_kg":      1735,
  "current_speed_kmh":      45,
  "battery_temp_c":         28,
  "distance_travelled_km":  15000,
  "charging_cycles":        120,
  "driver_score":           85,

  // Optional — include for full route + charging analysis
  "origin_lat":  13.0850,
  "origin_lng":  80.2101,
  "dest_lat":    12.9352,
  "dest_lng":    77.6245
}
```

## Response (route included)

```json
{
  "predicted_range_km":  312.4,
  "effective_mileage":   390.5,
  "confidence_score":    91.2,
  "confidence_level":    "High",
  "route_distance_km":   346.0,
  "route_duration":      "4 hrs 12 min",
  "road_type":           "Highway",
  "route_coordinates":   [...],
  "can_complete_trip":   false,
  "charging_required":   true,
  "stops_needed":        1,
  "remaining_battery_pct": 0.0,
  "consumed_pct":        100.0,
  "charging_stations":   [...],
  "recommended_stops":   [
    {
      "station": { "name": "Tata Power EZ Charge", "lat": 13.08, "lng": 80.21, ... },
      "distance_from_start_km": 280.5
    }
  ]
}
```

## Service architecture

```
backend/
├── main.py                  FastAPI app + lifespan (model load on startup)
├── start.py                 Convenience uvicorn launcher
├── requirements.txt
└── services/
    ├── model_service.py     Pickle model singleton loader
    ├── range_predictor.py   Feature building + ElasticNet prediction
    ├── route_service.py     TomTom Routing API
    ├── charging_service.py  TomTom Search API + charging plan
    └── confidence_service.py  Confidence score wrapper
```

## Feature order (must match training exactly)

```python
[
    "Current Battery Level (%)",
    "Battery Capacity (kWh)",
    "Claimed Range (km)",
    "Battery Health (SOH %)",
    "Energy Consumption (kWh/100km)",
    "Vehicle Weight (kg)",
    "Current Speed (km/h)",
    "Battery Temperature (°C)",
    "Distance Travelled (km)",
    "Charging Cycles",
    "Driver Score",
    "Hour",
    "Month",
    "DayOfWeek",
]
```

`Hour`, `Month`, `DayOfWeek` are injected automatically from the current timestamp.
