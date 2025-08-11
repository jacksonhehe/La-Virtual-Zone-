import React, { useState, useEffect, useMemo } from 'react';
import { Check, X, Filter, TrendingUp, Clock, AlertCircle, Search, Eye, ChevronDown, DollarSign, Users, Target, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGlobalStore, subscribe as subscribeGlobal } from '../../store/globalStore';
import { useDataStore } from '../../../store/dataStore';
import SearchFilter from '../../components/admin/SearchFilter';
import StatsCard from '../../components/admin/StatsCard';

const Mercado = () => {
  const { transfers, approveTransfer, rejectTransfer } = useGlobalStore();
  const { offers, players, clubs, marketStatus } = useDataStore();
  const [activeTab, setActiveTab] = useState<'offers' | 'transfers' | 'overview'>('overview');
  const [filter, setFilter] = useState('all');
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [search, setSearch] = useState('');
  const [selectedTransfer, setSelectedTransfer] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);

  // Estadísticas del mercado
  const marketStats = useMemo(() => {
    const pendingOffers = offers.filter(o => o.status === 'pending').length;
    const acceptedOffers = offers.filter(o => o.status === 'accepted').length;
    const rejectedOffers = offers.filter(o => o.status === 'rejected').length;
    const totalOffersValue = offers.reduce((sum, o) => sum + o.amount, 0);
    const pendingTransfers = transfers.filter(t => t.status === 'pending').length;
    const approvedTransfers = transfers.filter(t => t.status === 'approved').length;
    const rejectedTransfers = transfers.filter(t => t.status === 'rejected').length;
    const totalTransfersValue = transfers.reduce((sum, t) => sum + t.amount, 0);

    return {
      pendingOffers,
      acceptedOffers,
      rejectedOffers,
      totalOffersValue,
      pendingTransfers,
      approvedTransfers,
      rejectedTransfers,
      totalTransfersValue
    };
  }, [offers, transfers]);

  // Filtros para ofertas
  const filteredOffers = useMemo(() => {
    let filtered = offers;
    
    if (filter !== 'all') {
      filtered = filtered.filter(o => o.status === filter);
    }
    
    if (search.trim()) {
      const searchTerm = search.toLowerCase();
      filtered = filtered.filter(o => 
        o.playerName.toLowerCase().includes(searchTerm) ||
        o.fromClub.toLowerCase().includes(searchTerm) ||
        o.toClub.toLowerCase().includes(searchTerm) ||
        o.id.toLowerCase().includes(searchTerm)
      );
    }
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [offers, filter, search]);

  // Filtros para transferencias
  const filteredTransfers = useMemo(() => {
    let filtered = transfers;
    
    if (filter !== 'all') {
      filtered = filtered.filter(t => t.status === filter);
    }
    
    if (search.trim()) {
      const searchTerm = search.toLowerCase();
      filtered = filtered.filter(t => 
        t.playerName.toLowerCase().includes(searchTerm) ||
        t.fromClub.toLowerCase().includes(searchTerm) ||
        t.toClub.toLowerCase().includes(searchTerm) ||
        t.id.toLowerCase().includes(searchTerm)
      );
    }
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transfers, filter, search]);

  const handleApprove = (id: string) => {
    approveTransfer(id);
    toast.success('Transferencia aprobada');
  };

  const handleReject = () => {
    if (!rejectModal || !rejectReason.trim()) return;
    
    rejectTransfer(rejectModal, rejectReason);
    setRejectModal(null);
    setRejectReason('');
    toast.success('Transferencia rechazada');
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Mercado de Fichajes</h1>
            <p className="text-gray-400">Gestiona todas las operaciones del mercado de transferencias</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <DollarSign size={20} className="text-blue-400" />
                <span className="text-blue-400 font-medium">
                  Mercado {marketStatus ? 'Abierto' : 'Cerrado'}
                </span>
              </div>
            </div>
            {(marketStats.pendingOffers > 0 || marketStats.pendingTransfers > 0) && (
              <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle size={20} className="text-red-400" />
                  <span className="text-red-400 font-medium">
                    {marketStats.pendingOffers + marketStats.pendingTransfers} operaciones pendientes
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Ofertas Pendientes"
            value={marketStats.pendingOffers}
            icon={Clock}
            gradient="from-yellow-500 to-orange-600"
          />
          <StatsCard
            title="Transferencias Pendientes"
            value={marketStats.pendingTransfers}
            icon={TrendingUp}
            gradient="from-blue-500 to-cyan-600"
          />
          <StatsCard
            title="Total Operaciones"
            value={offers.length + transfers.length}
            icon={Users}
            gradient="from-purple-500 to-pink-600"
          />
          <StatsCard
            title="Valor Total Mercado"
            value={`€${(marketStats.totalOffersValue + marketStats.totalTransfersValue).toLocaleString()}`}
            icon={DollarSign}
            gradient="from-green-500 to-emerald-600"
          />
        </div>

        {/* Pestañas de navegación */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-primary text-black'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              <Eye className="inline-block w-4 h-4 mr-2" />
              Vista General
            </button>
            <button
              onClick={() => setActiveTab('offers')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'offers'
                  ? 'bg-primary text-black'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              <DollarSign className="inline-block w-4 h-4 mr-2" />
              Ofertas ({offers.length})
            </button>
            <button
              onClick={() => setActiveTab('transfers')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'transfers'
                  ? 'bg-primary text-black'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              <TrendingUp className="inline-block w-4 h-4 mr-2" />
              Transferencias ({transfers.length})
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchFilter
                search={search}
                onSearchChange={setSearch}
                placeholder={`Buscar ${activeTab === 'offers' ? 'ofertas' : activeTab === 'transfers' ? 'transferencias' : 'operaciones'}...`}
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input min-w-[150px]"
            >
              <option value="all">Todas</option>
              <option value="pending">Pendientes</option>
              <option value="accepted">Aceptadas</option>
              <option value="approved">Aprobadas</option>
              <option value="rejected">Rechazadas</option>
            </select>
          </div>

          {/* Contenido de las pestañas */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Resumen del mercado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-primary" />
                    Resumen de Ofertas
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Pendientes:</span>
                      <span className="text-yellow-400 font-medium">{marketStats.pendingOffers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Aceptadas:</span>
                      <span className="text-green-400 font-medium">{marketStats.acceptedOffers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Rechazadas:</span>
                      <span className="text-red-400 font-medium">{marketStats.rejectedOffers}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-700/30">
                      <span className="text-gray-300 font-medium">Valor Total:</span>
                      <span className="text-primary font-bold">€{marketStats.totalOffersValue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                    Resumen de Transferencias
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Pendientes:</span>
                      <span className="text-yellow-400 font-medium">{marketStats.pendingTransfers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Aprobadas:</span>
                      <span className="text-green-400 font-medium">{marketStats.approvedTransfers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Rechazadas:</span>
                      <span className="text-red-400 font-medium">{marketStats.rejectedTransfers}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-700/30">
                      <span className="text-gray-300 font-medium">Valor Total:</span>
                      <span className="text-primary font-bold">€{marketStats.totalTransfersValue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actividad reciente */}
              <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700/30">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-primary" />
                  Actividad Reciente del Mercado
                </h3>
                <div className="space-y-3">
                  {[...offers, ...transfers]
                    .sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime())
                    .slice(0, 5)
                    .map((item, index) => (
                      <div key={`${item.id}-${index}`} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            'status' in item && item.status === 'pending' ? 'bg-yellow-500/20' :
                            'status' in item && item.status === 'accepted' ? 'bg-green-500/20' :
                            'status' in item && item.status === 'rejected' ? 'bg-red-500/20' :
                            'bg-blue-500/20'
                          }`}>
                            {'status' in item ? (
                              item.status === 'pending' ? <Clock className="w-4 h-4 text-yellow-400" /> :
                              item.status === 'accepted' ? <Check className="w-4 h-4 text-green-400" /> :
                              <X className="w-4 h-4 text-red-400" />
                            ) : (
                              <TrendingUp className="w-4 h-4 text-blue-400" />
                            )}
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              {('playerName' in item ? item.playerName : item.playerName) || 'Jugador desconocido'}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {('fromClub' in item ? item.fromClub : item.fromClubId)} → {('toClub' in item ? item.toClub : item.toClubId)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-primary font-medium">
                            €{('amount' in item ? item.amount : item.amount).toLocaleString()}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {new Date('date' in item ? item.date : item.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'offers' && (
            <div className="grid gap-4">
              {filteredOffers.length > 0 ? (
                filteredOffers.map((offer) => {
                  const isExpanded = selectedOffer === offer.id;
                  
                  return (
                    <div key={offer.id} className="bg-gray-900/50 rounded-lg border border-gray-700/30 hover:border-primary/30 transition-all">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-primary/20 rounded-lg">
                              <DollarSign size={24} className="text-primary" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">Oferta #{offer.id}</h3>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className={`px-3 py-1 rounded-full text-xs border ${
                                  offer.status === 'pending' 
                                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                    : offer.status === 'accepted'
                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                                }`}>
                                  {offer.status === 'pending' ? 'Pendiente' : 
                                   offer.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
                                </span>
                                <span className="text-gray-400 text-sm">
                                  {new Date(offer.date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedOffer(isExpanded ? null : offer.id)}
                              className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            >
                              <ChevronDown size={18} className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <div className="text-gray-400 text-sm mb-1">Jugador</div>
                            <div className="text-white font-medium">{offer.playerName}</div>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <div className="text-gray-400 text-sm mb-1">Transferencia</div>
                            <div className="text-white font-medium">{offer.fromClub} → {offer.toClub}</div>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <div className="text-gray-400 text-sm mb-1">Monto</div>
                            <div className="text-white font-medium">€{offer.amount.toLocaleString()}</div>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="border-t border-gray-700/50 pt-4 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-300 mb-2">Detalles de la Oferta</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Fecha de oferta:</span>
                                    <span className="text-white">{new Date(offer.date).toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Usuario:</span>
                                    <span className="text-white">ID: {offer.userId}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Estado:</span>
                                    <span className="text-white capitalize">{offer.status}</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-300 mb-2">Información del Jugador</h4>
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm text-gray-300">ID: {offer.playerId}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm text-gray-300">Club actual: {offer.fromClub}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm text-gray-300">Club destino: {offer.toClub}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <DollarSign size={48} className="text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">No se encontraron ofertas</h3>
                  <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'transfers' && (
            <div className="grid gap-4">
              {filteredTransfers.length > 0 ? (
                filteredTransfers.map((transfer) => {
                  const isExpanded = selectedTransfer === transfer.id;
                  
                  return (
                    <div key={transfer.id} className="bg-gray-900/50 rounded-lg border border-gray-700/30 hover:border-primary/30 transition-all">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-primary/20 rounded-lg">
                              <TrendingUp size={24} className="text-primary" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">Transferencia #{transfer.id}</h3>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className={`px-3 py-1 rounded-full text-xs border ${
                                  transfer.status === 'pending' 
                                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                    : transfer.status === 'approved'
                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                                }`}>
                                  {transfer.status === 'pending' ? 'Pendiente' : 
                                   transfer.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                                </span>
                                <span className="text-gray-400 text-sm">
                                  {new Date(transfer.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedTransfer(isExpanded ? null : transfer.id)}
                              className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            >
                              <ChevronDown size={18} className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                            {transfer.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleApprove(transfer.id)}
                                  className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                                  title="Aprobar transferencia"
                                >
                                  <Check size={18} />
                                </button>
                                <button
                                  onClick={() => setRejectModal(transfer.id)}
                                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                  title="Rechazar transferencia"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <div className="text-gray-400 text-sm mb-1">Jugador</div>
                            <div className="text-white font-medium">ID: {transfer.playerId}</div>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <div className="text-gray-400 text-sm mb-1">Transferencia</div>
                            <div className="text-white font-medium">{transfer.fromClubId} → {transfer.toClubId}</div>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <div className="text-gray-400 text-sm mb-1">Monto</div>
                            <div className="text-white font-medium">€{transfer.amount.toLocaleString()}</div>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="border-t border-gray-700/50 pt-4 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-lg font-medium text-gray-300 mb-2">Detalles de la Operación</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Fecha de solicitud:</span>
                                    <span className="text-white">{new Date(transfer.createdAt).toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Tipo:</span>
                                    <span className="text-white">Transferencia permanente</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Comisión:</span>
                                    <span className="text-white">€{Math.round(transfer.amount * 0.05).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-lg font-medium text-gray-300 mb-2">Estado del Proceso</h4>
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-gray-300">Solicitud recibida</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${transfer.status !== 'pending' ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                                    <span className="text-sm text-gray-300">Revisión completada</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${transfer.status === 'approved' ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                                    <span className="text-sm text-gray-300">Transferencia procesada</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <TrendingUp size={48} className="text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">No se encontraron transferencias</h3>
                  <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {rejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Rechazar Transferencia</h3>
            <p className="text-gray-400 mb-4">Indica el motivo del rechazo:</p>
            <textarea
              className="input w-full h-24 resize-none"
              placeholder="Motivo del rechazo..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex space-x-3 justify-end mt-6">
              <button 
                onClick={() => {setRejectModal(null); setRejectReason('');}} 
                className="btn-outline"
              >
                Cancelar
              </button>
              <button 
                onClick={handleReject} 
                className="btn-danger"
                disabled={!rejectReason.trim()}
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mercado;
 