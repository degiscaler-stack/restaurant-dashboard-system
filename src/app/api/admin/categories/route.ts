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

  const categories = await prisma.category.findMany({
    where: { restaurantId: session.tenantId },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(categories);
}

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  image: z.union([z.string().url(), z.string().startsWith("/")]).optional(),
  sortOrder: z.number().int().optional(),
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
  try {
    const cat = await prisma.category.create({
      data: {
        restaurantId: session.tenantId,
        name: d.name,
        slug: d.slug,
        image: d.image ?? null,
        sortOrder: d.sortOrder ?? 0,
        active: d.active ?? true,
      },
    });
    return NextResponse.json({ ok: true, id: cat.id });
  } catch {
    return NextResponse.json({ error: "duplicate_or_invalid" }, { status: 400 });
  }
}
