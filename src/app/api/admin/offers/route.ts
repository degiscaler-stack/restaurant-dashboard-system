import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { forbidStaffCatalog } from "@/lib/admin-guards";
import { requireAdmin } from "@/lib/admin-api";

export async function GET(req: Request) {
  const session = await requireAdmin(req);
  if (!session.user || !session.tenantId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const offers = await prisma.offer.findMany({
    where: { restaurantId: session.tenantId },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(
    offers.map((o) => ({
      ...o,
      discountPercent: Number(o.discountPercent),
    })),
  );
}

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  discountPercent: z.number().min(0).max(100).optional(),
  upsellProductSlug: z.string().min(1).optional().nullable(),
  crossSellSlugs: z.array(z.string().min(1)).optional().nullable(),
  active: z.boolean().optional(),
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
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;
  const o = await prisma.offer.create({
    data: {
      restaurantId: session.tenantId,
      title: d.title,
      description: d.description ?? null,
      discountPercent: d.discountPercent ?? 10,
      upsellProductSlug: d.upsellProductSlug ?? null,
      crossSellSlugs:
        d.crossSellSlugs === undefined
          ? undefined
          : d.crossSellSlugs === null
            ? Prisma.DbNull
            : (d.crossSellSlugs as Prisma.InputJsonValue),
      active: d.active ?? true,
    },
  });

  return NextResponse.json({ ok: true, id: o.id });
}
