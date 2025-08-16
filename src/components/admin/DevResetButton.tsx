import { useState } from 'react';
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function DevResetButton() {
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const { user } = useAuthStore();

  // Solo mostrar para admins o en modo desarrollo
  const isDev = process.env.NODE_ENV === 'development' || user?.role === 'admin';
  if (!isDev) return null;

  const handleReset = async () => {
    setIsResetting(true);
    setShowConfirm(false);

    try {
      // Limpiar localStorage
      localStorage.clear();
      
      // Limpiar sessionStorage
      sessionStorage.clear();
      
      // Limpiar stores de Zustand
      useAuthStore.getState().logout();
      
      // Pequeña pausa para mostrar el estado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setResetComplete(true);
      
      // Recargar la página después de 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error durante el reset:', error);
      setIsResetting(false);
    }
  };

  if (resetComplete) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle size={20} />
          <span>Datos reiniciados. Recargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={isResetting}
          className={`
            bg-red-600 hover:bg-red-700 disabled:bg-gray-600 
            text-white px-4 py-3 rounded-lg shadow-lg 
            flex items-center gap-2 transition-all duration-200
            ${isResetting ? 'cursor-not-allowed' : 'hover:scale-105'}
          `}
          title="Reiniciar todos los datos (solo desarrollo)"
        >
          <RefreshCw size={20} className={isResetting ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Reset Dev</span>
        </button>
      ) : (
        <div className="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg max-w-xs">
          <div className="flex items-start gap-2 mb-3">
            <AlertTriangle size={20} className="text-yellow-300 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">¿Reiniciar datos?</h4>
              <p className="text-xs text-red-100 mt-1">
                Esto eliminará TODOS los datos locales y recargará la página.
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              disabled={isResetting}
              className={`
                bg-red-700 hover:bg-red-800 disabled:bg-gray-600 
                text-white px-3 py-1.5 rounded text-sm font-medium
                transition-colors duration-200
              `}
            >
              {isResetting ? 'Reiniciando...' : 'Sí, reiniciar'}
            </button>
            
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isResetting}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors duration-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

