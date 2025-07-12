import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, Target, Users, Trophy } from 'lucide-react';
import * as Recharts from 'recharts';
import ChartSkeleton from '../common/ChartSkeleton';
import { useDataStore } from '../../store/dataStore';

const formatCurrency= (amount: number) => `€${amount.toLocaleString()}`;

export default function FinanzasTab() {
  const { club, players } = useDataStore();

  const clubPlayers = players.filter(p => p.clubId === club?.id);
  const totalSalaries = clubPlayers.reduce((sum, p) => sum + (p.contract?.salary || 0), 0);
  const avgPlayerValue = clubPlayers.reduce((sum, p) => sum + p.marketValue, 0) / clubPlayers.length || 0;

  const monthlyData = [
    { month: 'Ene', income: 2500000, expenses: 1800000 },
    { month: 'Feb', income: 2200000, expenses: 1900000 },
    { month: 'Mar', income: 2800000, expenses: 2100000 },
    { month: 'Abr', income: 2600000, expenses: 1950000 },
    { month: 'May', income: 3000000, expenses: 2200000 },
    { month: 'Jun', income: 2400000, expenses: 1800000 },
  ];

  const expenseBreakdown = [
    { category: 'Salarios', amount: totalSalaries, color: '#ff6b6b' },
    { category: 'Fichajes', amount: 5000000, color: '#4ecdc4' },
    { category: 'Infraestructura', amount: 1200000, color: '#45b7d1' },
    { category: 'Operaciones', amount: 800000, color: '#96ceb4' },
  ];

  const kpiCards = [
    {
      title: 'Presupuesto Total',
      value: formatCurrency(club?.budget || 0),
      trend: 'up',
      trendValue: '+12%',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Gastos Mensuales',
      value: formatCurrency(totalSalaries * 12 / 12),
      trend: 'down',
      trendValue: '-5%',
      icon: TrendingDown,
      color: 'from-red-500 to-pink-600'
    },
    {
      title: 'Valor Plantilla',
      value: formatCurrency(avgPlayerValue * clubPlayers.length),
      trend: 'up',
      trendValue: '+8%',
      icon: Users,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      title: 'ROI Temporada',
      value: '+18.5%',
      trend: 'up',
      trendValue: '+3%',
      icon: Target,
      color: 'from-purple-500 to-violet-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`relative bg-gradient-to-br ${kpi.color} p-6 rounded-2xl text-white overflow-hidden`}
            >
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24">
                <Icon size={96} className="opacity-20" />
              </div>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <Icon size={24} />
                  <div className={`flex items-center text-sm ${
                    kpi.trend === 'up' ? 'text-green-200' : 'text-red-200'
                  }`}>
                    {kpi.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span className="ml-1">{kpi.trendValue}</span>
                  </div>
                </div>
                <h3 className="text-sm font-medium opacity-90">{kpi.title}</h3>
                <p className="text-2xl font-bold mt-1">{kpi.value}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Income vs Expenses Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6">Ingresos vs Gastos</h3>
          <div className="h-64">
            <Suspense fallback={<ChartSkeleton />}>
              <Recharts.ResponsiveContainer width="100%" height="100%">
                <Recharts.LineChart data={monthlyData}>
                  <Recharts.XAxis dataKey="month" stroke="#9CA3AF" />
                  <Recharts.YAxis stroke="#9CA3AF" tickFormatter={(value) => `€${value / 1000000}M`} />
                  <Recharts.Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '12px',
                      color: '#F9FAFB'
                    }}
                    formatter={(value: number) => [formatCurrency(value), '']}
                  />
                  <Recharts.Line
                    type="monotone"
                    dataKey="income"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                    name="Ingresos"
                  />
                  <Recharts.Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#EF4444"
                    strokeWidth={3}
                    dot={{ fill: '#EF4444', strokeWidth: 2, r: 6 }}
                    name="Gastos"
                  />
                </Recharts.LineChart>
              </Recharts.ResponsiveContainer>
            </Suspense>
          </div>
        </motion.div>

        {/* Expense Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6">Distribución de Gastos</h3>
          <div className="h-64">
            <Suspense fallback={<ChartSkeleton />}>
              <Recharts.ResponsiveContainer width="100%" height="100%">
                <Recharts.BarChart data={expenseBreakdown} layout="horizontal">
                  <Recharts.XAxis type="number" stroke="#9CA3AF" tickFormatter={(value) => `€${value / 1000000}M`} />
                  <Recharts.YAxis type="category" dataKey="category" stroke="#9CA3AF" width={80} />
                  <Recharts.Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '12px',
                      color: '#F9FAFB'
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Gasto']}
                  />
                  <Recharts.Bar
                    dataKey="amount"
                    radius={[0, 8, 8, 0]}
                    fill={(entry) => entry.color}
                  />
                </Recharts.BarChart>
              </Recharts.ResponsiveContainer>
            </Suspense>
          </div>
        </motion.div>
      </div>

      {/* Budget Allocation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-6">Gestión de Presupuesto</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/70">Salarios</span>
                <span className="text-white">{((totalSalaries / (club?.budget || 1)) * 100).toFixed(1)}%</span>
              </div>
              <div className="bg-white/10 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(((totalSalaries / (club?.budget || 1)) * 100), 100)}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/70">Fichajes</span>
                <span className="text-white">35%</span>
              </div>
              <div className="bg-white/10 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full w-[35%] transition-all duration-1000" />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/70">Operaciones</span>
                <span className="text-white">15%</span>
              </div>
              <div className="bg-white/10 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full w-[15%] transition-all duration-1000" />
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="font-semibold text-white mb-2">Recomendaciones</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  Reducir gastos en salarios para liberar presupuesto
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  Invertir en jugadores jóvenes con potencial
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Optimizar costos operacionales
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
 