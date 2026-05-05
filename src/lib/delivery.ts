/**
 * Client-safe delivery zone type (do not import Prisma enums here — they pull the DB client into the browser bundle).
 */
export type DeliveryBand = "UNDER_3_KM" | "THREE_TO_6_KM" | "OVER_6_KM";

export function deliveryFeeFromBand(band: DeliveryBand | null | undefined) {
  if (!band) return 0;
  if (band === "UNDER_3_KM") return 10;
  if (band === "THREE_TO_6_KM") return 15;
  if (band === "OVER_6_KM") return 0;
  return 0;
}
