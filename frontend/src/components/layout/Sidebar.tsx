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
  Building2,
  Layers,
  Flame
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

  return (
    <aside className="w-64 bg-[#252321] text-[#FBF9F4] flex flex-col shrink-0 h-screen sticky top-0 border-r border-[#3A3532] z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#3A3532]">
        <div className="flex items-center gap-3">
          {/* Abstract Urban Grid & Heat Cell Logo */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B86B45] to-[#925238] flex items-center justify-center shadow-md shadow-[#B86B45]/20 shrink-0">
            <Layers className="w-5 h-5 text-[#FBF9F4]" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-[#FBF9F4] tracking-tight leading-tight flex items-center gap-1.5">
              UrbanCool <span className="text-[#B86B45] text-xs font-black uppercase px-1.5 py-0.5 bg-[#B86B45]/20 rounded-md">AI</span>
            </h1>
            <p className="text-[10px] font-medium text-[#A98245] tracking-wide">
              Climate Intelligence for Urban Decisions
            </p>
          </div>
        </div>

        {/* Municipal Region Badge */}
        <div className="mt-3 px-3 py-1.5 bg-[#1C1A18] rounded-xl border border-[#3A3532] flex items-center justify-between text-[11px]">
          <span className="text-[#C5D3DC] flex items-center gap-1.5 font-medium">
            <Building2 className="w-3.5 h-3.5 text-[#B86B45]" />
            <span className="text-[#E7DED0]">Pune Municipal (PMC)</span>
          </span>
          <span className="w-2 h-2 rounded-full bg-[#B86B45] animate-ping" />
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8C8479]">
          Command & Intelligence
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-[#B86B45] text-[#FBF9F4] font-bold shadow-md shadow-[#B86B45]/25'
                  : 'text-[#D5C9B8] hover:bg-[#34302C] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-[#FBF9F4]' : 'text-[#A98245]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                    isActive
                      ? 'bg-[#252321] text-[#FBF9F4]'
                      : 'bg-[#1C1A18] text-[#C59A4A] border border-[#C59A4A]/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        <div className="pt-4 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8C8479]">
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
                  ? 'bg-[#B86B45] text-[#FBF9F4] font-bold'
                  : 'text-[#A98245] hover:bg-[#34302C] hover:text-[#FBF9F4]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#FBF9F4]' : 'text-[#8C8479]'}`} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Footer / Attribution */}
      <div className="p-3.5 border-t border-[#3A3532] bg-[#1C1A18]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#B86B45]" />
            <span className="text-[11px] font-semibold text-[#D5C9B8]">Indradhanu 2026</span>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#252321] text-[#C59A4A] rounded border border-[#C59A4A]/30">
            SDG 13 • 11 • 3
          </span>
        </div>
      </div>
    </aside>
  );
};
