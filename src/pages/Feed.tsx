import { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/common/PageHeader';
import FilterChip from '../components/common/FilterChip';
import useFeedItems from '../hooks/useFeedItems';
import usePersistentState from '../hooks/usePersistentState';
import NewsCard from '../components/feed/NewsCard';
import MatchCard from '../components/feed/MatchCard';
import TransferCard from '../components/feed/TransferCard';
import AchievementCard from '../components/feed/AchievementCard';
import EventCard from '../components/feed/EventCard';
import CardSkeleton from '../components/common/CardSkeleton';
import SEO from '../components/SEO';
import { VZ_FEED_PREFS_KEY } from '../utils/storageKeys';
import type { FeedItem } from '../types';

const ITEMS_PER_PAGE = 20;

const Feed = () => {
  const items = useFeedItems();

  const [prefs, setPrefs] = usePersistentState(VZ_FEED_PREFS_KEY, {
    filter: 'all' as 'all' | FeedItem['type'],
    query: '',
    range: 'all' as 'all' | '7d' | '30d',
    sort: 'date' as 'date' | 'relevance'
  });

  const [visible, setVisible] = useState(ITEMS_PER_PAGE);
  const [loading, setLoading] = useState(true);
  const loader = useRef<HTMLDivElement | null>(null);
  const liveRef = useRef<HTMLDivElement | null>(null);

  // Reset visible when preferences change
  useEffect(() => {
    setVisible(ITEMS_PER_PAGE);
  }, [prefs]);

  // Simulate async loading for skeletons
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, [visible, prefs]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const node = loader.current;
    if (!node) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setVisible(v => Math.min(v + ITEMS_PER_PAGE, filtered.length));
      }
    });
    obs.observe(node);
    return () => obs.disconnect();
  }, [loader, items, prefs]);

  const filtered = useMemo(() => {
    const now = Date.now();
    const q = prefs.query.toLowerCase();
    return items.filter(item => {
      if (prefs.filter !== 'all' && item.type !== prefs.filter) return false;
      if (prefs.range !== 'all') {
        const days = prefs.range === '7d' ? 7 : 30;
        if (now - new Date(item.date).getTime() > days * 86400000) return false;
      }
      if (
        q &&
        !(
          item.title.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q)
        )
      )
        return false;
      return true;
    });
  }, [items, prefs]);

  const sorted = useMemo(() => {
    if (prefs.sort === 'date' || !prefs.query) {
      return filtered.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
    const score = (it: FeedItem) => {
      const q = prefs.query.toLowerCase();
      return (
        (it.title.toLowerCase().includes(q) ? 2 : 0) +
        (it.summary.toLowerCase().includes(q) ? 1 : 0)
      );
    };
    return filtered
      .map(it => ({ it, s: score(it) }))
      .sort((a, b) => b.s - a.s || new Date(b.it.date).getTime() - new Date(a.it.date).getTime())
      .map(x => x.it);
  }, [filtered, prefs.sort, prefs.query]);

  const visibleItems = sorted.slice(0, visible);

  useEffect(() => {
    if (liveRef.current) {
      liveRef.current.textContent = `${visibleItems.length} elementos cargados`;
    }
  }, [visibleItems.length]);

  const clearFilters = () =>
    setPrefs({ filter: 'all', query: '', range: 'all', sort: 'date' });

  return (
    <div>
      <SEO
        title="Feed | La Virtual Zone"
        description="Eventos y noticias más relevantes de la comunidad"
        canonical="https://lavirtualzone.com/liga-master/feed"
      />
      <PageHeader
        title="Feed"
        subtitle="Eventos recientes de La Virtual Zone"
        image="https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?ixlib=rb-4.1.0"
      />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['all', 'news', 'match', 'event', 'transfer', 'achievement'] as const).map(t => (
              <FilterChip
                key={t}
                label={t === 'all' ? 'Todo' : t.charAt(0).toUpperCase() + t.slice(1)}
                active={prefs.filter === t}
                onClick={() => setPrefs(p => ({ ...p, filter: t }))}
              />
            ))}
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-56">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-500" aria-hidden="true" />
              </div>
              <input
                type="text"
                placeholder="Buscar..."
                className="input pl-10 w-full"
                value={prefs.query}
                onChange={e => setPrefs(p => ({ ...p, query: e.target.value }))}
              />
            </div>
            <select
              className="input py-2 pr-8 text-sm"
              value={prefs.range}
              onChange={e => setPrefs(p => ({ ...p, range: e.target.value as any }))}
            >
              <option value="all">Todo</option>
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
            </select>
            <select
              className="input py-2 pr-8 text-sm"
              value={prefs.sort}
              onChange={e => setPrefs(p => ({ ...p, sort: e.target.value as any }))}
            >
              <option value="date">Fecha</option>
              <option value="relevance">Relevancia</option>
            </select>
            <button
              className="btn-secondary whitespace-nowrap"
              onClick={clearFilters}
            >
              Limpiar
            </button>
          </div>
        </div>

        {loading && <CardSkeleton lines={3} className="mb-4" />}

        <ul className="space-y-4" role="list">
          <AnimatePresence>
            {visibleItems.map(item => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                role="listitem"
              >
                {item.type === 'news' && <NewsCard item={item} />}
                {item.type === 'match' && <MatchCard item={item} />}
                {item.type === 'transfer' && <TransferCard item={item} />}
                {item.type === 'achievement' && <AchievementCard item={item} />}
                {item.type === 'event' && <EventCard item={item} />}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        <div ref={loader} />
        <div aria-live="polite" className="sr-only" ref={liveRef} />
      </div>
    </div>
  );
};

export default Feed;
