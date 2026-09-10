from sqlalchemy.orm import Session
from app.db.models import Zone, RiskPrediction, Recommendation, Intervention, Alert, DataSource, User
from app.core.security import get_password_hash
from app.ml.model import ml_engine
from app.ml.explainability import compute_feature_contributions
from app.ml.rule_engine import generate_recommendations

PUNE_ZONES_DATA = [
    # Central & Dense Commercial
    {
        "id": "PMC-W17-G042",
        "ward_id": "W17",
        "ward_name": "Shivajinagar Central",
        "zone_name": "Shivajinagar Commercial & Transit Hub",
        "center_lat": 18.5314, "center_lon": 73.8446,
        "land_use": "Commercial & Transit",
        "population": 23800, "vulnerable_pop": 5400, "elevation_m": 558.0,
        "baseline_ndvi": 0.11, "built_up_density": 0.88, "albedo": 0.11
    },
    {
        "id": "PMC-W12-G019",
        "ward_id": "W12",
        "ward_name": "Kothrud",
        "zone_name": "Kothrud Market Cluster",
        "center_lat": 18.5074, "center_lon": 73.8077,
        "land_use": "Dense Mixed Residential",
        "population": 21400, "vulnerable_pop": 4600, "elevation_m": 565.0,
        "baseline_ndvi": 0.14, "built_up_density": 0.84, "albedo": 0.12
    },
    {
        "id": "PMC-W21-G088",
        "ward_id": "W21",
        "ward_name": "Hadapsar",
        "zone_name": "Hadapsar East Industrial & Market",
        "center_lat": 18.5089, "center_lon": 73.9260,
        "land_use": "Industrial & Dense Mixed",
        "population": 26500, "vulnerable_pop": 6100, "elevation_m": 552.0,
        "baseline_ndvi": 0.09, "built_up_density": 0.91, "albedo": 0.10
    },
    {
        "id": "PMC-W09-G015",
        "ward_id": "W09",
        "ward_name": "Swargate",
        "zone_name": "Swargate Multi-Modal Transit Junction",
        "center_lat": 18.5018, "center_lon": 73.8586,
        "land_use": "Commercial & High Density",
        "population": 24200, "vulnerable_pop": 5800, "elevation_m": 554.0,
        "baseline_ndvi": 0.08, "built_up_density": 0.89, "albedo": 0.11
    },
    {
        "id": "PMC-W14-G031",
        "ward_id": "W14",
        "ward_name": "Mandai",
        "zone_name": "Mahatma Phule Mandai Market Core",
        "center_lat": 18.5134, "center_lon": 73.8554,
        "land_use": "Historic High-Density Market",
        "population": 28900, "vulnerable_pop": 6900, "elevation_m": 556.0,
        "baseline_ndvi": 0.06, "built_up_density": 0.94, "albedo": 0.09
    },
    {
        "id": "PMC-W15-G050",
        "ward_id": "W15",
        "ward_name": "Pune Camp",
        "zone_name": "Camp MG Road Commercial Strip",
        "center_lat": 18.5167, "center_lon": 73.8789,
        "land_use": "Commercial & Mixed",
        "population": 19500, "vulnerable_pop": 3800, "elevation_m": 562.0,
        "baseline_ndvi": 0.18, "built_up_density": 0.76, "albedo": 0.13
    },
    {
        "id": "PMC-W03-G011",
        "ward_id": "W03",
        "ward_name": "Viman Nagar",
        "zone_name": "Viman Nagar Tech Park Cluster",
        "center_lat": 18.5679, "center_lon": 73.9143,
        "land_use": "Commercial IT & High-Rise",
        "population": 18200, "vulnerable_pop": 2900, "elevation_m": 570.0,
        "baseline_ndvi": 0.19, "built_up_density": 0.78, "albedo": 0.14
    },
    {
        "id": "PMC-W04-G024",
        "ward_id": "W04",
        "ward_name": "Yerawada",
        "zone_name": "Yerawada High-Density Residential",
        "center_lat": 18.5529, "center_lon": 73.8828,
        "land_use": "Dense Informal & Residential",
        "population": 27400, "vulnerable_pop": 7200, "elevation_m": 555.0,
        "baseline_ndvi": 0.12, "built_up_density": 0.86, "albedo": 0.11
    },
    {
        "id": "PMC-W18-G063",
        "ward_id": "W18",
        "ward_name": "Katraj",
        "zone_name": "Katraj Bus Stand & Market",
        "center_lat": 18.4575, "center_lon": 73.8658,
        "land_use": "Mixed Residential & Highway",
        "population": 22100, "vulnerable_pop": 4500, "elevation_m": 585.0,
        "baseline_ndvi": 0.22, "built_up_density": 0.72, "albedo": 0.13
    },
    {
        "id": "PMC-W08-G029",
        "ward_id": "W08",
        "ward_name": "Karve Nagar",
        "zone_name": "Karve Nagar Riverfront Residential",
        "center_lat": 18.4912, "center_lon": 73.8184,
        "land_use": "Residential Mixed",
        "population": 16800, "vulnerable_pop": 3100, "elevation_m": 560.0,
        "baseline_ndvi": 0.26, "built_up_density": 0.68, "albedo": 0.14
    },
    {
        "id": "PMC-W06-G045",
        "ward_id": "W06",
        "ward_name": "Baner",
        "zone_name": "Baner High Street Commercial Sector",
        "center_lat": 18.5590, "center_lon": 73.7868,
        "land_use": "Commercial & High-Rise",
        "population": 17500, "vulnerable_pop": 2700, "elevation_m": 578.0,
        "baseline_ndvi": 0.21, "built_up_density": 0.74, "albedo": 0.15
    },
    {
        "id": "PMC-W07-G038",
        "ward_id": "W07",
        "ward_name": "Aundh",
        "zone_name": "Aundh Residential & Shopping Corridor",
        "center_lat": 18.5580, "center_lon": 73.8070,
        "land_use": "Residential & Commercial",
        "population": 15400, "vulnerable_pop": 2600, "elevation_m": 568.0,
        "baseline_ndvi": 0.31, "built_up_density": 0.62, "albedo": 0.16
    },
    
    # PCMC Industrial & High Tech
    {
        "id": "PCMC-W01-G101",
        "ward_id": "PCMC-W01",
        "ward_name": "Hinjawadi",
        "zone_name": "Hinjawadi IT Park Phase 1 Core",
        "center_lat": 18.5913, "center_lon": 73.7389,
        "land_use": "IT Special Economic Zone",
        "population": 19800, "vulnerable_pop": 2400, "elevation_m": 580.0,
        "baseline_ndvi": 0.20, "built_up_density": 0.77, "albedo": 0.14
    },
    {
        "id": "PCMC-W02-G108",
        "ward_id": "PCMC-W02",
        "ward_name": "Hinjawadi Phase 2",
        "zone_name": "Hinjawadi Phase 2 Campus Sector",
        "center_lat": 18.5985, "center_lon": 73.7190,
        "land_use": "IT Campus & Semi-Urban",
        "population": 14200, "vulnerable_pop": 1800, "elevation_m": 592.0,
        "baseline_ndvi": 0.28, "built_up_density": 0.58, "albedo": 0.16
    },
    {
        "id": "PCMC-W05-G122",
        "ward_id": "PCMC-W05",
        "ward_name": "Bhosari",
        "zone_name": "Bhosari MIDC Heavy Industrial Zone",
        "center_lat": 18.6298, "center_lon": 73.8475,
        "land_use": "Heavy Industrial & Asbestos Roofs",
        "population": 25100, "vulnerable_pop": 6400, "elevation_m": 560.0,
        "baseline_ndvi": 0.07, "built_up_density": 0.92, "albedo": 0.08
    },
    {
        "id": "PCMC-W04-G115",
        "ward_id": "PCMC-W04",
        "ward_name": "Pimpri",
        "zone_name": "Pimpri Market & Railway Core",
        "center_lat": 18.6278, "center_lon": 73.8012,
        "land_use": "Dense Commercial & Railway Hub",
        "population": 24800, "vulnerable_pop": 5900, "elevation_m": 564.0,
        "baseline_ndvi": 0.10, "built_up_density": 0.87, "albedo": 0.11
    },
    {
        "id": "PCMC-W06-G130",
        "ward_id": "PCMC-W06",
        "ward_name": "Chinchwad",
        "zone_name": "Chinchwad Station Industrial Belt",
        "center_lat": 18.6350, "center_lon": 73.7890,
        "land_use": "Industrial & Mixed",
        "population": 23400, "vulnerable_pop": 5200, "elevation_m": 568.0,
        "baseline_ndvi": 0.13, "built_up_density": 0.83, "albedo": 0.12
    },
    {
        "id": "PCMC-W07-G141",
        "ward_id": "PCMC-W07",
        "ward_name": "Wakad",
        "zone_name": "Wakad Dange Chowk Junction",
        "center_lat": 18.6011, "center_lon": 73.7634,
        "land_use": "High Density Residential Mixed",
        "population": 20800, "vulnerable_pop": 3600, "elevation_m": 572.0,
        "baseline_ndvi": 0.18, "built_up_density": 0.79, "albedo": 0.13
    },

    # Eastern & Southern Growth Centers
    {
        "id": "PMC-W22-G095",
        "ward_id": "W22",
        "ward_name": "Kharadi",
        "zone_name": "Kharadi World Trade Center Hub",
        "center_lat": 18.5515, "center_lon": 73.9472,
        "land_use": "IT Special Economic Zone",
        "population": 17900, "vulnerable_pop": 2500, "elevation_m": 560.0,
        "baseline_ndvi": 0.22, "built_up_density": 0.73, "albedo": 0.14
    },
    {
        "id": "PMC-W19-G072",
        "ward_id": "W19",
        "ward_name": "Bibwewadi",
        "zone_name": "Bibwewadi Dense Residential",
        "center_lat": 18.4721, "center_lon": 73.8643,
        "land_use": "Dense Residential",
        "population": 21800, "vulnerable_pop": 4800, "elevation_m": 574.0,
        "baseline_ndvi": 0.16, "built_up_density": 0.81, "albedo": 0.12
    },
    {
        "id": "PMC-W20-G081",
        "ward_id": "W20",
        "ward_name": "Dhankawadi",
        "zone_name": "Dhankawadi Slopes Mixed Zone",
        "center_lat": 18.4632, "center_lon": 73.8510,
        "land_use": "Residential & Semi-Hilly",
        "population": 19600, "vulnerable_pop": 4100, "elevation_m": 590.0,
        "baseline_ndvi": 0.24, "built_up_density": 0.71, "albedo": 0.13
    },
    {
        "id": "PMC-W10-G018",
        "ward_id": "W10",
        "ward_name": "Kasba Peth",
        "zone_name": "Kasba Peth Historic Wadas Sector",
        "center_lat": 18.5204, "center_lon": 73.8567,
        "land_use": "Very Dense Historic Core",
        "population": 29800, "vulnerable_pop": 7600, "elevation_m": 557.0,
        "baseline_ndvi": 0.05, "built_up_density": 0.96, "albedo": 0.09
    },
    {
        "id": "PMC-W11-G022",
        "ward_id": "W11",
        "ward_name": "Deccan",
        "zone_name": "Deccan Gymkhana FC Road Corridor",
        "center_lat": 18.5196, "center_lon": 73.8410,
        "land_use": "Commercial & Educational",
        "population": 16400, "vulnerable_pop": 3100, "elevation_m": 560.0,
        "baseline_ndvi": 0.29, "built_up_density": 0.65, "albedo": 0.15
    },
    {
        "id": "PMC-W13-G027",
        "ward_id": "W13",
        "ward_name": "Warje",
        "zone_name": "Warje Bridge Flyover Junction",
        "center_lat": 18.4820, "center_lon": 73.7990,
        "land_use": "Mixed Highway & Residential",
        "population": 22400, "vulnerable_pop": 4700, "elevation_m": 568.0,
        "baseline_ndvi": 0.19, "built_up_density": 0.78, "albedo": 0.12
    },

    # Green Buffers, Hillocks & Low-Risk Reference Zones
    {
        "id": "PMC-W05-G002",
        "ward_id": "W05",
        "ward_name": "Savitribai Phule University",
        "zone_name": "Pune University Botanical Campus",
        "center_lat": 18.5529, "center_lon": 73.8248,
        "land_use": "University & Dense Forest Canopy",
        "population": 4200, "vulnerable_pop": 600, "elevation_m": 582.0,
        "baseline_ndvi": 0.62, "built_up_density": 0.18, "albedo": 0.21
    },
    {
        "id": "PMC-W16-G008",
        "ward_id": "W16",
        "ward_name": "Vetal Tekdi",
        "zone_name": "Vetal Tekdi Hill Reserve & ARAI",
        "center_lat": 18.5262, "center_lon": 73.8180,
        "land_use": "Protected Forest Hillock",
        "population": 1200, "vulnerable_pop": 150, "elevation_m": 675.0,
        "baseline_ndvi": 0.68, "built_up_density": 0.08, "albedo": 0.24
    },
    {
        "id": "PMC-W23-G014",
        "ward_id": "W23",
        "ward_name": "Empress Garden",
        "zone_name": "Empress Botanical Garden & Racecourse",
        "center_lat": 18.5120, "center_lon": 73.8960,
        "land_use": "Botanical Park & Green Open Space",
        "population": 3100, "vulnerable_pop": 400, "elevation_m": 564.0,
        "baseline_ndvi": 0.58, "built_up_density": 0.15, "albedo": 0.22
    },
    {
        "id": "PMC-W24-G006",
        "ward_id": "W24",
        "ward_name": "Pashan Lake",
        "zone_name": "Pashan Lake Wetland & Bird Sanctuary",
        "center_lat": 18.5348, "center_lon": 73.7845,
        "land_use": "Wetland & Water Body",
        "population": 2800, "vulnerable_pop": 350, "elevation_m": 566.0,
        "baseline_ndvi": 0.52, "built_up_density": 0.22, "albedo": 0.20
    },
    {
        "id": "PMC-W25-G009",
        "ward_id": "W25",
        "ward_name": "Taljai Hills",
        "zone_name": "Taljai Forest Nature Park",
        "center_lat": 18.4770, "center_lon": 73.8430,
        "land_use": "Forest Reserve & Hill",
        "population": 1500, "vulnerable_pop": 200, "elevation_m": 660.0,
        "baseline_ndvi": 0.64, "built_up_density": 0.10, "albedo": 0.23
    },
    {
        "id": "PMC-W26-G003",
        "ward_id": "W26",
        "ward_name": "Sinhagad Foothills",
        "zone_name": "Khadakwasla Catchment & Foothills",
        "center_lat": 18.4350, "center_lon": 73.7650,
        "land_use": "Water Reservoir & Agro-Forest",
        "population": 3400, "vulnerable_pop": 500, "elevation_m": 595.0,
        "baseline_ndvi": 0.56, "built_up_density": 0.14, "albedo": 0.21
    }
]

