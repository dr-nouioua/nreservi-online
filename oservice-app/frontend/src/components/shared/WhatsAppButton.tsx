'use client';

import { MessageCircle } from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';

interface WhatsAppButtonProps {
  phone: string;
  message: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function WhatsAppButton({
  phone,
  message,
  label,
  size = 'md',
  className = '',
}: WhatsAppButtonProps) {
  const { lang } = useLanguage();

  const url = buildWhatsAppUrl(phone, message);

  const sizeClasses = {
    sm: 'px-3 py-2 text-xs gap-1.5',
    md: 'px-4 py-3 text-sm gap-2',
    lg: 'px-6 py-4 text-base gap-2.5',
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-whatsapp inline-flex items-center justify-center ${sizeClasses[size]} ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <MessageCircle size={size === 'sm' ? 14 : size === 'md' ? 18 : 22} />
      <span>{label || t(lang, 'contactOnWhatsapp')}</span>
    </a>
  );
}
