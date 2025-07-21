import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'rect' | 'circle' | 'text';
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 16, variant = 'rect', className = '' }) => {
  const styles: React.CSSProperties = {
    width,
    height,
    borderRadius: variant === 'circle' ? '50%' : 6
  };
  return (
    <div
      className={`animate-pulse bg-gray-700/60 ${className}`}
      style={styles}
    />
  );
};

export default Skeleton; 