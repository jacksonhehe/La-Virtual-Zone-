import React from 'react';

export default function MarketToggleModal({
  next,
  toggling,
  onCancel,
  onConfirm
}: {
  next: boolean;
  toggling: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 duration-200 animate-in fade-in">
      <div className="absolute inset-0 bg-black/70" onClick={() => (!toggling ? onCancel() : null)}></div>
      <div className="relative w-full max-w-lg rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-xl duration-300 animate-in slide-in-from-bottom-4">
        <div className="mb-1 inline-flex items-center rounded-full border border-gray-700 bg-dark px-2 py-1 text-[11px] uppercase tracking-wide text-gray-400">
          Accion sensible
        </div>
        <div className="mb-4 mt-2 flex items-center gap-3">
          <div className={`rounded-full p-2 ${next ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {next ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
          </div>
          <h4 className="text-xl font-bold text-white">{next ? 'Abrir Mercado de Fichajes' : 'Cerrar Mercado de Fichajes'}</h4>
        </div>

        <div className="mb-6 space-y-4">
          <p className="leading-relaxed text-gray-300">
            {next ? (
              <>
                Estas a punto de <span className="font-semibold text-green-400">abrir el mercado de fichajes</span>. Los clubes podran hacer
                ofertas y transferencias de jugadores.
              </>
            ) : (
              <>
                Estas a punto de <span className="font-semibold text-red-400">cerrar el mercado de fichajes</span>. No se podran enviar nuevas
                ofertas y las ofertas existentes conservaran su estado actual hasta gestionarlas manualmente.
              </>
            )}
          </p>

          <div className={`mt-4 rounded-lg border p-3 ${next ? 'border-emerald-500/25 bg-emerald-500/10' : 'border-amber-500/30 bg-amber-500/10'}`}>
            <div className="flex items-center gap-2">
              <svg className={`h-4 w-4 ${next ? 'text-emerald-300' : 'text-amber-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-sm text-gray-300">Esta accion afecta a todos los equipos y no se puede deshacer automaticamente.</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="btn-outline px-4 py-2 text-gray-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onCancel}
            disabled={toggling}
          >
            Cancelar
          </button>
          <button
            className={`rounded-lg border px-4 py-2 font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70 ${
              next ? 'border-green-600 bg-green-600 hover:bg-green-700' : 'border-red-600 bg-red-600/90 hover:bg-red-600'
            }`}
            onClick={onConfirm}
            disabled={toggling}
          >
            {toggling ? (next ? 'Abriendo...' : 'Cerrando...') : next ? 'Abrir Mercado' : 'Cerrar Mercado'}
          </button>
        </div>
      </div>
    </div>
  );
}

