import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { forbidStaffCatalog } from "@/lib/admin-guards";
import { requireAdmin } from "@/lib/admin-api";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  image: z.string().url().or(z.string().startsWith("/")).optional(),
  available: z.boolean().optional(),
  featured: z.boolean().optional(),
  specialOffer: z.boolean().optional(),
  categoryId: z.string().min(1).optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin(req);
  if (!session.user || !session.tenantId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const deny = forbidStaffCatalog(session.user.role);
  if (deny) return deny;

  const { id } = await ctx.params;
  const json = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const existing = await prisma.product.findFirst({
    where: { id, restaurantId: session.tenantId },
  });
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (data.categoryId !== undefined) {
    const cat = await prisma.category.findFirst({
      where: { id: data.categoryId, restaurantId: session.tenantId },
    });
    if (!cat) {
      return NextResponse.json({ error: "invalid_category" }, { status: 400 });
    }
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.price !== undefined ? { price: data.price } : {}),
      ...(data.image !== undefined ? { image: data.image } : {}),
      ...(data.available !== undefined ? { available: data.available } : {}),
      ...(data.featured !== undefined ? { featured: data.featured } : {}),
      ...(data.specialOffer !== undefined ? { specialOffer: data.specialOffer } : {}),
      ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
      ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
    },
  });

  return NextResponse.json({ ok: true, id: updated.id });
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin(req);
  if (!session.user || !session.tenantId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const deny = forbidStaffCatalog(session.user.role);
  if (deny) return deny;

  const { id } = await ctx.params;
  const existing = await prisma.product.findFirst({
    where: { id, restaurantId: session.tenantId },
  });
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
