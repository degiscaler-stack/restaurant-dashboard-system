"use client";

import { useEffect, useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  sortOrder: number;
};

export default function AdminCategoriesPage() {
  const [rows, setRows] = useState<Category[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  async function reload() {
    const res = await fetch("/api/admin/categories", { credentials: "include" });
    if (res.ok) setRows(await res.json());
  }

  useEffect(() => {
    void reload();
  }, []);

  async function patch(id: string, patch: Partial<Category>) {
    setMsg(null);
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(patch),
    });
    setMsg(
      res.ok
        ? "تم حفظ التصنيف بنجاح."
        : "تعذر حفظ التصنيف. تحقق من الاتصال أو صلاحياتك.",
    );
    if (res.ok) void reload();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">التصنيفات</h1>
      <p className="mt-2 text-sm text-white/55">تفعيل/تعطيل + ترتيب</p>
      {msg ? <p className="mt-4 text-sm text-white/70">{msg}</p> : null}
      <div className="mt-8 space-y-3">
        {rows.map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <div>
              <p className="font-semibold text-white">{c.name}</p>
              <p className="text-xs text-white/45">{c.slug}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <label className="flex items-center gap-2 text-white/70">
                <input
                  type="checkbox"
                  checked={c.active}
                  onChange={(e) => void patch(c.id, { active: e.target.checked })}
                />
                نشط
              </label>
              <label className="flex items-center gap-2 text-xs text-white/50">
                ترتيب
                <input
                  type="number"
                  className="w-20 rounded-lg border border-white/15 bg-black/40 px-2 py-1 text-xs text-white"
                  defaultValue={c.sortOrder}
                  onBlur={(e) => void patch(c.id, { sortOrder: Number(e.target.value) })}
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
