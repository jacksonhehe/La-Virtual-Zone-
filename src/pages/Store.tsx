import { motion } from 'framer-motion';
import { Construction, ShoppingCart, Package, Gift, Star, Clock, Code } from 'lucide-react';

const Store = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="text-center space-y-8 max-w-3xl mx-auto"
      >
        {/* Icon Container */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative"
        >
          <div className="relative w-40 h-40 mx-auto mb-8">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-blue-500/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute inset-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full border border-white/10" />
            
            {/* Main icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingCart size={64} className="text-green-400 animate-bounce" />
            </div>
            
            {/* Floating icons */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                <Package size={20} className="text-white/60" />
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <Gift size={20} className="text-white/60" />
              </div>
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Star size={20} className="text-white/60" />
              </div>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Clock size={20} className="text-white/60" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-6">
              Tienda Virtual
            </h1>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
              En Desarrollo
            </h2>
            <p className="text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
              La tienda virtual está siendo desarrollada con las últimas tecnologías para ofrecerte la mejor experiencia de compra
            </p>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="space-y-6"
          >
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-xl mb-4 mx-auto">
                  <Package size={24} className="text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Productos Únicos</h3>
                <p className="text-white/70 text-sm">
                  Elementos cosméticos y personalizaciones exclusivas para tu club y perfil
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-xl mb-4 mx-auto">
                  <Gift size={24} className="text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Sistema de Recompensas</h3>
                <p className="text-white/70 text-sm">
                  Desbloquea contenido especial por logros y participación en eventos
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-xl mb-4 mx-auto">
                  <Star size={24} className="text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Rareza y Colección</h3>
                <p className="text-white/70 text-sm">
                  Artículos de diferentes rarezas para completar tu colección
                </p>
              </div>
            </div>

            {/* Coming Soon Features */}
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-2xl p-8 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Próximamente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Personalización de clubes y estadios</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span>Avatares y frames de perfil</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  <span>Booster packs y potenciadores</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  <span>Sistema de monedas virtuales</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span>Ediciones limitadas y eventos</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                  <span>Marketplace entre usuarios</span>
                </div>
              </div>
            </div>

            {/* Progress indicator */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, duration: 0.6, type: "spring" }}
              className="flex items-center justify-center gap-6"
            >
              <div className="flex items-center gap-3 text-sm text-white/50">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span>Desarrollo en progreso</span>
              </div>
              <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "75%" }}
                  transition={{ delay: 1, duration: 2, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                />
              </div>
              <div className="text-sm text-white/50">75%</div>
            </motion.div>

            {/* Newsletter signup */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
            >
              <h3 className="text-lg font-bold text-white mb-3">¿Quieres ser notificado cuando esté lista?</h3>
              <p className="text-white/60 text-sm mb-4">
                Recibe notificaciones cuando la tienda esté disponible y obtén acceso anticipado
              </p>
              <div className="flex gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Tu email"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium px-6 py-2 rounded-lg transition-all">
                  Notificarme
                </button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Store;
 