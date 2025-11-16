-- Confirmar email del usuario admin manualmente
-- NOTA: confirmed_at es una columna generada, solo actualizamos email_confirmed_at
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'admin@lavirtualzone.com';

-- Verificar que se confirmó
SELECT id, email, email_confirmed_at, confirmed_at
FROM auth.users
WHERE email = 'admin@lavirtualzone.com';
