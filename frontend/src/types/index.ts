export type ScenarioType = 'normal' | 'heatwave' | 'extreme';

export type UserRole = 'ADMIN' | 'HEAT_OFFICER' | 'PLANNER' | 'WATER_OFFICER' | 'PUBLIC_HEALTH';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  department: string;
}

export interface Zone {
  id: string;
  ward_id: string;
  ward_name: string;
  zone_name: string;
  land_use: string;
  population: number;
  vulnerable_population: number;
  elevation_m: number;
  baseline_ndvi: number;
  built_up_density: number;
  albedo?: number;
  center_lat: number;
  center_lon: number;
  risk_score?: number;
  risk_category?: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
  predicted_temp?: number;
  official_temp?: number;
  temp_anomaly?: number;
  lst_celsius?: number;
  confidence_pct?: number;
}

export interface RiskDrivers {
  ndvi_pct: number;
  built_up_pct: number;
  lst_pct: number;
  elevation_pct: number;
  population_pct: number;
}

export interface GeoJSONFeature {
  type: 'Feature';
  id: string;
  properties: {
    zone_id: string;
    ward_id: string;
    ward_name: string;
    zone_name: string;
    land_use: string;
    population: number;
    vulnerable_population: number;
    elevation_m: number;
    baseline_ndvi: number;
    built_up_density: number;
    center: [number, number];
    bounds: [[number, number], [number, number]];
    official_temp: number;
    predicted_temp: number;
    temp_anomaly: number;
    heat_index: number;
    lst_celsius: number;
    ndvi_current: number;
    risk_score: number;
    risk_category: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
    confidence_pct: number;
    drivers: RiskDrivers;
    explainable_summary: string;
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface GeoJSONCollection {
  city: string;
  scenario: ScenarioType;
  horizon_hours: number;
  total_cells: number;
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface HourlyForecastItem {
  hour: string;
  predicted_temp: number;
  official_temp: number;
  temp_anomaly: number;
  risk_score: number;
}

export interface FeatureContribution {
  feature: string;
  importance: number;
  category: string;
}

export interface HistoricalEvent {
  year: string;
  city_peak: number;
  zone_peak: number;
  days_above_40: number;
}

export interface Recommendation {
  id: string;
  zone_id: string;
  scenario: ScenarioType;
  category: 'Water' | 'Cooling Centers' | 'Public Alerts' | 'Tree Canopy' | 'Electricity Demand' | 'Vulnerable Population';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  action_title: string;
  description: string;
  expected_impact: string;
  status: 'NEW' | 'ACKNOWLEDGED' | 'DISPATCHED' | 'IN PROGRESS' | 'RESOLVED';
  assigned_department: string;
  deadline_text: string;
  created_at: string;
  updated_at: string;
  zone_name?: string;
  ward_name?: string;
}

export interface Intervention {
  id: string;
  recommendation_id?: string;
  zone_id: string;
  scenario: ScenarioType;
  title: string;
  intervention_type: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  target_location: string;
  reason: string;
  suggested_dispatch: string;
  status: 'NEW' | 'ACKNOWLEDGED' | 'DISPATCHED' | 'IN PROGRESS' | 'RESOLVED';
  assigned_department: string;
  eta_minutes: number;
  dispatches_count: number;
  impact_metric: string;
  created_at: string;
  updated_at: string;
  zone_name?: string;
}

export interface AlertItem {
  id: string;
  zone_id: string;
  scenario: ScenarioType;
  severity: 'MODERATE' | 'HIGH' | 'VERY HIGH' | 'EXTREME';
  headline: string;
  message: string;
  peak_temp: number;
  population_exposed: number;
  recommended_actions: string[];
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'BROADCASTED' | 'RESOLVED';
  created_at: string;
  zone_name?: string;
  ward_name?: string;
}

export interface DataSourceItem {
  id: string;
  name: string;
  provider: string;
  data_type: string;
  resolution: string;
  update_frequency: string;
  purpose: string;
  status: 'LIVE' | 'OPEN DATA' | 'DEMO DATA';
  last_sync: string;
  reliability_pct: number;
}

export interface PriorityZone {
  zone_id: string;
  zone_name: string;
  ward_name: string;
  risk_score: number;
  risk_category: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
  predicted_temp: number;
  official_temp: number;
  temp_anomaly: number;
  population_exposed: number;
  primary_driver: string;
  recommended_action: string;
  center_lat: number;
  center_lon: number;
}

export interface DashboardSummary {
  city: string;
  scenario: ScenarioType;
  kpis: {
    city_heat_risk: { score: number; max: number; category: string; trend: string };
    high_risk_zones: { count: number; total: number; trend: string };
    population_exposed: { count: number; trend: string };
    active_interventions: { total: number; awaiting_dispatch: number; in_progress: number };
    forecast_confidence: { percentage: number; status: string };
  };
  priority_zones: PriorityZone[];
  action_cards: Array<{
    category: string;
    priority: string;
    count: number;
    zones_text: string;
    recommended_time: string;
    action: string;
  }>;
}

export interface ForecastSlot {
  time: string;
  official: number;
  localized: number;
  heat_index: number;
  humidity: number;
  risk: string;
  confidence: number;
}

export interface ForecastDay {
  day_label: string;
  date_text: string;
  official_high: number;
  urban_cool_high: number;
  mean_anomaly: string;
  risk_level: string;
  slots: ForecastSlot[];
}

export interface ForecastSummary {
  city: string;
  scenario: ScenarioType;
  official_forecast_base: number;
  localized_max_peak: number;
  mean_thermal_anomaly: number;
  core_story: string;
  timeline_days: ForecastDay[];
  hotspot_comparison: Array<{
    zone_id: string;
    zone_name: string;
    ward_name: string;
    official_temp: number;
    localized_temp: number;
    anomaly: string;
    land_cover_reason: string;
    risk_category: string;
  }>;
}

export interface AnalyticsData {
  scenario: ScenarioType;
  model_performance: {
    mae: number;
    rmse: number;
    r2: number;
    forecast_confidence: string;
    validation_note: string;
    model_architecture: string;
    dataset_samples: number;
    features_used: number;
  };
  ward_risk: Array<{
    ward: string;
    avg_risk: number;
    population: number;
    max_temp: number;
    risk_level: string;
  }>;
  ndvi_vs_risk: Array<{
    zone_id: string;
    zone_name: string;
    ndvi: number;
    risk_score: number;
    predicted_temp: number;
    built_up: number;
  }>;
  lst_vs_risk: Array<{
    zone_id: string;
    zone_name: string;
    lst_celsius: number;
    risk_score: number;
    temp_anomaly: number;
  }>;
  heat_trend: Array<{
    day: string;
    avg_risk: number;
    high_risk_zones: number;
    exposed_pop: number;
    city_temp: number;
  }>;
  response_times: Array<{
    department: string;
    avg_dispatch_min: number;
    target_min: number;
    resolved_pct: number;
  }>;
}
