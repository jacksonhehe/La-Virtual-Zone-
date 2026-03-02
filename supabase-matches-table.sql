-- Crear o actualizar la tabla "matches" en Supabase incluyendo goles, asistencias y tarjetas
-- Ejecuta este script en el SQL Editor de Supabase.

-- 1) Crear tabla si no existe (incluye columna cards)
CREATE TABLE IF NOT EXISTS public.matches (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL,
  round INTEGER NOT NULL DEFAULT 0,
  date TIMESTAMPTZ NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'live', 'finished')),
  scorers JSONB DEFAULT '[]'::jsonb,    -- [{ playerId, playerName, clubId, minute, assistPlayerName }]
  cards JSONB DEFAULT '[]'::jsonb,      -- [{ playerId, playerName, clubId, minute, type: 'yellow'|'red' }]
  highlights JSONB DEFAULT '[]'::jsonb,
  youtube_video_id TEXT,
  player_of_the_match TEXT,
  match_stats JSONB DEFAULT '{}'::jsonb,
  decided_by TEXT CHECK (decided_by IN ('penalties')),
  qualified_team TEXT CHECK (qualified_team IN ('home', 'away')),
  penalty_home_score INTEGER CHECK (penalty_home_score >= 0),
  penalty_away_score INTEGER CHECK (penalty_away_score >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) Asegurar columna cards en instalaciones previas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'cards'
  ) THEN
    ALTER TABLE public.matches ADD COLUMN cards JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'penalty_home_score'
  ) THEN
    ALTER TABLE public.matches
      ADD COLUMN penalty_home_score INTEGER CHECK (penalty_home_score >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'penalty_away_score'
  ) THEN
    ALTER TABLE public.matches
      ADD COLUMN penalty_away_score INTEGER CHECK (penalty_away_score >= 0);
  END IF;
END $$;

-- 3) Asegurar columna youtube_video_id en instalaciones previas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'youtube_video_id'
  ) THEN
    ALTER TABLE public.matches ADD COLUMN youtube_video_id TEXT;
  END IF;
END $$;

-- 4) Asegurar columna player_of_the_match en instalaciones previas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'player_of_the_match'
  ) THEN
    ALTER TABLE public.matches ADD COLUMN player_of_the_match TEXT;
  END IF;
END $$;

-- 5) Asegurar columna match_stats en instalaciones previas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'match_stats'
  ) THEN
    ALTER TABLE public.matches ADD COLUMN match_stats JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- 6) Indices utiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'decided_by'
  ) THEN
    ALTER TABLE public.matches
      ADD COLUMN decided_by TEXT CHECK (decided_by IN ('penalties'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'matches' AND column_name = 'qualified_team'
  ) THEN
    ALTER TABLE public.matches
      ADD COLUMN qualified_team TEXT CHECK (qualified_team IN ('home', 'away'));
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'matches' AND c.conname = 'matches_decided_by_check'
  ) THEN
    ALTER TABLE public.matches DROP CONSTRAINT matches_decided_by_check;
  END IF;

  UPDATE public.matches
    SET decided_by = NULL
    WHERE decided_by IS NOT NULL
      AND decided_by <> 'penalties';

  ALTER TABLE public.matches
    ADD CONSTRAINT matches_decided_by_check
      CHECK (decided_by IN ('penalties'));
END $$;

-- 6) Indices utiles
CREATE INDEX IF NOT EXISTS idx_matches_tournament ON public.matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_date ON public.matches(date DESC);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);

-- 7) Trigger para mantener updated_at
CREATE OR REPLACE FUNCTION public.update_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_matches_updated_at ON public.matches;
CREATE TRIGGER trg_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_matches_updated_at();

-- 8) (Opcional) Politicas RLS abiertas para desarrollo
-- ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all for dev" ON public.matches FOR ALL USING (true) WITH CHECK (true);
