-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  net_worth INTEGER NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('regular', 'elite', 'god')),
  purchase_amount INTEGER NOT NULL DEFAULT 0,
  serial_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invite_code TEXT,
  invite_verified BOOLEAN DEFAULT FALSE
);

-- Create leaderboard table
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id TEXT PRIMARY KEY REFERENCES public.users(id),
  username TEXT NOT NULL,
  purchase_amount INTEGER NOT NULL,
  tier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invite codes table
CREATE TABLE IF NOT EXISTS public.invite_codes (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample invite codes
INSERT INTO public.invite_codes (code, used) VALUES
('LUXURY', FALSE),
('WEALTH', FALSE),
('RICHAF', FALSE),
('GOLDEN', FALSE),
('VVIP12', FALSE)
ON CONFLICT (code) DO NOTHING;

-- Set RLS (Row Level Security) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- Create policies to allow full access to anonymous users for demo purposes
-- In a production environment, you'd want more restrictive policies
CREATE POLICY "Allow full access to users" ON public.users FOR ALL TO anon USING (true);
CREATE POLICY "Allow full access to leaderboard" ON public.leaderboard FOR ALL TO anon USING (true);
CREATE POLICY "Allow full access to invite codes" ON public.invite_codes FOR ALL TO anon USING (true);
