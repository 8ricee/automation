// src/utils/supabase/client.ts
// Supabase client initialization đơn giản

import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

// Đơn giản hóa - tạo client trực tiếp
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Tạo client đơn giản
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Export types
export type { Database } from './types'