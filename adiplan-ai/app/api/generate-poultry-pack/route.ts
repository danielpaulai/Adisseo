import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import {
  poultryAudiences,
  poultryCampaigns,
  deterministicPoultryPack,
} from "@/lib/poultry-pack";

const blockSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("p"), text: z.string() }),
  z.object({ kind: z.literal("bullets"), items: z.array(z.string()).min(2).max(5) }),
  z.object({ kind: z.literal("callout"), label: z.string(), text: z.string() }),
]);

const packSchema = z.object({
  email: z.object({
    subject: z.string(),
    preheader: z.string(),
    greeting: z.string(),
    intro: z.string(),
    body: z.array(blockSchema).min(2).max(5),
    metricsTable: z
      .array(
        z.object({
          metric: z.string(),
          control: z.string(),
          treatment: z.string(),
          delta: z.string(),
        })
      )
      .min(3)
      .max(5),
    ctaLabel: z.string(),
    ctaHref: z.string(),
    signOff: z.string(),
    signature: z.string(),
    footnote: z.string(),
  }),
  carousel: z
    .array(
      z.object({
        index: z.number(),
        kind: z.enum(["cover", "stat", "list", "quote", "cta"]),
        eyebrow: z.string().optional(),
        headline: z.string(),
        body: z.string().optional(),
        bullets: z.array(z.string()).optional(),
        bigStat: z
          .object({ value: z.string(), label: z.string() })
          .optional(),
        attribution: z.string().optional(),
      })
    )
    .length(5),
  guardrailNotes: z.array(z.string()).min(3).max(7),
});

function pickModel() {
  if (process.env.OPENAI_API_KEY) return openai("gpt-4o-mini");
  if (process.env.ANTHROPIC_API_KEY) return anthropic("claude-3-5-haiku-latest");
  return null;
}

export async function POST(req: NextRequest) {
  const { campaignId = "agp-free-asia", audienceId = "integrator-cp" } =
    (await req.json()) as { campaignId?: string; audienceId?: string };

  const campaign = poultryCampaigns.find((c) => c.id === campaignId) ?? poultryCampaigns[0];
  const audience = poultryAudiences.find((a) => a.id === audienceId) ?? poultryAudiences[0];

  const fallback = deterministicPoultryPack(campaign.id, audience.id);
  const model = pickModel();

  let pack: z.infer<typeof packSchema> = {
    email: fallback.email,
    carousel: fallback.carousel,
    guardrailNotes: fallback.guardrailNotes,
  };
  let usedModel = "deterministic-stub";

  if (model) {
    try {
      const { object } = await generateObject({
        model,
        schema: packSchema,
        prompt: `You are APAC AI's Content Studio for Vish (Adisseo Poultry APAC).

Generate two coordinated deliverables for the same campaign and audience:
  (1) a technical email blast (HTML-ready, structured)
  (2) a 5-slide LinkedIn carousel (square, scannable)

CAMPAIGN: "${campaign.name}" — ${campaign.blurb}
Hook cues you may use: ${campaign.hookCues.join(" | ")}

AUDIENCE: "${audience.name}" (${audience.country}, segment: ${audience.segment}).
Approach: ${audience.approachNote}

Hard rules:
- Voice = Vish: numerate, technical, dry humour, no marketing fluff.
- No competitor brand names.
- No medical claims ("cures", "prevents", "guaranteed").
- Every claim ties to: trial cycle count, window in days, FCR / CV% / mortality / cost per kg LW.
- Metrics table: 3-5 rows, each row has metric / control / treatment / delta. Numbers must look like internal Adisseo data (defensible, not flashy).
- Email body = 3-4 blocks, mix of paragraphs, one bullet block (3-5 items), one callout.
- Carousel = exactly 5 slides: cover → stat → stat → list → cta. Headlines short (≤ 90 chars). Big stat on slide 2 and 3, expressed as a delta or a window.
- Guardrail notes: 3-5 bullets summarising the brand-compliance audit.

Return the structured object.`,
      });
      pack = object;
      usedModel = process.env.OPENAI_API_KEY ? "gpt-4o-mini" : "claude-3-5-haiku";
    } catch {
      // fall back silently
    }
  }

  return NextResponse.json({
    pack: { ...pack, campaignId: campaign.id, audienceId: audience.id },
    campaign,
    audience,
    meta: { usedModel },
  });
}
