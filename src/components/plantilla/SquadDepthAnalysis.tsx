import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Target, Users, TrendingUp, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import { Player } from '../../types/shared';

interface Props {
  players: Player[];
}

interface PositionAnalysis {
  position: string;
  count: number;
  avgOverall: number;
  avgAge: number;
  totalSalary: number;
  bestPlayer: Player;
  depth: 'excellent' | 'good' | 'adequate' | 'weak' | 'critical';
  recommendations: string[];
}

export default function SquadDepthAnalysis({ players }: Props) {
  const positionAnalysis = useMemo(() => {
    const positions = ['GK', 'DEF', 'MID', 'ATT'];
    const analysis: PositionAnalysis[] = [];

    positions.forEach(pos => {
      const positionPlayers = players.filter(p => p.position === pos);
      const count = positionPlayers.length;
      
      if (count === 0) {
        analysis.push({
          position: pos,
          count: 0,
          avgOverall: 0,
          avgAge: 0,
          totalSalary: 0,
          bestPlayer: {} as Player,
          depth: 'critical',
          recommendations: ['Necesitas fichar jugadores para esta posición']
        });
        return;
      }

      const avgOverall = Math.round(positionPlayers.reduce((sum, p) => sum + p.overall, 0) / count);
      const avgAge = Math.round(positionPlayers.reduce((sum, p) => sum + p.age, 0) / count);
      const totalSalary = positionPlayers.reduce((sum, p) => sum + (p.contract?.salary || 0), 0);
      const bestPlayer = positionPlayers.reduce((best, current) => 
        current.overall > best.overall ? current : best
      );

      let depth: PositionAnalysis['depth'];
      let recommendations: string[] = [];

      if (pos === 'GK') {
        if (count >= 3 && avgOverall >= 75) {
          depth = 'excellent';
          recommendations = ['Excelente cobertura de porteros'];
        } else if (count >= 2 && avgOverall >= 70) {
          depth = 'good';
          recommendations = ['Buena cobertura, considera un tercer portero'];
        } else if (count >= 2) {
          depth = 'adequate';
          recommendations = ['Cobertura básica, mejora la calidad'];
        } else {
          depth = 'critical';
          recommendations = ['Necesitas al menos 2 porteros'];
        }
      } else {
        if (count >= 6 && avgOverall >= 75) {
          depth = 'excellent';
          recommendations = ['Excelente profundidad de plantilla'];
        } else if (count >= 5 && avgOverall >= 70) {
          depth = 'good';
          recommendations = ['Buena profundidad, considera refuerzos'];
        } else if (count >= 4) {
          depth = 'adequate';
          recommendations = ['Profundidad básica, busca mejoras'];
        } else if (count >= 2) {
          depth = 'weak';
          recommendations = ['Profundidad insuficiente, fichajes necesarios'];
        } else {
          depth = 'critical';
          recommendations = ['Posición crítica, fichajes urgentes'];
        }
      }

      // Add specific recommendations based on age and quality
      if (avgAge > 30) {
        recommendations.push('Considera rejuvenecer la plantilla');
      }
      if (avgOverall < 70) {
        recommendations.push('Busca jugadores de mayor calidad');
      }
      if (count < 3 && pos !== 'GK') {
        recommendations.push('Necesitas más opciones para rotaciones');
      }

      analysis.push({
        position: pos,
        count,
        avgOverall,
        avgAge,
        totalSalary,
        bestPlayer,
        depth,
        recommendations
      });
    });

    return analysis;
  }, [players]);

  const getDepthColor = (depth: PositionAnalysis['depth']) => {
    switch (depth) {
      case 'excellent': return 'text-green-500 bg-green-500/20';
      case 'good': return 'text-blue-500 bg-blue-500/20';
      case 'adequate': return 'text-yellow-500 bg-yellow-500/20';
      case 'weak': return 'text-orange-500 bg-orange-500/20';
      case 'critical': return 'text-red-500 bg-red-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getDepthIcon = (depth: PositionAnalysis['depth']) => {
    switch (depth) {
      case 'excellent': return <CheckCircle size={16} />;
      case 'good': return <TrendingUp size={16} />;
      case 'adequate': return <Users size={16} />;
      case 'weak': return <AlertTriangle size={16} />;
      case 'critical': return <AlertTriangle size={16} />;
      default: return <Users size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/20 rounded-lg">
          <BarChart3 size={24} className="text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Análisis de Profundidad</h3>
          <p className="text-white/60">Evaluación de la fortaleza por posición</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {positionAnalysis.map((analysis, index) => (
          <motion.div
            key={analysis.position}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {analysis.position === 'GK' && <Shield size={20} className="text-blue-500" />}
                {analysis.position === 'DEF' && <Shield size={20} className="text-green-500" />}
                {analysis.position === 'MID' && <Target size={20} className="text-yellow-500" />}
                {analysis.position === 'ATT' && <Target size={20} className="text-red-500" />}
                <h4 className="text-lg font-bold text-white">{analysis.position}</h4>
              </div>
              <div className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2 ${getDepthColor(analysis.depth)}`}>
                {getDepthIcon(analysis.depth)}
                {analysis.depth === 'excellent' && 'Excelente'}
                {analysis.depth === 'good' && 'Buena'}
                {analysis.depth === 'adequate' && 'Adecuada'}
                {analysis.depth === 'weak' && 'Débil'}
                {analysis.depth === 'critical' && 'Crítica'}
              </div>
            </div>

            {analysis.count > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{analysis.count}</div>
                    <div className="text-sm text-white/60">Jugadores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500">{analysis.avgOverall}</div>
                    <div className="text-sm text-white/60">Promedio OVR</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{analysis.avgAge}</div>
                    <div className="text-sm text-white/60">Edad Promedio</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {analysis.totalSalary.toLocaleString()}€
                    </div>
                    <div className="text-sm text-white/60">Salarios</div>
                  </div>
                </div>

                <div className="mb-4 p-3 bg-white/5 rounded-lg">
                  <div className="text-sm text-white/60 mb-1">Mejor jugador</div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{analysis.bestPlayer.overall}</span>
                    </div>
                    <span className="text-white font-medium">{analysis.bestPlayer.name}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-white">Recomendaciones:</div>
                  {analysis.recommendations.map((rec, idx) => (
                    <div key={idx} className="text-sm text-white/70 flex items-start gap-2">
                      <div className="w-1 h-1 bg-white/40 rounded-full mt-2 flex-shrink-0" />
                      {rec}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                <p className="text-white/60">Sin jugadores en esta posición</p>
                <p className="text-white/40 text-sm mt-2">Fichajes urgentes necesarios</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Overall Squad Assessment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 rounded-2xl p-6"
      >
        <h4 className="text-lg font-bold text-white mb-4">Evaluación General</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {positionAnalysis.filter(p => p.depth === 'excellent' || p.depth === 'good').length}/4
            </div>
            <div className="text-sm text-white/60">Posiciones Fuertes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">
              {positionAnalysis.filter(p => p.depth === 'weak' || p.depth === 'critical').length}
            </div>
            <div className="text-sm text-white/60">Posiciones Críticas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {Math.round(players.reduce((sum, p) => sum + p.overall, 0) / players.length)}
            </div>
            <div className="text-sm text-white/60">OVR Promedio</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 