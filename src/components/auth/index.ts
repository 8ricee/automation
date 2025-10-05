// Export các authentication components đã được consolidate
export { AuthGuard, withAuth, withPageGuard, useRolePermissions, usePageAccess } from './AuthGuard'

// Export các components cũ để backward compatibility
export { AuthGuard as ProtectedRoute } from './AuthGuard'
export { AuthGuard as PageGuard } from './AuthGuard'
export { AuthGuard as PermissionWrapper } from './AuthGuard'

// Export utility functions
export * from '@/utils/auth-utils'
