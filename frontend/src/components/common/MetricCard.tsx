import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: string;
  trendType?: 'neutral' | 'warning' | 'danger' | 'success';
  badge?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
  trendType = 'neutral',
  badge,
  iconBg = 'bg-[#B86B45]/10',
  iconColor = 'text-[#B86B45]',
}) => {
  const getTrendColor = () => {
    switch (trendType) {
      case 'danger':
        return 'text-[#9F4937] bg-[#9F4937]/10 border-[#9F4937]/25';
      case 'warning':
        return 'text-[#A0462C] bg-[#C9674B]/10 border-[#C9674B]/25';
      case 'success':
        return 'text-[#8E6A26] bg-[#C59A4A]/10 border-[#C59A4A]/25';
      case 'neutral':
      default:
        return 'text-[#6F6961] bg-[#F5F1E8] border-[#E7DED0]';
    }
  };

  return (
    <div className="bg-[#FBF9F4] border border-[#E7DED0] rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#6F6961] uppercase tracking-wider">{label}</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-[#252321] tracking-tight font-mono">{value}</span>
              {subValue && (
                <span className="text-xs font-medium text-[#6F6961]">{subValue}</span>
              )}
            </div>
          </div>
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      {trend && (
        <div className="mt-2 pt-2 border-t border-[#E7DED0]/70 flex items-center justify-between">
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${getTrendColor()}`}>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
};
