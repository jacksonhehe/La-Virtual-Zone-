import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import type { Player, PlayerAttributes, PlayerSkills, PlayingStyles } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { formatCurrency } from '../../utils/format';
import { getTranslatedPosition } from '../../utils/helpers';
import { updatePlayer } from '../../utils/playerService';
import { calculateMarketValueByRating, calculateSalaryByRating } from '../../utils/marketRules';

type TrainingTab = 'stats' | 'train' | 'skills' | 'positions' | 'styles';
type PositionFilter = 'all' | 'gk' | 'def' | 'mid' | 'att';

const TRAINING_COST = 18_000_000;

const positionFilters: Array<{ id: PositionFilter; label: string; positions: string[] }> = [
  { id: 'all', label: 'Todos', positions: [] },
  { id: 'gk', label: 'Arqueros', positions: ['PT'] },
  { id: 'def', label: 'Defensas', positions: ['DEC', 'LI', 'LD'] },
  { id: 'mid', label: 'Medios', positions: ['MCD', 'MC', 'MO', 'MDI', 'MDD'] },
  { id: 'att', label: 'Delanteros', positions: ['EXI', 'EXD', 'CD', 'SD'] }
];

type TrainingPack = {
  id: string;
  title: string;
  description: string;
  effects: Array<{ key: keyof PlayerAttributes; label: string; amount: number }>;
};
type RadarAxis = { label: string; value: number };

const trainingPacks: TrainingPack[] = [
  {
    id: 'passing',
    title: 'Pases y tecnica',
    description: 'Mejora circulacion y control en salida.',
    effects: [
      { key: 'lowPass', label: 'Pase al ras', amount: 1 },
      { key: 'loftedPass', label: 'Pase bombeado', amount: 1 },
      { key: 'ballControl', label: 'Control', amount: 1 }
    ]
  },
  {
    id: 'finishing',
    title: 'Delanteros',
    description: 'Define mejor en zona de gol.',
    effects: [
      { key: 'offensiveAwareness', label: 'Act. ofensiva', amount: 1 },
      { key: 'finishing', label: 'Finalizacion', amount: 1 },
      { key: 'kickingPower', label: 'Potencia', amount: 1 }
    ]
  },
  {
    id: 'dribbling',
    title: 'Regates',
    description: 'Conduce y rompe lineas con cambios rapidos.',
    effects: [
      { key: 'dribbling', label: 'Drible', amount: 1 },
      { key: 'tightPossession', label: 'Posesion', amount: 1 },
      { key: 'balance', label: 'Equilibrio', amount: 1 }
    ]
  },
  {
    id: 'defending',
    title: 'Defensa',
    description: 'Fortalece recuperacion y marca.',
    effects: [
      { key: 'defensiveAwareness', label: 'Act. defensiva', amount: 1 },
      { key: 'ballWinning', label: 'Recuperacion', amount: 1 },
      { key: 'aggression', label: 'Agresividad', amount: 1 }
    ]
  },
  {
    id: 'resistance',
    title: 'Resistencia',
    description: 'Aumenta fisico para sostener ritmo.',
    effects: [
      { key: 'stamina', label: 'Resistencia', amount: 1 },
      { key: 'physicalContact', label: 'Contacto', amount: 1 },
      { key: 'jumping', label: 'Salto', amount: 1 }
    ]
  },
  {
    id: 'speed',
    title: 'Velocidad',
    description: 'Mejora aceleracion y velocidad punta.',
    effects: [
      { key: 'speed', label: 'Velocidad', amount: 1 },
      { key: 'acceleration', label: 'Aceleracion', amount: 1 }
    ]
  }
];

