import { useNavigate } from 'react-router-dom';
import CreateTournamentWizard from '../../wizards/CreateTournament';

const NuevoTorneo = () => {
  const navigate = useNavigate();
  return <CreateTournamentWizard onClose={() => navigate(-1)} />;
};

export default NuevoTorneo;
