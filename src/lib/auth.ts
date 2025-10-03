import { supabase } from './supabase'
import { User, Session } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email?: string
  full_name?: string
  avatar_url?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface SignUpData {
  email: string
  password: string
  full_name?: string
}

export class AuthService {
  static async signIn({ email, password }: SignInData) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return {
        user: data.user,
        session: data.session,
      }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  static async signUp({ email, password, full_name }: SignUpData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: full_name || email.split('@')[0],
          },
        },
      })

      if (error) throw error

      return {
        user: data.user,
        session: data.session,
      }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  }

  // Listen to auth changes
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}
