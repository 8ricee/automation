import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email và mật khẩu là bắt buộc' },
        { status: 400 }
      )
    }

    const supabase = await createClient(cookies())

    // Đăng nhập với Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { 
          success: false, 
          message: authError.message.includes('Invalid login credentials') 
            ? 'Email hoặc mật khẩu không đúng' 
            : 'Đăng nhập thất bại' 
        },
        { status: 401 }
      )
    }

    if (!authData.user || !authData.session) {
      return NextResponse.json(
        { success: false, message: 'Không thể tạo session' },
        { status: 401 }
      )
    }

    // Lấy thông tin nhân viên từ database với role và permissions
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select(`
        id, name, email, position, department, role_id, is_active,
        roles(id, name, description, permissions)
      `)
      .eq('id', authData.user.id)
      .single()

    if (employeeError) {
      console.error('Employee error:', employeeError)
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy thông tin nhân viên' },
        { status: 404 }
      )
    }

    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'Tài khoản không tồn tại trong hệ thống' },
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
      last_login: new Date().toISOString()
    }

    // Cập nhật last_login
    try {
      await supabase
        .from('employees')
        .update({ last_login: new Date().toISOString() })
        .eq('id', employee.id)
    } catch (error) {
      console.error('Error updating last_login:', error)
      // Không throw error vì đây không phải lỗi nghiêm trọng
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set('sb-access-token', authData.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    cookieStore.set('sb-refresh-token', authData.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })

    return NextResponse.json({
      success: true,
      message: 'Đăng nhập thành công',
      user,
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at
      }
    })

  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi server nội bộ' },
      { status: 500 }
    )
  }
}
