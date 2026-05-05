import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

export type UploadFolder = "products" | "categories" | "reviews" | "branding";

function extFromMime(mime: string): string | null {
  const m = mime.toLowerCase().split(";")[0]?.trim() ?? "";
  if (m === "image/jpeg" || m === "image/jpg") return "jpg";
  if (m === "image/png") return "png";
  if (m === "image/webp") return "webp";
  if (m === "image/gif") return "gif";
  return null;
}

function sniffMime(buf: Buffer): string | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff)
    return "image/jpeg";
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  )
    return "image/png";
  if (
    buf.length >= 12 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  )
    return "image/webp";
  if (buf.length >= 6 && buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46)
    return "image/gif";
  return null;
}

export async function saveUploadedImageBuffer(
  buf: Buffer,
  folder: UploadFolder,
  declaredMime?: string,
): Promise<string> {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (!base) {
    throw new Error("NEXT_PUBLIC_SITE_URL_REQUIRED_FOR_UPLOADS");
  }

  const mime = sniffMime(buf) ?? declaredMime ?? null;
  const ext = mime ? extFromMime(mime) : null;
  if (!ext) throw new Error("UNSUPPORTED_IMAGE_TYPE");

  const name = `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;
  const relDir = path.join("public", "uploads", folder);
  const absDir = path.join(process.cwd(), relDir);
  await mkdir(absDir, { recursive: true });
  const absPath = path.join(absDir, name);
  await writeFile(absPath, buf);

  return `${base}/uploads/${folder}/${name}`;
}
