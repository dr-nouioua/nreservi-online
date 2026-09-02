'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, CheckCircle, Banknote } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useApp } from '@/context/AppContext';
import { t } from '@/lib/translations';
import Header from '@/components/shared/Header';
import TextField from '@/components/shared/TextField';
import SelectField from '@/components/shared/SelectField';
import { useFormCache } from '@/hooks/useFormCache';
import { WILAYAS, getCommunesByWilaya } from '@/data/wilayas';

interface JobForm {
  title: string;
  description: string;
  wilaya: string;
  commune: string;
  duration: string;
  budgetAmount: string;
  budgetUnit: string;
}

const INITIAL: JobForm = {
  title: '',
  description: '',
  wilaya: '',
  commune: '',
  duration: '',
  budgetAmount: '',
  budgetUnit: 'day',
};

export default function PostJobContent() {
  const { lang } = useLanguage();
  const { currentUser } = useApp();
  const router = useRouter();
  const { values, updateValues, reset } = useFormCache<JobForm>('recruiter_post', INITIAL);
  const [step, setStep] = useState(1);
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);

  const communes = getCommunesByWilaya(values.wilaya);

  const handlePublish = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recruiterId: currentUser.id,
          title: values.title,
          description: values.description,
          wilaya: values.wilaya,
          commune: values.commune,
          duration: values.duration,
          budgetAmount: parseFloat(values.budgetAmount),
          budgetUnit: values.budgetUnit,
          paymentType: 'cash',
          tags: [],
        }),
      });

      if (response.ok) {
        setPublished(true);
        reset();
        setTimeout(() => {
          router.push('/recruiter');
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to publish job:', error);
    } finally {
      setLoading(false);
    }
  };

  if (published) {
    return (
      <div className="page-container">
        <Header showBack />
        <div className="max-w-lg mx-auto px-4 flex flex-col items-center justify-center py-20">
          <CheckCircle size={64} className="text-mint mb-4" />
          <h2 className="text-text-primary font-bold text-xl mb-2">{t(lang, 'jobPublished')}</h2>
          <p className="text-text-secondary text-sm text-center">
            {lang === 'ar'
              ? '显在你的招聘页面上'
              : 'Votre offre est maintenant visible par les travailleurs'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Header title={t(lang, 'createJob')} showBack />

      <main className="max-w-lg mx-auto px-4 pb-8">
        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                s <= step ? 'bg-mint' : 'bg-surface'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="text-text-primary font-semibold text-lg">{t(lang, 'jobDetails')}</h2>

            <TextField
              label={t(lang, 'jobTitle')}
              value={values.title}
              onChange={(v) => updateValues({ title: v })}
              placeholder={lang === 'ar' ? 'مثلاً: باعث حلويات' : 'Ex: Serveur, Livreur...'}
              required
            />

            <TextField
              label={t(lang, 'jobDescription')}
              value={values.description}
              onChange={(v) => updateValues({ description: v })}
              placeholder={t(lang, 'descriptionPlaceholder')}
              multiline
              rows={4}
              maxLength={500}
              required
            />

            <TextField
              label={t(lang, 'jobDuration')}
              value={values.duration}
              onChange={(v) => updateValues({ duration: v })}
              placeholder={t(lang, 'durationPlaceholder')}
              required
            />

            <button
              onClick={() => setStep(2)}
              className="btn-mint w-full"
              disabled={!values.title || !values.description || !values.duration}
            >
              {t(lang, 'next')}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="text-text-primary font-semibold text-lg">{t(lang, 'jobLocation')}</h2>

            <SelectField
              label={t(lang, 'wilaya')}
              value={values.wilaya}
              onChange={(v) => updateValues({ wilaya: v, commune: '' })}
              options={WILAYAS.map((w) => ({
                value: w.code,
                label: `${w.code} - ${lang === 'ar' ? w.nameAr : w.name}`,
              }))}
              placeholder={t(lang, 'selectWilaya')}
              required
            />

            <SelectField
              label={t(lang, 'commune')}
              value={values.commune}
              onChange={(v) => updateValues({ commune: v })}
              options={communes.map((c) => ({
                value: lang === 'ar' ? c.nameAr : c.name,
                label: lang === 'ar' ? c.nameAr : c.name,
              }))}
              placeholder={t(lang, 'selectCommune')}
              required
            />

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-outline flex-1">
                {t(lang, 'previous')}
              </button>
              <button
                onClick={() => setStep(3)}
                className="btn-mint flex-1"
                disabled={!values.wilaya || !values.commune}
              >
                {t(lang, 'next')}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <h2 className="text-text-primary font-semibold text-lg">{t(lang, 'jobBudget')}</h2>

            <div className="glass-card p-4 border border-mint/20">
              <div className="flex items-center gap-2 mb-2">
                <Banknote size={16} className="text-mint" />
                <span className="text-text-primary text-sm font-medium">{t(lang, 'cashPayment')}</span>
              </div>
              <p className="text-text-secondary text-xs">
                {lang === 'ar'
                  ? 'الدفع سيتم نقداً على الموقع'
                  : 'Paiement en espèces sur le site'}
              </p>
            </div>

            <div className="flex gap-3">
              <TextField
                label={t(lang, 'budgetAmount')}
                value={values.budgetAmount}
                onChange={(v) => updateValues({ budgetAmount: v })}
                type="number"
                placeholder="2500"
                className="flex-1"
                required
              />
              <SelectField
                label={t(lang, 'budgetUnit')}
                value={values.budgetUnit}
                onChange={(v) => updateValues({ budgetUnit: v })}
                options={[
                  { value: 'hour', label: t(lang, 'perHour') },
                  { value: 'day', label: t(lang, 'perDay') },
                  { value: 'month', label: t(lang, 'perMonth') },
                  { value: 'total', label: t(lang, 'totalJob') },
                ]}
                className="flex-1"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-outline flex-1">
                {t(lang, 'previous')}
              </button>
              <button
                onClick={handlePublish}
                className="btn-mint flex-1 flex items-center justify-center gap-2"
                disabled={!values.budgetAmount || loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#0B0F19] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={16} />
                    {t(lang, 'publishJob')}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
