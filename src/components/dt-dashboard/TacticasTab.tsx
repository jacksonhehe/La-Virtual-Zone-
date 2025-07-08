import  { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Save, Settings } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Player } from '../../types/shared';

const formations = [
  { name: '4-4-2', positions: [
    { x: 50, y: 85 }, // GK
    { x: 15, y: 65 }, { x: 35, y: 70 }, { x: 65, y: 70 }, { x: 85, y: 65 }, // DEF
    { x: 20, y: 40 }, { x: 40, y: 45 }, { x: 60, y: 45 }, { x: 80, y: 40 }, // MID
    { x: 35, y: 20 }, { x: 65, y: 20 } // ATT
  ]},
  { name: '4-3-3', positions: [
    { x: 50, y: 85 }, // GK
    { x: 15, y: 65 }, { x: 35, y: 70 }, { x: 65, y: 70 }, { x: 85, y: 65 }, // DEF
    { x: 30, y: 45 }, { x: 50, y: 50 }, { x: 70, y: 45 }, // MID
    { x: 20, y: 20 }, { x: 50, y: 15 }, { x: 80, y: 20 } // ATT
  ]},
  { name: '3-5-2', positions: [
    { x: 50, y: 85 }, // GK
    { x: 25, y: 70 }, { x: 50, y: 75 }, { x: 75, y: 70 }, // DEF
    { x: 15, y: 50 }, { x: 30, y: 45 }, { x: 50, y: 50 }, { x: 70, y: 45 }, { x: 85, y: 50 }, // MID
    { x: 35, y: 20 }, { x: 65, y: 20 } // ATT
  ]}
];

export default function TacticasTab() {
  const { club, players } = useDataStore();
  const [selectedFormation, setSelectedFormation] = useState(formations[0]);
  const [playerPositions, setPlayerPositions] = useState(selectedFormation.positions);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [draggedPlayer, setDraggedPlayer] = useState<number | null>(null);
  const pitchRef = useRef<HTMLDivElement>(null);

  const clubPlayers = players.filter(p => p.clubId === club?.id);
  const startingEleven = clubPlayers.slice(0, 11);

  useEffect(() => {
    setSelectedPlayers(startingEleven);
    setPlayerPositions(selectedFormation.positions);
  }, [selectedFormation]);

  const handleFormationChange = (formation: typeof formations[0]) => {
    setSelectedFormation(formation);
    setPlayerPositions(formation.positions);
  };

  const handleMouseDown = (index: number) => {
    setDraggedPlayer(index);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedPlayer === null || !pitchRef.current) return;

    const rect = pitchRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPlayerPositions(prev => prev.map((pos, i) => 
      i === draggedPlayer ? { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) } : pos
    ));
  };

  const handleMouseUp = () => {
    setDraggedPlayer(null);
  };

  return (
    <div className="space-y-6">
      {/* Formation Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <h2 className="text-xl font-bold text-white">Formación:</h2>
        <div className="flex gap-2">
          {formations.map(formation => (
            <motion.button
              key={formation.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFormationChange(formation)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedFormation.name === formation.name
                  ? 'bg-primary text-black'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {formation.name}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Pitch */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-3"
        >
          <div
            ref={pitchRef}
            className="relative bg-gradient-to-b from-green-600 to-green-700 rounded-2xl aspect-[3/4] border-4 border-white/20 overflow-hidden cursor-crosshair"
            style={{
              backgroundImage: `
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '10% 10%'
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Field markings */}
            <div className="absolute inset-4 border-2 border-white/30 rounded-lg">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-16 border-2 border-white/30 border-t-0" />
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-16 border-2 border-white/30 border-b-0" />
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-white/30 rounded-full" />
            </div>

            {/* Players */}
            {selectedPlayers.slice(0, 11).map((player, index) => (
              <motion.div
                key={player.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
                style={{
                  left: `${playerPositions[index]?.x || 50}%`,
                  top: `${playerPositions[index]?.y || 50}%`
                }}
                whileHover={{ scale: 1.1 }}
                whileDrag={{ scale: 1.2, zIndex: 50 }}
                onMouseDown={() => handleMouseDown(index)}
                drag
                dragConstraints={pitchRef}
                dragElastic={0.1}
              >
                <div className="relative">
                  <img
                    src={player.image}
                    alt={player.name}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
                  />
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {player.name.split(' ')[0]}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Player List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 h-fit"
        >
          <h3 className="text-lg font-bold text-white mb-4">Plantilla</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {clubPlayers.map(player => (
              <motion.div
                key={player.id}
                whileHover={{ scale: 1.02 }}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                  selectedPlayers.some(p => p.id === player.id)
                    ? 'bg-primary/20 border border-primary/30'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <img
                  src={player.image}
                  alt={player.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{player.name}</p>
                  <p className="text-white/60 text-sm">{player.position} • {player.overall}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-black font-medium px-6 py-3 rounded-xl transition-colors"
        >
          <Save size={18} />
          Guardar Táctica
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setPlayerPositions(selectedFormation.positions)}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-xl transition-colors"
        >
          <RotateCcw size={18} />
          Resetear
        </motion.button>
      </motion.div>
    </div>
  );
}
 