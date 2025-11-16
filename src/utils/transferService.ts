import { TransferOffer, Transfer } from '../types';
import { Player } from '../types/shared';
import { useDataStore } from '../store/dataStore';
import { computeValuation, validateOfferBasics, isFreeAgent } from './marketRules';
import { syncPlayerToSupabase } from './playerService';

export interface MakeOfferParams {
  playerId: string;
  playerName: string;
  fromClub: string;
  toClub: string;
  amount: number;
  userId: string;
}

const getOfferHistoryEntry = (actor: 'buyer' | 'seller', action: string, details: any = {}) => ({
  id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  date: new Date().toISOString(),
  actor,
  action,
  details
});

export async function makeOffer(params: MakeOfferParams): Promise<string | null> {
  const { playerId, playerName, fromClub, toClub, amount, userId } = params;
  const { players, clubs, offers, addOffer, updateClubs, updatePlayers, addTransfer, marketStatus, standings } = useDataStore.getState() as any;

  if (!marketStatus) {
    return 'El mercado estÃ¡ cerrado';
  }

  const player = players.find((p: Player) => p.id === playerId);
  const buyerClub = clubs.find((c: any) => c.name === toClub);
  const sellerClub = fromClub === 'Libre' ? null : clubs.find((c: any) => c.name === fromClub);

  if (!player) return 'Jugador no encontrado';
  if (!buyerClub) return 'Club comprador no encontrado';

  const free = isFreeAgent(player);

  const validation = validateOfferBasics({
    player,
    buyer: buyerClub,
    seller: sellerClub,
    amount,
    standings
  });
  if (!validation.ok) return validation.reason || 'Oferta invÃ¡lida';

  if (!free && !player.transferListed) {
    return 'El jugador no estÃ¡ en la lista de transferibles';
  }

  if (free) {
    if (buyerClub.budget < amount) return 'Presupuesto insuficiente para fichar al agente libre';

    const updatedClubs = clubs.map((club: any) => {
      if (club.id === buyerClub.id) {
        return { ...club, budget: club.budget - amount };
      }
      return club;
    });

    const preservedValue = player.transferValue || player.marketValue || 0;
    const updatedPlayers = players.map((p: Player) => {
      if (p.id === playerId) {
        return {
          ...p,
          clubId: buyerClub.id,
          transferListed: false,
          transferValue: preservedValue
        };
      }
      return p;
    });

    const transfer: Transfer = {
      id: `transfer-${Date.now()}`,
      playerId: player.id,
      playerName: player.name,
      fromClub: 'Libre',
      toClub: buyerClub.name,
      fee: amount,
      date: new Date().toISOString()
    };

    await updateClubs(updatedClubs);
    await updatePlayers(updatedPlayers);
    const syncedPlayer = updatedPlayers.find((p: Player) => p.id === playerId);
    if (syncedPlayer) await syncPlayerToSupabase(syncedPlayer);
    addTransfer(transfer);

    return null;
  }

  const existingOffer = offers.find((o: TransferOffer) =>
    o.playerId === playerId &&
    o.toClub === toClub &&
    o.status === 'pending'
  );

  if (existingOffer) {
    return 'Ya tienes una oferta pendiente por este jugador';
  }

  const newOffer: TransferOffer = {
    id: `offer-${Date.now()}`,
    playerId,
    playerName,
    fromClub,
    toClub,
    amount,
    date: new Date().toISOString(),
    status: 'pending',
    userId,
    history: [getOfferHistoryEntry('buyer', 'offer', { amount })]
  };

  addOffer(newOffer);
  return null;
}

export async function processTransfer(offerId: string): Promise<string | null> {
  const {
    offers,
    players,
    clubs,
    updateOfferStatus,
    updateClubs,
    updatePlayers,
    addTransfer
  } = useDataStore.getState() as any;

  const offer = offers.find((o: TransferOffer) => o.id === offerId);
  if (!offer) return 'Oferta no encontrada';

  if (offer.status !== 'pending' && offer.status !== 'counter-offer') {
    return 'Oferta ya procesada';
  }

  const player = players.find((p: Player) => p.id === offer.playerId);
  const buyerClub = clubs.find((c: any) => c.name === offer.toClub);
  const sellerClub = clubs.find((c: any) => c.name === offer.fromClub);
  const finalAmount = offer.counterAmount ?? offer.amount;

  if (!player || !buyerClub || !sellerClub) {
    updateOfferStatus(offerId, 'rejected');
    return 'Datos inválidos, oferta rechazada';
  }

  if (buyerClub.budget < finalAmount) {
    updateOfferStatus(offerId, 'rejected', { historyEntry: getOfferHistoryEntry('seller', 'reject', { reason: 'Presupuesto insuficiente' }) });
    return 'Presupuesto insuficiente';
  }

  const updatedClubs = clubs.map((club: any) => {
    if (club.id === buyerClub.id) {
      return { ...club, budget: club.budget - finalAmount };
    }
    if (club.id === sellerClub.id) {
      return { ...club, budget: club.budget + finalAmount };
    }
    return club;
  });

  const preservedValue = player.transferValue || player.marketValue || 0;
  const updatedPlayers = players.map((p: Player) => {
    if (p.id === player.id) {
      return {
        ...p,
        clubId: buyerClub.id,
        transferListed: false,
        transferValue: preservedValue
      };
    }
    return p;
  });

  const transfer: Transfer = {
    id: `transfer-${Date.now()}`,
    playerId: player.id,
    playerName: player.name,
    fromClub: sellerClub.name,
    toClub: buyerClub.name,
    fee: finalAmount,
    date: new Date().toISOString()
  };

  await updateClubs(updatedClubs);
  await updatePlayers(updatedPlayers);
  const syncedTransferredPlayer = updatedPlayers.find((p: Player) => p.id === player.id);
  if (syncedTransferredPlayer) await syncPlayerToSupabase(syncedTransferredPlayer);
  updateOfferStatus(offerId, 'accepted', { historyEntry: getOfferHistoryEntry('seller', 'accept', { amount: finalAmount }) });
  addTransfer(transfer);

  return null;
}

