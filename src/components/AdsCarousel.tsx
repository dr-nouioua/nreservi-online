import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { AdCard, type Ad } from "./AdCard"

/**
 * Two-slot advertising carousel: one brand ad (admin) + one restaurant promo.
 * Auto-rotates every 5s with a smooth slide, pauses on hover/touch, supports
 * swipe gestures and dot navigation.
 */
export function AdsCarousel({ ads, className = "" }: { ads: Ad[]; className?: string }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchX = useRef<number | null>(null)
  const count = ads.length

  useEffect(() => {
    if (count < 2 || paused) return
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 5000)
    return () => clearInterval(t)
  }, [count, paused])

  if (count === 0) return null
  if (count === 1) return <AdCard ad={ads[0]} className={className} />

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-stone-200 shadow-sm dark:border-stone-800 ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { setPaused(true); touchX.current = e.touches[0].clientX }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return
        const delta = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(delta) > 40) setIndex((i) => Math.min(count - 1, Math.max(0, i + (delta < 0 ? 1 : -1))))
        touchX.current = null
        setPaused(false)
      }}
    >
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {ads.map((ad) => (
          <div key={ad.id} className="w-full shrink-0">
            <AdCard ad={ad} className="rounded-none border-0" />
          </div>
        ))}
      </div>

      {index > 0 && (
        <button
          onClick={() => setIndex((i) => i - 1)}
          aria-label="Publicité précédente"
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-1.5 text-stone-700 shadow hover:bg-white dark:bg-stone-900/85 dark:text-stone-200"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      {index < count - 1 && (
        <button
          onClick={() => setIndex((i) => i + 1)}
          aria-label="Publicité suivante"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-1.5 text-stone-700 shadow hover:bg-white dark:bg-stone-900/85 dark:text-stone-200"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1.5">
        {ads.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Publicité ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${i === index ? "w-5 bg-lime-400" : "w-2 bg-white/70"}`}
          />
        ))}
      </div>
    </div>
  )
}
