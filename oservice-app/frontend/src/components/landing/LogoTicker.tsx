'use client';

const logos = [
  { name: 'Café Glacier', color: '#00F5A0' },
  { name: 'Boutique Trendy', color: '#60A5FA' },
  { name: 'Restaurant Le Safir', color: '#F97316' },
  { name: 'Tech Solutions DZ', color: '#A78BFA' },
  { name: 'Pharmacie Centrale', color: '#FF6B9D' },
];

export default function LogoTicker() {
  return (
    <div className="relative w-full overflow-hidden py-8">
      {/* Fade masks */}
      <div
        className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, #000000, transparent)',
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to left, #000000, transparent)',
        }}
      />

      {/* Scrolling logos */}
      <div className="flex items-center gap-16 animate-scroll">
        {[...logos, ...logos, ...logos, ...logos].map((logo, i) => (
          <div
            key={i}
            className="flex items-center gap-3 shrink-0"
            style={{ width: 137, height: 40 }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${logo.color}20` }}
            >
              <span
                className="text-sm font-bold"
                style={{ color: logo.color }}
              >
                {logo.name.charAt(0)}
              </span>
            </div>
            <span className="text-white/40 text-sm font-medium whitespace-nowrap">
              {logo.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
