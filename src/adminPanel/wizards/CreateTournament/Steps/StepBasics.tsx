import { useState, useEffect } from 'react';
import { Tournament } from '../../../types';

interface Props {
  data: Partial<Tournament>;
  onNext: (data: Partial<Tournament>) => void;
}

const StepBasics = ({ data, onNext }: Props) => {
  const [name, setName] = useState(data.name || '');
  const [status, setStatus] = useState<Tournament['status']>(
    (data.status as Tournament['status']) || 'upcoming'
  );
  const [error, setError] = useState('');

  useEffect(() => {
    setName(data.name || '');
    setStatus((data.status as Tournament['status']) || 'upcoming');
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nombre requerido');
      return;
    }
    onNext({ ...data, name, status });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          className={`input w-full ${error ? 'border-red-500' : ''}`}
          placeholder="Nombre del torneo"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
      <select
        className="input w-full"
        value={status}
        onChange={e => setStatus(e.target.value as Tournament['status'])}
      >
        <option value="upcoming">Próximo</option>
        <option value="active">Activo</option>
        <option value="completed">Completado</option>
      </select>
      <div className="flex justify-end mt-6">
        <button type="submit" className="btn-primary">Siguiente</button>
      </div>
    </form>
  );
};

export default StepBasics;
