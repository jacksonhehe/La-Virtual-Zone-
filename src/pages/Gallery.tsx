import { motion } from 'framer-motion';
import { Construction, Image, Camera, Video, Upload, Star, Clock, Code } from 'lucide-react';
import SEO from '../components/SEO';

const Gallery = () => {
  return (
    <>
      <SEO
        title="Galería | La Virtual Zone"
        description="Contenido multimedia de la comunidad"
        canonical="https://lavirtualzone.com/galeria"
      />
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
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse" />
              <div className="absolute inset-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full border border-white/10" />
              
              {/* Main icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Image size={64} className="text-purple-400 animate-bounce" />
              </div>
              
              {/* Floating icons */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <Camera size={20} className="text-white/60" />
                </div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <Video size={20} className="text-white/60" />
                </div>
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Upload size={20} className="text-white/60" />
                </div>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Star size={20} className="text-white/60" />
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
                Galería Multimedia
              </h1>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                En Desarrollo
              </h2>
              <p className="text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
              La galería multimedia está siendo desarrollada para compartir momentos especiales de la comunidad
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
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-xl mb-4 mx-auto">
                    <Camera size={24} className="text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Fotos de Partidos</h3>
                  <p className="text-white/70 text-sm">
                    Comparte los mejores momentos de tus victorias y jugadas épicas
                  </p>
                </div>

                <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 border border-pink-500/20 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-center w-12 h-12 bg-pink-500/20 rounded-xl mb-4 mx-auto">
                    <Video size={24} className="text-pink-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Videos Destacados</h3>
                  <p className="text-white/70 text-sm">
                    Sube videos de goles, asistencias y jugadas increíbles
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-xl mb-4 mx-auto">
                    <Upload size={24} className="text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Subida Fácil</h3>
                  <p className="text-white/70 text-sm">
                    Interfaz intuitiva para subir y organizar tu contenido
                  </p>
                </div>
              </div>

              {/* Coming Soon Features */}
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">Próximamente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-3 text-white/80">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                    <span>Galería de momentos épicos</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                    <span>Videos de jugadas destacadas</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span>Sistema de likes y comentarios</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Filtros por categorías</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                    <span>Compartir en redes sociales</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span>Concursos de fotografía</span>
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
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
                  <span>Desarrollo en progreso</span>
                </div>
                <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "60%" }}
                    transition={{ delay: 1, duration: 2, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  />
                </div>
                <div className="text-sm text-white/50">60%</div>
              </motion.div>

              {/* Community showcase preview */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
              >
                <h3 className="text-lg font-bold text-white mb-3">Vista Previa de la Comunidad</h3>
                <p className="text-white/60 text-sm mb-4">
                  La galería será el lugar donde la comunidad comparta sus mejores momentos futbolísticos
                </p>
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-400">0</div>
                    <div className="text-xs text-white/60">Fotos</div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-pink-400">0</div>
                    <div className="text-xs text-white/60">Videos</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-400">0</div>
                    <div className="text-xs text-white/60">Likes</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default Gallery;
 