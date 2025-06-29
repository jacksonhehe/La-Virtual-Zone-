import { useState, useEffect, useRef } from 'react';
import { Fixture } from '../../types';

interface Props {
  matches: Fixture[];
  onClose: () => void;
  onSave: (match: Fixture) => void;
}

const ResultMatchModal = ({ matches, onClose, onSave }: Props) => {
  const [selectedId, setSelectedId] = useState(matches[0]?.id || '');
  const match = matches.find(m => m.id === selectedId)!;
  const [homeScore, setHomeScore] = useState(match.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState(match.awayScore ?? 0);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    modalRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const m = matches.find(m => m.id === selectedId);
    if (m) {
      setHomeScore(m.homeScore ?? 0);
      setAwayScore(m.awayScore ?? 0);
    }
  }, [selectedId, matches]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...match, homeScore, awayScore, status: 'finished' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4" tabIndex={-1}>
        <h3 className="text-lg font-semibold mb-4">Registrar Resultado</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select className="input w-full" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
            {matches.map(m => (
              <option key={m.id} value={m.id}>
                {m.homeTeam} vs {m.awayTeam}
              </option>
            ))}
          </select>
          <div className="flex items-center space-x-2">
            <input type="number" className="input flex-1" value={homeScore} onChange={e => setHomeScore(Number(e.target.value))} />
            <span>-</span>
            <input type="number" className="input flex-1" value={awayScore} onChange={e => setAwayScore(Number(e.target.value))} />
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
