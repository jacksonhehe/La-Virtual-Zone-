import { useState } from 'react';
import { X, Trophy, Calendar, Users, FileText, Image, CheckCircle, AlertTriangle, Upload } from 'lucide-react';

type TType = 'league' | 'cup' | 'friendly';

interface NewTournamentModalProps {
  onClose: () => void;
  onCreate: (data: { name: string; type: TType; startDate: string; endDate: string; rounds: number; teams: string[]; logo?: string; description?: string; status?: 'upcoming'|'active'|'finished' }) => void;
  clubs: { id: string; name: string }[];
}

const NewTournamentModal = ({ onClose, onCreate, clubs }: NewTournamentModalProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<TType>('league');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rounds, setRounds] = useState<number>(1);
  const [logo, setLogo] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [teams, setTeams] = useState<string[]>(clubs.map(c => c.name));
  const [status, setStatus] = useState<'upcoming'|'active'|'finished'>('upcoming');
  const [error, setError] = useState<string | null>(null);

  // Dimensiones recomendadas para logo de torneo
  const RECOMMENDED_LOGO_SIZE = { width: 512, height: 512 };

  const handleLogoFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setLogoError('El archivo debe ser una imagen');
      return;
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setLogoError('La imagen no puede ser mayor a 2MB');
      return;
    }

    setLogoError(null);
    setLogoFile(file);
    setLogo(''); // Limpiar URL si hay archivo

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setLogo(base64);
        setLogoFile(null);
        setLogoPreview(null);
        setLogoError(null);
      };
      reader.readAsDataURL(logoFile);
    } catch (error) {
      setLogoError('Error al procesar la imagen');
    }
  };

  const clearLogoSelection = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoError(null);
  };

  const toggleTeam = (team: string, checked: boolean) => {
    setTeams((prev) => (checked ? Array.from(new Set([...prev, team])) : prev.filter((t) => t !== team)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !startDate || !endDate) {
      setError('Completa nombre y fechas');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('La fecha de inicio no puede ser mayor que la de fin');
      return;
    }
    if (teams.length < 2) {
      setError('Selecciona al menos 2 equipos');
      return;
    }
    // Si hay un archivo seleccionado pero no se ha convertido a base64, hacerlo ahora
    if (logoFile && !logo) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const finalLogo = e.target?.result as string;
        onCreate({ name: name.trim(), type, startDate, endDate, rounds: Number(rounds) || 1, teams, logo: finalLogo || undefined, description: description || undefined, status });
      };
      reader.readAsDataURL(logoFile);
      return;
    }
    onCreate({ name: name.trim(), type, startDate, endDate, rounds: Number(rounds) || 1, teams, logo: logo || undefined, description: description || undefined, status });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="absolute inset-0 bg-black/80" onClick={onClose}></div>
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-700/50 max-h-[90vh] overflow-y-auto">
        {/* Header con gradiente morado */}
        <div className="relative bg-gradient-to-r from-purple-600/20 via-purple-500/10 to-transparent p-6 border-b border-gray-700/50 sticky top-0 z-10 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Trophy size={24} className="text-purple-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Nuevo Torneo</h3>
                <p className="text-sm text-gray-400">Crea una nueva competición</p>
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

            {/* Card de Información Básica */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-5 border border-gray-700/50">
              <div className="flex items-center space-x-2 mb-4">
                <Trophy size={18} className="text-purple-400" />
                <h4 className="text-lg font-semibold text-white">Información Básica</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <Trophy size={16} className="mr-2 text-gray-400" />
                    Nombre del Torneo
                  </label>
                  <input 
                    className="input w-full" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ej: Liga Master 2024"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <FileText size={16} className="mr-2 text-gray-400" />
                    Tipo de Competición
                  </label>
                  <select 
                    className="input w-full" 
                    value={type} 
                    onChange={(e) => setType(e.target.value as TType)}
                  >
                    <option value="league">Liga</option>
                    <option value="cup">Copa</option>
                    <option value="friendly">Amistoso</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <CheckCircle size={16} className="mr-2 text-gray-400" />
                    Estado
                  </label>
                  <select 
                    className="input w-full" 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value as any)}
                  >
                    <option value="upcoming">Próximo</option>
                    <option value="active">Activo</option>
                    <option value="finished">Finalizado</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <Image size={16} className="mr-2 text-gray-400" />
                    Logo del Torneo
                  </label>
                  
                  {/* Información de dimensiones recomendadas */}
                  <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-xs text-blue-300 font-medium mb-1">
                      📐 Dimensiones recomendadas: <span className="font-bold">{RECOMMENDED_LOGO_SIZE.width} x {RECOMMENDED_LOGO_SIZE.height} px</span>
                    </p>
                    <p className="text-xs text-blue-400">Formato: PNG, JPG o SVG • Tamaño máximo: 2MB</p>
                  </div>

                  {/* Opción de subir archivo */}
                  <div className="mb-3">
                    <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-primary/50 transition-colors group">
                      <div className="flex flex-col items-center">
                        <Upload size={24} className="text-gray-400 group-hover:text-primary mb-2" />
                        <span className="text-sm text-gray-400 group-hover:text-gray-300">
                          {logoFile ? logoFile.name : 'Haz clic para subir una imagen'}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">o arrastra y suelta</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Preview de imagen */}
                  {(logoPreview || logo) && (
                    <div className="mb-3 relative">
                      <div className="relative inline-block">
                        <img 
                          src={logoPreview || logo} 
                          alt="Logo preview" 
                          className="max-w-full h-32 object-contain rounded-lg border border-gray-600"
                        />
                        {logoFile && (
                          <button
                            type="button"
                            onClick={clearLogoSelection}
                            className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full text-white"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                      {logoFile && (
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={handleLogoUpload}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg"
                          >
                            Usar esta imagen
                          </button>
                          <button
                            type="button"
                            onClick={clearLogoSelection}
                            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Opción de URL (alternativa) */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-gray-800 px-2 text-gray-500">O ingresa una URL</span>
                    </div>
                  </div>
                  <input 
                    className="input w-full mt-3" 
                    value={logo && !logoPreview ? logo : ''} 
                    onChange={(e) => {
                      setLogo(e.target.value);
                      setLogoFile(null);
                      setLogoPreview(null);
                    }}
                    placeholder="https://ejemplo.com/logo.jpg"
                    disabled={!!logoFile}
                  />

                  {logoError && (
                    <p className="text-red-400 text-xs mt-2">{logoError}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <FileText size={16} className="mr-2 text-gray-400" />
                    Descripción
                  </label>
                  <input 
                    className="input w-full" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Breve descripción del torneo"
                  />
                </div>
              </div>
            </div>

            {/* Card de Calendario */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-5 border border-gray-700/50">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar size={18} className="text-purple-400" />
                <h4 className="text-lg font-semibold text-white">Calendario y Rondas</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <Calendar size={16} className="mr-2 text-gray-400" />
                    Fecha de Inicio
                  </label>
                  <input 
                    type="date" 
                    className="input w-full" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <Calendar size={16} className="mr-2 text-gray-400" />
                    Fecha de Fin
                  </label>
                  <input 
                    type="date" 
                    className="input w-full" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <FileText size={16} className="mr-2 text-gray-400" />
                    Número de Rondas
                  </label>
                  <input 
                    type="number" 
                    className="input w-full" 
                    min={1} 
                    value={rounds} 
                    onChange={(e) => setRounds(Number(e.target.value))} 
                  />
                </div>
              </div>
            </div>

            {/* Card de Equipos Participantes */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-5 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Users size={18} className="text-purple-400" />
                  <h4 className="text-lg font-semibold text-white">Equipos Participantes</h4>
                </div>
                <span className="text-sm text-gray-400">
                  {teams.length} seleccionados
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-3 bg-gray-700/20 rounded-lg border border-gray-600/30">
                {clubs.map((c) => (
                  <label 
                    key={c.id} 
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${
                      teams.includes(c.name)
                        ? 'bg-purple-500/10 border-purple-500/50 hover:bg-purple-500/20'
                        : 'bg-gray-700/30 border-gray-600/50 hover:bg-gray-700/50'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-purple-500 bg-gray-600 border-gray-500 rounded focus:ring-purple-500 focus:ring-2" 
                      checked={teams.includes(c.name)} 
                      onChange={(e) => toggleTeam(c.name, e.target.checked)} 
                    />
                    <span className="text-sm text-white">{c.name}</span>
                  </label>
                ))}
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
                className="flex-1 btn-primary bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/20 transition-all"
              >
                <Trophy size={16} className="mr-2" />
                Crear Torneo
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewTournamentModal;

