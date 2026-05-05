import { NextResponse } from "next/server";
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  type Order,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { getFallbackProductById } from "@/lib/fallback-menu";
import {
  formatOrderApiError,
  orderErrorHttpStatus,
} from "@/lib/order-api-errors";
import { allowIpRateLimit } from "@/lib/rate-limit";
import { resolveRestaurantId } from "@/lib/tenant";
import { z } from "zod";

const bodySchema = z.object({
  productId: z.string().min(1),
  upsellTenPercent: z.boolean().optional(),
});

/** منتج العرض الإضافي — أتاي مغربي بخصم 10٪ */
const UPSELL_SLUG = "atay";

function allowCodEdit(order: Order): boolean {
  return (
    order.paymentMethod === PaymentMethod.COD &&
    order.orderStatus === OrderStatus.PENDING_CONFIRMATION
  );
}

function allowOnlinePaidEdit(order: Order): boolean {
  return (
    order.paymentMethod === PaymentMethod.ONLINE &&
    order.paymentStatus === PaymentStatus.PAID &&
    order.orderStatus === OrderStatus.PAID
  );
}

function clientIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ orderNumber: string }> },
) {
  try {
    const { orderNumber: rawOn } = await ctx.params;
    const orderNumber = decodeURIComponent(rawOn);
    const ip = clientIp(req);
    if (!allowIpRateLimit(`order-append:${ip}:${orderNumber}`, 4000)) {
      return NextResponse.json(
        { error: "يرجى الانتظار قليلاً" },
        { status: 429 },
      );
    }

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "validation", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const { productId, upsellTenPercent } = parsed.data;

    const restaurantId = await resolveRestaurantId();
    if (!restaurantId) {
      return NextResponse.json({ error: "غير مسموح بتعديل هذا الطلب" }, { status: 403 });
    }

    const order = await prisma.order.findFirst({
      where: { restaurantId, orderNumber },
      include: { items: true },
    });

    if (
      !order ||
      !(allowCodEdit(order) || allowOnlinePaidEdit(order))
    ) {
      return NextResponse.json(
        { error: "غير مسموح بتعديل هذا الطلب" },
        { status: 403 },
      );
    }

    const maxAgeMs = 72 * 60 * 60 * 1000;
    if (Date.now() - order.createdAt.getTime() > maxAgeMs) {
      return NextResponse.json(
        { error: "انتهت صلاحية تعديل الطلب" },
        { status: 400 },
      );
    }

    let slug = "";
    let productName = "";
    let unitNum = 0;
    let productIdForDb: string | null = null;

    const dbp = await prisma.product.findFirst({
      where: { id: productId, restaurantId, available: true },
    });

    if (dbp) {
      slug = dbp.slug;
      productName = dbp.name;
      unitNum = Number(dbp.price);
      productIdForDb = dbp.id;
    } else {
      const fb = getFallbackProductById(productId);
      if (!fb?.available) {
        return NextResponse.json(
          { error: "المنتج غير متوفر" },
          { status: 400 },
        );
      }
      slug = fb.slug;
      productName = fb.name;
      unitNum = fb.price;
      productIdForDb = null;
    }

    if (upsellTenPercent) {
      if (slug !== UPSELL_SLUG) {
        return NextResponse.json(
          { error: "عرض غير متاح لهذا المنتج" },
          { status: 400 },
        );
      }
      unitNum = Math.round(unitNum * 0.9 * 100) / 100;
    }

    const quantity = 1;
    const unit = new Prisma.Decimal(unitNum);
    const lineTotal = unit.mul(quantity);

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: productIdForDb,
        productName,
        quantity,
        unitPrice: unit,
        totalPrice: lineTotal,
      },
    });

    const items = await prisma.orderItem.findMany({
      where: { orderId: order.id },
    });
    let subtotal = new Prisma.Decimal(0);
    for (const it of items) {
      subtotal = subtotal.add(it.totalPrice);
    }
    const deliveryFee = order.deliveryFee;
    const total = subtotal.add(deliveryFee);

    await prisma.order.update({
      where: { id: order.id },
      data: { subtotal, total },
    });

    return NextResponse.json({
      ok: true,
      total: Number(total),
      subtotal: Number(subtotal),
    });
  } catch (e) {
    console.error("[api/orders/orderNumber/items]", e);
    const msg = formatOrderApiError(e);
    const status = orderErrorHttpStatus();
    return NextResponse.json({ error: msg }, { status });
  }
}
