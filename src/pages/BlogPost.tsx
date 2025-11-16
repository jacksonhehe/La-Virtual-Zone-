import  { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Calendar, User, Tag, ChevronLeft, MessageSquare, Share, ThumbsUp, ArrowRight } from 'lucide-react';
import { useDataStore } from '../store/dataStore';
import { useAuthStore } from '../store/authStore';
import { getCommentsForPost, addComment, updateCommentLikes, initializeComments } from '../utils/commentService';
import { Comment } from '../types';

const BlogPost = () => {
  // The route is defined as /blog/:postId in App.tsx
  // We treat :postId as the post slug
  const { postId } = useParams<{ postId: string }>();

  const { posts, refreshPosts } = useDataStore();
  const { user } = useAuthStore();

  // Comment form state
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);

  // Find post by slug or ID
  const post = posts.find(p => p.slug === postId || p.id === postId);

  useEffect(() => {
    refreshPosts();
    initializeComments().catch(error => {
      console.error('BlogPost: failed to initialize comments', error);
    });
  }, [refreshPosts]);

  useEffect(() => {
    let cancelled = false;
    const loadComments = async () => {
      if (!post) return;
      const postComments = await getCommentsForPost(post.id);
      if (!cancelled) {
        setComments(postComments);
      }
    };
    loadComments();
    return () => {
      cancelled = true;
    };
  }, [post]);

  // Handle comment submission
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!post || !commentText.trim()) {
      setSubmitMessage('Por favor, escribe un comentario antes de enviar.');
      return;
    }

    if (commentText.trim().length < 5) {
      setSubmitMessage('El comentario debe tener al menos 5 caracteres.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const authorName =
        user?.username?.trim() ||
        user?.email?.split('@')[0] ||
        'Usuario Anónimo';
      const avatarUrl = user?.avatar?.trim();
      const newComment = await addComment(post.id, authorName, commentText, {
        avatarUrl,
      });

      console.log('BlogPost: Comment submitted:', newComment);

      // Update local state
      setComments(prev => [newComment, ...prev]);
      setCommentText('');
      setSubmitMessage('¡Comentario enviado exitosamente!');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSubmitMessage('');
      }, 3000);

    } catch (error) {
      console.error('BlogPost: Error submitting comment:', error);
      setSubmitMessage('Error al enviar el comentario. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle like comment
  const handleLikeComment = async (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    const newLikesCount = comment.likes + 1;
    try {
      const updatedComment = await updateCommentLikes(commentId, newLikesCount);
      if (updatedComment) {
        setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c));
      }
    } catch (error) {
      console.error('BlogPost: failed to like comment', error);
    }
  };
  
  if (!post) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Artículo no encontrado</h2>
        <p className="text-gray-400 mb-8">El artículo que estás buscando no existe o ha sido eliminado.</p>
        <Link to="/blog" className="btn-primary">
          Volver al Blog
        </Link>
      </div>
    );
  }
  
  // Get related posts
  const relatedPosts = posts.filter(p => p.id !== post.id && p.category === post.category).slice(0, 2);
  
  return (
    <div>
      <div className="relative h-80 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark to-dark/70"></div>
        </div>
        
        <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-8 relative z-10">
          <div className="flex items-center mb-3">
            <span className="bg-primary/80 text-white rounded-full px-3 py-1 text-sm mr-3">
              {post.category}
            </span>
            <span className="text-gray-300 flex items-center text-sm">
              <Calendar size={14} className="mr-1" />
              {new Date(post.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {post.title}
          </h1>
          
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
              <img 
                src={`https://ui-avatars.com/api/?name=${post.author}&background=111827&color=fff&size=128`} 
                alt={post.author} 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-gray-300">Por {post.author}</span>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Link 
                to="/blog"
                className="inline-flex items-center text-primary hover:text-primary-light"
              >
                <ChevronLeft size={16} className="mr-1" />
                <span>Volver al Blog</span>
              </Link>
            </div>
            
            <div className="bg-dark-light rounded-lg border border-gray-800 p-6 md:p-8 mb-8">
              <div className="prose prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>
              
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-800">
                <div className="flex items-center space-x-3">
                  <button
                    className="bg-dark-lighter hover:bg-dark rounded-full p-2 transition-colors"
                    onClick={() => {
                      const url = window.location.href;
                      navigator.clipboard.writeText(url);
                      // Aquí podrías mostrar una notificación de "Copiado al portapapeles"
                    }}
                    title="Compartir artículo"
                  >
                    <Share size={16} className="text-gray-400 hover:text-primary" />
                  </button>
                  <button
                    className="bg-dark-lighter hover:bg-dark rounded-full p-2 transition-colors"
                    onClick={() => {
                      const url = window.location.href;
                      const text = `Lee este artículo: ${post.title}`;
                      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    title="Compartir en Twitter"
                  >
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" className="text-gray-400 hover:text-primary">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </button>
                  <button
                    className="bg-dark-lighter hover:bg-dark rounded-full p-2 transition-colors"
                    onClick={() => {
                      const url = window.location.href;
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                    }}
                    title="Compartir en Facebook"
                  >
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" className="text-gray-400 hover:text-primary">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/blog?category=${post.category}`}
                    className="bg-dark-lighter hover:bg-dark px-3 py-1 rounded-lg text-sm transition-colors"
                  >
                    {post.category}
                  </Link>
                  <span className="text-gray-400 text-sm">
                    • {Math.ceil(post.content.length / 1000)} min de lectura
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-dark-light rounded-lg border border-gray-800 p-6">
              <h3 className="font-bold text-lg mb-6">
                Comentarios {comments.length > 0 && `(${comments.length})`}
              </h3>
              
              <div className="space-y-6">
                {comments.length > 0 ? (
                  comments.map(comment => (
                    <div key={comment.id} className="flex">
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
                        <img
                          src={comment.authorAvatar}
                          alt={comment.author}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="bg-dark rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{comment.author}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(comment.date).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short'
                              })}
                              {new Date(comment.date).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                              }) !== '00:00' && (
                                ` a las ${new Date(comment.date).toLocaleTimeString('es-ES', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}`
                              )}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">
                            {comment.content}
                          </p>
                        </div>

                        <div className="flex items-center mt-2 text-xs text-gray-400 space-x-4">
                          <button
                            className="hover:text-primary transition-colors flex items-center"
                            onClick={() => handleLikeComment(comment.id)}
                          >
                            <ThumbsUp size={12} className="mr-1" />
                            {comment.likes > 0 ? `${comment.likes} ${comment.likes === 1 ? 'me gusta' : 'me gusta'}` : 'Me gusta'}
                          </button>
                          <button className="hover:text-primary transition-colors">Responder</button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
                  </div>
                )}
              </div>
              
              <div className="mt-8">
                <h4 className="font-medium mb-3">Deja un comentario</h4>

                {submitMessage && (
                  <div className={`p-3 rounded-lg mb-4 text-sm ${submitMessage.includes('Error') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                    {submitMessage}
                  </div>
                )}

                <form onSubmit={handleSubmitComment}>
                  <textarea
                    className="input w-full min-h-[100px] mb-3"
                    placeholder="Escribe tu comentario aquí..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="submit"
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting || !commentText.trim()}
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar comentario'}
                  </button>
                </form>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-dark-light rounded-lg border border-gray-800 p-6 mb-6">
              <h3 className="font-bold mb-4">Sobre el autor</h3>
              
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${post.author}&background=111827&color=fff&size=128`} 
                    alt={post.author} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold">{post.author}</h4>
                  <p className="text-sm text-gray-400">Editor en La Virtual Zone</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-300 mb-4">
                Escritor especializado en análisis táctico y cobertura de eventos de La Virtual Zone desde 2023.
              </p>
              
              <Link 
                to={`/usuarios/${post.author.toLowerCase()}`}
                className="text-primary hover:text-primary-light text-sm flex items-center"
              >
                <span>Ver perfil</span>
                <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
            
            {relatedPosts.length > 0 && (
              <div className="bg-dark-light rounded-lg border border-gray-800 p-6 mb-6">
                <h3 className="font-bold mb-4">Artículos relacionados</h3>
                
                <div className="space-y-4">
                  {relatedPosts.map(relatedPost => (
                    <Link 
                      key={relatedPost.id}
                      to={`/blog/${relatedPost.slug}`}
                      className="flex items-start group"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 mr-3">
                        <img 
                          src={relatedPost.image} 
                          alt={relatedPost.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium group-hover:text-primary transition-colors">{relatedPost.title}</h4>
                        <div className="flex items-center mt-1 text-xs text-gray-400">
                          <Calendar size={12} className="mr-1" />
                          <span>{new Date(relatedPost.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-dark-light rounded-lg border border-gray-800 p-6">
              <h3 className="font-bold mb-4">Categorías</h3>
              
              <div className="space-y-2">
                <Link 
                  to="/blog?category=Noticias"
                  className="block p-2 rounded-lg hover:bg-dark transition-colors"
                >
                  Noticias
                </Link>
                <Link 
                  to="/blog?category=Análisis"
                  className="block p-2 rounded-lg hover:bg-dark transition-colors"
                >
                  Análisis
                </Link>
                <Link 
                  to="/blog?category=Fichajes"
                  className="block p-2 rounded-lg hover:bg-dark transition-colors"
                >
                  Fichajes
                </Link>
                <Link 
                  to="/blog?category=Comunidad"
                  className="block p-2 rounded-lg hover:bg-dark transition-colors"
                >
                  Comunidad
                </Link>
                <Link 
                  to="/blog?category=Humor"
                  className="block p-2 rounded-lg hover:bg-dark transition-colors"
                >
                  Humor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
 
