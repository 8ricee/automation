// Crypto utilities for secure cookie management
import CryptoJS from 'crypto-js'

// Secret key - trong production nên lưu trong environment variables
const SECRET_KEY = process.env.NEXT_PUBLIC_COOKIE_SECRET || 'your-secret-key-change-in-production'

/**
 * Mã hóa dữ liệu cookie
 */
export function encryptCookie(value: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(value, SECRET_KEY).toString()
    return encrypted
  } catch (error) {
    console.error('Cookie encryption error:', error)
    return value // Fallback to original value
  }
}

/**
 * Giải mã dữ liệu cookie
 */
export function decryptCookie(encryptedValue: string): string | null {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedValue, SECRET_KEY)
    const result = decrypted.toString(CryptoJS.enc.Utf8)
    
    if (!result) {
      console.warn('Failed to decrypt cookie, returning null')
      return null
    }
    
    return result
  } catch (error) {
    console.error('Cookie decryption error:', error)
    return null
  }
}

/**
 * Tạo hash cho cookie để detect tampering
 */
export function createCookieHash(value: string): string {
  return CryptoJS.HmacSHA256(value, SECRET_KEY).toString()
}

/**
 * Verify cookie hash
 */
export function verifyCookieHash(value: string, hash: string): boolean {
  try {
    const expectedHash = createCookieHash(value)
    return CryptoJS.HmacSHA256(expectedHash, SECRET_KEY).toString() === hash
  } catch (error) {
    console.error('Cookie hash verification error:', error)
    return false
  }
}

/**
 * Secure random string generator
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const randomValues = new Uint8Array(length)
  crypto.getRandomValues(randomValues)
  
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length]
  }
  
  return result
}

/**
 * Get real IP address from request
 */
export function getRealIP(req?: Request): string {
  if (!req) return 'unknown'
  
  // Check various headers for real IP
  const forwardedFor = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')
  const cfConnectingIP = req.headers.get('cf-connecting-ip')
  
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim()
  }
  
  if (realIP) return realIP
  if (cfConnectingIP) return cfConnectingIP
  
  return 'unknown'
}
