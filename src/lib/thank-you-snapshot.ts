/** مفتاح تخزين ملخص الطلب في المتصفح بعد إتمام الطلب (بدون قاعدة بيانات). */
export function thankYouSnapshotStorageKey(orderId: string): string {
  return `baraka_ty_${orderId}`;
}
