import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import { Image, Search, Plus } from 'lucide-react';
import FilterChip from '../components/common/FilterChip';
import Masonry from 'react-masonry-css';
import MediaCard from '../components/common/MediaCard';
import UploadMediaModal from '../components/common/UploadMediaModal';
import { useDataStore } from '../store/dataStore';

const Gallery = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const mediaItems = useDataStore(state => state.mediaItems);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    mediaItems.forEach(m => cats.add(m.category));
    return Array.from(cats);
  }, [mediaItems]);

  const filteredItems = useMemo(() => {
    return mediaItems.filter(item => {
      if (activeFilter !== 'all' && item.category !== activeFilter) return false;
      if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [mediaItems, activeFilter, searchQuery]);

  const breakpointColumnsObj = {
    default: 3,
    1280: 3,
    1024: 3,
    768: 2,
    0: 1
  };

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
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              <FilterChip
                label="Todos"
                active={activeFilter === 'all'}
                onClick={() => setActiveFilter('all')}
              />
              {categories.map(cat => (
                <FilterChip
                  key={cat}
                  label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                  active={activeFilter === cat}
                  onClick={() => setActiveFilter(cat)}
                />
              ))}
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
            <button className="btn-primary" onClick={() => setShowUpload(true)}>
              <Plus size={16} className="mr-2" />
              Subir
            </button>
          </div>
        </div>
        {filteredItems.length > 0 ? (
          <div className="mx-auto max-w-6xl">
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="-ml-4 flex w-auto"
              columnClassName="pl-4 bg-clip-padding"
            >
              {filteredItems.map(item => (
                <MediaCard
                  key={item.id}
                  media={item}
                  onClick={() => navigate(`/galeria/${item.id}`)}
                />
              ))}
            </Masonry>
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

      {/* Modal de subida */}
      <UploadMediaModal isOpen={showUpload} onClose={() => setShowUpload(false)} />
    </div>
  );
};

export default Gallery;
 