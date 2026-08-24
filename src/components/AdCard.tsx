import { ExternalLink } from "lucide-react"

export type Ad = {
  id: number
  title: string
  body: string | null
  imageUrl: string | null
  linkUrl: string | null
  ctaLabel: string | null
  durationSeconds?: number | null
}

// Inline promotional card rendered inside restaurant pages.
export function AdCard({ ad, className = "" }: { ad: Ad; className?: string }) {
  const Wrapper = (ad.linkUrl ? "a" : "div") as "a"

  return (
    <Wrapper
      {...(ad.linkUrl ? { href: ad.linkUrl, target: "_blank", rel: "nofollow sponsored noopener" } : {})}
      className={`group relative block overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition hover:shadow-md dark:border-stone-800 dark:bg-stone-900 ${className}`}
    >
      {ad.imageUrl && (
        <img src={ad.imageUrl} alt="" loading="lazy" decoding="async" className="h-40 w-full object-cover sm:h-48" />
      )}
      <span className="flex items-start justify-between gap-3 p-3">
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-stone-900 dark:text-stone-100">{ad.title}</span>
          {ad.body && <span className="mt-0.5 block text-xs text-stone-500 dark:text-stone-400">{ad.body}</span>}
        </span>
        {ad.linkUrl && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-lime-300 px-3 py-1.5 text-xs font-medium text-stone-950 transition group-hover:bg-lime-400">
            {ad.ctaLabel || "Découvrir"} <ExternalLink className="h-3 w-3" />
          </span>
        )}
      </span>
    </Wrapper>
  )
}
