import { NextRequest, NextResponse } from "next/server";
import { scoreSlop, type SlopReport } from "@/lib/slop-detector";
import {
  scoreBrandVoice,
  type BrandVoiceId,
  type BrandVoiceReport,
  getBrandVoice,
} from "@/lib/brand-voice";
import { checkGrammar, type LtLanguage, type LtReport } from "@/lib/languagetool";

export const runtime = "nodejs";

export interface ProseQualityRequest {
  text: string;
  brandVoice?: BrandVoiceId;
  language?: LtLanguage;
  /** Skip the LanguageTool call (faster; for live editor scoring). */
  skipGrammar?: boolean;
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

  const slop = scoreSlop(text);
  const brand = scoreBrandVoice(text, voiceId);
  const grammar = body.skipGrammar
    ? { language, enabled: false, compliance: 1, rawCount: 0, issues: [] }
    : await checkGrammar(text, language);

  // Composite: weighted blend.
  //   slop:    50% (prose quality)
  //   brand:   30% (compliance with banned/required/claim)
  //   grammar: 20% (typos / grammar)
  const composite = Math.round(
    slop.score * 0.5 + brand.compliance * 100 * 0.3 + grammar.compliance * 100 * 0.2
  );

  // Gate: claim breach is hard fail; otherwise composite must clear floor.
  const passesGate = !brand.hasClaimBreach && composite >= voice.slopFloor;

  let summary: string;
  if (brand.hasClaimBreach) {
    summary = "Hard fail: regulatory claim-language breach — fix before HQ review.";
  } else if (composite < voice.slopFloor) {
    summary = `${composite}/100 — below ${voice.name} floor of ${voice.slopFloor}. Fix highest-weight slop hits first.`;
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
    brandFloor: voice.slopFloor,
    warningFloor: voice.warningFloor,
  };

  return NextResponse.json(response);
}
