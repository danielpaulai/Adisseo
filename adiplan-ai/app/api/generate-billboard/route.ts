import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import {
  deterministicBillboard,
  type BillboardPack,
  type BillboardInput,
} from "@/lib/billboards";

export const runtime = "nodejs";

const schema = z.object({
  headline: z.string().min(8).max(120),
  differentiation: z.string().min(20).max(400),
  reasonToBelieve: z.string().min(8).max(220),
  evidence: z.array(z.string().min(4).max(140)).min(3).max(3),
  cta: z.string().min(4).max(80),
  visualBrief: z.string().min(20).max(400),
  scoring: z.object({
    unique: z.number().int().min(1).max(5),
    important: z.number().int().min(1).max(5),
    believable: z.number().int().min(1).max(5),
  }),
});

export async function POST(req: NextRequest) {
  const body = (await req.json()) as BillboardInput;
  const seed = deterministicBillboard(body);

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      pack: seed,
      source: "deterministic",
    });
  }

  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema,
      prompt: `You are AdiPlan AI's billboard composer for Adisseo APAC.

The AdiPlan billboard test asks: is this Unique, Important and Believable
in one breath, on a wall, from 3 metres away?

Compose a billboard pack in English using the strategic context below.
Constraints:
- headline: ONE crisp sentence under 80 chars. No buzzwords. No "innovative", no "leveraging".
- differentiation: 1-2 sentences. What only Adisseo can claim against ${seed.competitor}.
- reasonToBelieve: ONE concrete fact (numbers, sample size, region, year).
- evidence: exactly 3 items. Each <120 chars. Numeric where possible.
- cta: 3-7 words.
- visualBrief: a short brief for an art board describing the hero visual.
  Be concrete (curves, scales, regions). NO emojis, NO text in the visual.
- scoring: rate the pack on Unique / Important / Believable, 1-5 each.

Strategic context:
- CBI: ${seed.cbi}
- Persona: ${seed.persona}
- Competitor signal: ${seed.competitor}
- Region: ${seed.region}
- Frame headline (anchor on this): ${seed.headline}
- Frame differentiation: ${seed.differentiation}
- Existing evidence stack: ${seed.evidence.join(" | ")}
- Existing CTA: ${seed.cta}

Stay in Adisseo's voice: technical, calm, claim-backed. No marketing fluff.`,
    });

    const pack: BillboardPack = {
      ...seed,
      headline: object.headline,
      differentiation: object.differentiation,
      reasonToBelieve: object.reasonToBelieve,
      evidence: object.evidence,
      cta: object.cta,
      visualBrief: object.visualBrief,
      scoring: object.scoring,
    };

    return NextResponse.json({ pack, source: "llm" });
  } catch (err) {
    console.error("[generate-billboard] LLM error, falling back:", err);
    return NextResponse.json({
      pack: seed,
      source: "deterministic-fallback",
      warning: err instanceof Error ? err.message : String(err),
    });
  }
}
