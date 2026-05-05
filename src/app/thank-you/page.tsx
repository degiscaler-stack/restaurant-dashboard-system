"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FlexibleImage } from "@/components/flexible-image";
import { getDictionary } from "@/i18n";
import { suggestedCrossSellSlugs } from "@/lib/cross-sell";
import { thankYouSnapshotStorageKey } from "@/lib/thank-you-snapshot";
import { formatMoroccoPhoneDisplay } from "@/lib/validation";

const UPSELL_SLUG = "atay";

type OrderDetail = {
  orderNumber: string;
  customerName: string;
  phone: string;
  whatsapp: string | null;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus?: string;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    image?: string;
  }[];
};

type ProductLite = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
};

function SuccessIcon() {
  return (
    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/25 to-emerald-700/10 ring-2 ring-emerald-400/40">
      <svg
        className="h-10 w-10 text-emerald-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.2}
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
}

type PublicOrderApi = {
  orderNumber: string;
  customerName: string;
  phone: string;
  whatsapp: string | null;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus?: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    image?: string;
  }>;
};

function paymentLabelAr(pm: string): string {
  if (pm === "Online Payment" || pm === "ONLINE") return "الدفع أونلاين";
  return "الدفع عند الاستلام";
}

function mapPublicOrderJson(o: PublicOrderApi): OrderDetail {
  return {
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    phone: o.phone,
    whatsapp: o.whatsapp,
    total: o.total,
    paymentMethod: o.paymentMethod === "ONLINE" ? "Online Payment" : "COD",
    paymentStatus: o.paymentStatus,
    orderStatus: o.orderStatus,
    items: (o.items ?? []).map((i) => ({
      name: i.name,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      totalPrice: i.totalPrice,
      image: i.image,
    })),
  };
}

