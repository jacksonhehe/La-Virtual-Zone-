export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export function getRarityClasses(rarity?: Rarity) {
  switch (rarity) {
    case 'rare':
      return 'ring-2 ring-blue-400';
    case 'epic':
      return 'ring-2 ring-purple-500';
    case 'legendary':
      return 'ring-2 ring-yellow-400 animate-pulse';
    default:
      return 'ring-1 ring-gray-700';
  }
} 