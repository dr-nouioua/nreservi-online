'use client';

import { useState } from 'react';
import { Users, Briefcase, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useApp } from '@/context/AppContext';
import { t } from '@/lib/translations';
import Header from '@/components/shared/Header';

export default function AdminContent() {
  const { lang } = useLanguage();
  const { systemConfig, setSystemConfig } = useApp();
  const [pendingUsers] = useState([
    { id: 'p1', name: 'Yacine Khelifi', role: 'recruiter', phone: '0555111222', wilaya: '16' },
    { id: 'p2', name: 'Nassim Boudiaf', role: 'worker', phone: '0666333444', wilaya: '19' },
    { id: 'p3', name: 'Lina Ferhat', role: 'recruiter', phone: '0777555666', wilaya: '31' },
  ]);

  const stats = [
    { icon: Users, label: t(lang, 'totalUsers'), value: '156', color: 'text-mint' },
    { icon: Briefcase, label: t(lang, 'totalWorkers'), value: '98', color: 'text-blue-400' },
    { icon: TrendingUp, label: t(lang, 'totalRecruiters'), value: '58', color: 'text-purple-400' },
    { icon: Clock, label: t(lang, 'pendingApprovals'), value: '3', color: 'text-warning' },
  ];

  const toggleDigitalGateway = () => {
    setSystemConfig({
      ...systemConfig,
      digitalGatewayEnabled: !systemConfig.digitalGatewayEnabled,
    });
  };

  return (
    <div className="page-container">
      <Header title={t(lang, 'adminDashboard')} showLogout />

      <main className="max-w-lg mx-auto px-4 pb-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="glass-card p-4">
                <Icon size={20} className={`${stat.color} mb-2`} />
                <p className="text-text-primary font-bold text-2xl">{stat.value}</p>
                <p className="text-text-secondary text-xs">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Pending Approvals */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-text-secondary">
              {t(lang, 'pendingApprovals')} ({pendingUsers.length})
            </h2>
            <Link href="/admin/users" className="text-mint text-xs">
              {t(lang, 'viewAll')}
            </Link>
          </div>

          <div className="space-y-2">
            {pendingUsers.map((user) => (
              <div key={user.id} className="glass-card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                  <span className="text-warning font-bold text-sm">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-text-primary font-semibold text-sm">{user.name}</h3>
                  <p className="text-text-secondary text-xs">
                    {user.role === 'worker' ? t(lang, 'worker') : t(lang, 'recruiter')} · {user.phone}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button className="bg-mint/10 text-mint rounded-lg p-2 active:scale-90 transition-all">
                    <CheckCircle size={16} />
                  </button>
                  <button className="bg-danger/10 text-danger rounded-lg p-2 active:scale-90 transition-all">
                    <XCircle size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Configuration */}
        <div className="glass-card p-5 mb-6">
          <h2 className="text-text-primary font-semibold mb-4">{t(lang, 'paymentConfig')}</h2>

          {/* Phase 1: Cash */}
          <div className="flex items-center justify-between p-3 bg-mint/5 rounded-xl mb-3 border border-mint/10">
            <div>
              <p className="text-text-primary text-sm font-medium">{t(lang, 'cashMode')}</p>
              <p className="text-text-secondary text-xs">{t(lang, 'cashModeDesc')}</p>
            </div>
            <div className="w-10 h-6 bg-mint rounded-full relative">
              <div className="absolute end-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow" />
            </div>
          </div>

          {/* Phase 2: Digital */}
          <div className="flex items-center justify-between p-3 bg-surface rounded-xl border border-border">
            <div>
              <p className="text-text-primary text-sm font-medium">{t(lang, 'digitalMode')}</p>
              <p className="text-text-secondary text-xs">{t(lang, 'digitalModeDesc')}</p>
              <p className="text-warning text-[10px] mt-1">
                {t(lang, 'phase')} 2 — {t(lang, 'comingSoon')}
              </p>
            </div>
            <button
              onClick={toggleDigitalGateway}
              className={`w-10 h-6 rounded-full relative transition-colors ${
                systemConfig.digitalGatewayEnabled ? 'bg-mint' : 'bg-surface'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                  systemConfig.digitalGatewayEnabled ? 'end-0.5' : 'start-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-2">
          <Link
            href="/admin/users"
            className="glass-card p-4 flex items-center gap-3 active:scale-[0.98] transition-all hover:bg-surface/50"
          >
            <Users size={18} className="text-mint" />
            <span className="text-text-primary text-sm font-medium">{t(lang, 'userManagement')}</span>
          </Link>
          <Link
            href="/admin/onboard"
            className="glass-card p-4 flex items-center gap-3 active:scale-[0.98] transition-all hover:bg-surface/50"
          >
            <Briefcase size={18} className="text-mint" />
            <span className="text-text-primary text-sm font-medium">
              {lang === 'ar' ? 'إنشاء مطعم جديد' : 'Créer un restaurant'}
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
