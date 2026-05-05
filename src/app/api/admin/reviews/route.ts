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

  const rows = await prisma.review.findMany({
    where: { restaurantId: session.tenantId },
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  return NextResponse.json(rows);
}

const createSchema = z.object({
  customerName: z.string().min(2),
  customerPhotoUrl: z.union([z.string().url(), z.literal("")]).optional().nullable(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3),
  visible: z.boolean().optional(),
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
  const r = await prisma.review.create({
    data: {
      restaurantId: session.tenantId,
      customerName: d.customerName,
      customerPhotoUrl: d.customerPhotoUrl?.trim()
        ? d.customerPhotoUrl.trim()
        : null,
      rating: d.rating,
      comment: d.comment,
      visible: d.visible ?? true,
    },
  });

  return NextResponse.json({ ok: true, id: r.id });
}
