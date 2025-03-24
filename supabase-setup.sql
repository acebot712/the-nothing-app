-- Create tables for The Nothing App

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  net_worth NUMERIC DEFAULT 0,
  tier TEXT CHECK (tier IN ('regular', 'elite', 'god')) DEFAULT 'regular',
  purchase_amount NUMERIC DEFAULT 0,
  serial_number TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboard table - maintains a one-to-one relationship with users
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID PRIMARY KEY REFERENCES public.users(id),
  username TEXT NOT NULL,
  purchase_amount NUMERIC DEFAULT 0,
  tier TEXT CHECK (tier IN ('regular', 'elite', 'god')) DEFAULT 'regular',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can read their own data
CREATE POLICY "Users can read their own data" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update their own data" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Anyone can read the leaderboard
CREATE POLICY "Anyone can read leaderboard" 
  ON public.leaderboard 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Add sample data to leaderboard
-- Note: Since the leaderboard ID must reference a valid user ID,
-- these INSERT statements will only work after corresponding users are created.
-- The initialize-db.js script handles this dependency correctly.
-- The following is here for reference, but may not work on direct execution.
INSERT INTO public.leaderboard (username, purchase_amount, tier)
VALUES
  ('Elon M.', 99999, 'god'),
  ('Jeff B.', 99999, 'god'),
  ('Mark Z.', 9999, 'elite'),
  ('Bill G.', 9999, 'elite'),
  ('Warren B.', 999, 'regular'); 