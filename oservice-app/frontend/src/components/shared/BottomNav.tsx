'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Briefcase, User, PlusCircle, LayoutDashboard, Settings } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { t } from '@/lib/translations';

interface NavItem {
  href: string;
  icon: React.ElementType;
  labelKey: string;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', icon: Home, labelKey: 'navHome' },
  { href: '/worker', icon: Briefcase, labelKey: 'navJobs', roles: ['worker'] },
  { href: '/worker/profile', icon: User, labelKey: 'navProfile', roles: ['worker'] },
  { href: '/recruiter', icon: LayoutDashboard, labelKey: 'navDashboard', roles: ['recruiter'] },
  { href: '/recruiter/post', icon: PlusCircle, labelKey: 'navPost', roles: ['recruiter'] },
  { href: '/recruiter/profile', icon: User, labelKey: 'navProfile', roles: ['recruiter'] },
  { href: '/admin', icon: LayoutDashboard, labelKey: 'navDashboard', roles: ['admin'] },
  { href: '/admin/users', icon: Settings, labelKey: 'navSettings', roles: ['admin'] },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const { userRole } = useApp();
  const { theme } = useTheme();

  const filteredItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(userRole),
  );

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 backdrop-blur-xl border-t shadow-nav safe-area-bottom transition-colors duration-300"
      style={{
        backgroundColor: theme === 'dark' ? 'rgba(30, 38, 64, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item flex-1 py-2 ${isActive ? 'active' : ''}`}
            >
              <Icon
                size={20}
                className={isActive ? 'text-mint' : ''}
                style={{ color: isActive ? '#00F5A0' : undefined }}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span
                className="text-[10px] leading-tight font-medium"
                style={{
                  color: isActive ? '#00F5A0' : 'var(--text-muted)',
                }}
              >
                {t(lang, item.labelKey as any)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
