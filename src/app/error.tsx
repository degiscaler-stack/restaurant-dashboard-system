"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="min-h-dvh px-6 py-16 text-center"
      style={{ background: "#fff", color: "#111" }}
    >
      <h1 className="text-2xl font-bold text-red-700">حدث خطأ</h1>
      <p className="mt-4 max-w-xl mx-auto text-sm break-words opacity-80">
        {error.message}
      </p>
      {error.digest ? (
        <p className="mt-2 text-xs text-neutral-500">Digest: {error.digest}</p>
      ) : null}
      <button
        type="button"
        onClick={() => reset()}
        className="mt-8 rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white"
      >
        إعادة المحاولة
      </button>
    </div>
  );
}
