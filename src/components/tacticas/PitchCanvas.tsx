import { useState } from 'react';
import { Player } from '../../types/shared';
import usePersistentState from '../../hooks/usePersistentState';
import PlayerCard from './PlayerCard';
import SynergyIndicator from './SynergyIndicator';
import { Instructions } from './TeamInstructions';
import { SetPieces } from './SetPiecesManager';

interface LayoutItem {
  row: number;
  col: number;
  playerId: string;
}

interface TacticsState {
  formation: string;
  layout: LayoutItem[];
  instructions: Instructions;
  setPieces: SetPieces;
}

interface PitchCanvasProps {
  players: Player[];
  state: TacticsState;
  onChange: (s: TacticsState) => void;
}

const rows = 6;
const cols = 4;

const PitchCanvas = ({ players, state, onChange }: PitchCanvasProps) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [, save] = usePersistentState('vz_tactics', state); // ensure key exists

  const layout = state.layout;

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, row: number, col: number) => {
    const id = e.dataTransfer.getData('text/plain');
    const without = layout.filter(l => l.playerId !== id);
    const updated = [...without, { playerId: id, row, col }];
    const newState = { ...state, layout: updated };
    onChange(newState);
    save(newState);
  };

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setSelected(id === selected ? null : id);
  };

  const synergy = Math.round((layout.length / players.length) * 100);

  return (
    <div>
      <SynergyIndicator value={synergy} />
      <div className="grid grid-rows-6 grid-cols-4 gap-2 bg-green-700 p-4 rounded">
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => {
            const item = layout.find(l => l.row === r && l.col === c);
            const player = item ? players.find(p => p.id === item.playerId) : undefined;
            return (
              <div
                data-cy="pitch-slot"
                key={`${r}-${c}`}
                className="relative border border-white/20 h-16 flex items-center justify-center"
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDrop(e, r, c)}
              >
                {player && (
                  <div onContextMenu={e => handleContextMenu(e, player.id)} className="w-full">
                    <PlayerCard player={player} />
                    {selected === player.id && (
                      <div className="absolute top-full left-0 mt-1 bg-gray-800 text-xs p-2 rounded z-10">
                        Instrucciones del jugador
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export type { TacticsState };
export default PitchCanvas;
