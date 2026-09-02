'use client';

import { ReactNode } from 'react';

interface AnimatedBorderButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md';
}

export default function AnimatedBorderButton({
  children,
  href,
  onClick,
  className = '',
  size = 'md',
}: AnimatedBorderButtonProps) {
  const padding = size === 'sm' ? 'px-6 py-3' : 'px-7 py-3.5';
  const textSize = size === 'sm' ? 'text-[15px]' : 'text-[16px]';

  const buttonContent = (
    <button
      onClick={onClick}
      className={`relative ${padding} ${textSize} font-medium text-white bg-[#060218] rounded-full overflow-hidden transition-all duration-300 hover:text-white group ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
      <span className="absolute inset-0 bg-[#00F5A0] translate-x-full group-hover:translate-x-0 transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]" />
    </button>
  );

  return (
    <div className="relative inline-flex p-[3px] rounded-full" style={{
      background: `conic-gradient(from var(--border-angle, 0deg), #00F5A0, #060218, #00F5A0, #060218, #00F5A0)`,
      animation: 'rotate-border 3s linear infinite',
    }}>
      {href ? (
        <a href={href} className="no-underline">
          {buttonContent}
        </a>
      ) : (
        buttonContent
      )}
    </div>
  );
}
