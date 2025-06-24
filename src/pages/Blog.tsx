import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import { Calendar, Search, ChevronRight, FileText } from 'lucide-react';
import { useDataStore } from '../store/dataStore';

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { posts } = useDataStore();
  
  // Filter posts
  const filteredPosts = posts.filter(post => {
    if (selectedCategory !== 'all' && post.category !== selectedCategory) {
      return false;
    }
    
    if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase()) && !post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Get categories
  const categories = ['Noticias', 'Análisis', 'Fichajes', 'Comunidad', 'Humor'];
  
  return (
    <div>
      <PageHeader 
        title="Blog" 
        subtitle="Noticias, análisis, entrevistas y todo el contenido editorial sobre La Virtual Zone."
        image="https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxlc3BvcnRzJTIwZ2FtaW5nJTIwZGFyayUyMHRoZW1lfGVufDB8fHx8MTc0NzA3MTE4MHww&ixlib=rb-4.1.0"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar artículos..."
                  className="input pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {filteredPosts.length > 0 ? (
              <div className="space-y-8">
                {filteredPosts.map(post => (
                  <div key={post.id} className="bg-dark-light rounded-lg overflow-hidden border border-gray-800 group">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 aspect-video md:aspect-square overflow-hidden">
                        <img 
                          src={post.image} 
                          alt={post.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="md:w-2/3 p-6">
                        <div className="flex items-center mb-3">
                          <span className="text-xs text-primary border border-primary/50 rounded-full px-2 py-0.5 mr-2">
                            {post.category}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center">
                            <Calendar size={12} className="mr-1" />
                            {new Date(post.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                        
                        <Link to={`/blog/${post.slug}`}>
                          <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{post.title}</h2>
                        </Link>
                        
                        <p className="text-gray-400 mb-4">{post.excerpt}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                              <img 
                                src={`https://ui-avatars.com/api/?name=${post.author}&background=111827&color=fff&size=128`} 
                                alt={post.author} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-sm">{post.author}</span>
                          </div>
                          
                          <Link 
                            to={`/blog/${post.slug}`}
                            className="text-primary hover:text-primary-light text-sm flex items-center"
                          >
                            <span>Leer más</span>
                            <ChevronRight size={16} className="ml-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-dark-light rounded-lg border border-gray-800">
                <FileText size={48} className="mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-bold mb-2">No se encontraron artículos</h3>
                <p className="text-gray-400">
                  No hay artículos que coincidan con tu búsqueda. Intenta con otros términos o categorías.
                </p>
              </div>
            )}
          </div>
          
          <div>
            <div className="bg-dark-light rounded-lg border border-gray-800 p-6 mb-6">
              <h3 className="font-bold mb-4">Categorías</h3>
              
              <div className="space-y-2">
                <button 
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left p-2 rounded-lg ${selectedCategory === 'all' ? 'bg-primary/20 text-primary' : 'hover:bg-dark'}`}
                >
                  Todas las categorías
                </button>
                
                {categories.map(category => (
                  <button 
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left p-2 rounded-lg ${selectedCategory === category ? 'bg-primary/20 text-primary' : 'hover:bg-dark'}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-dark-light rounded-lg border border-gray-800 p-6 mb-6">
              <h3 className="font-bold mb-4">Artículos destacados</h3>
              
              <div className="space-y-4">
                {posts.slice(0, 3).map(post => (
                  <Link 
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="flex items-start group"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 mr-3">
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium group-hover:text-primary transition-colors">{post.title}</h4>
                      <div className="flex items-center mt-1 text-xs text-gray-400">
                        <Calendar size={12} className="mr-1" />
                        <span>{new Date(post.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="bg-dark-light rounded-lg border border-gray-800 p-6">
              <h3 className="font-bold mb-4">Etiquetas populares</h3>
              
              <div className="flex flex-wrap gap-2">
                <span className="bg-dark px-3 py-1 rounded-lg text-sm hover:bg-dark-lighter cursor-pointer">
                  liga-master
                </span>
                <span className="bg-dark px-3 py-1 rounded-lg text-sm hover:bg-dark-lighter cursor-pointer">
                  torneos
                </span>
                <span className="bg-dark px-3 py-1 rounded-lg text-sm hover:bg-dark-lighter cursor-pointer">
                  fichajes
                </span>
                <span className="bg-dark px-3 py-1 rounded-lg text-sm hover:bg-dark-lighter cursor-pointer">
                  análisis
                </span>
                <span className="bg-dark px-3 py-1 rounded-lg text-sm hover:bg-dark-lighter cursor-pointer">
                  entrevistas
                </span>
                <span className="bg-dark px-3 py-1 rounded-lg text-sm hover:bg-dark-lighter cursor-pointer">
                  resultados
                </span>
                <span className="bg-dark px-3 py-1 rounded-lg text-sm hover:bg-dark-lighter cursor-pointer">
                  clubes
                </span>
                <span className="bg-dark px-3 py-1 rounded-lg text-sm hover:bg-dark-lighter cursor-pointer">
                  jugadores
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
 