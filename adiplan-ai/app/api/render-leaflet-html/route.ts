/**
 * Tier 2 — HTML → PDF leaflet renderer (Puppeteer).
 *
 * This is the brand-faithful path. It accepts an AquaLeafletData payload
 * and returns a one-page A4 PDF rendered through real Chrome.
 *
 * Why a separate route from /api/render-aqua-leaflet:
 *   1. /api/render-aqua-leaflet stays the safe @react-pdf path; nothing
 *      regresses if Puppeteer breaks on a demo box.
 *   2. The studio UI can opt into HTML mode behind a flag and compare.
 *
 * Fallback chain:
 *   1. Try Puppeteer → returns brand-faithful PDF.
 *   2. On PuppeteerUnavailableError, return 503 with a typed reason so the
 *      caller can transparently retry against /api/render-aqua-leaflet.
 *
 * Inputs (JSON body):
 *   {
 *     leaflet: AquaLeafletData,
 *     personaLabel?: string,
 *     disclaimer?: string,
 *     options?: { warmupMs?, format?, landscape? }
 *   }
 *
 * Output: application/pdf
 */

import { NextRequest, NextResponse } from "next/server";
import { startTrace } from "@/lib/llm-trace";
import { htmlToPdf, PuppeteerUnavailableError } from "@/lib/html-pdf";
import { renderAquaTfipHtml } from "@/lib/leaflet-templates/aqua-tfip";
import type { AquaLeafletData } from "@/lib/aqua-leaflet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface RenderRequest {
  leaflet: AquaLeafletData;
  personaLabel?: string;
  disclaimer?: string;
  options?: {
    warmupMs?: number;
    format?: "A4" | "Letter" | "Legal";
    landscape?: boolean;
  };
}

export async function POST(req: NextRequest) {
  let body: RenderRequest;
  try {
    body = (await req.json()) as RenderRequest;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  if (!body?.leaflet) {
    return NextResponse.json(
      { error: "body.leaflet is required" },
      { status: 400 }
    );
  }

  const trace = startTrace({
    kind: "render-aqua-leaflet",
    title: `${body.leaflet.title.slice(0, 60)} · HTML`,
    model: "puppeteer-chromium",
    determined: true,
  });

  let html: string;
  try {
    html = renderAquaTfipHtml({
      data: body.leaflet,
      personaLabel: body.personaLabel,
      disclaimer: body.disclaimer,
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : "template error";
    trace.fail(detail);
    return NextResponse.json({ error: detail }, { status: 500 });
  }

  try {
    const pdf = await htmlToPdf({
      html,
      format: body.options?.format ?? "A4",
      landscape: body.options?.landscape ?? false,
      warmupMs: body.options?.warmupMs ?? 250,
    });

    trace.finish({
      summary: `HTML→PDF · ${pdf.byteLength} bytes · ${body.leaflet.language}`,
      outputTokens: 0,
    });

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="aqua-tfip-${body.leaflet.language}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    if (e instanceof PuppeteerUnavailableError) {
      trace.fail(e.message);
      return NextResponse.json(
        { error: e.message, code: "puppeteer_unavailable" },
        { status: 503 }
      );
    }
    const detail = e instanceof Error ? e.message : "puppeteer render failed";
    trace.fail(detail);
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
