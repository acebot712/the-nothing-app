import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase credentials
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
  const serialNumber = `RICH-${Math.floor(Math.random() * 1000000)}`;
  const newUser = {
    ...user,
    serial_number: serialNumber,
    created_at: new Date().toISOString(),
  };
  
  const { data, error } = await supabase
    .from('users')
    .insert([newUser])
    .select()
    .single();
    
  if (error) {
    console.error('Error saving user:', error);
    return null;
  }
  
  return data as User;
}; 