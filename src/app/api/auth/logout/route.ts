import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const supabase = await createClient(cookies())

    // Đăng xuất từ Supabase
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout error:', error)
      return NextResponse.json(
        { success: false, message: 'Lỗi khi đăng xuất' },
        { status: 500 }
      )
    }

    // Xóa cookies
    const cookieStore = await cookies()
    cookieStore.delete('sb-access-token')
    cookieStore.delete('sb-refresh-token')

    return NextResponse.json({
      success: true,
      message: 'Đăng xuất thành công'
    })

  } catch (error) {
    console.error('Logout API error:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi server nội bộ' },
      { status: 500 }
    )
  }
}
