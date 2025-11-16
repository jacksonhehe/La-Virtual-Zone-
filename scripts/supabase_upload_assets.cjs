#!/usr/bin/env node
// Upload local flags and club logos to Supabase Storage (bucket: public)
// Requires env: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = 'public';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing Supabase env. Set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function ensureBucket() {
  try {
    // createBucket will fail if exists; ignore that error
    await supabase.storage.createBucket(bucket, { public: true });
    console.log(`Bucket '${bucket}' created (or already existed).`);
  } catch (e) {
    const msg = (e && e.message) ? e.message : String(e);
    if (/already exists/i.test(msg)) {
      console.log(`Bucket '${bucket}' already exists.`);
    } else {
      console.log(`Bucket ensure error (may already exist):`, msg);
    }
  }
}

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

function contentType(p) {
  const lower = p.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'application/octet-stream';
}

function normalizeKey(key) {
  // split, normalize diacritics, replace unsafe chars, lower-case
  return key
    .split('/')
    .filter(Boolean)
    .map(p => p
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove diacritics
      .replace(/ñ/gi, 'n')
      .replace(/ß/g, 'ss')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .toLowerCase()
    )
    .join('/');
}

async function uploadDir(localDir, prefix) {
  const root = process.cwd();
  const abs = path.resolve(root, localDir);
  if (!fs.existsSync(abs)) {
    console.warn(`Skip: ${localDir} not found`);
    return { uploaded: 0 };
  }
  let uploaded = 0;
  for (const file of walk(abs)) {
    const rel = path.relative(abs, file).replace(/\\/g, '/');
    const dest = normalizeKey(`${prefix}/${rel}`);
    const buffer = fs.readFileSync(file);
    const ct = contentType(file);
    const { error } = await supabase.storage.from(bucket).upload(dest, buffer, {
      contentType: ct,
      upsert: true,
    });
    if (error) {
      console.error('Upload error:', dest, error.message);
    } else {
      uploaded++;
    }
  }
  return { uploaded };
}

(async () => {
  await ensureBucket();
  const resFlags = await uploadDir('Banderas', 'flags');
  const resClubs = await uploadDir('Logos_Clubes', 'clubs');
  console.log(`Done. Flags uploaded: ${resFlags.uploaded}, Clubs uploaded: ${resClubs.uploaded}`);
})();
