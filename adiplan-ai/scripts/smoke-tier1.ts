/**
 * Tier 1 smoke test — invokes the new ingest routes without booting Next.
 *
 * Run:  npx tsx scripts/smoke-tier1.ts
 *
 * What it does
 * ------------
 * 1. POST /api/ingest-workshop-photo with a real workshop poster image
 *    (vendor/workshop-photos/poultry-personas-csf-matrix.jpeg).
 *    - If ANTHROPIC_API_KEY is set, expects a real Claude Vision response.
 *    - If not, expects the deterministic fallback shape.
 * 2. POST /api/ingest-document with the published TFIP leaflet PDF.
 *    - If MISTRAL_API_KEY is set, expects pages with markdown tables.
 *    - If not, expects pdf-parse text-only output.
 *
 * Both routes' handlers are imported directly. We construct minimal Request
 * objects (Web Fetch API standard, since Next 13+ uses them).
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

interface IngestSummary {
  ok: boolean;
  status?: number;
  detail?: string;
}

async function smokeWorkshopPhoto(): Promise<IngestSummary> {
  const photoPath = resolve(
    "vendor/workshop-photos/poultry-personas-csf-matrix.jpeg"
  );
  const buf = readFileSync(photoPath);
  const base64 = buf.toString("base64");

  const { POST } = await import("../app/api/ingest-workshop-photo/route");
  const req = new Request("http://localhost/api/ingest-workshop-photo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageBase64: `data:image/jpeg;base64,${base64}`,
      fileName: "poultry-personas-csf-matrix.jpeg",
      hint:
        "Enterprise Personas (rows) × CSF (cols) priority matrix. Numbers 1..N show priority per persona.",
    }),
  });
  // Next App Router POST handlers expect a NextRequest. Casting is fine
  // for our purposes — the handler only reads `headers` and `json()`.
  const res = (await (POST as unknown as (r: Request) => Promise<Response>)(
    req
  )) as Response;

  if (!res.ok) {
    return { ok: false, status: res.status, detail: await res.text() };
  }
  const json = (await res.json()) as {
    fallback: boolean;
    result: {
      inferredKind: string;
      confidence: string;
      matrices: unknown[];
      ladders: unknown[];
      bulletGroups: unknown[];
    };
  };
  return {
    ok: true,
    detail:
      `fallback=${json.fallback} kind=${json.result.inferredKind} ` +
      `conf=${json.result.confidence} ` +
      `matrices=${json.result.matrices.length} ladders=${json.result.ladders.length} ` +
      `bullets=${json.result.bulletGroups.length}`,
  };
}

async function smokeDocumentOcr(): Promise<IngestSummary> {
  const pdfPath = resolve(
    "vendor/poultry-wetransfer/Final_Leaflet_poultry_FEED EFFICIENCY.pdf"
  );
  const buf = readFileSync(pdfPath);
  const base64 = buf.toString("base64");

  const { POST } = await import("../app/api/ingest-document/route");
  const req = new Request("http://localhost/api/ingest-document", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      documentBase64: `data:application/pdf;base64,${base64}`,
      fileName: "Final_Leaflet_poultry_FEED EFFICIENCY.pdf",
    }),
  });
  const res = (await (POST as unknown as (r: Request) => Promise<Response>)(
    req
  )) as Response;
  if (!res.ok) {
    return { ok: false, status: res.status, detail: await res.text() };
  }
  const json = (await res.json()) as {
    mode: string;
    pages: unknown[];
    tables: unknown[];
    wordCount: number;
  };
  return {
    ok: true,
    detail:
      `mode=${json.mode} pages=${json.pages.length} ` +
      `tables=${json.tables.length} words=${json.wordCount}`,
  };
}

async function main() {
  console.log("[smoke] starting Tier 1 ingest tests");
  console.log(
    `[smoke] ANTHROPIC_API_KEY=${
      process.env.ANTHROPIC_API_KEY ? "set" : "absent"
    }  MISTRAL_API_KEY=${process.env.MISTRAL_API_KEY ? "set" : "absent"}`
  );

  const a = await smokeWorkshopPhoto();
  console.log(
    `[smoke] /api/ingest-workshop-photo: ${a.ok ? "OK" : "FAIL"}  ${
      a.detail ?? ""
    }`
  );

  const b = await smokeDocumentOcr();
  console.log(
    `[smoke] /api/ingest-document:        ${b.ok ? "OK" : "FAIL"}  ${
      b.detail ?? ""
    }`
  );

  if (!a.ok || !b.ok) process.exitCode = 1;
}

main().catch((e: unknown) => {
  console.error("[smoke] unhandled error:", e);
  process.exit(1);
});
