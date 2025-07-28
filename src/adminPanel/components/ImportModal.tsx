import React, { useMemo, useState } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { useGlobalStore, Transfer } from '@/adminPanel/store/globalStore';
import toast from 'react-hot-toast';

type Props = { open: boolean; onClose: () => void; };

const ImportModal: React.FC<Props> = ({ open, onClose }) => {
  const importTransfers = useGlobalStore(s => s.importTransfers);
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const parseCSV = (raw: string): Transfer[] => {
    // Simple CSV parser for comma-separated values with quotes
    const rows: string[] = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < raw.length; i++) {
      const ch = raw[i];
      if (ch === '"') {
        if (inQ && raw[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (ch === '\n' && !inQ) {
        rows.push(cur); cur = '';
      } else {
        cur += ch;
      }
    }
    if (cur.trim().length) rows.push(cur);
    if (!rows.length) return [];

    const headers = rows[0].split(',').map(h => h.trim());
    const out: Transfer[] = rows.slice(1).map(line => {
      const cols: string[] = [];
      let c = '', q = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (q && line[i + 1] === '"') { c += '"'; i++; }
          else q = !q;
        } else if (ch === ',' && !q) {
          cols.push(c); c = '';
        } else {
          c += ch;
        }
      }
      cols.push(c);
      const obj: any = {};
      headers.forEach((h, i) => obj[h] = (cols[i] || '').trim());
      const amount = Number(obj.amount || obj.fee || '0');
      const t: Transfer = {
        id: String(obj.id || crypto.randomUUID()),
        playerId: String(obj.playerId || obj.player || ''),
        playerName: obj.playerName || '',
        fromClubId: obj.fromClubId || '',
        fromClubName: obj.fromClubName || '',
        toClubId: obj.toClubId || '',
        toClubName: obj.toClubName || '',
        amount: Number.isFinite(amount) ? amount : 0,
        status: (obj.status as any) || 'pending',
        createdAt: obj.createdAt || obj.date || new Date().toISOString(),
      };
      return t;
    });
    return out.filter(x => x.id);
  };

  const onImport = async () => {
    if (!file && !text.trim()) { toast.error('Selecciona un archivo o pega JSON/CSV'); return; }
    setBusy(true);
    try {
      let content = text;
      if (file) content = await file.text();
      let rows: Transfer[] = [];
      const trimmed = content.trim();
      if (trimmed.startsWith('[')) {
        const arr = JSON.parse(trimmed);
        rows = (arr as any[]).map((o: any) => ({
          id: String(o.id || crypto.randomUUID()),
          playerId: String(o.playerId || ''),
          playerName: o.playerName || '',
          fromClubId: o.fromClubId || '',
          fromClubName: o.fromClubName || '',
          toClubId: o.toClubId || '',
          toClubName: o.toClubName || '',
          amount: Number(o.amount ?? o.fee ?? 0),
          status: (o.status as any) || 'pending',
          createdAt: o.createdAt || o.date || new Date().toISOString(),
        }));
      } else {
        rows = parseCSV(trimmed);
      }
      const { inserted, total } = await importTransfers(rows);
      toast.success(`Importadas ${inserted}. Total: ${total}`);
      onClose();
    } catch (e: any) {
      console.error(e);
      toast.error('Error al importar');
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-semibold">Importar transferencias</h3>
          <button className="btn-secondary" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-gray-800 bg-gray-800/40">
            <input
              type="file"
              accept=".json,.csv,text/csv,application/json"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-gray-400 mt-2">Formatos soportados: JSON (array de objetos) o CSV con cabeceras: id, playerId, playerName, fromClubId, fromClubName, toClubId, toClubName, amount, date, status.</p>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">O pega JSON/CSV</label>
            <textarea className="input w-full h-40" value={text} onChange={(e) => setText(e.target.value)} />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary inline-flex items-center gap-2" onClick={onImport} disabled={busy}>
            <UploadCloud size={16} /> Importar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;