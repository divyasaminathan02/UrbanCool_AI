from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from app.db.database import get_db
from app.db.models import Alert, Zone
from app.schemas.schemas import AlertOut, StatusUpdate

router = APIRouter(prefix="/alerts", tags=["Municipal Heat Warnings"])

@router.get("", response_model=List[AlertOut])
def get_alerts(
    scenario: str = Query("normal"),
    severity: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = (
        db.query(Alert, Zone.zone_name, Zone.ward_name)
        .join(Zone, Alert.zone_id == Zone.id)
        .filter(Alert.scenario == scenario)
    )
    
    if severity and severity != "All":
        query = query.filter(Alert.severity == severity)
    if status and status != "All":
        query = query.filter(Alert.status == status)
        
    results = query.order_by(Alert.peak_temp.desc()).all()
    
    output = []
    for alert, z_name, w_name in results:
        alert_dict = {
            "id": alert.id,
            "zone_id": alert.zone_id,
            "scenario": alert.scenario,
            "severity": alert.severity,
            "headline": alert.headline,
            "message": alert.message,
            "peak_temp": alert.peak_temp,
            "population_exposed": alert.population_exposed,
            "recommended_actions": alert.recommended_actions or [],
            "status": alert.status,
            "created_at": alert.created_at,
            "zone_name": z_name,
            "ward_name": w_name
        }
        output.append(alert_dict)
        
    return output

@router.post("/{alert_id}/status")
def update_alert_status(
    alert_id: str,
    status_update: StatusUpdate,
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    alert.status = status_update.status
    db.commit()
    
    return {
        "success": True,
        "message": f"Alert {alert_id} status updated to {status_update.status}",
        "status": status_update.status
    }
