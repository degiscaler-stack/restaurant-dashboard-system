"use client";

import { useCart } from "@/context/cart-context";
import { getDictionary } from "@/i18n";

type Props = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  available: boolean;
};

export function ProductAddToCartButton({
  id,
  name,
  slug,
  price,
  image,
  available,
}: Props) {
  const { addItem } = useCart();
  const t = getDictionary("ar");

  return (
    <button
      type="button"
      disabled={!available}
      onClick={() =>
        addItem({ productId: id, name, slug, price, image, quantity: 1 })
      }
      className="rounded-full bg-gradient-to-l from-baraka-gold to-baraka-goldlight px-6 py-3 text-sm font-bold text-baraka-black shadow-lg shadow-black/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {t.cta.addToCart}
    </button>
  );
}
