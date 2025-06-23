import { lazy, useState } from 'react';
import playersData from '../data/players.json';
import { dtClub } from '../data/mockData';
import usePersistentState from '../utils/usePersistentState';
import ResumenClub from '../components/plantilla/ResumenClub';
import PlayerTable from '../components/plantilla/PlayerTable';

const PlayerDrawer = lazy(() => import('../components/plantilla/PlayerDrawer'));

const PlantillaPage = () => {
  const [players, setPlayers] = usePersistentState('vz_players', playersData);
  const [active, setActive] = useState<null | typeof players[0]>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <ResumenClub club={{ name: dtClub.name, logo: dtClub.logo }} players={players} />
      <div className="mt-6">
        <PlayerTable players={players} setPlayers={setPlayers} onSelectPlayer={setActive} />
      </div>
      {active && (
        <PlayerDrawer player={active} onClose={() => setActive(null)} />
      )}
    </div>
  );
};

export default PlantillaPage;
