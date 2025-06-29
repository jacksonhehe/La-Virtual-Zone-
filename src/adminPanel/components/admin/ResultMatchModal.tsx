import { useState, useRef, useEffect } from 'react';
import { Match } from '../../types';

interface Props {
  match: Match;
  onClose: () => void;
  onSave: (match: Match) => void;
}

const ResultMatchModal = ({ match, onClose, onSave }: Props) => {
  const [formData, setFormData] = useState({
    homeScore: match.homeScore ?? 0,
    awayScore: match.awayScore ?? 0,
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
    if (formData.homeScore < 0) newErrors.homeScore = 'Inválido';
    if (formData.awayScore < 0) newErrors.awayScore = 'Inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        ...match,
        homeScore: formData.homeScore,
        awayScore: formData.awayScore,
        status: 'finished',
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
        <h3 className="text-lg font-semibold mb-4">Resultado del Partido</h3>
        <p className="text-center mb-4 text-gray-300">
          {match.homeTeam} vs {match.awayTeam}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="number"
              className={`input w-full ${errors.homeScore ? 'border-red-500' : ''}`}
              value={formData.homeScore}
              onChange={(e) => setFormData({ ...formData, homeScore: Number(e.target.value) })}
              placeholder={`${match.homeTeam}`}
            />
            {errors.homeScore && <p className="text-red-500 text-sm mt-1">{errors.homeScore}</p>}
          </div>
          <div>
            <input
              type="number"
              className={`input w-full ${errors.awayScore ? 'border-red-500' : ''}`}
              value={formData.awayScore}
              onChange={(e) => setFormData({ ...formData, awayScore: Number(e.target.value) })}
              placeholder={`${match.awayTeam}`}
            />
            {errors.awayScore && <p className="text-red-500 text-sm mt-1">{errors.awayScore}</p>}
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

export default ResultMatchModal;
