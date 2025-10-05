// src/config/company.ts
// Cấu hình công ty - dễ dàng thay đổi domain email

export const COMPANY_CONFIG = {
  // Domain email của công ty
  EMAIL_DOMAIN: '@anhminhtsc.com',
  
  // Tên công ty
  COMPANY_NAME: 'Anh Minh Tsc.',
  
  // Mô tả hệ thống
  SYSTEM_DESCRIPTION: 'Hệ thống quản lý nội bộ dành cho nhân viên',
  
  // Email IT support
  IT_EMAIL: 'it@anhminhtsc.com',
  
  // Hotline IT
  IT_HOTLINE: '1900-xxxx',
  
  // Placeholder cho form đăng nhập
  LOGIN_PLACEHOLDER: 'nhanvien@anhminhtsc.com',
  
  // Validation rules
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 6,
    ALLOWED_EMAIL_DOMAINS: ['@anhminhtsc.com']
  }
}

// Helper function để kiểm tra email hợp lệ
export function isValidCompanyEmail(email: string): boolean {
  return COMPANY_CONFIG.VALIDATION.ALLOWED_EMAIL_DOMAINS.some(domain => 
    email.includes(domain)
  )
}

// Helper function để lấy tên user từ email
export function getUserNameFromEmail(email: string): string {
  return email.split('@')[0]
}
