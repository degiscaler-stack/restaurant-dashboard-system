"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getDictionary } from "@/i18n";

function Inner() {
  const t = getDictionary("ar");
  const sp = useSearchParams();
  const orderNumber = sp.get("orderNumber") || "";

  async function switchCod() {
    const phone = prompt("أدخل رقم الهاتف لتأكيد الطلب") || "";
    if (!orderNumber || !phone) return;
    const res = await fetch(
      `/api/orders/${encodeURIComponent(orderNumber)}/switch-to-cod`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      },
    );
    if (res.ok) {
      window.location.href = `/thank-you?order=${encodeURIComponent(orderNumber)}`;
    } else {
      alert("تعذر التبديل — تحقق من رقم الهاتف");
    }
  }

  return (
    <div className="min-h-dvh bg-baraka-black">
      <SiteHeader locale="ar" />
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold text-baraka-wine">
          {t.paymentFailed.title}
        </h1>
        <p className="mt-4 text-white/70">{t.paymentFailed.body}</p>
        {orderNumber ? (
          <p className="mt-3 text-sm text-white/50">رقم الطلب: #{orderNumber}</p>
        ) : null}
        <div className="mt-10 flex flex-col gap-3">
          {orderNumber ? (
            <button
              type="button"
              onClick={() => {
                window.location.href = `/checkout`;
              }}
              className="rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/15"
            >
              إعادة الدفع
            </button>
          ) : null}
          {orderNumber ? (
            <button
              type="button"
              onClick={() => void switchCod()}
              className="rounded-full bg-baraka-moroccan px-6 py-3 text-sm font-semibold text-white hover:bg-baraka-moroccanlight"
            >
              اختيار الدفع عند الاستلام
            </button>
          ) : null}
          <Link
            href="/cart"
            className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/80 hover:bg-white/5"
          >
            الرجوع للسلة
          </Link>
        </div>
      </main>
      <SiteFooter locale="ar" />
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-baraka-black" />}>
      <Inner />
    </Suspense>
  );
}
