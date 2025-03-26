import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } from '@env';

// Use environment variables for Supabase credentials
const supabaseUrl = EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing. Please check your environment variables.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      storage: AsyncStorage as any,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Database interface types
export interface User {
  id: string;
  email: string;
  username: string;
  net_worth: number;
  tier: 'regular' | 'elite' | 'god';
  purchase_amount: number;
  serial_number: string;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  purchase_amount: number;
  tier: 'regular' | 'elite' | 'god';
  created_at: string;
}

// Database helper functions
export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('purchase_amount', { ascending: false })
    .limit(20);
    
  if (error) {
    console.error('Error fetching leaderboard:', error);
    // Fallback to mock data if there's an error
    return [
      { id: '1', username: 'Elon M.', purchase_amount: 99999, tier: 'god', created_at: new Date().toISOString() },
      { id: '2', username: 'Jeff B.', purchase_amount: 99999, tier: 'god', created_at: new Date().toISOString() },
      { id: '3', username: 'Mark Z.', purchase_amount: 9999, tier: 'elite', created_at: new Date().toISOString() },
      { id: '4', username: 'Bill G.', purchase_amount: 9999, tier: 'elite', created_at: new Date().toISOString() },
      { id: '5', username: 'Warren B.', purchase_amount: 999, tier: 'regular', created_at: new Date().toISOString() },
    ];
  }
  
  return data as LeaderboardEntry[];
};

export const saveUser = async (user: Partial<User>): Promise<User | null> => {
  try {
    const serialNumber = `RICH-${Math.floor(Math.random() * 1000000)}`;
    
    // Ensure all required fields are present
    const newUser = {
      id: user.id || `user_${Math.random().toString(36).substring(2, 11)}`, // Generate an ID if not provided
      email: user.email || `user_${Math.random().toString(36).substring(2, 7)}@example.com`,
      username: user.username || 'Anonymous',
      net_worth: user.net_worth || 1000000,
      tier: user.tier || 'regular',
      purchase_amount: user.purchase_amount || 0,
      serial_number: user.serial_number || serialNumber,
      created_at: user.created_at || new Date().toISOString(),
    };
    
    // First, let's check if the user already exists to determine if we need to update or insert
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('*')
      .eq('id', newUser.id)
      .single();
      
    if (userCheckError && userCheckError.code !== 'PGRST116') {
      // PGRST116 means no rows returned, which is expected when user doesn't exist
      console.error('Error checking existing user:', userCheckError);
    }
    
    let data, error;
    
    if (existingUser) {
      // Update existing user
      const { data: updatedData, error: updateError } = await supabase
        .from('users')
        .update(newUser)
        .eq('id', newUser.id)
        .select()
        .single();
        
      data = updatedData;
      error = updateError;
    } else {
      // Insert new user
      const { data: insertedData, error: insertError } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();
        
      data = insertedData;
      error = insertError;
      
      // Handle duplicate email constraint error - error code 23505 is duplicate key violation
      if (insertError && insertError.code === '23505' && insertError.message?.includes('users_email_key')) {
        console.log('Email already exists, trying with a unique email');
        
        // Create a unique email by appending a timestamp
        const timestamp = Date.now();
        const emailParts = newUser.email.split('@');
        newUser.email = `${emailParts[0]}_${timestamp}@${emailParts[1]}`;
        
        // Try inserting again with the modified email
        const { data: retryData, error: retryError } = await supabase
          .from('users')
          .insert([newUser])
          .select()
          .single();
        
        data = retryData;
        error = retryError;
      }
    }
    
    if (error) {
      console.error('Error saving user:', error);
      console.log('Attempted to save user with data:', newUser);
      return null;
    }
    
    return data as User;
  } catch (e) {
    console.error('Exception in saveUser:', e);
    return null;
  }
};

// Initialize and check required tables
export const initializeSupabase = async (): Promise<boolean> => {
  try {
    console.log('Checking Supabase connection and tables...');
    
    // Test the connection by checking if we can access the "users" table
    const { error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Error accessing users table:', error);
      
      // If the table doesn't exist, suggest creating it
      if (error.code === '42P01') { // PostgreSQL code for undefined_table
        console.log('Users table does not exist. Use the following SQL to create it:');
        console.log(`
CREATE TABLE public.users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  net_worth INTEGER NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('regular', 'elite', 'god')),
  purchase_amount INTEGER NOT NULL,
  serial_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.leaderboard (
  id TEXT PRIMARY KEY REFERENCES public.users(id),
  username TEXT NOT NULL,
  purchase_amount INTEGER NOT NULL,
  tier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`);
      }
      
      return false;
    }
    
    // Check if we can access the "leaderboard" table
    const { error: leaderboardError } = await supabase
      .from('leaderboard')
      .select('count')
      .limit(1);
    
    if (leaderboardError) {
      console.error('Error accessing leaderboard table:', leaderboardError);
      return false;
    }
    
    console.log('Supabase connection and tables verified successfully.');
    return true;
  } catch (error) {
    console.error('Exception during Supabase initialization:', error);
    return false;
  }
}; 