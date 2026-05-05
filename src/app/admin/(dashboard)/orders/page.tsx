"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  orderStatusLabelAr,
  paymentMethodLabelAr,
  paymentStatusLabelAr,
} from "@/lib/admin-ui-labels";

type Row = {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  total: number;
  paymentMethod: string;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  itemCount: number;
};

export default function AdminOrdersPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    void (async () => {
      const [oRes, nRes] = await Promise.all([
        fetch("/api/admin/orders", { credentials: "include" }),
        fetch("/api/admin/notifications", { credentials: "include" }),
      ]);
      if (oRes.ok) setRows(await oRes.json());
      if (nRes.ok) {
        const n = await nRes.json();
        setUnread(n.unread ?? 0);
      }
    })();
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">الطلبات</h1>
          <p className="mt-1 text-sm text-white/55">
            إشعارات غير مقروءة: <span className="text-amber-200">{unread}</span>
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-[900px] w-full border-collapse text-sm">
          <thead className="bg-white/5 text-left text-white/60">
            <tr>
              <th className="p-3">رقم الطلب</th>
              <th className="p-3">الزبون</th>
              <th className="p-3">الهاتف</th>
              <th className="p-3">المبلغ</th>
              <th className="p-3">الدفع</th>
              <th className="p-3">الحالة</th>
              <th className="p-3">الوقت</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="p-3 font-mono text-xs text-amber-200">#{r.orderNumber}</td>
                <td className="p-3">{r.customerName}</td>
                <td className="p-3 font-mono text-xs">{r.phone}</td>
                <td className="p-3">{r.total} درهم</td>
                <td className="p-3 text-xs">
                  {paymentMethodLabelAr(r.paymentMethod)}
                  <span className="mt-1 block text-[11px] text-white/45">
                    {paymentStatusLabelAr(r.paymentStatus)}
                  </span>
                </td>
                <td className="p-3 text-xs">{orderStatusLabelAr(r.orderStatus)}</td>
                <td className="p-3 text-xs text-white/55">
                  {new Date(r.createdAt).toLocaleString("ar-MA")}
                </td>
                <td className="p-3">
                  <Link className="text-amber-200 hover:underline" href={`/admin/orders/${r.id}`}>
                    تفاصيل
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
