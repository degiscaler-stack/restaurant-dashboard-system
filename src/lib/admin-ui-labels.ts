/** عرض قيم Prisma في الواجهة العربية — لا تحوي منطق خادم. */

export function paymentMethodLabelAr(pm: string): string {
  switch (pm) {
    case "COD":
      return "الدفع عند الاستلام";
    case "ONLINE":
      return "الدفع أونلاين";
    default:
      return pm;
  }
}

export function paymentStatusLabelAr(ps: string): string {
  switch (ps) {
    case "UNPAID":
      return "غير مدفوع";
    case "PENDING":
      return "قيد المعالجة";
    case "PAID":
      return "مدفوع";
    case "FAILED":
      return "فشل الدفع";
    default:
      return ps;
  }
}

export const ORDER_STATUSES_ORDERED = [
  "PENDING_CONFIRMATION",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "PENDING_PAYMENT",
  "PAID",
  "PAYMENT_FAILED",
] as const;

export function orderStatusLabelAr(status: string): string {
  const map: Record<string, string> = {
    PENDING_CONFIRMATION: "في انتظار التأكيد",
    CONFIRMED: "مؤكّد",
    PREPARING: "قيد التحضير",
    READY: "جاهز للاستلام",
    OUT_FOR_DELIVERY: "في الطريق",
    DELIVERED: "تم التسليم",
    CANCELLED: "ملغى",
    PENDING_PAYMENT: "في انتظار الدفع أونلاين",
    PAID: "تم الدفع",
    PAYMENT_FAILED: "فشل الدفع",
  };
  return map[status] ?? status;
}
