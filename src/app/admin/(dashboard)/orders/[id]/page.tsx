"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ORDER_STATUSES_ORDERED,
  orderStatusLabelAr,
  paymentMethodLabelAr,
  paymentStatusLabelAr,
} from "@/lib/admin-ui-labels";

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  whatsapp?: string | null;
  city: string;
  area: string;
  address: string;
  mapsLink?: string | null;
  orderType: string;
  orderTiming: string;
  scheduledAt?: string | null;
  deliveryFee: number;
  subtotal: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  notes?: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
};

function orderTypeLabelAr(t: string): string {
  if (t === "DELIVERY") return "توصيل";
  if (t === "PICKUP") return "استلام من المطعم";
  return t;
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<string>("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch(`/api/admin/orders/${id}`, { credentials: "include" });
      if (!res.ok) return;
      const o = await res.json();
      setOrder(o);
      setStatus(o.orderStatus);
    })();
  }, [id]);

  const wa = useMemo(() => {
    if (!order) return "#";
    const text = encodeURIComponent(
      `طلب #${order.orderNumber} — ${order.customerName} — ${order.phone}`,
    );
    const digits = (order.whatsapp || order.phone).replace(/\D/g, "");
    return `https://wa.me/${digits}?text=${text}`;
  }, [order]);

  async function saveStatus() {
    setMsg(null);
    if (!status) return;
    const res = await fetch(`/api/admin/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ orderStatus: status }),
    });
    const data = (await res.json().catch(() => ({}))) as { messageAr?: string };
    if (res.ok) {
      setMsg(data.messageAr ?? "تم تحديث حالة الطلب بنجاح.");
      return;
    }
    setMsg(
      typeof data.messageAr === "string"
        ? data.messageAr
        : "تعذر حفظ الحالة. حاول مرة أخرى.",
    );
  }

  if (!order) {
    return <p className="text-sm text-white/60">جاري تحميل تفاصيل الطلب…</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">طلب #{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-white/55">{new Date(order.createdAt).toLocaleString("ar-MA")}</p>
        </div>
        <Link href="/admin/orders" className="text-sm text-amber-200 hover:underline">
          الرجوع لقائمة الطلبات
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/75">
          <p>
            <span className="text-white/50">الزبون:</span> {order.customerName}
          </p>
          <p className="mt-2">
            <span className="text-white/50">الهاتف:</span> {order.phone}
          </p>
          <p className="mt-2">
            <span className="text-white/50">العنوان:</span> {order.city} — {order.area} —{" "}
            {order.address}
          </p>
          <p className="mt-2">
            <span className="text-white/50">نوع الطلب:</span> {orderTypeLabelAr(order.orderType)}
          </p>
          <p className="mt-2">
            <span className="text-white/50">الدفع:</span>{" "}
            {paymentMethodLabelAr(order.paymentMethod)} —{" "}
            {paymentStatusLabelAr(order.paymentStatus)}
          </p>
          <p className="mt-2">
            <span className="text-white/50">حالة الطلب الحالية:</span>{" "}
            {orderStatusLabelAr(order.orderStatus)}
          </p>
          <p className="mt-2">
            <span className="text-white/50">الملاحظات:</span> {order.notes || "—"}
          </p>
          <a
            className="mt-4 inline-flex rounded-full bg-emerald-900/40 px-4 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-900/60"
            href={wa}
            target="_blank"
            rel="noreferrer"
          >
            فتح محادثة واتساب مع الزبون
          </a>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/60">تغيير حالة الطلب</p>
          <select
            className="mt-3 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-3 text-sm text-white outline-none"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {ORDER_STATUSES_ORDERED.map((s) => (
              <option key={s} value={s}>
                {orderStatusLabelAr(s)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void saveStatus()}
            className="mt-4 w-full rounded-full bg-amber-400 py-3 text-sm font-bold text-zinc-950"
          >
            حفظ الحالة
          </button>
          {msg ? <p className="mt-3 text-sm text-white/70">{msg}</p> : null}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-sm font-semibold text-white">أطباق الطلب</p>
        <div className="mt-4 space-y-2 text-sm text-white/75">
          {order.items.map((i) => (
            <div key={i.id} className="flex justify-between gap-3">
              <span>
                {i.productName} ×{i.quantity}
              </span>
              <span>{i.totalPrice} درهم</span>
            </div>
          ))}
        </div>
        <div className="mt-6 border-t border-white/10 pt-4 text-sm">
          <div className="flex justify-between text-white/70">
            <span>المجموع الفرعي</span>
            <span>{order.subtotal} درهم</span>
          </div>
          <div className="mt-2 flex justify-between text-white/70">
            <span>رسوم التوصيل</span>
            <span>{order.deliveryFee} درهم</span>
          </div>
          <div className="mt-3 flex justify-between text-lg font-bold text-amber-200">
            <span>الإجمالي</span>
            <span>{order.total} درهم</span>
          </div>
        </div>
      </div>
    </div>
  );
}
