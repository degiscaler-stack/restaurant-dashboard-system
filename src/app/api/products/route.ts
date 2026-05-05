import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { resolveRestaurantId } from "@/lib/tenant";
import { getFallbackProductsForApi } from "@/lib/fallback-menu";

function mapProducts(
  rows: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    price: unknown;
    image: string;
    available: boolean;
    featured: boolean;
    specialOffer: boolean;
    category: { id: string; name: string; slug: string };
  }>,
) {
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: Number(p.price),
    image: p.image,
    available: p.available,
    featured: p.featured,
    specialOffer: p.specialOffer,
    category: p.category,
  }));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get("category");
  const q = searchParams.get("q")?.trim() ?? "";

  try {
    const restaurantId = await resolveRestaurantId();
    if (!restaurantId) {
      return NextResponse.json(
        getFallbackProductsForApi(
          categorySlug && categorySlug !== "all" ? categorySlug : null,
          q || null,
        ),
      );
    }

    const categoryClause: Prisma.CategoryWhereInput = {
      restaurantId,
      active: true,
      ...(categorySlug && categorySlug !== "all" ? { slug: categorySlug } : {}),
    };

    const where: Prisma.ProductWhereInput = {
      restaurantId,
      available: true,
    };

    if (q) {
      where.AND = [
        { category: categoryClause },
        {
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
            { category: { name: { contains: q } } },
          ],
        },
      ];
    } else {
      where.category = categoryClause;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    });

    if (products.length > 0) {
      return NextResponse.json(mapProducts(products));
    }
  } catch (e) {
    console.error("[api/products]", e);
  }

  return NextResponse.json(
    getFallbackProductsForApi(
      categorySlug && categorySlug !== "all" ? categorySlug : null,
      q || null,
    ),
  );
}
