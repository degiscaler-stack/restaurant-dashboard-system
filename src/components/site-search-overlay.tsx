"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

type ProductHit = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: { name: string; slug: string };
};

const STATIC_PAGES: { href: string; label: string; needles: string[] }[] = [
  { href: "/", label: "الرئيسية", needles: ["الرئيسية", "رئيسية"] },
  { href: "/menu", label: "المنيو", needles: ["المنيو", "منيو"] },
  { href: "/about", label: "من نحن", needles: ["من نحن", "نحن"] },
  { href: "/contact", label: "اتصل بنا", needles: ["اتصل بنا", "اتصل", "تواصل"] },
];

function matchStaticPages(q: string): { href: string; label: string }[] {
  const t = q.trim();
  if (t.length < 1) return [];
  return STATIC_PAGES.filter((p) =>
    p.needles.some((n) => n.includes(t) || t.includes(n)),
  ).map(({ href, label }) => ({ href, label }));
}

export function SiteSearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductHit[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setProducts([]);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = query.trim();
    if (t.length < 2) {
      setProducts([]);
      setLoading(false);
      return;
    }
    const ac = new AbortController();
    const id = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(t)}`, {
          signal: ac.signal,
          cache: "no-store",
        });
        const data = res.ok ? await res.json() : [];
        setProducts(Array.isArray(data) ? data : []);
      } catch {
        if (!ac.signal.aborted) setProducts([]);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    }, 280);
    return () => {
      window.clearTimeout(id);
      ac.abort();
    };
  }, [query, open]);

  if (!mounted || !open) return null;

  const staticHits = matchStaticPages(query);
  const qOk = query.trim().length >= 2;
  const showEmpty =
    qOk && !loading && products.length === 0 && staticHits.length === 0;

  const overlay = (
    <div
      className="fixed inset-0 z-[230] isolate flex flex-col bg-black/75 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="site-search-title"
    >
      <button
        type="button"
        className="absolute inset-0 z-0 cursor-default bg-black/40"
        aria-label="إغلاق البحث"
        onClick={onClose}
      />

      <div className="relative z-10 mx-auto w-full max-w-[min(100%,42rem)] shrink-0 px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top,0px))] sm:px-5">
        <div
          className="overflow-hidden rounded-2xl border border-white/12 bg-[#0c0c0c]/95 shadow-2xl backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="site-search-title" className="sr-only">
            بحث في الموقع والمنيو
          </h2>
          <div className="flex shrink-0 items-center gap-2 border-b border-white/10 px-3 py-3 sm:px-4">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/12 bg-black/50 px-3 py-2.5">
              <Search className="h-5 w-5 shrink-0 text-baraka-gold" strokeWidth={2} aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن طبق، تصنيف، أو صفحة..."
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/45"
                dir="rtl"
                autoComplete="off"
              />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/12 text-white/90 transition hover:bg-white/10"
              aria-label="إغلاق"
            >
              <X className="h-5 w-5" strokeWidth={2} aria-hidden />
            </button>
          </div>

          <div className="max-h-[min(420px,calc(100dvh-11rem))] overflow-y-auto overscroll-contain px-3 py-3 sm:px-4">
            {query.trim().length > 0 && query.trim().length < 2 ? (
              <p className="text-center text-sm text-white/55">اكتب حرفين على الأقل للبحث</p>
            ) : null}

            {staticHits.length > 0 ? (
              <div className="mb-6">
                <p className="mb-2 text-xs font-semibold text-white/45">صفحات الموقع</p>
                <ul className="flex flex-col gap-2">
                  {staticHits.map((p) => (
                    <li key={p.href}>
                      <Link
                        href={p.href}
                        onClick={onClose}
                        className="block rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white transition hover:border-white/18 hover:bg-white/[0.07]"
                      >
                        {p.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {loading ? (
              <p className="text-center text-sm text-white/55">جاري البحث…</p>
            ) : null}

            {products.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-semibold text-white/45">أطباق ومنتجات</p>
                <ul className="flex flex-col gap-2">
                  {products.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/products/${p.slug}`}
                        onClick={onClose}
                        className="block rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-start transition hover:border-white/18 hover:bg-white/[0.07]"
                      >
                        <span className="font-medium text-white">{p.name}</span>
                        <span className="mt-0.5 block text-xs text-white/50">
                          {p.category.name} · {p.price} MAD
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                {qOk ? (
                  <Link
                    href={`/menu?q=${encodeURIComponent(query.trim())}`}
                    onClick={onClose}
                    className="mt-4 block text-center text-sm font-medium text-baraka-gold transition hover:text-baraka-goldlight"
                  >
                    عرض النتائج في المنيو
                  </Link>
                ) : null}
              </div>
            ) : null}

            {showEmpty ? (
              <p className="py-10 text-center text-sm text-white/70">لا توجد نتائج</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