function Inner() {
  const t = getDictionary("ar");
  const sp = useSearchParams();
  const orderId =
    sp.get("order")?.trim() || sp.get("orderNumber")?.trim() || "";

  const [hydrated, setHydrated] = useState(false);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [catalog, setCatalog] = useState<ProductLite[]>([]);
  const [addonBusyId, setAddonBusyId] = useState<string | null>(null);
  const [addonErr, setAddonErr] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setHydrated(true);
      return;
    }
    void (async () => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const o = (await res.json()) as PublicOrderApi;
          setDetail(mapPublicOrderJson(o));
          setHydrated(true);
          return;
        }
      } catch {
        /* fall through to snapshot */
      }
      try {
        const raw = sessionStorage.getItem(thankYouSnapshotStorageKey(orderId));
        if (raw) {
          const parsed = JSON.parse(raw) as OrderDetail;
          if (parsed?.orderNumber === orderId) setDetail(parsed);
        }
      } catch {
        /* ignore */
      }
      setHydrated(true);
    })();
  }, [orderId]);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/products");
      if (!res.ok) return;
      setCatalog((await res.json()) as ProductLite[]);
    })();
  }, []);

  function persistDetail(next: OrderDetail) {
    try {
      sessionStorage.setItem(
        thankYouSnapshotStorageKey(next.orderNumber),
        JSON.stringify(next),
      );
    } catch {
      /* ignore */
    }
  }

  const upsellProduct = useMemo(
    () => catalog.find((x) => x.slug === UPSELL_SLUG) ?? null,
    [catalog],
  );

  const crossSellProducts = useMemo(() => {
    if (!detail?.items?.length) return [];
    const names = detail.items.map((i) => i.name);
    const slugs = suggestedCrossSellSlugs(names).filter((s) => s !== UPSELL_SLUG);
    const picked: ProductLite[] = [];
    for (const slug of slugs) {
      const p = catalog.find((x) => x.slug === slug);
      if (!p) continue;
      if (names.some((n) => n === p.name)) continue;
      picked.push(p);
      if (picked.length >= 3) break;
    }
    return picked;
  }, [catalog, detail]);

  const hasTeaAlready = useMemo(() => {
    if (!detail) return true;
    return detail.items.some((it) => it.name.includes("أتاي"));
  }, [detail]);

  const upsellDiscounted =
    upsellProduct != null
      ? Math.round(upsellProduct.price * 0.9 * 100) / 100
      : 0;

  const awaitingOnlinePayment = useMemo(() => {
    if (!detail) return false;
    return (
      detail.paymentMethod === "Online Payment" &&
      detail.paymentStatus !== "PAID"
    );
  }, [detail]);

  async function appendProduct(productId: string, upsellTenPercent?: boolean) {
    if (!detail || addonBusyId) return;
    const product = catalog.find((p) => p.id === productId);
    if (!product) return;

    setAddonErr(null);
    setAddonBusyId(productId);
    try {
      const res = await fetch(
        `/api/orders/${encodeURIComponent(detail.orderNumber)}/items`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, upsellTenPercent }),
        },
      );
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setAddonErr(
          typeof data.error === "string"
            ? data.error
            : "تعذر إضافة المنتج إلى الطلب.",
        );
        return;
      }
      const refresh = await fetch(
        `/api/orders/${encodeURIComponent(detail.orderNumber)}`,
        { cache: "no-store" },
      );
      if (!refresh.ok) return;
      const o = (await refresh.json()) as PublicOrderApi;
      const next = mapPublicOrderJson(o);
      setDetail(next);
      persistDetail(next);
    } finally {
      setAddonBusyId(null);
    }
  }

  function AddonCard({
    product,
    discountPrice,
    upsellTenPercent,
  }: {
    product: ProductLite;
    discountPrice?: number;
    upsellTenPercent?: boolean;
  }) {
    const busy = addonBusyId === product.id;
    const showStrike = typeof discountPrice === "number";
    return (
      <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
        <div className="flex gap-3">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
            <FlexibleImage
              src={product.image}
              alt={product.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1 text-right">
            <p className="font-semibold text-white">{product.name}</p>
            <p className="mt-1 line-clamp-2 text-xs text-white/55">
              {product.description}
            </p>
            <div className="mt-2 flex flex-wrap items-baseline justify-end gap-2">
              {showStrike ? (
                <span className="text-xs text-white/45 line-through">
                  {product.price.toFixed(0)} {t.currency}
                </span>
              ) : null}
              <span className="text-sm font-bold text-baraka-gold">
                {(showStrike ? discountPrice! : product.price).toFixed(0)}{" "}
                {t.currency}
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void appendProduct(product.id, upsellTenPercent === true)}
          className="mt-4 w-full rounded-full bg-gradient-to-l from-baraka-gold to-baraka-goldlight py-2.5 text-xs font-bold text-baraka-black disabled:opacity-50"
        >
          {busy ? "جاري الإضافة…" : "أضف إلى طلبي"}
        </button>
      </div>
    );
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-baraka-black text-white/50">
        …
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-baraka-black">
      <SiteHeader locale="ar" />
      <main className="mx-auto max-w-xl px-4 py-12 md:py-16">
        <SuccessIcon />

        <h1 className="mt-8 text-center font-display text-3xl font-black leading-tight text-white md:text-4xl">
          {awaitingOnlinePayment
            ? "طلبك في انتظار الدفع أونلاين"
            : "شكراً! تم استلام طلبك بنجاح"}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-center text-base text-white/75">
          {awaitingOnlinePayment ? (
            <>
              لم يكتمل الدفع بعد. إذا أغلقت نافذة PayPal، اتصل بالمطعم وأعطهم رقم
              الطلب، أو أعد الطلب من المنيو.
            </>
          ) : (
            <>سيتصل بك فريقنا المختص قريباً لتأكيد الطلبية معك.</>
          )}
        </p>

        {orderId ? (
          <>
            <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.06] p-6 text-right shadow-xl backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-white/45">
                ملخص الطلب
              </p>
              <p className="mt-1 text-sm text-white/55">
                رقم الطلب:{" "}
                <span className="font-mono text-lg font-bold text-baraka-gold">
                  #{orderId}
                </span>
              </p>

              {detail ? (
                <>
                  <p className="mt-4 text-xs text-white/50">طريقة الدفع</p>
                  <p className="text-sm font-semibold text-white">
                    {paymentLabelAr(detail.paymentMethod)}
                  </p>

                  <div className="mt-5 space-y-2 border-t border-white/10 pt-5 text-sm text-white/80">
                    <div className="flex justify-between gap-3">
                      <span className="text-white/50">الاسم</span>
                      <span className="font-medium text-white">
                        {detail.customerName}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-white/50">الهاتف</span>
                      <span dir="ltr" className="font-mono text-white">
                        {formatMoroccoPhoneDisplay(detail.phone)}
                      </span>
                    </div>
                  </div>

                  <ul className="mt-6 space-y-4 border-t border-white/10 pt-5">
                    {detail.items.map((it, idx) => (
                      <li
                        key={`${it.name}-${idx}`}
                        className="flex gap-3 rounded-2xl border border-white/10 bg-black/25 p-3"
                      >
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-black/40">
                          {it.image ? (
                            <FlexibleImage
                              src={it.image}
                              alt={it.name}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1 text-right">
                          <p className="font-medium text-white">{it.name}</p>
                          <p className="text-xs text-white/55">
                            ×{it.quantity} — ثمن الوحدة{" "}
                            {it.unitPrice.toFixed(0)} {t.currency}
                          </p>
                          <p className="mt-1 text-sm font-bold text-baraka-gold">
                            {it.totalPrice.toFixed(0)} {t.currency}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex justify-between border-t border-white/10 pt-5 text-lg font-bold text-white">
                    <span>المجموع</span>
                    <span className="text-baraka-gold">
                      {detail.total.toFixed(0)} {t.currency}
                    </span>
                  </div>
                </>
              ) : (
                <p className="mt-6 text-center text-sm text-white/65">
                  تم تأكيد طلبك بنجاح. إذا ما باينش التفاصيل، احتفظ برقم الطلب
                  أعلاه — يمكن متابعة التأكيد مع المطعم مباشرة.
                </p>
              )}
            </div>

            {addonErr ? (
              <p className="mt-4 text-center text-sm text-red-300">{addonErr}</p>
            ) : null}

            {upsellProduct && detail && !hasTeaAlready && !awaitingOnlinePayment ? (
              <div className="mt-8 space-y-3">
                <h3 className="text-center font-display text-xl font-bold text-baraka-gold">
                  عرض خاص لك
                </h3>
                <AddonCard
                  product={upsellProduct}
                  discountPrice={upsellDiscounted}
                  upsellTenPercent
                />
              </div>
            ) : null}

            {crossSellProducts.length > 0 && detail && !awaitingOnlinePayment ? (
              <div className="mt-10 space-y-4">
                <h3 className="text-center font-display text-xl font-bold text-white">
                  قد يعجبك أيضاً
                </h3>
                <div className="grid gap-4">
                  {crossSellProducts.map((p) => (
                    <AddonCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-10 flex flex-col gap-3">
              <Link
                href="/"
                className="rounded-full bg-white/10 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-white/[0.14]"
              >
                الرجوع للرئيسية
              </Link>
              <Link
                href="/menu"
                className="rounded-full border border-white/15 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-white/5"
              >
                الرجوع للمنيو
              </Link>
            </div>
          </>
        ) : (
          <p className="mt-10 text-center text-sm text-white/55">
            ما كاينش رقم الطلب فالرابط.
          </p>
        )}
      </main>
      <SiteFooter locale="ar" />
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-baraka-black text-white/60">
          …
        </div>
      }
    >
      <Inner />
    </Suspense>
  );
}
