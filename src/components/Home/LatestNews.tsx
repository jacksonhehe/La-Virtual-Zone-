import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getRecentNews } from '../../services/news';
import { formatDate } from '../../utils/helpers';
import type { NewsWithAuthor } from '../../types/supabase';

const prefetchBlog = () => import('../../pages/Blog');

const LatestNews = () => {
  const [latestNews, setLatestNews] = useState<NewsWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        setLoading(true);
        const { data, error } = await getRecentNews(4);
        
        if (error) {
          setError(error.message);
        } else if (data) {
          setLatestNews(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar noticias');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestNews();
  }, []);

  if (loading) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Últimas Noticias</h2>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Últimas Noticias</h2>
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (latestNews.length === 0) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Últimas Noticias</h2>
        <p className="text-gray-400">No hay noticias disponibles.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="p-6 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Últimas Noticias</h2>
          <Link
            to="/blog"
            onMouseEnter={prefetchBlog}
            className="text-primary hover:text-primary-light flex items-center text-sm"
          >
            <span>Ver todo</span>
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
      
      <div className="divide-y divide-gray-800">
        {latestNews.map((news) => (
          <Link key={news.id} to={`/blog/${news.id}`} className="block hover:bg-gray-800/50">
            <div className="p-4">
              <div className="flex items-start space-x-2 mb-2">
                <span className="badge bg-blue-500/20 text-blue-400">
                  Noticia
                </span>
                <span className="text-gray-400 text-sm">
                  {formatDate(news.created_at)}
                </span>
              </div>
              
              <h3 className="font-medium mb-1">
                {news.title}
              </h3>
              
              <p className="text-gray-400 text-sm line-clamp-2">
                {news.content}
              </p>
              
              {news.author && (
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <span>Por {news.author.username}</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LatestNews;
 