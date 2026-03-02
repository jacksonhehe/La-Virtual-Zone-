import React from 'react';

type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

const toneStyles: Record<BadgeTone, string> = {
  neutral: 'bg-gray-700/60 border-gray-600 text-gray-200',
  info: 'bg-blue-500/10 border-blue-500/40 text-blue-200',
  success: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200',
  warning: 'bg-amber-500/10 border-amber-500/40 text-amber-200',
  danger: 'bg-red-500/10 border-red-500/40 text-red-200'
};

const dotStyles: Record<BadgeTone, string> = {
  neutral: 'bg-gray-400',
  info: 'bg-blue-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-red-400'
};

type AdminStatusBadgeProps = {
  label: string;
  tone?: BadgeTone;
  withDot?: boolean;
  pulseDot?: boolean;
  className?: string;
};

const AdminStatusBadge = ({ label, tone = 'neutral', withDot = false, pulseDot = false, className = '' }: AdminStatusBadgeProps) => {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs ${toneStyles[tone]} ${className}`.trim()}>
      {withDot && <span className={`mr-2 h-1.5 w-1.5 rounded-full ${dotStyles[tone]} ${pulseDot ? 'animate-pulse' : ''}`.trim()}></span>}
      {label}
    </span>
  );
};

export default AdminStatusBadge;
