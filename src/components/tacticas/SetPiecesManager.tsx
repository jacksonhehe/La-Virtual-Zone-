import { Player } from '../../types/shared';

interface SetPieces {
  penalties?: string;
  freeKicks?: string;
  corners?: string;
}

interface SetPiecesManagerProps {
  players: Player[];
  value: SetPieces;
  onChange: (v: SetPieces) => void;
}

const Select = ({ label, value, onChange, players }: { label: string; value?: string; onChange: (id: string) => void; players: Player[] }) => (
  <div className="mb-2">
    <label className="block text-sm mb-1">{label}</label>
    <select className="p-2 rounded bg-gray-800 w-full" value={value || ''} onChange={e => onChange(e.target.value)}>
      <option value="">-</option>
      {players.map(p => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  </div>
);

const SetPiecesManager = ({ players, value, onChange }: SetPiecesManagerProps) => (
  <div className="p-4 bg-gray-800 rounded">
    <Select label="Penales" value={value.penalties} onChange={v => onChange({ ...value, penalties: v })} players={players} />
    <Select label="Tiros Libres" value={value.freeKicks} onChange={v => onChange({ ...value, freeKicks: v })} players={players} />
    <Select label="Córners" value={value.corners} onChange={v => onChange({ ...value, corners: v })} players={players} />
  </div>
);

export type { SetPieces };
export default SetPiecesManager;
