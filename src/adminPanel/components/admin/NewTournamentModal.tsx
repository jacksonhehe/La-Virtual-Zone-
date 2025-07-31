import { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Trophy, 
  Calendar, 
  Users, 
  MapPin, 
  DollarSign, 
  FileText, 
  Image, 
  Settings,
  Play,
  Clock,
  Award,
  Globe
} from 'lucide-react';
import { Tournament } from '../../types';
import { slugify } from '../../../utils/slugify';
import LogoUploadField from './LogoUploadField';

interface Props {
  onClose: () => void;
  onSave: (data: Partial<Tournament>) => void;
  tournament?: Tournament; // For editing existing tournaments
}

const defaultLogo = 'https://ui-avatars.com/api/?name=Torneo&background=111827&color=fff&size=128&bold=true';

const NewTournamentModal = ({ onClose, onSave, tournament }: Props) => {
  const [formData, setFormData] = useState({
    name: tournament?.name || '',
    type: tournament?.type || 'league' as Tournament['type'],
    logo: tournament?.logo || defaultLogo,
    startDate: tournament?.startDate || '',
    endDate: tournament?.endDate || '',
    status: tournament?.status || 'upcoming' as Tournament['status'],
    teams: tournament?.teams || [] as string[],
    rounds: tournament?.rounds || 1,
    matches: tournament?.matches || [],
    description: tournament?.description || '',
    format: tournament?.format || 'league',
    location: tournament?.location || '',
    prizePool: tournament?.prizePool || 0,
    maxTeams: tournament?.maxTeams || 20,
    categoriesInput: tournament?.categories?.join(', ') || '', // cadena separada por comas para la UI
    customUrl: tournament?.customUrl || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    modalRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nombre requerido';
    if (!formData.startDate) newErrors.startDate = 'Fecha de inicio requerida';
    if (!formData.endDate) newErrors.endDate = 'Fecha de fin requerida';
    if (formData.rounds <= 0) newErrors.rounds = 'Rondas inválidas';
    if (formData.maxTeams <= 1) newErrors.maxTeams = 'Máximo de equipos inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Convertir categorías a array limpio
      const categoriesArr = formData.categoriesInput
        .split(',')
        .map(c => c.trim())
        .filter(Boolean);

      // Generar slug basado en la URL personalizada o el nombre
      const slug = formData.customUrl ? slugify(formData.customUrl) : slugify(formData.name);

      onSave({
        ...formData,
        slug,
        categories: categoriesArr.length > 0 ? categoriesArr : undefined,
        customUrl: formData.customUrl || undefined,
        teams: [],
        matches: [],
        currentTeams: 0,
      });
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.name.trim() !== '';
      case 2:
        return formData.startDate !== '' && formData.endDate !== '' && formData.maxTeams > 1;
      case 3:
        return formData.description.trim() !== '';
      default:
        return true;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-gradient-to-br from-dark-lighter to-dark rounded-xl shadow-2xl max-w-2xl w-full mx-4 border border-gray-800/50 max-h-[90vh] overflow-hidden"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center mr-4">
              <Trophy size={24} className="text-dark" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {tournament ? 'Editar Torneo' : 'Crear Nuevo Torneo'}
              </h3>
              <p className="text-gray-400 text-sm">
                {tournament ? 'Modifica los detalles del torneo' : 'Configura los detalles del torneo'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-gray-800/50">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-400">Paso {currentStep} de 3</span>
            <span className="text-sm text-primary">{Math.round((currentStep / 3) * 100)}%</span>
          </div>
          <div className="h-2 bg-dark rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Step 1: Información Básica */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="bg-dark/50 rounded-xl p-4 border border-gray-800/50 shadow-lg">
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <Trophy size={20} className="mr-2 text-primary" />
                  Información Básica
                </h4>
                
                <div className="space-y-3">
          <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre del Torneo
                    </label>
                    <div className="relative">
            <input
                        className={`input w-full bg-dark border-gray-700 focus:border-primary ${errors.name ? 'border-red-500' : ''}`}
                        placeholder="Ej: Liga Master 2025"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
                  </div>

                  {/* Categorías */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Categorías (separadas por coma)
                    </label>
                    <input
                      className="input w-full bg-dark border-gray-700 focus:border-primary"
                      placeholder="Sub-18, Libre, Femenino"
                      value={formData.categoriesInput}
                      onChange={e => setFormData({ ...formData, categoriesInput: e.target.value })}
                    />
                  </div>

                  {/* URL personalizada */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      URL Personalizada
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md bg-dark border border-r-0 border-gray-700 text-gray-400 text-sm">
                        virtualzone.com/
                      </span>
                      <input
                        className="input w-full bg-dark border-gray-700 focus:border-primary rounded-l-none"
                        placeholder="ligamaster2025"
                        value={formData.customUrl}
                        onChange={e => setFormData({ ...formData, customUrl: e.target.value })}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Déjalo vacío para usar el slug por defecto.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipo de Torneo
                    </label>
                    <select
                      className="input w-full bg-dark border-gray-700 focus:border-primary"
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value as Tournament['type'] })}
                    >
                      <option value="league">🏆 Liga</option>
                      <option value="cup">🥇 Copa</option>
                      <option value="friendly">🤝 Amistoso</option>
                    </select>
                  </div>

          {/* Logo Preview */}
          {formData.logo && (
            <div className="flex justify-center mb-3">
              <div className="relative">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                  <img 
                    src={formData.logo} 
                    alt="Logo del torneo" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = defaultLogo;
                    }}
                  />
                </div>
                <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  ✓
                </div>
              </div>
            </div>
          )}

          <LogoUploadField
            value={formData.logo}
            onChange={(value) => setFormData({ ...formData, logo: value })}
            label="Logo del Torneo"
            placeholder="URL del logo o subir archivo"
            showPreview={true}
            maxSize={3}
          />

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Estado del Torneo
                    </label>
          <select
                      className="input w-full bg-dark border-gray-700 focus:border-primary"
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value as Tournament['status'] })}
          >
                      <option value="upcoming">⏳ Próximo</option>
                      <option value="active">▶️ Activo</option>
                      <option value="finished">🏁 Finalizado</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Configuración y Fechas */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="bg-dark/50 rounded-xl p-4 border border-gray-800/50 shadow-lg">
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <Calendar size={20} className="mr-2 text-primary" />
                  Fechas y Configuración
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Clock size={16} className="inline mr-2" />
                      Fecha de Inicio
                    </label>
                    <input
                      type="date"
                      className={`input w-full bg-dark border-gray-700 focus:border-primary ${errors.startDate ? 'border-red-500' : ''}`}
                      value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    />
                    {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Clock size={16} className="inline mr-2" />
                      Fecha de Fin
                    </label>
                    <input
                      type="date"
                      className={`input w-full bg-dark border-gray-700 focus:border-primary ${errors.endDate ? 'border-red-500' : ''}`}
                      value={formData.endDate}
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    />
                    {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Users size={16} className="inline mr-2" />
                      Máximo de Equipos
                    </label>
                    <input
                      type="number"
                      className={`input w-full bg-dark border-gray-700 focus:border-primary ${errors.maxTeams ? 'border-red-500' : ''}`}
                      placeholder="20"
                      value={formData.maxTeams}
                      onChange={e => setFormData({ ...formData, maxTeams: Number(e.target.value) })}
                    />
                    {errors.maxTeams && <p className="text-red-500 text-sm mt-1">{errors.maxTeams}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Play size={16} className="inline mr-2" />
                      Total de Jornadas
                    </label>
                    <input
                      type="number"
                      className={`input w-full bg-dark border-gray-700 focus:border-primary ${errors.rounds ? 'border-red-500' : ''}`}
                      placeholder="1"
                      value={formData.rounds}
                      onChange={e => setFormData({ ...formData, rounds: Number(e.target.value) })}
                    />
                    {errors.rounds && <p className="text-red-500 text-sm mt-1">{errors.rounds}</p>}
                  </div>
                </div>
              </div>

              <div className="bg-dark/50 rounded-xl p-4 border border-gray-800/50 shadow-lg">
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <Settings size={20} className="mr-2 text-primary" />
                  Configuración Adicional
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <MapPin size={16} className="inline mr-2" />
                      Ubicación
                    </label>
                    <input
                      className="input w-full bg-dark border-gray-700 focus:border-primary"
                      placeholder="Madrid, España"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <DollarSign size={16} className="inline mr-2" />
                      Premio (€)
                    </label>
                    <input
                      type="number"
                      className="input w-full bg-dark border-gray-700 focus:border-primary"
                      placeholder="1000"
                      value={formData.prizePool}
                      onChange={e => setFormData({ ...formData, prizePool: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Globe size={16} className="inline mr-2" />
                    Formato
                  </label>
                  <select
                    className="input w-full bg-dark border-gray-700 focus:border-primary"
                    value={formData.format}
                    onChange={e => setFormData({ ...formData, format: e.target.value })}
                  >
                    <option value="league">🏆 Liga (Todos contra todos)</option>
                    <option value="elimination">⚔️ Eliminación directa</option>
                    <option value="group">👥 Grupos + Eliminación</option>
          </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Descripción */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-dark/50 rounded-xl p-4 border border-gray-800/50 shadow-lg">
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <FileText size={20} className="mr-2 text-primary" />
                  Descripción del Torneo
                </h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción Detallada
                  </label>
                  <textarea
                    className="input w-full bg-dark border-gray-700 focus:border-primary"
                    rows={4}
                    placeholder="Describe el torneo, sus reglas, premios y cualquier información relevante..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Esta descripción será visible para todos los usuarios
                  </p>
                </div>
              </div>

              {/* Resumen del Torneo */}
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-4 border border-primary/20 shadow-lg">
                <h4 className="text-lg font-semibold mb-3 flex items-center">
                  <Award size={20} className="mr-2 text-primary" />
                  Resumen del Torneo
                </h4>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center p-2 bg-dark-lighter/50 rounded-lg">
                    <Trophy size={14} className="mr-2 text-primary" />
                    <div>
                      <span className="text-gray-400 text-xs">Tipo:</span>
                      <div className="font-medium text-white text-sm">
                        {formData.type === 'league' ? 'Liga' : 
                         formData.type === 'cup' ? 'Copa' : 'Amistoso'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-2 bg-dark-lighter/50 rounded-lg">
                    <Users size={14} className="mr-2 text-primary" />
                    <div>
                      <span className="text-gray-400 text-xs">Equipos:</span>
                      <div className="font-medium text-white text-sm">{formData.maxTeams}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-2 bg-dark-lighter/50 rounded-lg">
                    <Calendar size={14} className="mr-2 text-primary" />
                    <div>
                      <span className="text-gray-400 text-xs">Duración:</span>
                      <div className="font-medium text-white text-sm">
                        {formData.startDate && formData.endDate ? 
                          `${new Date(formData.startDate).toLocaleDateString()} - ${new Date(formData.endDate).toLocaleDateString()}` : 
                          'No definida'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-2 bg-dark-lighter/50 rounded-lg">
                    <DollarSign size={14} className="mr-2 text-primary" />
                    <div>
                      <span className="text-gray-400 text-xs">Premio:</span>
                      <div className="font-medium text-white text-sm">€{formData.prizePool.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-800/50">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="btn-outline px-4 py-2 border-gray-600 hover:bg-gray-800 transition-all duration-200"
              >
                Anterior
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
                className="btn-primary px-4 py-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="submit"
                disabled={!isStepValid(currentStep)}
                className="btn-primary px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <Trophy size={16} className="mr-2" />
                {tournament ? 'Actualizar Torneo' : 'Crear Torneo'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTournamentModal;
