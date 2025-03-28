# Supabase Setup Guide for The Nothing App

This guide explains how to set up and use Supabase with The Nothing App.

## Supabase Credentials

You need to obtain Supabase credentials and configure the application with them:

- **Project URL:** Your Supabase project URL (e.g., `https://your-project-id.supabase.co`)
- **API Key:** Your Supabase anon key
- **Project Name:** The Nothing App
- **Organization:** Your organization name

These credentials should be set in your `.env` file and never committed to the repository.

## Environment Configuration

Create a `.env` file in the root directory with your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_URL=your_api_url
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Database Setup

To complete the Supabase setup, you need to create the necessary tables in your Supabase project. Follow these steps:

1. Log in to the [Supabase Dashboard](https://app.supabase.io)
2. Navigate to your projec
3. Go to the SQL Editor
4. Copy and paste the contents of the `supabase-schema.sql` file in this projec
5. Run the script to create the necessary tables and policies

Alternatively, you can use the initialization script:

```bash
cd server
npm run db:ini
```

The script will check if the tables exist and create sample data.

The SQL script will create the following:

1. `users` table - Stores user information
2. `leaderboard` table - Stores the app's leaderboard data, linked to users
3. `invite_codes` table - Stores invitation codes for new users
4. Row Level Security (RLS) policies to control access to these tables

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

**Important Note:** In the current implementation, the `id` column in the `leaderboard` table is a foreign key referencing the `users` table, not an independent UUID. This creates a one-to-one relationship between users and their leaderboard entries.

```sql
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID PRIMARY KEY REFERENCES public.users(id),
  username TEXT NOT NULL,
  purchase_amount NUMERIC DEFAULT 0,
  tier TEXT CHECK (tier IN ('regular', 'elite', 'god')) DEFAULT 'regular',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Invite Codes Table

```sql
CREATE TABLE IF NOT EXISTS public.invite_codes (
  code TEXT PRIMARY KEY,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP WITH TIME ZONE,
  used_by UUID REFERENCES public.users(id)
);
```

## Implementation Details

### Supabase Configuration

The Supabase client is configured in `app/config/supabase.ts` with:

```typescrip
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Ensure environment variables are se
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
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

- `getLeaderboard()` - Fetches the leaderboard entries sorted by purchase amoun
- `saveUser(user)` - Saves a new user to the database or updates an existing one
- `getInviteCode(code)` - Validates an invitation code
- `markInviteCodeAsUsed(code, userId)` - Marks an invitation code as used

## Security Considerations

1. The Supabase anon key is restricted by Row Level Security policies.
2. Users can only read and update their own data.
3. The leaderboard is publicly readable but not writable via the client API.
4. Invitation codes are protected to prevent abuse.
5. **Never commit your Supabase credentials to the repository.**

## Testing Database Connection

You can use the included `test-database-connection.js` script to verify your Supabase connection and table setup:

```bash
node test-database-connection.js
```

The script will:
1. Test the connection to your Supabase instance
2. Verify that all required tables exis
3. Check row-level security policies
4. Report any issues found

## Troubleshooting

If you encounter issues with the Supabase connection:

1. Verify your internet connection
2. Check that the SQL tables are properly created
3. Ensure Row Level Security policies are configured correctly
4. Verify your environment variables are set correctly
5. If you encounter ID issues, remember that leaderboard entries must reference valid user IDs
6. Use the application's built-in Demo Mode if database connection fails

For assistance with Supabase, refer to the [Supabase documentation](https://supabase.io/docs).
