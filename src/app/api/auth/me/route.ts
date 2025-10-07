import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient(cookies())

    // Lấy session từ cookie
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json(
        { success: false, message: 'Không có session hợp lệ' },
        { status: 401 }
      )
    }

    // Lấy thông tin nhân viên từ database
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select(`
        id, name, email, position, department, role_id, is_active, last_login,
        roles(id, name, description, permissions)
      `)
      .eq('email', authUser.email)
      .single()

    if (employeeError || !employee) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy thông tin nhân viên' },
        { status: 404 }
      )
    }

    // Xử lý permissions
    const roleData = employee.roles as unknown as {
      id: string;
      name: string;
      description: string;
      permissions?: string[];
    }

    let userPermissions: string[] = []
    
    if (roleData?.permissions && Array.isArray(roleData.permissions)) {
      userPermissions = roleData.permissions
    } else {
      // Fallback permissions dựa trên role name
      const roleName = roleData?.name
      if (roleName === 'admin') {
        userPermissions = ['*']
      } else if (roleName === 'director') {
        userPermissions = [
          'customers:read', 'customers:create', 'customers:update', 'customers:delete',
          'products:read', 'products:create', 'products:update', 'products:delete',
          'orders:read', 'orders:create', 'orders:update', 'orders:delete',
          'employees:read', 'employees:create', 'employees:update', 'employees:delete',
          'projects:read', 'projects:create', 'projects:update', 'projects:delete',
          'tasks:read', 'tasks:create', 'tasks:update', 'tasks:delete',
          'quotes:read', 'quotes:create', 'quotes:update', 'quotes:delete',
          'purchasing:read', 'purchasing:create', 'purchasing:update', 'purchasing:delete',
          'suppliers:read', 'suppliers:create', 'suppliers:update', 'suppliers:delete',
          'financials:read', 'financials:create', 'financials:update', 'financials:delete'
        ]
      } else if (roleName === 'manager') {
        userPermissions = [
          'customers:read', 'products:read', 'products:create', 'products:update', 'products:delete',
          'orders:read', 'orders:create', 'orders:update',
          'employees:read', 'employees:create', 'employees:update',
          'projects:read', 'projects:create', 'projects:update', 'projects:delete',
          'tasks:read', 'tasks:create', 'tasks:update', 'tasks:delete'
        ]
      } else if (roleName === 'sales') {
        userPermissions = [
          'customers:read', 'customers:create', 'customers:update', 'customers:delete',
          'products:read', 'orders:read', 'orders:create', 'orders:update',
          'quotes:read', 'quotes:create', 'quotes:update'
        ]
      } else if (roleName === 'engineer') {
        userPermissions = [
          'products:read', 'products:create', 'products:update', 'products:delete',
          'projects:read', 'projects:create', 'projects:update', 'projects:delete',
          'tasks:read', 'tasks:create', 'tasks:update', 'tasks:delete'
        ]
      } else if (roleName === 'purchasing') {
        userPermissions = [
          'products:read', 'products:create', 'products:update', 'products:delete',
          'purchasing:read', 'purchasing:create', 'purchasing:update', 'purchasing:delete',
          'suppliers:read', 'suppliers:create', 'suppliers:update', 'suppliers:delete'
        ]
      } else if (roleName === 'accountant') {
        userPermissions = [
          'customers:read', 'products:read', 'orders:read',
          'financials:read', 'financials:create', 'financials:update', 'financials:delete'
        ]
      } else {
        userPermissions = ['profile:read']
      }
    }

    // Tạo user object với permissions
    const user = {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      position: employee.position,
      department: employee.department,
      role_id: employee.role_id,
      role_name: roleData?.name || 'employee',
      permissions: userPermissions,
      is_active: employee.is_active,
      last_login: employee.last_login
    }

    return NextResponse.json({
      success: true,
      user
    })

  } catch (error) {
    console.error('Get user API error:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi server nội bộ' },
      { status: 500 }
    )
  }
}
