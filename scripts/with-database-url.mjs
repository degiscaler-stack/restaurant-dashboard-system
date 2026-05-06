import { spawnSync } from "child_process";
import { ensureDatabaseUrl } from "./compose-database-url.mjs";

ensureDatabaseUrl();

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error(
    "usage: node scripts/with-database-url.mjs <command> [args...]\nexample: node scripts/with-database-url.mjs npx prisma migrate deploy",
  );
  process.exit(1);
}

const status = spawnSync(args[0], args.slice(1), {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

process.exit(status.status === null ? 1 : status.status);
