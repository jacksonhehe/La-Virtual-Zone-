import React from 'react';

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const Card = ({ children, onClick, className = '' }: CardProps) => (
  <div
    onClick={onClick}
    tabIndex={onClick ? 0 : undefined}
    className={`card card-hover ${
      onClick ? 'cursor-pointer focus:outline-none focus:ring-primary' : ''
    } ${className}`.trim()}
  >
    {children}
  </div>
);

export default Card;
