/**
 * Downloads Unsplash JPEGs into public/images for local /images/*.jpg paths.
 * Run: node scripts/download-menu-images.mjs
 */
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "public", "images");

const FILES = [
  ["bissara.jpg", "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80&fm=jpg"],
  ["lentils.jpg", "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80&fm=jpg"],
  ["loubia.jpg", "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80&fm=jpg"],
  ["harira.jpg", "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80&fm=jpg"],
  ["kefta.jpg", "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&q=80&fm=jpg"],
  ["grilled-chicken.jpg", "https://images.unsplash.com/photo-1598103442097-8b743d2e04b6?w=800&q=80&fm=jpg"],
  ["liver-grill.jpg", "https://images.unsplash.com/photo-1606728035253-49e8a39f5728?w=800&q=80&fm=jpg"],
  ["mixed-grill.jpg", "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80&fm=jpg"],
  ["tajine-chicken.jpg", "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&q=80&fm=jpg"],
  ["tajine-meat.jpg", "https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&q=80&fm=jpg"],
  ["tajine-kefta.jpg", "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80&fm=jpg"],
  ["moroccan-tea.jpg", "https://images.unsplash.com/photo-1564890369479-c89f7570c667?w=800&q=80&fm=jpg"],
  ["orange-juice.jpg", "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80&fm=jpg"],
  ["water.jpg", "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&q=80&fm=jpg"],
  ["lunch-offer.jpg", "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80&fm=jpg"],
  ["family-offer.jpg", "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80&fm=jpg"],
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, { headers: { "User-Agent": "baraka-grill-images/1.0" } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          const loc = res.headers.location;
          file.close();
          fs.unlink(dest, () => {});
          if (!loc) return reject(new Error("redirect no location"));
          return resolve(download(loc, dest));
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlink(dest, () => {});
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve()));
      })
      .on("error", (err) => {
        file.close();
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

fs.mkdirSync(OUT, { recursive: true });

let ok = 0;
for (const [name, url] of FILES) {
  const dest = path.join(OUT, name);
  process.stdout.write(`${name} … `);
  try {
    await download(url, dest);
    console.log("ok");
    ok++;
  } catch (e) {
    console.log("FAIL", e.message);
  }
}
console.log(`Done: ${ok}/${FILES.length}`);
