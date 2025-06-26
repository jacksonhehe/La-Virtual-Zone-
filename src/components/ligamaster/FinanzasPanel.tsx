import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, PiggyBank, Target, AlertTriangle } from 'lucide-react';

const mockData = {
  monthly: [
    { month: 'Ene', ingresos: 2400000, gastos: 1800000 },
    { month: 'Feb', ingresos: 2100000, gastos: 2200000 },
    { month: 'Mar', ingresos: 2800000, gastos: 1900000 },
    { month: 'Abr', ingresos: 2600000, gastos: 2100000 },
    { month: 'May', ingresos: 3200000, gastos: 2300000 },
    { month: 'Jun', ingresos: 2900000, gastos: 2000000 },
  ],
  transfers: [
    { name: 'Ventas', value: 45000000, color: '#10B981' },
    { name: 'Compras', value: 38000000, color: '#EF4444' },
    { name: 'Disponible', value: 7000000, color: '#3B82F6' },
  ],
  salaries: [
    { player: 'Mbappé', salary: 45000000, percentage: 18 },
    { player: 'Messi', salary: 35000000, percentage: 14 },
    { player: 'Haaland', salary: 40000000, percentage: 16 },
    { player: 'De Bruyne', salary: 30000000, percentage: 12 },
    { player: 'Otros', salary: 100000000, percentage: 40 },
  ]
};

const StatCard = ({ title, value, change, icon: Icon, trend, color = 'blue' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg bg-${color}-500/20`}>
        <Icon className={`text-${color}-400`} size={24} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span className="text-sm font-medium">{change}</span>
        </div>
      )}
    </div>
    <div>
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </motion.div>
);

const FinanzasPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const formatCurrency = (value) => 
    new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(value);

  return (
    <div className="space-y-6">
      {/* Header Tabs */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-2 border border-gray-700">
        <div className="flex space-x-2">
          {[
            { id: 'overview', label: 'Resumen' },
            { id: 'transfers', label: 'Fichajes' },
            { id: 'salaries', label: 'Salarios' },
            { id: 'projections', label: 'Proyecciones' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === tab.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Presupuesto Total"
              value="€85.2M"
              change="+12.3%"
              icon={PiggyBank}
              trend="up"
              color="green"
            />
            <StatCard
              title="Gastos Mensuales"
              value="€21.5M"
              change="-5.2%"
              icon={CreditCard}
              trend="down"
              color="red"
            />
            <StatCard
              title="Ingresos por Ventas"
              value="€45.0M"
              change="+18.7%"
              icon={TrendingUp}
              trend="up"
              color="blue"
            />
            <StatCard
              title="Límite Salarial"
              value="75%"
              change="80% máx"
              icon={AlertTriangle}
              color="yellow"
            />
          </div>

          {/* Monthly Flow Chart */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              <BarChart className="text-blue-400" size={20} />
              Flujo Mensual de Efectivo
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockData.monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" tickFormatter={(value) => `€${value/1000000}M`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [formatCurrency(value), '']}
                  />
                  <Bar dataKey="ingresos" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gastos" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'transfers' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transfer Budget Pie Chart */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-6">Presupuesto de Fichajes</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockData.transfers}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                    >
                      {mockData.transfers.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Transfers */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-6">Fichajes Recientes</h3>
              <div className="space-y-4">
                {[
                  { player: 'Jude Bellingham', type: 'Compra', amount: 103000000, date: '2023-06-14' },
                  { player: 'Mason Mount', type: 'Venta', amount: 64000000, date: '2023-07-05' },
                  { player: 'Declan Rice', type: 'Compra', amount: 116000000, date: '2023-07-15' },
                ].map((transfer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{transfer.player}</p>
                      <p className="text-gray-400 text-sm">{transfer.date}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transfer.type === 'Compra' ? 'text-red-400' : 'text-green-400'}`}>
                        {transfer.type === 'Compra' ? '-' : '+'}{formatCurrency(transfer.amount)}
                      </p>
                      <p className="text-gray-400 text-sm">{transfer.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'salaries' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Salary Distribution */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-6">Distribución Salarial</h3>
            <div className="space-y-4">
              {mockData.salaries.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {item.player.charAt(0)}
                      </span>
                    </div>
                    <span className="text-white">{item.player}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-white font-medium min-w-20 text-right">
                      {formatCurrency(item.salary)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'projections' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-6">Proyección Fin de Temporada</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-500/20 rounded-lg border border-green-500/30">
                <h4 className="text-green-400 font-semibold mb-2">Escenario Optimista</h4>
                <p className="text-2xl font-bold text-white">€95.2M</p>
                <p className="text-green-400 text-sm">+€10M vs actual</p>
              </div>
              <div className="text-center p-6 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                <h4 className="text-yellow-400 font-semibold mb-2">Escenario Realista</h4>
                <p className="text-2xl font-bold text-white">€87.8M</p>
                <p className="text-yellow-400 text-sm">+€2.6M vs actual</p>
              </div>
              <div className="text-center p-6 bg-red-500/20 rounded-lg border border-red-500/30">
                <h4 className="text-red-400 font-semibold mb-2">Escenario Pesimista</h4>
                <p className="text-2xl font-bold text-white">€78.4M</p>
                <p className="text-red-400 text-sm">-€6.8M vs actual</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FinanzasPanel;
 