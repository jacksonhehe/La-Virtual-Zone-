import React from 'react';

interface ChartSkeletonProps {
  height?: number | string;
  className?: string;
}

const ChartSkeleton = ({ height = 300, className = '' }: ChartSkeletonProps) => (
  <div
    className={`grid place-items-center rounded bg-zinc-800/50 animate-pulse ${className}`.trim()}
    style={{ height }}
  >
    <div className="h-12 w-12 rounded-full bg-zinc-700" />
  </div>
);

export default ChartSkeleton;
