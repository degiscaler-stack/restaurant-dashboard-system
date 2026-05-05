import Link from "next/link";

const cards = [
  {
    href: "/admin/orders",
    title: "الطلبات",
    desc: "عرض الطلبات، تغيير الحالة، وتفاصيل الزبناء",
  },
  {
    href: "/admin/products",
    title: "المنتجات",
    desc: "إضافة طبق، تعديل الثمن، التوفر، والعروض",
  },
  {
    href: "/admin/categories",
    title: "التصنيفات",
    desc: "أقسام المنيو وترتيبها",
  },
  {
    href: "/admin/settings",
    title: "الإعدادات",
    desc: "الهاتف، الواتساب، الخريطة، وتفعيل الدفع أونلاين أو عند الاستلام",
  },
] as const;

export default function AdminDashboardHomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white">لوحة الإدارة</h1>
      <p className="mt-2 text-sm text-white/55">
        إدارة كاملة للمنيو، الطلبات، والتواصل مع الزبناء
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-amber-300/40 hover:bg-white/10"
          >
            <p className="text-lg font-semibold text-amber-200">{card.title}</p>
            <p className="mt-2 text-sm text-white/60">{card.desc}</p>
            <span className="mt-4 inline-block text-xs font-semibold text-amber-400/90">
              فتح ←
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
