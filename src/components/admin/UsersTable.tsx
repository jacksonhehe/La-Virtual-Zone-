import { Edit, Trash } from 'lucide-react';
import { Club, User } from '../../types';

interface Props {
  users: User[];
  clubs: Club[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const UsersTable = ({ users, clubs, onEdit, onDelete }: Props) => (
  <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
            <th className="px-4 py-3 text-left">Usuario</th>
            <th className="px-4 py-3 text-center">Correo</th>
            <th className="px-4 py-3 text-center">Rol</th>
            <th className="px-4 py-3 text-center">Club</th>
            <th className="px-4 py-3 text-center">Estado</th>
            <th className="px-4 py-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => {
            const roleClasses =
              u.role === 'admin'
                ? 'bg-neon-red/20 text-neon-red'
                : u.role === 'dt'
                  ? 'bg-neon-green/20 text-neon-green'
                  : 'bg-secondary/20 text-secondary';
            const roleLabel =
              u.role === 'admin' ? 'Admin' : u.role === 'dt' ? 'DT' : 'Usuario';
            const userWithClub = u as User & { clubId?: string; club?: string };
            const clubName =
              clubs.find(c => c.id === userWithClub.clubId)?.name ||
              userWithClub.club ||
              '-';

            return (
              <tr key={u.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                      <img src={u.avatar} alt={u.username} />
                    </div>
                    <span className="font-medium">{u.username}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">{u.email}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${roleClasses}`}>
                    {roleLabel}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">{clubName}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1" />
                    Activo
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center space-x-2">
                    <button className="p-1 text-gray-400 hover:text-primary" onClick={() => onEdit(u)}>
                      <Edit size={16} />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-500" onClick={() => onDelete(u)}>
                      <Trash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

export default UsersTable;
