'use client';

import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const SIZES = {
  sm: { icon: 28, text: 'text-base' },
  md: { icon: 36, text: 'text-xl' },
  lg: { icon: 56, text: 'text-2xl' },
  xl: { icon: 100, text: 'text-3xl' },
};

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const { icon, text } = SIZES[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/logo.svg"
        alt="OSERVICE"
        width={icon}
        height={icon}
        priority
      />
      {showText && (
        <span className={`font-bold ${text}`}>
          <span className="text-text-primary">O</span>
          <span className="text-mint">SERVICE</span>
        </span>
      )}
    </div>
  );
}
