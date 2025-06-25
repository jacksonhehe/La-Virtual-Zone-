import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

const read = (name) => JSON.parse(fs.readFileSync(path.join(__dirname, 'data', name), 'utf-8'));

app.get('/clubs', (req, res) => {
  res.json(read('clubs.json'));
});

app.get('/players', (req, res) => {
  res.json(read('players.json'));
});

app.get('/fixtures', (req, res) => {
  res.json(read('fixtures.json'));
});

app.get('/rankings', (req, res) => {
  res.json(read('rankings.json'));
});

let chat = [];
app.get('/chat', (req, res) => {
  res.json(chat);
});
app.post('/chat', (req, res) => {
  const msg = { id: Date.now().toString(), ...req.body };
  chat.push(msg);
  res.status(201).json(msg);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
