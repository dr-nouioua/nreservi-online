'use client';

import AuthGuard from '@/components/shared/AuthGuard';
import PostJobContent from './PostJobContent';

export default function PostJobPage() {
  return (
    <AuthGuard requiredRole="recruiter">
      <PostJobContent />
    </AuthGuard>
  );
}
