import { useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import { Image, Search, Calendar, User, Tag, Plus } from 'lucide-react';

const Gallery = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock gallery items
  const galleryItems = [
    {
      id: '1',
      type: 'image',
      title: 'Final de la Liga Master 2024',
      description: 'Rayo Digital FC vs Atlético Pixelado',
      category: 'torneos',
      image: 'https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxlc3BvcnRzJTIwZ2FtaW5nJTIwZGFyayUyMHRoZW1lfGVufDB8fHx8MTc0NzA3MTE4MHww&ixlib=rb-4.1.0',
      author: 'admin',
      date: '2024-12-15'
    },
    {
      id: '2',
      type: 'image',
      title: 'Presentación de fichajes',
      description: 'Nuevos jugadores de Neón FC',
      category: 'club',
      image: 'https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxlc3BvcnRzJTIwZ2FtaW5nJTIwZGFyayUyMHRoZW1lfGVufDB8fHx8MTc0NzA3MTE4MHww&ixlib=rb-4.1.0',
      author: 'neonmanager',
      date: '2025-01-05'
    },
    {
      id: '3',
      type: 'image',
      title: 'Gol de la jornada',
      description: 'Golazo de Carlos Bitarra desde media cancha',
      category: 'jugadas',
      image: 'https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxlc3BvcnRzJTIwZ2FtaW5nJTIwZGFyayUyMHRoZW1lfGVufDB8fHx8MTc0NzA3MTE4MHww&ixlib=rb-4.1.0',
      author: 'admin',
      date: '2025-01-12'
    },
    {
      id: '4',
      type: 'video',
      title: 'Resumen de la jornada 1',
      description: 'Los mejores momentos de la primera jornada de Liga Master 2025',
      category: 'torneos',
      image: 'https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxlc3BvcnRzJTIwZ2FtaW5nJTIwZGFyayUyMHRoZW1lfGVufDB8fHx8MTc0NzA3MTE4MHww&ixlib=rb-4.1.0',
      author: 'admin',
      date: '2025-01-18'
    },
    {
      id: '5',
      type: 'image',
      title: 'Ceremonia de inauguración',
      description: 'Inicio de la temporada 2025',
      category: 'eventos',
      image: 'https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxlc3BvcnRzJTIwZ2FtaW5nJTIwZGFyayUyMHRoZW1lfGVufDB8fHx8MTc0NzA3MTE4MHww&ixlib=rb-4.1.0',
      author: 'admin',
      date: '2025-01-01'
    },
    {
      id: '6',
      type: 'image',
      title: 'Meme de la semana',
      description: 'Reacción del DT tras el gol fallado',
      category: 'memes',
      image: 'https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxlc3BvcnRzJTIwZ2FtaW5nJTIwZGFyayUyMHRoZW1lfGVufDB8fHx8MTc0NzA3MTE4MHww&ixlib=rb-4.1.0',
      author: 'pixelmanager',
      date: '2025-01-20'
    }
  ];
  
  // Filter gallery items
  const filteredItems = galleryItems.filter(item => {
    if (activeFilter !== 'all' && item.category !== activeFilter) {
      return false;
    }
    
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase()) && !item.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  return (
    <div>
      <PageHeader 
        title="Galería" 
        subtitle="Colección de imágenes, videos y contenido multimedia de La Virtual Zone."
        image="https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxlc3BvcnRzJTIwZ2FtaW5nJTIwZGFyayUyMHRoZW1lfGVufDB8fHx8MTc0NzA3MTE4MHww&ixlib=rb-4.1.0"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="w-full md:w-auto order-2 md:order-1">
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm ${activeFilter === 'all' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300 hover:bg-dark-lighter'}`}
              >
                Todos
              </button>
              <button 
                onClick={() => setActiveFilter('torneos')}
                className={`px-3 py-1.5 rounded-lg text-sm ${activeFilter === 'torneos' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300 hover:bg-dark-lighter'}`}
              >
                Torneos
              </button>
              <button 
                onClick={() => setActiveFilter('club')}
                className={`px-3 py-1.5 rounded-lg text-sm ${activeFilter === 'club' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300 hover:bg-dark-lighter'}`}
              >
                Clubes
              </button>
              <button 
                onClick={() => setActiveFilter('jugadas')}
                className={`px-3 py-1.5 rounded-lg text-sm ${activeFilter === 'jugadas' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300 hover:bg-dark-lighter'}`}
              >
                Jugadas
              </button>
              <button 
                onClick={() => setActiveFilter('eventos')}
                className={`px-3 py-1.5 rounded-lg text-sm ${activeFilter === 'eventos' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300 hover:bg-dark-lighter'}`}
              >
                Eventos
              </button>
              <button 
                onClick={() => setActiveFilter('memes')}
                className={`px-3 py-1.5 rounded-lg text-sm ${activeFilter === 'memes' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300 hover:bg-dark-lighter'}`}
              >
                Memes
              </button>
            </div>
          </div>
          
          <div className="flex w-full md:w-auto order-1 md:order-2 space-x-2">
            <div className="relative flex-grow max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Buscar..."
                className="input pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn-primary">
              <Plus size={16} className="mr-2" />
              Subir
            </button>
          </div>
        </div>
        
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div key={item.id} className="card overflow-hidden group">
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`
                      inline-block px-2 py-1 text-xs font-medium rounded-full
                      ${item.type === 'video' ? 'bg-neon-red/20 text-neon-red' : 'bg-neon-blue/20 text-neon-blue'}
                    `}>
                      {item.type === 'video' ? 'Video' : 'Imagen'}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="bg-primary rounded-full p-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                      {item.type === 'video' ? (
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          className="text-white"
                        >
                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                      ) : (
                        <Image size={24} className="text-white" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">{item.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <User size={14} className="mr-1" />
                      <span>{item.author}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      <span>{new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center">
                      <Tag size={14} className="mr-1" />
                      <span className="capitalize">{item.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Image size={48} className="mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-bold mb-2">No se encontraron resultados</h3>
            <p className="text-gray-400">
              No hay resultados que coincidan con tu búsqueda. Intenta con otros términos o filtros.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
 