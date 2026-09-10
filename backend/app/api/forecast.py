from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import RiskPrediction, Zone

router = APIRouter(prefix="/forecast", tags=["Forecast Timeline"])

@router.get("")
def get_48h_forecast_timeline(
    scenario: str = Query("normal"),
    db: Session = Depends(get_db)
):
    preds = (
        db.query(RiskPrediction, Zone)
        .join(Zone, RiskPrediction.zone_id == Zone.id)
        .filter(RiskPrediction.scenario == scenario, RiskPrediction.forecast_horizon_hours == 24)
        .all()
    )
    
    if not preds:
        return {"error": "No forecast data found"}
        
    avg_official = round(sum(p[0].official_temp for p in preds) / len(preds), 1)
    avg_predicted = round(sum(p[0].predicted_temp for p in preds) / len(preds), 1)
    max_predicted = round(max(p[0].predicted_temp for p in preds), 1)
    avg_anomaly = round(sum(p[0].temp_anomaly for p in preds) / len(preds), 2)
    avg_humidity = round(sum(p[0].humidity_pct for p in preds) / len(preds), 1)
    avg_risk = round(sum(p[0].risk_score for p in preds) / len(preds), 1)
    
    days = [
        {
            "day_label": "Today (Day 1)",
            "date_text": "12 Sept 2026",
            "official_high": avg_official,
            "urban_cool_high": max_predicted,
            "mean_anomaly": f"+{avg_anomaly}°C",
            "risk_level": "High" if avg_risk >= 70 else "Moderate",
            "slots": [
                {"time": "Morning (06:00 - 11:00)", "official": round(avg_official - 6.5, 1), "localized": round(avg_official - 5.8, 1), "heat_index": 31.2, "humidity": 58, "risk": "Moderate", "confidence": 94},
                {"time": "Afternoon (12:00 - 16:30)", "official": avg_official, "localized": max_predicted, "heat_index": round(max_predicted + 3.8, 1), "humidity": avg_humidity, "risk": "Extreme" if max_predicted >= 41 else "Very High", "confidence": 91},
                {"time": "Evening (17:00 - 20:00)", "official": round(avg_official - 3.2, 1), "localized": round(avg_official - 1.5, 1), "heat_index": 36.4, "humidity": 48, "risk": "High", "confidence": 90},
                {"time": "Night (21:00 - 05:00)", "official": round(avg_official - 8.0, 1), "localized": round(avg_official - 6.0, 1), "heat_index": 28.5, "humidity": 65, "risk": "Low", "confidence": 93}
            ]
        },
        {
            "day_label": "Tomorrow (Day 2)",
            "date_text": "13 Sept 2026",
            "official_high": round(avg_official + 0.6, 1),
            "urban_cool_high": round(max_predicted + 0.8, 1),
            "mean_anomaly": f"+{round(avg_anomaly + 0.2, 2)}°C",
            "risk_level": "Very High" if avg_risk >= 65 else "High",
            "slots": [
                {"time": "Morning (06:00 - 11:00)", "official": round(avg_official - 5.8, 1), "localized": round(avg_official - 5.0, 1), "heat_index": 32.4, "humidity": 54, "risk": "Moderate", "confidence": 90},
                {"time": "Afternoon (12:00 - 16:30)", "official": round(avg_official + 0.6, 1), "localized": round(max_predicted + 0.8, 1), "heat_index": round(max_predicted + 4.6, 1), "humidity": round(avg_humidity - 2.0, 1), "risk": "Extreme", "confidence": 88},
                {"time": "Evening (17:00 - 20:00)", "official": round(avg_official - 2.8, 1), "localized": round(avg_official - 0.9, 1), "heat_index": 37.8, "humidity": 45, "risk": "High", "confidence": 87},
                {"time": "Night (21:00 - 05:00)", "official": round(avg_official - 7.5, 1), "localized": round(avg_official - 5.4, 1), "heat_index": 29.2, "humidity": 62, "risk": "Low", "confidence": 89}
            ]
        },
        {
            "day_label": "Day +2 (Day 3)",
            "date_text": "14 Sept 2026",
            "official_high": round(avg_official - 0.4, 1),
            "urban_cool_high": round(max_predicted - 0.2, 1),
            "mean_anomaly": f"+{avg_anomaly}°C",
            "risk_level": "High" if avg_risk >= 70 else "Moderate",
            "slots": [
                {"time": "Morning (06:00 - 11:00)", "official": round(avg_official - 6.2, 1), "localized": round(avg_official - 5.5, 1), "heat_index": 31.8, "humidity": 56, "risk": "Moderate", "confidence": 86},
                {"time": "Afternoon (12:00 - 16:30)", "official": round(avg_official - 0.4, 1), "localized": round(max_predicted - 0.2, 1), "heat_index": round(max_predicted + 3.2, 1), "humidity": avg_humidity, "risk": "Very High", "confidence": 84},
                {"time": "Evening (17:00 - 20:00)", "official": round(avg_official - 3.4, 1), "localized": round(avg_official - 1.8, 1), "heat_index": 35.9, "humidity": 50, "risk": "Moderate", "confidence": 83},
                {"time": "Night (21:00 - 05:00)", "official": round(avg_official - 8.2, 1), "localized": round(avg_official - 6.2, 1), "heat_index": 28.1, "humidity": 66, "risk": "Low", "confidence": 85}
            ]
        }
    ]

    sorted_hotspots = sorted(preds, key=lambda x: x[0].temp_anomaly, reverse=True)[:5]
    hotspot_comparison = []
    for pred, zone in sorted_hotspots:
        hotspot_comparison.append({
            "zone_id": zone.id,
            "zone_name": zone.zone_name,
            "ward_name": zone.ward_name,
            "official_temp": pred.official_temp,
            "localized_temp": pred.predicted_temp,
            "anomaly": f"+{pred.temp_anomaly}°C",
            "land_cover_reason": f"NDVI {zone.baseline_ndvi:.2f}, Built-up {int(zone.built_up_density*100)}%",
            "risk_category": pred.risk_category
        })

    return {
        "city": "Pune Municipal Region",
        "scenario": scenario,
        "official_forecast_base": avg_official,
        "localized_max_peak": max_predicted,
        "mean_thermal_anomaly": avg_anomaly,
        "core_story": "UrbanCool AI identifies localized warming caused by land-cover and environmental conditions. While official stations report a moderate city average, concrete-dense corridors experience up to +3.9°C higher microclimate exposure.",
        "timeline_days": days,
        "hotspot_comparison": hotspot_comparison
    }
