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
  let cat = category;
  if (!cat && score !== undefined) {
    if (score >= 90) cat = 'Extreme';
    else if (score >= 80) cat = 'Very High';
    else if (score >= 60) cat = 'High';
    else if (score >= 40) cat = 'Moderate';
    else cat = 'Low';
  }

  // Copper + Warm Gold + Terracotta + Sand Palette (NO BLUE, NO GREEN)
  const colorStyles: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    Low: {
      bg: 'bg-[#8E9274]/15',
      text: 'text-[#5F6348]',
      border: 'border-[#8E9274]/30',
      dot: 'bg-[#8E9274]',
    },
    Moderate: {
      bg: 'bg-[#C59A4A]/15',
      text: 'text-[#8E6A26]',
      border: 'border-[#C59A4A]/40',
      dot: 'bg-[#C59A4A]',
    },
    High: {
      bg: 'bg-[#B86B45]/15',
      text: 'text-[#925238]',
      border: 'border-[#B86B45]/40',
      dot: 'bg-[#B86B45]',
    },
    'Very High': {
      bg: 'bg-[#C9674B]/20',
      text: 'text-[#A0462C]',
      border: 'border-[#C9674B]/50',
      dot: 'bg-[#C9674B]',
    },
    Extreme: {
      bg: 'bg-[#9F4937]/20',
      text: 'text-[#9F4937]',
      border: 'border-[#9F4937]/45',
      dot: 'bg-[#9F4937]',
    },
  };

  const style = colorStyles[cat || 'Low'] || colorStyles.Low;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold rounded-lg',
    md: 'px-2.5 py-1 text-xs font-bold rounded-xl',
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
