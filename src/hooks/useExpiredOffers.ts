import { useEffect, useRef } from 'react';
import { useDataStore } from '../store/dataStore';
import { checkExpiredOffers } from '../utils/transferService';
import { MARKET_CONFIG } from '../config/marketConfig';

export function useExpiredOffers() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { offers } = useDataStore();

  useEffect(() => {
    // Verificar ofertas expiradas al montar el componente
    checkExpiredOffers();

    // Configurar verificación automática según configuración
    intervalRef.current = setInterval(() => {
      checkExpiredOffers();
    }, MARKET_CONFIG.EXPIRY_CHECK_INTERVAL_MINUTES * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Verificar cuando cambian las ofertas
  useEffect(() => {
    checkExpiredOffers();
  }, [offers]);

  return null;
}
