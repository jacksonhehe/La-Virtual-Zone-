import  { useState, useRef, useEffect } from 'react';
import { Player } from '../../types';
import { useGlobalStore } from '../../store/globalStore';

interface Props {
  player: Player;
  onClose: () => void;
  onSave: (playerData: Player) => void;
}

const EditPlayerModal = ({ player, onClose, onSave }: Props) => {
  const { clubs } = useGlobalStore();
  const [formData, setFormData] = useState({
    name: player.name,
    position: player.position,
    clubId: player.clubId,
    overall: player.overall,
    price: player.price
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
    if (!formData.clubId) newErrors.clubId = 'Club requerido';
    if (formData.overall < 40 || formData.overall > 99) newErrors.overall = 'Overall debe estar entre 40-99';
    if (formData.price <= 0) newErrors.price = 'Precio debe ser mayor a 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave({ ...player, ...formData });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4"
        tabIndex={-1}
      >
        <h3 className="text-lg font-semibold mb-4">Editar Jugador</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Nombre del jugador"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
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
          <div>
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
            {errors.clubId && <p className="text-red-500 text-sm mt-1">{errors.clubId}</p>}
          </div>
          <div>
            <input
              type="number"
              min="40"
              max="99"
              className={`input w-full ${errors.overall ? 'border-red-500' : ''}`}
              placeholder="Overall (40-99)"
              value={formData.overall}
              onChange={(e) => setFormData({...formData, overall: Number(e.target.value)})}
            />
            {errors.overall && <p className="text-red-500 text-sm mt-1">{errors.overall}</p>}
          </div>
          <div>
            <input
              type="number"
              className={`input w-full ${errors.price ? 'border-red-500' : ''}`}
              placeholder="Precio"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>
          <div className="flex space-x-3 justify-end mt-6">
            <button type="button" onClick={onClose} className="btn-outline">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPlayerModal;
 