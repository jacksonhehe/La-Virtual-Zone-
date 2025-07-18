import React, { ReactNode } from 'react';
import './flipcard.css';

interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  className?: string;
}

const FlipCard: React.FC<FlipCardProps> = ({ front, back, className }) => {
  return (
    <div className={`flip-card ${className ?? ''}`.trim()}>
      <div className="flip-card-inner">
        <div className="flip-card-front">
          {front}
        </div>
        <div className="flip-card-back">
          {back}
        </div>
      </div>
    </div>
  );
};

export default FlipCard; 