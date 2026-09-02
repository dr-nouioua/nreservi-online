'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole: UserRole;
}

const ROLE_ROUTES: Record<UserRole, string[]> = {
  worker: ['/worker'],
  recruiter: ['/recruiter'],
  admin: ['/admin'],
};

const ROLE_LOGIN: Record<UserRole, string> = {
  worker: '/auth/login?role=worker',
  recruiter: '/auth/login?role=recruiter',
  admin: '/auth/login?role=admin',
};

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { currentUser, isAuthenticated } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      router.replace(ROLE_LOGIN[requiredRole]);
      return;
    }

    if (currentUser.role !== requiredRole) {
      const correctLogin = ROLE_LOGIN[currentUser.role as UserRole] || '/';
      router.replace(correctLogin);
      return;
    }
  }, [isAuthenticated, currentUser, requiredRole, router]);

  if (!isAuthenticated || !currentUser || currentUser.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-mint border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
