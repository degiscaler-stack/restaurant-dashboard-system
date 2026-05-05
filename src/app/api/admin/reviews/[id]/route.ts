import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { forbidStaffCatalog } from "@/lib/admin-guards";
import { requireAdmin } from "@/lib/admin-api";

const patchSchema = z.object({
  customerName: z.string().min(2).optional(),
  customerPhotoUrl: z.union([z.string().url(), z.literal("")]).optional().nullable(),
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(3).optional(),
  visible: z.boolean().optional(),
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

  const existing = await prisma.review.findFirst({
    where: { id, restaurantId: session.tenantId },
  });
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const d = parsed.data;
  const updated = await prisma.review.update({
    where: { id },
    data: {
      ...(d.customerName !== undefined ? { customerName: d.customerName } : {}),
      ...(d.customerPhotoUrl !== undefined
        ? {
            customerPhotoUrl: d.customerPhotoUrl?.trim()
              ? d.customerPhotoUrl.trim()
              : null,
          }
        : {}),
      ...(d.rating !== undefined ? { rating: d.rating } : {}),
      ...(d.comment !== undefined ? { comment: d.comment } : {}),
      ...(d.visible !== undefined ? { visible: d.visible } : {}),
    },
  });

  return NextResponse.json(updated);
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
  const existing = await prisma.review.findFirst({
    where: { id, restaurantId: session.tenantId },
  });
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
