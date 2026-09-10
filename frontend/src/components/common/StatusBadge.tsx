import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'status' | 'priority' | 'source';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'status',
  size = 'md',
}) => {
  const getStyles = () => {
    // Priority styles
    if (type === 'priority') {
      switch (status) {
        case 'CRITICAL':
          return 'bg-[#D9534F]/15 text-[#D9534F] border-[#D9534F]/30';
        case 'HIGH':
          return 'bg-[#EF8069]/15 text-[#C9543C] border-[#EF8069]/30';
        case 'MEDIUM':
          return 'bg-[#F4B942]/15 text-[#B88114] border-[#F4B942]/30';
        case 'LOW':
        default:
          return 'bg-[#18B6A4]/15 text-[#0D8F82] border-[#18B6A4]/30';
      }
    }

    // Data Source styles
    if (type === 'source') {
      switch (status) {
        case 'LIVE':
          return 'bg-[#18B6A4]/15 text-[#0D8F82] border-[#18B6A4]/40 font-semibold';
        case 'OPEN DATA':
          return 'bg-[#1B344D]/10 text-[#1B344D] border-[#1B344D]/20 font-medium';
        case 'DEMO DATA':
        default:
          return 'bg-[#F4B942]/15 text-[#B88114] border-[#F4B942]/40 font-medium';
      }
    }

    // Default Operational Workflow Statuses
    switch (status) {
      case 'NEW':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ACKNOWLEDGED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'DISPATCHED':
        return 'bg-amber-50 text-amber-800 border-amber-300 font-semibold';
      case 'IN PROGRESS':
        return 'bg-teal-50 text-teal-800 border-teal-300 font-semibold';
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'ACTIVE':
        return 'bg-rose-50 text-rose-700 border-rose-300';
      case 'BROADCASTED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-lg uppercase tracking-wider font-semibold ${getStyles()} ${sizeClass}`}
    >
      {status}
    </span>
  );
};
