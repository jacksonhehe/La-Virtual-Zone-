-- Script para actualizar el esquema de la tabla clubs
-- Cambiar de snake_case a camelCase para coincidir con el código

-- Agregar nuevas columnas camelCase
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS "foundedYear" INTEGER;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS "playStyle" TEXT;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS "primaryColor" TEXT;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS "secondaryColor" TEXT;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS "fanBase" INTEGER;

-- Copiar datos de las columnas snake_case a camelCase
UPDATE clubs SET "foundedYear" = founded_year WHERE founded_year IS NOT NULL;
UPDATE clubs SET "playStyle" = play_style WHERE play_style IS NOT NULL;
UPDATE clubs SET "primaryColor" = primary_color WHERE primary_color IS NOT NULL;
UPDATE clubs SET "secondaryColor" = secondary_color WHERE secondary_color IS NOT NULL;
UPDATE clubs SET "fanBase" = fan_base WHERE fan_base IS NOT NULL;

-- Hacer las nuevas columnas NOT NULL si las originales lo eran
-- (founded_year, play_style, primary_color, secondary_color, fan_base ya tienen datos)

-- Eliminar las columnas snake_case antiguas
ALTER TABLE clubs DROP COLUMN IF EXISTS founded_year;
ALTER TABLE clubs DROP COLUMN IF EXISTS play_style;
ALTER TABLE clubs DROP COLUMN IF EXISTS primary_color;
ALTER TABLE clubs DROP COLUMN IF EXISTS secondary_color;
ALTER TABLE clubs DROP COLUMN IF EXISTS fan_base;

-- Verificar que todo esté correcto
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'clubs'
ORDER BY ordinal_position;
