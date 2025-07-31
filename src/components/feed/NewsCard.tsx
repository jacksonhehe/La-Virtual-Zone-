import { formatDate } from '@/utils/helpers';
import type { FeedItem } from '@/types';

interface Props { item: Extract<FeedItem, { type: 'news' }>; }

const NewsCard = ({ item }: Props) => (
  <a
    href={item.link}
    className="card p-4 flex gap-4 hover:border-primary focus-visible:outline-dashed focus-visible:outline-1 focus-visible:outline-accent"
    title={item.title}
  >
    {item.meta.image && (
      <img
        src={item.meta.image}
        alt=""
        className="w-20 h-20 object-cover rounded"
        loading="lazy"
      />
    )}
    <div className="flex-1">
      <div className="text-xs text-gray-400 mb-1 flex items-center gap-2">
        <span>{formatDate(item.date)}</span>
        {item.meta.category && (
          <span className="badge bg-primary/20 text-primary whitespace-nowrap">
            {item.meta.category}
          </span>
        )}
      </div>
      <h3 className="font-medium mb-1">{item.title}</h3>
      <p className="text-sm text-gray-300 line-clamp-2">{item.summary}</p>
    </div>
  </a>
);

export default NewsCard;
