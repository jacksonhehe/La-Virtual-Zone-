import { useState } from 'react';
import { Tournament } from '../../../types';

interface Props {
  data: Partial<Tournament>;
  onNext: (data: Partial<Tournament>) => void;
  onBack: () => void;
}

const StepSchedule = ({ data, onNext, onBack }: Props) => {
  const [status, setStatus] = useState<Tournament['status']>(
    (data.status as Tournament['status']) || 'upcoming'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ ...data, status });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <select
        className="input w-full"
        value={status}
        onChange={e => setStatus(e.target.value as Tournament['status'])}
      >
        <option value="upcoming">Próximo</option>
        <option value="active">Activo</option>
        <option value="completed">Completado</option>
      </select>
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

export default StepSchedule;
