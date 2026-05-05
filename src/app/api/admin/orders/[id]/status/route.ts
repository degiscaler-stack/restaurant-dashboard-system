import { NextResponse } from "next/server";
import { z } from "zod";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-api";

const bodySchema = z.object({
  orderStatus: z.nativeEnum(OrderStatus),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin(req);
  if (!session.user || !session.tenantId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const json = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }

  const existing = await prisma.order.findFirst({
    where: { id, restaurantId: session.tenantId },
  });
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const order = await prisma.order.update({
    where: { id },
    data: { orderStatus: parsed.data.orderStatus },
  });

  return NextResponse.json({ ok: true, orderStatus: order.orderStatus });
}
