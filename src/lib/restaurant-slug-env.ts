/**
 * Single-tenant default slug derived from NEXT_PUBLIC_SITE_URL (Hostinger).
 * Used when creating the first restaurant (seed / ensure-admin).
 */
export function restaurantSlugFromSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    try {
      const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      const hostname = new URL(normalized).hostname.replace(/^www\./i, "");
      const segment = hostname
        .split(".")[0]
        ?.replace(/[^a-z0-9-]/gi, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();
      if (segment && segment.length >= 2) return segment.slice(0, 191);
    } catch {
      /* ignore */
    }
  }
  return "main";
}
