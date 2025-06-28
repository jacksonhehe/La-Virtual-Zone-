import { useDataStore } from '../../store/dataStore';

interface Props {
  clubId: string;
}

const LineupWidget = ({ clubId }: Props) => {
  const { players } = useDataStore();
  const squad = players.filter(p => p.clubId === clubId).slice(0, 11);

  return (
    <div className="card p-4">
      <h3 className="font-bold mb-3">Alineación actual</h3>
      <ul className="space-y-1 text-sm">
        {squad.map(player => (
          <li key={player.id} className="flex justify-between">
            <span className="text-gray-400 mr-2 w-10">{player.position}</span>
            <span className="font-medium flex-1">{player.name}</span>
            <span className="text-gray-400">{player.overall}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LineupWidget;
