"use client";

import Link from "next/link";
import { FlexibleImage } from "@/components/flexible-image";
import { useCart } from "@/context/cart-context";
import { getDictionary, type Locale } from "@/i18n";

export type ProductCardProps = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  locale?: Locale;
};

export function ProductCard({
  id,
  name,
  slug,
  description,
  price,
  image,
  available,
  locale = "ar",
}: ProductCardProps) {
  const t = getDictionary(locale);
  const { addItem } = useCart();

  return (
    <article className="glass group flex flex-col overflow-hidden rounded-2xl">
      <Link
        href={`/products/${slug}`}
        className="flex min-h-0 flex-1 flex-col outline-none ring-baraka-gold/40 focus-visible:ring-2"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/40">
          <FlexibleImage
            src={image}
            alt={name}
            fill
            sizes="(max-width:768px) 100vw, 33vw"
            className="transition duration-500 group-hover:scale-105 object-cover"
          />
          {!available ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-sm font-semibold text-white">
              غير متوفر
            </div>
          ) : null}
          {available ? (
            <div className="absolute left-3 top-3 rounded-full bg-black/55 px-2 py-1 text-xs text-baraka-goldlight backdrop-blur">
              متوفر
            </div>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col p-4 pb-0">
          <h3 className="text-lg font-semibold text-white">{name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-white/65">{description}</p>
        </div>
      </Link>
      <div className="mt-auto flex items-center justify-between gap-3 p-4 pt-4">
        <Link
          href={`/products/${slug}`}
          className="text-lg font-bold text-baraka-gold outline-none ring-baraka-gold/40 transition hover:brightness-110 focus-visible:ring-2"
        >
          {price} {t.currency}
        </Link>
        <button
          type="button"
          disabled={!available}
          onClick={() =>
            addItem({ productId: id, name, slug, price, image, quantity: 1 })
          }
          className="rounded-full bg-gradient-to-l from-baraka-gold to-baraka-goldlight px-4 py-2 text-sm font-bold text-baraka-black shadow-lg shadow-black/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t.cta.addToCart}
        </button>
      </div>
    </article>
  );
}
