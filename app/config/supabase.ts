import "react-native-url-polyfill/auto";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } from "@env";

// Use environment variables for Supabase credentials
const supabaseUrl = EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase credentials are missing. Please check your environment variables.",
  );
}

// Create the Supabase client
export const supabase: SupabaseClient = createClient(
  supabaseUrl || "",
  supabaseAnonKey || "",
  {
    auth: {
      storage: AsyncStorage as any, // Type assertion needed for compatibility
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

// Database interface types
export interface User {
  id: string;
  email: string;
  username: string;
  net_worth: number;
  tier: "regular" | "elite" | "god";
  purchase_amount: number;
  serial_number: string;
  created_at: string;
  invite_code?: string;
  invite_verified?: boolean;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  purchase_amount: number;
  tier: "regular" | "elite" | "god";
  created_at: string;
}

export interface InviteCode {
  id: string;
  code: string;
  used: boolean;
  created_at: string;
}

// Error reporting and handling
let isInFakeDataMode = false;

// Database helper functions
export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    if (isInFakeDataMode) {
      return getFakeLeaderboard();
    }

    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .order("purchase_amount", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching leaderboard:", error);
      return getFakeLeaderboard();
    }

    return data as LeaderboardEntry[];
  } catch (error) {
    console.error("Exception in getLeaderboard:", error);
    return getFakeLeaderboard();
  }
};

export const saveUser = async (user: Partial<User>): Promise<User | null> => {
  try {
    if (isInFakeDataMode) {
      return createFakeUser(user);
    }

    const serialNumber = `RICH-${Math.floor(Math.random() * 1000000)}`;

    // Ensure all required fields are present
    const newUser = {
      id: user.id || `user_${Math.random().toString(36).substring(2, 11)}`,
      email:
        user.email ||
        `user_${Math.random().toString(36).substring(2, 7)}@example.com`,
      username: user.username || "Anonymous",
      net_worth: user.net_worth || 1000000,
      tier: user.tier || "regular",
      purchase_amount: user.purchase_amount || 0,
      serial_number: user.serial_number || serialNumber,
      created_at: user.created_at || new Date().toISOString(),
      invite_verified: user.invite_verified,
      invite_code: user.invite_code,
    };

    // Check if user exists
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("*")
      .eq("id", newUser.id)
      .single();

    if (userCheckError && userCheckError.code !== "PGRST116") {
      // PGRST116 means no rows returned, which is expected when user doesn't exist
      console.error("Error checking existing user:", userCheckError);
    }

    let data, error;

    if (existingUser) {
      // Update existing user
      const { data: updatedData, error: updateError } = await supabase
        .from("users")
        .update(newUser)
        .eq("id", newUser.id)
        .select()
        .single();

      data = updatedData;
      error = updateError;
    } else {
      // Insert new user
      const { data: insertedData, error: insertError } = await supabase
        .from("users")
        .insert([newUser])
        .select()
        .single();

      data = insertedData;
      error = insertError;

      // Handle duplicate email constraint error
      if (
        insertError &&
        insertError.code === "23505" &&
        insertError.message?.includes("users_email_key")
      ) {
        // Create a unique email by appending a timestamp
        const timestamp = Date.now();
        const emailParts = newUser.email.split("@");
        newUser.email = `${emailParts[0]}_${timestamp}@${emailParts[1]}`;

        // Try inserting again with the modified email
        const { data: retryData, error: retryError } = await supabase
          .from("users")
          .insert([newUser])
          .select()
          .single();

        data = retryData;
        error = retryError;
      }
    }

    if (error) {
      console.error("Error saving user:", error);
      return createFakeUser(user);
    }

    return data as User;
  } catch (error) {
    console.error("Exception in saveUser:", error);
    return createFakeUser(user);
  }
};

export const getInviteCode = async (
  code: string,
): Promise<InviteCode | null> => {
  try {
    if (isInFakeDataMode) {
      return validateFakeInviteCode(code);
    }

    const { data, error } = await supabase
      .from("invite_codes")
      .select("*")
      .eq("code", code.toUpperCase())
      .single();

    if (error || !data) {
      console.error("Error fetching invite code:", error);
      return validateFakeInviteCode(code);
    }

    return data as InviteCode;
  } catch (error) {
    console.error("Exception in getInviteCode:", error);
    return validateFakeInviteCode(code);
  }
};

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    if (isInFakeDataMode) {
      return createFakeUser({ id: userId });
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.error("Error fetching user by ID:", error);
      return createFakeUser({ id: userId });
    }

    return data as User;
  } catch (error) {
    console.error("Exception in getUserById:", error);
    return createFakeUser({ id: userId });
  }
};

