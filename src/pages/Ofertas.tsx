import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import { useDataStore } from '../store/dataStore';
import { useAuthStore } from '../store/authStore';
import { formatCurrency, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import type { TransferOffer, Player, Club } from '../types';

const byName = (clubs: Club[], name: string | undefined) => {
  if (!name) return undefined;
  return clubs.find(c => c.name.toLowerCase() === name.toLowerCase());
};

const Ofertas = () => {
  const { user } = useAuthStore();
  const {
    offers, players, clubs,
    updateOfferStatus, updateOffers,
    updatePlayers, updateClubs, addTransfer
  } = useDataStore();

  const myClub = useMemo(() => {
    if (!user) return undefined;
    // user.clubId preferente; fallback por nombre
    return clubs.find(c => c.id === user.clubId) || byName(clubs, user.club);
  }, [user, clubs]);

  const recibidas = useMemo(() => {
    if (!myClub) return [];
    return (offers || []).filter(o => o.toClub?.toLowerCase() === myClub.name.toLowerCase());
  }, [offers, myClub]);

  const enviadas = useMemo(() => {
    if (!myClub) return [];
    return (offers || []).filter(o => o.fromClub?.toLowerCase() === myClub.name.toLowerCase());
  }, [offers, myClub]);

  const aceptar = (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    if (!offer || !myClub) return;

    // Club vendedor: myClub (toClub). Club comprador: fromClub
    const seller = byName(clubs, offer.toClub);
    const buyer = byName(clubs, offer.fromClub);
    if (!seller || !buyer) return;

    if ((buyer.budget || 0) < offer.amount) {
      toast.error('El club comprador no tiene presupuesto suficiente.');
      return;
    }

    const player = players.find(p => p.id === offer.playerId);
    if (!player) {
      toast.error('Jugador no encontrado.');
      return;
    }

    // 1) Mover jugador al club comprador
    const updatedPlayers = players.map(p =>
      p.id === player.id ? { ...p, clubId: buyer.id, transferListed: false } : p
    );
    // 2) Ajustar presupuestos
    const updatedClubs = clubs.map(c => {
      if (c.id === buyer.id) return { ...c, budget: (c.budget || 0) - offer.amount };
      if (c.id === seller.id) return { ...c, budget: (c.budget || 0) + offer.amount };
      return c;
    });
    // 3) Registrar transferencia (histórico simple)
    addTransfer({
      id: crypto.randomUUID(),
      playerId: player.id,
      playerName: player.name,
      fromClub: seller.name,
      toClub: buyer.name,
      fee: offer.amount,
      date: new Date().toISOString()
    });

    // 4) Marcar oferta aceptada y rechazar el resto del mismo jugador
    const updatedOffers = offers.map(o => {
      if (o.id === offer.id) return { ...o, status: 'accepted', responseDate: new Date().toISOString() };
      if (o.playerId === offer.playerId && o.status === 'pending') return { ...o, status: 'rejected', responseDate: new Date().toISOString() };
      return o;
    });

    // Persistir en store
    updatePlayers(updatedPlayers);
    updateClubs(updatedClubs);
    updateOffers(updatedOffers);
    toast.success('Oferta aceptada. Transferencia realizada.');
  };

  const rechazar = (offerId: string) => {
    updateOfferStatus(offerId, 'rejected');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Ofertas de Traspaso"
        description="Gestiona ofertas recibidas y enviadas de tu club."
      />

      {!myClub && (
        <div className="card p-6 text-gray-400">
          No tienes un club asignado.
        </div>
      )}

      {myClub && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-4">
            <h3 className="font-semibold text-lg mb-3">Recibidas</h3>
            <div className="space-y-3">
              {recibidas.length === 0 && (
                <div className="text-gray-400 text-sm">No hay ofertas.</div>
              )}
              {recibidas.map(o => {
                const player = players.find(p => p.id === o.playerId);
                return (
                  <div key={o.id} className="border border-gray-800 rounded p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{o.fromClub} → {o.toClub}</div>
                      <div className="text-sm text-gray-400">{formatDate(o.date)}</div>
                    </div>
                    <div className="mt-1 text-sm">
                      <span className="text-gray-400">Jugador:</span> <span className="font-medium">{o.playerName || player?.name}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-400">Monto:</span> <span className="font-medium">{formatCurrency(o.amount)}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      {o.status === 'pending' ? (
                        <>
                          <button className="btn-primary" onClick={() => aceptar(o.id)}>Aceptar</button>
                          <button className="btn-secondary" onClick={() => rechazar(o.id)}>Rechazar</button>
                        </>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded bg-gray-800">
                          {o.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
                        </span>
                      )}
                      <Link to={`/liga-master/jugador/${o.playerId}`} className="ml-auto text-sm underline">Ver jugador</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card p-4">
            <h3 className="font-semibold text-lg mb-3">Enviadas</h3>
            <div className="space-y-3">
              {enviadas.length === 0 && (
                <div className="text-gray-400 text-sm">No hay ofertas.</div>
              )}
              {enviadas.map(o => (
                <div key={o.id} className="border border-gray-800 rounded p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{o.fromClub} → {o.toClub}</div>
                    <div className="text-sm text-gray-400">{formatDate(o.date)}</div>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-400">Jugador:</span> <span className="font-medium">{o.playerName}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-400">Monto:</span> <span className="font-medium">{formatCurrency(o.amount)}</span>
                  </div>
                  <div className="mt-3">
                    <span className="text-xs px-2 py-1 rounded bg-gray-800">
                      {o.status === 'pending' ? 'Pendiente' : (o.status === 'accepted' ? 'Aceptada' : 'Rechazada')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ofertas;