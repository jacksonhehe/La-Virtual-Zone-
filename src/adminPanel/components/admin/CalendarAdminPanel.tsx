import  { useState } from 'react';
import { useGlobalStore } from '../../store/globalStore';
import { Fixture } from '../../types';
import NewMatchModal from './NewMatchModal';
import EditMatchModal from './EditMatchModal';
import ResultMatchModal from './ResultMatchModal';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import CalendarScheduler from './CalendarScheduler';

const CalendarAdminPanel = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRound, setSelectedRound] = useState(15);

  const { matches, addMatch, updateMatch } = useGlobalStore();
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState<null | { match: Fixture; reschedule?: boolean }>(null);
  const [showResults, setShowResults] = useState(false);

  const roundMatches = matches.filter(m => m.round === selectedRound);
  const rounds = Array.from({ length: 38 }, (_, i) => i + 1);

  const nextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const prevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  return (
       <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Calendario de Partidos</h2>
          <p className="text-gray-400 mt-2">Programa y gestiona la agenda deportiva</p>
        </div>
        <div className="glass-panel p-3">
          <select
            className="input bg-transparent border-none"
            value={selectedRound}
            onChange={(e) => setSelectedRound(Number(e.target.value))}
          >
            {rounds.map((round) => (
              <option key={round} value={round}>
                Jornada {round}
              </option>
            ))}
          </select>
        </div>
      </div> 

      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
        <button onClick={prevWeek} className="p-2 hover:bg-gray-700 rounded">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <h3 className="font-semibold">
            {currentDate.toLocaleDateString('es-ES', { 
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h3>
          <p className="text-sm text-gray-400">Jornada {selectedRound}</p>
        </div>
        <button onClick={nextWeek} className="p-2 hover:bg-gray-700 rounded">
          <ChevronRight size={20} />
        </button>
      </div>

      <CalendarScheduler
        matches={roundMatches}
        weekStart={currentDate}
        onEdit={(m) => setEditing({ match: m })}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          className="card text-center hover:bg-gray-700 transition-colors"
          onClick={() => setShowNew(true)}
        >
          <CalendarIcon className="mx-auto mb-2 text-blue-500" size={24} />
          <p className="font-medium">Programar Jornada</p>
          <p className="text-xs text-gray-400">Crear nuevos partidos</p>
        </button>

        <button
          className="card text-center hover:bg-gray-700 transition-colors"
          onClick={() => setShowResults(true)}
        >
          <CalendarIcon className="mx-auto mb-2 text-green-500" size={24} />
          <p className="font-medium">Resultados</p>
          <p className="text-xs text-gray-400">Cargar resultados</p>
        </button>

        <button
          className="card text-center hover:bg-gray-700 transition-colors"
          onClick={() => setEditing({ match: roundMatches[0], reschedule: true })}
        >
          <CalendarIcon className="mx-auto mb-2 text-purple-500" size={24} />
          <p className="font-medium">Reprogramar</p>
          <p className="text-xs text-gray-400">Cambiar fechas</p>
        </button>
      </div>
      {showNew && (
        <NewMatchModal
          onClose={() => setShowNew(false)}
          onSave={(data) => {
            addMatch({
              id: Date.now().toString(),
              tournamentId: 'tournament1',
              status: 'scheduled',
              ...data,
              date: `${data.date}T${data.time}`
            } as Fixture);
            setShowNew(false);
          }}
        />
      )}

      {editing && (
        <EditMatchModal
          match={editing.match}
          allowDateEdit={editing.reschedule}
          onClose={() => setEditing(null)}
          onSave={(m) => {
            updateMatch(m);
            setEditing(null);
          }}
        />
      )}

      {showResults && (
        <ResultMatchModal
          matches={matches}
          onClose={() => setShowResults(false)}
          onSave={(m) => {
            updateMatch(m);
            setShowResults(false);
          }}
        />
      )}
    </div>
  );
};

export default CalendarAdminPanel;
 