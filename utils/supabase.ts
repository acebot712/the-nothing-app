import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, Session, User } from "@supabase/supabase-js";
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

// Authentication Methods

/**
 * Sign in with OAuth provider
 * @param provider The OAuth provider to use
 * @returns Promise with the session or null
 */
export const signInWithOAuth = async (
  provider: "google" | "github" | "apple",
) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: "com.thebadgeapp://auth/callback",
    },
  });

  if (error) {
    console.error("OAuth sign in error:", error.message);
    throw error;
  }

  return data;
};

/**
 * Sign out the user
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Sign out error:", error.message);
    throw error;
  }
};

/**
 * Get the current session
 * @returns Promise with the session or null
 */
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Get session error:", error.message);
    throw error;
  }

  return data.session;
};

/**
 * Get the current user
 * @returns Promise with the user or null
 */
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("Get user error:", error.message);
    throw error;
  }

  return data.user;
};

// User Profile Methods

/**
 * Fetch or create user profile
 * @param user Supabase auth user
 * @returns User profile object
 */
export const fetchOrCreateUserProfile = async (user: User) => {
  // First check if profile exists
  const { data: existingProfile, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Error fetching profile:", fetchError);
    throw fetchError;
  }

  // If profile exists, return it
  if (existingProfile) {
    return {
      id: existingProfile.id,
      username: existingProfile.username || user.email?.split("@")[0] || "User",
      tier: existingProfile.tier || "regular",
      purchase_amount: existingProfile.purchase_amount || 0,
      serial_number:
        existingProfile.serial_number ||
        `BADGE-${Math.floor(Math.random() * 1000000)}`,
      created_at: existingProfile.created_at || new Date().toISOString(),
      email: user.email,
      avatar_url: user.user_metadata?.avatar_url,
    };
  }

  // Create new profile
  const newProfile = {
    id: user.id,
    username: user.email?.split("@")[0] || "User",
    tier: "regular",
    purchase_amount: 0,
    serial_number: `BADGE-${Math.floor(Math.random() * 1000000)}`,
    created_at: new Date().toISOString(),
    email: user.email,
  };

  const { error: insertError } = await supabase
    .from("profiles")
    .insert([newProfile]);

  if (insertError) {
    console.error("Error creating profile:", insertError);
    throw insertError;
  }

  return {
    ...newProfile,
    avatar_url: user.user_metadata?.avatar_url,
  };
};

// Auth state change listener setup
export const setupAuthListener = (
  callback: (session: Session | null) => void,
) => {
  const { data } = supabase.auth.onAuthStateChange((_, session) => {
    callback(session);
  });

  return data.subscription;
};
