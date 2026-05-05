import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { getAdminFromCookies } from "@/lib/auth";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminFromCookies();
  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-dvh bg-zinc-950 text-white">
      <div className="border-b border-white/10 bg-black/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
          <Link href="/admin/orders" className="font-semibold text-amber-200">
            لوحة إدارة المطعم
          </Link>
          <nav className="flex flex-wrap gap-3 text-white/70">
            <Link className="hover:text-amber-200" href="/admin/orders">
              الطلبات
            </Link>
            <Link className="hover:text-amber-200" href="/admin/products">
              المنيو
            </Link>
            <Link className="hover:text-amber-200" href="/admin/categories">
              التصنيفات
            </Link>
            <Link className="hover:text-amber-200" href="/admin/settings">
              الإعدادات
            </Link>
            <AdminLogoutButton />
            <Link className="hover:text-amber-200" href="/">
              الموقع
            </Link>
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
