// Utility functions for cookie management
export function setCookie(name: string, value: string, days: number = 7) {
  if (typeof window === 'undefined') return
  
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`
}

export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null
  
  const nameEQ = name + "="
  const ca = document.cookie.split(';')
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
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
  
  console.log('Clearing all auth cookies...')
  const authCookies = ['session_token', 'user_role', 'user_id', 'auth_token']
  
  authCookies.forEach(cookieName => {
    deleteCookie(cookieName)
  })
  
  // Force clear with direct cookie manipulation
  document.cookie.split(";").forEach(cookie => {
    const eqPos = cookie.indexOf("=")
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
    if (authCookies.includes(name)) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
    }
  })
  
  console.log('All auth cookies cleared')
}

export function clearAllStorage() {
  if (typeof window === 'undefined') return
  
  console.log('Clearing all browser storage...')
  
  // Clear localStorage
  try {
    localStorage.clear()
    console.log('localStorage cleared')
  } catch (e) {
    console.log('localStorage clear failed:', e)
  }
  
  // Clear sessionStorage
  try {
    sessionStorage.clear()
    console.log('sessionStorage cleared')
  } catch (e) {
    console.log('sessionStorage clear failed:', e)
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
      console.log('IndexedDB cleared')
    }
  } catch (e) {
    console.log('IndexedDB clear failed:', e)
  }
  
  console.log('All browser storage cleared')
}

export function debugStorage() {
  if (typeof window === 'undefined') return
  
  console.log('=== STORAGE DEBUG ===')
  
  // Check cookies
  console.log('Cookies:', document.cookie)
  
  // Check localStorage
  console.log('localStorage:', Object.keys(localStorage).reduce((acc, key) => {
    acc[key] = localStorage.getItem(key)
    return acc
  }, {} as Record<string, string | null>))
  
  // Check sessionStorage
  console.log('sessionStorage:', Object.keys(sessionStorage).reduce((acc, key) => {
    acc[key] = sessionStorage.getItem(key)
    return acc
  }, {} as Record<string, string | null>))
  
  console.log('=== END STORAGE DEBUG ===')
}
