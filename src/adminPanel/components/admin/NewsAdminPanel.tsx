import  { useState } from 'react';
import { Plus, Edit, Trash, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGlobalStore } from '../../store/globalStore';
import { NewsItem } from '../../types';

const NewsAdminPanel = () => {
  const { newsItems, addNewsItem, updateNewsItem, removeNewsItem } = useGlobalStore();
  const [showNew, setShowNew] = useState(false);
  const [editNews, setEditNews] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'draft' as NewsItem['status']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    if (editNews) {
      updateNewsItem({
        ...editNews,
        ...formData
      });
      setEditNews(null);
      toast.success('Noticia actualizada');
    } else {
      addNewsItem({
        id: Date.now().toString(),
        title: formData.title,
        content: formData.content,
        author: 'admin',
        publishedAt: new Date().toISOString(),
        status: formData.status
      });
      setShowNew(false);
      toast.success('Noticia creada');
    }
    setFormData({ title: '', content: '', status: 'draft' });
  };

  const handleEdit = (news: NewsItem) => {
    setEditNews(news);
    setFormData({
      title: news.title,
      content: news.content,
      status: news.status
    });
    setShowNew(true);
  };

  const handleDelete = (id: string) => {
    removeNewsItem(id);
    toast.success('Noticia eliminada');
  };

  return (
       <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Gestión de Noticias</h2>
          <p className="text-gray-400 mt-2">Publica y gestiona el contenido informativo</p>
        </div>
        <button 
          className="btn-primary flex items-center space-x-2"
          onClick={() => setShowNew(true)}
        >
          <Plus size={20} />
          <span>Nueva Noticia</span>
        </button>
      </div> 

      {/* Form */}
      {showNew && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            {editNews ? 'Editar Noticia' : 'Nueva Noticia'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="input w-full"
              placeholder="Título de la noticia"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
            <textarea
              className="input w-full h-32 resize-none"
              placeholder="Contenido de la noticia"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              required
            />
            <select
              className="input"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as NewsItem['status']})}
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
            </select>
            <div className="flex space-x-3">
              <button type="submit" className="btn-primary">
                {editNews ? 'Actualizar' : 'Crear'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowNew(false); 
                  setEditNews(null); 
                  setFormData({ title: '', content: '', status: 'draft' });
                }} 
                className="btn-outline"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* News List */}
      <div className="space-y-4">
        {newsItems.length > 0 ? (
          newsItems.map((news) => (
            <div key={news.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-lg">{news.title}</h4>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{news.content}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>Por: {news.author}</span>
                    <span>{new Date(news.publishedAt).toLocaleDateString()}</span>
                    <span className={`px-2 py-1 rounded-full ${
                      news.status === 'published' 
                        ? 'bg-green-900/20 text-green-300' 
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {news.status === 'published' ? 'Publicado' : 'Borrador'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button 
                    className="text-blue-400 hover:text-blue-300"
                    onClick={() => handleEdit(news)}
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="text-red-400 hover:text-red-300"
                    onClick={() => handleDelete(news.id)}
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card text-center py-8">
            <p className="text-gray-400">No hay noticias creadas</p>
          </div>
        )}
      </div>
    </div>
  );
}; 

export default NewsAdminPanel;
 