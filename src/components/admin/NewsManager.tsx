import { useState } from 'react';
import { Edit, Plus, Trash } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { NewsItem } from '../../types';
import { formatDate, formatNewsType, getNewsTypeColor } from '../../utils/helpers';
import NewsItemModal from './NewsItemModal';

const NewsManager = () => {
  const { newsItems, addNewsItem, editNewsItem, deleteNewsItem } = useDataStore();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | undefined>();

  const handleCreate = () => {
    setEditingItem(undefined);
    setShowModal(true);
  };

  const handleEdit = (item: NewsItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleSave = (item: NewsItem) => {
    if (editingItem) {
      editNewsItem(item);
    } else {
      addNewsItem(item);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar noticia?')) {
      deleteNewsItem(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Noticias</h2>
        <button className="btn-primary flex items-center" onClick={handleCreate}>
          <Plus size={16} className="mr-2" />
          Nueva noticia
        </button>
      </div>

      <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                <th className="px-4 py-3 text-left">Título</th>
                <th className="px-4 py-3 text-center">Fecha</th>
                <th className="px-4 py-3 text-center">Tipo</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {newsItems.map((n) => (
                <tr key={n.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                  <td className="px-4 py-3">{n.title}</td>
                  <td className="px-4 py-3 text-center">{formatDate(n.date)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`badge ${getNewsTypeColor(n.type)}`}>{formatNewsType(n.type)}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-primary" onClick={() => handleEdit(n)}>
                        <Edit size={16} />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-500" onClick={() => handleDelete(n.id)}>
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <NewsItemModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          item={editingItem}
        />
      )}
    </div>
  );
};

export default NewsManager;
