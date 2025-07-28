// src/adminPanel/pages/admin/Dashboard.tsx
import React, { useMemo } from 'react'
import { useGlobalStore } from '../../store/globalStore'
import StatsCard from '../../components/admin/StatsCard'
import { TrendingUp, Users, BarChart2, Clock } from 'lucide-react'
import { countByStatus, sumValue, avgValue, maxValue, topClubFromTransfers, recentByDate, ensureArr } from '../../store/selectors'

const getLocalNumber = (n: number) => n.toLocaleString()

const Dashboard: React.FC = () => {
  const users = useGlobalStore(s => s.users)
  const clubs = useGlobalStore(s => s.clubs)
  const players = useGlobalStore(s => s.players)
  const transfers = useGlobalStore(s => s.transfers)
  const addMockTransfers = useGlobalStore(s => s.addMockTransfers)

  const safeUsers = ensureArr(users)
  const safeClubs = ensureArr(clubs)
  const safePlayers = ensureArr(players)
  const safeTransfers = ensureArr(transfers)

  const counts = useMemo(() => countByStatus(safeTransfers), [safeTransfers])
  const totalVal = useMemo(() => sumValue(safeTransfers), [safeTransfers])
  const avgVal = useMemo(() => avgValue(safeTransfers), [safeTransfers])
  const maxVal = useMemo(() => maxValue(safeTransfers), [safeTransfers])
  const topClub = useMemo(() => topClubFromTransfers(safeTransfers), [safeTransfers])
  const recent = useMemo(() => recentByDate(safeTransfers, 7), [safeTransfers])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Panel</h1>
            <p className="text-sm text-gray-400">Resumen del sistema</p>
          </div>
        </div>
        <button className="btn-primary" onClick={()=>addMockTransfers?.(3)}>Añadir ofertas demo</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <StatsCard icon={Clock}     title="Pendientes"     value={counts.pending}                         gradient="from-yellow-500 to-orange-600" />
        <StatsCard icon={BarChart2} title="Aprobadas"      value={counts.approved}                        gradient="from-green-500 to-emerald-600" />
        <StatsCard icon={BarChart2} title="Rechazadas"     value={counts.rejected}                        gradient="from-red-500 to-pink-600" />
        <StatsCard icon={TrendingUp} title="Monto total"   value={`€${getLocalNumber(Math.round(totalVal))}`} gradient="from-blue-500 to-purple-600" />
        <StatsCard icon={BarChart2} title="Ticket medio"   value={`€${getLocalNumber(Math.round(avgVal))}`}   gradient="from-cyan-500 to-sky-600" />
        <StatsCard icon={Users}     title="Club más activo" value={topClub}                                gradient="from-fuchsia-500 to-purple-600" />
      </div>

      {/* Listado simple de actividad (a partir de transfers recientes) */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">Actividad reciente</h3>
          <div className="text-xs text-gray-400">
            Usuarios: {safeUsers.length} · Clubes: {safeClubs.length} · Jugadores: {safePlayers.length}
          </div>
        </div>
        {recent.length ? (
          <div className="space-y-3">
            {recent.map(t => {
              const amount = t.amount ?? t.fee ?? 0
              return (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className={"text-xs px-2 py-1 rounded " + (t.status==='pending' ? "bg-yellow-800/40" : t.status==='approved' ? "bg-green-800/40" : "bg-red-800/40")}>{t.status}</div>
                    <div className="text-sm text-white">{t.playerName || t.playerId}</div>
                    <div className="text-xs text-gray-400">{t.fromClubName || t.fromClubId} → {t.toClubName || t.toClubId}</div>
                  </div>
                  <div className="text-sm text-white">€{getLocalNumber(amount)}</div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-sm text-gray-400">Sin actividad reciente.</div>
        )}
        <div className="mt-3 text-xs text-gray-400">Máximo: €{getLocalNumber(Math.round(maxVal))}</div>
      </div>
    </div>
  )
}

export default Dashboard
