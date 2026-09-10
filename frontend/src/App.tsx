import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ScenarioProvider } from './context/ScenarioContext';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { HeatMapPage } from './pages/HeatMapPage';
import { ZonesPage } from './pages/ZonesPage';
import { ZoneDetailPage } from './pages/ZoneDetailPage';
import { ForecastPage } from './pages/ForecastPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { InterventionsPage } from './pages/InterventionsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AlertsPage } from './pages/AlertsPage';
import { DataSourcesPage } from './pages/DataSourcesPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScenarioProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/heat-map" element={<HeatMapPage />} />
              <Route path="/zones" element={<ZonesPage />} />
              <Route path="/zone/:id" element={<ZoneDetailPage />} />
              <Route path="/forecast" element={<ForecastPage />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
              <Route path="/interventions" element={<InterventionsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/data-sources" element={<DataSourcesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ScenarioProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
