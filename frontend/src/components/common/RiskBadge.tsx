import React from 'react';

interface RiskBadgeProps {
  score?: number;
  category?: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme' | string;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  score,
  category,
  size = 'md',
  showScore = true,
}) => {
  // Infer category from score if category not provided
  let cat = category;
  if (!cat && score !== undefined) {
    if (score >= 90) cat = 'Extreme';
    else if (score >= 80) cat = 'Very High';
    else if (score >= 60) cat = 'High';
    else if (score >= 40) cat = 'Moderate';
    else cat = 'Low';
  }

  const colorStyles: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    Low: {
      bg: 'bg-[#18B6A4]/10',
      text: 'text-[#0D8F82]',
      border: 'border-[#18B6A4]/30',
      dot: 'bg-[#18B6A4]',
    },
    Moderate: {
      bg: 'bg-[#F4B942]/15',
      text: 'text-[#B88114]',
      border: 'border-[#F4B942]/40',
      dot: 'bg-[#F4B942]',
    },
    High: {
      bg: 'bg-[#EF8069]/15',
      text: 'text-[#C9543C]',
      border: 'border-[#EF8069]/40',
      dot: 'bg-[#EF8069]',
    },
    'Very High': {
      bg: 'bg-[#EF8069]/25',
      text: 'text-[#B83E26]',
      border: 'border-[#EF8069]/60',
      dot: 'bg-[#EF8069]',
    },
    Extreme: {
      bg: 'bg-[#D9534F]/15',
      text: 'text-[#D9534F]',
      border: 'border-[#D9534F]/40',
      dot: 'bg-[#D9534F]',
    },
  };

  const style = colorStyles[cat || 'Low'] || colorStyles.Low;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold rounded-md',
    md: 'px-2.5 py-1 text-xs font-bold rounded-lg',
    lg: 'px-3 py-1.5 text-sm font-bold rounded-xl',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border ${style.bg} ${style.text} ${style.border} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${cat === 'Extreme' || cat === 'Very High' ? 'animate-ping' : ''}`} />
      <span>{cat}</span>
      {showScore && score !== undefined && (
        <span className="opacity-80 font-mono text-[11px]">({score})</span>
      )}
    </span>
  );
};
