'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import AnimatedCounter from './AnimatedCounter';
import Typewriter from './Typewriter';

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      id="stats"
      className="bg-black text-white py-8 md:py-24 px-6 md:px-12 lg:px-[120px] w-full border-t border-white/10 overflow-hidden"
    >
      <div className="w-full max-w-[1440px] mx-auto">
        <div
          ref={ref}
          className="flex flex-col lg:flex-row gap-16 lg:gap-[160px] items-stretch"
        >
          {/* Left Column */}
          <motion.div
            className="flex-1 flex flex-col justify-start"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.06 },
              },
            }}
          >
            {/* Heading */}
            <h2 className="text-[clamp(1.5rem,4vw,3.5rem)] font-medium tracking-tight mb-6 leading-[1.1] w-[590px] max-w-full">
              <Typewriter text="Connectons les" delay={0} speed={0.012} />
              <br />
              <Typewriter text="talents aux " delay={0.25} speed={0.012} />
              <span className="font-dm-serif italic font-normal">
                <Typewriter text="opportunités" delay={0.35} speed={0.012} />
              </span>
            </h2>

            {/* Subtitle */}
            <p className="text-base md:text-lg text-white/40 leading-relaxed font-light max-w-lg whitespace-normal mb-16">
              <Typewriter
                text="Depuis plus d'une décennie, les opérations les plus exigeantes de la région comptent sur notre plateforme pour connecter rapidement les travailleurs qualifiés aux meilleures opportunités."
                delay={0.1}
                speed={0.012}
              />
            </p>

            {/* Stats Grid */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-[max-content_max-content] gap-8 md:gap-x-16 lg:gap-x-24"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.06,
                    delayChildren: 0.1,
                  },
                },
              }}
            >
              <StatItem number={<AnimatedCounter value={2500} suffix="+" />} label="Emplois publiés" />
              <StatItem number={<AnimatedCounter value={98} suffix="%" />} label="Taux de satisfaction" />
              <StatItem number={<AnimatedCounter value={1500} suffix="+" />} label="Travailleurs actifs" />
              <StatItem number={<AnimatedCounter value={48} suffix="h" />} label="Délai moyen d'embauche" />
              <StatItem number={<AnimatedCounter value={500} suffix="+" />} label="Recruteurs vérifiés" />
            </motion.div>
          </motion.div>

          {/* Right Column - Logo-Masked Video */}
          <div className="flex justify-center lg:justify-end items-center shrink-0 lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1.2 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, delay: 0, ease: 'easeOut' }}
              className="w-full max-w-[500px] lg:max-w-none lg:w-[120%] aspect-square origin-center"
              style={{
                WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'%3E%3Ccircle cx='120' cy='90' r='48' fill='white'/%3E%3Cpath d='M24 190 C24 130 65 110 120 110 C175 110 216 130 216 190' fill='white'/%3E%3C/svg%3E")`,
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240'%3E%3Ccircle cx='120' cy='90' r='48' fill='white'/%3E%3Cpath d='M24 190 C24 130 65 110 120 110 C175 110 216 130 216 190' fill='white'/%3E%3C/svg%3E")`,
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
              }}
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                poster="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80"
              >
                <source
                  src="https://app-uploads.krea.ai/wan-videos/7f348c17-c3aa-40c9-9d5b-a2bed9a72c2e.mp4"
                  type="video/mp4"
                />
              </video>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatItem({
  number,
  label,
}: {
  number: React.ReactNode;
  label: string;
}) {
  return (
    <motion.div
      className="flex flex-col"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: 'easeOut' },
        },
      }}
    >
      <div className="text-4xl md:text-5xl lg:text-[56px] font-dm-serif tracking-tight mb-3 text-[#00F5A0]">
        {number}
      </div>
      <div className="text-[10px] md:text-xs font-semibold text-white/40 uppercase tracking-wider">
        {label}
      </div>
    </motion.div>
  );
}
