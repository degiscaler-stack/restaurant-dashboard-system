/** اقتراحات Cross-sell حسب مكونات الطلب (أسماء المنتجات) */
export function suggestedCrossSellSlugs(orderItemNames: string[]): string[] {
  const blob = orderItemNames.join(" ");
  if (/طاجين/.test(blob)) return ["bssara", "atay", "water"];
  if (/مشو|كفتة|دجاج|كبدة|مشاوي|شواية|سجق/i.test(blob))
    return ["harira", "orange-juice", "atay"];
  return ["harira", "orange-juice", "bssara"];
}
