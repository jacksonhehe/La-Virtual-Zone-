import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/authHooks";
import { useGlobalStore } from "../../store/globalStore";
import { Users, TrendingUp, CheckCircle2, XCircle, Clock } from "lucide-react";

const Stat: React.FC<{ icon: React.ElementType; title: string; value: string | number; }> = ({ icon: Icon, title, value }) => (
  <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 flex items-center gap-3">
    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
      <Icon size={18} />
    </div>
    <div>
      <div className="text-xs text-gray-400">{title}</div>
      <div className="text-lg text-white font-semibold">{value}</div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const { users = [], transfers = [], refreshUsers, refreshTransfers } = useGlobalStore();

  useEffect(() => {
    // Gate (optional)
    if (user && user.role && user.role !== "admin") {
      nav("/");
    }
  }, [user, nav]);

  useEffect(() => {
    refreshUsers?.();
    refreshTransfers?.();
  }, [refreshUsers, refreshTransfers]);

  const totals = useMemo(() => {
    const list = Array.isArray(transfers) ? transfers : [];
    const total = list.length;
    const pending = list.filter(t => t.status === "pending").length;
    const approved = list.filter(t => t.status === "approved").length;
    const rejected = list.filter(t => t.status === "rejected").length;
    const volume = list.reduce((acc, t) => acc + (t.amount ?? t.fee ?? 0), 0);
    return { total, pending, approved, rejected, volume };
  }, [transfers]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Panel</h1>
        <p className="text-sm text-gray-400">Resumen general</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Stat icon={Users} title="Usuarios" value={Array.isArray(users) ? users.length : 0} />
        <Stat icon={TrendingUp} title="Transacciones" value={totals.total} />
        <Stat icon={Clock} title="Pendientes" value={totals.pending} />
        <Stat icon={CheckCircle2} title="Aprobadas" value={totals.approved} />
        <Stat icon={XCircle} title="Rechazadas" value={totals.rejected} />
      </div>

      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
        <div className="text-sm text-gray-300">
          Volumen total filtrado: <span className="text-white font-semibold">€{totals.volume.toLocaleString()}</span>
        </div>
        <div className="text-xs text-gray-500 mt-2">Datos mockeados en memoria — reemplaza con tu backend real cuando esté listo.</div>
      </div>
    </div>
  );
};

export default Dashboard;
