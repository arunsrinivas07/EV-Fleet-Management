"""
model_service.py — loads range_model.pkl once at startup.
"""
import os
import pickle
import logging

logger = logging.getLogger(__name__)

_model_dict = None

MODEL_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "ML", "range_model.pkl"
)


def load_model():
    global _model_dict
    abs_path = os.path.abspath(MODEL_PATH)
    if not os.path.isfile(abs_path):
        raise FileNotFoundError(
            f"Model not found: {abs_path}. "
            "Ensure range_model.pkl is in the ML/ folder."
        )
    try:
        with open(abs_path, "rb") as f:
            data = pickle.load(f)
        if isinstance(data, dict) and "model" in data:
            _model_dict = data
        else:
            # Fallback if old pickle contains only the raw model instance
            _model_dict = {
                "model": data,
                "features": [
                    "Current Battery Level (%)",
                    "Vehicle Weight (kg)",
                    "Current Speed (km/h)",
                    "Battery Temperature (Â°C)",
                    "City/Highway_enc",
                ],
                "encoders": {}
            }
        logger.info("range_model.pkl loaded from %s", abs_path)
    except Exception as exc:
        logger.warning(
            "Pickle load failed (%s). "
            "The model was saved with a different scikit-learn version. "
            "Re-training now …", exc
        )
        _model_dict = _retrain_and_save(abs_path)
    return _model_dict


def get_model():
    global _model_dict
    if _model_dict is None:
        load_model()
    return _model_dict["model"]


def get_encoders():
    global _model_dict
    if _model_dict is None:
        load_model()
    return _model_dict.get("encoders", {})


def get_features():
    global _model_dict
    if _model_dict is None:
        load_model()
    return _model_dict.get("features", [])


# ── Auto-retrain fallback ─────────────────────────────────────────────────────

def _retrain_and_save(model_path: str):
    """
    Retrain GradientBoostingRegressor on daata.csv using the currently
    installed scikit-learn, overwrite range_model.pkl, and return the model data.
    Called automatically when the saved pickle is incompatible.
    """
    import pandas as pd
    from sklearn.ensemble import GradientBoostingRegressor
    from sklearn.preprocessing import LabelEncoder

    data_path = os.path.join(os.path.dirname(model_path), "daata.csv")
    if not os.path.isfile(data_path):
        raise FileNotFoundError(
            f"daata.csv not found at {data_path}. "
            "Cannot auto-retrain."
        )

    logger.info("Loading training data from %s …", data_path)
    df = pd.read_csv(data_path)

    le_dict = {}
    for col in ["Brand", "Model", "Body Type", "SOH Group", "City/Highway"]:
        le = LabelEncoder()
        df[col + "_enc"] = le.fit_transform(df[col].astype(str))
        le_dict[col] = le

    feature_cols = [
        "Current Battery Level (%)",
        "Vehicle Weight (kg)",
        "Current Speed (km/h)",
        "Battery Temperature (Â°C)",
        "City/Highway_enc",
    ]
    target = "Remaining Range (km)"
    df = df.dropna(subset=feature_cols + [target])

    logger.info("Retraining best model (Gradient Boosting) …")
    model = GradientBoostingRegressor(
        n_estimators=30, max_depth=2, learning_rate=0.05, random_state=42
    )
    model.fit(df[feature_cols], df[target])

    model_data = {"model": model, "features": feature_cols, "encoders": le_dict}
    with open(model_path, "wb") as f:
        pickle.dump(model_data, f)

    logger.info("Model retrained and saved to %s", model_path)
    return model_data
