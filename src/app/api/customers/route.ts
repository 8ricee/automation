import { NextRequest } from 'next/server'
import { requirePermission, createErrorResponse, createSuccessResponse } from '@/lib/api/auth-helpers'

// API route mẫu để demo việc sử dụng permissions
export async function GET(request: NextRequest) {
  try {
    // Kiểm tra permission 'customers:view'
    const user = await requirePermission('customers:view', request)
    
    // Nếu có permission, trả về dữ liệu
    return createSuccessResponse({
      message: `Xin chào ${user.email}!`,
      userRole: user.role_name,
      permissions: user.permissions
    }, 'Bạn có quyền xem khách hàng')
    
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return createErrorResponse('Chưa đăng nhập', 401)
      }
      if (error.message.includes('Permission denied')) {
        return createErrorResponse('Không có quyền truy cập', 403)
      }
      if (error.message === 'Account is inactive') {
        return createErrorResponse('Tài khoản đã bị vô hiệu hóa', 403)
      }
    }
    
    return createErrorResponse('Lỗi server nội bộ', 500)
  }
}

// POST method để demo việc tạo mới
export async function POST(request: NextRequest) {
  try {
    // Kiểm tra permission 'customers:create'
    const user = await requirePermission('customers:create', request)
    
    const body = await request.json()
    
    // Logic tạo customer ở đây...
    
    return createSuccessResponse({
      message: `Customer created by ${user.email}`,
      data: body
    }, 'Tạo khách hàng thành công')
    
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return createErrorResponse('Chưa đăng nhập', 401)
      }
      if (error.message.includes('Permission denied')) {
        return createErrorResponse('Không có quyền tạo khách hàng', 403)
      }
      if (error.message === 'Account is inactive') {
        return createErrorResponse('Tài khoản đã bị vô hiệu hóa', 403)
      }
    }
    
    return createErrorResponse('Lỗi server nội bộ', 500)
  }
}
