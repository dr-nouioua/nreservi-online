'use client';

import { useState } from 'react';
import { Save, Plus, X, Star, Briefcase, MapPin, Edit3, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useApp } from '@/context/AppContext';
import { t } from '@/lib/translations';
import Header from '@/components/shared/Header';
import { useFormCache } from '@/hooks/useFormCache';
import { WILAYAS, getCommunesByWilaya } from '@/data/wilayas';

interface ProfileForm {
  title: string;
  bio: string;
  skills: string[];
  rateAmount: string;
  rateUnit: string;
  wilaya: string;
  commune: string;
}

const INITIAL: ProfileForm = {
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

export default function ProfileContent() {
  const { lang } = useLanguage();
  const { currentUser } = useApp();
  const { values, updateValues } = useFormCache<ProfileForm>('worker_profile', INITIAL);
  const [newSkill, setNewSkill] = useState('');
  const [saved, setSaved] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);

  const communes = getCommunesByWilaya(values.wilaya);

  const handleSave = () => {
    setSaved(true);
    setEditingField(null);
    setTimeout(() => setSaved(false), 2000);
  };

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

  const isEditing = (field: string) => editingField === field;

  return (
    <div className="page-container">
      <Header title={t(lang, 'myProfile')} showBack showLogout />

      <main className="max-w-lg mx-auto px-4 pb-8">
        {/* Profile Header */}
        <div className="glass-card p-5 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-mint/10 flex items-center justify-center">
              <span className="text-mint text-2xl font-bold">
                {currentUser?.name?.charAt(0) || 'W'}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-text-primary font-semibold text-lg">{currentUser?.name}</h2>
              <p className="text-text-secondary text-sm">{currentUser?.email}</p>
              <p className="text-text-muted text-xs">{currentUser?.phone}</p>
            </div>
          </div>
          <div className="flex gap-4 text-center">
            <div className="flex-1">
              <div className="flex items-center justify-center gap-1 text-mint">
                <Star size={14} />
                <span className="font-semibold">4.7</span>
              </div>
              <p className="text-text-secondary text-xs">{t(lang, 'rating')}</p>
            </div>
            <div className="flex-1 border-x border-white/10">
              <div className="flex items-center justify-center gap-1 text-mint">
                <Briefcase size={14} />
                <span className="font-semibold">23</span>
              </div>
              <p className="text-text-secondary text-xs">{t(lang, 'completedJobs')}</p>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-center gap-1 text-mint">
                <MapPin size={14} />
                <span className="font-semibold text-sm">
                  {values.wilaya ? WILAYAS.find((w) => w.code === values.wilaya)?.name : '—'}
                </span>
              </div>
              <p className="text-text-secondary text-xs">{t(lang, 'wilaya')}</p>
            </div>
          </div>
        </div>

        {/* Title Section */}
        <div className="glass-card p-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-text-primary">{t(lang, 'jobTitle')}</label>
            <button
              onClick={() => setEditingField(isEditing('title') ? null : 'title')}
              className="p-1.5 rounded-lg hover:bg-white/5"
            >
              <Edit3 size={14} className="text-text-secondary" />
            </button>
          </div>
          {isEditing('title') ? (
            <input
              type="text"
              value={values.title}
              onChange={(e) => updateValues({ title: e.target.value })}
              placeholder={lang === 'ar' ? 'مثلاً: سائق، طباخ...' : 'Ex: Serveur, Cuisinier...'}
              className="input-field"
              autoFocus
            />
          ) : (
            <p className="text-text-secondary text-sm">{values.title || '—'}</p>
          )}
        </div>

        {/* Bio Section */}
        <div className="glass-card p-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-text-primary">{t(lang, 'bio')}</label>
            <button
              onClick={() => setEditingField(isEditing('bio') ? null : 'bio')}
              className="p-1.5 rounded-lg hover:bg-white/5"
            >
              <Edit3 size={14} className="text-text-secondary" />
            </button>
          </div>
          {isEditing('bio') ? (
            <>
              <textarea
                value={values.bio}
                onChange={(e) => updateValues({ bio: e.target.value })}
                placeholder={t(lang, 'bioPlaceholder')}
                className="input-field resize-none"
                rows={3}
                maxLength={200}
                autoFocus
              />
              <p className="text-xs text-text-muted/40 text-end mt-1">{(values.bio || '').length}/200</p>
            </>
          ) : (
            <p className="text-text-secondary text-sm">{values.bio || '—'}</p>
          )}
        </div>

        {/* Skills Section */}
        <div className="glass-card p-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-text-primary">{t(lang, 'skills')}</label>
            <button
              onClick={() => setEditingField(isEditing('skills') ? null : 'skills')}
              className="p-1.5 rounded-lg hover:bg-white/5"
            >
              <Edit3 size={14} className="text-text-secondary" />
            </button>
          </div>

          {(values.skills || []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(values.skills || []).map((skill) => (
                <span key={skill} className="badge-mint text-sm py-1 px-3">
                  {skill}
                  {isEditing('skills') && (
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ms-1.5 hover:text-mint-dark"
                    >
                      <X size={14} />
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}

          {isEditing('skills') && (
            <>
              {/* Suggested Skills */}
              <div className="space-y-3 mb-3">
                {Object.entries(SUGGESTED_SKILLS).map(([category, skills]) => (
                  <div key={category}>
                    <p className="text-text-muted text-[10px] mb-1.5 uppercase tracking-wider">
                      {category === 'service' ? 'Service' :
                       category === 'cuisine' ? 'Cuisine' :
                       category === 'vente' ? 'Vente' :
                       category === 'transport' ? 'Transport' :
                       category === 'digital' ? 'Digital' : 'Autres'}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((skill) => {
                        const label = lang === 'ar' ? skill.ar : skill.fr;
                        const isSelected = (values.skills || []).includes(label);
                        return (
                          <button
                            key={label}
                            onClick={() => isSelected ? removeSkill(label) : addSkill(label)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all active:scale-95 ${
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

              {/* Custom Skill Input */}
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
                  className="btn-mint px-3"
                  disabled={!newSkill.trim()}
                >
                  <Plus size={16} />
                </button>
              </div>
            </>
          )}

          {!isEditing('skills') && (values.skills || []).length === 0 && (
            <p className="text-text-muted/50 text-xs">{t(lang, 'addSkill')}</p>
          )}
        </div>

        {/* Rate Section */}
        <div className="glass-card p-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-text-primary">{t(lang, 'ratePreferences')}</label>
            <button
              onClick={() => setEditingField(isEditing('rate') ? null : 'rate')}
              className="p-1.5 rounded-lg hover:bg-white/5"
            >
              <Edit3 size={14} className="text-text-secondary" />
            </button>
          </div>

          {isEditing('rate') ? (
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="number"
                  value={values.rateAmount}
                  onChange={(e) => updateValues({ rateAmount: e.target.value })}
                  placeholder="2500"
                  className="input-field"
                />
              </div>
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
          ) : (
            <p className="text-text-secondary text-sm">
              {values.rateAmount
                ? `${Number(values.rateAmount).toLocaleString('fr-DZ')} DA / ${
                    values.rateUnit === 'hour' ? t(lang, 'perHour') :
                    values.rateUnit === 'day' ? t(lang, 'perDay') : t(lang, 'perMonth')
                  }`
                : '—'}
            </p>
          )}
        </div>

        {/* Location Section */}
        <div className="glass-card p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-text-primary">{t(lang, 'jobLocation')}</label>
            <button
              onClick={() => setEditingField(isEditing('location') ? null : 'location')}
              className="p-1.5 rounded-lg hover:bg-white/5"
            >
              <Edit3 size={14} className="text-text-secondary" />
            </button>
          </div>

          {isEditing('location') ? (
            <div className="space-y-3">
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
          ) : (
            <p className="text-text-secondary text-sm">
              {values.commune && values.wilaya
                ? `${values.commune}, ${WILAYAS.find((w) => w.code === values.wilaya)?.name}`
                : values.wilaya
                ? WILAYAS.find((w) => w.code === values.wilaya)?.name
                : '—'}
            </p>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="btn-mint w-full flex items-center justify-center gap-2"
        >
          {saved ? (
            <>
              <CheckCircle size={18} />
              {t(lang, 'profileSaved')}
            </>
          ) : (
            <>
              <Save size={18} />
              {t(lang, 'save')}
            </>
          )}
        </button>
      </main>
    </div>
  );
}
