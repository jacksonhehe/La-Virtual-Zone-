import React from 'react';

interface Props {
  /** Progress value between 0 and 100 */
  value: number;
  /** Diameter in pixels */
  size?: number;
  /** Optional label shown in the center */
  label?: React.ReactNode;
}

const CircularProgress = ({ value, size = 80, label }: Props) => {
  const radius = size / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth="4"
          className="text-dark"
          stroke="currentColor"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth="4"
          className="text-primary transition-all duration-500"
          stroke="currentColor"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {label && (
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
          {label}
        </span>
      )}
    </div>
  );
};

export default CircularProgress;
