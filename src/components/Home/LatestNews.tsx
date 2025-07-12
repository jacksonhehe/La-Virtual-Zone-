import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { formatDate, formatNewsType, getNewsTypeColor } from '../../utils/helpers';

const LatestNews = () => {
  const { newsItems } = useDataStore();

  if (!newsItems?.length) {
    return (
      <div className="p-6 text-sm text-gray-400">
        Cargando noticias…
      </div>
    );
  }

  // Get latest 4 news
  const latestNews = newsItems.slice(0, 4);
  
  return (
    <div className="card">
      <div className="p-6 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Últimas Noticias</h2>
          <Link 
            to="/blog" 
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
                <span className={`badge ${getNewsTypeColor(news.type)}`}>
                  {formatNewsType(news.type)}
                </span>
                <span className="text-gray-400 text-sm">
                  {formatDate(news.publishDate)}
                </span>
                {new Date(news.publishDate) > new Date() && (
                  <span className="badge bg-yellow-500/20 text-yellow-400">Programado</span>
                )}
              </div>
              
              <h3 className="font-medium mb-1">
                {news.title}
              </h3>
              
              <p className="text-gray-400 text-sm line-clamp-2">
                {news.content}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LatestNews;
 