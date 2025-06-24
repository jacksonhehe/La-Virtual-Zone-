import { lazy, Suspense, useState, useEffect } from 'react';
import FormationSelector from '../components/tacticas/FormationSelector';
import TeamInstructions from '../components/tacticas/TeamInstructions';
import SetPiecesManager from '../components/tacticas/SetPiecesManager';
import CanvasSkeleton from '../components/CanvasSkeleton';
import Spinner from '../components/Spinner';
import usePersistentState from '../hooks/usePersistentState';
import { useDataStore } from '../store/dataStore';
import type { TacticsState } from '../components/tacticas/PitchCanvas';

const PitchCanvas = lazy(() => import('../components/tacticas/PitchCanvas'));

const linesSvg = (
  <svg className="pointer-events-none absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
    <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeOpacity="0.2" />
    <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeOpacity="0.2" />
  </svg>
);

const Tacticas = () => {
  const { club } = useDataStore();
  const players = club.players.slice(0, 11);

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const initialState: TacticsState = {
    formation: club.formation,
    layout: [],
    instructions: { possession: 50, pressure: 50, width: 50, line: 50 },
    setPieces: {}
  };

  const [state, setState] = usePersistentState<TacticsState>('vz_tactics', initialState);

  const updateState = (s: Partial<TacticsState>) => setState({ ...state, ...s });

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold">Tácticas</h1>
      <div>
        <FormationSelector value={state.formation} onChange={f => updateState({ formation: f })} />
      </div>
      <Suspense fallback={<Spinner />}>
        {loading ? (
          <CanvasSkeleton />
        ) : (
          <div className="relative">
            <PitchCanvas players={players} state={state} onChange={setState} />
            {linesSvg}
          </div>
        )}
      </Suspense>
      <TeamInstructions values={state.instructions} onChange={v => updateState({ instructions: v })} />
      <SetPiecesManager players={players} value={state.setPieces} onChange={v => updateState({ setPieces: v })} />
    </div>
  );
};

export default Tacticas;
