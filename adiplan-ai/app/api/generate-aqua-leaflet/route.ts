import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import {
  aquaMagazines,
  deterministicLeaflet,
  type AquaLanguage,
} from "@/lib/aqua-leaflet";

const leafletSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  subtitle: z.string(),
  heroClaim: z.string(),
  heroEvidence: z.string(),
  sections: z
    .array(
      z.object({
        label: z.string(),
        heading: z.string(),
        body: z.string(),
      })
    )
    .min(2)
    .max(4),
  specs: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .min(3)
    .max(6),
  cta: z.string(),
  contactLine: z.string(),
  citationLine: z.string(),
  guardrailNotes: z.array(z.string()),
});

function pickModel() {
  if (process.env.OPENAI_API_KEY) return openai("gpt-4o-mini");
  if (process.env.ANTHROPIC_API_KEY) return anthropic("claude-3-5-haiku-latest");
  return null;
}

const langName: Record<AquaLanguage, string> = {
  en: "English",
  id: "Bahasa Indonesia (use 'park' register where addressing reader)",
  vi: "Vietnamese",
  th: "Thai (use 'koon' register where addressing reader)",
};

export async function POST(req: NextRequest) {
  const { topic, language = "en", magazineId = "mag-en-asia" } = (await req.json()) as {
    topic?: string;
    language?: AquaLanguage;
    magazineId?: string;
  };

  if (!topic || !topic.trim()) {
    return NextResponse.json({ error: "topic required" }, { status: 400 });
  }

  const magazine =
    aquaMagazines.find((m) => m.id === magazineId) ?? aquaMagazines[3];
  const model = pickModel();
  const fallback = deterministicLeaflet(topic, language, magazine.id);

  let leaflet: z.infer<typeof leafletSchema> = fallback;
  let usedModel = "deterministic-stub";

  if (model) {
    try {
      const { object } = await generateObject({
        model,
        schema: leafletSchema,
        prompt: `You are APAC AI's Content Studio for Aileen (Adisseo Aqua APAC).

Generate a 1-page technical leaflet for the magazine "${magazine.name}" (${magazine.country}, ${langName[language]}).
Audience: ${magazine.audience}. Tone notes: ${magazine.notes}.

Topic: ${topic}

Hard rules:
- Output every text field in ${langName[language]}.
- No competitor brand names.
- No medical-claim words: avoid "cure", "prevent", "guaranteed", "treats".
- Tone: dense, technical, citation-grade — Aileen's voice. Not marketing fluff.
- Sections must follow problem → mechanism → result.
- Specs table: dosage, phase, trial site count, cycle window. Real-feeling numbers.
- Hero claim is the single most important sentence. It must be defensible and specific.

Return: eyebrow line, title, subtitle, heroClaim, heroEvidence (2-3 sentence support),
3 sections (problem / how it works / on-farm result), 3-5 specs, CTA, contactLine,
citationLine, guardrailNotes (3-5 brand-guardrail compliance bullets).`,
      });
      leaflet = object;
      usedModel = process.env.OPENAI_API_KEY ? "gpt-4o-mini" : "claude-3-5-haiku";
    } catch {
      // fall back silently
    }
  }

  return NextResponse.json({
    leaflet: { ...leaflet, language, magazineId, topic },
    magazine,
    meta: { usedModel },
  });
}
