"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { getDictionary } from "@/i18n";

type Category = { id: string; name: string; slug: string };
type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  featured: boolean;
  specialOffer: boolean;
  category: { slug: string; name: string };
};

export default function MenuClient() {
  const t = getDictionary("ar");
  const router = useRouter();
  const sp = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState(() => sp.get("category") || "all");
  const [qInput, setQInput] = useState(() => sp.get("q") || "");
  const [searchApplied, setSearchApplied] = useState(() =>
    (sp.get("q") || "").trim(),
  );

  useEffect(() => {
    setCategory(sp.get("category") || "all");
    const qq = sp.get("q") || "";
    setQInput(qq);
    setSearchApplied(qq.trim());
  }, [sp]);

  useEffect(() => {
    const t = setTimeout(() => setSearchApplied(qInput.trim()), 380);
    return () => clearTimeout(t);
  }, [qInput]);

  const syncUrl = useCallback(
    (next: { category?: string; q?: string }) => {
      const p = new URLSearchParams();
      const c = next.category ?? category;
      const qq = (next.q ?? qInput).trim();
      if (c && c !== "all") p.set("category", c);
      if (qq) p.set("q", qq);
      const qs = p.toString();
      router.replace(qs ? `/menu?${qs}` : "/menu");
    },
    [category, qInput, router],
  );

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams();
        if (category && category !== "all") qs.set("category", category);
        if (searchApplied) qs.set("q", searchApplied);
        const pq = qs.toString();

        const [cRes, pRes] = await Promise.all([
          fetch("/api/categories", { cache: "no-store", signal }),
          fetch(pq ? `/api/products?${pq}` : "/api/products", {
            cache: "no-store",
            signal,
          }),
        ]);
        if (!cRes.ok || !pRes.ok) throw new Error("load_failed");

        const rawCats = await cRes.json();
        const rawProds = await pRes.json();
        setCategories(Array.isArray(rawCats) ? rawCats : []);
        setProducts(Array.isArray(rawProds) ? rawProds : []);
      } catch (e) {
        const aborted =
          (typeof e === "object" &&
            e !== null &&
            "name" in e &&
            (e as { name: string }).name === "AbortError") ||
          (e instanceof DOMException && e.name === "AbortError");
        if (aborted) return;
        setError("تعذر تحميل المنيو. جرّب مرة أخرى.");
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [category, searchApplied],
  );

  useEffect(() => {
    const ac = new AbortController();
    void load(ac.signal);
    return () => ac.abort();
  }, [load]);

  const chips = useMemo(() => {
    return [
      { slug: "all", name: t.menu.all },
      ...categories.map((c) => ({ slug: c.slug, name: c.name })),
    ];
  }, [categories, t.menu.all]);

  return (
    <div className="min-h-dvh bg-baraka-black">
      <SiteHeader locale="ar" />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-center font-display text-3xl font-bold text-baraka-gold md:text-4xl">
          المنيو
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-white/65">
          فلترة حسب التصنيف + بحث سريع على الأطباق
        </p>

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => {
                  setCategory(c.slug);
                  syncUrl({ category: c.slug });
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  category === c.slug
                    ? "bg-baraka-gold text-baraka-black"
                    : "border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="flex w-full flex-col gap-2 md:max-w-md md:flex-row md:items-center">
            <input
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") syncUrl({ q: qInput });
              }}
              placeholder={t.menu.search}
              className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-baraka-gold/40 focus:ring-2"
            />
            <button
              type="button"
              onClick={() => syncUrl({ q: qInput })}
              className="shrink-0 rounded-2xl bg-baraka-moroccan/50 px-5 py-3 text-sm font-semibold text-white hover:bg-baraka-moroccan/70"
            >
              بحث
            </button>
          </div>
        </div>

        {error ? (
          <p className="mt-10 text-center text-sm text-red-300">{error}</p>
        ) : null}
        {loading ? (
          <p className="mt-10 text-center text-sm text-white/60">جاري التحميل…</p>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                slug={p.slug}
                description={p.description}
                price={p.price}
                image={p.image}
                available={p.available}
                locale="ar"
              />
            ))}
          </div>
        )}

        {!loading && products.length === 0 ? (
          <p className="mt-10 text-center text-sm text-white/55">
            ما لقينا والو بهاد المعايير.
          </p>
        ) : null}
      </main>
      <SiteFooter locale="ar" />
    </div>
  );
}
