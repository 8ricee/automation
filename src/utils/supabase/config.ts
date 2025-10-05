// src/utils/supabase/config.ts
// Cấu hình Supabase cho ứng dụng

export const supabaseConfig = {
  // URL của Supabase project
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  
  // Anon key cho client-side operations
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  
  // Service role key cho server-side operations (chỉ sử dụng trong server)
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  
  // Cấu hình auth
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  
  // Cấu hình realtime
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  
  // Cấu hình global
  global: {
    headers: {
      'X-Client-Info': 'automation-app',
    },
  },
}

// Validation function để kiểm tra cấu hình
export function validateSupabaseConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!supabaseConfig.url) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required')
  }
  
  if (!supabaseConfig.anonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  }
  
  // Kiểm tra format URL
  if (supabaseConfig.url && !supabaseConfig.url.startsWith('https://')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Environment check
export function getEnvironment(): 'development' | 'production' | 'test' {
  if (process.env.NODE_ENV === 'test') return 'test'
  if (process.env.NODE_ENV === 'production') return 'production'
  return 'development'
}

// Debug mode
export const isDebugMode = process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true'
