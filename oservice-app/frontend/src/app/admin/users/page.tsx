'use client';

import AuthGuard from '@/components/shared/AuthGuard';
import UsersContent from './UsersContent';

export default function AdminUsersPage() {
  return (
    <AuthGuard requiredRole="admin">
      <UsersContent />
    </AuthGuard>
  );
}
