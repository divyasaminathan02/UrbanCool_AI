import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
import joblib
import os

class MicroclimateMLModel:
    def __init__(self):
        self.model = None
        self.feature_names = [
            "official_temp",
            "humidity",
            "wind_speed",
            "lst_celsius",
            "ndvi_current",
            "elevation_m",
            "built_up_density",
            "population_density"
        ]
        self._train_baseline_model()

    def _train_baseline_model(self):
        """
        Trains an empirical microclimate downscaling model on synthetic Pune urban thermal data.
        Trained to predict local temperature anomaly (delta T) relative to official city weather station.
        """
        np.random.seed(42)
        n_samples = 2500
        
        # Realistic urban physical distributions
        official_temp = np.random.uniform(30.0, 42.0, n_samples)
        humidity = np.random.uniform(25.0, 65.0, n_samples)
        wind_speed = np.random.uniform(4.0, 20.0, n_samples)
        ndvi = np.random.uniform(0.05, 0.65, n_samples)
        built_up = np.random.uniform(0.2, 0.95, n_samples)
        elevation = np.random.uniform(520.0, 680.0, n_samples)
        pop_density = np.random.uniform(2000, 35000, n_samples) # per sq km
        
        # Physical microclimate heat anomaly equation with urban canopy effects
        # - Low NDVI adds +1.2°C to +2.5°C
        # - High built-up density adds +0.8°C to +2.0°C
        # - Lower elevation (valleys/trapped air) adds +0.4°C to +1.0°C
        # - Low wind speed amplifies heat stagnation
        lst_simulated = official_temp + (1.0 - ndvi) * 4.5 + built_up * 3.8 - (wind_speed / 15.0) * 1.5 + np.random.normal(0, 0.5, n_samples)
        
        # Localized temperature anomaly (Delta T)
        delta_t = (
            (1.0 - ndvi) * 1.6 +
            built_up * 1.4 +
            ((680.0 - elevation) / 160.0) * 0.8 +
            ((lst_simulated - official_temp) * 0.25) -
            (wind_speed / 20.0) * 0.6 +
            np.random.normal(0, 0.2, n_samples)
        )
        
        X = pd.DataFrame({
            "official_temp": official_temp,
            "humidity": humidity,
            "wind_speed": wind_speed,
            "lst_celsius": lst_simulated,
            "ndvi_current": ndvi,
            "elevation_m": elevation,
            "built_up_density": built_up,
            "population_density": pop_density
        })
        y = delta_t
        
        self.model = GradientBoostingRegressor(
            n_estimators=100, 
            learning_rate=0.08, 
            max_depth=4, 
            random_state=42
        )
        self.model.fit(X, y)
        
        # Compute demo validation metrics
        y_pred = self.model.predict(X)
        self.mae = float(np.mean(np.abs(y - y_pred)))
        self.rmse = float(np.sqrt(np.mean((y - y_pred)**2)))
        ss_tot = np.sum((y - np.mean(y))**2)
        ss_res = np.sum((y - y_pred)**2)
        self.r2 = float(1 - (ss_res / ss_tot))

    def predict_grid(
        self,
        official_temp: float,
        humidity: float,
        wind_speed: float,
        lst_celsius: float,
        ndvi: float,
        elevation_m: float,
        built_up_density: float,
        population_density: float
    ) -> dict:
        features = pd.DataFrame([{
            "official_temp": official_temp,
            "humidity": humidity,
            "wind_speed": wind_speed,
            "lst_celsius": lst_celsius,
            "ndvi_current": ndvi,
            "elevation_m": elevation_m,
            "built_up_density": built_up_density,
            "population_density": population_density
        }])
        
        anomaly = float(self.model.predict(features)[0])
        predicted_temp = official_temp + anomaly
        
        # Simplified Steadman Heat Index calculation
        heat_index = (
            predicted_temp + 
            0.5555 * ((humidity / 100.0) * 6.11 * np.exp(5417.7530 * (1/273.16 - 1/(273.15 + predicted_temp))) - 10.0)
        )
        
        # Composite Multi-Criteria Heat Risk Score (0 - 100)
        # Combines thermal intensity, environmental vulnerability, and human exposure
        temp_score = min(100.0, max(0.0, (predicted_temp - 30.0) / 14.0 * 45.0))
        env_score = ((1.0 - ndvi) * 0.5 + built_up_density * 0.5) * 30.0
        pop_score = min(1.0, population_density / 30000.0) * 25.0
        
        raw_risk = temp_score + env_score + pop_score
        risk_score = round(min(100.0, max(0.0, raw_risk)), 1)
        
        if risk_score >= 90:
            category = "Extreme"
        elif risk_score >= 80:
            category = "Very High"
        elif risk_score >= 60:
            category = "High"
        elif risk_score >= 40:
            category = "Moderate"
        else:
            category = "Low"
            
        return {
            "predicted_temp": round(predicted_temp, 1),
            "temp_anomaly": round(anomaly, 2),
            "heat_index": round(heat_index, 1),
            "risk_score": risk_score,
            "risk_category": category,
            "confidence_pct": round(91.5 - min(10.0, abs(anomaly) * 1.5), 1)
        }

# Global singleton
ml_engine = MicroclimateMLModel()
