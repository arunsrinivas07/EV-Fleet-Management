"""
confidence_service.py
Re-exported thin wrapper so callers can import from one place.
Actual logic lives in range_predictor._compute_confidence.
"""

from .range_predictor import _compute_confidence


def compute_confidence(feature_row: dict) -> dict:
    """
    Return confidence score and level for a given feature row.

    Parameters
    ----------
    feature_row : dict — same keys as FEATURE_ORDER (numeric values)

    Returns
    -------
    { score: float (0-100), level: str ("High"|"Medium"|"Low") }
    """
    score = _compute_confidence(feature_row)
    level = (
        "High"   if score >= 85
        else "Medium" if score >= 70
        else "Low"
    )
    return {"score": score, "level": level}
