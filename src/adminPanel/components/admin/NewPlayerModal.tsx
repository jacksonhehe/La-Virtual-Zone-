import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { useState, useRef, useEffect } from 'react';
import { Player } from '../../../types/shared';
import { useGlobalStore } from '../../store/globalStore';
import LogoUploadField from './LogoUploadField';
import { 
  User, 
  Trophy, 
  Target, 
  Zap, 
  Shield, 
  Heart, 
  Star,
  Camera,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  Award
} from 'lucide-react';

interface Props {
  onClose: () => void;
  onSave: (playerData: Partial<Player>) => void;
}

interface PlayerFormData {
  // Datos básicos
  name: string;
  age: number;
  nationality: string;
  clubId: string;
  dorsal: number;
  dominantFoot: 'left' | 'right';
  height: number;
  weight: number;
  position: string;
  secondaryPositions: string[];
  image: string;
  
  // Estadísticas de habilidad
  offensive: number;
  ballControl: number;
  dribbling: number;
  lowPass: number;
  loftedPass: number;
  finishing: number;
  placeKicking: number;
  volleys: number;
  curl: number;
  speed: number;
  acceleration: number;
  kickingPower: number;
  stamina: number;
  jumping: number;
  physicalContact: number;
  balance: number;
  defensive: number;
  ballWinning: number;
  aggression: number;
  
  // Estadísticas de portero (si aplica)
  goalkeeperReach: number;
  goalkeeperReflexes: number;
  goalkeeperClearing: number;
  goalkeeperThrowing: number;
  goalkeeperHandling: number;
  
  // Características físicas y salud
  consistency: number;
  injuryResistance: number;
  morale: number;
  
  // Rasgos especiales
  specialSkills: string[];
  playingStyle: string;
  celebrations: string[];
  
  // Información de contrato
  contractYears: number;
  salary: number;
  marketValue: number;
  overall: number;
  potential: number;
}

