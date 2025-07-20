import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  icon: ReactNode;
  date: string;
  category?: string;
  color?: string;
}

interface ActivityTimelineProps {
  items: TimelineItem[];
  maxItems?: number;
}

/**
 * Componente de línea temporal para mostrar actividades del usuario
 */
const ActivityTimeline = ({ items, maxItems = 10 }: ActivityTimelineProps) => {
  // Limitar el número de elementos mostrados
  const displayItems = items.slice(0, maxItems);
  
  // Animaciones para los elementos de la línea temporal
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative">
      {/* Línea vertical */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-primary/30 to-primary/10 z-0"></div>
      
      <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {displayItems.map((item, index) => (
          <motion.div 
            key={item.id} 
            className="relative flex items-start"
            variants={itemVariants}
          >
            {/* Punto en la línea temporal */}
            <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-${item.color || 'primary'}/20 border border-${item.color || 'primary'}/30`}>
              {item.icon}
            </div>
            
            {/* Contenido */}
            <div className="ml-6 flex-1">
              <div className={`p-4 rounded-lg bg-dark-lighter/30 border border-gray-800/50 hover:border-${item.color || 'primary'}/30 transition-all duration-300 hover:shadow-lg hover:shadow-${item.color || 'primary'}/5`}>
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-white">{item.title}</h4>
                  <span className="text-xs text-gray-400">{item.date}</span>
                </div>
                {item.description && (
                  <p className="text-sm text-gray-300">{item.description}</p>
                )}
                {item.category && (
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full bg-${item.color || 'primary'}/10 text-${item.color || 'primary'}/80`}>
                      {item.category}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        
        {items.length > maxItems && (
          <div className="flex justify-center pt-4">
            <button className="btn-text-primary text-sm">
              Ver más actividades
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ActivityTimeline;