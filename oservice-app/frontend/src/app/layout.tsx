import type { Metadata, Viewport } from 'next';
import './globals.css';
import ClientProviders from './ClientProviders';

export const metadata: Metadata = {
  title: 'OSERVICE - Plateforme d\'emplois en Algérie',
  description: 'Trouvez ou publiez des emplois partiels en Algérie. Plateforme mobile-first pour travailleurs et recruteurs.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'OSERVICE',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0B0F19',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" dir="ltr" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Instrument+Serif:ital@0;1&family=Urbanist:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-midnight text-ice antialiased">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
