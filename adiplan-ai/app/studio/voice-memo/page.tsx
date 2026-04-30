"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Mic,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  FileText,
  Mail,
  BookOpen,
  Clapperboard,
} from "lucide-react";
import { useAdiPlanStore } from "@/lib/store";
import { Logo } from "@/components/Logo";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { toast } from "sonner";

type SpeciesTarget = "ruminants" | "aqua" | "poultry" | "swine";

interface TranscribeResp {
  transcript: string;
  source: "whisper" | "stub";
  bytes?: number;
  error?: string;
  detail?: string;
}

const SPECIES: {
  id: SpeciesTarget;
  label: string;
  desc: string;
  icon: React.ComponentType<{ size?: number }>;
  href: string;
}[] = [
  {
    id: "ruminants",
    label: "Ruminants · manga brochure",
    desc: "Antoine’s manga 2-page brochure (JP). Antoine records on his phone, the brochure is on his laptop in a minute.",
    icon: BookOpen,
    href: "/studio/ruminants",
  },
  {
    id: "aqua",
    label: "Aqua · 1-page leaflet",
    desc: "Aileen’s 1-page technical leaflet, language picked from the topic (TH / ID / VI / EN).",
    icon: FileText,
    href: "/studio/aqua",
  },
  {
    id: "poultry",
    label: "Poultry · email + carousel",
    desc: "Vish’s coordinated email + LinkedIn carousel pack — the topic seeds the campaign.",
    icon: Mail,
    href: "/studio/poultry",
  },
  {
    id: "swine",
    label: "Swine · <60s short",
    desc: "Claire’s vertical short with cultural register — record the brief, ship the video script.",
    icon: Clapperboard,
    href: "/studio/swine",
  },
];

const LANG_OPTIONS = [
  { id: "en", label: "EN" },
  { id: "ja", label: "JA" },
  { id: "th", label: "TH" },
  { id: "vi", label: "VI" },
  { id: "id", label: "ID" },
  { id: "zh", label: "ZH" },
];

