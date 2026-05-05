"use client";

/**
 * Root-level errors (layout). Must include html/body per Next.js.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0, padding: 40, background: "#fff", color: "#111" }}>
        <h1 style={{ color: "#b91c1c" }}>خطأ في التطبيق</h1>
        <pre style={{ whiteSpace: "pre-wrap", marginTop: 16, fontSize: 14 }}>
          {error.message}
        </pre>
        <button
          type="button"
          onClick={() => reset()}
          style={{ marginTop: 24, padding: "12px 20px", cursor: "pointer" }}
        >
          إعادة المحاولة
        </button>
      </body>
    </html>
  );
}
