import React from 'react';

interface CardSkeletonProps {
  lines?: number;
  className?: string;
}

const CardSkeleton = ({ lines = 3, className = '' }: CardSkeletonProps) => (
  <div className={`card-glass p-4 animate-pulse space-y-2 ${className}`.trim()}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="h-4 rounded bg-white/10" />
    ))}
  </div>
);

export default CardSkeleton;
