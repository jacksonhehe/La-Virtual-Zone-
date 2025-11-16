import { useState } from 'react';
import { X, Camera, Upload, User, BarChart, Zap, Target, TrendingUp, RotateCcw, Hand, Triangle, Circle, Square, Tornado, Wind, Rocket, ArrowUp, Dumbbell, Scale, Activity, Shield, AlertTriangle, Users2, MapPin, Hash, Award, DollarSign, Heart, Ruler } from 'lucide-react';
import { PlayerAttributes, PlayerSkills, PlayingStyles } from '../../types';
import { convertImageToBase64, validateImageFile, isValidImageSource } from '../../utils/helpers';

interface NewPlayerModalProps {
  clubs: { id: string; name: string }[];
  onClose: () => void;
  onCreate: (data: {
    name: string;
    age: number;
    position: string;
    overall: number;
    clubId?: string;
    transferValue?: number;
    nationality: string;
    dorsal: number;
    image?: string;
    attributes: PlayerAttributes;
    skills: PlayerSkills;
    playingStyles: PlayingStyles;
    injuryResistance: number;
    height?: number;
    weight?: number;
  }) => void;
}

const positions = ['PT','DEC','LI','LD','MCD','MC','MO','MDI','MDD','EXI','EXD','CD','SD'];