export default function VoiceMemoStudioPage() {
  const setStudioTopic = useAdiPlanStore((s) => s.setStudioTopic);
  const setStudioLanguage = useAdiPlanStore((s) => s.setStudioLanguage);
  const setStudioPrefill = useAdiPlanStore((s) => s.setStudioPrefill);

  const [transcribing, setTranscribing] = useState(false);
  const [resp, setResp] = useState<TranscribeResp | null>(null);
  const [transcript, setTranscript] = useState("");
  const [target, setTarget] = useState<SpeciesTarget>("ruminants");
  const [language, setLanguage] = useState<string>("en");
  const [error, setError] = useState<string | null>(null);

  const onRecorded = async (blob: Blob, mimeType: string) => {
    setTranscribing(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("audio", blob, mimeType.includes("webm") ? "memo.webm" : "memo.mp4");
      if (language && language !== "en") fd.append("language", language);
      const res = await fetch("/api/transcribe-voice", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as TranscribeResp;
      if (!res.ok) {
        setError(data.error ?? "Transcription failed");
        return;
      }
      setResp(data);
      setTranscript(data.transcript);
      toast.success(
        data.source === "whisper"
          ? "Transcribed via Whisper"
          : "Transcribed (demo stub)",
        {
          description: `${data.transcript.length} chars \u00b7 ${data.bytes ?? "?"} bytes`,
        }
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Transcription failed";
      setError(msg);
      toast.error("Transcription failed", { description: msg });
    } finally {
      setTranscribing(false);
    }
  };

  const sendToStudio = () => {
    const topic = transcript.trim();
    if (!topic) return;

    setStudioTopic(topic);
    if (target === "swine") {
      // align global language for Swine
      const swineLang = (
        ["en", "zh", "vi", "th", "id"].includes(language) ? language : "en"
      ) as "en" | "zh" | "vi" | "th" | "id";
      setStudioLanguage(swineLang);
    }

    setStudioPrefill({
      articleTitle: topic.slice(0, 120),
      competitor: "Voice memo",
      publishedAt: new Date().toISOString().slice(0, 10),
      ruminantsLanguage:
        target === "ruminants"
          ? language === "ja"
            ? "ja"
            : "en"
          : undefined,
      aquaLanguage:
        target === "aqua"
          ? (["en", "id", "vi", "th"].includes(language)
              ? (language as "en" | "id" | "vi" | "th")
              : undefined)
          : undefined,
      swineLanguage:
        target === "swine"
          ? (["en", "zh", "vi", "th", "id"].includes(language)
              ? (language as "en" | "zh" | "vi" | "th" | "id")
              : undefined)
          : undefined,
    });

    useAdiPlanStore.getState().pushActivity({
      kind: "voice-memo",
      title: `Voice memo → ${target}`,
      detail: topic.slice(0, 80),
      href: SPECIES.find((s) => s.id === target)?.href,
      tone: "orange",
    });

    const href = SPECIES.find((s) => s.id === target)?.href ?? "/studio/ruminants";
    window.location.href = href;
  };

  return (
    <main className="min-h-screen bg-adisseo-bg">
      <header className="border-b border-adisseo-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo size="sm" />
          <nav className="flex items-center gap-4 text-xs">
            <Link href="/" className="text-adisseo-muted hover:text-adisseo-crimson">
              Home
            </Link>
            <Link
              href="/dashboard"
              className="text-adisseo-muted hover:text-adisseo-crimson"
            >
              War Room
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-baseline gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-adisseo-crimson text-white">
            <Mic size={16} />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
              Studio · Voice Memo
            </p>
            <h1 className="text-2xl font-bold text-adisseo-ink-strong">
              From a 30-second voice memo to a finished deliverable
            </h1>
            <p className="text-sm text-adisseo-muted">
              Record on the road. Whisper transcribes. The transcript seeds
              whichever species studio you point it at — leaflet, manga
              brochure, vertical short.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* LEFT: record + transcript */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-adisseo-line bg-white p-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
                Step 1 · Spoken language hint
              </p>
              <div className="flex flex-wrap gap-2">
                {LANG_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setLanguage(opt.id)}
                    className={`rounded-md border px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-widest transition ${
                      language === opt.id
                        ? "border-adisseo-crimson bg-adisseo-crimson text-white"
                        : "border-adisseo-line bg-white text-adisseo-ink-strong hover:border-adisseo-crimson/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-adisseo-muted">
                Helps Whisper. Skip / leave on EN if unsure.
              </p>
            </div>

            <VoiceRecorder onRecorded={onRecorded} disabled={transcribing} />

            {transcribing && (
              <div className="flex items-center gap-2 rounded-xl border border-adisseo-line bg-white p-3 text-xs text-adisseo-muted">
                <Loader2 size={14} className="animate-spin" />
                Transcribing\u2026
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            {transcript && (
              <div className="rounded-2xl border border-adisseo-line bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
                    Step 2 · Transcript (editable)
                  </p>
                  {resp && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${
                        resp.source === "whisper"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-orange-50 text-adisseo-orange"
                      }`}
                    >
                      {resp.source === "whisper" ? "Whisper" : "Demo stub"}
                    </span>
                  )}
                </div>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  rows={6}
                  className="w-full rounded-lg border border-adisseo-line bg-adisseo-bg p-3 text-sm text-adisseo-ink-strong focus:border-adisseo-crimson focus:outline-none"
                  placeholder="Spoken brief\u2026"
                />
                <p className="mt-2 text-[10px] text-adisseo-muted">
                  {transcript.length} characters. Trim to the deliverable’s
                  topic line.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: pick destination */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-adisseo-line bg-white p-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
                Step 3 · Send to a studio
              </p>
              <div className="space-y-2">
                {SPECIES.map((sp) => {
                  const Icon = sp.icon;
                  const active = target === sp.id;
                  return (
                    <button
                      key={sp.id}
                      onClick={() => setTarget(sp.id)}
                      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                        active
                          ? "border-adisseo-crimson bg-adisseo-crimson/5"
                          : "border-adisseo-line bg-white hover:border-adisseo-crimson/40"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          active
                            ? "bg-adisseo-crimson text-white"
                            : "bg-adisseo-crimson/10 text-adisseo-crimson"
                        }`}
                      >
                        <Icon size={16} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-adisseo-ink-strong">
                          {sp.label}
                        </p>
                        <p className="mt-1 text-xs text-adisseo-muted">
                          {sp.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={sendToStudio}
                disabled={!transcript.trim()}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-adisseo-crimson px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
              >
                <Sparkles size={14} />
                Send to {SPECIES.find((s) => s.id === target)?.label} <ArrowRight size={14} />
              </button>
              {!transcript.trim() && (
                <p className="mt-2 text-center text-[10px] text-adisseo-muted">
                  Record a memo or paste a transcript first
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-dashed border-adisseo-line bg-white/60 p-4 text-xs text-adisseo-muted">
              <p className="mb-1 font-bold text-adisseo-ink-strong">
                Why this exists
              </p>
              Antoine refuses to lose authorship — his voice is the brief.
              The voice memo flow is the cheapest possible way to keep authorship
              with the species manager while APAC AI handles the production
              cycle. 30s in. A complete deliverable out.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
