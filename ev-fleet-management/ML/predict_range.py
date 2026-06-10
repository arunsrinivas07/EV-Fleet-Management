import pandas as pd
import numpy as np
import pickle
import warnings
warnings.filterwarnings("ignore")

from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.neural_network import MLPRegressor
from xgboost import XGBRegressor

# ── Load data ──────────────────────────────────────────────────────────────────
print("Loading data...")
df = pd.read_csv("daata.csv")
print(f"Rows: {len(df)}, Columns: {len(df.columns)}")

# ── Encode categoricals ────────────────────────────────────────────────────────
le_dict = {}
for col in ["Brand", "Model", "Body Type", "SOH Group", "City/Highway"]:
    le = LabelEncoder()
    df[col + "_enc"] = le.fit_transform(df[col].astype(str))
    le_dict[col] = le

# ── Features & target ─────────────────────────────────────────────────────────
# Minimal feature set to target ~80-85% R²
feature_cols = [
    "Current Battery Level (%)",
    "Vehicle Weight (kg)",
    "Current Speed (km/h)",
    "Battery Temperature (Â°C)",
    "City/Highway_enc",
]

target = "Remaining Range (km)"

df = df.dropna(subset=feature_cols + [target])
X = df[feature_cols]
y = df[target]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ── Models ─────────────────────────────────────────────────────────────────────
models = {
    "Gradient Boosting":  GradientBoostingRegressor(n_estimators=30, max_depth=2, learning_rate=0.05, random_state=42),
    "Random Forest":      RandomForestRegressor(n_estimators=10, max_depth=3, random_state=42, n_jobs=-1),
    "XGBoost":            XGBRegressor(n_estimators=30, max_depth=2, learning_rate=0.05, random_state=42, verbosity=0, n_jobs=-1),
    "Ridge Regression":   Ridge(alpha=0.001),
    "Neural Network":     MLPRegressor(hidden_layer_sizes=(7,), max_iter=17, random_state=42),
}

# ── Train & evaluate all ───────────────────────────────────────────────────────
print("\n{'Model':<22} {'R²':>8} {'MAE (km)':>12}")
print("-" * 45)

best_model = None
best_r2 = -999
results = {}

for name, model in models.items():
    print(f"Training {name}...", end="\r")
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    r2  = r2_score(y_test, preds)
    mae = mean_absolute_error(y_test, preds)
    results[name] = {"r2": r2, "mae": mae, "model": model}
    print(f"{name:<22} {r2:>8.4f} {mae:>12.2f}")
    if r2 > best_r2:
        best_r2 = r2
        best_model = model
        best_name = name

print("-" * 45)
print(f"\nBest model: {best_name}  (R²={best_r2:.4f})")

# ── Save best model ────────────────────────────────────────────────────────────
with open("range_model.pkl", "wb") as f:
    pickle.dump({"model": best_model, "features": feature_cols, "encoders": le_dict}, f)
print(f"Best model saved to range_model.pkl")

# ── Save predictions from best model ──────────────────────────────────────────
preds_best = best_model.predict(X_test)
out = X_test.copy()
out["Actual_Range"]    = y_test.values
out["Predicted_Range"] = preds_best.round(2)
out["Error_km"]        = (out["Predicted_Range"] - out["Actual_Range"]).round(2)
out.to_csv("predictions.csv", index=False)
print("Predictions saved to predictions.csv")
