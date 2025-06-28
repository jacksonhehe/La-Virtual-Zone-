import  { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const CalendarAdminPanel = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRound, setSelectedRound] = useState(15);

  const matches = [
    { id: 1, home: 'Barcelona', away: 'Real Madrid', date: '2023-12-15', time: '20:00', round: 15 },
    { id: 2, home: 'Liverpool', away: 'Manchester City', date: '2023-12-16', time: '18:30', round: 15 },
    { id: 3, home: 'Bayern Munich', away: 'Dortmund', date: '2023-12-17', time: '15:30', round: 15 },
    { id: 4, home: 'PSG', away: 'Marseille', date: '2023-12-17', time: '21:00', round: 15 }
  ];

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

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map((match) => (
          <div key={match.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="text-right flex-1">
                  <p className="font-medium">{match.home}</p>
                </div>
                <div className="text-center px-4">
                  <div className="text-xs text-gray-400">{match.time}</div>
                  <div className="text-lg font-bold">vs</div>
                  <div className="text-xs text-gray-400">
                    {new Date(match.date).toLocaleDateString('es-ES', { 
                      day: '2-digit',
                      month: '2-digit'
                    })}
                  </div>
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium">{match.away}</p>
                </div>
              </div>
              <div className="ml-4">
                <button className="btn-outline text-xs">
                  Editar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="card text-center hover:bg-gray-700 transition-colors">
          <CalendarIcon className="mx-auto mb-2 text-blue-500" size={24} />
          <p className="font-medium">Programar Jornada</p>
          <p className="text-xs text-gray-400">Crear nuevos partidos</p>
        </button>
        
        <button className="card text-center hover:bg-gray-700 transition-colors">
          <CalendarIcon className="mx-auto mb-2 text-green-500" size={24} />
          <p className="font-medium">Resultados</p>
          <p className="text-xs text-gray-400">Cargar resultados</p>
        </button>
        
        <button className="card text-center hover:bg-gray-700 transition-colors">
          <CalendarIcon className="mx-auto mb-2 text-purple-500" size={24} />
          <p className="font-medium">Reprogramar</p>
          <p className="text-xs text-gray-400">Cambiar fechas</p>
        </button>
      </div>
    </div>
  );
}; 

export default CalendarAdminPanel;
 