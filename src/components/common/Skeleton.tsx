import React from 'react';

interface SkeletonProps {
  className?: string;
}

const Skeleton = ({ className = '' }: SkeletonProps) => (
  <div className={`animate-pulse bg-white/10 rounded ${className}`.trim()} />
);

export default Skeleton;
