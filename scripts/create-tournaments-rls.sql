-- Script para crear políticas RLS para la tabla tournaments
-- Asegura que solo los administradores puedan modificar torneos

-- Verificar si RLS está habilitado
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'tournaments';

-- Políticas RLS - permitir lectura pública para torneos
CREATE POLICY "Public read access for tournaments" ON tournaments
    FOR SELECT USING (true);

-- Políticas RLS - solo admin puede modificar torneos
CREATE POLICY "Admin full access for tournaments" ON tournaments
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
WHERE tablename = 'tournaments';
