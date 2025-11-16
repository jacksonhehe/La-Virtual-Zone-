-- Crear usuario admin en Supabase
-- Ejecutar en Supabase SQL Editor

-- 1. Crear el usuario admin en auth.users
-- NOTA: Esto debe hacerse desde el cliente JavaScript, no desde SQL
-- El SQL aquí es solo para el perfil

-- 2. Crear el perfil del admin
INSERT INTO profiles (id, username, email, role, status, xp, created_at, updated_at)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@lavirtualzone.com'),
  'admin',
  'admin@lavirtualzone.com',
  'admin',
  'active',
  1000,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  xp = EXCLUDED.xp,
  updated_at = NOW();

-- 3. Asegurar que el admin tenga el role correcto
UPDATE profiles
SET
  role = 'admin',
  status = 'active',
  xp = 1000,
  updated_at = NOW()
WHERE email = 'admin@lavirtualzone.com';

-- Verificar que se creó correctamente
SELECT id, username, email, role, status, xp
FROM profiles
WHERE username = 'admin';
