/**
 * Deletes `.next` reliably (Windows + Unix). Stop `npm run dev` first.
 */
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const nextDir = join(root, ".next");

if (!existsSync(nextDir)) {
  console.log(".next not found (nothing to clean)");
  process.exit(0);
}

try {
  if (process.platform === "win32") {
    execSync('if exist ".next" rmdir /s /q ".next"', {
      cwd: root,
      shell: true,
      stdio: "inherit",
    });
  } else {
    execSync('rm -rf ".next"', { cwd: root, shell: true, stdio: "inherit" });
  }
  console.log("Removed .next");
  process.exit(0);
} catch (e) {
  console.error("Failed to remove .next:", e?.message || e);
  console.error("Stop Next.js (Ctrl+C), then run: npm run clean");
  process.exit(1);
}