const skillCards: Array<{ key: keyof PlayerSkills; title: string; desc: string }> = [
  { key: 'doubleTouch', title: 'Doble toque', desc: 'Control y quiebre rapido.' },
  { key: 'marseilleTurn', title: 'Marsellesa', desc: 'Giro de 360 para escapar.' },
  { key: 'flipFlap', title: 'Gambeta', desc: 'Regate habil en velocidad.' },
  { key: 'rainbow', title: 'Sombrerito', desc: 'Eleva el balon sobre el rival.' },
  { key: 'longRanger', title: 'Tiro larga distancia', desc: 'Remate potente desde lejos.' },
  { key: 'firstTimeShot', title: 'Remate primer toque', desc: 'Define sin controlar.' },
  { key: 'oneTouchPass', title: 'Pase primer toque', desc: 'Pase rapido y limpio.' },
  { key: 'pinpointCrossing', title: 'Pase cruzado', desc: 'Centros precisos.' },
  { key: 'interception', title: 'Interceptor', desc: 'Lee linea de pase rival.' },
  { key: 'manMarking', title: 'Marcar hombre', desc: 'Marcaje intenso en duelos.' },
  { key: 'captaincy', title: 'Capitania', desc: 'Liderazgo dentro del campo.' },
  { key: 'superSub', title: 'Super refuerzo', desc: 'Rinde mas entrando del banco.' }
];

const styleCards: Array<{ key: keyof PlayingStyles; title: string; desc: string }> = [
  { key: 'goalPoacher', title: 'Cazagoles', desc: 'Ataca el area constantemente.' },
  { key: 'dummyRunner', title: 'Senuelo', desc: 'Arrastra marcas para habilitar.' },
  { key: 'foxInTheBox', title: 'Hombre de area', desc: 'Finalizador dentro del area.' },
  { key: 'targetMan', title: 'Referente', desc: 'Aguanta y descarga de espaldas.' },
  { key: 'boxToBox', title: 'Omnipresente', desc: 'Recorre todo el mediocampo.' },
  { key: 'theDestroyer', title: 'El destructor', desc: 'Presiona y recupera agresivo.' },
  { key: 'orchestrator', title: 'Organizador', desc: 'Marca ritmo del equipo.' },
  { key: 'offensiveFullback', title: 'Lateral ofensivo', desc: 'Se proyecta en ataque.' },
  { key: 'defensiveFullback', title: 'Lateral defensivo', desc: 'Prioriza cobertura atras.' },
  { key: 'crossSpecialist', title: 'Especialista centros', desc: 'Centros tensos al area.' },
  { key: 'offensiveGoalkeeper', title: 'Portero ofensivo', desc: 'Sale a cortar fuera del area.' },
  { key: 'defensiveGoalkeeper', title: 'Portero defensivo', desc: 'Se mantiene bajo palos.' }
];

const positionCards = ['PT', 'DEC', 'LI', 'LD', 'MCD', 'MC', 'MO', 'MDI', 'MDD', 'EXI', 'EXD', 'CD', 'SD'];

const clampStat = (value: number) => Math.max(40, Math.min(101, value));
const clampOverall = (value: number) => Math.max(60, Math.min(101, value));
const weightedAttrs = (attrs: PlayerAttributes, weights: Partial<Record<keyof PlayerAttributes, number>>) => {
  let sum = 0;
  let total = 0;
  (Object.entries(weights) as Array<[keyof PlayerAttributes, number]>).forEach(([key, weight]) => {
    sum += Number(attrs[key] || 0) * weight;
    total += weight;
  });
  return total > 0 ? sum / total : 70;
};

const getOverallColor = (overall: number) => {
  if (overall <= 84) return 'bg-yellow-400/90 text-slate-900 shadow-yellow-400/20';
  if (overall <= 95) return 'bg-emerald-400/90 text-slate-900 shadow-emerald-400/20';
  return 'bg-cyan-300/90 text-slate-900 shadow-cyan-300/20';
};

