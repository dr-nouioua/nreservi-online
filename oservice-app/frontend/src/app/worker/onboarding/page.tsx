'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight, ArrowLeft, Plus, X, MapPin } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';
import { useFormCache } from '@/hooks/useFormCache';
import { WILAYAS, getCommunesByWilaya } from '@/data/wilayas';
import { clearFormCache } from '@/lib/formCache';

interface OnboardingForm {
  title: string;
  bio: string;
  skills: string[];
  rateAmount: string;
  rateUnit: string;
  wilaya: string;
  commune: string;
}

const INITIAL: OnboardingForm = {
  title: '',
  bio: '',
  skills: [],
  rateAmount: '',
  rateUnit: 'day',
  wilaya: '',
  commune: '',
};

const SUGGESTED_SKILLS: Record<string, { fr: string; ar: string }[]> = {
  service: [{ fr: 'Service', ar: 'خدمة' }, { fr: 'Restauration', ar: 'مطعم' }, { fr: 'Horeca', ar: 'ضيافة' }],
  cuisine: [{ fr: 'Cuisine', ar: 'طبخ' }, { fr: 'Pâtisserie', ar: 'حلويات' }, { fr: 'Cuisine algérienne', ar: 'طبخ جزائري' }],
  vente: [{ fr: 'Vente', ar: 'بيع' }, { fr: 'Commerce', ar: 'تجارة' }, { fr: 'Client relationship', ar: 'خدمة العملاء' }],
  transport: [{ fr: 'Conduite', ar: 'قيادة' }, { fr: 'Livraison', ar: 'توصيل' }, { fr: 'Navigation', ar: 'ملاحة' }],
  digital: [{ fr: 'React', ar: 'React' }, { fr: 'Node.js', ar: 'Node.js' }, { fr: 'WordPress', ar: 'WordPress' }],
  other: [{ fr: 'Nettoyage', ar: 'تنظيف' }, { fr: 'Jardinage', ar: 'بستنة' }, { fr: 'Manutention', ar: 'نقل' }],
};

function getUserId(): string | null {
  try {
    const raw = localStorage.getItem('oservice_user');
    if (raw) {
      const user = JSON.parse(raw);
      if (user?.id) return user.id;
    }
  } catch {}
  return null;
}

