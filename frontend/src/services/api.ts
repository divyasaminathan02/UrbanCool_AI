import axios from 'axios';
import {
  ScenarioType,
  DashboardSummary,
  GeoJSONCollection,
  Zone,
  Recommendation,
  Intervention,
  AlertItem,
  DataSourceItem,
  ForecastSummary,
  AnalyticsData,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach token if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('urbancool_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  // Auth
  async login(username: string, password: string) {
    const res = await apiClient.post('/auth/login', { username, password });
    return res.data;
  },

  async getMe(username = 'heat_officer') {
    const res = await apiClient.get(`/auth/me?username=${username}`);
    return res.data;
  },

  // Health
  async getHealth() {
    const res = await apiClient.get('/health');
    return res.data;
  },

  // Dashboard
  async getDashboard(scenario: ScenarioType): Promise<DashboardSummary> {
    const res = await apiClient.get(`/dashboard?scenario=${scenario}`);
    return res.data;
  },

  // Heatmap GIS
  async getHeatmap(
    scenario: ScenarioType,
    horizon = 24,
    riskFilter?: string,
    popFilter?: string,
    ndviFilter?: string
  ): Promise<GeoJSONCollection> {
    let url = `/heatmap?scenario=${scenario}&horizon=${horizon}`;
    if (riskFilter && riskFilter !== 'all') url += `&risk_filter=${riskFilter}`;
    if (popFilter && popFilter !== 'all') url += `&pop_filter=${popFilter}`;
    if (ndviFilter && ndviFilter !== 'all') url += `&ndvi_filter=${ndviFilter}`;
    const res = await apiClient.get(url);
    return res.data;
  },

  // Zones
  async getZones(scenario: ScenarioType, ward?: string, sortBy = 'risk'): Promise<Zone[]> {
    let url = `/zones?scenario=${scenario}&sort_by=${sortBy}`;
    if (ward) url += `&ward=${ward}`;
    const res = await apiClient.get(url);
    return res.data;
  },

  async getZoneDetails(zoneId: string, scenario: ScenarioType) {
    const res = await apiClient.get(`/zones/${zoneId}?scenario=${scenario}`);
    return res.data;
  },

  // Forecast
  async getForecast(scenario: ScenarioType): Promise<ForecastSummary> {
    const res = await apiClient.get(`/forecast?scenario=${scenario}`);
    return res.data;
  },

  // Recommendations
  async getRecommendations(
    scenario: ScenarioType,
    category?: string,
    priority?: string,
    status?: string
  ): Promise<Recommendation[]> {
    let url = `/recommendations?scenario=${scenario}`;
    if (category && category !== 'All') url += `&category=${encodeURIComponent(category)}`;
    if (priority && priority !== 'All') url += `&priority=${encodeURIComponent(priority)}`;
    if (status && status !== 'All') url += `&status=${encodeURIComponent(status)}`;
    const res = await apiClient.get(url);
    return res.data;
  },

  async updateRecommendationStatus(recId: string, status: string) {
    const res = await apiClient.post(`/recommendations/${recId}/status`, { status });
    return res.data;
  },

  // Interventions
  async getInterventions(
    scenario: ScenarioType,
    status?: string,
    type?: string
  ): Promise<Intervention[]> {
    let url = `/interventions?scenario=${scenario}`;
    if (status && status !== 'All') url += `&status=${encodeURIComponent(status)}`;
    if (type && type !== 'All') url += `&intervention_type=${encodeURIComponent(type)}`;
    const res = await apiClient.get(url);
    return res.data;
  },

  async createIntervention(data: any): Promise<Intervention> {
    const res = await apiClient.post('/interventions', data);
    return res.data;
  },

  async updateInterventionStatus(intvId: string, status: string) {
    const res = await apiClient.post(`/interventions/${intvId}/status`, { status });
    return res.data;
  },

  // Analytics
  async getAnalytics(scenario: ScenarioType): Promise<AnalyticsData> {
    const res = await apiClient.get(`/analytics?scenario=${scenario}`);
    return res.data;
  },

  // Alerts
  async getAlerts(scenario: ScenarioType, severity?: string, status?: string): Promise<AlertItem[]> {
    let url = `/alerts?scenario=${scenario}`;
    if (severity && severity !== 'All') url += `&severity=${encodeURIComponent(severity)}`;
    if (status && status !== 'All') url += `&status=${encodeURIComponent(status)}`;
    const res = await apiClient.get(url);
    return res.data;
  },

  async updateAlertStatus(alertId: string, status: string) {
    const res = await apiClient.post(`/alerts/${alertId}/status`, { status });
    return res.data;
  },

  // Data Sources
  async getDataSources(): Promise<DataSourceItem[]> {
    const res = await apiClient.get('/data-sources');
    return res.data;
  },

  // Predict
  async runPredict(data: any) {
    const res = await apiClient.post('/predict', data);
    return res.data;
  },
};
