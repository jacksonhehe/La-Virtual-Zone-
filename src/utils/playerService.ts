import { Player } from '../types/shared';
import { VZ_PLAYERS_KEY } from './storageKeys';
import { players as defaultPlayers } from '../data/mockData';

function randStat() {
  return 60 + Math.floor(Math.random() * 40); // 60-99
}

function generateDetailedStats(position: string): any {
  return {
    offensive: randStat(),
    ballControl: randStat(),
    dribbling: randStat(),
    lowPass: randStat(),
    loftedPass: randStat(),
    finishing: randStat(),
    placeKicking: randStat(),
    volleys: randStat(),
    curl: randStat(),
    speed: randStat(),
    acceleration: randStat(),
    kickingPower: randStat(),
    stamina: randStat(),
    jumping: randStat(),
    physicalContact: randStat(),
    balance: randStat(),
    defensive: randStat(),
    ballWinning: randStat(),
    aggression: randStat(),
    goalkeeperReach: randStat(),
    goalkeeperReflexes: randStat(),
    goalkeeperClearing: randStat(),
    goalkeeperThrowing: randStat(),
    goalkeeperHandling: randStat()
  };
}

export const getPlayers = (): Player[] => {
  const json = localStorage.getItem(VZ_PLAYERS_KEY);
  let list: Player[];
  if (json) {
    try {
      list = JSON.parse(json) as Player[];
    } catch {
      list = defaultPlayers as Player[];
    }
  } else {
    list = defaultPlayers as Player[];
  }

  // Asegurar detailedStats
  list = list.map(p => {
    if (!p.detailedStats) {
      return { ...p, detailedStats: generateDetailedStats(p.position) };
    }
    return p;
  });

  return list;
};

export const savePlayers = (data: Player[]): void => {
  localStorage.setItem(VZ_PLAYERS_KEY, JSON.stringify(data));
};
