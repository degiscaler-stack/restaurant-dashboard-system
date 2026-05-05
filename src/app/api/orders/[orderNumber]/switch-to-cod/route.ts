import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { resolveRestaurantId } from "@/lib/tenant";
import { z } from "zod";

const COD_PLACEHOLDER = "سيتم تأكيد العنوان عبر الهاتف";

const bodySchema = z.object({
  phone: z.string().min(8),
});

export async function POST(
  req: Request,
  ctx: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await ctx.params;
  const decoded = decodeURIComponent(orderNumber);
  const json = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }

  const digits = parsed.data.phone.replace(/\D/g, "");
  const restaurantId = await resolveRestaurantId();
  if (!restaurantId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const order = await prisma.order.findFirst({
    where: { restaurantId, orderNumber: decoded },
    include: { items: true },
  });
  if (!order) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const phoneDigits = order.phone.replace(/\D/g, "");
  if (digits !== phoneDigits) {
    return NextResponse.json({ error: "phone_mismatch" }, { status: 403 });
  }

  if (
    order.orderStatus !== "PAYMENT_FAILED" &&
    order.orderStatus !== "PENDING_PAYMENT"
  ) {
    return NextResponse.json({ error: "invalid_state" }, { status: 400 });
  }

  try {
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentMethod: "COD",
        paymentStatus: "UNPAID",
        orderStatus: "PENDING_CONFIRMATION",
        city: "—",
        area: "—",
        address: COD_PLACEHOLDER,
        mapsLink: null,
      },
      include: { items: true },
    });

    return NextResponse.json({
      ok: true,
      orderNumber: updated.orderNumber,
      orderStatus: updated.orderStatus,
    });
  } catch (e) {
    console.error("[switch-to-cod]", e);
    return NextResponse.json(
      { error: "تعذر تسجيل الطلب، حاول مرة أخرى." },
      { status: 500 },
    );
  }
}
