// Pure admin-permission logic — shared by layout, pages and server functions.

export const ADMIN_MODULES = [
  { key: "onboard", label: "Créer un restaurant" },
  { key: "subscriptions", label: "Abonnements" },
  { key: "emails", label: "E-mails" },
  { key: "ads", label: "Publicités" },
  { key: "mail", label: "Serveur e-mail" },
] as const;

export type AdminModule = (typeof ADMIN_MODULES)[number]["key"];

export type AdminIdentity = {
  adminRole?: string
  permissions?: string[] | null
}

/** "Dashboard" and "Compte" are always accessible; the rest depends on privileges. */
export function adminHasModule(admin: AdminIdentity, module: string): boolean {
  if (admin.adminRole === "super") return true;
  return (admin.permissions ?? []).includes(module);
}

export const ALL_MODULE_KEYS = ADMIN_MODULES.map((m) => m.key);
