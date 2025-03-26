/**
 * Environment configuration
 *
 * This file centralizes all environment variable access to avoid direct imports
 * of environment variables across the codebase, which can cause security issues.
 */
import { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } from "@env";

export const ENV = {
  SUPABASE: {
    URL: EXPO_PUBLIC_SUPABASE_URL,
    ANON_KEY: EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
};

/**
 * Validates that all required environment variables are defined
 * @returns True if all required environment variables are defined
 */
export const validateEnvironment = (): boolean => {
  const requiredVars = [
    { name: "SUPABASE URL", value: ENV.SUPABASE.URL },
    { name: "SUPABASE ANON KEY", value: ENV.SUPABASE.ANON_KEY },
  ];

  let isValid = true;

  requiredVars.forEach(({ name, value }) => {
    if (!value) {
      console.error(`Missing required environment variable: ${name}`);
      isValid = false;
    }
  });

  return isValid;
};
