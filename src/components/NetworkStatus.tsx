"use client"

import { useState, useEffect } from 'react'
import { Wifi, WifiOff } from 'lucide-react'

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (wasOffline) {
        // Hiển thị thông báo kết nối lại
        console.log('Connection restored')
        setWasOffline(false)
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
      console.warn('Connection lost')
    }

    // Kiểm tra trạng thái ban đầu
    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [wasOffline])

  return { isOnline, wasOffline }
}

export function NetworkStatusIndicator() {
  const { isOnline, wasOffline } = useNetworkStatus()

  if (isOnline) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white py-2 px-4 text-center">
      <div className="flex items-center justify-center space-x-2">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm font-medium">
          Không có kết nối mạng. Vui lòng kiểm tra kết nối internet.
        </span>
      </div>
    </div>
  )
}

export function ConnectionRestoredNotification() {
  const { isOnline, wasOffline } = useNetworkStatus()
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowNotification(true)
      const timer = setTimeout(() => {
        setShowNotification(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, wasOffline])

  if (!showNotification) {
    return null
  }

  return (
    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white py-2 px-4 rounded-md shadow-lg">
      <div className="flex items-center space-x-2">
        <Wifi className="w-4 h-4" />
        <span className="text-sm font-medium">
          Kết nối đã được khôi phục
        </span>
      </div>
    </div>
  )
}
