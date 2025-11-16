import { useState } from 'react';
import {
  X,
  ChevronDown,
  ChevronUp,
  Zap,
  Target,
  RotateCcw,
  Hand,
  Triangle,
  Volleyball,
  Footprints,
  Wind,
  Rocket,
  Gauge,
  ArrowUp,
  Dumbbell,
  Scale,
  Activity,
  Shield,
  TrendingUp,
  AlertCircle,
  Star,
  Award,
  Users,
  Crosshair,
  Send,
  Clock,
  Eye as EyeIcon,
  Ruler,
  DollarSign
} from 'lucide-react';
import { Player } from '../../types';
import { formatCurrency } from '../../utils/format';
import { getTranslatedPosition, getPositionFullName } from '../../utils/helpers';

interface PlayerStatsModalProps {
  player: Player;
  isOpen: boolean;
  onClose: () => void;
}

const PlayerStatsModal = ({ player, isOpen, onClose }: PlayerStatsModalProps) => {
  const [expandedSections, setExpandedSections] = useState({
    fieldAttributes: true,
    goalkeeperAttributes: true,
    specialAttributes: true,
    skills: false,
    playingStyles: false
  });

  if (!isOpen || !player) return null;

  // Get slider color based on value
  const getSliderColor = (value: number) => {
    if (value >= 40 && value <= 74) return 'red';
    if (value >= 75 && value <= 84) return 'yellow';
    if (value >= 85 && value <= 94) return 'green';
    if (value >= 95 && value <= 99) return 'cyan';
    return 'red';
  };

  // Get text color class based on slider value
  const getSliderTextColor = (value: number) => {
    const color = getSliderColor(value);
    switch (color) {
      case 'red': return 'text-red-500';
      case 'yellow': return 'text-yellow-500';
      case 'green': return 'text-green-500';
      case 'cyan': return 'text-cyan-500';
      default: return 'text-red-500';
    }
  };

  // Safe getters for player properties
  const safeSkills = player.skills || {};
  const safePlayingStyles = player.playingStyles || {};
  const safeAttributes = player.attributes || {};

  // Professional icon mapping for attributes
  const attributeIcons: Record<string, React.ComponentType<any>> = {
    offensiveAwareness: Zap,
    ballControl: Target,
    dribbling: RotateCcw,
    tightPossession: Hand,
    lowPass: Triangle,
    loftedPass: Send,
    finishing: Crosshair,
    heading: Footprints,
    setPieceTaking: Award,
    curl: Wind,
    speed: Gauge,
    acceleration: Rocket,
    kickingPower: TrendingUp,
    jumping: ArrowUp,
    physicalContact: Dumbbell,
    balance: Scale,
    stamina: Activity,
    defensiveAwareness: Shield,
    ballWinning: RotateCcw,
    aggression: AlertCircle
  };

  // Get color class for slider
  const getSliderColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-500';
      case 'yellow': return 'bg-yellow-500';
      case 'green': return 'bg-green-500';
      case 'cyan': return 'bg-cyan-500';
      default: return 'bg-gray-500';
    }
  };

  // Traducciones de habilidades al español
  const skillTranslations: Record<string, string> = {
    scissorKick: 'Tijera',
    doubleTouch: 'Doble toque',
    flipFlap: 'Gambeta',
    marseilleTurn: 'Marsellesa',
    rainbow: 'Sombrerito',
    chopTurn: 'Cortada',
    cutBehindAndTurn: 'Amago por detrás y giro',
    scotchMove: 'Rebote interior',
    stepOnSkillControl: 'Pisar el balón',
    heading: 'Cabeceador',
    longRangeDrive: 'Cañonero',
    chipShotControl: 'Sombrero',
    longRanger: 'Tiro de larga distancia',
    knuckleShot: 'Tiro con empeine',
    dippingShot: 'Disparo descendente',
    risingShot: 'Disparo ascendente',
    acrobaticFinishing: 'Finalización acrobática',
    heelTrick: 'Taconazo',
    firstTimeShot: 'Remate primer toque',
    oneTouchPass: 'Pase al primer toque',
    throughPassing: 'Pase en profundidad',
    weightedPass: 'Pase a profundidad',
    pinpointCrossing: 'Pase cruzado',
    outsideCurler: 'Centro con rosca',
    rabona: 'Rabona',
    noLookPass: 'Pase sin mirar',
    lowLoftedPass: 'Pase bombeado bajo',
    giantKill: 'Patadón en corto',
    longThrow: 'Patadón en largo',
    longThrow2: 'Saque largo de banda',
    gkLongThrow: 'Saque de meta largo',
    penaltySpecialist: 'Especialista en penales',
    gkPenaltySaver: 'Parapenales',
    fightingSpirit: 'Malicia',
    manMarking: 'Marcar hombre',
    trackBack: 'Delantero atrasado',
    interception: 'Interceptor',
    acrobaticClear: 'Despeje acrobático',
    captaincy: 'Capitanía',
    superSub: 'Súper refuerzo',
    comPlayingStyles: 'Espíritu de lucha'
  };

  // Traducciones de estilos de juego al español
  const playingStyleTranslations: Record<string, string> = {
    goalPoacher: 'Cazagoles',
    dummyRunner: 'Señuelo',
    foxInTheBox: 'Hombre de área',
    targetMan: 'Referente',
    classicNo10: 'Diez clásico',
    prolificWinger: 'Extremo prolífico',
    roamingFlank: 'Extremo móvil',
    crossSpecialist: 'Especialista en centros',
    holePlayer: 'Jugador de huecos',
    boxToBox: 'Omnipresente',
    theDestroyer: 'El destructor',
    orchestrator: 'Organizador',
    anchor: 'Medio escudo',
    offensiveFullback: 'Lateral ofensivo',
    fullbackFinisher: 'Lateral finalizador',
    defensiveFullback: 'Lateral defensivo',
    buildUp: 'Creación',
    extraFrontman: 'Atacante extra',
    offensiveGoalkeeper: 'Portero ofensivo',
    defensiveGoalkeeper: 'Portero defensivo'
  };

  // Toggle section expansion
  const toggleSectionExpansion = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onKeyDown={handleKeyDown}>
      <div className="absolute inset-0 bg-black/70" onClick={handleOverlayClick}></div>
      <div className="relative bg-gray-900 rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-gray-700" tabIndex={-1}>
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Player photo with dorsal badge */}
              <div className="relative mr-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden">
                  <img
                    src={player.image || '/default.png'}
                    alt={player.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to default image if image fails
                      const target = e.target as HTMLImageElement;
                      target.src = '/default.png';
                    }}
                  />
                </div>
                {/* Dorsal badge */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{player.dorsal}</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{player.name}</h3>
                <div className="flex items-center gap-3 text-gray-300">
                  <span className="bg-gray-700 px-2 py-1 rounded text-xs font-medium">{getTranslatedPosition(player.position)}</span>
                  <span className="text-sm">{player.age} años</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-semibold text-yellow-400">{player.overall}</span>
                  </div>
                  <span className="text-sm">{player.nationality}</span>
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center mr-3">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <h4 className="text-lg font-bold text-primary">Estadísticas de Carrera</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center mr-3">
                      <EyeIcon className="w-3 h-3 text-blue-400" />
                    </div>
                    <span className="text-gray-300 text-sm">Partidos jugados</span>
                  </div>
                  <span className="text-xl font-bold text-white">{player.appearances}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center mr-3">
                      <Target className="w-3 h-3 text-green-400" />
                    </div>
                    <span className="text-gray-300 text-sm">Goles</span>
                  </div>
                  <span className="text-xl font-bold text-green-400">{player.goals}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center mr-3">
                      <Send className="w-3 h-3 text-purple-400" />
                    </div>
                    <span className="text-gray-300 text-sm">Asistencias</span>
                  </div>
                  <span className="text-xl font-bold text-purple-400">{player.assists}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-yellow-500/20 rounded flex items-center justify-center mr-3">
                      <Award className="w-3 h-3 text-yellow-400" />
                    </div>
                    <span className="text-gray-300 text-sm">Valor de mercado</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-400">{formatCurrency((player as any).transferValue ?? (player as any).value ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-emerald-500/20 rounded flex items-center justify-center mr-3">
                      <DollarSign className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="text-gray-300 text-sm">Salario anual</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-400">{formatCurrency((player as any).contract?.salary || 0)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-secondary/20 rounded-lg flex items-center justify-center mr-3">
                  <Activity className="w-4 h-4 text-secondary" />
                </div>
                <h4 className="text-lg font-bold text-secondary">Condición Física</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-red-500/20 rounded flex items-center justify-center mr-3">
                      <Shield className="w-3 h-3 text-red-400" />
                    </div>
                    <span className="text-gray-300 text-sm">Resistencia a lesiones</span>
                  </div>
                  <span className={`text-sm font-bold px-2 py-1 rounded ${
                    player.injuryResistance === 3 ? 'bg-green-500/20 text-green-400' :
                    player.injuryResistance === 2 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {player.injuryResistance === 1 ? 'Baja' :
                     player.injuryResistance === 2 ? 'Media' : 'Alta'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-orange-500/20 rounded flex items-center justify-center mr-3">
                      <TrendingUp className="w-3 h-3 text-orange-400" />
                    </div>
                    <span className="text-gray-300 text-sm">Forma actual</span>
                  </div>
                  <span className={`text-sm font-bold px-2 py-1 rounded ${
                    player.form >= 4 ? 'bg-green-500/20 text-green-400' :
                    player.form >= 3 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {player.form === 1 ? 'Mala' :
                     player.form === 2 ? 'Regular' :
                     player.form === 3 ? 'Buena' :
                     player.form === 4 ? 'Excelente' : 'Perfecta'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center mr-3">
                      <Ruler className="w-3 h-3 text-blue-400" />
                    </div>
                    <span className="text-gray-300 text-sm">Altura</span>
                  </div>
                  <span className="text-lg font-bold text-white">
                    {player.height ? (
                      <>
                        {player.height} <span className="text-xs text-gray-400">cm</span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-500 italic">No registrado</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-cyan-500/20 rounded flex items-center justify-center mr-3">
                      <Dumbbell className="w-3 h-3 text-cyan-400" />
                    </div>
                    <span className="text-gray-300 text-sm">Peso</span>
                  </div>
                  <span className="text-lg font-bold text-white">
                    {player.weight ? (
                      <>
                        {player.weight} <span className="text-xs text-gray-400">kg</span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-500 italic">No registrado</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Atributos de Campo */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mr-3">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-primary">Atributos de Campo</h4>
                  <p className="text-gray-400 text-sm">26 atributos técnicos y físicos</p>
                </div>
              </div>
              <button
                onClick={() => toggleSectionExpansion('fieldAttributes')}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-gray-300 hover:text-white transition-colors"
              >
                {expandedSections.fieldAttributes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                <span className="text-sm">{expandedSections.fieldAttributes ? 'Ocultar' : 'Mostrar'}</span>
              </button>
            </div>

            {expandedSections.fieldAttributes && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[
                  { key: 'offensiveAwareness', label: 'Actitud ofensiva', category: 'Ataque' },
                  { key: 'ballControl', label: 'Control de balón', category: 'Técnica' },
                  { key: 'dribbling', label: 'Drible', category: 'Técnica' },
                  { key: 'tightPossession', label: 'Posesión del balón', category: 'Técnica' },
                  { key: 'lowPass', label: 'Pase al ras', category: 'Pase' },
                  { key: 'loftedPass', label: 'Pase bombeado', category: 'Pase' },
                  { key: 'finishing', label: 'Finalización', category: 'Ataque' },
                  { key: 'heading', label: 'Cabeceador', category: 'Ataque' },
                  { key: 'setPieceTaking', label: 'Balón parado', category: 'Ataque' },
                  { key: 'curl', label: 'Efecto', category: 'Técnica' },
                  { key: 'speed', label: 'Velocidad', category: 'Físico' },
                  { key: 'acceleration', label: 'Aceleración', category: 'Físico' },
                  { key: 'kickingPower', label: 'Potencia de tiro', category: 'Ataque' },
                  { key: 'jumping', label: 'Salto', category: 'Físico' },
                  { key: 'physicalContact', label: 'Contacto físico', category: 'Físico' },
                  { key: 'balance', label: 'Equilibrio', category: 'Físico' },
                  { key: 'stamina', label: 'Resistencia', category: 'Físico' },
                  { key: 'defensiveAwareness', label: 'Actitud defensiva', category: 'Defensa' },
                  { key: 'ballWinning', label: 'Recuperación de balón', category: 'Defensa' },
                  { key: 'aggression', label: 'Agresividad', category: 'Mental' }
                ].map(attr => {
                  const IconComponent = attributeIcons[attr.key];
                  const value = (safeAttributes as any)[attr.key] || 50;
                  const percentage = ((value - 40) / 59) * 100;

                  return (
                    <div key={attr.key} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-4 h-4 text-gray-400" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-white">{attr.label}</span>
                            <span className="text-xs text-gray-500 block">{attr.category}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getSliderColorClass(getSliderColor(value))} rounded-full`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">40</span>
                          <span className={`text-sm font-bold ${getSliderTextColor(value)}`}>
                            {value}
                          </span>
                          <span className="text-xs text-gray-500">99</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Atributos de Portero (si aplica) */}
          {['GK', 'POR', player.position].some(pos => ['GK', 'POR'].includes(pos)) && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center mr-3">
                    <Shield className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-secondary">Atributos de Portero</h4>
                    <p className="text-gray-400 text-sm">5 atributos especializados</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSectionExpansion('goalkeeperAttributes')}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-gray-300 hover:text-white transition-colors"
                >
                  {expandedSections.goalkeeperAttributes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  <span className="text-sm">{expandedSections.goalkeeperAttributes ? 'Ocultar' : 'Mostrar'}</span>
                </button>
              </div>

              {expandedSections.goalkeeperAttributes && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { key: 'goalkeeping', label: 'Atajar', category: 'Portería' },
                    { key: 'catching', label: 'Despejar', category: 'Portería' },
                    { key: 'reflexes', label: 'Reflejos', category: 'Portería' },
                    { key: 'coverage', label: 'Cobertura', category: 'Portería' },
                    { key: 'gkHandling', label: 'Actitud de portero', category: 'Portería' }
                  ].map(attr => {
                    const value = (safeAttributes as any)[attr.key] || 50;
                    const percentage = ((value - 40) / 59) * 100;

                    return (
                      <div key={attr.key} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                              <Target className="w-4 h-4 text-gray-400" />
                            </div>
                            <div>
                              <span className="text-sm font-medium text-white">{attr.label}</span>
                              <span className="text-xs text-gray-500 block">{attr.category}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getSliderColorClass(getSliderColor(value))} rounded-full`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">40</span>
                            <span className={`text-sm font-bold ${getSliderTextColor(value)}`}>
                              {value}
                            </span>
                            <span className="text-xs text-gray-500">99</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Subatributos Especiales */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center mr-3">
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-yellow-500">Subatributos Especiales</h4>
                  <p className="text-gray-400 text-sm">3 características únicas del jugador</p>
                </div>
              </div>
              <button
                onClick={() => toggleSectionExpansion('specialAttributes')}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-gray-300 hover:text-white transition-colors"
              >
                {expandedSections.specialAttributes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                <span className="text-sm">{expandedSections.specialAttributes ? 'Ocultar' : 'Mostrar'}</span>
              </button>
            </div>

            {expandedSections.specialAttributes && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center mr-3">
                      <Footprints className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Uso de Pie Malo</div>
                      <div className="text-xs text-gray-400">Precisión y control</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${safeAttributes.weakFootUsage >= 3 ? 'bg-green-500' :
                          safeAttributes.weakFootUsage >= 2 ? 'bg-yellow-500' : 'bg-red-500'} rounded-full`}
                        style={{ width: `${((safeAttributes.weakFootUsage - 1) / 3) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">1</span>
                      <span className={`text-sm font-bold ${
                        safeAttributes.weakFootUsage >= 3 ? 'text-green-400' :
                        safeAttributes.weakFootUsage >= 2 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {safeAttributes.weakFootUsage || 1}
                      </span>
                      <span className="text-xs text-gray-500">4</span>
                    </div>
                    <div className="text-center mt-1">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                        safeAttributes.weakFootUsage >= 3 ? 'bg-green-500/20 text-green-400' :
                        safeAttributes.weakFootUsage >= 2 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {safeAttributes.weakFootUsage === 1 ? 'Malo' :
                         safeAttributes.weakFootUsage === 2 ? 'Regular' :
                         safeAttributes.weakFootUsage === 3 ? 'Bueno' :
                         safeAttributes.weakFootUsage === 4 ? 'Excelente' : 'Malo'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded flex items-center justify-center mr-3">
                      <Crosshair className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Precisión de Pie Malo</div>
                      <div className="text-xs text-gray-400">Calidad de disparo</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${safeAttributes.weakFootAccuracy >= 3 ? 'bg-green-500' :
                          safeAttributes.weakFootAccuracy >= 2 ? 'bg-yellow-500' : 'bg-red-500'} rounded-full`}
                        style={{ width: `${((safeAttributes.weakFootAccuracy - 1) / 3) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">1</span>
                      <span className={`text-sm font-bold ${
                        safeAttributes.weakFootAccuracy >= 3 ? 'text-green-400' :
                        safeAttributes.weakFootAccuracy >= 2 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {safeAttributes.weakFootAccuracy || 1}
                      </span>
                      <span className="text-xs text-gray-500">4</span>
                    </div>
                    <div className="text-center mt-1">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                        safeAttributes.weakFootAccuracy >= 3 ? 'bg-green-500/20 text-green-400' :
                        safeAttributes.weakFootAccuracy >= 2 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {safeAttributes.weakFootAccuracy === 1 ? 'Malo' :
                         safeAttributes.weakFootAccuracy === 2 ? 'Regular' :
                         safeAttributes.weakFootAccuracy === 3 ? 'Bueno' :
                         safeAttributes.weakFootAccuracy === 4 ? 'Excelente' : 'Malo'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-orange-500/20 rounded flex items-center justify-center mr-3">
                      <TrendingUp className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Estabilidad (Forma)</div>
                      <div className="text-xs text-gray-400">Consistencia del rendimiento</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${safeAttributes.form >= 6 ? 'bg-green-500' :
                          safeAttributes.form >= 4 ? 'bg-yellow-500' : 'bg-red-500'} rounded-full`}
                        style={{ width: `${((safeAttributes.form - 1) / 7) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">1</span>
                      <span className={`text-sm font-bold ${
                        safeAttributes.form >= 6 ? 'text-green-400' :
                        safeAttributes.form >= 4 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {safeAttributes.form || 1}
                      </span>
                      <span className="text-xs text-gray-500">8</span>
                    </div>
                    <div className="text-center mt-1">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                        safeAttributes.form >= 6 ? 'bg-green-500/20 text-green-400' :
                        safeAttributes.form >= 4 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {safeAttributes.form === 1 ? 'Mala' :
                         safeAttributes.form === 2 ? 'Regular' :
                         safeAttributes.form === 3 ? 'Buena' :
                         safeAttributes.form === 4 ? 'Excelente' :
                         safeAttributes.form === 5 ? 'Perfecta' :
                         safeAttributes.form === 6 ? 'Sobresaliente' :
                         safeAttributes.form === 7 ? 'Legendaria' :
                         safeAttributes.form === 8 ? 'Máxima' : 'Mala'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Habilidades */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                  <Award className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-green-500">Habilidades Especiales</h4>
                  <p className="text-gray-400 text-sm">{Object.values(safeSkills).filter(Boolean).length} de 39 habilidades desbloqueadas</p>
                </div>
              </div>
              <button
                onClick={() => toggleSectionExpansion('skills')}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-gray-300 hover:text-white transition-colors"
              >
                {expandedSections.skills ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                <span className="text-sm">{expandedSections.skills ? 'Ocultar' : 'Mostrar'}</span>
              </button>
            </div>

            {expandedSections.skills && (
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {Object.entries(safeSkills).map(([skillKey, skillValue]) => (
                    skillValue && (
                      <div key={skillKey} className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                        <div className="text-center">
                          <div className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center mx-auto mb-2">
                            <Star className="w-3 h-3 text-green-400" />
                          </div>
                          <span className="text-xs font-medium text-green-400 text-center block leading-tight">
                            {skillTranslations[skillKey] || skillKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Estilos de Juego */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                  <Users className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-purple-500">Estilos de Juego</h4>
                  <p className="text-gray-400 text-sm">{Object.values(safePlayingStyles).filter(Boolean).length} de 22 estilos activos</p>
                </div>
              </div>
              <button
                onClick={() => toggleSectionExpansion('playingStyles')}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-gray-300 hover:text-white transition-colors"
              >
                {expandedSections.playingStyles ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                <span className="text-sm">{expandedSections.playingStyles ? 'Ocultar' : 'Mostrar'}</span>
              </button>
            </div>

            {expandedSections.playingStyles && (
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {Object.entries(safePlayingStyles).map(([styleKey, styleValue]) => (
                    styleValue && (
                      <div key={styleKey} className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                        <div className="text-center">
                          <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center mx-auto mb-2">
                            <Users className="w-3 h-3 text-purple-400" />
                          </div>
                          <span className="text-xs font-medium text-purple-400 text-center block leading-tight">
                            {playingStyleTranslations[styleKey] || styleKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsModal;
