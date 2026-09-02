'use client';

import AuthGuard from '@/components/shared/AuthGuard';
import ProfileContent from './ProfileContent';

export default function WorkerProfilePage() {
  return (
    <AuthGuard requiredRole="worker">
      <ProfileContent />
    </AuthGuard>
  );
}
