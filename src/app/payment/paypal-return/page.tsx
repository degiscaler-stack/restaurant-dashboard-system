"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/cart-context";

function Inner() {
  const sp = useSearchParams();
  const router = useRouter();
  const cart = useCart();
  const [msg, setMsg] = useState("جاري تأكيد الدفع…");

  useEffect(() => {
    const token = sp.get("token");
    if (!token) {
      setMsg("رابط غير صالح");
      return;
    }
    void (async () => {
      try {
        const res = await fetch("/api/payments/paypal/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paypalOrderId: token }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          router.replace(
            `/payment/failed?orderNumber=${encodeURIComponent(data.orderNumber ?? "")}`,
          );
          return;
        }
        cart.clear();
        router.replace(
          `/thank-you?order=${encodeURIComponent(data.orderNumber as string)}`,
        );
      } catch {
        setMsg("تعذر تأكيد الدفع");
      }
    })();
  }, [cart, router, sp]);

  return (
    <div className="min-h-dvh bg-baraka-black px-4 py-16 text-center text-white/80">
      <p>{msg}</p>
      <Link className="mt-6 inline-block text-baraka-gold hover:underline" href="/cart">
        الرجوع للسلة
      </Link>
    </div>
  );
}

export default function PaypalReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-baraka-black p-10 text-center text-white/60">…</div>
      }
    >
      <Inner />
    </Suspense>
  );
}
