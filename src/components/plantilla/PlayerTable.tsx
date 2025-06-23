import { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { Player } from '../../types';
import { formatCurrency, formatDate, getPositionColor } from '../../utils/helpers';

interface Props {
  players: Player[];
  setPlayers: (p: Player[]) => void;
  onSelectPlayer: (p: Player) => void;
}

const positions = [
  { value: 'all', label: 'Todas' },
  { value: 'gk', label: 'Portero' },
  { value: 'def', label: 'Defensa' },
  { value: 'mid', label: 'Medio' },
  { value: 'att', label: 'Ataque' }
];

const PlayerTable = ({ players, setPlayers, onSelectPlayer }: Props) => {
  const [search, setSearch] = useState('');
  const [filterPos, setFilterPos] = useState('all');
  const [sort, setSort] = useState<{ field: keyof Player | 'contract'; dir: 'asc' | 'desc' } | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const toggleAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map(p => p.id));
  };

  const toggleSelect = (id: string) => {
    setSelected(sel => sel.includes(id) ? sel.filter(i => i !== id) : [...sel, id]);
  };

  const filtered = players.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterPos !== 'all') {
      const group = filterPos;
      if (group === 'gk' && p.position !== 'GK') return false;
      if (group === 'def' && !['CB','LB','RB','LWB','RWB'].includes(p.position)) return false;
      if (group === 'mid' && !['CDM','CM','CAM','LM','RM'].includes(p.position)) return false;
      if (group === 'att' && !['ST','CF','LW','RW'].includes(p.position)) return false;
    }
    return true;
  });

  const sorted = [...filtered];
  if (sort) {
    sorted.sort((a,b) => {
      const field = sort.field === 'contract' ? a.contract.salary - b.contract.salary : (a[sort.field] as number|string) > (b[sort.field] as number|string) ? 1 : -1;
      return sort.dir === 'asc' ? field : -field;
    });
  }

  const handleAction = (action: string, player: Player) => {
    if (action === 'sell') {
      setPlayers(players.map(p => p.id === player.id ? { ...p, transferListed: !p.transferListed } : p));
    } else if (action === 'renew') {
      const date = new Date(player.contract.expires);
      date.setFullYear(date.getFullYear() + 1);
      setPlayers(players.map(p => p.id === player.id ? { ...p, contract: { ...p.contract, expires: date.toISOString().slice(0,10) } } : p));
    }
    setMenuOpen(null);
  };

  const bulkSell = () => {
    setPlayers(players.map(p => selected.includes(p.id) ? { ...p, transferListed: true } : p));
    setSelected([]);
  };

  return (
    <div className="card p-4 overflow-x-auto">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          className="input flex-1"
          placeholder="Buscar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="input" value={filterPos} onChange={e => setFilterPos(e.target.value)}>
          {positions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        {selected.length > 0 && (
          <button className="btn-secondary" onClick={bulkSell}>
            Poner en venta ({selected.length})
          </button>
        )}
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400 border-b border-gray-700">
            <th className="p-2"><input type="checkbox" onChange={toggleAll} checked={selected.length === filtered.length && filtered.length>0} /></th>
            <th className="p-2 cursor-pointer" onClick={() => setSort({ field:'dorsal', dir: sort?.field==='dorsal' && sort.dir==='asc'?'desc':'asc' })}>Nº</th>
            <th className="p-2">Nombre</th>
            <th className="p-2">Posición</th>
            <th className="p-2 cursor-pointer" onClick={() => setSort({ field:'overall', dir: sort?.field==='overall' && sort.dir==='asc'?'desc':'asc' })}>OVR</th>
            <th className="p-2 cursor-pointer" onClick={() => setSort({ field:'age', dir: sort?.field==='age' && sort.dir==='asc'?'desc':'asc' })}>Edad</th>
            <th className="p-2">Moral</th>
            <th className="p-2">Forma</th>
            <th className="p-2 cursor-pointer" onClick={() => setSort({ field:'contract', dir: sort?.field==='contract' && sort.dir==='asc'?'desc':'asc' })}>Contrato</th>
            <th className="p-2 cursor-pointer" onClick={() => setSort({ field:'value', dir: sort?.field==='value' && sort.dir==='asc'?'desc':'asc' })}>Valor</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(p => (
            <tr key={p.id} className="border-b border-gray-800 hover:bg-gray-800/50">
              <td className="p-2"><input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} /></td>
              <td className="p-2" onClick={() => onSelectPlayer(p)}>{p.dorsal}</td>
              <td className="p-2 flex items-center cursor-pointer" onClick={() => onSelectPlayer(p)}>
                <img src={p.image} alt={p.name} className="w-6 h-6 rounded-full mr-2" />
                {p.name}
              </td>
              <td className="p-2"><span className={`px-2 py-0.5 rounded ${getPositionColor(p.position)}`}>{p.position}</span></td>
              <td className="p-2 text-center">{p.overall}</td>
              <td className="p-2 text-center">{p.age}</td>
              <td className="p-2 text-center">{p.morale ?? '—'}</td>
              <td className="p-2 text-center">{p.form}</td>
              <td className="p-2 text-center">{formatDate(p.contract.expires)}</td>
              <td className="p-2 text-right">{formatCurrency(p.value)}</td>
              <td className="p-2 relative">
                <button onClick={() => setMenuOpen(menuOpen===p.id?null:p.id)} className="p-1"><MoreVertical size={16}/></button>
                {menuOpen === p.id && (
                  <div className="absolute right-0 mt-2 w-40 bg-gray-900 border border-gray-700 rounded z-10">
                    <button className="block px-4 py-2 w-full text-left hover:bg-gray-800" onClick={() => { onSelectPlayer(p); setMenuOpen(null); }}>Ver perfil</button>
                    <button className="block px-4 py-2 w-full text-left hover:bg-gray-800" onClick={() => handleAction('renew', p)}>Renovar</button>
                    <button className="block px-4 py-2 w-full text-left hover:bg-gray-800" onClick={() => handleAction('sell', p)}>{p.transferListed ? 'Quitar venta' : 'Poner en venta'}</button>
                    <button className="block px-4 py-2 w-full text-left hover:bg-gray-800" onClick={() => setMenuOpen(null)}>Filial</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={11} className="p-4 text-center text-gray-400">Sin resultados</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerTable;
