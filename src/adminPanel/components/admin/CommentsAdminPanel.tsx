import  React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, EyeOff, Trash, AlertTriangle, User, Clock } from 'lucide-react';
import type { Comment } from '../types';
import { useGlobalStore, subscribe as subscribeGlobal } from '../../store/globalStore';
import SearchFilter from './SearchFilter';
import StatsCard from './StatsCard';
import toast from 'react-hot-toast';

const CommentsAdminPanel = () => {
  const { comments, approveComment, hideComment, deleteComment, newsItems, posts } = useGlobalStore();
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(
    comments.filter(c => c.status === 'pending').length
  );

  useEffect(() => {
    const unsub = subscribeGlobal(
      state => state.comments.filter(c => c.status === 'pending').length,
      setPendingCount
    );
    return () => unsub();
  }, []);

  const filteredComments = comments.filter(comment => {
    const matchesFilter = filter === 'all' || comment.status === filter;
    
    let matchesSearch = false;
    if (search.trim()) {
      const searchTerm = search.toLowerCase();
      const postInfo = getPostInfo(comment.postId);
      
      matchesSearch = comment.content.toLowerCase().includes(searchTerm) ||
                     comment.author.toLowerCase().includes(searchTerm) ||
                     comment.postId.includes(searchTerm) ||
                     postInfo.title.toLowerCase().includes(searchTerm) ||
                     postInfo.category.toLowerCase().includes(searchTerm);
    } else {
      matchesSearch = true;
    }
    
    // Filtrar solo comentarios del blog si se especifica
    if (filter === 'blog') {
      const postInfo = getPostInfo(comment.postId);
      return matchesFilter && matchesSearch && (postInfo.type === 'Post' || postInfo.type === 'Noticia');
    }
    
    return matchesFilter && matchesSearch;
  });

  const approvedCount = comments.filter(c => c.status === 'approved').length;
  const hiddenCount = comments.filter(c => c.status === 'hidden').length;
  const flaggedCount = comments.filter(c => (c.flags || 0) > 0).length;
  const totalComments = comments.length;

  // Función para obtener información de la noticia/post
  const getPostInfo = (postId: string) => {
    // Buscar primero en posts, luego en newsItems
    const post = posts.find(p => p.id === postId);
    if (post) {
      return {
        title: post.title,
        type: 'Post',
        category: post.category || 'Blog'
      };
    }
    
    const news = newsItems.find(n => n.id === postId);
    if (news) {
      return {
        title: news.title,
        type: 'Noticia',
        category: news.category || 'Noticias'
      };
    }
    
    return {
      title: `Post ID: ${postId}`,
      type: 'Desconocido',
      category: 'Sin categoría'
    };
  };

  // Función para obtener comentarios del blog específicamente
  const getBlogComments = () => {
    return comments.filter(comment => {
      const postInfo = getPostInfo(comment.postId);
      return postInfo.type === 'Post' || postInfo.type === 'Noticia';
    });
  };

  const handleApprove = (id: string) => {
    approveComment(id);
    toast.success('Comentario aprobado');
  };

  const handleHide = (id: string) => {
    hideComment(id);
    toast.success('Comentario ocultado');
  };

  const handleDelete = () => {
    if (!deleteModal) return;
    deleteComment(deleteModal);
    setDeleteModal(null);
    toast.success('Comentario eliminado');
  };

  const getPriorityColor = (comment: Comment) => {
    const flags = comment.flags || 0;
    if (flags > 5) return 'border-red-500/50 bg-red-500/10';
    if (flags > 2) return 'border-yellow-500/50 bg-yellow-500/10';
    return 'border-gray-700/50';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'hidden': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Gestión de Comentarios</h1>
            <p className="text-gray-400">Modera y gestiona todos los comentarios del sistema, especialmente del Blog</p>
          </div>
          <div className="flex items-center space-x-4">
            {pendingCount > 0 && (
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle size={20} className="text-yellow-400" />
                  <span className="text-yellow-400 font-medium">{pendingCount} comentarios pendientes</span>
                </div>
              </div>
            )}
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <MessageSquare size={20} className="text-blue-400" />
                <span className="text-blue-400 font-medium">
                  {getBlogComments().length} comentarios del Blog
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <StatsCard
            title="Pendientes"
            value={pendingCount}
            icon={Clock}
            gradient="from-yellow-500 to-orange-600"
          />
          <StatsCard
            title="Aprobados"
            value={approvedCount}
            icon={CheckCircle}
            gradient="from-green-500 to-emerald-600"
          />
          <StatsCard
            title="Total Comentarios"
            value={totalComments}
            icon={MessageSquare}
            gradient="from-blue-500 to-cyan-600"
          />
          <StatsCard
            title="Comentarios Blog"
            value={getBlogComments().length}
            icon={MessageSquare}
            gradient="from-purple-500 to-pink-600"
          />
          <StatsCard
            title="Reportados"
            value={flaggedCount}
            icon={AlertTriangle}
            gradient="from-red-500 to-pink-600"
          />
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchFilter
                search={search}
                onSearchChange={setSearch}
                placeholder="Buscar por contenido, autor o título de noticia..."
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input min-w-[150px]"
            >
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobados</option>
              <option value="hidden">Ocultos</option>
              <option value="blog">Solo Blog</option>
              <option value="all">Todos</option>
            </select>
          </div>

          <div className="grid gap-4">
            {filteredComments.length > 0 ? (
              filteredComments.map((comment) => (
                <div key={comment.id} className={`bg-gray-900/50 rounded-lg border hover:border-primary/30 transition-all ${getPriorityColor(comment)}`}>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                          <MessageSquare size={20} className="text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <User size={16} className="text-gray-400" />
                            <span className="font-medium text-white">{comment.author}</span>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(comment.status)}`}>
                              {comment.status === 'pending' ? 'Pendiente' : 
                               comment.status === 'approved' ? 'Aprobado' : 'Oculto'}
                            </span>
                            {(comment.flags || 0) > 0 && (
                              <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                                {comment.flags || 0} reportes
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            {getPostInfo(comment.postId).type}: {getPostInfo(comment.postId).title} • {new Date(comment.date).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedComment(selectedComment === comment.id ? null : comment.id)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <MessageSquare size={18} />
                        </button>
                        {comment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(comment.id)}
                              className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                              title="Aprobar comentario"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleHide(comment.id)}
                              className="p-2 text-gray-400 hover:bg-gray-500/10 rounded-lg transition-colors"
                              title="Ocultar comentario"
                            >
                              <EyeOff size={18} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setDeleteModal(comment.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Eliminar comentario"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                      <p className="text-gray-300 leading-relaxed">{comment.content}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="text-gray-400">
                          <span className="font-medium text-white">{comment.likes || 0}</span> likes
                        </div>
                        <div className="text-gray-400">
                          <span className="font-medium text-white">{comment.replies?.length || 0}</span> respuestas
                        </div>
                      </div>
                      <div className="text-gray-400">
                        Última actividad: {new Date(comment.updatedAt || comment.date).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Sección expandible con detalles */}
                    {selectedComment === comment.id && (
                      <div className="border-t border-gray-700/50 pt-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Información del Post</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Tipo:</span>
                                <span className="text-white">{getPostInfo(comment.postId).type}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Categoría:</span>
                                <span className="text-white">{getPostInfo(comment.postId).category}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Título:</span>
                                <span className="text-white text-xs max-w-[200px] truncate">{getPostInfo(comment.postId).title}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Post ID:</span>
                                <span className="text-white font-mono text-xs">{comment.postId}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Información del Usuario</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Usuario ID:</span>
                                <span className="text-white font-mono text-xs">{comment.userId || comment.author}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Autor:</span>
                                <span className="text-white">{comment.author}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Estado:</span>
                                <span className="text-white capitalize">{comment.status}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Reportes:</span>
                                <span className="text-white">{comment.flags || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageSquare size={48} className="text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">
                  {filter === 'blog' ? 'No se encontraron comentarios del Blog' : 'No se encontraron comentarios'}
                </h3>
                <p className="text-gray-500">
                  {filter === 'blog' 
                    ? 'No hay comentarios en las noticias del blog con los filtros aplicados'
                    : 'Intenta ajustar los filtros de búsqueda'
                  }
                </p>
                {filter === 'blog' && (
                  <div className="mt-4 text-sm text-gray-400">
                    <p>Los comentarios del Blog aparecen cuando los usuarios comentan en las noticias publicadas.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Eliminar Comentario</h3>
            <p className="text-gray-400 mb-6">¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer.</p>
            <div className="flex space-x-3 justify-end">
              <button 
                onClick={() => setDeleteModal(null)} 
                className="btn-outline"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDelete} 
                className="btn-danger"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CommentsAdminPanel;
 