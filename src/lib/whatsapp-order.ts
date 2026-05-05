/**
 * رسائل واتساب للطلبات — COD مقابل مدفوع أونلاين.
 */

const DEFAULT_CLICK_CHAT =
  "https://wa.me/message/L6KQCBXWOIUTA1";

export type OrderLineForMessage = {
  name: string;
  quantity: number;
  lineTotalMad: number;
};

export type WhatsAppOrderMode = "cod" | "onlinePaid";

export function buildWhatsAppOrderMessage(o: {
  mode: WhatsAppOrderMode;
  customerName: string;
  phoneDisplay: string;
  whatsappDisplay: string;
  lines: OrderLineForMessage[];
  totalMad: number;
  city?: string;
  area?: string;
  address?: string;
  mapsLink?: string | null;
}) {
  const lines: string[] = [];

  if (o.mode === "cod") {
    lines.push("طلب جديد من الموقع");
    lines.push("");
    lines.push(`الاسم الكامل: ${o.customerName.trim()}`);
    lines.push(`رقم الهاتف: ${o.phoneDisplay}`);
    lines.push(`رقم الواتساب: ${o.whatsappDisplay}`);
    lines.push("");
    lines.push("طريقة الدفع: الدفع عند الاستلام");
    lines.push("");
    lines.push("المنتجات:");
  } else {
    lines.push("طلب جديد مدفوع من الموقع");
    lines.push("");
    lines.push(`الاسم الكامل: ${o.customerName.trim()}`);
    lines.push(`رقم الهاتف: ${o.phoneDisplay}`);
    lines.push(`رقم الواتساب: ${o.whatsappDisplay}`);
    lines.push("");
    lines.push("طريقة الدفع: الدفع أونلاين");
    lines.push("حالة الدفع: Paid");
    lines.push("");
    lines.push("العنوان:");
    lines.push(`المدينة: ${(o.city ?? "").trim() || "—"}`);
    lines.push(`الحي / المنطقة: ${(o.area ?? "").trim() || "—"}`);
    lines.push(`العنوان الكامل: ${(o.address ?? "").trim() || "—"}`);
    lines.push(
      `Google Maps: ${o.mapsLink?.trim() ? o.mapsLink.trim() : "—"}`,
    );
    lines.push("");
    lines.push("المنتجات:");
  }

  for (const l of o.lines) {
    lines.push(
      `- ${l.name} x ${l.quantity} = ${l.lineTotalMad.toFixed(0)} MAD`,
    );
  }
  lines.push("");
  lines.push(`المجموع: ${o.totalMad.toFixed(0)} MAD`);

  if (o.mode === "cod") {
    lines.push("");
    lines.push("ملاحظة: العنوان سيتم تأكيده مع الزبون عبر الاتصال.");
  }

  return lines.join("\n");
}

/** يستخرج أرقام الدولة والخط بدون + للاستخدام مع api.whatsapp.com */
export function digitsForWhatsAppApi(phoneE164ish: string) {
  return phoneE164ish.replace(/\D/g, "");
}

export function buildWhatsAppSendHref(
  phoneDigits: string | null | undefined,
  message: string,
) {
  const enc = encodeURIComponent(message);
  const digits = phoneDigits?.replace(/\D/g, "") ?? "";

  if (digits.length >= 10 && digits.length <= 15) {
    return `https://api.whatsapp.com/send?phone=${digits}&text=${enc}`;
  }

  const fallback =
    process.env.NEXT_PUBLIC_WHATSAPP_CLICK_CHAT_URL?.trim() ||
    DEFAULT_CLICK_CHAT;

  try {
    const u = new URL(fallback);
    u.searchParams.set("text", message);
    return u.toString();
  } catch {
    const sep = fallback.includes("?") ? "&" : "?";
    return `${fallback}${sep}text=${enc}`;
  }
}
