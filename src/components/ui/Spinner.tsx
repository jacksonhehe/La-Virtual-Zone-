import React from 'react';
import clsx from 'clsx';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  'aria-label'?: string;
}

const sizeMap = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' } as const;

export default function Spinner({
  size = 'md',
  className,
  'aria-label': ariaLabel = 'Cargando'
}: SpinnerProps) {
  return (
    <span role="status" className={clsx('flex items-center justify-center', className)}>
      <svg
        className={clsx('animate-spin text-accent', sizeMap[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label={ariaLabel}
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    </span>
  );
}
