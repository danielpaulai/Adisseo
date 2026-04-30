/**
 * Tier 2 smoke test — Puppeteer HTML→PDF + visual diff hint.
 *
 * Steps
 * -----
 * 1. Render a TFIP-style leaflet to PDF via /api/render-leaflet-html.
 * 2. Save the PDF to /tmp/aqua-tfip-smoke.pdf.
 * 3. Convert page 1 to PNG (via macOS `sips`) so the operator can eyeball
 *    against the published `Final_Leaflet_poultry_FEED EFFICIENCY.pdf`.
 *
 * Run:  npx tsx scripts/smoke-tier2.ts
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { deterministicLeaflet } from "../lib/aqua-leaflet";

async function main() {
  const { POST } = await import("../app/api/render-leaflet-html/route");

  // Use a deterministic ID-language leaflet — closest stand-in for what the
  // Trobos Aqua / Adisseo poultry leaflet would carry in Bahasa.
  const leaflet = deterministicLeaflet("Mycotoxin gate", "id", "mag-id-aquaculture");

  const req = new Request("http://localhost/api/render-leaflet-html", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      leaflet,
      personaLabel: "Farm nutritionist",
      disclaimer:
        "Performance ranges reflect APAC commercial trial summaries; results vary by genetic line, climate and feed matrix.",
    }),
  });

  const t0 = Date.now();
  const res = (await (POST as unknown as (r: Request) => Promise<Response>)(req)) as Response;
  const t1 = Date.now();

  if (!res.ok) {
    const text = await res.text();
    console.error(`[smoke] /api/render-leaflet-html FAIL (${res.status}): ${text}`);
    process.exit(1);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  const out = resolve("/tmp/aqua-tfip-smoke.pdf");
  writeFileSync(out, buf);
  console.log(`[smoke] PDF written: ${out} (${buf.byteLength} bytes, ${t1 - t0} ms)`);

  try {
    // Convert first page to PNG for visual inspection.
    execFileSync(
      "/usr/bin/sips",
      ["-s", "format", "png", out, "--out", "/tmp/aqua-tfip-smoke.png"],
      { stdio: "ignore" }
    );
    console.log("[smoke] preview: /tmp/aqua-tfip-smoke.png");
  } catch {
    // sips can't always read multi-page PDFs; fall back to pdftoppm if present.
    try {
      execFileSync(
        "/opt/homebrew/bin/pdftoppm",
        ["-png", "-r", "150", out, "/tmp/aqua-tfip-smoke"],
        { stdio: "ignore" }
      );
      console.log("[smoke] preview: /tmp/aqua-tfip-smoke-1.png");
    } catch {
      console.log("[smoke] no PDF→PNG converter available; open the PDF manually.");
    }
  }

  // Make sure the singleton browser is closed so the script exits cleanly.
  const cache = (globalThis as { __htmlPdfBrowser?: { browser: { close?: () => Promise<void> } | null } }).__htmlPdfBrowser;
  if (cache?.browser?.close) {
    await cache.browser.close().catch(() => undefined);
    cache.browser = null;
  }
}

main().catch((e: unknown) => {
  console.error("[smoke] unhandled:", e);
  process.exit(1);
});
