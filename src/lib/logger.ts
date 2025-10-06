/**
 * Logger utility với conditional logging cho development
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },
  
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },
  
  error: (...args: unknown[]) => {
    // Error logs luôn hiển thị để debug production issues
    console.error(...args)
  },
  
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info(...args)
    }
  },
  
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(...args)
    }
  }
}

// Auth specific logger với emoji để dễ nhận biết
export const authLogger = {
  log: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.log(`🔐 ${message}`, data || '')
    }
  },
  
  warn: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.warn(`⚠️ ${message}`, data || '')
    }
  },
  
  error: (message: string, data?: unknown) => {
    console.error(`❌ ${message}`, data || '')
  }
}

// API specific logger
export const apiLogger = {
  log: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.log(`🌐 ${message}`, data || '')
    }
  },
  
  warn: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.warn(`⚠️ ${message}`, data || '')
    }
  },
  
  error: (message: string, data?: unknown) => {
    console.error(`❌ ${message}`, data || '')
  }
}

// Middleware specific logger
export const middlewareLogger = {
  log: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.log(`🔍 ${message}`, data || '')
    }
  },
  
  warn: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.warn(`⚠️ ${message}`, data || '')
    }
  },
  
  error: (message: string, data?: unknown) => {
    console.error(`❌ ${message}`, data || '')
  }
}
