// Event UI themes — pure data, safe for client and server.

export type EventThemeKey = "" | "revolution" | "newyear" | "xmas" | "valentine" | "fete_nationale" | "halloween"

export const EVENT_THEMES: Record<
  Exclude<EventThemeKey, "">,
  { label: string; banner: string; emoji: string; gradient: string; cta: string; ctaHover: string; pill: string }
> = {
  revolution: {
    label: "1er Novembre — Révolution",
    banner: "🇩🇿 Joyeux anniversaire de la Révolution — 1er novembre",
    emoji: "🇩🇿",
    gradient: "linear-gradient(90deg, #065f46, #0e7490, #b91c1c)",
    cta: "#0e7a4e",
    ctaHover: "#0a5f3c",
    pill: "#0e7a4e",
  },
  newyear: {
    label: "Nouvel An",
    banner: "🎆 Bonne année de la part de toute l'équipe !",
    emoji: "🎆",
    gradient: "linear-gradient(90deg, #92400e, #b45309, #d4a017)",
    cta: "#b45309",
    ctaHover: "#92400e",
    pill: "#b45309",
  },
  xmas: {
    label: "Noël",
    banner: "🎄 Joyeux Noël et bonnes fêtes !",
    emoji: "🎄",
    gradient: "linear-gradient(90deg, #166534, #b91c1c)",
    cta: "#b91c1c",
    ctaHover: "#991b1b",
    pill: "#b91c1c",
  },
  valentine: {
    label: "Saint-Valentin",
    banner: "❤️ Saint-Valentin — réservez votre table en amoureux",
    emoji: "❤️",
    gradient: "linear-gradient(90deg, #e11d48, #f472b6)",
    cta: "#e11d48",
    ctaHover: "#be123c",
    pill: "#e11d48",
  },
  fete_nationale: {
    label: "Fête Nationale — 5 Juillet",
    banner: "🇩🇿 Joyeux 5 Juillet — Fête Nationale algérienne 🎆",
    emoji: "🇩🇿",
    gradient: "linear-gradient(90deg, #006233, #ffffff, #D21034)",
    cta: "#006233",
    ctaHover: "#004d26",
    pill: "#006233",
  },
  halloween: {
    label: "Halloween",
    banner: "🎃 Joyeux Halloween — Réservez votre table si vous l'osez 👻",
    emoji: "🎃",
    gradient: "linear-gradient(90deg, #7c2d12, #c2410c, #581c87)",
    cta: "#c2410c",
    ctaHover: "#9a3412",
    pill: "#c2410c",
  },
}

export const EVENT_THEME_KEYS = Object.keys(EVENT_THEMES) as EventThemeKey[]

export function eventThemeLabel(key: string): string {
  return EVENT_THEMES[key as Exclude<EventThemeKey, "">]?.label ?? key
}
