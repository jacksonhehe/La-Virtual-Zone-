import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { toast } from 'react-hot-toast';
import  { useState, useRef, useEffect } from 'react';
import { Player } from '../../../types/shared';
import { useGlobalStore } from '../../store/globalStore';
import LogoUploadField from './LogoUploadField';

interface Props {
  onClose: () => void;
  onSave: (playerData: Partial<Player>) => void;
}

const NewPlayerModal = ({ onClose, onSave }: Props) => {
  const { clubs } = useGlobalStore();
  const [formData, setFormData] = useState({
    name: '',
    age: 18,
    nationality: '',
    dorsal: 1,
    position: 'DEL',
    clubId: '',
    overall: 75,
    potential: 80,
    price: 100000,
    contractExpires: '',
    salary: 0,
    image: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
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
    if (!formData.nationality.trim()) newErrors.nationality = 'Nacionalidad requerida';
    if (formData.age < 15) newErrors.age = 'Edad inválida';
    if (!formData.clubId) newErrors.clubId = 'Club requerido';
    if (formData.overall < 40 || formData.overall > 99) newErrors.overall = 'Overall debe estar entre 40-99';
    if (formData.price <= 0) newErrors.price = 'Precio debe ser mayor a 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const image = formData.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=1e293b&color=fff&size=128`;
      onSave({
        ...formData,
        image,
        contract: { expires: formData.contractExpires, salary: formData.salary },
        attributes: { pace: 50, shooting: 50, passing: 50, dribbling: 50, defending: 50, physical: 50 },
        transferListed: false,
        matches: 0,
        transferValue: formData.price,
        value: formData.price,
        form: 1,
        goals: 0,
        assists: 0,
        appearances: 0
      });
      toast.success('¡Jugador creado exitosamente!');
    }
  };

  return (
    <Modal open={true} onClose={onClose} className="max-w-3xl" initialFocusRef={modalRef}>
      <div ref={modalRef} className="max-h-[85vh] overflow-y-auto">
        <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Crear Nuevo Jugador</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Foto del Jugador */}
          <div className="bg-gradient-to-br from-dark to-dark-light rounded-xl p-6 border border-gray-700/50">
            <h4 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              📸 Foto del Jugador
            </h4>
            <LogoUploadField
              value={formData.image}
              onChange={(value) => setFormData({ ...formData, image: value })}
              label="Foto del Jugador"
              placeholder="URL de la foto o subir archivo"
              showPreview={true}
              maxSize={3}
            />
            <p className="text-gray-400 text-sm mt-2">Si no subes una foto, se generará automáticamente con las iniciales del jugador</p>
            <p className="text-blue-400 text-xs mt-1">💡 Para mejores resultados, usa una foto vertical (400x600 píxeles) con el jugador centrado</p>
          </div>

          {/* Información Personal */}
          <div className="bg-gradient-to-br from-dark to-dark-light rounded-xl p-6 border border-gray-700/50">
            <h4 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              👤 Información Personal
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Nombre del Jugador *
                </label>
                <input
                  className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Ejemplo: Lionel Messi"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Edad *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="15"
                    max="50"
                    className={`input w-full pr-8 ${errors.age ? 'border-red-500' : ''}`}
                    placeholder="Ejemplo: 25"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">años</span>
                </div>
                {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Nacionalidad *
                </label>
                <input
                  className={`input w-full ${errors.nationality ? 'border-red-500' : ''}`}
                  placeholder="Ejemplo: Argentina"
                  value={formData.nationality}
                  onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                />
                {errors.nationality && <p className="text-red-500 text-sm">{errors.nationality}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Número de Dorsal
                </label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  className="input w-full"
                  placeholder="Ejemplo: 10"
                  value={formData.dorsal}
                  onChange={e => setFormData({ ...formData, dorsal: Number(e.target.value) })}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Posición
                </label>
                <select
                  className="input w-full"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                >
                  <option value="POR">Portero</option>
                  <option value="DEF">Defensor</option>
                  <option value="MED">Mediocampista</option>
                  <option value="DEL">Delantero</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Club *
                </label>
                <select
                  className={`input w-full ${errors.clubId ? 'border-red-500' : ''}`}
                  value={formData.clubId}
                  onChange={(e) => setFormData({...formData, clubId: e.target.value})}
                >
                  <option value="">Seleccionar club</option>
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>{club.name}</option>
                  ))}
                </select>
                {errors.clubId && <p className="text-red-500 text-sm">{errors.clubId}</p>}
              </div>
            </div>
          </div>

          {/* Información Deportiva */}
          <div className="bg-gradient-to-br from-dark to-dark-light rounded-xl p-6 border border-gray-700/50">
            <h4 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              ⚽ Información Deportiva
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Overall (40-99) *
                </label>
                <input
                  type="number"
                  min="40"
                  max="99"
                  className={`input w-full ${errors.overall ? 'border-red-500' : ''}`}
                  placeholder="Ejemplo: 85"
                  value={formData.overall}
                  onChange={(e) => setFormData({...formData, overall: Number(e.target.value)})}
                />
                {errors.overall && <p className="text-red-500 text-sm">{errors.overall}</p>}
                <p className="text-gray-400 text-xs">Valoración general del jugador</p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Potencial
                </label>
                <input
                  type="number"
                  min="40"
                  max="99"
                  className="input w-full"
                  placeholder="Ejemplo: 90"
                  value={formData.potential}
                  onChange={e => setFormData({ ...formData, potential: Number(e.target.value) })}
                />
                <p className="text-gray-400 text-xs">Valoración máxima que puede alcanzar</p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Valor de Mercado *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    className={`input w-full pl-8 ${errors.price ? 'border-red-500' : ''}`}
                    placeholder="Ejemplo: 50000000"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                </div>
                {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
                <p className="text-gray-400 text-xs">Precio de transferencia en el mercado</p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Contrato hasta (Año)
                </label>
                <input
                  type="number"
                  min="2024"
                  max="2030"
                  className="input w-full"
                  placeholder="Ejemplo: 2026"
                  value={formData.contractExpires}
                  onChange={e => setFormData({ ...formData, contractExpires: e.target.value })}
                />
                <p className="text-gray-400 text-xs">Año en que finaliza el contrato</p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Salario Mensual
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    className="input w-full pl-8"
                    placeholder="Ejemplo: 500000"
                    value={formData.salary}
                    onChange={e => setFormData({ ...formData, salary: Number(e.target.value) })}
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                </div>
                <p className="text-gray-400 text-xs">Salario mensual del jugador</p>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex space-x-4 justify-end pt-6 border-t border-gray-700/50">
            <Button variant="outline" type="button" onClick={onClose} className="px-6 py-3">
              Cancelar
            </Button>
            <Button type="submit" className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold">
              ✨ Crear Jugador
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default NewPlayerModal;
 