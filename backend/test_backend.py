import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

def test_endpoints():
    with TestClient(app) as client:
        # 1. Health
        res = client.get("/api/health")
        assert res.status_code == 200, f"Health failed: {res.text}"
        print("[PASS] /api/health:", res.json()["status"])
        
        # 2. Auth login
        res = client.post("/api/auth/login", json={"username": "heat_officer", "password": "Password@123"})
        assert res.status_code == 200, f"Login failed: {res.text}"
        token = res.json()["access_token"]
        print("[PASS] /api/auth/login:", res.json()["user"]["full_name"])
        
        # 3. Dashboard
        res = client.get("/api/dashboard?scenario=normal")
        assert res.status_code == 200
        print("[PASS] /api/dashboard (normal):", res.json()["kpis"]["city_heat_risk"]["score"], "avg risk")
        
        res = client.get("/api/dashboard?scenario=heatwave")
        assert res.status_code == 200
        print("[PASS] /api/dashboard (heatwave):", res.json()["kpis"]["city_heat_risk"]["score"], "avg risk")
        
        # 4. Heatmap
        res = client.get("/api/heatmap?scenario=heatwave&horizon=24")
        assert res.status_code == 200
        features = res.json()["features"]
        print(f"[PASS] /api/heatmap: {len(features)} grid polygons loaded")
        
        # 5. Zones
        res = client.get("/api/zones?scenario=normal")
        assert res.status_code == 200
        print(f"[PASS] /api/zones: {len(res.json())} zones listed")
        
        zone_id = res.json()[0]["id"]
        res = client.get(f"/api/zones/{zone_id}?scenario=normal")
        assert res.status_code == 200
        print(f"[PASS] /api/zones/{zone_id}: hourly curve has {len(res.json()['hourly_forecast'])} points")
        
        # 6. Forecast
        res = client.get("/api/forecast?scenario=normal")
        assert res.status_code == 200
        print("[PASS] /api/forecast:", len(res.json()["timeline_days"]), "days timeline")
        
        # 7. Recommendations
        res = client.get("/api/recommendations?scenario=normal")
        assert res.status_code == 200
        recs = res.json()
        print(f"[PASS] /api/recommendations: {len(recs)} advisories")
        if recs:
            rec_id = recs[0]["id"]
            res_up = client.post(f"/api/recommendations/{rec_id}/status", json={"status": "DISPATCHED"})
            assert res_up.status_code == 200
            print(f"[PASS] /api/recommendations/{rec_id}/status: DISPATCHED")
            
        # 8. Interventions
        res = client.get("/api/interventions?scenario=normal")
        assert res.status_code == 200
        intvs = res.json()
        print(f"[PASS] /api/interventions: {len(intvs)} active operations")
        if intvs:
            intv_id = intvs[0]["id"]
            res_up = client.post(f"/api/interventions/{intv_id}/status", json={"status": "IN PROGRESS"})
            assert res_up.status_code == 200
            print(f"[PASS] /api/interventions/{intv_id}/status: IN PROGRESS")
            
        # 9. Analytics
        res = client.get("/api/analytics?scenario=normal")
        assert res.status_code == 200
        print("[PASS] /api/analytics: model MAE =", res.json()["model_performance"]["mae"])
        
        # 10. Alerts
        res = client.get("/api/alerts?scenario=normal")
        assert res.status_code == 200
        print(f"[PASS] /api/alerts: {len(res.json())} warnings")
        
        # 11. Data sources
        res = client.get("/api/data-sources")
        assert res.status_code == 200
        print(f"[PASS] /api/data-sources: {len(res.json())} registry items")
        
        # 12. Predict
        res = client.post("/api/predict", json={
            "official_temp": 37.5,
            "humidity": 40.0,
            "wind_speed": 8.0,
            "lst_celsius": 43.0,
            "ndvi": 0.12,
            "elevation_m": 555.0,
            "built_up_density": 0.85,
            "population_density": 22000.0
        })
        assert res.status_code == 200
        print(f"[PASS] /api/predict: {res.json()['predicted_temp']} C (Anomaly: +{res.json()['temp_anomaly']} C, Risk: {res.json()['risk_score']})")

if __name__ == "__main__":
    test_endpoints()
    print("\nALL BACKEND API AND ML TESTS PASSED PERFECTLY!")