const NewPlayerModal = ({ clubs, onClose, onCreate }: NewPlayerModalProps) => {
  // Basic info
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [position, setPosition] = useState('CD');
  const [overall, setOverall] = useState<number | ''>('');
  const [clubId, setClubId] = useState<string>('');
  const [value, setValue] = useState<number | ''>('');
  const [nationality, setNationality] = useState('Argentina');
  const [dorsal, setDorsal] = useState<number | ''>('');
  const [image, setImage] = useState('');
  const [injuryResistance, setInjuryResistance] = useState<number | ''>(2);
  const [height, setHeight] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');

  // Handle image file selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setImageError(validationError);
      return;
    }

    setImageError(null);
    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (!selectedImage) return;

    setIsUploading(true);
    try {
      const base64Image = await convertImageToBase64(selectedImage);
      setImage(base64Image);
      setSelectedImage(null);
      setImagePreview(null);
      setImageError(null);
    } catch (error) {
      setImageError('Error al procesar la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  // Clear selected image
  const clearImageSelection = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageError(null);
  };

  // Atributos PES 2021
  const [attributes, setAttributes] = useState<PlayerAttributes>({
    offensiveAwareness: 70, ballControl: 70, dribbling: 70, tightPossession: 70,
    lowPass: 70, loftedPass: 70, finishing: 70, heading: 70, setPieceTaking: 70,
    curl: 70, speed: 70, acceleration: 70, kickingPower: 70, jumping: 70,
    physicalContact: 70, balance: 70, stamina: 70, defensiveAwareness: 70,
    ballWinning: 70, aggression: 70, goalkeeping: 70, catching: 70, reflexes: 70,
    coverage: 70, gkHandling: 70, weakFootUsage: 2, weakFootAccuracy: 2, form: 3,
    pace: 70, shooting: 70, passing: 70, defending: 70, physical: 70
  });

  // Habilidades
  const [skills, setSkills] = useState<PlayerSkills>({
    scissorKick: false, doubleTouch: false, flipFlap: false, marseilleTurn: false,
    rainbow: false, chopTurn: false, cutBehindAndTurn: false, scotchMove: false,
    stepOnSkillControl: false, heading: false, longRangeDrive: false, chipShotControl: false,
    longRanger: false, knuckleShot: false, dippingShot: false, risingShot: false,
    acrobaticFinishing: false, heelTrick: false, firstTimeShot: false, oneTouchPass: false,
    throughPassing: false, weightedPass: false, pinpointCrossing: false, outsideCurler: false,
    rabona: false, noLookPass: false, lowLoftedPass: false, giantKill: false,
    longThrow: false, longThrow2: false, gkLongThrow: false, penaltySpecialist: false,
    gkPenaltySaver: false, fightingSpirit: false, manMarking: false, trackBack: false,
    interception: false, acrobaticClear: false, captaincy: false, superSub: false,
    comPlayingStyles: false
  });

  // Estilos de juego
  const [playingStyles, setPlayingStyles] = useState<PlayingStyles>({
    goalPoacher: false, dummyRunner: false, foxInTheBox: false, targetMan: false,
    classicNo10: false, prolificWinger: false, roamingFlank: false, crossSpecialist: false,
    holePlayer: false, boxToBox: false, theDestroyer: false, orchestrator: false,
    anchor: false, offensiveFullback: false, fullbackFinisher: false, defensiveFullback: false,
    buildUp: false, extraFrontman: false, offensiveGoalkeeper: false, defensiveGoalkeeper: false
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'attributes' | 'skills' | 'styles'>('basic');
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const n = name.trim();
    if (!n) { setError('Ingresa el nombre'); return; }
    const a = typeof age === 'string' ? parseInt(age || '0', 10) : age;
    const ovr = typeof overall === 'string' ? parseInt(overall || '0', 10) : overall;
    const val = typeof value === 'string' ? parseInt(value || '0', 10) : value;
    const d = typeof dorsal === 'string' ? parseInt(dorsal || '1', 10) : dorsal;
    const injury = typeof injuryResistance === 'string' ? parseInt(injuryResistance || '2', 10) : injuryResistance;
    const h = typeof height === 'string' ? parseInt(height || '0', 10) : height;
    const w = typeof weight === 'string' ? parseInt(weight || '0', 10) : weight;

    if (!a || a < 12 || a > 60) { setError('Edad inválida (12-60)'); return; }
    if (!ovr || ovr < 1 || ovr > 99) { setError('Media inválida (1-99)'); return; }
    if (!d || d < 1 || d > 99) { setError('Dorsal inválido (1-99)'); return; }
    if (val !== undefined && val !== '' && (isNaN(val as number) || (val as number) < 0)) { setError('Valor inválido'); return; }
    if (injury < 1 || injury > 3) { setError('Resistencia a lesiones inválida (1-3)'); return; }
    if (h !== '' && h !== 0 && (isNaN(h as number) || (h as number) < 50 || (h as number) > 250)) { setError('Altura inválida (50-250 cm)'); return; }
    if (w !== '' && w !== 0 && (isNaN(w as number) || (w as number) < 30 || (w as number) > 200)) { setError('Peso inválido (30-200 kg)'); return; }
    if (image && !isValidImageSource(image)) {
      setError('La foto debe ser una URL válida (http/https) o una imagen subida');
      return;
    }

    onCreate({
      name: n,
      age: a as number,
      position,
      overall: ovr as number,
      clubId: clubId || undefined,
      transferValue: val as number,
      nationality,
      dorsal: d as number,
      image: image || undefined,
      attributes,
      skills,
      playingStyles,
      injuryResistance: injury as number,
      height: h !== '' && h !== 0 ? h as number : undefined,
      weight: w !== '' && w !== 0 ? w as number : undefined
    });
  };

  const updateAttribute = (key: keyof PlayerAttributes, value: number) => {
    setAttributes(prev => ({ ...prev, [key]: value }));
  };

  const updateSkill = (key: keyof PlayerSkills, value: boolean) => {
    setSkills(prev => ({ ...prev, [key]: value }));
  };

  const updatePlayingStyle = (key: keyof PlayingStyles, value: boolean) => {
    setPlayingStyles(prev => ({ ...prev, [key]: value }));
  };

  // Función para determinar el color del slider según el valor
  const getSliderColor = (value: number) => {
    if (value >= 40 && value <= 74) return 'red';
    if (value >= 75 && value <= 84) return 'yellow';
    if (value >= 85 && value <= 94) return 'green';
    if (value >= 95 && value <= 99) return 'cyan';
    return 'red'; // default
  };

  // Función para obtener la clase de color de texto según el valor
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

  // Traducciones de habilidades y estilos de juego al español
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
    comPlayingStyles: 'Espíritu de lucha',
    // Estilos de juego
    goalPoacher: 'Cazagoles',
    dummyRunner: 'Señuelo',
    foxInTheBox: 'Hombre de área',
    targetMan: 'Referente',
    classicNo10: 'Creador de jugadas',
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="absolute inset-0 bg-black/80" onClick={onClose}></div>
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[92vh] overflow-hidden border border-gray-700/50">
        {/* Header con gradiente */}
        <div className="relative bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <User size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Nuevo Jugador</h3>
                <p className="text-sm text-gray-400">Completa la información del jugador</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs mejoradas */}
        <div className="flex bg-gray-900/50 border-b border-gray-700/50">
          {[
            { id: 'basic', label: 'Información Básica', icon: User, count: null },
            { id: 'attributes', label: 'Atributos', icon: BarChart, count: 29 },
            { id: 'skills', label: 'Habilidades', icon: Zap, count: 39 },
            { id: 'styles', label: 'Estilos de Juego', icon: Target, count: 21 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all relative group ${
                activeTab === tab.id
                  ? 'text-primary bg-primary/10'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <tab.icon size={18} className={activeTab === tab.id ? 'text-primary' : 'text-gray-500 group-hover:text-gray-300'} />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.count && (
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    activeTab === tab.id ? 'bg-primary/20 text-primary' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </div>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              )}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(92vh-220px)] bg-gradient-to-b from-gray-900/50 to-transparent">
          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-500/20 to-red-600/10 border-l-4 border-red-500 rounded-lg shadow-lg animate-shake">
              <div className="flex items-start">
                <AlertTriangle size={20} className="text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-red-400 font-semibold mb-1">Error de validación</h5>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {activeTab === 'basic' && (
              <div className="space-y-6">
                {/* Card de Foto del Jugador */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center space-x-2 mb-4">
                    <Camera size={20} className="text-primary" />
                    <h4 className="text-lg font-semibold text-white">Foto del Jugador</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Vista previa de la imagen */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-40 h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-600 shadow-lg">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Player preview"
                            className="w-full h-full object-cover"
                          />
                        ) : image ? (
                          <img
                            src={image}
                            alt="Player image"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-primary/10">
                            <Camera size={32} className="text-primary mb-2" />
                            <span className="text-xs text-gray-400">Sin imagen</span>
                          </div>
                        )}
                        {imagePreview && (
                          <button 
                            type="button"
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 rounded-full p-1.5 shadow-lg transition-colors" 
                            onClick={clearImageSelection}
                          >
                            <X size={14} className="text-white" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Controles de carga */}
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          id="player-image-upload"
                        />
                        <label
                          htmlFor="player-image-upload"
                          className="btn-outline w-full flex items-center justify-center cursor-pointer hover:bg-primary/10 hover:border-primary/50"
                        >
                          <Camera size={16} className="mr-2" />
                          {selectedImage ? 'Cambiar imagen' : 'Seleccionar imagen'}
                        </label>
                      </div>

                      {imageError && (
                        <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start">
                          <AlertTriangle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                          <span>{imageError}</span>
                        </div>
                      )}

                      {selectedImage && (
                        <div className="bg-gray-700/30 rounded-lg p-3 space-y-2">
                          <div className="text-sm text-gray-300 flex items-center">
                            <span className="font-medium mr-2">Archivo:</span>
                            <span className="text-primary truncate">{selectedImage.name}</span>
                          </div>
                          <div className="text-sm text-gray-300">
                            <span className="font-medium mr-2">Tamaño:</span>
                            {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                          <button
                            type="button"
                            onClick={handleImageUpload}
                            disabled={isUploading}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUploading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Subiendo...
                              </>
                            ) : (
                              <>
                                <Upload size={16} className="mr-2" />
                                Subir Imagen
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      <div className="pt-3 border-t border-gray-600/50">
                        <label className="block text-sm text-gray-400 mb-2">
                          O ingresa URL de imagen
                        </label>
                        <input
                          className="input w-full text-sm"
                          value={image}
                          onChange={e => setImage(e.target.value)}
                          placeholder="https://ejemplo.com/jugador.jpg"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card de Información Personal */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center space-x-2 mb-4">
                    <User size={20} className="text-primary" />
                    <h4 className="text-lg font-semibold text-white">Información Personal</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                        <User size={16} className="mr-2 text-gray-400" />
                        Nombre Completo
                      </label>
                      <input
                        className="input w-full"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Ej: Lionel Messi"
                      />
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                        <MapPin size={16} className="mr-2 text-gray-400" />
                        Nacionalidad
                      </label>
                      <input
                        className="input w-full"
                        value={nationality}
                        onChange={e => setNationality(e.target.value)}
                        placeholder="Ej: Argentina"
                      />
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                        <Hash size={16} className="mr-2 text-gray-400" />
                        Edad
                      </label>
                      <input
                        type="number"
                        className="input w-full"
                        value={age}
                        onChange={e => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                        min={12}
                        max={60}
                        placeholder="18"
                      />
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                        <Hash size={16} className="mr-2 text-gray-400" />
                        Dorsal
                      </label>
                      <input
                        type="number"
                        className="input w-full"
                        value={dorsal}
                        onChange={e => setDorsal(e.target.value === '' ? '' : Number(e.target.value))}
                        min={1}
                        max={99}
                        placeholder="10"
                      />
                    </div>
                  </div>
                </div>

                {/* Card de Características Físicas */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center space-x-2 mb-4">
                    <Activity size={20} className="text-primary" />
                    <h4 className="text-lg font-semibold text-white">Características Físicas</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                        <Ruler size={16} className="mr-2 text-gray-400" />
                        Altura (cm)
                      </label>
                      <input
                        type="number"
                        className="input w-full"
                        value={height}
                        onChange={e => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                        min={50}
                        max={250}
                        placeholder="180"
                      />
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                        <Dumbbell size={16} className="mr-2 text-gray-400" />
                        Peso (kg)
                      </label>
                      <input
                        type="number"
                        className="input w-full"
                        value={weight}
                        onChange={e => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                        min={30}
                        max={200}
                        placeholder="75"
                      />
                    </div>
                  </div>
                </div>

                {/* Card de Datos Deportivos */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center space-x-2 mb-4">
                    <Award size={20} className="text-primary" />
                    <h4 className="text-lg font-semibold text-white">Datos Deportivos</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                        <Target size={16} className="mr-2 text-gray-400" />
                        Posición
                      </label>
                      <select
                        className="input w-full"
                        value={position}
                        onChange={e => setPosition(e.target.value)}
                      >
                        {positions.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                        <BarChart size={16} className="mr-2 text-gray-400" />
                        Media General
                      </label>
                      <input
                        type="number"
                        className="input w-full"
                        value={overall}
                        onChange={e => setOverall(e.target.value === '' ? '' : Number(e.target.value))}
                        min={1}
                        max={99}
                        placeholder="85"
                      />
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                        <Users2 size={16} className="mr-2 text-gray-400" />
                        Club
                      </label>
                      <select
                        className="input w-full"
                        value={clubId}
                        onChange={e => setClubId(e.target.value)}
                      >
                        <option value="">Sin club</option>
                        <option value="libre">Libre</option>
                        {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                        <DollarSign size={16} className="mr-2 text-gray-400" />
                        Valor de Mercado (€)
                      </label>
                      <input
                        type="number"
                        className="input w-full"
                        value={value}
                        onChange={e => setValue(e.target.value === '' ? '' : Number(e.target.value))}
                        min={0}
                        placeholder="5000000"
                      />
                    </div>
                  </div>
                </div>

                {/* Card de Resistencia */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center space-x-2 mb-4">
                    <Heart size={20} className="text-primary" />
                    <h4 className="text-lg font-semibold text-white">Resistencia Física</h4>
                  </div>
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                      <Shield size={16} className="mr-2 text-gray-400" />
                      Resistencia a Lesiones
                    </label>
                    <select
                      className="input w-full"
                      value={injuryResistance}
                      onChange={e => setInjuryResistance(e.target.value === '' ? 2 : Number(e.target.value))}
                    >
                      <option value={1}>🔴 Baja (1) - Propenso a lesiones frecuentes</option>
                      <option value={2}>🟡 Media (2) - Resistencia normal</option>
                      <option value={3}>🟢 Alta (3) - Muy resistente a lesiones</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'attributes' && (
              <div className="space-y-6">
                {/* Atributos de Campo */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-primary">Atributos de Campo (26)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { key: 'offensiveAwareness', label: 'Actitud ofensiva', icon: TrendingUp },
                      { key: 'ballControl', label: 'Control de balón', icon: Target },
                      { key: 'dribbling', label: 'Drible', icon: RotateCcw },
                      { key: 'tightPossession', label: 'Posesión del balón', icon: Hand },
                      { key: 'lowPass', label: 'Pase al ras', icon: Triangle },
                      { key: 'loftedPass', label: 'Pase bombeado', icon: Circle },
                      { key: 'finishing', label: 'Finalización', icon: Target },
                      { key: 'heading', label: 'Cabeceador', icon: Square },
                      { key: 'setPieceTaking', label: 'Balón parado', icon: Circle },
                      { key: 'curl', label: 'Efecto', icon: Tornado },
                      { key: 'speed', label: 'Velocidad', icon: Wind },
                      { key: 'acceleration', label: 'Aceleración', icon: Rocket },
                      { key: 'kickingPower', label: 'Potencia de tiro', icon: Zap },
                      { key: 'jumping', label: 'Salto', icon: ArrowUp },
                      { key: 'physicalContact', label: 'Contacto físico', icon: Dumbbell },
                      { key: 'balance', label: 'Equilibrio', icon: Scale },
                      { key: 'stamina', label: 'Resistencia', icon: Activity },
                      { key: 'defensiveAwareness', label: 'Actitud defensiva', icon: Shield },
                      { key: 'ballWinning', label: 'Recuperación de balón', icon: RotateCcw },
                      { key: 'aggression', label: 'Agresividad', icon: AlertTriangle }
                    ].map(attr => (
                      <div key={attr.key} className="bg-gray-700/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{attr.label}</span>
                          <span className="text-xs text-gray-400"><attr.icon size={14} /></span>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="99"
                          value={attributes[attr.key as keyof PlayerAttributes] as number}
                          onChange={e => updateAttribute(attr.key as keyof PlayerAttributes, Number(e.target.value))}
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
                          style={{
                            background: getSliderColor(attributes[attr.key as keyof PlayerAttributes] as number) === 'red' ? '#ef4444' :
                                       getSliderColor(attributes[attr.key as keyof PlayerAttributes] as number) === 'yellow' ? '#eab308' :
                                       getSliderColor(attributes[attr.key as keyof PlayerAttributes] as number) === 'green' ? '#22c55e' :
                                       getSliderColor(attributes[attr.key as keyof PlayerAttributes] as number) === 'cyan' ? '#06b6d4' : '#374151',
                            '--thumb-color': getSliderColor(attributes[attr.key as keyof PlayerAttributes] as number) === 'red' ? '#ef4444' :
                                           getSliderColor(attributes[attr.key as keyof PlayerAttributes] as number) === 'yellow' ? '#eab308' :
                                           getSliderColor(attributes[attr.key as keyof PlayerAttributes] as number) === 'green' ? '#22c55e' :
                                           getSliderColor(attributes[attr.key as keyof PlayerAttributes] as number) === 'cyan' ? '#06b6d4' : '#ef4444'
                          } as React.CSSProperties & { '--thumb-color': string }}
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>40</span>
                          <span className={`font-bold ${getSliderTextColor(attributes[attr.key as keyof PlayerAttributes] as number)}`}>
                            {attributes[attr.key as keyof PlayerAttributes]}
                          </span>
                          <span>99</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Atributos de Portero */}
                {position === 'PT' && (
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-secondary">Atributos de Portero (5)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'goalkeeping', label: 'Atajar' },
                        { key: 'catching', label: 'Despejar' },
                        { key: 'reflexes', label: 'Reflejos' },
                        { key: 'coverage', label: 'Cobertura' },
                        { key: 'gkHandling', label: 'Actitud de portero' }
                      ].map(attr => (
                        <div key={attr.key} className="bg-gray-700/50 rounded-lg p-3">
                          <label className="block text-sm text-gray-400 mb-2">{attr.label}</label>
                          <input
                            type="range"
                            min="40"
                            max="99"
                            value={attributes[attr.key as keyof PlayerAttributes] as number}
                            onChange={e => updateAttribute(attr.key as keyof PlayerAttributes, Number(e.target.value))}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
                            style={{
                              background: getSliderColor(attributes[attr.key as keyof PlayerAttributes] as number) === 'red' ? '#ef4444' :
                                         getSliderColor(attributes[attr.key as keyof PlayerAttributes] as number) === 'yellow' ? '#eab308' :
                                         getSliderColor(attributes[attr.key as keyof PlayerAttributes] as number) === 'green' ? '#22c55e' :
                                         getSliderColor(attributes[attr.key as keyof PlayerAttributes] as number) === 'cyan' ? '#06b6d4' : '#374151',
                              '--thumb-color': getSliderColor(attributes[attr.key as keyof PlayerAttributes] as number) === 'red' ? '#ef4444' :
                                             getSliderColor(attributes[attr.key as keyof PlayerAttributes] as number) === 'yellow' ? '#eab308' :
                                             getSliderColor(attributes[attr.key as keyof PlayerAttributes] as number) === 'green' ? '#22c55e' :
                                             getSliderColor(attributes[attr.key as keyof PlayerAttributes] as number) === 'cyan' ? '#06b6d4' : '#ef4444'
                            } as React.CSSProperties & { '--thumb-color': string }}
                          />
                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>40</span>
                            <span className={`font-bold ${getSliderTextColor(attributes[attr.key as keyof PlayerAttributes] as number)}`}>
                              {attributes[attr.key as keyof PlayerAttributes]}
                            </span>
                            <span>99</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subatributos especiales */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-yellow-500">Subatributos Especiales (3)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <label className="block text-sm text-gray-400 mb-2">Uso de Pie Malo</label>
                      <select
                        className="input w-full"
                        value={attributes.weakFootUsage}
                        onChange={e => updateAttribute('weakFootUsage', Number(e.target.value))}
                      >
                        <option value={1}>Malo (1)</option>
                        <option value={2}>Regular (2)</option>
                        <option value={3}>Bueno (3)</option>
                        <option value={4}>Excelente (4)</option>
                      </select>
                    </div>

                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <label className="block text-sm text-gray-400 mb-2">Precisión de Pie Malo</label>
                      <select
                        className="input w-full"
                        value={attributes.weakFootAccuracy}
                        onChange={e => updateAttribute('weakFootAccuracy', Number(e.target.value))}
                      >
                        <option value={1}>Malo (1)</option>
                        <option value={2}>Regular (2)</option>
                        <option value={3}>Bueno (3)</option>
                        <option value={4}>Excelente (4)</option>
                      </select>
                    </div>

                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <label className="block text-sm text-gray-400 mb-2">Estabilidad (Forma)</label>
                      <select
                        className="input w-full"
                        value={attributes.form}
                        onChange={e => updateAttribute('form', Number(e.target.value))}
                      >
                        <option value={1}>Mala (1)</option>
                        <option value={2}>Regular (2)</option>
                        <option value={3}>Buena (3)</option>
                        <option value={4}>Excelente (4)</option>
                        <option value={5}>Perfecta (5)</option>
                        <option value={6}>Sobresaliente (6)</option>
                        <option value={7}>Legendaria (7)</option>
                        <option value={8}>Máxima (8)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold mb-4 text-green-500">Habilidades de Jugador (39)</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(skills).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={e => updateSkill(key as keyof PlayerSkills, e.target.checked)}
                        className="w-4 h-4 text-primary bg-gray-600 border-gray-500 rounded focus:ring-primary focus:ring-2"
                      />
                      <span className="text-sm font-medium">
                        {skillTranslations[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'styles' && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold mb-4 text-purple-500">Estilos de Juego (21)</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(playingStyles).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={e => updatePlayingStyle(key as keyof PlayingStyles, e.target.checked)}
                        className="w-4 h-4 text-primary bg-gray-600 border-gray-500 rounded focus:ring-primary focus:ring-2"
                      />
                      <span className="text-sm font-medium">
                        {skillTranslations[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer mejorado */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6 border-t border-gray-700/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span>
                {activeTab === 'basic' && 'Información Básica'}
                {activeTab === 'attributes' && 'Atributos PES 2021'}
                {activeTab === 'skills' && 'Habilidades de Jugador'}
                {activeTab === 'styles' && 'Estilos de Juego'}
              </span>
            </div>
            <div className="flex space-x-3 w-full sm:w-auto">
              <button 
                type="button" 
                className="flex-1 sm:flex-none btn-outline hover:bg-gray-700 transition-all" 
                onClick={onClose}
              >
                <X size={16} className="mr-2" />
                Cancelar
              </button>
              <button 
                type="submit" 
                className="flex-1 sm:flex-none btn-primary bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 transition-all" 
                onClick={handleSubmit}
              >
                <User size={16} className="mr-2" />
                Crear Jugador
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPlayerModal;
