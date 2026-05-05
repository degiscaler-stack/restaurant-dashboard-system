import { FALLBACK_PRODUCTS } from "@/lib/fallback-menu";
import { PRODUCT_IMAGES } from "@/lib/product-image-urls";

/** صورة سطر الطلب: من المنتج في القاعدة، أو من قائمة الاحتياط بالاسم */
export function resolveOrderLineImage(
  productName: string,
  dbImage: string | null | undefined,
): string {
  const img = dbImage?.trim();
  if (img) return img;
  const fb = FALLBACK_PRODUCTS.find((p) => p.name === productName);
  return fb?.image ?? PRODUCT_IMAGES.mixedGrill;
}
