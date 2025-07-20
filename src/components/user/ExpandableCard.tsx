import { useState, ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableCardProps {
  title: string;
  icon?: ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Tarjeta expandible para mostrar información que puede ocultarse/mostrarse
 */
const ExpandableCard = ({
  title,
  icon,
  defaultExpanded = true,
  className = '',
  children
}: ExpandableCardProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`card-subtle overflow-hidden transition-all duration-300 ${className}`}>
      <div 
        className="flex items-center justify-between p-5 cursor-pointer hover:bg-dark-lighter/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          {icon && <div className="mr-3 text-primary">{icon}</div>}
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        <div className="text-gray-400">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded 
            ? 'max-h-[2000px] opacity-100' 
            : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-5 pt-0 border-t border-gray-800/30">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ExpandableCard;