DATA_SOURCES_DATA = [
    {
        "id": "DS-01",
        "name": "NASA MODIS / Terra & Aqua",
        "provider": "NASA LP DAAC",
        "data_type": "Land Surface Temperature (LST 1km)",
        "resolution": "1,000m downscaled",
        "update_frequency": "Twice Daily (10:30 & 13:30 pass)",
        "purpose": "Baseline thermal emissivity and macro-scale urban surface heat flux estimation",
        "status": "OPEN DATA",
        "last_sync": "18 min ago",
        "reliability_pct": 99.6
    },
    {
        "id": "DS-02",
        "name": "Sentinel-2 / Copernicus",
        "provider": "European Space Agency (ESA)",
        "data_type": "Multi-spectral Optical (NDVI, NDWI)",
        "resolution": "10m – 20m high-resolution",
        "update_frequency": "5-day revisit cycle",
        "purpose": "Hyper-local canopy index, vegetative transpiration buffering & green cover mapping",
        "status": "OPEN DATA",
        "last_sync": "42 min ago",
        "reliability_pct": 99.8
    },
    {
        "id": "DS-03",
        "name": "NASA SRTM Digital Elevation",
        "provider": "NASA / USGS",
        "data_type": "Digital Elevation Model (DEM)",
        "resolution": "30m grid",
        "update_frequency": "Static topographic baseline",
        "purpose": "Thermal air drainage, valley temperature inversions and slope solar insolation",
        "status": "OPEN DATA",
        "last_sync": "Static Baseline",
        "reliability_pct": 100.0
    },
    {
        "id": "DS-04",
        "name": "IMD Pune Automated Weather Station (AWS)",
        "provider": "India Meteorological Department / Open-Meteo",
        "data_type": "Official Synoptic Forecast (Temp, RH, Wind)",
        "resolution": "City Station Aggregate",
        "update_frequency": "Hourly real-time & 48h outlook",
        "purpose": "Macro baseline meteorology for AI downscaling pipeline",
        "status": "LIVE",
        "last_sync": "8 min ago",
        "reliability_pct": 98.9
    },
    {
        "id": "DS-05",
        "name": "Pune Municipal Census & WorldPop",
        "provider": "PMC / WorldPop Project",
        "data_type": "High-Resolution Gridded Population",
        "resolution": "100m spatial grid",
        "update_frequency": "Annual demographic calibration",
        "purpose": "Human vulnerability exposure, outdoor worker density and intervention prioritization",
        "status": "DEMO DATA",
        "last_sync": "Seeded Baseline",
        "reliability_pct": 99.1
    }
]

