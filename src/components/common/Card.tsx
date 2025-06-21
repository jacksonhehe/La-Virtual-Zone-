import React from 'react';

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const Card = ({ children, onClick, className = '' }: CardProps) => (
  <div
    onClick={onClick}
    className={`hover-card rounded-lg bg-zinc-900 p-4 shadow transition-transform hover:shadow-neon/40 ${className}`.trim()}
  >
    {children}
  </div>
);

export default Card;
