import { http, HttpResponse } from 'msw';

const fixtures = {
  tournaments: [{ id: 't1', name: 'Apertura' }, { id: 't2', name: 'Clausura' }],
  clubs: [
    { id: 'c1', name: 'Club 1' },
    { id: 'c2', name: 'Club 2' },
    { id: 'c3', name: 'Club 3' },
  ],
  players: [
    { id: 'p1', name: 'Jugador 1', clubId: 'c1' },
    { id: 'p2', name: 'Jugador 2', clubId: 'c2' },
  ],
  matches: [
    { id: 'm1', home: 'Club 1', away: 'Club 2', date: new Date().toISOString() },
    { id: 'm2', home: 'Club 3', away: 'Club 1', date: new Date(Date.now() + 86400000).toISOString() },
  ],
  transfers: [
    { id: 'tr1', playerId: 'p1', playerName: 'Jugador 1', fromClubId: 'c1', toClubId: 'c2', amount: 1200000, status: 'pending', date: new Date().toISOString() },
    { id: 'tr2', playerId: 'p2', playerName: 'Jugador 2', fromClubId: 'c2', toClubId: 'c3', amount: 500000, status: 'approved', date: new Date().toISOString() },
  ],
};

export const handlers = [
  // Dashboard summary
  http.get('/api/dashboard', async () => {
    return HttpResponse.json({
      tournaments: fixtures.tournaments,
      clubs: fixtures.clubs,
      players: fixtures.players,
      matches: fixtures.matches,
    });
  }),

  // Transfers list with optional status filter
  http.get('/api/transfers', async ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const data = fixtures.transfers.filter(t => !status || t.status === status);
    return HttpResponse.json(data);
  }),

  // Approve a transfer
  http.post('/api/transfers/:id/approve', async ({ params }) => {
    const id = String(params.id);
    const idx = fixtures.transfers.findIndex(t => t.id === id);
    if (idx >= 0) fixtures.transfers[idx].status = 'approved';
    return HttpResponse.json({ ok: true, id });
  }),

  // Reject a transfer
  http.post('/api/transfers/:id/reject', async ({ params, request }) => {
    const id = String(params.id);
    let reason = '';
    try {
      const body = await request.json();
      reason = body?.reason || '';
    } catch {}
    const idx = fixtures.transfers.findIndex(t => t.id === id);
    if (idx >= 0) fixtures.transfers[idx].status = 'rejected';
    return HttpResponse.json({ ok: true, id, reason });
  }),
];

export default handlers;
