-- Create a profiles table that will store user data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  tier TEXT DEFAULT 'regular' CHECK (tier IN ('regular', 'elite', 'god')),
  purchase_amount NUMERIC DEFAULT 0,
  serial_number TEXT UNIQUE NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    tier,
    purchase_amount,
    serial_number,
    email,
    created_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'preferred_username', SPLIT_PART(NEW.email, '@', 1)),
    'regular',
    0,
    'BADGE-' || FLOOR(RANDOM() * 1000000)::TEXT,
    NEW.email,
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Trigger to create a profile when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_new_user();

-- Create Row Level Security policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Only allow users to access their own profile
CREATE POLICY "Users can read their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Only allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Only allow authenticated users to access profiles
CREATE POLICY "Authenticated users can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT ALL ON TABLE profiles TO service_role;
GRANT SELECT ON TABLE profiles TO authenticated;
GRANT UPDATE (username) ON TABLE profiles TO authenticated;
