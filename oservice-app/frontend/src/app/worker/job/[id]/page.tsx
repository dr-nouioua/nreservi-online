'use client';

import AuthGuard from '@/components/shared/AuthGuard';
import JobDetailContent from './JobDetailContent';

export default function WorkerJobDetailPage() {
  return (
    <AuthGuard requiredRole="worker">
      <JobDetailContent />
    </AuthGuard>
  );
}
