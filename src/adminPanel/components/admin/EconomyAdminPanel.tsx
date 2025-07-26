import React, { useState, useMemo } from 'react';
import { Coins, Plus, Filter } from 'lucide-react';
import { useEconomySlice } from '../../../store/economySlice';
import { useGlobalStore } from '../../store/globalStore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { toast } from 'react-hot-toast';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';

const ranges = {
  today: { label: 'Hoy', getStart: () => new Date(new Date().setHours(0,0,0,0)) },
  week: { label: 'Semana', getStart: () => new Date(Date.now()-1000*60*60*24*7) },
  month: { label: 'Mes', getStart: () => new Date(Date.now()-1000*60*60*24*30) },
};

const EconomyAdminPanel = () => {
  const { wallets, transactions, adjustBalance } = useEconomySlice();
  const { users } = useGlobalStore();

  const [showModal, setShowModal] = useState(false);
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState('');

  const [rangeKey, setRangeKey] = useState<'today'|'week'|'month'|'custom'>('today');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const [filterUser, setFilterUser] = useState('');
  const [filterType, setFilterType] = useState<'all'|'credit'|'debit'>('all');
  const [filterSource, setFilterSource] = useState('');
  const [filterReason, setFilterReason] = useState('');

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

  // Rango seleccionado
  const { fromDate, toDate } = useMemo(()=>{
    if(rangeKey==='custom' && customFrom && customTo){
      return { fromDate: new Date(customFrom), toDate: new Date(customTo) };
    }
    if(rangeKey!=='custom'){
      const start = ranges[rangeKey].getStart();
      return { fromDate:start, toDate:new Date() };
    }
    return { fromDate:new Date(0), toDate:new Date() };
  },[rangeKey, customFrom, customTo]);

  const txInRange = useMemo(()=> transactions.filter(tx=>{
    const ts = new Date(tx.createdAt).getTime();
    return ts>=fromDate.getTime() && ts<=toDate.getTime();
  }),[transactions,fromDate,toDate]);

  // KPI metrics
  const emitted = txInRange.filter(t=>t.type==='credit').reduce((s,t)=>s+t.amount,0);
  const spent = txInRange.filter(t=>t.type==='debit').reduce((s,t)=>s+t.amount,0);
  const net = emitted - spent;

  // Chart data by day
  const dailyMap: Record<string,{ date:string, credit:number, debit:number}> = {};
  txInRange.forEach(t=>{
    const d = new Date(t.createdAt).toLocaleDateString();
    if(!dailyMap[d]) dailyMap[d]={ date:d, credit:0, debit:0};
    if(t.type==='credit') dailyMap[d].credit += t.amount; else if(t.type==='debit') dailyMap[d].debit += t.amount;
  });
  const chartData = Object.values(dailyMap).sort((a,b)=> new Date(a.date).getTime()-new Date(b.date).getTime());

  // pie data
  const catMap: Record<string,number> = {};
  txInRange.filter(t=>t.type==='debit').forEach(t=>{ catMap[t.source]=(catMap[t.source]||0)+t.amount;});
  const pieData = Object.entries(catMap).map(([name,value])=>({name,value}));

  const COLORS = ['#60a5fa','#e879f9','#facc15','#34d399','#f87171','#a78bfa'];

  const filteredTx = useMemo(()=>{
    return txInRange.filter(tx=>{
      if(filterUser && !tx.userId.includes(filterUser)) return false;
      if(filterType!=='all' && tx.type!==filterType) return false;
      if(filterSource && !tx.source.includes(filterSource)) return false;
      if(filterReason && !tx.reason.toLowerCase().includes(filterReason.toLowerCase())) return false;
      return true;
    });
  },[txInRange,filterUser,filterType,filterSource,filterReason]);

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
      {/* Selector rango */}
      <div className="flex flex-wrap items-center gap-3">
        {(['today','week','month'] as const).map(key=> (
          <button key={key} className={`btn-secondary ${rangeKey===key?'bg-primary text-white':''}`} onClick={()=>setRangeKey(key)}> {ranges[key].label} </button>
        ))}
        <button className={`btn-secondary ${rangeKey==='custom'?'bg-primary text-white':''}`} onClick={()=>setRangeKey('custom')}>Personalizado</button>
        {rangeKey==='custom' && (
          <>
            <input type="date" className="input" value={customFrom} onChange={e=>setCustomFrom(e.target.value)} />
            <input type="date" className="input" value={customTo} onChange={e=>setCustomTo(e.target.value)} />
          </>
        )}
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-400">Z-Coins emitidas</h3>
          <p className="text-3xl font-bold text-green-500 mt-2">{emitted}</p>
        </div>
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-400">Z-Coins gastadas</h3>
          <p className="text-3xl font-bold text-red-500 mt-2">{spent}</p>
        </div>
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-400">Balance neto</h3>
          <p className={`text-3xl font-bold mt-2 ${net>=0?'text-blue-500':'text-red-400'}`}>{net}</p>
        </div>
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-400">Transacciones</h3>
          <p className="text-3xl font-bold text-purple-500 mt-2">{txInRange.length}</p>
        </div>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{top:10,right:10,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Legend />
              <Bar dataKey="credit" fill="#10b981" animationDuration={800} />
              <Bar dataKey="debit" fill="#ef4444" animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 h-72 lg:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} innerRadius={40} animationDuration={800}>
                {pieData.map((_,index)=>(<Cell key={index} fill={COLORS[index%COLORS.length]} />))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla transacciones */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Filter size={16}/>Transacciones</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
          <input className="input" placeholder="Usuario" value={filterUser} onChange={e=>setFilterUser(e.target.value)} />
          <select className="input" value={filterType} onChange={e=>setFilterType(e.target.value as any)}>
            <option value="all">Todos</option>
            <option value="credit">Créditos</option>
            <option value="debit">Débitos</option>
          </select>
          <input className="input" placeholder="Categoría" value={filterSource} onChange={e=>setFilterSource(e.target.value)} />
          <input className="input" placeholder="Motivo" value={filterReason} onChange={e=>setFilterReason(e.target.value)} />
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-sm text-left">
            <thead><tr className="text-gray-400 text-xs border-b border-gray-700"><th>ID</th><th>Usuario</th><th>Tipo</th><th>Monto</th><th>Categoría</th><th>Motivo</th><th>Fecha</th></tr></thead>
            <tbody>
              {filteredTx.map(tx=> (
                <tr key={tx.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td>{tx.id.slice(0,6)}…</td>
                  <td>{tx.userId}</td>
                  <td>{tx.type==='credit'? 'Ingreso': 'Gasto'}</td>
                  <td className={tx.type==='debit'? 'text-red-400':'text-green-400'}>{tx.type==='debit'? '-':''}{tx.amount}</td>
                  <td>{tx.source}</td>
                  <td>{tx.reason}</td>
                  <td>{new Date(tx.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-4">
          <button className="btn-secondary" onClick={()=>{
            const rows=[['ID','Usuario','Tipo','Monto','Categoría','Motivo','Fecha'],...filteredTx.map(tx=>[tx.id,tx.userId,tx.type,tx.amount,tx.source,tx.reason,tx.createdAt])];
            const csv=rows.map(r=>r.join(',')).join('\n');
            const blob=new Blob([csv],{type:'text/csv'});
            const url=URL.createObjectURL(blob);
            const a=document.createElement('a');a.href=url;a.download='economy.csv';a.click();URL.revokeObjectURL(url);
          }} aria-label="Exportar CSV">Exportar CSV</button>
        </div>
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
                    <option key={u.id} value={u.id}>{u.username} (saldo: {wallets[u.id] || 0})</option>
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
