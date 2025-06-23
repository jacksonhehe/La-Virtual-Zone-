import FormationSelector from '../components/tacticas/FormationSelector';
import PitchCanvas, { TacticsState } from '../components/tacticas/PitchCanvas';
import TeamInstructions, { Instructions } from '../components/tacticas/TeamInstructions';
import SetPiecesManager, { SetPieces } from '../components/tacticas/SetPiecesManager';
import usePersistentState from '../utils/usePersistentState';
import { useDataStore } from '../store/dataStore';

const TacticasPage = () => {
  const { club } = useDataStore();
  const players = club.players.slice(0, 11);

  const initialState: TacticsState = {
    formation: club.formation,
    layout: [],
    instructions: { possession: 50, pressure: 50, width: 50, line: 50 },
    setPieces: {}
  };

  const [state, setState] = usePersistentState<TacticsState>('vz_tactics', initialState);

  const updateState = (s: Partial<TacticsState>) => setState({ ...state, ...s });

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Tácticas</h1>

      <div>
        <FormationSelector value={state.formation} onChange={f => updateState({ formation: f })} />
      </div>

      <PitchCanvas players={players} state={state} onChange={setState} />

      <TeamInstructions values={state.instructions} onChange={v => updateState({ instructions: v })} />

      <SetPiecesManager players={players} value={state.setPieces} onChange={v => updateState({ setPieces: v })} />
    </div>
  );
};

export default TacticasPage;
