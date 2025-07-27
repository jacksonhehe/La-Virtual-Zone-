import { formatDate, formatTime } from '@/utils/helpers';
import type { FeedItem } from '@/types';

interface Props { item: Extract<FeedItem, { type: 'match' }>; }

const statusLabel = (status: string) => {
  if (status === 'live') return 'En vivo';
  if (status === 'finished') return 'Finalizado';
  return 'Programado';
};

const MatchCard = ({ item }: Props) => (
  <a
    href={item.link}
    className="card p-4 hover:border-primary focus-visible:outline-dashed focus-visible:outline-1 focus-visible:outline-accent"
    title={item.title}
  >
    <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
      <span>{formatDate(item.date)}</span>
      <span>{formatTime(item.date)}</span>
      <span
        className={`badge whitespace-nowrap ${
          item.meta.status === 'live'
            ? 'bg-red-500/20 text-red-400'
            : item.meta.status === 'finished'
            ? 'bg-green-500/20 text-green-400'
            : 'bg-yellow-500/20 text-yellow-400'
        }`}
      >
        {statusLabel(item.meta.status)}
      </span>
    </div>
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="font-medium">{item.meta.homeTeam}</span>
      </div>
      <div className="text-sm text-gray-300">
        {item.meta.score
          ? `${item.meta.score.home}-${item.meta.score.away}`
          : 'vs'}
      </div>
      <div className="flex items-center gap-2">
        <span className="font-medium">{item.meta.awayTeam}</span>
      </div>
    </div>
    {item.meta.tournament && (
      <div className="text-xs text-gray-400 mt-1">
        {item.meta.tournament}
      </div>
    )}
  </a>
);

export default MatchCard;
