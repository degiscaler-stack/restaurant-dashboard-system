import "../src/lib/ensure-database-url";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PRODUCT_IMAGES } from "../src/lib/product-image-urls";
import { restaurantSlugFromSiteUrl } from "../src/lib/restaurant-slug-env";

const prisma = new PrismaClient();

/** يطابق ensure-admin و Hostinger — يُشتق من NEXT_PUBLIC_SITE_URL */
const TENANT_SLUG = restaurantSlugFromSiteUrl();

const IMG = {
  bssara: PRODUCT_IMAGES.bissara,
  lentils: PRODUCT_IMAGES.lentils,
  loubia: PRODUCT_IMAGES.loubia,
  harira: PRODUCT_IMAGES.harira,
  kefta: PRODUCT_IMAGES.kefta,
  chicken: PRODUCT_IMAGES.grilledChicken,
  liver: PRODUCT_IMAGES.liverGrill,
  mixed: PRODUCT_IMAGES.mixedGrill,
  tagine: PRODUCT_IMAGES.tagine,
  tagineMeat: PRODUCT_IMAGES.tagineMeat,
  tagineKefta: PRODUCT_IMAGES.tagineKefta,
  tea: PRODUCT_IMAGES.moroccanTea,
  juice: PRODUCT_IMAGES.orangeJuice,
  water: PRODUCT_IMAGES.water,
  salad: PRODUCT_IMAGES.salad,
};

