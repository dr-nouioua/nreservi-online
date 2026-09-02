'use client';

import { useState, useEffect } from 'react';
import { Plus, Briefcase, Users, Clock } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';
import Header from '@/components/shared/Header';
import JobCard from '@/components/shared/JobCard';
import { JobCardSkeleton } from '@/components/shared/Skeleton';
import { MOCK_JOBS } from '@/data/mockData';
import { useRouter } from 'next/navigation';

export default function RecruiterContent() {
  const { lang } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState(MOCK_JOBS.slice(0, 4));

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { icon: Briefcase, label: t(lang, 'totalJobs'), value: '4', color: 'text-mint' },
    { icon: Users, label: t(lang, 'totalApplicants'), value: '28', color: 'text-blue-400' },
    { icon: Clock, label: t(lang, 'activePostings'), value: '3', color: 'text-warning' },
  ];

  return (
    <div className="page-container">
      <Header title={t(lang, 'recruiterDashboard')} showLogout />

      <main className="max-w-lg mx-auto px-4 pb-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="glass-card p-3 text-center">
                <Icon size={18} className={`${stat.color} mx-auto mb-1`} />
                <p className="text-text-primary font-bold text-lg">{stat.value}</p>
                <p className="text-text-muted text-[10px] leading-tight">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Post Job CTA */}
        <Link
          href="/recruiter/post"
          className="glass-card p-4 flex items-center gap-3 mb-6 active:scale-[0.98] transition-all hover:bg-surface/50 border border-mint/20"
        >
          <div className="w-10 h-10 rounded-xl bg-mint/10 flex items-center justify-center">
            <Plus size={20} className="text-mint" />
          </div>
          <div>
            <h3 className="text-text-primary font-semibold text-sm">{t(lang, 'postNewJob')}</h3>
            <p className="text-text-secondary text-xs">
              {lang === 'ar' ? 'انشر وظيفة جديدة الآن' : 'Publiez une offre maintenant'}
            </p>
          </div>
        </Link>

        {/* My Jobs */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-text-secondary">{t(lang, 'myJobs')}</h2>
          <button className="text-mint text-xs">{t(lang, 'viewAll')}</button>
        </div>

        {loading ? (
          <JobCardSkeleton count={3} />
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                lang={lang}
                showApplicants
                onClick={() => router.push(`/recruiter/job/${job.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
