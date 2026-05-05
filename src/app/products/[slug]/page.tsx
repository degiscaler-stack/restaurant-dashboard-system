import type { Metadata } from "next";
import Link from "next/link";
import { FlexibleImage } from "@/components/flexible-image";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getFallbackProductApiBySlug } from "@/lib/fallback-menu";
import { prisma } from "@/lib/db";
import { resolveRestaurantId } from "@/lib/tenant";
import { getDictionary } from "@/i18n";
import { ProductAddToCartButton } from "./product-add-to-cart-button";

export const dynamic = "force-dynamic";

type DetailProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  categoryName: string;
};

async function loadProductDetail(slug: string): Promise<DetailProduct | null> {
  const restaurantId = await resolveRestaurantId();
  if (restaurantId) {
    try {
      const p = await prisma.product.findFirst({
        where: { restaurantId, slug },
        include: {
          category: { select: { name: true } },
        },
      });
      if (p) {
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: Number(p.price),
          image: p.image,
          available: p.available,
          categoryName: p.category.name,
        };
      }
      return null;
    } catch (e) {
      console.error("[product-detail]", e);
      return null;
    }
  }

  const fb = getFallbackProductApiBySlug(slug);
  if (!fb) return null;
  return {
    id: fb.id,
    name: fb.name,
    slug: fb.slug,
    description: fb.description,
    price: fb.price,
    image: fb.image,
    available: fb.available,
    categoryName: fb.category.name,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProductDetail(slug);
  if (!product) {
    return { title: "المنتج غير موجود" };
  }
  const description =
    product.description.length > 160
      ? `${product.description.slice(0, 157)}…`
      : product.description;
  return {
    title: product.name,
    description,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await loadProductDetail(slug);
  const t = getDictionary("ar");

  if (!product) {
    return (
      <div className="min-h-dvh bg-baraka-black">
        <SiteHeader locale="ar" />
        <main className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-center text-lg text-white/80">المنتج غير موجود</p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/menu"
              className="rounded-2xl bg-baraka-moroccan/50 px-6 py-3 text-sm font-semibold text-white hover:bg-baraka-moroccan/70"
            >
              العودة للمنيو
            </Link>
          </div>
        </main>
        <SiteFooter locale="ar" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-baraka-black">
      <SiteHeader locale="ar" />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="glass overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <div className="relative mx-auto aspect-[4/3] w-full max-w-2xl bg-black/40 md:aspect-[16/10]">
            <FlexibleImage
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width:768px) 100vw, 42rem"
              priority
              className="object-cover"
            />
            {!product.available ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-sm font-semibold text-white">
                غير متوفر
              </div>
            ) : null}
          </div>
          <div className="p-6 md:p-10">
            <p className="text-sm font-semibold text-baraka-gold">
              {product.categoryName}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-white/75">
              {product.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <p className="text-2xl font-bold text-baraka-gold">
                {product.price} {t.currency}
              </p>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  product.available
                    ? "bg-black/55 text-baraka-goldlight"
                    : "bg-black/55 text-white/60"
                }`}
              >
                {product.available ? "متوفر" : "غير متوفر"}
              </span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <ProductAddToCartButton
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                image={product.image}
                available={product.available}
              />
              <Link
                href="/menu"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                العودة للمنيو
              </Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter locale="ar" />
    </div>
  );
}
