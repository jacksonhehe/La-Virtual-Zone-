import { ReactNode } from 'react';

interface SkeletonLoaderProps {
  variant: 'text' | 'circle' | 'rect' | 'card' | 'avatar' | 'stats' | 'timeline';
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
  children?: ReactNode;
}

/**
 * Componente de esqueleto de carga para mostrar mientras se obtienen los datos
 */
const SkeletonLoader = ({
  variant,
  width,
  height,
  count = 1,
  className = '',
  children
}: SkeletonLoaderProps) => {
  // Generar un array basado en el count
  const items = Array.from({ length: count }, (_, i) => i);
  
  // Renderizar el esqueleto según la variante
  const renderSkeleton = (index: number) => {
    switch (variant) {
      case 'text':
        return (
          <div 
            key={index}
            className={`h-4 bg-gray-700/70 rounded animate-pulse ${className}`}
            style={{ width: width || '100%' }}
          />
        );
      
      case 'circle':
        const circleSize = width || height || '48px';
        return (
          <div 
            key={index}
            className={`rounded-full bg-gray-700/70 animate-pulse ${className}`}
            style={{ 
              width: circleSize, 
              height: circleSize 
            }}
          />
        );
      
      case 'rect':
        return (
          <div 
            key={index}
            className={`bg-gray-700/70 rounded-lg animate-pulse ${className}`}
            style={{ 
              width: width || '100%', 
              height: height || '100px' 
            }}
          />
        );
      
      case 'card':
        return (
          <div key={index} className={`bg-dark-lighter/30 rounded-lg overflow-hidden animate-pulse ${className}`}>
            <div className="h-32 bg-gray-700/70" />
            <div className="p-4 space-y-3">
              <div className="h-5 bg-gray-700/70 rounded w-3/4" />
              <div className="h-4 bg-gray-700/70 rounded w-1/2" />
              <div className="h-4 bg-gray-700/70 rounded w-5/6" />
            </div>
          </div>
        );
      
      case 'avatar':
        return (
          <div key={index} className={`flex items-center space-x-4 ${className}`}>
            <div className="w-12 h-12 rounded-full bg-gray-700/70 animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-700/70 rounded w-1/3 animate-pulse" />
              <div className="h-3 bg-gray-700/70 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        );
      
      case 'stats':
        return (
          <div key={index} className={`p-4 bg-dark-lighter/30 rounded-lg ${className}`}>
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-gray-700/70 rounded w-1/4 animate-pulse" />
                <div className="h-6 bg-gray-700/70 rounded w-1/3 animate-pulse" />
              </div>
              <div className="w-10 h-10 rounded-lg bg-gray-700/70 animate-pulse" />
            </div>
          </div>
        );
      
      case 'timeline':
        return (
          <div key={index} className={`flex items-start space-x-4 ${className}`}>
            <div className="w-10 h-10 rounded-full bg-gray-700/70 animate-pulse" />
            <div className="flex-1 space-y-2 p-4 bg-dark-lighter/30 rounded-lg">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-700/70 rounded w-1/3 animate-pulse" />
                <div className="h-3 bg-gray-700/70 rounded w-1/5 animate-pulse" />
              </div>
              <div className="h-3 bg-gray-700/70 rounded w-5/6 animate-pulse" />
              <div className="h-3 bg-gray-700/70 rounded w-3/4 animate-pulse" />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`skeleton-loader ${variant} ${count > 1 ? 'space-y-4' : ''}`}>
      {children || items.map(renderSkeleton)}
    </div>
  );
};

export default SkeletonLoader;