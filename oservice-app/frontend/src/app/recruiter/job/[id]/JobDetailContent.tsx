'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { MessageCircle, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';
import Header from '@/components/shared/Header';
import WhatsAppButton from '@/components/shared/WhatsAppButton';
import { MOCK_JOBS, MOCK_APPLICATIONS } from '@/data/mockData';
import { buildRecruiterMessage } from '@/lib/whatsapp';
import { formatCurrency, getRateUnitLabel, formatRelativeTime } from '@/lib/utils';
import { WILAYAS } from '@/data/wilayas';
import { useApp } from '@/context/AppContext';

export default function JobDetailContent() {
  const { id } = useParams();
  const { lang } = useLanguage();
  const { currentUser } = useApp();
  const [applications, setApplications] = useState(
    MOCK_APPLICATIONS.filter((a) => a.jobId === id)
  );

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

  const handleStatusChange = (appId: string, status: 'accepted' | 'rejected') => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status } : a))
    );
  };

  const statusCounts = {
    pending: applications.filter((a) => a.status === 'pending').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  return (
    <div className="page-container">
      <Header title={job.title} showBack />

      <main className="max-w-lg mx-auto px-4 pb-8">
        {/* Job Summary */}
        <div className="glass-card p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="badge-mint">{formatCurrency(job.budgetAmount)}/{getRateUnitLabel(job.budgetUnit, lang)}</span>
            <span className="badge-steel">{wilaya?.name}, {job.commune}</span>
          </div>
          <p className="text-text-secondary text-sm">{job.description}</p>
        </div>

        {/* Application Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="glass-card p-3 text-center">
            <Clock size={16} className="text-warning mx-auto mb-1" />
            <p className="text-text-primary font-bold">{statusCounts.pending}</p>
            <p className="text-text-muted text-[10px]">{t(lang, 'pending')}</p>
          </div>
          <div className="glass-card p-3 text-center">
            <CheckCircle size={16} className="text-mint mx-auto mb-1" />
            <p className="text-text-primary font-bold">{statusCounts.accepted}</p>
            <p className="text-text-muted text-[10px]">{t(lang, 'accepted')}</p>
          </div>
          <div className="glass-card p-3 text-center">
            <XCircle size={16} className="text-danger mx-auto mb-1" />
            <p className="text-text-primary font-bold">{statusCounts.rejected}</p>
            <p className="text-text-muted text-[10px]">{t(lang, 'rejected')}</p>
          </div>
        </div>

        {/* Applicants List */}
        <h2 className="text-sm font-medium text-text-secondary mb-3">
          {t(lang, 'applicants')} ({applications.length})
        </h2>

        {applications.length === 0 ? (
          <div className="text-center py-12">
            <Users size={40} className="text-text-muted/30 mx-auto mb-3" />
            <p className="text-text-secondary text-sm">{t(lang, 'noApplicants')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div key={app.id} className="glass-card p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-mint/10 flex items-center justify-center shrink-0">
                    <span className="text-mint font-bold text-sm">
                      {app.workerName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-text-primary font-semibold text-sm">{app.workerName}</h3>
                      <span className={`badge text-[10px] ${
                        app.status === 'pending'
                          ? 'bg-warning/15 text-warning'
                          : app.status === 'accepted'
                          ? 'bg-mint/15 text-mint'
                          : 'bg-danger/15 text-danger'
                      }`}>
                        {t(lang, app.status as any)}
                      </span>
                    </div>
                    <p className="text-text-secondary text-xs">
                      {formatCurrency(app.workerRate)}/{getRateUnitLabel(app.workerRateUnit, lang)}
                    </p>
                    <p className="text-text-muted/50 text-[10px] mt-1">
                      {formatRelativeTime(app.createdAt, lang)}
                    </p>
                  </div>
                </div>

                {app.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <WhatsAppButton
                      phone={app.workerPhone}
                      message={buildRecruiterMessage(
                        lang,
                        currentUser?.name || 'Recruteur',
                        app.workerName,
                        job.title,
                      )}
                      size="sm"
                      className="flex-1"
                    />
                    <button
                      onClick={() => handleStatusChange(app.id, 'accepted')}
                      className="btn-mint px-3 py-2 text-xs"
                    >
                      <CheckCircle size={14} />
                    </button>
                    <button
                      onClick={() => handleStatusChange(app.id, 'rejected')}
                      className="bg-danger/10 text-danger rounded-xl px-3 py-2 text-xs active:scale-95 transition-all"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                )}

                {app.status === 'accepted' && (
                  <div className="mt-3">
                    <WhatsAppButton
                      phone={app.workerPhone}
                      message={buildRecruiterMessage(
                        lang,
                        currentUser?.name || 'Recruteur',
                        app.workerName,
                        job.title,
                      )}
                      size="sm"
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