def seed_database(db: Session):
    # 1. Seed Users
    if db.query(User).count() == 0:
        demo_users = [
            {
                "username": "heat_officer",
                "email": "heat.action@punecorporation.org",
                "password": "Password@123",
                "full_name": "Dr. Aarav Deshmukh",
                "role": "HEAT_OFFICER",
                "department": "Municipal Heat Action & Disaster Cell"
            },
            {
                "username": "urban_planner",
                "email": "planner@punecorporation.org",
                "password": "Password@123",
                "full_name": "Priya Kulkarni",
                "role": "PLANNER",
                "department": "Urban Planning & Climate Resilience"
            },
            {
                "username": "water_officer",
                "email": "water.supply@punecorporation.org",
                "password": "Password@123",
                "full_name": "Sunil Shinde",
                "role": "WATER_OFFICER",
                "department": "Water Supply & Tanker Operations"
            },
            {
                "username": "health_officer",
                "email": "public.health@punecorporation.org",
                "password": "Password@123",
                "full_name": "Dr. Meera Joshi",
                "role": "PUBLIC_HEALTH",
                "department": "Public Health & Hospital Preparedness"
            },
            {
                "username": "admin",
                "email": "admin@urbancool.ai",
                "password": "Password@123",
                "full_name": "System Administrator",
                "role": "ADMIN",
                "department": "Central Command Administration"
            }
        ]
        for u in demo_users:
            user = User(
                username=u["username"],
                email=u["email"],
                hashed_password=get_password_hash(u["password"]),
                full_name=u["full_name"],
                role=u["role"],
                department=u["department"]
            )
            db.add(user)
        db.commit()

    # 2. Seed Data Sources
    if db.query(DataSource).count() == 0:
        for ds in DATA_SOURCES_DATA:
            db.add(DataSource(**ds))
        db.commit()

    # 3. Seed Zones and Multi-Scenario Predictions
    if db.query(Zone).count() == 0:
        # Scenario configurations: official synoptic base conditions
        scenarios = {
            "normal": {
                "official_temp": 34.2,
                "humidity": 45.0,
                "wind_speed": 14.5,
                "lst_multiplier": 1.05
            },
            "heatwave": {
                "official_temp": 38.6,
                "humidity": 38.0,
                "wind_speed": 7.8,
                "lst_multiplier": 1.14
            },
            "extreme": {
                "official_temp": 41.2,
                "humidity": 32.0,
                "wind_speed": 4.5,
                "lst_multiplier": 1.22
            }
        }
        
        # Grid cell size (~250m bounding box = ~0.00225 deg lat/lon)
        delta_deg = 0.00225
        
        for z in PUNE_ZONES_DATA:
            zone = Zone(
                id=z["id"],
                ward_id=z["ward_id"],
                ward_name=z["ward_name"],
                zone_name=z["zone_name"],
                center_lat=z["center_lat"],
                center_lon=z["center_lon"],
                bbox_lat_min=z["center_lat"] - delta_deg,
                bbox_lat_max=z["center_lat"] + delta_deg,
                bbox_lon_min=z["center_lon"] - delta_deg,
                bbox_lon_max=z["center_lon"] + delta_deg,
                land_use=z["land_use"],
                population=z["population"],
                vulnerable_population=z["vulnerable_pop"],
                elevation_m=z["elevation_m"],
                baseline_ndvi=z["baseline_ndvi"],
                built_up_density=z["built_up_density"],
                albedo=z["albedo"]
            )
            db.add(zone)
            db.flush()
            
            # For each scenario, generate 24h and 48h predictions + recommendations
            for sc_name, sc_params in scenarios.items():
                off_t = sc_params["official_temp"]
                hum = sc_params["humidity"]
                wind = sc_params["wind_speed"]
                
                # Synthetic LST derived from thermal balance
                lst = off_t * sc_params["lst_multiplier"] + (1.0 - z["baseline_ndvi"]) * 4.2 + z["built_up_density"] * 3.5
                pop_dens = z["population"] / 0.8 # approx per sq km
                
                # Predict via ML Engine
                pred_result = ml_engine.predict_grid(
                    official_temp=off_t,
                    humidity=hum,
                    wind_speed=wind,
                    lst_celsius=lst,
                    ndvi=z["baseline_ndvi"],
                    elevation_m=z["elevation_m"],
                    built_up_density=z["built_up_density"],
                    population_density=pop_dens
                )
                
                # Explainable AI feature weights
                contrib = compute_feature_contributions(
                    ndvi=z["baseline_ndvi"],
                    built_up_density=z["built_up_density"],
                    lst_celsius=lst,
                    official_temp=off_t,
                    elevation_m=z["elevation_m"],
                    population=z["population"]
                )
                
                # Risk prediction record (24h)
                risk_pred_24 = RiskPrediction(
                    zone_id=z["id"],
                    scenario=sc_name,
                    forecast_horizon_hours=24,
                    official_temp=off_t,
                    predicted_temp=pred_result["predicted_temp"],
                    temp_anomaly=pred_result["temp_anomaly"],
                    heat_index=pred_result["heat_index"],
                    lst_celsius=round(lst, 1),
                    ndvi_current=z["baseline_ndvi"],
                    humidity_pct=hum,
                    wind_speed_kmh=wind,
                    risk_score=pred_result["risk_score"],
                    risk_category=pred_result["risk_category"],
                    confidence_pct=pred_result["confidence_pct"],
                    driver_ndvi_pct=contrib["driver_ndvi_pct"],
                    driver_built_up_pct=contrib["driver_built_up_pct"],
                    driver_lst_pct=contrib["driver_lst_pct"],
                    driver_elevation_pct=contrib["driver_elevation_pct"],
                    driver_population_pct=contrib["driver_population_pct"],
                    explainable_summary=contrib["explainable_summary"]
                )
                db.add(risk_pred_24)
                
                # 48h horizon record with slight variation
                risk_pred_48 = RiskPrediction(
                    zone_id=z["id"],
                    scenario=sc_name,
                    forecast_horizon_hours=48,
                    official_temp=round(off_t + 0.5, 1),
                    predicted_temp=round(pred_result["predicted_temp"] + 0.6, 1),
                    temp_anomaly=round(pred_result["temp_anomaly"] + 0.1, 2),
                    heat_index=round(pred_result["heat_index"] + 0.8, 1),
                    lst_celsius=round(lst + 0.8, 1),
                    ndvi_current=z["baseline_ndvi"],
                    humidity_pct=round(hum - 2.0, 1),
                    wind_speed_kmh=wind,
                    risk_score=min(100.0, round(pred_result["risk_score"] + 2.0, 1)),
                    risk_category=pred_result["risk_category"],
                    confidence_pct=round(pred_result["confidence_pct"] - 3.5, 1),
                    driver_ndvi_pct=contrib["driver_ndvi_pct"],
                    driver_built_up_pct=contrib["driver_built_up_pct"],
                    driver_lst_pct=contrib["driver_lst_pct"],
                    driver_elevation_pct=contrib["driver_elevation_pct"],
                    driver_population_pct=contrib["driver_population_pct"],
                    explainable_summary=contrib["explainable_summary"]
                )
                db.add(risk_pred_48)
                
                # Generate deterministic recommendations
                recs = generate_recommendations(
                    zone_id=z["id"],
                    zone_name=z["zone_name"],
                    risk_score=pred_result["risk_score"],
                    predicted_temp=pred_result["predicted_temp"],
                    ndvi=z["baseline_ndvi"],
                    built_up_density=z["built_up_density"],
                    population=z["population"],
                    vulnerable_pop=z["vulnerable_pop"],
                    scenario=sc_name
                )
                
                for r in recs:
                    db.add(Recommendation(**r))
                    
                    # If recommendation is Water Tanker or Cooling Center with high priority, create live intervention
                    if r["category"] == "Water" and r["priority"] in ["CRITICAL", "HIGH"]:
                        intervention = Intervention(
                            id=f"INT-{r['id']}",
                            recommendation_id=r["id"],
                            zone_id=z["id"],
                            scenario=sc_name,
                            title=f"Water Tanker Fleet — {z['ward_name']}",
                            intervention_type="Water Tanker",
                            priority=r["priority"],
                            target_location=f"{z['zone_name']}, Ward {z['ward_id']}",
                            reason=f"Risk {pred_result['risk_score']} + Low Canopy (NDVI {z['baseline_ndvi']}) + {z['population']:,} Exposed",
                            suggested_dispatch="2 Municipal Tankers (10,000L)",
                            status="DISPATCHED" if pred_result["risk_score"] >= 88 else "NEW",
                            assigned_department="Water Supply & Emergency Services",
                            eta_minutes=25 if pred_result["risk_score"] >= 92 else 45,
                            dispatches_count=2 if pred_result["risk_score"] >= 92 else 1,
                            impact_metric=f"~{min(z['population'], 12000):,} citizens hydrated"
                        )
                        db.add(intervention)
                    elif r["category"] == "Cooling Centers" and r["priority"] in ["CRITICAL", "HIGH"]:
                        intervention = Intervention(
                            id=f"INT-{r['id']}",
                            recommendation_id=r["id"],
                            zone_id=z["id"],
                            scenario=sc_name,
                            title=f"Cooling Shelter Activation — {z['ward_name']}",
                            intervention_type="Cooling Center",
                            priority=r["priority"],
                            target_location=f"Community Center & Transit Hall, {z['zone_name']}",
                            reason=f"Extreme heat stress predicted ({pred_result['predicted_temp']}°C). High elderly/pedestrian exposure.",
                            suggested_dispatch="1 Facility (Capacity: 250)",
                            status="IN PROGRESS" if pred_result["risk_score"] >= 88 else "NEW",
                            assigned_department="Public Health & Social Welfare",
                            eta_minutes=0,
                            dispatches_count=1,
                            impact_metric=f"~{z['vulnerable_pop']:,} vulnerable sheltered"
                        )
                        db.add(intervention)
                        
                # Create Alerts if risk is very high or extreme
                if pred_result["risk_score"] >= 80:
                    severity = "EXTREME" if pred_result["risk_score"] >= 90 else "VERY HIGH"
                    alert = Alert(
                        id=f"ALT-{z['id']}-{sc_name}",
                        zone_id=z["id"],
                        scenario=sc_name,
                        severity=severity,
                        headline=f"{severity} HEAT STRESS: {z['zone_name']}",
                        message=f"Microclimate anomaly predicted at +{pred_result['temp_anomaly']}°C above synoptic forecast. Peak temp {pred_result['predicted_temp']}°C expected between 13:00 and 16:30.",
                        peak_temp=pred_result["predicted_temp"],
                        population_exposed=z["population"],
                        recommended_actions=[
                            "Activate localized drinking water stations",
                            "Issue outdoor worker labor moratorium (12:00-16:00)",
                            "Keep public cooling centers open with ORS supplies"
                        ],
                        status="ACTIVE"
                    )
                    db.add(alert)
                    
        db.commit()
