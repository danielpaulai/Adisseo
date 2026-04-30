import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import {
  deterministicFrame,
  type StrategicFrameInput,
} from "@/lib/strategic-frame";
import type { SpeciesKey } from "@/lib/adiplan";

const speciesEnum = z.enum(["aqua", "poultry", "ruminants", "swine"]);

const frameSchema = z.object({
  enterprisePersona: z.string(),
  enterpriseInsight: z.string(),
  pain: z.object({ headline: z.string(), body: z.string() }),
  promise: z.object({ headline: z.string(), body: z.string() }),
  proof: z.object({
    headline: z.string(),
    body: z.string(),
    evidence: z.array(z.string()).min(2).max(6),
  }),
  proposition: z.object({
    headline: z.string(),
    body: z.string(),
    cta: z.string(),
  }),
  activations: z
    .array(
      z.object({
        species: speciesEnum,
        deliverable: z.string(),
        rationale: z.string(),
      })
    )
    .min(1)
    .max(4),
  oneLineSummary: z.string(),
});

function pickModel() {
  if (process.env.OPENAI_API_KEY) return openai("gpt-4o-mini");
  if (process.env.ANTHROPIC_API_KEY) return anthropic("claude-3-5-haiku-latest");
  return null;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<StrategicFrameInput>;

  if (
    !body.articleTitle ||
    !body.competitor ||
    !body.cbi ||
    !body.persona ||
    !body.cbiId ||
    !body.personaId
  ) {
    return NextResponse.json(
      { error: "Missing match context (articleTitle/competitor/cbi/persona)" },
      { status: 400 }
    );
  }

  const input: StrategicFrameInput = {
    articleId: body.articleId ?? "",
    articleTitle: body.articleTitle,
    competitor: body.competitor,
    region: body.region ?? "APAC",
    cbi: body.cbi,
    cbiId: body.cbiId,
    persona: body.persona,
    personaId: body.personaId,
    speciesFit: (body.speciesFit ?? []) as SpeciesKey[],
  };

  const fallback = deterministicFrame(input);
  const model = pickModel();

  let frame: z.infer<typeof frameSchema> = fallback;
  let usedModel = "deterministic-stub";

  if (model) {
    try {
      const { object } = await generateObject({
        model,
        schema: frameSchema,
        prompt: `You are APAC AI's Strategic Frame composer. You sit between
the News -> Strategy bridge and the species Studios.

Goal: turn this match into a Total Value Solution that regional sales / KAMs
can read in 90 seconds and act on this quarter.

Match context:
- Article: "${input.articleTitle}" (${input.competitor}, ${input.region})
- CBI: ${input.cbi}
- Persona: ${input.persona}
- Species fit: ${input.speciesFit.join(", ") || "n/a"}

Hard rules:
- enterprisePersona: ONE paragraph (3-5 sentences), naming the buyer in
  enterprise terms (e.g. "the ASEAN integrator vet-desk under regulatory
  pressure"), not the marketing-segment label.
- enterpriseInsight: 2 sentences. Time-bounded ("this quarter", "this cycle",
  "next 6 weeks"). Identifies what changed *now*.
- TVS structure: Pain × Promise × Proof × Proposition.
  - Each headline: 6-12 words, sales-talkable.
  - Each body: 1-3 sentences.
  - Proof.evidence: 3-5 short bullets, each a citation-grade fact (numbers,
    KOL channels, reviewed papers, audit reuse). No marketing fluff.
  - Proposition.cta: imperative phrase ("Co-design the 30-day protocol").
- activations: 1-3 entries. Each names a species + deliverable + 1-sentence
  rationale tying to the matched cycle. Only species that actually make
  sense for this article.
- oneLineSummary: <= 18 words. Punchy. Headlineable.
- No competitor brand names verbatim except in the source citation.
- No medical-claim words ('cure', 'prevent', 'guaranteed', 'treats').
- Defensible numbers only (range or specific, not invented absolute claims).`,
      });
      frame = object;
      usedModel = process.env.OPENAI_API_KEY ? "gpt-4o-mini" : "claude-3-5-haiku";
    } catch {
      // silent fall-through
    }
  }

  return NextResponse.json({
    frame: {
      ...frame,
      cbi: input.cbi,
      cbiId: input.cbiId,
      persona: input.persona,
      personaId: input.personaId,
      competitor: input.competitor,
      articleTitle: input.articleTitle,
      region: input.region,
    },
    meta: { usedModel },
  });
}
