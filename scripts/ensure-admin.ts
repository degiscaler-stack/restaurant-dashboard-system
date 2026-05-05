import "dotenv/config";

/**
 * إنشاء حساب أدمن واحد مرتبط بأقدم مطعم (أو إنشاء مطعم جديد) — بدون مسح البيانات.
 * لا يُنشئ المستخدم إن وُجد بالفعل بنفس البريد (لا تحديث لكلمة المرور).
 *
 * المتغيرات المطلوبة:
 * - DATABASE_URL
 * - ADMIN_SEED_EMAIL
 * - ADMIN_SEED_PASSWORD (bcrypt 12 rounds، مطابق لمسار تسجيل الدخول)
 *
 * التشغيل: npm run admin:ensure
 */
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { restaurantSlugFromSiteUrl } from "../src/lib/restaurant-slug-env";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
  if (!email) {
    console.error("ADMIN_SEED_EMAIL is required");
    process.exit(1);
  }
  const password = process.env.ADMIN_SEED_PASSWORD;
  if (!password || password.trim().length === 0) {
    console.error("ADMIN_SEED_PASSWORD is required");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists (${email}), skipping.`);
    return;
  }

  let restaurant = await prisma.restaurant.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!restaurant) {
    const slug = restaurantSlugFromSiteUrl();
    restaurant = await prisma.restaurant.create({
      data: {
        slug,
        name: "Restaurant",
      },
    });
    await prisma.restaurantSettings.create({
      data: {
        restaurantId: restaurant.id,
        restaurantName: "Restaurant",
        phone: "—",
        whatsapp: "—",
        email,
        address: "—",
        openingHours: "—",
        deliveryRules: "—",
      },
    });
    console.log(`Created restaurant slug=${slug}`);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      name: "Restaurant admin",
      passwordHash,
      restaurantId: restaurant.id,
      role: UserRole.RESTAURANT_ADMIN,
    },
  });

  console.log(`Admin created — restaurant slug: ${restaurant.slug}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
