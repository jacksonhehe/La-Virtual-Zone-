import { useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useDataStore } from '../store/dataStore';
import { useAuthStore } from '../store/authStore';
import PageHeader from '../components/common/PageHeader';
import { formatCurrency } from '../utils/helpers';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

const PlayerDetail = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const { players, clubs, addOffer, offers, transfers } = useDataStore();
  const { user } = useAuthStore();

  const player = useMemo(() => players.find(p => p.id === playerId), [players, playerId]);
  const [amount, setAmount] = useState<number>(
    player ? (player.transferValue || player.marketValue || player.value || 0) : 0
  );

  const currentClub = useMemo(() => {
    if (!user) return undefined;
    return clubs.find(c => c.id === user.clubId) || clubs.find(c => c.slug === user.club);
  }, [user, clubs]);

  const targetClub = useMemo(() => {
    if (!player) return undefined;
    return clubs.find(c => c.id === player.clubId);
  }, [player, clubs]);

  const canOffer = !!(user && currentClub && player && targetClub && player.transferListed);

  const submitOffer = () => {
    if (!canOffer || !player || !currentClub || !targetClub || !user) return;
    addOffer({
      id: uuidv4(),
      playerId: player.id,
      playerName: player.name,
      fromClub: currentClub.name,
      toClub: targetClub.name,
      amount: amount > 0 ? amount : 0,
      date: new Date().toISOString(),
      status: 'pending',
      userId: user.id
    });
    toast.success('Oferta enviada');
  };

  if (!player) {
    return <div className="container mx-auto px-4 py-6">Jugador no encontrado.</div>
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader title={player.name} description={targetClub ? targetClub.name : 'Libre'} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-4">
          <div className="flex gap-4 items-center">
            <img src={player.image} alt={player.name} className="w-24 h-24 rounded object-cover" />
            <div>
              <div className="text-gray-400 text-sm">{player.position}</div>
              <div className="text-xl font-semibold">OVR {player.attributes?.overall ?? '-'}</div>
              <div className="text-sm text-gray-400 mt-1">Valor de mercado: <span className="text-white font-medium">{formatCurrency(player.transferValue || player.marketValue || player.value || 0)}</span></div>
              <div className="text-sm text-gray-400">Estado: <span className="text-white font-medium">{player.transferListed ? 'Transferible' : 'No disponible'}</span></div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="card p-3">
              <div className="text-gray-400 text-sm mb-1">Club actual</div>
              <div className="font-medium">{targetClub ? targetClub.name : 'Libre'}</div>
            </div>
            <div className="card p-3">
              <div className="text-gray-400 text-sm mb-1">Tu club</div>
              <div className="font-medium">{currentClub ? currentClub.name : 'Sin club'}</div>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold mb-2">Enviar oferta</h3>
          {!canOffer && (
            <div className="text-sm text-gray-400 mb-3">
              Debes tener un club asignado y el jugador debe estar transferible.
            </div>
          )}
          <label className="block text-sm text-gray-400 mb-1">Monto</label>
          <input
            type="number"
            className="input mb-3"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <button className="btn-primary w-full" disabled={!canOffer} onClick={submitOffer}>Ofertar</button>
        
      <div className="lg:col-span-2 card p-4">
        <h3 className="font-semibold mb-2">Historial de traspasos</h3>
        <div className="space-y-2">
          {transfers.filter(t => t.playerId === player.id).sort((a,b)=> new Date(b.date).getTime()-new Date(a.date).getTime()).map(t => (
            <div key={t.id} className="flex items-center justify-between border border-gray-800 rounded p-2">
              <div className="text-sm text-gray-300">
                <span className="font-medium">{t.playerName}</span> — {t.fromClub} → {t.toClub}
              </div>
              <div className="text-sm">€{(t.fee||0).toLocaleString()} <span className="text-gray-400 ml-2">{new Date(t.date).toLocaleDateString()}</span></div>
            </div>
          ))}
          {transfers.filter(t => t.playerId === player.id).length === 0 && (
            <div className="text-sm text-gray-400">Sin traspasos registrados.</div>
          )}
        </div>

        <h3 className="font-semibold mt-6 mb-2">Ofertas</h3>
        <div className="space-y-2">
          {offers.filter(o => o.playerId === player.id).sort((a,b)=> new Date(b.date).getTime()-new Date(a.date).getTime()).map(o => (
            <div key={o.id} className="flex items-center justify-between border border-gray-800 rounded p-2">
              <div className="text-sm text-gray-300">{o.fromClub} → {o.toClub}</div>
              <div className="text-sm">
                €{(o.amount||0).toLocaleString()}
                <span className={"ml-2 text-xs px-2 py-1 rounded " + (o.status==='accepted' ? 'bg-green-800/50' : o.status==='rejected' ? 'bg-red-800/50' : 'bg-yellow-800/30')}>
                  {o.status}
                </span>
                <span className="text-gray-400 ml-2">{new Date(o.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {offers.filter(o => o.playerId === player.id).length === 0 && (
            <div className="text-sm text-gray-400">Sin ofertas registradas.</div>
          )}
        </div>
      </div>

      </div>
    </div>
  );
};

export default PlayerDetail;