import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import { fetchUsers, UserQuery } from '../utils/userService';
import { User } from '../types/shared';

const PAGE_SIZE = 10;

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState<UserQuery>({ page: 1, pageSize: PAGE_SIZE, search: '' });

  useEffect(() => {
    setLoading(true);
    fetchUsers(query).then(res => {
      setUsers(res.users);
      setTotal(res.total);
      setLoading(false);
    });
  }, [query]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const changePage = (p: number) => {
    setQuery(prev => ({ ...prev, page: p }));
  };

  return (
    <div>
      <PageHeader title="Usuarios" subtitle="Directorio de la comunidad" />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <input
            type="text"
            className="input"
            placeholder="Buscar usuario"
            value={query.search}
            onChange={e => setQuery({ ...query, search: e.target.value, page: 1 })}
          />
        </div>
        <div className="overflow-x-auto bg-dark rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-900 text-left">
                <th className="px-4 py-2">Avatar</th>
                <th className="px-4 py-2">Usuario</th>
                <th className="px-4 py-2">Rol</th>
                <th className="px-4 py-2">Club</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <tr key={i} className="animate-pulse border-b border-zinc-800">
                      <td className="px-4 py-2">
                        <div className="w-8 h-8 rounded-full bg-zinc-700" />
                      </td>
                      <td className="px-4 py-2">
                        <div className="h-4 w-24 bg-zinc-700 rounded" />
                      </td>
                      <td className="px-4 py-2">
                        <div className="h-4 w-16 bg-zinc-700 rounded" />
                      </td>
                      <td className="px-4 py-2">
                        <div className="h-4 w-24 bg-zinc-700 rounded" />
                      </td>
                    </tr>
                  ))
                : users.map(u => (
                    <tr key={u.id} className="border-b border-zinc-800">
                      <td className="px-4 py-2">
                        <img
                          src={u.avatar}
                          alt={u.username}
                          className="w-8 h-8 rounded-full"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Link
                          to={`/usuarios/${u.username}`}
                          className="text-primary hover:text-primary-light"
                        >
                          {u.username}
                        </Link>
                      </td>
                      <td className="px-4 py-2 capitalize">{u.role}</td>
                      <td className="px-4 py-2">{u.club || '-'}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {!loading && totalPages > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            <button
              disabled={query.page === 1}
              onClick={() => changePage(query.page! - 1)}
              className="btn-outline px-3 py-1 text-sm disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-2 py-1 text-sm">
              Página {query.page} de {totalPages}
            </span>
            <button
              disabled={query.page === totalPages}
              onClick={() => changePage(query.page! + 1)}
              className="btn-outline px-3 py-1 text-sm disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
