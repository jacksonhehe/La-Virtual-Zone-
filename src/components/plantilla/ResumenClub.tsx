import { formatCurrency } from '../../utils/helpers';
import { Player } from '../../types';

interface Props {
  club: { name: string; logo: string };
  players: Player[];
}

const ResumenClub = ({ club, players }: Props) => {
  const totalSalary = players.reduce((sum, p) => sum + p.contract.salary, 0);

  return (
    <div className="card-glass p-6 flex items-center">
      <img src={club.logo} alt={club.name} className="w-16 h-16 mr-4" />
      <div>
        <h2 className="text-xl font-bold mb-1">{club.name}</h2>
        <p className="text-sm text-gray-400">
          Uso salarial: {formatCurrency(totalSalary)}
        </p>
      </div>
    </div>
  );
};

export default ResumenClub;
