import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET() {
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

    // Lấy thông tin nhân viên từ database với role và permissions
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select(`
        id, name, email, position, department, role_id, is_active, created_at, updated_at,
        roles(id, name, description, permissions)
      `)
      .eq('id', authUser.id)
      .single()

    if (employeeError || !employee) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy thông tin nhân viên' },
        { status: 404 }
      )
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
      // Nếu permissions là JSON string, parse nó
      try {
        userPermissions = JSON.parse(roleData.permissions)
      } catch {
        userPermissions = []
      }
    }

    // Tạo user object với permissions từ database
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
      created_at: employee.created_at,
      updated_at: employee.updated_at
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
