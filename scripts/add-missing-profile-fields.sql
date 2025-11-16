-- Agregar campos faltantes a la tabla profiles de Supabase
-- Campos adicionales que pueden ser útiles

-- Agregar campos opcionales si no existen
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS club TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS favorite_team TEXT,
ADD COLUMN IF NOT EXISTS favorite_position TEXT,
ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS suspended_reason TEXT,
ADD COLUMN IF NOT EXISTS ban_reason TEXT,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_reason TEXT,
ADD COLUMN IF NOT EXISTS notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS followers INTEGER DEFAULT 0;

-- Agregar campo updated_at si no existe
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Verificar el esquema final
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM
    information_schema.columns
WHERE
    table_name = 'profiles'
    AND table_schema = 'public'
ORDER BY
    ordinal_position;