async function main() {
  const adminEmail = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
  if (!adminEmail) {
    throw new Error("ADMIN_SEED_EMAIL is required");
  }
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  if (!adminPassword || adminPassword.trim().length === 0) {
    throw new Error("ADMIN_SEED_PASSWORD is required");
  }
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  let restaurant = await prisma.restaurant.findUnique({
    where: { slug: TENANT_SLUG },
  });

  if (restaurant) {
    await prisma.adminNotification.deleteMany({
      where: { restaurantId: restaurant.id },
    });
    await prisma.order.deleteMany({ where: { restaurantId: restaurant.id } });
    await prisma.product.deleteMany({ where: { restaurantId: restaurant.id } });
    await prisma.category.deleteMany({ where: { restaurantId: restaurant.id } });
    await prisma.offer.deleteMany({ where: { restaurantId: restaurant.id } });
    await prisma.review.deleteMany({ where: { restaurantId: restaurant.id } });
    await prisma.user.deleteMany({ where: { restaurantId: restaurant.id } });
    await prisma.restaurantSettings.deleteMany({
      where: { restaurantId: restaurant.id },
    });
    await prisma.restaurant.delete({ where: { id: restaurant.id } });
  }

  restaurant = await prisma.restaurant.create({
    data: {
      slug: TENANT_SLUG,
      name: "مطعم وشواية البركة الكبرى",
    },
  });

  await prisma.restaurantSettings.create({
    data: {
      restaurantId: restaurant.id,
      restaurantName: "مطعم وشواية البركة الكبرى",
      phone: "+212 6 12 34 56 78",
      whatsapp: "+212 6 12 34 56 78",
      email: adminEmail,
      address: "شارع محمد الخامس، الدار البيضاء، المغرب",
      openingHours: "كل يوم من 11:00 صباحاً إلى 23:30 ليلاً",
      deliveryRules:
        "10 دراهم داخل 3 كم، 15 درهم من 3 إلى 6 كم، أكثر من 6 كم: تأكيد عبر الهاتف",
      paypalEnabled: true,
      codEnabled: true,
      onlinePaymentEnabled: true,
      googleMapsEmbedUrl:
        "https://www.google.com/maps?q=Boulevard+Mohammed+V,+Casablanca,+Morocco&z=16&output=embed",
      primaryColorHex: "#c9a227",
      accentColorHex: "#f4e4a6",
    },
  });

  await prisma.user.create({
    data: {
      restaurantId: restaurant.id,
      email: adminEmail,
      name: "مدير المطعم",
      passwordHash,
      role: UserRole.RESTAURANT_ADMIN,
    },
  });

  const cat = {
    traditional: await prisma.category.create({
      data: {
        restaurantId: restaurant.id,
        name: "الأكلات الشعبية",
        slug: "traditional",
        sortOrder: 1,
        image: IMG.harira,
      },
    }),
    grill: await prisma.category.create({
      data: {
        restaurantId: restaurant.id,
        name: "المشاوي",
        slug: "grill",
        sortOrder: 2,
        image: IMG.mixed,
      },
    }),
    tagine: await prisma.category.create({
      data: {
        restaurantId: restaurant.id,
        name: "الطواجن",
        slug: "tagine",
        sortOrder: 3,
        image: IMG.tagine,
      },
    }),
    salads: await prisma.category.create({
      data: {
        restaurantId: restaurant.id,
        name: "السلطات",
        slug: "salads",
        sortOrder: 4,
        image: IMG.salad,
      },
    }),
    drinks: await prisma.category.create({
      data: {
        restaurantId: restaurant.id,
        name: "المشروبات",
        slug: "drinks",
        sortOrder: 5,
        image: IMG.tea,
      },
    }),
    deals: await prisma.category.create({
      data: {
        restaurantId: restaurant.id,
        name: "العروض",
        slug: "deals",
        sortOrder: 6,
        image: IMG.mixed,
      },
    }),
  };

  const products: Array<{
    categoryId: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    image: string;
    featured?: boolean;
    specialOffer?: boolean;
  }> = [
    {
      categoryId: cat.traditional.id,
      name: "بيصارة",
      slug: "bssara",
      description: "بيصارة مغربية بزيت الزيتون والكمون",
      price: 12,
      image: IMG.bssara,
      featured: true,
    },
    {
      categoryId: cat.traditional.id,
      name: "عدس",
      slug: "lentils",
      description: "عدس مغربي مطبوخ بطريقة تقليدية",
      price: 15,
      image: IMG.lentils,
      featured: true,
    },
    {
      categoryId: cat.traditional.id,
      name: "لوبية",
      slug: "loubia",
      description: "لوبية بيضاء بصلصة مغربية",
      price: 16,
      image: IMG.loubia,
    },
    {
      categoryId: cat.traditional.id,
      name: "حريرة",
      slug: "harira",
      description: "حريرة مغربية ساخنة",
      price: 10,
      image: IMG.harira,
      featured: true,
    },
    {
      categoryId: cat.grill.id,
      name: "كفتة مشوية",
      slug: "kefta-grill",
      description: "كفتة مشوية على الفحم مع سلطة وخبز",
      price: 35,
      image: IMG.kefta,
      featured: true,
    },
    {
      categoryId: cat.grill.id,
      name: "دجاج مشوي",
      slug: "chicken-grill",
      description: "دجاج مشوي بتتبيلة مغربية",
      price: 45,
      image: IMG.chicken,
      featured: true,
    },
    {
      categoryId: cat.grill.id,
      name: "كبدة مشوية",
      slug: "liver-grill",
      description: "كبدة مشوية مع التوابل",
      price: 40,
      image: IMG.liver,
      featured: true,
    },
    {
      categoryId: cat.grill.id,
      name: "طبق مشاوي مشكل",
      slug: "mixed-grill",
      description: "كفتة، دجاج، كبدة، سجق، سلطة وخبز",
      price: 75,
      image: IMG.mixed,
      featured: true,
    },
    {
      categoryId: cat.tagine.id,
      name: "طاجين دجاج بالزيتون",
      slug: "tagine-chicken-olive",
      description: "طاجين تقليدي بالزيتون المغربي",
      price: 55,
      image: IMG.tagine,
      featured: true,
    },
    {
      categoryId: cat.tagine.id,
      name: "طاجين لحم بالبرقوق",
      slug: "tagine-meat-prune",
      description: "لحم طري مع البرقوق والعسل",
      price: 70,
      image: IMG.tagineMeat,
    },
    {
      categoryId: cat.tagine.id,
      name: "طاجين كفتة بالبيض",
      slug: "tagine-kefta-egg",
      description: "كفتة مغربية مع بيض وصلصة طماطم",
      price: 45,
      image: IMG.tagineKefta,
    },
    {
      categoryId: cat.drinks.id,
      name: "أتاي مغربي",
      slug: "atay",
      description: "أتاي بالنعناع",
      price: 10,
      image: IMG.tea,
    },
    {
      categoryId: cat.drinks.id,
      name: "عصير برتقال",
      slug: "orange-juice",
      description: "عصير طازج",
      price: 15,
      image: IMG.juice,
    },
    {
      categoryId: cat.drinks.id,
      name: "ماء معدني",
      slug: "water",
      description: "ماء 50cl",
      price: 6,
      image: IMG.water,
    },
    {
      categoryId: cat.deals.id,
      name: "عرض الغداء",
      slug: "lunch-deal",
      description: "بيصارة + كفتة + أتاي",
      price: 45,
      image: IMG.bssara,
      specialOffer: true,
    },
    {
      categoryId: cat.deals.id,
      name: "عرض العائلة",
      slug: "family-deal",
      description: "طبق مشاوي مشكل كبير + سلطات + مشروبات",
      price: 180,
      image: IMG.mixed,
      specialOffer: true,
    },
    {
      categoryId: cat.salads.id,
      name: "سلطة مشكلة",
      slug: "mixed-salad",
      description: "خضر طازجة مع صلصة منزلية",
      price: 25,
      image: IMG.salad,
    },
    {
      categoryId: cat.salads.id,
      name: "سلطة طماطم بالبصل",
      slug: "tomato-onion-salad",
      description: "طماطم، بصل، زيت زيتون وكمون",
      price: 12,
      image: IMG.salad,
    },
  ];

  for (const p of products) {
    await prisma.product.create({
      data: {
        restaurantId: restaurant.id,
        ...p,
        available: true,
        featured: p.featured ?? false,
        specialOffer: p.specialOffer ?? false,
      },
    });
  }

  await prisma.offer.create({
    data: {
      restaurantId: restaurant.id,
      title: "خصم 10٪ على أتاي مغربي",
      description: "عرض بعد تأكيد الطلب (صفحة الشكر)",
      discountPercent: 10,
      upsellProductSlug: "atay",
      crossSellSlugs: ["mixed-grill", "mixed-salad", "orange-juice"],
      active: true,
    },
  });

  await prisma.review.create({
    data: {
      restaurantId: restaurant.id,
      customerName: "زبون تجريبي",
      rating: 5,
      comment: "أكل زوين وخدمة مزيانة.",
      visible: true,
    },
  });

  console.log(`Seed OK — tenant slug: ${TENANT_SLUG}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
