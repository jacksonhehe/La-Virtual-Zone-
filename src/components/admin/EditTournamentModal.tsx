import { useState } from 'react';
import { X, Trophy, Calendar, Users, FileText, Image, CheckCircle, AlertTriangle, Upload } from 'lucide-react';
import { Tournament } from '../../types';

type TType = 'league' | 'cup' | 'friendly';

interface EditTournamentModalProps {
  tournament: Tournament;
  clubs: { id: string; name: string }[];
  onClose: () => void;
  onSave: (t: Tournament) => void;
}

const RECOMMENDED_LOGO_SIZE = { width: 512, height: 512 };

const EditTournamentModal = ({ tournament, clubs, onClose, onSave }: EditTournamentModalProps) => {
  const [name, setName] = useState(tournament.name);
  const [type, setType] = useState<TType>(tournament.type);
  const [startDate, setStartDate] = useState<string>(new Date(tournament.startDate).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState<string>(new Date(tournament.endDate).toISOString().slice(0, 10));
  const [rounds, setRounds] = useState<number>(tournament.rounds);
  const [logo, setLogo] = useState<string>(tournament.logo);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [description, setDescription] = useState<string>(tournament.description);
  const [teams, setTeams] = useState<string[]>(tournament.teams);
  const [status, setStatus] = useState<'upcoming' | 'active' | 'finished'>(tournament.status);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleLogoFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLogoError('El archivo debe ser una imagen');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setLogoError('La imagen no puede ser mayor a 2MB');
      return;
    }

    setLogoError(null);
    setLogoFile(file);
    setLogo('');

    const reader = new FileReader();
    reader.onload = e => setLogoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;

    try {
      const reader = new FileReader();
      reader.onload = e => {
        const base64 = e.target?.result as string;
        setLogo(base64);
        setLogoFile(null);
        setLogoPreview(null);
        setLogoError(null);
      };
      reader.readAsDataURL(logoFile);
    } catch {
      setLogoError('Error al procesar la imagen');
    }
  };

  const clearLogoSelection = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoError(null);
  };

  const toggleTeam = (team: string, checked: boolean) => {
    setTeams(prev => (checked ? Array.from(new Set([...prev, team])) : prev.filter(t => t !== team)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
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

    setIsSaving(true);
    try {
      const payload: Tournament = {
        ...tournament,
        name: name.trim(),
        type,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        rounds: Number(rounds) || 1,
        logo,
        description,
        teams,
        status
      };

      if (logoFile && !logo) {
        const reader = new FileReader();
        reader.onload = async readerEvent => {
          const finalLogo = readerEvent.target?.result as string;
          await Promise.resolve(onSave({ ...payload, logo: finalLogo }));
          setIsSaving(false);
        };
        reader.readAsDataURL(logoFile);
        return;
      }

      await Promise.resolve(onSave(payload));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
      <div className="absolute inset-0" onClick={() => (!isSaving ? onClose() : null)}></div>
      <div className="relative bg-dark-light rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-700 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-gray-900">
          <div className="flex items-center gap-3">
            <Trophy size={20} className="text-primary" />
            <div>
              <h3 className="text-xl font-bold text-white">Editar torneo</h3>
              <p className="text-sm text-gray-400">Modifica la informacion de la competicion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-gray-800"
            disabled={isSaving}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-900">
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="bg-gray-900/80 rounded-lg p-5 border border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <Trophy size={18} className="text-primary" />
                <h4 className="text-lg font-semibold text-white">Informacion Basica</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <Trophy size={16} className="mr-2 text-gray-400" />
                    Nombre del torneo
                  </label>
                  <input className="input w-full" value={name} onChange={e => setName(e.target.value)} placeholder="ej: Liga Master 2024" />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <FileText size={16} className="mr-2 text-gray-400" />
                    Tipo de competicion
                  </label>
                  <select className="input w-full" value={type} onChange={e => setType(e.target.value as TType)}>
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
                  <select className="input w-full" value={status} onChange={e => setStatus(e.target.value as any)}>
                    <option value="upcoming">Proximo</option>
                    <option value="active">Activo</option>
                    <option value="finished">Finalizado</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <FileText size={16} className="mr-2 text-gray-400" />
                    Descripcion
                  </label>
                  <input
                    className="input w-full"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Breve descripcion del torneo"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-900/80 rounded-lg p-5 border border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar size={18} className="text-primary" />
                <h4 className="text-lg font-semibold text-white">Calendario y jornadas</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <Calendar size={16} className="mr-2 text-gray-400" />
                    Fecha de inicio
                  </label>
                  <input type="date" className="input w-full" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <Calendar size={16} className="mr-2 text-gray-400" />
                    Fecha de fin
                  </label>
                  <input type="date" className="input w-full" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>

                {type === 'cup' ? (
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-300 mb-1">
                      <FileText size={16} className="mr-2 text-gray-400" />
                      Numero de jornadas
                    </label>
                    <p className="text-xs text-gray-500">
                      No aplica para copas: las fases se generan automaticamente segun la cantidad de equipos.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                      <FileText size={16} className="mr-2 text-gray-400" />
                      Numero de jornadas
                    </label>
                    <input
                      type="number"
                      className="input w-full"
                      min={1}
                      value={rounds}
                      onChange={e => setRounds(Number(e.target.value))}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-900/80 rounded-lg p-5 border border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <Image size={18} className="text-primary" />
                <h4 className="text-lg font-semibold text-white">Logo</h4>
              </div>

              <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-blue-200">
                Recomendado: {RECOMMENDED_LOGO_SIZE.width}x{RECOMMENDED_LOGO_SIZE.height}px • Max 2MB • PNG/JPG/SVG
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-primary transition-colors group">
                    <div className="flex flex-col items-center">
                      <Upload size={24} className="text-gray-400 group-hover:text-primary mb-2" />
                      <span className="text-sm text-gray-400 group-hover:text-gray-300">
                        {logoFile ? logoFile.name : 'Haz clic para subir una imagen'}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">o arrastra y suelta</span>
                    </div>
                    <input type="file" accept="image/*" onChange={handleLogoFileSelect} className="hidden" disabled={isSaving} />
                  </label>

                  {(logoPreview || logo) && (
                    <div className="mt-3">
                      <div className="relative inline-block">
                        <img src={logoPreview || logo} alt="Logo preview" className="max-w-full h-32 object-contain rounded-lg border border-gray-600" />
                        {logoFile && (
                          <button
                            type="button"
                            onClick={clearLogoSelection}
                            className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full text-white"
                            disabled={isSaving}
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                      {logoFile && (
                        <div className="mt-2 flex gap-2">
                          <button type="button" onClick={handleLogoUpload} className="btn-primary text-sm px-3 py-1" disabled={isSaving}>
                            Usar esta imagen
                          </button>
                          <button type="button" onClick={clearLogoSelection} className="btn-outline text-sm px-3 py-1" disabled={isSaving}>
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {logoError && <p className="text-red-400 text-xs mt-2">{logoError}</p>}
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-gray-800 px-2 text-gray-500">O ingresa una URL</span>
                    </div>
                  </div>
                  <input
                    className="input w-full"
                    value={logo && !logoPreview ? logo : ''}
                    onChange={e => {
                      setLogo(e.target.value);
                      setLogoFile(null);
                      setLogoPreview(null);
                    }}
                    placeholder="https://ejemplo.com/logo.jpg"
                    disabled={!!logoFile || isSaving}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-900/80 rounded-lg p-5 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Users size={18} className="text-primary" />
                  <h4 className="text-lg font-semibold text-white">Equipos participantes</h4>
                </div>
                <span className="text-sm text-gray-400">{teams.length} seleccionados</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-3 bg-gray-800/60 rounded-lg border border-gray-700">
                {clubs.map(c => (
                  <label
                    key={c.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${
                      teams.includes(c.name) ? 'bg-primary/10 border-primary/50 hover:bg-primary/20' : 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary bg-gray-600 border-gray-500 rounded focus:ring-primary focus:ring-2"
                      checked={teams.includes(c.name)}
                      onChange={e => toggleTeam(c.name, e.target.checked)}
                      disabled={isSaving}
                    />
                    <span className="text-sm text-white">{c.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button type="button" className="flex-1 btn-outline" onClick={onClose} disabled={isSaving}>
                <X size={16} className="mr-2" />
                Cancelar
              </button>
              <button type="submit" className="flex-1 btn-primary disabled:opacity-60 disabled:cursor-not-allowed" disabled={isSaving}>
                <CheckCircle size={16} className="mr-2" />
                {isSaving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTournamentModal;

