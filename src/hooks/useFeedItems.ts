import { useMemo } from 'react';
import { useDataStore } from '../store/dataStore';
import { FeedItem } from '../types';

const useFeedItems = (): FeedItem[] => {
  const { newsItems, transfers, tournaments, clubs } = useDataStore();

  return useMemo(() => {
    const items: FeedItem[] = [];

    // Noticias
    newsItems.forEach(n => {
      items.push({
        id: `news-${n.id}`,
        type: 'news',
        title: n.title,
        date: n.publishDate,
        summary: n.content,
        link: `/blog/${n.id}`,
        media: n.imageUrl
      });
    });

    // Fichajes confirmados
    transfers.forEach(t => {
      items.push({
        id: `transfer-${t.id}`,
        type: 'transfer',
        title: `${t.playerName} al ${t.toClub}`,
        date: t.date,
        summary: `${t.playerName} pasa de ${t.fromClub} a ${t.toClub}.`,
        link: '#'
      });
    });

    // Partidos y resultados
    tournaments.forEach(t => {
      t.matches.forEach(m => {
        const title = `${m.homeTeam} vs ${m.awayTeam}`;
        const summary = m.status === 'finished' && m.homeScore !== undefined && m.awayScore !== undefined
          ? `${m.homeTeam} ${m.homeScore}-${m.awayScore} ${m.awayTeam}`
          : `Jornada ${m.round} • ${t.name}`;
        items.push({
          id: `match-${m.id}`,
          type: 'match',
          title,
          date: m.date,
          summary,
          link: '/liga-master/fixture'
        });
      });
    });

    // Logros (títulos de club)
    clubs.forEach(c => {
      c.titles.forEach(title => {
        items.push({
          id: `ach-${c.id}-${title.id}`,
          type: 'achievement',
          title: `${c.name} ganó ${title.name}`,
          date: `${title.year}-01-01`,
          summary: `${c.name} se coronó campeón de ${title.name} en ${title.year}.`,
          link: `/liga-master/club/${c.slug}`
        });
      });
    });

    return items.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [newsItems, transfers, tournaments, clubs]);
};

export default useFeedItems;
