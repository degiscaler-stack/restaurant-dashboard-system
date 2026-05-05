"use client";

import { useRouter } from "next/navigation";

export function AdminLogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-white/55 hover:text-amber-200"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
        router.replace("/admin/login");
        router.refresh();
      }}
    >
      خروج
    </button>
  );
}
