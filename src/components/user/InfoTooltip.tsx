import { ReactNode, useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  content: ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  children?: ReactNode;
  icon?: boolean;
  className?: string;
}

/**
 * Componente de tooltip informativo que se muestra al hacer hover
 */
const InfoTooltip = ({
  content,
  position = 'top',
  children,
  icon = true,
  className = ''
}: InfoTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  
  // Posicionamiento del tooltip
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 translate-x-2 ml-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 translate-y-2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 -translate-x-2 mr-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-2';
    }
  };

  // Cerrar tooltip al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current && 
        triggerRef.current && 
        !tooltipRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative inline-block ${className}`} ref={triggerRef}>
      <div 
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-flex items-center cursor-help"
      >
        {children}
        {icon && !children && (
          <Info size={16} className="text-primary/70 hover:text-primary transition-colors" />
        )}
      </div>
      
      {isVisible && (
        <div 
          ref={tooltipRef}
          className={`absolute z-50 w-64 p-3 text-sm bg-dark-lighter border border-gray-700 rounded-lg shadow-xl animate-fadeIn ${getPositionClasses()}`}
        >
          <div className="text-gray-300">{content}</div>
          <div className={`absolute w-2 h-2 bg-dark-lighter border-t border-l border-gray-700 transform rotate-45 ${
            position === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1' :
            position === 'right' ? 'left-0 top-1/2 -translate-y-1/2 -translate-x-1' :
            position === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1' :
            'right-0 top-1/2 -translate-y-1/2 translate-x-1'
          }`}></div>
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;