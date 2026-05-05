import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { signAdminToken, verifyPassword } from "@/lib/auth";
import { ADMIN_COOKIE, adminCookieOptions } from "@/lib/admin-cookie";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  /** لمستخدمي SUPER_ADMIN: أي مطعم يُدار في هذه الجلسة */
  restaurantSlug: z.string().min(1).optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "validation" }, { status: 400 });
    }

    const email = parsed.data.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (
      !user ||
      !(await verifyPassword(parsed.data.password, user.passwordHash))
    ) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }

    let tenantId: string;
    let restaurantSlugOut: string;

    if (user.role === UserRole.SUPER_ADMIN) {
      let slug: string;
      if (parsed.data.restaurantSlug?.trim()) {
        slug = parsed.data.restaurantSlug.trim().toLowerCase();
      } else {
        const first = await prisma.restaurant.findFirst({
          orderBy: { createdAt: "asc" },
          select: { slug: true },
        });
        if (!first) {
          return NextResponse.json(
            { error: "restaurant_not_found" },
            { status: 503 },
          );
        }
        slug = first.slug;
      }
      const restaurant = await prisma.restaurant.findUnique({
        where: { slug },
      });
      if (!restaurant) {
        return NextResponse.json(
          { error: "restaurant_not_found" },
          { status: 503 },
        );
      }
      tenantId = restaurant.id;
      restaurantSlugOut = restaurant.slug;
    } else {
      if (!user.restaurantId) {
        return NextResponse.json({ error: "invalid_account" }, { status: 403 });
      }
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: user.restaurantId },
        select: { id: true, slug: true },
      });
      if (!restaurant) {
        return NextResponse.json(
          { error: "restaurant_not_found" },
          { status: 503 },
        );
      }
      tenantId = restaurant.id;
      restaurantSlugOut = restaurant.slug;
    }

    const token = await signAdminToken(user.id, tenantId, user.role);
    const res = NextResponse.json({
      ok: true,
      name: user.name,
      email: user.email,
      role: user.role,
      restaurantSlug: restaurantSlugOut,
    });
    res.cookies.set(ADMIN_COOKIE, token, adminCookieOptions);
    return res;
  } catch (e) {
    console.error("[POST /api/admin/login]", e);
    return NextResponse.json({ error: "server_error" }, { status: 503 });
  }
}
