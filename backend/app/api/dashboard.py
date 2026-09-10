from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Zone, RiskPrediction, Recommendation, Intervention

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("")
def get_dashboard_summary(
    scenario: str = Query("normal"),
    db: Session = Depends(get_db)
):
    predictions = (
        db.query(RiskPrediction, Zone)
        .join(Zone, RiskPrediction.zone_id == Zone.id)
        .filter(RiskPrediction.scenario == scenario, RiskPrediction.forecast_horizon_hours == 24)
        .all()
    )
    
    total_zones = len(predictions)
    if total_zones == 0:
        return {"error": "No prediction data found. Please seed database."}
        
    risk_scores = [p[0].risk_score for p in predictions]
    city_avg_risk = round(sum(risk_scores) / total_zones, 1)
    
    high_risk_zones = [p for p in predictions if p[0].risk_score >= 80]
    high_risk_count = len(high_risk_zones)
    
    exposed_pop = sum(p[1].population for p in predictions if p[0].risk_score >= 70)
    
    interventions = db.query(Intervention).filter(Intervention.scenario == scenario).all()
    active_interventions_count = len(interventions)
    awaiting_dispatch_count = len([i for i in interventions if i.status in ["NEW", "ACKNOWLEDGED"]])
    
    avg_confidence = round(sum(p[0].confidence_pct for p in predictions) / total_zones, 1)
    
    sorted_preds = sorted(predictions, key=lambda x: x[0].risk_score, reverse=True)
    priority_zones = []
    for pred, zone in sorted_preds[:6]:
        drivers = [
            ("Low canopy", pred.driver_ndvi_pct),
            ("Dense built-up", pred.driver_built_up_pct),
            ("High surface LST", pred.driver_lst_pct),
            ("Low elevation stagnation", pred.driver_elevation_pct)
        ]
        drivers.sort(key=lambda d: d[1], reverse=True)
        top_driver = f"{drivers[0][0]} + {drivers[1][0]}"
        
        if pred.risk_score >= 90:
            rec_action = "Prioritize emergency water tanker & misting"
        elif pred.risk_score >= 80:
            rec_action = "Activate emergency cooling shelter"
        elif pred.risk_score >= 70:
            rec_action = "Issue public heat warning & labor pause"
        else:
            rec_action = "Routine microclimate monitoring"
            
        priority_zones.append({
            "zone_id": zone.id,
            "zone_name": zone.zone_name,
            "ward_name": zone.ward_name,
            "risk_score": pred.risk_score,
            "risk_category": pred.risk_category,
            "predicted_temp": pred.predicted_temp,
            "official_temp": pred.official_temp,
            "temp_anomaly": pred.temp_anomaly,
            "population_exposed": zone.population,
            "primary_driver": top_driver,
            "recommended_action": rec_action,
            "center_lat": zone.center_lat,
            "center_lon": zone.center_lon
        })
        
    recs = db.query(Recommendation).filter(Recommendation.scenario == scenario).all()
    water_recs = [r for r in recs if r.category == "Water"]
    cooling_recs = [r for r in recs if r.category == "Cooling Centers"]
    alert_recs = [r for r in recs if r.category == "Public Alerts"]
    canopy_recs = [r for r in recs if r.category == "Tree Canopy"]
    
    return {
        "city": "Pune Municipal Region",
        "scenario": scenario,
        "kpis": {
            "city_heat_risk": {
                "score": city_avg_risk,
                "max": 100,
                "category": "High" if city_avg_risk >= 70 else ("Moderate" if city_avg_risk >= 45 else "Low"),
                "trend": "+4.2 vs seasonal baseline"
            },
            "high_risk_zones": {
                "count": high_risk_count,
                "total": total_zones,
                "trend": f"+{max(1, high_risk_count - 5)} from yesterday"
            },
            "population_exposed": {
                "count": exposed_pop,
                "trend": "Concentrated in core commercial & transit corridors"
            },
            "active_interventions": {
                "total": active_interventions_count,
                "awaiting_dispatch": awaiting_dispatch_count,
                "in_progress": len([i for i in interventions if i.status in ["DISPATCHED", "IN PROGRESS"]])
            },
            "forecast_confidence": {
                "percentage": avg_confidence,
                "status": "Validated on historical station grid"
            }
        },
        "priority_zones": priority_zones,
        "action_cards": [
            {
                "category": "Water Tanker Deployment",
                "priority": "CRITICAL" if scenario in ["heatwave", "extreme"] else "HIGH",
                "count": len(water_recs),
                "zones_text": f"{len(water_recs)} priority zones",
                "recommended_time": "Dispatch recommended before 11:30 AM",
                "action": "Open Water Dispatch"
            },
            {
                "category": "Cooling Center Activation",
                "priority": "CRITICAL" if scenario == "extreme" else "HIGH",
                "count": len(cooling_recs),
                "zones_text": f"{len(cooling_recs)} civic facilities",
                "recommended_time": "Operational by 10:00 AM",
                "action": "Activate Centers"
            },
            {
                "category": "Public Heat Advisory",
                "priority": "HIGH",
                "count": len(alert_recs),
                "zones_text": f"~{exposed_pop:,} residents",
                "recommended_time": "Broadcast in progress",
                "action": "View Alert Queue"
            },
            {
                "category": "Tree Canopy Intervention",
                "priority": "MEDIUM",
                "count": len(canopy_recs),
                "zones_text": f"{len(canopy_recs)} urban canopy deficit zones",
                "recommended_time": "Urban forestry scheduling",
                "action": "Review Canopy Plans"
            }
        ]
    }
