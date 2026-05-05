import type { Order, OrderItem } from "@prisma/client";
import { prisma } from "./db";
import { buildRestaurantWhatsAppMessage, waMeUrl } from "./whatsapp-message";
import { sendMail } from "./email";

async function sendWhatsAppCloudApi(toPhoneDigits: string, message: string) {
  const token = process.env.WHATSAPP_CLOUD_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return { ok: false as const, reason: "no_cloud" };

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: toPhoneDigits,
      type: "text",
      text: { preview_url: false, body: message },
    }),
    cache: "no-store",
  });
  const raw = await res.text();
  return { ok: res.ok, raw };
}

export async function notifyRestaurantAboutOrder(
  order: Order & { items: OrderItem[] },
) {
  const settings = await prisma.restaurantSettings.findUnique({
    where: { restaurantId: order.restaurantId },
  });
  const message = buildRestaurantWhatsAppMessage(order);
  const whatsappTarget = (settings?.whatsapp ?? order.phone).replace(/\D/g, "");

  let cloud: Awaited<ReturnType<typeof sendWhatsAppCloudApi>> | null = null;
  try {
    cloud = await sendWhatsAppCloudApi(whatsappTarget, message);
  } catch {
    cloud = { ok: false, raw: "exception" };
  }

  await prisma.adminNotification.create({
    data: {
      restaurantId: order.restaurantId,
      title: `طلب جديد #${order.orderNumber}`,
      body: message.slice(0, 2000),
      orderId: order.id,
    },
  });

  let emailResult: Awaited<ReturnType<typeof sendMail>> | null = null;
  const notifyTo = process.env.RESTAURANT_NOTIFY_EMAIL || settings?.email;
  if (notifyTo) {
    try {
      emailResult = await sendMail({
        to: notifyTo,
        subject: `طلب جديد #${order.orderNumber}`,
        text: message,
      });
    } catch {
      emailResult = { sent: false, reason: "send failed" };
    }
  }

  const fallbackUrl = waMeUrl(settings?.whatsapp ?? "+212612345678", message);

  await prisma.order.update({
    where: { id: order.id },
    data: { restaurantNotifiedAt: new Date() },
  });

  return {
    whatsappCloudOk: cloud?.ok === true,
    emailSent: emailResult?.sent === true,
    fallbackUrl,
  };
}
