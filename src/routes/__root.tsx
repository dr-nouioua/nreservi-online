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
  // Generic error screen: raw errors (which can contain SQL fragments) are
  // never shown to visitors — they only go to the server logs.
  errorComponent: ({ error }) => {
    console.error("[app error]", error);
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
        <div className="max-w-md rounded-xl border border-stone-800 bg-stone-900 p-8 text-center">
          <p className="text-4xl">😔</p>
          <h1 className="mt-4 text-xl font-bold text-stone-100">Une erreur est survenue</h1>
          <p className="mt-3 text-sm text-stone-400">
            Une erreur inattendue s'est produite. Rechargez la page ou réessayez dans un instant.
          </p>
          <a
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-stone-100 px-4 py-2 text-sm font-medium text-stone-900 hover:bg-white"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  },
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark" style={{ colorScheme: 'dark' }}>
      <head>
        <HeadContent />
      </head>
      <body className="bg-stone-950 text-stone-100 antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
