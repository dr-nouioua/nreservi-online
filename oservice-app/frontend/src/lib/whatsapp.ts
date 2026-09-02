import { Language } from '@/types';

/**
 * Normalize an Algerian phone number to international format for WhatsApp.
 * Input: 0555123456 or 0666123456 or 0777123456
 * Output: 213555123456 (without leading 0, with 213 prefix)
 */
export function normalizeAlgerianPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '');

  if (cleaned.startsWith('213')) {
    return cleaned;
  }

  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return '213' + cleaned.slice(1);
  }

  if (cleaned.length === 9 && /^[567]/.test(cleaned)) {
    return '213' + cleaned;
  }

  return cleaned;
}

/**
 * Validate an Algerian phone number.
 * Must start with 05, 06, or 07 and be 10 digits total.
 */
export function isValidAlgerianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^(0[567]\d{8})$/.test(cleaned);
}

/**
 * Build a WhatsApp click-to-chat URL.
 * Never sends messages automatically — only constructs the URL.
 */
export function buildWhatsAppUrl(
  phone: string,
  message: string,
): string {
  const normalized = normalizeAlgerianPhone(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${normalized}?text=${encoded}`;
}

/**
 * Build a bilingual WhatsApp contact message for recruiter → worker.
 */
export function buildRecruiterMessage(
  lang: Language,
  recruiterName: string,
  workerName: string,
  jobTitle: string,
): string {
  if (lang === 'ar') {
    return `مرحباً ${workerName}،

أنا ${recruiterName} أتصل بك عبر OSERVICE بخصوص منصب "${jobTitle}".

هل أنت متاح للتحدث؟`;
  }

  return `Bonjour ${workerName},

Je suis ${recruiterName} et je vous contacte via OSERVICE concernant le poste "${jobTitle}".

Êtes-vous disponible pour en discuter ?`;
}

/**
 * Build a generic WhatsApp greeting message.
 */
export function buildGreetingMessage(
  lang: Language,
  name: string,
): string {
  if (lang === 'ar') {
    return `مرحباً ${name}، أتواصل معك عبر OSERVICE.`;
  }
  return `Bonjour ${name}, je vous contacte via OSERVICE.`;
}
