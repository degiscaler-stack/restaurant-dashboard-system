import { Suspense } from "react";
import MenuClient from "./menu-client";

export const dynamic = "force-dynamic";

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-baraka-black p-10 text-center text-white/60">…</div>}>
      <MenuClient />
    </Suspense>
  );
}
