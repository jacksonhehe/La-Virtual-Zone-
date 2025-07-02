import { useState, useEffect } from 'react';
import { Tournament } from '../../../types';

interface Props {
  data: Partial<Tournament>;
  onNext: (data: Partial<Tournament>) => void;
  onBack: () => void;
}

const StepFormat = ({ data, onNext, onBack }: Props) => {
  const [totalRounds, setTotalRounds] = useState(data.totalRounds || 1);
  const [error, setError] = useState('');

  useEffect(() => {
    setTotalRounds(data.totalRounds || 1);
  }, [data.totalRounds]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalRounds <= 0) {
      setError('Rondas inválidas');
      return;
    }
    onNext({ ...data, totalRounds });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="number"
          className={`input w-full ${error ? 'border-red-500' : ''}`}
          placeholder="Total de jornadas"
          value={totalRounds}
          onChange={e => setTotalRounds(Number(e.target.value))}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
      <div className="flex justify-between mt-6">
        <button type="button" onClick={onBack} className="btn-outline">
          Atrás
        </button>
        <button type="submit" className="btn-primary">
          Siguiente
        </button>
      </div>
    </form>
  );
};

export default StepFormat;
