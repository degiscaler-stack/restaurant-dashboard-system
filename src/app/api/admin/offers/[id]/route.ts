import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { forbidStaffCatalog } from "@/lib/admin-guards";
import { requireAdmin } from "@/lib/admin-api";

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  discountPercent: z.number().min(0).max(100).optional(),
  upsellProductSlug: z.string().min(1).optional().nullable(),
  crossSellSlugs: z.array(z.string().min(1)).optional().nullable(),
  active: z.boolean().optional(),
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

  const existing = await prisma.offer.findFirst({
    where: { id, restaurantId: session.tenantId },
  });
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const d = parsed.data;
  const updated = await prisma.offer.update({
    where: { id },
    data: {
      ...(d.title !== undefined ? { title: d.title } : {}),
      ...(d.description !== undefined ? { description: d.description } : {}),
      ...(d.discountPercent !== undefined
        ? { discountPercent: d.discountPercent }
        : {}),
      ...(d.upsellProductSlug !== undefined
        ? { upsellProductSlug: d.upsellProductSlug }
        : {}),
      ...(d.crossSellSlugs !== undefined
        ? {
            crossSellSlugs:
              d.crossSellSlugs === null
                ? Prisma.DbNull
                : (d.crossSellSlugs as Prisma.InputJsonValue),
          }
        : {}),
      ...(d.active !== undefined ? { active: d.active } : {}),
    },
  });

  return NextResponse.json({
    ...updated,
    discountPercent: Number(updated.discountPercent),
  });
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
  const existing = await prisma.offer.findFirst({
    where: { id, restaurantId: session.tenantId },
  });
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await prisma.offer.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
