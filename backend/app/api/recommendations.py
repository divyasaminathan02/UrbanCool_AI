from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from app.db.database import get_db
from app.db.models import Recommendation, Zone, Intervention
from app.schemas.schemas import RecommendationOut, StatusUpdate

router = APIRouter(prefix="/recommendations", tags=["Action Recommendations"])

@router.get("", response_model=List[RecommendationOut])
def get_recommendations(
    scenario: str = Query("normal"),
    category: Optional[str] = None,
    priority: Optional[str] = None,
    status: Optional[str] = None,
    zone_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = (
        db.query(Recommendation, Zone.zone_name, Zone.ward_name)
        .join(Zone, Recommendation.zone_id == Zone.id)
        .filter(Recommendation.scenario == scenario)
    )
    
    if category and category != "All":
        query = query.filter(Recommendation.category == category)
    if priority and priority != "All":
        query = query.filter(Recommendation.priority == priority)
    if status and status != "All":
        query = query.filter(Recommendation.status == status)
    if zone_id:
        query = query.filter(Recommendation.zone_id == zone_id)
        
    results = query.order_by(Recommendation.priority.desc()).all()
    
    output = []
    for rec, z_name, w_name in results:
        rec_dict = {
            "id": rec.id,
            "zone_id": rec.zone_id,
            "scenario": rec.scenario,
            "category": rec.category,
            "priority": rec.priority,
            "action_title": rec.action_title,
            "description": rec.description,
            "expected_impact": rec.expected_impact,
            "status": rec.status,
            "assigned_department": rec.assigned_department,
            "deadline_text": rec.deadline_text,
            "created_at": rec.created_at,
            "updated_at": rec.updated_at,
            "zone_name": z_name,
            "ward_name": w_name
        }
        output.append(rec_dict)
        
    return output

@router.post("/{rec_id}/status")
def update_recommendation_status(
    rec_id: str,
    status_update: StatusUpdate,
    db: Session = Depends(get_db)
):
    valid_statuses = ["NEW", "ACKNOWLEDGED", "DISPATCHED", "IN PROGRESS", "RESOLVED"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Choose from: {valid_statuses}")
        
    rec = db.query(Recommendation).filter(Recommendation.id == rec_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
        
    rec.status = status_update.status
    rec.updated_at = datetime.utcnow()
    
    interventions = db.query(Intervention).filter(Intervention.recommendation_id == rec_id).all()
    for intv in interventions:
        intv.status = status_update.status
        intv.updated_at = datetime.utcnow()
        
    db.commit()
    return {
        "success": True,
        "message": f"Recommendation {rec_id} status updated to {status_update.status}",
        "recommendation_id": rec_id,
        "status": status_update.status
    }
