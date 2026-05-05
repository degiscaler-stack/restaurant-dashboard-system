/**
 * Default menu data when MySQL/Prisma is unavailable or tables are empty.
 * Product IDs stay stable (`fallback-*`) so cart + checkout resolve them in /api/orders.
 */

import { PRODUCT_IMAGES } from "@/lib/product-image-urls";

export const FALLBACK_CATEGORY_ORDER = [
  "traditional",
  "grill",
  "tagine",
  "drinks",
  "deals",
] as const;

export type FallbackCategorySlug = (typeof FALLBACK_CATEGORY_ORDER)[number];

export type FallbackCategory = {
  id: string;
  name: string;
  slug: string;
  image: string;
  sortOrder: number;
  description: string;
};

export type FallbackProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  featured: boolean;
  specialOffer: boolean;
  categorySlug: FallbackCategorySlug;
};

export const FALLBACK_CATEGORIES: FallbackCategory[] = [
  {
    id: "fallback-cat-traditional",
    name: "الأكلات الشعبية",
    slug: "traditional",
    image: PRODUCT_IMAGES.bissara,
    sortOrder: 1,
    description: "بيصارة، عدس، لوبية، حريرة… نكهات الدار أصيلة.",
  },
  {
    id: "fallback-cat-grill",
    name: "المشاوي",
    slug: "grill",
    image: PRODUCT_IMAGES.kefta,
    sortOrder: 2,
    description: "كفتة، دجاج، كبدة ومشاوي مشكلة على الفحم.",
  },
  {
    id: "fallback-cat-tagine",
    name: "الطواجن",
    slug: "tagine",
    image: PRODUCT_IMAGES.tagine,
    sortOrder: 3,
    description: "طواجن يومية بالزيتون، البرقوق والتوابل المغربية.",
  },
  {
    id: "fallback-cat-drinks",
    name: "المشروبات",
    slug: "drinks",
    image: PRODUCT_IMAGES.moroccanTea,
    sortOrder: 4,
    description: "أتاي بالنعناع، عصائر طازجة وماء معدني.",
  },
  {
    id: "fallback-cat-deals",
    name: "العروض",
    slug: "deals",
    image: PRODUCT_IMAGES.mixedGrill,
    sortOrder: 5,
    description: "عروض الغداء والعائلة بأثمنة مناسبة.",
  },
];

const cat = (slug: FallbackCategorySlug) =>
  FALLBACK_CATEGORIES.find((c) => c.slug === slug)!;

