"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ProseQualityCard } from "@/components/ProseQualityCard";
import { BRAND_VOICES, type BrandVoiceId } from "@/lib/brand-voice";
import type { LtLanguage } from "@/lib/languagetool";

const SAMPLES = {
  slop: `In today's fast-paced agricultural landscape, our innovative, best-in-class methionine solution leverages cutting-edge science to truly empower nutritionists and revolutionize feed conversion. We're proud to announce that our world-class team is passionate about delivering game-changing results — not just incremental improvements, but transformative outcomes that will move the needle for your operation. Studies show that our solution is amazing, and many believe it's the future of feed. We guarantee 100% effective performance.`,
  clean: `Adisseo's APAC swine trial (n=4 commercial farms, Q4 2025) recorded a 0.09-point FCR improvement (1.62 vs. 1.71 control) when liquid methionine replaced DL-Met in nursery feed at the standardised inclusion rate. Mortality in the post-weaning window dropped from 4.1% to 3.4%. The trial protocol is available on request and matches the Cargill SE-Asia ASF nursery-recovery brief published in November 2025.`,
  mixed: `Adisseo's revolutionary new feed solution prevents disease and guarantees better outcomes. Our APAC trial showed FCR improvement of 0.09 points across four farms in Q4 2025. The team is truly passionate about empowering integrators with cutting-edge science.`,
};

export default function TrustLayerPage() {
  const [voice, setVoice] = useState<BrandVoiceId>("adisseo");
  const [lang, setLang] = useState<LtLanguage>("en");
  const [text, setText] = useState<string>(SAMPLES.slop);

  return (
    <main className="min-h-screen bg-adisseo-bg">
      <header className="border-b border-adisseo-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo size="sm" />
          <nav className="flex items-center gap-4 text-xs">
            <Link href="/" className="flex items-center gap-1 text-adisseo-muted hover:text-adisseo-crimson">
              <ArrowLeft size={11} /> Home
            </Link>
            <Link href="/engagement-tracker" className="text-adisseo-muted hover:text-adisseo-crimson">
              Engagement tracker
            </Link>
            <Link href="/approval-queue" className="text-adisseo-muted hover:text-adisseo-crimson">
              Approval queue
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex items-baseline gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-adisseo-crimson text-white">
            <ShieldCheck size={16} />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
              Trust layer · Phase 1
            </p>
            <h1 className="text-2xl font-bold text-adisseo-ink-strong">
              Prose-quality scorer + brand-voice gate
            </h1>
            <p className="text-sm text-adisseo-muted">
              Three checks compose into one composite gate:
              slop-detector (16 LLM-tic rule families) · brand-voice
              (per-customer banned terms + claim guardrails) · LanguageTool
              grammar (EN / ZH / VI / TH / JA / ID).
            </p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-3">
          <button
            onClick={() => setText(SAMPLES.slop)}
            className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-left text-xs hover:bg-rose-100"
          >
            <p className="font-semibold text-rose-800">Sample · saturated AI slop</p>
            <p className="mt-1 text-rose-700/80">
              "Innovative, best-in-class, leverages cutting-edge science…" — should fail every gate.
            </p>
          </button>
          <button
            onClick={() => setText(SAMPLES.mixed)}
            className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-left text-xs hover:bg-amber-100"
          >
            <p className="font-semibold text-amber-900">Sample · typical first-draft</p>
            <p className="mt-1 text-amber-800/80">
              Real claims plus a few brand-voice misses. Should pass slop, fail brand-voice claim guard.
            </p>
          </button>
          <button
            onClick={() => setText(SAMPLES.clean)}
            className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-left text-xs hover:bg-emerald-100"
          >
            <p className="font-semibold text-emerald-800">Sample · Adisseo brand-clean</p>
            <p className="mt-1 text-emerald-700/80">
              Trial-anchored, no hype words, citation present. Should pass.
            </p>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-adisseo-line bg-white p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
                Source text
              </p>
              <div className="flex items-center gap-2">
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value as BrandVoiceId)}
                  className="rounded-md border border-adisseo-line bg-white px-2 py-1 text-[10px] font-semibold text-adisseo-ink-strong"
                >
                  {Object.values(BRAND_VOICES).map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as LtLanguage)}
                  className="rounded-md border border-adisseo-line bg-white px-2 py-1 text-[10px] font-semibold text-adisseo-ink-strong"
                >
                  {(["en", "zh", "vi", "th", "ja", "id"] as LtLanguage[]).map((c) => (
                    <option key={c} value={c}>
                      {c.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="h-[420px] w-full resize-none rounded-md border border-adisseo-line bg-adisseo-bg/40 p-3 font-mono text-xs leading-relaxed text-adisseo-ink-strong focus:border-adisseo-crimson focus:outline-none"
            />
            <p className="mt-2 text-[10px] text-adisseo-muted">
              Edits are scored locally (slop + brand-voice) on every keystroke; LanguageTool runs after a 1.2s pause.
            </p>
          </section>

          <section className="space-y-4">
            <ProseQualityCard text={text} brandVoice={voice} language={lang} />
            <div className="rounded-2xl border border-adisseo-line bg-white p-5">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
                <Sparkles size={12} /> What this gate is doing
              </p>
              <ul className="mt-3 space-y-2 text-xs text-adisseo-ink">
                <li>
                  <strong className="text-adisseo-ink-strong">Slop detector:</strong>{" "}
                  16 rule families — stock hype words, boilerplate openers,
                  assistant-tone markers, weasel phrasing, em-dash overuse,
                  contrast tells ("not just X, but Y"), repeated 4–8 word
                  phrases, copula chains, monotonous rhythm. Score is{" "}
                  <span className="font-mono">100 · e^(-λ · weighted-density)</span>.
                </li>
                <li>
                  <strong className="text-adisseo-ink-strong">Brand voice:</strong>{" "}
                  Adisseo / DSM-Firmenich / Cargill / Kemin each have their own banned-terms list.
                  Claim-language guardrails (cure / prevent / guarantee / treats) trigger a hard fail.
                </li>
                <li>
                  <strong className="text-adisseo-ink-strong">Grammar:</strong>{" "}
                  LanguageTool API call for the active language (EN, ZH, VI, TH, JA, ID).
                  Public endpoint by default — self-host for production scale.
                </li>
                <li>
                  <strong className="text-adisseo-ink-strong">Composite:</strong>{" "}
                  50% slop · 30% brand · 20% grammar. Floor for sending to regional review is 60.
                  Above-benchmark grading in the engagement tracker requires ≥ 80.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
