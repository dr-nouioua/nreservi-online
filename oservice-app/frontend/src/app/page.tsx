'use client';

import { useState, useEffect } from 'react';
import { Search, Users, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';
import { JobPost } from '@/types';
import { formatCurrency, getRateUnitLabel } from '@/lib/utils';
import { WILAYAS } from '@/data/wilayas';
import Logo from '@/components/shared/Logo';

export default function HomePage() {
  const { lang, setLang } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs?status=active&limit=20');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (!search) return true;
    return (
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.companyName.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}>
      {/* Hero */}
      <section className="relative w-full flex flex-col items-center justify-center px-4 py-12">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,245,160,0.05), transparent)' }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex flex-col items-center gap-6"
        >
          <Logo size="xl" />

          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center tracking-tight"
            style={{
              fontFamily: 'Instrument Sans, sans-serif',
              background: 'linear-gradient(to bottom, white, #00F5A0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {lang === 'ar' ? 'وظائف بالقرب منك' : 'Emplois près de chez vous'}
          </h1>

          <p className="text-center max-w-md text-sm" style={{ color: 'var(--text-secondary)' }}>
            {lang === 'ar'
              ? 'اكتشف فرص عمل جديدة في الجزائر'
              : 'Découvrez les meilleures opportunités d\'emploi en Algérie'}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
              className="rounded-full transition-all overflow-hidden"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                width: 32,
                height: 32,
              }}
              title={lang === 'ar' ? 'Français' : 'العربية'}
            >
              <img
                src={lang === 'fr' ? 'https://flagcdn.com/w80/dz.png' : 'https://flagcdn.com/w80/fr.png'}
                alt={lang === 'fr' ? 'DZ' : 'FR'}
                width="32"
                height="32"
                style={{ borderRadius: '50%', objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </button>
            <Link
              href="/auth/login?role=worker"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-all text-sm font-medium"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <Briefcase size={16} className="text-[#00F5A0]" />
              {lang === 'ar' ? 'عامل' : 'Travailleur'}
            </Link>
            <Link
              href="/auth/login?role=recruiter"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-all text-sm font-medium"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <Users size={16} className="text-[#00F5A0]" />
              {lang === 'ar' ? 'مُوظِّف' : 'Recruteur'}
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Jobs */}
      <section id="jobs" className="relative overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto px-4 pb-16">
          <div className="mb-6 max-w-xl mx-auto">
            <div className="relative">
              <Search size={16} className="absolute start-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t(lang, 'searchPlaceholder')}
                className="w-full ps-11 pe-4 py-3.5 rounded-2xl transition-all"
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--surface)' }} />
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-16">
              <Search size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t(lang, 'noResults')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block p-5 rounded-2xl transition-all duration-300"
                  style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(0,245,160,0.1)' }}>
                      <span className="text-[#00F5A0] font-bold text-sm">
                        {job.companyName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{job.title}</h3>
                      <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{job.companyName}</p>
                    </div>
                    <div className="px-3 py-1.5 rounded-full shrink-0" style={{ backgroundColor: 'rgba(0,245,160,0.1)', border: '1px solid rgba(0,245,160,0.2)' }}>
                      <span className="text-[#00F5A0] font-semibold text-xs">
                        {formatCurrency(job.budgetAmount)}
                        <span className="text-[#00F5A0]/60 ms-1">/{getRateUnitLabel(job.budgetUnit, lang)}</span>
                      </span>
                    </div>
                  </div>
                  <p className="text-xs mt-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{job.description}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px]" style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-secondary)' }}>
                      {WILAYAS.find((w) => w.code === job.wilaya)?.name || job.wilaya}, {job.commune}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
