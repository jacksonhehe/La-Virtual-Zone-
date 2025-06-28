import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-vz-surface p-s-4 rounded shadow ${className}`.trim()}>
      {children}
    </div>
  );
};

export default Card;