const NewPlayerModal = ({ onClose, onSave }: Props) => {
  const { clubs } = useGlobalStore();
  const [formData, setFormData] = useState<PlayerFormData>({
    // Datos básicos
    name: '',
    age: 18,
    nationality: '',
    clubId: '',
    dorsal: 1,
    dominantFoot: 'right',
    height: 175,
    weight: 70,
    position: 'CF',
    secondaryPositions: [],
    image: '',
    
    // Estadísticas de habilidad
    offensive: 70,
    ballControl: 70,
    dribbling: 70,
    lowPass: 70,
    loftedPass: 70,
    finishing: 70,
    placeKicking: 70,
    volleys: 70,
    curl: 70,
    speed: 70,
    acceleration: 70,
    kickingPower: 70,
    stamina: 70,
    jumping: 70,
    physicalContact: 70,
    balance: 70,
    defensive: 70,
    ballWinning: 70,
    aggression: 70,
    
    // Estadísticas de portero
    goalkeeperReach: 70,
    goalkeeperReflexes: 70,
    goalkeeperClearing: 70,
    goalkeeperThrowing: 70,
    goalkeeperHandling: 70,
    
    // Características físicas
    consistency: 70,
    injuryResistance: 70,
    morale: 70,
    
    // Rasgos especiales
    specialSkills: [],
    playingStyle: 'Balanced',
    celebrations: [],
    
    // Información de contrato
    contractYears: 3,
    salary: 50000,
    marketValue: 1000000,
    overall: 75,
    potential: 80,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'skills' | 'physical' | 'special' | 'contract'>('basic');
  const modalRef = useRef<HTMLDivElement>(null);

  // Posiciones PES 2021
  const positions = [
    { value: 'GK', label: 'Portero (GK)' },
    { value: 'CB', label: 'Central (CB)' },
    { value: 'LB', label: 'Lateral Izquierdo (LB)' },
    { value: 'RB', label: 'Lateral Derecho (RB)' },
    { value: 'DMF', label: 'Mediocentro Defensivo (DMF)' },
    { value: 'CMF', label: 'Mediocentro (CMF)' },
    { value: 'AMF', label: 'Mediocentro Ofensivo (AMF)' },
    { value: 'LMF', label: 'Medio Izquierdo (LMF)' },
    { value: 'RMF', label: 'Medio Derecho (RMF)' },
    { value: 'LWF', label: 'Extremo Izquierdo (LWF)' },
    { value: 'RWF', label: 'Extremo Derecho (RWF)' },
    { value: 'SS', label: 'Segundo Delantero (SS)' },
    { value: 'CF', label: 'Delantero Centro (CF)' },
  ];

  const secondaryPositions = [
    { value: 'GK', label: 'Portero' },
    { value: 'CB', label: 'Central' },
    { value: 'LB', label: 'Lateral Izquierdo' },
    { value: 'RB', label: 'Lateral Derecho' },
    { value: 'DMF', label: 'Mediocentro Defensivo' },
    { value: 'CMF', label: 'Mediocentro' },
    { value: 'AMF', label: 'Mediocentro Ofensivo' },
    { value: 'LMF', label: 'Medio Izquierdo' },
    { value: 'RMF', label: 'Medio Derecho' },
    { value: 'LWF', label: 'Extremo Izquierdo' },
    { value: 'RWF', label: 'Extremo Derecho' },
    { value: 'SS', label: 'Segundo Delantero' },
    { value: 'CF', label: 'Delantero Centro' },
  ];

  const specialSkills = [
    'Acrobatic Clear', 'Acrobatic Finishing', 'Aerial Superiority', 'Chip Shot Control',
    'Cut Behind & Turn', 'Double Touch', 'Elastic', 'Fighting Spirit', 'First-time Shot',
    'GK High Punt', 'GK Long Throw', 'GK Penalty Saver', 'GK Punt', 'Heading',
    'Heel Trick', 'Interception', 'Long Range Drive', 'Long Range Shooting',
    'Long Throw', 'Low Lofted Pass', 'Man Marking', 'Marseille Turn',
    'One-touch Pass', 'Outside Curler', 'Penalty Specialist', 'Pinpoint Crossing',
    'Rabona', 'Rising Shots', 'Scotch Move', 'Sole Control', 'Sombrero',
    'Speed Merchant', 'Super-sub', 'Through Passing', 'Track Back', 'Weighted Pass'
  ];

  const playingStyles = [
    'Balanced', 'Hole Player', 'Box-to-Box', 'Orchestrator', 'Anchor Man',
    'The Destroyer', 'Extra Frontman', 'Offensive Fullback', 'Defensive Fullback',
    'Cross Specialist', 'Prolific Winger', 'Classic No.10', 'Creative Playmaker',
    'Dummy Runner', 'Goal Poacher', 'Fox in the Box', 'Target Man', 'Prolific Winger'
  ];

  const celebrations = [
    'Calm', 'Excited', 'Respectful', 'Team Player', 'Individual',
    'Dance', 'Gesture', 'Point', 'Run', 'Slide'
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    modalRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Validaciones básicas
    if (!formData.name.trim()) newErrors.name = 'Nombre requerido';
    if (!formData.nationality.trim()) newErrors.nationality = 'Nacionalidad requerida';
    if (formData.age < 15 || formData.age > 50) newErrors.age = 'Edad debe estar entre 15-50';
    if (!formData.clubId) newErrors.clubId = 'Club requerido';
    if (formData.height < 150 || formData.height > 220) newErrors.height = 'Altura debe estar entre 150-220cm';
    if (formData.weight < 40 || formData.weight > 120) newErrors.weight = 'Peso debe estar entre 40-120kg';
    if (formData.overall < 40 || formData.overall > 99) newErrors.overall = 'Overall debe estar entre 40-99';
    if (formData.potential < 40 || formData.potential > 99) newErrors.potential = 'Potencial debe estar entre 40-99';
    if (formData.salary < 0) newErrors.salary = 'Salario debe ser positivo';
    if (formData.marketValue < 0) newErrors.marketValue = 'Valor de mercado debe ser positivo';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const image = formData.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=1e293b&color=fff&size=128`;
      
      // Calcular overall basado en estadísticas
      const isGoalkeeper = formData.position === 'GK';
      let calculatedOverall = 75;
      
      if (isGoalkeeper) {
        calculatedOverall = Math.round((
          formData.goalkeeperReach + 
          formData.goalkeeperReflexes + 
          formData.goalkeeperClearing + 
          formData.goalkeeperThrowing + 
          formData.goalkeeperHandling
        ) / 5);
      } else {
        calculatedOverall = Math.round((
          formData.offensive + formData.ballControl + formData.dribbling + 
          formData.lowPass + formData.loftedPass + formData.finishing + 
          formData.placeKicking + formData.volleys + formData.curl + 
          formData.speed + formData.acceleration + formData.kickingPower + 
          formData.stamina + formData.jumping + formData.physicalContact + 
          formData.balance + formData.defensive + formData.ballWinning + 
          formData.aggression
        ) / 19);
      }

      onSave({
        name: formData.name,
        age: formData.age,
        nationality: formData.nationality,
        clubId: formData.clubId,
        dorsal: formData.dorsal,
        position: formData.position,
        overall: formData.overall,
        potential: formData.potential,
        image,
        contract: { 
          expires: (new Date().getFullYear() + formData.contractYears).toString(), 
          salary: formData.salary 
        },
        attributes: {
          pace: formData.speed,
          shooting: formData.finishing,
          passing: formData.lowPass,
          dribbling: formData.dribbling,
          defending: formData.defensive,
          physical: formData.physicalContact
        },
        transferListed: false,
        matches: 0,
        transferValue: formData.marketValue,
        value: formData.marketValue,
        form: 1,
        goals: 0,
        assists: 0,
        appearances: 0,
        // Campos adicionales
        height: formData.height,
        weight: formData.weight,
        dominantFoot: formData.dominantFoot,
        secondaryPositions: formData.secondaryPositions,
        specialSkills: formData.specialSkills,
        playingStyle: formData.playingStyle,
        celebrations: formData.celebrations,
        consistency: formData.consistency,
        injuryResistance: formData.injuryResistance,
        morale: formData.morale,
        // Estadísticas detalladas
        detailedStats: {
          offensive: formData.offensive,
          ballControl: formData.ballControl,
          dribbling: formData.dribbling,
          lowPass: formData.lowPass,
          loftedPass: formData.loftedPass,
          finishing: formData.finishing,
          placeKicking: formData.placeKicking,
          volleys: formData.volleys,
          curl: formData.curl,
          speed: formData.speed,
          acceleration: formData.acceleration,
          kickingPower: formData.kickingPower,
          stamina: formData.stamina,
          jumping: formData.jumping,
          physicalContact: formData.physicalContact,
          balance: formData.balance,
          defensive: formData.defensive,
          ballWinning: formData.ballWinning,
          aggression: formData.aggression,
          // Estadísticas de portero
          goalkeeperReach: formData.goalkeeperReach,
          goalkeeperReflexes: formData.goalkeeperReflexes,
          goalkeeperClearing: formData.goalkeeperClearing,
          goalkeeperThrowing: formData.goalkeeperThrowing,
          goalkeeperHandling: formData.goalkeeperHandling,
        }
      });
      toast.success('¡Jugador creado exitosamente!');
    }
  };

  const autoFillData = () => {
    const samplePlayers = [
      {
        name: 'Lionel Messi',
        age: 36,
        nationality: 'Argentina',
        position: 'RWF',
        overall: 94,
        potential: 94,
        height: 170,
        weight: 72,
        dominantFoot: 'left' as const,
        salary: 500000,
        marketValue: 50000000,
        specialSkills: ['Dribbling', 'Finishing', 'Passing', 'Speed'],
        playingStyle: 'Creative Playmaker'
      },
      {
        name: 'Cristiano Ronaldo',
        age: 38,
        nationality: 'Portugal',
        position: 'CF',
        overall: 91,
        potential: 91,
        height: 187,
        weight: 85,
        dominantFoot: 'right' as const,
        salary: 450000,
        marketValue: 40000000,
        specialSkills: ['Finishing', 'Heading', 'Speed', 'Jumping'],
        playingStyle: 'Goal Poacher'
      },
      {
        name: 'Kevin De Bruyne',
        age: 32,
        nationality: 'Belgium',
        position: 'AMF',
        overall: 89,
        potential: 89,
        height: 181,
        weight: 76,
        dominantFoot: 'right' as const,
        salary: 350000,
        marketValue: 35000000,
        specialSkills: ['Passing', 'Vision', 'Long Range Shooting'],
        playingStyle: 'Orchestrator'
      }
    ];

    const randomPlayer = samplePlayers[Math.floor(Math.random() * samplePlayers.length)];
    setFormData(prev => ({
      ...prev,
      ...randomPlayer,
      clubId: clubs[0]?.id || '',
      dorsal: Math.floor(Math.random() * 99) + 1,
      offensive: randomPlayer.overall + Math.floor(Math.random() * 10) - 5,
      ballControl: randomPlayer.overall + Math.floor(Math.random() * 10) - 5,
      dribbling: randomPlayer.overall + Math.floor(Math.random() * 10) - 5,
      lowPass: randomPlayer.overall + Math.floor(Math.random() * 10) - 5,
      loftedPass: randomPlayer.overall + Math.floor(Math.random() * 10) - 5,
      finishing: randomPlayer.overall + Math.floor(Math.random() * 10) - 5,
      placeKicking: randomPlayer.overall + Math.floor(Math.random() * 10) - 5,
      volleys: randomPlayer.overall + Math.floor(Math.random() * 10) - 5,
      curl: randomPlayer.overall + Math.floor(Math.random() * 10) - 5,
      speed: randomPlayer.overall + Math.floor(Math.random() * 10) - 5,
      acceleration: randomPlayer.overall + Math.floor(Math.random() * 10) - 5,
      kickingPower: randomPlayer.overall + Math.floor(Math.random() * 10) - 5,
      stamina: randomPlayer.overall + Math.floor(Math.random() * 10) - 5,
      jumping: randomPlayer.overall + Math.floor(Math.random() * 10) - 5,
      physicalContact: randomPlayer.overall + Math.floor(Math.random() * 10) - 5,
      balance: randomPlayer.overall + Math.floor(Math.random() * 10) - 5,
      defensive: randomPlayer.overall + Math.floor(Math.random() * 10) - 5,
      ballWinning: randomPlayer.overall + Math.floor(Math.random() * 10) - 5,
      aggression: randomPlayer.overall + Math.floor(Math.random() * 10) - 5,
    }));
    toast.success('Datos de ejemplo cargados');
  };

  const isGoalkeeper = formData.position === 'GK';

  return (
    <Modal open={true} onClose={onClose} className="max-w-[98vw] w-[98vw] max-h-[98vh]" initialFocusRef={modalRef}>
      <div ref={modalRef} className="max-h-[98vh] overflow-y-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
              Crear Nuevo Jugador
            </h3>
            <p className="text-gray-400 text-sm">PES 2021 - Formulario Completo</p>
          </div>
          <Button 
            onClick={autoFillData}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-lg"
          >
            🎲 Autocompletar Datos
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-6 bg-gray-800/50 rounded-xl p-2 border border-gray-700/50">
          {[
            { id: 'basic', label: 'Datos Básicos', icon: User, color: 'from-blue-500 to-blue-600' },
            { id: 'skills', label: 'Habilidades', icon: Target, color: 'from-green-500 to-green-600' },
            { id: 'physical', label: 'Físico', icon: Activity, color: 'from-orange-500 to-orange-600' },
            { id: 'special', label: 'Especiales', icon: Star, color: 'from-purple-500 to-purple-600' },
            { id: 'contract', label: 'Contrato', icon: DollarSign, color: 'from-yellow-500 to-yellow-600' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Datos Básicos */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
          {/* Foto del Jugador */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700/50 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Camera size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Foto del Jugador</h4>
                    <p className="text-gray-400 text-sm">Sube una imagen o usa las iniciales</p>
                  </div>
                </div>
            <LogoUploadField
              value={formData.image}
              onChange={(value) => setFormData({ ...formData, image: value })}
              label="Foto del Jugador"
              placeholder="URL de la foto o subir archivo"
              showPreview={true}
              maxSize={3}
            />
                <p className="text-gray-400 text-sm mt-2">
                  💡 Si no subes una foto, se generará automáticamente con las iniciales del jugador
                </p>
          </div>

          {/* Información Personal */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700/50 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <User size={20} className="text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Información Personal</h4>
                    <p className="text-gray-400 text-sm">Datos básicos del jugador</p>
                  </div>
                </div>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
                   <div className="space-y-2">
                     <label className="block text-sm font-semibold text-gray-200">
                       Nombre Completo *
                </label>
                <input
                      className={`w-full px-3 py-2 bg-gray-800 border-2 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                        errors.name ? 'border-red-500' : 'border-gray-600 hover:border-gray-500'
                      }`}
                  placeholder="Ejemplo: Lionel Messi"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                    {errors.name && <p className="text-red-400 text-sm font-medium">{errors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Edad *
                </label>
                  <input
                    type="number"
                    min="15"
                    max="50"
                      className={`input w-full ${errors.age ? 'border-red-500' : ''}`}
                    placeholder="Ejemplo: 25"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                  />
                {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Nacionalidad *
                </label>
                <input
                  className={`input w-full ${errors.nationality ? 'border-red-500' : ''}`}
                  placeholder="Ejemplo: Argentina"
                  value={formData.nationality}
                  onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                />
                {errors.nationality && <p className="text-red-500 text-sm">{errors.nationality}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                      Club *
                    </label>
                    <select
                      className={`input w-full ${errors.clubId ? 'border-red-500' : ''}`}
                      value={formData.clubId}
                      onChange={(e) => setFormData({...formData, clubId: e.target.value})}
                    >
                      <option value="">Seleccionar club</option>
                      {clubs.map((club) => (
                        <option key={club.id} value={club.id}>{club.name}</option>
                      ))}
                    </select>
                    {errors.clubId && <p className="text-red-500 text-sm">{errors.clubId}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Número de Camiseta
                </label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  className="input w-full"
                  placeholder="Ejemplo: 10"
                  value={formData.dorsal}
                  onChange={e => setFormData({ ...formData, dorsal: Number(e.target.value) })}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                      Pie Dominante
                    </label>
                    <select
                      className="input w-full"
                      value={formData.dominantFoot}
                      onChange={(e) => setFormData({...formData, dominantFoot: e.target.value as 'left' | 'right'})}
                    >
                      <option value="right">Derecho</option>
                      <option value="left">Izquierdo</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Altura (cm)
                    </label>
                    <input
                      type="number"
                      min="150"
                      max="220"
                      className={`input w-full ${errors.height ? 'border-red-500' : ''}`}
                      placeholder="Ejemplo: 170"
                      value={formData.height}
                      onChange={e => setFormData({ ...formData, height: Number(e.target.value) })}
                    />
                    {errors.height && <p className="text-red-500 text-sm">{errors.height}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Peso (kg)
                    </label>
                    <input
                      type="number"
                      min="40"
                      max="120"
                      className={`input w-full ${errors.weight ? 'border-red-500' : ''}`}
                      placeholder="Ejemplo: 70"
                      value={formData.weight}
                      onChange={e => setFormData({ ...formData, weight: Number(e.target.value) })}
                    />
                    {errors.weight && <p className="text-red-500 text-sm">{errors.weight}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Posición Principal
                </label>
                <select
                  className="input w-full"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                >
                      {positions.map(pos => (
                        <option key={pos.value} value={pos.value}>{pos.label}</option>
                      ))}
                </select>
                  </div>
                </div>
              </div>
              
              {/* Posiciones Secundarias */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700/50 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Target size={20} className="text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Posiciones Secundarias</h4>
                    <p className="text-gray-400 text-sm">Posiciones adicionales que puede jugar</p>
                  </div>
                </div>
                                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-3">
                  {secondaryPositions.filter(pos => pos.value !== formData.position).map(pos => (
                    <label key={pos.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.secondaryPositions.includes(pos.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              secondaryPositions: [...formData.secondaryPositions, pos.value]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              secondaryPositions: formData.secondaryPositions.filter(p => p !== pos.value)
                            });
                          }
                        }}
                        className="rounded border-gray-600 bg-gray-700 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-300">{pos.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Estadísticas de Habilidad */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700/50 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Target size={20} className="text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Estadísticas de Habilidad</h4>
                    <p className="text-gray-400 text-sm">
                      {!isGoalkeeper ? 'Habilidades de campo (40-99)' : 'Habilidades de portero (40-99)'}
                    </p>
                  </div>
                </div>
                
                                 {!isGoalkeeper ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
                    {[
                      { key: 'offensive', label: 'Ofensiva', icon: '⚽' },
                      { key: 'ballControl', label: 'Control de Balón', icon: '🎯' },
                      { key: 'dribbling', label: 'Drible', icon: '🏃' },
                      { key: 'lowPass', label: 'Precisión Pase Bajo', icon: '📤' },
                      { key: 'loftedPass', label: 'Precisión Pase Alto', icon: '📡' },
                      { key: 'finishing', label: 'Potencia de Tiro', icon: '🎯' },
                      { key: 'placeKicking', label: 'Precisión de Tiro', icon: '⚽' },
                      { key: 'volleys', label: 'Cabeceo', icon: '👤' },
                      { key: 'curl', label: 'Efecto', icon: '🌀' },
                      { key: 'speed', label: 'Velocidad', icon: '💨' },
                      { key: 'acceleration', label: 'Aceleración', icon: '🚀' },
                      { key: 'kickingPower', label: 'Fuerza Física', icon: '💪' },
                      { key: 'stamina', label: 'Resistencia', icon: '🏃‍♂️' },
                      { key: 'jumping', label: 'Salto', icon: '🦘' },
                      { key: 'physicalContact', label: 'Defensa', icon: '🛡️' },
                      { key: 'balance', label: 'Recuperación', icon: '⚖️' },
                      { key: 'defensive', label: 'Agresividad', icon: '🔥' },
                      { key: 'ballWinning', label: 'Interceptación', icon: '🎯' },
                      { key: 'aggression', label: 'Agresividad', icon: '⚔️' },
                    ].map((stat) => (
                      <div key={stat.key} className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-200">
                          {stat.icon} {stat.label}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="40"
                            max="99"
                            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            style={{
                              background: `linear-gradient(to right, #10b981 0%, #10b981 ${((formData[stat.key as keyof PlayerFormData] as number) - 40) * 100 / 59}%, #374151 ${((formData[stat.key as keyof PlayerFormData] as number) - 40) * 100 / 59}%, #374151 100%)`
                            }}
                            value={formData[stat.key as keyof PlayerFormData] as number}
                            onChange={(e) => setFormData({
                              ...formData,
                              [stat.key]: Number(e.target.value)
                            } as any)}
                          />
                          <span className="text-sm font-bold text-white min-w-[2.5rem] text-center bg-gray-800 px-2 py-1 rounded-lg">
                            {formData[stat.key as keyof PlayerFormData] as number}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                                 ) : (
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
                    {[
                      { key: 'goalkeeperReach', label: 'Habilidad', icon: '🤲' },
                      { key: 'goalkeeperReflexes', label: 'Reflejos', icon: '⚡' },
                      { key: 'goalkeeperClearing', label: 'Despeje', icon: '👊' },
                      { key: 'goalkeeperThrowing', label: 'Atrapada', icon: '🤲' },
                      { key: 'goalkeeperHandling', label: 'Juego de Pies', icon: '👟' },
                    ].map((stat) => (
                      <div key={stat.key} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          {stat.icon} {stat.label}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="40"
                            max="99"
                            className="flex-1"
                            value={formData[stat.key as keyof PlayerFormData] as number}
                            onChange={(e) => setFormData({
                              ...formData,
                              [stat.key]: Number(e.target.value)
                            } as any)}
                          />
                          <span className="text-sm font-medium text-white min-w-[2rem] text-center">
                            {formData[stat.key as keyof PlayerFormData] as number}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Características Físicas */}
          {activeTab === 'physical' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700/50 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Activity size={20} className="text-orange-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Características Físicas y Salud</h4>
                    <p className="text-gray-400 text-sm">Condición física y resistencia (40-99)</p>
                  </div>
                </div>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
                   {[
                    { key: 'consistency', label: 'Consistencia Física', icon: '🏃‍♂️' },
                    { key: 'injuryResistance', label: 'Resistencia a Lesiones', icon: '🛡️' },
                    { key: 'morale', label: 'Moral Inicial', icon: '😊' },
                  ].map((stat) => (
                    <div key={stat.key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                        {stat.icon} {stat.label}
                </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="40"
                          max="99"
                          className="flex-1"
                          value={formData[stat.key as keyof PlayerFormData] as number}
                          onChange={(e) => setFormData({
                            ...formData,
                            [stat.key]: Number(e.target.value)
                          } as any)}
                        />
                        <span className="text-sm font-medium text-white min-w-[2rem] text-center">
                          {formData[stat.key as keyof PlayerFormData] as number}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Rasgos Especiales */}
          {activeTab === 'special' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700/50 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Star size={20} className="text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Rasgos y Habilidades Especiales</h4>
                    <p className="text-gray-400 text-sm">Estilo de juego y habilidades únicas</p>
            </div>
          </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Estilo de Juego
                    </label>
                    <select
                      className="input w-full"
                      value={formData.playingStyle}
                      onChange={(e) => setFormData({...formData, playingStyle: e.target.value})}
                    >
                      {playingStyles.map(style => (
                        <option key={style} value={style}>{style}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Habilidades Especiales
                    </label>
                                         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-3 max-h-48 overflow-y-auto">
                      {specialSkills.map(skill => (
                        <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.specialSkills.includes(skill)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  specialSkills: [...formData.specialSkills, skill]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  specialSkills: formData.specialSkills.filter(s => s !== skill)
                                });
                              }
                            }}
                            className="rounded border-gray-600 bg-gray-700 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-gray-300">{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Celebraciones
                    </label>
                                         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-3">
                      {celebrations.map(celebration => (
                        <label key={celebration} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.celebrations.includes(celebration)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  celebrations: [...formData.celebrations, celebration]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  celebrations: formData.celebrations.filter(c => c !== celebration)
                                });
                              }
                            }}
                            className="rounded border-gray-600 bg-gray-700 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-gray-300">{celebration}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Información de Contrato */}
          {activeTab === 'contract' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700/50 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <DollarSign size={20} className="text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Información de Contrato y Valor</h4>
                    <p className="text-gray-400 text-sm">Datos económicos y contractuales</p>
                  </div>
                </div>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Overall (40-99) *
                </label>
                <input
                  type="number"
                  min="40"
                  max="99"
                  className={`input w-full ${errors.overall ? 'border-red-500' : ''}`}
                  placeholder="Ejemplo: 85"
                  value={formData.overall}
                  onChange={(e) => setFormData({...formData, overall: Number(e.target.value)})}
                />
                {errors.overall && <p className="text-red-500 text-sm">{errors.overall}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                      Potencial (40-99)
                </label>
                <input
                  type="number"
                  min="40"
                  max="99"
                      className={`input w-full ${errors.potential ? 'border-red-500' : ''}`}
                  placeholder="Ejemplo: 90"
                  value={formData.potential}
                  onChange={e => setFormData({ ...formData, potential: Number(e.target.value) })}
                />
                    {errors.potential && <p className="text-red-500 text-sm">{errors.potential}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                      Años de Contrato
                </label>
                  <input
                    type="number"
                      min="1"
                      max="10"
                      className="input w-full"
                      placeholder="Ejemplo: 3"
                      value={formData.contractYears}
                      onChange={e => setFormData({ ...formData, contractYears: Number(e.target.value) })}
                    />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                      Salario Mensual ($)
                </label>
                <input
                  type="number"
                      min="0"
                      className={`input w-full ${errors.salary ? 'border-red-500' : ''}`}
                      placeholder="Ejemplo: 50000"
                      value={formData.salary}
                      onChange={e => setFormData({ ...formData, salary: Number(e.target.value) })}
                    />
                    {errors.salary && <p className="text-red-500 text-sm">{errors.salary}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                      Valor de Mercado ($)
                </label>
                  <input
                    type="number"
                    min="0"
                      className={`input w-full ${errors.marketValue ? 'border-red-500' : ''}`}
                      placeholder="Ejemplo: 1000000"
                      value={formData.marketValue}
                      onChange={e => setFormData({ ...formData, marketValue: Number(e.target.value) })}
                    />
                    {errors.marketValue && <p className="text-red-500 text-sm">{errors.marketValue}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex space-x-4 justify-end pt-6 border-t border-gray-700/50">
            <Button 
              variant="outline" 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 text-gray-300 border-gray-600 hover:bg-gray-800 hover:text-white font-medium rounded-xl transition-all duration-200"
            >
              ❌ Cancelar
            </Button>
            <Button 
              type="submit" 
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              ✨ Crear Jugador
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default NewPlayerModal;

// Estilos CSS para los sliders personalizados
const sliderStyles = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #10b981;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
  
  .slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #10b981;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
  
  .slider::-webkit-slider-track {
    background: transparent;
  }
  
  .slider::-moz-range-track {
    background: transparent;
  }
`;

// Inyectar estilos en el head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = sliderStyles;
  document.head.appendChild(style);
}
 