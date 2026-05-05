/**
 * Tier 1 — Claude Vision ingest endpoint.
 *
 * What this endpoint does
 * -----------------------
 * Takes a photo of an Adisseo workshop poster (CBI ladder, persona matrix,
 * value-prop circles, plan-on-a-page, etc.) and returns a structured JSON
 * payload the rest of the platform can consume directly:
 *
 *   - matrices          : labelled grid cells (rows × cols) with values
 *   - ladders           : ordered priority lists (1..N) per stakeholder
 *   - bullets           : free-form bullet groups under headings
 *   - text              : verbatim text blocks (titles, captions)
 *   - inferredKind      : best guess at which workshop poster this is
 *
 * Why we built this
 * -----------------
 * Today (2026-04-30) Ricardo will keep sending more workshop photos as he
 * runs sessions with Vish, Aileen, Antoine, Claire. Manually re-typing those
 * into TS files (lib/poultry-workshop.ts shape) is slow and error-prone. This
 * endpoint replaces that hand-typing with one Claude Vision call + Zod
 * validation. Latency is ~3–6 s per photo; cost is ~1¢ at typical 3 MP JPEGs.
 *
 * If ANTHROPIC_API_KEY is not set we still return a deterministic stub so
 * the route never crashes the demo.
 *
 * Inputs
 * ------
 * Either:
 *   1. JSON body — { imageBase64: "data:image/jpeg;base64,...", fileName?, hint? }
 *   2. multipart/form-data with a file field "image" (and optional "hint")
 *
 * The "hint" lets the caller bias the model — e.g. "this is a CBI/CSF ladder
 * for nutritionist, vet, purchaser" — which materially improves accuracy.
 */

import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { startTrace } from "@/lib/llm-trace";
import {
  anthropicAgentModel,
  getAnthropicAgentModelId,
} from "@/lib/anthropic-agent-model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/* ----------------------------------------------------------------------------
 * Output schema — what every workshop photo can decompose into.
 * Kept generic so it works for *any* poster shape without per-poster code.
 * -------------------------------------------------------------------------- */

const cellSchema = z.object({
  row: z.string(),
  col: z.string(),
  /** Cell value as written on the poster — number, ranking, "x", or label. */
  value: z.string(),
  /** Optional notes the team scribbled in the cell (sticky tags, arrows). */
  note: z.string().optional(),
});

const matrixSchema = z.object({
  /** A short, descriptive title — e.g. "Enterprise Personas × CSF priority". */
  title: z.string(),
  /** Row headers, top-to-bottom. */
  rows: z.array(z.string()).min(1),
  /** Column headers, left-to-right. */
  cols: z.array(z.string()).min(1),
  /** All non-empty cells. Empty cells SHOULD be omitted, not encoded as "". */
  cells: z.array(cellSchema),
});

const ladderRungSchema = z.object({
  rank: z.number().int().min(1),
  /** The verbatim rung text (CBI / CSF / KPI). */
  label: z.string(),
  note: z.string().optional(),
});

const ladderSchema = z.object({
  /** Stakeholder/persona/role this ladder belongs to. */
  owner: z.string(),
  /** What kind of ladder — CBI, CSF, KPI, Value-prop, Other. */
  kind: z.enum(["CBI", "CSF", "KPI", "value-prop", "other"]),
  rungs: z.array(ladderRungSchema).min(1),
});

const bulletGroupSchema = z.object({
  heading: z.string(),
  bullets: z.array(z.string()).min(1),
});

const ingestSchema = z.object({
  /** Best guess at which standard workshop artifact this is. */
  inferredKind: z.enum([
    "cbi-csf-ladder",
    "personas-priority-matrix",
    "persona-character-card",
    "value-prop-circles",
    "plan-on-a-page",
    "leading-lagging-metrics",
    "we-wish-we-knew",
    "ranked-insights",
    "unknown",
  ]),
  /** Big title scrawled at the top of the poster. */
  title: z.string().optional(),
  /** Short single-paragraph summary in plain English. */
  summary: z.string(),
  /** Quality flag — does the model think it captured the whole poster? */
  confidence: z.enum(["high", "medium", "low"]),
  /** Anything that was illegible / cropped / blurred. */
  unreadable: z.array(z.string()),
  matrices: z.array(matrixSchema),
  ladders: z.array(ladderSchema),
  bulletGroups: z.array(bulletGroupSchema),
  /** Free-form quotes / verbatim text blocks. */
  verbatim: z.array(z.string()),
});

export type IngestWorkshopPhotoResult = z.infer<typeof ingestSchema>;

/* ----------------------------------------------------------------------------
 * Prompt
 * -------------------------------------------------------------------------- */

