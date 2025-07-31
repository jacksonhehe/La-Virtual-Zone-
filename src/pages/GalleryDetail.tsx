import { useParams, useNavigate } from 'react-router-dom';
import { useDataStore } from '../store/dataStore';
import { Heart, Eye, Share2, Download } from 'lucide-react';
import { useState } from 'react';
import { srcSet, withWidth, defaultSizes } from '@/utils/imageHelpers';

const GalleryDetail = () => {
  const { mediaId } = useParams();
  const navigate = useNavigate();
  const media = useDataStore(state => state.mediaItems.find(m => m.id === mediaId));

  if (!media) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <SEO title="Elemento no encontrado" description="El elemento solicitado no existe." />
        <h2 className="text-2xl font-bold mb-4">Elemento no encontrado</h2>
        <button onClick={() => navigate(-1)} className="btn-primary">Volver</button>
      </div>
    );
  }

  const isVideo = media.type === 'video' || media.type === 'clip';

  const [liked, setLiked] = useState(false);
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <SEO
        title={`${media.title} | La Virtual Zone`}
        description={`Contenido multimedia de ${media.uploader}`}
        canonical={`https://lavirtualzone.com/galeria/${media.id}`}
        image={media.thumbnailUrl}
      />
      <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="btn-outline mb-4">&larr; Volver</button>

      <div className="max-w-4xl mx-auto bg-[#1f1f2c]/60 border border-white/10 rounded-2xl p-6 shadow-lg">
        {isVideo ? (
          <video
            src={media.url}
            poster={media.thumbnailUrl}
            controls
            className="w-full rounded-lg mb-4"
          />
        ) : (
          <img
            src={withWidth(media.url, 800)}
            srcSet={srcSet(media.url)}
            sizes={defaultSizes}
            alt={media.title}
            className="w-full rounded-lg mb-4"
            loading="lazy"
          />
        )}

        <h1 className="text-3xl font-bold mb-2">{media.title}</h1>
        <div className="flex items-center gap-2 mb-4">
          <span className="badge bg-primary/20 text-primary capitalize">{media.category}</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6">
          <span className="flex items-center"><Eye size={14} className="mr-1" /> {media.views} vistas</span>
          <button
            className={"flex items-center gap-1 " + (liked ? 'text-primary' : 'hover:text-primary')}
            onClick={() => setLiked(!liked)}
          >
            <Heart size={14} /> {liked ? media.likes + 1 : media.likes}
          </button>
          <span>|</span>
          <span>Subido por {media.uploader}</span>
          <span>{new Date(media.uploadDate).toLocaleDateString('es-ES')}</span>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={handleShare}
            className="btn-outline flex items-center gap-1"><Share2 size={16}/> Compartir</button>
          <a
            href={media.url}
            download
            className="btn-outline flex items-center gap-1"><Download size={16}/> Descargar</a>
        </div>

        <div className="prose prose-invert max-w-none">
          {/* Descripción detallada o contenido adicional si existiera */}
        </div>
      </div>
    </div>
    </>
  );
};

export default GalleryDetail; 