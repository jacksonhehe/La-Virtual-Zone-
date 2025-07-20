import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  trend?: number;
  description?: string;
  onClick?: () => void;
}

/**
 * Tarjeta de estadísticas mejorada con animaciones y efectos visuales
 */
const StatCard = ({
  title,
  value,
  icon,
  color,
  trend,
  description,
  onClick
}: StatCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Determinar el color del trend
  const getTrendColor = () => {
    if (!trend) return 'text-gray-400';
    return trend > 0 ? 'text-green-400' : 'text-red-400';
  };
  
  // Determinar el icono del trend
  const getTrendIcon = () => {
    if (!trend) return null;
    return trend > 0 ? '↑' : '↓';
  };

  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl border border-${color}/20 bg-dark/50 p-4 cursor-pointer transition-all duration-300`}
      whileHover={{ 
        scale: 1.02,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Fondo decorativo */}
      <div 
        className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br from-${color}/10 to-transparent -mr-12 -mt-12 opacity-60`}
      />
      
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <div className="flex items-baseline">
            <h3 className={`text-3xl font-bold text-${color}`}>{value}</h3>
            {trend !== undefined && (
              <span className={`ml-2 text-sm ${getTrendColor()}`}>
                {getTrendIcon()} {Math.abs(trend)}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        
        <div className={`p-2 rounded-lg bg-${color}/20 text-${color}`}>
          {icon}
        </div>
      </div>
      
      {/* Efecto de hover */}
      <motion.div 
        className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-${color}/50 to-${color}`}
        initial={{ width: '0%' }}
        animate={{ width: isHovered ? '100%' : '0%' }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default StatCard;