import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getDictionary } from "@/i18n";
import {
  getPublicSiteContact,
  telHref,
  whatsappHref,
} from "@/lib/public-site-contact";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "اتصل بنا — مطعم وشواية البركة الكبرى",
  description:
    "هاتف، واتساب، البريد، عنوان المطعم وساعات العمل — مطعم وشواية البركة الكبرى، الدار البيضاء.",
};

export default async function ContactPage() {
  const t = getDictionary("ar");
  const c = await getPublicSiteContact();

  return (
    <div className="min-h-dvh bg-baraka-black">
      <SiteHeader locale="ar" />
      <main className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        <p className="text-center text-sm font-semibold text-baraka-gold">{t.brandAr}</p>
        <h1 className="mt-2 text-center font-display text-3xl font-bold text-white md:text-4xl">
          اتصل بنا
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-sm text-white/65 md:text-base">
          فريق المطعم متاح باش يجاوب على أسئلتكم، يؤكد الطلبيات، ويوضّح التوصيل والدفع.
        </p>

        <div className="mt-10 glass space-y-6 rounded-3xl p-6 md:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/50">المطعم</p>
            <p className="mt-1 font-display text-lg font-bold text-white">{c.restaurantName}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-white/50">الهاتف</p>
              <a href={telHref(c.phone)} className="mt-1 block text-baraka-gold hover:underline">
                {c.phone}
              </a>
            </div>
            <div>
              <p className="text-xs font-semibold text-white/50">واتساب</p>
              <a
                href={whatsappHref(c.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-baraka-gold hover:underline"
              >
                راسلنا على واتساب
              </a>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs font-semibold text-white/50">البريد الإلكتروني</p>
              <a href={`mailto:${c.email}`} className="mt-1 block text-baraka-gold hover:underline">
                {c.email}
              </a>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-white/50">العنوان</p>
            <p className="mt-1 text-white/85">{c.address}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-white/50">ساعات العمل</p>
            <p className="mt-1 text-white/85">{c.openingHours}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-white/50">التوصيل</p>
            <p className="mt-1 text-white/85">{c.deliveryRules}</p>
          </div>

          {(c.facebookUrl || c.instagramUrl || c.tiktokUrl) && (
            <div>
              <p className="text-xs font-semibold text-white/50">شبكات التواصل</p>
              <ul className="mt-2 flex flex-wrap gap-3">
                {c.facebookUrl ? (
                  <li>
                    <a
                      href={c.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-baraka-gold hover:underline"
                    >
                      Facebook
                    </a>
                  </li>
                ) : null}
                {c.instagramUrl ? (
                  <li>
                    <a
                      href={c.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-baraka-gold hover:underline"
                    >
                      Instagram
                    </a>
                  </li>
                ) : null}
                {c.tiktokUrl ? (
                  <li>
                    <a
                      href={c.tiktokUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-baraka-gold hover:underline"
                    >
                      TikTok
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-black/40">
          <iframe
            title="خريطة المطعم"
            src={c.mapEmbedUrl}
            className="h-[280px] w-full md:h-[360px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>

        <p className="mt-10 text-center">
          <Link href="/menu" className="text-sm font-semibold text-baraka-gold hover:underline">
            ← رجوع للمنيو
          </Link>
        </p>
      </main>
      <SiteFooter locale="ar" />
    </div>
  );
}
