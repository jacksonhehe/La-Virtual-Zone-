import { useState, useRef, useEffect } from 'react';
import { Match } from '../../types';
import { useGlobalStore } from '../../store/globalStore';

interface Props {
  match: Match;
  onClose: () => void;
  onSave: (match: Match) => void;
}

const EditMatchModal = ({ match, onClose, onSave }: Props) => {
  const { clubs } = useGlobalStore();
  const dateObj = new Date(match.date);
  const [formData, setFormData] = useState({
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    date: dateObj.toISOString().slice(0, 10),
    time: dateObj.toISOString().slice(11, 16),
    round: match.round,
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
    if (!formData.homeTeam) newErrors.homeTeam = 'Local requerido';
    if (!formData.awayTeam) newErrors.awayTeam = 'Visitante requerido';
    if (formData.homeTeam && formData.awayTeam && formData.homeTeam === formData.awayTeam) {
      newErrors.awayTeam = 'Los equipos deben ser distintos';
    }
    if (!formData.date) newErrors.date = 'Fecha requerida';
    if (!formData.time) newErrors.time = 'Hora requerida';
    if (formData.round <= 0) newErrors.round = 'Jornada inválida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const dateIso = new Date(`${formData.date}T${formData.time}`).toISOString();
      onSave({
        ...match,
        homeTeam: formData.homeTeam,
        awayTeam: formData.awayTeam,
        date: dateIso,
        round: formData.round,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4"
        tabIndex={-1}
      >
        <h3 className="text-lg font-semibold mb-4">Editar Partido</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <select
              className={`input w-full ${errors.homeTeam ? 'border-red-500' : ''}`}
              value={formData.homeTeam}
              onChange={(e) => setFormData({ ...formData, homeTeam: e.target.value })}
            >
              <option value="">Equipo Local</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.name}>{club.name}</option>
              ))}
            </select>
            {errors.homeTeam && <p className="text-red-500 text-sm mt-1">{errors.homeTeam}</p>}
          </div>
          <div>
            <select
              className={`input w-full ${errors.awayTeam ? 'border-red-500' : ''}`}
              value={formData.awayTeam}
              onChange={(e) => setFormData({ ...formData, awayTeam: e.target.value })}
            >
              <option value="">Equipo Visitante</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.name}>{club.name}</option>
              ))}
            </select>
            {errors.awayTeam && <p className="text-red-500 text-sm mt-1">{errors.awayTeam}</p>}
          </div>
          <div>
            <input
              type="date"
              className={`input w-full ${errors.date ? 'border-red-500' : ''}`}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>
          <div>
            <input
              type="time"
              className={`input w-full ${errors.time ? 'border-red-500' : ''}`}
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
            {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
          </div>
          <div>
            <input
              type="number"
              className={`input w-full ${errors.round ? 'border-red-500' : ''}`}
              value={formData.round}
              onChange={(e) => setFormData({ ...formData, round: Number(e.target.value) })}
              placeholder="Jornada"
            />
            {errors.round && <p className="text-red-500 text-sm mt-1">{errors.round}</p>}
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

export default EditMatchModal;
