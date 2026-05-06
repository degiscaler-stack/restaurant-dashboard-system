/**
 * يبني `process.env.DATABASE_URL` من متغيرات Hostinger المنفصلة إن وُجدت،
 * دون لمس قيمة `DATABASE_URL` إذا كانت معرّفة مسبقاً.
 *
 * الصيغة: mysql://encodeURIComponent(DB_USER):encodeURIComponent(DB_PASSWORD)@DB_HOST:DB_PORT/DB_NAME
 */
export function ensureDatabaseUrl(): void {
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

ensureDatabaseUrl();
