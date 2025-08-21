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
  player: Player;
  onClose: () => void;
  onSave: (playerData: Player) => void;
}

interface PlayerFormData {
  // Datos básicos
  nombre_jugador: string;
  apellido_jugador: string;
  edad: number;
  altura: number;
  peso: number;
  pierna: 'left' | 'right';
  estilo_juego: string;
  posicion: string;
  valoracion: number;
  precio_compra_libre: number;
  nacionalidad: string;
  id_equipo: string;
  foto_jugador: string;
  is_free: boolean;
  
  // Características ofensivas
  actitud_ofensiva: number;
  control_balon: number;
  drible: number;
  posesion_balon: number;
  pase_raso: number;
  pase_bombeado: number;
  finalizacion: number;
  cabeceador: number;
  balon_parado: number;
  efecto: number;
  
  // Características físicas
  velocidad: number;
  aceleracion: number;
  potencia_tiro: number;
  salto: number;
  contacto_fisico: number;
  equilibrio: number;
  resistencia: number;
  
  // Características defensivas
  actitud_defensiva: number;
  recuperacion_balon: number;
  agresividad: number;
  
  // Características de portero
  actitud_portero: number;
  atajar_pt: number;
  despejar_pt: number;
  reflejos_pt: number;
  cobertura_pt: number;
  
  // Características adicionales
  uso_pie_malo: number;
  precision_pie_malo: number;
  estabilidad: number;
  resistencia_lesiones: number;
  
  // Habilidades especiales
  specialSkills: string[];
  celebrations: string[];
  
  // Campos legacy para compatibilidad
  name?: string;
  age?: number;
  position?: string;
  nationality?: string;
  dorsal?: number;
  clubId?: string;
  overall?: number;
  potential?: number;
  image?: string;
  contract?: {
    expires: string;
    salary: number;
  };
  price?: number;
}

