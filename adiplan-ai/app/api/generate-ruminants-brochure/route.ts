import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import {
  deterministicBrochure,
  ruminantsAudiences,
  ruminantsCampaigns,
  type RuminantsLanguage,
} from "@/lib/ruminants-brochure";
import {
  anthropicAgentModel,
  getAnthropicAgentModelId,
} from "@/lib/anthropic-agent-model";

const brochureSchema = z.object({
  coverTitle: z.string(),
  coverEyebrow: z.string(),
  issueBadge: z.string(),
  bubbleLine: z.string(),
  bubbleKind: z.enum(["speech", "shout", "thought"]).optional(),
  coverSfx: z.string().optional(),
  heroClaim: z.string(),
  heroEvidence: z.string(),
  emphasisStamp: z.string(),
  coverTease: z.string(),
  panels: z
    .array(
      z.object({
        label: z.string(),
        heading: z.string(),
        body: z.string(),
        stat: z
          .object({ value: z.string(), unit: z.string() })
          .optional(),
        sfx: z.string().optional(),
        blackPanel: z.boolean().optional(),
      })
    )
    .min(3)
    .max(4),
  ctaHeading: z.string(),
  ctaBody: z.string(),
  contactLine: z.string(),
  citationLine: z.string(),
  guardrailNotes: z.array(z.string()).min(3),
});

function pickModel() {
  if (process.env.OPENAI_API_KEY) return openai("gpt-4o-mini");
  if (process.env.ANTHROPIC_API_KEY) return anthropicAgentModel();
  return null;
}

const langName: Record<RuminantsLanguage, string> = {
  ja: "Japanese (formal but approachable; technical-brief register; 「〜である」体は避け、「〜する」体ベースで読みやすく)",
  en: "English",
};

export async function POST(req: NextRequest) {
  const {
    topic,
    language = "ja",
    audienceId = "aud-jp-snow-meiji",
    campaignId = "camp-heat-stress",
  } = (await req.json()) as {
    topic?: string;
    language?: RuminantsLanguage;
    audienceId?: string;
    campaignId?: string;
  };

  const audience =
    ruminantsAudiences.find((a) => a.id === audienceId) ?? ruminantsAudiences[0];
  const campaign =
    ruminantsCampaigns.find((c) => c.id === campaignId) ?? ruminantsCampaigns[0];

  const seedTopic = (topic && topic.trim()) || campaign.topicSeed;

  const model = pickModel();
  const fallback = deterministicBrochure(
    seedTopic,
    language,
    audience.id,
    campaign.id
  );

  let brochure: z.infer<typeof brochureSchema> = fallback;
  let usedModel = "deterministic-stub";

  if (model) {
    try {
      const { object } = await generateObject({
        model,
        schema: brochureSchema,
        prompt: `You are APAC AI's Content Studio for Antoine (Adisseo Ruminants APAC).

Generate a 2-page "manga-style" technical brochure aimed at ${audience.name} (${audience.region}, ${audience.type} buyer).
Audience approach note: ${audience.approachNote}.

Campaign: "${campaign.name}". Hook seed: "${campaign.hook}".
Topic seed: ${seedTopic}.

Output language: ${langName[language]}.

Hard rules:
- Output every text field in ${langName[language]}.
- No competitor brand names.
- No medical-claim words ('治す', 'cure', '予防する', 'guaranteed', 'treats').
- Tone: dense, technical, citation-grade — Antoine's voice. Defensible numbers only.
- Manga style applies to LAYOUT only; tone stays serious.
- coverTitle: ultra-short, punchy headline (4-8 chars in JP, 2-4 words in EN). Will be set in massive bold white-on-black type.
- bubbleLine: 1 short line, sounds like a speech bubble from a farm-vet character.
- bubbleKind: pick one of "speech" | "shout" | "thought".
   * "speech" = neutral / observational
   * "shout"  = explosive / urgent / market-shock framing (rendered as jagged starburst bubble)
   * "thought" = inner question / hypothesis framing (rendered as cloud bubble)
- coverSfx: 2-6 char manga onomatopoeia overlay rendered large + rotated, bleeding across the hero panel.
   * JP examples: ドンッ!! / バンッ!! / ガッ! / ハッ! / ドカン!
   * EN examples: BAM!! / POW! / WHAM!! / KA-POW!
- emphasisStamp: 2-4 chars only (e.g. "重要" / "IMPACT" / "新事実" / "勝ち筋"). Used in a rotated stamp.
- heroClaim: ONE sentence. The most defensible, specific claim.
- heroEvidence: 2 sentences supporting the claim with realistic numbers (Hokkaido / APAC trial framing).
- panels: exactly 4 items in this order — Challenge / Mechanism / Result / Next step. Panel 3 ("Result") MUST include a stat with realistic numeric value + unit.
   * Set blackPanel: true on EXACTLY ONE panel (typically the Challenge panel) — this renders as a dramatic black-fill "kuro-koma" with reverse-white text.
   * Set sfx on AT LEAST the Result panel (the stat panel) using a 2-5 char manga SFX (e.g. バンッ!, グッ!, POW!).
- ctaHeading: short call to action.
- ctaBody: 1-2 sentences detailing the next step.
- guardrailNotes: 4-6 brand-compliance bullets in ${langName[language]}.`,
      });
      brochure = object;
      usedModel = process.env.OPENAI_API_KEY
        ? "gpt-4o-mini"
        : getAnthropicAgentModelId();
    } catch {
      // silent fall-through to deterministic
    }
  }

  return NextResponse.json({
    brochure: {
      ...brochure,
      language,
      audienceId: audience.id,
      campaignId: campaign.id,
      topic: seedTopic,
    },
    audience,
    campaign,
    meta: { usedModel },
  });
}
