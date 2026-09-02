'use client';

import { useState, useEffect } from 'react';

interface TypewriterHeadingProps {
  text: string;
  darkChars?: number;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
}

export default function TypewriterHeading({
  text,
  darkChars = 0,
  speed = 35,
  delay = 400,
  className = '',
  onComplete,
}: TypewriterHeadingProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setIsTyping(true);
      let currentIndex = 0;

      const typeInterval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
          setTimeout(() => setShowCursor(false), 500);
          onComplete?.();
        }
      }, speed);

      return () => clearInterval(typeInterval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, speed, delay, onComplete]);

  return (
    <h1 className={`font-urbanist font-semibold tracking-tight leading-[1] ${className}`}>
      <span style={{ color: '#000000' }}>
        {displayedText.slice(0, darkChars)}
      </span>
      <span style={{ color: '#ffffff' }}>
        {displayedText.slice(darkChars)}
      </span>
      {showCursor && (
        <span
          className="inline-block w-[3px] h-[0.8em] ml-1 align-middle"
          style={{
            backgroundColor: '#00F5A0',
            animation: 'blink 0.8s step-end infinite',
          }}
        />
      )}
    </h1>
  );
}
