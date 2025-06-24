import { Link } from 'react-router-dom';
import { Newspaper } from 'lucide-react';
import Card from '../../components/common/Card';
import { useDataStore } from '../../store/dataStore';
import { formatDate } from '../../utils/helpers';

const LatestNews = () => {
  const { news } = useDataStore();
  const latestNews = news.slice(0, 3);

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold leading-tight">Últimas noticias</h3>
        <Link
          to="/liga-master/feed"
          className="text-accent text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-accent"
        >
          Ver todo
        </Link>
      </div>
      <ul className="space-y-3">
        {latestNews.map(item => (
          <li key={item.id} className="flex items-center justify-between">
            <div className="flex items-center">
              <Newspaper size={16} className="mr-2 text-accent" />
              <span>{item.title}</span>
            </div>
            <span className="text-xs text-gray-400">
              {formatDate(item.publishDate)}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default LatestNews;