const getPositionAdjustedOverall = (player: Player, nextAttributes: PlayerAttributes): number => {
  const pos = player.position;
  let base = 70;

  if (pos === 'PT') {
    // GK (aproximado con atributos disponibles en este proyecto)
    base = weightedAttrs(nextAttributes, {
      goalkeeping: 0.24,
      catching: 0.2,
      reflexes: 0.2,
      coverage: 0.17,
      gkHandling: 0.19
    });
  } else if (pos === 'DEC') {
    // CB
    base = weightedAttrs(nextAttributes, {
      defensiveAwareness: 0.21,
      ballWinning: 0.19,
      physicalContact: 0.14,
      aggression: 0.1,
      jumping: 0.08,
      heading: 0.08,
      speed: 0.06,
      stamina: 0.08,
      balance: 0.03,
      lowPass: 0.03,
      kickingPower: 0.02,
      loftedPass: 0.02
    });
  } else if (['LI', 'LD'].includes(pos)) {
    // LB/RB
    base = weightedAttrs(nextAttributes, {
      speed: 0.13,
      stamina: 0.12,
      defensiveAwareness: 0.12,
      ballWinning: 0.11,
      physicalContact: 0.09,
      lowPass: 0.08,
      acceleration: 0.08,
      loftedPass: 0.07,
      aggression: 0.07,
      ballControl: 0.05,
      dribbling: 0.04,
      balance: 0.04
    });
  } else if (pos === 'MCD') {
    // DMF
    base = weightedAttrs(nextAttributes, {
      defensiveAwareness: 0.18,
      ballWinning: 0.17,
      aggression: 0.11,
      lowPass: 0.1,
      physicalContact: 0.1,
      stamina: 0.08,
      tightPossession: 0.06,
      ballControl: 0.05,
      loftedPass: 0.05,
      speed: 0.04,
      balance: 0.03,
      jumping: 0.03
    });
  } else if (pos === 'MC') {
    // CMF
    base = weightedAttrs(nextAttributes, {
      lowPass: 0.14,
      ballControl: 0.12,
      tightPossession: 0.11,
      stamina: 0.11,
      loftedPass: 0.1,
      dribbling: 0.08,
      defensiveAwareness: 0.08,
      ballWinning: 0.08,
      offensiveAwareness: 0.06,
      aggression: 0.05,
      speed: 0.04,
      balance: 0.03
    });
  } else if (pos === 'MO') {
    // AMF
    base = weightedAttrs(nextAttributes, {
      ballControl: 0.15,
      tightPossession: 0.13,
      lowPass: 0.12,
      offensiveAwareness: 0.11,
      dribbling: 0.1,
      loftedPass: 0.09,
      acceleration: 0.08,
      speed: 0.06,
      finishing: 0.06,
      kickingPower: 0.04,
      stamina: 0.04,
      balance: 0.02
    });
  } else if (['MDI', 'MDD'].includes(pos)) {
    // LMF/RMF (aproximado al perfil de CMF)
    base = weightedAttrs(nextAttributes, {
      lowPass: 0.14,
      ballControl: 0.12,
      tightPossession: 0.11,
      stamina: 0.11,
      loftedPass: 0.1,
      dribbling: 0.08,
      defensiveAwareness: 0.08,
      ballWinning: 0.08,
      offensiveAwareness: 0.06,
      aggression: 0.05,
      speed: 0.04,
      balance: 0.03
    });
  } else if (['EXI', 'EXD'].includes(pos)) {
    // LWF/RWF
    base = weightedAttrs(nextAttributes, {
      speed: 0.16,
      acceleration: 0.12,
      dribbling: 0.12,
      ballControl: 0.11,
      offensiveAwareness: 0.11,
      finishing: 0.11,
      tightPossession: 0.08,
      balance: 0.06,
      lowPass: 0.05,
      kickingPower: 0.05,
      curl: 0.03
    });
  } else if (pos === 'CD') {
    // CF
    base = weightedAttrs(nextAttributes, {
      offensiveAwareness: 0.2,
      finishing: 0.19,
      acceleration: 0.11,
      speed: 0.09,
      kickingPower: 0.08,
      ballControl: 0.08,
      dribbling: 0.07,
      tightPossession: 0.05,
      heading: 0.04,
      jumping: 0.03,
      physicalContact: 0.03,
      balance: 0.03
    });
  } else {
    // SD (SS)
    base = weightedAttrs(nextAttributes, {
      ballControl: 0.17,
      offensiveAwareness: 0.16,
      finishing: 0.14,
      dribbling: 0.11,
      tightPossession: 0.1,
      acceleration: 0.08,
      speed: 0.06,
      lowPass: 0.06,
      kickingPower: 0.05,
      balance: 0.04,
      curl: 0.03
    });
  }

  // Suaviza picos y mantiene progresion estable por entrenamiento.
  return clampOverall(Math.round((player.overall * 2 + base) / 3));
};

