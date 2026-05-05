import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { notifyRestaurantAboutOrder } from "@/lib/notify-restaurant";
import { resolveRestaurantId } from "@/lib/tenant";

const bodySchema = z.object({
  orderNumber: z.string().min(4),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }

  const restaurantId = await resolveRestaurantId();
  if (!restaurantId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const order = await prisma.order.findFirst({
    where: { restaurantId, orderNumber: parsed.data.orderNumber },
    include: { items: true },
  });
  if (!order) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const result = await notifyRestaurantAboutOrder(order);
  return NextResponse.json(result);
}
