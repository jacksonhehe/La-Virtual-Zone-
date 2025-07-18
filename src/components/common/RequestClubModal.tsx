import { useRef, useState } from 'react';
import { X, Phone, Mail, Clock, Trophy, MessageSquare, User, Calendar, Heart } from 'lucide-react';
import useFocusTrap from '../../hooks/useFocusTrap';
import { useAuthStore } from '../../store/authStore';
import { useActivityLogStore } from '../../store/activityLogStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface RequestForm {
  message: string;
  whatsapp: string;
  experience: string;
  availability: string;
  preferredClub: string;
  motivation: string;
  timezone: string;
}

const RequestClubModal = ({ isOpen, onClose }: Props) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef);
  const [sent, setSent] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { user } = useAuthStore();
  const { addLog } = useActivityLogStore();

  const [formData, setFormData] = useState<RequestForm>({
    message: '',
    whatsapp: '',
    experience: '',
    availability: '',
    preferredClub: '',
    motivation: '',
    timezone: ''
  });

  const handleInputChange = (field: keyof RequestForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      addLog('dt_request', user.id, `${user.username} solicitó un club con WhatsApp: ${formData.whatsapp}`);
    }
    setSent(true);
    setTimeout(onClose, 2000);
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.message.trim() !== '' && formData.whatsapp.trim() !== '';
      case 2:
        return formData.experience.trim() !== '' && formData.availability.trim() !== '';
      case 3:
        return formData.motivation.trim() !== '';
      default:
        return true;
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div
        className="relative bg-gradient-to-br from-dark-lighter to-dark rounded-xl shadow-2xl w-full max-w-2xl p-8 border border-gray-800/50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-club-title"
        ref={dialogRef}
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {sent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy size={32} className="text-dark" />
            </div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              ¡Solicitud Enviada!
            </h3>
            <p className="text-gray-300 mb-2">Tu solicitud ha sido recibida correctamente.</p>
            <p className="text-sm text-gray-400">Te contactaremos por WhatsApp cuando haya un club disponible.</p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy size={32} className="text-dark" />
              </div>
              <h3 id="request-club-title" className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Solicitar Club como DT
              </h3>
              <p className="text-gray-400">Completa la información para solicitar un club en la Liga Master</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
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

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Información de contacto */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="bg-dark/50 rounded-xl p-6 border border-gray-800/50">
                    <h4 className="text-lg font-semibold mb-4 flex items-center">
                      <User size={20} className="mr-2 text-primary" />
                      Información de Contacto
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Phone size={16} className="inline mr-2" />
                          Número de WhatsApp
                        </label>
                        <input
                          type="tel"
                          className="input w-full bg-dark border-gray-700 focus:border-primary"
                          placeholder="+34 600 000 000"
                          value={formData.whatsapp}
                          onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Te contactaremos por WhatsApp para coordinar
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <MessageSquare size={16} className="inline mr-2" />
                          Mensaje inicial
                        </label>
                        <textarea
                          className="input w-full bg-dark border-gray-700 focus:border-primary"
                          rows={3}
                          placeholder="Cuéntanos brevemente por qué quieres ser DT..."
                          value={formData.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Experiencia y disponibilidad */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="bg-dark/50 rounded-xl p-6 border border-gray-800/50">
                    <h4 className="text-lg font-semibold mb-4 flex items-center">
                      <Trophy size={20} className="mr-2 text-primary" />
                      Experiencia y Disponibilidad
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Experiencia previa como DT
                        </label>
                        <select
                          className="input w-full bg-dark border-gray-700 focus:border-primary"
                          value={formData.experience}
                          onChange={(e) => handleInputChange('experience', e.target.value)}
                          required
                        >
                          <option value="">Selecciona tu experiencia</option>
                          <option value="ninguna">Ninguna experiencia</option>
                          <option value="amateur">DT amateur (1-2 años)</option>
                          <option value="intermedio">DT intermedio (3-5 años)</option>
                          <option value="experimentado">DT experimentado (5+ años)</option>
                          <option value="profesional">DT profesional</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Clock size={16} className="inline mr-2" />
                          Disponibilidad horaria
                        </label>
                        <select
                          className="input w-full bg-dark border-gray-700 focus:border-primary"
                          value={formData.availability}
                          onChange={(e) => handleInputChange('availability', e.target.value)}
                          required
                        >
                          <option value="">Selecciona tu disponibilidad</option>
                          <option value="mañana">Mañanas (8:00 - 14:00)</option>
                          <option value="tarde">Tardes (14:00 - 20:00)</option>
                          <option value="noche">Noches (20:00 - 00:00)</option>
                          <option value="flexible">Horario flexible</option>
                          <option value="fines">Solo fines de semana</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Calendar size={16} className="inline mr-2" />
                          Zona horaria
                        </label>
                        <select
                          className="input w-full bg-dark border-gray-700 focus:border-primary"
                          value={formData.timezone}
                          onChange={(e) => handleInputChange('timezone', e.target.value)}
                          required
                        >
                          <option value="">Selecciona tu zona horaria</option>
                          <option value="UTC+0">UTC+0 (Londres)</option>
                          <option value="UTC+1">UTC+1 (Madrid, París)</option>
                          <option value="UTC+2">UTC+2 (Roma, Berlín)</option>
                          <option value="UTC-3">UTC-3 (Buenos Aires)</option>
                          <option value="UTC-5">UTC-5 (Nueva York)</option>
                          <option value="UTC-8">UTC-8 (Los Ángeles)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Motivación y preferencias */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-dark/50 rounded-xl p-6 border border-gray-800/50">
                    <h4 className="text-lg font-semibold mb-4 flex items-center">
                      <Heart size={20} className="mr-2 text-primary" />
                      Motivación y Preferencias
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          ¿Por qué quieres ser DT?
                        </label>
                        <textarea
                          className="input w-full bg-dark border-gray-700 focus:border-primary"
                          rows={4}
                          placeholder="Cuéntanos tu motivación, objetivos y qué esperas de la experiencia..."
                          value={formData.motivation}
                          onChange={(e) => handleInputChange('motivation', e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Club preferido (opcional)
                        </label>
                        <input
                          type="text"
                          className="input w-full bg-dark border-gray-700 focus:border-primary"
                          placeholder="Ej: Real Madrid, Barcelona, etc."
                          value={formData.preferredClub}
                          onChange={(e) => handleInputChange('preferredClub', e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Si tienes algún club en mente, menciónalo aquí
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between pt-6">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn-outline px-6 py-3 border-gray-600 hover:bg-gray-800 transition-all duration-200"
                  >
                    Anterior
                  </button>
                )}
                
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!isStepValid(currentStep)}
                    className="btn-primary px-6 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!isStepValid(currentStep)}
                    className="btn-primary px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Enviar Solicitud
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestClubModal;
