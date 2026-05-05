import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { resolveRestaurantId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

/** إعدادات الدفع للواجهة العامة — من MySQL حسب المستأجر */
export async function GET() {
  try {
    const restaurantId = await resolveRestaurantId();
    if (!restaurantId) {
      return NextResponse.json({
        codEnabled: true,
        onlinePaymentEnabled: false,
        paypalConfigured: false,
        paypalEnabledInSettings: false,
        onlineCheckoutReady: false,
      });
    }

    const settings = await prisma.restaurantSettings.findUnique({
      where: { restaurantId },
      select: {
        codEnabled: true,
        onlinePaymentEnabled: true,
        paypalEnabled: true,
      },
    });

    const paypalConfigured = Boolean(
      process.env.PAYPAL_CLIENT_ID?.trim() &&
        process.env.PAYPAL_CLIENT_SECRET?.trim(),
    );

    const codEnabled = settings?.codEnabled ?? true;
    const onlinePaymentEnabled = settings?.onlinePaymentEnabled ?? false;
    const paypalEnabledInSettings =
      (settings?.paypalEnabled ?? false) && paypalConfigured;

    return NextResponse.json({
      codEnabled,
      onlinePaymentEnabled,
      paypalConfigured,
      paypalEnabledInSettings,
      onlineCheckoutReady:
        onlinePaymentEnabled && paypalEnabledInSettings && paypalConfigured,
    });
  } catch {
    return NextResponse.json({
      codEnabled: true,
      onlinePaymentEnabled: false,
      paypalConfigured: false,
      paypalEnabledInSettings: false,
      onlineCheckoutReady: false,
    });
  }
}
