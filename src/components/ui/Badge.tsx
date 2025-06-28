import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, className = '' }) => {
  return (
    <span className={`inline-block bg-vz-accent text-vz-bg px-s-2 py-s-1 rounded text-xs font-semibold ${className}`.trim()}>
      {children}
    </span>
  );
};

export default Badge;
