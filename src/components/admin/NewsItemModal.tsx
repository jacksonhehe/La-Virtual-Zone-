import { useState } from 'react';
import { X } from 'lucide-react';
import { NewsItem } from '../../types';

interface Props {
  onClose: () => void;
  onSave: (item: NewsItem) => void;
  item?: NewsItem;
}

const NewsItemModal = ({ onClose, onSave, item }: Props) => {
  const [title, setTitle] = useState(item?.title || '');
  const [content, setContent] = useState(item?.content || '');
  const [type, setType] = useState<NewsItem['type']>(item?.type || 'announcement');
  const [featured, setFeatured] = useState<boolean>(item?.featured || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: NewsItem = {
      id: item?.id || `${Date.now()}`,
      title,
      content,
      type,
      date: item?.date || new Date().toISOString().slice(0, 10),
      author: item?.author || 'Admin',
      featured,
    };
    onSave(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <h3 className="text-xl font-bold mb-4">{item ? 'Editar Noticia' : 'Nueva Noticia'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Título</label>
            <input className="input w-full" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Contenido</label>
            <textarea className="input w-full h-24" value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tipo</label>
            <select className="input w-full" value={type} onChange={(e) => setType(e.target.value as NewsItem['type'])}>
              <option value="announcement">Anuncio</option>
              <option value="transfer">Fichaje</option>
              <option value="result">Resultado</option>
              <option value="rumor">Rumor</option>
              <option value="statement">Declaración</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="featured" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            <label htmlFor="featured" className="text-sm text-gray-400">Destacada</label>
          </div>
          <button type="submit" className="btn-primary w-full">{item ? 'Guardar' : 'Crear'}</button>
        </form>
      </div>
    </div>
  );
};

export default NewsItemModal;
