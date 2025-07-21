import React from 'react';
import { MediaItem } from '@/types';
import LazyLoad from 'react-lazy-load';
import { PlayCircle, Heart, Eye } from 'lucide-react';

interface MediaCardProps {
  media: MediaItem;
  onClick?: () => void;
}

/*
  Tarjeta para los elementos de la galería.  
  Usa LazyLoad para mejorar el rendimiento cargando la miniatura sólo cuando entra en el viewport.
*/
const MediaCard: React.FC<MediaCardProps> = ({ media, onClick }) => {
  const isVideo = media.type === 'video' || media.type === 'clip';
  return (
    <div
      onClick={onClick}
      className="relative mb-6 overflow-hidden rounded-xl cursor-pointer group hover:shadow-2xl transition-shadow bg-gray-800/40 hover:scale-[1.02] transform-gpu duration-200"
    >
      {/* Badge categoría */}
      <span className="absolute top-2 left-2 z-10 badge bg-primary/20 text-primary capitalize">
        {media.category}
      </span>
      <LazyLoad offset={100}>
        {isVideo ? (
          <div className="relative w-full aspect-video bg-gray-700">
            {/* Poster/miniatura */}
            <img
              src={media.thumbnailUrl}
              alt={media.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Icono play */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <PlayCircle size={48} className="text-white" />
            </div>
          </div>
        ) : (
          <img
            src={media.thumbnailUrl || media.url}
            alt={media.title}
            className="w-full h-auto object-cover rounded-lg bg-gray-700"
            loading="lazy"
          />
        )}
      </LazyLoad>

      {/* Pie de foto */}
      <div className="p-3 bg-gray-800 border-t border-gray-700">
        <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
          {media.title}
        </h3>
        <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center"><Heart size={12} className="mr-0.5" /> {media.likes}</span>
            <span className="flex items-center"><Eye size={12} className="mr-0.5" /> {media.views}</span>
          </div>
          <span>{new Date(media.uploadDate).toLocaleDateString('es-ES')}</span>
        </div>
      </div>
    </div>
  );
};

export default MediaCard; 