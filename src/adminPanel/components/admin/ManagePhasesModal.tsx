import React, { useMemo, useState } from 'react';
import { X, Layers, Plus, Trash2, Save } from 'lucide-react';
import { useGlobalStore } from '../../store/globalStore';
import type { Tournament, Phase } from '../../../types';

interface Props {
  tournament: Tournament;
  onClose: () => void;
}

const ManagePhasesModal: React.FC<Props> = ({ tournament: initialTournament, onClose }) => {
  const tournaments = useGlobalStore(state => state.tournaments);
  const updateTournaments = useGlobalStore(state => state.updateTournaments);

  const tournament = useMemo(
    () => tournaments.find(t => t.id === initialTournament.id) || initialTournament,
    [tournaments, initialTournament]
  );

  const [phases, setPhases] = useState<Phase[]>(tournament.phases || []);
  const [newPhase, setNewPhase] = useState({
    name: '',
    type: 'group' as Phase['type'],
    rounds: 1,
  });

  const addPhase = () => {
    if (!newPhase.name.trim()) return;
    const phase: Phase = {
      id: `ph_${Date.now()}`,
      name: newPhase.name.trim(),
      type: newPhase.type,
      rounds: newPhase.rounds,
      matches: [],
    };
    setPhases([...phases, phase]);
    setNewPhase({ name: '', type: 'group', rounds: 1 });
  };

  const removePhase = (id: string) => {
    setPhases(phases.filter(p => p.id !== id));
  };

  const savePhases = () => {
    const updated = tournaments.map(t =>
      t.id === tournament.id ? { ...t, phases } : t
    );
    updateTournaments(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-gradient-to-br from-dark-lighter to-dark rounded-2xl shadow-2xl max-w-3xl w-full border border-gray-800/70 relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center mr-4">
              <Layers size={22} className="text-dark" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Gestionar Fases
              </h3>
              <p className="text-gray-400 text-sm">{tournament.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Formulario nueva fase */}
          <div className="bg-dark-lighter p-4 rounded-lg border border-gray-700/50 space-y-4">
            <h4 className="text-lg font-semibold flex items-center">
              <Plus size={18} className="mr-2" />
              Añadir Fase
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="text-sm text-gray-400">Nombre</label>
                <input
                  className="input w-full bg-dark border-gray-700 focus:border-primary"
                  placeholder="Fase de Grupos"
                  value={newPhase.name}
                  onChange={e => setNewPhase({ ...newPhase, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Tipo</label>
                <select
                  className="input w-full bg-dark border-gray-700 focus:border-primary"
                  value={newPhase.type}
                  onChange={e => setNewPhase({ ...newPhase, type: e.target.value as Phase['type'] })}
                >
                  <option value="group">Grupos</option>
                  <option value="round_robin">Todos contra todos</option>
                  <option value="knockout">Eliminación</option>
                  <option value="final">Final</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400">Rondas</label>
                <input
                  type="number"
                  min={1}
                  className="input w-full bg-dark border-gray-700 focus:border-primary"
                  value={newPhase.rounds}
                  onChange={e => setNewPhase({ ...newPhase, rounds: Number(e.target.value) || 1 })}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={addPhase}
                  className="btn-primary w-full flex items-center justify-center space-x-1"
                  disabled={!newPhase.name.trim()}
                >
                  <Plus size={16} />
                  <span>Añadir</span>
                </button>
              </div>
            </div>
          </div>

          {/* Lista de fases */}
          <div className="space-y-3">
            {phases.length === 0 && <p className="text-gray-400 text-sm">No hay fases definidas.</p>}
            {phases.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-dark-lighter rounded-lg p-4 border border-gray-700/50">
                <div>
                  <p className="text-white font-medium">{p.name}</p>
                  <p className="text-gray-400 text-sm">Tipo: {p.type} • Rondas: {p.rounds}</p>
                </div>
                <button
                  className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                  onClick={() => removePhase(p.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800/50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="btn-outline"
          >
            Cancelar
          </button>
          <button
            onClick={savePhases}
            className="btn-primary flex items-center space-x-2"
          >
            <Save size={18} />
            <span>Guardar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagePhasesModal; 