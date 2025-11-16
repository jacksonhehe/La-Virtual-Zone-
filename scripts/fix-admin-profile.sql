-- Script para corregir el perfil del admin si está mal configurado
-- Ejecutar en Supabase SQL Editor

-- Verificar el estado actual del perfil del admin
SELECT id, username, email, role, status, xp, created_at, updated_at
FROM profiles
WHERE email = 'admin@lavirtualzone.com';

-- Si el role no es 'admin', corregirlo
UPDATE profiles
SET
  role = 'admin',
  status = COALESCE(status, 'active'),
  xp = COALESCE(xp, 1000),
  updated_at = NOW()
WHERE email = 'admin@lavirtualzone.com';

-- Verificar el resultado
SELECT id, username, email, role, status, xp
FROM profiles
WHERE email = 'admin@lavirtualzone.com';

-- También verificar que el usuario existe en auth.users
SELECT id, email, created_at
FROM auth.users
WHERE email = 'admin@lavirtualzone.com';
