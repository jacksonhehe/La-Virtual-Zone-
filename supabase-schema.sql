-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'USER' CHECK (role IN ('ADMIN', 'CLUB', 'USER')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de clubes
CREATE TABLE IF NOT EXISTS clubs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo TEXT,
  founded_year INTEGER NOT NULL,
  stadium TEXT NOT NULL,
  manager_id UUID REFERENCES users(id),
  budget INTEGER DEFAULT 1000000,
  play_style TEXT,
  primary_color TEXT DEFAULT '#ffffff',
  secondary_color TEXT DEFAULT '#000000',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de jugadores
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 15 AND age <= 50),
  nationality TEXT NOT NULL,
  dorsal INTEGER NOT NULL CHECK (dorsal >= 1 AND dorsal <= 99),
  position TEXT NOT NULL CHECK (position IN ('POR', 'DEF', 'MED', 'DEL')),
  club_id INTEGER REFERENCES clubs(id) ON DELETE SET NULL,
  overall INTEGER NOT NULL CHECK (overall >= 40 AND overall <= 99),
  potential INTEGER NOT NULL CHECK (potential >= 40 AND potential <= 99),
  price INTEGER NOT NULL DEFAULT 100000,
  image TEXT,
  contract_expires TEXT,
  salary INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de partidos
CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  home_club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  away_club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  home_score INTEGER,
  away_score INTEGER,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished')),
  played_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de transferencias
CREATE TABLE IF NOT EXISTS transfers (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  from_club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  to_club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de noticias
CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_clubs_slug ON clubs(slug);
CREATE INDEX IF NOT EXISTS idx_players_club_id ON players(club_id);
CREATE INDEX IF NOT EXISTS idx_matches_played_at ON matches(played_at);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON transfers(status);
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transfers_updated_at BEFORE UPDATE ON transfers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Configurar RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para clubes
CREATE POLICY "Anyone can view clubs" ON clubs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create clubs" ON clubs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Club managers can update their clubs" ON clubs FOR UPDATE USING (auth.uid() = manager_id);
CREATE POLICY "Admins can delete clubs" ON clubs FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Políticas para jugadores
CREATE POLICY "Anyone can view players" ON players FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create players" ON players FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Club managers can update their players" ON players FOR UPDATE USING (
  EXISTS (SELECT 1 FROM clubs WHERE id = players.club_id AND manager_id = auth.uid())
);
CREATE POLICY "Admins can delete players" ON players FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Políticas para partidos
CREATE POLICY "Anyone can view matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create matches" ON matches FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update matches" ON matches FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Políticas para transferencias
CREATE POLICY "Anyone can view transfers" ON transfers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create transfers" ON transfers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update transfers" ON transfers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Políticas para noticias
CREATE POLICY "Anyone can view news" ON news FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create news" ON news FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authors can update their news" ON news FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Admins can delete news" ON news FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Crear bucket de almacenamiento para imágenes
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

-- Políticas para almacenamiento
CREATE POLICY "Anyone can view images" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'images' AND auth.role() = 'authenticated'
);
CREATE POLICY "Users can update their own images" ON storage.objects FOR UPDATE USING (
  bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete their own images" ON storage.objects FOR DELETE USING (
  bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]
); 