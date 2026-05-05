"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FlexibleImage } from "@/components/flexible-image";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useCart } from "@/context/cart-context";
import { getDictionary } from "@/i18n";
import { thankYouSnapshotStorageKey } from "@/lib/thank-you-snapshot";
import type { DeliveryBand } from "@/lib/delivery";

type PaymentChoice = "COD" | "ONLINE";

type CheckoutPayOpts = {
  codEnabled: boolean;
  onlineCheckoutReady: boolean;
};

export default function CheckoutPage() {
  const t = getDictionary("ar");
  const cart = useCart();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [payOpts, setPayOpts] = useState<CheckoutPayOpts>({
    codEnabled: true,
    onlineCheckoutReady: false,
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentChoice>("COD");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [fullAddress, setFullAddress] = useState("");

  const orderSubtotal = cart.subtotal;
  const deliveryFee =
    cart.orderTypePreview === "DELIVERY" ? cart.deliveryFee : 0;
  const orderTotal = cart.total;

  const addressOk = fullAddress.trim().length >= 10;

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/checkout-options", { cache: "no-store" });
        if (!res.ok) return;
        const j = (await res.json()) as Partial<CheckoutPayOpts>;
        setPayOpts({
          codEnabled: j.codEnabled ?? true,
          onlineCheckoutReady: Boolean(j.onlineCheckoutReady),
        });
      } catch {
        /* ignore */
      }
    })();
  }, []);

  useEffect(() => {
    setPaymentMethod((pm) => {
      if (!payOpts.codEnabled && payOpts.onlineCheckoutReady) return "ONLINE";
      if (pm === "ONLINE" && !payOpts.onlineCheckoutReady && payOpts.codEnabled) {
        return "COD";
      }
      return pm;
    });
  }, [payOpts.codEnabled, payOpts.onlineCheckoutReady]);

  const canSubmit =
    cart.items.length > 0 &&
    !loading &&
    customerName.trim().length > 0 &&
    (paymentMethod === "COD"
      ? payOpts.codEnabled
      : payOpts.onlineCheckoutReady && addressOk);

  function submit() {
    setErr(null);
    setLoading(true);
    void (async () => {
      try {
        const body = {
          name: customerName.trim(),
          phone,
          whatsapp,
          paymentMethod: paymentMethod === "COD" ? "COD" : "ONLINE",
          items: cart.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          orderType: cart.orderTypePreview,
          deliveryBand:
            cart.orderTypePreview === "DELIVERY"
              ? (cart.deliveryBand ?? ("UNDER_3_KM" as DeliveryBand))
              : undefined,
          address:
            paymentMethod === "ONLINE" ? fullAddress.trim() : undefined,
        };

        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          orderId?: string;
          error?: string;
          details?: string;
          status?: number;
        };

        if (!res.ok || !data.ok || typeof data.orderId !== "string") {
          let msg = "تعذر تسجيل الطلب، حاول مرة أخرى.";
          if (data.error === "online_disabled") {
            msg = "الدفع أونلاين غير مفعّل أو غير مهيأ حالياً. جرّب الدفع عند الاستلام أو تواصل مع المطعم.";
          } else if (data.error === "cod_disabled") {
            msg = "الدفع عند الاستلام غير متاح حالياً.";
          } else if (data.error === "invalid_product") {
            msg = "أحد المنتجات غير متاح. حدّث الصفحة وأعد المحاولة.";
          }
          if (
            process.env.NEXT_PUBLIC_ORDER_API_DEBUG === "true" &&
            typeof data.error === "string"
          ) {
            msg += `\n[debug ${data.error}]`;
            if (typeof data.status === "number") msg += ` HTTP ${data.status}`;
            if (typeof data.details === "string" && data.details.length > 0) {
              msg += `\n${data.details.slice(0, 1200)}`;
            }
          }
          setErr(msg);
          setLoading(false);
          return;
        }

        if (paymentMethod === "ONLINE") {
          const poRes = await fetch("/api/payments/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderNumber: data.orderId }),
          });
          const poData = (await poRes.json().catch(() => ({}))) as {
            approvalUrl?: string;
            error?: string;
          };
          const approvalUrl =
            typeof poData.approvalUrl === "string" ? poData.approvalUrl.trim() : "";
          if (!poRes.ok || !approvalUrl) {
            setErr(
              typeof poData.error === "string"
                ? "تعذر بدء الدفع أونلاين. تواصل مع المطعم أو جرّب الدفع عند الاستلام."
                : "تعذر بدء الدفع أونلاين، حاول لاحقاً.",
            );
            setLoading(false);
            return;
          }
          window.location.href = approvalUrl;
          return;
        }

        const paymentLabel = "COD";

        const snapshot = {
          orderNumber: data.orderId,
          customerName: customerName.trim(),
          phone,
          whatsapp,
          total: orderTotal,
          paymentMethod: paymentLabel,
          paymentStatus: "UNPAID",
          items: cart.items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            unitPrice: i.price,
            totalPrice: i.price * i.quantity,
            image: i.image,
          })),
        };

        try {
          sessionStorage.setItem(
            thankYouSnapshotStorageKey(data.orderId),
            JSON.stringify(snapshot),
          );
        } catch {
          /* ignore */
        }

        cart.clear();
        window.location.href = `/thank-you?order=${encodeURIComponent(data.orderId)}`;
      } catch {
        setErr("تعذر تسجيل الطلب، حاول مرة أخرى.");
        setLoading(false);
      }
    })();
  }

  return (
    <div className="min-h-dvh bg-baraka-black">
      <SiteHeader locale="ar" />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-baraka-gold">
          {t.checkout.title}
        </h1>
        <p className="mt-2 text-sm text-white/55">{t.checkout.flowHint}</p>

        {cart.items.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-white/70">
            <p>السلة خاوية.</p>
            <Link
              className="mt-4 inline-block text-baraka-gold hover:underline"
              href="/menu"
            >
              رجع للمنيو
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <section className="glass rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-white">
                {t.checkout.summaryTitle}
              </h2>
              <div className="mt-4 space-y-4">
                {cart.items.map((i) => (
                  <div
                    key={i.productId}
                    className="flex gap-4 rounded-2xl border border-white/10 bg-black/25 p-3"
                  >
                    <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-black/40">
                      <FlexibleImage
                        src={i.image}
                        alt={i.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 text-right">
                      <p className="font-semibold text-white">{i.name}</p>
                      <p className="mt-1 text-xs text-white/55">
                        ثمن الوحدة: {i.price} {t.currency}
                      </p>
                      <p className="text-sm text-white/70">
                        الكمية: {i.quantity}
                      </p>
                      <p className="mt-1 text-sm font-bold text-baraka-gold">
                        المجموع: {i.price * i.quantity} {t.currency}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm text-white/80">
                <div className="flex justify-between">
                  <span>{t.cart.subtotal}</span>
                  <span>
                    {orderSubtotal} {t.currency}
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
                    {orderTotal} {t.currency}
                  </span>
                </div>
              </div>
            </section>

            <section className="glass rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-white">
                {t.checkout.paymentSectionTitle}
              </h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  disabled={!payOpts.codEnabled}
                  onClick={() => setPaymentMethod("COD")}
                  className={`rounded-2xl border p-4 text-right transition disabled:cursor-not-allowed disabled:opacity-45 ${
                    paymentMethod === "COD"
                      ? "border-baraka-gold bg-baraka-gold/10"
                      : "border-white/15 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <p className="font-bold text-white">{t.checkout.codCardTitle}</p>
                  <p className="mt-2 text-xs text-white/65">
                    {t.checkout.codCardShort}
                  </p>
                  {!payOpts.codEnabled ? (
                    <p className="mt-2 text-xs text-amber-200/90">غير متاح حالياً</p>
                  ) : null}
                </button>
                <button
                  type="button"
                  disabled={!payOpts.onlineCheckoutReady}
                  onClick={() => setPaymentMethod("ONLINE")}
                  className={`rounded-2xl border p-4 text-right transition disabled:cursor-not-allowed disabled:opacity-45 ${
                    paymentMethod === "ONLINE"
                      ? "border-baraka-gold bg-baraka-gold/10"
                      : "border-white/15 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <p className="font-bold text-white">
                    {t.checkout.onlineCardTitle}
                  </p>
                  <p className="mt-2 text-xs text-white/65">
                    {payOpts.onlineCheckoutReady
                      ? t.checkout.onlineCardShort
                      : t.checkout.onlineUnavailableShort}
                  </p>
                </button>
              </div>
              {!payOpts.codEnabled && !payOpts.onlineCheckoutReady ? (
                <p className="mt-4 text-sm text-amber-200/90">
                  لا توجد وسيلة دفع مفعّلة حالياً. رجاءً اتصل بالمطعم لإتمام الطلب.
                </p>
              ) : null}
            </section>

            <section className="glass rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-white">
                {t.checkout.customerSectionTitle}
              </h2>
              <div className="mt-4 grid gap-4">
                <label className="block text-sm text-white/70">
                  {t.checkout.fields.name}
                  <span className="text-red-300"> *</span>
                  <input
                    className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-baraka-gold/50"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    autoComplete="name"
                  />
                </label>
                <label className="block text-sm text-white/70">
                  {t.checkout.fields.phone}
                  <span className="text-red-300"> *</span>
                  <input
                    className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-baraka-gold/50"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0612345678 أو +212612345678"
                    inputMode="tel"
                    autoComplete="tel-national"
                  />
                </label>
                <label className="block text-sm text-white/70">
                  {t.checkout.fields.whatsapp}
                  <span className="text-red-300"> *</span>
                  <input
                    className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-baraka-gold/50"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="0712345678 أو +212712345678"
                    inputMode="tel"
                  />
                </label>

                {paymentMethod === "ONLINE" ? (
                  <div className="border-t border-white/10 pt-4">
                    <h3 className="text-sm font-semibold text-baraka-gold">
                      {t.checkout.addressSectionTitle}
                    </h3>
                    <label className="mt-4 block text-sm text-white/70">
                      {t.checkout.fields.fullAddress}
                      <span className="text-red-300"> *</span>
                      <textarea
                        className="mt-2 min-h-[100px] w-full rounded-xl border border-white/15 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-baraka-gold/50"
                        value={fullAddress}
                        onChange={(e) => setFullAddress(e.target.value)}
                        placeholder="مثال: الدار البيضاء، المعاريف، شارع …، رقم المنزل …"
                      />
                    </label>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="glass rounded-2xl border border-baraka-moroccan/25 bg-baraka-moroccan/10 p-5">
              <h2 className="text-lg font-semibold text-white">
                {t.checkout.orderMethodTitle}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                {t.checkout.orderMethodBody}
              </p>
              <p className="mt-3 text-xs text-white/45">
                نوع الطلب محدد من السلة (
                {cart.orderTypePreview === "DELIVERY"
                  ? "توصيل"
                  : "استلام من المطعم"}
                ).
              </p>
            </section>

            {err ? (
              <p className="whitespace-pre-wrap break-words text-sm text-red-300">
                {err}
              </p>
            ) : null}

            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => submit()}
              className="w-full rounded-full bg-gradient-to-l from-baraka-gold to-baraka-goldlight py-3.5 text-sm font-bold text-baraka-black shadow-lg disabled:opacity-40"
            >
              {loading ? "جاري المعالجة…" : t.checkout.confirmOrder}
            </button>
          </div>
        )}
      </main>
      <SiteFooter locale="ar" />
    </div>
  );
}
