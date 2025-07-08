import { lazy, useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import ResumenClub from '../components/plantilla/ResumenClub';
import PlayerTable from '../components/plantilla/PlayerTable';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';
import { Player as FullPlayer } from '../types/shared';

const PlayerDrawer = lazy(() => import('../components/plantilla/PlayerDrawer'));

interface TablePlayer {
  id: string | number;
  number: number;
  name: string;
  position: string;
  ovr: number;
  age: number;
  contractYears: number;
  salary: number;
  full: FullPlayer;
}

const Plantilla = () => {
  const { user } = useAuthStore();
  const { clubs, players: allPlayers, updatePlayerEntry } = useDataStore();
  const club = clubs.find(c => c.id === user?.clubId);
  const currentYear = new Date().getFullYear();
  const players: TablePlayer[] = allPlayers
    .filter(p => p.clubId === club?.id)
    .map(p => ({
      id: p.id,
      number: p.dorsal,
      name: p.name,
      position: p.position,
      ovr: p.overall,
      age: p.age,
      contractYears: p.contract ? new Date(p.contract.expires).getFullYear() - currentYear : 0,
      salary: p.contract?.salary ?? 0,
      full: p
    }));
  const [active, setActive] = useState<FullPlayer | null>(null);
  const [search, setSearch] = useState('');

  const updatePlayers: React.Dispatch<React.SetStateAction<TablePlayer[]>> =
    updater => {
      const next = typeof updater === 'function' ? updater(players) : updater;
      next.forEach(p => {
        const updated = {
          ...p.full,
          name: p.name,
          dorsal: p.number,
          overall: p.ovr,
          age: p.age,
          contract: p.full.contract
            ? { ...p.full.contract, salary: p.salary }
            : { expires: `${currentYear + p.contractYears}-06-30`, salary: p.salary }
        };
        updatePlayerEntry(updated);
      });
    };

  return (
    <div>
      <PageHeader title="Plantilla" subtitle="Jugadores registrados en tu plantilla." />
      <div className="container mx-auto px-4 py-8">
        <ResumenClub club={club} players={players.map(p => p.full)} />
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
            setPlayers={updatePlayers}
            onSelectPlayer={p => setActive(p.full)}
          />
        </div>
        {active && <PlayerDrawer player={active} onClose={() => setActive(null)} />}
      </div>
    </div>
  );
};

export default Plantilla;
