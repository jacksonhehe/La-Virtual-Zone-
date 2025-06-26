
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import RenewContractModal from './RenewContractModal';

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

  const searchLower = search.toLowerCase();
  const filteredPlayers = players.filter(
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

  const saveEdit = () => {
    if (!editingId) return;
    setPlayers(prev =>
      prev.map(p => (p.id === editingId ? { ...p, name: editingName } : p))
    );
    setEditingId(null);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[640px] w-full text-sm">
        <thead>
          <tr className="bg-zinc-900">
            <th scope="col" className="px-4 py-2">
              #
            </th>
            <th scope="col" className="px-4 py-2 text-left">
              Nombre
            </th>
            <th scope="col" className="px-4 py-2">
              POS
            </th>
            <th scope="col" className="px-4 py-2">
              OVR
            </th>
            <th scope="col" className="px-4 py-2">
              Edad
            </th>
            <th scope="col" className="px-4 py-2">
              Contrato
            </th>
            <th scope="col" className="px-4 py-2">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredPlayers.map(p => (
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
              <td className="px-4 py-2 text-center">{p.position}</td>
              <td className="px-4 py-2 text-center">{p.ovr}</td>
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
