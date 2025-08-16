export const MARKET_CONFIG = {
  // Tiempo de vencimiento por defecto para ofertas (en horas)
  DEFAULT_OFFER_EXPIRY_HOURS: 48,
  
  // Tiempo de cierre automático del mercado (en horas)
  DEFAULT_MARKET_CLOSE_HOURS: 48,
  
  // Intervalo de verificación de ofertas expiradas (en minutos)
  EXPIRY_CHECK_INTERVAL_MINUTES: 5,
  
  // Porcentaje mínimo de oferta respecto al valor base del jugador
  MIN_OFFER_PERCENTAGE: 0.7,
  
  // Porcentaje máximo de oferta respecto al valor base del jugador
  MAX_OFFER_PERCENTAGE: 1.5,
  
  // Tamaño mínimo de plantilla para permitir transferencias
  MIN_SQUAD_SIZE: 18,
  
  // Estados válidos para ofertas
  VALID_OFFER_STATUSES: ['pending', 'accepted', 'rejected', 'expired'] as const,
  
  // Estados válidos para transferencias
  VALID_TRANSFER_STATUSES: ['pending', 'completed', 'cancelled'] as const,
} as const;

export type OfferStatus = typeof MARKET_CONFIG.VALID_OFFER_STATUSES[number];
export type TransferStatus = typeof MARKET_CONFIG.VALID_TRANSFER_STATUSES[number];

// Función helper para calcular fecha de vencimiento
export const calculateExpiryDate = (hours: number = MARKET_CONFIG.DEFAULT_OFFER_EXPIRY_HOURS): string => {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
};

// Función helper para verificar si una fecha ha expirado
export const isExpired = (date: string): boolean => {
  return new Date() > new Date(date);
};

// Función helper para obtener tiempo restante en formato legible
export const getTimeRemaining = (expiryDate: string): string => {
  const now = new Date().getTime();
  const expiry = new Date(expiryDate).getTime();
  const difference = expiry - now;

  if (difference <= 0) return 'Expirada';

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