export const FALLBACK_PRODUCTS: FallbackProduct[] = [
  {
    id: "fallback-bssara",
    name: "بيصارة",
    slug: "bssara",
    description: "بيصارة مغربية بزيت الزيتون والكمون.",
    price: 12,
    image: PRODUCT_IMAGES.bissara,
    available: true,
    featured: false,
    specialOffer: false,
    categorySlug: "traditional",
  },
  {
    id: "fallback-lentils",
    name: "عدس",
    slug: "lentils",
    description: "عدس مغربي مطبوخ بطريقة تقليدية.",
    price: 15,
    image: PRODUCT_IMAGES.lentils,
    available: true,
    featured: false,
    specialOffer: false,
    categorySlug: "traditional",
  },
  {
    id: "fallback-loubia",
    name: "لوبية",
    slug: "loubia",
    description: "لوبية بيضاء بصلصة مغربية.",
    price: 16,
    image: PRODUCT_IMAGES.loubia,
    available: true,
    featured: false,
    specialOffer: false,
    categorySlug: "traditional",
  },
  {
    id: "fallback-harira",
    name: "حريرة",
    slug: "harira",
    description: "حريرة مغربية ساخنة.",
    price: 10,
    image: PRODUCT_IMAGES.harira,
    available: true,
    featured: true,
    specialOffer: false,
    categorySlug: "traditional",
  },
  {
    id: "fallback-kefta-grill",
    name: "كفتة مشوية",
    slug: "kefta-grill",
    description: "كفتة مشوية على الفحم مع سلطة وخبز.",
    price: 35,
    image: PRODUCT_IMAGES.kefta,
    available: true,
    featured: true,
    specialOffer: false,
    categorySlug: "grill",
  },
  {
    id: "fallback-chicken-grill",
    name: "دجاج مشوي",
    slug: "chicken-grill",
    description: "دجاج مشوي بتتبيلة مغربية.",
    price: 45,
    image: PRODUCT_IMAGES.grilledChicken,
    available: true,
    featured: true,
    specialOffer: false,
    categorySlug: "grill",
  },
  {
    id: "fallback-liver-grill",
    name: "كبدة مشوية",
    slug: "liver-grill",
    description: "كبدة مشوية مع التوابل.",
    price: 40,
    image: PRODUCT_IMAGES.liverGrill,
    available: true,
    featured: false,
    specialOffer: false,
    categorySlug: "grill",
  },
  {
    id: "fallback-mixed-grill",
    name: "طبق مشاوي مشكل",
    slug: "mixed-grill",
    description: "كفتة، دجاج، كبدة، سجق، سلطة وخبز.",
    price: 75,
    image: PRODUCT_IMAGES.mixedGrill,
    available: true,
    featured: true,
    specialOffer: false,
    categorySlug: "grill",
  },
  {
    id: "fallback-tagine-chicken-olive",
    name: "طاجين دجاج بالزيتون",
    slug: "tagine-chicken-olive",
    description: "طاجين تقليدي بالزيتون المغربي.",
    price: 55,
    image: PRODUCT_IMAGES.tagine,
    available: true,
    featured: true,
    specialOffer: false,
    categorySlug: "tagine",
  },
  {
    id: "fallback-tagine-meat-prune",
    name: "طاجين لحم بالبرقوق",
    slug: "tagine-meat-prune",
    description: "لحم طري مع البرقوق والعسل.",
    price: 70,
    image: PRODUCT_IMAGES.tagineMeat,
    available: true,
    featured: false,
    specialOffer: false,
    categorySlug: "tagine",
  },
  {
    id: "fallback-tagine-kefta-egg",
    name: "طاجين كفتة بالبيض",
    slug: "tagine-kefta-egg",
    description: "كفتة مغربية مع بيض وصلصة طماطم.",
    price: 45,
    image: PRODUCT_IMAGES.tagineKefta,
    available: true,
    featured: false,
    specialOffer: false,
    categorySlug: "tagine",
  },
  {
    id: "fallback-atay",
    name: "أتاي مغربي",
    slug: "atay",
    description: "أتاي بالنعناع.",
    price: 10,
    image: PRODUCT_IMAGES.moroccanTea,
    available: true,
    featured: false,
    specialOffer: false,
    categorySlug: "drinks",
  },
  {
    id: "fallback-orange-juice",
    name: "عصير برتقال",
    slug: "orange-juice",
    description: "عصير طازج.",
    price: 15,
    image: PRODUCT_IMAGES.orangeJuice,
    available: true,
    featured: false,
    specialOffer: false,
    categorySlug: "drinks",
  },
  {
    id: "fallback-water",
    name: "ماء معدني",
    slug: "water",
    description: "ماء 50cl.",
    price: 6,
    image: PRODUCT_IMAGES.water,
    available: true,
    featured: false,
    specialOffer: false,
    categorySlug: "drinks",
  },
  {
    id: "fallback-lunch-deal",
    name: "عرض الغداء",
    slug: "lunch-deal",
    description: "بيصارة + كفتة + أتاي.",
    price: 45,
    image: PRODUCT_IMAGES.bissara,
    available: true,
    featured: false,
    specialOffer: true,
    categorySlug: "deals",
  },
  {
    id: "fallback-family-deal",
    name: "عرض العائلة",
    slug: "family-deal",
    description: "طبق مشاوي مشكل كبير + سلطات + مشروبات.",
    price: 180,
    image: PRODUCT_IMAGES.mixedGrill,
    available: true,
    featured: true,
    specialOffer: true,
    categorySlug: "deals",
  },
];

const FALLBACK_PRODUCT_BY_ID = new Map(
  FALLBACK_PRODUCTS.map((p) => [p.id, p]),
);

/** Home “أطباق مميزة” — six hero dishes + offer */
export const HOME_FEATURED_SLUGS: string[] = [
  "kefta-grill",
  "chicken-grill",
  "mixed-grill",
  "tagine-chicken-olive",
  "harira",
  "family-deal",
];

