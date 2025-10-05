// src/utils/supabase/client.ts
// Supabase client initialization và management

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { supabaseConfig, validateSupabaseConfig, isDebugMode } from './config'
import { Database } from './types'

// Singleton pattern để đảm bảo chỉ có một instance của Supabase client
class SupabaseClientManager {
  private static instance: SupabaseClientManager
  private client: SupabaseClient<Database> | null = null
  private isInitialized = false

  private constructor() {}

  public static getInstance(): SupabaseClientManager {
    if (!SupabaseClientManager.instance) {
      SupabaseClientManager.instance = new SupabaseClientManager()
    }
    return SupabaseClientManager.instance
  }

  public getClient(): SupabaseClient<Database> {
    if (!this.client) {
      this.initializeClient()
    }
    return this.client!
  }

  private initializeClient(): void {
    try {
      // Validate configuration
      const validation = validateSupabaseConfig()
      if (!validation.isValid) {
        console.error('❌ Supabase configuration is invalid:', validation.errors)
        throw new Error(`Supabase configuration error: ${validation.errors.join(', ')}`)
      }

      if (isDebugMode) {
        console.log('🔧 Initializing Supabase client...')
        console.log('📍 Supabase URL:', supabaseConfig.url)
        console.log('🔑 Anon Key configured:', !!supabaseConfig.anonKey)
      }

      // Create Supabase client
      this.client = createClient<Database>(
        supabaseConfig.url,
        supabaseConfig.anonKey,
        {
          auth: supabaseConfig.auth,
          realtime: supabaseConfig.realtime,
          global: supabaseConfig.global,
        }
      )

      this.isInitialized = true

      if (isDebugMode) {
        console.log('✅ Supabase client initialized successfully')
      }

      // Test connection
      this.testConnection()

    } catch (error) {
      console.error('❌ Failed to initialize Supabase client:', error)
      throw error
    }
  }

  private async testConnection(): Promise<void> {
    if (!this.client) return

    try {
      // Simple connection test
      const { data, error } = await this.client
        .from('customers')
        .select('count')
        .limit(1)

      if (error) {
        if (isDebugMode) {
          console.warn('⚠️ Supabase connection test failed:', error.message)
          console.warn('This might indicate missing tables or permissions')
        }
      } else {
        if (isDebugMode) {
          console.log('✅ Supabase connection test successful')
        }
      }
    } catch (error) {
      if (isDebugMode) {
        console.warn('⚠️ Supabase connection test error:', error)
      }
    }
  }

  public async reconnect(): Promise<void> {
    if (isDebugMode) {
      console.log('🔄 Reconnecting to Supabase...')
    }
    
    this.client = null
    this.isInitialized = false
    this.initializeClient()
  }

  public isClientInitialized(): boolean {
    return this.isInitialized && this.client !== null
  }

  // Health check method
  public async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; error?: string }> {
    if (!this.client) {
      return { status: 'unhealthy', error: 'Client not initialized' }
    }

    try {
      const { error } = await this.client
        .from('customers')
        .select('count')
        .limit(1)

      if (error) {
        return { status: 'unhealthy', error: error.message }
      }

      return { status: 'healthy' }
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
}

// Export singleton instance
const supabaseManager = SupabaseClientManager.getInstance()

// Export the client getter function
export const getSupabaseClient = (): SupabaseClient<Database> => {
  return supabaseManager.getClient()
}

// Export the client directly for convenience
export const supabase = getSupabaseClient()

// Export manager for advanced usage
export { supabaseManager }

// Export types
export type { SupabaseClient, Database }
