from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db.models import DataSource
from app.schemas.schemas import DataSourceOut

router = APIRouter(prefix="/data-sources", tags=["Data Sources Transparency"])

@router.get("", response_model=List[DataSourceOut])
def list_data_sources(db: Session = Depends(get_db)):
    sources = db.query(DataSource).all()
    return sources
