import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Edit, Plus, Trash } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import NewPostModal from '../../components/admin/NewPostModal';
import EditPostModal from '../../components/admin/EditPostModal';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import { createPost, updatePost, deletePost as removePost } from '../../utils/postService';
import { posts as seedPosts } from '../../data/posts';

const AdminNews = () => {
  const { posts, updatePosts, refreshPosts } = useDataStore();
  const [searchParams] = useSearchParams();
  const [showNewPost, setShowNewPost] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [deletePostTarget, setDeletePostTarget] = useState<any | null>(null);
  const [postSearch, setPostSearch] = useState('');

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowNewPost(true);
    }
  }, [searchParams]);

  // Initialize posts from localStorage on component mount
  useEffect(() => {
    refreshPosts();
  }, []);

  const handleCreatePost = (data: { title: string; excerpt: string; content: string; image?: string; category: string; author: string; date?: string }) => {
    createPost(data);
    refreshPosts(); // Refresh posts from localStorage after creating
    setShowNewPost(false);
  };
  const handleSavePost = (p: any) => {
    updatePost(p);
    refreshPosts(); // Refresh posts from localStorage after updating
    setEditingPost(null);
  };
  const handleDeletePost = (id: string) => {
    removePost(id);
    refreshPosts(); // Refresh posts from localStorage after deleting
    setDeletePostTarget(null);
  };

  const filtered = (posts || [])
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter((p) => {
      const q = postSearch.toLowerCase();
      return !q || p.title.toLowerCase().includes(q) || p.author.toLowerCase().includes(q);
    });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Noticias</h2>
        <div className="flex items-center gap-2">
          {(posts || []).length === 0 && (
            <button className="btn-outline" onClick={() => updatePosts(seedPosts)}>Cargar ejemplos</button>
          )}
          <button className="btn-primary flex items-center" onClick={() => setShowNewPost(true)}>
            <Plus size={16} className="mr-2" />
            Nueva noticia
          </button>
        </div>
      </div>

      <div className="bg-dark-light rounded-lg border border-gray-800 p-4 mb-4">
        <label className="block text-xs text-gray-400 mb-1">Buscar</label>
        <input className="input w-full" value={postSearch} onChange={(e) => setPostSearch(e.target.value)} placeholder="Título o autor" />
      </div>

      <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full"><thead>
              <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                <th className="px-4 py-3 text-left">Título</th>
                <th className="px-4 py-3 text-center">Categoría</th>
                <th className="px-4 py-3 text-center">Fecha</th>
                <th className="px-4 py-3 text-center">Autor</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead><tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No hay artículos publicados.</td>
                </tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.title}</div>
                    <div className="text-xs text-gray-400 line-clamp-1">{p.excerpt}</div>
                  </td>
                  <td className="px-4 py-3 text-center">{p.category}</td>
                  <td className="px-4 py-3 text-center">{new Date(p.date).toLocaleDateString('es-ES')}</td>
                  <td className="px-4 py-3 text-center">{p.author}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button className="p-1 text-gray-400 hover:text-primary" onClick={() => setEditingPost(p)}>
                        <Edit size={16} />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-500" onClick={() => setDeletePostTarget(p)}>
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody></table>
        </div>
      </div>

      {showNewPost && (
        <NewPostModal onClose={() => setShowNewPost(false)} onCreate={handleCreatePost} />
      )}
      {editingPost && (
        <EditPostModal post={editingPost} onClose={() => setEditingPost(null)} onSave={handleSavePost} />
      )}
      {deletePostTarget && (
        <ConfirmDeleteModal user={{ id: deletePostTarget.id, username: deletePostTarget.title }} onCancel={() => setDeletePostTarget(null)} onConfirm={handleDeletePost} label="artículo" />
      )}
    </div>
  );
};

export default AdminNews;
