import { Language } from '@/types';

type TranslationKeys = {
  // Navigation
  navHome: string;
  navJobs: string;
  navProfile: string;
  navPost: string;
  navDashboard: string;
  navSettings: string;
  navBack: string;

  // Common
  appName: string;
  appTagline: string;
  search: string;
  searchPlaceholder: string;
  filter: string;
  filters: string;
  loading: string;
  noResults: string;
  retry: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  submit: string;
  confirm: string;
  close: string;
  seeMore: string;
  seeLess: string;
  viewAll: string;
  back: string;
  next: string;
  previous: string;
  required: string;
  optional: string;
  or: string;
  and: string;

  // Auth
  login: string;
  register: string;
  logout: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  loginTitle: string;
  registerTitle: string;
  loginSubtitle: string;
  registerSubtitle: string;
  alreadyHaveAccount: string;
  dontHaveAccount: string;
  loginAs: string;
  worker: string;
  recruiter: string;
  admin: string;
  phoneHelper: string;
  phoneInvalid: string;

  // Jobs
  jobs: string;
  jobFeed: string;
  jobTitle: string;
  jobDescription: string;
  jobBudget: string;
  jobDuration: string;
  jobLocation: string;
  jobCompany: string;
  postNewJob: string;
  myJobs: string;
  activeJobs: string;
  filledJobs: string;
  expiredJobs: string;
  applicants: string;
  noApplicants: string;
  contactOnWhatsapp: string;
  applyNow: string;
  applied: string;
  viewApplicants: string;
  cashPayment: string;
  digitalPayment: string;
  paidPer: string;

  // Job Creation
  createJob: string;
  jobDetails: string;
  selectWilaya: string;
  selectCommune: string;
  durationPlaceholder: string;
  descriptionPlaceholder: string;
  budgetAmount: string;
  budgetUnit: string;
  perHour: string;
  perDay: string;
  perMonth: string;
  totalJob: string;
  durationDays: string;
  durationMonths: string;
  publishJob: string;
  jobPublished: string;

  // Profile
  myProfile: string;
  editProfile: string;
  ratePreferences: string;
  rateAmount: string;
  rateUnit: string;
  skills: string;
  addSkill: string;
  bio: string;
  bioPlaceholder: string;
  availability: string;
  available: string;
  unavailable: string;
  profileSaved: string;
  completedJobs: string;
  rating: string;

  // Worker
  workerDashboard: string;
  recommendedJobs: string;
  nearbyJobs: string;
  recentApplications: string;

  // Recruiter
  recruiterDashboard: string;
  postJob: string;
  totalJobs: string;
  totalApplicants: string;
  activePostings: string;
  recentApplicationsRecruiter: string;
  whatsappMessage: string;

  // Admin
  adminDashboard: string;
  pendingApprovals: string;
  approvedUsers: string;
  rejectedUsers: string;
  platformStats: string;
  totalUsers: string;
  totalWorkers: string;
  totalRecruiters: string;
  approve: string;
  reject: string;
  approveAll: string;
  rejectAll: string;
  paymentConfig: string;
  cashMode: string;
  digitalMode: string;
  cashModeDesc: string;
  digitalModeDesc: string;
  phase: string;
  phaseOne: string;
  phaseTwo: string;
  pending: string;
  approved: string;
  rejected: string;
  userManagement: string;

  // Location
  wilaya: string;
  commune: string;
  allWilayas: string;
  allCommunes: string;

  // Payment
  paymentMethod: string;
  cashOnSite: string;
  payOnDelivery: string;
  digitalGateway: string;
  comingSoon: string;

  // WhatsApp
  whatsappGreeting: string;
  whatsappIntro: string;
  whatsappCandidate: string;
  whatsappPosition: string;

  // System
  systemConfig: string;
  language: string;
  switchToArabic: string;
  switchToFrench: string;
  darkMode: string;
  version: string;
};

