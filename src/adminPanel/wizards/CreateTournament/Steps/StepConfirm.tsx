import { Tournament } from '../../../types';

interface Props {
  data: Partial<Tournament>;
  onBack: () => void;
  onFinish: () => void;
}

const StepConfirm = ({ data, onBack, onFinish }: Props) => {
  return (
    <div className="space-y-4">
      <div className="card p-4 text-sm space-y-2">
        <p>
          <span className="text-gray-400">Nombre:</span> {data.name}
        </p>
        <p>
          <span className="text-gray-400">Jornadas:</span> {data.totalRounds}
        </p>
        <p>
          <span className="text-gray-400">Estado:</span> {data.status}
        </p>
      </div>
      <div className="flex justify-between mt-6">
        <button onClick={onBack} className="btn-outline">
          Atrás
        </button>
        <button onClick={onFinish} className="btn-primary">
          Crear
        </button>
      </div>
    </div>
  );
};

export default StepConfirm;
