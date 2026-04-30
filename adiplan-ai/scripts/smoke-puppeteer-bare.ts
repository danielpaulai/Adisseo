/**
 * Bare-bones puppeteer sanity check. No app code, no @react-pdf, no template.
 * If this fails, the issue is the puppeteer install. If it succeeds, the
 * issue is in lib/html-pdf or the template.
 */
import { writeFileSync } from "node:fs";

async function main() {
  const t0 = Date.now();
  const puppeteer = await import("puppeteer");
  console.log(`[bare] imported in ${Date.now() - t0} ms`);

  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  console.log(`[bare] launched in ${Date.now() - t0} ms`);

  const page = await browser.newPage();
  await page.setContent("<h1>Hello, brand</h1>", { waitUntil: "domcontentloaded" });
  console.log(`[bare] setContent in ${Date.now() - t0} ms`);

  const pdf = await page.pdf({ format: "A4" });
  console.log(`[bare] pdf in ${Date.now() - t0} ms (${pdf.length} bytes)`);

  writeFileSync("/tmp/bare-puppeteer.pdf", Buffer.from(pdf));

  await page.close();
  await browser.close();
  console.log("[bare] done");
}

main().catch((e: unknown) => {
  console.error("[bare] error:", e);
  process.exit(1);
});
