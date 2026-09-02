'use client';

import AuthGuard from '@/components/shared/AuthGuard';
import AdminContent from './AdminContent';

export default function AdminPage() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminContent />
    </AuthGuard>
  );
}
