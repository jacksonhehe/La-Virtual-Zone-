import { lazy, useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import ResumenClub from '../components/plantilla/ResumenClub';
import PlayerTable from '../components/plantilla/PlayerTable';
import playersData from '../data/players.json';
import { dtClub } from '../data/mockData';
import type { Player } from '../types';
import usePersistentState from '../hooks/usePersistentState';

const PlayerDrawer = lazy(() => import('../components/plantilla/PlayerDrawer'));

const Plantilla = () => {
  const [players, setPlayers] = usePersistentState<Player[]>(
    'vz_players',
    playersData as Player[]
  );
  const [active, setActive] = useState<Player | null>(null);

  return (
    <div>
      <PageHeader title="Plantilla" subtitle="Jugadores registrados en tu plantilla." />
      <div className="container mx-auto px-4 py-8">
        <ResumenClub club={{ name: dtClub.name, logo: dtClub.logo }} players={players} />
        <div className="mt-6">
          <PlayerTable players={players} setPlayers={setPlayers} onSelectPlayer={setActive} />
        </div>
        {active && (
          <PlayerDrawer
            player={active}
            onClose={() => setActive(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Plantilla;
