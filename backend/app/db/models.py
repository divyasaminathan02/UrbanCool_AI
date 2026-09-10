from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(50), default="HEAT_OFFICER") # ADMIN, HEAT_OFFICER, PLANNER, WATER_OFFICER, PUBLIC_HEALTH
    department = Column(String(100), default="Municipal Disaster & Climate Cell")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Zone(Base):
    __tablename__ = "zones"

    id = Column(String(50), primary_key=True, index=True) # e.g. "PMC-W17-G042"
    ward_id = Column(String(50), index=True)
    ward_name = Column(String(100), nullable=False)
    zone_name = Column(String(100), nullable=False)
    center_lat = Column(Float, nullable=False)
    center_lon = Column(Float, nullable=False)
    bbox_lat_min = Column(Float, nullable=False)
    bbox_lat_max = Column(Float, nullable=False)
    bbox_lon_min = Column(Float, nullable=False)
    bbox_lon_max = Column(Float, nullable=False)
    land_use = Column(String(50), default="Dense Mixed") # Commercial, Dense Residential, Industrial, Green / Park, Suburbs
    population = Column(Integer, default=15000)
    vulnerable_population = Column(Integer, default=3200) # elderly, children, outdoor workers
    elevation_m = Column(Float, default=560.0)
    baseline_ndvi = Column(Float, default=0.18)
    built_up_density = Column(Float, default=0.75) # 0 to 1
    albedo = Column(Float, default=0.12)
    created_at = Column(DateTime, default=datetime.utcnow)

    predictions = relationship("RiskPrediction", back_populates="zone", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="zone", cascade="all, delete-orphan")
    interventions = relationship("Intervention", back_populates="zone", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="zone", cascade="all, delete-orphan")

class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(String(50), ForeignKey("zones.id"), nullable=False, index=True)
    scenario = Column(String(50), default="normal") # normal, heatwave, extreme
    forecast_horizon_hours = Column(Integer, default=24) # 24 or 48
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    official_temp = Column(Float, nullable=False) # e.g. 36.4
    predicted_temp = Column(Float, nullable=False) # e.g. 39.8
    temp_anomaly = Column(Float, nullable=False) # e.g. +3.4
    heat_index = Column(Float, nullable=False) # e.g. 43.1
    lst_celsius = Column(Float, nullable=False) # e.g. 44.5
    ndvi_current = Column(Float, nullable=False) # e.g. 0.12
    humidity_pct = Column(Float, default=42.0)
    wind_speed_kmh = Column(Float, default=9.5)
    
    risk_score = Column(Float, nullable=False) # 0 to 100
    risk_category = Column(String(50), nullable=False) # Low, Moderate, High, Very High, Extreme
    confidence_pct = Column(Float, default=89.0)
    
    # Feature contributions (simulated/calculated Shapley proxy)
    driver_ndvi_pct = Column(Float, default=78.0)
    driver_built_up_pct = Column(Float, default=72.0)
    driver_lst_pct = Column(Float, default=84.0)
    driver_elevation_pct = Column(Float, default=45.0)
    driver_population_pct = Column(Float, default=65.0)
    
    explainable_summary = Column(Text, nullable=False)
    
    zone = relationship("Zone", back_populates="predictions")

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String(50), primary_key=True, index=True)
    zone_id = Column(String(50), ForeignKey("zones.id"), nullable=False, index=True)
    scenario = Column(String(50), default="normal")
    category = Column(String(50), nullable=False) # Water, Cooling Centers, Public Alerts, Tree Canopy, Electricity Demand, Vulnerable Population
    priority = Column(String(50), default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    action_title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    expected_impact = Column(String(255), nullable=False)
    status = Column(String(50), default="NEW") # NEW, ACKNOWLEDGED, DISPATCHED, IN PROGRESS, RESOLVED
    assigned_department = Column(String(100), nullable=False)
    deadline_text = Column(String(100), default="Before 12:00 PM")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    zone = relationship("Zone", back_populates="recommendations")

class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(String(50), primary_key=True, index=True)
    recommendation_id = Column(String(50), nullable=True)
    zone_id = Column(String(50), ForeignKey("zones.id"), nullable=False, index=True)
    scenario = Column(String(50), default="normal")
    title = Column(String(200), nullable=False)
    intervention_type = Column(String(100), nullable=False) # Water Tanker, Cooling Center, Public Alert, Tree Canopy, Grid Load Shift
    priority = Column(String(50), default="HIGH") # LOW, MEDIUM, HIGH, CRITICAL
    target_location = Column(String(200), nullable=False)
    reason = Column(Text, nullable=False)
    suggested_dispatch = Column(String(100), default="2 tankers")
    status = Column(String(50), default="DISPATCHED") # NEW, ACKNOWLEDGED, DISPATCHED, IN PROGRESS, RESOLVED
    assigned_department = Column(String(100), nullable=False)
    eta_minutes = Column(Integer, default=35)
    dispatches_count = Column(Integer, default=1)
    impact_metric = Column(String(100), default="~4,200 citizens cooled")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    zone = relationship("Zone", back_populates="interventions")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(50), primary_key=True, index=True)
    zone_id = Column(String(50), ForeignKey("zones.id"), nullable=False, index=True)
    scenario = Column(String(50), default="normal")
    severity = Column(String(50), default="HIGH") # MODERATE, HIGH, VERY HIGH, EXTREME
    headline = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    peak_temp = Column(Float, default=40.5)
    population_exposed = Column(Integer, default=18500)
    recommended_actions = Column(JSON, default=list)
    status = Column(String(50), default="ACTIVE") # ACTIVE, ACKNOWLEDGED, BROADCASTED, RESOLVED
    created_at = Column(DateTime, default=datetime.utcnow)

    zone = relationship("Zone", back_populates="alerts")

class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    provider = Column(String(100), nullable=False)
    data_type = Column(String(100), nullable=False)
    resolution = Column(String(50), nullable=False)
    update_frequency = Column(String(100), nullable=False)
    purpose = Column(Text, nullable=False)
    status = Column(String(50), default="OPEN DATA") # LIVE, OPEN DATA, DEMO DATA
    last_sync = Column(String(50), default="14 min ago")
    reliability_pct = Column(Float, default=99.4)
