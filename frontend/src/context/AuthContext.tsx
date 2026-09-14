import React, { createContext, useContext, useState } from 'react';
import { User, UserRole, DashboardSummary } from '../types';
import { apiService } from '../services/api';

export interface OfficerPersonaInfo {
  role: UserRole;
  username: string;
  fullName: string;
  department: string;
  badgeLabel: string;
  avatarLetter: string;
  avatarBg: string;
  accentColor: string;
  primaryMandate: string;
  directiveSummary: string;
  keyMetricLabel: string;
  keyMetricValue: string;
  keyMetricSub: string;
  defaultMapLayer: 'risk' | 'lst' | 'ndvi' | 'built_up' | 'population';
  defaultRecCategory: string;
  defaultInterventionType: string;
  quickActionTitle: string;
  quickActionDescription: string;
  quickActionButton: string;
  quickActionRoute: string;
}

export const OFFICER_PROFILES: Record<UserRole, OfficerPersonaInfo> = {
  HEAT_OFFICER: {
    role: 'HEAT_OFFICER',
    username: 'heat_officer',
    fullName: 'Dr. Aarav Deshmukh',
    department: 'Municipal Heat Action & Disaster Cell',
    badgeLabel: 'Disaster Cell Command',
    avatarLetter: 'A',
    avatarBg: 'bg-[#B86B45]',
    accentColor: '#B86B45',
    primaryMandate: 'City-Wide Heat Disaster Alerting & Emergency Protocols',
    directiveSummary: 'Monitoring all 30 Pune micro-grids for critical thermal anomalies (+3.9°C to +4.8°C). Pre-authorizing mandatory outdoor labor moratoriums and automated public SMS broadcasts.',
    keyMetricLabel: 'City Heat Risk Level',
    keyMetricValue: '79 / 100',
    keyMetricSub: '14 Wards in Critical Advisory',
    defaultMapLayer: 'risk',
    defaultRecCategory: 'All',
    defaultInterventionType: 'All',
    quickActionTitle: 'Emergency Heatwave Broadcast',
    quickActionDescription: 'Issue urgent moratorium for 12:00-16:00 and trigger emergency public heat alerts across high-risk wards.',
    quickActionButton: 'Review Heat Warnings',
    quickActionRoute: '/alerts',
  },
  PLANNER: {
    role: 'PLANNER',
    username: 'urban_planner',
    fullName: 'Priya Kulkarni',
    department: 'Urban Planning & Climate Resilience Cell',
    badgeLabel: 'Urban Forestry & Cool Roofs',
    avatarLetter: 'P',
    avatarBg: 'bg-[#8E9274]',
    accentColor: '#8E9274',
    primaryMandate: 'Canopy Deficit Remediation & High-Albedo Cool Roof Zoning',
    directiveSummary: 'Prioritizing micro-grids with acute NDVI deficits (< 0.15) and dense concrete heat traps (> 0.85 built-up). Scheduling cool roof retrofits and shade canopy zoning.',
    keyMetricLabel: 'Canopy Deficit Corridors',
    keyMetricValue: '18 Wards',
    keyMetricSub: 'NDVI < 0.15 in Commercial Cores',
    defaultMapLayer: 'ndvi',
    defaultRecCategory: 'Tree Canopy',
    defaultInterventionType: 'Tree Plantation',
    quickActionTitle: 'Cool Roof & Canopy Expansion',
    quickActionDescription: 'Inspect low-NDVI commercial clusters and approve 12 high-priority cool roof & shade zoning interventions.',
    quickActionButton: 'Inspect Canopy GIS Map',
    quickActionRoute: '/heat-map',
  },
  WATER_OFFICER: {
    role: 'WATER_OFFICER',
    username: 'water_officer',
    fullName: 'Sunil Shinde',
    department: 'Water Supply & Evaporative Operations Cell',
    badgeLabel: 'Tanker Fleet & Evaporative Logistics',
    avatarLetter: 'S',
    avatarBg: 'bg-[#4B88A2]',
    accentColor: '#4B88A2',
    primaryMandate: 'Water Tanker Fleet Dispatch & Evaporative Misting Logistics',
    directiveSummary: 'Directing municipal water tankers and high-pressure mist cannons to high-transit concrete transit junctions to depress ambient thermal peaks by up to 2.4°C.',
    keyMetricLabel: 'Water Fleet Operations',
    keyMetricValue: '160,000 Liters',
    keyMetricSub: '16 Active Tankers & Mist Cannons',
    defaultMapLayer: 'lst',
    defaultRecCategory: 'Water',
    defaultInterventionType: 'Water Tanker',
    quickActionTitle: 'Dispatch Water Tanker Fleet',
    quickActionDescription: 'Authorize emergency misting cannon routes and water refills for Shivajinagar and Hadapsar transit nodes.',
    quickActionButton: 'Open Fleet Operations',
    quickActionRoute: '/interventions',
  },
  PUBLIC_HEALTH: {
    role: 'PUBLIC_HEALTH',
    username: 'health_officer',
    fullName: 'Dr. Meera Joshi',
    department: 'Public Health & Hospital Preparedness Cell',
    badgeLabel: 'Hospital Preparedness & Cooling Shelters',
    avatarLetter: 'M',
    avatarBg: 'bg-[#9F4937]',
    accentColor: '#9F4937',
    primaryMandate: 'Cooling Shelter Readiness & Hospital Heatstroke Preparedness',
    directiveSummary: 'Ensuring air-conditioned community cooling shelters are active across dense slum wards. Coordinating with Sassoon & civil hospitals for cold-saline resuscitation beds.',
    keyMetricLabel: 'Vulnerable Citizens Covered',
    keyMetricValue: '78,400 People',
    keyMetricSub: '18 AC Cooling Shelters Activated',
    defaultMapLayer: 'population',
    defaultRecCategory: 'Cooling Centers',
    defaultInterventionType: 'Cooling Shelter Activation',
    quickActionTitle: 'Pre-Activate Cooling Shelters',
    quickActionDescription: 'Verify hydration stocks and extend air-conditioned community centers in Mandai, Yerawada, and Swargate.',
    quickActionButton: 'Manage Cooling Shelters',
    quickActionRoute: '/recommendations',
  },
  ADMIN: {
    role: 'ADMIN',
    username: 'admin',
    fullName: 'System Administrator',
    department: 'Central Command & ML Infrastructure',
    badgeLabel: 'System & Model Governance',
    avatarLetter: 'A',
    avatarBg: 'bg-[#6F6961]',
    accentColor: '#6F6961',
    primaryMandate: 'AI Hyperparameter Calibration & Telemetry Diagnostics',
    directiveSummary: 'Monitoring 250m downscaling inference accuracy (MAE 0.14°C), validating NASA/Sentinel-2 feeds, and calibrating composite risk weighting formulas.',
    keyMetricLabel: 'AI Downscaling Accuracy',
    keyMetricValue: '94.2% R²',
    keyMetricSub: 'MAE 0.14°C • 2500 Synthetic Grids',
    defaultMapLayer: 'risk',
    defaultRecCategory: 'All',
    defaultInterventionType: 'All',
    quickActionTitle: 'AI Model & Sensor Calibration',
    quickActionDescription: 'Adjust multi-criteria risk weightings and verify simulated IoT telemetry ingestion endpoints.',
    quickActionButton: 'Open System Settings',
    quickActionRoute: '/settings',
  },
};

