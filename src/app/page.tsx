import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { CustomerReviews } from "@/components/customer-reviews";
import { getDictionary } from "@/i18n";
import {
  DEFAULT_GOOGLE_MAPS_EMBED_URL,
  FALLBACK_CATEGORIES,
  getHomeCategoriesFallback,
  mergeHomeFeatured,
  type ApiProduct,
} from "@/lib/fallback-menu";

export const dynamic = "force-dynamic";

const HERO_IMG =
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1600&q=80";

type HomeCategory = {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
};

function enrichDbCategory(c: {
  id: string;
  name: string;
  slug: string;
  image: string | null;
}): HomeCategory {
  const fb = FALLBACK_CATEGORIES.find((x) => x.slug === c.slug);
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image || fb?.image || "/images/mixed-grill.jpg",
    description:
      fb?.description || "اكتشف أطباقنا المغربية واطلب أونلاين بسهولة.",
  };
}

async function loadHome(): Promise<{
  featured: ApiProduct[];
  categories: HomeCategory[];
  mapUrl: string;
}> {
  try {
    const [featuredDb, cats, settings] = await Promise.all([
      prisma.product.findMany({
        where: {
          available: true,
          slug: {
            in: [
              "kefta-grill",
              "chicken-grill",
              "mixed-grill",
              "tagine-chicken-olive",
              "harira",
              "family-deal",
            ],
          },
        },
        include: { category: true },
      }),
      prisma.category.findMany({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.restaurantSettings.findFirst(),
    ]);

    const featured = mergeHomeFeatured(featuredDb);

    const categoriesHydrated =
      cats.length > 0 ? cats.map(enrichDbCategory) : getHomeCategoriesFallback();

    const mapUrl =
      settings?.googleMapsEmbedUrl?.trim() || DEFAULT_GOOGLE_MAPS_EMBED_URL;

    return { featured, categories: categoriesHydrated, mapUrl };
  } catch {
    return {
      featured: mergeHomeFeatured([]),
      categories: getHomeCategoriesFallback(),
      mapUrl: DEFAULT_GOOGLE_MAPS_EMBED_URL,
    };
  }
}

export default async function Home() {
  const t = getDictionary("ar");
  const { featured, categories, mapUrl } = await loadHome();

  return (
    <div className="min-h-dvh bg-baraka-black">
      <SiteHeader locale="ar" />
      <main>
        <section className="relative min-h-[78vh] overflow-hidden">
          <Image
            src={HERO_IMG}
            alt="شواية ومأكولات مغربية"
            fill
            priority
            className="object-cover brightness-[0.45]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-baraka-black via-baraka-black/20 to-transparent" />
          <div className="relative mx-auto flex max-w-6xl flex-col justify-end gap-6 px-4 pb-16 pt-28 md:min-h-[78vh] md:pb-24 md:pt-32">
            <p className="max-w-2xl text-sm text-white/80 md:text-base">{t.tagline}</p>
            <h1 className="max-w-3xl font-display text-4xl font-black leading-tight text-white md:text-6xl">
              <span className="gold-gradient">{t.home.heroTitle}</span>
            </h1>
            <p className="max-w-2xl text-base text-white/80 md:text-lg">
              {t.home.heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/menu"
                className="rounded-full bg-gradient-to-l from-baraka-gold to-baraka-goldlight px-6 py-3 text-sm font-bold text-baraka-black shadow-lg"
              >
                {t.cta.viewMenu}
              </Link>
              <Link
                href="/checkout"
                className="rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/10"
              >
                {t.cta.orderNow}
              </Link>
              <a
                href="tel:+212612345678"
                className="rounded-full border border-baraka-moroccanlight/40 bg-baraka-moroccan/35 px-6 py-3 text-sm font-semibold text-white hover:bg-baraka-moroccan/55"
              >
                {t.cta.callUs}
              </a>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-center font-display text-2xl font-bold text-baraka-gold md:text-3xl">
            {t.home.sectionsTitle}
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/menu?category=${c.slug}`}
                className="glass group overflow-hidden rounded-3xl transition hover:border-baraka-gold/35"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/50">
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    sizes="(max-width:768px) 100vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                  <span className="absolute bottom-3 end-4 rounded-full bg-baraka-gold px-4 py-1.5 text-xs font-bold text-baraka-black">
                    شوف القسم
                  </span>
                </div>
                <div className="space-y-2 p-5">
                  <h3 className="font-display text-lg font-bold text-white md:text-xl">
                    {c.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/65">
                    {c.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-6">
          <h2 className="text-center font-display text-2xl font-bold text-baraka-gold md:text-3xl">
            {t.home.featuredTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-white/55">
            أطباق مختارة بالثمن والصورة — زيدهم للسلة مباشرة
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                slug={p.slug}
                description={p.description}
                price={p.price}
                image={p.image}
                available={p.available}
                locale="ar"
              />
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Link
              href="/menu"
              className="rounded-full border border-baraka-gold/40 px-8 py-3 text-sm font-semibold text-baraka-gold hover:bg-baraka-gold/10"
            >
              كامل المنيو
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14">
          <div className="glass grid gap-8 rounded-3xl p-8 md:grid-cols-2 md:p-10">
            <div>
              <h2 className="font-display text-3xl font-bold text-white">
                {t.home.deliveryTitle}
              </h2>
              <p className="mt-3 text-white/70">{t.home.deliveryEta}</p>
              <ul className="mt-6 space-y-2 text-sm text-white/75">
                <li>• التوصيل داخل المدينة</li>
                <li>• 10 دراهم داخل 3 كم</li>
                <li>• 15 درهم من 3 كم إلى 6 كم</li>
                <li>• أكثر من 6 كم: تأكيد عبر الهاتف</li>
              </ul>
              <Link
                href="/menu"
                className="mt-8 inline-flex rounded-full bg-gradient-to-l from-baraka-gold to-baraka-goldlight px-7 py-3 text-sm font-bold text-baraka-black"
              >
                {t.cta.viewMenu}
              </Link>
            </div>
            <div className="relative min-h-[220px] overflow-hidden rounded-2xl border border-white/10 bg-black/30">
              <Image
                src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1200&q=80"
                alt="توصيل"
                fill
                className="object-cover opacity-70"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10">
          <CustomerReviews title={t.home.reviewsTitle} />
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16">
          <h2 className="text-center font-display text-2xl font-bold text-baraka-gold md:text-3xl">
            {t.home.mapTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-white/60">
            شارع محمد الخامس، الدار البيضاء، المغرب — قرب وسط المدينة
          </p>
          <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl">
            <iframe
              title="خريطة المطعم"
              src={mapUrl}
              className="h-[320px] w-full md:h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </section>
      </main>
      <SiteFooter locale="ar" />
    </div>
  );
}
