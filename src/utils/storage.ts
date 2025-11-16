import { getSupabaseClient } from '../lib/supabase';
import { config } from '../lib/config';

const bucket = 'public';

function normalizeKey(key: string): string {
  return key
    .split('/')
    .filter(Boolean)
    .map(p => p
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/gi, 'n')
      .replace(/ß/g, 'ss')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .toLowerCase()
    )
    .join('/');
}

function extToMime(path: string): string {
  const lower = path.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'application/octet-stream';
}

export function getPublicUrl(storagePath: string): string {
  if (!config.useSupabase) return '/' + storagePath.replace(/^\//, '');
  const supabase = getSupabaseClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  return data.publicUrl;
}

export function clubLogoUrl(originalPath: string): string {
  // Map from local '/Logos_Clubes/..' to storage 'clubs/...'
  const mapped = originalPath.replace(/^\/?Logos_Clubes\//, 'clubs/');
  return getPublicUrl(normalizeKey(mapped));
}

export function flagUrl(filename: string): string {
  const name = filename.replace(/^\//, '');
  return getPublicUrl(normalizeKey(`flags/${name}`));
}

export function assetUrl(relative: string): string {
  const rel = relative.replace(/^\//, '');
  return getPublicUrl(normalizeKey(rel));
}

export const _internal = { extToMime, normalizeKey };
