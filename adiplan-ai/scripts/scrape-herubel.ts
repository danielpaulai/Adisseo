/**
 * scripts/scrape-herubel.ts
 *
 * Phase 1 of the APAC masterplan — pull Pierre Hérubel's published infographic
 * inventory off his Substack so we can extract a design language (palette,
 * typography hierarchy, panel grid) and bake it into the renderers.
 *
 * Substack is friendlier than LinkedIn for scraping — no auth wall, predictable
 * archive markup, durable image URLs on substackcdn.com.
 *
 *   pnpm tsx scripts/scrape-herubel.ts          # full scrape
 *   pnpm tsx scripts/scrape-herubel.ts --limit=10
 *   pnpm tsx scripts/scrape-herubel.ts --dry-run
 *
 * Outputs to:
 *   vendor/herubel/index.json     — manifest of [{ post, title, images: [...] }]
 *   vendor/herubel/<slug>/<n>.png — downloaded full-resolution PNGs
 *
 * Run after install:
 *   pnpm add -D playwright
 *   pnpm exec playwright install chromium
 *
 * Note: Sandbox network-allowlist may block the live Substack hit; the
 * scraper is also runnable by hand against the produced URLs.
 */

import { chromium, type Page } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const BASE = "https://pierreherubel.substack.com";
const ARCHIVE = `${BASE}/archive?sort=new`;
const OUT = "vendor/herubel";

interface Post {
  slug: string;
  title: string;
  url: string;
  images: string[];
}

async function getPostList(page: Page, limit: number): Promise<Pick<Post, "slug" | "url" | "title">[]> {
  await page.goto(ARCHIVE, { waitUntil: "domcontentloaded" });

  // Substack lazy-loads — scroll a few times to fetch enough posts.
  for (let i = 0; i < 8; i++) {
    await page.mouse.wheel(0, 4000);
    await sleep(750);
  }

  const links = await page.$$eval("a[href*='/p/']", (anchors) =>
    Array.from(
      new Map(
        anchors
          .map((a) => {
            const href = (a as HTMLAnchorElement).href;
            const slug = href.split("/p/")[1]?.split(/[?#]/)[0] ?? "";
            const title =
              (a.querySelector("h3, h2") as HTMLElement | null)?.innerText?.trim() ??
              (a as HTMLAnchorElement).innerText?.trim() ??
              slug;
            return [slug, { slug, url: href, title }];
          })
          .filter(([slug]) => slug)
      ).values()
    )
  );

  return links.slice(0, limit);
}

async function scrapePost(page: Page, post: Pick<Post, "slug" | "url" | "title">): Promise<Post> {
  await page.goto(post.url, { waitUntil: "domcontentloaded" });
  await sleep(400);

  const images = await page.$$eval("img", (imgs) =>
    imgs
      .map((img) => (img as HTMLImageElement).src)
      .filter((src) => /substackcdn\.com|substack\.com/.test(src))
      .filter((src) => /\.(png|jpe?g|webp)/i.test(src))
      .map((src) => src.replace(/\/w_\d+,/, "/w_2000,").replace(/q_\d+/, "q_85"))
  );

  return {
    ...post,
    images: Array.from(new Set(images)),
  };
}

async function downloadImage(url: string, destPath: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`[skip] ${url} → ${res.status}`);
    return;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(destPath, buf);
}

async function main() {
  const args = new Map(
    process.argv.slice(2).map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v ?? "true"];
    })
  );
  const limit = Number(args.get("limit") ?? 30);
  const dryRun = args.get("dry-run") === "true";

  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 900 },
  });
  const page = await ctx.newPage();

  console.log(`[scrape-herubel] fetching list (limit=${limit})…`);
  const posts = await getPostList(page, limit);
  console.log(`[scrape-herubel] found ${posts.length} posts`);

  const out: Post[] = [];
  for (const p of posts) {
    process.stdout.write(`  · ${p.slug} `);
    try {
      const full = await scrapePost(page, p);
      out.push(full);
      process.stdout.write(`(${full.images.length} imgs)\n`);
      if (!dryRun) {
        const dir = join(OUT, p.slug);
        await mkdir(dir, { recursive: true });
        for (let i = 0; i < full.images.length; i++) {
          await downloadImage(full.images[i], join(dir, `${i}.png`));
        }
      }
    } catch (err) {
      process.stdout.write(`× ${(err as Error).message}\n`);
    }
  }

  await writeFile(
    join(OUT, "index.json"),
    JSON.stringify({ scrapedAt: new Date().toISOString(), posts: out }, null, 2)
  );

  console.log(`[scrape-herubel] done → ${OUT}/index.json`);
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
