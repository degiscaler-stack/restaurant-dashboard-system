import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getDictionary } from "@/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "من نحن — مطعم وشواية البركة الكبرى",
  description:
    "تعرّف على مطعم وشواية البركة الكبرى: مشاوي على الفحم، أطباق مغربية أصيلة، وخدمة توصيل في الدار البيضاء.",
};

export default function AboutPage() {
  const t = getDictionary("ar");

  return (
    <div className="min-h-dvh bg-baraka-black">
      <SiteHeader locale="ar" />
      <main className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        <p className="text-center text-sm font-semibold text-baraka-gold">
          {t.brandAr}
        </p>
        <h1 className="mt-2 text-center font-display text-3xl font-bold text-white md:text-4xl">
          من نحن
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-white/65 md:text-base">
          مطعم وشواية البركة الكبرى (Le Grand Baraka Grill) داركم باش تجمعوا على المذاق المغربي الحقيقي، مع توصيل
          لباب الدّار وفريق متابع لتلبية الطلبات.
        </p>

        <div className="mt-12 space-y-8 text-sm leading-relaxed text-white/78 md:text-base">
          <section className="glass rounded-3xl p-6 md:p-8">
            <h2 className="font-display text-xl font-bold text-baraka-gold md:text-2xl">
              رسالتنا
            </h2>
            <p className="mt-3">
              كنخدمكم أكلات بالجودة اللي كنتموّلوها فالبيت: حريرة وبيصارة وطبخ يومي، مشاوي مشكلة على الفحم، وطواجن
              كيجيبوا نفس الأم وهي طايحة للدار بكل احترام وسرعة معقولة.
            </p>
          </section>

          <section className="glass rounded-3xl p-6 md:p-8">
            <h2 className="font-display text-xl font-bold text-baraka-gold md:text-2xl">
              شنو كانتميّزو به
            </h2>
            <ul className="mt-4 list-disc space-y-2 pe-5 marker:text-baraka-gold">
              <li>شواية فحم ومكونات مختارة باش الطبق يبقى بنين ومقرمش فكل طلبية.</li>
              <li>منيو متنوّع: شعبيات، مشاوي، طواجن، مشروبات وعروض للعائلة.</li>
              <li>طلب أونلاين بوضوح — تعرض المنيو، زِد للسلة، وكمّل الطلب كيف ما يخدمكم.</li>
              <li>توصيل بمدينة الدار البيضاء مع شرائح مسافة أوضح (حتى 3 كم، 3 إلى 6 كم، وأكثر بتواصل).</li>
            </ul>
          </section>

          <section className="glass rounded-3xl p-6 md:p-8">
            <h2 className="font-display text-xl font-bold text-baraka-gold md:text-2xl">
              شكراً على الثقة ديالكم
            </h2>
            <p className="mt-3">
              الزبناء ديالنا هم الأساس. كل ملاحظة كتوصلنا كنقراوها باش نحسّنو الخدمة والجودة ديال المنيو
              والتوصيل.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/menu"
                className="rounded-full bg-gradient-to-l from-baraka-gold to-baraka-goldlight px-6 py-3 text-sm font-bold text-baraka-black"
              >
                {t.cta.viewMenu}
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                {t.nav.contact}
              </Link>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter locale="ar" />
    </div>
  );
}
