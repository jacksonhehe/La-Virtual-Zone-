import { TransferOffer, Transfer } from '../types';
import { Player } from '../types/shared';
import { useDataStore } from '../store/dataStore';

export interface MakeOfferParams {
  playerId: string;
  playerName: string;
  fromClub: string;
  toClub: string;
  amount: number;
  userId: string;
}

export function makeOffer(params: MakeOfferParams): string | null {
  const { 
    playerId, 
    playerName, 
    fromClub, 
    toClub, 
    amount, 
    userId 
  } = params;
  
  // Get data from store
  const { players, clubs, offers, addOffer } = useDataStore.getState();
  
  // Find player and clubs
  const player = players.find(p => p.id === playerId);
  const buyerClub = clubs.find(c => c.name === toClub);
  const sellerClub = clubs.find(c => c.name === fromClub);
  
  // Validate player exists
  if (!player) {
    return 'Jugador no encontrado';
  }
  
  // Validate clubs exist
  if (!buyerClub || !sellerClub) {
    return 'Club no encontrado';
  }
  
  // Check if player is in seller club
  if (player.clubId !== sellerClub.id) {
    return 'El jugador no pertenece al club vendedor';
  }
  
  // Check if buyer has enough budget
  if (buyerClub.budget < amount) {
    return 'Presupuesto insuficiente';
  }
  
  // Check if player is transferable
  if (!player.transferListed) {
    return 'El jugador no está en la lista de transferibles';
  }
  
  // Check if player is worth the amount
  if (amount < player.transferValue * 0.7) {
    return 'La oferta es demasiado baja';
  }
  
  // Check if there's already a pending offer for this player from this club
  const existingOffer = offers.find(o => 
    o.playerId === playerId && 
    o.toClub === toClub && 
    o.status === 'pending'
  );
  
  if (existingOffer) {
    return 'Ya tienes una oferta pendiente por este jugador';
  }
  
  // Create new offer
  const newOffer: TransferOffer = {
    id: `offer${Date.now()}`,
    playerId,
    playerName,
    fromClub,
    toClub,
    amount,
    date: new Date().toISOString(),
    status: 'pending',
    userId
  };
  
  // Add offer to store
  addOffer(newOffer);
  
  return null;
}

export function processTransfer(offerId: string): string | null {
  // Get data from store
  const { 
    offers, 
    players, 
    clubs, 
    updateOfferStatus, 
    updateClubs, 
    updatePlayers, 
    addTransfer 
  } = useDataStore.getState();
  
  // Find offer
  const offer = offers.find(o => o.id === offerId);
  
  if (!offer) {
    return 'Oferta no encontrada';
  }
  
  if (offer.status !== 'pending') {
    return 'Esta oferta ya ha sido procesada';
  }
  
  // Find player and clubs
  const player = players.find(p => p.id === offer.playerId);
  const buyerClub = clubs.find(c => c.name === offer.toClub);
  const sellerClub = clubs.find(c => c.name === offer.fromClub);
  
  if (!player || !buyerClub || !sellerClub) {
    updateOfferStatus(offerId, 'rejected');
    return 'Datos inválidos, oferta rechazada';
  }
  
  // Check if buyer still has enough budget
  if (buyerClub.budget < offer.amount) {
    updateOfferStatus(offerId, 'rejected');
    return 'Presupuesto insuficiente, oferta rechazada';
  }
  
  // Update clubs budgets
  const updatedClubs = clubs.map(club => {
    if (club.id === buyerClub.id) {
      return { ...club, budget: club.budget - offer.amount };
    }
    if (club.id === sellerClub.id) {
      return { ...club, budget: club.budget + offer.amount };
    }
    return club;
  });
  
  // Update player's club
  const updatedPlayers = players.map(p => {
    if (p.id === player.id) {
      return { 
        ...p, 
        clubId: buyerClub.id,
        transferListed: false 
      };
    }
    return p;
  });
  
  // Create transfer record
  const newTransfer: Transfer = {
    id: `transfer${Date.now()}`,
    playerId: player.id,
    playerName: player.name,
    fromClub: sellerClub.name,
    toClub: buyerClub.name,
    fee: offer.amount,
    date: new Date().toISOString()
  };
  
  // Update store
  updateClubs(updatedClubs);
  updatePlayers(updatedPlayers);
  updateOfferStatus(offerId, 'accepted');
  addTransfer(newTransfer);
  
  return null;
}

export function getMinOfferAmount(player: Player): number {
  return Math.round(player.transferValue * 0.7);
}

export function getMaxOfferAmount(player: Player, clubBudget: number): number {
  return Math.min(
    Math.round(player.transferValue * 1.5),
    clubBudget
  );
}
 