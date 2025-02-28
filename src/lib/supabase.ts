import { createClient } from "@supabase/supabase-js";

// Debugging: Log environment variables to verify they are loaded correctly
console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("Supabase Anon Key:", import.meta.env.VITE_SUPABASE_ANON_KEY);

// Ensure environment variables are loaded
if (
  !import.meta.env.VITE_SUPABASE_URL ||
  !import.meta.env.VITE_SUPABASE_ANON_KEY
) {
  console.error(
    "Error: Missing Supabase environment variables. Please check your .env file."
  );
}

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
