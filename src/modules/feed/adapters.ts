import type { NewsItem, Tournament, Transfer } from '../../types';
import type { Club } from '../../types/shared';
import type { FeedItem, MatchMeta, NewsMeta, TransferMeta, AchievementMeta } from '../../types';

// Eventos de calendario que aún no cuentan con slice dedicado
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  category: string;
}

// Adaptador de noticias
export const mapNews = (news: NewsItem[]): FeedItem[] =>
  news.map(n => ({
    id: `news-${n.id}`,
    type: 'news',
    title: n.title,
    date: new Date(n.publishDate).toISOString(),
    summary: n.content,
    link: `/blog/${n.id}`,
    meta: { category: n.category, image: n.imageUrl } as NewsMeta
  }));

// Adaptador de fichajes
export const mapTransfers = (transfers: Transfer[]): FeedItem[] =>
  transfers.map(t => ({
    id: `transfer-${t.id}`,
    type: 'transfer',
    title: `${t.playerName} al ${t.toClub}`,
    date: new Date(t.date).toISOString(),
    summary: `${t.playerName} pasa de ${t.fromClub} a ${t.toClub}.`,
    link: '/liga-master/mercado',
    meta: { player: t.playerName, from: t.fromClub, to: t.toClub, fee: t.fee } as TransferMeta
  }));

// Adaptador de partidos de torneos
export const mapMatches = (tournaments: Tournament[]): FeedItem[] =>
  tournaments.flatMap(t =>
    t.matches.map(m => ({
      id: `match-${m.id}`,
      type: 'match',
      title: `${m.homeTeam} vs ${m.awayTeam}`,
      date: new Date(m.date).toISOString(),
      summary:
        m.status === 'finished' && m.homeScore !== undefined && m.awayScore !== undefined
          ? `${m.homeTeam} ${m.homeScore}-${m.awayScore} ${m.awayTeam}`
          : `Jornada ${m.round} • ${t.name}`,
      link: '/liga-master/fixture',
      meta: {
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        status: m.status,
        score:
          m.homeScore !== undefined && m.awayScore !== undefined
            ? { home: m.homeScore, away: m.awayScore }
            : undefined,
        tournament: t.name
      } as MatchMeta
    }))
  );

// Adaptador de logros basados en títulos de clubes
export const mapAchievements = (clubs: Club[]): FeedItem[] =>
  clubs.flatMap(c =>
    c.titles.map(title => ({
      id: `ach-${c.id}-${title.id}`,
      type: 'achievement',
      title: `${c.name} ganó ${title.name}`,
      date: `${title.year}-01-01T00:00:00.000Z`,
      summary: `${c.name} se coronó campeón de ${title.name} en ${title.year}.`,
      link: `/liga-master/club/${c.slug}`,
      meta: { club: c.name, emblem: c.logo } as AchievementMeta
    }))
  );

// Adaptador para eventos de calendario simples
export const mapCalendarEvents = (events: CalendarEvent[]): FeedItem[] =>
  events.map(ev => ({
    id: `ev-${ev.id}`,
    type: 'event',
    title: ev.title,
    date: new Date(ev.date).toISOString(),
    summary: ev.title,
    link: '/liga-master/calendario',
    meta: { label: ev.category }
  }));

// Unifica todas las fuentes en una sola lista ordenada
export const buildFeed = (sources: {
  news: NewsItem[];
  transfers: Transfer[];
  tournaments: Tournament[];
  clubs: Club[];
  events: CalendarEvent[];
}): FeedItem[] => {
  const items = [
    ...mapNews(sources.news),
    ...mapTransfers(sources.transfers),
    ...mapMatches(sources.tournaments),
    ...mapCalendarEvents(sources.events),
    ...mapAchievements(sources.clubs)
  ];
  const unique = new Map<string, FeedItem>();
  for (const item of items) unique.set(item.id, item);
  return Array.from(unique.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};
