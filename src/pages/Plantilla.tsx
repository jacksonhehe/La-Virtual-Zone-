import { useEffect, useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import playersData from '../data/players.json';
import { VZ_PLAYERS_KEY } from '../utils/storageKeys';

interface SquadPlayer {
  id: string;
  name: string;
  age: number;
  position: string;
  nationality: string;
  overall: number;
}

const Plantilla = () => {
  const [players, setPlayers] = useState<SquadPlayer[]>([]);

  useEffect(() => {
    const json = localStorage.getItem(VZ_PLAYERS_KEY);
    if (json) {
      setPlayers(JSON.parse(json));
    } else {
      localStorage.setItem(VZ_PLAYERS_KEY, JSON.stringify(playersData));
      setPlayers(playersData as SquadPlayer[]);
    }
  }, []);

  return (
    <div>
      <PageHeader
        title="Plantilla"
        subtitle="Jugadores registrados en tu plantilla."
      />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map(player => (
            <div key={player.id} className="card p-4 flex justify-between">
              <div>
                <h3 className="font-bold">{player.name}</h3>
                <p className="text-sm text-gray-400">
                  {player.position} • {player.nationality} • {player.age} años
                </p>
              </div>
              <span className="text-sm text-gray-300 font-bold">
                {player.overall}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Plantilla;
