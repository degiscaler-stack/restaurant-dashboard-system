import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

export function forbidStaffCatalog(role: UserRole): NextResponse | null {
  if (role === UserRole.STAFF) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return null;
}

export function forbidStaffNotifications(role: UserRole): NextResponse | null {
  if (role === UserRole.STAFF) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return null;
}
