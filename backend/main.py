from fastapi.responses import Response
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import os
from pathlib import Path

app = FastAPI(
    title="SwasthAI ML Microservice",
    description="ML predictions for Diabetes, Heart Disease & Parkinsons",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Model loading ──────────────────────────────────────────────────────────────
def _model_path(filename: str) -> str:
    base_paths = [
        Path(__file__).parent / "models" / filename,
        Path(__file__).parent / "models" / "ml" / filename,
    ]
    for p in base_paths:
        if p.exists():
            return str(p)
    raise FileNotFoundError(f"Model not found: {filename}")

diabetes_model   = joblib.load(_model_path("diabetes_model.pkl"))
heart_model      = joblib.load(_model_path("heart_disease_model.pkl"))
parkinsons_model = joblib.load(_model_path("parkinsons_model.pkl"))

# ── Request schemas ────────────────────────────────────────────────────────────
class DiabetesInput(BaseModel):
    Pregnancies: float
    Glucose: float
    BloodPressure: float
    SkinThickness: float
    Insulin: float
    BMI: float
    DiabetesPedigreeFunction: float
    Age: float

class HeartInput(BaseModel):
    age: float
    sex: float
    cp: float
    trestbps: float
    chol: float
    fbs: float
    restecg: float
    thalach: float
    exang: float
    oldpeak: float
    slope: float
    ca: float
    thal: float

class ParkinsonsInput(BaseModel):
    fo: float
    fhi: float
    flo: float
    jitter_percent: float
    shimmer: float
    nhr: float
    hnr: float

# ── Routes ─────────────────────────────────────────────────────────────────────
@app.get("/")
def home():
    return {
        "service": "SwasthAI ML Microservice",
        "status": "running 🚀",
        "version": "2.0.0",
        "endpoints": [
            "POST /predict/diabetes",
            "POST /predict/heart",
            "POST /predict/parkinsons"
        ]
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "models_loaded": ["diabetes", "heart", "parkinsons"]}

@app.post("/predict/diabetes")
def predict_diabetes(data: DiabetesInput):
    try:
        features = np.array([[
            data.Pregnancies, data.Glucose, data.BloodPressure,
            data.SkinThickness, data.Insulin, data.BMI,
            data.DiabetesPedigreeFunction, data.Age
        ]])
        prediction = diabetes_model.predict(features)
        probability = diabetes_model.predict_proba(features)[0].tolist() if hasattr(diabetes_model, 'predict_proba') else None
        return {
            "prediction": "Diabetic" if prediction[0] == 1 else "Not Diabetic",
            "result": int(prediction[0]),
            "probability": probability
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/heart")
def predict_heart(data: HeartInput):
    try:
        features = np.array([[
            data.age, data.sex, data.cp, data.trestbps, data.chol,
            data.fbs, data.restecg, data.thalach, data.exang,
            data.oldpeak, data.slope, data.ca, data.thal
        ]])
        prediction = heart_model.predict(features)
        probability = heart_model.predict_proba(features)[0].tolist() if hasattr(heart_model, 'predict_proba') else None
        return {
            "prediction": "Heart Disease" if prediction[0] == 1 else "No Heart Disease",
            "result": int(prediction[0]),
            "probability": probability
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/parkinsons")
def predict_parkinsons(data: ParkinsonsInput):
    try:
        features = np.array([[
            data.fo, data.fhi, data.flo,
            data.jitter_percent,
            data.jitter_percent * 0.00006,
            data.jitter_percent * 0.45,
            data.jitter_percent * 0.48,
            data.jitter_percent * 1.35,
            data.shimmer,
            data.shimmer * 0.11,
            data.shimmer * 0.45,
            data.shimmer * 0.57,
            data.shimmer * 0.62,
            data.shimmer * 1.35,
            data.nhr, data.hnr,
            0.498, 0.718, -5.684, 0.227, 2.382, 0.206
        ]])
        prediction = parkinsons_model.predict(features)
        probability = parkinsons_model.predict_proba(features)[0].tolist() if hasattr(parkinsons_model, 'predict_proba') else None
        return {
            "prediction": "Parkinsons" if prediction[0] == 1 else "No Parkinsons",
            "result": int(prediction[0]),
            "probability": probability
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Run ────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 5000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
@app.head("/health")
def health_head():
    return Response(status_code=200)

