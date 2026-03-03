import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Edit, Plus, Trash, Search, Filter, X, Users, DollarSign, Database, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  createPlayer,
  updatePlayer,
  deletePlayer,
  updateAllPlayersToTransferListed,
  replaceSupabasePlayers
} from '../../utils/playerService';
import { adjustAllPlayerMarketValues, adjustAllPlayerSalaries } from '../../utils/marketRules';
import NewPlayerModal from '../../components/admin/NewPlayerModal';
import EditPlayerModal from '../../components/admin/EditPlayerModal';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { useDataStore } from '../../store/dataStore';
import { usePagination } from '../../hooks/usePagination';
import { getTranslatedPosition, getClubDisplayName } from '../../utils/helpers';
import { config } from '../../lib/config';
import type { PlayerAttributes, PlayerSkills, PlayingStyles } from '../../types';

type ToastType = 'success' | 'error' | 'info';

const Toast = ({ type, message, onClose }: { type: ToastType; message: string; onClose: () => void }) => {
  const tones: Record<ToastType, string> = {
    success: 'border-emerald-400/70 bg-emerald-950/95 text-emerald-100',
    error: 'border-red-400/70 bg-red-950/95 text-red-100',
    info: 'border-cyan-400/70 bg-cyan-950/95 text-cyan-100'
  };
  const labels: Record<ToastType, string> = { success: 'Listo', error: 'Error', info: 'Info' };
  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm border rounded-lg px-4 py-3 shadow-2xl backdrop-blur-sm ${tones[type]}`}>
      <div className="text-xs uppercase tracking-wide mb-1 opacity-80">{labels[type]}</div>
      <div className="text-sm whitespace-pre-line">{message}</div>
      <button className="mt-2 text-xs text-gray-300 hover:text-white" onClick={onClose}>
        Cerrar
      </button>
    </div>
  );
};

const SummaryBadge = ({ label, value, helper }: { label: string; value: string; helper?: string }) => (
  <div className="px-3 py-2 rounded border border-gray-700 bg-gray-900 text-sm text-gray-300">
    <div className="text-xs text-gray-500">{label}</div>
    <div className="font-semibold text-white">{value}</div>
    {helper && <div className="text-[11px] text-gray-500 mt-0.5">{helper}</div>}
  </div>
);

const ActionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="card p-4">
    <div className="text-sm font-semibold text-white mb-2">{title}</div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{children}</div>
  </div>
);

const DEFAULT_PLAYER_ATTRIBUTES: PlayerAttributes = {
  offensiveAwareness: 70, ballControl: 70, dribbling: 70, tightPossession: 70,
  lowPass: 70, loftedPass: 70, finishing: 70, heading: 70, setPieceTaking: 70,
  curl: 70, speed: 70, acceleration: 70, kickingPower: 70, jumping: 70,
  physicalContact: 70, balance: 70, stamina: 70, defensiveAwareness: 70,
  ballWinning: 70, aggression: 70, goalkeeping: 70, catching: 70, reflexes: 70,
  coverage: 70, gkHandling: 70, weakFootUsage: 2, weakFootAccuracy: 2, form: 3,
  pace: 70, shooting: 70, passing: 70, defending: 70, physical: 70
};

const ATTRIBUTE_KEYS = Object.keys(DEFAULT_PLAYER_ATTRIBUTES) as Array<keyof PlayerAttributes>;
const DEFAULT_PLAYER_SKILLS: PlayerSkills = {
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
};
const DEFAULT_PLAYING_STYLES: PlayingStyles = {
  goalPoacher: false, dummyRunner: false, foxInTheBox: false, targetMan: false,
  classicNo10: false, prolificWinger: false, roamingFlank: false, crossSpecialist: false,
  holePlayer: false, boxToBox: false, theDestroyer: false, orchestrator: false,
  anchor: false, offensiveFullback: false, fullbackFinisher: false, defensiveFullback: false,
  buildUp: false, extraFrontman: false, offensiveGoalkeeper: false, defensiveGoalkeeper: false
};

const parseNumberCell = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const parseBooleanCell = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return ['si', 'sí', 'yes', 'true', '1'].includes(normalized);
  }
  return false;
};

const AdminPlayers = () => {
  const { players, clubs, updatePlayers, refreshPlayers } = useDataStore();
  const [searchParams] = useSearchParams();

  const [showNewPlayer, setShowNewPlayer] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any | null>(null);
  const [deletePlayerTarget, setDeletePlayerTarget] = useState<any | null>(null);
  const [toast, setToast] = useState<null | { type: ToastType; text: string }>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const [searchText, setSearchText] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedClub, setSelectedClub] = useState('');
  const [selectedNationality, setSelectedNationality] = useState('');
  const [transferFilter, setTransferFilter] = useState('');
  const [overallRange, setOverallRange] = useState({ min: '', max: '' });
  const [ageRange, setAgeRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState<'overall' | 'age' | 'name' | 'position' | 'club' | 'value'>('overall');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [perPage, setPerPage] = useState(20);
  const [page, setPage] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSalaryConfirm, setShowSalaryConfirm] = useState(false);
  const [showMarketValueConfirm, setShowMarketValueConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (players.length === 0) {
      refreshPlayers();
    }
  }, [players.length, refreshPlayers]);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowNewPlayer(true);
    }
  }, [searchParams]);

  const positions = ['PT', 'DEC', 'LI', 'LD', 'MCD', 'MC', 'MO', 'MDI', 'MDD', 'EXI', 'EXD', 'CD', 'SD'];

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

  const hasActiveFilters =
    searchText ||
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
    (players || []).forEach(p => {
      if (p.nationality) set.add(p.nationality);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [players]);

  const filtered = useMemo(() => {
    let filteredPlayers = players || [];

    if (searchText) {
      const q = searchText.toLowerCase();
      filteredPlayers = filteredPlayers.filter(p => (p.name || '').toLowerCase().includes(q));
    }

    if (selectedPosition) {
      filteredPlayers = filteredPlayers.filter(p => p.position === selectedPosition);
    }

    if (selectedClub) {
      filteredPlayers =
        selectedClub === 'libre'
          ? filteredPlayers.filter(p => p.clubId === 'libre')
          : filteredPlayers.filter(p => p.clubId === selectedClub);
    }

    if (selectedNationality) {
      filteredPlayers = filteredPlayers.filter(p => p.nationality === selectedNationality);
    }

    if (transferFilter === 'listed') {
      filteredPlayers = filteredPlayers.filter(p => p.transferListed === true);
    } else if (transferFilter === 'unlisted') {
      filteredPlayers = filteredPlayers.filter(p => p.transferListed === false || p.transferListed === undefined);
    }

    if (overallRange.min && !isNaN(parseInt(overallRange.min))) {
      const min = parseInt(overallRange.min);
      filteredPlayers = filteredPlayers.filter(p => (p.overall ?? 0) >= min);
    }
    if (overallRange.max && !isNaN(parseInt(overallRange.max))) {
      const max = parseInt(overallRange.max);
      filteredPlayers = filteredPlayers.filter(p => (p.overall ?? 0) <= max);
    }

    if (ageRange.min && !isNaN(parseInt(ageRange.min))) {
      const min = parseInt(ageRange.min);
      filteredPlayers = filteredPlayers.filter(p => (p.age ?? 0) >= min);
    }
    if (ageRange.max && !isNaN(parseInt(ageRange.max))) {
      const max = parseInt(ageRange.max);
      filteredPlayers = filteredPlayers.filter(p => (p.age ?? 0) <= max);
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    const getClubName = (clubId: string) => getClubDisplayName(clubId, clubs);
    return [...filteredPlayers].sort((a, b) => {
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
  }, [players, clubs, searchText, selectedPosition, selectedClub, selectedNationality, transferFilter, overallRange, ageRange, sortBy, sortDir]);

  const { items: pageItems, totalPages, next, prev } = usePagination({ items: filtered, perPage, initialPage: page });

  const handleCreatePlayer = async (data: any) => {
    setBusyAction('create');
    try {
      const created = await createPlayer(data as any);
      updatePlayers([...players, created]);
      setShowNewPlayer(false);
      setToast({ type: 'success', text: 'Jugador creado correctamente.' });
    } catch (error) {
      console.error('Error creating player:', error);
      setToast({ type: 'error', text: 'No se pudo crear el jugador.' });
    } finally {
      setBusyAction(null);
    }
  };

  const handleSavePlayer = async (data: any) => {
    const existing = players.find(p => p.id === data.id);
    if (!existing) return;
    const updatedPlayer = { ...existing, ...data, contract: { ...(existing.contract || {}), ...(data.contract || {}), salary: data.salary ?? data.contract?.salary ?? existing.contract?.salary ?? 0 } };
    try {
      await updatePlayer(updatedPlayer);
      updatePlayers(players.map(p => (p.id === data.id ? updatedPlayer : p)));
      setEditingPlayer(null);
      setToast({ type: 'success', text: 'Jugador actualizado.' });
    } catch (error) {
      console.error('Error updating player:', error);
      setToast({ type: 'error', text: 'No se pudo guardar el jugador.' });
    }
  };

  const handleDeletePlayerInner = async (id: string) => {
    try {
      await deletePlayer(id);
      updatePlayers(players.filter(p => p.id !== id));
      setToast({ type: 'success', text: 'Jugador eliminado.' });
    } catch (error) {
      console.error('Error deleting player:', error);
      setToast({ type: 'error', text: 'No se pudo eliminar el jugador.' });
    } finally {
      setDeletePlayerTarget(null);
    }
  };

  const handleUpdateAllToTransferListed = async () => {
    setBusyAction('transfer-all');
    try {
      const updatedPlayers = await updateAllPlayersToTransferListed();
      updatePlayers(updatedPlayers);
      setToast({ type: 'success', text: `${updatedPlayers.length} jugadores marcados como transferibles.` });
    } catch (error) {
      console.error('Error updating players to transfer listed:', error);
      setToast({ type: 'error', text: 'Error al actualizar jugadores a transferibles.' });
    } finally {
      setBusyAction(null);
    }
  };

  const handleAdjustSalaries = () => {
    const result = adjustAllPlayerSalaries();
    if (result.updated > 0) {
      setToast({
        type: 'success',
        text: `Salarios ajustados para ${result.updated} jugadores.\nCosto total anual: €${(result.totalCost / 1_000_000).toFixed(1)}M`
      });
    } else {
      setToast({ type: 'info', text: 'Los salarios ya estaban actualizados.' });
    }
    setShowSalaryConfirm(false);
  };

  const handleAdjustMarketValues = () => {
    const result = adjustAllPlayerMarketValues();
    if (result.updated > 0) {
      setToast({
        type: 'success',
        text: `Valores ajustados para ${result.updated} jugadores.\nValor total: €${(result.totalValue / 1_000_000).toFixed(1)}M`
      });
    } else {
      setToast({ type: 'info', text: 'Los valores de mercado ya estaban actualizados.' });
    }
    setShowMarketValueConfirm(false);
  };

  const handleReplaceSupabasePlayers = async () => {
    if (!config.useSupabase) {
      setToast({ type: 'error', text: 'Supabase no esta habilitado en esta instancia.' });
      return;
    }
    if (!players || players.length === 0) {
      setToast({ type: 'info', text: 'No hay jugadores en memoria para sincronizar.' });
      return;
    }
    const confirmed = confirm(
      'Esta accion eliminara TODOS los jugadores en Supabase y subira el lote actual importado.\n\nDeseas continuar?'
    );
    if (!confirmed) return;
    setBusyAction('replace-supabase');
    try {
      await replaceSupabasePlayers(players);
      setToast({ type: 'success', text: `Supabase actualizado con ${players.length} jugadores.` });
    } catch (error) {
      console.error('Error reemplazando jugadores en Supabase:', error);
      setToast({ type: 'error', text: 'Error al sincronizar con Supabase.' });
    } finally {
      setBusyAction(null);
    }
  };

  const handleDownloadTemplate = () => {
    try {
      const wb = XLSX.utils.book_new();
      const sampleAttributes = ATTRIBUTE_KEYS.reduce((acc, key) => {
        acc[key] = DEFAULT_PLAYER_ATTRIBUTES[key];
        return acc;
      }, {} as Record<string, number>);
      const sample = [
        {
          id: 'player-001',
          name: 'Jugador Ejemplo',
          position: 'MC',
          overall: 80,
          age: 25,
          clubId: 'libre',
          transferValue: 10000000,
          salary: 500000,
          transferListed: 'No',
          ...sampleAttributes
        }
      ];
      const ws = XLSX.utils.json_to_sheet(sample);
      XLSX.utils.book_append_sheet(wb, ws, 'Jugadores');
      const instructions = [
        { campo: 'id', detalle: 'Identificador unico (string)' },
        { campo: 'name', detalle: 'Nombre del jugador' },
        { campo: 'position', detalle: 'PT, DEC, LI, LD, MCD, MC, MO, MDI, MDD, EXI, EXD, CD, SD' },
        { campo: 'overall', detalle: 'Media 0-99' },
        { campo: 'age', detalle: 'Edad en anios' },
        { campo: 'clubId', detalle: 'ID de club o "libre"' },
        { campo: 'transferValue', detalle: 'Valor de mercado (entero)' },
        { campo: 'salary', detalle: 'Salario anual (entero)' },
        { campo: 'transferListed', detalle: 'Si/No' },
        { campo: 'attributes', detalle: 'Incluye columnas de stats en la misma hoja (ej: offensiveAwareness, ballControl, dribbling, ...).' }
      ];
      const ws2 = XLSX.utils.json_to_sheet(instructions);
      XLSX.utils.book_append_sheet(wb, ws2, 'Instrucciones');
      const ws3 = XLSX.utils.json_to_sheet(
        ATTRIBUTE_KEYS.map((key) => ({
          atributo: key,
          valor_default: DEFAULT_PLAYER_ATTRIBUTES[key]
        }))
      );
      XLSX.utils.book_append_sheet(wb, ws3, 'Atributos');
      XLSX.writeFile(wb, 'plantilla_jugadores.xlsx');
      setToast({ type: 'success', text: 'Plantilla Excel descargada.' });
    } catch (error) {
      console.error('Error generando plantilla:', error);
      setToast({ type: 'error', text: 'No se pudo generar la plantilla.' });
    }
  };

  const handleExportPlayers = () => {
    setBusyAction('export');
    try {
      const wb = XLSX.utils.book_new();
      const basic = players.map(p => ({
        id: p.id,
        name: p.name,
        position: p.position,
        overall: p.overall,
        age: p.age,
        clubId: p.clubId,
        transferValue: p.transferValue || 0,
        salary: getPlayerSalary(p),
        transferListed: p.transferListed ? 'Si' : 'No',
        ...ATTRIBUTE_KEYS.reduce((acc, key) => {
          acc[key] = parseNumberCell((p as any).attributes?.[key], DEFAULT_PLAYER_ATTRIBUTES[key]);
          return acc;
        }, {} as Record<string, number>)
      }));
      const wsBasic = XLSX.utils.json_to_sheet(basic);
      XLSX.utils.book_append_sheet(wb, wsBasic, 'Jugadores');
      XLSX.writeFile(wb, 'jugadores_export.xlsx');
      setToast({ type: 'success', text: `Exportados ${players.length} jugadores.` });
    } catch (error) {
      console.error('Error exportando jugadores:', error);
      setToast({ type: 'error', text: 'No se pudo exportar jugadores.' });
    } finally {
      setBusyAction(null);
    }
  };

  const handleImportPlayers = async (file: File) => {
    setBusyAction('import');
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets['Jugadores'] || wb.Sheets[wb.SheetNames[0]];
      if (!ws) {
        setToast({ type: 'error', text: 'No se encontro la hoja Jugadores.' });
        setBusyAction(null);
        return;
      }
      const rows: any[] = XLSX.utils.sheet_to_json(ws);
      const mapped = rows
        .map(r => ({
          id: r.id || r.ID || r.Id,
          name: r.name || r.Nombre,
          position: r.position || r.Posicion || r.posicion,
          overall: parseNumberCell(r.overall ?? r.Media, 70),
          age: parseNumberCell(r.age ?? r.Edad, 25),
          nationality: r.nationality || r.Nationality || r.Nacionalidad || 'Argentina',
          clubId: r.clubId || r.Club || 'libre',
          transferValue: parseNumberCell(r.transferValue ?? r.Valor, 0),
          salary: parseNumberCell(r.salary ?? r.Salario, 0),
          transferListed: parseBooleanCell(r.transferListed ?? r.Transferible ?? false),
          attributes: ATTRIBUTE_KEYS.reduce((acc, key) => {
            acc[key] = parseNumberCell(r[key], DEFAULT_PLAYER_ATTRIBUTES[key]);
            return acc;
          }, {} as PlayerAttributes)
        }))
        .filter(p => p.id && p.name);
      if (mapped.length === 0) {
        setToast({ type: 'error', text: 'No se encontraron filas validas en el Excel.' });
        setBusyAction(null);
        return;
      }
      const mappedWithContract = mapped.map(p => ({
        ...p,
        potential: Math.min(99, (p.overall || 70) + 3),
        image: '/default.png',
        skills: { ...DEFAULT_PLAYER_SKILLS },
        playingStyles: { ...DEFAULT_PLAYING_STYLES },
        form: p.attributes?.form ?? 3,
        goals: 0,
        assists: 0,
        appearances: 0,
        matches: 0,
        dorsal: 1,
        injuryResistance: 2,
        contract: {
          ...(p as any).contract,
          salary: p.salary || (p as any).contract?.salary || 0,
          expires:
            (p as any).contract?.expires ||
            new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString()
        }
      }));
      updatePlayers(mappedWithContract);
      setToast({ type: 'success', text: `Importados ${mapped.length} jugadores desde Excel.` });
    } catch (error) {
      console.error('Error importando jugadores:', error);
      setToast({ type: 'error', text: 'No se pudo importar el archivo.' });
    } finally {
      setBusyAction(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getPositionColor = (position: string) => {
    const eng =
      position === 'PT'
        ? 'GK'
        : position === 'DEC'
        ? 'CB'
        : position === 'LI'
        ? 'LB'
        : position === 'LD'
        ? 'RB'
        : position === 'MCD'
        ? 'CDM'
        : position === 'MC'
        ? 'CM'
        : position === 'MO'
        ? 'CAM'
        : position === 'MDI'
        ? 'LM'
        : position === 'MDD'
        ? 'RM'
        : position === 'EXI'
        ? 'LW'
        : position === 'EXD'
        ? 'RW'
        : position === 'CD' || position === 'SD'
        ? 'ST'
        : position;
    switch (eng) {
      case 'GK':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'CB':
      case 'LB':
      case 'RB':
        return 'bg-blue-500/20 text-blue-400';
      case 'CDM':
      case 'CM':
      case 'CAM':
      case 'LM':
      case 'RM':
        return 'bg-green-500/20 text-green-500';
      case 'LW':
      case 'RW':
      case 'ST':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getOverallColor = (overall: number) => {
    if (overall >= 85) return 'bg-green-500/20 text-green-500';
    if (overall >= 80) return 'bg-blue-500/20 text-blue-400';
    if (overall >= 75) return 'bg-yellow-500/20 text-yellow-500';
    return 'bg-gray-500/20 text-gray-400';
  };

  const getPlayerSalary = (player: any) => {
    return player.contract?.salary ?? player.salary ?? 0;
  };

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.text} onClose={() => setToast(null)} />}

      <AdminPageHeader
        title="Gestion de Jugadores"
        subtitle="Administra jugadores, filtros y acciones masivas."
        actions={
          <>
          <button className="btn-primary" onClick={() => setShowNewPlayer(true)} disabled={busyAction === 'create'}>
            <Plus size={16} className="mr-2" />
            Nuevo jugador
          </button>
          <button className="btn-outline" onClick={resetFilters} disabled={!hasActiveFilters}>
            <Filter size={16} className="mr-2" />
            Limpiar filtros
          </button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <SummaryBadge label="Jugadores" value={players.length.toString()} />
        <SummaryBadge label="Clubes" value={clubs.length.toString()} />
        <SummaryBadge
          label={hasActiveFilters ? 'Filtrados' : 'Visibles'}
          value={filtered.length.toString()}
          helper={hasActiveFilters ? `de ${players.length} totales` : 'Sin filtros activos'}
        />
      </div>

      <div className="card p-4 max-w-2xl">
        <div className="text-sm font-semibold text-white mb-2">Buscar jugador</div>
        <div className="bg-dark rounded-md border border-gray-800 p-3 flex items-center gap-2">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Buscar jugador por nombre..."
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ActionCard title="Acciones principales">
          <button className="btn-outline justify-center" onClick={() => setShowNewPlayer(true)} disabled={busyAction === 'create'}>
            <Plus size={16} className="mr-2" />
            Crear jugador
          </button>
          <button className="btn-outline justify-center text-gray-200 border-gray-600 hover:text-white hover:border-gray-500" onClick={handleUpdateAllToTransferListed} disabled={busyAction === 'transfer-all'}>
            <Users size={16} className="mr-2" />
            Marcar transferibles
          </button>
          <button className="btn-outline justify-center text-gray-200 border-gray-600 hover:text-white hover:border-gray-500" onClick={() => setShowSalaryConfirm(true)}>
            <DollarSign size={16} className="mr-2" />
            Ajustar salarios
          </button>
          <button className="btn-outline justify-center text-gray-200 border-gray-600 hover:text-white hover:border-gray-500" onClick={() => setShowMarketValueConfirm(true)}>
            <DollarSign size={16} className="mr-2" />
            Ajustar valores
          </button>
        </ActionCard>

        <ActionCard title="Sincronizacion">
          <button
            className={`btn-outline justify-center text-red-300 border-red-500 hover:text-red-200 hover:border-red-400 ${busyAction === 'replace-supabase' ? 'opacity-60 cursor-not-allowed' : ''}`}
            onClick={handleReplaceSupabasePlayers}
            disabled={busyAction === 'replace-supabase'}
          >
            <AlertTriangle size={16} className="mr-2" />
            Reemplazar Supabase
          </button>
          <div className="text-xs text-red-300/90 col-span-2">Elimina todos los jugadores remotos y sube el lote actual. Accion irreversible.</div>
        </ActionCard>

        <ActionCard title="Importar / Exportar">
          <button className="btn-outline justify-center text-gray-200 border-gray-600 hover:text-white hover:border-gray-500" onClick={handleDownloadTemplate}>
            Plantilla Excel
          </button>
          <button className="btn-outline justify-center text-gray-200 border-gray-600 hover:text-white hover:border-gray-500" onClick={handleExportPlayers} disabled={busyAction === 'export'}>
            Exportar Excel
          </button>
          <button className="btn-outline justify-center text-gray-200 border-gray-600 hover:text-white hover:border-gray-500" onClick={onImportClick} disabled={busyAction === 'import'}>
            Importar Excel
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) handleImportPlayers(f);
            }}
          />
        </ActionCard>
      </div>

      <div className="bg-dark-light border border-gray-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Posicion</label>
            <select className="input-select" value={selectedPosition} onChange={e => setSelectedPosition(e.target.value)}>
              <option value="">Todas</option>
              {positions.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Club</label>
            <select className="input-select" value={selectedClub} onChange={e => setSelectedClub(e.target.value)}>
              <option value="">Todos</option>
              <option value="libre">Agente libre</option>
              {clubs.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Nacionalidad</label>
            <select className="input-select" value={selectedNationality} onChange={e => setSelectedNationality(e.target.value)}>
              <option value="">Todas</option>
              {uniqueNationalities.map(n => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Transferible</label>
            <select className="input-select" value={transferFilter} onChange={e => setTransferFilter(e.target.value)}>
              <option value="">Todos</option>
              <option value="listed">Solo transferibles</option>
              <option value="unlisted">No transferibles</option>
            </select>
          </div>

          <button className="text-sm text-gray-300 underline" onClick={() => setShowAdvancedFilters(s => !s)}>
            {showAdvancedFilters ? 'Ocultar avanzados' : 'Filtros avanzados'}
          </button>
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Media min</label>
              <input className="input" value={overallRange.min} onChange={e => setOverallRange({ ...overallRange, min: e.target.value })} placeholder="0" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Media max</label>
              <input className="input" value={overallRange.max} onChange={e => setOverallRange({ ...overallRange, max: e.target.value })} placeholder="100" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Edad min</label>
              <input className="input" value={ageRange.min} onChange={e => setAgeRange({ ...ageRange, min: e.target.value })} placeholder="0" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Edad max</label>
              <input className="input" value={ageRange.max} onChange={e => setAgeRange({ ...ageRange, max: e.target.value })} placeholder="50" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Ordenar por</label>
              <select className="input-select" value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
                <option value="overall">Media</option>
                <option value="name">Nombre</option>
                <option value="position">Posicion</option>
                <option value="club">Club</option>
                <option value="age">Edad</option>
                <option value="value">Valor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Direccion</label>
              <select className="input-select" value={sortDir} onChange={e => setSortDir(e.target.value as any)}>
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Resultados por pagina</label>
              <select
                className="input-select"
                value={perPage}
                onChange={e => {
                  setPerPage(parseInt(e.target.value));
                  setPage(1);
                }}
              >
                {[10, 20, 50, 100].map(n => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400 bg-dark-light border border-gray-800 rounded-lg p-3 flex-wrap gap-2">
        <div>
          {hasActiveFilters ? (
            <span>
              Mostrando <strong className="text-white">{filtered.length}</strong> jugadores filtrados de{' '}
              <strong className="text-white">{players.length}</strong>
            </span>
          ) : (
            <span>
              Mostrando <strong className="text-white">{filtered.length}</strong> jugadores
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            {searchText && <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">Nombre: "{searchText}"</span>}
            {selectedPosition && <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">Posicion: {selectedPosition}</span>}
            {selectedClub && (
              <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
                Club: {clubs.find(c => c.id === selectedClub)?.name || selectedClub}
              </span>
            )}
            {selectedNationality && (
              <span className="bg-teal-500/20 text-teal-400 px-2 py-1 rounded text-xs">Nacionalidad: {selectedNationality}</span>
            )}
            {transferFilter && (
              <span className="bg-pink-500/20 text-pink-400 px-2 py-1 rounded text-xs">
                {transferFilter === 'listed' ? 'Solo transferibles' : 'No transferibles'}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800 sticky top-0 z-10">
                <th className="px-4 py-3 text-left">Jugador</th>
                <th className="px-4 py-3 text-center">Pos</th>
                <th className="px-4 py-3 text-center">Club</th>
                <th className="px-4 py-3 text-center">Media</th>
                <th className="px-4 py-3 text-center">Valor</th>
                <th className="px-4 py-3 text-center">Salario</th>
                <th className="px-4 py-3 text-center">Transferible</th>
                <th className="px-4 py-3 text-center">Edad</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-gray-400">
                    {hasActiveFilters ? 'No se encontraron jugadores con los filtros aplicados.' : 'No hay jugadores.'}
                  </td>
                </tr>
              ) : (
                pageItems.map((player: any) => {
                  const salary = getPlayerSalary(player);
                  return (
                  <tr key={player.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full overflow-hidden mr-3 bg-dark-lighter flex items-center justify-center">
                          <img
                            src={player.image || '/default.png'}
                            alt={player.name}
                            onError={e => {
                              (e.target as HTMLImageElement).src = '/default.png';
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
                    <td className="px-4 py-3 text-center text-sm">{getClubDisplayName(player.clubId || '', clubs)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getOverallColor(player.overall)}`}>
                        {player.overall}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-200">
                      {player.transferValue ? `€${(player.transferValue / 1_000_000).toFixed(1)}M` : '-'}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-200">
                      {salary ? `€${(salary / 1_000_000).toFixed(1)}M` : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                          player.transferListed
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40'
                            : 'bg-gray-700 text-gray-300 border border-gray-600'
                        }`}
                      >
                        {player.transferListed ? 'Si' : 'No'}
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
                );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400 mt-3">
        <button
          className="px-3 py-1 rounded bg-dark-lighter hover:bg-dark disabled:opacity-50"
          onClick={() => {
            prev();
            setPage(p => Math.max(1, p - 1));
          }}
          disabled={page <= 1}
        >
          Anterior
        </button>
        <span>
          Pagina {page} de {totalPages}
        </span>
        <button
          className="px-3 py-1 rounded bg-dark-lighter hover:bg-dark disabled:opacity-50"
          onClick={() => {
            next();
            setPage(p => Math.min(totalPages, p + 1));
          }}
          disabled={page >= totalPages}
        >
          Siguiente
        </button>
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
        <ConfirmDeleteModal
          user={{ id: deletePlayerTarget.id, username: deletePlayerTarget.name }}
          onCancel={() => setDeletePlayerTarget(null)}
          onConfirm={handleDeletePlayerInner}
          label="jugador"
        />
      )}

      {showSalaryConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowSalaryConfirm(false)}></div>
          <div className="relative bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign size={18} className="text-emerald-400" />
                Ajustar salarios
              </h3>
              <button className="text-gray-400 hover:text-white" onClick={() => setShowSalaryConfirm(false)}>
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              Se recalcularan los salarios de todos los jugadores segun las tablas de mercado. Esta accion sobrescribe ajustes manuales.
            </p>
            <div className="flex justify-end gap-2">
              <button className="btn-outline" onClick={() => setShowSalaryConfirm(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleAdjustSalaries}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {showMarketValueConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowMarketValueConfirm(false)}></div>
          <div className="relative bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign size={18} className="text-cyan-400" />
                Ajustar valores de mercado
              </h3>
              <button className="text-gray-400 hover:text-white" onClick={() => setShowMarketValueConfirm(false)}>
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              Se actualizaran los valores de mercado de todos los jugadores segun las tablas de mercado. Se sobrescriben cambios manuales.
            </p>
            <div className="flex justify-end gap-2">
              <button className="btn-outline" onClick={() => setShowMarketValueConfirm(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleAdjustMarketValues}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlayers;

