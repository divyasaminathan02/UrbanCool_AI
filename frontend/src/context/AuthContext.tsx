import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
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
    } catch (e) {
      console.warn('API login fallback to seeded demo account');
      // Fallback demo user
      const roleMap: Record<string, { name: string; role: UserRole; dept: string }> = {
        heat_officer: { name: 'Dr. Aarav Deshmukh', role: 'HEAT_OFFICER', dept: 'Municipal Heat Action & Disaster Cell' },
        urban_planner: { name: 'Priya Kulkarni', role: 'PLANNER', dept: 'Urban Planning & Climate Resilience' },
        water_officer: { name: 'Sunil Shinde', role: 'WATER_OFFICER', dept: 'Water Supply & Tanker Operations' },
        health_officer: { name: 'Dr. Meera Joshi', role: 'PUBLIC_HEALTH', dept: 'Public Health & Hospital Preparedness' },
        admin: { name: 'System Administrator', role: 'ADMIN', dept: 'Central Command Administration' },
      };
      const info = roleMap[username] || roleMap['heat_officer'];
      const demoUser: User = {
        id: 1,
        username,
        email: `${username}@punecorporation.org`,
        full_name: info.name,
        role: info.role,
        department: info.dept,
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
    const roleDetails: Record<UserRole, { username: string; name: string; dept: string }> = {
      HEAT_OFFICER: { username: 'heat_officer', name: 'Dr. Aarav Deshmukh', dept: 'Municipal Heat Action & Disaster Cell' },
      PLANNER: { username: 'urban_planner', name: 'Priya Kulkarni', dept: 'Urban Planning & Climate Resilience' },
      WATER_OFFICER: { username: 'water_officer', name: 'Sunil Shinde', dept: 'Water Supply & Tanker Operations' },
      PUBLIC_HEALTH: { username: 'health_officer', name: 'Dr. Meera Joshi', dept: 'Public Health & Hospital Preparedness' },
      ADMIN: { username: 'admin', name: 'System Administrator', dept: 'Central Command Administration' },
    };
    const details = roleDetails[newRole];
    const updatedUser: User = {
      id: 1,
      username: details.username,
      email: `${details.username}@punecorporation.org`,
      full_name: details.name,
      role: newRole,
      department: details.dept,
    };
    setUser(updatedUser);
    localStorage.setItem('urbancool_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
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
