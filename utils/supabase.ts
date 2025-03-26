import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } from "@env";

// Fallback to empty strings if environment variables are not available
const supabaseUrl = EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase credentials are missing. Please check your environment variables.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
