// Isomorphic theme helpers — dark mode only.

export type Theme = "dark";

export const THEME_STORAGE_KEY = "nreservi-theme";
export const DARK_CLASS = "dark";

export function getStoredTheme(): Theme {
  return "dark";
}

export function applyTheme(_theme: Theme = "dark") {
  if (typeof document === "undefined") return;
  document.documentElement.classList.add(DARK_CLASS);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", "#0c0a09");
}

export function setTheme(_theme: Theme = "dark") {
  applyTheme("dark");
}
