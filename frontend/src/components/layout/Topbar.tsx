import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Activity,
  Bell,
  UserCheck,
  ChevronDown,
  Sparkles,
  Shield,
  Layers,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useScenario } from '../../context/ScenarioContext';
import { ScenarioType, UserRole } from '../../types';

export const Topbar: React.FC = () => {
  const { user, role, switchRole, logout } = useAuth();
  const { scenario, setScenario } = useScenario();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);

  const scenarioLabels: Record<ScenarioType, { label: string; badge: string; color: string }> = {
    normal: { label: 'Normal Day', badge: 'Baseline 34.2°C', color: 'text-[#0D8F82] bg-[#18B6A4]/15 border-[#18B6A4]/40' },
    heatwave: { label: 'Heatwave Event', badge: '+3.9°C Anomaly', color: 'text-[#C9543C] bg-[#EF8069]/15 border-[#EF8069]/40' },
    extreme: { label: 'Extreme Heat', badge: '+4.8°C Emergency', color: 'text-[#D9534F] bg-[#D9534F]/20 border-[#D9534F]/40' },
  };

  const rolesList: Array<{ role: UserRole; title: string; dept: string }> = [
    { role: 'HEAT_OFFICER', title: 'Heat Action Officer', dept: 'Disaster Cell' },
    { role: 'PLANNER', title: 'Urban Planner', dept: 'Urban Forestry & Green Cover' },
    { role: 'WATER_OFFICER', title: 'Water Supply Officer', dept: 'Tanker Logistics' },
    { role: 'PUBLIC_HEALTH', title: 'Public Health Officer', dept: 'Hospital Preparedness' },
    { role: 'ADMIN', title: 'System Administrator', dept: 'Central Command' },
  ];

  return (
    <header className="h-16 bg-white border-b border-[#DCE4E8] px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Left Container: City and Region */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F4F7F8] border border-[#DCE4E8] rounded-xl text-xs font-semibold text-[#172033]">
          <MapPin className="w-3.5 h-3.5 text-[#18B6A4]" />
          <span>Pune Municipal Region</span>
          <span className="text-[10px] text-[#617080] font-normal border-l border-[#DCE4E8] pl-2">
            PMC & PCMC
          </span>
        </div>

        {/* Forecast Update Status */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F7F8] border border-[#DCE4E8] rounded-xl text-xs text-[#617080]">
          <Clock className="w-3.5 h-3.5 text-[#617080]" />
          <span>Forecast updated 14 min ago</span>
        </div>
      </div>

      {/* Center Container: System Status & Live Operational Indicator */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Systems Operational</span>
        </div>

        {/* Demo Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-[11px] font-bold text-amber-800">
          <Sparkles className="w-3 h-3 text-amber-600" />
          <span>HACKATHON DEMO</span>
        </div>
      </div>

      {/* Right Container: Scenario Switcher + Roles + Profile */}
      <div className="flex items-center gap-3">
        {/* Scenario Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowScenarioMenu(!showScenarioMenu)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer ${scenarioLabels[scenario].color}`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Scenario: {scenarioLabels[scenario].label}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {showScenarioMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-[#DCE4E8] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-[#617080] border-b border-[#DCE4E8]">
                Simulate Climate Scenarios
              </div>
              {(['normal', 'heatwave', 'extreme'] as ScenarioType[]).map((scKey) => (
                <button
                  key={scKey}
                  onClick={() => {
                    setScenario(scKey);
                    setShowScenarioMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#F4F7F8] transition-colors ${
                    scenario === scKey ? 'bg-[#18B6A4]/10 font-bold text-[#12263A]' : 'text-[#172033]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${scKey === 'extreme' ? 'bg-[#D9534F]' : scKey === 'heatwave' ? 'bg-[#EF8069]' : 'bg-[#18B6A4]'}`} />
                    <span>{scenarioLabels[scKey].label}</span>
                  </div>
                  <span className="text-[10px] text-[#617080] font-mono">{scenarioLabels[scKey].badge}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-[#F4F7F8] hover:bg-[#EAEFF2] border border-[#DCE4E8] rounded-xl text-xs text-[#172033] transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-lg bg-[#12263A] text-white flex items-center justify-center font-bold text-[10px]">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-semibold text-xs leading-none">{user?.full_name}</div>
              <div className="text-[10px] text-[#617080] font-medium leading-none mt-0.5">{role.replace('_', ' ')}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#617080]" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-[#DCE4E8] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-3.5 py-2 border-b border-[#DCE4E8]">
                <p className="text-xs font-bold text-[#172033]">{user?.full_name}</p>
                <p className="text-[11px] text-[#617080]">{user?.department}</p>
              </div>

              <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase text-[#617080] mt-1">
                Switch Operational Persona
              </div>
              {rolesList.map((r) => (
                <button
                  key={r.role}
                  onClick={() => {
                    switchRole(r.role);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex flex-col hover:bg-[#F4F7F8] transition-colors ${
                    role === r.role ? 'bg-[#18B6A4]/10 text-[#12263A] font-bold' : 'text-[#172033]'
                  }`}
                >
                  <span className="font-semibold">{r.title}</span>
                  <span className="text-[10px] text-[#617080]">{r.dept}</span>
                </button>
              ))}

              <div className="mt-2 pt-2 border-t border-[#DCE4E8] px-3.5">
                <button
                  onClick={() => {
                    logout();
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-left text-xs font-semibold text-[#D9534F] py-1 hover:underline cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
