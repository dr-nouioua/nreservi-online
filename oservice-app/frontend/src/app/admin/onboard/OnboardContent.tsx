'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, CheckCircle, Send } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';
import Header from '@/components/shared/Header';
import TextField from '@/components/shared/TextField';
import SelectField from '@/components/shared/SelectField';
import { useFormCache } from '@/hooks/useFormCache';
import { WILAYAS, getCommunesByWilaya } from '@/data/wilayas';
import { isValidAlgerianPhone } from '@/lib/whatsapp';

interface OnboardForm {
  restaurantName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  wilaya: string;
  commune: string;
}

const INITIAL: OnboardForm = {
  restaurantName: '',
  ownerName: '',
  ownerEmail: '',
  ownerPhone: '',
  wilaya: '',
  commune: '',
};

export default function OnboardContent() {
  const { lang } = useLanguage();
  const router = useRouter();
  const { values, updateValues, reset } = useFormCache<OnboardForm>('admin_onboard', INITIAL);
  const [created, setCreated] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const communes = getCommunesByWilaya(values.wilaya);

  const handlePhoneChange = (v: string) => {
    updateValues({ ownerPhone: v });
    if (v && !isValidAlgerianPhone(v)) {
      setPhoneError(t(lang, 'phoneInvalid'));
    } else {
      setPhoneError('');
    }
  };

  const handleCreate = () => {
    if (!isValidAlgerianPhone(values.ownerPhone)) {
      setPhoneError(t(lang, 'phoneInvalid'));
      return;
    }
    setCreated(true);
    setTimeout(() => {
      reset();
      router.push('/admin');
    }, 2000);
  };

  if (created) {
    return (
      <div className="page-container">
        <Header showBack />
        <div className="max-w-lg mx-auto px-4 flex flex-col items-center justify-center py-20">
          <CheckCircle size={64} className="text-mint mb-4" />
          <h2 className="text-text-primary font-bold text-xl mb-2">
            {lang === 'ar' ? 'تم الإنشاء بنجاح' : 'Créé avec succès'}
          </h2>
          <p className="text-text-secondary text-sm text-center">
            {lang === 'ar'
              ? 'تم إنشاء حساب المطعم وصاحب العمل'
              : 'Le restaurant et le compte propriétaire ont été créés'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Header title={lang === 'ar' ? 'إنشاء مطعم جديد' : 'Créer un restaurant'} showBack />

      <main className="max-w-lg mx-auto px-4 pb-8">
        <div className="glass-card p-5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Building2 size={24} className="text-mint" />
            <div>
              <h2 className="text-text-primary font-semibold">
                {lang === 'ar' ? 'معلومات المطعم' : 'Informations du restaurant'}
              </h2>
              <p className="text-text-secondary text-xs">
                {lang === 'ar' ? 'إنشاء حساب جديد للمطعم' : 'Créez un nouveau compte restaurant'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <TextField
            label={t(lang, 'jobCompany')}
            value={values.restaurantName}
            onChange={(v) => updateValues({ restaurantName: v })}
            placeholder={lang === 'ar' ? 'اسم المطعم' : 'Nom du restaurant'}
            required
          />

          <TextField
            label={t(lang, 'fullName')}
            value={values.ownerName}
            onChange={(v) => updateValues({ ownerName: v })}
            placeholder={lang === 'ar' ? 'اسم المالك' : 'Nom du propriétaire'}
            required
          />

          <TextField
            label={t(lang, 'email')}
            value={values.ownerEmail}
            onChange={(v) => updateValues({ ownerEmail: v })}
            type="email"
            placeholder="email@exemple.com"
            required
          />

          <TextField
            label={t(lang, 'phone')}
            value={values.ownerPhone}
            onChange={handlePhoneChange}
            type="tel"
            placeholder="0555123456"
            helper={t(lang, 'phoneHelper')}
            error={phoneError}
            required
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

          <button
            onClick={handleCreate}
            className="btn-mint w-full flex items-center justify-center gap-2"
            disabled={!values.restaurantName || !values.ownerName || !values.ownerPhone || !values.wilaya || !values.commune}
          >
            <Send size={16} />
            {lang === 'ar' ? 'إنشاء المطعم' : 'Créer le restaurant'}
          </button>
        </div>
      </main>
    </div>
  );
}
