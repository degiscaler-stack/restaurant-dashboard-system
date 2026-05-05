"use client";

import { useEffect, useState } from "react";

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
  categoryId: string;
  category: Category;
};

export default function AdminProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const [newP, setNewP] = useState({
    categoryId: "",
    name: "",
    slug: "",
    description: "",
    price: 10,
    image: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&q=80",
    available: true,
    featured: false,
    specialOffer: false,
  });

  async function reload() {
    const [cRes, pRes] = await Promise.all([
      fetch("/api/admin/categories", { credentials: "include" }),
      fetch("/api/admin/products", { credentials: "include" }),
    ]);
    if (cRes.ok) {
      const c = await cRes.json();
      setCategories(c);
      if (!newP.categoryId && c[0]?.id) setNewP((s) => ({ ...s, categoryId: c[0].id }));
    }
    if (pRes.ok) setProducts(await pRes.json());
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createProduct() {
    setMsg(null);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(newP),
    });
    setMsg(res.ok ? "تمت الإضافة" : "فشلت الإضافة");
    if (res.ok) void reload();
  }

  async function patchProduct(id: string, patch: Partial<Product>) {
    setMsg(null);
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(patch),
    });
    setMsg(res.ok ? "تم الحفظ" : "فشل الحفظ");
    if (res.ok) void reload();
  }

  async function deleteProduct(id: string) {
    if (!confirm("حذف الطبق؟")) return;
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setMsg(res.ok ? "تم الحذف" : "فشل الحذف");
    if (res.ok) void reload();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">المنيو</h1>
      <p className="mt-2 text-sm text-white/55">إضافة / تعديل سريع / حذف</p>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-sm font-semibold text-white">إضافة طبق</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-xs text-white/60">
            التصنيف
            <select
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
              value={newP.categoryId}
              onChange={(e) => setNewP((s) => ({ ...s, categoryId: e.target.value }))}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-white/60">
            الاسم
            <input
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
              value={newP.name}
              onChange={(e) => setNewP((s) => ({ ...s, name: e.target.value }))}
            />
          </label>
          <label className="text-xs text-white/60">
            slug (إنجليزي)
            <input
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
              value={newP.slug}
              onChange={(e) => setNewP((s) => ({ ...s, slug: e.target.value }))}
            />
          </label>
          <label className="text-xs text-white/60">
            الثمن
            <input
              type="number"
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
              value={newP.price}
              onChange={(e) => setNewP((s) => ({ ...s, price: Number(e.target.value) }))}
            />
          </label>
          <label className="text-xs text-white/60 md:col-span-2">
            الوصف
            <input
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
              value={newP.description}
              onChange={(e) => setNewP((s) => ({ ...s, description: e.target.value }))}
            />
          </label>
          <label className="text-xs text-white/60 md:col-span-2">
            صورة (URL)
            <input
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
              value={newP.image}
              onChange={(e) => setNewP((s) => ({ ...s, image: e.target.value }))}
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-white/70">
            <input
              type="checkbox"
              checked={newP.available}
              onChange={(e) => setNewP((s) => ({ ...s, available: e.target.checked }))}
            />
            متوفر
          </label>
          <label className="flex items-center gap-2 text-xs text-white/70">
            <input
              type="checkbox"
              checked={newP.featured}
              onChange={(e) => setNewP((s) => ({ ...s, featured: e.target.checked }))}
            />
            مميز
          </label>
          <label className="flex items-center gap-2 text-xs text-white/70">
            <input
              type="checkbox"
              checked={newP.specialOffer}
              onChange={(e) => setNewP((s) => ({ ...s, specialOffer: e.target.checked }))}
            />
            عرض خاص
          </label>
        </div>
        <button
          type="button"
          onClick={() => void createProduct()}
          className="mt-4 rounded-full bg-amber-400 px-6 py-2 text-sm font-bold text-zinc-950"
        >
          إضافة
        </button>
      </div>

      {msg ? <p className="mt-4 text-sm text-white/70">{msg}</p> : null}

      <div className="mt-10 space-y-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{p.name}</p>
                <p className="text-xs text-white/45">{p.category.name}</p>
              </div>
              <button
                type="button"
                className="text-xs text-red-300 hover:underline"
                onClick={() => void deleteProduct(p.id)}
              >
                حذف
              </button>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <label className="text-xs text-white/50">
                الثمن
                <input
                  type="number"
                  className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-2 py-2 text-xs text-white"
                  defaultValue={p.price}
                  onBlur={(e) =>
                    void patchProduct(p.id, { price: Number(e.target.value) })
                  }
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-white/70">
                <input
                  type="checkbox"
                  defaultChecked={p.available}
                  onChange={(e) => void patchProduct(p.id, { available: e.target.checked })}
                />
                متوفر
              </label>
              <label className="flex items-center gap-2 text-xs text-white/70">
                <input
                  type="checkbox"
                  defaultChecked={p.featured}
                  onChange={(e) => void patchProduct(p.id, { featured: e.target.checked })}
                />
                مميز
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
