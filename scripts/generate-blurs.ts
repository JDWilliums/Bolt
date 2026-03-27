import { getPlaiceholder } from "plaiceholder";
import * as fs from "fs";
import * as path from "path";

// All unique image URLs from seed data + category heroes.
// We fetch each once, generate a tiny base64 blur, and cache the result.
const IMAGE_URLS: string[] = [
  // ─── Category Heroes ─────────────────────────────────────────
  "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?q=100&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=100&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=100&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=100&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=100&w=3000&auto=format&fit=crop",
  // ─── Homepage Hero ────────────────────────────────────────────
  "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=100&w=3000&auto=format&fit=crop",
  // ─── Product Images (unique base URLs) ────────────────────────
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=100&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=100&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=100&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=100&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=100&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?q=100&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?q=100&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1539185441755-769473a23570?q=100&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=100&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?q=100&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1605348532760-6753d2c43329?q=100&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=100&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?q=100&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=100&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1562183241-b937e95585b6?q=100&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1603787081207-362bcef7c144?q=100&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1628253747716-0c4f5c90fdda?q=100&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?q=100&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?q=100&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?q=100&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1579338559194-a162d19bf842?q=100&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=100&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=100&w=3000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=100&w=3000&auto=format&fit=crop",
];

async function generateBlurHash(url: string): Promise<string> {
  // Fetch at a small size to speed up processing
  const smallUrl = url.replace("w=3000", "w=64");
  const res = await fetch(smallUrl);
  const buffer = Buffer.from(await res.arrayBuffer());
  const { base64 } = await getPlaiceholder(buffer, { size: 10 });
  return base64;
}

async function main() {
  console.log("Generating blur hashes for all product images...\n");

  // Deduplicate URLs
  const uniqueUrls = [...new Set(IMAGE_URLS)];
  console.log(`Found ${uniqueUrls.length} unique image URLs.\n`);

  const cache: Record<string, string> = {};
  let completed = 0;

  // Process in batches of 5 to avoid rate limiting
  for (let i = 0; i < uniqueUrls.length; i += 5) {
    const batch = uniqueUrls.slice(i, i + 5);
    const results = await Promise.all(
      batch.map(async (url) => {
        try {
          const base64 = await generateBlurHash(url);
          completed++;
          console.log(`  [${completed}/${uniqueUrls.length}] Generated blur for ${url.split("photo-")[1]?.slice(0, 20) ?? url.slice(-30)}`);
          return { url, base64 };
        } catch (error) {
          console.error(`  FAILED: ${url}`, error);
          return { url, base64: "" };
        }
      })
    );
    for (const { url, base64 } of results) {
      if (base64) cache[url] = base64;
    }
  }

  // Write to lib/blur-cache.json
  const outPath = path.join(__dirname, "..", "lib", "blur-cache.json");
  fs.writeFileSync(outPath, JSON.stringify(cache, null, 2));
  console.log(`\nWrote ${Object.keys(cache).length} blur hashes to ${outPath}`);
}

main().catch(console.error);
