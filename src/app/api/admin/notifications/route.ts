import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-api";

export async function GET(req: Request) {
  const session = await requireAdmin(req);
  if (!session.user || !session.tenantId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const list = await prisma.adminNotification.findMany({
    where: { restaurantId: session.tenantId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const unread = await prisma.adminNotification.count({
    where: { restaurantId: session.tenantId, read: false },
  });

  return NextResponse.json({ list, unread });
}
