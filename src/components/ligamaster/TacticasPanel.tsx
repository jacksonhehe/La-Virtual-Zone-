import  { useState } from 'react';
import { motion } from 'framer-motion';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { RotateCcw, Save, Eye, Settings, Target, ArrowUp, ArrowDown } from 'lucide-react';

const formations = [
  { id: '442', name: '4-4-2', positions: [[4,6], [2,4,6,8], [2,4,6,8], [4,6]] },
  { id: '433', name: '4-3-3', positions: [[4,6], [2,4,6,8], [3,5,7], [2,5,8]] },
  { id: '352', name: '3-5-2', positions: [[5], [3,4,5,6,7], [2,4,6,8], [4,6]] },
  { id: '4231', name: '4-2-3-1', positions: [[4,6], [2,4,6,8], [3,5,7], [2,5,8], [5]] },
];

const mockPlayers = [
  { id: '1', name: 'Messi', position: 'RW', overall: 91 },
  { id: '2', name: 'Mbappé', position: 'LW', overall: 92 },
  { id: '3', name: 'Haaland', position: 'ST', overall: 91 },
  { id: '4', name: 'De Bruyne', position: 'CAM', overall: 91 },
  { id: '5', name: 'Modric', position: 'CM', overall: 88 },
  { id: '6', name: 'Casemiro', position: 'CDM', overall: 89 },
  { id: '7', name: 'Van Dijk', position: 'CB', overall: 90 },
  { id: '8', name: 'Alaba', position: 'LB', overall: 87 },
  { id: '9', name: 'Carvajal', position: 'RB', overall: 86 },
  { id: '10', name: 'Rüdiger', position: 'CB', overall: 87 },
  { id: '11', name: 'Courtois', position: 'GK', overall: 89 },
];

const PlayerCard = ({ player, isOnField = false }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'player',
    item: { id: player.id, player },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`
        bg-gray-700 rounded-lg p-2 cursor-move transition-all duration-200
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
        ${isOnField ? 'bg-blue-600' : 'hover:bg-gray-600'}
        ${isOnField ? 'w-16 h-16' : 'w-full'}
      `}
    >
      <div className={`text-center ${isOnField ? 'text-xs' : 'text-sm'}`}>
        <p className="font-semibold text-white truncate">{player.name}</p>
        <p className="text-gray-300 text-xs">{player.position}</p>
        {!isOnField && <p className="text-yellow-400 text-xs">{player.overall}</p>}
      </div>
    </div>
  );
};

const FieldSlot = ({ row, col, player, onDrop }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'player',
    drop: (item) => onDrop(item.player, row, col),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`
        w-16 h-16 border-2 border-dashed border-gray-400 rounded-lg
        flex items-center justify-center transition-all duration-200
        ${isOver ? 'border-blue-400 bg-blue-400/20' : ''}
        ${player ? 'border-solid border-green-400' : ''}
      `}
    >
      {player ? <PlayerCard player={player} isOnField /> : null}
    </div>
  );
};

const TacticasPanel = () => {
  const [selectedFormation, setSelectedFormation] = useState(formations[0]);
  const [fieldPlayers, setFieldPlayers] = useState({});
  const [instructions, setInstructions] = useState({
    attacking: 50,
    defensive: 50,
    pressing: 50,
    tempo: 50,
  });

  const handlePlayerDrop = (player, row, col) => {
    const key = `${row}-${col}`;
    setFieldPlayers(prev => ({
      ...prev,
      [key]: player
    }));
  };

  const resetFormation = () => {
    setFieldPlayers({});
  };

  const saveFormation = () => {
    console.log('Formation saved:', { formation: selectedFormation, players: fieldPlayers, instructions });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        {/* Sidebar - Players & Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Formation Selector */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Target size={20} />
              Formación
            </h3>
            <div className="space-y-2">
              {formations.map((formation) => (
                <button
                  key={formation.id}
                  onClick={() => setSelectedFormation(formation)}
                  className={`
                    w-full p-3 rounded-lg text-left transition-all duration-200
                    ${selectedFormation.id === formation.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }
                  `}
                >
                  {formation.name}
                </button>
              ))}
            </div>
          </div>

          {/* Team Instructions */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Settings size={20} />
              Instrucciones
            </h3>
            <div className="space-y-4">
              {Object.entries(instructions).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-gray-300 text-sm mb-2 capitalize">
                    {key}: {value}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => setInstructions(prev => ({
                      ...prev,
                      [key]: parseInt(e.target.value)
                    }))}
                    className="w-full h-2 bg-gray-700 rounded-lg slider"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={resetFormation}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} />
              Resetear
            </button>
            <button
              onClick={saveFormation}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Save size={20} />
              Guardar
            </button>
          </div>
        </div>

        {/* Main Field */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-b from-green-400 to-green-600 rounded-xl p-6 h-[600px] relative overflow-hidden">
            {/* Field markings */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-32 h-12 border-2 border-white rounded" />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-12 border-2 border-white rounded" />
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-white rounded-full" />
            </div>

            {/* Formation Grid */}
            <div className="relative z-10 h-full">
              <div className="grid grid-rows-6 h-full gap-4 py-4">
                {Array.from({ length: 6 }, (_, row) => (
                  <div key={row} className="flex justify-center items-center gap-4">
                    {Array.from({ length: 10 }, (_, col) => {
                      const key = `${row}-${col}`;
                      const player = fieldPlayers[key];
                      return (
                        <FieldSlot
                          key={key}
                          row={row}
                          col={col}
                          player={player}
                          onDrop={handlePlayerDrop}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Players List */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 h-[600px] overflow-y-auto">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Eye size={20} />
              Jugadores
            </h3>
            <div className="space-y-2">
              {mockPlayers.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default TacticasPanel;
 