import { Edit, Trash } from 'lucide-react';
import { Club, Player } from '../../types';

interface Props {
  players: Player[];
  clubs: Club[];
  onEdit: (player: Player) => void;
  onDelete: (player: Player) => void;
}

const PlayersTable = ({ players, clubs, onEdit, onDelete }: Props) => (
  <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
            <th className="px-4 py-3 text-left">Jugador</th>
            <th className="px-4 py-3 text-center">Pos</th>
            <th className="px-4 py-3 text-center">Media</th>
            <th className="px-4 py-3 text-center">Edad</th>
            <th className="px-4 py-3 text-center">Club</th>
            <th className="px-4 py-3 text-center">Valor</th>
            <th className="px-4 py-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {players.map(player => (
            <tr key={player.id} className="border-b border-gray-800 hover:bg-dark-lighter">
              <td className="px-4 py-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-dark-lighter rounded-full flex items-center justify-center mr-2">
                    <span className="text-xs font-bold">{player.id}</span>
                  </div>
                  <div>
                    <div className="font-medium">{player.name}</div>
                    <div className="text-xs text-gray-400">{player.nationality}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-center">{player.position}</td>
              <td className="px-4 py-3 text-center font-medium">{player.overall}</td>
              <td className="px-4 py-3 text-center">{player.age}</td>
              <td className="px-4 py-3 text-center">{clubs.find(c => c.id === player.clubId)?.name}</td>
              <td className="px-4 py-3 text-center font-medium">
                {new Intl.NumberFormat('es-ES', {
                  style: 'currency',
                  currency: 'EUR',
                  maximumFractionDigits: 0
                }).format(player.transferValue)}
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex justify-center space-x-2">
                  <button className="p-1 text-gray-400 hover:text-primary" onClick={() => onEdit(player)}>
                    <Edit size={16} />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-500" onClick={() => onDelete(player)}>
                    <Trash size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default PlayersTable;
