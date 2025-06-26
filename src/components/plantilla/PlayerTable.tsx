
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import RenewContractModal from './RenewContractModal';
import { getPositionColor, getOverallColor } from '../../utils/helpers';

interface Player {
  id: string;
  number: number;
  name: string;
  position: string;
  ovr: number;
  age: number;
  contractYears: number;
  salary: number;
}

interface Props {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  onSelectPlayer: (p: Player) => void;
  search: string;
}

const PlayerTable = ({ players, setPlayers, onSelectPlayer, search }: Props) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Player | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [sortBy, setSortBy] = useState<keyof Player>('number');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const searchLower = search.toLowerCase();
  const filtered = players.filter(
    (p) =>
      p.name.toLowerCase().includes(searchLower) ||
      p.position.toLowerCase().includes(searchLower)
  );

  const handleRenew = (player: Player) => {
    setSelected(player);
    setModalOpen(true);
  };

  const confirmRenew = (years: number, salary: number) => {
    setPlayers((prev) =>
      prev.map((p) =>
        selected && p.id === selected.id
          ? { ...p, contractYears: years, salary }
          : p
      )
    );
  };

  const handleSell = (player: Player) => {
    toast.success(`${player.name} añadido al mercado`);
  };

  const handleEdit = (player: Player) => {
    setEditingId(player.id);
    setEditingName(player.name);
  };

  const handleSort = (field: keyof Player) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const saveEdit = () => {
    if (!editingId) return;
    setPlayers(prev =>
      prev.map(p => (p.id === editingId ? { ...p, name: editingName } : p))
    );
    setEditingId(null);
  };

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[640px] w-full text-sm">
        <thead>
          <tr className="bg-zinc-900">
            <th scope="col" className="px-4 py-2">
              #
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left cursor-pointer"
              onClick={() => handleSort('name')}
              data-cy="sort-name"
            >
              Nombre
            </th>
            <th
              scope="col"
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort('position')}
              data-cy="sort-position"
            >
              POS
            </th>
            <th
              scope="col"
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort('ovr')}
              data-cy="sort-ovr"
            >
              OVR
            </th>
            <th
              scope="col"
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort('age')}
              data-cy="sort-age"
            >
              Edad
            </th>
            <th
              scope="col"
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort('contractYears')}
              data-cy="sort-contract"
            >
              Contrato
            </th>
            <th scope="col" className="px-4 py-2">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(p => (
            <tr
              key={p.id}
              className="border-b border-zinc-800 hover:bg-zinc-800"
              onClick={() => onSelectPlayer(p)}
            >
              <td className="px-4 py-2 text-center">{p.number}</td>
              <td className="px-4 py-2">
                {editingId === p.id ? (
                  <input
                    data-cy="player-name-input"
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    className="rounded bg-zinc-700 p-1 text-sm"
                  />
                ) : (
                  p.name
                )}
              </td>
              <td className="px-4 py-2 text-center">
                <span className={`px-2 py-0.5 rounded ${getPositionColor(p.position)}`}>
                  {p.position}
                </span>
              </td>
              <td className="px-4 py-2 text-center">
                <span className={`px-2 py-0.5 rounded ${getOverallColor(p.ovr)}`}>
                  {p.ovr}
                </span>
              </td>
              <td className="px-4 py-2 text-center">{p.age}</td>
              <td className="px-4 py-2 text-center">{p.contractYears}y</td>
              <td className="px-4 py-2 text-center space-x-2">
                {editingId === p.id ? (
                  <button
                    data-cy="save-player"
                    onClick={saveEdit}
                    className="text-green-400 hover:underline"
                  >
                    Guardar
                  </button>
                ) : (
                  <>
                    <button
                      data-cy="edit-player"
                      onClick={() => handleEdit(p)}
                      className="text-blue-400 hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleRenew(p)}
                      className="text-accent hover:underline"
                    >
                      Renovar
                    </button>
                    <button
                      onClick={() => handleSell(p)}
                      className="text-red-400 hover:underline"
                    >
                      Vender
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <RenewContractModal
        isOpen={modalOpen}
        player={selected}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmRenew}
      />
    </div>
  );
};

export default PlayerTable;
