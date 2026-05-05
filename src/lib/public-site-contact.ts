import { prisma } from "@/lib/db";
import { DEFAULT_GOOGLE_MAPS_EMBED_URL } from "@/lib/fallback-menu";
import { resolveRestaurantId } from "@/lib/tenant";

export type PublicSiteContact = {
  restaurantName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  openingHours: string;
  deliveryRules: string;
  mapEmbedUrl: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
};

export const STATIC_CONTACT_FALLBACK: PublicSiteContact = {
  restaurantName: "Restaurant",
  phone: "—",
  whatsapp: "—",
  email: "contact@example.com",
  address: "—",
  openingHours: "—",
  deliveryRules: "—",
  mapEmbedUrl: DEFAULT_GOOGLE_MAPS_EMBED_URL,
  facebookUrl: null,
  instagramUrl: null,
  tiktokUrl: null,
};

export function telHref(phone: string): string {
  const t = phone.trim().replace(/\s+/g, "");
  return t.startsWith("tel:") ? t : `tel:${t}`;
}

export function whatsappHref(whatsapp: string): string {
  const digits = whatsapp.replace(/\D/g, "");
  return digits.length > 0 ? `https://wa.me/${digits}` : "#";
}

export async function getPublicSiteContact(): Promise<PublicSiteContact> {
  try {
    const restaurantId = await resolveRestaurantId();
    if (!restaurantId) return STATIC_CONTACT_FALLBACK;

    const row = await prisma.restaurantSettings.findUnique({
      where: { restaurantId },
      select: {
        restaurantName: true,
        phone: true,
        whatsapp: true,
        email: true,
        address: true,
        openingHours: true,
        deliveryRules: true,
        googleMapsEmbedUrl: true,
        facebookUrl: true,
        instagramUrl: true,
        tiktokUrl: true,
      },
    });
    if (!row) return STATIC_CONTACT_FALLBACK;

    return {
      restaurantName: row.restaurantName,
      phone: row.phone,
      whatsapp: row.whatsapp,
      email: row.email,
      address: row.address,
      openingHours: row.openingHours,
      deliveryRules: row.deliveryRules,
      mapEmbedUrl:
        row.googleMapsEmbedUrl?.trim() || DEFAULT_GOOGLE_MAPS_EMBED_URL,
      facebookUrl: row.facebookUrl,
      instagramUrl: row.instagramUrl,
      tiktokUrl: row.tiktokUrl,
    };
  } catch {
    return STATIC_CONTACT_FALLBACK;
  }
}
