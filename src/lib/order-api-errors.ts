/** رسالة موحّدة للزبون — بدون ذكر Prisma أو DATABASE_URL */
export function formatOrderApiError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("normalizeMoroccoPhone"))
      return "رقم الهاتف أو الواتساب غير صالح بعد التحقق.";
  }
  return "تعذر تسجيل الطلب، حاول مرة أخرى.";
}

export function orderErrorHttpStatus(): number {
  return 500;
}
