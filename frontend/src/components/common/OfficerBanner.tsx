import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  TreePine,
  Droplets,
  HeartPulse,
  Sliders,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

const ROLE_ICONS = {
  HEAT_OFFICER: ShieldAlert,
  PLANNER: TreePine,
  WATER_OFFICER: Droplets,
  PUBLIC_HEALTH: HeartPulse,
  ADMIN: Sliders,
};

export const OfficerBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { user, role, officerInfo } = useAuth();
  const navigate = useNavigate();
  const Icon = ROLE_ICONS[role] || ShieldAlert;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#252321] via-[#2F2B28] to-[#1C1A18] text-[#FBF9F4] border border-[#3A3532] p-5 shadow-sm">
      {/* Background Accent Glow */}
      <div
        className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: officerInfo.accentColor }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left: Officer Identification & Directive */}
        <div className="flex items-start gap-4 max-w-3xl">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md text-[#FBF9F4]"
            style={{ backgroundColor: officerInfo.accentColor }}
          >
            <Icon className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-extrabold text-[#FBF9F4] tracking-tight">
                {officerInfo.fullName}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#1C1A18] text-[#C59A4A] border border-[#C59A4A]/40">
                {officerInfo.badgeLabel}
              </span>
              <span className="text-[11px] text-[#A98245] font-medium hidden sm:inline">
                • {officerInfo.department}
              </span>
            </div>

            <p className="text-xs font-semibold text-[#E7DED0]">
              Mandate: <span className="text-[#FBF9F4]">{officerInfo.primaryMandate}</span>
            </p>

            {!compact && (
              <p className="text-xs text-[#D5C9B8]/85 leading-relaxed pt-0.5">
                {officerInfo.directiveSummary}
              </p>
            )}
          </div>
        </div>

        {/* Right: Focused Metric & Quick Action */}
        <div className="flex flex-wrap items-center gap-3 shrink-0 lg:border-l lg:border-[#3A3532] lg:pl-5">
          <div className="bg-[#1C1A18]/80 border border-[#3A3532] px-4 py-2.5 rounded-xl min-w-[150px]">
            <div className="text-[10px] uppercase font-bold text-[#8C8479]">
              {officerInfo.keyMetricLabel}
            </div>
            <div className="text-base font-black text-[#FBF9F4] tracking-tight">
              {officerInfo.keyMetricValue}
            </div>
            <div className="text-[10px] text-[#A98245] font-medium">
              {officerInfo.keyMetricSub}
            </div>
          </div>

          <button
            onClick={() => navigate(officerInfo.quickActionRoute)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#FBF9F4] shadow-md transition-all duration-150 hover:brightness-110 cursor-pointer"
            style={{ backgroundColor: officerInfo.accentColor }}
          >
            <span>{officerInfo.quickActionButton}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
