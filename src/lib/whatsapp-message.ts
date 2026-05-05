import type { Order, OrderItem } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

function money(d: Decimal | number) {
  const n = typeof d === "number" ? d : Number(d);
  return `${n.toFixed(0)} MAD`;
}

const paymentLabel: Record<string, string> = {
  COD: "الدفع عند الاستلام",
  ONLINE: "دفع أونلاين",
};

const statusLabel: Record<string, string> = {
  PENDING_CONFIRMATION: "Pending Confirmation",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  PENDING_PAYMENT: "Pending Payment",
  PAID: "Paid",
  PAYMENT_FAILED: "Payment Failed",
};

const orderTypeLabel: Record<string, string> = {
  DELIVERY: "توصيل",
  PICKUP: "أخذ من المطعم",
};

export function buildRestaurantWhatsAppMessage(
  order: Order & { items: OrderItem[] },
) {
  const lines: string[] = [];
  lines.push("طلب جديد من الموقع");
  lines.push("");
  lines.push(`رقم الطلب:\n#${order.orderNumber}`);
  lines.push("");
  lines.push(`الزبون:\n${order.customerName}`);
  lines.push("");
  lines.push(`الهاتف:\n${order.phone}`);
  lines.push("");
  lines.push(`نوع الطلب:\n${orderTypeLabel[order.orderType] ?? order.orderType}`);
  lines.push("");
  const addr = [order.city, order.area, order.address].filter(Boolean).join("، ");
  lines.push(`العنوان:\n${addr}`);
  lines.push("");
  lines.push("الأطباق:");
  for (const it of order.items) {
    lines.push(
      `* ${it.productName} x${it.quantity} = ${money(it.totalPrice)}`,
    );
  }
  lines.push("");
  lines.push(`المجموع الفرعي:\n${money(order.subtotal)}`);
  lines.push("");
  lines.push(`التوصيل:\n${money(order.deliveryFee)}`);
  lines.push("");
  lines.push(`الإجمالي:\n${money(order.total)}`);
  lines.push("");
  lines.push(`طريقة الدفع:\n${paymentLabel[order.paymentMethod] ?? order.paymentMethod}`);
  lines.push("");
  lines.push(`ملاحظات:\n${order.notes?.trim() ? order.notes : "—"}`);
  lines.push("");
  lines.push(`الحالة:\n${statusLabel[order.orderStatus] ?? order.orderStatus}`);
  return lines.join("\n");
}

export function waMeUrl(phoneE164: string, text: string) {
  const digits = phoneE164.replace(/\D/g, "");
  const enc = encodeURIComponent(text);
  return `https://wa.me/${digits}?text=${enc}`;
}

/** رسالة جاهزة للزبون بعد إتمام الطلب (زر واتساب) */
export function buildCustomerWhatsAppDraft(o: {
  orderNumber: string;
  customerName: string;
  phone: string;
  addressLine: string;
  items: { name: string; quantity: number; lineTotal: number }[];
  deliveryFee: number;
  total: number;
  paymentLabel: string;
}) {
  const lines: string[] = [];
  lines.push("طلب جديد من الموقع");
  lines.push("");
  lines.push(`رقم الطلب: #${o.orderNumber}`);
  lines.push("");
  lines.push(`الاسم: ${o.customerName}`);
  lines.push("");
  lines.push(`الهاتف: ${o.phone}`);
  lines.push("");
  lines.push(`العنوان: ${o.addressLine}`);
  lines.push("");
  lines.push("الأطباق:");
  for (const it of o.items) {
    lines.push(
      `- ${it.name} ×${it.quantity} = ${it.lineTotal.toFixed(0)} MAD`,
    );
  }
  lines.push("");
  lines.push(`التوصيل: ${o.deliveryFee.toFixed(0)} MAD`);
  lines.push("");
  lines.push(`المجموع: ${o.total.toFixed(0)} MAD`);
  lines.push("");
  lines.push(`الدفع: ${o.paymentLabel}`);
  return lines.join("\n");
}
