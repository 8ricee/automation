'use client';

import { PermissionsDebug } from '@/components/debug/PermissionsDebug';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function DebugPermissionsPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Debug Permissions</h1>
        <PermissionsDebug />
      </div>
    </AuthGuard>
  );
}
