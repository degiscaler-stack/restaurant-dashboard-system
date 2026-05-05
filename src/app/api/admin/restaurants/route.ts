import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-api";

/** قائمة المطاعم — SUPER_ADMIN فقط (اختيار مستأجر عند الدخول) */
export async function GET(req: Request) {
  const session = await requireAdmin(req);
  if (!session.user || !session.tenantId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (session.user.role !== UserRole.SUPER_ADMIN) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const rows = await prisma.restaurant.findMany({
    orderBy: { slug: "asc" },
    select: { id: true, slug: true, name: true },
  });
  return NextResponse.json(rows);
}