interface AuthContextType {
  user: User | null;
  role: UserRole;
  officerInfo: OfficerPersonaInfo;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const DEFAULT_USER: User = {
  id: 1,
  username: 'heat_officer',
  email: 'heat.action@punecorporation.org',
  full_name: 'Dr. Aarav Deshmukh',
  role: 'HEAT_OFFICER',
  department: 'Municipal Heat Action & Disaster Cell',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('urbancool_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });
  const [isLoading, setIsLoading] = useState(false);

  const role = user?.role || 'HEAT_OFFICER';
  const officerInfo = OFFICER_PROFILES[role] || OFFICER_PROFILES.HEAT_OFFICER;
  const isAuthenticated = !!user;

  const login = async (username: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await apiService.login(username, pass);
      localStorage.setItem('urbancool_token', data.access_token);
      localStorage.setItem('urbancool_user', JSON.stringify(data.user));
      setUser(data.user);
      setIsLoading(false);
      return true;
    } catch {
      const roleMap: Record<string, UserRole> = {
        heat_officer: 'HEAT_OFFICER',
        urban_planner: 'PLANNER',
        water_officer: 'WATER_OFFICER',
        health_officer: 'PUBLIC_HEALTH',
        admin: 'ADMIN',
      };
      const assignedRole = roleMap[username] || 'HEAT_OFFICER';
      const prof = OFFICER_PROFILES[assignedRole];
      const demoUser: User = {
        id: 1,
        username,
        email: `${username}@punecorporation.org`,
        full_name: prof.fullName,
        role: assignedRole,
        department: prof.department,
      };
      setUser(demoUser);
      localStorage.setItem('urbancool_user', JSON.stringify(demoUser));
      setIsLoading(false);
      return true;
    }
  };

  const logout = () => {
    localStorage.removeItem('urbancool_token');
    localStorage.removeItem('urbancool_user');
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    const prof = OFFICER_PROFILES[newRole] || OFFICER_PROFILES.HEAT_OFFICER;
    const updatedUser: User = {
      id: 1,
      username: prof.username,
      email: `${prof.username}@punecorporation.org`,
      full_name: prof.fullName,
      role: newRole,
      department: prof.department,
    };
    setUser(updatedUser);
    localStorage.setItem('urbancool_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        officerInfo,
        isAuthenticated,
        isLoading,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
