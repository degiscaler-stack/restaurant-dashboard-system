import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-api";

export async function GET(req: Request) {
  const session = await requireAdmin(req);
  if (!session.user || !session.tenantId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { restaurantId: session.tenantId },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { items: true },
  });

  return NextResponse.json(
    orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      phone: o.phone,
      whatsapp: o.whatsapp,
      total: Number(o.total),
      paymentMethod: o.paymentMethod,
      orderStatus: o.orderStatus,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt,
      itemCount: o.items.length,
    })),
  );
}
