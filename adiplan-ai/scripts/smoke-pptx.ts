/**
 * Smoke test for /api/render-poultry-pptx — runs the route handler in-process.
 *
 *   npx tsx scripts/smoke-pptx.ts
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

async function main() {
  const { POST } = await import("../app/api/render-poultry-pptx/route");
  const req = new Request("http://localhost/api/render-poultry-pptx", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      campaignId: "tfip",
      audienceId: "audience-nutritionist",
      brandSubtitle: "APAC poultry · ID · Vish desk",
    }),
  });
  const t0 = Date.now();
  const res = (await (POST as unknown as (r: Request) => Promise<Response>)(req)) as Response;
  if (!res.ok) {
    console.error(`[pptx] FAIL ${res.status}: ${await res.text()}`);
    process.exit(1);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const out = resolve("/tmp/poultry-tfip-nutritionist.pptx");
  writeFileSync(out, buf);
  console.log(`[pptx] OK · ${buf.byteLength} bytes · ${Date.now() - t0} ms`);
  console.log(`[pptx] open: ${out}`);
}

main().catch((e: unknown) => {
  console.error("[pptx] error:", e);
  process.exit(1);
});
