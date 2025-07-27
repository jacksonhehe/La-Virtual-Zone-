import { formatDate, formatCurrency } from '@/utils/helpers';
import type { FeedItem } from '@/types';
import { User2 } from 'lucide-react';

interface Props { item: Extract<FeedItem, { type: 'transfer' }>; }

const TransferCard = ({ item }: Props) => (
  <a
    href={item.link}
    className="card p-4 flex gap-3 hover:border-primary focus-visible:outline-dashed focus-visible:outline-1 focus-visible:outline-accent"
    title={item.title}
  >
    <div className="w-10 h-10 bg-green-500/20 rounded flex items-center justify-center" aria-hidden="true">
      <User2 size={20} className="text-green-400" />
    </div>
    <div className="flex-1">
      <div className="text-xs text-gray-400 mb-1">{formatDate(item.date)}</div>
      <h3 className="font-medium mb-1">{item.title}</h3>
      <p className="text-sm text-gray-300">
        {item.summary}
        {item.meta.fee && ` por ${formatCurrency(item.meta.fee)}`}
      </p>
    </div>
  </a>
);

export default TransferCard;
