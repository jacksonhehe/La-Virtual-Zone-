-- Crear tabla 'media' en Supabase para almacenar elementos multimedia de la galería
-- Ejecutar este script en el SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'clip')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT DEFAULT 'General',
  uploader TEXT DEFAULT 'anon',
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_media_uploader ON media(uploader);
CREATE INDEX IF NOT EXISTS idx_media_category ON media(category);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
CREATE INDEX IF NOT EXISTS idx_media_upload_date ON media(upload_date DESC);

-- Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_media_updated_at
  BEFORE UPDATE ON media
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Crear bucket de storage para media (si no existe)
-- Nota: Los buckets se crean desde la interfaz de Supabase Storage
-- Bucket name: 'media'
-- Configuración recomendada:
-- - Public bucket: true (para que las URLs sean públicas)
-- - File size limit: 50MB (para permitir videos grandes)
-- - Allowed MIME types: image/*, video/*

-- Crear políticas RLS para el bucket 'media'
-- IMPORTANTE: Ejecutar ESTO después de crear el bucket manualmente

-- Permitir subida de archivos a usuarios autenticados
CREATE POLICY "Users can upload media files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media'
    AND auth.role() = 'authenticated'
  );

-- Permitir lectura pública de archivos multimedia
CREATE POLICY "Media files are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

-- Permitir actualización de archivos multimedia solo al propietario
CREATE POLICY "Users can update own media files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir eliminación de archivos multimedia solo al propietario
CREATE POLICY "Users can delete own media files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Políticas más permisivas para desarrollo (permitir subida sin autenticación)
-- DESCOMENTA estas líneas si quieres permitir subida sin login durante desarrollo:

-- CREATE POLICY "Allow public upload to media bucket" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'media');

-- CREATE POLICY "Allow public update to media bucket" ON storage.objects
--   FOR UPDATE USING (bucket_id = 'media');

-- CREATE POLICY "Allow public delete to media bucket" ON storage.objects
--   FOR DELETE USING (bucket_id = 'media');
