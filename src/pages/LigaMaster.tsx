import  { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Target, DollarSign, Calendar, ChevronDown, Trophy, Award, TrendingUp } from 'lucide-react';

const PlantillaPanel = lazy(() => import('../components/ligamaster/PlantillaPanel'));
const TacticasPanel = lazy(() => import('../components/ligamaster/TacticasPanel'));
const FinanzasPanel = lazy(() => import('../components/ligamaster/FinanzasPanel'));
const CalendarioPanel = lazy(() => import('../components/ligamaster/CalendarioPanel'));

const tabs = [
  { id: 'plantilla', label: 'Plantilla', icon: Users, color: 'from-blue-500 to-cyan-500' },
  { id: 'tacticas', label: 'Tácticas', icon: Target, color: 'from-green-500 to-emerald-500' },
  { id: 'finanzas', label: 'Finanzas', icon: DollarSign, color: 'from-yellow-500 to-orange-500' },
  { id: 'calendario', label: 'Calendario', icon: Calendar, color: 'from-purple-500 to-pink-500' },
];

const LigaMaster = () => {
  const [activeTab, setActiveTab] = useState('plantilla');

  const renderPanel = () => {
    switch (activeTab) {
      case 'plantilla': return <PlantillaPanel />;
      case 'tacticas': return <TacticasPanel />;
      case 'finanzas': return <FinanzasPanel />;
      case 'calendario': return <CalendarioPanel />;
      default: return <PlantillaPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 py-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="text-yellow-400" size={40} />
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Liga Master
              </h1>
              <Award className="text-yellow-400" size={40} />
            </div>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Comandá tu equipo hacia la gloria. Gestiona jugadores, define tácticas y controla las finanzas.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} />
                <span>Temporada 2024/25</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>25 Jugadores</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign size={16} />
                <span>€2.5M Presupuesto</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 z-40">
        <div className="container mx-auto px-4">
          <nav className="flex overflow-x-auto py-4" role="tablist" aria-label="Liga Master sections">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  className={`
                    relative flex items-center gap-3 px-6 py-3 rounded-lg text-sm font-medium
                    transition-all duration-300 whitespace-nowrap min-w-fit mr-2
                    ${isActive 
                      ? 'text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className={`absolute inset-0 rounded-lg bg-gradient-to-r ${tab.color} opacity-20`}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon size={20} className={`z-10 ${isActive ? 'text-white' : ''}`} />
                  <span className="z-10">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-white z-10"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
              </div>
            }>
              {renderPanel()}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LigaMaster;
 