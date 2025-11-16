import { Camera, Download, Settings, Shield, Trash2, User } from 'lucide-react';
import { panelSurfaceClass } from './helpers';
import { FormEvent } from 'react';

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface SettingsTabProps {
  user: any;
  imagePreview: string | null;
  selectedImage: File | null;
  imageError: string | null;
  openFilePicker: () => void;
  handleImageUpload: () => Promise<void>;
  clearImageSelection: () => void;
  passwordForm: PasswordForm;
  setPasswordForm: React.Dispatch<React.SetStateAction<PasswordForm>>;
  passwordError: string | null;
  handlePasswordChange: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  downloadUserData: () => Promise<void> | void;
  setShowDeleteConfirm: (show: boolean) => void;
}

const SettingsTab = ({
  user,
  imagePreview,
  selectedImage,
  imageError,
  openFilePicker,
  handleImageUpload,
  clearImageSelection,
  passwordForm,
  setPasswordForm,
  passwordError,
  handlePasswordChange,
  downloadUserData,
  setShowDeleteConfirm
}: SettingsTabProps) => (
  <div className="space-y-6">
    <div className={`${panelSurfaceClass} p-6`}>
      <div className="flex items-center gap-4 mb-6">
        <Settings size={24} className="text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-white">Configuración</h2>
          <p className="text-gray-400 text-sm">Ajustes de cuenta, seguridad y datos personales.</p>
        </div>
      </div>

    <div className={`${panelSurfaceClass} p-6`}>
      <div className="flex items-center mb-6 gap-3">
        <Camera size={20} className="text-primary" />
        <div>
          <h3 className="text-xl font-bold text-white">Avatar</h3>
          <p className="text-gray-400 text-sm">Cambia tu foto de perfil para destacar en la comunidad.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="relative">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Avatar preview"
              className="w-20 h-20 rounded-full border-2 border-gray-600 object-cover"
            />
          ) : user.avatar ? (
            <img
              src={user.avatar}
              alt={`Avatar de ${user.username}`}
              className="w-20 h-20 rounded-full border-2 border-gray-600 object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full border-2 border-gray-600 bg-gray-700 flex items-center justify-center">
              <User size={32} className="text-gray-400" />
            </div>
          )}
          <button
            type="button"
            onClick={openFilePicker}
            className="absolute bottom-0 right-0 p-1.5 bg-primary rounded-full hover:bg-primary-light transition-colors border border-gray-600"
          >
            <Camera size={12} className="text-white" />
          </button>
        </div>
        <div className="flex-1">
          <button
            type="button"
            onClick={openFilePicker}
            className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            Cambiar Avatar
          </button>
          {selectedImage && (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleImageUpload}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={clearImageSelection}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}
          {imageError && <p className="text-red-400 text-sm mt-2">{imageError}</p>}
        </div>
      </div>
    </div>

    <div className={`${panelSurfaceClass} p-6`}>
      <div className="flex items-center mb-6 gap-3">
        <Shield size={20} className="text-primary" />
        <div>
          <h3 className="text-xl font-bold text-white">Cambiar contraseña</h3>
          <p className="text-gray-400 text-sm">Refuerza la seguridad de tu cuenta.</p>
        </div>
      </div>

      <form onSubmit={handlePasswordChange} className="space-y-4">
        {passwordError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{passwordError}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Contraseña actual</label>
          <input
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
            className="w-full px-4 py-3 bg-dark border-2 border-gray-700 rounded-xl text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all text-sm"
            placeholder="Ingresa tu contraseña actual"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Nueva contraseña</label>
          <input
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
            className="w-full px-4 py-3 bg-dark border-2 border-gray-700 rounded-xl text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all text-sm"
            placeholder="Mínimo 6 caracteres"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Confirmar nueva contraseña</label>
          <input
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            className="w-full px-4 py-3 bg-dark border-2 border-gray-700 rounded-xl text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all text-sm"
            placeholder="Repite la nueva contraseña"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary-light text-white px-4 py-3 rounded-lg font-medium text-sm transition-colors"
        >
          Cambiar contraseña
        </button>
      </form>
    </div>

    <div className={`${panelSurfaceClass} p-6`}>
      <div className="flex items-center mb-6 gap-3">
        <User size={20} className="text-primary" />
        <div>
          <h3 className="text-xl font-bold text-white">Cuenta</h3>
          <p className="text-gray-400 text-sm">Descarga tus datos o elimina tu cuenta.</p>
        </div>
      </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div>
            <p className="text-white font-medium text-sm">Descargar mis datos</p>
            <p className="text-gray-400 text-xs">Obtén una copia de toda tu información</p>
          </div>
          <button
            type="button"
            onClick={downloadUserData}
            className="bg-secondary hover:bg-secondary-light text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center"
          >
            <Download size={14} className="mr-2" />
            Descargar
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/30">
          <div>
            <p className="text-red-300 font-medium text-sm">Eliminar cuenta</p>
            <p className="text-gray-400 text-xs">Esta acción es permanente</p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center"
          >
            <Trash2 size={14} className="mr-2" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default SettingsTab;
