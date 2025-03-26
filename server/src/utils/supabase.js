const { createClient } = require("@supabase/supabase-js");
const config = require("../config");
const { logger } = require("./logger");

// Create Supabase client with service key for admin privileges
const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

// Create Supabase client with anon key for client-side equivalent operations
const supabaseClient = createClient(
  config.supabase.url,
  config.supabase.anonKey,
);

// Initialize database schema if it doesn't exist
const initializeDatabase = async () => {
  try {
    logger.info("Checking and initializing database schema...");

    // Check if users table exists
    const { error: usersCheckError } = await supabaseAdmin
      .from("users")
      .select("id")
      .limit(1);

    if (usersCheckError && usersCheckError.code === "42P01") {
      logger.info("Users table does not exist. Creating...");

      // Create users table
      const { error: createUsersError } = await supabaseAdmin.rpc(
        "create_users_table",
      );

      if (createUsersError) {
        logger.error(`Error creating users table: ${createUsersError.message}`);

        // If RPC fails, try direct SQL (in a production app, this would be handled better)
        await supabaseAdmin.rpc("create_tables", {
          sql: `
            CREATE TABLE public.users (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              email TEXT UNIQUE NOT NULL,
              username TEXT NOT NULL,
              net_worth NUMERIC DEFAULT 0,
              tier TEXT CHECK (tier IN ('regular', 'elite', 'god')) DEFAULT 'regular',
              purchase_amount NUMERIC DEFAULT 0,
              serial_number TEXT UNIQUE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

            CREATE POLICY "Users can view their own data"
              ON public.users FOR SELECT
              USING (auth.uid() = id);

            CREATE POLICY "Users can update their own data"
              ON public.users FOR UPDATE
              USING (auth.uid() = id);
          `,
        });
      }
    }

    // Check if leaderboard table exists
    const { error: leaderboardCheckError } = await supabaseAdmin
      .from("leaderboard")
      .select("id")
      .limit(1);

    if (leaderboardCheckError && leaderboardCheckError.code === "42P01") {
      logger.info("Leaderboard table does not exist. Creating...");

      // Create leaderboard table
      const { error: createLeaderboardError } = await supabaseAdmin.rpc(
        "create_tables",
        {
          sql: `
          CREATE TABLE public.leaderboard (
            id UUID PRIMARY KEY,
            username TEXT NOT NULL,
            purchase_amount NUMERIC DEFAULT 0,
            tier TEXT CHECK (tier IN ('regular', 'elite', 'god')) DEFAULT 'regular',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE
          );

          ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

          CREATE POLICY "Anyone can read leaderboard"
            ON public.leaderboard FOR SELECT
            TO anon, authenticated
            USING (true);
        `,
        },
      );

      if (createLeaderboardError) {
        logger.error(
          `Error creating leaderboard table: ${createLeaderboardError.message}`,
        );
      }

      // Add sample leaderboard data
      const sampleData = [
        {
          id: "11111111-1111-1111-1111-111111111111",
          username: "Elon M.",
          purchase_amount: 99999,
          tier: "god",
        },
        {
          id: "22222222-2222-2222-2222-222222222222",
          username: "Jeff B.",
          purchase_amount: 99999,
          tier: "god",
        },
        {
          id: "33333333-3333-3333-3333-333333333333",
          username: "Mark Z.",
          purchase_amount: 9999,
          tier: "elite",
        },
        {
          id: "44444444-4444-4444-4444-444444444444",
          username: "Bill G.",
          purchase_amount: 9999,
          tier: "elite",
        },
        {
          id: "55555555-5555-5555-5555-555555555555",
          username: "Warren B.",
          purchase_amount: 999,
          tier: "regular",
        },
      ];

      // Create sample users first
      for (const user of sampleData) {
        await supabaseAdmin.from("users").upsert({
          id: user.id,
          email: `${user.username.toLowerCase().replace(" ", "")}@example.com`,
          username: user.username,
          net_worth: user.purchase_amount * 10,
          tier: user.tier,
          purchase_amount: user.purchase_amount,
          serial_number: `RICH-${Math.floor(Math.random() * 1000000)}`,
        });
      }

      // Then add to leaderboard
      const { error: insertError } = await supabaseAdmin
        .from("leaderboard")
        .upsert(sampleData);

      if (insertError) {
        logger.error(
          `Error inserting sample leaderboard data: ${insertError.message}`,
        );
      }
    }

    logger.info("Database schema initialization complete.");
    return true;
  } catch (error) {
    logger.error("Error initializing database schema:", error);
    return false;
  }
};

module.exports = {
  supabaseAdmin,
  supabaseClient,
  initializeDatabase,
};
