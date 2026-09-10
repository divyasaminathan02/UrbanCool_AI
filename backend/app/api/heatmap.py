from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db.database import get_db
from app.db.models import Zone, RiskPrediction

router = APIRouter(prefix="/heatmap", tags=["HeatMap GIS"])

@router.get("")
def get_heatmap_grid(
    scenario: str = Query("normal"),
    horizon: int = Query(24),
    risk_filter: Optional[str] = Query(None),
    pop_filter: Optional[str] = Query(None),
    ndvi_filter: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = (
        db.query(Zone, RiskPrediction)
        .join(RiskPrediction, Zone.id == RiskPrediction.zone_id)
        .filter(RiskPrediction.scenario == scenario, RiskPrediction.forecast_horizon_hours == horizon)
    )
    
    results = query.all()
    
    features = []
    for zone, pred in results:
        if risk_filter == "high_plus" and pred.risk_score < 60:
            continue
        elif risk_filter == "very_high_plus" and pred.risk_score < 80:
            continue
        elif risk_filter == "extreme" and pred.risk_score < 90:
            continue
            
        if pop_filter == "high_exposure" and zone.population < 20000:
            continue
            
        if ndvi_filter == "low" and zone.baseline_ndvi >= 0.20:
            continue
        elif ndvi_filter == "high" and zone.baseline_ndvi < 0.40:
            continue
            
        bounds = [
            [zone.bbox_lat_min, zone.bbox_lon_min],
            [zone.bbox_lat_max, zone.bbox_lon_min],
            [zone.bbox_lat_max, zone.bbox_lon_max],
            [zone.bbox_lat_min, zone.bbox_lon_max],
            [zone.bbox_lat_min, zone.bbox_lon_min]
        ]
        
        features.append({
            "type": "Feature",
            "id": zone.id,
            "properties": {
                "zone_id": zone.id,
                "ward_id": zone.ward_id,
                "ward_name": zone.ward_name,
                "zone_name": zone.zone_name,
                "land_use": zone.land_use,
                "population": zone.population,
                "vulnerable_population": zone.vulnerable_population,
                "elevation_m": zone.elevation_m,
                "baseline_ndvi": zone.baseline_ndvi,
                "built_up_density": zone.built_up_density,
                "center": [zone.center_lat, zone.center_lon],
                "bounds": [
                    [zone.bbox_lat_min, zone.bbox_lon_min],
                    [zone.bbox_lat_max, zone.bbox_lon_max]
                ],
                "official_temp": pred.official_temp,
                "predicted_temp": pred.predicted_temp,
                "temp_anomaly": pred.temp_anomaly,
                "heat_index": pred.heat_index,
                "lst_celsius": pred.lst_celsius,
                "ndvi_current": pred.ndvi_current,
                "risk_score": pred.risk_score,
                "risk_category": pred.risk_category,
                "confidence_pct": pred.confidence_pct,
                "drivers": {
                    "ndvi_pct": pred.driver_ndvi_pct,
                    "built_up_pct": pred.driver_built_up_pct,
                    "lst_pct": pred.driver_lst_pct,
                    "elevation_pct": pred.driver_elevation_pct,
                    "population_pct": pred.driver_population_pct
                },
                "explainable_summary": pred.explainable_summary
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [bounds]
            }
        })
        
    return {
        "city": "Pune",
        "scenario": scenario,
        "horizon_hours": horizon,
        "total_cells": len(features),
        "type": "FeatureCollection",
        "features": features
    }
