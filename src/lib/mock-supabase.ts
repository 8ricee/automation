// Mock Supabase client để development khi Supabase connection chưa stable
import { createClient } from '@supabase/supabase-js'

// Mock data để development
const mockCustomers = [
  {
    id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    name: 'Công Ty TNHH ABC',
    email: 'contact@abc.com',
    company: 'ABC Company',
    status: 'active',
    phone: '+84 123 456 789',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    notes: 'Khách hàng VIP'
  },
  {
    id: '2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    name: 'Doanh Nghiệp XYZ',
    email: 'info@xyz.com',
    company: 'XYZ Corp',
    status: 'active',
    phone: '+84 987 654 321',
    address: '456 Đường XYZ, Quận 2, TP.HCM',
    notes: 'Khách hàng mới'
  },
  {
    id: '3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    name: 'Test Company',
    email: 'test@example.com',
    company: 'Test Corp',
    status: 'pending',
    phone: '+84 111 222 333',
    address: '789 Đường Test, Quận 3, TP.HCM',
    notes: 'Test customer'
  }
]

const mockProducts = [
  {
    id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    name: 'Sản phẩm A',
    description: 'Mô tả sản phẩm A',
    price: 100000,
    sku: 'SPA-001',
    status: 'active',
    stock_quantity: 50
  },
  {
    id: '2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    name: 'Sản phẩm B',
    description: 'Mô tả sản phẩm B',
    price: 200000,
    sku: 'SPB-002',
    status: 'active',
    stock_quantity: 30
  }
]

class MockSupabaseClient {
  private currentUser: any = null
  private isAuthenticated = false

  private authMethods = {
    getUser: async () => {
      return { 
        data: { user: this.currentUser }, 
        error: null 
      }
    },
    
    getSession: async () => {
      return {
        data: { 
          session: this.isAuthenticated ? { 
            user: this.currentUser,
            access_token: 'mock-token',
            refresh_token: 'mock-refresh-token'
          } : null 
        }, 
        error: null 
      }
    },
    
    signInWithPassword: async ({ email, password }: { email: string, password: string }) => {
      // Mock authentication logic
      if (email.includes('@anhminhtsc.com') && password.length >= 6) {
        this.currentUser = {
          id: 'mock-employee-1',
          email: email,
          user_metadata: {
            full_name: email.split('@')[0]
          },
          created_at: new Date().toISOString(),
          aud: 'authenticated',
          app_metadata: {},
          identities: [],
          factors: []
        }
        this.isAuthenticated = true
        
        return {
          data: { 
            user: this.currentUser, 
            session: {
              user: this.currentUser,
              access_token: 'mock-token',
              refresh_token: 'mock-refresh-token'
            }
          }, 
          error: null 
        }
      } else {
        return {
          data: { user: null, session: null },
          error: { message: 'Email hoặc mật khẩu không đúng' }
        }
      }
    },
    
    signUp: async ({ email, password }: { email: string, password: string }) => {
      if (!email.includes('@anhminhtsc.com')) {
        return {
          data: { user: null, session: null },
          error: { message: 'Chỉ email công ty mới được phép đăng ký' }
        }
      }
      
      this.currentUser = {
        id: 'mock-employee-new',
        email: email,
        user_metadata: {
          full_name: email.split('@')[0]
        },
        created_at: new Date().toISOString(),
        aud: 'authenticated',
        app_metadata: {},
        identities: [],
        factors: []
      }
      this.isAuthenticated = true
      
      return {
        data: { 
          user: this.currentUser, 
          session: {
            user: this.currentUser,
            access_token: 'mock-token',
            refresh_token: 'mock-refresh-token'
          }
        }, 
        error: null 
      }
    },
    
    signOut: async () => {
      this.currentUser = null
      this.isAuthenticated = false
      return { error: null }
    },
    
    onAuthStateChange: (callback: Function) => {
      // Mock auth state change listener
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      }
    }
  }

  constructor() {}

  get auth() {
    return this.authMethods
  }

  from(table: string) {
    let mockData: any[] = []
    
    switch (table) {
      case 'customers':
        mockData = mockCustomers
        break
      case 'products':
        mockData = mockProducts
        break
      default:
        mockData = []
    }

    return {
      select: (columns: string) => ({
        limit: (n: number) => ({
          then: (callback: Function) => {
            setTimeout(() => {
              const result = {
                data: mockData.slice(0, n),
                error: null
              }
              callback(result)
            }, 200) // Simulate network delay
          }
        }),
        then: (callback: Function) => {
          setTimeout(() => {
            const result = {
              data: mockData,
              error: null
            }
            callback(result)
          }, 200)
        }
      }),
      insert: (data: any) => ({
        then: (callback: Function) => {
          const mockInsert = {
            data: { ...data, id: Date.now().toString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            error: null
          }
          setTimeout(() => callback(mockInsert), 200)
        }
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          then: (callback: Function) => {
            const mockUpdate = {
              data: { ...data, updated_at: new Date().toISOString() },
              error: null
            }
            setTimeout(() => callback(mockUpdate), 200)
          }
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          then: (callback: Function) => {
            const mockDelete = {
              data: { id: value },
              error: null
            }
            setTimeout(() => callback(mockDelete), 200)
          }
        })
      })
    }
  }
}

// Export mock client
export const mockSupabase = new MockSupabaseClient()

// Try to create real Supabase client, fallback to mock if error
let supabase: any

try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing environment variables')
  }
  
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
} catch (error) {
  console.warn('Supabase initialization failed, using mock client:', error)
  supabase = mockSupabase
}

export { supabase }
