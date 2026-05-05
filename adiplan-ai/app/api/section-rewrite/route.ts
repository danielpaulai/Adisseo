/**
 * APAC plan — Phase 5
 *
 * Section rewrite + translate endpoint that powers the InlineSectionEditor.
 *
 * Two modes:
 *   - rewrite   : tightens / re-tones a section using the brand-voice profile.
 *   - translate : flips the section between EN / VI / TH / ID / ZH.
 *
 * Calls Anthropic when ANTHROPIC_API_KEY is set; otherwise returns a
 * deterministic, demo-safe fallback so the studios still light up offline.
 * Either way, the call is logged through the existing llm-trace ring buffer
 * so /observability shows the action.
 */

import { NextResponse } from "next/server";
import { startTrace } from "@/lib/llm-trace";
import { getAnthropicAgentModelId } from "@/lib/anthropic-agent-model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Mode = "rewrite" | "translate";
type Lang = "en" | "vi" | "th" | "id" | "zh";

const LANG_NAME: Record<Lang, string> = {
  en: "English",
  vi: "Vietnamese",
  th: "Thai",
  id: "Indonesian (Bahasa)",
  zh: "Simplified Chinese",
};

interface SectionRewriteBody {
  sectionId: string;
  sectionLabel: string;
  text: string;
  mode: Mode;
  language?: Lang;
  prompt?: string;
  voiceProfileId?: string;
  tenantId?: string;
}

const SYSTEM_PROMPT = `You are a senior B2B copy editor for Adisseo APAC.
Voice: clear, factual, regulator-aware, no AI jargon, no emojis, no exclamation marks.
Always preserve product names verbatim (Rhodimet, Selisseo, Rovabio, Smartline, Nutri-Bind, Mycotoxin Management).
Never invent data. If a number is in the source, keep it; do not add new claims.
Return ONLY the rewritten text — no preface, no explanation, no markdown.`;

function buildUserPrompt(body: SectionRewriteBody): string {
  const lang = body.language ?? "en";
  if (body.mode === "translate") {
    return `Translate the following section into ${LANG_NAME[lang]}, keeping product names verbatim and preserving the persuasive tone.\n\nSection: ${body.sectionLabel}\n---\n${body.text}\n---`;
  }
  const guide = body.prompt?.trim() || "Tighten this; remove fluff; keep claims grounded.";
  return `Rewrite the section below in ${LANG_NAME[lang]} according to this guidance:\n${guide}\n\nSection: ${body.sectionLabel}\n---\n${body.text}\n---`;
}

/**
 * Deterministic fallback. Not a real translation — just a clearly-marked
 * brand-safe stand-in so the demo flow still works without an API key.
 */
function deterministicFallback(body: SectionRewriteBody): string {
  if (body.mode === "translate") {
    const lang = body.language ?? "en";
    if (lang === "en") return body.text;
    const stamp = `[${LANG_NAME[lang]} draft · review by native speaker]`;
    return `${stamp}\n\n${body.text}`;
  }
  // rewrite: tighten — strip filler words + cap at 220 words
  const FILLER = [
    /\bvery\s+/gi,
    /\bin order to\b/gi,
    /\bquite\s+/gi,
    /\bjust\s+/gi,
    /\bbasically\s+/gi,
    /\bactually\s+/gi,
    /\bthat\s+is\s+to\s+say\b/gi,
  ];
  let out = body.text;
  for (const f of FILLER) out = out.replace(f, "");
  out = out.replace(/\s+/g, " ").replace(/\s+([.,;:!?])/g, "$1").trim();
  const words = out.split(/\s+/);
  if (words.length > 220) out = words.slice(0, 220).join(" ") + "…";
  return out;
}

async function callAnthropic(body: SectionRewriteBody): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("no_key");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: getAnthropicAgentModelId(),
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(body) }],
    }),
  });
  if (!res.ok) {
    throw new Error(`anthropic_${res.status}`);
  }
  const json = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const out = (json.content ?? [])
    .filter((c) => c.type === "text")
    .map((c) => c.text ?? "")
    .join("\n")
    .trim();
  if (!out) throw new Error("anthropic_empty");
  return out;
}

export async function POST(req: Request) {
  let body: SectionRewriteBody;
  try {
    body = (await req.json()) as SectionRewriteBody;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  if (!body || !body.text || !body.mode) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const trace = startTrace({
    kind: "section-rewrite",
    title: `${body.mode} · ${body.sectionLabel}`,
    model: process.env.ANTHROPIC_API_KEY
      ? getAnthropicAgentModelId()
      : "deterministic",
    determined: !process.env.ANTHROPIC_API_KEY,
    payload: body.text.slice(0, 240),
    inputTokens: Math.ceil(body.text.length / 4),
  });

  let text: string;
  let usedFallback = false;
  try {
    text = await callAnthropic(body);
  } catch {
    text = deterministicFallback(body);
    usedFallback = true;
  }

  const span = trace.finish({
    summary: usedFallback
      ? `${body.mode} fallback (no API key or upstream error)`
      : `${body.mode} via Claude`,
    outputTokens: Math.ceil(text.length / 4),
    status: usedFallback ? "warn" : "success",
  });

  return NextResponse.json({
    text,
    trace: { id: span.id },
    fallback: usedFallback,
  });
}
