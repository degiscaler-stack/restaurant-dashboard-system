import Link from "next/link";
import { getDictionary, type Locale } from "@/i18n";
import { STATIC_CONTACT_FALLBACK, telHref } from "@/lib/public-site-contact";

const PHONE_DISPLAY = STATIC_CONTACT_FALLBACK.phone;

export function SiteFooter({ locale = "ar" }: { locale?: Locale }) {
  const t = getDictionary(locale);
  return (
    <footer className="mt-16 border-t border-white/10 bg-black/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="font-display text-lg text-baraka-gold">{t.brand}</p>
          <p className="mt-2 text-sm text-white/70">{t.tagline}</p>
        </div>
        <div className="text-sm text-white/75">
          <p className="font-semibold text-white">اتصال</p>
          <p className="mt-2">
            <a className="hover:text-baraka-gold" href={telHref(STATIC_CONTACT_FALLBACK.phone)}>
              {PHONE_DISPLAY}
            </a>
          </p>
          <p className="mt-1">
            <a className="hover:text-baraka-gold" href={`mailto:${STATIC_CONTACT_FALLBACK.email}`}>
              {STATIC_CONTACT_FALLBACK.email}
            </a>
          </p>
          <p className="mt-3 text-xs text-white/55">{STATIC_CONTACT_FALLBACK.address}</p>
        </div>
        <div className="text-sm text-white/75">
          <p className="font-semibold text-white">روابط</p>
          <ul className="mt-2 space-y-2">
            <li>
              <Link className="hover:text-baraka-gold" href="/about">
                {t.nav.about}
              </Link>
            </li>
            <li>
              <Link className="hover:text-baraka-gold" href="/contact">
                {t.nav.contact}
              </Link>
            </li>
            <li>
              <Link className="hover:text-baraka-gold" href="/menu">
                {t.nav.menu}
              </Link>
            </li>
            <li>
              <Link className="hover:text-baraka-gold" href="/cart">
                {t.nav.cart}
              </Link>
            </li>
            <li>
              <Link className="hover:text-baraka-gold" href="/admin/login">
                {t.nav.admin}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/45">
        © {new Date().getFullYear()} Le Grand Baraka Grill
      </div>
    </footer>
  );
}
