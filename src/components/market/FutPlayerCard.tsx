import React, { useState } from 'react';
import { formatCurrency } from '../../utils/format';
import { getTranslatedPosition, getPositionFullName, getPositionGroup } from '../../utils/helpers';
import { Star, TrendingUp, DollarSign, Zap, X, AlertTriangle } from 'lucide-react';
import { Player } from '../../types';
import { isFreeAgent } from '../../utils/marketRules';

interface Props {
  player: Player;
  club: { name: string; logo: string };
  value: number;
  disabled?: boolean;
  isOwnPlayer?: boolean;
  onOffer?: () => void;
  onStatsClick?: () => void;
}


function themeForOverall(ovr: number) {
  if (ovr >= 95) {
    return {
      frame: 'from-[#0f172a] via-[#1e293b] via-[#334155] to-[#0f172a]',
      border: 'from-yellow-300 via-amber-200 via-yellow-400 to-amber-300',
      glow: 'shadow-[0_0_30px_rgba(251,191,36,0.6)]',
      text: 'text-yellow-200',
      name: 'text-yellow-100',
      cardBg: 'from-slate-900 via-blue-950 to-slate-900',
      ratingBg: 'from-amber-400 to-yellow-300',
      statsBg: 'from-amber-500/20 to-yellow-500/10'
    };
  }
  if (ovr >= 90) {
    return {
      frame: 'from-[#1a1a2e] via-[#16213e] via-[#0f172a] to-[#1a1a2e]',
      border: 'from-cyan-300 via-blue-300 via-cyan-400 to-blue-300',
      glow: 'shadow-[0_0_25px_rgba(6,182,212,0.5)]',
      text: 'text-cyan-200',
      name: 'text-cyan-100',
      cardBg: 'from-slate-900 via-slate-800 to-slate-900',
      ratingBg: 'from-cyan-400 to-blue-300',
      statsBg: 'from-cyan-500/20 to-blue-500/10'
    };
  }
  if (ovr >= 88) {
    return {
      frame: 'from-[#1a1a2e] via-[#2d1b69] via-[#1a1a2e] to-[#2d1b69]',
      border: 'from-purple-300 via-fuchsia-300 via-purple-400 to-fuchsia-300',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
      text: 'text-purple-200',
      name: 'text-purple-100',
      cardBg: 'from-slate-900 via-purple-950 to-slate-900',
      ratingBg: 'from-purple-400 to-fuchsia-300',
      statsBg: 'from-purple-500/20 to-fuchsia-500/10'
    };
  }
  if (ovr >= 85) {
    return {
      frame: 'from-[#1a1a2e] via-[#166534] via-[#1a1a2e] to-[#166534]',
      border: 'from-green-300 via-emerald-300 via-green-400 to-emerald-300',
      glow: 'shadow-[0_0_18px_rgba(34,197,94,0.4)]',
      text: 'text-green-200',
      name: 'text-green-100',
      cardBg: 'from-slate-900 via-green-950 to-slate-900',
      ratingBg: 'from-green-400 to-emerald-300',
      statsBg: 'from-green-500/20 to-emerald-500/10'
    };
  }
  if (ovr >= 82) {
    return {
      frame: 'from-[#1a1a2e] via-[#7c2d12] via-[#1a1a2e] to-[#7c2d12]',
      border: 'from-orange-300 via-red-300 via-orange-400 to-red-300',
      glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]',
      text: 'text-orange-200',
      name: 'text-orange-100',
      cardBg: 'from-slate-900 via-red-950 to-slate-900',
      ratingBg: 'from-orange-400 to-red-300',
      statsBg: 'from-orange-500/20 to-red-500/10'
    };
  }
  if (ovr >= 75) {
    return {
      frame: 'from-[#1a1a2e] via-[#1e40af] via-[#1a1a2e] to-[#1e40af]',
      border: 'from-blue-300 via-indigo-300 via-blue-400 to-indigo-300',
      glow: 'shadow-[0_0_12px_rgba(59,130,246,0.3)]',
      text: 'text-blue-200',
      name: 'text-blue-100',
      cardBg: 'from-slate-900 via-blue-950 to-slate-900',
      ratingBg: 'from-blue-400 to-indigo-300',
      statsBg: 'from-blue-500/20 to-indigo-500/10'
    };
  }
  return {
    frame: 'from-[#1a1a2e] via-[#374151] via-[#1a1a2e] to-[#374151]',
    border: 'from-gray-300 via-slate-300 via-gray-400 to-slate-300',
    glow: 'shadow-[0_0_8px_rgba(107,114,128,0.2)]',
    text: 'text-gray-200',
    name: 'text-gray-100',
    cardBg: 'from-slate-900 via-gray-900 to-slate-900',
    ratingBg: 'from-gray-400 to-slate-300',
    statsBg: 'from-gray-500/20 to-slate-500/10'
  };
}

