import React, { useEffect, useMemo, useState } from "react";
import { Search, RefreshCcw, Ban, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useGlobalStore as useGlobalStoreHook } from "../../store/globalStore";

const toSafeText = (v: any) => (v ?? "").toString();
const toLower = (v: any) => toSafeText(v).toLowerCase();

const Usuarios: React.FC = () => {
  const { users = [], refreshUsers, banUser, activateUser } = useGlobalStoreHook();
  const [q, setQ] = useState("");

  useEffect(() => {
    refreshUsers?.();
  }, [refreshUsers]);

  const filtered = useMemo(() => {
    const query = toLower(q);
    const list = Array.isArray(users) ? users : [];
    if (!query) return list;
    return list.filter((u) => {
      const name = toLower(u?.name);
      const email = toLower(u?.email);
      const role = toLower(u?.role);
      return name.includes(query) || email.includes(query) || role.includes(query);
    });
  }, [users, q]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <Search size={18} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Usuarios</h1>
            <p className="text-sm text-gray-400">Gestión de cuentas</p>
          </div>
        </div>
        <button className="btn-secondary" onClick={() => refreshUsers?.()}>
          <RefreshCcw size={14} className="mr-2" />
          Refrescar
        </button>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
        <input
          className="input w-full"
          placeholder="Buscar por nombre, email, rol…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-black/30 text-gray-400">
            <tr>
              <th className="text-left p-3">Nombre</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Rol</th>
              <th className="text-left p-3">Estado</th>
              <th className="text-right p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length ? (
              filtered.map((u) => (
                <tr key={u.id} className="border-t border-gray-800">
                  <td className="p-3 text-white">{toSafeText(u?.name) || "—"}</td>
                  <td className="p-3 text-gray-300">{toSafeText(u?.email) || "—"}</td>
                  <td className="p-3 text-gray-300">{toSafeText(u?.role) || "user"}</td>
                  <td className="p-3">
                    <span
                      className={
                        "text-xs px-2 py-1 rounded " +
                        (u?.active ? "bg-green-900/40 text-green-300" : "bg-red-900/40 text-red-300")
                      }
                    >
                      {u?.active ? "Activo" : "Suspendido"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {u?.active ? (
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          banUser?.(u.id);
                          toast.success("Usuario suspendido");
                        }}
                      >
                        <Ban size={14} className="mr-2" />
                        Suspender
                      </button>
                    ) : (
                      <button
                        className="btn-primary"
                        onClick={() => {
                          activateUser?.(u.id);
                          toast.success("Usuario reactivado");
                        }}
                      >
                        <Check size={14} className="mr-2" />
                        Activar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-6 text-center text-gray-400" colSpan={5}>
                  No se encontraron usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Usuarios;
