import { NextResponse } from "next/server";
import { z } from "zod";
import { forbidStaffCatalog } from "@/lib/admin-guards";
import { requireAdmin } from "@/lib/admin-api";
import { saveUploadedImageBuffer } from "@/lib/local-image-upload";

const folderSchema = z.enum(["products", "categories", "reviews", "branding"]);

export async function POST(req: Request) {
  const session = await requireAdmin(req);
  if (!session.user || !session.tenantId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const deny = forbidStaffCatalog(session.user.role);
  if (deny) return deny;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid_form" }, { status: 400 });
  }

  const file = form.get("file");
  const folderParsed = folderSchema.safeParse(String(form.get("folder") ?? "products"));
  if (!folderParsed.success) {
    return NextResponse.json({ error: "invalid_folder" }, { status: 400 });
  }

  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length === 0 || buf.length > 4 * 1024 * 1024) {
    return NextResponse.json({ error: "file_too_large" }, { status: 413 });
  }

  try {
    const url = await saveUploadedImageBuffer(
      buf,
      folderParsed.data,
      typeof file.type === "string" ? file.type : undefined,
    );
    return NextResponse.json({ ok: true, url });
  } catch (e) {
    console.error("[admin/upload]", e);
    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }
}
