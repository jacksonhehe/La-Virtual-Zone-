import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Edit, Plus, Trash, Search, Filter, X, Users, DollarSign, Download, Upload, FileText, Database } from 'lucide-react';
import { createPlayer, updatePlayer, deletePlayer, updateAllPlayersToTransferListed, listPlayers, replaceSupabasePlayers } from '../../utils/playerService';
import { adjustAllPlayerSalaries, adjustAllPlayerMarketValues } from '../../utils/marketRules';
import NewPlayerModal from '../../components/admin/NewPlayerModal';
import EditPlayerModal from '../../components/admin/EditPlayerModal';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import { useDataStore } from '../../store/dataStore';
import { usePagination } from '../../hooks/usePagination';
import { getTranslatedPosition, getClubDisplayName } from '../../utils/helpers';
import { config } from '../../lib/config';
import * as XLSX from 'xlsx';

const AdminPlayers = () => {
  const { players, clubs, updatePlayers, refreshPlayers } = useDataStore();
  const [showNewPlayer, setShowNewPlayer] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any | null>(null);
  const [deletePlayerTarget, setDeletePlayerTarget] = useState<any | null>(null);
  const [searchParams] = useSearchParams();

  // Filters
  const [searchText, setSearchText] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedClub, setSelectedClub] = useState('');
  const [selectedNationality, setSelectedNationality] = useState('');
  const [transferFilter, setTransferFilter] = useState(''); // '', 'listed', 'unlisted'
  const [overallRange, setOverallRange] = useState({ min: '', max: '' });
  const [ageRange, setAgeRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState<'overall' | 'age' | 'name' | 'position' | 'club' | 'value'>('overall');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [perPage, setPerPage] = useState(20);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSalaryConfirm, setShowSalaryConfirm] = useState(false);
  const [showMarketValueConfirm, setShowMarketValueConfirm] = useState(false);
  const [page, setPage] = useState(1);
  const [isReplacingSupabase, setIsReplacingSupabase] = useState(false);
  

  useEffect(() => {
    // Initialize players if not already loaded
    if (players.length === 0) {
      console.log('AdminPlayers: No players loaded, calling refreshPlayers');
      refreshPlayers();
    }
  }, [players.length]); // Remove refreshPlayers dependency to prevent infinite loops

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowNewPlayer(true);
    }
  }, [searchParams]);

  // Available positions for filter
  const positions = ['PT', 'DEC', 'LI', 'LD', 'MCD', 'MC', 'MO', 'MDI', 'MDD', 'EXI', 'EXD', 'CD', 'SD'];

  // Reset filters function
  const resetFilters = () => {
    setSearchText('');
    setSelectedPosition('');
    setSelectedClub('');
    setSelectedNationality('');
    setTransferFilter('');
    setOverallRange({ min: '', max: '' });
    setAgeRange({ min: '', max: '' });
    setSortBy('overall');
    setSortDir('desc');
    setPerPage(20);
    setPage(1);
  };

  // Check if any filters are active - improved validation
  const hasActiveFilters = searchText ||
    selectedPosition ||
    selectedClub ||
    selectedNationality ||
    transferFilter ||
    (overallRange.min && !isNaN(parseInt(overallRange.min))) ||
    (overallRange.max && !isNaN(parseInt(overallRange.max))) ||
    (ageRange.min && !isNaN(parseInt(ageRange.min))) ||
    (ageRange.max && !isNaN(parseInt(ageRange.max))) ||
    sortBy !== 'overall' ||
    sortDir !== 'desc' ||
    perPage !== 20;

  const uniqueNationalities = useMemo(() => {
    const set = new Set<string>();
    (players || []).forEach(p => { if (p.nationality) set.add(p.nationality); });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [players]);

  const filtered = useMemo(() => {
    let filteredPlayers = (players || []);

    // Text search (name or nationality) - handle undefined/null values
    if (searchText) {
      const query = searchText.toLowerCase();
      filteredPlayers = filteredPlayers.filter((p) =>
        (p.name?.toLowerCase().includes(query) || false) ||
        (p.nationality?.toLowerCase().includes(query) || false)
      );
    }

    // Position filter - handle undefined/null values
    if (selectedPosition) {
      filteredPlayers = filteredPlayers.filter((p) => p.position === selectedPosition);
    }

    // Club filter - handle undefined/null values
    if (selectedClub) {
      if (selectedClub === 'libre') {
        filteredPlayers = filteredPlayers.filter((p) => p.clubId === 'libre');
      } else {
        filteredPlayers = filteredPlayers.filter((p) => p.clubId === selectedClub);
      }
    }

    // Nationality filter - handle undefined/null values
    if (selectedNationality) {
      filteredPlayers = filteredPlayers.filter((p) => p.nationality === selectedNationality);
    }

    // Transfer listed filter - handle undefined/null values
    if (transferFilter === 'listed') {
      filteredPlayers = filteredPlayers.filter((p) => p.transferListed === true);
    } else if (transferFilter === 'unlisted') {
      filteredPlayers = filteredPlayers.filter((p) => p.transferListed === false || p.transferListed === undefined);
    }

    // Overall range filter - handle undefined/null values and validate input
    if (overallRange.min && !isNaN(parseInt(overallRange.min))) {
      const minOverall = parseInt(overallRange.min);
      filteredPlayers = filteredPlayers.filter((p) => (p.overall ?? 0) >= minOverall);
    }
    if (overallRange.max && !isNaN(parseInt(overallRange.max))) {
      const maxOverall = parseInt(overallRange.max);
      filteredPlayers = filteredPlayers.filter((p) => (p.overall ?? 0) <= maxOverall);
    }

    // Age range filter - handle undefined/null values and validate input
    if (ageRange.min && !isNaN(parseInt(ageRange.min))) {
      const minAge = parseInt(ageRange.min);
      filteredPlayers = filteredPlayers.filter((p) => (p.age ?? 0) >= minAge);
    }
    if (ageRange.max && !isNaN(parseInt(ageRange.max))) {
      const maxAge = parseInt(ageRange.max);
      filteredPlayers = filteredPlayers.filter((p) => (p.age ?? 0) <= maxAge);
    }

    // Sort - handle undefined/null values safely
    const getClubName = (clubId: string) => getClubDisplayName(clubId, clubs);
    const dir = sortDir === 'asc' ? 1 : -1;
    const sorted = filteredPlayers.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '') * dir;
        case 'position':
          return (a.position || '').localeCompare(b.position || '') * dir;
        case 'club':
          return getClubName(a.clubId || '').localeCompare(getClubName(b.clubId || '')) * dir;
        case 'age':
          return ((a.age ?? 0) - (b.age ?? 0)) * dir;
        case 'value':
          return ((a.transferValue ?? 0) - (b.transferValue ?? 0)) * dir;
        case 'overall':
        default:
          return ((a.overall ?? 0) - (b.overall ?? 0)) * dir;
      }
    });
    return sorted;
  }, [players, clubs, searchText, selectedPosition, selectedClub, selectedNationality, transferFilter, overallRange, ageRange, sortBy, sortDir]);

  const { items: pageItems, totalPages, next, prev } = usePagination({ items: filtered, perPage, initialPage: page });

  const handleCreatePlayer = async (data: any) => {
    try {
      const created = await createPlayer(data as any);
    console.log('Created new player:', created);
    updatePlayers([...players, created]);
    setShowNewPlayer(false);
    } catch (error) {
      console.error('Error creating player:', error);
      alert('Error al crear el jugador. Revisa la consola para más detalles.');
    }
  };

  const handleSavePlayer = async (data: any) => {
    console.log('handleSavePlayer - updating player:', data.id, 'with image:', data.image ? 'YES' : 'NO');
    // Find the existing player and merge with new data
    const existingPlayer = players.find(p => p.id === data.id);
    if (existingPlayer) {
      const updatedPlayer = {
        ...existingPlayer,
        ...data,
        // Explicitly handle image to prevent loss
        image: data.image !== undefined ? data.image : existingPlayer.image,
        attributes: data.attributes || existingPlayer.attributes,
        skills: data.skills || existingPlayer.skills,
        playingStyles: data.playingStyles || existingPlayer.playingStyles,
        injuryResistance: data.injuryResistance || existingPlayer.injuryResistance || 2,
        matches: data.matches ?? existingPlayer.matches ?? 0,
        dorsal: data.dorsal ?? existingPlayer.dorsal ?? 1,
        nationality: data.nationality || existingPlayer.nationality || 'Argentina',
        height: data.height ?? existingPlayer.height,
        weight: data.weight ?? existingPlayer.weight
      };

      console.log('Updated player object with image:', updatedPlayer.image ? 'PRESERVED' : 'MISSING');

      // Update player in localStorage via playerService
      try {
        await updatePlayer(updatedPlayer);
      } catch (error) {
        console.error('Error sincronizando jugador con Supabase:', error);
      }

      // Update dataStore
      const newPlayers = players.map((x) => (x.id === data.id ? updatedPlayer : x));
      console.log('Updating dataStore with new players:', newPlayers.length);
      updatePlayers(newPlayers);
    }
    setEditingPlayer(null);
  };

  const handleDeletePlayerInner = (id: string) => {
    console.log('Deleting player:', id);
    // Delete from localStorage via playerService
    deletePlayer(id);

    // Update dataStore
    const newPlayers = players.filter((x) => x.id !== id);
    console.log('Updating dataStore after delete:', newPlayers.length);
    updatePlayers(newPlayers);
    setDeletePlayerTarget(null);
  };


  const handleDownloadTemplate = () => {
    try {
      console.log('📝 Generando plantilla de importación Excel...');

      // Función para truncar texto largo (límite de Excel: 32,767 caracteres)
      const truncateText = (text: string, maxLength: number = 1000) => {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
      };

      // Función para extraer solo el nombre del archivo de imagen
      const getImageFilename = (imageUrl: string) => {
        if (!imageUrl) return '';
        try {
          const url = new URL(imageUrl);
          const pathname = url.pathname;
          const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
          return filename || truncateText(imageUrl, 100);
        } catch {
          return truncateText(imageUrl, 100);
        }
      };

      // Crear workbook con múltiples hojas para la plantilla
      const wb = XLSX.utils.book_new();

      // Hoja 1: Información básica de jugadores - EJEMPLOS
      const templateBasicData: any[] = [
        {
          ID: 'template-001',
          Nombre: 'Lionel Messi',
          Edad: 36,
          Posición: 'ED',
          Media: 93,
          Valor: 45000000,
          Salario: 500000,
          ID_Club: 'club-barcelona',
          Club: 'FC Barcelona',
          Imagen: 'messi.jpg',
          Altura: 170,
          Peso: 72,
          Nacionalidad: 'Argentina',
          Dorsal: 10,
          Resistencia_Lesiones: 3,
          Partidos: 150,
          Transferible: 'No'
        },
        {
          ID: 'template-002',
          Nombre: 'Cristiano Ronaldo',
          Edad: 38,
          Posición: 'DC',
          Media: 91,
          Valor: 35000000,
          Salario: 450000,
          ID_Club: 'club-al-nassr',
          Club: 'Al-Nassr FC',
          Imagen: 'ronaldo.jpg',
          Altura: 187,
          Peso: 83,
          Nacionalidad: 'Portugal',
          Dorsal: 7,
          Resistencia_Lesiones: 2,
          Partidos: 200,
          Transferible: 'Sí'
        },
        {
          ID: 'template-003',
          Nombre: 'Neymar Jr',
          Edad: 31,
          Posición: 'EI',
          Media: 89,
          Valor: 55000000,
          Salario: 600000,
          ID_Club: 'club-psg',
          Club: 'PSG',
          Imagen: 'neymar.jpg',
          Altura: 175,
          Peso: 68,
          Nacionalidad: 'Brasil',
          Dorsal: 10,
          Resistencia_Lesiones: 1,
          Partidos: 120,
          Transferible: 'No'
        },
        {
          ID: 'template-004',
          Nombre: 'Kylian Mbappé',
          Edad: 24,
          Posición: 'DC',
          Media: 92,
          Valor: 180000000,
          Salario: 800000,
          ID_Club: 'club-psg',
          Club: 'PSG',
          Imagen: 'mbappe.jpg',
          Altura: 178,
          Peso: 73,
          Nacionalidad: 'Francia',
          Dorsal: 7,
          Resistencia_Lesiones: 2,
          Partidos: 80,
          Transferible: 'Sí'
        },
        {
          ID: 'template-005',
          Nombre: 'Manuel Neuer',
          Edad: 37,
          Posición: 'POR',
          Media: 90,
          Valor: 8000000,
          Salario: 200000,
          ID_Club: 'club-bayern',
          Club: 'Bayern Munich',
          Imagen: 'neuer.jpg',
          Altura: 193,
          Peso: 92,
          Nacionalidad: 'Alemania',
          Dorsal: 1,
          Resistencia_Lesiones: 3,
          Partidos: 180,
          Transferible: 'No'
        }
      ];

      const wsTemplateBasic = XLSX.utils.json_to_sheet(templateBasicData);
      const basicColWidths = [
        { wch: 15 }, // ID
        { wch: 25 }, // Nombre
        { wch: 8 },  // Edad
        { wch: 12 }, // Posición
        { wch: 8 },  // Media
        { wch: 12 }, // Valor
        { wch: 12 }, // Salario
        { wch: 15 }, // ID_Club
        { wch: 20 }, // Club
        { wch: 15 }, // Imagen
        { wch: 10 }, // Altura
        { wch: 10 }, // Peso
        { wch: 15 }, // Nacionalidad
        { wch: 8 },  // Dorsal
        { wch: 18 }, // Resistencia_Lesiones
        { wch: 10 }, // Partidos
        { wch: 12 }  // Transferible
      ];
      wsTemplateBasic['!cols'] = basicColWidths;
      XLSX.utils.book_append_sheet(wb, wsTemplateBasic, 'Jugadores');

      // Hoja 2: Atributos detallados - EJEMPLOS
      const templateAttributesData: any[] = [
        {
          ID: 'template-001',
          Nombre: 'Lionel Messi',
        // Atributos principales
        Ataque: 96,
        Defensa: 65,
        Velocidad: 88,
        Técnica: 96,
        Fuerza: 68,
        // Atributos específicos de portero
        Portería: 45,
        Agarre: 40,
        Reflejos: 42,
        Cobertura: 45,
        Actitud_Portero: 45,
        // Atributos avanzados
        Ataque_Ofensivo: 98,
        Control_Balon: 98,
        Dribbling: 98,
        Posesion_Balon: 96,
        Pase_Ras: 92,
        Pase_Bomb: 88,
        Finalizacion: 96,
        Cabeceador: 70,
        Balon_Parado: 92,
        Efecto: 94,
        Aceleracion: 92,
        Potencia_Tiro: 86,
        Salto: 75,
        Contacto_Fisico: 60,
        Equilibrio: 96,
        Resistencia: 78,
        Actitud_Defensiva: 60,
        Recuperacion_Balon: 55,
        Agresividad: 48,
        // Atributos legacy
        Ritmo: 88,
        Tiro: 96,
        Pase: 92,
        Defensa_Legacy: 65,
        Fisico: 68,
        Portero_Legacy: 45
        },
        {
          ID: 'template-002',
          Nombre: 'Cristiano Ronaldo',
        // Atributos principales
        Ataque: 95,
        Defensa: 58,
        Velocidad: 89,
        Técnica: 84,
        Fuerza: 80,
        // Atributos específicos de portero
        Portería: 45,
        Agarre: 40,
        Reflejos: 42,
        Cobertura: 45,
        Actitud_Portero: 45,
        // Atributos avanzados
        Ataque_Ofensivo: 96,
        Control_Balon: 88,
        Dribbling: 86,
        Posesion_Balon: 84,
        Pase_Ras: 84,
        Pase_Bomb: 82,
        Finalizacion: 96,
        Cabeceador: 90,
        Balon_Parado: 86,
        Efecto: 88,
        Aceleracion: 90,
        Potencia_Tiro: 96,
        Salto: 96,
        Contacto_Fisico: 78,
        Equilibrio: 82,
        Resistencia: 82,
        Actitud_Defensiva: 55,
        Recuperacion_Balon: 52,
        Agresividad: 65,
        // Atributos legacy
        Ritmo: 89,
        Tiro: 95,
        Pase: 84,
        Defensa_Legacy: 58,
        Fisico: 80,
        Portero_Legacy: 45
        },
        {
          ID: 'template-005',
          Nombre: 'Manuel Neuer',
          // Atributos principales
          Ataque: 25,
          Defensa: 25,
          Velocidad: 58,
          Técnica: 90,
          Fuerza: 78,
          // Atributos específicos de portero
          Portería: 92,
          Agarre: 92,
          Reflejos: 94,
          Cobertura: 92,
          Actitud_Portero: 88,
          // Atributos avanzados
          Ataque_Ofensivo: 25,
          Control_Balon: 88,
          Dribbling: 55,
          Posesion_Balon: 85,
          Pase_Ras: 90,
          Pase_Bomb: 92,
          Finalizacion: 25,
          Cabeceador: 25,
          Balon_Parado: 15,
          Efecto: 15,
          Aceleracion: 58,
          Potencia_Tiro: 25,
          Salto: 78,
          Contacto_Fisico: 78,
          Equilibrio: 88,
          Resistencia: 60,
          Actitud_Defensiva: 25,
          Recuperacion_Balon: 25,
          Agresividad: 30,
          // Atributos legacy
          Ritmo: 58,
          Tiro: 25,
          Pase: 90,
          Defensa_Legacy: 25,
          Fisico: 78,
          Portero_Legacy: 92
        }
      ];

      const wsTemplateAttributes = XLSX.utils.json_to_sheet(templateAttributesData);
      const attributesColWidths = [
        { wch: 15 }, { wch: 25 }, // ID, Nombre
        { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 8 }, // Atributos principales
        { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 15 }, // Atributos portero
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 8 }, { wch: 15 }, { wch: 8 }, { wch: 15 }, { wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, // Atributos avanzados
        { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 15 }, { wch: 8 }, { wch: 15 } // Legacy
      ];
      wsTemplateAttributes['!cols'] = attributesColWidths;
      XLSX.utils.book_append_sheet(wb, wsTemplateAttributes, 'Atributos');

      // Hoja 3: Habilidades - EJEMPLOS
      const templateSkillsData: any[] = [
        {
          ID: 'template-001',
          Nombre: 'Lionel Messi',
          // Habilidades técnicas
          Tijera: 'Sí',
          Doble_Toque: 'Sí',
          Gambeta: 'Sí',
          Marsellesa: 'Sí',
          Sombrerito: 'Sí',
          Cortada: 'Sí',
          Amago_Por_Detras: 'Sí',
          Rebote_Interior: 'Sí',
          Pisar_Balon: 'Sí',
          Cabeceador: 'No',
          Cañonero: 'No',
          Sombrero: 'Sí',
          Tiro_Larga_Distancia: 'Sí',
          Tiro_Empeine: 'Sí',
          Disparo_Descendente: 'Sí',
          Disparo_Ascendente: 'Sí',
          Finalizacion_Acrobatica: 'Sí',
          Taconazo: 'Sí',
          Remate_Primer_Toque: 'Sí',
          Pase_Primer_Toque: 'Sí',
          Pase_Profundidad: 'Sí',
          Pase_Profundidad_2: 'Sí',
          Centro_Cruzado: 'Sí',
          Centro_Rosca: 'Sí',
          Rabona: 'Sí',
          Pase_Sin_Mirar: 'Sí',
          Pase_Bomb_Bajo: 'Sí',
          Patadon_Corto: 'No',
          Patadon_Largo: 'No',
          Saque_Largo_Banda: 'No',
          Saque_Meta_Largo: 'No',
          Especialista_Penales: 'Sí',
          Parapenales: 'No',
          Malicia: 'Sí',
          Marcar_Hombre: 'No',
          Delantero_Atrasado: 'No',
          Interceptor: 'No',
          Despeje_Acrobatico: 'No',
          Capitania: 'Sí',
          Super_Refuerzo: 'Sí',
          Espiritu_Lucha: 'Sí'
        },
        {
          ID: 'template-005',
          Nombre: 'Manuel Neuer',
          // Habilidades de portero
          Tijera: 'No',
          Doble_Toque: 'No',
          Gambeta: 'No',
          Marsellesa: 'No',
          Sombrerito: 'No',
          Cortada: 'No',
          Amago_Por_Detras: 'No',
          Rebote_Interior: 'No',
          Pisar_Balon: 'No',
          Cabeceador: 'No',
          Cañonero: 'No',
          Sombrero: 'No',
          Tiro_Larga_Distancia: 'No',
          Tiro_Empeine: 'No',
          Disparo_Descendente: 'No',
          Disparo_Ascendente: 'No',
          Finalizacion_Acrobatica: 'No',
          Taconazo: 'No',
          Remate_Primer_Toque: 'No',
          Pase_Primer_Toque: 'No',
          Pase_Profundidad: 'No',
          Pase_Profundidad_2: 'No',
          Centro_Cruzado: 'No',
          Centro_Rosca: 'No',
          Rabona: 'No',
          Pase_Sin_Mirar: 'No',
          Pase_Bomb_Bajo: 'Sí',
          Patadon_Corto: 'No',
          Patadon_Largo: 'Sí',
          Saque_Largo_Banda: 'Sí',
          Saque_Meta_Largo: 'Sí',
          Especialista_Penales: 'No',
          Parapenales: 'Sí',
          Malicia: 'Sí',
          Marcar_Hombre: 'No',
          Delantero_Atrasado: 'No',
          Interceptor: 'No',
          Despeje_Acrobatico: 'Sí',
          Capitania: 'Sí',
          Super_Refuerzo: 'No',
          Espiritu_Lucha: 'Sí'
        }
      ];

      const wsTemplateSkills = XLSX.utils.json_to_sheet(templateSkillsData);
      const skillsColWidths = Array(42).fill({ wch: 12 }); // 2 columnas iniciales + 40 habilidades
      skillsColWidths[0] = { wch: 15 }; // ID
      skillsColWidths[1] = { wch: 25 }; // Nombre
      wsTemplateSkills['!cols'] = skillsColWidths;
      XLSX.utils.book_append_sheet(wb, wsTemplateSkills, 'Habilidades');

      // Hoja 4: Estilos de juego - EJEMPLOS
      const templatePlayingStylesData: any[] = [
        {
          ID: 'template-001',
          Nombre: 'Lionel Messi',
          // Estilos ofensivos
          Cazagoles: 'Sí',
          Señuelo: 'Sí',
          Hombre_De_Area: 'No',
          Referente: 'No',
          Creador_De_Jugadas: 'Sí',
          Extremo_Prolifico: 'No',
          Extremo_Movil: 'Sí',
          Especialista_Centros: 'Sí',
          Jugador_Huecos: 'Sí',
          Omnipresente: 'No',
          El_Destructor: 'No',
          Organizador: 'No',
          Medio_Escudo: 'No',
          Lateral_Ofensivo: 'No',
          Lateral_Finalizador: 'No',
          Lateral_Defensivo: 'No',
          Creacion: 'Sí',
          Atacante_Extra: 'Sí',
          Portero_Ofensivo: 'No',
          Portero_Defensivo: 'No'
        },
        {
          ID: 'template-005',
          Nombre: 'Manuel Neuer',
          // Estilos de portero
          Cazagoles: 'No',
          Señuelo: 'No',
          Hombre_De_Area: 'No',
          Referente: 'No',
          Creador_De_Jugadas: 'No',
          Extremo_Prolifico: 'No',
          Extremo_Movil: 'No',
          Especialista_Centros: 'No',
          Jugador_Huecos: 'No',
          Omnipresente: 'No',
          El_Destructor: 'No',
          Organizador: 'No',
          Medio_Escudo: 'No',
          Lateral_Ofensivo: 'No',
          Lateral_Finalizador: 'No',
          Lateral_Defensivo: 'No',
          Creacion: 'No',
          Atacante_Extra: 'No',
          Portero_Ofensivo: 'Sí',
          Portero_Defensivo: 'No'
        }
      ];

      const wsTemplatePlayingStyles = XLSX.utils.json_to_sheet(templatePlayingStylesData);
      const playingStylesColWidths = Array(32).fill({ wch: 15 }); // 2 columnas iniciales + 30 estilos
      playingStylesColWidths[0] = { wch: 15 }; // ID
      playingStylesColWidths[1] = { wch: 25 }; // Nombre
      wsTemplatePlayingStyles['!cols'] = playingStylesColWidths;
      XLSX.utils.book_append_sheet(wb, wsTemplatePlayingStyles, 'Estilos_Juego');

      // Hoja 5: Instrucciones
      const instructionsData: any[] = [
        { Campo: 'IMPORTANTE', Instrucciones: 'Lee todas las instrucciones antes de modificar la plantilla' },
        { Campo: '', Instrucciones: '' },
        { Campo: 'ID', Instrucciones: 'Identificador único del jugador (obligatorio, sin espacios)' },
        { Campo: 'Nombre', Instrucciones: 'Nombre completo del jugador (máximo 100 caracteres)' },
        { Campo: 'Posición', Instrucciones: 'POR, DC, ED, EI, MDF, MCO, MC, LD, LI (obligatorio)' },
        { Campo: 'Media', Instrucciones: 'Valor general del jugador (1-99, obligatorio)' },
        { Campo: 'ID_Club', Instrucciones: 'ID único del club (ej: club1, club2) - tiene prioridad sobre el nombre' },
        { Campo: 'Club', Instrucciones: 'Nombre del club - usado como respaldo si ID_Club está vacío' },
        { Campo: 'Imagen', Instrucciones: 'Solo el nombre del archivo (ej: messi.jpg)' },
        { Campo: '', Instrucciones: '' },
             { Campo: 'ATRIBUTOS', Instrucciones: 'Valores del 40 al 99 (40 = mínimo, 99 = máximo)' },
        { Campo: 'Ataque', Instrucciones: 'Habilidad ofensiva general' },
        { Campo: 'Defensa', Instrucciones: 'Habilidad defensiva general' },
        { Campo: 'Velocidad', Instrucciones: 'Rapidez del jugador' },
        { Campo: 'Técnica', Instrucciones: 'Habilidad técnica general' },
        { Campo: 'Fuerza', Instrucciones: 'Fuerza física' },
        { Campo: 'Portería', Instrucciones: 'Solo para porteros - habilidad como portero' },
        { Campo: '', Instrucciones: '' },
        { Campo: 'HABILIDADES', Instrucciones: 'Solo "Sí" o "No" (case sensitive) - 39 habilidades' },
        { Campo: 'Tijera, Rabona', Instrucciones: 'Habilidades técnicas especiales' },
        { Campo: 'Cabeceador', Instrucciones: 'Especialista en jugadas aéreas' },
        { Campo: 'Cañonero', Instrucciones: 'Especialista en tiros lejanos' },
        { Campo: 'Capitania', Instrucciones: 'Líder natural del equipo' },
        { Campo: 'Parapenales', Instrucciones: 'Especialista en detener penales' },
        { Campo: '', Instrucciones: '' },
        { Campo: 'ESTILOS DE JUEGO', Instrucciones: 'Solo "Sí" o "No" (case sensitive) - 20 estilos' },
        { Campo: 'Cazagoles', Instrucciones: 'Delantero que juega de espaldas' },
        { Campo: 'Señuelo', Instrucciones: 'Distrae defensores para compañeros' },
        { Campo: 'Creador_De_Jugadas', Instrucciones: 'Organiza el juego del equipo' },
        { Campo: 'Omnipresente', Instrucciones: 'Corre toda la cancha' },
        { Campo: '', Instrucciones: '' },
        { Campo: 'IMPORTACIÓN', Instrucciones: 'El archivo debe tener exactamente estas 4 hojas' },
        { Campo: 'VALIDACIÓN', Instrucciones: 'Los IDs deben ser únicos y los clubs deben existir' },
        { Campo: 'REEMPLAZO', Instrucciones: 'La importación reemplaza TODOS los jugadores existentes' },
        { Campo: 'BACKUP', Instrucciones: 'Haz backup antes de importar datos importantes' }
      ];

      const wsInstructions = XLSX.utils.json_to_sheet(instructionsData);
      wsInstructions['!cols'] = [{ wch: 25 }, { wch: 60 }];
      XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instrucciones');

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `plantilla-importacion-jugadores.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      console.log('✅ Plantilla de importación descargada exitosamente');
      alert('¡Plantilla descargada! Revisa la hoja "Instrucciones" para saber cómo llenar los datos correctamente.');
    } catch (error) {
      console.error('❌ Error generando plantilla:', error);
      alert('Error al generar la plantilla. Revisa la consola para más detalles.');
    }
  };

  const handleExportPlayers = () => {
    try {
      console.log('Exporting players data to Excel...');

      // Función para truncar texto largo (límite de Excel: 32,767 caracteres)
      const truncateText = (text: string, maxLength: number = 1000) => {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
      };

      // Función para extraer solo el nombre del archivo de imagen
      const getImageFilename = (imageUrl: string) => {
        if (!imageUrl) return '';
        try {
          const url = new URL(imageUrl);
          const pathname = url.pathname;
          const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
          return filename || truncateText(imageUrl, 100);
        } catch {
          // Si no es una URL válida, truncar normalmente
          return truncateText(imageUrl, 100);
        }
      };

      // Convert players data to Excel format - Hoja principal con info básica
      const basicData = players.map(player => ({
        ID: player.id,
        Nombre: truncateText(player.name, 100),
        Edad: player.age,
        Posición: player.position,
        Media: player.overall,
        Valor: player.transferValue,
        Salario: player.contract?.salary || 0,
        ID_Club: player.clubId || '',
        Club: truncateText(getClubDisplayName(player.clubId || '', clubs), 50),
        Imagen: getImageFilename(player.image || ''),
        Altura: player.height || '',
        Peso: player.weight || '',
        Nacionalidad: truncateText(player.nationality || '', 50),
        Dorsal: player.dorsal || '',
        Resistencia_Lesiones: player.injuryResistance || 2,
        Partidos: player.matches || 0,
        Transferible: player.transferListed ? 'Sí' : 'No'
      }));

      // Hoja de atributos detallados
      const attributesData = players.map(player => ({
        ID: player.id,
        Nombre: player.name,
        // Atributos principales
        Ataque: player.attributes?.shooting || 1,
        Defensa: player.attributes?.defending || 1,
        Velocidad: player.attributes?.pace || 1,
        Técnica: player.attributes?.passing || 1,
        Fuerza: player.attributes?.physical || 1,
        // Atributos específicos de portero
        Portería: player.attributes?.goalkeeping || 1,
        Agarre: player.attributes?.catching || 1,
        Reflejos: player.attributes?.reflexes || 1,
        Cobertura: player.attributes?.coverage || 1,
        Actitud_Portero: player.attributes?.gkHandling || 1,
        // Atributos avanzados
        Ataque_Ofensivo: player.attributes?.offensiveAwareness || 1,
        Control_Balon: player.attributes?.ballControl || 1,
        Dribbling: player.attributes?.dribbling || 1,
        Posesion_Balon: player.attributes?.tightPossession || 1,
        Pase_Ras: player.attributes?.lowPass || 1,
        Pase_Bomb: player.attributes?.loftedPass || 1,
        Finalizacion: player.attributes?.finishing || 1,
        Cabeceador: player.attributes?.heading || 1,
        Balon_Parado: player.attributes?.setPieceTaking || 1,
        Efecto: player.attributes?.curl || 1,
        Aceleracion: player.attributes?.acceleration || 1,
        Potencia_Tiro: player.attributes?.kickingPower || 1,
        Salto: player.attributes?.jumping || 1,
        Contacto_Fisico: player.attributes?.physicalContact || 1,
        Equilibrio: player.attributes?.balance || 1,
        Resistencia: player.attributes?.stamina || 1,
        Actitud_Defensiva: player.attributes?.defensiveAwareness || 1,
        Recuperacion_Balon: player.attributes?.ballWinning || 1,
        Agresividad: player.attributes?.aggression || 1,
        // Atributos legacy
        Ritmo: player.attributes?.speed || 1,
        Tiro: player.attributes?.shooting || 1,
        Pase: player.attributes?.passing || 1,
        Defensa_Legacy: player.attributes?.defending || 1,
        Fisico: player.attributes?.physical || 1,
        Portero_Legacy: player.attributes?.goalkeeping || 1
      }));

      // Hoja de habilidades (skills)
      const skillsData = players.map(player => ({
        ID: player.id,
        Nombre: player.name,
        // Habilidades técnicas principales
        Aceleracion: player.skills?.acceleration ? 'Sí' : 'No',
        Agresion: player.skills?.aggression ? 'Sí' : 'No',
        Agarre: player.skills?.catching ? 'Sí' : 'No',
        Equilibrio: player.skills?.balance ? 'Sí' : 'No',
        Control_Balon: player.skills?.ballControl ? 'Sí' : 'No',
        Celebracion: player.skills?.celebration ? 'Sí' : 'No',
        Cobertura: player.skills?.coverage ? 'Sí' : 'No',
        Curl: player.skills?.curl ? 'Sí' : 'No',
        Actitud_Defensiva: player.skills?.defensiveAwareness ? 'Sí' : 'No',
        Dribbling: player.skills?.dribbling ? 'Sí' : 'No',
        Efecto: player.skills?.effect ? 'Sí' : 'No',
        Finalizacion: player.skills?.finishing ? 'Sí' : 'No',
        Actitud_Ofensiva: player.skills?.offensiveAwareness ? 'Sí' : 'No',
        Pie_Malo: player.skills?.outsideFootShot ? 'Sí' : 'No',
        Balon_Parado: player.skills?.penaltyKick ? 'Sí' : 'No',
        Posesion_Balon: player.skills?.possessionGame ? 'Sí' : 'No',
        Reflejos: player.skills?.reflexes ? 'Sí' : 'No',
        Salto: player.skills?.risingShots ? 'Sí' : 'No',
        Actitud_Portero: player.skills?.gkAwareness ? 'Sí' : 'No',
        // Más habilidades técnicas
        Primera_Intencion: player.skills?.firstTimeShot ? 'Sí' : 'No',
        Gol_Olimpico: player.skills?.flicking ? 'Sí' : 'No',
        Golero: player.skills?.gkeeperOneOnOne ? 'Sí' : 'No',
        Saque_Largo: player.skills?.gkeeperPK ? 'Sí' : 'No',
        Cabezazo: player.skills?.heading ? 'Sí' : 'No',
        Tiro_Libre: player.skills?.knuckleShot ? 'Sí' : 'No',
        Pase_Largo: player.skills?.longRangeShooting ? 'Sí' : 'No',
        Marcaje_Hombre: player.skills?.manMarking ? 'Sí' : 'No',
        Tiro_Medio: player.skills?.middleShooting ? 'Sí' : 'No',
        Tiro_Cerca: player.skills?.oneTouchPass ? 'Sí' : 'No',
        // Habilidades físicas y mentales
        Potencia_Tiro: player.skills?.overheadKick ? 'Sí' : 'No',
        Recuperacion: player.skills?.recovery ? 'Sí' : 'No',
        Resistencia: player.skills?.stamina ? 'Sí' : 'No',
        Pase_Bajo: player.skills?.weightedPass ? 'Sí' : 'No',
        // Habilidades especiales
        Arquitecto: player.skills?.architect ? 'Sí' : 'No',
        Artillero: player.skills?.artillery ? 'Sí' : 'No',
        Portero_BoxToBox: player.skills?.boxToBox ? 'Sí' : 'No',
        Portero_Capitan: player.skills?.captaincy ? 'Sí' : 'No',
        Portero_CrackShot: player.skills?.crackShot ? 'Sí' : 'No',
        Portero_Engine: player.skills?.engine ? 'Sí' : 'No',
        Portero_Fighter: player.skills?.fighter ? 'Sí' : 'No',
        Portero_Forecast: player.skills?.forecast ? 'Sí' : 'No',
        Portero_GKGlove: player.skills?.gkGlove ? 'Sí' : 'No',
        Portero_InjuryProne: player.skills?.injuryProne ? 'Sí' : 'No',
        Portero_InjuryRes: player.skills?.injuryRes ? 'Sí' : 'No',
        Portero_Leadership: player.skills?.leadership ? 'Sí' : 'No',
        Portero_LongThrow: player.skills?.longThrow ? 'Sí' : 'No',
        Portero_Playmaker: player.skills?.playmaker ? 'Sí' : 'No',
        Portero_Playstyle: player.skills?.playstyle ? 'Sí' : 'No'
      }));

      // Hoja de estilos de juego (playingStyles)
      const playingStylesData = players.map(player => ({
        ID: player.id,
        Nombre: player.name,
        // Estilos ofensivos
        Golero: player.playingStyles?.goalPoacher ? 'Sí' : 'No',
        Acelerado: player.playingStyles?.speedster ? 'Sí' : 'No',
        Falso_9: player.playingStyles?.falseNine ? 'Sí' : 'No',
        Ala_Ofensivo: player.playingStyles?.offensiveWinger ? 'Sí' : 'No',
        Segundo_Delantero: player.playingStyles?.secondStriker ? 'Sí' : 'No',
        // Estilos defensivos
        Balon_Al_Pie: player.playingStyles?.anchor ? 'Sí' : 'No',
        Carrilero: player.playingStyles?.fullback ? 'Sí' : 'No',
        Lateral_Ofensivo: player.playingStyles?.offensiveFullback ? 'Sí' : 'No',
        Carrilero_Balanceado: player.playingStyles?.balancedFullback ? 'Sí' : 'No',
        Carrilero_Defensivo: player.playingStyles?.defensiveFullback ? 'Sí' : 'No',
        Libre: player.playingStyles?.libero ? 'Sí' : 'No',
        // Estilos de mediocampo
        Mediocentro_Defensivo: player.playingStyles?.defensiveMidfielder ? 'Sí' : 'No',
        Mediocentro_Ofensivo: player.playingStyles?.offensiveMidfielder ? 'Sí' : 'No',
        Mediocentro_Equilibrado: player.playingStyles?.balancedMidfielder ? 'Sí' : 'No',
        Creador_De_Juego: player.playingStyles?.playmaker ? 'Sí' : 'No',
        Box_To_Box: player.playingStyles?.boxToBox ? 'Sí' : 'No',
        // Estilos especiales
        Falso_Lateral: player.playingStyles?.invertedWinger ? 'Sí' : 'No',
        Segundo_Lateral: player.playingStyles?.invertedFullback ? 'Sí' : 'No',
        Mediocentro_Interior: player.playingStyles?.insideForward ? 'Sí' : 'No',
        Trequartista: player.playingStyles?.trequartista ? 'Sí' : 'No',
        Mezzala: player.playingStyles?.mezzala ? 'Sí' : 'No',
        Regista: player.playingStyles?.regista ? 'Sí' : 'No',
        Carrilero_Invertido: player.playingStyles?.invertedWingback ? 'Sí' : 'No',
        Portero_Defensivo: player.playingStyles?.defensiveGoalkeeper ? 'Sí' : 'No',
        Portero_Ofensivo: player.playingStyles?.offensiveGoalkeeper ? 'Sí' : 'No',
        Portero_Equilibrado: player.playingStyles?.balancedGoalkeeper ? 'Sí' : 'No'
      }));

      // Create workbook with multiple sheets
      const wb = XLSX.utils.book_new();

      // Hoja 1: Información básica de jugadores
      const wsBasic = XLSX.utils.json_to_sheet(basicData);
      const basicColWidths = [
        { wch: 15 }, // ID
        { wch: 25 }, // Nombre
        { wch: 8 },  // Edad
        { wch: 12 }, // Posición
        { wch: 8 },  // Media
        { wch: 12 }, // Valor
        { wch: 12 }, // Salario
        { wch: 15 }, // ID_Club
        { wch: 20 }, // Club
        { wch: 15 }, // Imagen
        { wch: 10 }, // Altura
        { wch: 10 }, // Peso
        { wch: 15 }, // Nacionalidad
        { wch: 8 },  // Dorsal
        { wch: 18 }, // Resistencia_Lesiones
        { wch: 10 }, // Partidos
        { wch: 12 }  // Transferible
      ];
      wsBasic['!cols'] = basicColWidths;
      XLSX.utils.book_append_sheet(wb, wsBasic, 'Jugadores');

      // Hoja 2: Atributos detallados
      const wsAttributes = XLSX.utils.json_to_sheet(attributesData);
      const attributesColWidths = [
        { wch: 15 }, { wch: 25 }, // ID, Nombre
        { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 8 }, // Atributos principales
        { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 15 }, // Atributos portero
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 8 }, { wch: 15 }, { wch: 8 }, { wch: 15 }, { wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, // Atributos avanzados
        { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 15 }, { wch: 8 }, { wch: 15 } // Legacy
      ];
      wsAttributes['!cols'] = attributesColWidths;
      XLSX.utils.book_append_sheet(wb, wsAttributes, 'Atributos');

      // Hoja 3: Habilidades
      const wsSkills = XLSX.utils.json_to_sheet(skillsData);
      const skillsColWidths = Array(42).fill({ wch: 12 }); // 2 columnas iniciales + 40 habilidades
      skillsColWidths[0] = { wch: 15 }; // ID
      skillsColWidths[1] = { wch: 25 }; // Nombre
      wsSkills['!cols'] = skillsColWidths;
      XLSX.utils.book_append_sheet(wb, wsSkills, 'Habilidades');

      // Hoja 4: Estilos de juego
      const wsPlayingStyles = XLSX.utils.json_to_sheet(playingStylesData);
      const playingStylesColWidths = Array(32).fill({ wch: 15 }); // 2 columnas iniciales + 30 estilos
      playingStylesColWidths[0] = { wch: 15 }; // ID
      playingStylesColWidths[1] = { wch: 25 }; // Nombre
      wsPlayingStyles['!cols'] = playingStylesColWidths;
      XLSX.utils.book_append_sheet(wb, wsPlayingStyles, 'Estilos_Juego');

      // Hoja 5: Metadata
      const metadata = [
        { Propiedad: 'Versión', Valor: '2.0 - Atributos Completos' },
        { Propiedad: 'Fecha Exportación', Valor: new Date().toISOString() },
        { Propiedad: 'Total Jugadores', Valor: players.length },
        { Propiedad: 'Hojas Incluidas', Valor: 'Jugadores, Atributos, Habilidades, Estilos_Juego, Metadata' },
        { Propiedad: 'Aplicación', Valor: 'Virtual Zone' },
        { Propiedad: 'Notas', Valor: 'Exportación completa con todos los atributos, habilidades y estilos de juego' }
      ];
      const wsMeta = XLSX.utils.json_to_sheet(metadata);
      wsMeta['!cols'] = [{ wch: 25 }, { wch: 50 }];
      XLSX.utils.book_append_sheet(wb, wsMeta, 'Metadata');

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `virtual-zone-players-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);

      console.log(`✅ Exported ${players.length} players to Excel file`);
      alert(`¡Exportación completada! Se descargó el archivo Excel con ${players.length} jugadores.`);
    } catch (error) {
      console.error('❌ Error exporting players:', error);
      alert('Error al exportar los jugadores. Revisa la consola para más detalles.');
    }
  };

  const handleImportPlayers = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset file input
    event.target.value = '';

    // Validate file type
    const allowedExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedExtensions.includes(fileExtension)) {
      alert('Por favor selecciona un archivo Excel válido (.xlsx o .xls).');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 50MB permitido.');
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Check if workbook has the expected sheets
        const requiredSheets = ['Jugadores', 'Atributos', 'Habilidades', 'Estilos_Juego'];
        const missingSheets = requiredSheets.filter(sheet => !workbook.SheetNames.includes(sheet));

        if (missingSheets.length > 0) {
          throw new Error(`El archivo Excel no contiene las hojas requeridas: ${missingSheets.join(', ')}`);
        }

        // Read all required sheets
        const basicData = XLSX.utils.sheet_to_json(workbook.Sheets['Jugadores']);
        const attributesData = XLSX.utils.sheet_to_json(workbook.Sheets['Atributos']);
        const skillsData = XLSX.utils.sheet_to_json(workbook.Sheets['Habilidades']);
        const playingStylesData = XLSX.utils.sheet_to_json(workbook.Sheets['Estilos_Juego']);

        console.log('Excel sheets loaded:', {
          basic: basicData.length,
          attributes: attributesData.length,
          skills: skillsData.length,
          playingStyles: playingStylesData.length
        });

        // Convert Excel data back to complete player objects
        const importedPlayers = basicData.map((basicRow: any, index: number) => {
          try {
            const playerId = basicRow.ID;
            if (!playerId) {
              console.warn(`Player at index ${index} has no ID, skipping`);
              return null;
            }

            // Find corresponding data in other sheets by ID
            const attributesRow = attributesData.find((row: any) => row.ID === playerId);
            const skillsRow = skillsData.find((row: any) => row.ID === playerId);
            const playingStylesRow = playingStylesData.find((row: any) => row.ID === playerId);

            // Find club by ID first, then by name as fallback
            let club;
            if (basicRow.ID_Club && basicRow.ID_Club.trim() && basicRow.ID_Club.trim() !== 'undefined') {
              club = clubs.find(c => c.id === basicRow.ID_Club.trim());
              if (club) {
                console.log(`✅ Club encontrado por ID: ${basicRow.ID_Club} -> ${club.name}`);
              }
            }
            if (!club && basicRow.Club && basicRow.Club.trim() && basicRow.Club.trim() !== 'undefined') {
              club = clubs.find(c => c.name === basicRow.Club.trim());
              if (club) {
                console.log(`✅ Club encontrado por nombre: ${basicRow.Club} -> ${club.id}`);
              }
            }
            if (!club) {
              console.warn(`⚠️ Club no encontrado: ID_Club="${basicRow.ID_Club}", Club="${basicRow.Club}" - Jugador quedará sin club asignado`);
            }

            // Helper function to convert Sí/No to boolean
            const yesNoToBool = (value: any) => value === 'Sí' || value === 'YES' || value === true;

            // Reconstruct complete player object
            const player: any = {
              id: playerId,
              name: basicRow.Nombre || `Jugador ${index + 1}`,
              age: parseInt(basicRow.Edad) || 20,
              position: basicRow.Posición || 'DC',
              overall: parseInt(basicRow.Media) || 50,
              transferValue: parseInt(basicRow.Valor) || 0,
              clubId: club?.id || undefined,
              // Store original club data for potential recovery
              originalClubId: basicRow.ID_Club || undefined,
              originalClubName: basicRow.Club || undefined,
              image: basicRow.Imagen || undefined,
              height: basicRow.Altura ? parseInt(basicRow.Altura) : undefined,
              weight: basicRow.Peso ? parseInt(basicRow.Peso) : undefined,
              nationality: basicRow.Nacionalidad || 'Argentina',
              dorsal: basicRow.Dorsal ? parseInt(basicRow.Dorsal) : undefined,
              injuryResistance: parseInt(basicRow.Resistencia_Lesiones) || 2,
              matches: parseInt(basicRow.Partidos) || 0,
              transferListed: basicRow.Transferible === 'Sí',
              contract: {
                salary: parseInt(basicRow.Salario) || 0,
                expires: new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString()
              },
              // Complete attributes from attributes sheet (always provide basic attributes)
              attributes: {
                // Atributos principales
                shooting: (attributesRow && (parseInt(attributesRow.Tiro) || parseInt(attributesRow.Ataque))) || 40,
                defending: (attributesRow && (parseInt(attributesRow.Defensa_Legacy) || parseInt(attributesRow.Defensa))) || 40,
                pace: (attributesRow && (parseInt(attributesRow.Ritmo) || parseInt(attributesRow.Velocidad))) || 40,
                passing: (attributesRow && (parseInt(attributesRow.Pase) || parseInt(attributesRow.Técnica))) || 40,
                physical: (attributesRow && (parseInt(attributesRow.Fisico) || parseInt(attributesRow.Fuerza))) || 40,
                goalkeeping: (attributesRow && (parseInt(attributesRow.Portero_Legacy) || parseInt(attributesRow.Portería))) || 40,

                // Atributos avanzados
                offensiveAwareness: (attributesRow && parseInt(attributesRow.Ataque_Ofensivo)) || 40,
                ballControl: (attributesRow && parseInt(attributesRow.Control_Balon)) || 40,
                dribbling: (attributesRow && parseInt(attributesRow.Dribbling)) || 40,
                tightPossession: (attributesRow && parseInt(attributesRow.Posesion_Balon)) || 40,
                lowPass: (attributesRow && parseInt(attributesRow.Pase_Ras)) || 40,
                loftedPass: (attributesRow && parseInt(attributesRow.Pase_Bomb)) || 40,
                finishing: (attributesRow && parseInt(attributesRow.Finalizacion)) || 40,
                heading: (attributesRow && parseInt(attributesRow.Cabeceador)) || 40,
                setPieceTaking: (attributesRow && parseInt(attributesRow.Balon_Parado)) || 40,
                curl: (attributesRow && parseInt(attributesRow.Efecto)) || 40,
                speed: (attributesRow && (parseInt(attributesRow.Ritmo) || parseInt(attributesRow.Velocidad))) || 40,
                acceleration: (attributesRow && parseInt(attributesRow.Aceleracion)) || 40,
                kickingPower: (attributesRow && parseInt(attributesRow.Potencia_Tiro)) || 40,
                jumping: (attributesRow && parseInt(attributesRow.Salto)) || 40,
                physicalContact: (attributesRow && parseInt(attributesRow.Contacto_Fisico)) || 40,
                balance: (attributesRow && parseInt(attributesRow.Equilibrio)) || 40,
                stamina: (attributesRow && parseInt(attributesRow.Resistencia)) || 40,
                defensiveAwareness: (attributesRow && parseInt(attributesRow.Actitud_Defensiva)) || 40,
                ballWinning: (attributesRow && parseInt(attributesRow.Recuperacion_Balon)) || 40,
                aggression: (attributesRow && parseInt(attributesRow.Agresividad)) || 40,

                // Atributos específicos de portero
                catching: (attributesRow && parseInt(attributesRow.Agarre)) || 40,
                reflexes: (attributesRow && parseInt(attributesRow.Reflejos)) || 40,
                coverage: (attributesRow && parseInt(attributesRow.Cobertura)) || 40,
                gkHandling: (attributesRow && parseInt(attributesRow.Actitud_Portero)) || 40
              },

              // Complete skills from skills sheet (always provide basic skills)
              skills: {
                scissorKick: (skillsRow && yesNoToBool(skillsRow.Tijera)) || false,
                doubleTouch: (skillsRow && yesNoToBool(skillsRow.Doble_Toque)) || false,
                flipFlap: (skillsRow && yesNoToBool(skillsRow.Gambeta)) || false,
                marseilleTurn: (skillsRow && yesNoToBool(skillsRow.Marsellesa)) || false,
                rainbow: (skillsRow && yesNoToBool(skillsRow.Sombrerito)) || false,
                chopTurn: (skillsRow && yesNoToBool(skillsRow.Cortada)) || false,
                cutBehindAndTurn: (skillsRow && yesNoToBool(skillsRow.Amago_Por_Detras)) || false,
                scotchMove: (skillsRow && yesNoToBool(skillsRow.Rebote_Interior)) || false,
                stepOnSkillControl: (skillsRow && yesNoToBool(skillsRow.Pisar_Balon)) || false,
                heading: (skillsRow && yesNoToBool(skillsRow.Cabeceador)) || false,
                longRangeDrive: (skillsRow && yesNoToBool(skillsRow.Cañonero)) || false,
                chipShotControl: (skillsRow && yesNoToBool(skillsRow.Sombrero)) || false,
                longRanger: (skillsRow && yesNoToBool(skillsRow.Tiro_Larga_Distancia)) || false,
                knuckleShot: (skillsRow && yesNoToBool(skillsRow.Tiro_Empeine)) || false,
                dippingShot: (skillsRow && yesNoToBool(skillsRow.Disparo_Descendente)) || false,
                risingShot: (skillsRow && yesNoToBool(skillsRow.Disparo_Ascendente)) || false,
                acrobaticFinishing: (skillsRow && yesNoToBool(skillsRow.Finalizacion_Acrobatica)) || false,
                heelTrick: (skillsRow && yesNoToBool(skillsRow.Taconazo)) || false,
                firstTimeShot: (skillsRow && yesNoToBool(skillsRow.Remate_Primer_Toque)) || false,
                oneTouchPass: (skillsRow && yesNoToBool(skillsRow.Pase_Primer_Toque)) || false,
                throughPassing: (skillsRow && yesNoToBool(skillsRow.Pase_Profundidad)) || false,
                weightedPass: (skillsRow && yesNoToBool(skillsRow.Pase_Profundidad_2)) || false,
                pinpointCrossing: (skillsRow && yesNoToBool(skillsRow.Centro_Cruzado)) || false,
                outsideCurler: (skillsRow && yesNoToBool(skillsRow.Centro_Rosca)) || false,
                rabona: (skillsRow && yesNoToBool(skillsRow.Rabona)) || false,
                noLookPass: (skillsRow && yesNoToBool(skillsRow.Pase_Sin_Mirar)) || false,
                lowLoftedPass: (skillsRow && yesNoToBool(skillsRow.Pase_Bomb_Bajo)) || false,
                giantKill: (skillsRow && yesNoToBool(skillsRow.Patadon_Corto)) || false,
                longThrow: (skillsRow && yesNoToBool(skillsRow.Patadon_Largo)) || false,
                longThrow2: (skillsRow && yesNoToBool(skillsRow.Saque_Largo_Banda)) || false,
                gkLongThrow: (skillsRow && yesNoToBool(skillsRow.Saque_Meta_Largo)) || false,
                penaltySpecialist: (skillsRow && yesNoToBool(skillsRow.Especialista_Penales)) || false,
                gkPenaltySaver: (skillsRow && yesNoToBool(skillsRow.Parapenales)) || false,
                fightingSpirit: (skillsRow && yesNoToBool(skillsRow.Malicia)) || false,
                manMarking: (skillsRow && yesNoToBool(skillsRow.Marcar_Hombre)) || false,
                trackBack: (skillsRow && yesNoToBool(skillsRow.Delantero_Atrasado)) || false,
                interception: (skillsRow && yesNoToBool(skillsRow.Interceptor)) || false,
                acrobaticClear: (skillsRow && yesNoToBool(skillsRow.Despeje_Acrobatico)) || false,
                captaincy: (skillsRow && yesNoToBool(skillsRow.Capitania)) || false,
                superSub: (skillsRow && yesNoToBool(skillsRow.Super_Refuerzo)) || false,
                comPlayingStyles: (skillsRow && yesNoToBool(skillsRow.Espiritu_Lucha)) || false
              },

              // Complete playing styles from playingStyles sheet (always provide basic playing styles)
              playingStyles: {
                goalPoacher: (playingStylesRow && yesNoToBool(playingStylesRow.Cazagoles)) || false,
                dummyRunner: (playingStylesRow && yesNoToBool(playingStylesRow.Señuelo)) || false,
                foxInTheBox: (playingStylesRow && yesNoToBool(playingStylesRow.Hombre_De_Area)) || false,
                targetMan: (playingStylesRow && yesNoToBool(playingStylesRow.Referente)) || false,
                classicNo10: (playingStylesRow && yesNoToBool(playingStylesRow.Creador_De_Jugadas)) || false,
                prolificWinger: (playingStylesRow && yesNoToBool(playingStylesRow.Extremo_Prolifico)) || false,
                roamingFlank: (playingStylesRow && yesNoToBool(playingStylesRow.Extremo_Movil)) || false,
                crossSpecialist: (playingStylesRow && yesNoToBool(playingStylesRow.Especialista_Centros)) || false,
                holePlayer: (playingStylesRow && yesNoToBool(playingStylesRow.Jugador_Huecos)) || false,
                boxToBox: (playingStylesRow && yesNoToBool(playingStylesRow.Omnipresente)) || false,
                theDestroyer: (playingStylesRow && yesNoToBool(playingStylesRow.El_Destructor)) || false,
                orchestrator: (playingStylesRow && yesNoToBool(playingStylesRow.Organizador)) || false,
                anchor: (playingStylesRow && yesNoToBool(playingStylesRow.Medio_Escudo)) || false,
                offensiveFullback: (playingStylesRow && yesNoToBool(playingStylesRow.Lateral_Ofensivo)) || false,
                fullbackFinisher: (playingStylesRow && yesNoToBool(playingStylesRow.Lateral_Finalizador)) || false,
                defensiveFullback: (playingStylesRow && yesNoToBool(playingStylesRow.Lateral_Defensivo)) || false,
                buildUp: (playingStylesRow && yesNoToBool(playingStylesRow.Creacion)) || false,
                extraFrontman: (playingStylesRow && yesNoToBool(playingStylesRow.Atacante_Extra)) || false,
                offensiveGoalkeeper: (playingStylesRow && yesNoToBool(playingStylesRow.Portero_Ofensivo)) || false,
                defensiveGoalkeeper: (playingStylesRow && yesNoToBool(playingStylesRow.Portero_Defensivo)) || false
              }
            };

            return player;
          } catch (error) {
            console.warn(`Error converting player ${basicRow.ID || index}:`, error, basicRow);
            return null;
          }
        }).filter(player => player !== null);

        // Validate imported players
        const validPlayers = importedPlayers.filter((player: any) => {
          return player.id && player.name && player.position && typeof player.overall === 'number';
        });

        if (validPlayers.length === 0) {
          throw new Error('No se pudieron convertir jugadores válidos del archivo Excel.');
        }

        // Show confirmation dialog
        const confirmed = confirm(
          `¿Estás seguro de que quieres importar ${validPlayers.length} jugadores?\n\n` +
          `Esto reemplazará todos los jugadores existentes.\n\n` +
          `Archivo: ${file.name}\n` +
          `Filas procesadas: ${basicData.length}\n` +
          `Jugadores válidos: ${validPlayers.length}\n` +
          `Jugadores inválidos: ${importedPlayers.length - validPlayers.length}`
        );

        if (!confirmed) {
          console.log('❌ Importación cancelada por el usuario');
          return;
        }

        console.log(`📥 Importing ${validPlayers.length} players from Excel...`);

        // Save imported players to IndexedDB
        await updatePlayers(validPlayers);

        // Actualizar el estado local del componente inmediatamente
        await refreshPlayers({ skipSupabase: true });

        // Verificar que los datos se guardaron correctamente
        console.log('🔍 Verificando persistencia de datos importados...');
        const storedPlayers = await listPlayers();
        const importedWithClub = storedPlayers.filter(p => p.clubId).length;
        const playersWithoutClub = storedPlayers.filter(p => !p.clubId);

        console.log(`📊 Jugadores en BD: ${storedPlayers.length}, con club asignado: ${importedWithClub}`);
        console.log(`⚠️ Jugadores sin club asignado: ${playersWithoutClub.length}`);

        if (playersWithoutClub.length > 0) {
          console.log('🔍 Jugadores sin club asignado:');
          playersWithoutClub.slice(0, 5).forEach(p => {
            console.log(`   • ${p.name} (ID: ${p.id})`);
          });
          if (playersWithoutClub.length > 5) {
            console.log(`   ... y ${playersWithoutClub.length - 5} más`);
          }
        }

        console.log(`✅ Successfully imported ${validPlayers.length} players from Excel`);
        alert(`¡Importación completada! Se importaron ${validPlayers.length} jugadores desde Excel.\n\nJugadores con club asignado: ${importedWithClub}/${validPlayers.length}\n\n⚠️ IMPORTANTE: Verifica en la consola que no hay errores antes de recargar la página.`);

      } catch (error) {
        console.error('❌ Error importing players from Excel:', error);
        alert(`Error al importar los jugadores desde Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    };

    reader.onerror = () => {
      console.error('❌ Error reading Excel file');
      alert('Error al leer el archivo Excel. Inténtalo de nuevo.');
    };

    reader.readAsArrayBuffer(file);
  };

  const handleReplaceSupabasePlayers = async () => {
    if (!config.useSupabase) {
      alert('Supabase no está habilitado en esta instancia.');
      return;
    }

    if (!players || players.length === 0) {
      alert('No hay jugadores en memoria para sincronizar.');
      return;
    }

    const confirmed = confirm(
      '⚠️ Esta acción eliminará TODOS los jugadores en Supabase y subirá el lote actual importado.\n\n' +
      '¿Deseas continuar?'
    );

    if (!confirmed) {
      return;
    }

    setIsReplacingSupabase(true);
    try {
      await replaceSupabasePlayers(players);
      alert(`Supabase actualizado con ${players.length} jugadores.`);
    } catch (error) {
      console.error('Error reemplazando jugadores en Supabase:', error);
      alert('Error al sincronizar con Supabase. Revisa la consola para más detalles.');
    } finally {
      setIsReplacingSupabase(false);
    }
  };

  const handleUpdateAllToTransferListed = async () => {
    try {
    console.log('Updating all players to transfer listed...');

    // Update all players to transfer listed
      const updatedPlayers = await updateAllPlayersToTransferListed();

    // Update dataStore with updated players
    updatePlayers(updatedPlayers);

    // Show success message
    alert(`¡Todos los jugadores actualizados! ${updatedPlayers.length} jugadores ahora están en la lista de transferibles.`);
    } catch (error) {
      console.error('Error updating players to transfer listed:', error);
      alert('Error al actualizar los jugadores a transferibles.');
    }
  };

  const handleAdjustSalaries = () => {
    console.log('Adjusting all player salaries according to market tables...');

    // Adjust all player salaries
    const result = adjustAllPlayerSalaries();

    if (result.updated > 0) {
      alert(`¡Salarios ajustados! ${result.updated} jugadores actualizados según las tablas de mercado.\nCosto total anual: $${(result.totalCost / 1_000_000).toFixed(1)}M`);
    } else {
      alert('Los salarios ya están actualizados según las tablas de mercado.');
    }

    // Close confirmation modal
    setShowSalaryConfirm(false);
  };

  const handleAdjustMarketValues = () => {
    console.log('Adjusting all player market values according to market tables...');

    // Adjust all player market values
    const result = adjustAllPlayerMarketValues();

    if (result.updated > 0) {
      alert(`¡Valores de mercado ajustados! ${result.updated} jugadores actualizados según las tablas de mercado.\nValor total de mercado: $${(result.totalValue / 1_000_000).toFixed(1)}M`);
    } else {
      alert('Los valores de mercado ya están actualizados según las tablas de mercado.');
    }

    // Close confirmation modal
    setShowMarketValueConfirm(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Gestión de Jugadores</h2>

        {/* Search and Actions Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Buscar por nombre o nacionalidad..."
                className="input pl-10 w-full"
              />
              {searchText && (
                <button
                  onClick={() => setSearchText('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              className={`btn-outline flex items-center ${showAdvancedFilters ? 'bg-primary text-white' : ''}`}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter size={16} className="mr-2" />
              Filtros
              {hasActiveFilters && (
                  <span className="ml-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                  {[
                    searchText ? 1 : 0,
                    selectedPosition ? 1 : 0,
                    selectedClub ? 1 : 0,
                    selectedNationality ? 1 : 0,
                    transferFilter ? 1 : 0,
                    ((overallRange.min && !isNaN(parseInt(overallRange.min))) || (overallRange.max && !isNaN(parseInt(overallRange.max)))) ? 1 : 0,
                    ((ageRange.min && !isNaN(parseInt(ageRange.min))) || (ageRange.max && !isNaN(parseInt(ageRange.max)))) ? 1 : 0,
                    (sortBy !== 'overall' || sortDir !== 'desc') ? 1 : 0,
                    (perPage !== 20) ? 1 : 0
                  ].reduce((a, b) => a + b, 0)}
                </span>
              )}
            </button>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                className="btn-outline text-red-400 hover:text-red-300 border-red-400 hover:border-red-300"
                onClick={resetFilters}
              >
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              className="btn-outline text-green-400 hover:text-green-300 border-green-400 hover:border-green-300 flex items-center"
              onClick={handleUpdateAllToTransferListed}
              title="Actualizar todos los jugadores para que estén en la lista de transferibles"
            >
              <Users size={16} className="mr-2" />
              Transfer List All
            </button>
            <button
              className="btn-outline text-emerald-400 hover:text-emerald-300 border-emerald-400 hover:border-emerald-300 flex items-center"
              onClick={() => setShowSalaryConfirm(true)}
              title="Ajustar salarios de todos los jugadores según las tablas de mercado"
            >
              <DollarSign size={16} className="mr-2" />
              Ajustar Salarios
            </button>
            <button
              className="btn-outline text-cyan-400 hover:text-cyan-300 border-cyan-400 hover:border-cyan-300 flex items-center"
              onClick={() => setShowMarketValueConfirm(true)}
              title="Ajustar valores de mercado de todos los jugadores según las tablas de mercado"
            >
              <DollarSign size={16} className="mr-2" />
              Ajustar Valores
            </button>
            <button
              className="btn-outline text-blue-400 hover:text-blue-300 border-blue-400 hover:border-blue-300 flex items-center"
              onClick={handleDownloadTemplate}
              title="Descargar plantilla Excel vacía con ejemplos para importar jugadores"
            >
              <FileText size={16} className="mr-2" />
              Plantilla Excel
            </button>
            <button
              className="btn-outline text-purple-400 hover:text-purple-300 border-purple-400 hover:border-purple-300 flex items-center"
              onClick={handleExportPlayers}
              title="Exportar todos los jugadores a un archivo Excel (.xlsx) con 5 hojas: Jugadores, Atributos, Habilidades, Estilos_Juego, Metadata"
            >
              <Download size={16} className="mr-2" />
              Exportar Excel
            </button>
            <div className="relative">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportPlayers}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="players-import-input"
              />
              <button
                className="btn-outline text-blue-400 hover:text-blue-300 border-blue-400 hover:border-blue-300 flex items-center"
                title="Importar jugadores desde un archivo Excel (.xlsx) - reemplaza todos los datos existentes"
              >
                <Upload size={16} className="mr-2" />
                Importar Excel
              </button>
            </div>
            <button
              className={`btn-outline text-orange-400 hover:text-orange-300 border-orange-400 hover:border-orange-300 flex items-center ${isReplacingSupabase ? 'opacity-60 cursor-not-allowed' : ''}`}
              onClick={handleReplaceSupabasePlayers}
              disabled={isReplacingSupabase}
              title="Elimina todos los jugadores en Supabase y sube el lote actualmente importado"
            >
              <Database size={16} className="mr-2" />
              {isReplacingSupabase ? 'Sincronizando...' : 'Reemplazar en Supabase'}
            </button>
            <button className="btn-primary flex items-center" onClick={() => setShowNewPlayer(true)}>
              <Plus size={16} className="mr-2" />
              Nuevo jugador
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-4 p-4 bg-dark-light rounded-lg border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Position Filter */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Posición</label>
                <select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Todas las posiciones</option>
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              {/* Club Filter */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Club</label>
                <select
                  value={selectedClub}
                  onChange={(e) => setSelectedClub(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Todos los clubes</option>
                  <option value="libre">Libre</option>
                  {clubs.map(club => (
                    <option key={club.id} value={club.id}>{club.name}</option>
                  ))}
                </select>
              </div>

              {/* Nationality Filter */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nacionalidad</label>
                <select
                  value={selectedNationality}
                  onChange={(e) => setSelectedNationality(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Todas</option>
                  {uniqueNationalities.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              {/* Transfer Listed Filter */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Estado de Transferible</label>
                <select
                  value={transferFilter}
                  onChange={(e) => setTransferFilter(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Todos</option>
                  <option value="listed">En lista de transferibles</option>
                  <option value="unlisted">No transferibles</option>
                </select>
              </div>

              {/* Overall Range */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Media (Overall)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={overallRange.min}
                    onChange={(e) => setOverallRange(prev => ({ ...prev, min: e.target.value }))}
                    placeholder="Min"
                    className="input w-full"
                    min="1"
                    max="101"
                  />
                  <input
                    type="number"
                    value={overallRange.max}
                    onChange={(e) => setOverallRange(prev => ({ ...prev, max: e.target.value }))}
                    placeholder="Max"
                    className="input w-full"
                    min="1"
                    max="101"
                  />
                </div>
              </div>

              {/* Age Range */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Edad</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={ageRange.min}
                    onChange={(e) => setAgeRange(prev => ({ ...prev, min: e.target.value }))}
                    placeholder="Min"
                    className="input w-full"
                    min="12"
                    max="60"
                  />
                  <input
                    type="number"
                    value={ageRange.max}
                    onChange={(e) => setAgeRange(prev => ({ ...prev, max: e.target.value }))}
                    placeholder="Max"
                    className="input w-full"
                    min="12"
                    max="60"
                  />
                </div>
              </div>
            </div>

            {/* Sorting and Per Page */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value as any); setPage(1); }}
                  className="input w-full"
                >
                  <option value="overall">Media (Overall)</option>
                  <option value="age">Edad</option>
                  <option value="name">Nombre</option>
                  <option value="position">Posición</option>
                  <option value="club">Club</option>
                  <option value="value">Valor de mercado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Dirección</label>
                <select
                  value={sortDir}
                  onChange={(e) => { setSortDir(e.target.value as any); setPage(1); }}
                  className="input w-full"
                >
                  <option value="desc">Descendente</option>
                  <option value="asc">Ascendente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Resultados por página</label>
                <select
                  value={perPage}
                  onChange={(e) => { setPerPage(parseInt(e.target.value, 10)); setPage(1); }}
                  className="input w-full"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
        <div>
          {hasActiveFilters ? (
            <span>
              Mostrando <strong className="text-white">{filtered.length}</strong> jugadores filtrados de <strong className="text-white">{players.length}</strong> totales
            </span>
          ) : (
            <span>Mostrando <strong className="text-white">{filtered.length}</strong> jugadores</span>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            {searchText && (
              <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">
                Búsqueda: "{searchText}"
              </span>
            )}
            {selectedPosition && (
              <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                Posición: {selectedPosition}
              </span>
            )}
            {selectedClub && (
              <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
                Club: {clubs.find(c => c.id === selectedClub)?.name}
              </span>
            )}
            {selectedNationality && (
              <span className="bg-teal-500/20 text-teal-400 px-2 py-1 rounded text-xs">
                Nacionalidad: {selectedNationality}
              </span>
            )}
            {transferFilter && (
              <span className="bg-pink-500/20 text-pink-400 px-2 py-1 rounded text-xs">
                {transferFilter === 'listed' ? 'Solo transferibles' : 'No transferibles'}
              </span>
            )}
            {((overallRange.min && !isNaN(parseInt(overallRange.min))) || (overallRange.max && !isNaN(parseInt(overallRange.max)))) && (
              <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs">
                Media: {overallRange.min || '0'} - {overallRange.max || '101'}
              </span>
            )}
            {((ageRange.min && !isNaN(parseInt(ageRange.min))) || (ageRange.max && !isNaN(parseInt(ageRange.max)))) && (
              <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">
                Edad: {ageRange.min || '12'} - {ageRange.max || '60'}
              </span>
            )}
            {(sortBy !== 'overall' || sortDir !== 'desc') && (
              <span className="bg-gray-500/20 text-gray-300 px-2 py-1 rounded text-xs">
                Orden: {sortBy} {sortDir === 'asc' ? '▲' : '▼'}
              </span>
            )}
            {(perPage !== 20) && (
              <span className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded text-xs">
                Por página: {perPage}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                <th className="px-4 py-3 text-left">Jugador</th>
                <th className="px-4 py-3 text-center">Pos</th>
                <th className="px-4 py-3 text-center">Club</th>
                <th className="px-4 py-3 text-center">Media</th>
                <th className="px-4 py-3 text-center">Edad</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                    {hasActiveFilters ? 'No se encontraron jugadores con los filtros aplicados.' : 'No hay jugadores.'}
                  </td>
                </tr>
              ) : pageItems.map((player: any) => (
                <tr key={player.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-3 bg-dark-lighter flex items-center justify-center">
                        <img
                          src={player.image || '/default.png'}
                          alt={player.name}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/default.png';
                          }}
                        />
                      </div>
                      <div>
                        <div className="font-medium">{player.name}</div>
                        <div className="text-xs text-gray-400">{player.nationality}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPositionColor(player.position)}`}>
                        {getTranslatedPosition(player.position)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {getClubDisplayName(player.clubId || '', clubs)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getOverallColor(player.overall)}`}>
                      {player.overall}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{player.age}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button className="p-1 text-gray-400 hover:text-primary" onClick={() => setEditingPlayer(player)}>
                        <Edit size={16} />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-500" onClick={() => setDeletePlayerTarget(player)}>
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody></table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400 mt-3">
        <button className="px-3 py-1 rounded bg-dark-lighter hover:bg-dark disabled:opacity-50" onClick={() => { prev(); setPage((p) => Math.max(1, p - 1)); }} disabled={page <= 1}>Anterior</button>
        <span>Pagina {page} de {totalPages}</span>
        <button className="px-3 py-1 rounded bg-dark-lighter hover:bg-dark disabled:opacity-50" onClick={() => { next(); setPage((p) => Math.min(totalPages, p + 1)); }} disabled={page >= totalPages}>Siguiente</button>
      </div>

      {showNewPlayer && (
        <NewPlayerModal onClose={() => setShowNewPlayer(false)} onCreate={handleCreatePlayer} clubs={clubs.map((c: any) => ({ id: c.id, name: c.name }))} />
      )}
      {editingPlayer && (
        <EditPlayerModal
          player={editingPlayer}
          clubs={clubs.map((c: any) => ({ id: c.id, name: c.name }))}
          onClose={() => setEditingPlayer(null)}
          onSave={handleSavePlayer}
        />
      )}
      {deletePlayerTarget && (
        <ConfirmDeleteModal user={{ id: deletePlayerTarget.id, username: deletePlayerTarget.name }} onCancel={() => setDeletePlayerTarget(null)} onConfirm={handleDeletePlayerInner} label="jugador" />
      )}


      {/* Salary Adjustment Confirmation Modal */}
      {showSalaryConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowSalaryConfirm(false)}></div>
          <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold flex items-center">
                <DollarSign size={20} className="mr-2 text-emerald-400" />
                Ajustar Salarios
              </h3>
              <button onClick={() => setShowSalaryConfirm(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-300 mb-4">
                  ¿Estás seguro de que quieres ajustar los salarios de <strong className="text-white">{players.length} jugadores</strong> según las tablas de mercado?
                </p>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-4">
                  <p className="text-orange-400 text-sm">
                    ⚠️ <strong>ATENCIÓN: Esta acción ajustará TODOS los salarios</strong>
                  </p>
                  <ul className="text-orange-300 text-sm mt-2 list-disc list-inside">
                    <li>Sobrescribirá cualquier salario editado manualmente</li>
                    <li>Ajustará TODOS los salarios según la valoración del jugador</li>
                    <li>Usará los valores de las Tablas de Mercado oficiales</li>
                    <li>Se aplicará a <strong>todos los jugadores del sistema</strong></li>
                    <li>Los cambios serán inmediatos e irreversibles</li>
                  </ul>
                </div>
                <p className="text-gray-400 text-sm">
                  ⚠️ <strong>Los salarios editados manualmente serán sobrescritos.</strong> Los salarios se actualizarán según la tabla oficial de mercado para la temporada 2025.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  className="btn-outline"
                  onClick={() => setShowSalaryConfirm(false)}
                >
                  Cancelar
                </button>
                <button
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                  onClick={handleAdjustSalaries}
                >
                  <DollarSign size={16} className="mr-2" />
                  Ajustar Salarios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Market Value Adjustment Confirmation Modal */}
      {showMarketValueConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowMarketValueConfirm(false)}></div>
          <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold flex items-center">
                <DollarSign size={20} className="mr-2 text-cyan-400" />
                Ajustar Valores de Mercado
              </h3>
              <button onClick={() => setShowMarketValueConfirm(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-300 mb-4">
                  ¿Estás seguro de que quieres ajustar los valores de mercado de <strong className="text-white">{players.length} jugadores</strong> según las tablas de mercado?
                </p>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                  <p className="text-red-400 text-sm">
                    ⚠️ <strong>ATENCIÓN: Esta acción ajustará TODOS los valores de mercado</strong>
                  </p>
                  <ul className="text-red-300 text-sm mt-2 list-disc list-inside">
                    <li>Sobrescribirá cualquier valor de mercado editado manualmente</li>
                    <li>Ajustará TODOS los valores según la valoración del jugador</li>
                    <li>Usará los valores de las Tablas de Mercado oficiales</li>
                    <li>Se aplicará a <strong>todos los jugadores del sistema</strong></li>
                    <li>Los cambios serán inmediatos e irreversibles</li>
                  </ul>
                </div>
                <p className="text-gray-400 text-sm">
                  ⚠️ <strong>Los valores de mercado editados manualmente serán sobrescritos.</strong> Los valores se actualizarán según la tabla oficial de mercado para la temporada 2025.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  className="btn-outline"
                  onClick={() => setShowMarketValueConfirm(false)}
                >
                  Cancelar
                </button>
                <button
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                  onClick={handleAdjustMarketValues}
                >
                  <DollarSign size={16} className="mr-2" />
                  Ajustar Valores
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Test function to validate filter functionality (can be removed in production)
export const validateFilters = (players: any[], filters: any) => {
  const {
    searchText,
    selectedPosition,
    selectedClub,
    selectedNationality,
    transferFilter,
    overallRange,
    ageRange
  } = filters;

  let filtered = [...players];

  // Test text search
  if (searchText) {
    const query = searchText.toLowerCase();
    filtered = filtered.filter(p =>
      (p.name?.toLowerCase().includes(query) || false) ||
      (p.nationality?.toLowerCase().includes(query) || false)
    );
  }

  // Test position filter
  if (selectedPosition) {
    filtered = filtered.filter(p => p.position === selectedPosition);
  }

  // Test club filter
  if (selectedClub) {
    filtered = filtered.filter(p => p.clubId === selectedClub);
  }

  // Test nationality filter
  if (selectedNationality) {
    filtered = filtered.filter(p => p.nationality === selectedNationality);
  }

  // Test transfer filter
  if (transferFilter === 'listed') {
    filtered = filtered.filter(p => p.transferListed === true);
  } else if (transferFilter === 'unlisted') {
    filtered = filtered.filter(p => p.transferListed === false || p.transferListed === undefined);
  }

  // Test overall range
  if (overallRange.min && !isNaN(parseInt(overallRange.min))) {
    const minOverall = parseInt(overallRange.min);
    filtered = filtered.filter(p => (p.overall ?? 0) >= minOverall);
  }
  if (overallRange.max && !isNaN(parseInt(overallRange.max))) {
    const maxOverall = parseInt(overallRange.max);
    filtered = filtered.filter(p => (p.overall ?? 0) <= maxOverall);
  }

  // Test age range
  if (ageRange.min && !isNaN(parseInt(ageRange.min))) {
    const minAge = parseInt(ageRange.min);
    filtered = filtered.filter(p => (p.age ?? 0) >= minAge);
  }
  if (ageRange.max && !isNaN(parseInt(ageRange.max))) {
    const maxAge = parseInt(ageRange.max);
    filtered = filtered.filter(p => (p.age ?? 0) <= maxAge);
  }

  return filtered;
};

export default AdminPlayers;

// Helper functions
const getPositionColor = (position: string) => {
  // Convert translated positions back to English for color logic
  const englishPosition = position === 'PT' ? 'GK' :
                         position === 'DEC' ? 'CB' :
                         position === 'LI' ? 'LB' :
                         position === 'LD' ? 'RB' :
                         position === 'MCD' ? 'CDM' :
                         position === 'MC' ? 'CM' :
                         position === 'MO' ? 'CAM' :
                         position === 'MDI' ? 'LM' :
                         position === 'MDD' ? 'RM' :
                         position === 'EXI' ? 'LW' :
                         position === 'EXD' ? 'RW' :
                         position === 'CD' ? 'ST' :
                         position === 'SD' ? 'ST' : position;

  switch (englishPosition) {
    case 'GK': return 'bg-yellow-500/20 text-yellow-500';
    case 'CB':
    case 'LB':
    case 'RB': return 'bg-blue-500/20 text-blue-400';
    case 'CDM':
    case 'CM':
    case 'CAM':
    case 'LM':
    case 'RM': return 'bg-green-500/20 text-green-500';
    case 'LW':
    case 'RW':
    case 'ST': return 'bg-red-500/20 text-red-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
};

const getOverallColor = (overall: number) => {
  if (overall >= 85) return 'bg-green-500/20 text-green-500';
  if (overall >= 80) return 'bg-blue-500/20 text-blue-400';
  if (overall >= 75) return 'bg-yellow-500/20 text-yellow-500';
  return 'bg-gray-500/20 text-gray-400';
};


