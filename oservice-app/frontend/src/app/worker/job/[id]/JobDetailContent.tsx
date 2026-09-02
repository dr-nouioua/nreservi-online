'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Clock, Banknote, Building2, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';
import Header from '@/components/shared/Header';
import PaymentBadge from '@/components/shared/PaymentBadge';
import { MOCK_JOBS } from '@/data/mockData';
import { formatCurrency, getRateUnitLabel } from '@/lib/utils';
import { WILAYAS } from '@/data/wilayas';

export default function JobDetailContent() {
  const { id } = useParams();
  const { lang } = useLanguage();
  const [applied, setApplied] = useState(false);

  const job = MOCK_JOBS.find((j) => j.id === id);

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

  const handleApply = () => {
    setApplied(true);
  };

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
            <PaymentBadge type={job.paymentType} />
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

        {/* Cash Payment Notice */}
        <div className="glass-card p-4 border border-mint/20 mb-6">
          <div className="flex items-center gap-3">
            <Banknote size={20} className="text-mint shrink-0" />
            <div>
              <p className="text-text-primary text-sm font-medium">{t(lang, 'cashPayment')}</p>
              <p className="text-text-secondary text-xs">
                {lang === 'ar'
                  ? 'الدفع سيتم نقداً عند إتمام العمل'
                  : 'Le paiement se fera en espèces à la fin du travail'}
              </p>
            </div>
          </div>
        </div>

        {/* Apply Button */}
        {applied ? (
          <div className="glass-card p-4 border border-mint/20 text-center">
            <CheckCircle size={32} className="text-mint mx-auto mb-2" />
            <p className="text-text-primary font-medium">{t(lang, 'applied')}</p>
            <p className="text-text-secondary text-sm mt-1">
              {lang === 'ar'
                ? 'سيتواصل معك المُوظِّف قريباً'
                : 'Le recruteur vous contactera bientôt'}
            </p>
          </div>
        ) : (
          <button onClick={handleApply} className="btn-mint w-full text-base py-4">
            {t(lang, 'applyNow')}
          </button>
        )}
      </main>
    </div>
  );
}