export const DEFAULT_GOOGLE_MAPS_EMBED_URL =
  "https://www.google.com/maps?q=Boulevard+Mohammed+V,+Casablanca,+Morocco&z=16&output=embed";

export type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  sortOrder: number;
};

export type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  featured: boolean;
  specialOffer: boolean;
  category: { id: string; name: string; slug: string };
};

export function getFallbackProductById(id: string): FallbackProduct | undefined {
  return FALLBACK_PRODUCT_BY_ID.get(id);
}

export function getFallbackCategoriesForApi(): ApiCategory[] {
  return FALLBACK_CATEGORIES.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image,
    sortOrder: c.sortOrder,
  }));
}

export function getFallbackProductsForApi(
  categorySlug: string | null,
  q: string | null,
): ApiProduct[] {
  const needle = (q ?? "").trim().toLowerCase();
  const narrowedCategory =
    categorySlug && categorySlug !== "all" ? categorySlug : null;

  function buildList(forCategory: string | null): FallbackProduct[] {
    let list = FALLBACK_PRODUCTS.filter((p) => p.available);
    if (forCategory) {
      list = list.filter((p) => p.categorySlug === forCategory);
    }
    if (needle) {
      list = list.filter((p) => {
        const catName = cat(p.categorySlug).name.toLowerCase();
        return (
          p.name.toLowerCase().includes(needle) ||
          p.description.toLowerCase().includes(needle) ||
          catName.includes(needle)
        );
      });
    }
    return list;
  }

  let list = buildList(narrowedCategory);
  // تصنيف من مسار أو قاعدة بيانات قد لا يطابق المنيو الاحتياطي — بدون نص بحث نعرض كامل المنيو
  if (list.length === 0 && narrowedCategory && !needle) {
    list = buildList(null);
  }

  const sorted = [...list].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.name.localeCompare(b.name, "ar");
  });

  return sorted.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    image: p.image,
    available: p.available,
    featured: p.featured,
    specialOffer: p.specialOffer,
    category: {
      id: cat(p.categorySlug).id,
      name: cat(p.categorySlug).name,
      slug: p.categorySlug,
    },
  }));
}

export function getHomeCategoriesFallback(): FallbackCategory[] {
  return FALLBACK_CATEGORIES.map((c) => ({ ...c }));
}

export function mapFallbackProductToCard(p: FallbackProduct): ApiProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    image: p.image,
    available: p.available,
    featured: p.featured,
    specialOffer: p.specialOffer,
    category: {
      id: cat(p.categorySlug).id,
      name: cat(p.categorySlug).name,
      slug: p.categorySlug,
    },
  };
}

/** منيو احتياطي عند غياب تعريف مطعم في قاعدة البيانات (نفس منطق /api/products). */
export function getFallbackProductApiBySlug(slug: string): ApiProduct | null {
  const p = FALLBACK_PRODUCTS.find((x) => x.slug === slug);
  return p ? mapFallbackProductToCard(p) : null;
}

export function getHomeFeaturedFallback(): ApiProduct[] {
  const bySlug = new Map(FALLBACK_PRODUCTS.map((p) => [p.slug, p]));
  return HOME_FEATURED_SLUGS.map((slug) => bySlug.get(slug))
    .filter(Boolean)
    .map((p) => mapFallbackProductToCard(p as FallbackProduct));
}

export function mergeHomeFeatured(
  dbProducts: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    price: unknown;
    image: string;
    available: boolean;
    featured: boolean;
    specialOffer: boolean;
    category: { id: string; name: string; slug: string };
  }>,
): ApiProduct[] {
  const dbBySlug = new Map(dbProducts.map((p) => [p.slug, p]));
  const out: ApiProduct[] = [];

  for (const slug of HOME_FEATURED_SLUGS) {
    const dbp = dbBySlug.get(slug);
    if (dbp && dbp.available) {
      out.push({
        id: dbp.id,
        name: dbp.name,
        slug: dbp.slug,
        description: dbp.description,
        price: Number(dbp.price),
        image: dbp.image,
        available: dbp.available,
        featured: dbp.featured,
        specialOffer: dbp.specialOffer,
        category: dbp.category,
      });
      continue;
    }
    const fb = FALLBACK_PRODUCTS.find((p) => p.slug === slug);
    if (fb) out.push(mapFallbackProductToCard(fb));
  }

  return out;
}
