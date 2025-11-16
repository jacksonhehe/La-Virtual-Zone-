-- Deshabilitar RLS temporalmente para migración
ALTER TABLE clubs DISABLE ROW LEVEL SECURITY;
ALTER TABLE players DISABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;

-- Confirmar que RLS está deshabilitado
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('clubs', 'players', 'tournaments', 'matches')
ORDER BY tablename;