const withLegacyRecalculated = (attributes: PlayerAttributes): PlayerAttributes => ({
  ...attributes,
  pace: Math.round((attributes.speed + attributes.acceleration) / 2),
  shooting: Math.round((attributes.finishing + attributes.kickingPower + attributes.offensiveAwareness) / 3),
  passing: Math.round((attributes.lowPass + attributes.loftedPass + attributes.tightPossession) / 3),
  defending: Math.round((attributes.defensiveAwareness + attributes.ballWinning + attributes.aggression) / 3),
  physical: Math.round((attributes.stamina + attributes.physicalContact + attributes.jumping) / 3)
});

const applyPackPreviewToAttributes = (attributes: PlayerAttributes, pack: TrainingPack | null): PlayerAttributes => {
  if (!pack) return attributes;
  const next = { ...attributes };
  pack.effects.forEach((effect) => {
    next[effect.key] = clampStat((next[effect.key] || 0) + effect.amount);
  });
  return withLegacyRecalculated(next);
};

const buildRadarAxes = (attributes: PlayerAttributes): RadarAxis[] => {
  const avg = (keys: Array<keyof PlayerAttributes>) =>
    Math.round(keys.reduce((sum, key) => sum + Number(attributes[key] || 0), 0) / keys.length);

  return [
    { label: 'TEC', value: avg(['ballControl', 'dribbling', 'tightPossession', 'lowPass']) },
    { label: 'ATA', value: avg(['offensiveAwareness', 'finishing', 'kickingPower']) },
    { label: 'DEF', value: avg(['defensiveAwareness', 'ballWinning', 'aggression']) },
    { label: 'FIS', value: avg(['stamina', 'physicalContact', 'jumping']) },
    { label: 'VEL', value: avg(['speed', 'acceleration', 'balance']) }
  ];
};

const polarToCartesian = (cx: number, cy: number, radius: number, angleDeg: number) => {
  const radians = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) };
};

const radarPolygonPoints = (axes: RadarAxis[], cx: number, cy: number, maxRadius: number) => {
  const angleStep = 360 / axes.length;
  return axes
    .map((axis, index) => {
      const radius = (Math.max(0, Math.min(101, axis.value)) / 101) * maxRadius;
      const point = polarToCartesian(cx, cy, radius, index * angleStep);
      return `${point.x},${point.y}`;
    })
    .join(' ');
};

const RadarCard = ({
  title,
  accentClass,
  fillClass,
  strokeClass,
  axes
}: {
  title: string;
  accentClass: string;
  fillClass: string;
  strokeClass: string;
  axes: RadarAxis[];
}) => {
  const size = 220;
  const center = 110;
  const maxRadius = 78;
  const angleStep = 360 / axes.length;
  const levels = [0.25, 0.5, 0.75, 1];
  const polygon = radarPolygonPoints(axes, center, center, maxRadius);

  return (
    <article className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
      <p className={`text-center font-bold mb-3 ${accentClass}`}>{title}</p>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[240px] mx-auto">
        {levels.map((level) => {
          const points = axes
            .map((_, index) => {
              const point = polarToCartesian(center, center, maxRadius * level, index * angleStep);
              return `${point.x},${point.y}`;
            })
            .join(' ');
          return <polygon key={level} points={points} fill="none" className="stroke-slate-700" strokeWidth="1" />;
        })}
        {axes.map((_, index) => {
          const end = polarToCartesian(center, center, maxRadius, index * angleStep);
          return <line key={index} x1={center} y1={center} x2={end.x} y2={end.y} className="stroke-slate-700" strokeWidth="1" />;
        })}
        <polygon points={polygon} className={`${fillClass} ${strokeClass}`} strokeWidth="2" />
        {axes.map((axis, index) => {
          const labelPoint = polarToCartesian(center, center, maxRadius + 18, index * angleStep);
          return (
            <text key={axis.label} x={labelPoint.x} y={labelPoint.y} textAnchor="middle" dominantBaseline="middle" className="fill-slate-400 text-[11px] font-semibold">
              {axis.label}
            </text>
          );
        })}
      </svg>
    </article>
  );
};

