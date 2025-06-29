import { useState, useEffect, useRef } from 'react';
import { Fixture } from '../../types';
import { useGlobalStore } from '../../store/globalStore';

interface Props {
  match: Fixture;
  onClose: () => void;
  onSave: (match: Fixture) => void;
  allowDateEdit?: boolean;
}

const EditMatchModal = ({ match, onClose, onSave, allowDateEdit }: Props) => {
  const { clubs } = useGlobalStore();
  const [formData, setFormData] = useState({
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    date: match.date.split('T')[0],
    time: match.date.split('T')[1]?.slice(0,5) || '',
    round: match.round
  });
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    modalRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const date = allowDateEdit ? `${formData.date}T${formData.time}` : match.date;
    onSave({ ...match, ...formData, date });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4" tabIndex={-1}>
        <h3 className="text-lg font-semibold mb-4">Editar Partido</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <select
              className="input w-full"
              value={formData.homeTeam}
              onChange={e => setFormData({ ...formData, homeTeam: e.target.value })}
            >
              {clubs.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              className="input w-full"
              value={formData.awayTeam}
              onChange={e => setFormData({ ...formData, awayTeam: e.target.value })}
            >
              {clubs.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          {allowDateEdit && (
            <div className="flex space-x-2">
              <input
                type="date"
                className="input flex-1"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
              <input
                type="time"
                className="input flex-1"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          )}
          <div>
            <input
              type="number"
              className="input w-full"
              value={formData.round}
              onChange={e => setFormData({ ...formData, round: Number(e.target.value) })}
            />
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
