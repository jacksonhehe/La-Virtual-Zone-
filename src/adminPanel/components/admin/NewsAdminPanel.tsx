import  React, { useState } from 'react';
import { Edit, Plus, Trash, Search, Filter, Calendar, User, Eye, EyeOff, FileText, Image, Star } from 'lucide-react';
import SearchFilter from './SearchFilter';
import StatsCard from './StatsCard';

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  status: 'draft' | 'published' | 'archived';
  category: string;
  views: number;
  featured: boolean;
  image?: string;
  tags: string[];
}

const NewsAdminPanel = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([
    {
      id: '1',
      title: 'Nueva temporada de La Virtual Zone comienza en enero',
      content: 'La nueva temporada promete grandes emociones...',
      author: 'Admin Principal',
      date: '2024-12-15',
      status: 'published',
      category: 'Anuncios',
      views: 1250,
      featured: true,
      image: 'https://images.unsplash.com/photo-1742805382179-d22698ed535a?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwzfHxuZXdzJTIwbWFuYWdlbWVudCUyMGFkbWluJTIwcGFuZWwlMjBkYXNoYm9hcmR8ZW58MHx8fHwxNzUxNDcyOTkyfDA&ixlib=rb-4.1.0&fit=fillmax&h=600&w=800',
      tags: ['temporada', 'anuncio']
    },
    {
      id: '2',
      title: 'Nuevas reglas del mercado de fichajes',
      content: 'Se implementan cambios importantes en las transferencias...',
      author: 'Admin Deportivo',
      date: '2024-12-10',
      status: 'published',
      category: 'Reglas',
      views: 890,
      featured: false,
      tags: ['mercado', 'reglas']
    },
    {
      id: '3',
      title: 'Mantenimiento programado del sistema',
      content: 'El sistema estará en mantenimiento el próximo viernes...',
      author: 'Admin Técnico',
      date: '2024-12-08',
      status: 'draft',
      category: 'Técnico',
      views: 0,
      featured: false,
      tags: ['mantenimiento', 'sistema']
    }
  ]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(search.toLowerCase()) ||
                         article.author.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const publishedCount = articles.filter(a => a.status === 'published').length;
  const draftCount = articles.filter(a => a.status === 'draft').length;
  const totalViews = articles.reduce((sum, a) => sum + a.views, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'draft': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'archived': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Anuncios': return 'bg-blue-500/20 text-blue-300';
      case 'Reglas': return 'bg-purple-500/20 text-purple-300';
      case 'Técnico': return 'bg-orange-500/20 text-orange-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
          <div className="relative flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg">
                  <FileText size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Gestión de Noticias
                  </h1>
                  <p className="text-gray-300 text-lg mt-2">Control de contenido y comunicaciones</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25 flex items-center space-x-2">
                <Plus size={20} />
                <span>Nueva Noticia</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Publicadas"
            value={publishedCount}
            icon={Eye}
            gradient="from-green-500 to-emerald-600"
          />
          <StatsCard
            title="Borradores"
            value={draftCount}
            icon={Edit}
            gradient="from-yellow-500 to-orange-600"
          />
          <StatsCard
            title="Total Vistas"
            value={totalViews.toLocaleString()}
            icon={User}
            gradient="from-blue-500 to-cyan-600"
          />
          <StatsCard
            title="Destacadas"
            value={articles.filter(a => a.featured).length}
            icon={Star}
            gradient="from-purple-500 to-pink-600"
          />
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar noticias por título o autor..."
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="all">Todos los estados</option>
                <option value="published">Publicadas</option>
                <option value="draft">Borradores</option>
                <option value="archived">Archivadas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid gap-6">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden hover:border-gray-600/50 transition-all duration-300 group"
            >
              <div className="flex flex-col lg:flex-row">
                {/* Article Image */}
                {article.image && (
                  <div className="lg:w-64 h-48 lg:h-auto overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                {/* Article Content */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(article.status)}`}>
                          {article.status === 'published' ? 'Publicada' :
                           article.status === 'draft' ? 'Borrador' : 'Archivada'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                          {article.category}
                        </span>
                        {article.featured && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 flex items-center gap-1">
                            <Star size={12} />
                            Destacada
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                        {article.title}
                      </h3>
                      
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {article.content}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <User size={14} />
                            <span>{article.author}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar size={14} />
                            <span>{new Date(article.date).toLocaleDateString('es-ES')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye size={14} />
                            <span>{article.views.toLocaleString()} vistas</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {article.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded-md text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                        <Edit size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:bg-gray-500/10 rounded-lg transition-colors">
                        {article.status === 'published' ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No se encontraron noticias</h3>
            <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsAdminPanel;
 