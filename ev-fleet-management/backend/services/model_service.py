"""
model_service.py — loads range_model.pkl once at startup.
"""
import os
import pickle
import logging

logger = logging.getLogger(__name__)

_model = None
_car_specs = None
_brand_encoder = None
_car_encoder = None

MODEL_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "ML", "ev_model_package.pkl"
)


def load_model():
    global _model, _car_specs, _brand_encoder, _car_encoder
    abs_path = os.path.abspath(MODEL_PATH)
    if not os.path.isfile(abs_path):
        raise FileNotFoundError(
            f"Model package not found: {abs_path}. "
            "Ensure ev_model_package.pkl is in the ML/ folder."
        )
    with open(abs_path, "rb") as f:
        ev_package = pickle.load(f)
    _model = ev_package["model"]
    _car_specs = ev_package["car_specs"]
    _brand_encoder = ev_package["brand_encoder"]
    _car_encoder = ev_package["car_encoder"]
    logger.info("ev_model_package.pkl successfully loaded from %s", abs_path)


def get_model():
    global _model
    if _model is None:
        load_model()
    return _model


def get_car_specs():
    global _car_specs
    if _car_specs is None:
        load_model()
    return _car_specs


def get_brand_encoder():
    global _brand_encoder
    if _brand_encoder is None:
        load_model()
    return _brand_encoder


def get_car_encoder():
    global _car_encoder
    if _car_encoder is None:
        load_model()
    return _car_encoder