const EditPlayerModal = ({ player, onClose, onSave }: Props) => {
  const { clubs } = useGlobalStore();
        const [formData, setFormData] = useState<PlayerFormData>({
    // Datos básicos
    nombre_jugador: player.nombre_jugador || player.name || '',
    apellido_jugador: player.apellido_jugador || '',
    edad: player.edad || player.age || 18,
    altura: player.altura || player.height || 175,
    peso: player.peso || player.weight || 70,
    pierna: player.pierna || player.dominantFoot || 'right',
    estilo_juego: player.estilo_juego || player.playingStyle || 'Equilibrado',
    posicion: player.posicion || player.position || 'CF',
    valoracion: player.valoracion || player.overall || 75,
    precio_compra_libre: player.precio_compra_libre || player.contract?.salary || 0,
    nacionalidad: player.nacionalidad || player.nationality || '',
    id_equipo: player.id_equipo || player.clubId || '',
    foto_jugador: player.foto_jugador || player.image || '',
    is_free: player.is_free || false,
      
          // Características ofensivas
    actitud_ofensiva: player.actitud_ofensiva || player.detailedStats?.offensive || 70,
    control_balon: player.control_balon || player.detailedStats?.ballControl || 70,
    drible: player.drible || player.detailedStats?.dribbling || 70,
    posesion_balon: player.posesion_balon || 70,
    pase_raso: player.pase_raso || player.detailedStats?.lowPass || 70,
    pase_bombeado: player.pase_bombeado || player.detailedStats?.loftedPass || 70,
    finalizacion: player.finalizacion || player.detailedStats?.finishing || 70,
    cabeceador: player.cabeceador || player.detailedStats?.finishing || 70,
    balon_parado: player.balon_parado || player.detailedStats?.placeKicking || 70,
    efecto: player.efecto || player.detailedStats?.volleys || 70,
  
  // Características físicas
  velocidad: player.velocidad || player.detailedStats?.speed || 70,
  aceleracion: player.aceleracion || player.detailedStats?.acceleration || 70,
  potencia_tiro: player.potencia_tiro || player.detailedStats?.kickingPower || 70,
  salto: player.salto || player.detailedStats?.jumping || 70,
  contacto_fisico: player.contacto_fisico || player.detailedStats?.physicalContact || 70,
  equilibrio: player.equilibrio || player.detailedStats?.balance || 70,
  resistencia: player.resistencia || player.detailedStats?.stamina || 70,
  
  // Características defensivas
  actitud_defensiva: player.actitud_defensiva || player.detailedStats?.defensive || 70,
  recuperacion_balon: player.recuperacion_balon || player.detailedStats?.ballWinning || 70,
  agresividad: player.agresividad || player.detailedStats?.aggression || 70,
  
  // Características de portero
  actitud_portero: player.actitud_portero || player.detailedStats?.goalkeeperHandling || 70,
  atajar_pt: player.atajar_pt || player.detailedStats?.goalkeeperThrowing || 70,
  despejar_pt: player.despejar_pt || player.detailedStats?.goalkeeperClearing || 70,
  reflejos_pt: player.reflejos_pt || player.detailedStats?.goalkeeperReflexes || 70,
  cobertura_pt: player.cobertura_pt || player.detailedStats?.goalkeeperReach || 70,
  
  // Características adicionales
  uso_pie_malo: player.uso_pie_malo || 0,
  precision_pie_malo: player.precision_pie_malo || 0,
  estabilidad: player.estabilidad || player.consistency || 70,
  resistencia_lesiones: player.resistencia_lesiones || player.injuryResistance || 70,
  
  // Habilidades especiales
  specialSkills: player.specialSkills || [],
  celebrations: player.celebrations || [],
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
    'Despeje Acrobático', 'Finalización Acrobática', 'Superioridad Aérea', 'Control de Tiro con Efecto',
    'Corte y Giro', 'Doble Toque', 'Elástico', 'Espíritu de Lucha', 'Tiro de Primera',
    'Despeje Alto de Portero', 'Saque Largo de Portero', 'Parada de Penalti', 'Despeje de Portero', 'Juego de Cabeza',
    'Truco de Talón', 'Interceptación', 'Disparo de Largo Alcance', 'Tiro de Largo Alcance',
    'Saque Largo', 'Pase Bajo Elevado', 'Marcaje Individual', 'Giro de Marsella',
    'Pase de Un Toque', 'Centro Exterior', 'Especialista en Penaltis', 'Centro Preciso',
    'Rabona', 'Disparos Elevados', 'Movimiento Escocés', 'Control de Suela', 'Sombrero',
    'Mercader de Velocidad', 'Super-sub', 'Pase Entre Líneas', 'Regreso', 'Pase Ponderado'
  ];

  const playingStyles = [
    'Equilibrado', 'Jugador de Agujero', 'Box-to-Box', 'Orquestador', 'Hombre Ancla',
    'El Destructor', 'Delantero Extra', 'Lateral Ofensivo', 'Lateral Defensivo',
    'Especialista en Centros', 'Extremo Prolífico', 'Clásico No.10', 'Creador de Juego',
    'Corredor Falso', 'Cazagoles', 'Zorro en el Área', 'Hombre Objetivo', 'Extremo Prolífico'
  ];

  const celebrations = [
    'Tranquilo', 'Emocionado', 'Respetuoso', 'Jugador de Equipo', 'Individual',
    'Baile', 'Gesto', 'Señalar', 'Correr', 'Deslizar'
  ];

  const isGoalkeeper = formData.posicion === 'GK';

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
    if (!formData.nombre_jugador.trim()) newErrors.nombre_jugador = 'Nombre requerido';
    if (!formData.apellido_jugador.trim()) newErrors.apellido_jugador = 'Apellido requerido';
    if (!formData.nacionalidad.trim()) newErrors.nacionalidad = 'Nacionalidad requerida';
    if (formData.edad < 15 || formData.edad > 50) newErrors.edad = 'Edad debe estar entre 15-50';
    if (!formData.id_equipo) newErrors.id_equipo = 'Club requerido';
    if (formData.altura < 150 || formData.altura > 220) newErrors.altura = 'Altura debe estar entre 150-220cm';
    if (formData.peso < 40 || formData.peso > 120) newErrors.peso = 'Peso debe estar entre 40-120kg';
    if (formData.valoracion < 40 || formData.valoracion > 99) newErrors.valoracion = 'Valoración debe estar entre 40-99';
    if (formData.precio_compra_libre < 0) newErrors.precio_compra_libre = 'Precio de compra libre debe ser positivo';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const image = formData.foto_jugador || player.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.nombre_jugador)}&background=1e293b&color=fff&size=128`;
      
      // Calcular overall basado en estadísticas
      const isGoalkeeper = formData.posicion === 'GK';
      let calculatedOverall = 75;
      
      if (isGoalkeeper) {
        calculatedOverall = Math.round((
          formData.actitud_portero + 
          formData.atajar_pt + 
          formData.despejar_pt + 
          formData.reflejos_pt + 
          formData.cobertura_pt
        ) / 5);
      } else {
        calculatedOverall = Math.round((
          formData.actitud_ofensiva + formData.control_balon + formData.drible + 
          formData.pase_raso + formData.pase_bombeado + formData.finalizacion + 
          formData.balon_parado + formData.efecto + formData.velocidad + 
          formData.aceleracion + formData.potencia_tiro + 
          formData.salto + formData.contacto_fisico + formData.equilibrio + 
          formData.resistencia + formData.agresividad + 
          formData.recuperacion_balon + formData.actitud_defensiva
        ) / 20);
      }

      onSave({
        ...player,
        // Nueva estructura de jugador
        nombre_jugador: formData.nombre_jugador,
        apellido_jugador: formData.apellido_jugador,
        edad: formData.edad,
        altura: formData.altura,
        peso: formData.peso,
        pierna: formData.pierna,
        estilo_juego: formData.estilo_juego,
        posicion: formData.posicion,
        valoracion: formData.valoracion,
        precio_compra_libre: formData.precio_compra_libre,
        nacionalidad: formData.nacionalidad,
        id_equipo: formData.id_equipo,
        foto_jugador: image,
        is_free: formData.is_free,
        
        // Características ofensivas
        actitud_ofensiva: formData.actitud_ofensiva,
        control_balon: formData.control_balon,
        drible: formData.drible,
        posesion_balon: formData.posesion_balon,
        pase_raso: formData.pase_raso,
        pase_bombeado: formData.pase_bombeado,
        finalizacion: formData.finalizacion,
        cabeceador: formData.cabeceador,
        balon_parado: formData.balon_parado,
        efecto: formData.efecto,
        
        // Características físicas
        velocidad: formData.velocidad,
        aceleracion: formData.aceleracion,
        potencia_tiro: formData.potencia_tiro,
        salto: formData.salto,
        contacto_fisico: formData.contacto_fisico,
        equilibrio: formData.equilibrio,
        resistencia: formData.resistencia,
        
        // Características defensivas
        actitud_defensiva: formData.actitud_defensiva,
        recuperacion_balon: formData.recuperacion_balon,
        agresividad: formData.agresividad,
        
        // Características de portero
        actitud_portero: formData.actitud_portero,
        atajar_pt: formData.atajar_pt,
        despejar_pt: formData.despejar_pt,
        reflejos_pt: formData.reflejos_pt,
        cobertura_pt: formData.cobertura_pt,
        
        // Características adicionales
        uso_pie_malo: formData.uso_pie_malo,
        precision_pie_malo: formData.precision_pie_malo,
        estabilidad: formData.estabilidad,
        resistencia_lesiones: formData.resistencia_lesiones,
        
        // Campos legacy para compatibilidad
        name: formData.nombre_jugador,
        age: formData.edad,
        nationality: formData.nacionalidad,
        clubId: formData.id_equipo,
        dorsal: player.dorsal,
        position: formData.posicion,
        overall: formData.valoracion,
        potential: formData.potential,
        image,
        contract: { 
          expires: (new Date().getFullYear() + 3).toString(),
          salary: formData.precio_compra_libre 
        },
        attributes: {
          pace: formData.velocidad,
          shooting: formData.finalizacion,
          passing: formData.pase_raso,
          dribbling: formData.drible,
          defending: formData.actitud_defensiva,
          physical: formData.contacto_fisico
        },
        transferValue: formData.precio_compra_libre,
        value: formData.precio_compra_libre,
        price: formData.precio_compra_libre,
        height: formData.altura,
        weight: formData.peso,
        dominantFoot: formData.pierna,
        secondaryPositions: player.secondaryPositions || [],
        specialSkills: formData.specialSkills,
        playingStyle: formData.estilo_juego,
        celebrations: formData.celebrations,
        consistency: formData.estabilidad,
        injuryResistance: formData.resistencia_lesiones,
        morale: 70,
        detailedStats: {
          offensive: formData.actitud_ofensiva,
          ballControl: formData.control_balon,
          dribbling: formData.drible,
          lowPass: formData.pase_raso,
          loftedPass: formData.pase_bombeado,
          finishing: formData.finalizacion,
          placeKicking: formData.balon_parado,
          volleys: formData.efecto,
          curl: formData.cabeceador,
          speed: formData.velocidad,
          acceleration: formData.aceleracion,
          kickingPower: formData.potencia_tiro,
          stamina: formData.resistencia,
          jumping: formData.salto,
          physicalContact: formData.contacto_fisico,
          balance: formData.equilibrio,
          defensive: formData.actitud_defensiva,
          ballWinning: formData.recuperacion_balon,
          aggression: formData.agresividad,
          goalkeeperReach: formData.actitud_portero,
          goalkeeperReflexes: formData.reflejos_pt,
          goalkeeperClearing: formData.despejar_pt,
          goalkeeperThrowing: formData.atajar_pt,
          goalkeeperHandling: formData.cobertura_pt,
        }
      });
      toast.success('¡Jugador actualizado exitosamente!');
    }
  };

  return (
    <Modal open={true} onClose={onClose} className="!max-w-[95vw] w-[95vw] lg:!max-w-[1400px] max-h-[95vh]" initialFocusRef={modalRef}>
      <div ref={modalRef} className="max-h-[95vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
              Actualizar Jugador
            </h3>
            <p className="text-gray-400 text-sm">PES 2021 - Formulario Completo</p>
          </div>
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
              value={formData.foto_jugador}
              onChange={(value) => setFormData({ ...formData, foto_jugador: value })}
              label="Foto del Jugador"
              placeholder="URL de la foto o subir archivo"
              showPreview={true}
              maxSize={3}
            />
                <p className="text-gray-400 text-sm mt-2">
                  💡 Si no subes una foto, se mantendrá la imagen actual del jugador
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-200">
                      Nombre *
                </label>
                <input
                      className={`w-full px-3 py-2 bg-gray-800 border-2 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                        errors.nombre_jugador ? 'border-red-500' : 'border-gray-600 hover:border-gray-500'
                      }`}
                      placeholder="Ejemplo: Lionel"
                  value={formData.nombre_jugador}
                  onChange={(e) => setFormData({...formData, nombre_jugador: e.target.value})}
                />
                    {errors.nombre_jugador && <p className="text-red-400 text-sm font-medium">{errors.nombre_jugador}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-200">
                  Apellido *
                </label>
                <input
                      className={`w-full px-3 py-2 bg-gray-800 border-2 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                        errors.apellido_jugador ? 'border-red-500' : 'border-gray-600 hover:border-gray-500'
                      }`}
                      placeholder="Ejemplo: Messi"
                  value={formData.apellido_jugador}
                  onChange={(e) => setFormData({...formData, apellido_jugador: e.target.value})}
                />
                    {errors.apellido_jugador && <p className="text-red-400 text-sm font-medium">{errors.apellido_jugador}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Edad *
                </label>
                  <input
                    type="number"
                    min="15"
                    max="50"
                      className={`input w-full ${errors.edad ? 'border-red-500' : ''}`}
                    placeholder="Ejemplo: 25"
                    value={formData.edad}
                    onChange={e => setFormData({ ...formData, edad: Number(e.target.value) })}
                  />
                {errors.edad && <p className="text-red-500 text-sm">{errors.edad}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Nacionalidad *
                </label>
                <input
                  className={`input w-full ${errors.nacionalidad ? 'border-red-500' : ''}`}
                      placeholder="Ejemplo: Argentina"
                  value={formData.nacionalidad}
                  onChange={e => setFormData({ ...formData, nacionalidad: e.target.value })}
                />
                {errors.nacionalidad && <p className="text-red-500 text-sm">{errors.nacionalidad}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Club *
                </label>
                <select
                  className={`input w-full ${errors.id_equipo ? 'border-red-500' : ''}`}
                  value={formData.id_equipo}
                  onChange={(e) => setFormData({...formData, id_equipo: e.target.value})}
                >
                  <option value="">Seleccionar club</option>
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>{club.name}</option>
                  ))}
                </select>
                {errors.id_equipo && <p className="text-red-500 text-sm">{errors.id_equipo}</p>}
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
                      value={player.dorsal} // Assuming player.dorsal is the correct source for dorsal
                      onChange={e => { /* No change in formData, as dorsal is not in PlayerFormData */ }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Pie Dominante
                    </label>
                    <select
                      className="input w-full"
                      value={formData.pierna}
                      onChange={(e) => setFormData({...formData, pierna: e.target.value as 'left' | 'right'})}
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
                      className={`input w-full ${errors.altura ? 'border-red-500' : ''}`}
                      placeholder="Ejemplo: 170"
                      value={formData.altura}
                      onChange={e => setFormData({ ...formData, altura: Number(e.target.value) })}
                    />
                    {errors.altura && <p className="text-red-500 text-sm">{errors.altura}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Peso (kg)
                    </label>
                    <input
                      type="number"
                      min="40"
                      max="120"
                      className={`input w-full ${errors.peso ? 'border-red-500' : ''}`}
                      placeholder="Ejemplo: 70"
                      value={formData.peso}
                      onChange={e => setFormData({ ...formData, peso: Number(e.target.value) })}
                    />
                    {errors.peso && <p className="text-red-500 text-sm">{errors.peso}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Posición Principal
                    </label>
                    <select
                      className="input w-full"
                      value={formData.posicion}
                      onChange={(e) => setFormData({...formData, posicion: e.target.value})}
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                  {secondaryPositions.filter(pos => pos.value !== formData.posicion).map(pos => (
                    <label key={pos.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={player.secondaryPositions?.includes(pos.value) || false} // Assuming player.secondaryPositions is the source
                        onChange={(e) => {
                          if (e.target.checked) {
                            // This logic needs to be updated to handle adding secondary positions
                            // For now, it's not directly mapped to formData.secondaryPositions
                            // This part of the logic needs to be re-evaluated based on how secondary positions are managed
                            // For now, it's a placeholder to avoid breaking the UI
                            console.warn("Secondary position selection not fully implemented in formData");
                          } else {
                            // This logic needs to be updated to handle removing secondary positions
                            // For now, it's a placeholder
                            console.warn("Secondary position deselection not fully implemented in formData");
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {[
                      { key: 'actitud_ofensiva', label: 'Actitud Ofensiva', icon: '⚽' },
                      { key: 'control_balon', label: 'Control de Balón', icon: '🎯' },
                      { key: 'drible', label: 'Drible', icon: '🏃' },
                      { key: 'posesion_balon', label: 'Posesión de Balón', icon: '👤' },
                      { key: 'pase_raso', label: 'Pase Raso', icon: '📤' },
                      { key: 'pase_bombeado', label: 'Pase Bombeado', icon: '📡' },
                      { key: 'finalizacion', label: 'Finalización', icon: '🎯' },
                      { key: 'cabeceador', label: 'Cabeceador', icon: '🤕' },
                      { key: 'balon_parado', label: 'Balón Parado', icon: '⚽' },
                      { key: 'efecto', label: 'Efecto', icon: '🌀' },
                      { key: 'velocidad', label: 'Velocidad', icon: '💨' },
                      { key: 'aceleracion', label: 'Aceleración', icon: '🚀' },
                      { key: 'potencia_tiro', label: 'Fuerza de Tiro', icon: '💪' },
                      { key: 'salto', label: 'Salto', icon: '🦘' },
                      { key: 'contacto_fisico', label: 'Contacto Físico', icon: '🛡️' },
                      { key: 'equilibrio', label: 'Equilibrio', icon: '⚖️' },
                      { key: 'resistencia', label: 'Resistencia', icon: '🏃‍♂️' },
                      { key: 'agresividad', label: 'Agresividad', icon: '🔥' },
                      { key: 'recuperacion_balon', label: 'Recuperación de Balón', icon: '🎯' },
                      { key: 'actitud_defensiva', label: 'Actitud Defensiva', icon: '🛡️' },
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {[
                      { key: 'actitud_portero', label: 'Actitud Portero', icon: '🤲' },
                      { key: 'atajar_pt', label: 'Atajar', icon: '⚡' },
                      { key: 'despejar_pt', label: 'Despejar', icon: '👊' },
                      { key: 'reflejos_pt', label: 'Reflejos', icon: '⚡' },
                      { key: 'cobertura_pt', label: 'Cobertura', icon: '👟' },
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {[
                   { key: 'estabilidad', label: 'Estabilidad', icon: '⚖️' },
                   { key: 'resistencia_lesiones', label: 'Resistencia a Lesiones', icon: '🛡️' },
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
                      value={formData.estilo_juego}
                      onChange={(e) => setFormData({...formData, estilo_juego: e.target.value})}
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 max-h-48 overflow-y-auto">
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                      Valoración (40-99) *
                </label>
                <input
                  type="number"
                  min="40"
                  max="99"
                  className={`input w-full ${errors.valoracion ? 'border-red-500' : ''}`}
                  placeholder="Ejemplo: 85"
                  value={formData.valoracion}
                  onChange={(e) => setFormData({...formData, valoracion: Number(e.target.value)})}
                />
                {errors.valoracion && <p className="text-red-500 text-sm">{errors.valoracion}</p>}
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
                        value={3} // Assuming 3 years contract
                        onChange={e => { /* No change needed for contract years */ }}
                      />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                      Salario Mensual ($)
                </label>
                <input
                      type="number"
                      min="0"
                      className={`input w-full ${errors.precio_compra_libre ? 'border-red-500' : ''}`}
                      placeholder="Ejemplo: 50000"
                      value={formData.precio_compra_libre}
                      onChange={e => setFormData({ ...formData, precio_compra_libre: Number(e.target.value) })}
                    />
                    {errors.precio_compra_libre && <p className="text-red-500 text-sm">{errors.precio_compra_libre}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                      Valor de Mercado ($)
                </label>
                  <input
                    type="number"
                    min="0"
                      className={`input w-full ${errors.precio_compra_libre ? 'border-red-500' : ''}`}
                    placeholder="Ejemplo: 1000000"
                      value={formData.precio_compra_libre}
                      onChange={e => setFormData({ ...formData, precio_compra_libre: Number(e.target.value) })}
                  />
                    {errors.precio_compra_libre && <p className="text-red-500 text-sm">{errors.precio_compra_libre}</p>}
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
              className="px-8 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              ✨ Actualizar Jugador
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditPlayerModal;

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
 