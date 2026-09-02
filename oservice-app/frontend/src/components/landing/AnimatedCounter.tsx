'use client';

import { useRef } from 'react';
import { useInView, animate } from 'motion/react';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}

export default function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  if (inView && ref.current) {
    animate(0, value, {
      duration: 1.5,
      ease: 'easeOut',
      onUpdate(val) {
        if (ref.current) {
          ref.current.textContent = prefix + val.toFixed(decimals) + suffix;
        }
      },
    });
  }

  return (
    <span ref={ref}>
      {prefix}0{suffix}
    </span>
  );
}
