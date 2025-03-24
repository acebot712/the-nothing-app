# Supabase Setup Guide for The Nothing App

This guide explains how to set up and use Supabase with The Nothing App.

## Supabase Credentials

The application is already configured with the following Supabase credentials:

- **Project URL:** [https://dyfigkcfyrmphfzizwst.supabase.co](https://dyfigkcfyrmphfzizwst.supabase.co)
- **API Key:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5Zmlna2NmeXJtcGhmeml6d3N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MjQwNzUsImV4cCI6MjA1ODQwMDA3NX0.K6QbbXf35LjYUtj9sxDVVNU-us-hEqMAUWyq8oOE9i8
- **Project Name:** The Nothing App
- **Organization:** acebot712's Org
- **Database Password:** CjRH34KKL2fGC#s

These credentials are already set up in the `app/config/supabase.ts` file.

## Database Setup

To complete the Supabase setup, you need to create the necessary tables in your Supabase project. Follow these steps:

1. Log in to the [Supabase Dashboard](https://app.supabase.io)
2. Navigate to your project: "The Nothing App"
3. Go to the SQL Editor
4. Copy and paste the contents of the `supabase-setup.sql` file in this project
5. Run the script to create the necessary tables and policies

The SQL script will create the following:

1. `users` table - Stores user information
2. `leaderboard` table - Stores the app's leaderboard data
3. Row Level Security (RLS) policies to control access to these tables

## Database Schema

### Users Table

```sql
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
```

### Leaderboard Table

```sql
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  purchase_amount NUMERIC DEFAULT 0,
  tier TEXT CHECK (tier IN ('regular', 'elite', 'god')) DEFAULT 'regular',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Implementation Details

### Supabase Configuration

The Supabase client is configured in `app/config/supabase.ts` with:

```typescript
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://dyfigkcfyrmphfzizwst.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5Zmlna2NmeXJtcGhmeml6d3N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MjQwNzUsImV4cCI6MjA1ODQwMDA3NX0.K6QbbXf35LjYUtj9sxDVVNU-us-hEqMAUWyq8oOE9i8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Data Access Functions

The following functions are implemented to interact with Supabase:

- `getLeaderboard()` - Fetches the leaderboard entries sorted by purchase amount
- `saveUser(user)` - Saves a new user to the database

## Security Considerations

1. The Supabase anon key is restricted by Row Level Security policies.
2. Users can only read and update their own data.
3. The leaderboard is publicly readable but not writable via the client API.

## Troubleshooting

If you encounter issues with the Supabase connection:

1. Verify your internet connection
2. Check that the SQL tables are properly created
3. Ensure Row Level Security policies are configured correctly
4. Verify the API key hasn't expired

For assistance with Supabase, refer to the [Supabase documentation](https://supabase.io/docs). 