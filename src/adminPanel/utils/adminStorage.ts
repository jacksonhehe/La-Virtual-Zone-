export interface AdminData {
  users: import('../types').User[];
  clubs: import('../types').Club[];
  players: import('../types').Player[];
  tournaments: import('../types').Tournament[];
  newsItems: import('../types').NewsItem[];
  transfers: import('../types').Transfer[];
  standings: import('../types').Standing[];
  activities: import('../types').ActivityLog[];
  comments: import('../types').Comment[];
}

const PREFIX = 'vz_';

const keys = {
  users: `${PREFIX}users_admin`,
  clubs: `${PREFIX}clubs_admin`,
  players: `${PREFIX}players_admin`,
  tournaments: `${PREFIX}tournaments_admin`,
  newsItems: `${PREFIX}news_admin`,
  transfers: `${PREFIX}transfers_admin`,
  standings: `${PREFIX}standings_admin`,
  activities: `${PREFIX}activities_admin`,
  comments: `${PREFIX}comments_admin`
};

export const loadAdminData = (defaults: AdminData): AdminData => {
  const data: AdminData = { ...defaults };
  Object.entries(keys).forEach(([prop, key]) => {
    const json = localStorage.getItem(key);
    if (json) {
      try {
        (data as any)[prop] = JSON.parse(json);
      } catch {
        // ignore parse errors and keep defaults
      }
    }
  });
  return data;
};

export const saveAdminData = (data: AdminData): void => {
  Object.entries(keys).forEach(([prop, key]) => {
    const value = (data as any)[prop];
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore write errors
    }
  });
};
