import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { paypalCaptureOrder } from "@/lib/paypal";
import {
  formatOrderApiError,
  orderErrorHttpStatus,
} from "@/lib/order-api-errors";
import { notifyRestaurantAboutOrder } from "@/lib/notify-restaurant";

const bodySchema = z.object({
  paypalOrderId: z.string().min(4),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "validation" }, { status: 400 });
    }

    const paypalOrderId = parsed.data.paypalOrderId;
    const { ok, data, raw } = await paypalCaptureOrder(paypalOrderId);

    const payment = await prisma.payment.findFirst({
      where: { providerPaymentId: paypalOrderId, provider: "PAYPAL" },
      orderBy: { createdAt: "desc" },
      include: { order: { include: { items: true } } },
    });

    if (!payment?.order) {
      return NextResponse.json({ error: "payment_not_linked" }, { status: 404 });
    }

    const order = payment.order;

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: ok ? "COMPLETED" : "FAILED",
        rawResponse: raw.slice(0, 12000),
      },
    });

    if (!ok) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          orderStatus: "PAYMENT_FAILED",
          paymentStatus: "FAILED",
        },
      });
      return NextResponse.json(
        { ok: false, orderNumber: order.orderNumber },
        { status: 402 },
      );
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        orderStatus: "PAID",
        paymentStatus: "PAID",
      },
      include: { items: true },
    });

    try {
      await notifyRestaurantAboutOrder(updated);
    } catch (e) {
      console.error("[paypal/capture] notify", e);
    }

    return NextResponse.json({
      ok: true,
      orderNumber: updated.orderNumber,
      data,
    });
  } catch (e) {
    console.error("[paypal/capture]", e);
    const msg = formatOrderApiError(e);
    const status = orderErrorHttpStatus();
    return NextResponse.json({ error: msg }, { status });
  }
}
