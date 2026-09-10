from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db.database import get_db
from app.db.models import Zone, RiskPrediction, Recommendation, Intervention, Alert

router = APIRouter(prefix="/zones", tags=["Zone Intelligence"])

@router.get("")
def list_zones(
    scenario: str = Query("normal"),
    ward: Optional[str] = None,
    sort_by: Optional[str] = Query("risk"),
    db: Session = Depends(get_db)
):
    query = (
        db.query(Zone, RiskPrediction)
        .join(RiskPrediction, Zone.id == RiskPrediction.zone_id)
        .filter(RiskPrediction.scenario == scenario, RiskPrediction.forecast_horizon_hours == 24)
    )
    
    if ward:
        query = query.filter(Zone.ward_name.ilike(f"%{ward}%"))
        
    results = query.all()
    
    zone_list = []
    for zone, pred in results:
        zone_list.append({
            "id": zone.id,
            "ward_id": zone.ward_id,
            "ward_name": zone.ward_name,
            "zone_name": zone.zone_name,
            "land_use": zone.land_use,
            "population": zone.population,
            "vulnerable_population": zone.vulnerable_population,
            "elevation_m": zone.elevation_m,
            "baseline_ndvi": zone.baseline_ndvi,
            "built_up_density": zone.built_up_density,
            "center_lat": zone.center_lat,
            "center_lon": zone.center_lon,
            "risk_score": pred.risk_score,
            "risk_category": pred.risk_category,
            "predicted_temp": pred.predicted_temp,
            "official_temp": pred.official_temp,
            "temp_anomaly": pred.temp_anomaly,
            "lst_celsius": pred.lst_celsius,
            "confidence_pct": pred.confidence_pct
        })
        
    if sort_by == "risk":
        zone_list.sort(key=lambda x: x["risk_score"], reverse=True)
    elif sort_by == "population":
        zone_list.sort(key=lambda x: x["population"], reverse=True)
    elif sort_by == "temperature":
        zone_list.sort(key=lambda x: x["predicted_temp"], reverse=True)
    elif sort_by == "ndvi":
        zone_list.sort(key=lambda x: x["baseline_ndvi"])
        
    return zone_list

@router.get("/{zone_id}")
def get_zone_details(
    zone_id: str,
    scenario: str = Query("normal"),
    db: Session = Depends(get_db)
):
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail=f"Zone {zone_id} not found")
        
    pred = (
        db.query(RiskPrediction)
        .filter(
            RiskPrediction.zone_id == zone_id,
            RiskPrediction.scenario == scenario,
            RiskPrediction.forecast_horizon_hours == 24
        )
        .first()
    )
    
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction data not found for specified scenario")

    hours = [f"{h:02d}:00" for h in range(24)]
    diurnal_profile = [
        0.55, 0.52, 0.50, 0.48, 0.47, 0.48, 0.52, 0.60,
        0.72, 0.83, 0.91, 0.96, 0.99, 1.00, 0.98, 0.94,
        0.87, 0.78, 0.70, 0.65, 0.62, 0.60, 0.58, 0.56
    ]
    
    t_min = pred.predicted_temp - 12.0
    t_max = pred.predicted_temp
    t_range = t_max - t_min
    
    off_min = pred.official_temp - 11.0
    off_max = pred.official_temp
    off_range = off_max - off_min
    
    hourly_curve = []
    for h_idx, hour_str in enumerate(hours):
        frac = diurnal_profile[h_idx]
        loc_t = round(t_min + frac * t_range, 1)
        off_t = round(off_min + frac * off_range, 1)
        anomaly = round(loc_t - off_t, 2)
        h_risk = round(min(100.0, max(15.0, pred.risk_score * (0.4 + 0.6 * frac))), 1)
        
        hourly_curve.append({
            "hour": hour_str,
            "predicted_temp": loc_t,
            "official_temp": off_t,
            "temp_anomaly": anomaly,
            "risk_score": h_risk
        })

    recs = (
        db.query(Recommendation)
        .filter(Recommendation.zone_id == zone_id, Recommendation.scenario == scenario)
        .all()
    )
    interventions = (
        db.query(Intervention)
        .filter(Intervention.zone_id == zone_id, Intervention.scenario == scenario)
        .all()
    )
    alerts = (
        db.query(Alert)
        .filter(Alert.zone_id == zone_id, Alert.scenario == scenario)
        .all()
    )

    feature_contributions = [
        {"feature": "Vegetation Deficit (Low NDVI)", "importance": pred.driver_ndvi_pct, "category": "Surface Cover"},
        {"feature": "Built-up Thermal Mass", "importance": pred.driver_built_up_pct, "category": "Urban Density"},
        {"feature": "Surface LST Retention", "importance": pred.driver_lst_pct, "category": "Thermal"},
        {"feature": "Airflow Stagnation Basin", "importance": pred.driver_elevation_pct, "category": "Topography"},
        {"feature": "Population Exposure Index", "importance": pred.driver_population_pct, "category": "Demographics"}
    ]

    historical_events = [
        {"year": "May 2023 Heatwave", "city_peak": 39.5, "zone_peak": round(39.5 + pred.temp_anomaly * 0.9, 1), "days_above_40": 4},
        {"year": "Apr 2024 Heat Wave", "city_peak": 40.8, "zone_peak": round(40.8 + pred.temp_anomaly * 1.05, 1), "days_above_40": 9},
        {"year": "May 2025 Heat Anomaly", "city_peak": 41.6, "zone_peak": round(41.6 + pred.temp_anomaly * 1.1, 1), "days_above_40": 14},
        {"year": "Current Outlook 2026", "city_peak": pred.official_temp, "zone_peak": pred.predicted_temp, "days_above_40": 7}
    ]

    return {
        "zone": {
            "id": zone.id,
            "ward_id": zone.ward_id,
            "ward_name": zone.ward_name,
            "zone_name": zone.zone_name,
            "land_use": zone.land_use,
            "population": zone.population,
            "vulnerable_population": zone.vulnerable_population,
            "elevation_m": zone.elevation_m,
            "baseline_ndvi": zone.baseline_ndvi,
            "built_up_density": zone.built_up_density,
            "albedo": zone.albedo,
            "center_lat": zone.center_lat,
            "center_lon": zone.center_lon
        },
        "prediction": {
            "official_temp": pred.official_temp,
            "predicted_temp": pred.predicted_temp,
            "temp_anomaly": pred.temp_anomaly,
            "heat_index": pred.heat_index,
            "lst_celsius": pred.lst_celsius,
            "ndvi_current": pred.ndvi_current,
            "humidity_pct": pred.humidity_pct,
            "wind_speed_kmh": pred.wind_speed_kmh,
            "risk_score": pred.risk_score,
            "risk_category": pred.risk_category,
            "confidence_pct": pred.confidence_pct,
            "explainable_summary": pred.explainable_summary
        },
        "hourly_forecast": hourly_curve,
        "feature_contributions": feature_contributions,
        "historical_events": historical_events,
        "recommendations": recs,
        "interventions": interventions,
        "alerts": alerts
    }
