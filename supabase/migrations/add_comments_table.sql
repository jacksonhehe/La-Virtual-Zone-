CREATE TABLE IF NOT EXISTS comments (
  id text PRIMARY KEY,
  post_id text NOT NULL,
  author text NOT NULL,
  content text NOT NULL,
  date timestamptz NOT NULL DEFAULT now(),
  reported boolean NOT NULL DEFAULT false,
  hidden boolean NOT NULL DEFAULT false
);
