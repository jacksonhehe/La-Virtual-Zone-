CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  username text NOT NULL,
  email text NOT NULL,
  role text NOT NULL,
  clubId text,
  avatar text,
  xp integer NOT NULL DEFAULT 0,
  createdAt timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active',
  notifications boolean NOT NULL DEFAULT true,
  lastLogin timestamptz,
  followers integer NOT NULL DEFAULT 0,
  following integer NOT NULL DEFAULT 0,
  password text NOT NULL
);