const fr: TranslationKeys = {
  // Navigation
  navHome: 'Accueil',
  navJobs: 'Emplois',
  navProfile: 'Profil',
  navPost: 'Publier',
  navDashboard: 'Tableau de bord',
  navSettings: 'Paramètres',
  navBack: 'Retour',

  // Common
  appName: 'OSERVICE',
  appTagline: 'Votre plateforme d\'emplois en Algérie',
  search: 'Rechercher',
  searchPlaceholder: 'Rechercher un emploi, une compétence...',
  filter: 'Filtrer',
  filters: 'Filtres',
  loading: 'Chargement...',
  noResults: 'Aucun résultat trouvé',
  retry: 'Réessayer',
  save: 'Enregistrer',
  cancel: 'Annuler',
  delete: 'Supprimer',
  edit: 'Modifier',
  submit: 'Soumettre',
  confirm: 'Confirmer',
  close: 'Fermer',
  seeMore: 'Voir plus',
  seeLess: 'Voir moins',
  viewAll: 'Tout voir',
  back: 'Retour',
  next: 'Suivant',
  previous: 'Précédent',
  required: 'Requis',
  optional: 'Optionnel',
  or: 'ou',
  and: 'et',

  // Auth
  login: 'Connexion',
  register: 'Inscription',
  logout: 'Déconnexion',
  email: 'Email',
  phone: 'Téléphone',
  password: 'Mot de passe',
  confirmPassword: 'Confirmer le mot de passe',
  fullName: 'Nom complet',
  loginTitle: 'Bienvenue',
  registerTitle: 'Créer un compte',
  loginSubtitle: 'Connectez-vous à votre compte',
  registerSubtitle: 'Rejoignez OSERVICE',
  alreadyHaveAccount: 'Déjà un compte ?',
  dontHaveAccount: 'Pas encore de compte ?',
  loginAs: 'Se connecter en tant que',
  worker: 'Travailleur',
  recruiter: 'Recruteur',
  admin: 'Administrateur',
  phoneHelper: 'Numéro algérien (05, 06, 07)',
  phoneInvalid: 'Numéro de téléphone invalide',

  // Jobs
  jobs: 'Emplois',
  jobFeed: 'Offres d\'emploi',
  jobTitle: 'Titre du poste',
  jobDescription: 'Description',
  jobBudget: 'Budget',
  jobDuration: 'Durée',
  jobLocation: 'Lieu',
  jobCompany: 'Entreprise',
  postNewJob: 'Publier une offre',
  myJobs: 'Mes offres',
  activeJobs: 'Offres actives',
  filledJobs: 'Offres pourvues',
  expiredJobs: 'Offres expirées',
  applicants: 'Candidats',
  noApplicants: 'Aucun candidat pour le moment',
  contactOnWhatsapp: 'Contacter via WhatsApp',
  applyNow: 'Postuler maintenant',
  applied: 'Candidature envoyée',
  viewApplicants: 'Voir les candidats',
  cashPayment: 'Paiement en espèces',
  digitalPayment: 'Paiement numérique',
  paidPer: 'Payé par',

  // Job Creation
  createJob: 'Créer une offre',
  jobDetails: 'Détails du poste',
  selectWilaya: 'Sélectionner la wilaya',
  selectCommune: 'Sélectionner la commune',
  durationPlaceholder: 'ex: 3 jours, 2 semaines, 1 mois',
  descriptionPlaceholder: 'Décrivez le poste, les tâches, les exigences...',
  budgetAmount: 'Montant',
  budgetUnit: 'Unité',
  perHour: 'Par heure',
  perDay: 'Par jour',
  perMonth: 'Par mois',
  totalJob: 'Prix total',
  durationDays: 'Durée (jours)',
  durationMonths: 'Durée (mois)',
  publishJob: 'Publier l\'offre',
  jobPublished: 'Offre publiée avec succès',

  // Profile
  myProfile: 'Mon profil',
  editProfile: 'Modifier le profil',
  ratePreferences: 'Tarif souhaité',
  rateAmount: 'Montant (DA)',
  rateUnit: 'Unité',
  skills: 'Compétences',
  addSkill: 'Ajouter une compétence',
  bio: 'Bio',
  bioPlaceholder: 'Parlez de vous, votre expérience...',
  availability: 'Disponibilité',
  available: 'Disponible',
  unavailable: 'Indisponible',
  profileSaved: 'Profil enregistré',
  completedJobs: 'Emplois réalisés',
  rating: 'Note',

  // Worker
  workerDashboard: 'Espace travailleur',
  recommendedJobs: 'Emplois recommandés',
  nearbyJobs: 'Emplois à proximité',
  recentApplications: 'Candidatures récentes',

  // Recruiter
  recruiterDashboard: 'Espace recruteur',
  postJob: 'Publier un emploi',
  totalJobs: 'Total offres',
  totalApplicants: 'Total candidats',
  activePostings: 'Offres actives',
  recentApplicationsRecruiter: 'Candidatures récentes',
  whatsappMessage: 'Message WhatsApp',

  // Admin
  adminDashboard: 'Administration',
  pendingApprovals: 'En attente d\'approbation',
  approvedUsers: 'Utilisateurs approuvés',
  rejectedUsers: 'Utilisateurs rejetés',
  platformStats: 'Statistiques',
  totalUsers: 'Total utilisateurs',
  totalWorkers: 'Total travailleurs',
  totalRecruiters: 'Total recruteurs',
  approve: 'Approuver',
  reject: 'Rejeter',
  approveAll: 'Tout approuver',
  rejectAll: 'Tout rejeter',
  paymentConfig: 'Configuration des paiements',
  cashMode: 'Mode espèces',
  digitalMode: 'Mode numérique',
  cashModeDesc: 'Paiement sur site en espèces',
  digitalModeDesc: 'Portail de paiement numérique (CIB/Edahabia)',
  phase: 'Phase',
  phaseOne: 'Phase 1 - Espèces',
  phaseTwo: 'Phase 2 - Numérique',
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Rejeté',
  userManagement: 'Gestion des utilisateurs',

  // Location
  wilaya: 'Wilaya',
  commune: 'Commune',
  allWilayas: 'Toutes les wilayas',
  allCommunes: 'Toutes les communes',

  // Payment
  paymentMethod: 'Mode de paiement',
  cashOnSite: 'Paiement sur site',
  payOnDelivery: 'Paiement à la livraison',
  digitalGateway: 'Portail numérique',
  comingSoon: 'Bientôt disponible',

  // WhatsApp
  whatsappGreeting: 'Bonjour',
  whatsappIntro: 'Je vous contacte via OSERVICE concernant',
  whatsappCandidate: 'Candidat',
  whatsappPosition: 'Poste',

  // System
  systemConfig: 'Configuration système',
  language: 'Langue',
  switchToArabic: 'Passer en arabe',
  switchToFrench: 'Passer en français',
  darkMode: 'Mode sombre',
  version: 'Version',
};

