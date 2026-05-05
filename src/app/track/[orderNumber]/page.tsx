import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { resolveRestaurantId } from "@/lib/tenant";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const dynamic = "force-dynamic";

export default async function TrackPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const restaurantId = await resolveRestaurantId();
  if (!restaurantId) notFound();

  const { orderNumber } = await params;
  const decoded = decodeURIComponent(orderNumber);
  const order = await prisma.order.findFirst({
    where: { restaurantId, orderNumber: decoded },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <div className="min-h-dvh bg-baraka-black">
      <SiteHeader locale="ar" />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-baraka-gold">تتبع الطلب</h1>
        <p className="mt-2 text-sm text-white/60">#{order.orderNumber}</p>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="grid gap-3 text-sm text-white/75">
            <div className="flex justify-between gap-3">
              <span>الحالة</span>
              <span className="font-semibold text-white">{order.orderStatus}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span>الدفع</span>
              <span className="font-semibold text-white">{order.paymentStatus}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span>المجموع</span>
              <span className="font-semibold text-baraka-gold">{Number(order.total)} MAD</span>
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-6">
            <p className="text-sm font-semibold text-white">الأطباق</p>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              {order.items.map((i) => (
                <li key={i.id} className="flex justify-between gap-3">
                  <span>
                    {i.productName} ×{i.quantity}
                  </span>
                  <span>{Number(i.totalPrice)} MAD</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-baraka-gold hover:underline">
            الرجوع للرئيسية
          </Link>
        </div>
      </main>
      <SiteFooter locale="ar" />
    </div>
  );
}
