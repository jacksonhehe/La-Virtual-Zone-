import { lazy, useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import ResumenClub from '../components/plantilla/ResumenClub';
import PlayerTable from '../components/plantilla/PlayerTable';
import playersData from '../data/players.json';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';
import usePersistentState from '../hooks/usePersistentState';

interface Player {
  id: string | number;
  number: number;
  name: string;
  position: string;
  ovr: number;
  age: number;
  contractYears: number;
  salary: number;
}

const PlayerDrawer = lazy(() => import('../components/plantilla/PlayerDrawer'));

const Plantilla = () => {
  const [players, setPlayers] = usePersistentState<Player[]>(
    'vz_players',
    playersData as Player[]
  );
  const { user } = useAuthStore();
  const { clubs } = useDataStore();
  const club = clubs.find(c => c.id === user?.clubId);
  const [active, setActive] = useState<Player | null>(null);
  const [search, setSearch] = useState('');

  return (
    <div>
      <PageHeader title="Plantilla" subtitle="Jugadores registrados en tu plantilla." />
      <div className="container mx-auto px-4 py-8">
        <ResumenClub club={club} players={players} />
        <div className="mt-6">
          <input
            data-cy="player-search"
            type="text"
            placeholder="Buscar jugador..."
            className="mb-4 w-full max-w-xs rounded bg-zinc-800 p-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <PlayerTable
            players={players}
            search={search}
            setPlayers={setPlayers}
            onSelectPlayer={setActive}
          />
        </div>
        {active && <PlayerDrawer player={active} onClose={() => setActive(null)} />}
      </div>
    </div>
  );
};

export default Plantilla;
