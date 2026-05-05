import { prisma } from "./db";

export type ResolveRestaurantResult =
  | { ok: true; restaurantId: string; slug: string }
  | {
      ok: false;
      code: "RESTAURANT_NOT_FOUND" | "DATABASE_UNAVAILABLE";
      slug: string;
      message: string;
    };

/**
 * يحدّد المطعم الافتراضي (أقدم سجل) — مناسب لاستضافة Hostinger ذات المستأجر الواحد.
 */
export async function resolveRestaurant(): Promise<ResolveRestaurantResult> {
  try {
    const restaurant = await prisma.restaurant.findFirst({
      orderBy: { createdAt: "asc" },
      select: { id: true, slug: true },
    });
    if (restaurant) {
      return {
        ok: true,
        restaurantId: restaurant.id,
        slug: restaurant.slug,
      };
    }
    return {
      ok: false,
      code: "RESTAURANT_NOT_FOUND",
      slug: "",
      message:
        "لا يوجد مطعم في قاعدة البيانات. بعد prisma migrate deploy شغّل npm run db:seed أو npm run admin:ensure مع ADMIN_SEED_EMAIL و ADMIN_SEED_PASSWORD.",
    };
  } catch (e) {
    console.error("[resolveRestaurant]", e);
    return {
      ok: false,
      code: "DATABASE_UNAVAILABLE",
      slug: "",
      message:
        "تعذّر الاتصال بقاعدة البيانات. تحقّق من DATABASE_URL في بيئة التشغيل.",
    };
  }
}

/**
 * @returns معرّف المطعم أو null — للمسارات اللي ما كتحتاجش رسالة تفصيلية.
 */
export async function resolveRestaurantId(): Promise<string | null> {
  const r = await resolveRestaurant();
  return r.ok ? r.restaurantId : null;
}
