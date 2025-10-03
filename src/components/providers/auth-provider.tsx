"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthService } from '@/lib/auth'
import { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, full_name?: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const currentUser = await AuthService.getCurrentUser()
      setUser(currentUser)
      setLoading(false)
    }

    getInitialSession()

    // Subscribe to auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      await AuthService.signIn({ email, password })
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, full_name?: string) => {
    try {
      setLoading(true)
      await AuthService.signUp({ email, password, full_name })
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await AuthService.signOut()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
