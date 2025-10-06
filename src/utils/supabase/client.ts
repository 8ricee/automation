import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = () =>
  createBrowserClient(
    supabaseUrl!,
    supabaseKey!,
  );

// Export supabase instance for backward compatibility
export const supabase = createClient();

// Additional exports for compatibility
export const getSupabaseClient = createClient;
export const supabaseManager = {
  getClient: createClient,
  supabase
};
