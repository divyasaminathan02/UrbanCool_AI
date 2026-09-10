import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  ChevronDown,
  Sparkles,
  Zap,
  Activity
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
    normal: { label: 'Normal Day', badge: 'Baseline 34.2°C', color: 'text-[#8E6A26] bg-[#C59A4A]/15 border-[#C59A4A]/40' },
    heatwave: { label: 'Heatwave Event', badge: '+3.9°C Anomaly', color: 'text-[#A0462C] bg-[#C9674B]/15 border-[#C9674B]/40' },
    extreme: { label: 'Extreme Heat', badge: '+4.8°C Emergency', color: 'text-[#9F4937] bg-[#9F4937]/20 border-[#9F4937]/45' },
  };

  const rolesList: Array<{ role: UserRole; title: string; dept: string }> = [
    { role: 'HEAT_OFFICER', title: 'Heat Action Officer', dept: 'Disaster Cell' },
    { role: 'PLANNER', title: 'Urban Planner', dept: 'Urban Forestry & Green Cover' },
    { role: 'WATER_OFFICER', title: 'Water Supply Officer', dept: 'Tanker Logistics' },
    { role: 'PUBLIC_HEALTH', title: 'Public Health Officer', dept: 'Hospital Preparedness' },
    { role: 'ADMIN', title: 'System Administrator', dept: 'Central Command' },
  ];

  return (
    <header className="h-16 bg-[#FBF9F4] border-b border-[#E7DED0] px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Left: City & Region Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F1E8] border border-[#E7DED0] rounded-xl text-xs font-semibold text-[#252321]">
          <MapPin className="w-3.5 h-3.5 text-[#B86B45]" />
          <span>Pune Municipal Region</span>
          <span className="text-[10px] text-[#6F6961] font-normal border-l border-[#E7DED0] pl-2">
            PMC & PCMC
          </span>
        </div>

        {/* Forecast Update Status */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F1E8] border border-[#E7DED0] rounded-xl text-xs text-[#6F6961]">
          <Clock className="w-3.5 h-3.5 text-[#A98245]" />
          <span>Forecast updated 14 min ago</span>
        </div>
      </div>

      {/* Center: Operational Status */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#8E9274]/15 border border-[#8E9274]/35 rounded-xl text-xs font-semibold text-[#4E523A]">
          <span className="w-2 h-2 rounded-full bg-[#8E9274] animate-pulse" />
          <span>Systems Operational</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#C59A4A]/15 border border-[#C59A4A]/30 rounded-lg text-[11px] font-bold text-[#8E6A26]">
          <Sparkles className="w-3 h-3 text-[#B86B45]" />
          <span>HACKATHON DEMO</span>
        </div>
      </div>

      {/* Right: Scenario Switcher + User Profile */}
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
            <div className="absolute right-0 mt-2 w-64 bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-[#6F6961] border-b border-[#E7DED0]">
                Simulate Climate Scenarios
              </div>
              {(['normal', 'heatwave', 'extreme'] as ScenarioType[]).map((scKey) => (
                <button
                  key={scKey}
                  onClick={() => {
                    setScenario(scKey);
                    setShowScenarioMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#F5F1E8] transition-colors cursor-pointer ${
                    scenario === scKey ? 'bg-[#B86B45]/15 font-bold text-[#252321]' : 'text-[#252321]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${scKey === 'extreme' ? 'bg-[#9F4937]' : scKey === 'heatwave' ? 'bg-[#C9674B]' : 'bg-[#C59A4A]'}`} />
                    <span>{scenarioLabels[scKey].label}</span>
                  </div>
                  <span className="text-[10px] text-[#6F6961] font-mono">{scenarioLabels[scKey].badge}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-[#F5F1E8] hover:bg-[#EAE2D5] border border-[#E7DED0] rounded-xl text-xs text-[#252321] transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-lg bg-[#B86B45] text-[#FBF9F4] flex items-center justify-center font-bold text-[10px]">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-semibold text-xs leading-none">{user?.full_name}</div>
              <div className="text-[10px] text-[#6F6961] font-medium leading-none mt-0.5">{role.replace('_', ' ')}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#6F6961]" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-3.5 py-2 border-b border-[#E7DED0]">
                <p className="text-xs font-bold text-[#252321]">{user?.full_name}</p>
                <p className="text-[11px] text-[#6F6961]">{user?.department}</p>
              </div>

              <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase text-[#6F6961] mt-1">
                Switch Operational Persona
              </div>
              {rolesList.map((r) => (
                <button
                  key={r.role}
                  onClick={() => {
                    switchRole(r.role);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex flex-col hover:bg-[#F5F1E8] transition-colors cursor-pointer ${
                    role === r.role ? 'bg-[#B86B45]/15 text-[#252321] font-bold' : 'text-[#252321]'
                  }`}
                >
                  <span className="font-semibold">{r.title}</span>
                  <span className="text-[10px] text-[#6F6961]">{r.dept}</span>
                </button>
              ))}

              <div className="mt-2 pt-2 border-t border-[#E7DED0] px-3.5">
                <button
                  onClick={() => {
                    logout();
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-left text-xs font-semibold text-[#9F4937] py-1 hover:underline cursor-pointer"
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
