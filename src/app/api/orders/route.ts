import { NextResponse } from "next/server";
import {
  OrderStatus,
  OrderTiming,
  OrderType,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  DeliveryBand,
} from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { resolveRestaurant } from "@/lib/tenant";
import {
  customerFullNameSchema,
  moroccoMobileSchema,
  normalizeMoroccoPhone,
} from "@/lib/validation";
import { deliveryFeeFromBand } from "@/lib/delivery";
import { generateOrderNumber } from "@/lib/order-number";
import { allowIpRateLimit } from "@/lib/rate-limit";
import { notifyRestaurantAboutOrder } from "@/lib/notify-restaurant";
import { getFallbackProductById } from "@/lib/fallback-menu";

const COD_ADDRESS = "سيتم تأكيد العنوان عبر الهاتف";

function paypalEnvConfigured() {
  return Boolean(
    process.env.PAYPAL_CLIENT_ID?.trim() &&
      process.env.PAYPAL_CLIENT_SECRET?.trim(),
  );
}

const bodySchema = z
  .object({
    name: customerFullNameSchema,
    phone: moroccoMobileSchema,
    whatsapp: moroccoMobileSchema,
    paymentMethod: z.nativeEnum(PaymentMethod),
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          quantity: z.number().int().min(1).max(99),
        }),
      )
      .min(1),
    orderType: z.nativeEnum(OrderType),
    deliveryBand: z.nativeEnum(DeliveryBand).optional(),
    address: z.string().optional(),
    mapsLink: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.orderType === OrderType.DELIVERY && !data.deliveryBand) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "يرجى اختيار منطقة التوصيل",
        path: ["deliveryBand"],
      });
    }
    if (data.paymentMethod === PaymentMethod.ONLINE) {
      const addr = (data.address ?? "").trim();
      if (addr.length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "العنوان الكامل مطلوب (المدينة، الحي، والشارع)",
          path: ["address"],
        });
      }
    }
  });

function clientIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    if (!allowIpRateLimit(`checkout:${ip}`, 12_000)) {
      return NextResponse.json(
        {
          ok: false,
          error: "rate_limited",
          message: "طلبات كثيرة من هذا العنوان. انتظر قليلاً ثم أعد المحاولة.",
        },
        { status: 429 },
      );
    }

    const tenant = await resolveRestaurant();
    if (!tenant.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: tenant.code.toLowerCase(),
          message: tenant.message,
          slug: tenant.slug,
        },
        { status: 503 },
      );
    }
    const restaurantId = tenant.restaurantId;

    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "validation",
          message:
            "تعذّر التحقق من البيانات (الاسم الكامل، أرقام الهاتف المغربية، المنتجات، نوع الطلبية، إلخ).",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const settings = await prisma.restaurantSettings.findUnique({
      where: { restaurantId },
    });

    if (data.paymentMethod === PaymentMethod.COD) {
      if (settings && !settings.codEnabled) {
        return NextResponse.json(
          {
            ok: false,
            error: "cod_disabled",
            message:
              "الدفع عند الاستلام غير مفعّل لهذا المطعم في الإعدادات.",
          },
          { status: 400 },
        );
      }
    } else {
      const paypalReady =
        paypalEnvConfigured() &&
        (settings?.paypalEnabled ?? false) &&
        (settings?.onlinePaymentEnabled ?? false);
      if (!paypalReady) {
        return NextResponse.json(
          {
            ok: false,
            error: "online_disabled",
            message:
              "الدفع عبر الإنترنت غير مفعّل أو غير مهيأ (PayPal / إعدادات المطعم).",
          },
          { status: 400 },
        );
      }
    }

    const phone = normalizeMoroccoPhone(data.phone);
    const whatsapp = normalizeMoroccoPhone(data.whatsapp.trim());

    const productIds = [...new Set(data.items.map((i) => i.productId))];
    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        restaurantId,
        available: true,
      },
    });
    const dbById = new Map(dbProducts.map((p) => [p.id, p]));

    const qtyById = new Map<string, number>();
    for (const it of data.items) {
      qtyById.set(it.productId, (qtyById.get(it.productId) ?? 0) + it.quantity);
    }

    let subtotal = new Prisma.Decimal(0);
    const lineInputs: {
      productId: string | null;
      productName: string;
      quantity: number;
      unitPrice: Prisma.Decimal;
      totalPrice: Prisma.Decimal;
    }[] = [];

    for (const pid of productIds) {
      const q = qtyById.get(pid) ?? 0;
      if (q <= 0) continue;

      const dbp = dbById.get(pid);
      let unit: Prisma.Decimal;
      let productName: string;
      let productIdForLine: string | null;

      if (dbp) {
        unit = new Prisma.Decimal(dbp.price.toString());
        productName = dbp.name;
        productIdForLine = dbp.id;
      } else {
        const fb = getFallbackProductById(pid);
        if (!fb?.available) {
          return NextResponse.json(
            {
              ok: false,
              error: "invalid_product",
              message: "أحد المنتجات غير متوفر أو غير معروف. حدّث الصفحة وحاول من جديد.",
            },
            { status: 400 },
          );
        }
        unit = new Prisma.Decimal(fb.price);
        productName = fb.name;
        productIdForLine = null;
      }

      const lineTotal = unit.mul(q);
      subtotal = subtotal.add(lineTotal);
      lineInputs.push({
        productId: productIdForLine,
        productName,
        quantity: q,
        unitPrice: unit,
        totalPrice: lineTotal,
      });
    }

    if (lineInputs.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "empty_cart",
          message: "السلة فارغة أو المنتجات غير صالحة.",
        },
        { status: 400 },
      );
    }

    const deliveryFeeValue =
      data.orderType === OrderType.DELIVERY
        ? deliveryFeeFromBand(data.deliveryBand ?? undefined)
        : 0;
    const deliveryFee = new Prisma.Decimal(deliveryFeeValue);
    const total = subtotal.add(deliveryFee);

    const orderNumber = await generateOrderNumber(restaurantId);

    const address =
      data.paymentMethod === PaymentMethod.ONLINE
        ? (data.address ?? "").trim()
        : COD_ADDRESS;

    const order = await prisma.order.create({
      data: {
        restaurantId,
        orderNumber,
        customerName: data.name.trim(),
        phone,
        whatsapp,
        city: "—",
        area: "—",
        address,
        mapsLink: data.mapsLink?.trim() || null,
        orderType: data.orderType,
        deliveryBand:
          data.orderType === OrderType.DELIVERY ? data.deliveryBand! : null,
        orderTiming: OrderTiming.NOW,
        scheduledAt: null,
        deliveryFee,
        subtotal,
        total,
        paymentMethod: data.paymentMethod,
        paymentStatus: PaymentStatus.UNPAID,
        orderStatus:
          data.paymentMethod === PaymentMethod.ONLINE
            ? OrderStatus.PENDING_PAYMENT
            : OrderStatus.PENDING_CONFIRMATION,
        notes: null,
        items: {
          create: lineInputs.map((l) => ({
            productId: l.productId,
            productName: l.productName,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            totalPrice: l.totalPrice,
          })),
        },
      },
    });

    if (data.paymentMethod === PaymentMethod.COD) {
      try {
        const fullOrder = await prisma.order.findFirst({
          where: { id: order.id },
          include: { items: true },
        });
        if (fullOrder) await notifyRestaurantAboutOrder(fullOrder);
      } catch (e) {
        console.error("[POST /api/orders] notify", e);
      }
    }

    return NextResponse.json(
      {
        ok: true,
        orderId: order.orderNumber,
      },
      { status: 201 },
    );
  } catch (e) {
    console.error("[POST /api/orders]", e);
    return NextResponse.json(
      {
        ok: false,
        error: "internal_error",
        message:
          "حدث خطأ أثناء تسجيل الطلب. إذا استمرّ الأمر، تحقّق من قاعدة البيانات أو سجلات الخادم.",
      },
      { status: 500 },
    );
  }
}
