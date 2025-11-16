-- Script para crear la tabla blog_posts en Supabase
-- Esta tabla almacenará las noticias del blog de administración

-- Crear tabla blog_posts
CREATE TABLE IF NOT EXISTS blog_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    image TEXT,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    author TEXT NOT NULL DEFAULT 'Redacción',
    category TEXT NOT NULL DEFAULT 'Noticias',
    tags TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_blog_posts_date ON blog_posts(date DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para updated_at
DROP TRIGGER IF EXISTS trigger_update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER trigger_update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_blog_posts_updated_at();

-- Configurar Row Level Security (RLS)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - permitir lectura pública
CREATE POLICY "Public read access for blog_posts" ON blog_posts
    FOR SELECT USING (true);

-- Políticas RLS - solo admin puede modificar
CREATE POLICY "Admin full access for blog_posts" ON blog_posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Comentarios en las columnas
COMMENT ON TABLE blog_posts IS 'Tabla para almacenar las noticias del blog de administración';
COMMENT ON COLUMN blog_posts.id IS 'ID único del post';
COMMENT ON COLUMN blog_posts.title IS 'Título del artículo';
COMMENT ON COLUMN blog_posts.slug IS 'URL slug único generado del título';
COMMENT ON COLUMN blog_posts.excerpt IS 'Resumen breve del artículo';
COMMENT ON COLUMN blog_posts.content IS 'Contenido completo del artículo en formato Markdown';
COMMENT ON COLUMN blog_posts.image IS 'URL de la imagen destacada';
COMMENT ON COLUMN blog_posts.date IS 'Fecha de publicación del artículo';
COMMENT ON COLUMN blog_posts.author IS 'Autor del artículo';
COMMENT ON COLUMN blog_posts.category IS 'Categoría del artículo';
COMMENT ON COLUMN blog_posts.tags IS 'Array de etiquetas para organización';
COMMENT ON COLUMN blog_posts.featured IS 'Si el artículo está destacado';
COMMENT ON COLUMN blog_posts.created_at IS 'Fecha de creación del registro';
COMMENT ON COLUMN blog_posts.updated_at IS 'Fecha de última actualización del registro';

-- Verificar que la tabla se creó correctamente
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE tablename = 'blog_posts';