const ar: TranslationKeys = {
  // Navigation
  navHome: 'الرئيسية',
  navJobs: 'الوظائف',
  navProfile: 'الملف الشخصي',
  navPost: 'نشر',
  navDashboard: 'لوحة التحكم',
  navSettings: 'الإعدادات',
  navBack: 'رجوع',

  // Common
  appName: 'OSERVICE',
  appTagline: 'منصتك للوظائف في الجزائر',
  search: 'بحث',
  searchPlaceholder: 'ابحث عن وظيفة، مهارة...',
  filter: 'تصفية',
  filters: 'التصفيات',
  loading: 'جاري التحميل...',
  noResults: 'لا توجد نتائج',
  retry: 'إعادة المحاولة',
  save: 'حفظ',
  cancel: 'إلغاء',
  delete: 'حذف',
  edit: 'تعديل',
  submit: 'إرسال',
  confirm: 'تأكيد',
  close: 'إغلاق',
  seeMore: 'عرض المزيد',
  seeLess: 'عرض أقل',
  viewAll: 'عرض الكل',
  back: 'رجوع',
  next: 'التالي',
  previous: 'السابق',
  required: 'مطلوب',
  optional: 'اختياري',
  or: 'أو',
  and: 'و',

  // Auth
  login: 'تسجيل الدخول',
  register: 'إنشاء حساب',
  logout: 'تسجيل الخروج',
  email: 'البريد الإلكتروني',
  phone: 'الهاتف',
  password: 'كلمة المرور',
  confirmPassword: 'تأكيد كلمة المرور',
  fullName: 'الاسم الكامل',
  loginTitle: 'مرحباً بعودتك',
  registerTitle: 'إنشاء حساب',
  loginSubtitle: 'سجّل الدخول إلى حسابك',
  registerSubtitle: 'انضم إلى OSERVICE',
  alreadyHaveAccount: 'لديك حساب بالفعل؟',
  dontHaveAccount: 'ليس لديك حساب؟',
  loginAs: 'تسجيل الدخول كـ',
  worker: 'عامل',
  recruiter: 'مُوظِّف',
  admin: 'مدير',
  phoneHelper: 'رقم جزائري (05, 06, 07)',
  phoneInvalid: 'رقم الهاتف غير صالح',

  // Jobs
  jobs: 'الوظائف',
  jobFeed: 'عرض الوظائف',
  jobTitle: 'المسمى الوظيفي',
  jobDescription: 'الوصف',
  jobBudget: 'الميزانية',
  jobDuration: 'المدة',
  jobLocation: 'الموقع',
  jobCompany: 'الشركة',
  postNewJob: 'نشر وظيفة جديدة',
  myJobs: 'وظائفي',
  activeJobs: 'الوظائف النشطة',
  filledJobs: 'الوظائف الم占�نة',
  expiredJobs: 'الوظائف المنتهية',
  applicants: 'المتقدمون',
  noApplicants: 'لا يوجد متقدمون بعد',
  contactOnWhatsapp: 'التواصل عبر واتساب',
  applyNow: 'تقديم الآن',
  applied: 'تم إرسال الطلب',
  viewApplicants: 'عرض المتقدمين',
  cashPayment: 'الدفع نقداً',
  digitalPayment: 'الدفع الرقمي',
  paidPer: 'الأجر عن',

  // Job Creation
  createJob: 'إنشاء وظيفة',
  jobDetails: 'تفاصيل الوظيفة',
  selectWilaya: 'اختر الولاية',
  selectCommune: 'اختر البلدية',
  durationPlaceholder: 'مثال: 3 أيام، أسبوعين، شهر',
  descriptionPlaceholder: 'صف الوظيفة، المهام، المتطلبات...',
  budgetAmount: 'المبلغ',
  budgetUnit: 'الوحدة',
  perHour: 'بالساعة',
  perDay: 'باليوم',
  perMonth: 'بالشهر',
  totalJob: 'السعر الإجمالي',
  durationDays: 'المدة (أيام)',
  durationMonths: 'المدة (أشهر)',
  publishJob: 'نشر الوظيفة',
  jobPublished: 'تم نشر الوظيفة بنجاح',

  // Profile
  myProfile: 'ملفي الشخصي',
  editProfile: 'تعديل الملف الشخصي',
  ratePreferences: 'الأجر المطلوب',
  rateAmount: 'المبلغ (دج)',
  rateUnit: 'الوحدة',
  skills: 'المهارات',
  addSkill: 'إضافة مهارة',
  bio: 'نبذة عنك',
  bioPlaceholder: 'تحدث عن نفسك وخبراتك...',
  availability: 'التوفر',
  available: 'متاح',
  unavailable: 'غير متاح',
  profileSaved: 'تم حفظ الملف الشخصي',
  completedJobs: 'الوظائف المنجزة',
  rating: 'التقييم',

  // Worker
  workerDashboard: 'مساحة العامل',
  recommendedJobs: 'وظائف مقترحة',
  nearbyJobs: 'وظائف قريبة',
  recentApplications: 'طلبات حديثة',

  // Recruiter
  recruiterDashboard: 'مساحة المُوظِّف',
  postJob: 'نشر وظيفة',
  totalJobs: 'إجمالي الوظائف',
  totalApplicants: 'إجمالي المتقدمين',
  activePostings: 'الوظائف النشطة',
  recentApplicationsRecruiter: 'طلبات حديثة',
  whatsappMessage: 'رسالة واتساب',

  // Admin
  adminDashboard: 'لوحة الإدارة',
  pendingApprovals: 'في انتظار الموافقة',
  approvedUsers: 'المستخدمون المعتمدون',
  rejectedUsers: 'المستخدمون المرفوضون',
  platformStats: 'الإحصائيات',
  totalUsers: 'إجمالي المستخدمين',
  totalWorkers: 'إجمالي العمال',
  totalRecruiters: 'إجمالي المُوظِّفين',
  approve: 'موافقة',
  reject: 'رفض',
  approveAll: 'الموافقة على الكل',
  rejectAll: 'رفض الكل',
  paymentConfig: 'إعدادات الدفع',
  cashMode: 'وضع النقد',
  digitalMode: 'وضع رقمي',
  cashModeDesc: 'الدفع على الموقع نقداً',
  digitalModeDesc: 'بوابة الدفع الرقمي (CIB/Edahabia)',
  phase: 'المرحلة',
  phaseOne: 'المرحلة 1 - النقد',
  phaseTwo: 'المرحلة 2 - رقمي',
  pending: 'قيد الانتظار',
  approved: 'معتمد',
  rejected: 'مرفوض',
  userManagement: 'إدارة المستخدمين',

  // Location
  wilaya: 'الولاية',
  commune: 'البلدية',
  allWilayas: 'جميع الولايات',
  allCommunes: 'جميع البلديات',

  // Payment
  paymentMethod: 'طريقة الدفع',
  cashOnSite: 'الدفع على الموقع',
  payOnDelivery: 'الدفع عند التسليم',
  digitalGateway: 'بوابة رقمية',
  comingSoon: 'قريباً',

  // WhatsApp
  whatsappGreeting: 'مرحباً',
  whatsappIntro: 'أتواصل معك عبر OSERVICE بخصوص',
  whatsappCandidate: 'المترشح',
  whatsappPosition: 'المنصب',

  // System
  systemConfig: 'إعدادات النظام',
  language: 'اللغة',
  switchToArabic: 'التبديل إلى العربية',
  switchToFrench: 'التبديل إلى الفرنسية',
  darkMode: 'الوضع الداكن',
  version: 'الإصدار',
};

const translations: Record<Language, TranslationKeys> = { fr, ar };

export function t(lang: Language, key: keyof TranslationKeys): string {
  return translations[lang][key] || translations.fr[key] || key;
}

export function getDir(lang: Language): 'ltr' | 'rtl' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

export function getFontClass(lang: Language): string {
  return lang === 'ar' ? 'font-arabic' : 'font-sans';
}
