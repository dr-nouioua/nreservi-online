// Pure admin-permission logic — shared by layout, pages and server functions.

export const ADMIN_MODULES = [
  { key: "onboard", label: "Créer un établissement" },
  { key: "subscriptions", label: "Abonnements" },
  { key: "emails", label: "E-mails" },
  { key: "ads", label: "Publicités" },
  { key: "mail", label: "Serveur e-mail" },
] as const;

export type AdminModule = (typeof ADMIN_MODULES)[number]["key"];

export type AdminIdentity = {
  adminRole?: string
  permissions?: string[] | null
  analyticsCategories?: string[] | null
}

/** "Dashboard" and "Compte" are always accessible; the rest depends on privileges. */
export function adminHasModule(admin: AdminIdentity, module: string): boolean {
  if (admin.adminRole === "super") return true;
  return (admin.permissions ?? []).includes(module);
}

/** Returns true if the admin can see analytics for the given category. Super admins always can. */
export function adminCanSeeCategory(admin: AdminIdentity, category: string): boolean {
  if (admin.adminRole === "super") return true;
  const allowed = admin.analyticsCategories;
  if (!allowed || allowed.length === 0) return true; // empty = all categories
  return allowed.includes(category);
}

/** Returns the categories visible to this admin (filtered). For super admin, returns all. */
export function filterByCategory<T extends { category?: string }>(admin: AdminIdentity, items: T[]): T[] {
  if (admin.adminRole === "super") return items;
  const allowed = admin.analyticsCategories;
  if (!allowed || allowed.length === 0) return items;
  return items.filter((item) => allowed.includes(item.category ?? "restaurant"));
}

export const ALL_MODULE_KEYS = ADMIN_MODULES.map((m) => m.key);

export const ALL_CATEGORIES = ["restaurant", "beauty_salon", "spa", "football_pitch", "car_rental", "barbershop"] as const;
