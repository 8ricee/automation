'use client'

import { useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export function PermissionErrorAlert() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const requestedPath = searchParams.get('requestedPath')
  const requiredPermission = searchParams.get('requiredPermission')

  if (error !== 'access_denied') return null

  return (
    <Alert className="border-red-200 bg-red-50">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        <div className="space-y-2">
          <p className="font-medium">Không có quyền truy cập</p>
          <p className="text-sm">
            Bạn không có quyền truy cập vào trang này.
            {requestedPath && (
              <span className="block mt-1">
                Trang yêu cầu: <code className="bg-red-100 px-1 rounded">{requestedPath}</code>
              </span>
            )}
            {requiredPermission && (
              <span className="block mt-1">
                Quyền cần thiết: <code className="bg-red-100 px-1 rounded">{requiredPermission}</code>
              </span>
            )}
          </p>
          <div className="flex gap-2 mt-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Về Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/profile">
                Xem Hồ sơ
              </Link>
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
