'use client';

import AuthGuard from '@/components/shared/AuthGuard';
import JobDetailContent from './JobDetailContent';

export default function RecruiterJobDetailPage() {
  return (
    <AuthGuard requiredRole="recruiter">
      <JobDetailContent />
    </AuthGuard>
  );
}
