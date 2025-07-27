import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import FilterChip from '../components/common/FilterChip';
import useFeedItems from '../hooks/useFeedItems';

const Feed = () => {
  const feedItems = useFeedItems();
  const [filter, setFilter] = useState<'all' | 'news' | 'match' | 'transfer' | 'achievement'>('all');
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(20);

  const filtered = feedItems.filter(item => {
    if (filter !== 'all' && item.type !== filter) return false;
    if (query && !item.title.toLowerCase().includes(query.toLowerCase()) && !item.summary.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const visibleItems = filtered.slice(0, visible);
  const canLoadMore = visible < filtered.length;

  return (
    <div>
      <PageHeader
        title="Feed"
        subtitle="Eventos recientes de La Virtual Zone"
        image="https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxlc3BvcnRzJTIwZ2FtaW5nJTIwZGFyayUyMHRoZW1lfGVufDB8fHx8MTc0NzA3MTE4MHww&ixlib=rb-4.1.0"
      />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <FilterChip label="Todo" active={filter==='all'} onClick={()=>{setFilter('all'); setVisible(20);}} />
            <FilterChip label="Noticias" active={filter==='news'} onClick={()=>{setFilter('news'); setVisible(20);}} />
            <FilterChip label="Partidos" active={filter==='match'} onClick={()=>{setFilter('match'); setVisible(20);}} />
            <FilterChip label="Fichajes" active={filter==='transfer'} onClick={()=>{setFilter('transfer'); setVisible(20);}} />
            <FilterChip label="Logros" active={filter==='achievement'} onClick={()=>{setFilter('achievement'); setVisible(20);}} />
          </div>
          <div className="relative max-w-xs w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              className="input pl-10 w-full"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setVisible(20); }}
            />
          </div>
        </div>

        <ul className="space-y-4" role="list">
          {visibleItems.map(item => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              role="listitem"
            >
              <a href={item.link} className="card p-4 flex space-x-4 hover:border-primary" title={item.title}>
                {item.media && (
                  <img src={item.media} alt="" className="w-20 h-20 object-cover rounded" />
                )}
                <div className="flex-1">
                  <div className="text-xs text-gray-400 mb-1">
                    {new Date(item.date).toLocaleDateString('es-ES')}
                  </div>
                  <h3 className="font-medium mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-300 line-clamp-2">{item.summary}</p>
                </div>
              </a>
            </motion.li>
          ))}
        </ul>

        {canLoadMore && (
          <div className="text-center mt-6">
            <button className="btn-primary" onClick={() => setVisible(v => v + 20)}>
              Cargar más
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
