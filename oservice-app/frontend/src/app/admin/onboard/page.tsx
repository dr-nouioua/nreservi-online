'use client';

import AuthGuard from '@/components/shared/AuthGuard';
import OnboardContent from './OnboardContent';

export default function AdminOnboardPage() {
  return (
    <AuthGuard requiredRole="admin">
      <OnboardContent />
    </AuthGuard>
  );
}
