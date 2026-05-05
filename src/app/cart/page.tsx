"use client";

import { FlexibleImage } from "@/components/flexible-image";
import Link from "next/link";
import type { DeliveryBand } from "@/lib/delivery";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useCart } from "@/context/cart-context";
import { getDictionary } from "@/i18n";

export default function CartPage() {
  const t = getDictionary("ar");
  const {
    items,
    setQty,
    removeItem,
    subtotal,
    deliveryFee,
    total,
    deliveryBand,
    setDeliveryBand,
    orderTypePreview,
    setOrderTypePreview,
  } = useCart();

  return (
    <div className="min-h-dvh bg-baraka-black">
      <SiteHeader locale="ar" />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-baraka-gold">{t.cart.title}</h1>

        {items.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-white/70">
            <p>{t.cart.empty}</p>
            <Link
              href="/menu"
              className="mt-6 inline-flex rounded-full bg-baraka-gold px-6 py-3 text-sm font-bold text-baraka-black"
            >
              {t.nav.menu}
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {items.map((it) => (
              <div
                key={it.productId}
                className="glass flex gap-4 rounded-2xl p-4 md:items-center"
              >
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-black/40">
                  <FlexibleImage src={it.image} alt={it.name} fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{it.name}</p>
                  <p className="text-xs text-white/55">
                    الثمن: {it.price} {t.currency} للوحدة — الكمية: {it.quantity}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="h-9 w-9 rounded-lg border border-white/15 text-lg text-white hover:bg-white/10"
                      onClick={() => setQty(it.productId, it.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="min-w-[2ch] text-center text-sm text-white/80">
                      {it.quantity}
                    </span>
                    <button
                      type="button"
                      className="h-9 w-9 rounded-lg border border-white/15 text-lg text-white hover:bg-white/10"
                      onClick={() => setQty(it.productId, it.quantity + 1)}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="ms-auto text-sm text-red-300 hover:underline"
                      onClick={() => removeItem(it.productId)}
                    >
                      حذف
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white/60">المجموع</p>
                  <p className="text-lg font-bold text-baraka-gold">
                    {it.price * it.quantity} {t.currency}
                  </p>
                </div>
              </div>
            ))}

            <div className="glass rounded-2xl p-5">
              <p className="text-sm font-semibold text-white">{t.checkout.fields.orderType}</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setOrderTypePreview("DELIVERY")}
                  className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold ${
                    orderTypePreview === "DELIVERY"
                      ? "bg-baraka-moroccan text-white"
                      : "border border-white/15 bg-white/5 text-white/75"
                  }`}
                >
                  {t.checkout.fields.delivery}
                </button>
                <button
                  type="button"
                  onClick={() => setOrderTypePreview("PICKUP")}
                  className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold ${
                    orderTypePreview === "PICKUP"
                      ? "bg-baraka-moroccan text-white"
                      : "border border-white/15 bg-white/5 text-white/75"
                  }`}
                >
                  {t.checkout.fields.pickup}
                </button>
              </div>

              {orderTypePreview === "DELIVERY" ? (
                <div className="mt-5">
                  <p className="text-sm font-semibold text-white">{t.cart.bandLabel}</p>
                  <select
                    className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-3 text-sm text-white outline-none"
                    value={deliveryBand ?? "UNDER_3_KM"}
                    onChange={(e) => setDeliveryBand(e.target.value as DeliveryBand)}
                  >
                    <option value="UNDER_3_KM">{t.cart.band0}</option>
                    <option value="THREE_TO_6_KM">{t.cart.band1}</option>
                    <option value="OVER_6_KM">{t.cart.band2}</option>
                  </select>
                </div>
              ) : (
                <p className="mt-4 text-sm text-white/60">{t.cart.pickupHint}</p>
              )}

              <div className="mt-6 space-y-2 border-t border-white/10 pt-4 text-sm text-white/75">
                <div className="flex justify-between">
                  <span>{t.cart.subtotal}</span>
                  <span>
                    {subtotal} {t.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t.cart.delivery}</span>
                  <span>
                    {deliveryFee} {t.currency}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-white">
                  <span>{t.cart.total}</span>
                  <span className="text-baraka-gold">
                    {total} {t.currency}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-6 flex w-full items-center justify-center rounded-full bg-gradient-to-l from-baraka-gold to-baraka-goldlight py-3 text-sm font-bold text-baraka-black"
              >
                {t.cart.goCheckout}
              </Link>
            </div>
          </div>
        )}
      </main>
      <SiteFooter locale="ar" />
    </div>
  );
}