const FutPlayerCard: React.FC<Props> = ({ player, club, value, disabled, isOwnPlayer, onOffer, onStatsClick }) => {
  const theme = themeForOverall(player.overall);
  const [imageError, setImageError] = useState(false);

  // Get position gradient color for player cards
  const getPositionColor = (position: string) => {
    const group = getPositionGroup(position);

    switch(group) {
      case 'goalkeeper': return 'from-green-400 to-emerald-300';
      case 'defender': return 'from-blue-400 to-cyan-300';
      case 'midfielder': return 'from-purple-400 to-fuchsia-300';
      case 'attacker': return 'from-red-400 to-pink-300';
      default: return 'from-gray-400 to-slate-300';
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Si el clic vino del botón, no hacer nada (se maneja por separado)
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    // Si hay callback para mostrar stats, ejecutarlo
    if (onStatsClick) {
      onStatsClick();
    }
  };

  return (
    <div className={`relative w-full max-w-sm h-[400px] ${theme.glow} group cursor-pointer`} onClick={handleCardClick}>
      {/* Multiple glow effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 blur-3xl scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

      {/* Main card container */}
      <div className={`relative h-full rounded-2xl overflow-hidden bg-gradient-to-b ${theme.cardBg} border border-white/10 shadow-2xl`}>
        {/* Animated border glow */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${theme.border} opacity-75 blur-sm scale-105`} />
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${theme.border} opacity-50 blur-lg scale-110`} />

        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15),transparent_70%)]" />
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/15 to-transparent" />
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_30%,rgba(255,255,255,0.05)_50%,transparent_70%)] bg-[length:20px_20px]" />
        </div>

        {/* Additional glow effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-50" />
        <div className="absolute top-0 left-1/4 w-1/2 h-1/3 bg-gradient-to-b from-white/10 via-white/5 to-transparent blur-sm" />

        <div className="relative h-full p-2 flex flex-col">
          {/* Header with rating and position */}
          <div className="flex items-center justify-between mb-1">
            <div className={`px-1.5 py-0.5 rounded-full bg-gradient-to-r ${theme.ratingBg} text-black font-black text-sm shadow-md`}>
              {player.overall}
            </div>
            <div className={`px-1 py-0.5 rounded bg-gradient-to-r ${getPositionColor(player.position)} text-white font-bold text-[10px] uppercase tracking-wider shadow-sm`}>
              {getTranslatedPosition(player.position)}
            </div>
          </div>

          {/* Player photo - Much larger and more prominent */}
          <div className="flex-1 flex items-center justify-center mb-1.5">
            <div className="relative">
              {/* Player image container */}
              <div className="relative w-32 h-32 rounded-full overflow-hidden ring-3 ring-white/40 shadow-xl group-hover:ring-white/60 transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                {/* Multiple glow rings behind player - now inside the container */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${theme.border} opacity-30 blur-md scale-125 animate-pulse -z-10`} />
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${theme.border} opacity-20 blur-lg scale-150 -z-10`} />

                <img
                  src={player.image || '/default.png'}
                  alt={player.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 relative z-10 brightness-105 contrast-105"
                  onError={(e) => {
                    // Fallback to default image if image fails
                    const target = e.target as HTMLImageElement;
                    target.src = '/default.png';
                  }}
                  loading="lazy"
                />

                {/* Subtle overlay gradient for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-20" />

                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30" />

                {/* Animated border ring - behind the image */}
                <div className={`absolute inset-0 rounded-full border-2 bg-transparent ${theme.border} opacity-0 group-hover:opacity-70 transition-opacity duration-500 animate-spin -z-20`} style={{animationDuration: '3s'}} />
              </div>

              {/* Floating elements */}
              {player.overall >= 90 && (
                <div className="absolute -top-1 -right-1 animate-bounce z-50">
                  <div className={`relative`}>
                    <Star className={`w-4 h-4 ${theme.text} fill-current drop-shadow-lg`} />
                    <div className={`absolute inset-0 w-4 h-4 ${theme.text} fill-current animate-ping opacity-50`}>
                      <Star size={16} />
                    </div>
                  </div>
                </div>
              )}

              {player.overall >= 95 && (
                <div className="absolute -bottom-1 -left-1 animate-pulse z-50">
                  <div className={`p-0.5 rounded-full bg-gradient-to-br ${theme.border} shadow-md`}>
                    <TrendingUp className={`w-3 h-3 ${theme.text} animate-bounce`} />
                  </div>
                </div>
              )}

              {player.overall >= 88 && (
                <div className="absolute top-1/2 -left-2 opacity-50 group-hover:opacity-80 transition-opacity duration-300 z-40">
                  <div className={`w-0.5 h-8 bg-gradient-to-b ${theme.border} rounded-full animate-pulse`} />
                </div>
              )}

              {player.overall >= 88 && (
                <div className="absolute top-1/2 -right-2 opacity-50 group-hover:opacity-80 transition-opacity duration-300 z-40">
                  <div className={`w-0.5 h-8 bg-gradient-to-b ${theme.border} rounded-full animate-pulse`} />
                </div>
              )}
            </div>
          </div>

          {/* Player name */}
          <div className={`text-center mb-1.5 ${theme.name}`}>
            <h3 className="text-base font-black uppercase tracking-wide drop-shadow-lg">
              {player.name}
            </h3>
            <div className="text-[10px] opacity-80 font-semibold mt-0.5">
              {club.name}
            </div>
          </div>

          {/* Stats section (PES 2021 style: SPD, SHO, DRI, STR, PAS, DEF) */}
          <div className={`rounded-md p-1.5 mb-1.5 bg-gradient-to-br ${theme.statsBg} border border-white/10 backdrop-blur-sm`}>
            <div className="grid grid-cols-3 gap-2 text-center">
              {/* SPD */}
              <div className="space-y-0.5">
                <div className={`text-[10px] font-bold ${theme.text} opacity-75`}>SPD</div>
                <div className={`text-base font-black ${theme.text}`}>
                  {player.attributes.speed || player.attributes.pace}
                </div>
              </div>
              {/* SHO */}
              <div className="space-y-0.5">
                <div className={`text-[10px] font-bold ${theme.text} opacity-75`}>SHO</div>
                <div className={`text-base font-black ${theme.text}`}>
                  {player.attributes.shooting || Math.round(((player.attributes.finishing || 0) + (player.attributes.kickingPower || 0)) / 2)}
                </div>
              </div>
              {/* DRI */}
              <div className="space-y-0.5">
                <div className={`text-[10px] font-bold ${theme.text} opacity-75`}>DRI</div>
                <div className={`text-base font-black ${theme.text}`}>
                  {player.attributes.dribbling}
                </div>
              </div>
              {/* STR */}
              <div className="space-y-0.5">
                <div className={`text-[10px] font-bold ${theme.text} opacity-75`}>STR</div>
                <div className={`text-base font-black ${theme.text}`}>
                  {player.attributes.physicalContact || player.attributes.physical}
                </div>
              </div>
              {/* PAS */}
              <div className="space-y-0.5">
                <div className={`text-[10px] font-bold ${theme.text} opacity-75`}>PAS</div>
                <div className={`text-base font-black ${theme.text}`}>
                  {player.attributes.passing || Math.round(((player.attributes.lowPass || 0) + (player.attributes.loftedPass || 0)) / 2)}
                </div>
              </div>
              {/* DEF */}
              <div className="space-y-0.5">
                <div className={`text-[10px] font-bold ${theme.text} opacity-75`}>DEF</div>
                <div className={`text-base font-black ${theme.text}`}>
                  {player.attributes.defending || Math.round(((player.attributes.defensiveAwareness || 0) + (player.attributes.ballWinning || 0)) / 2)}
                </div>
              </div>
            </div>
          </div>

          {/* Price and action button */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className={`text-base font-black ${theme.text}`}>
                {formatCurrency(value)}
              </div>
              <div className="flex items-center space-x-1">
                {club.logo && <img src={club.logo} alt={club.name} className="w-5 h-5 rounded" />}
                <span className={`text-xs font-semibold ${theme.text} opacity-80`}>
                  {club.name}
                </span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevenir propagación para no activar el onClick de la tarjeta
                if (onOffer) onOffer();
              }}
              disabled={disabled}
              className={`w-full py-1.5 px-3 rounded-md font-bold text-sm transition-all duration-300 relative overflow-hidden ${
                disabled
                  ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                  : `bg-gradient-to-r ${theme.ratingBg} text-black hover:scale-105 hover:shadow-[0_0_12px_rgba(255,255,255,0.3)] active:scale-95 group/btn`
              }`}
            >
              {/* Button shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 transform -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[200%]" />

              <span className="relative z-10 flex items-center justify-center">
                {disabled ? (
                  <>
                    <AlertTriangle size={14} className="mr-1" />
                    {isOwnPlayer ? 'Tu Jugador' : 'No Disponible'}
                  </>
                ) : (
                  <>
                    <DollarSign size={14} className="mr-1" />
                    {isFreeAgent(player) ? 'Fichar Libre' : 'Hacer Oferta'}
                    <TrendingUp size={14} className="ml-1" />
                  </>
                )}
              </span>
            </button>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0.5 right-0.5 opacity-15 group-hover:opacity-30 transition-opacity duration-300">
            <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${theme.border} shadow-sm animate-pulse`} />
          </div>
          <div className="absolute bottom-0.5 left-0.5 opacity-15 group-hover:opacity-30 transition-opacity duration-300">
            <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${theme.border} shadow-sm animate-pulse`} />
          </div>
          <div className="absolute top-1/2 left-0.5 opacity-10 group-hover:opacity-25 transition-opacity duration-300">
            <div className={`w-0.5 h-4 bg-gradient-to-b ${theme.border} rounded-full animate-pulse`} />
          </div>
          <div className="absolute top-1/2 right-0.5 opacity-10 group-hover:opacity-25 transition-opacity duration-300">
            <div className={`w-0.5 h-4 bg-gradient-to-b ${theme.border} rounded-full animate-pulse`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FutPlayerCard;
