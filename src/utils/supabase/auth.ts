// src/utils/supabase/auth.ts
// Authentication utilities cho Supabase

import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from './client'
import { isDebugMode } from './config'

// Auth state interface
export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
}

// Login credentials
export interface LoginCredentials {
  email: string
  password: string
}

// Register credentials
export interface RegisterCredentials {
  email: string
  password: string
  name?: string
}

// Password reset request
export interface PasswordResetRequest {
  email: string
}

// Auth service class
export class AuthService {
  private static instance: AuthService
  private currentUser: User | null = null
  private currentSession: Session | null = null
  private listeners: Set<(state: AuthState) => void> = new Set()

  private constructor() {
    this.initializeAuth()
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  private async initializeAuth(): Promise<void> {
    try {
      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('❌ Error getting initial session:', error)
        this.notifyListeners({ user: null, session: null, loading: false, error: error.message })
        return
      }

      this.currentSession = session
      this.currentUser = session?.user || null

      if (isDebugMode) {
        console.log('MockSupabaseAuth initialized:', {
          hasUser: !!this.currentUser, 
          hasSession: !!this.currentSession 
        })
      }

      this.notifyListeners({ 
        user: this.currentUser, 
        session: this.currentSession, 
        loading: false, 
        error: null 
      })

      // Listen for auth changes
      supabase.auth.onAuthStateChange((event, session) => {
        if (isDebugMode) {
          console.log('Auth state changed:', {
            event,
            hasUser: !!session?.user, 
            hasSession: !!session 
          })
        }

        this.currentSession = session
        this.currentUser = session?.user || null

        this.notifyListeners({ 
          user: this.currentUser, 
          session: this.currentSession, 
          loading: false, 
          error: null 
        })
      })

    } catch (error) {
      console.error('❌ Auth initialization error:', error)
      this.notifyListeners({ 
        user: null, 
        session: null, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }

  // Subscribe to auth state changes
  public subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener)
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notifyListeners(state: AuthState): void {
    this.listeners.forEach(listener => {
      try {
        listener(state)
      } catch (error) {
        console.error('❌ Error in auth listener:', error)
      }
    })
  }

  // Get current user
  public getCurrentUser(): User | null {
    return this.currentUser
  }

  // Get current session
  public getCurrentSession(): Session | null {
    return this.currentSession
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return !!this.currentUser && !!this.currentSession
  }

  // Check if user has specific role
  public hasRole(role: string): boolean {
    if (!this.currentUser) return false
    return this.currentUser.user_metadata?.role === role
  }

  // Login
  public async login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      if (isDebugMode) {

      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        console.error('❌ Login error:', error)
        return { success: false, error: error.message }
      }

      if (isDebugMode) {

      }

      return { success: true }
    } catch (error) {
      console.error('❌ Login exception:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Register
  public async register(credentials: RegisterCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      if (isDebugMode) {

      }

      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name || credentials.email.split('@')[0],
          }
        }
      })

      if (error) {
        console.error('❌ Registration error:', error)
        return { success: false, error: error.message }
      }

      if (isDebugMode) {

      }

      return { success: true }
    } catch (error) {
      console.error('❌ Registration exception:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Logout
  public async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      if (isDebugMode) {

      }

      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('❌ Logout error:', error)
        return { success: false, error: error.message }
      }

      if (isDebugMode) {

      }

      return { success: true }
    } catch (error) {
      console.error('❌ Logout exception:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Request password reset
  public async requestPasswordReset(request: PasswordResetRequest): Promise<{ success: boolean; error?: string }> {
    try {
      if (isDebugMode) {

      }

      const { error } = await supabase.auth.resetPasswordForEmail(request.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        console.error('❌ Password reset error:', error)
        return { success: false, error: error.message }
      }

      if (isDebugMode) {

      }

      return { success: true }
    } catch (error) {
      console.error('❌ Password reset exception:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Update password
  public async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.currentUser) {
        return { success: false, error: 'No authenticated user' }
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        console.error('❌ Password update error:', error)
        return { success: false, error: error.message }
      }

      if (isDebugMode) {

      }

      return { success: true }
    } catch (error) {
      console.error('❌ Password update exception:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Update user profile
  public async updateProfile(updates: { name?: string; [key: string]: any }): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.currentUser) {
        return { success: false, error: 'No authenticated user' }
      }

      const { error } = await supabase.auth.updateUser({
        data: updates
      })

      if (error) {
        console.error('❌ Profile update error:', error)
        return { success: false, error: error.message }
      }

      if (isDebugMode) {

      }

      return { success: true }
    } catch (error) {
      console.error('❌ Profile update exception:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance()

// Export convenience functions
export const getCurrentUser = () => authService.getCurrentUser()
export const getCurrentSession = () => authService.getCurrentSession()
export const isAuthenticated = () => authService.isAuthenticated()
export const hasRole = (role: string) => authService.hasRole(role)
export const login = (credentials: LoginCredentials) => authService.login(credentials)
export const register = (credentials: RegisterCredentials) => authService.register(credentials)
export const logout = () => authService.logout()
export const requestPasswordReset = (request: PasswordResetRequest) => authService.requestPasswordReset(request)
export const updatePassword = (newPassword: string) => authService.updatePassword(newPassword)
export const updateProfile = (updates: { name?: string; [key: string]: any }) => authService.updateProfile(updates)
export const subscribeToAuth = (listener: (state: AuthState) => void) => authService.subscribe(listener)
