import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { ensureDatabaseUrl } from "@/lib/ensure-database-url";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  ensureDatabaseUrl();

  const checks = {
    db_host_configured: Boolean(process.env.DB_HOST?.trim()),
    db_port_configured: Boolean(process.env.DB_PORT?.trim()),
    db_user_configured: Boolean(process.env.DB_USER?.trim()),
    db_password_defined: Object.prototype.hasOwnProperty.call(
      process.env,
      "DB_PASSWORD",
    ),
    db_name_configured: Boolean(process.env.DB_NAME?.trim()),
    database_url_resolved: Boolean(process.env.DATABASE_URL?.trim()),
    jwt_secret_configured: Boolean(process.env.JWT_SECRET?.trim()),
    database_connected: false,
    required_tables_exist: false,
    admin_user_exists: false,
  };
  const errors: string[] = [];

  if (!checks.database_url_resolved) {
    errors.push(
      "DATABASE_URL غير متوفرة بعد التجميع — عرّف DATABASE_URL أو DB_HOST و DB_USER و DB_NAME (اختياري: DB_PORT، DB_PASSWORD)",
    );
  }
  if (!checks.jwt_secret_configured) {
    errors.push("JWT_SECRET is not set");
  }

  if (checks.database_url_resolved) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database_connected = true;
    } catch (e) {
      errors.push(
        `database connection failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  if (checks.database_connected) {
    try {
      await prisma.$transaction([
        prisma.restaurant.findFirst({ select: { id: true } }),
        prisma.user.findFirst({ select: { id: true } }),
        prisma.category.findFirst({ select: { id: true } }),
        prisma.product.findFirst({ select: { id: true } }),
        prisma.order.findFirst({ select: { id: true } }),
        prisma.orderItem.findFirst({ select: { id: true } }),
        prisma.payment.findFirst({ select: { id: true } }),
        prisma.restaurantSettings.findFirst({ select: { id: true } }),
        prisma.offer.findFirst({ select: { id: true } }),
        prisma.review.findFirst({ select: { id: true } }),
        prisma.adminNotification.findFirst({ select: { id: true } }),
      ]);
      checks.required_tables_exist = true;
    } catch (e) {
      errors.push(
        `required tables check failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  if (checks.required_tables_exist) {
    try {
      const seedEmail = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
      if (seedEmail) {
        const u = await prisma.user.findUnique({
          where: { email: seedEmail },
          select: { id: true },
        });
        checks.admin_user_exists = Boolean(u);
      } else {
        const n = await prisma.user.count({
          where: {
            role: {
              in: [UserRole.RESTAURANT_ADMIN, UserRole.SUPER_ADMIN],
            },
          },
        });
        checks.admin_user_exists = n > 0;
      }
      if (!checks.admin_user_exists) {
        errors.push(
          seedEmail
            ? `no admin user with email matching ADMIN_SEED_EMAIL`
            : "no RESTAURANT_ADMIN or SUPER_ADMIN user in database",
        );
      }
    } catch (e) {
      errors.push(
        `admin user check failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  const ok =
    checks.jwt_secret_configured &&
    checks.database_url_resolved &&
    checks.database_connected &&
    checks.required_tables_exist &&
    checks.admin_user_exists;

  return NextResponse.json(
    {
      ok,
      checks,
      ...(errors.length ? { errors } : {}),
    },
    { status: ok ? 200 : 503 },
  );
}
