import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  formatOrderApiError,
  orderErrorHttpStatus,
} from "@/lib/order-api-errors";
import { paypalCreateOrder } from "@/lib/paypal";
import { resolveRestaurantId } from "@/lib/tenant";

const bodySchema = z.object({
  orderNumber: z.string().min(4),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "validation" }, { status: 400 });
    }

    const restaurantId = await resolveRestaurantId();
    if (!restaurantId) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const settings = await prisma.restaurantSettings.findUnique({
      where: { restaurantId },
    });
    if (!settings?.paypalEnabled) {
      return NextResponse.json({ error: "paypal_disabled" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { restaurantId, orderNumber: parsed.data.orderNumber },
    });
    if (!order || order.paymentMethod !== "ONLINE") {
      return NextResponse.json({ error: "order_not_found" }, { status: 404 });
    }
    if (order.orderStatus !== "PENDING_PAYMENT") {
      return NextResponse.json({ error: "invalid_order_state" }, { status: 400 });
    }

    const amount = Number(order.total).toFixed(2);
    const { paypalOrderId, approvalUrl, raw } = await paypalCreateOrder({
      orderNumber: order.orderNumber,
      amountMad: amount,
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: "PAYPAL",
        providerPaymentId: paypalOrderId,
        amount: order.total,
        currency: "MAD",
        status: "CREATED",
        rawResponse: raw.slice(0, 8000),
      },
    });

    return NextResponse.json({ approvalUrl, paypalOrderId, orderNumber: order.orderNumber });
  } catch (e) {
    console.error("[api/payments/paypal/create-order]", e);
    const msg = formatOrderApiError(e);
    const status = orderErrorHttpStatus();
    return NextResponse.json({ error: msg }, { status });
  }
}
