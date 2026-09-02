'use client';

import AuthGuard from '@/components/shared/AuthGuard';
import RecruiterProfileContent from './RecruiterProfileContent';

export default function RecruiterProfilePage() {
  return (
    <AuthGuard requiredRole="recruiter">
      <RecruiterProfileContent />
    </AuthGuard>
  );
}
