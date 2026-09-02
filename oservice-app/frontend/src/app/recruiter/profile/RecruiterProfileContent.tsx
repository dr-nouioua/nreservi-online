'use client';

import { useState } from 'react';
import { Save, Building2, MapPin, Shield } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useApp } from '@/context/AppContext';
import { t } from '@/lib/translations';
import Header from '@/components/shared/Header';
import TextField from '@/components/shared/TextField';
import SelectField from '@/components/shared/SelectField';
import { useFormCache } from '@/hooks/useFormCache';
import { WILAYAS, getCommunesByWilaya } from '@/data/wilayas';

interface ProfileForm {
  companyName: string;
  companyDescription: string;
  wilaya: string;
  commune: string;
}

const INITIAL: ProfileForm = {
  companyName: 'Café Glacier',
  companyDescription: 'Café populaire au centre d\'Alger',
  wilaya: '16',
  commune: 'Alger Centre',
};

export default function RecruiterProfileContent() {
  const { lang } = useLanguage();
  const { currentUser } = useApp();
  const { values, updateValues } = useFormCache<ProfileForm>('recruiter_profile', INITIAL);
  const [saved, setSaved] = useState(false);

  const communes = getCommunesByWilaya(values.wilaya);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page-container">
      <Header title={t(lang, 'myProfile')} showBack showLogout />

      <main className="max-w-lg mx-auto px-4 pb-8">
        {/* Profile Header */}
        <div className="glass-card p-5 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <Building2 size={28} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-text-primary font-semibold text-lg">{values.companyName}</h2>
              <p className="text-text-secondary text-sm">{currentUser?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge-mint">
              <Shield size={12} className="me-1" />
              {lang === 'ar' ? 'حساب موثوق' : 'Compte vérifié'}
            </span>
            <span className="badge-steel">
              <MapPin size={12} className="me-1" />
              {WILAYAS.find((w) => w.code === values.wilaya)?.name}
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <TextField
            label={t(lang, 'jobCompany')}
            value={values.companyName}
            onChange={(v) => updateValues({ companyName: v })}
            required
          />

          <TextField
            label={lang === 'ar' ? 'وصف الشركة' : 'Description de l\'entreprise'}
            value={values.companyDescription}
            onChange={(v) => updateValues({ companyDescription: v })}
            placeholder={lang === 'ar' ? 'قصة شركتك...' : 'Décrivez votre entreprise...'}
            multiline
            rows={3}
          />

          <div className="glass-card p-4 space-y-3">
            <h3 className="text-sm font-medium text-text-primary">{t(lang, 'jobLocation')}</h3>
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
          </div>

          <button onClick={handleSave} className="btn-mint w-full flex items-center justify-center gap-2">
            <Save size={18} />
            {saved ? t(lang, 'profileSaved') : t(lang, 'save')}
          </button>
        </div>
      </main>
    </div>
  );
}
