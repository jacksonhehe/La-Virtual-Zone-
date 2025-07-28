import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDataStore } from '../store/dataStore';
import { useAuthStore } from '../store/authStore';
import PageHeader from '../components/common/PageHeader';
import { formatCurrency } from '../utils/helpers';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

const Mercado = () => {
  const { players, clubs, addOffer } = useDataStore();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [minOvr, setMinOvr] = useState(0);
  const [selectedClub, setSelectedClub] = useState<string>('');
  const [offerAmount, setOfferAmount] = useState<number>(0);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const transferListed = useMemo(() => {
    const list = (players || []).filter(p => p.transferListed);
    return list.filter(p => {
      const matchesSearch = (p.name.toLowerCase().includes(search.toLowerCase()) || p.position.toLowerCase().includes(search.toLowerCase()));
      const matchesOvr = (p.attributes?.overall || 0) >= minOvr;
      const matchesClub = !selectedClub || p.clubId === selectedClub;
      return matchesSearch && matchesOvr && matchesClub;
    });
  }, [players, search, minOvr, selectedClub]);

  const currentClub = useMemo(() => clubs.find(c => c.id === user?.clubId || c.slug === user?.club), [clubs, user]);

  const openOffer = (playerId: string, suggested: number) => {
    setSelectedPlayerId(playerId);
    setOfferAmount(suggested);
  };

  const submitOffer = () => {
    if (!selectedPlayerId || !user) return;
    const player = players.find(p => p.id === selectedPlayerId);
    if (!player) return;
    const fromClubName = currentClub?.name || (user.club || 'Club sin asignar');
    const toClubName = clubs.find(c => c.id === player.clubId)?.name || 'Libre';
    const amount = offerAmount > 0 ? offerAmount : (player.transferValue || player.marketValue || player.value || 0);

    addOffer({
      id: uuidv4(),
      playerId: player.id,
      playerName: player.name,
      fromClub: fromClubName,
      toClub: toClubName,
      amount,
      date: new Date().toISOString(),
      status: 'pending',
      userId: user.id
    });

    setSelectedPlayerId(null);
    setOfferAmount(0);
    toast.success('Oferta enviada');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Mercado de Fichajes"
        description="Explora jugadores transferibles y envía ofertas de traspaso."
      />

      <div className="card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            className="input"
            placeholder="Buscar por nombre o posición..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div>
            <label className="block text-sm text-gray-400 mb-1">Mín. OVR</label>
            <input
              type="number"
              min={0}
              max={99}
              className="input"
              value={minOvr}
              onChange={(e) => setMinOvr(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Club</label>
            <select className="input" value={selectedClub} onChange={(e) => setSelectedClub(e.target.value)}>
              <option value="">Todos</option>
              {clubs.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-400 flex items-end">
            {currentClub ? (
              <span>Tu club: <strong className="text-white">{currentClub.name}</strong> — Presupuesto: <strong className="text-white">{formatCurrency(currentClub.budget || 0)}</strong></span>
            ) : (
              <span>No tienes club asignado.</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {transferListed.map(p => {
          const suggested = p.transferValue || p.marketValue || p.value || 0;
          return (
            <div key={p.id} className="card p-4">
              <div className="flex items-center gap-4">
                <img src={p.image} alt={p.name} className="w-16 h-16 rounded object-cover" />
                <div className="flex-1">
                  <h3 className="font-semibold">{p.name} <span className="text-sm text-gray-400">({p.position})</span></h3>
                  <div className="text-sm text-gray-400">OVR: <span className="text-white font-medium">{p.attributes?.overall ?? '-'}</span></div>
                  <div className="text-sm text-gray-400">Club: <span className="text-white font-medium">{clubs.find(c => c.id === p.clubId)?.name || 'Libre'}</span></div>
                  <div className="text-sm">Valor de mercado: <span className="font-medium">{formatCurrency(suggested)}</span></div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="btn-primary flex-1" onClick={() => openOffer(p.id, suggested)}>Ofertar</button>
                <Link className="btn-secondary" to={`/liga-master/jugador/${p.id}`}>Ver perfil</Link>
              </div>
              {selectedPlayerId === p.id && (
                <div className="mt-4 border border-gray-700 rounded p-3">
                  <label className="block text-sm text-gray-400 mb-1">Monto de oferta</label>
                  <input
                    type="number"
                    className="input mb-3"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(Number(e.target.value))}
                    min={0}
                  />
                  <div className="flex gap-2">
                    <button className="btn-primary" onClick={submitOffer}>Enviar oferta</button>
                    <button className="btn-secondary" onClick={() => setSelectedPlayerId(null)}>Cancelar</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {transferListed.length === 0 && (
        <div className="card p-6 text-center text-gray-400">No hay jugadores en venta.</div>
      )}
    </div>
  );
};

export default Mercado;
