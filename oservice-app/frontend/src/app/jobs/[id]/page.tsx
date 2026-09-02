'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Clock, Banknote, Building2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';
import Header from '@/components/shared/Header';
import { formatCurrency, getRateUnitLabel } from '@/lib/utils';
import { WILAYAS } from '@/data/wilayas';
import { JobPost } from '@/types';

export default function PublicJobDetailPage() {
  const { id } = useParams();
  const { lang } = useLanguage();
  const [job, setJob] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${id}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data);
      }
    } catch (error) {
      console.error('Failed to fetch job:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <Header showBack />
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="h-64 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--surface)' }} />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="page-container">
        <Header showBack />
        <div className="text-center py-16">
          <p className="text-text-secondary">{t(lang, 'noResults')}</p>
        </div>
      </div>
    );
  }

  const wilaya = WILAYAS.find((w) => w.code === job.wilaya);

  return (
    <div className="page-container">
      <Header showBack />

      <main className="max-w-lg mx-auto px-4 pb-8">
        {/* Job Header */}
        <div className="glass-card p-5 mb-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-mint/10 flex items-center justify-center shrink-0">
              <span className="text-mint font-bold text-lg">
                {job.companyName.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-text-primary font-bold text-xl">{job.title}</h1>
              <p className="text-text-secondary text-sm flex items-center gap-1">
                <Building2 size={14} />
                {job.companyName}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="badge-mint text-sm">
              <Banknote size={12} className="me-1" />
              {formatCurrency(job.budgetAmount)}/{getRateUnitLabel(job.budgetUnit, lang)}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
            <span className="flex items-center gap-1">
              <MapPin size={14} className="text-mint" />
              {wilaya?.name || job.wilaya}, {job.commune}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} className="text-mint" />
              {job.duration}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="glass-card p-5 mb-4">
          <h2 className="text-text-primary font-semibold mb-3">
            {t(lang, 'jobDescription')}
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">{job.description}</p>
        </div>

        {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {job.tags.map((tag) => (
              <span key={tag} className="badge-steel">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Apply CTA */}
        <a
          href="/auth/login?role=worker"
          className="btn-mint w-full text-base py-4 block text-center"
        >
          {t(lang, 'applyNow')}
        </a>
      </main>
    </div>
  );
}
