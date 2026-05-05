import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { resolveOrderLineImage } from "@/lib/order-line-image";
import { resolveRestaurantId } from "@/lib/tenant";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ orderNumber: string }> },
) {
  try {
    const restaurantId = await resolveRestaurantId();
    if (!restaurantId) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const { orderNumber } = await ctx.params;
    const decoded = decodeURIComponent(orderNumber);
    const order = await prisma.order.findFirst({
      where: { restaurantId, orderNumber: decoded },
      include: {
        items: {
          include: {
            product: { select: { image: true } },
          },
        },
        payments: { orderBy: { createdAt: "desc" }, take: 3 },
      },
    });
    if (!order) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      phone: order.phone,
      whatsapp: order.whatsapp,
      city: order.city,
      area: order.area,
      address: order.address,
      mapsLink: order.mapsLink,
      orderType: order.orderType,
      orderTiming: order.orderTiming,
      scheduledAt: order.scheduledAt,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      total: Number(order.total),
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      notes: order.notes,
      createdAt: order.createdAt,
      items: order.items.map((i) => ({
        name: i.productName,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        totalPrice: Number(i.totalPrice),
        image: resolveOrderLineImage(
          i.productName,
          i.product?.image ?? null,
        ),
      })),
      payments: order.payments.map((p) => ({
        provider: p.provider,
        status: p.status,
        amount: Number(p.amount),
        createdAt: p.createdAt,
      })),
    });
  } catch (e) {
    console.error("[api/orders/orderNumber]", e);
    return NextResponse.json(
      { error: "تعذر تحميل الطلب، حاول لاحقاً." },
      { status: 500 },
    );
  }
}
