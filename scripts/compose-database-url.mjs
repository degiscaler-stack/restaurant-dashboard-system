/**
 * نفس منطق `src/lib/ensure-database-url.ts` لتشغيل أوامر Prisma قبل تحميل التطبيق.
 * لا تُعرَّف أسرار ثابتة — القراءة من `process.env` فقط.
 */
export function ensureDatabaseUrl() {
  if (process.env.DATABASE_URL?.trim()) return;

  const host = process.env.DB_HOST?.trim();
  const port = (process.env.DB_PORT?.trim() || "3306").trim();
  const user = process.env.DB_USER?.trim();
  const password = process.env.DB_PASSWORD ?? "";
  const database = process.env.DB_NAME?.trim();

  if (!host || !user || !database) return;

  const u = encodeURIComponent(user);
  const p = encodeURIComponent(password);
  process.env.DATABASE_URL = `mysql://${u}:${p}@${host}:${port}/${database}`;
}
