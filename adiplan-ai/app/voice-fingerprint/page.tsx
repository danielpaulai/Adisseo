"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Fingerprint,
  Mic,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import {
  buildVoiceProfile,
  scoreAgainstVoiceProfile,
  DEFAULT_VOICE_PROFILES,
  MANAGER_OPTIONS,
  type VoiceProfile,
} from "@/lib/voice-profile";
import { useAdiPlanStore } from "@/lib/store";
import { toast } from "sonner";

const TEST_DRAFTS: Record<string, string> = {
  vish: "Across four farms in Q1 2026, our eubiotic protocol held FCR within 0.05 points of pre-AGP baseline. CP nutrition manager confirmed mortality dropped 0.6pp [v-poultry-agp-id-2026]. Trial protocol on request.",
  aileen: "Acceptance-gate testing at the receiving dock catches DON before it reaches the mixer. Q4 2025 trial: 12 batches, 38% reduction in carry-over. The mill QC desk runs the protocol in 22 minutes.",
  antoine: "Hokkaido summer-yield drop fell from 2.4 to 0.9 kg per cow per day under the heat-stress nutrition pack — across 240 cows in three herds. Co-op procurement wants a tighter spec next quarter.",
  claire: "ASF nursery recovery. Four farms. Mortality down 0.7pp. FCR 1.62 vs. 1.71 control. The vet desk says recovery is 2.8 days shorter. We have the trial protocol.",
  ricardo: "Seven serious viewers. Three customer conversions. The 43% qualified-to-conversion rate is the bar. Every new deliverable is graded against it. We've held it for two quarters.",
};

