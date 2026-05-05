import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { resolveRestaurantId } from "@/lib/tenant";
import { getFallbackCategoriesForApi } from "@/lib/fallback-menu";

export async function GET() {
  try {
    const restaurantId = await resolveRestaurantId();
    if (!restaurantId) {
      return NextResponse.json(getFallbackCategoriesForApi());
    }

    const categories = await prisma.category.findMany({
      where: { restaurantId, active: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        sortOrder: true,
      },
    });
    if (categories.length > 0) {
      return NextResponse.json(categories);
    }
  } catch (e) {
    console.error("[api/categories]", e);
  }
  return NextResponse.json(getFallbackCategoriesForApi());
}
