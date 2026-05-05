import { prisma } from "./db";

export async function generateOrderNumber(
  restaurantId: string,
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `BG-${year}-`;

  for (let i = 0; i < 50; i++) {
    const count = await prisma.order.count({
      where: {
        restaurantId,
        orderNumber: { startsWith: prefix },
      },
    });
    const seq = count + 1 + i;
    const candidate = `${prefix}${String(seq).padStart(4, "0")}`;
    const exists = await prisma.order.findFirst({
      where: { restaurantId, orderNumber: candidate },
    });
    if (!exists) return candidate;
  }

  return `${prefix}${Date.now().toString(36).toUpperCase()}`;
}
