'use client';

import AuthGuard from '@/components/shared/AuthGuard';
import RecruiterContent from './RecruiterContent';

export default function RecruiterPage() {
  return (
    <AuthGuard requiredRole="recruiter">
      <RecruiterContent />
    </AuthGuard>
  );
}
