import  { useState, useMemo, useRef, Suspense, lazy, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import    { Users, Target, DollarSign, Calendar as CalendarIcon, ShoppingBag, List, Play, Bell } from 'lucide-react';   
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';
import toast, { Toaster } from 'react-hot-toast';

const   PlantillaTab = lazy(() => import('../components/dt-dashboard/PlantillaTab'));
const TacticasTab = lazy(() => import('../components/dt-dashboard/TacticasTab'));
const FinanzasTab = lazy(() => import('../components/dt-dashboard/FinanzasTab'));
const CalendarioTab = lazy(() => import('../components/dt-dashboard/CalendarioTab'));
const  MercadoTab = lazy(() => import('../components/dt-dashboard/MercadoTab'));
const FixtureTab = lazy(() => import('../components/dt-dashboard/FixtureTab'));
const FeedTab = lazy(() => import('../components/dt-dashboard/FeedTab'));   

type    Tab = 'plantilla' | 'tacticas' | 'finanzas' | 'fixture' | 'calendario' | 'mercado' | 'feed';   

const    tabs = [
  { id: 'plantilla' as Tab, label: 'Plantilla', icon: Users },
  { id: 'tacticas' as Tab, label: 'Tácticas', icon: Target },
  { id: 'finanzas' as Tab, label: 'Finanzas', icon: DollarSign },
  { id: 'fixture' as Tab, label: 'Fixture', icon: List },
  { id: 'calendario' as Tab, label: 'Calendario', icon: CalendarIcon },
  { id: 'mercado' as Tab, label: 'Mercado', icon: ShoppingBag },
  { id: 'feed' as Tab, label: 'Feed', icon: Bell },
];   

export default function DtDashboard() {
  const { user } = useAuthStore();
  const { clubs, tournaments, offers } = useDataStore();
  const club = useMemo(
    () => clubs.find(c => c.id === user?.clubId),
    [clubs, user?.clubId]
  );
  const fixtures = useMemo(() => {
    const matches = tournaments[0]?.matches || [];
    return matches
      .filter(m =>
        club ? m.homeTeam === club.name || m.awayTeam === club.name : false
      )
      .slice(0, 6)
      .map(m => ({ ...m, played: m.status === 'finished' }));
  }, [tournaments, club]);
  const [activeTab, setActiveTab] = useState<Tab>('plantilla');
  const tabsRef = useRef<HTMLDivElement>(null);

  // Notify about new offers for this club
  const prevOffersRef = useRef(new Set<string>());
  useEffect(() => {
    if (!club) return;
    const incoming = offers.filter(
      (o) => o.toClub === club.name && o.status === 'pending'
    );
    const newOnes = incoming.filter((o) => !prevOffersRef.current.has(o.id));
    if (newOnes.length > 0) {
      toast.success(
        newOnes.length === 1
          ? 'Tienes una nueva oferta de transferencia'
          : `Tienes ${newOnes.length} nuevas ofertas de transferencia`
      );
    }
    prevOffersRef.current = new Set(incoming.map((o) => o.id));
  }, [offers, club]);

  const nextMatch = useMemo(
    () =>
      fixtures.find(
        m => !m.played && (m.homeTeam === club?.name || m.awayTeam === club?.name)
      ),
    [fixtures, club?.name]
  );

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    toast.dismiss();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center">
        <p>No tienes un club asignado. Contacta a un administrador.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden border-b border-white/10 bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl"
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.1),transparent_50%)]" />
        
        <div className="container mx-auto px-6 py-10">
          <div className="flex items-center justify-between">
            {/* Team Info Section */}
            <div className="flex items-center gap-8">
              {/* Team Logo with enhanced styling */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                <motion.img
                  whileHover={{ 
                    scale: 1.1,
                    rotateY: 5,
                    boxShadow: "0 0 30px rgba(120,119,198,0.4)"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  src={club.logo}
                  alt={club.name}
                  className="relative w-20 h-20 rounded-3xl shadow-2xl ring-4 ring-white/20 ring-offset-4 ring-offset-gray-900/50 object-contain"
                />
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>

              {/* Team Details */}
              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent drop-shadow-lg">
                    {club.name}
                  </h1>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-white/90 font-medium text-sm">
                      DT: {user.username}
                    </span>
                  </div>
                  
                  {nextMatch && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="flex items-center gap-2 px-4 py-2 bg-primary/20 backdrop-blur-sm rounded-full border border-primary/30"
                    >
                      <Play size={14} className="text-primary" />
                      <span className="text-primary font-medium text-sm">
                        Próximo: {nextMatch.homeTeam === club.name ? 'vs ' + nextMatch.awayTeam : 'at ' + nextMatch.homeTeam}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Right side decorative element */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="hidden lg:block"
            >
              <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Tabs Navigation */}
      <div className="sticky top-0 z-40 bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6">
          <div ref={tabsRef} className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative flex items-center gap-3 px-6 py-4 font-medium transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? 'text-primary border-b-2 border-primary bg-primary/10'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon size={18} />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary/10 rounded-lg"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="min-h-[600px]"
          >
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            }>
                           {activeTab === 'plantilla' && <PlantillaTab />}
              {activeTab === 'tacticas' && <TacticasTab />}
              {activeTab === 'finanzas' && <FinanzasTab />}
              {activeTab === 'fixture' && <FixtureTab />}
              {activeTab === 'calendario' && <CalendarioTab />}
              {activeTab === 'mercado' && <MercadoTab />}
              {activeTab === 'feed' && <FeedTab />} 
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
 