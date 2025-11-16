import { Download, FileWarning, Loader2, Trash2, AlertTriangle, X } from 'lucide-react';
import { panelSurfaceClass } from './helpers';

interface DeleteAccountModalProps {
  deleteConfirmationPhrase: string;
  deleteConfirmationInput: string;
  setDeleteConfirmationInput: (value: string) => void;
  deleteAcknowledged: boolean;
  setDeleteAcknowledged: (value: boolean) => void;
  deleteError: string | null;
  isDeleteActionDisabled: boolean;
  isDeletingAccount: boolean;
  closeDeleteModal: () => void;
  handleDeleteAccount: () => Promise<void>;
  downloadUserData: () => Promise<void> | void;
}

const DeleteAccountModal = ({
  deleteConfirmationPhrase,
  deleteConfirmationInput,
  setDeleteConfirmationInput,
  deleteAcknowledged,
  setDeleteAcknowledged,
  deleteError,
  isDeleteActionDisabled,
  isDeletingAccount,
  closeDeleteModal,
  handleDeleteAccount,
  downloadUserData
}: DeleteAccountModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div className={`relative ${panelSurfaceClass} w-full max-w-lg overflow-hidden border-red-500/35`}>
      <div className="relative bg-gradient-to-r from-red-500/22 via-red-500/12 to-red-500/22 p-5 border-b border-red-500/35">
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/25 rounded-lg">
              <AlertTriangle size={22} className="text-red-200" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-red-200">Eliminar cuenta</h3>
              <p className="text-xs sm:text-sm text-gray-200">Esta acción es irreversible.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeDeleteModal}
            disabled={isDeletingAccount}
            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        <p className="text-gray-200 text-sm leading-relaxed">
          Esta acción eliminará de forma permanente tu cuenta, tu progreso y todo el contenido asociado.
          <span className="text-white font-semibold"> No podrás deshacer este cambio ni recuperar los datos.</span>
        </p>

        <div className="bg-red-500/10 border-2 border-red-500/35 rounded-xl p-5 space-y-3">
          <div className="flex items-center text-sm font-semibold text-red-100">
            <FileWarning size={18} className="mr-2" />
            <span>Perderás el acceso a:</span>
          </div>
          <ul className="text-sm text-red-50/90 list-disc pl-6 space-y-1.5">
            <li>Historial de compras, logros y estadísticas.</li>
            <li>Clubes, equipos o comunidades asociadas a tu usuario.</li>
            <li>Acceso a LVZ con este correo (hasta crear una nueva cuenta).</li>
          </ul>
        </div>

        <div className="bg-yellow-500/10 border-2 border-yellow-500/35 rounded-xl p-5">
          <div className="flex items-start gap-3 text-sm text-yellow-100 mb-3">
            <FileWarning size={18} className="mt-0.5 text-yellow-200" />
            <span className="font-semibold">Se recomienda descargar una copia de tus datos antes de continuar.</span>
          </div>
          <button
            type="button"
            onClick={downloadUserData}
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors text-xs sm:text-sm font-semibold bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-lg border border-primary/35"
          >
            <Download size={16} className="mr-2" />
            Descargar mis datos
          </button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            Escribe <span className="text-white font-bold">{deleteConfirmationPhrase}</span> para confirmar.
          </label>
          <input
            type="text"
            value={deleteConfirmationInput}
            placeholder={deleteConfirmationPhrase}
            onChange={(e) => setDeleteConfirmationInput(e.target.value)}
            className="w-full px-4 py-3 bg-dark border-2 border-gray-700 rounded-xl text-white focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/25 transition-all text-sm"
          />
        </div>

        <label className="flex items-start gap-3 p-4 bg-dark/60 rounded-xl border border-gray-700/60 hover:border-red-500/35 transition-colors cursor-pointer">
          <input
            type="checkbox"
            checked={deleteAcknowledged}
            onChange={(e) => setDeleteAcknowledged(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-600 bg-dark text-red-500 focus:ring-red-500 focus:ring-2"
          />
          <span className="text-xs sm:text-sm text-gray-200">
            Confirmo que entiendo las consecuencias y acepto que todos mis datos serán eliminados de forma permanente.
          </span>
        </label>

        {deleteError && (
          <div className="p-4 bg-red-500/10 border-l-4 border-red-500 rounded-xl">
            <p className="text-red-300 text-sm font-medium">{deleteError}</p>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={closeDeleteModal}
            disabled={isDeletingAccount}
            className="flex-1 border-2 border-gray-700 hover:bg-gray-700/60 text-gray-200 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={isDeleteActionDisabled}
            className="flex-1 inline-flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-red-500/40 transform hover:scale-[1.03] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
          >
            {isDeletingAccount ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 size={18} className="mr-2" />
                Eliminar cuenta
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default DeleteAccountModal;
