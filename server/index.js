// Simple Express backend for transfers
// Run: npm i express cors
// Then: node server/index.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4000;
const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '2mb' }));

const DB = path.join(__dirname, 'data', 'transfers.json');

function readDb() {
  try {
    const raw = fs.readFileSync(DB, 'utf8');
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return data;
    return [];
  } catch (e) {
    return [];
  }
}
function writeDb(arr) {
  fs.writeFileSync(DB, JSON.stringify(arr, null, 2), 'utf8');
}

// Basic normalization/validation
function normalize(t) {
  const out = { ...t };
  out.id = String(out.id ?? '').trim();
  out.playerId = out.playerId != null ? String(out.playerId) : '';
  out.playerName = out.playerName != null ? String(out.playerName) : '';
  out.fromClubId = out.fromClubId != null ? String(out.fromClubId) : (out.from ?? '');
  out.fromClubName = out.fromClubName != null ? String(out.fromClubName) : '';
  out.toClubId = out.toClubId != null ? String(out.toClubId) : (out.to ?? '');
  out.toClubName = out.toClubName != null ? String(out.toClubName) : '';
  const amount = (out.amount ?? out.fee ?? 0);
  out.amount = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  out.status = ['pending', 'approved', 'rejected'].includes(out.status) ? out.status : 'pending';
  out.createdAt = out.createdAt || out.date || new Date().toISOString();
  return out;
}

// --- Routes ---

app.get('/api/transfers', (req, res) => {
  const all = readDb();
  res.json({ items: all });
});

app.post('/api/transfers/import', (req, res) => {
  const payload = Array.isArray(req.body) ? req.body : (req.body.items || []);
  if (!Array.isArray(payload)) return res.status(400).json({ error: 'Body must be an array or {items: []}' });
  const incoming = payload.map(normalize).filter(x => x.id);
  const db = readDb();
  const map = new Map(db.map(x => [String(x.id), x]));

  let inserted = 0, updated = 0;
  for (const item of incoming) {
    const key = String(item.id);
    if (map.has(key)) {
      map.set(key, { ...map.get(key), ...item }); // merge
      updated++;
    } else {
      map.set(key, item);
      inserted++;
    }
  }
  const next = Array.from(map.values());
  writeDb(next);
  res.json({ inserted, updated, total: next.length });
});

app.post('/api/transfers/:id/approve', (req, res) => {
  const id = String(req.params.id);
  const db = readDb();
  const idx = db.findIndex(x => String(x.id) === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db[idx].status = 'approved';
  writeDb(db);
  res.json({ ok: true });
});

app.post('/api/transfers/:id/reject', (req, res) => {
  const id = String(req.params.id);
  const db = readDb();
  const idx = db.findIndex(x => String(x.id) === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db[idx].status = 'rejected';
  db[idx].rejectReason = (req.body && req.body.reason) ? String(req.body.reason) : '';
  writeDb(db);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});