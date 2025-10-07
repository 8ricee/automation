import { createClient } from '@/utils/supabase/client'

// Interface cho User từ AuthProvider
export interface User {
  id: string
  name: string
  email: string
  position?: string
  department?: string
  role_id?: string
  role_name?: string
  permissions?: string[]
  is_active: boolean
  auth_type: 'supabase' | 'custom'
}

// Kiểm tra permission cụ thể
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user || !user.permissions) return false
  
  // Admin có tất cả quyền
  if (user.permissions.includes('*')) return true
  
  return user.permissions.includes(permission)
}

// Kiểm tra role cụ thể
export function hasRole(user: User | null, role: string): boolean {
  if (!user) return false
  return user.role_name === role
}

// Kiểm tra có phải là nhân viên không
export function isEmployee(user: User | null): boolean {
  if (!user) return false
  return user.is_active === true
}

// Kiểm tra có bất kỳ permission nào trong danh sách
export function hasAnyPermission(user: User | null, permissions: string[]): boolean {
  if (!user || !user.permissions) return false
  
  if (user.permissions.includes('*')) return true
  
  return permissions.some(permission => user.permissions!.includes(permission))
}

// Kiểm tra có tất cả permissions trong danh sách
export function hasAllPermissions(user: User | null, permissions: string[]): boolean {
  if (!user || !user.permissions) return false
  
  if (user.permissions.includes('*')) return true
  
  return permissions.every(permission => user.permissions!.includes(permission))
}

// Kiểm tra permission từ database (server-side)
export async function checkPermissionFromDB(permission: string): Promise<boolean> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('check_permission', {
      permission_to_check: permission
    })
    
    if (error) {
      console.error('Permission check error:', error)
      return false
    }
    
    return data === true
  } catch (error) {
    console.error('Permission check exception:', error)
    return false
  }
}

// Lấy thông tin role từ database
export async function getRoleFromDB(roleId: string) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('roles')
      .select('id, name, description, permissions')
      .eq('id', roleId)
      .single()
    
    if (error) {
      console.error('Role fetch error:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Role fetch exception:', error)
    return null
  }
}

// Utility để format permissions từ database
export function formatPermissionsFromDB(permissions: unknown): string[] {
  if (!permissions) return []
  
  if (Array.isArray(permissions)) {
    return permissions
  }
  
  if (typeof permissions === 'string') {
    try {
      return JSON.parse(permissions)
    } catch {
      return []
    }
  }
  
  return []
}

// Kiểm tra quyền truy cập trang dựa trên permissions
export function canAccessPage(user: User | null, pagePath: string): boolean {
  if (!user) return false
  
  const pagePermissions: Record<string, string> = {
    '/customers': 'customers:view',
    '/products': 'products:view',
    '/inventory': 'inventory:view',
    '/orders': 'orders:view',
    '/employees': 'employees:view',
    '/projects': 'projects:view',
    '/tasks': 'tasks:view',
    '/quotes': 'quotes:view',
    '/purchasing': 'purchasing:view',
    '/suppliers': 'suppliers:view',
    '/financials': 'financials:view',
    '/analytics': 'analytics:view',
    '/settings': 'settings:view'
  }
  
  const requiredPermission = pagePermissions[pagePath]
  if (!requiredPermission) return true // Cho phép truy cập nếu không có permission requirement
  
  return hasPermission(user, requiredPermission)
}

// Lấy danh sách permissions được phép cho user
export function getAllowedPermissions(user: User | null): string[] {
  if (!user || !user.permissions) return []
  
  if (user.permissions.includes('*')) {
    // Trả về tất cả permissions có thể có
    return [
      'dashboard:view',
      'customers:view', 'customers:create', 'customers:edit', 'customers:delete',
      'products:view', 'products:create', 'products:edit', 'products:delete',
      'inventory:view', 'inventory:create', 'inventory:edit', 'inventory:delete', 'inventory:adjust',
      'orders:view', 'orders:create', 'orders:edit', 'orders:delete', 'orders:approve', 'orders:cancel',
      'employees:view', 'employees:create', 'employees:edit', 'employees:delete',
      'projects:view', 'projects:create', 'projects:edit', 'projects:delete', 'projects:assign', 'projects:approve',
      'tasks:view', 'tasks:create', 'tasks:edit', 'tasks:delete', 'tasks:assign', 'tasks:complete',
      'quotes:view', 'quotes:create', 'quotes:edit', 'quotes:delete', 'quotes:approve', 'quotes:send',
      'purchasing:view', 'purchasing:create', 'purchasing:edit', 'purchasing:delete', 'purchasing:approve',
      'suppliers:view', 'suppliers:create', 'suppliers:edit', 'suppliers:delete',
      'financials:view', 'financials:create', 'financials:edit', 'financials:delete', 'financials:approve', 'financials:export',
      'analytics:view', 'analytics:export',
      'profile:view', 'profile:edit',
      'settings:view', 'settings:edit'
    ]
  }
  
  return user.permissions
}