const SYSTEM_PROMPT = `You are extracting structured data from a photo of an Adisseo APAC marketing-strategy workshop poster.

The Adisseo workshop method is built around CBI/CSF (Critical Business Issue / Customer Success Factor) ladders, enterprise personas, and a "plan on a page". Posters are typically:
  - hand-drawn on flipchart paper, sometimes with sticky notes
  - written in English, sometimes mixing French shorthand
  - structured as one of the following common shapes:
      - "personas × CSF" priority matrix (numbers 1..N show priority)
      - CBI / CSF / KPI ladders, one per stakeholder (nutritionist, vet, purchaser)
      - persona character cards (quote, characteristics, roadblocks, fitting products)
      - value-prop circles (Product / Add-ons / Services / Advisory)
      - plan-on-a-page (stakeholders → CSFs → personas → value props → campaign focus)
      - leading + lagging metrics tables
      - "We Wish We Knew" question lists
      - ranked insights list (top 7 etc.)

Output rules:
  - Capture the poster as faithfully as possible. Use the exact phrasing.
  - For matrices, if cells are blank, OMIT them. Do not invent values.
  - For ladders, "rank 1" is the highest priority (closest to the top of the ladder).
  - Mark anything you cannot read clearly in "unreadable".
  - Be honest about confidence. Default to "medium" unless you're sure.`;

/* ----------------------------------------------------------------------------
 * Deterministic fallback (no API key OR API failure)
 * -------------------------------------------------------------------------- */

function deterministicFallback(hint?: string): IngestWorkshopPhotoResult {
  const h = (hint ?? "").toLowerCase();
  const inferredKind: IngestWorkshopPhotoResult["inferredKind"] = h.includes("ladder")
    ? "cbi-csf-ladder"
    : h.includes("matrix") || h.includes("persona")
    ? "personas-priority-matrix"
    : h.includes("plan")
    ? "plan-on-a-page"
    : "unknown";
  return {
    inferredKind,
    title: hint ?? "Workshop poster (no API key — deterministic stub)",
    summary:
      "ANTHROPIC_API_KEY is not set, so this endpoint returned a deterministic stub. Wire the env var to get a real Claude Vision extraction.",
    confidence: "low",
    unreadable: ["the entire image — no model called"],
    matrices: [],
    ladders: [],
    bulletGroups: [],
    verbatim: [],
  };
}

/* ----------------------------------------------------------------------------
 * Input handling — supports JSON {imageBase64} OR multipart upload
 * -------------------------------------------------------------------------- */

interface IngestInput {
  imageBytes: Buffer;
  mimeType: string;
  fileName?: string;
  hint?: string;
}

async function readInput(req: NextRequest): Promise<IngestInput> {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("image");
    if (!(file instanceof File)) {
      throw new Error('multipart payload must include an "image" file field');
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    return {
      imageBytes: bytes,
      mimeType: file.type || "image/jpeg",
      fileName: file.name,
      hint: typeof form.get("hint") === "string" ? (form.get("hint") as string) : undefined,
    };
  }

  const json = (await req.json()) as {
    imageBase64?: string;
    fileName?: string;
    hint?: string;
  };
  if (!json.imageBase64) {
    throw new Error('JSON body must include "imageBase64" (data URL or raw base64)');
  }
  const dataUrlMatch = json.imageBase64.match(/^data:(.+?);base64,(.*)$/);
  let mime = "image/jpeg";
  let base64 = json.imageBase64;
  if (dataUrlMatch) {
    mime = dataUrlMatch[1];
    base64 = dataUrlMatch[2];
  }
  return {
    imageBytes: Buffer.from(base64, "base64"),
    mimeType: mime,
    fileName: json.fileName,
    hint: json.hint,
  };
}

/* ----------------------------------------------------------------------------
 * Route handler
 * -------------------------------------------------------------------------- */

export async function POST(req: NextRequest) {
  let input: IngestInput;
  try {
    input = await readInput(req);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "bad request" },
      { status: 400 }
    );
  }

  const useReal = !!process.env.ANTHROPIC_API_KEY;
  const trace = startTrace({
    kind: "ingest-workshop-photo",
    title: input.fileName ?? "(unnamed photo)",
    model: useReal ? getAnthropicAgentModelId() : "deterministic",
    determined: !useReal,
    payload: input.hint ? `hint: ${input.hint}` : undefined,
  });

  if (!useReal) {
    const stub = deterministicFallback(input.hint);
    trace.finish({
      summary: "deterministic stub (no ANTHROPIC_API_KEY)",
      status: "warn",
    });
    return NextResponse.json({ result: stub, fallback: true });
  }

  try {
    const { object } = await generateObject({
      model: anthropicAgentModel(),
      schema: ingestSchema,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "Extract this Adisseo workshop poster into the structured schema. " +
                (input.hint
                  ? `Hint from the uploader: "${input.hint}". `
                  : "") +
                "If the poster is one of the canonical shapes listed in the system prompt, set inferredKind accordingly. Otherwise pick the closest match or 'unknown'.",
            },
            {
              type: "image",
              image: input.imageBytes,
              mediaType: input.mimeType,
            },
          ],
        },
      ],
    });

    const result = object as IngestWorkshopPhotoResult;
    trace.finish({
      summary: `inferred=${result.inferredKind} · ${result.matrices.length}m / ${result.ladders.length}l / ${result.bulletGroups.length}b · conf=${result.confidence}`,
      outputTokens: estimateTokens(JSON.stringify(result)),
      costUsd: 0.012,
    });

    return NextResponse.json({ result, fallback: false });
  } catch (e) {
    const message = e instanceof Error ? e.message : "vision call failed";
    trace.fail(message);
    return NextResponse.json(
      {
        error: message,
        result: deterministicFallback(input.hint),
        fallback: true,
      },
      { status: 502 }
    );
  }
}

function estimateTokens(s: string): number {
  return Math.ceil(s.length / 4);
}
