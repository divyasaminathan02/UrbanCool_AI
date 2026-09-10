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
    // Priority styles (Copper / Terracotta / Warm Gold / Sand)
    if (type === 'priority') {
      switch (status) {
        case 'CRITICAL':
          return 'bg-[#9F4937]/15 text-[#9F4937] border-[#9F4937]/35 font-extrabold';
        case 'HIGH':
          return 'bg-[#C9674B]/15 text-[#A0462C] border-[#C9674B]/35 font-bold';
        case 'MEDIUM':
          return 'bg-[#C59A4A]/15 text-[#8E6A26] border-[#C59A4A]/35 font-semibold';
        case 'LOW':
        default:
          return 'bg-[#8E9274]/15 text-[#5F6348] border-[#8E9274]/30 font-medium';
      }
    }

    // Data Source styles
    if (type === 'source') {
      switch (status) {
        case 'LIVE':
          return 'bg-[#B86B45]/15 text-[#925238] border-[#B86B45]/40 font-bold';
        case 'OPEN DATA':
          return 'bg-[#252321]/10 text-[#252321] border-[#252321]/20 font-semibold';
        case 'DEMO DATA':
        default:
          return 'bg-[#C59A4A]/15 text-[#8E6A26] border-[#C59A4A]/40 font-medium';
      }
    }

    // Operational Workflow Statuses (Warm refined neutrals & copper)
    switch (status) {
      case 'NEW':
        return 'bg-[#F5F1E8] text-[#6F6961] border-[#E7DED0]';
      case 'ACKNOWLEDGED':
        return 'bg-[#C59A4A]/10 text-[#8E6A26] border-[#C59A4A]/30 font-medium';
      case 'DISPATCHED':
        return 'bg-[#B86B45]/15 text-[#925238] border-[#B86B45]/40 font-bold';
      case 'IN PROGRESS':
        return 'bg-[#C59A4A]/20 text-[#7D5A1B] border-[#C59A4A]/50 font-bold';
      case 'RESOLVED':
        return 'bg-[#8E9274]/20 text-[#4E523A] border-[#8E9274]/40 font-semibold';
      case 'ACTIVE':
        return 'bg-[#C9674B]/15 text-[#A0462C] border-[#C9674B]/35 font-bold';
      case 'BROADCASTED':
        return 'bg-[#252321] text-[#FBF9F4] border-[#252321] font-bold';
      default:
        return 'bg-[#F5F1E8] text-[#6F6961] border-[#E7DED0]';
    }
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-lg uppercase tracking-wider ${getStyles()} ${sizeClass}`}
    >
      {status}
    </span>
  );
};
