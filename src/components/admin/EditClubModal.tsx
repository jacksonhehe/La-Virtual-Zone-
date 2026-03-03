import { useState } from 'react';
import { X, Camera, Upload, Shield, User, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { convertImageToBase64, validateImageFile } from '../../utils/helpers';

interface EditClubModalProps {
  club: {
    id: string;
    name: string;
    logo: string;
    manager: string;
    budget: number;
    playStyle: string;
    foundedYear?: number;
    stadium?: string;
    primaryColor?: string;
    secondaryColor?: string;
    description?: string;
    reputation?: number;
    fanBase?: number;
    captainPlayerId?: string;
  };
  currentDtId?: string;
  dtUsers: { id: string; username: string; clubId?: string }[];
  players: { id: string; name: string; clubId: string }[];
  onClose: () => void;
  onSave: (data: {
    name: string;
    logo: string;
    managerUserId?: string;
    captainPlayerId?: string;
    budget: number;
    playStyle: string;
    foundedYear?: number;
    stadium?: string;
    primaryColor?: string;
    secondaryColor?: string;
    description?: string;
    reputation?: number;
    fanBase?: number;
  }) => Promise<void> | void;
}

const EditClubModal = ({ club, onClose, onSave, currentDtId, dtUsers, players }: EditClubModalProps) => {
  const [name, setName] = useState(club.name);
  const [logo, setLogo] = useState(club.logo || '');
  const [managerUserId, setManagerUserId] = useState<string>(currentDtId || '');
  const [captainPlayerId, setCaptainPlayerId] = useState<string>(club.captainPlayerId || '');
  const [budget, setBudget] = useState<number | ''>(club.budget ?? 0);
  const [playStyle, setPlayStyle] = useState(club.playStyle || 'Equilibrado');
  const [foundedYear, setFoundedYear] = useState<number | ''>(club.foundedYear ?? new Date().getFullYear());
  const [stadium, setStadium] = useState(club.stadium || '');
  const [primaryColor, setPrimaryColor] = useState(club.primaryColor || '#ffffff');
  const [secondaryColor, setSecondaryColor] = useState(club.secondaryColor || '#000000');
  const [description, setDescription] = useState(club.description || '');
  const [reputation, setReputation] = useState<number | ''>(club.reputation ?? 0);
  const [fanBase, setFanBase] = useState<number | ''>(club.fanBase ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const clubPlayers = players.filter((player) => player.clubId === club.id);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      setImageError(validationError);
      return;
    }
    setImageError(null);
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;
    setIsUploading(true);
    try {
      const base64Image = await convertImageToBase64(selectedImage);
      setLogo(base64Image);
      setSelectedImage(null);
      setImagePreview(null);
      setImageError(null);
    } catch (err) {
      setImageError('Error al procesar la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const clearImageSelection = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);
    const n = name.trim();
    if (!n) { setError('Ingresa el nombre'); return; }
    if (logo && !/^(https?:\/\/|data:image\/|\/)/i.test(logo)) {
      setError('El logo debe ser una URL http/https, ruta relativa o imagen subida');
      return;
    }
    const b = typeof budget === 'string' ? parseInt(budget || '0', 10) : budget;
    if (isNaN(b as number) || (b as number) < 0) { setError('Presupuesto invalido'); return; }
    const fy = typeof foundedYear === 'string' ? parseInt(foundedYear || new Date().getFullYear().toString(), 10) : foundedYear;
    if (isNaN(fy as number) || (fy as number) < 1800 || (fy as number) > new Date().getFullYear()) {
      setError(`Ano de fundacion invalido (1800 - ${new Date().getFullYear()})`);
      return;
    }
    const r = typeof reputation === 'string' ? parseInt(reputation || '0', 10) : reputation;
    if (isNaN(r as number) || (r as number) < 0 || (r as number) > 100) { setError('Reputacion debe estar entre 0 y 100'); return; }
    const fb = typeof fanBase === 'string' ? parseInt(fanBase || '0', 10) : fanBase;
    if (isNaN(fb as number) || (fb as number) < 0) { setError('Base de aficionados invalida'); return; }

    setIsSubmitting(true);
    try {
      await onSave({
        name: n,
        logo: logo || '',
        managerUserId: managerUserId || undefined,
        captainPlayerId: captainPlayerId || undefined,
        budget: b as number,
        playStyle,
        foundedYear: fy as number,
        stadium: stadium.trim() || undefined,
        primaryColor: primaryColor.trim() || undefined,
        secondaryColor: secondaryColor.trim() || undefined,
        description: description.trim() || undefined,
        reputation: r as number,
        fanBase: fb as number
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'No se pudo guardar el club');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
      <div className="absolute inset-0" onClick={() => (!isSubmitting ? onClose() : null)}></div>
      <div className="relative bg-dark-light rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-700 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-gray-900">
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-primary" />
            <div>
              <h3 className="text-xl font-bold text-white">Editar club</h3>
              <p className="text-sm text-gray-400">Actualiza los datos del club</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-gray-800"
            aria-label="Cerrar"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-900">
          {error && (
            <div className="p-4 bg-gray-800 border border-red-500/50 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle size={18} className="text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-red-300 font-semibold mb-1">Error de validacion</h5>
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-900/80 rounded-lg p-5 border border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <Shield size={18} className="text-primary" />
                <h4 className="text-lg font-semibold text-white">Identidad del club</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Logo</label>
                  <div className="mb-4">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-800 border border-gray-700 mx-auto">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Club logo preview" className="w-full h-full object-cover" />
                      ) : logo ? (
                        <img src={logo} alt="Club logo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">Sin logo</div>
                      )}
                      {imagePreview && (
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 rounded-full p-1"
                          onClick={clearImageSelection}
                        >
                          <X size={12} className="text-white" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="edit-club-logo-upload"
                      />
                      <label htmlFor="edit-club-logo-upload" className="btn-outline w-full flex items-center justify-center cursor-pointer">
                        <Camera size={16} className="mr-2" />
                        {selectedImage ? 'Cambiar logo' : 'Seleccionar logo'}
                      </label>
                    </div>
                    {imageError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 flex items-start">
                        <AlertTriangle size={14} className="mr-2 mt-0.5" />
                        <span>{imageError}</span>
                      </div>
                    )}
                    {selectedImage && (
                      <div className="space-y-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                        <div className="text-xs text-gray-300">
                          <span className="font-semibold">Archivo:</span> {selectedImage.name}
                        </div>
                        <div className="text-xs text-gray-300">
                          <span className="font-semibold">Tamano:</span> {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                        <button
                          type="button"
                          onClick={handleImageUpload}
                          disabled={isUploading}
                          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUploading ? (
                            <span className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Subiendo...
                            </span>
                          ) : (
                            <>
                              <Upload size={16} className="mr-2" />
                              Subir logo
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    <div className="pt-3 border-t border-gray-700">
                      <label className="block text-xs font-medium text-gray-400 mb-2">O ingresa URL</label>
                      <input
                        className="input w-full text-sm"
                        value={logo}
                        onChange={e => setLogo(e.target.value)}
                        placeholder="https://ejemplo.com/logo.jpg"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                      <Shield size={14} className="mr-2 text-gray-400" />
                      Nombre del club
                    </label>
                    <input
                      className="input w-full"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="ej: Real Madrid CF"
                    />
                  </div>
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                      <User size={14} className="mr-2 text-gray-400" />
                      Director tecnico
                    </label>
                    <select
                      className="input w-full"
                      value={managerUserId}
                      onChange={e => setManagerUserId(e.target.value)}
                      disabled={isSubmitting}
                    >
                      <option value="">Sin asignar</option>
                      {dtUsers.map(dt => (
                        <option key={dt.id} value={dt.id} disabled={dt.clubId && dt.clubId !== club.id}>
                          {dt.username}{dt.clubId && dt.clubId !== club.id ? ' (ocupado)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                      <Shield size={14} className="mr-2 text-gray-400" />
                      Capitan del equipo
                    </label>
                    <select
                      className="input w-full"
                      value={captainPlayerId}
                      onChange={e => setCaptainPlayerId(e.target.value)}
                      disabled={isSubmitting}
                    >
                      <option value="">Sin asignar</option>
                      {clubPlayers.map(player => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                        <DollarSign size={14} className="mr-2 text-gray-400" />
                        Presupuesto
                      </label>
                      <input
                        type="number"
                        className="input w-full"
                        value={budget}
                        onChange={e => setBudget(e.target.value === '' ? '' : Number(e.target.value))}
                        min={0}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                        <TrendingUp size={14} className="mr-2 text-gray-400" />
                        Estilo de juego
                      </label>
                      <input
                        className="input w-full"
                        value={playStyle}
                        onChange={e => setPlayStyle(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/80 rounded-lg p-5 border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Ano de fundacion</label>
                  <input
                    type="number"
                    className="input w-full"
                    value={foundedYear}
                    onChange={e => setFoundedYear(e.target.value === '' ? '' : Number(e.target.value))}
                    min={1800}
                    max={new Date().getFullYear()}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Estadio</label>
                  <input
                    className="input w-full"
                    value={stadium}
                    onChange={e => setStadium(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Nombre del estadio"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Color primario</label>
                  <input
                    type="color"
                    className="w-full h-10 rounded border border-gray-700 bg-gray-800"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Color secundario</label>
                  <input
                    type="color"
                    className="w-full h-10 rounded border border-gray-700 bg-gray-800"
                    value={secondaryColor}
                    onChange={e => setSecondaryColor(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-900/80 rounded-lg p-5 border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Descripcion</label>
                  <textarea
                    className="input w-full h-24"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Resumen del club"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Reputacion (0-100)</label>
                    <input
                      type="number"
                      className="input w-full"
                      value={reputation}
                      onChange={e => setReputation(e.target.value === '' ? '' : Number(e.target.value))}
                      min={0}
                      max={100}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Aficionados</label>
                    <input
                      type="number"
                      className="input w-full"
                      value={fanBase}
                      onChange={e => setFanBase(e.target.value === '' ? '' : Number(e.target.value))}
                      min={0}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <button
                type="button"
                className="btn-outline flex-1 sm:flex-none"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </span>
                ) : (
                  'Guardar cambios'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditClubModal;

