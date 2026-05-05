"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [next, setNext] = useState("/admin/orders");

  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    setNext(u.get("next") || "/admin/orders");
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        if (res.status === 401) {
          setErr("البريد أو كلمة المرور غير صحيحة");
        } else {
          setErr(
            "تعذّر إكمال تسجيل الدخول. تحقّق من إعدادات الخادم (قاعدة البيانات أو JWT_SECRET).",
          );
        }
        setLoading(false);
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setErr("تعذر تسجيل الدخول");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-950 px-4">
      <form
        onSubmit={onSubmit}
        autoComplete="off"
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8"
      >
        <h1 className="text-center font-display text-2xl font-bold text-amber-200">
          لوحة الإدارة
        </h1>
        <p className="mt-2 text-center text-xs text-white/50">
          تسجيل الدخول لمسؤولي المطعم فقط
        </p>
        <label className="mt-8 block text-sm text-white/70">
          البريد الإلكتروني
          <input
            className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-3 text-sm text-white outline-none"
            name="admin-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
          />
        </label>
        <label className="mt-4 block text-sm text-white/70">
          كلمة المرور
          <input
            type="password"
            className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-3 text-sm text-white outline-none"
            name="admin-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
          />
        </label>
        {err ? <p className="mt-4 text-sm text-red-300">{err}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-amber-400 py-3 text-sm font-bold text-zinc-950 disabled:opacity-40"
        >
          {loading ? "جاري الدخول…" : "تسجيل الدخول"}
        </button>
      </form>
    </div>
  );
}
