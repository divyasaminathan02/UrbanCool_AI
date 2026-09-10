from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class LoginRequest(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    department: str
    is_active: bool

    class Config:
        from_attributes = True

class ZoneBase(BaseModel):
    id: str
    ward_id: str
    ward_name: str
    zone_name: str
    center_lat: float
    center_lon: float
    bbox_lat_min: float
    bbox_lat_max: float
    bbox_lon_min: float
    bbox_lon_max: float
    land_use: str
    population: int
    vulnerable_population: int
    elevation_m: float
    baseline_ndvi: float
    built_up_density: float
    albedo: float

    class Config:
        from_attributes = True

class RiskPredictionOut(BaseModel):
    id: int
    zone_id: str
    scenario: str
    forecast_horizon_hours: int
    official_temp: float
    predicted_temp: float
    temp_anomaly: float
    heat_index: float
    lst_celsius: float
    ndvi_current: float
    humidity_pct: float
    wind_speed_kmh: float
    risk_score: float
    risk_category: str
    confidence_pct: float
    driver_ndvi_pct: float
    driver_built_up_pct: float
    driver_lst_pct: float
    driver_elevation_pct: float
    driver_population_pct: float
    explainable_summary: str

    class Config:
        from_attributes = True

class ZoneWithRiskOut(ZoneBase):
    current_prediction: Optional[RiskPredictionOut] = None

class RecommendationOut(BaseModel):
    id: str
    zone_id: str
    scenario: str
    category: str
    priority: str
    action_title: str
    description: str
    expected_impact: str
    status: str
    assigned_department: str
    deadline_text: str
    created_at: datetime
    updated_at: datetime
    zone_name: Optional[str] = None
    ward_name: Optional[str] = None

    class Config:
        from_attributes = True

class StatusUpdate(BaseModel):
    status: str # NEW, ACKNOWLEDGED, DISPATCHED, IN PROGRESS, RESOLVED

class InterventionOut(BaseModel):
    id: str
    recommendation_id: Optional[str] = None
    zone_id: str
    scenario: str
    title: str
    intervention_type: str
    priority: str
    target_location: str
    reason: str
    suggested_dispatch: str
    status: str
    assigned_department: str
    eta_minutes: int
    dispatches_count: int
    impact_metric: str
    created_at: datetime
    updated_at: datetime
    zone_name: Optional[str] = None

    class Config:
        from_attributes = True

class InterventionCreate(BaseModel):
    zone_id: str
    recommendation_id: Optional[str] = None
    title: str
    intervention_type: str
    priority: str
    target_location: str
    reason: str
    suggested_dispatch: str
    assigned_department: str
    scenario: Optional[str] = "normal"

class AlertOut(BaseModel):
    id: str
    zone_id: str
    scenario: str
    severity: str
    headline: str
    message: str
    peak_temp: float
    population_exposed: int
    recommended_actions: List[str]
    status: str
    created_at: datetime
    zone_name: Optional[str] = None
    ward_name: Optional[str] = None

    class Config:
        from_attributes = True

class DataSourceOut(BaseModel):
    id: str
    name: str
    provider: str
    data_type: str
    resolution: str
    update_frequency: str
    purpose: str
    status: str
    last_sync: str
    reliability_pct: float

    class Config:
        from_attributes = True

class PredictRequest(BaseModel):
    official_temp: float
    humidity: float
    wind_speed: float
    lst_celsius: float
    ndvi: float
    elevation_m: float
    built_up_density: float
    population_density: float

class PredictResponse(BaseModel):
    predicted_temp: float
    temp_anomaly: float
    heat_index: float
    risk_score: float
    risk_category: str
    confidence_pct: float
    contributions: Dict[str, Any]
