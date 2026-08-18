import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'nreservi.online — Réservez en ligne' },
      {
        name: 'description',
        content:
          'nreservi.online, la plateforme de réservation en ligne pour tous vos établissements : disponibilités en temps réel et confirmation par WhatsApp.',
      },
      { name: 'theme-color', content: '#0c0a09' },
      { property: 'og:site_name', content: 'nreservi.online' },
      { property: 'og:title', content: 'nreservi.online — Réservez en ligne' },
      { property: 'og:image', content: '/brand/nreservi-icon.png' },
    ],
    links: [
      { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
      { rel: 'icon', type: 'image/png', href: '/favicon-32.png', sizes: '32x32' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body className="bg-stone-50 text-stone-900">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
