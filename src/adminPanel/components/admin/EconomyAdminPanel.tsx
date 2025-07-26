import React, { useState } from 'react';
import { Coins, Plus } from 'lucide-react';
import { useEconomyStore } from '../../store/economyStore';
import { useGlobalStore } from '../../store/globalStore';
import { toast } from 'react-hot-toast';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';

const EconomyAdminPanel = () => {
  const { wallets, adjustBalance } = useEconomyStore();
  const { users } = useGlobalStore();

  const [showModal, setShowModal] = useState(false);
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState('');

  const handleSave = () => {
    if (!userId || amount === 0 || reason.trim() === '') {
      toast.error('Todos los campos son obligatorios');
      return;
    }
    const ok = adjustBalance(userId, amount, reason.trim());
    if (!ok) {
      toast.error('El saldo no puede quedar negativo');
      return;
    }
    toast.success('Saldo ajustado');
    setShowModal(false);
    setUserId('');
    setAmount(0);
    setReason('');
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-700/40 to-teal-700/40 p-8 border border-emerald-500/20">
        <h1 className="text-3xl font-bold text-white mb-2">Gestión de Economía</h1>
        <p className="text-gray-300 mb-4 max-w-xl">Administra Z-Coins, ajustes de saldo, reglas automáticas y transacciones.</p>
        <button className="btn-primary flex items-center space-x-2" aria-label="Ajustar saldo" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          <span>Ajustar saldo</span>
        </button>
      </div>
      {/* KPI placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-400">Z-Coins emitidas (hoy)</h3>
          <p className="text-3xl font-bold text-green-500 mt-2">0</p>
        </div>
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-400">Z-Coins gastadas (hoy)</h3>
          <p className="text-3xl font-bold text-red-500 mt-2">0</p>
        </div>
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-400">Balance neto</h3>
          <p className="text-3xl font-bold text-blue-500 mt-2">0</p>
        </div>
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-400">Transacciones</h3>
          <p className="text-3xl font-bold text-purple-500 mt-2">0</p>
        </div>
      </div>
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 min-h-[300px] flex items-center justify-center text-gray-500">
        Sección de gráficos próximamente...
      </div>

      {/* Modal Ajustar Saldo */}
      <Modal open={showModal} onClose={()=>setShowModal(false)} className="w-full max-w-lg">
          <div className="relative">
            <h2 className="text-xl font-bold text-white mb-4">Ajustar Saldo</h2>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="text-sm text-gray-300">Usuario *</label>
                <select className="input w-full mt-1" value={userId} onChange={e=>setUserId(e.target.value)}>
                  <option value="">Selecciona usuario</option>
                  {users.map(u=> (
                    <option key={u.id} value={u.id}>{u.username} (saldo: {wallets.find(w=>w.userId===u.id)?.balance || 0})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-300">Monto (+ / -) *</label>
                <input type="number" className="input w-full mt-1" value={amount} onChange={e=>setAmount(parseInt(e.target.value))} />
              </div>
              <div>
                <label className="text-sm text-gray-300">Motivo *</label>
                <textarea className="input w-full mt-1" rows={3} value={reason} onChange={e=>setReason(e.target.value)}></textarea>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={()=>{setShowModal(false);}}>Cancelar</Button>
              <Button onClick={handleSave}>Guardar</Button>
            </div>
            <button aria-label="Cerrar" onClick={()=>setShowModal(false)} className="absolute top-3 right-3 p-1 text-gray-400 hover:text-white">✕</button>
          </div>
       </Modal>
       )
    </div>
  );
};

export default EconomyAdminPanel; 