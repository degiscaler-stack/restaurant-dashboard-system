"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { getDictionary, type Locale } from "@/i18n";
import { SiteSearchOverlay } from "@/components/site-search-overlay";

function BrandMark({ brand }: { brand: string }) {
  return (
    <span className="truncate font-display text-[0.9375rem] font-semibold tracking-[0.02em] text-baraka-goldlight md:text-lg">
      {brand}
    </span>
  );
}

export function SiteHeader({ locale = "ar" }: { locale?: Locale }) {
  const t = getDictionary(locale);
  const { items } = useCart();
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const [mounted, setMounted] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileNavOpen]);

  const navLinkClass =
    "relative rounded-lg px-2 py-1.5 text-sm font-medium text-white/78 transition hover:text-baraka-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-baraka-gold/50 md:text-[0.9375rem]";

  const iconGhost =
    "inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-white/22 hover:bg-white/[0.08]";

  const cartClass =
    "group relative inline-flex h-11 min-w-[2.75rem] items-center justify-center rounded-xl border border-baraka-gold/40 bg-gradient-to-b from-baraka-gold/15 to-transparent px-3 text-baraka-goldlight shadow-[inset_0_1px_0_rgba(232,212,139,0.12)] transition hover:border-baraka-gold/60 hover:from-baraka-gold/22 hover:to-white/[0.03]";

  const mobileDrawer =
    mounted && mobileNavOpen ? (
      <>
        <button
          type="button"
          className="fixed inset-0 z-[210] bg-black/85 backdrop-blur-md md:hidden"
          aria-label="إغلاق القائمة"
          onClick={() => setMobileNavOpen(false)}
        />
        <aside
          className="fixed inset-y-0 end-0 z-[211] flex w-[min(100%,300px)] flex-col border-s border-white/12 bg-[#070707]/98 shadow-[-12px_0_48px_rgba(0,0,0,0.65)] backdrop-blur-xl md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="قائمة التنقل"
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4">
            <span className="min-w-0 truncate font-display text-sm font-semibold tracking-wide text-baraka-goldlight">
              {t.brand}
            </span>
            <button
              type="button"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/14 bg-white/[0.06] text-white transition hover:bg-white/12"
              aria-label="إغلاق"
              onClick={() => setMobileNavOpen(false)}
            >
              <X className="h-5 w-5" strokeWidth={2.25} aria-hidden />
            </button>
          </div>
          <nav className="flex flex-col gap-1 p-4" aria-label="التنقل">
            <Link
              href="/"
              className="rounded-xl px-4 py-3.5 text-base font-medium text-white/92 transition hover:bg-white/[0.08]"
              onClick={() => setMobileNavOpen(false)}
            >
              {t.nav.home}
            </Link>
            <Link
              href="/menu"
              className="rounded-xl px-4 py-3.5 text-base font-medium text-white/92 transition hover:bg-white/[0.08]"
              onClick={() => setMobileNavOpen(false)}
            >
              {t.nav.menu}
            </Link>
            <Link
              href="/about"
              className="rounded-xl px-4 py-3.5 text-base font-medium text-white/92 transition hover:bg-white/[0.08]"
              onClick={() => setMobileNavOpen(false)}
            >
              {t.nav.about}
            </Link>
            <Link
              href="/contact"
              className="rounded-xl px-4 py-3.5 text-base font-medium text-white/92 transition hover:bg-white/[0.08]"
              onClick={() => setMobileNavOpen(false)}
            >
              {t.nav.contact}
            </Link>
          </nav>
        </aside>
      </>
    ) : null;

  return (
    <>
      <header className="sticky top-0 z-[100] border-b border-white/10 bg-baraka-black/85 backdrop-blur-xl supports-[backdrop-filter]:bg-baraka-black/70">
        <div className="mx-auto max-w-6xl px-4 sm:px-5">
          {/* Mobile */}
          <div className="flex min-h-[52px] items-center justify-between gap-3 overflow-x-hidden py-2.5 md:hidden">
            <Link href="/" className="min-w-0 max-w-[calc(100%-9.5rem)] shrink">
              <BrandMark brand={t.brand} />
            </Link>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                className={iconGhost}
                aria-label="بحث"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-[22px] w-[22px]" strokeWidth={2} aria-hidden />
              </button>
              <Link
                href="/cart"
                className={cartClass}
                aria-label={t.nav.cart}
              >
                <ShoppingCart
                  className="h-[22px] w-[22px] transition group-hover:scale-[1.02]"
                  strokeWidth={2}
                  aria-hidden
                />
                {count > 0 ? (
                  <span className="absolute -end-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-baraka-wine px-1 text-[10px] font-bold leading-none text-white ring-2 ring-[#070707]">
                    {count > 99 ? "99+" : count}
                  </span>
                ) : null}
              </Link>
              <button
                type="button"
                className={iconGhost}
                aria-label="فتح القائمة"
                aria-expanded={mobileNavOpen}
                onClick={() => setMobileNavOpen(true)}
              >
                <Menu className="h-[22px] w-[22px]" strokeWidth={2} aria-hidden />
              </button>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden min-h-[56px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 py-2.5 md:grid lg:gap-8 lg:py-3">
            <div className="min-w-0 justify-self-start ps-0.5">
              <Link href="/" className="inline-block max-w-[min(100%,14rem)] lg:max-w-xs">
                <BrandMark brand={t.brand} />
              </Link>
            </div>

            <nav
              className="flex items-center justify-center gap-5 lg:gap-8"
              aria-label="التنقل الرئيسي"
            >
              <Link className={navLinkClass} href="/">
                {t.nav.home}
              </Link>
              <Link className={navLinkClass} href="/menu">
                {t.nav.menu}
              </Link>
              <Link className={navLinkClass} href="/about">
                {t.nav.about}
              </Link>
              <Link className={navLinkClass} href="/contact">
                {t.nav.contact}
              </Link>
            </nav>

            <div className="flex items-center justify-end gap-2 justify-self-end pe-0.5">
              <button
                type="button"
                className={iconGhost}
                aria-label="بحث"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-[22px] w-[22px]" strokeWidth={2} aria-hidden />
              </button>
              <Link href="/cart" className={cartClass} aria-label={t.nav.cart}>
                <ShoppingCart
                  className="h-[22px] w-[22px] transition group-hover:scale-[1.02]"
                  strokeWidth={2}
                  aria-hidden
                />
                {count > 0 ? (
                  <span className="absolute -end-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-baraka-wine px-1 text-[10px] font-bold leading-none text-white ring-2 ring-baraka-black">
                    {count > 99 ? "99+" : count}
                  </span>
                ) : null}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {mounted && mobileDrawer ? createPortal(mobileDrawer, document.body) : null}
      <SiteSearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