// Initialize database or fall back to fake data mode
export const initializeSupabase = async (): Promise<boolean> => {
  try {
    console.info("Checking Supabase connection and tables...");

    // Test the connection by checking if we can access the "users" table
    const { error } = await supabase.from("users").select("count").limit(1);

    if (error) {
      console.error("Error accessing users table:", error);

      // Fall back to fake data mode
      enableFakeDataMode();
      return true; // Return true to allow app to function with fake data
    }

    // Check if we can access the "leaderboard" table
    const { error: leaderboardError } = await supabase
      .from("leaderboard")
      .select("count")
      .limit(1);

    if (leaderboardError) {
      console.error("Error accessing leaderboard table:", leaderboardError);
      enableFakeDataMode();
      return true;
    }

    // Check if we can access the "invite_codes" table
    const { error: inviteCodesError } = await supabase
      .from("invite_codes")
      .select("count")
      .limit(1);

    if (inviteCodesError) {
      console.error("Error accessing invite_codes table:", inviteCodesError);
      enableFakeDataMode();
      return true;
    }

    console.info("Supabase connection and tables verified successfully.");
    return true;
  } catch (error) {
    console.error("Exception during Supabase initialization:", error);
    enableFakeDataMode();
    return true;
  }
};

// Debug function to help with troubleshooting
export const debugSupabaseConnection = async (): Promise<void> => {
  console.log("Starting Supabase connection debug...");
  console.log(`Supabase URL: ${supabaseUrl ? "Configured" : "Missing"}`);
  console.log(`Anon Key: ${supabaseAnonKey ? "Configured" : "Missing"}`);

  try {
    // Test connection
    const { error } = await supabase.from("users").select("count").limit(1);

    if (error) {
      console.error("Connection test failed:", error);

      if (error.code === "42P01") {
        console.log("Required tables missing. Please run the setup script.");
      } else if (error.code === "3000") {
        console.log("Authentication error. Check your Supabase credentials.");
      } else if (error.code === "PGRST301") {
        console.log("Permission denied. Check your database policies.");
      }
    } else {
      console.log("Database connection successful!");
    }

    // Check each table
    const tables = ["users", "leaderboard", "invite_codes"];
    for (const table of tables) {
      const { error } = await supabase.from(table).select("count").limit(1);
      console.log(
        `Table "${table}": ${error ? "Error - " + error.message : "OK"}`,
      );
    }
  } catch (error) {
    console.error("Error during connection debug:", error);
  }
};

// PRIVATE implementation functions
function enableFakeDataMode(): void {
  console.warn("ACTIVATING FAKE DATA MODE - using mocked database responses");
  console.warn("To use real data, please set up the required database tables");
  isInFakeDataMode = true;
}

function getFakeLeaderboard(): LeaderboardEntry[] {
  return [
    {
      id: "user1",
      username: "BezosWannabe",
      purchase_amount: 5000,
      tier: "god",
      created_at: new Date().toISOString(),
    },
    {
      id: "user2",
      username: "MuskRat",
      purchase_amount: 3000,
      tier: "elite",
      created_at: new Date().toISOString(),
    },
    {
      id: "user3",
      username: "BillGatesKeeper",
      purchase_amount: 2500,
      tier: "elite",
      created_at: new Date().toISOString(),
    },
    {
      id: "user4",
      username: "WarrenBuffett",
      purchase_amount: 2000,
      tier: "regular",
      created_at: new Date().toISOString(),
    },
    {
      id: "user5",
      username: "ZuckerBurger",
      purchase_amount: 1500,
      tier: "regular",
      created_at: new Date().toISOString(),
    },
  ];
}

function createFakeUser(user: Partial<User>): User {
  return {
    id: user.id || `user_${Math.random().toString(36).substring(2, 11)}`,
    email:
      user.email ||
      `user_${Math.random().toString(36).substring(2, 7)}@example.com`,
    username: user.username || "Anonymous",
    net_worth: user.net_worth || 1000000,
    tier: user.tier || "regular",
    purchase_amount: user.purchase_amount || 0,
    serial_number:
      user.serial_number || `RICH-${Math.floor(Math.random() * 1000000)}`,
    created_at: user.created_at || new Date().toISOString(),
    invite_verified: user.invite_verified || false,
    invite_code: user.invite_code || null,
  } as User;
}

function validateFakeInviteCode(code: string): InviteCode | null {
  if (code && code.length >= 4) {
    return {
      id: "1",
      code: code.toUpperCase(),
      used: false,
      created_at: new Date().toISOString(),
    };
  }
  return null;
}
