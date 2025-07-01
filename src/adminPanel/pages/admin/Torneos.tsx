import { useLocation } from 'react-router-dom';
import TournamentsAdminPanel from '../../components/admin/TournamentsAdminPanel';
import { Tournament } from '../../types';

const Torneos = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const statusParam = params.get('status') as Tournament['status'] | null;

  return (
    <div className="p-6">
      <TournamentsAdminPanel status={statusParam || undefined} />
    </div>
  );
};

export default Torneos;
 