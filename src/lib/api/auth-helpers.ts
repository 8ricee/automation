import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

// Interface cho authenticated user
export interface AuthenticatedUser {
  id: string
  email: string
  role_id: string
  role_name: string
  permissions: string[]
  is_active: boolean
}

// Kiểm tra authentication và trả về user info
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const supabase = await createClient(cookies())

    // Lấy session từ cookie
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return null
    }

    // Lấy thông tin nhân viên từ database với role và permissions
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select(`
        id, name, email, position, department, role_id, is_active,
        roles(id, name, description, permissions)
      `)
      .eq('id', authUser.id)
      .single()

    if (employeeError || !employee) {
      return null
    }

    // Xử lý permissions từ database
    const roleData = employee.roles as unknown as {
      id: string;
      name: string;
      description: string;
      permissions?: string[];
    }

    let userPermissions: string[] = []
    
    if (roleData?.permissions && Array.isArray(roleData.permissions)) {
      userPermissions = roleData.permissions
    } else if (roleData?.permissions && typeof roleData.permissions === 'string') {
      try {
        userPermissions = JSON.parse(roleData.permissions)
      } catch {
        userPermissions = []
      }
    }

    return {
      id: employee.id,
      email: employee.email,
      role_id: employee.role_id,
      role_name: roleData?.name || 'employee',
      permissions: userPermissions,
      is_active: employee.is_active
    }

  } catch (error) {
    console.error('getAuthenticatedUser error:', error)
    return null
  }
}

// Kiểm tra permission cụ thể
export async function checkPermission(permission: string): Promise<boolean> {
  try {
    const supabase = await createClient(cookies())
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

// Kiểm tra có bất kỳ permission nào trong danh sách
export async function hasAnyPermission(permissions: string[]): Promise<boolean> {
  for (const permission of permissions) {
    if (await checkPermission(permission)) {
      return true
    }
  }
  return false
}

// Kiểm tra có tất cả permissions trong danh sách
export async function hasAllPermissions(permissions: string[]): Promise<boolean> {
  for (const permission of permissions) {
    if (!(await checkPermission(permission))) {
      return false
    }
  }
  return true
}

// Middleware helper để kiểm tra authentication
export async function requireAuth(request?: NextRequest): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(request)
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  if (!user.is_active) {
    throw new Error('Account is inactive')
  }
  
  return user
}

// Middleware helper để kiểm tra permission
export async function requirePermission(permission: string, request?: NextRequest): Promise<AuthenticatedUser> {
  const user = await requireAuth(request)
  
  const hasPermission = await checkPermission(permission)
  
  if (!hasPermission) {
    throw new Error(`Permission denied: ${permission}`)
  }
  
  return user
}

// Middleware helper để kiểm tra role
export async function requireRole(role: string, request?: NextRequest): Promise<AuthenticatedUser> {
  const user = await requireAuth(request)
  
  if (user.role_name !== role) {
    throw new Error(`Role required: ${role}`)
  }
  
  return user
}

// Utility để tạo error response
export function createErrorResponse(message: string, status: number = 400) {
  return Response.json(
    { success: false, message },
    { status }
  )
}

// Utility để tạo success response
export function createSuccessResponse(data: unknown, message?: string) {
  return Response.json({
    success: true,
    data,
    message
  })
}
