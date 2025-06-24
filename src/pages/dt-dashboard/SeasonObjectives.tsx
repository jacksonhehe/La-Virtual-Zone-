import Card from '../../components/common/Card';
import ProgressBar from '../../components/common/ProgressBar';
import { useDataStore } from '../../store/dataStore';

const SeasonObjectives = () => {
  const { objectives } = useDataStore();

  return (
    <Card className="p-4">
      <h3 className="mb-4 text-xl font-semibold leading-tight">Objetivos de temporada</h3>
      <div className="space-y-4">
        <div>
          <p className="mb-1 text-xs text-gray-400">Clasificar top 5</p>
          <ProgressBar value={objectives.position} />
        </div>
        <div>
          <p className="mb-1 text-xs text-gray-400">Juego limpio</p>
          <ProgressBar value={objectives.fairplay} />
        </div>
      </div>
    </Card>
  );
};

export default SeasonObjectives;