export default function WorkerOnboardingPage() {
  const { lang } = useLanguage();
  const router = useRouter();
  const { values, updateValues } = useFormCache<OnboardingForm>('worker_onboarding', INITIAL);
  const [step, setStep] = useState(1);
  const [newSkill, setNewSkill] = useState('');
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const communes = getCommunesByWilaya(values.wilaya);

  useEffect(() => {
    if (!getUserId() && !completed) {
      router.replace('/auth/login?role=worker');
    }
  }, []);

  const addSkill = (skill: string) => {
    const currentSkills = values.skills || [];
    if (skill.trim() && !currentSkills.includes(skill.trim())) {
      updateValues({ skills: [...currentSkills, skill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    updateValues({ skills: (values.skills || []).filter((s) => s !== skill) });
  };

  const handleComplete = async () => {
    const userId = getUserId();
    if (!userId) {
      router.push('/auth/login?role=worker');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/profile/worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: values.title,
          bio: values.bio || '',
          skills: values.skills || [],
          rateAmount: parseFloat(values.rateAmount) || 0,
          rateUnit: values.rateUnit,
          wilaya: values.wilaya,
          commune: values.commune,
          available: true,
        }),
      });

      if (response.ok) {
        clearFormCache('worker_onboarding');
        setCompleted(true);
        setTimeout(() => router.push('/worker'), 1500);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save');
      }
    } catch (err) {
      setError(lang === 'ar' ? 'حدث خطأ' : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div className="page-container">
        <div className="max-w-lg mx-auto px-4 flex flex-col items-center justify-center min-h-screen">
          <CheckCircle size={64} className="text-mint mb-4" />
          <h2 className="text-text-primary font-bold text-xl mb-2">
            {lang === 'ar' ? 'تم إعداد ملفك!' : 'Profil configuré!'}
          </h2>
          <p className="text-text-secondary text-sm text-center">
            {lang === 'ar'
              ? 'يمكنك الآن البحث والتقديم على الوظائف'
              : 'Vous pouvez maintenant chercher et postuler aux emplois'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <main className="max-w-lg mx-auto px-4 pb-8 min-h-screen flex flex-col">
        {/* Progress */}
        <div className="pt-8 pb-4">
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  s <= step ? 'bg-mint' : 'bg-surface'
                }`}
              />
            ))}
          </div>
          <p className="text-text-secondary text-xs text-center">
            {lang === 'ar' ? `الخطوة ${step} من 3` : `Étape ${step} sur 3`}
          </p>
        </div>

        {/* Step 1: Title & Bio */}
        {step === 1 && (
          <div className="flex-1 space-y-5 animate-fade-in">
            <div className="text-center mb-6">
              <h1 className="text-text-primary font-bold text-2xl mb-2">
                {lang === 'ar' ? 'أخبرنا عنك' : 'Parlez-nous de vous'}
              </h1>
              <p className="text-text-secondary text-sm">
                {lang === 'ar'
                  ? 'كيف تريد أن يراك أصحاب العمل؟'
                  : 'Comment voulez-vous que les recruteurs vous voient?'}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">
                {t(lang, 'jobTitle')}
                <span className="text-danger ms-1">*</span>
              </label>
              <input
                type="text"
                value={values.title}
                onChange={(e) => updateValues({ title: e.target.value })}
                placeholder={lang === 'ar' ? 'مثلاً: سائق، طباخ، بايع...' : 'Ex: Serveur, Cuisinier, Livreur...'}
                className="input-field"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary">
                {t(lang, 'bio')}
              </label>
              <textarea
                value={values.bio || ''}
                onChange={(e) => updateValues({ bio: e.target.value })}
                placeholder={lang === 'ar' ? 'خبرتك، ما تقدمه...' : 'Votre expérience, vos atouts...'}
                className="input-field resize-none"
                rows={4}
                maxLength={200}
              />
              <p className="text-xs text-text-muted/40 text-end">{(values.bio || '').length}/200</p>
            </div>

            <div className="flex-1" />

            <button
              onClick={() => setStep(2)}
              disabled={!values.title}
              className="btn-mint w-full flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {t(lang, 'next')}
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2: Skills */}
        {step === 2 && (
          <div className="flex-1 space-y-5 animate-fade-in">
            <div className="text-center mb-6">
              <h1 className="text-text-primary font-bold text-2xl mb-2">
                {t(lang, 'skills')}
              </h1>
              <p className="text-text-secondary text-sm">
                {lang === 'ar'
                  ? 'اختر مهاراتك أو أضف مهارات جديدة'
                  : 'Sélectionnez vos compétences ou ajoutez-en'}
              </p>
            </div>

            {(values.skills || []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(values.skills || []).map((skill) => (
                  <span key={skill} className="badge-mint text-sm py-1 px-3">
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ms-1.5 hover:text-mint-dark"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {Object.entries(SUGGESTED_SKILLS).map(([category, skills]) => (
                <div key={category}>
                  <p className="text-text-secondary text-xs mb-2 capitalize">
                    {category === 'service' ? (lang === 'ar' ? 'خدمة' : 'Service') :
                     category === 'cuisine' ? (lang === 'ar' ? 'طبخ' : 'Cuisine') :
                     category === 'vente' ? (lang === 'ar' ? 'بيع' : 'Vente') :
                     category === 'transport' ? (lang === 'ar' ? 'نقل' : 'Transport') :
                     category === 'digital' ? (lang === 'ar' ? 'رقمي' : 'Digital') :
                     (lang === 'ar' ? 'أخرى' : 'Autres')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => {
                      const label = lang === 'ar' ? skill.ar : skill.fr;
                      const isSelected = (values.skills || []).includes(label);
                      return (
                        <button
                          key={label}
                          onClick={() => isSelected ? removeSkill(label) : addSkill(label)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                            isSelected
                              ? 'bg-mint text-text-primary'
                              : 'bg-surface text-text-secondary hover:bg-surface'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSkill(newSkill)}
                placeholder={lang === 'ar' ? 'أضف مهارة...' : 'Ajouter une compétence...'}
                className="input-field flex-1"
              />
              <button
                onClick={() => addSkill(newSkill)}
                className="btn-mint px-4"
                disabled={!newSkill.trim()}
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="flex-1" />

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-outline flex-1">
                <ArrowLeft size={16} className="mx-auto" />
              </button>
              <button
                onClick={() => setStep(3)}
                className="btn-mint flex-1 flex items-center justify-center gap-2"
              >
                {t(lang, 'next')}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Rate & Location */}
        {step === 3 && (
          <div className="flex-1 space-y-5 animate-fade-in">
            <div className="text-center mb-6">
              <h1 className="text-text-primary font-bold text-2xl mb-2">
                {t(lang, 'ratePreferences')}
              </h1>
              <p className="text-text-secondary text-sm">
                {lang === 'ar'
                  ? 'حدد أجرك الموقع'
                  : 'Indiquez votre tarif et localisation'}
              </p>
            </div>

            <div className="glass-card p-4 space-y-3">
              <h3 className="text-sm font-medium text-text-primary">
                {t(lang, 'rateAmount')} (DA)
              </h3>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={values.rateAmount}
                  onChange={(e) => updateValues({ rateAmount: e.target.value })}
                  placeholder="2500"
                  className="input-field flex-1"
                />
                <select
                  value={values.rateUnit}
                  onChange={(e) => updateValues({ rateUnit: e.target.value })}
                  className="input-field w-32"
                >
                  <option value="hour">{t(lang, 'perHour')}</option>
                  <option value="day">{t(lang, 'perDay')}</option>
                  <option value="month">{t(lang, 'perMonth')}</option>
                </select>
              </div>
            </div>

            <div className="glass-card p-4 space-y-3">
              <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
                <MapPin size={14} className="text-mint" />
                {t(lang, 'jobLocation')}
              </h3>
              <select
                value={values.wilaya}
                onChange={(e) => updateValues({ wilaya: e.target.value, commune: '' })}
                className="input-field"
              >
                <option value="">{t(lang, 'selectWilaya')}</option>
                {WILAYAS.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.code} - {lang === 'ar' ? w.nameAr : w.name}
                  </option>
                ))}
              </select>
              {values.wilaya && (
                <select
                  value={values.commune}
                  onChange={(e) => updateValues({ commune: e.target.value })}
                  className="input-field"
                >
                  <option value="">{t(lang, 'selectCommune')}</option>
                  {communes.map((c) => (
                    <option key={lang === 'ar' ? c.nameAr : c.name} value={lang === 'ar' ? c.nameAr : c.name}>
                      {lang === 'ar' ? c.nameAr : c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {error && (
              <p className="text-danger text-sm text-center bg-danger/10 py-2 rounded-xl">{error}</p>
            )}

            <div className="flex-1" />

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-outline flex-1">
                <ArrowLeft size={16} className="mx-auto" />
              </button>
              <button
                onClick={handleComplete}
                className="btn-mint flex-1 flex items-center justify-center gap-2"
                disabled={!values.rateAmount || !values.wilaya || !values.commune || loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#0B0F19] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle size={16} />
                    {lang === 'ar' ? 'إنهاء' : 'Terminer'}
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
