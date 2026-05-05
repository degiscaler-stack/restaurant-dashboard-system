import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { User } from "@prisma/client";
import { UserRole } from "@prisma/client";
import { prisma } from "./db";
import { ADMIN_COOKIE } from "./admin-cookie";

function getSecret() {
  const s = process.env.JWT_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET is required in production");
    }
    return new TextEncoder().encode("dev-only-secret-change-me");
  }
  return new TextEncoder().encode(s);
}

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export async function signAdminToken(
  userId: string,
  tenantId: string,
  role: UserRole,
) {
  return new SignJWT({
    sub: userId,
    role,
    rid: tenantId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export type AdminJwtSession = {
  user: User;
  tenantId: string;
};

export async function verifyAdminToken(
  token: string,
): Promise<AdminJwtSession | null> {
  let payload: Record<string, unknown>;
  try {
    ({ payload } = await jwtVerify(token, getSecret()));
  } catch {
    return null;
  }
  const sub = payload.sub as string | undefined;
  const rid = payload.rid as string | undefined;
  const role = payload.role as UserRole | undefined;
  if (!sub || !rid || !role) return null;

  const user = await prisma.user.findUnique({ where: { id: sub } });
  if (!user || user.role !== role) return null;

  if (user.role !== UserRole.SUPER_ADMIN) {
    if (!user.restaurantId || user.restaurantId !== rid) return null;
  }

  return { user, tenantId: rid };
}

export async function getAdminSessionFromCookies(): Promise<AdminJwtSession | null> {
  const c = await cookies();
  const token = c.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

/** @deprecated use getAdminSessionFromCookies */
export async function getAdminFromCookies() {
  const s = await getAdminSessionFromCookies();
  return s?.user ?? null;
}
