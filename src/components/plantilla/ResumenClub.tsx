import { formatCurrency } from '../../utils/helpers';
import { Player, Club } from '../../types/shared';
import ProgressBar from '../common/ProgressBar';

interface Props {
  club?: Club;
  players: Player[];
}

const ResumenClub = ({ club, players }: Props) => {
  const totalSalary = players.reduce((sum, p) => sum + (p.contract?.salary || 0), 0);
  const budget = club?.budget ?? 0;
  const salaryPercent = budget > 0 ? Math.round((totalSalary / budget) * 100) : null;

  return (
    <div className="card p-6 flex items-center">
      <img src={club?.logo || ''} alt={club?.name || ''} className="w-16 h-16 mr-4" />
      <div>
        <h2 className="text-xl font-bold mb-1">{club?.name}</h2>
        <p className="text-sm text-gray-400">
          Uso salarial: {formatCurrency(totalSalary)}
        </p>
        <div className="mt-2">
          <ProgressBar value={salaryPercent} />
        </div>
      </div>
    </div>
  );
};

export default ResumenClub;
