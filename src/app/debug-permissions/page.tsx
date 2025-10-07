import { PermissionDebugPanel } from '@/components/ui/permission-debug-panel'
import { PermissionErrorAlert } from '@/components/ui/permission-error-alert'

export default function DebugPermissionsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Permission Debug</h1>
        <p className="text-muted-foreground">
          Trang này hiển thị thông tin chi tiết về permissions và roles của user hiện tại.
        </p>
      </div>

      <PermissionErrorAlert />
      
      <PermissionDebugPanel />
    </div>
  )
}
