import { useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { NewsItem } from '../../types';

const NewsAdminPanel = () => {
  const { newsItems, addNewsItem, removeNewsItem } = useDataStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [type, setType] = useState<'transfer' | 'rumor' | 'result' | 'announcement' | 'statement'>('announcement');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    const date = publishDate || new Date().toISOString();
    const item: NewsItem = {
      id: `${Date.now()}`,
      title,
      content,
      type,
      image: image || 'https://via.placeholder.com/300x200.png?text=News',
      date,
      publishDate: date,
      author: 'Admin',
      featured: false
    };
    addNewsItem(item);
    setTitle('');
    setContent('');
    setImage('');
    setPublishDate('');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gestión de Noticias</h2>
      <form onSubmit={handleSubmit} className="bg-dark-light rounded-lg border border-gray-800 p-4 mb-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Título</label>
          <input className="input w-full" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Contenido</label>
          <textarea className="input w-full" rows={3} value={content} onChange={e => setContent(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Imagen</label>
          <input
            className="input w-full"
            value={image}
            onChange={e => setImage(e.target.value)}
            placeholder="URL de la imagen"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Fecha de publicaci\u00f3n</label>
          <input
            type="datetime-local"
            className="input w-full"
            value={publishDate}
            onChange={e => setPublishDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Tipo</label>
          <select
            className="input w-full"
            value={type}
            onChange={e =>
              setType(
                e.target.value as
                  'transfer' | 'rumor' | 'result' | 'announcement' | 'statement'
              )
            }
          >
            <option value="announcement">Anuncio</option>
            <option value="transfer">Fichaje</option>
            <option value="result">Resultado</option>
            <option value="rumor">Rumor</option>
            <option value="statement">Declaración</option>
          </select>
        </div>
        <button type="submit" className="btn-primary w-full">Publicar</button>
      </form>

      <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                <th className="px-4 py-3 text-left">Título</th>
                <th className="px-4 py-3 text-center">Tipo</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {newsItems.map(n => (
                <tr key={n.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                  <td className="px-4 py-3">{n.title}</td>
                  <td className="px-4 py-3 text-center">{n.type}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => removeNewsItem(n.id)} className="text-red-500">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NewsAdminPanel;
