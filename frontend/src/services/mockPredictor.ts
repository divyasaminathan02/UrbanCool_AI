/**
 * Client-side fallback microclimate downscaling prediction engine
 * Mirrors the Python GradientBoostingRegressor / empirical physical formula
 */

export interface PredictInput {
  official_temp: number;
  humidity: number;
  wind_speed: number;
  lst_celsius: number;
  ndvi: number;
  elevation_m: number;
  built_up_density: number;
  population_density: number;
}

export interface PredictOutput {
  predicted_temp: number;
  temp_anomaly: number;
  heat_index: number;
  risk_score: number;
  risk_category: string;
  confidence_pct: number;
}

export function computeLocalPrediction(input: PredictInput): PredictOutput {
  const {
    official_temp,
    humidity,
    wind_speed,
    lst_celsius,
    ndvi,
    elevation_m,
    built_up_density,
    population_density,
  } = input;

  // Localized temperature anomaly (Delta T)
  const anomaly =
    (1.0 - ndvi) * 1.6 +
    built_up_density * 1.4 +
    ((680.0 - elevation_m) / 160.0) * 0.8 +
    (lst_celsius - official_temp) * 0.25 -
    (wind_speed / 20.0) * 0.6;

  const predicted_temp = official_temp + anomaly;

  // Simplified Steadman Heat Index calculation
  const exponent = 5417.753 * (1 / 273.16 - 1 / (273.15 + predicted_temp));
  const heat_index =
    predicted_temp +
    0.5555 * ((humidity / 100.0) * 6.11 * Math.exp(exponent) - 10.0);

  // Composite Multi-Criteria Heat Risk Score (0 - 100)
  const temp_score = Math.min(100.0, Math.max(0.0, ((predicted_temp - 30.0) / 14.0) * 45.0));
  const env_score = ((1.0 - ndvi) * 0.5 + built_up_density * 0.5) * 30.0;
  const pop_score = Math.min(1.0, population_density / 30000.0) * 25.0;

  const raw_risk = temp_score + env_score + pop_score;
  const risk_score = Math.round(Math.min(100.0, Math.max(0.0, raw_risk)) * 10) / 10;

  let category = 'Low';
  if (risk_score >= 90) category = 'Extreme';
  else if (risk_score >= 80) category = 'Very High';
  else if (risk_score >= 60) category = 'High';
  else if (risk_score >= 40) category = 'Moderate';

  const confidence_pct = Math.round((91.5 - Math.min(10.0, Math.abs(anomaly) * 1.5)) * 10) / 10;

  return {
    predicted_temp: Math.round(predicted_temp * 10) / 10,
    temp_anomaly: Math.round(anomaly * 100) / 100,
    heat_index: Math.round(heat_index * 10) / 10,
    risk_score,
    risk_category: category,
    confidence_pct,
  };
}
