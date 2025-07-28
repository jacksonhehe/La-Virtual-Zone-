import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, X, TrendingUp, Clock, AlertCircle, Eye, BarChart2, Users, UploadCloud, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGlobalStore } from '@/adminPanel/store/globalStore';
import StatsCard from '@/adminPanel/components/admin/StatsCard';
import ImportModal from '@/adminPanel/components/ImportModal';

type T = any;

const unique = (arr: (string | number | undefined | null)[]) => {
  const s = new Set<string>();
  arr.forEach(v => { if (v != null) { const val = String(v).trim(); if (val) s.add(val); } });
  return Array.from(s);
};
const getLocalNumber = (n: number) => n.toLocaleString();

const Mercado: React.FC = () => {
  const { transfers, approveTransfer, rejectTransfer, refreshTransfers, market, saveMarketSettings, loadMarketSettings } = useGlobalStore();

  const [filter, setFilter] = useState<'all'|'pending'|'approved'|'rejected'>('pending');
  const [search, setSearch] = useState('');
  const [playerQ, setPlayerQ] = useState('');
  const [clubFrom, setClubFrom] = useState('');
  const [clubTo, setClubTo] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc'|'date_asc'|'amount_desc'|'amount_asc'>('date_desc');

  const [showFromOpts, setShowFromOpts] = useState(false);
  const [showToOpts, setShowToOpts] = useState(false);
  const [showPlayerOpts, setShowPlayerOpts] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const [marketStart, setMarketStart] = useState<string>(market.marketStart || '');
  const [marketEnd, setMarketEnd] = useState<string>(market.marketEnd || '');
  const [salaryCap, setSalaryCap] = useState<string>(market.salaryCap || '');

  const [showImport, setShowImport] = useState(false);
  const [exportScope, setExportScope] = useState<'filtered' | 'all'>('filtered');

  const csvRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => { refreshTransfers?.(filter); }, [refreshTransfers, filter]);
  useEffect(() => { loadMarketSettings?.(); }, [loadMarketSettings]);

  useEffect(() => {
    setMarketStart(market.marketStart || '');
    setMarketEnd(market.marketEnd || '');
    setSalaryCap(market.salaryCap || '');
  }, [market.marketStart, market.marketEnd, market.salaryCap]);

  const listBase: T[] = useMemo(() => (Array.isArray(transfers) ? [...transfers] : []), [transfers]);

  const clubFromOptions = useMemo(() => {
    const opts = unique(listBase.map((t: T) => t.fromClubName || t.fromClubId));
    return clubFrom ? opts.filter(o => o.toLowerCase().includes(clubFrom.toLowerCase())) : opts;
  }, [listBase, clubFrom]);
  const clubToOptions = useMemo(() => {
    const opts = unique(listBase.map((t: T) => t.toClubName || t.toClubId));
    return clubTo ? opts.filter(o => o.toLowerCase().includes(clubTo.toLowerCase())) : opts;
  }, [listBase, clubTo]);
  const playerOptions = useMemo(() => {
    const opts = unique(listBase.map((t: T) => t.playerName || t.playerId));
    return playerQ ? opts.filter(o => o.toLowerCase().includes(playerQ.toLowerCase())) : opts;
  }, [listBase, playerQ]);

  const filtered: T[] = useMemo(() => {
    let list: T[] = [...listBase];
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
  }, [listBase, filter, search, playerQ, clubFrom, clubTo, dateFrom, dateTo, minAmount, maxAmount, sortBy]);

  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  useEffect(() => { setPage(1); }, [filter, search, playerQ, clubFrom, clubTo, dateFrom, dateTo, minAmount, maxAmount, sortBy, pageSize]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSlice = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const pendingCount = useMemo(() => filtered.filter(t => t.status === 'pending').length, [filtered]);
  const approvedCount = useMemo(() => filtered.filter(t => t.status === 'approved').length, [filtered]);
  const rejectedCount = useMemo(() => filtered.filter(t => t.status === 'rejected').length, [filtered]);
  const totalValue = useMemo(() => filtered.reduce((sum, t) => sum + (t.amount ?? t.fee ?? 0), 0), [filtered]);
  const avgValue = useMemo(() => filtered.length ? totalValue / filtered.length : 0, [filtered, totalValue]);
  const maxValue = useMemo(() => filtered.reduce((m, t) => Math.max(m, (t.amount ?? t.fee ?? 0)), 0), [filtered]);
  const topClub = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach(t => {
      const a = String(t.fromClubName || t.fromClubId || '');
      const b = String(t.toClubName || t.toClubId || '');
      if (a) counts[a] = (counts[a] || 0) + 1;
      if (b) counts[b] = (counts[b] || 0) + 1;
    });
    let best = ''; let bestC = 0;
    Object.entries(counts).forEach(([k, v]) => { if (v > bestC) {best = k; bestC = v;} });
    return best ? `${best} (${bestC})` : '—';
  }, [filtered]);

  const saveMarketConfig = async () => {
    await saveMarketSettings?.({ marketStart, marketEnd, salaryCap });
    toast.success('Configuración de mercado guardada');
  };

  const isWithinMarketWindow = () => {
    if (!marketStart || !marketEnd) return true;
    const start = new Date(marketStart).getTime();
    const end = new Date(marketEnd).getTime() + 86399999;
    const now = Date.now();
    return now >= start && now <= end;
  };

  const violatesSalaryCap = (amount: number) => {
    const cap = Number(salaryCap);
    if (!cap || Number.isNaN(cap) || cap <= 0) return false;
    return amount > cap;
  };

  const exportRows = exportScope === 'filtered' ? filtered : listBase;

  const exportCSV = () => {
    const rows = exportRows.map(t => ({
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
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const json = JSON.stringify(exportRows, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transferencias_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tryApprove = async (t: T) => {
    if (!isWithinMarketWindow()) { toast.error('Fuera de la ventana de mercado'); return false; }
    const amount = t.amount ?? t.fee ?? 0;
    if (violatesSalaryCap(amount)) { toast.error(`Excede el salary cap (€${getLocalNumber(Number(salaryCap))})`); return false; }
    try {
      await approveTransfer?.(t.id);
      toast.success('Transferencia aprobada');
      return true;
    } catch (e) { toast.error('No se pudo aprobar'); return false; }
  };

  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [bulkRejectReason, setBulkRejectReason] = useState('');
  const [showBulkReject, setShowBulkReject] = useState(false);

  const bulkApprove = () => {
    let ok = 0, fail = 0;
    listBase.forEach(t => {
      if (selectedIds.has(String(t.id)) && t.status === 'pending') {
        tryApprove(t).then(done => { if (done) ok++; else fail++; });
      }
    });
    setSelectedIds(new Set()); setSelectAll(false);
    toast.success('Procesando aprobaciones…');
  };

  const bulkReject = () => {
    if (!bulkRejectReason.trim()) { toast.error('Indica un motivo de rechazo'); return; }
    let count = 0;
    listBase.forEach(t => {
      if (selectedIds.has(String(t.id)) && t.status === 'pending') {
        rejectTransfer?.(t.id, bulkRejectReason);
        count++;
      }
    });
    toast.success(`Rechazadas: ${count}`);
    setSelectedIds(new Set()); setSelectAll(false); setShowBulkReject(false); setBulkRejectReason('');
  };

  const toggleSelectAll = () => {
    if (selectAll) { setSelectedIds(new Set()); setSelectAll(false); }
    else { const next = new Set<string>(); pageSlice.forEach(t => next.add(String(t.id))); setSelectedIds(next); setSelectAll(true); }
  };

  const toggleRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 z-10 bg-[#0b1120]/70 backdrop-blur px-1 py-2 rounded">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><TrendingUp size={20} /></div>
          <div>
            <h1 className="text-xl font-semibold text-white">Mercado de transferencias</h1>
            <p className="text-sm text-gray-400">Modera ofertas y traspasos</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select className="input" value={exportScope} onChange={e => setExportScope(e.target.value as any)}>
            <option value="filtered">Exportar filtrados</option>
            <option value="all">Exportar todos</option>
          </select>
          <button className="btn-secondary inline-flex items-center gap-2" onClick={() => setShowImport(true)}><UploadCloud size={14}/> Importar</button>
          <button className="btn-primary inline-flex items-center gap-2" onClick={exportJSON}><Download size={14}/> Exportar JSON</button>
          <button className="btn-primary inline-flex items-center gap-2" onClick={exportCSV}><Download size={14}/> Exportar CSV</button>
          <a ref={csvRef} style={{display:'none'}} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <StatsCard icon={Clock}       title="Pendientes"      value={pendingCount}                               gradient="from-yellow-500 to-orange-600" />
        <StatsCard icon={Check}       title="Aprobadas"       value={approvedCount}                              gradient="from-green-500 to-emerald-600" />
        <StatsCard icon={X}           title="Rechazadas"      value={rejectedCount}                              gradient="from-red-500 to-pink-600" />
        <StatsCard icon={AlertCircle} title="Monto filtrado"  value={`€${totalValue.toLocaleString()}`}          gradient="from-blue-500 to-purple-600" />
        <StatsCard icon={BarChart2}   title="Ticket medio"    value={`€${avgValue ? Math.round(avgValue).toLocaleString() : '0'}`} gradient="from-cyan-500 to-sky-600" />
        <StatsCard icon={Users}       title="Club más activo" value={topClub}                                    gradient="from-fuchsia-500 to-purple-600" />
      </div>

      {/* Configuración de mercado */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
        <h3 className="text-sm font-medium text-white mb-3">Parámetros del mercado</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="text-sm text-gray-400">Inicio</label>
            <input type="date" className="input mt-1" value={marketStart} onChange={(e)=>setMarketStart(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-400">Fin</label>
            <input type="date" className="input mt-1" value={marketEnd} onChange={(e)=>setMarketEnd(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-400">Salary cap (monto por operación)</label>
            <input type="number" className="input mt-1" value={salaryCap} onChange={(e)=>setSalaryCap(e.target.value)} placeholder="0 = sin tope" />
          </div>
          <div className="flex items-end">
            <button className="btn-primary w-full" onClick={saveMarketConfig}>Guardar</button>
          </div>
          <div className="flex items-end">
            <div className={"w-full text-xs px-2 py-2 rounded text-center " + (isWithinMarketWindow() ? "bg-green-900/40 text-green-300" : "bg-red-900/40 text-red-300")}>
              {isWithinMarketWindow() ? "Ventana abierta" : "Ventana cerrada"}
            </div>
          </div>
        </div>
      </div>

      {/* Filtros avanzados */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 sticky top-20 z-10">
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

          <div className="relative">
            <label className="text-sm text-gray-400">Club vendedor</label>
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

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4">
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
            <input
              className="input w-full"
              placeholder="Buscar por texto libre (ID, jugador, club...)"
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <div className="w-full text-xs text-gray-400">
              {filtered.length} resultado(s) — máx: €{getLocalNumber(maxValue)} — promedio: €{getLocalNumber(Number.isFinite(avgValue) ? Math.round(avgValue) : 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de acciones masivas + paginación */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sticky top-56 z-10 bg-[#0b1120]/70 backdrop-blur px-2 py-2 rounded">
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" className="form-checkbox" checked={selectAll} onChange={toggleSelectAll} />
            Seleccionar página ({pageSlice.length})
          </label>
          <button className="btn-primary" onClick={bulkApprove}><Check size={14} className="mr-2" /> Aprobar selección</button>
          <button className="btn-secondary" onClick={()=>setShowBulkReject(true)}><X size={14} className="mr-2" /> Rechazar selección</button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Por página</span>
          <select className="input" value={pageSize} onChange={e=>setPageSize(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <div className="ml-4 flex items-center gap-2">
            <button className="btn-secondary" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Anterior</button>
            <span className="text-sm text-gray-400">Página {page} de {totalPages}</span>
            <button className="btn-secondary" disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Siguiente</button>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
        {pageSlice.length ? (
          <div className="space-y-3">
            {pageSlice.map((transfer: T) => {
              const amount = transfer.amount ?? transfer.fee ?? 0;
              const blocked = (!isWithinMarketWindow()) || violatesSalaryCap(amount);
              return (
                <div key={transfer.id} className={"rounded-lg border overflow-hidden " + (blocked ? "border-red-900/60" : "border-gray-800")}>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-1">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(String(transfer.id))}
                        onChange={()=>toggleRow(String(transfer.id))}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-xs text-gray-400">ID</div>
                      <div className="text-sm text-white font-mono">{transfer.id}</div>
                    </div>
                    <div className="md:col-span-3">
                      <div className="text-xs text-gray-400">Jugador</div>
                      <div className="text-sm text-white">{transfer.playerName || transfer.playerId}</div>
                    </div>
                    <div className="md:col-span-3">
                      <div className="text-xs text-gray-400">Clubes</div>
                      <div className="text-sm text-white">{transfer.fromClubName || transfer.fromClubId} → {transfer.toClubName || transfer.toClubId}</div>
                    </div>
                    <div className="md:col-span-3">
                      <div className="text-xs text-gray-400">Monto</div>
                      <div className="text-sm text-white">€{getLocalNumber(amount)}</div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-gray-800 flex items-center justify-between bg-black/20">
                    <div className={"text-xs px-2 py-1 rounded " + (transfer.status==='pending' ? "bg-yellow-800/40" : transfer.status==='approved' ? "bg-green-800/40" : "bg-red-800/40")}>{transfer.status}</div>
                    <div className="flex items-center gap-2">
                      {transfer.status === 'pending' ? (
                        <>
                          <button className={"btn-primary " + (blocked ? "opacity-60 cursor-not-allowed" : "")} disabled={blocked} onClick={() => tryApprove(transfer)}>
                            <Check size={14} className="mr-2" /> Aprobar
                          </button>
                          <button className="btn-secondary" onClick={() => { setRejectModal(transfer.id); setRejectReason(''); }}>
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
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-gray-400">No hay transferencias con los filtros actuales.</div>
        )}
      </div>

      {/* Modal de rechazo individual */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-2">Rechazar oferta</h3>
            <p className="text-sm text-gray-400 mb-4">Indica un motivo para el rechazo:</p>
            <textarea className="input w-full h-24" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => { setRejectModal(null); setRejectReason(''); }}>Cancelar</button>
              <button className="btn-primary" onClick={async () => {
                if (!rejectReason.trim()) { toast.error('Indica un motivo'); return; }
                try {
                  await rejectTransfer?.(rejectModal, rejectReason);
                  toast.success('Oferta rechazada');
                } catch { toast.error('No se pudo rechazar'); }
                setRejectModal(null); setRejectReason('');
              }}><X size={14} className="mr-2" /> Confirmar rechazo</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de rechazo masivo */}
      {showBulkReject && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-2">Rechazar selección</h3>
            <p className="text-sm text-gray-400 mb-4">Indica un motivo para las ofertas seleccionadas:</p>
            <textarea className="input w-full h-24" value={bulkRejectReason} onChange={(e) => setBulkRejectReason(e.target.value)} />
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => { setShowBulkReject(false); setBulkRejectReason(''); }}>Cancelar</button>
              <button className="btn-primary" onClick={bulkReject}><X size={14} className="mr-2" /> Confirmar rechazo</button>
            </div>
          </div>
        </div>
      )}

      <ImportModal open={showImport} onClose={() => setShowImport(false)} />
    </div>
  );
};

export default Mercado;