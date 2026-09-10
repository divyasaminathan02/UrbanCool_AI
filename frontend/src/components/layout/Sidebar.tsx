import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  Grid,
  CalendarDays,
  CheckSquare,
  Truck,
  BarChart3,
  BellRing,
  Database,
  Settings,
  Flame,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/heat-map', label: 'Heat Map GIS', icon: Map, badge: 'Live GIS' },
  { path: '/zones', label: 'Zones Directory', icon: Grid },
  { path: '/forecast', label: '48h Forecast', icon: CalendarDays },
  { path: '/recommendations', label: 'Action Advisories', icon: CheckSquare },
  { path: '/interventions', label: 'Interventions', icon: Truck, badge: 'Ops' },
  { path: '/analytics', label: 'Climate Analytics', icon: BarChart3 },
  { path: '/alerts', label: 'Heat Warnings', icon: BellRing },
];

const BOTTOM_ITEMS = [
  { path: '/data-sources', label: 'Data Sources', icon: Database },
  { path: '/settings', label: 'System Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { role, user } = useAuth();

  return (
    <aside className="w-64 bg-[#12263A] text-white flex flex-col shrink-0 h-screen sticky top-0 border-r border-[#1B344D] z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1B344D]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#18B6A4] to-[#0D8F82] flex items-center justify-center shadow-md shadow-[#18B6A4]/20 shrink-0">
            <Flame className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-tight flex items-center gap-1.5">
              UrbanCool <span className="text-[#18B6A4] text-xs font-black uppercase px-1.5 py-0.5 bg-[#18B6A4]/20 rounded-md">AI</span>
            </h1>
            <p className="text-[11px] font-medium text-[#9AAEB9] tracking-wide">
              Urban Climate Intelligence
            </p>
          </div>
        </div>

        {/* Municipal Badge */}
        <div className="mt-3 px-3 py-1.5 bg-[#1B344D]/80 rounded-lg border border-[#234563] flex items-center justify-between text-[11px]">
          <span className="text-[#A4B8C6] flex items-center gap-1.5 font-medium">
            <Building2 className="w-3.5 h-3.5 text-[#18B6A4]" />
            Pune Municipal (PMC)
          </span>
          <span className="w-2 h-2 rounded-full bg-[#18B6A4] animate-ping" />
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#688194]">
          Operations & Intelligence
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-[#18B6A4] text-[#12263A] font-bold shadow-md shadow-[#18B6A4]/25'
                  : 'text-[#C5D3DC] hover:bg-[#1B344D] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-[#12263A]' : 'text-[#8EA7B8]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                    isActive
                      ? 'bg-[#12263A] text-[#18B6A4]'
                      : 'bg-[#1B344D] text-[#18B6A4] border border-[#18B6A4]/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        <div className="pt-4 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#688194]">
          Registry & Admin
        </div>
        {BOTTOM_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-[#18B6A4] text-[#12263A] font-bold'
                  : 'text-[#9AAEB9] hover:bg-[#1B344D] hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#12263A]' : 'text-[#8EA7B8]'}`} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Footer / Grand Challenge Attribution */}
      <div className="p-3.5 border-t border-[#1B344D] bg-[#0E1E2E]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#18B6A4]" />
            <span className="text-[11px] font-semibold text-[#8EA7B8]">Indradhanu 2026</span>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#1B344D] text-[#F4B942] rounded border border-[#F4B942]/30">
            SDG 13 • 11 • 3
          </span>
        </div>
      </div>
    </aside>
  );
};
