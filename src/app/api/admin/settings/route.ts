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

  const [s, r] = await Promise.all([
    prisma.restaurantSettings.findUnique({
      where: { restaurantId: session.tenantId },
    }),
    prisma.restaurant.findUnique({
      where: { id: session.tenantId },
      select: { slug: true, logoUrl: true, heroUrl: true, name: true },
    }),
  ]);

  if (!s || !r) {
    return NextResponse.json({ error: "no_settings" }, { status: 500 });
  }

  return NextResponse.json({
    ...s,
    slug: r.slug,
    logoUrl: r.logoUrl,
    heroUrl: r.heroUrl,
    restaurantBrandName: r.name,
  });
}

const patchSchema = z.object({
  restaurantName: z.string().min(1).optional(),
  phone: z.string().min(5).optional(),
  whatsapp: z.string().min(5).optional(),
  email: z.string().email().optional(),
  address: z.string().min(3).optional(),
  openingHours: z.string().min(1).optional(),
  deliveryRules: z.string().min(1).optional(),
  paypalEnabled: z.boolean().optional(),
  codEnabled: z.boolean().optional(),
  onlinePaymentEnabled: z.boolean().optional(),
  googleMapsEmbedUrl: z.union([z.string().url(), z.literal("")]).optional(),
  primaryColorHex: z.union([z.string().regex(/^#[0-9A-Fa-f]{6}$/), z.literal("")]).optional(),
  accentColorHex: z.union([z.string().regex(/^#[0-9A-Fa-f]{6}$/), z.literal("")]).optional(),
  facebookUrl: z.union([z.string().url(), z.literal("")]).optional(),
  instagramUrl: z.union([z.string().url(), z.literal("")]).optional(),
  tiktokUrl: z.union([z.string().url(), z.literal("")]).optional(),
  logoUrl: z.union([z.string().url(), z.literal("")]).optional(),
  heroUrl: z.union([z.string().url(), z.literal("")]).optional(),
});

export async function PATCH(req: Request) {
  const session = await requireAdmin(req);
  if (!session.user || !session.tenantId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const deny = forbidStaffCatalog(session.user.role);
  if (deny) return deny;

  const json = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const current = await prisma.restaurantSettings.findUnique({
    where: { restaurantId: session.tenantId },
  });
  if (!current) {
    return NextResponse.json({ error: "no_settings" }, { status: 500 });
  }

  const d = parsed.data;

  await prisma.$transaction([
    prisma.restaurantSettings.update({
      where: { restaurantId: session.tenantId },
      data: {
        ...(d.restaurantName !== undefined ? { restaurantName: d.restaurantName } : {}),
        ...(d.phone !== undefined ? { phone: d.phone } : {}),
        ...(d.whatsapp !== undefined ? { whatsapp: d.whatsapp } : {}),
        ...(d.email !== undefined ? { email: d.email } : {}),
        ...(d.address !== undefined ? { address: d.address } : {}),
        ...(d.openingHours !== undefined ? { openingHours: d.openingHours } : {}),
        ...(d.deliveryRules !== undefined ? { deliveryRules: d.deliveryRules } : {}),
        ...(d.paypalEnabled !== undefined ? { paypalEnabled: d.paypalEnabled } : {}),
        ...(d.codEnabled !== undefined ? { codEnabled: d.codEnabled } : {}),
        ...(d.onlinePaymentEnabled !== undefined
          ? { onlinePaymentEnabled: d.onlinePaymentEnabled }
          : {}),
        ...(d.googleMapsEmbedUrl !== undefined
          ? { googleMapsEmbedUrl: d.googleMapsEmbedUrl || null }
          : {}),
        ...(d.primaryColorHex !== undefined
          ? { primaryColorHex: d.primaryColorHex || null }
          : {}),
        ...(d.accentColorHex !== undefined
          ? { accentColorHex: d.accentColorHex || null }
          : {}),
        ...(d.facebookUrl !== undefined ? { facebookUrl: d.facebookUrl || null } : {}),
        ...(d.instagramUrl !== undefined ? { instagramUrl: d.instagramUrl || null } : {}),
        ...(d.tiktokUrl !== undefined ? { tiktokUrl: d.tiktokUrl || null } : {}),
      },
    }),
    prisma.restaurant.update({
      where: { id: session.tenantId },
      data: {
        ...(d.restaurantName !== undefined ? { name: d.restaurantName } : {}),
        ...(d.logoUrl !== undefined ? { logoUrl: d.logoUrl || null } : {}),
        ...(d.heroUrl !== undefined ? { heroUrl: d.heroUrl || null } : {}),
      },
    }),
  ]);

  const [s, r] = await Promise.all([
    prisma.restaurantSettings.findUnique({
      where: { restaurantId: session.tenantId },
    }),
    prisma.restaurant.findUnique({
      where: { id: session.tenantId },
      select: { slug: true, logoUrl: true, heroUrl: true, name: true },
    }),
  ]);

  return NextResponse.json({
    ...s!,
    slug: r!.slug,
    logoUrl: r!.logoUrl,
    heroUrl: r!.heroUrl,
    restaurantBrandName: r!.name,
  });
}
