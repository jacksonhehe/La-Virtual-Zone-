import { useState, memo } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
}

/**
 * Componente optimizado para cargar imágenes con lazy loading y placeholders
 */
const OptimizedImage = memo(({
  src,
  alt,
  className = '',
  width,
  height,
  aspectRatio = '16/9'
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Manejar carga exitosa
  const handleLoad = () => {
    setIsLoaded(true);
  };

  // Manejar error de carga
  const handleError = () => {
    setHasError(true);
  };

  return (
    <div 
      className={`relative overflow-hidden bg-gray-800 ${className}`}
      style={{ aspectRatio }}
    >
      {/* Placeholder que se muestra mientras la imagen carga */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse" />
      )}
      
      {/* Imagen con lazy loading */}
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        /* Fallback para errores de carga */
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-500">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-gray-500"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </div>
      )}
    </div>
  );
});

export default OptimizedImage;