import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { forbidStaffCatalog } from "@/lib/admin-guards";
import { requireAdmin } from "@/lib/admin-api";

export async function GET(req: Request) {
  const session = await requireAdmin(req);
  if (!session.user || !session.tenantId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    where: { restaurantId: session.tenantId },
    include: { category: true },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
  });
  return NextResponse.json(
    products.map((p) => ({
      ...p,
      price: Number(p.price),
    })),
  );
}

const createSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().min(1),
  price: z.number().positive(),
  image: z.string().url().or(z.string().startsWith("/")),
  available: z.boolean().optional(),
  featured: z.boolean().optional(),
  specialOffer: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function POST(req: Request) {
  const session = await requireAdmin(req);
  if (!session.user || !session.tenantId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const deny = forbidStaffCatalog(session.user.role);
  if (deny) return deny;

  const json = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "validation",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const cat = await prisma.category.findFirst({
    where: {
      id: parsed.data.categoryId,
      restaurantId: session.tenantId,
    },
  });
  if (!cat) {
    return NextResponse.json({ error: "invalid_category" }, { status: 400 });
  }

  try {
    const p = await prisma.product.create({
      data: {
        restaurantId: session.tenantId,
        categoryId: parsed.data.categoryId,
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description,
        price: parsed.data.price,
        image: parsed.data.image,
        available: parsed.data.available ?? true,
        featured: parsed.data.featured ?? false,
        specialOffer: parsed.data.specialOffer ?? false,
        sortOrder: parsed.data.sortOrder ?? 0,
      },
    });

    return NextResponse.json({ ok: true, id: p.id });
  } catch {
    return NextResponse.json({ error: "duplicate_or_invalid" }, { status: 400 });
  }
}
