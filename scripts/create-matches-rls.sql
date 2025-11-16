-- Script para crear políticas RLS para la tabla matches
-- Asegura que solo los administradores puedan modificar partidos
-- y que todos puedan leerlos

-- Verificar si RLS está habilitado
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'matches';

-- Eliminar políticas existentes si existen (para recrearlas)
DROP POLICY IF EXISTS "Matches are viewable by everyone" ON matches;
DROP POLICY IF EXISTS "Only admins can manage matches" ON matches;
DROP POLICY IF EXISTS "Public read access for matches" ON matches;
DROP POLICY IF EXISTS "Admin full access for matches" ON matches;
DROP POLICY IF EXISTS "matches_select_policy" ON matches;

-- Habilitar RLS en la tabla matches
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Política SELECT: Permitir lectura pública para matches
CREATE POLICY "Public read access for matches" ON matches
  FOR SELECT USING (true);

-- Política ALL: Permitir a usuarios con rol 'admin' todas las operaciones de modificación
CREATE POLICY "Admin full access for matches" ON matches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Verificar las políticas creadas
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'matches'
ORDER BY policyname;

