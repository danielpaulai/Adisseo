import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { swineAccounts } from "@/lib/swine-accounts";
import {
  anthropicAgentModel,
  getAnthropicAgentModelId,
} from "@/lib/anthropic-agent-model";

const sceneSchema = z.object({
  index: z.number(),
  durationSec: z.number().min(2).max(15),
  shot: z.string(),
  onScreenText: z.string(),
  voiceover: z.string(),
});

const shortSchema = z.object({
  hook: z.string(),
  scenes: z.array(sceneSchema).min(4).max(8),
  cta: z.string(),
  hashtags: z.array(z.string()).max(8),
  guardrailNotes: z.array(z.string()),
  totalDurationSec: z.number(),
});

function pickModel() {
  if (process.env.OPENAI_API_KEY) return openai("gpt-4o-mini");
  if (process.env.ANTHROPIC_API_KEY) return anthropicAgentModel();
  return null;
}

const languageNames: Record<string, string> = {
  en: "English",
  zh: "Mandarin Chinese (Simplified)",
  vi: "Vietnamese",
  th: "Thai (use 'koon' register)",
  id: "Bahasa Indonesia (use 'park' register)",
};

function deterministicFallback(topic: string, accountName?: string) {
  const account = accountName ? ` for ${accountName}` : "";
  return {
    hook: `That ${topic.slice(0, 40)}… here's what 99% of farms miss.`,
    scenes: [
      {
        index: 1,
        durationSec: 3,
        shot: "Close-up: hand pointing at a piglet's flank in a clean nursery.",
        onScreenText: "Stop scrolling.",
        voiceover: `If you run swine${account}, this 8-second test could save you a barn.`,
      },
      {
        index: 2,
        durationSec: 7,
        shot: "Cut to vet KOL talking-head with on-screen lower-third.",
        onScreenText: `${topic.slice(0, 30)}…`,
        voiceover: "Most outbreaks start the week before you see symptoms.",
      },
      {
        index: 3,
        durationSec: 10,
        shot: "Animated graphic: feed bag → gut → blood marker arrows.",
        onScreenText: "The 3 leading indicators",
        voiceover: "Watch FCR drift, watch water intake, watch nursery uniformity.",
      },
      {
        index: 4,
        durationSec: 10,
        shot: "Split screen: stressed barn vs. calm barn, same week.",
        onScreenText: "Same outbreak. Different outcome.",
        voiceover: "What changed? Pre-loaded gut resilience.",
      },
      {
        index: 5,
        durationSec: 10,
        shot: "On-farm B-roll, sunrise lighting, hands-on shot of operator.",
        onScreenText: "Adisseo. Resilience, built in.",
        voiceover: "Talk to your Adisseo rep this week. Don't wait for the alert.",
      },
      {
        index: 6,
        durationSec: 5,
        shot: "End card with QR + Adisseo logo. Brand-color bar bottom.",
        onScreenText: "Scan for the playbook",
        voiceover: "",
      },
    ],
    cta: "Comment 'PLAYBOOK' for the 3-page nursery resilience guide.",
    hashtags: ["#swine", "#asf", "#piglet", "#feedmill", "#adisseo"],
    guardrailNotes: [
      "No competitor naming.",
      "No medical-claim language ('cure', 'prevent').",
      "Adisseo logo + brand-color bar required on end card.",
      "QR target must route through approved short-link domain.",
    ],
    totalDurationSec: 45,
  };
}

export async function POST(req: NextRequest) {
  const { topic, language, accountId, articleSummary } = await req.json();

  const account = accountId
    ? swineAccounts.find((a) => a.id === accountId)
    : undefined;

  const model = pickModel();

  let result: z.infer<typeof shortSchema>;
  let usedModel = "deterministic-stub";

  if (model && topic) {
    try {
      const { object } = await generateObject({
        model,
        schema: shortSchema,
        prompt: `You are APAC AI's Content Studio for Claire (Adisseo Swine APAC).

Generate a vertical-format <60s short for TikTok / WeChat Channels / Instagram Reels — NOT LinkedIn.

Topic: ${topic}
${articleSummary ? `Source article context: ${articleSummary}` : ""}
Output language: ${languageNames[language] ?? "English"}
${account ? `Adapt for account: ${account.name} (${account.country}, ${account.type}). Notes: ${account.notes}` : ""}

Hard rules:
- Total runtime 40-55 seconds. 4-7 scenes.
- Hook in the first 3 seconds. No greeting, no logo intro.
- No competitor names.
- No medical-claim words: avoid "cure", "prevent", "guaranteed", "treats".
- End card must include "Adisseo" + a CTA.
- Tone: peer-to-peer with farm staff, NOT corporate marketing.
- All text fields in the chosen output language. Voiceover in chosen language. On-screen text in chosen language.
- For Thai use the "koon" register; for Indonesian use the "park" register; for Mandarin keep tone direct (not formal).

Return: hook line, scene list (each with shot description, on-screen text, voiceover, duration), CTA, hashtags, guardrail notes, totalDurationSec.`,
      });
      result = object;
      usedModel = process.env.OPENAI_API_KEY
        ? "gpt-4o-mini"
        : getAnthropicAgentModelId();
    } catch {
      result = deterministicFallback(topic ?? "swine biosecurity", account?.name);
    }
  } else {
    result = deterministicFallback(topic ?? "swine biosecurity", account?.name);
  }

  return NextResponse.json({
    short: result,
    meta: {
      usedModel,
      topic,
      language,
      account: account ?? null,
    },
  });
}
