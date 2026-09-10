from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.db.database import engine, Base, SessionLocal
from app.db.seed_data import seed_database
from app.api import auth, dashboard, heatmap, zones, forecast, recommendations, interventions, analytics, alerts, data_sources, predict

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema
    Base.metadata.create_all(bind=engine)
    # Seed default data for Pune
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.TAGLINE,
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health endpoint
@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "UrbanCool AI",
        "version": settings.VERSION,
        "region": "Pune Municipal Corporation (PMC/PCMC)",
        "climate_engine": "Operational",
        "sdg_alignment": ["SDG 13 - Climate Action", "SDG 11 - Sustainable Cities", "SDG 3 - Good Health"]
    }

# Include all API routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(heatmap.router, prefix=settings.API_V1_STR)
app.include_router(zones.router, prefix=settings.API_V1_STR)
app.include_router(forecast.router, prefix=settings.API_V1_STR)
app.include_router(recommendations.router, prefix=settings.API_V1_STR)
app.include_router(interventions.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(data_sources.router, prefix=settings.API_V1_STR)
app.include_router(predict.router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
