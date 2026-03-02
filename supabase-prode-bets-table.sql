-- Tabla PRODE para registrar apuestas de DTs
-- Ejecuta este script en Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.prode_bets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  club_id TEXT NOT NULL,
  match_id TEXT NOT NULL,
  tournament_id TEXT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  match_date TIMESTAMPTZ NOT NULL,
  market TEXT NOT NULL DEFAULT 'match_result' CHECK (market IN ('match_result', 'goals_35', 'first_goal', 'to_qualify')),
  selection TEXT NOT NULL DEFAULT 'home_win' CHECK (selection IN ('home_win', 'draw', 'away_win', 'over_35', 'under_35', 'first_home', 'first_away', 'first_none', 'qualify_home', 'qualify_away')),
  outcome TEXT NOT NULL DEFAULT 'home_win' CHECK (outcome IN ('home_win', 'draw', 'away_win', 'over_35', 'under_35', 'first_home', 'first_away', 'first_none', 'qualify_home', 'qualify_away')),
  decided_by TEXT CHECK (decided_by IN ('penalties')),
  odds NUMERIC(8,3) NOT NULL CHECK (odds > 1),
  stake BIGINT NOT NULL CHECK (stake > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost')),
  payout BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settled_at TIMESTAMPTZ
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'prode_bets' AND column_name = 'market'
  ) THEN
    ALTER TABLE public.prode_bets
      ADD COLUMN market TEXT NOT NULL DEFAULT 'match_result' CHECK (market IN ('match_result', 'goals_35', 'first_goal', 'to_qualify'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'prode_bets' AND column_name = 'selection'
  ) THEN
    ALTER TABLE public.prode_bets
      ADD COLUMN selection TEXT NOT NULL DEFAULT 'home_win' CHECK (selection IN ('home_win', 'draw', 'away_win', 'over_35', 'under_35', 'first_home', 'first_away', 'first_none', 'qualify_home', 'qualify_away'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'prode_bets' AND column_name = 'outcome'
  ) THEN
    ALTER TABLE public.prode_bets
      ADD COLUMN outcome TEXT NOT NULL DEFAULT 'home_win' CHECK (outcome IN ('home_win', 'draw', 'away_win', 'over_35', 'under_35', 'first_home', 'first_away', 'first_none', 'qualify_home', 'qualify_away'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'prode_bets' AND column_name = 'decided_by'
  ) THEN
    ALTER TABLE public.prode_bets
      ADD COLUMN decided_by TEXT CHECK (decided_by IN ('penalties'));
  END IF;
END $$;

-- Actualiza constraints existentes si la tabla ya estaba creada con checks antiguos
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'prode_bets' AND c.conname = 'prode_bets_market_check'
  ) THEN
    ALTER TABLE public.prode_bets DROP CONSTRAINT prode_bets_market_check;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'prode_bets' AND c.conname = 'prode_bets_selection_check'
  ) THEN
    ALTER TABLE public.prode_bets DROP CONSTRAINT prode_bets_selection_check;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'prode_bets' AND c.conname = 'prode_bets_outcome_check'
  ) THEN
    ALTER TABLE public.prode_bets DROP CONSTRAINT prode_bets_outcome_check;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND t.relname = 'prode_bets' AND c.conname = 'prode_bets_decided_by_check'
  ) THEN
    ALTER TABLE public.prode_bets DROP CONSTRAINT prode_bets_decided_by_check;
  END IF;

  UPDATE public.prode_bets
    SET decided_by = NULL
    WHERE decided_by IS NOT NULL
      AND decided_by <> 'penalties';

  ALTER TABLE public.prode_bets
    ADD CONSTRAINT prode_bets_market_check
      CHECK (market IN ('match_result', 'goals_35', 'first_goal', 'to_qualify')),
    ADD CONSTRAINT prode_bets_selection_check
      CHECK (selection IN ('home_win', 'draw', 'away_win', 'over_35', 'under_35', 'first_home', 'first_away', 'first_none', 'qualify_home', 'qualify_away')),
    ADD CONSTRAINT prode_bets_outcome_check
      CHECK (outcome IN ('home_win', 'draw', 'away_win', 'over_35', 'under_35', 'first_home', 'first_away', 'first_none', 'qualify_home', 'qualify_away')),
    ADD CONSTRAINT prode_bets_decided_by_check
      CHECK (decided_by IN ('penalties'));
END $$;

CREATE INDEX IF NOT EXISTS idx_prode_bets_user_id ON public.prode_bets(user_id);
CREATE INDEX IF NOT EXISTS idx_prode_bets_match_id ON public.prode_bets(match_id);
CREATE INDEX IF NOT EXISTS idx_prode_bets_status ON public.prode_bets(status);
CREATE INDEX IF NOT EXISTS idx_prode_bets_created_at ON public.prode_bets(created_at DESC);

-- RLS opcional (si usas Auth real de Supabase):
-- ALTER TABLE public.prode_bets ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "prode_select_own" ON public.prode_bets
--   FOR SELECT USING (auth.uid()::text = user_id);
-- CREATE POLICY "prode_insert_own" ON public.prode_bets
--   FOR INSERT WITH CHECK (auth.uid()::text = user_id);
-- CREATE POLICY "prode_update_own" ON public.prode_bets
--   FOR UPDATE USING (auth.uid()::text = user_id);

-- Politica abierta para modo desarrollo (solo si no usas Auth real):
-- ALTER TABLE public.prode_bets ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all for dev - prode" ON public.prode_bets
--   FOR ALL USING (true) WITH CHECK (true);
