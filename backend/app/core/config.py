import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "UrbanCool AI"
    VERSION: str = "1.0.0"
    TAGLINE: str = "Dynamic AI-Driven Hyper-Local Microclimate Forecasting & Adaptive Urban Heat Advisory System"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "urbancool-ai-super-secret-key-indradhanu-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./urbancool.db")
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Demonstration city
    DEFAULT_CITY: str = "Pune"
    DEFAULT_STATE: str = "Maharashtra"
    DEFAULT_COUNTRY: str = "India"
    COORDINATES: tuple[float, float] = (18.5204, 73.8567) # Pune center

settings = Settings()
