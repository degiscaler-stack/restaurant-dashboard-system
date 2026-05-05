const buckets = new Map<string, number>();

/** إرجاع false إذا تجاوز الطلب الحد الأدنى للوقت بين محاولتين */
export function allowIpRateLimit(key: string, minIntervalMs: number): boolean {
  const now = Date.now();
  const last = buckets.get(key) ?? 0;
  if (now - last < minIntervalMs) return false;
  buckets.set(key, now);
  if (buckets.size > 2000) {
    for (const [k, t] of buckets) {
      if (now - t > minIntervalMs * 12) buckets.delete(k);
    }
  }
  return true;
}
