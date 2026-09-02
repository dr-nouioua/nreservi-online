'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Phone, User, Briefcase, Users, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useApp } from '@/context/AppContext';
import { t } from '@/lib/translations';
import { UserRole } from '@/types';
import { isValidAlgerianPhone } from '@/lib/whatsapp';
import Header from '@/components/shared/Header';
import Logo from '@/components/shared/Logo';

export default function RegisterPage() {
  const { lang } = useLanguage();
  const { register } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialRole = (searchParams.get('role') as UserRole) || 'worker';
  const [role, setRole] = useState<'worker' | 'recruiter'>(initialRole === 'admin' ? 'worker' : initialRole as 'worker' | 'recruiter');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roleOptions: { value: 'worker' | 'recruiter'; icon: React.ElementType; label: string; color: string }[] = [
    { value: 'worker', icon: Briefcase, label: t(lang, 'worker'), color: 'border-mint text-mint' },
    { value: 'recruiter', icon: Users, label: t(lang, 'recruiter'), color: 'border-blue-400 text-blue-400' },
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidAlgerianPhone(phone)) {
      setError(t(lang, 'phoneInvalid'));
      return;
    }

    if (password.length < 6) {
      setError(lang === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (password !== confirmPassword) {
      setError(lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    const success = await register({ name, email, phone, password, role });

    if (success) {
      if (role === 'worker') router.push('/worker/onboarding');
      else router.push('/recruiter');
    } else {
      setError(
        lang === 'ar'
          ? 'البريد الإلكتروني مستخدم بالفعل'
          : 'Cet email est déjà utilisé',
      );
    }
    setLoading(false);
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
          <h1 className="text-2xl font-bold text-text-primary">{t(lang, 'registerTitle')}</h1>
          <p className="text-text-secondary text-sm mt-1">{t(lang, 'registerSubtitle')}</p>
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
        <form onSubmit={handleRegister} className="space-y-4 flex-1">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">{t(lang, 'fullName')}</label>
            <div className="relative">
              <User size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang === 'ar' ? 'الاسم الكامل' : 'Votre nom complet'}
                className="input-field ps-10"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">{t(lang, 'email')}</label>
            <div className="relative">
              <Mail size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemple.com"
                className="input-field ps-10"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">{t(lang, 'phone')}</label>
            <div className="relative">
              <Phone size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0555123456"
                className="input-field ps-10"
                required
              />
            </div>
            <p className="text-xs text-text-muted">{t(lang, 'phoneHelper')}</p>
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
                minLength={6}
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

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">{t(lang, 'confirmPassword')}</label>
            <div className="relative">
              <Lock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••"
                className="input-field ps-10"
                required
                minLength={6}
              />
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
                {t(lang, 'register')}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6 pb-4">
          <p className="text-text-secondary text-sm">
            {t(lang, 'alreadyHaveAccount')}{' '}
            <Link
              href={`/auth/login?role=${role}`}
              className="text-mint font-medium hover:underline"
            >
              {t(lang, 'login')}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
