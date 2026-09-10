from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
import uuid
from app.db.database import get_db
from app.db.models import Intervention, Zone, Recommendation
from app.schemas.schemas import InterventionOut, InterventionCreate, StatusUpdate

router = APIRouter(prefix="/interventions", tags=["Municipal Operations"])

@router.get("", response_model=List[InterventionOut])
def get_interventions(
    scenario: str = Query("normal"),
    status: Optional[str] = None,
    intervention_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = (
        db.query(Intervention, Zone.zone_name)
        .join(Zone, Intervention.zone_id == Zone.id)
        .filter(Intervention.scenario == scenario)
    )
    
    if status and status != "All":
        query = query.filter(Intervention.status == status)
    if intervention_type and intervention_type != "All":
        query = query.filter(Intervention.intervention_type == intervention_type)
        
    results = query.order_by(Intervention.updated_at.desc()).all()
    
    output = []
    for intv, z_name in results:
        intv_dict = {
            "id": intv.id,
            "recommendation_id": intv.recommendation_id,
            "zone_id": intv.zone_id,
            "scenario": intv.scenario,
            "title": intv.title,
            "intervention_type": intv.intervention_type,
            "priority": intv.priority,
            "target_location": intv.target_location,
            "reason": intv.reason,
            "suggested_dispatch": intv.suggested_dispatch,
            "status": intv.status,
            "assigned_department": intv.assigned_department,
            "eta_minutes": intv.eta_minutes,
            "dispatches_count": intv.dispatches_count,
            "impact_metric": intv.impact_metric,
            "created_at": intv.created_at,
            "updated_at": intv.updated_at,
            "zone_name": z_name
        }
        output.append(intv_dict)
        
    return output

@router.post("", response_model=InterventionOut)
def create_intervention(
    intv_in: InterventionCreate,
    db: Session = Depends(get_db)
):
    zone = db.query(Zone).filter(Zone.id == intv_in.zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
        
    intv_id = f"INT-{uuid.uuid4().hex[:8].upper()}"
    
    intv = Intervention(
        id=intv_id,
        recommendation_id=intv_in.recommendation_id,
        zone_id=intv_in.zone_id,
        scenario=intv_in.scenario or "normal",
        title=intv_in.title,
        intervention_type=intv_in.intervention_type,
        priority=intv_in.priority,
        target_location=intv_in.target_location,
        reason=intv_in.reason,
        suggested_dispatch=intv_in.suggested_dispatch,
        status="DISPATCHED",
        assigned_department=intv_in.assigned_department,
        eta_minutes=35,
        dispatches_count=1,
        impact_metric=f"~{min(zone.population, 5000):,} citizens served",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(intv)
    
    if intv_in.recommendation_id:
        rec = db.query(Recommendation).filter(Recommendation.id == intv_in.recommendation_id).first()
        if rec:
            rec.status = "DISPATCHED"
            rec.updated_at = datetime.utcnow()
            
    db.commit()
    db.refresh(intv)
    
    return {
        "id": intv.id,
        "recommendation_id": intv.recommendation_id,
        "zone_id": intv.zone_id,
        "scenario": intv.scenario,
        "title": intv.title,
        "intervention_type": intv.intervention_type,
        "priority": intv.priority,
        "target_location": intv.target_location,
        "reason": intv.reason,
        "suggested_dispatch": intv.suggested_dispatch,
        "status": intv.status,
        "assigned_department": intv.assigned_department,
        "eta_minutes": intv.eta_minutes,
        "dispatches_count": intv.dispatches_count,
        "impact_metric": intv.impact_metric,
        "created_at": intv.created_at,
        "updated_at": intv.updated_at,
        "zone_name": zone.zone_name
    }

@router.post("/{intv_id}/status")
def update_intervention_status(
    intv_id: str,
    status_update: StatusUpdate,
    db: Session = Depends(get_db)
):
    intv = db.query(Intervention).filter(Intervention.id == intv_id).first()
    if not intv:
        raise HTTPException(status_code=404, detail="Intervention not found")
        
    intv.status = status_update.status
    if status_update.status == "RESOLVED":
        intv.eta_minutes = 0
    elif status_update.status == "IN PROGRESS":
        intv.eta_minutes = max(0, intv.eta_minutes - 15)
        
    intv.updated_at = datetime.utcnow()
    db.commit()
    
    return {
        "success": True,
        "message": f"Intervention {intv_id} status updated to {status_update.status}",
        "status": status_update.status
    }
