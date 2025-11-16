-- Tabla de comentarios del blog para Supabase
-- Ejecuta este script en el editor SQL del proyecto antes de usar el sistema de comentarios en producción.

CREATE TABLE IF NOT EXISTS blog_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  author TEXT NOT NULL,
  author_avatar TEXT,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 5 AND 2000),
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  likes INTEGER NOT NULL DEFAULT 0 CHECK (likes >= 0),
  replies JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices básicos para mejorar filtros por post y fecha.
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_date
  ON blog_comments (post_id, date DESC);

-- Trigger para mantener updated_at sincronizado.
CREATE OR REPLACE FUNCTION set_updated_at_blog_comments()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_blog_comments_updated_at
  BEFORE UPDATE ON blog_comments
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at_blog_comments();

-- Activar políticas RLS y permitir sólo lo necesario.
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- Lectura pública (necesaria para mostrar comentarios a visitantes anónimos).
CREATE POLICY "Public read blog comments"
  ON blog_comments FOR SELECT
  USING (true);

-- Inserción pública controlada (si todavía no hay autenticación en el blog).
-- Cuando exista auth, ajusta USING para exigir auth.uid().
CREATE POLICY "Public insert blog comments"
  ON blog_comments FOR INSERT
  WITH CHECK (true);

-- Actualizaciones sólo permitidas desde el servicio o tareas administrativas.
CREATE POLICY "Admins can update blog comments"
  ON blog_comments FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Eliminaciones igual de restringidas.
CREATE POLICY "Admins can delete blog comments"
  ON blog_comments FOR DELETE
  USING (auth.role() = 'service_role');

-- Opcional: restringe likes en frontend, pero aquí puedes exponer una RPC específica si prefieres.
