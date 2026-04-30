/**
 * Tier 2 — PPTX export for the Poultry deliverable pack.
 *
 * Endpoint takes the same shape as /api/generate-poultry-pack (campaignId +
 * audienceId) and returns a .pptx file the species manager can edit in
 * PowerPoint, Keynote or Slides. The carousel deck mirrors the on-screen
 * carousel slide-for-slide, plus a metrics-table slide and a sign-off.
 *
 * Why a separate endpoint vs adding a query flag to render-poultry-carousel:
 *   - Different content-type (PPTX vs PDF) means different headers + caching.
 *   - Different failure modes (pptxgenjs runs in pure JS, no Chromium).
 *   - The studio can cleanly offer "Download PDF" + "Download .pptx" side by
 *     side without juggling a single endpoint that returns both.
 */

import { NextRequest, NextResponse } from "next/server";
import { startTrace } from "@/lib/llm-trace";
import { deterministicPoultryPack } from "@/lib/poultry-pack";
import { renderPoultryPackPptx } from "@/lib/pptx-poultry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface BodyShape {
  campaignId?: string;
  audienceId?: string;
  brandSubtitle?: string;
}

export async function POST(req: NextRequest) {
  let body: BodyShape;
  try {
    body = (await req.json()) as BodyShape;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const campaignId = body.campaignId ?? "tfip";
  const audienceId = body.audienceId ?? "audience-nutritionist";

  const trace = startTrace({
    kind: "render-poultry-pack",
    title: `pptx · ${campaignId} · ${audienceId}`,
    model: "pptxgenjs",
    determined: true,
  });

  try {
    const pack = deterministicPoultryPack(campaignId, audienceId);
    const buf = await renderPoultryPackPptx({
      pack,
      brandSubtitle: body.brandSubtitle ?? `APAC poultry · ${audienceId.replace("audience-", "")}`,
    });
    trace.finish({
      summary: `PPTX ${buf.byteLength} bytes · ${pack.carousel.length} slides + metrics + cover/closer`,
    });
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="poultry-${campaignId}-${audienceId}.pptx"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : "pptx render failed";
    trace.fail(detail);
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