export function makeCounterOffer(offerId: string, counterAmount: number, message?: string): string | null {
  const { offers, updateOfferStatus } = useDataStore.getState() as any;
  const offer = offers.find((o: TransferOffer) => o.id === offerId);
  if (!offer) return 'Oferta no encontrada';
  if (offer.status !== 'pending') return 'Solo se puede contra-ofertar cuando la oferta esta pendiente';

  updateOfferStatus(offerId, 'counter-offer', {
    counterAmount,
    counterMessage: message,
    historyEntry: getOfferHistoryEntry('seller', 'counter', { counterAmount, message })
  });

  return null;
}

export async function respondToCounterOffer(offerId: string, accept: boolean, message?: string): Promise<string | null> {
  const { offers } = useDataStore.getState() as any;
  const offer = offers.find((o: TransferOffer) => o.id === offerId);
  if (!offer) return 'Oferta no encontrada';

  if (accept) {
    const amount = offer.counterAmount ?? offer.amount;
    const result = await processTransfer(offerId);
    if (result) return result;
    useDataStore.getState().updateOfferStatus(offerId, 'accepted', {
      historyEntry: getOfferHistoryEntry('buyer', 'accept', { counterAmount: amount })
    });
    return null;
  }

  useDataStore.getState().updateOfferStatus(offerId, 'rejected', {
    counterMessage: message,
    historyEntry: getOfferHistoryEntry('buyer', 'reject', { message })
  });

  return null;
}

export async function fetchOffersFromSupabase(): Promise<TransferOffer[]> {
  const { offers } = useDataStore.getState() as any;
  return offers;
}

export async function fetchTransfersFromSupabase(): Promise<Transfer[]> {
  const { transfers } = useDataStore.getState() as any;
  return transfers;
}

export function getMinOfferAmount(player: Player): number {
  const { minTransferFee } = computeValuation(player);
  return Math.max(1, minTransferFee);
}

export function getMaxOfferAmount(player: Player, clubBudget: number): number {
  return clubBudget;
}

export function getOfferSuggestions(player: Player): {
  low: number;
  fair: number;
  high: number;
  marketValue: number;
} {
  const marketValue = player.transferValue || 0;
  return {
    low: Math.round(marketValue * 0.7),
    fair: Math.round(marketValue * 0.9),
    high: Math.round(marketValue * 1.2),
    marketValue
  };
}

export function getOfferRealismLevel(amount: number, player: Player): {
  level: 'ridiculous' | 'low' | 'fair' | 'high' | 'excessive';
  message: string;
  color: string;
} {
  const suggestions = getOfferSuggestions(player);
  const ratio = player.transferValue ? amount / player.transferValue : 1;

  if (ratio < 0.5) {
    return { level: 'ridiculous', message: 'Oferta ridÃ­culamente baja', color: 'text-red-400' };
  }

  if (ratio < 0.7) {
    return { level: 'low', message: 'Oferta baja - podrÃ­a ser rechazada', color: 'text-orange-400' };
  }

  if (ratio <= 1.2) {
    return { level: 'fair', message: 'Oferta razonable', color: 'text-green-400' };
  }

  if (ratio <= 1.5) {
    return { level: 'high', message: 'Oferta alta - atractiva', color: 'text-blue-400' };
  }

  return { level: 'excessive', message: 'Oferta excesiva', color: 'text-purple-400' };
}

export function debugRecentTransfers(limit = 5) {
  const { transfers } = useDataStore.getState() as any;
  return (transfers || []).slice(0, limit);
}

export function debugOffersStatus() {
  const { offers } = useDataStore.getState() as any;
  return offers;
}











