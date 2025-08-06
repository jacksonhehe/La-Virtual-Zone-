import { motion } from 'framer-motion';
import { Construction, Settings, Code, Clock } from 'lucide-react';

export default function TacticasTab() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="text-center space-y-8 max-w-2xl mx-auto"
      >
        {/* Icon Container */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative"
        >
          <div className="relative w-32 h-32 mx-auto mb-8">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-full blur-2xl animate-pulse" />
            <div className="absolute inset-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full border border-white/10" />
            
            {/* Icons */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Construction size={48} className="text-primary animate-bounce" />
            </div>
            
            {/* Floating icons */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                <Settings size={16} className="text-white/60" />
              </div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                <Code size={16} className="text-white/60" />
              </div>
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                <Clock size={16} className="text-white/60" />
              </div>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Settings size={16} className="text-white/60" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="space-y-6"
        >
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-4">
              En Desarrollo
            </h2>
            <p className="text-xl text-white/80 leading-relaxed">
              El sistema de tácticas está siendo desarrollado con las últimas tecnologías
            </p>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap justify-center gap-4 text-sm text-white/60">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>Formaciones personalizables</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                <span>Drag & Drop de jugadores</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span>Análisis táctico avanzado</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-2xl p-6 backdrop-blur-sm">
              <p className="text-white/70 text-center">
                Próximamente podrás crear y gestionar tácticas personalizadas, 
                arrastrar jugadores en el campo virtual y analizar el rendimiento 
                de tus estrategias en tiempo real.
              </p>
            </div>
          </motion.div>

          {/* Progress indicator */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, duration: 0.6, type: "spring" }}
            className="flex items-center justify-center gap-4"
          >
            <div className="flex items-center gap-2 text-sm text-white/50">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
              <span>Desarrollo en progreso</span>
            </div>
            <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "65%" }}
                transition={{ delay: 1, duration: 2, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
 