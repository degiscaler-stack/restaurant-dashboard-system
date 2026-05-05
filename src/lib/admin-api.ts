import { cookies } from "next/headers";
import type { AdminJwtSession } from "./auth";
import { verifyAdminToken } from "./auth";
import { ADMIN_COOKIE } from "./admin-cookie";

export async function getBearerOrCookieToken(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const c = await cookies();
  return c.get(ADMIN_COOKIE)?.value ?? null;
}

export async function requireAdmin(
  req: Request,
): Promise<AdminJwtSession | { user: null; tenantId: null }> {
  const token = await getBearerOrCookieToken(req);
  if (!token) return { user: null, tenantId: null };
  const session = await verifyAdminToken(token);
  if (!session) return { user: null, tenantId: null };
  return session;
}
