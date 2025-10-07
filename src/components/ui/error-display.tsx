import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorProps {
  message?: string
  title?: string
  onRetry?: () => void
  className?: string
}

export function ErrorDisplay({ 
  message = "Đã xảy ra lỗi khi tải dữ liệu",
  title = "Lỗi",
  onRetry,
  className = ""
}: ErrorProps) {
  return (
    <div className={`container mx-auto px-2 py-4 sm:px-4 sm:py-6 ${className}`}>
      <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <h3 className="font-semibold text-lg">{title}</h3>
        </div>
        <p className="text-sm mb-4">
          {message}
        </p>
        {onRetry && (
          <Button 
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
        )}
      </div>
    </div>
  )
}

// Component cho error inline
export function ErrorInline({ 
  message = "Đã xảy ra lỗi",
  onRetry,
  className = ""
}: Omit<ErrorProps, 'title'>) {
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <div className="text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-red-600 mb-3">{message}</p>
        {onRetry && (
          <Button 
            onClick={onRetry}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
        )}
      </div>
    </div>
  )
}

// Component cho error trong card
export function ErrorCard({ 
  message = "Đã xảy ra lỗi khi tải dữ liệu",
  onRetry,
  className = ""
}: Omit<ErrorProps, 'title'>) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="text-center">
        <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-red-600 mb-3">{message}</p>
        {onRetry && (
          <Button 
            onClick={onRetry}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
        )}
      </div>
    </div>
  )
}
