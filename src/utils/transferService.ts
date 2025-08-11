
import { TransferOffer, Transfer } from '../types';
import { Player } from '../types/shared';
import { useDataStore } from '../store/dataStore';

/** Params for creating a transfer offer */
export interface MakeOfferParams {
  playerId: string;
  playerName: string;
  /** Seller club (club actual del jugador). Puede ser name o id. */
  fromClub: string;
  /** Buyer club (tu club). Puede ser name o id. */
  toClub: string;
  amount: number;
  userId: string;
}

/**
 * Crea una oferta de transferencia. 
 * Reglas clave:
 * - Mercado debe estar abierto.
 * - Club comprador ≠ vendedor.
 * - Presupuesto suficiente.
 * - Jugador debe pertenecer al club vendedor (por id o id_equipo).
 * - No bloqueamos por transferListed (permitimos ofertas aun si no está en la lista).
 */
export function makeOffer(params: MakeOfferParams): string | null {
  const { playerId, playerName, fromClub, toClub, amount, userId } = params;

  // Datos desde el store
  const {
    players, clubs, offers, addOffer, marketStatus, club: myClub
  } = useDataStore.getState();

  if (!marketStatus) {
    return 'El mercado está cerrado';
  }

  // Entidades
  const player = players.find(p => p.id === playerId);
  const buyerClub = clubs.find(c => c.name === toClub || c.id === toClub) 
                 || (myClub && (myClub.name === toClub || myClub.id === toClub) ? (clubs.find(c => c.id === myClub.id) || null) : null);
  const sellerClub = clubs.find(c => c.name === fromClub || c.id === fromClub);

  // Validaciones básicas
  if (!player) return 'Jugador no encontrado';
  if (!buyerClub || !sellerClub) return 'Club no encontrado';
  if (buyerClub.id === sellerClub.id) return 'No puedes ofertar por tu propio jugador';

  // Pertenencia del jugador (admite legacy id_equipo)
  const playerClubId = (player as any).clubId || (player as any).id_equipo;
  if (playerClubId !== sellerClub.id) {
    return 'El jugador no pertenece al club vendedor';
  }

  // Presupuesto
  if (buyerClub.budget < amount) {
    return 'Presupuesto insuficiente';
  }

  // Nota: NO bloqueamos por transferListed para permitir ofertas a cualquier jugador.
  // if (!player.transferListed) return 'El jugador no está en la lista de transferibles';

  // Oferta mínima razonable
  const baseValue = getBaseValue(player);
  const minAllowed = Math.round(baseValue * 0.7);
  if (amount < minAllowed) {
    return 'La oferta es demasiado baja';
  }

  // Evitar ofertas duplicadas pendientes desde el mismo comprador al mismo jugador
  const existingOffer = offers.find(o =>
    o.playerId === playerId && o.toClub === buyerClub.name && o.status === 'pending'
  );
  if (existingOffer) {
    return 'Ya tienes una oferta pendiente por este jugador';
  }

  // Crear oferta
  const newOffer: TransferOffer = {
    id: `offer${Date.now()}`,
    playerId,
    playerName,
    fromClub: sellerClub.name,
    toClub: buyerClub.name,
    amount,
    date: new Date().toISOString(),
    status: 'pending',
    userId
  };

  addOffer(newOffer);
  return null;
}

/** Procesa (acepta) una oferta pendiente y mueve al jugador */
export function processTransfer(offerId: string): string | null {
  const {
    offers, players, clubs, updateOfferStatus, updateClubs, updatePlayers, addTransfer
  } = useDataStore.getState();

  const offer = offers.find(o => o.id === offerId);
  if (!offer) return 'Oferta no encontrada';
  if (offer.status !== 'pending') return 'Esta oferta ya ha sido procesada';

  const player = players.find(p => p.id === offer.playerId);
  const buyerClub = clubs.find(c => c.name === offer.toClub);
  const sellerClub = clubs.find(c => c.name === offer.fromClub);
  if (!player || !buyerClub || !sellerClub) {
    updateOfferStatus(offerId, 'rejected');
    return 'Datos inválidos, oferta rechazada';
  }

  if (buyerClub.budget < offer.amount) {
    updateOfferStatus(offerId, 'rejected');
    return 'Presupuesto insuficiente, oferta rechazada';
  }

  // Actualizar presupuestos
  const updatedClubs = clubs.map(club => {
    if (club.id === buyerClub.id) return { ...club, budget: club.budget - offer.amount };
    if (club.id === sellerClub.id) return { ...club, budget: club.budget + offer.amount };
    return club;
  });
  updateClubs(updatedClubs);

  // Mover jugador (actualiza clubId y limpia club legacy si existiera)
  const updatedPlayers = players.map(p => {
    if (p.id === player.id) {
      const copy: any = { ...p, clubId: buyerClub.id };
      if ('id_equipo' in copy) copy.id_equipo = buyerClub.id;
      return copy;
    }
    return p;
  });
  updatePlayers(updatedPlayers);

  // Marcar oferta y registrar transferencia
  updateOfferStatus(offerId, 'accepted');
  const transfer: Transfer = {
    id: `transfer${Date.now()}`,
    playerId: player.id,
    playerName: player.name || `${(player as any).nombre_jugador || ''} ${(player as any).apellido_jugador || ''}`.trim(),
    fromClub: sellerClub.name,
    toClub: buyerClub.name,
    amount: offer.amount,
    date: new Date().toISOString()
  };
  addTransfer(transfer);

  return null;
}

/** Valor base robusto (transferValue > marketValue > value > overall*100000) */
function getBaseValue(player: Player): number {
  return (
    (player as any).transferValue ??
    (player as any).marketValue ??
    (player as any).value ??
    ((player as any).overall || (player as any).valoracion || 0) * 100000
  );
}

export function getMinOfferAmount(player: Player): number {
  const base = getBaseValue(player);
  return Math.round(base * 0.7);
}

export function getMaxOfferAmount(player: Player, clubBudget: number): number {
  const base = getBaseValue(player);
  return Math.min(Math.round(base * 1.5), clubBudget);
}
