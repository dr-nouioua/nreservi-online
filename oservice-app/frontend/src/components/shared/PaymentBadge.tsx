'use client';

import { Banknote, CreditCard } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';

interface PaymentBadgeProps {
  type: 'cash' | 'digital';
  showComingSoon?: boolean;
}

export default function PaymentBadge({ type, showComingSoon = false }: PaymentBadgeProps) {
  const { lang } = useLanguage();

  if (type === 'cash') {
    return (
      <span className="badge-mint">
        <Banknote size={12} className="me-1" />
        {t(lang, 'cashPayment')}
      </span>
    );
  }

  return (
    <span className="badge-steel">
      <CreditCard size={12} className="me-1" />
      {t(lang, 'digitalPayment')}
      {showComingSoon && (
        <span className="ms-1 text-warning text-[9px]">
          ({t(lang, 'comingSoon')})
        </span>
      )}
    </span>
  );
}
