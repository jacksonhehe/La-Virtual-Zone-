
import React, { useState } from "react";
import toast from "react-hot-toast";

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

interface Props {
  isOpen: boolean;
  player: Player | null;
  onClose: () => void;
  onConfirm: (years: number, salary: number) => void;
}

const RenewContractModal: React.FC<Props> = ({
  isOpen,
  player,
  onClose,
  onConfirm,
}) => {
  const [years, setYears] = useState(2);
  const [salary, setSalary] = useState(player?.salary ?? 5000);

  if (!isOpen || !player) return null;

  const handleConfirm = () => {
    onConfirm(years, salary);
    toast.success(`Contrato de ${player.name} renovado por ${years} años`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md rounded-lg bg-zinc-800 p-6">
        <h2 className="mb-4 text-lg font-bold">
          Renovar contrato – {player.name}
        </h2>
        <label className="mb-4 block">
          <span className="text-sm">Años: {years}</span>
          <input
            type="range"
            min={1}
            max={5}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="mb-6 block">
          <span className="text-sm">Salario semanal (Z$)</span>
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(Number(e.target.value))}
            className="mt-1 w-full rounded bg-zinc-700 p-2"
          />
        </label>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="rounded bg-zinc-600 px-4 py-2 text-sm hover:bg-zinc-500"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="rounded bg-accent px-4 py-2 text-sm text-black hover:opacity-90"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenewContractModal;
