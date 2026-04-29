import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { fetchArticleById } from "@/lib/scraper-api";
import { adiplanCBIs, adiplanPersonas, adiplanFormats } from "@/lib/adiplan";

const matchSchema = z.object({
  cbiId: z.string(),
  cbiRationale: z.string(),
  personaId: z.string(),
  personaRationale: z.string(),
  recommendedFormatIds: z.array(z.string()).min(2).max(4),
  speciesFit: z.array(z.enum(["aqua", "poultry", "ruminants", "swine"])),
});

function pickModel() {
  if (process.env.OPENAI_API_KEY) return openai("gpt-4o-mini");
  if (process.env.ANTHROPIC_API_KEY) return anthropic("claude-3-5-haiku-latest");
  return null;
}

function deterministicMatch(articleTags: string[], articleSpecies: string[]) {
  // Tag-driven CBI mapping (kept compact — ordering matters: first hit wins).
  const tagToCbi: [string, string][] = [
    ["ASF", "cbi-disease-pressure"],
    ["PRRS", "cbi-disease-pressure"],
    ["AGP-free", "cbi-regulatory-shift"],
    ["regulatory", "cbi-regulatory-shift"],
    ["sustainability", "cbi-sustainability"],
    ["mycotoxin", "cbi-mycotoxin"],
    ["raw-material-prices", "cbi-feed-cost"],
    ["amino-acids", "cbi-feed-cost"],
    ["precision-feeding", "cbi-feed-cost"],
    ["wechat", "cbi-channel-fragmentation"],
    ["premixer", "cbi-channel-fragmentation"],
    ["integrator", "cbi-channel-fragmentation"],
    ["ai-tools", "cbi-talent-knowledge"],
    ["pasture", "cbi-talent-knowledge"],
  ];
  const cbiId =
    tagToCbi.find(([t]) => articleTags.includes(t))?.[1] ?? "cbi-feed-cost";

  const personaId = articleTags.includes("sustainability")
    ? "persona-sustainability-advocate"
    : articleTags.some((t) => ["ASF", "PRRS", "regulatory", "mycotoxin"].includes(t))
    ? "persona-risk-reducer"
    : articleTags.includes("wechat") || articleTags.includes("kol")
    ? "persona-knowledge-builder"
    : "persona-efficiency";

  const speciesFit = articleSpecies.filter((s) =>
    ["aqua", "poultry", "ruminants", "swine"].includes(s)
  ) as ("aqua" | "poultry" | "ruminants" | "swine")[];

  const formats: string[] = [];
  if (speciesFit.includes("swine")) formats.push("fmt-tiktok-short", "fmt-wechat-livestream");
  if (speciesFit.includes("aqua")) formats.push("fmt-leaflet", "fmt-explainer-video");
  if (speciesFit.includes("ruminants")) formats.push("fmt-manga", "fmt-newsletter");
  if (speciesFit.includes("poultry")) formats.push("fmt-emailer", "fmt-linkedin-carousel");
  if (formats.length < 3) formats.push("fmt-mcq-knowledge");

  const cbi = adiplanCBIs.find((c) => c.id === cbiId)!;
  const persona = adiplanPersonas.find((p) => p.id === personaId)!;

  return {
    cbiId,
    cbiRationale: `The article surfaces ${articleTags
      .slice(0, 3)
      .join(", ")} — these are signals of ${cbi.label.toLowerCase()}.`,
    personaId,
    personaRationale: `The audience this should target prioritizes "${persona.topPriority.toLowerCase()}".`,
    recommendedFormatIds: formats.slice(0, 3),
    speciesFit: speciesFit.length ? speciesFit : (["swine"] as const).slice(),
  };
}

export async function POST(req: NextRequest) {
  const { articleId } = await req.json();
  const article = await fetchArticleById(articleId);
  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const model = pickModel();

  let result: z.infer<typeof matchSchema>;
  let usedModel = "deterministic-stub";

  if (model) {
    try {
      const { object } = await generateObject({
        model,
        schema: matchSchema,
        prompt: `You are AdiPlan AI, mapping competitor news to Adisseo's marketing strategy framework.

Article from competitor "${article.competitor}" (${article.publishedAt}):
Title: ${article.title}
Summary: ${article.summary}
Species: ${article.species.join(", ")}
Tags: ${article.tags.join(", ")}
Region: ${article.region}

Map this article to:

1. ONE Critical Business Issue (CBI) it most directly surfaces. Pick from these IDs only:
${adiplanCBIs.map((c) => `- ${c.id}: ${c.label} — ${c.description}`).join("\n")}

2. ONE Enterprise Persona Adisseo should target with our response. Pick from these IDs only:
${adiplanPersonas.map((p) => `- ${p.id}: ${p.label} (top priority: ${p.topPriority})`).join("\n")}

3. THREE deliverable formats Adisseo should produce in response. Pick from these IDs only:
${adiplanFormats.map((f) => `- ${f.id}: ${f.label} (best for ${f.bestFor.join("/")}, channel: ${f.channel})`).join("\n")}

4. Which species fit (subset of: aqua, poultry, ruminants, swine).

Be terse. Rationales should be 1-2 sentences each.`,
      });
      result = object;
      usedModel = process.env.OPENAI_API_KEY ? "gpt-4o-mini" : "claude-3-5-haiku";
    } catch {
      result = deterministicMatch(article.tags, article.species);
    }
  } else {
    result = deterministicMatch(article.tags, article.species);
  }

  const cbi = adiplanCBIs.find((c) => c.id === result.cbiId);
  const persona = adiplanPersonas.find((p) => p.id === result.personaId);
  const formats = result.recommendedFormatIds
    .map((id) => adiplanFormats.find((f) => f.id === id))
    .filter(Boolean);

  return NextResponse.json({
    article,
    match: {
      articleId: article.id,
      cbi: cbi?.label ?? result.cbiId,
      cbiId: result.cbiId,
      cbiRationale: result.cbiRationale,
      persona: persona?.label ?? result.personaId,
      personaId: result.personaId,
      personaRationale: result.personaRationale,
      recommendedFormats: formats.map((f) => f!.label),
      recommendedFormatIds: result.recommendedFormatIds,
      speciesFit: result.speciesFit,
      matchedAt: new Date().toISOString(),
    },
    meta: { usedModel },
  });
}
