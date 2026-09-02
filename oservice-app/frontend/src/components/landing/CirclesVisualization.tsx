'use client';

import { useEffect, useRef, useState } from 'react';

function useCountUp(target: number, delay: number = 1200) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [started, target]);

  return count;
}

const orbits = [
  { diameter: 353, speed: 30, direction: 'left' as const },
  { diameter: 501, speed: 40, direction: 'right' as const },
  { diameter: 649, speed: 50, direction: 'right' as const },
  { diameter: 797, speed: 60, direction: 'left' as const },
];

const avatars = [
  { orbit: 0, angle: 270, size: 58, shape: 'square' as const, glow: '#00F5A0', delay: 0.6, url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face' },
  { orbit: 1, angle: 60, size: 58, shape: 'round' as const, glow: '#FFD700', delay: 0.9, url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face' },
  { orbit: 1, angle: 180, size: 78, shape: 'round' as const, glow: '#FF6B9D', delay: 1.2, url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face' },
  { orbit: 1, angle: 300, size: 58, shape: 'square' as const, glow: '#60A5FA', delay: 1.5, url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face' },
  { orbit: 2, angle: 130, size: 88, shape: 'round' as const, glow: '#FF6B9D', delay: 1.8, url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face' },
  { orbit: 3, angle: 30, size: 58, shape: 'round' as const, glow: '#00F5A0', delay: 2.0, url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face' },
  { orbit: 3, angle: 95, size: 88, shape: 'square' as const, glow: '#F97316', delay: 2.1, url: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=120&h=120&fit=crop&crop=face' },
  { orbit: 3, angle: 220, size: 88, shape: 'square' as const, glow: '#FF6B9D', delay: 2.2, url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=face' },
  { orbit: 3, angle: 320, size: 58, shape: 'round' as const, glow: '#00F5A0', delay: 2.3, url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face' },
];

export default function CirclesVisualization() {
  const count = useCountUp(20, 1200);

  return (
    <div className="relative w-[720px] h-[720px]">
      {/* Orbits */}
      {orbits.map((orbit, i) => (
        <div
          key={i}
          className="absolute top-1/2 left-1/2 rounded-full"
          style={{
            width: orbit.diameter,
            height: orbit.diameter,
            transform: 'translate(-50%, -50%)',
            animation: `spin-${orbit.direction} ${orbit.speed}s linear infinite`,
          }}
        >
          {/* Border using mask */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(180deg, rgba(0, 245, 160, 0) 0%, rgba(0, 245, 160, 0.3) 43%, rgba(0, 245, 160, 0) 100%)',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
              WebkitMaskComposite: 'xor',
              padding: '1px',
            }}
          />
        </div>
      ))}

      {/* Center content */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
        <div className="font-urbanist text-[64px] font-medium text-white tracking-tight">
          {count}k+
        </div>
        <div className="font-urbanist text-[16px] font-semibold text-white/60 uppercase tracking-wider">
          Spécialistes
        </div>
      </div>

      {/* Avatars */}
      {avatars.map((avatar, i) => {
        const orbit = orbits[avatar.orbit];
        const radius = orbit.diameter / 2;

        return (
          <div
            key={i}
            className="absolute top-1/2 left-1/2"
            style={{
              transform: `translate(-50%, -50%) rotate(${avatar.angle}deg) translate(${radius}px) rotate(-${avatar.angle}deg)`,
              animation: `fly-in 0.6s ease-out ${avatar.delay}s both`,
            }}
          >
            <div
              className={`overflow-hidden ${
                avatar.shape === 'square' ? 'rounded-[20px]' : 'rounded-full'
              }`}
              style={{
                width: avatar.size,
                height: avatar.size,
                boxShadow: `0 0 20px ${avatar.glow}40`,
              }}
            >
              <img
                src={avatar.url}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
