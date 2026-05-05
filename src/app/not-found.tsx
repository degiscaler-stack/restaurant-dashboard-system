import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center"
      style={{ background: "#fafafa", color: "#111" }}
    >
      <h1 className="text-3xl font-bold">404</h1>
      <p className="max-w-md text-neutral-600">الصفحة اللي كتقلب عليها ما كايناش.</p>
      <Link
        href="/"
        className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white"
      >
        الرجوع للرئيسية
      </Link>
    </main>
  );
}
