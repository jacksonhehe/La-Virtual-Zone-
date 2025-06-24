
import React, { useState } from "react";
import toast from "react-hot-toast";
import RenewContractModal from "./RenewContractModal";
import playersMock from "../../data/players.json";

interface Player {
  id: number;
  number: number;
  name: string;
  position: string;
  ovr: number;
  age: number;
  contractYears: number;
  salary: number;
}

const PlayerTable: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(playersMock as Player[]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Player | null>(null);

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
          {players.map((p) => (
            <tr
              key={p.id}
              className="border-b border-zinc-800 hover:bg-zinc-800"
            >
              <td className="px-4 py-2 text-center">{p.number}</td>
              <td className="px-4 py-2">{p.name}</td>
              <td className="px-4 py-2 text-center">{p.position}</td>
              <td className="px-4 py-2 text-center">{p.ovr}</td>
              <td className="px-4 py-2 text-center">{p.age}</td>
              <td className="px-4 py-2 text-center">{p.contractYears}y</td>
              <td className="px-4 py-2 text-center">
                <button
                  onClick={() => handleRenew(p)}
                  className="mr-2 text-accent hover:underline"
                >
                  Renovar
                </button>
                <button
                  onClick={() => handleSell(p)}
                  className="text-red-400 hover:underline"
                >
                  Vender
                </button>
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
