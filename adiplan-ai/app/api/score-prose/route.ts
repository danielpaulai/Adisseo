import { NextRequest, NextResponse } from "next/server";
import { scoreSlop, type SlopReport } from "@/lib/slop-detector";
import {
  scoreBrandVoice,
  type BrandVoiceId,
  type BrandVoiceReport,
  getBrandVoice,
} from "@/lib/brand-voice";
import { checkGrammar, type LtLanguage, type LtReport } from "@/lib/languagetool";
import { scoreCitations, type CitationReport } from "@/lib/citation-checker";
import { startTrace } from "@/lib/llm-trace";

export const runtime = "nodejs";

export interface ProseQualityRequest {
  text: string;
  brandVoice?: BrandVoiceId;
  language?: LtLanguage;
  /** Skip the LanguageTool call (faster; for live editor scoring). */
  skipGrammar?: boolean;
  /** Skip the citation depth check. Default false. */
  skipCitations?: boolean;
}

export interface ProseQualityResponse {
  text: string;
  /** 0–100 composite quality score. */
  composite: number;
  /** True if the deliverable is allowed to proceed to "Send to HQ". */
  passesGate: boolean;
  /** Summary explanation (one line). */
  summary: string;
  slop: SlopReport;
  brand: BrandVoiceReport;
  grammar: LtReport;
  citations: CitationReport;
  /** What the brand voice expects. */
  brandFloor: number;
  warningFloor: number;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ProseQualityRequest;
  const text = (body.text ?? "").trim();
  if (!text) {
    return NextResponse.json({ error: "missing text" }, { status: 400 });
  }

  const voiceId = body.brandVoice ?? "adisseo";
  const language = body.language ?? "en";
  const voice = getBrandVoice(voiceId);

  const trace = startTrace({
    kind: "score-prose",
    title: text.slice(0, 70),
    model: body.skipGrammar ? "deterministic" : "deterministic+languagetool",
    determined: true,
    payload: text.slice(0, 400),
    inputTokens: Math.ceil(text.length / 4),
  });

  const slop = scoreSlop(text);
  const brand = scoreBrandVoice(text, voiceId);
  const grammar = body.skipGrammar
    ? { language, enabled: false, compliance: 1, rawCount: 0, issues: [] }
    : await checkGrammar(text, language);
  const citations = body.skipCitations
    ? scoreCitations("")
    : scoreCitations(text);

  // Composite: weighted blend.
  //   slop:      40% (prose quality)
  //   brand:     25% (compliance with banned/required/claim)
  //   grammar:   15% (typos / grammar)
  //   citations: 20% (anchored in Vault?)
  const composite = Math.round(
    slop.score * 0.4 +
      brand.compliance * 100 * 0.25 +
      grammar.compliance * 100 * 0.15 +
      citations.score * 0.2
  );

  // Gate: claim breach is hard fail; otherwise composite must clear floor.
  const passesGate = !brand.hasClaimBreach && composite >= voice.slopFloor;

  let summary: string;
  if (brand.hasClaimBreach) {
    summary = "Hard fail: regulatory claim-language breach — fix before HQ review.";
  } else if (composite < voice.slopFloor) {
    summary = `${composite}/100 — below ${voice.name} floor of ${voice.slopFloor}. Fix highest-weight slop hits first.`;
  } else if (citations.score < 40 && text.split(/\s+/).filter(Boolean).length >= 60) {
    summary = `${composite}/100 — passes prose gate but unanchored. Pull a Vault entry.`;
  } else if (composite < voice.warningFloor) {
    summary = `${composite}/100 — passes the gate but reviewer should expect comments.`;
  } else {
    summary = `${composite}/100 — ${voice.name}-clean. Ship it.`;
  }

  const response: ProseQualityResponse = {
    text,
    composite,
    passesGate,
    summary,
    slop,
    brand,
    grammar,
    citations,
    brandFloor: voice.slopFloor,
    warningFloor: voice.warningFloor,
  };

  trace.finish({
    summary,
    trustScore: composite,
    status: brand.hasClaimBreach ? "error" : passesGate ? "success" : "warn",
  });

  return NextResponse.json(response);
}
