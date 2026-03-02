import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Edit, Plus, Trash } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import NewPostModal from '../../components/admin/NewPostModal';
import EditPostModal from '../../components/admin/EditPostModal';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { createPost, updatePost, deletePost as removePost } from '../../utils/postService';

const AdminNews = () => {
  const { posts, refreshPosts } = useDataStore();
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

  useEffect(() => {
    refreshPosts();
  }, [refreshPosts]);

  const handleCreatePost = (data: { title: string; excerpt: string; content: string; image?: string; category: string; author: string; date?: string }) => {
    createPost(data);
    refreshPosts();
    setShowNewPost(false);
  };

  const handleSavePost = (post: any) => {
    updatePost(post);
    refreshPosts();
    setEditingPost(null);
  };

  const handleDeletePost = (id: string) => {
    removePost(id);
    refreshPosts();
    setDeletePostTarget(null);
  };

  const filtered = (posts || [])
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter((post) => {
      const query = postSearch.toLowerCase();
      return !query || post.title.toLowerCase().includes(query) || post.author.toLowerCase().includes(query);
    });

  return (
    <div>
      <AdminPageHeader
        title="Noticias"
        subtitle="Publica y edita contenido del blog principal."
        actions={
          <button className="btn-primary flex items-center" onClick={() => setShowNewPost(true)}>
            <Plus size={16} className="mr-2" />
            Nueva noticia
          </button>
        }
      />

      <div className="card p-4 mb-4">
        <label className="block text-xs text-gray-400 mb-1">Buscar</label>
        <input className="input w-full" value={postSearch} onChange={(e) => setPostSearch(e.target.value)} placeholder="Titulo o autor" />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                <th className="px-4 py-3 text-left">Titulo</th>
                <th className="px-4 py-3 text-center">Categoria</th>
                <th className="px-4 py-3 text-center">Fecha</th>
                <th className="px-4 py-3 text-center">Autor</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No hay articulos publicados.</td>
                </tr>
              ) : (
                filtered.map((post) => (
                  <tr key={post.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                    <td className="px-4 py-3">
                      <div className="font-medium">{post.title}</div>
                      <div className="text-xs text-gray-400 line-clamp-1">{post.excerpt}</div>
                    </td>
                    <td className="px-4 py-3 text-center">{post.category}</td>
                    <td className="px-4 py-3 text-center">{new Date(post.date).toLocaleDateString('es-ES')}</td>
                    <td className="px-4 py-3 text-center">{post.author}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button className="p-1 text-gray-400 hover:text-primary" onClick={() => setEditingPost(post)}>
                          <Edit size={16} />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-500" onClick={() => setDeletePostTarget(post)}>
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showNewPost && <NewPostModal onClose={() => setShowNewPost(false)} onCreate={handleCreatePost} />}
      {editingPost && <EditPostModal post={editingPost} onClose={() => setEditingPost(null)} onSave={handleSavePost} />}
      {deletePostTarget && (
        <ConfirmDeleteModal
          user={{ id: deletePostTarget.id, username: deletePostTarget.title }}
          onCancel={() => setDeletePostTarget(null)}
          onConfirm={handleDeletePost}
          label="articulo"
        />
      )}
    </div>
  );
};

export default AdminNews;
