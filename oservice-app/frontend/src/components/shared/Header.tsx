'use client';

import { useState } from 'react';
import { LogOut, ChevronLeft, Users, Briefcase, X } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useApp } from '@/context/AppContext';
import { t } from '@/lib/translations';
import { useRouter } from 'next/navigation';
import Logo from './Logo';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showLogout?: boolean;
  showAccountIcons?: boolean;
}

export default function Header({
  title,
  showBack = false,
  showLogout = false,
  showAccountIcons = false,
}: HeaderProps) {
  const { lang, setLang } = useLanguage();
  const { logout } = useApp();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const toggleLang = () => {
    setLang(lang === 'fr' ? 'ar' : 'fr');
  };

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-xl border-b pt-safe transition-colors duration-300"
      style={{
        backgroundColor: 'rgba(11, 15, 25, 0.9)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="p-2 -ms-2 rounded-xl hover:bg-surface-hover active:scale-90 transition-all"
            >
              <ChevronLeft size={20} className="text-text-secondary" />
            </button>
          )}
          {title ? (
            <h1 className="text-lg font-semibold text-text-primary truncate">{title}</h1>
          ) : (
            <Logo size="sm" showText={false} />
          )}
        </div>

        <div className="flex items-center gap-1 relative">
          {showAccountIcons && (
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-xl hover:bg-surface-hover active:scale-90 transition-all"
            >
              {showMenu ? (
                <X size={18} className="text-mint" />
              ) : (
                <Users size={18} className="text-mint" />
              )}
            </button>
          )}

          <button
            onClick={toggleLang}
            className="rounded-full transition-all overflow-hidden"
            style={{
              width: 28,
              height: 28,
            }}
            title={lang === 'fr' ? t(lang, 'switchToArabic') : t(lang, 'switchToFrench')}
          >
            <img
              src={lang === 'fr' ? 'https://flagcdn.com/w80/dz.png' : 'https://flagcdn.com/w80/fr.png'}
              alt={lang === 'fr' ? 'DZ' : 'FR'}
              width="28"
              height="28"
              style={{ borderRadius: '50%', objectFit: 'cover', width: '100%', height: '100%' }}
            />
          </button>

          {showLogout && (
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="p-2 rounded-xl hover:bg-surface-hover active:scale-90 transition-all"
            >
              <LogOut size={18} className="text-text-secondary" />
            </button>
          )}

          {/* Account Dropdown */}
          {showAccountIcons && showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div
                className="absolute top-full end-0 mt-2 w-52 rounded-2xl shadow-card z-50 overflow-hidden"
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <Link
                  href="/auth/login?role=worker"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-surface-hover transition-colors"
                  onClick={() => setShowMenu(false)}
                >
                  <Briefcase size={18} className="text-mint" />
                  <div>
                    <p className="text-text-primary text-sm font-medium">{t(lang, 'worker')}</p>
                    <p className="text-text-muted text-[10px]">
                      {lang === 'ar' ? 'ابحث عن وظائف' : 'Trouver des emplois'}
                    </p>
                  </div>
                </Link>
                <div style={{ borderTop: '1px solid var(--border)' }} />
                <Link
                  href="/auth/login?role=recruiter"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-surface-hover transition-colors"
                  onClick={() => setShowMenu(false)}
                >
                  <Briefcase size={18} className="text-blue-400" />
                  <div>
                    <p className="text-text-primary text-sm font-medium">{t(lang, 'recruiter')}</p>
                    <p className="text-text-muted text-[10px]">
                      {lang === 'ar' ? 'انشر وظائف' : 'Publier des offres'}
                    </p>
                  </div>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
