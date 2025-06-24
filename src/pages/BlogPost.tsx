import { useParams, Link } from 'react-router-dom';
import { Calendar, ChevronLeft, MessageSquare, Share, ThumbsUp, ArrowRight } from 'lucide-react';
import { useDataStore } from '../store/dataStore';
import Comments from '../components/comments/Comments';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  const { posts } = useDataStore();
  
  // Find post by slug
  const post = posts.find(p => p.slug === slug);
  
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
                  <button className="bg-dark-lighter hover:bg-dark rounded-full p-2 transition-colors">
                    <ThumbsUp size={16} className="text-gray-400 hover:text-primary" />
                  </button>
                  <button className="bg-dark-lighter hover:bg-dark rounded-full p-2 transition-colors">
                    <MessageSquare size={16} className="text-gray-400 hover:text-primary" />
                  </button>
                  <button className="bg-dark-lighter hover:bg-dark rounded-full p-2 transition-colors">
                    <Share size={16} className="text-gray-400 hover:text-primary" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Link 
                    to={`/blog?category=${post.category}`}
                    className="bg-dark-lighter hover:bg-dark px-3 py-1 rounded-lg text-sm transition-colors"
                  >
                    {post.category}
                  </Link>
                </div>
              </div>
            </div>
            
            <Comments postId={post.id} />
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
 