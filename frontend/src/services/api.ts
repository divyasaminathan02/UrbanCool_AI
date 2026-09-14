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
import mockDataJson from './mockData.json';
import { computeLocalPrediction, PredictInput } from './mockPredictor';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Attach token if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('urbancool_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to access scenario mock data
function getScenarioMock(scenario: ScenarioType): any {
  const sc = scenario || 'normal';
  return (mockDataJson as any)[sc] || (mockDataJson as any)['normal'];
}

// Local storage state sync for client-side demo interactivity
function getStoredInterventions(scenario: ScenarioType): Intervention[] {
  const key = `urbancool_custom_interventions_${scenario}`;
  const stored = localStorage.getItem(key);
  const baseList: Intervention[] = getScenarioMock(scenario).interventions || [];
  if (stored) {
    try {
      const parsed: Intervention[] = JSON.parse(stored);
      // Combine custom with base without duplicates
      const baseIds = new Set(baseList.map((i) => i.id));
      const customOnly = parsed.filter((i) => !baseIds.has(i.id));
      // Apply status updates
      const statusMap = new Map(parsed.map((i) => [i.id, i.status]));
      return [
        ...customOnly,
        ...baseList.map((i) => ({
          ...i,
          status: (statusMap.get(i.id) || i.status) as Intervention['status'],
        })),
      ];
    } catch {
      return baseList;
    }
  }
  return baseList;
}

function saveInterventions(scenario: ScenarioType, list: Intervention[]) {
  localStorage.setItem(`urbancool_custom_interventions_${scenario}`, JSON.stringify(list));
}

function getStoredRecommendations(scenario: ScenarioType): Recommendation[] {
  const key = `urbancool_rec_status_${scenario}`;
  const stored = localStorage.getItem(key);
  const baseList: Recommendation[] = getScenarioMock(scenario).recommendations || [];
  if (stored) {
    try {
      const statusMap: Record<string, string> = JSON.parse(stored);
      return baseList.map((r) => ({
        ...r,
        status: (statusMap[r.id] || r.status) as Recommendation['status'],
      }));
    } catch {
      return baseList;
    }
  }
  return baseList;
}

function getStoredAlerts(scenario: ScenarioType): AlertItem[] {
  const key = `urbancool_alert_status_${scenario}`;
  const stored = localStorage.getItem(key);
  const baseList: AlertItem[] = getScenarioMock(scenario).alerts || [];
  if (stored) {
    try {
      const statusMap: Record<string, string> = JSON.parse(stored);
      return baseList.map((a) => ({
        ...a,
        status: (statusMap[a.id] || a.status) as AlertItem['status'],
      }));
    } catch {
      return baseList;
    }
  }
  return baseList;
}

export const apiService = {
  // Auth
  async login(username: string, password: string) {
    try {
      const res = await apiClient.post('/auth/login', { username, password });
      return res.data;
    } catch {
      return {
        access_token: 'demo-token-' + Date.now(),
        token_type: 'bearer',
        user: {
          id: 1,
          username,
          email: `${username}@punecorporation.org`,
          full_name: 'Dr. Aarav Deshmukh',
          role: 'HEAT_OFFICER',
          department: 'Municipal Heat Action & Disaster Cell',
        },
      };
    }
  },

  async getMe(username = 'heat_officer') {
    try {
      const res = await apiClient.get(`/auth/me?username=${username}`);
      return res.data;
    } catch {
      return {
        id: 1,
        username,
        email: `${username}@punecorporation.org`,
        full_name: 'Dr. Aarav Deshmukh',
        role: 'HEAT_OFFICER',
        department: 'Municipal Heat Action & Disaster Cell',
      };
    }
  },

  // Health
  async getHealth() {
    try {
      const res = await apiClient.get('/health');
      return res.data;
    } catch {
      return (mockDataJson as any).health || { status: 'healthy', timestamp: new Date().toISOString(), city: 'Pune' };
    }
  },

  // Dashboard
  async getDashboard(scenario: ScenarioType): Promise<DashboardSummary> {
    try {
      const res = await apiClient.get(`/dashboard?scenario=${scenario}`);
      return res.data;
    } catch {
      return getScenarioMock(scenario).dashboard as DashboardSummary;
    }
  },

  // Heatmap GIS
  async getHeatmap(
    scenario: ScenarioType,
    horizon = 24,
    riskFilter?: string,
    popFilter?: string,
    ndviFilter?: string
  ): Promise<GeoJSONCollection> {
    try {
      let url = `/heatmap?scenario=${scenario}&horizon=${horizon}`;
      if (riskFilter && riskFilter !== 'all') url += `&risk_filter=${riskFilter}`;
      if (popFilter && popFilter !== 'all') url += `&pop_filter=${popFilter}`;
      if (ndviFilter && ndviFilter !== 'all') url += `&ndvi_filter=${ndviFilter}`;
      const res = await apiClient.get(url);
      return res.data;
    } catch {
      const data: GeoJSONCollection = JSON.parse(JSON.stringify(getScenarioMock(scenario).heatmap));
      if (riskFilter && riskFilter !== 'all') {
        data.features = data.features.filter((f) => f.properties.risk_category?.toLowerCase() === riskFilter.toLowerCase());
      }
      return data;
    }
  },

  // Zones
  async getZones(scenario: ScenarioType, ward?: string, sortBy = 'risk'): Promise<Zone[]> {
    try {
      let url = `/zones?scenario=${scenario}&sort_by=${sortBy}`;
      if (ward) url += `&ward=${ward}`;
      const res = await apiClient.get(url);
      return res.data;
    } catch {
      let list: Zone[] = [...getScenarioMock(scenario).zones];
      if (ward) {
        list = list.filter((z) => z.ward_name?.toLowerCase().includes(ward.toLowerCase()) || z.ward_id === ward);
      }
      if (sortBy === 'risk') {
        list.sort((a, b) => (b.risk_score ?? 0) - (a.risk_score ?? 0));
      } else if (sortBy === 'temp') {
        list.sort((a, b) => (b.predicted_temp ?? 0) - (a.predicted_temp ?? 0));
      } else if (sortBy === 'pop') {
        list.sort((a, b) => (b.population ?? 0) - (a.population ?? 0));
      }
      return list;
    }
  },

  async getZoneDetails(zoneId: string, scenario: ScenarioType) {
    try {
      const res = await apiClient.get(`/zones/${zoneId}?scenario=${scenario}`);
      return res.data;
    } catch {
      const mock = getScenarioMock(scenario);
      if (mock.zone_details && mock.zone_details[zoneId]) {
        return mock.zone_details[zoneId];
      }
      const firstKey = Object.keys(mock.zone_details || {})[0];
      return mock.zone_details[firstKey];
    }
  },

  // Forecast
  async getForecast(scenario: ScenarioType): Promise<ForecastSummary> {
    try {
      const res = await apiClient.get(`/forecast?scenario=${scenario}`);
      return res.data;
    } catch {
      return getScenarioMock(scenario).forecast as ForecastSummary;
    }
  },

  // Recommendations
  async getRecommendations(
    scenario: ScenarioType,
    category?: string,
    priority?: string,
    status?: string
  ): Promise<Recommendation[]> {
    try {
      let url = `/recommendations?scenario=${scenario}`;
      if (category && category !== 'All') url += `&category=${encodeURIComponent(category)}`;
      if (priority && priority !== 'All') url += `&priority=${encodeURIComponent(priority)}`;
      if (status && status !== 'All') url += `&status=${encodeURIComponent(status)}`;
      const res = await apiClient.get(url);
      return res.data;
    } catch {
      let list = getStoredRecommendations(scenario);
      if (category && category !== 'All') {
        list = list.filter((r) => r.category?.toLowerCase() === category.toLowerCase());
      }
      if (priority && priority !== 'All') {
        list = list.filter((r) => r.priority?.toUpperCase() === priority.toUpperCase());
      }
      if (status && status !== 'All') {
        list = list.filter((r) => r.status?.toUpperCase() === status.toUpperCase());
      }
      return list;
    }
  },

  async updateRecommendationStatus(recId: string, status: string) {
    try {
      const res = await apiClient.post(`/recommendations/${recId}/status`, { status });
      return res.data;
    } catch {
      const scenarios: ScenarioType[] = ['normal', 'heatwave', 'extreme'];
      scenarios.forEach((sc) => {
        const key = `urbancool_rec_status_${sc}`;
        const current = JSON.parse(localStorage.getItem(key) || '{}');
        current[recId] = status;
        localStorage.setItem(key, JSON.stringify(current));
      });
      return { id: recId, status, message: 'Status updated' };
    }
  },

  // Interventions
  async getInterventions(
    scenario: ScenarioType,
    status?: string,
    type?: string
  ): Promise<Intervention[]> {
    try {
      let url = `/interventions?scenario=${scenario}`;
      if (status && status !== 'All') url += `&status=${encodeURIComponent(status)}`;
      if (type && type !== 'All') url += `&intervention_type=${encodeURIComponent(type)}`;
      const res = await apiClient.get(url);
      return res.data;
    } catch {
      let list = getStoredInterventions(scenario);
      if (status && status !== 'All') {
        list = list.filter((i) => i.status?.toUpperCase() === status.toUpperCase());
      }
      if (type && type !== 'All') {
        list = list.filter((i) => i.intervention_type?.toLowerCase() === type.toLowerCase());
      }
      return list;
    }
  },

  async createIntervention(data: any): Promise<Intervention> {
    try {
      const res = await apiClient.post('/interventions', data);
      return res.data;
    } catch {
      const now = new Date().toISOString();
      const newIntervention: Intervention = {
        id: `INT-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        zone_id: data.zone_id || 'PMC-W17-G042',
        scenario: data.scenario || 'normal',
        title: data.title || 'Municipal Heat Response Operation',
        intervention_type: data.intervention_type || 'Water Tanker',
        priority: data.priority || 'HIGH',
        target_location: data.target_location || 'Pune Command Zone',
        reason: data.reason || 'Operational deployment recorded via UrbanCool AI Command',
        suggested_dispatch: data.suggested_dispatch || 'Dispatched on schedule',
        status: 'DISPATCHED',
        assigned_department: data.assigned_department || 'Municipal Water Supply Cell',
        eta_minutes: 15,
        dispatches_count: 1,
        impact_metric: 'Projected ~1.8°C thermal relief in 250m buffer',
        created_at: now,
        updated_at: now,
        zone_name: data.zone_name || 'Shivajinagar Central',
      };
      const sc: ScenarioType = data.scenario || 'normal';
      const existing = getStoredInterventions(sc);
      saveInterventions(sc, [newIntervention, ...existing]);
      return newIntervention;
    }
  },

  async updateInterventionStatus(intvId: string, status: string) {
    try {
      const res = await apiClient.post(`/interventions/${intvId}/status`, { status });
      return res.data;
    } catch {
      const scenarios: ScenarioType[] = ['normal', 'heatwave', 'extreme'];
      scenarios.forEach((sc) => {
        const list = getStoredInterventions(sc);
        const updated = list.map((i) => (i.id === intvId ? { ...i, status: status as Intervention['status'] } : i));
        saveInterventions(sc, updated);
      });
      return { id: intvId, status };
    }
  },

  // Analytics
  async getAnalytics(scenario: ScenarioType): Promise<AnalyticsData> {
    try {
      const res = await apiClient.get(`/analytics?scenario=${scenario}`);
      return res.data;
    } catch {
      return getScenarioMock(scenario).analytics as AnalyticsData;
    }
  },

  // Alerts
  async getAlerts(scenario: ScenarioType, severity?: string, status?: string): Promise<AlertItem[]> {
    try {
      let url = `/alerts?scenario=${scenario}`;
      if (severity && severity !== 'All') url += `&severity=${encodeURIComponent(severity)}`;
      if (status && status !== 'All') url += `&status=${encodeURIComponent(status)}`;
      const res = await apiClient.get(url);
      return res.data;
    } catch {
      let list = getStoredAlerts(scenario);
      if (severity && severity !== 'All') {
        list = list.filter((a) => a.severity?.toUpperCase() === severity.toUpperCase());
      }
      if (status && status !== 'All') {
        list = list.filter((a) => a.status?.toUpperCase() === status.toUpperCase());
      }
      return list;
    }
  },

  async updateAlertStatus(alertId: string, status: string) {
    try {
      const res = await apiClient.post(`/alerts/${alertId}/status`, { status });
      return res.data;
    } catch {
      const scenarios: ScenarioType[] = ['normal', 'heatwave', 'extreme'];
      scenarios.forEach((sc) => {
        const key = `urbancool_alert_status_${sc}`;
        const current = JSON.parse(localStorage.getItem(key) || '{}');
        current[alertId] = status;
        localStorage.setItem(key, JSON.stringify(current));
      });
      return { id: alertId, status };
    }
  },

  // Data Sources
  async getDataSources(): Promise<DataSourceItem[]> {
    try {
      const res = await apiClient.get('/data-sources');
      return res.data;
    } catch {
      return (mockDataJson as any).data_sources || [];
    }
  },

  // Predict
  async runPredict(data: PredictInput) {
    try {
      const res = await apiClient.post('/predict', data);
      return res.data;
    } catch {
      return computeLocalPrediction(data);
    }
  },
};
