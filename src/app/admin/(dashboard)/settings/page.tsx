"use client";

import { useEffect, useState } from "react";

type Settings = {
  id: string;
  restaurantName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  openingHours: string;
  deliveryRules: string;
  paypalEnabled: boolean;
  codEnabled: boolean;
  onlinePaymentEnabled: boolean;
  googleMapsEmbedUrl?: string | null;
};

export default function AdminSettingsPage() {
  const [s, setS] = useState<Settings | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/admin/settings", { credentials: "include" });
      if (res.ok) setS(await res.json());
    })();
  }, []);

  async function save() {
    if (!s) return;
    setMsg(null);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        restaurantName: s.restaurantName,
        phone: s.phone,
        whatsapp: s.whatsapp,
        email: s.email,
        address: s.address,
        openingHours: s.openingHours,
        deliveryRules: s.deliveryRules,
        paypalEnabled: s.paypalEnabled,
        codEnabled: s.codEnabled,
        onlinePaymentEnabled: s.onlinePaymentEnabled,
        googleMapsEmbedUrl: s.googleMapsEmbedUrl || "",
      }),
    });
    setMsg(
      res.ok
        ? "تم حفظ الإعدادات بنجاح."
        : "تعذر حفظ الإعدادات. تحقق من البيانات أو الصلاحيات.",
    );
  }

  if (!s) return <p className="text-sm text-white/60">جاري التحميل…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">إعدادات المطعم</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <label className="text-xs text-white/60">
          الاسم
          <input
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            value={s.restaurantName}
            onChange={(e) => setS({ ...s, restaurantName: e.target.value })}
          />
        </label>
        <label className="text-xs text-white/60">
          الهاتف
          <input
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            value={s.phone}
            onChange={(e) => setS({ ...s, phone: e.target.value })}
          />
        </label>
        <label className="text-xs text-white/60">
          واتساب
          <input
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            value={s.whatsapp}
            onChange={(e) => setS({ ...s, whatsapp: e.target.value })}
          />
        </label>
        <label className="text-xs text-white/60">
          الإيميل
          <input
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            value={s.email}
            onChange={(e) => setS({ ...s, email: e.target.value })}
          />
        </label>
        <label className="text-xs text-white/60 md:col-span-2">
          العنوان
          <input
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            value={s.address}
            onChange={(e) => setS({ ...s, address: e.target.value })}
          />
        </label>
        <label className="text-xs text-white/60 md:col-span-2">
          ساعات العمل
          <input
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            value={s.openingHours}
            onChange={(e) => setS({ ...s, openingHours: e.target.value })}
          />
        </label>
        <label className="text-xs text-white/60 md:col-span-2">
          مصاريف التوصيل (نص)
          <textarea
            className="mt-1 min-h-[90px] w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            value={s.deliveryRules}
            onChange={(e) => setS({ ...s, deliveryRules: e.target.value })}
          />
        </label>
        <label className="text-xs text-white/60 md:col-span-2">
          رابط تضمين خريطة Google (iframe)
          <input
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            value={s.googleMapsEmbedUrl ?? ""}
            onChange={(e) => setS({ ...s, googleMapsEmbedUrl: e.target.value })}
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            checked={s.paypalEnabled}
            onChange={(e) => setS({ ...s, paypalEnabled: e.target.checked })}
          />
          تفعيل الدفع عبر PayPal
        </label>
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            checked={s.codEnabled}
            onChange={(e) => setS({ ...s, codEnabled: e.target.checked })}
          />
          الدفع عند الاستلام
        </label>
        <label className="flex items-center gap-2 text-sm text-white/70 md:col-span-2">
          <input
            type="checkbox"
            checked={s.onlinePaymentEnabled}
            onChange={(e) => setS({ ...s, onlinePaymentEnabled: e.target.checked })}
          />
          الدفع أونلاين
        </label>
      </div>

      <button
        type="button"
        onClick={() => void save()}
        className="mt-8 rounded-full bg-amber-400 px-8 py-3 text-sm font-bold text-zinc-950"
      >
        حفظ
      </button>
      {msg ? <p className="mt-4 text-sm text-white/70">{msg}</p> : null}
    </div>
  );
}
