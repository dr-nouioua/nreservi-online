'use client';

import { MapPin, Clock, Banknote, Users } from 'lucide-react';
import { JobPost, Language } from '@/types';
import { formatCurrency, formatRelativeTime, getRateUnitLabel } from '@/lib/utils';
import { t } from '@/lib/translations';
import { WILAYAS } from '@/data/wilayas';

interface JobCardProps {
  job: JobPost;
  lang: Language;
  onClick?: () => void;
  showApplicants?: boolean;
}

export default function JobCard({ job, lang, onClick, showApplicants = false }: JobCardProps) {
  const wilaya = WILAYAS.find((w) => w.code === job.wilaya);

  return (
    <button
      onClick={onClick}
      className="glass-card p-4 w-full text-start active:scale-[0.98] transition-all duration-200 hover:shadow-card-hover"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-mint/10 flex items-center justify-center shrink-0">
          <span className="text-mint font-bold text-sm">
            {job.companyName.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-text-primary font-semibold text-sm truncate">{job.title}</h3>
          <p className="text-text-secondary text-xs truncate">{job.companyName}</p>
        </div>
        <div className="badge-mint shrink-0">
          {formatCurrency(job.budgetAmount)}
          <span className="text-mint/60 ms-1">/{getRateUnitLabel(job.budgetUnit, lang)}</span>
        </div>
      </div>

      <p className="text-text-secondary text-xs mt-2 line-clamp-2">{job.description}</p>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className="badge-steel text-[10px]">
          <MapPin size={10} className="me-1 inline" />
          {wilaya?.name || job.wilaya}, {job.commune}
        </span>
        <span className="badge-steel text-[10px]">
          <Clock size={10} className="me-1 inline" />
          {job.duration}
        </span>
        {job.paymentType === 'cash' && (
          <span className="badge-mint text-[10px]">
            <Banknote size={10} className="me-1 inline" />
            {t(lang, 'cashPayment')}
          </span>
        )}
      </div>

      {showApplicants && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
          <Users size={14} className="text-text-secondary" />
          <span className="text-text-secondary text-xs">
            {job.applicantsCount} {t(lang, 'applicants')}
          </span>
          <span className="text-text-muted text-xs ms-auto">
            {formatRelativeTime(job.createdAt, lang)}
          </span>
        </div>
      )}

      {job.tags && job.tags.length > 0 && (
        <div className="flex gap-1.5 mt-3">
          {job.tags.map((tag) => (
            <span key={tag} className="badge-steel text-[10px]">
              {tag}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
