-- Políticas RLS permisivas para desarrollo
-- Ejecutar este script EN Supabase SQL Editor para permitir subida sin autenticación
-- ⚠️ SOLO PARA DESARROLLO - NO USAR EN PRODUCCIÓN

-- Políticas para la tabla 'media'
CREATE POLICY "Allow public access to media table" ON media
  FOR ALL USING (true) WITH CHECK (true);

-- Políticas para el bucket 'media' (storage)
-- Políticas muy permisivas para desarrollo
-- Permite subida de imágenes y videos
CREATE POLICY "Allow public upload to media bucket" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media');

CREATE POLICY "Allow public access to media bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "Allow public update to media bucket" ON storage.objects
  FOR UPDATE USING (bucket_id = 'media');

CREATE POLICY "Allow public delete to media bucket" ON storage.objects
  FOR DELETE USING (bucket_id = 'media');

-- Mensaje de confirmación
SELECT '✅ Políticas de desarrollo aplicadas correctamente' as status;
