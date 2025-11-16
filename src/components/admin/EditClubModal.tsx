import { useState } from 'react';
import { X, Camera, Upload, Shield, User, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
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
  };
  currentDtId?: string;
  dtUsers: { id: string; username: string; clubId?: string }[];
  onClose: () => void;
  onSave: (data: {
    name: string;
    logo: string;
    managerUserId?: string;
    budget: number;
    playStyle: string;
    foundedYear?: number;
    stadium?: string;
    primaryColor?: string;
    secondaryColor?: string;
    description?: string;
    reputation?: number;
    fanBase?: number;
  }) => void;
}

const EditClubModal = ({ club, onClose, onSave, currentDtId, dtUsers }: EditClubModalProps) => {
  const [name, setName] = useState(club.name);
  const [logo, setLogo] = useState(club.logo);
  const [managerUserId, setManagerUserId] = useState<string>(currentDtId || '');
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

  // Handle image file selection
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

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (!selectedImage) return;

    setIsUploading(true);
    try {
      const base64Image = await convertImageToBase64(selectedImage);
      setLogo(base64Image);
      setSelectedImage(null);
      setImagePreview(null);
      setImageError(null);
    } catch (error) {
      setImageError('Error al procesar la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  // Clear selected image
  const clearImageSelection = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const n = name.trim();
    if (!n) { setError('Ingresa el nombre'); return; }
    if (logo && !/^https?:\/\/|data:image\/|^\//i.test(logo)) {
      setError('El logo debe ser una URL válida (http/https), una ruta relativa (/...) o una imagen subida');
      return;
    }
    const b = typeof budget === 'string' ? parseInt(budget || '0', 10) : budget;
    if (isNaN(b as number) || (b as number) < 0) { setError('Presupuesto inválido'); return; }

    const fy = typeof foundedYear === 'string' ? parseInt(foundedYear || new Date().getFullYear().toString(), 10) : foundedYear;
    if (isNaN(fy as number) || (fy as number) < 1800 || (fy as number) > new Date().getFullYear()) {
      setError('Año de fundación inválido (1800 - ' + new Date().getFullYear() + ')');
      return;
    }

    const r = typeof reputation === 'string' ? parseInt(reputation || '0', 10) : reputation;
    if (isNaN(r as number) || (r as number) < 0 || (r as number) > 100) { setError('Reputación debe estar entre 0 y 100'); return; }

    const fb = typeof fanBase === 'string' ? parseInt(fanBase || '0', 10) : fanBase;
    if (isNaN(fb as number) || (fb as number) < 0) { setError('Base de aficionados inválida'); return; }

    onSave({
      name: n,
      logo,
      managerUserId: managerUserId || undefined,
      budget: (b as number),
      playStyle,
      foundedYear: (fy as number),
      stadium: stadium.trim() || undefined,
      primaryColor: primaryColor.trim() || undefined,
      secondaryColor: secondaryColor.trim() || undefined,
      description: description.trim() || undefined,
      reputation: (r as number),
      fanBase: (fb as number)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="absolute inset-0 bg-black/80" onClick={onClose}></div>
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-700/50 max-h-[90vh] overflow-y-auto">
        {/* Header con gradiente azul */}
        <div className="relative bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-transparent p-6 border-b border-gray-700/50 sticky top-0 z-10 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Shield size={24} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Editar Club</h3>
                <p className="text-sm text-gray-400">Modifica la información del equipo</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mensaje de error mejorado */}
            {error && (
              <div className="p-4 bg-gradient-to-r from-red-500/20 to-red-600/10 border-l-4 border-red-500 rounded-lg shadow-lg">
                <div className="flex items-start">
                  <AlertTriangle size={20} className="text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="text-red-400 font-semibold mb-1">Error de validación</h5>
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}
            {/* Card de Identificación del Club */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-5 border border-gray-700/50">
              <div className="flex items-center space-x-2 mb-4">
                <Shield size={18} className="text-blue-400" />
                <h4 className="text-lg font-semibold text-white">Identificación del Club</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Logo del Club</label>
                  
                  {/* Logo Display */}
                  <div className="mb-4">
                    <div className="relative mx-auto w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800 shadow-lg">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Club logo preview"
                          className="w-full h-full object-cover"
                        />
                      ) : logo ? (
                        <img
                          src={logo}
                          alt="Club logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-500/20">
                          <Camera size={28} className="text-blue-400" />
                        </div>
                      )}
                      {imagePreview && (
                        <div className="absolute top-1 right-1 bg-red-500 rounded-full p-1 cursor-pointer hover:bg-red-600 transition-colors" onClick={clearImageSelection}>
                          <X size={14} className="text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* File Upload */}
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="club-edit-logo-upload"
                      />
                      <label
                        htmlFor="club-edit-logo-upload"
                        className="btn-outline w-full flex items-center justify-center cursor-pointer hover:bg-blue-500/10 hover:border-blue-500/50 transition-all"
                      >
                        <Camera size={16} className="mr-2" />
                        {selectedImage ? 'Cambiar logo' : 'Seleccionar logo'}
                      </label>
                    </div>

                    {imageError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div className="flex items-start">
                          <AlertTriangle size={16} className="text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                          <p className="text-red-400 text-xs">{imageError}</p>
                        </div>
                      </div>
                    )}

                    {selectedImage && (
                      <div className="space-y-2 p-3 bg-gray-700/30 rounded-lg border border-gray-600/50">
                        <div className="text-xs text-gray-300">
                          <span className="font-semibold">Archivo:</span> {selectedImage.name}
                        </div>
                        <div className="text-xs text-gray-300">
                          <span className="font-semibold">Tamaño:</span> {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                        <button
                          type="button"
                          onClick={handleImageUpload}
                          disabled={isUploading}
                          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        >
                          {isUploading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Subiendo...
                            </>
                          ) : (
                            <>
                              <Upload size={16} className="mr-2" />
                              Subir Logo
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-600/50">
                      <label className="block text-xs font-medium text-gray-400 mb-2">
                        O ingresa URL manualmente
                      </label>
                      <input
                        className="input w-full text-sm"
                        value={logo}
                        onChange={e => setLogo(e.target.value)}
                        placeholder="https://ejemplo.com/logo.jpg"
                      />
                    </div>
                  </div>
                </div>

                {/* Name Section */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <Shield size={16} className="mr-2 text-gray-400" />
                    Nombre del Club
                  </label>
                  <input 
                    className="input w-full" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    placeholder="ej: Real Madrid CF"
                  />
                  <p className="mt-2 text-xs text-gray-500">El nombre identifica al club en la liga</p>
                </div>
              </div>
            </div>

            {/* Card de Gestión y Finanzas */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-5 border border-gray-700/50">
              <div className="flex items-center space-x-2 mb-4">
                <DollarSign size={18} className="text-blue-400" />
                <h4 className="text-lg font-semibold text-white">Gestión y Finanzas</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <User size={16} className="mr-2 text-gray-400" />
                    Director Técnico
                  </label>
                  <select 
                    className="input w-full" 
                    value={managerUserId} 
                    onChange={e => setManagerUserId(e.target.value)}
                  >
                    <option value="">Sin asignar</option>
                    {dtUsers.map(u => (
                      <option key={u.id} value={u.id} disabled={!!u.clubId && u.clubId !== club.id}>
                        {u.username}{u.clubId && u.clubId !== club.id ? ' (ocupado)' : ''}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-xs text-gray-500">Asigna un DT disponible al club</p>
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <DollarSign size={16} className="mr-2 text-gray-400" />
                    Presupuesto
                  </label>
                  <input 
                    type="number" 
                    className="input w-full" 
                    value={budget} 
                    onChange={e => setBudget(e.target.value === '' ? '' : Number(e.target.value))} 
                    min={0}
                    placeholder="1000000"
                  />
                  <p className="mt-1.5 text-xs text-gray-500">Fondos disponibles para fichajes</p>
                </div>
              </div>
            </div>

            {/* Card de Estrategia */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-5 border border-gray-700/50">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp size={18} className="text-blue-400" />
                <h4 className="text-lg font-semibold text-white">Estrategia de Juego</h4>
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                  <TrendingUp size={16} className="mr-2 text-gray-400" />
                  Estilo de Juego
                </label>
                <select 
                  className="input w-full" 
                  value={playStyle} 
                  onChange={e => setPlayStyle(e.target.value)}
                >
                  <option>Equilibrado</option>
                  <option>Posesión</option>
                  <option>Contraataque</option>
                  <option>Presión alta</option>
                  <option>Ofensivo</option>
                  <option>Defensivo</option>
                  <option>Vertical</option>
                  <option>Tiki-Taka</option>
                </select>
                <p className="mt-1.5 text-xs text-gray-500">Define la filosofía táctica del equipo</p>
              </div>
            </div>

            {/* Card de Información del Club */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-5 border border-gray-700/50">
              <div className="flex items-center space-x-2 mb-4">
                <Shield size={18} className="text-blue-400" />
                <h4 className="text-lg font-semibold text-white">Información del Club</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <Shield size={16} className="mr-2 text-gray-400" />
                    Estadio
                  </label>
                  <input
                    className="input w-full"
                    value={stadium}
                    onChange={e => setStadium(e.target.value)}
                    placeholder="ej: Santiago Bernabéu"
                  />
                  <p className="mt-1.5 text-xs text-gray-500">Estadio principal del club</p>
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <TrendingUp size={16} className="mr-2 text-gray-400" />
                    Año de Fundación
                  </label>
                  <input
                    type="number"
                    className="input w-full"
                    value={foundedYear}
                    onChange={e => setFoundedYear(e.target.value === '' ? '' : Number(e.target.value))}
                    min={1800}
                    max={new Date().getFullYear()}
                    placeholder={new Date().getFullYear().toString()}
                  />
                  <p className="mt-1.5 text-xs text-gray-500">Año en que se fundó el club</p>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <User size={16} className="mr-2 text-gray-400" />
                    Descripción
                  </label>
                  <textarea
                    className="input w-full"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Historia y descripción del club..."
                  />
                  <p className="mt-1.5 text-xs text-gray-500">Breve descripción del club y su historia</p>
                </div>
              </div>
            </div>

            {/* Card de Colores e Identidad */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-5 border border-gray-700/50">
              <div className="flex items-center space-x-2 mb-4">
                <Shield size={18} className="text-blue-400" />
                <h4 className="text-lg font-semibold text-white">Colores e Identidad</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <div className="w-4 h-4 rounded mr-2 border border-gray-600" style={{ backgroundColor: primaryColor }}></div>
                    Color Primario
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      className="w-12 h-10 rounded border border-gray-600 bg-gray-700"
                      value={primaryColor}
                      onChange={e => setPrimaryColor(e.target.value)}
                    />
                    <input
                      className="input flex-1"
                      value={primaryColor}
                      onChange={e => setPrimaryColor(e.target.value)}
                      placeholder="#ffffff"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">Color principal del club (hex)</p>
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <div className="w-4 h-4 rounded mr-2 border border-gray-600" style={{ backgroundColor: secondaryColor }}></div>
                    Color Secundario
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      className="w-12 h-10 rounded border border-gray-600 bg-gray-700"
                      value={secondaryColor}
                      onChange={e => setSecondaryColor(e.target.value)}
                    />
                    <input
                      className="input flex-1"
                      value={secondaryColor}
                      onChange={e => setSecondaryColor(e.target.value)}
                      placeholder="#000000"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">Color secundario del club (hex)</p>
                </div>
              </div>
            </div>

            {/* Card de Estadísticas */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-5 border border-gray-700/50">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp size={18} className="text-blue-400" />
                <h4 className="text-lg font-semibold text-white">Estadísticas del Club</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <TrendingUp size={16} className="mr-2 text-gray-400" />
                    Reputación
                  </label>
                  <input
                    type="number"
                    className="input w-full"
                    value={reputation}
                    onChange={e => setReputation(e.target.value === '' ? '' : Number(e.target.value))}
                    min={0}
                    max={100}
                    placeholder="50"
                  />
                  <p className="mt-1.5 text-xs text-gray-500">Nivel de prestigio del club (0-100)</p>
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <User size={16} className="mr-2 text-gray-400" />
                    Base de Aficionados
                  </label>
                  <input
                    type="number"
                    className="input w-full"
                    value={fanBase}
                    onChange={e => setFanBase(e.target.value === '' ? '' : Number(e.target.value))}
                    min={0}
                    placeholder="10000"
                  />
                  <p className="mt-1.5 text-xs text-gray-500">Número de seguidores del club</p>
                </div>
              </div>
            </div>

            {/* Footer mejorado */}
            <div className="flex space-x-3 pt-2">
              <button 
                type="button" 
                className="flex-1 btn-outline hover:bg-gray-700 transition-all" 
                onClick={onClose}
              >
                <X size={16} className="mr-2" />
                Cancelar
              </button>
              <button 
                type="submit" 
                className="flex-1 btn-primary bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/20 transition-all"
              >
                <CheckCircle size={16} className="mr-2" />
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditClubModal;