const PlayerTraining = () => {
  const [activeTab, setActiveTab] = useState<TrainingTab>('stats');
  const [filter, setFilter] = useState<PositionFilter>('all');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [busyActionId, setBusyActionId] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const [previewPackId, setPreviewPackId] = useState<string>(trainingPacks[0]?.id || '');

  const { user, hasRole } = useAuthStore();
  const { clubs, players, updatePlayers, updateClub } = useDataStore() as any;

  const userClub = useMemo(() => {
    if (!hasRole('dt') || !user?.clubId) return null;
    return clubs.find((club: any) => club.id === user.clubId) || null;
  }, [clubs, hasRole, user?.clubId]);

  const squadPlayers = useMemo(() => {
    if (!userClub) return [];
    return players.filter((player: Player) => player.clubId === userClub.id);
  }, [players, userClub]);

  const filteredPlayers = useMemo(() => {
    const currentFilter = positionFilters.find((item) => item.id === filter);
    if (!currentFilter || currentFilter.id === 'all') return squadPlayers;
    return squadPlayers.filter((player) => currentFilter.positions.includes(player.position));
  }, [filter, squadPlayers]);

  const selectedPlayer = useMemo(() => {
    const fallbackId = selectedPlayerId || filteredPlayers[0]?.id || squadPlayers[0]?.id || '';
    if (!fallbackId) return null;
    return squadPlayers.find((player) => player.id === fallbackId) || null;
  }, [filteredPlayers, selectedPlayerId, squadPlayers]);

  const selectedStats = selectedPlayer?.attributes;
  const clubSlug = useMemo(() => userClub?.name?.toLowerCase().replace(/\s+/g, '-') || '', [userClub?.name]);

  const applyBudgetedPlayerUpdate = async (updatedPlayer: Player, cost: number) => {
    if (!userClub || !selectedPlayer) return;
    if (userClub.budget < cost) {
      setFeedback({ type: 'error', text: 'Presupuesto insuficiente para esta accion.' });
      return;
    }

    const updatedClub = { ...userClub, budget: userClub.budget - cost };

    await updatePlayer(updatedPlayer);
    await updateClub(updatedClub);
    await updatePlayers(
      players.map((player: Player) => (player.id === updatedPlayer.id ? updatedPlayer : player))
    );

    setFeedback({
      type: 'ok',
      text: `Accion aplicada a ${updatedPlayer.name}. Se descontaron ${formatCurrency(cost)} del presupuesto.`
    });
  };

  const handleTrainPack = async (pack: TrainingPack) => {
    if (!selectedPlayer) return;
    const actionId = `pack-${pack.id}`;
    setBusyActionId(actionId);
    setFeedback(null);

    try {
      const nextAttributes = { ...selectedPlayer.attributes };
      pack.effects.forEach((effect) => {
        nextAttributes[effect.key] = clampStat((nextAttributes[effect.key] || 0) + effect.amount);
      });

      const recalculatedAttributes = withLegacyRecalculated(nextAttributes);
      const calculatedOverall = getPositionAdjustedOverall(selectedPlayer, recalculatedAttributes);
      const nextOverall = Math.max(selectedPlayer.overall, calculatedOverall);
      const updatedPlayer: Player = {
        ...selectedPlayer,
        attributes: recalculatedAttributes,
        overall: nextOverall,
        transferValue: calculateMarketValueByRating(nextOverall),
        contract: {
          ...selectedPlayer.contract,
          salary: calculateSalaryByRating(nextOverall)
        }
      };

      await applyBudgetedPlayerUpdate(updatedPlayer, TRAINING_COST);
    } catch (error) {
      console.error('Error applying training pack:', error);
      setFeedback({ type: 'error', text: 'No se pudo aplicar el entrenamiento.' });
    } finally {
      setBusyActionId('');
    }
  };

  const handleLearnSkill = async (skillKey: keyof PlayerSkills) => {
    if (!selectedPlayer || selectedPlayer.skills[skillKey]) return;
    const actionId = `skill-${String(skillKey)}`;
    setBusyActionId(actionId);
    setFeedback(null);
    try {
      const updatedPlayer: Player = {
        ...selectedPlayer,
        skills: {
          ...selectedPlayer.skills,
          [skillKey]: true
        }
      };
      await applyBudgetedPlayerUpdate(updatedPlayer, TRAINING_COST);
    } catch (error) {
      console.error('Error learning skill:', error);
      setFeedback({ type: 'error', text: 'No se pudo aprender la tarjeta.' });
    } finally {
      setBusyActionId('');
    }
  };

  const handleLearnStyle = async (styleKey: keyof PlayingStyles) => {
    if (!selectedPlayer || selectedPlayer.playingStyles[styleKey]) return;
    const actionId = `style-${String(styleKey)}`;
    setBusyActionId(actionId);
    setFeedback(null);
    try {
      const updatedPlayer: Player = {
        ...selectedPlayer,
        playingStyles: {
          ...selectedPlayer.playingStyles,
          [styleKey]: true
        }
      };
      await applyBudgetedPlayerUpdate(updatedPlayer, TRAINING_COST);
    } catch (error) {
      console.error('Error learning style:', error);
      setFeedback({ type: 'error', text: 'No se pudo aprender el estilo.' });
    } finally {
      setBusyActionId('');
    }
  };

  const handleTrainPosition = async (position: string) => {
    if (!selectedPlayer || selectedPlayer.position === position) return;
    const actionId = `position-${position}`;
    setBusyActionId(actionId);
    setFeedback(null);
    try {
      const updatedPlayer: Player = {
        ...selectedPlayer,
        position
      };
      await applyBudgetedPlayerUpdate(updatedPlayer, TRAINING_COST);
    } catch (error) {
      console.error('Error updating position:', error);
      setFeedback({ type: 'error', text: 'No se pudo entrenar la posicion.' });
    } finally {
      setBusyActionId('');
    }
  };

  if (!hasRole('dt') || !userClub) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Entrenamiento no disponible</h2>
        <p className="text-gray-400 mb-8">Esta seccion es solo para cuentas DT con club asignado.</p>
        <Link to="/liga-master" className="btn-primary">
          Volver a Liga Master
        </Link>
      </div>
    );
  }

  if (!selectedPlayer || !selectedStats) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Sin jugadores disponibles</h2>
        <p className="text-gray-400 mb-8">Tu club no tiene jugadores para entrenar por ahora.</p>
        <Link to={`/liga-master/club/${clubSlug}/plantilla`} className="btn-primary">
          Ver plantilla
        </Link>
      </div>
    );
  }

  const statBlocks = [
    { title: 'Disparo', rows: [['Finalizacion', selectedStats.finishing], ['Potencia', selectedStats.kickingPower], ['Act. ofensiva', selectedStats.offensiveAwareness]] },
    { title: 'Pase', rows: [['Pase al ras', selectedStats.lowPass], ['Pase bombeado', selectedStats.loftedPass], ['Efecto', selectedStats.curl]] },
    { title: 'Regate', rows: [['Control', selectedStats.ballControl], ['Drible', selectedStats.dribbling], ['Equilibrio', selectedStats.balance]] },
    { title: 'Fisico y def.', rows: [['Velocidad', selectedStats.speed], ['Aceleracion', selectedStats.acceleration], ['Defensa', selectedStats.defensiveAwareness], ['Recuperacion', selectedStats.ballWinning]] }
  ] as const;
  const previewPack = trainingPacks.find((pack) => pack.id === previewPackId) || null;
  const previewAttributes = applyPackPreviewToAttributes(selectedStats, previewPack);
  const currentRadarAxes = buildRadarAxes(selectedStats);
  const previewRadarAxes = buildRadarAxes(previewAttributes);

  return (
    <div className="relative min-h-screen bg-dark overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.85)_0%,rgba(15,23,42,0.78)_60%,rgba(15,23,42,0.95)_100%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1800&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      <div className="container relative mx-auto px-4 lg:px-6 py-8 max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/liga-master" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">
            <ArrowLeft size={16} />
            Volver al dashboard
          </Link>
          <Link to={`/liga-master/club/${clubSlug}/plantilla`} className="text-sm text-primary hover:text-primary-light">
            Ver plantilla
          </Link>
        </div>

        <header className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-black text-emerald-300 tracking-tight">Entrenamiento de Jugadores</h1>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-400/35 bg-slate-900/65 text-slate-200">
            <Sparkles size={16} className="text-emerald-300" />
            <span className="text-sm">Presupuesto: <strong className="text-emerald-300">{formatCurrency(userClub.budget)}</strong></span>
          </div>
        </header>

        <div className="flex flex-wrap justify-center gap-2">
          {[
            ['stats', 'Estadisticas'],
            ['train', 'Entrenar'],
            ['skills', 'Tarjetas'],
            ['positions', 'Posiciones'],
            ['styles', 'Estilo']
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id as TrainingTab)}
              className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                activeTab === id
                  ? 'bg-emerald-400 text-slate-900 border-emerald-300'
                  : 'bg-slate-900/70 text-slate-300 border-slate-700 hover:border-slate-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {positionFilters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-colors ${
                filter === item.id
                  ? 'bg-emerald-400 text-slate-900 border-emerald-300'
                  : 'bg-slate-900/70 text-slate-300 border-slate-700 hover:border-slate-500'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredPlayers.map((player) => (
            <button
              key={player.id}
              type="button"
              onClick={() => setSelectedPlayerId(player.id)}
              className={`text-left rounded-2xl border p-4 bg-slate-900/75 transition-all ${
                selectedPlayer.id === player.id
                  ? 'border-emerald-300 shadow-[0_0_0_1px_rgba(52,211,153,0.35)]'
                  : 'border-slate-700 hover:border-slate-500'
              }`}
            >
              <div className="w-16 h-16 rounded-full border border-slate-600 overflow-hidden mb-3">
                <img
                  src={player.image || '/default.png'}
                  alt={player.name}
                  className="w-full h-full object-cover"
                  onError={(event) => {
                    const target = event.target as HTMLImageElement;
                    target.src = '/default.png';
                  }}
                />
              </div>
              <p className="font-semibold text-white leading-tight">{player.name}</p>
              <p className="text-xs text-slate-400 mt-1">{getTranslatedPosition(player.position)} | Val: {player.overall}</p>
            </button>
          ))}
        </div>

        <section className="rounded-2xl border border-slate-700/60 bg-slate-900/75 p-5 md:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-400">Jugador seleccionado</p>
              <h2 className="text-2xl font-bold text-white">{selectedPlayer.name}</h2>
            </div>
            <span className={`inline-flex min-w-[34px] justify-center px-2 py-1 rounded-md text-xs font-black shadow ${getOverallColor(selectedPlayer.overall)}`}>
              {selectedPlayer.overall}
            </span>
          </div>

          {feedback && (
            <div className={`rounded-lg border px-4 py-3 text-sm ${feedback.type === 'ok' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : 'border-rose-500/40 bg-rose-500/10 text-rose-200'}`}>
              {feedback.text}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {statBlocks.map((block) => (
                <article key={block.title} className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
                  <h3 className="text-cyan-300 font-bold uppercase text-sm tracking-wide mb-4">{block.title}</h3>
                  <div className="space-y-3">
                    {block.rows.map(([label, value]) => (
                      <div key={label as string}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-300">{label}</span>
                          <span className="text-emerald-300 font-semibold">{value}</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-slate-700">
                          <div className="h-full rounded-full bg-emerald-300" style={{ width: `${Math.min(100, Number(value))}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}

          {activeTab === 'train' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <p className="text-sm text-slate-400">Comparativa del pack seleccionado</p>
                  <span className="text-xs text-amber-300 font-semibold">
                    {previewPack ? `Vista previa: ${previewPack.title}` : 'Selecciona un pack'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RadarCard
                    title="Actual"
                    accentClass="text-emerald-300"
                    fillClass="fill-emerald-400/30"
                    strokeClass="stroke-emerald-300"
                    axes={currentRadarAxes}
                  />
                  <RadarCard
                    title="Vista previa (+1)"
                    accentClass="text-amber-300"
                    fillClass="fill-amber-400/30"
                    strokeClass="stroke-amber-300"
                    axes={previewRadarAxes}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {trainingPacks.map((pack) => (
                  <article key={pack.id} className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
                    <h3 className="text-cyan-300 font-bold uppercase text-sm tracking-wide">{pack.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 mb-4">{pack.description}</p>
                    <div className="space-y-2 mb-4">
                      {pack.effects.map((effect) => {
                        const current = Number(selectedStats[effect.key] || 0);
                        const preview = clampStat(current + effect.amount);
                        return (
                          <div key={String(effect.key)} className="flex items-center justify-between text-sm">
                            <span className="text-slate-300">{effect.label}</span>
                            <span className="font-semibold text-emerald-300">{current} <span className="text-amber-300">({preview})</span></span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setPreviewPackId(pack.id)}
                        className={`w-full py-2 rounded-lg font-semibold text-sm transition-colors ${
                          previewPackId === pack.id
                            ? 'bg-amber-400 text-slate-900'
                            : 'bg-slate-700 text-white hover:bg-slate-600'
                        }`}
                      >
                        Vista previa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTrainPack(pack)}
                        disabled={busyActionId === `pack-${pack.id}`}
                        className={`w-full py-2 rounded-lg font-semibold text-sm transition-colors ${
                          busyActionId === `pack-${pack.id}`
                            ? 'bg-emerald-500/50 text-slate-200 cursor-wait'
                            : 'bg-emerald-400 text-slate-900 hover:bg-emerald-300'
                        }`}
                      >
                        {busyActionId === `pack-${pack.id}` ? 'Entrenando...' : `Entrenar (${Math.round(TRAINING_COST / 1_000_000)}M)`}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {skillCards.map((skill) => {
                const learned = Boolean(selectedPlayer.skills[skill.key]);
                const actionId = `skill-${String(skill.key)}`;
                return (
                  <article key={String(skill.key)} className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
                    <h3 className="text-cyan-300 font-bold">{skill.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 mb-4">{skill.desc}</p>
                    <button
                      type="button"
                      onClick={() => handleLearnSkill(skill.key)}
                      disabled={learned || busyActionId === actionId}
                      className={`w-full py-2 rounded-lg font-semibold text-sm transition-colors ${
                        learned
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                          : busyActionId === actionId
                            ? 'bg-slate-600 text-slate-200 cursor-wait'
                            : 'bg-slate-700 text-white hover:bg-slate-600'
                      }`}
                    >
                      {learned ? (<span className="inline-flex items-center gap-1"><Check size={14} /> Aprendida</span>) : (busyActionId === actionId ? 'Aplicando...' : `Aprender (${Math.round(TRAINING_COST / 1_000_000)}M)`)}
                    </button>
                  </article>
                );
              })}
            </div>
          )}

          {activeTab === 'positions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {positionCards.map((position) => {
                const isCurrent = selectedPlayer.position === position;
                const actionId = `position-${position}`;
                return (
                  <article key={position} className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
                    <h3 className="text-cyan-300 font-bold text-2xl">{position}</h3>
                    <p className="text-xs text-slate-400 mt-1 mb-4">Entrenamiento especifico de posicion.</p>
                    <button
                      type="button"
                      onClick={() => handleTrainPosition(position)}
                      disabled={isCurrent || busyActionId === actionId}
                      className={`w-full py-2 rounded-lg font-semibold text-sm transition-colors ${
                        isCurrent
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                          : busyActionId === actionId
                            ? 'bg-slate-600 text-slate-200 cursor-wait'
                            : 'bg-slate-700 text-white hover:bg-slate-600'
                      }`}
                    >
                      {isCurrent ? 'Posicion actual' : busyActionId === actionId ? 'Entrenando...' : `Entrenar (${Math.round(TRAINING_COST / 1_000_000)}M)`}
                    </button>
                  </article>
                );
              })}
            </div>
          )}

          {activeTab === 'styles' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {styleCards.map((style) => {
                const learned = Boolean(selectedPlayer.playingStyles[style.key]);
                const actionId = `style-${String(style.key)}`;
                return (
                  <article key={String(style.key)} className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
                    <h3 className="text-cyan-300 font-bold">{style.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 mb-4">{style.desc}</p>
                    <button
                      type="button"
                      onClick={() => handleLearnStyle(style.key)}
                      disabled={learned || busyActionId === actionId}
                      className={`w-full py-2 rounded-lg font-semibold text-sm transition-colors ${
                        learned
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                          : busyActionId === actionId
                            ? 'bg-slate-600 text-slate-200 cursor-wait'
                            : 'bg-slate-700 text-white hover:bg-slate-600'
                      }`}
                    >
                      {learned ? (<span className="inline-flex items-center gap-1"><Check size={14} /> Aprendido</span>) : (busyActionId === actionId ? 'Aplicando...' : `Aprender (${Math.round(TRAINING_COST / 1_000_000)}M)`)}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PlayerTraining;