export default function VoiceFingerprintPage() {
  const stored = useAdiPlanStore((s) => s.voiceProfiles);
  const setVoiceProfile = useAdiPlanStore((s) => s.setVoiceProfile);
  const removeVoiceProfile = useAdiPlanStore((s) => s.removeVoiceProfile);
  const activeManagerId = useAdiPlanStore((s) => s.activeManagerId);
  const setActiveManager = useAdiPlanStore((s) => s.setActiveManager);

  const [active, setActive] = useState<string>(activeManagerId ?? "vish");
  const [samples, setSamples] = useState<string>("");
  const [draft, setDraft] = useState<string>(TEST_DRAFTS[active] ?? "");

  // Resolve current profile: stored > default > null
  const profile: VoiceProfile = useMemo(() => {
    return stored[active] ?? DEFAULT_VOICE_PROFILES[active];
  }, [stored, active]);

  // Build a temp profile from samples (live)
  const tempProfile = useMemo(() => {
    const pieces = samples
      .split(/\n{2,}/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (pieces.length === 0) return null;
    const opt = MANAGER_OPTIONS.find((m) => m.id === active);
    return buildVoiceProfile(active, opt?.name ?? active, pieces);
  }, [samples, active]);

  // Score the draft against whichever profile is active in the right pane.
  const draftReport = useMemo(() => {
    if (!profile) return null;
    return scoreAgainstVoiceProfile(draft, profile);
  }, [draft, profile]);

  useEffect(() => {
    setDraft(TEST_DRAFTS[active] ?? "");
  }, [active]);

  function pick(id: string) {
    setActive(id);
    setActiveManager(id);
    setSamples("");
  }

  function saveProfile(p: VoiceProfile) {
    setVoiceProfile(active, p);
    toast.success(`Saved voice profile`, { description: p.managerName });
  }

  return (
    <main className="min-h-screen bg-adisseo-bg">
      <header className="border-b border-adisseo-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo size="sm" />
          <nav className="flex items-center gap-4 text-xs">
            <Link href="/" className="flex items-center gap-1 text-adisseo-muted hover:text-adisseo-crimson">
              <ArrowLeft size={11} /> Home
            </Link>
            <Link href="/trust-layer" className="text-adisseo-muted hover:text-adisseo-crimson">Trust layer</Link>
            <Link href="/observability" className="text-adisseo-muted hover:text-adisseo-crimson">Observability</Link>
            <Link href="/og-cards" className="text-adisseo-muted hover:text-adisseo-crimson">OG cards</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex items-baseline gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-adisseo-crimson text-white">
            <Fingerprint size={16} />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
              Phase 3 · Brand-voice fingerprinting
            </p>
            <h1 className="text-2xl font-bold text-adisseo-ink-strong">
              Per-manager voice profile
            </h1>
            <p className="text-sm text-adisseo-muted">
              DSPy-style fingerprint of how each species manager actually
              writes — sentence rhythm, hedging, citation density,
              signature 3-grams, em-dash habits. The trust layer adds a "voice
              match" sub-score so a draft sounds like the human shipping it.
            </p>
          </div>
        </div>

        {/* MANAGER PICKER */}
        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          {MANAGER_OPTIONS.map((m) => {
            const has = !!stored[m.id];
            const isActive = active === m.id;
            return (
              <button
                key={m.id}
                onClick={() => pick(m.id)}
                className={`rounded-2xl border p-3 text-left transition ${
                  isActive
                    ? "border-adisseo-crimson bg-white shadow"
                    : "border-adisseo-line bg-white hover:border-adisseo-crimson"
                }`}
              >
                <p className={`text-base font-bold ${isActive ? "text-adisseo-crimson" : "text-adisseo-ink-strong"}`}>
                  {m.name}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-adisseo-muted">
                  {m.species}
                </p>
                <p className="mt-2 inline-flex items-center gap-1 text-[10px]">
                  {has ? (
                    <span className="inline-flex items-center gap-0.5 text-emerald-700">
                      <CheckCircle2 size={9} /> custom profile
                    </span>
                  ) : (
                    <span className="text-adisseo-muted">seeded default</span>
                  )}
                </p>
              </button>
            );
          })}
        </section>

        {/* MAIN GRID */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* LEFT: SAMPLES + PROFILE */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-adisseo-line bg-white p-5">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
                <Mic size={11} /> Writing samples
              </p>
              <p className="mt-1 text-[11px] text-adisseo-muted">
                Paste 2–3 paragraphs the manager has actually written
                (LinkedIn posts, internal notes, prior decks). Separate with blank lines.
                The fingerprint computes locally; nothing is sent.
              </p>
              <textarea
                value={samples}
                onChange={(e) => setSamples(e.target.value)}
                placeholder="Paste samples here — separate paragraphs with blank lines."
                className="mt-3 h-44 w-full resize-y rounded-md border border-adisseo-line bg-adisseo-bg/40 p-3 font-mono text-xs leading-relaxed focus:border-adisseo-crimson focus:outline-none"
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => tempProfile && saveProfile(tempProfile)}
                  disabled={!tempProfile}
                  className="inline-flex items-center gap-1 rounded-md bg-adisseo-crimson px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-adisseo-crimson/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={12} /> Save profile
                </button>
                <button
                  onClick={() => removeVoiceProfile(active)}
                  disabled={!stored[active]}
                  className="inline-flex items-center gap-1 rounded-md border border-adisseo-line bg-white px-3 py-1.5 text-xs font-semibold text-adisseo-ink-strong transition hover:border-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 size={11} /> Reset to seed
                </button>
                <button
                  onClick={() => setSamples("")}
                  className="inline-flex items-center gap-1 rounded-md border border-adisseo-line bg-white px-3 py-1.5 text-xs font-semibold text-adisseo-muted hover:border-adisseo-crimson"
                >
                  <RefreshCw size={11} /> Clear
                </button>
              </div>
              {tempProfile && (
                <p className="mt-2 text-[10px] text-emerald-700">
                  {tempProfile.wordCount} words · {tempProfile.sentenceCount} sentences — ready to save
                </p>
              )}
            </div>

            <ProfileCard profile={profile} title={stored[active] ? "Saved profile" : "Seed profile (defaults)"} />

            {tempProfile && (
              <ProfileCard
                profile={tempProfile}
                title="Live preview from your samples"
                accent="cyan"
              />
            )}
          </div>

          {/* RIGHT: DRAFT SCORING */}
          <div className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
            <div className="rounded-2xl border border-adisseo-line bg-white p-5">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
                <Sparkles size={11} /> Score a draft against {profile.managerName}
              </p>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Paste a deliverable draft here…"
                className="mt-3 h-44 w-full resize-y rounded-md border border-adisseo-line bg-adisseo-bg/40 p-3 font-mono text-xs leading-relaxed focus:border-adisseo-crimson focus:outline-none"
              />
            </div>

            {draftReport && <ScoreCard report={draftReport} profile={profile} />}

            <div className="rounded-2xl border border-adisseo-line bg-white p-4 text-[11px]">
              <p className="font-semibold uppercase tracking-widest text-adisseo-crimson">Hand-off</p>
              <ul className="mt-2 space-y-1.5">
                <li>
                  <Link href="/trust-layer" className="inline-flex items-center gap-1 hover:text-adisseo-crimson">
                    Voice score now folds into the composite trust gate <ArrowRight size={10} />
                  </Link>
                </li>
                <li>
                  <Link href="/research-deep" className="inline-flex items-center gap-1 hover:text-adisseo-crimson">
                    Research-to-anchor agent uses the active manager <ArrowRight size={10} />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function ProfileCard({
  profile,
  title,
  accent = "crimson",
}: {
  profile: VoiceProfile;
  title: string;
  accent?: "crimson" | "cyan";
}) {
  const accentText = accent === "cyan" ? "text-adisseo-cyan" : "text-adisseo-crimson";
  const accentBorder = accent === "cyan" ? "border-adisseo-cyan/30" : "border-adisseo-line";
  return (
    <div className={`rounded-2xl border ${accentBorder} bg-white p-5`}>
      <div className="flex items-baseline justify-between">
        <p className={`text-[10px] font-semibold uppercase tracking-widest ${accentText}`}>
          {title}
        </p>
        <p className="text-[10px] text-adisseo-muted">
          {profile.wordCount}w · {profile.sentenceCount} sents
        </p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] md:grid-cols-4">
        <Axis label="Sent. length" v={profile.avgSentenceLen} />
        <Axis label="Variance" v={profile.lenStdDev} />
        <Axis label="Vocab richness" v={profile.typeTokenRatio} />
        <Axis label="Hedging" v={profile.hedgingRate} unit="/1k" />
        <Axis label="Citations" v={profile.citationDensity} unit="/1k" />
        <Axis label="Em-dashes" v={profile.emDashRate} unit="/1k" />
        <Axis label="First person" v={profile.firstPersonRate} unit="/1k" />
        <Axis label="Rhythm" v={profile.punctuationRhythm} hint="short:long" />
      </div>
      {profile.signaturePhrases.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
            Signature 3-grams
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {profile.signaturePhrases.map((p) => (
              <span
                key={p}
                className="rounded-full bg-adisseo-crimson/5 px-2 py-0.5 text-[10px] font-mono text-adisseo-crimson"
              >
                "{p}"
              </span>
            ))}
          </div>
        </div>
      )}
      {profile.avoidedWords.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
            Words this voice avoids
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {profile.avoidedWords.map((p) => (
              <span
                key={p}
                className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-mono text-stone-600 line-through"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      )}
      <p className="mt-3 line-clamp-3 rounded-md bg-adisseo-bg p-2 text-[11px] italic text-adisseo-ink">
        "{profile.preview}"
      </p>
    </div>
  );
}

function ScoreCard({
  report,
  profile,
}: {
  report: ReturnType<typeof scoreAgainstVoiceProfile>;
  profile: VoiceProfile;
}) {
  void profile;
  const tone =
    report.band === "Clean"
      ? "border-emerald-300 bg-emerald-50"
      : report.band === "Light"
        ? "border-sky-300 bg-sky-50"
        : report.band === "Moderate"
          ? "border-amber-300 bg-amber-50"
          : "border-rose-300 bg-rose-50";
  const numTone =
    report.band === "Clean"
      ? "text-emerald-700"
      : report.band === "Light"
        ? "text-sky-700"
        : report.band === "Moderate"
          ? "text-amber-800"
          : "text-rose-700";
  return (
    <div className={`rounded-2xl border p-5 ${tone}`}>
      <div className="flex items-baseline justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-ink-strong">
          Voice match · {report.band}
        </p>
        <span className={`font-serif text-3xl font-bold ${numTone}`}>{report.score}</span>
      </div>
      <ul className="mt-3 space-y-1.5">
        {report.axes.map((ax) => (
          <li key={ax.label} className="flex items-baseline justify-between text-[11px]">
            <span className="text-adisseo-ink">{ax.label}</span>
            <span className="text-adisseo-muted">
              <span className="font-mono text-adisseo-ink-strong">{ax.actual}</span>{" "}
              vs.{" "}
              <span className="font-mono">{ax.expected}</span>{" "}
              <span
                className={`ml-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                  ax.status === "in-band"
                    ? "bg-emerald-100 text-emerald-700"
                    : ax.status === "drift"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-700"
                }`}
              >
                {ax.status}
              </span>
            </span>
          </li>
        ))}
      </ul>
      {report.notes.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-white/60 pt-3 text-[11px] text-adisseo-ink-strong">
          {report.notes.map((n, i) => (
            <li key={i}>· {n}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Axis({ label, v, unit, hint }: { label: string; v: number; unit?: string; hint?: string }) {
  return (
    <div className="rounded-md border border-adisseo-line bg-adisseo-bg/40 p-2">
      <p className="text-[9px] uppercase tracking-widest text-adisseo-muted">{label}</p>
      <p className="font-mono text-base font-bold text-adisseo-ink-strong">
        {v}
        {unit && <span className="ml-0.5 text-[9px] font-sans text-adisseo-muted">{unit}</span>}
      </p>
      {hint && <p className="text-[9px] text-adisseo-muted">{hint}</p>}
    </div>
  );
}
