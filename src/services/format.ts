// Centralized formatting for the Algerian market (fr-DZ).
// Money is stored as numeric strings in Postgres; format only for display.

export function formatPriceDA(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "0 DA";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return `${value} DA`;
  const formatted = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 })
    .format(n)
    .replace(/[\u202F\u00A0]/g, " ");
  return `${formatted} DA`;
}
