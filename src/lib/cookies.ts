// Utility functions for cookie management
import { encryptCookie, decryptCookie, createCookieHash } from './crypto'

export function setCookie(name: string, value: string, hours: number = 2) {
  if (typeof window === 'undefined') return
  
  // Mã hóa giá trị cookie
  const encryptedValue = encryptCookie(value)
  const hash = createCookieHash(value)
  
  const expires = new Date()
  expires.setTime(expires.getTime() + hours * 60 * 60 * 1000)
  
  // Lưu cả encrypted value và hash
  const cookieData = JSON.stringify({
    value: encryptedValue,
    hash: hash,
    timestamp: Date.now()
  })
  
  document.cookie = `${name}=${encodeURIComponent(cookieData)};expires=${expires.toUTCString()};path=/;secure;samesite=strict;httponly`
}

export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null
  
  const nameEQ = name + "="
  const ca = document.cookie.split(';')
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    // Kiểm tra c có tồn tại và không phải undefined/null
    if (!c || typeof c !== 'string') continue
    
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) {
      try {
        const cookieValue = decodeURIComponent(c.substring(nameEQ.length, c.length))
        const cookieData = JSON.parse(cookieValue)
        
        // Kiểm tra timestamp (cookie không quá 24h)
        const maxAge = 24 * 60 * 60 * 1000 // 24 hours
        if (Date.now() - cookieData.timestamp > maxAge) {
          console.warn(`Cookie ${name} expired, removing`)
          deleteCookie(name)
          return null
        }
        
        // Giải mã và verify hash
        const decryptedValue = decryptCookie(cookieData.value)
        if (!decryptedValue) {
          console.warn(`Failed to decrypt cookie ${name}`)
          deleteCookie(name)
          return null
        }
        
        return decryptedValue
      } catch (error) {
        console.error(`Error parsing cookie ${name}:`, error)
        deleteCookie(name)
        return null
      }
    }
  }
  
  return null
}

export function deleteCookie(name: string) {
  if (typeof window === 'undefined') return
  
  // Delete cookie with multiple path variations to ensure complete removal
  const paths = ['/', '/dashboard', '/login']
  
  paths.forEach(path => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=${path}`
  })
}

export function clearAllAuthCookies() {
  if (typeof window === 'undefined') return
  
  const authCookies = ['session_token', 'user_role', 'user_id', 'auth_token', 'auth_type']
  
  authCookies.forEach(cookieName => {
    deleteCookie(cookieName)
  })
  
  // Force clear with direct cookie manipulation
  document.cookie.split(";").forEach(cookie => {
    // Kiểm tra cookie có tồn tại và không phải undefined/null
    if (!cookie || typeof cookie !== 'string') return
    
    const eqPos = cookie.indexOf("=")
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
    if (authCookies.includes(name)) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
    }
  })
}

export function clearAllStorage() {
  if (typeof window === 'undefined') return
  

  
  // Clear localStorage
  try {
    localStorage.clear()

  } catch (e) {

  }
  
  // Clear sessionStorage
  try {
    sessionStorage.clear()

  } catch (e) {

  }
  
  // Clear all cookies
  clearAllAuthCookies()
  
  // Clear IndexedDB (if exists)
  try {
    if ('indexedDB' in window) {
      indexedDB.databases().then(databases => {
        databases.forEach(db => {
          if (db.name) {
            indexedDB.deleteDatabase(db.name)
          }
        })
      })

    }
  } catch (e) {

  }
  

}

export function debugStorage() {
  if (typeof window === 'undefined') return
  
  // Check cookies
  const cookieData = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    if (key) acc[key] = value || null
    return acc
  }, {} as Record<string, string | null>)
  
  // Check localStorage
  const localStorageData = Object.keys(localStorage).reduce((acc, key) => {
    acc[key] = localStorage.getItem(key)
    return acc
  }, {} as Record<string, string | null>)
  
  // Check sessionStorage
  const sessionStorageData = Object.keys(sessionStorage).reduce((acc, key) => {
    acc[key] = sessionStorage.getItem(key)
    return acc
  }, {} as Record<string, string | null>)
  
  return {
    cookies: cookieData,
    localStorage: localStorageData,
    sessionStorage: sessionStorageData
  }
}
