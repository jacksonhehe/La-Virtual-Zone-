import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Player } from '../../types/shared';
import { formatCurrency, formatDate } from '../../utils/helpers';
import useFocusTrap from '../../hooks/useFocusTrap';

interface Props {
  player: Player;
  onClose: () => void;
}

const PlayerDrawer = ({ player, onClose }: Props) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(drawerRef);

  useEffect(() => {
    drawerRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60" onClick={onClose}></div>
      <div
        className="w-full max-w-md bg-gray-900 overflow-y-auto p-6"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        ref={drawerRef}
        onKeyDown={handleKeyDown}
      >
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white absolute right-4 top-4"
        >
          <X size={20} />
        </button>
        <div className="flex items-center mb-4">
          <img src={player.image} alt={player.name} className="w-16 h-16 mr-4 rounded-full" />
          <div>
            <h3 className="text-xl font-bold">{player.name}</h3>
            <p className="text-sm text-gray-400">{player.position} • {player.age} años</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div>
            <p className="text-gray-400">Contrato hasta</p>
            <p>{formatDate(player.contract.expires)}</p>
          </div>
          <div>
            <p className="text-gray-400">Salario</p>
            <p>{formatCurrency(player.contract.salary)}</p>
          </div>
          <div>
            <p className="text-gray-400">Valor</p>
            <p>{formatCurrency(player.value)}</p>
          </div>
        </div>
        <h4 className="font-bold mb-2">Atributos</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(player.attributes).map(([key, val]) => (
            <div key={key} className="flex justify-between">
              <span className="text-gray-400 capitalize">{key}</span>
              <span>{val as number}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerDrawer;
