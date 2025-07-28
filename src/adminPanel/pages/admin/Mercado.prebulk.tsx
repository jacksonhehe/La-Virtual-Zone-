
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, X, Filter, TrendingUp, Clock, AlertCircle, Search, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGlobalStore } from '../../store/globalStore';
import StatsCard from '../../components/admin/StatsCard';

type T = any;

const unique = (arr: (string | number | undefined | null)[]) => {
  const s = new Set<string>();
  arr.forEach(v => {
    if (v === undefined || v === null) return;
    const val = String(v).trim();
    if (val) s.add(val);
  });
  return Array.from(s);
};

const Mercado: React.FC = () => {
  const { transfers, approveTransfer, rejectTransfer, refreshTransfers } = useGlobalStore();
  const [filter, setFilter] = useState<'all'|'pending'|'approved'|'rejected'>('pending');
  const [search, setSearch] = useState('');
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Filtros avanzados
  const [playerQ, setPlayerQ] = useState('');
  const [clubFrom, setClubFrom] = useState('');
  const [clubTo, setClubTo] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc'|'date_asc'|'amount_desc'|'amount_asc'>('date_desc');

  // Autocomplete UI state
  const [showFromOpts, setShowFromOpts] = useState(false);
  const [showToOpts, setShowToOpts] = useState(false);
  const [showPlayerOpts, setShowPlayerOpts] = useState(false);

  const csvRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    refreshTransfers?.();
  }, [refreshTransfers]);

  const filtered: T[] = useMemo(() => {
    let list: T[] = Array.isArray(transfers) ? [...transfers] : [];
    if (filter !== 'all') list = list.filter(t => t.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        String(t.id).toLowerCase().includes(q) ||
        String(t.playerId).toLowerCase().includes(q) ||
        String(t.playerName || '').toLowerCase().includes(q) ||
        String(t.fromClubId || t.fromClubName || '').toLowerCase().includes(q) ||
        String(t.toClubId || t.toClubName || '').toLowerCase().includes(q)
      );
    }
    if (playerQ.trim()) {
      const q = playerQ.toLowerCase();
      list = list.filter(t =>
        String(t.playerId).toLowerCase().includes(q) ||
        String(t.playerName || '').toLowerCase().includes(q)
      );
    }
    if (clubFrom.trim()) list = list.filter(t => String(t.fromClubId || t.fromClubName || '').toLowerCase().includes(clubFrom.toLowerCase()));
    if (clubTo.trim()) list = list.filter(t => String(t.toClubId || t.toClubName || '').toLowerCase().includes(clubTo.toLowerCase()));
    if (dateFrom) list = list.filter(t => new Date(t.createdAt || t.date).getTime() >= new Date(dateFrom).getTime());
    if (dateTo) list = list.filter(t => new Date(t.createdAt || t.date).getTime() <= new Date(dateTo).getTime() + 86399999);
    const min = Number(minAmount); const max = Number(maxAmount);
    if (!Number.isNaN(min) && minAmount !== '') list = list.filter(t => (t.amount ?? t.fee ?? 0) >= min);
    if (!Number.isNaN(max) && maxAmount !== '') list = list.filter(t => (t.amount ?? t.fee ?? 0) <= max);
    switch (sortBy) {
      case 'date_asc': list.sort((a,b)=> new Date(a.createdAt||a.date).getTime() - new Date(b.createdAt||b.date).getTime()); break;
      case 'amount_desc': list.sort((a,b)=> (b.amount??b.fee??0) - (a.amount??a.fee??0)); break;
      case 'amount_asc': list.sort((a,b)=> (a.amount??a.fee??0) - (b.amount??b.fee??0)); break;
      default: list.sort((a,b)=> new Date(b.createdAt||b.date).getTime() - new Date(a.createdAt||a.date).getTime());
    }
    return list;
  }, [transfers, filter, search, playerQ, clubFrom, clubTo, dateFrom, dateTo, minAmount, maxAmount, sortBy]);

  const pendingCount = useMemo(() => filtered.filter(t => t.status === 'pending').length, [filtered]);
  const approvedCount = useMemo(() => filtered.filter(t => t.status === 'approved').length, [filtered]);
  const rejectedCount = useMemo(() => filtered.filter(t => t.status === 'rejected').length, [filtered]);
  const totalValue = useMemo(() => filtered.reduce((sum, t) => sum + (t.amount ?? t.fee ?? 0), 0), [filtered]);

  // Autocomplete options from current dataset
  const clubFromOptions = useMemo(() => {
    const opts = unique((transfers || []).map((t: T) => t.fromClubName || t.fromClubId));
    return clubFrom ? opts.filter(o => o.toLowerCase().includes(clubFrom.toLowerCase())) : opts;
  }, [transfers, clubFrom]);
  const clubToOptions = useMemo(() => {
    const opts = unique((transfers || []).map((t: T) => t.toClubName || t.toClubId));
    return clubTo ? opts.filter(o => o.toLowerCase().includes(clubTo.toLowerCase())) : opts;
  }, [transfers, clubTo]);
  const playerOptions = useMemo(() => {
    const opts = unique((transfers || []).map((t: T) => t.playerName || t.playerId));
    return playerQ ? opts.filter(o => o.toLowerCase().includes(playerQ.toLowerCase())) : opts;
  }, [transfers, playerQ]);

  const exportCSV = () => {
    const rows = filtered.map(t => ({
      id: t.id,
      playerId: t.playerId,
      playerName: t.playerName || '',
      from: t.fromClubId || t.fromClubName || '',
      to: t.toClubId || t.toClubName || '',
      amount: t.amount ?? t.fee ?? 0,
      status: t.status,
      date: t.createdAt || t.date
    }));
    const header = Object.keys(rows[0] || {id:'',playerId:'',playerName:'',from:'',to:'',amount:'',status:'',date:''}).join(',');
    const body = rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const csv = header + '\n' + body;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = csvRef.current || document.createElement('a');
    a.href = url;
    a.download = `transferencias_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const json = JSON.stringify(filtered, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transferencias_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyJSON = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(filtered, null, 2));
      toast.success('JSON copiado al portapapeles');
    } catch (e) {
      toast.error('No se pudo copiar el JSON');
    }
  };

  const handleApprove = (id: string) => {
    approveTransfer?.(id);
    toast.success('Transferencia aprobada');
  };

  const handleReject = () => {
    if (!rejectModal || !rejectReason.trim()) return;
    rejectTransfer?.(rejectModal, rejectReason);
    setRejectModal(null);
    setRejectReason('');
    toast.success('Oferta rechazada');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Mercado de transferencias</h1>
            <p className="text-sm text-gray-400">Modera ofertas y traspasos</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard icon={Clock}       title="Pendientes"     value={pendingCount}  gradient="from-yellow-500 to-orange-600" />
        <StatsCard icon={Check}       title="Aprobadas"      value={approvedCount} gradient="from-green-500 to-emerald-600" />
        <StatsCard icon={X}           title="Rechazadas"     value={rejectedCount} gradient="from-red-500 to-pink-600" />
        <StatsCard icon={AlertCircle} title="Monto filtrado" value={`€${totalValue.toLocaleString()}`} gradient="from-blue-500 to-purple-600" />
      </div>

      {/* Filtros avanzados */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          <div>
            <label className="text-sm text-gray-400">Estado</label>
            <select className="input mt-1" value={filter} onChange={e=>setFilter(e.target.value as any)}>
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobados</option>
              <option value="rejected">Rechazados</option>
            </select>
          </div>
          <div className="relative">
            <label className="text-sm text-gray-400">Jugador</label>
            <input
              className="input mt-1 w-full"
              placeholder="Nombre o ID"
              value={playerQ}
              onChange={e=>{setPlayerQ(e.target.value); setShowPlayerOpts(true);}}
              onFocus={()=>setShowPlayerOpts(true)}
              onBlur={()=>setTimeout(()=>setShowPlayerOpts(false), 150)}
            />
            {showPlayerOpts && playerOptions.length > 0 && (
              <div className="absolute z-20 mt-1 w-full max-h-48 overflow-auto bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
                {playerOptions.slice(0,50).map(opt => (
                  <div key={opt} className="px-3 py-2 text-sm hover:bg-gray-800 cursor-pointer" onMouseDown={()=>{ setPlayerQ(opt); }}>
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <label className="text-sm text-gray-400">Club comprador</label>
            <input
              className="input mt-1 w-full"
              placeholder="Nombre o ID"
              value={clubFrom}
              onChange={e=>{setClubFrom(e.target.value); setShowFromOpts(true);}}
              onFocus={()=>setShowFromOpts(true)}
              onBlur={()=>setTimeout(()=>setShowFromOpts(false), 150)}
            />
            {showFromOpts && clubFromOptions.length > 0 && (
              <div className="absolute z-20 mt-1 w-full max-h-48 overflow-auto bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
                {clubFromOptions.slice(0,50).map(opt => (
                  <div key={opt} className="px-3 py-2 text-sm hover:bg-gray-800 cursor-pointer" onMouseDown={()=>{ setClubFrom(opt); }}>
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <label className="text-sm text-gray-400">Club vendedor</label>
            <input
              className="input mt-1 w-full"
              placeholder="Nombre o ID"
              value={clubTo}
              onChange={e=>{setClubTo(e.target.value); setShowToOpts(true);}}
              onFocus={()=>setShowToOpts(true)}
              onBlur={()=>setTimeout(()=>setShowToOpts(false), 150)}
            />
            {showToOpts && clubToOptions.length > 0 && (
              <div className="absolute z-20 mt-1 w-full max-h-48 overflow-auto bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
                {clubToOptions.slice(0,50).map(opt => (
                  <div key={opt} className="px-3 py-2 text-sm hover:bg-gray-800 cursor-pointer" onMouseDown={()=>{ setClubTo(opt); }}>
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-400">Desde</label>
            <input type="date" className="input mt-1" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-400">Hasta</label>
            <input type="date" className="input mt-1" value={dateTo} onChange={e=>setDateTo(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-400">Ordenar por</label>
            <select className="input mt-1" value={sortBy} onChange={e=>setSortBy(e.target.value as any)}>
              <option value="date_desc">Fecha ↓</option>
              <option value="date_asc">Fecha ↑</option>
              <option value="amount_desc">Monto ↓</option>
              <option value="amount_asc">Monto ↑</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
          <div>
            <label className="text-sm text-gray-400">Monto mín.</label>
            <input type="number" className="input mt-1" value={minAmount} onChange={e=>setMinAmount(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-400">Monto máx.</label>
            <input type="number" className="input mt-1" value={maxAmount} onChange={e=>setMaxAmount(e.target.value)} />
          </div>
          <div className="flex items-end">
            <button className="btn-secondary w-full" onClick={()=>{
              setFilter('all'); setPlayerQ(''); setClubFrom(''); setClubTo('');
              setDateFrom(''); setDateTo(''); setMinAmount(''); setMaxAmount(''); setSearch('');
            }}>Limpiar</button>
          </div>
          <div className="flex items-end gap-2">
            <button className="btn-primary w-full" onClick={exportCSV}>Exportar CSV</button>
          </div>
          <div className="flex items-end gap-2">
            <button className="btn-secondary w-full" onClick={exportJSON}>Exportar JSON</button>
            <button className="btn-secondary w-full" onClick={copyJSON}>Copiar JSON</button>
            <a ref={csvRef} style={{display:'none'}} />
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-400">
          <span className="mr-4">Resultados: <span className="text-white font-medium">{filtered.length}</span></span>
          <span className="mr-4">Pendientes: <span className="text-white font-medium">€{filtered.filter(t=>t.status==='pending').reduce((s,t)=>s+(t.amount??t.fee??0),0).toLocaleString()}</span></span>
          <span className="mr-4">Aprobados: <span className="text-white font-medium">€{filtered.filter(t=>t.status==='approved').reduce((s,t)=>s+(t.amount??t.fee??0),0).toLocaleString()}</span></span>
          <span>Rechazados: <span className="text-white font-medium">€{filtered.filter(t=>t.status==='rejected').reduce((s,t)=>s+(t.amount??t.fee??0),0).toLocaleString()}</span></span>
        </div>
      </div>

      {/* Search + selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por ID, jugador o club..."
              className="pl-9 input w-[280px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm text-gray-400">Filtro rápido:</span>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="input min-w-[150px]"
          >
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobadas</option>
            <option value="rejected">Rechazadas</option>
            <option value="all">Todas</option>
          </select>
        </div>
      </div>

      {/* Lista */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
        {filtered.length ? (
          <div className="space-y-3">
            {filtered.map((transfer: T) => (
              <div key={transfer.id} className="rounded-lg border border-gray-800 overflow-hidden">
                <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-gray-400">ID</div>
                    <div className="text-sm text-white font-mono">{transfer.id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Jugador</div>
                    <div className="text-sm text-white">{transfer.playerName || transfer.playerId}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Clubes</div>
                    <div className="text-sm text-white">{transfer.fromClubName || transfer.fromClubId} → {transfer.toClubName || transfer.toClubId}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Monto</div>
                    <div className="text-sm text-white">€{(transfer.amount ?? transfer.fee ?? 0).toLocaleString()}</div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-800 flex items-center justify-between bg-black/20">
                  <div className="text-xs px-2 py-1 rounded bg-gray-800">{transfer.status}</div>
                  <div className="flex items-center gap-2">
                    {transfer.status === 'pending' ? (
                      <>
                        <button className="btn-primary" onClick={() => handleApprove(transfer.id)}>
                          <Check size={14} className="mr-2" /> Aprobar
                        </button>
                        <button className="btn-secondary" onClick={() => setRejectModal(transfer.id)}>
                          <X size={14} className="mr-2" /> Rechazar
                        </button>
                      </>
                    ) : (
                      <button className="btn-secondary opacity-60 cursor-not-allowed">
                        <Eye size={14} className="mr-2" /> Revisado
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-400">No hay transferencias con los filtros actuales.</div>
        )}
      </div>

      {/* Modal de rechazo */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-2">Rechazar oferta</h3>
            <p className="text-sm text-gray-400 mb-4">Indica un motivo para el rechazo:</p>
            <textarea
              className="input w-full h-24"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => { setRejectModal(null); setRejectReason(''); }}>Cancelar</button>
              <button className="btn-primary" onClick={handleReject}><X size={14} className="mr-2" /> Confirmar rechazo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mercado;
