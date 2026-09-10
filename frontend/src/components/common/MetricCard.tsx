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
  iconBg = 'bg-[#18B6A4]/10',
  iconColor = 'text-[#0D8F82]',
}) => {
  const getTrendColor = () => {
    switch (trendType) {
      case 'danger':
        return 'text-[#D9534F] bg-[#D9534F]/10 border-[#D9534F]/20';
      case 'warning':
        return 'text-[#B88114] bg-[#F4B942]/15 border-[#F4B942]/30';
      case 'success':
        return 'text-[#0D8F82] bg-[#18B6A4]/10 border-[#18B6A4]/20';
      case 'neutral':
      default:
        return 'text-[#617080] bg-[#F4F7F8] border-[#DCE4E8]';
    }
  };

  return (
    <div className="bg-white border border-[#DCE4E8] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#617080] uppercase tracking-wider">{label}</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-[#172033] tracking-tight font-mono">{value}</span>
              {subValue && (
                <span className="text-xs font-medium text-[#617080]">{subValue}</span>
              )}
            </div>
          </div>
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      {trend && (
        <div className="mt-2 pt-2 border-t border-[#DCE4E8]/60 flex items-center justify-between">
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${getTrendColor()}`}>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
};
