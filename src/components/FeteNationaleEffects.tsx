import { useEffect, useState } from 'react'

/**
 * Visual effects for the Fête Nationale (5 Juillet) theme.
 * Renders animated fireworks and floating star-crescent decorations.
 * Only mounts when the event-fete-nationale class is present on the page.
 */
export function FeteNationaleEffects() {
  const [fireworks, setFireworks] = useState<
    { id: number; x: number; y: number; color: string; delay: number }[]
  >([])
  const [stars, setStars] = useState<
    { id: number; x: number; delay: number; duration: number; symbol: string }[]
  >([])

  useEffect(() => {
    // Launch fireworks periodically
    const fwColors = ['#006233', '#D21034', '#ffffff', '#006233', '#D21034']
    let fwId = 0

    function spawnFirework() {
      const x = 10 + Math.random() * 80 // 10%-90% of viewport width
      const y = 10 + Math.random() * 40 // top 50% of viewport
      const color = fwColors[Math.floor(Math.random() * fwColors.length)]
      setFireworks((prev) => {
        const next = [...prev, { id: fwId++, x, y, color, delay: 0 }]
        // Keep max 6 active fireworks
        return next.length > 6 ? next.slice(-6) : next
      })
    }

    // Initial burst
    spawnFirework()
    const t1 = setTimeout(spawnFirework, 600)
    const t2 = setTimeout(spawnFirework, 1200)

    // Periodic fireworks
    const interval = setInterval(spawnFirework, 3500)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    // Floating star and crescent symbols
    const symbols = ['☪', '★', '☪', '✦', '☪']
    let starId = 0

    function spawnStar() {
      const x = 5 + Math.random() * 90
      const duration = 6 + Math.random() * 6
      const symbol = symbols[Math.floor(Math.random() * symbols.length)]
      setStars((prev) => {
        const next = [...prev, { id: starId++, x, delay: 0, duration, symbol }]
        return next.length > 8 ? next.slice(-8) : next
      })
    }

    spawnStar()
    spawnStar()
    const interval = setInterval(spawnStar, 2500)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Fireworks */}
      <div className="fireworks-container">
        {fireworks.map((fw) => (
          <div
            key={fw.id}
            className="firework"
            style={{
              left: `${fw.x}%`,
              top: `${fw.y}%`,
              color: fw.color,
              backgroundColor: fw.color,
              animationDelay: `${fw.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Floating star-crescent decorations */}
      {stars.map((s) => (
        <div
          key={s.id}
          className="star-crescent"
          style={{
            left: `${s.x}%`,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        >
          {s.symbol}
        </div>
      ))}
    </>
  )
}
