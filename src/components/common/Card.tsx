import React from 'react';

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const Card = ({ children, onClick, className = '' }: CardProps) => (
  <div onClick={onClick} className={`card-glass card-hover ${className}`.trim()}>
    {children}
  </div>
);

export default Card;
