'use client';

import AuthGuard from '@/components/shared/AuthGuard';
import WorkerContent from './WorkerContent';

export default function WorkerPage() {
  return (
    <AuthGuard requiredRole="worker">
      <WorkerContent />
    </AuthGuard>
  );
}
