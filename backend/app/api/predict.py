from fastapi import APIRouter
from app.schemas.schemas import PredictRequest, PredictResponse
from app.ml.model import ml_engine
from app.ml.explainability import compute_feature_contributions

router = APIRouter(prefix="/predict", tags=["AI Downscaling Inference"])

@router.post("", response_model=PredictResponse)
def predict_microclimate(req: PredictRequest):
    pred = ml_engine.predict_grid(
        official_temp=req.official_temp,
        humidity=req.humidity,
        wind_speed=req.wind_speed,
        lst_celsius=req.lst_celsius,
        ndvi=req.ndvi,
        elevation_m=req.elevation_m,
        built_up_density=req.built_up_density,
        population_density=req.population_density
    )
    
    contribs = compute_feature_contributions(
        ndvi=req.ndvi,
        built_up_density=req.built_up_density,
        lst_celsius=req.lst_celsius,
        official_temp=req.official_temp,
        elevation_m=req.elevation_m,
        population=int(req.population_density * 0.8)
    )
    
    return {
        "predicted_temp": pred["predicted_temp"],
        "temp_anomaly": pred["temp_anomaly"],
        "heat_index": pred["heat_index"],
        "risk_score": pred["risk_score"],
        "risk_category": pred["risk_category"],
        "confidence_pct": pred["confidence_pct"],
        "contributions": contribs
    }
