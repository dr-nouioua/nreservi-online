'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Briefcase, Users, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useApp } from '@/context/AppContext';
import { t } from '@/lib/translations';
import { UserRole } from '@/types';
import Header from '@/components/shared/Header';
import Logo from '@/components/shared/Logo';

export default function LoginPage() {
  const { lang } = useLanguage();
  const { login } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialRole = (searchParams.get('role') as UserRole) || 'worker';
  const [role, setRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roleOptions: { value: UserRole; icon: React.ElementType; label: string; color: string }[] = [
    { value: 'worker', icon: Briefcase, label: t(lang, 'worker'), color: 'border-mint text-mint' },
    { value: 'recruiter', icon: Users, label: t(lang, 'recruiter'), color: 'border-blue-400 text-blue-400' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise((r) => setTimeout(r, 500));

    const success = await login(email, password, role);

    if (success) {
      if (role === 'worker') router.push('/worker');
      else if (role === 'recruiter') router.push('/recruiter');
      else router.push('/admin');
    } else {
      setError(
        lang === 'ar'
          ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
          : 'Email ou mot de passe incorrect',
      );
    }
    setLoading(false);
  };

  const demoAccounts = {
    worker: { email: 'ahmed@demo.com', password: '123456' },
    recruiter: { email: 'mohamed@demo.com', password: '123456' },
    admin: { email: 'admin@oservice.dz', password: 'admin123' },
  };

  const fillDemo = () => {
    const demo = demoAccounts[role];
    setEmail(demo.email);
    setPassword(demo.password);
  };

  return (
    <div className="page-container">
      <Header showThemeToggle />

      <main className="max-w-lg mx-auto px-4 pb-8 min-h-screen flex flex-col">
        {/* Header */}
        <div className="pt-12 pb-8 text-center">
          <Link href="/" className="inline-block mb-6">
            <Logo size="lg" />
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">{t(lang, 'loginTitle')}</h1>
          <p className="text-text-secondary text-sm mt-1">{t(lang, 'loginSubtitle')}</p>
        </div>

        {/* Role Selector */}
        <div className="flex gap-2 mb-6">
          {roleOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setRole(opt.value);
                  setError('');
                }}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all active:scale-95 ${
                  role === opt.value
                    ? `${opt.color} bg-mint/5`
                    : 'text-text-secondary hover:border-border-light'
                }`}
                style={{
                  borderColor: role === opt.value ? undefined : 'var(--border)',
                }}
              >
                <Icon size={16} className="mx-auto mb-1" />
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 flex-1">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">{t(lang, 'email')}</label>
            <div className="relative">
              <Mail size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'admin' ? 'admin@oservice.dz' : 'email@exemple.com'}
                className="input-field ps-10"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">{t(lang, 'password')}</label>
            <div className="relative">
              <Lock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="input-field ps-10 pe-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-secondary"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-danger text-sm text-center bg-danger/10 py-2 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-mint w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-[#0B0F19] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {t(lang, 'login')}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Demo Account Hint */}
        <div className="mt-4">
          <button
            onClick={fillDemo}
            className="w-full text-center text-xs text-text-muted hover:text-text-secondary py-2 transition-colors"
          >
            {lang === 'ar' ? 'ملء تلقائي بحساب تجريبي' : 'Remplir avec le compte démo'}
          </button>
        </div>

        {/* Register Link */}
        <div className="text-center mt-4 pb-4">
          <p className="text-text-secondary text-sm">
            {t(lang, 'dontHaveAccount')}{' '}
            <Link
              href={`/auth/register?role=${role}`}
              className="text-mint font-medium hover:underline"
            >
              {t(lang, 'register')}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
