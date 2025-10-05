// API endpoint để lấy IP thực của client
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Lấy IP từ các headers khác nhau
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const cfConnectingIP = request.headers.get('cf-connecting-ip')
    
    let clientIP = 'unknown'
    
    if (forwardedFor) {
      // X-Forwarded-For có thể chứa nhiều IP, lấy IP đầu tiên
      clientIP = forwardedFor.split(',')[0].trim()
    } else if (realIP) {
      clientIP = realIP
    } else if (cfConnectingIP) {
      clientIP = cfConnectingIP
    }
    
    return NextResponse.json({ ip: clientIP })
  } catch (error) {
    console.error('Error getting client IP:', error)
    return NextResponse.json({ ip: 'unknown' })
  }
}
