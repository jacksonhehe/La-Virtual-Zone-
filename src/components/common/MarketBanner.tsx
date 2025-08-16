import { useState, useEffect } from 'react';
import { Clock, Lock, Unlock, AlertTriangle } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';

interface MarketBannerProps {
  showCountdown?: boolean;
  className?: string;
}

export default function MarketBanner({ showCountdown = true, className = '' }: MarketBannerProps) {
  const { marketStatus } = useDataStore();
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  // Simular fecha de cierre del mercado (configurable desde admin)
  // En una implementación real, esto vendría del store o API
  const marketCloseDate = localStorage.getItem('vz_market_close_date');
  
  useEffect(() => {
    if (!showCountdown || !marketCloseDate) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const closeTime = new Date(marketCloseDate).getTime();
      const difference = closeTime - now;

      if (difference <= 0) {
        setTimeLeft('Mercado cerrado');
        setIsExpired(true);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      let timeString = '';
      if (days > 0) {
        timeString = `${days}d ${hours}h ${minutes}m`;
      } else if (hours > 0) {
        timeString = `${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        timeString = `${minutes}m ${seconds}s`;
      } else {
        timeString = `${seconds}s`;
      }

      setTimeLeft(timeString);
      setIsExpired(false);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [showCountdown, marketCloseDate]);

  if (!marketStatus && !showCountdown) return null;

  return (
    <div className={`w-full ${className}`}>
      <div className={`
        relative overflow-hidden rounded-xl border-2 transition-all duration-300
        ${marketStatus 
          ? 'border-green-500/50 bg-green-500/10 text-green-400' 
          : 'border-red-500/50 bg-red-500/10 text-red-400'
        }
      `}>
        {/* Fondo con patrón sutil */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-current to-transparent animate-pulse"></div>
        </div>

        <div className="relative p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {marketStatus ? (
                <Unlock size={20} className="text-green-400" />
              ) : (
                <Lock size={20} className="text-red-400" />
              )}
              
              <div>
                <h3 className="font-semibold text-lg">
                  Mercado de Fichajes: {marketStatus ? 'ABIERTO' : 'CERRADO'}
                </h3>
                <p className="text-sm opacity-80">
                  {marketStatus 
                    ? 'Puedes realizar ofertas y transferencias'
                    : 'Las transferencias están suspendidas temporalmente'
                  }
                </p>
              </div>
            </div>

            {/* Contador de cierre */}
            {showCountdown && marketCloseDate && marketStatus && (
              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} />
                <span>Cierra en: <span className="font-mono font-bold">{timeLeft}</span></span>
              </div>
            )}

            {/* Estado expirado */}
            {showCountdown && marketCloseDate && isExpired && (
              <div className="flex items-center gap-2 text-sm text-yellow-400">
                <AlertTriangle size={16} />
                <span>Mercado cerrado automáticamente</span>
              </div>
            )}
          </div>

          {/* Barra de progreso del tiempo (solo si hay fecha de cierre) */}
          {showCountdown && marketCloseDate && marketStatus && !isExpired && (
            <div className="mt-3">
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-green-400 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.max(0, Math.min(100, 
                      ((new Date().getTime() - new Date(marketCloseDate).getTime() + 48 * 60 * 60 * 1000) / (48 * 60 * 60 * 1000)) * 100
                    ))}%`
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Indicador de estado en la esquina */}
        <div className={`
          absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] 
          ${marketStatus ? 'border-t-green-500' : 'border-t-red-500'}
        `}></div>
      </div>

      {/* Mensaje de bloqueo cuando está cerrado */}
      {!marketStatus && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <Lock size={16} />
            <span>
              <strong>Acciones bloqueadas:</strong> No puedes realizar ofertas ni transferencias mientras el mercado esté cerrado.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

