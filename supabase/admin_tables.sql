-- SQL schema for admin panel entities
-- Run these statements in your Supabase project's SQL editor or CLI

create table if not exists admin_users (
  id text primary key,
  username text not null,
  email text not null,
  role text not null,
  status text not null,
  created_at timestamptz default now(),
  club_id text
);

create table if not exists admin_clubs (
  id text primary key,
  name text not null,
  manager text,
  manager_id text,
  budget numeric,
  created_at timestamptz default now()
);

create table if not exists admin_players (
  id text primary key,
  name text not null,
  position text,
  club_id text,
  overall integer,
  price numeric
);

create table if not exists admin_matches (
  id text primary key,
  tournament_id text,
  round integer,
  date timestamptz,
  home_team text,
  away_team text,
  home_score integer,
  away_score integer,
  status text
);

create table if not exists admin_tournaments (
  id text primary key,
  name text not null,
  status text,
  current_round integer,
  total_rounds integer
);

create table if not exists admin_news (
  id text primary key,
  title text,
  content text,
  author text,
  published_at timestamptz,
  status text
);

create table if not exists admin_transfers (
  id text primary key,
  player_id text,
  from_club_id text,
  to_club_id text,
  amount numeric,
  status text,
  created_at timestamptz
);

create table if not exists admin_standings (
  id text primary key,
  club_id text,
  points integer,
  wins integer,
  draws integer,
  losses integer
);

create table if not exists admin_activities (
  id text primary key,
  user_id text,
  action text,
  details text,
  date timestamptz
);

create table if not exists admin_comments (
  id text primary key,
  user_id text,
  content text,
  status text,
  created_at timestamptz
);
