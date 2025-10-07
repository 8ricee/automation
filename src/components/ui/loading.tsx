import React from 'react'

interface LoadingProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Loading({ 
  message = "Đang tải...", 
  size = 'md',
  className = ""
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-background ${className}`}>
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-primary mx-auto mb-2 ${sizeClasses[size]}`}></div>
        <p className={`text-muted-foreground ${textSizeClasses[size]}`}>{message}</p>
      </div>
    </div>
  )
}

// Component cho loading trong container nhỏ
export function LoadingInline({ 
  message = "Đang tải...", 
  size = 'sm',
  className = ""
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-primary mx-auto mb-2 ${sizeClasses[size]}`}></div>
        <p className={`text-muted-foreground ${textSizeClasses[size]}`}>{message}</p>
      </div>
    </div>
  )
}

// Component cho loading trong table/card
export function LoadingCard({ 
  message = "Đang tải...", 
  size = 'sm',
  className = ""
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-primary mx-auto mb-2 ${sizeClasses[size]}`}></div>
        <p className={`text-muted-foreground ${textSizeClasses[size]}`}>{message}</p>
      </div>
    </div>
  )
}
