"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Loader2,
  Play,
  Pause,
  Wand2,
  Hash,
  ShieldCheck,
  Globe,
  Building2,
  Clapperboard,
  Volume2,
} from "lucide-react";
import { useAdiPlanStore } from "@/lib/store";
import { swineAccounts } from "@/lib/swine-accounts";
import { Logo, SpeciesIcon } from "@/components/Logo";
import { SendToHQButton } from "@/components/SendToHQButton";
import { ProseQualityCard } from "@/components/ProseQualityCard";
import { AnchorInVault } from "@/components/AnchorInVault";
import { collectSwineProse } from "@/lib/studio-prose";

type Scene = {
  index: number;
  durationSec: number;
  shot: string;
  onScreenText: string;
  voiceover: string;
};

type ShortResponse = {
  short: {
    hook: string;
    scenes: Scene[];
    cta: string;
    hashtags: string[];
    guardrailNotes: string[];
    totalDurationSec: number;
  };
  meta: {
    usedModel: string;
    topic: string;
    language: string;
    account: { id: string; name: string; country: string } | null;
  };
};

const LANGUAGES: { id: "en" | "zh" | "vi" | "th" | "id"; label: string; flag: string }[] = [
  { id: "en", label: "English", flag: "EN" },
  { id: "zh", label: "Mandarin", flag: "ZH" },
  { id: "vi", label: "Vietnamese", flag: "VI" },
  { id: "th", label: "Thai (koon)", flag: "TH" },
  { id: "id", label: "Bahasa (park)", flag: "ID" },
];

export default function SwineStudioPage() {
  const studioTopic = useAdiPlanStore((s) => s.studioTopic);
  const setStudioTopic = useAdiPlanStore((s) => s.setStudioTopic);
  const studioLanguage = useAdiPlanStore((s) => s.studioLanguage);
  const setStudioLanguage = useAdiPlanStore((s) => s.setStudioLanguage);
  const studioAccount = useAdiPlanStore((s) => s.studioAccount);
  const setStudioAccount = useAdiPlanStore((s) => s.setStudioAccount);
  const match = useAdiPlanStore((s) => s.match);
  const consumeStudioPrefill = useAdiPlanStore((s) => s.consumeStudioPrefill);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ShortResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gatePasses, setGatePasses] = useState(true);
  const [gateScore, setGateScore] = useState(100);
  const [bridgeContext, setBridgeContext] = useState<{
    articleTitle: string;
    competitor: string;
    publishedAt: string;
  } | null>(null);

  useEffect(() => {
    const p = consumeStudioPrefill();
    if (!p) return;
    setBridgeContext({
      articleTitle: p.articleTitle,
      competitor: p.competitor,
      publishedAt: p.publishedAt,
    });
    if (p.swineLanguage) setStudioLanguage(p.swineLanguage);
    if (p.swineAccountId) setStudioAccount(p.swineAccountId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCache = useRef<Map<string, string>>(new Map());
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [audioLoadingIdx, setAudioLoadingIdx] = useState<number | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [playingAll, setPlayingAll] = useState(false);
  const playAllAbortRef = useRef<{ aborted: boolean }>({ aborted: false });

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioCache.current.forEach((url) => URL.revokeObjectURL(url));
      audioCache.current.clear();
    };
  }, []);

  const synthesize = useCallback(
    async (text: string, language: string): Promise<string> => {
      const key = `${language}::${text}`;
      const cached = audioCache.current.get(key);
      if (cached) return cached;
      const res = await fetch("/api/synthesize-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Synthesis failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioCache.current.set(key, url);
      return url;
    },
    []
  );

  const playScene = useCallback(
    async (scene: Scene) => {
      setAudioError(null);
      if (playingIdx === scene.index) {
        audioRef.current?.pause();
        setPlayingIdx(null);
        return;
      }
      audioRef.current?.pause();
      if (!scene.voiceover.trim()) return;
      setAudioLoadingIdx(scene.index);
      try {
        const url = await synthesize(scene.voiceover, studioLanguage);
        const audio = new Audio(url);
        audioRef.current = audio;
        setPlayingIdx(scene.index);
        audio.onended = () => setPlayingIdx(null);
        audio.onerror = () => {
          setPlayingIdx(null);
          setAudioError("Playback failed");
        };
        await audio.play();
      } catch (e) {
        setAudioError(e instanceof Error ? e.message : "Synthesis failed");
        setPlayingIdx(null);
      } finally {
        setAudioLoadingIdx(null);
      }
    },
    [playingIdx, studioLanguage, synthesize]
  );

  const playAll = useCallback(async () => {
    if (!response) return;
    if (playingAll) {
      playAllAbortRef.current.aborted = true;
      audioRef.current?.pause();
      setPlayingAll(false);
      setPlayingIdx(null);
      return;
    }
    playAllAbortRef.current = { aborted: false };
    setPlayingAll(true);
    setAudioError(null);
    try {
      for (const scene of response.short.scenes) {
        if (playAllAbortRef.current.aborted) break;
        if (!scene.voiceover.trim()) continue;
        setAudioLoadingIdx(scene.index);
        const url = await synthesize(scene.voiceover, studioLanguage);
        if (playAllAbortRef.current.aborted) break;
        setAudioLoadingIdx(null);
        const audio = new Audio(url);
        audioRef.current = audio;
        setPlayingIdx(scene.index);
        await new Promise<void>((resolve) => {
          audio.onended = () => resolve();
          audio.onerror = () => resolve();
          audio.play().catch(() => resolve());
        });
        setPlayingIdx(null);
      }
    } catch (e) {
      setAudioError(e instanceof Error ? e.message : "Synthesis failed");
    } finally {
      setPlayingAll(false);
      setPlayingIdx(null);
      setAudioLoadingIdx(null);
    }
  }, [response, playingAll, studioLanguage, synthesize]);

  const generate = async () => {
    if (!studioTopic.trim()) {
      setError("Topic required");
      return;
    }
    audioRef.current?.pause();
    audioCache.current.forEach((url) => URL.revokeObjectURL(url));
    audioCache.current.clear();
    setPlayingIdx(null);
    setAudioError(null);
    setLoading(true);
    setResponse(null);
    setError(null);
    try {
      const res = await fetch("/api/generate-swine-short", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: studioTopic,
          language: studioLanguage,
          accountId: studioAccount || undefined,
          articleSummary: match?.cbiRationale ?? undefined,
        }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data: ShortResponse = await res.json();
      setResponse(data);
      useAdiPlanStore.getState().pushActivity({
        kind: "swine",
        title: `Swine short: ${studioTopic.slice(0, 64) || "untitled"}`,
        detail: `${studioLanguage.toUpperCase()}${studioAccount ? ` · ${studioAccount}` : ""}`,
        href: "/studio/swine",
        tone: "crimson",
      });
    } catch {
      setError("Generation failed. Check API keys or try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-adisseo-line bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Logo size="md" />
          <div className="h-6 w-px bg-adisseo-line" />
          <SpeciesIcon species="swine" size={32} className="opacity-80" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-adisseo-crimson">
              Content Studio &middot; Swine (Claire)
            </p>
            <h1 className="text-lg font-semibold text-adisseo-ink-strong">
              &lt;60s vertical short &mdash; TikTok / WeChat / Instagram
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-adisseo-muted">
          <Link href="/studio/aqua" className="hover:text-adisseo-ink">
            Aqua Studio
          </Link>
          <span className="text-adisseo-muted-soft">·</span>
          <Link href="/studio/poultry" className="hover:text-adisseo-ink">
            Poultry Studio
          </Link>
          <span className="text-adisseo-muted-soft">·</span>
          <Link href="/studio/ruminants" className="hover:text-adisseo-ink">
            Ruminants Studio
          </Link>
          <span className="text-adisseo-muted-soft">·</span>
          <Link
            href="/news-bridge"
            className="hover:text-adisseo-ink"
          >
            &larr; News bridge
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[380px,1fr]">
        <aside className="space-y-5 rounded-2xl border border-adisseo-line bg-white p-5 shadow-sm">
          {(bridgeContext || match) && (
            <div className="rounded-xl border border-adisseo-crimson/30 bg-adisseo-crimson/5 p-3 text-xs">
              <p className="font-semibold uppercase tracking-widest text-adisseo-crimson">
                From News Bridge
              </p>
              {bridgeContext && (
                <p className="mt-1 line-clamp-2 text-adisseo-ink">
                  <span className="font-medium">{bridgeContext.competitor}</span> ·{" "}
                  {bridgeContext.publishedAt} · {bridgeContext.articleTitle}
                </p>
              )}
              {match && (
                <>
                  <p className="mt-1 text-adisseo-ink">
                    CBI: <span className="font-medium">{match.cbi}</span>
                  </p>
                  <p className="text-adisseo-ink">
                    Persona: <span className="font-medium">{match.persona}</span>
                  </p>
                </>
              )}
            </div>
          )}

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
              Topic
            </label>
            <textarea
              value={studioTopic}
              onChange={(e) => setStudioTopic(e.target.value)}
              placeholder="e.g. Pre-loaded gut resilience for ASF-prone nurseries"
              rows={3}
              className="mt-1 w-full rounded-lg border border-adisseo-line p-3 text-sm focus:border-adisseo-crimson focus:outline-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
              <Globe size={11} /> Output Language
            </label>
            <div className="mt-2 grid grid-cols-5 gap-1.5">
              {LANGUAGES.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setStudioLanguage(l.id)}
                  className={`rounded-md border px-2 py-2 text-[10px] font-semibold transition ${
                    studioLanguage === l.id
                      ? "border-adisseo-crimson bg-adisseo-crimson text-white"
                      : "border-adisseo-line text-adisseo-muted hover:text-adisseo-ink"
                  }`}
                  title={l.label}
                >
                  {l.flag}
                </button>
              ))}
            </div>
            <p className="mt-1 text-[10px] text-adisseo-muted">
              {LANGUAGES.find((l) => l.id === studioLanguage)?.label}
            </p>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
              <Building2 size={11} /> Account adaptation (optional)
            </label>
            <select
              value={studioAccount}
              onChange={(e) => setStudioAccount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-adisseo-line p-2.5 text-sm focus:border-adisseo-crimson focus:outline-none"
            >
              <option value="">No account &mdash; generic regional</option>
              {(["CN", "VN", "TH", "PH"] as const).map((country) => (
                <optgroup key={country} label={country}>
                  {swineAccounts
                    .filter((a) => a.country === country)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
            {studioAccount && (
              <p className="mt-1 text-[10px] text-adisseo-muted">
                {swineAccounts.find((a) => a.id === studioAccount)?.notes}
              </p>
            )}
          </div>

          <button
            onClick={generate}
            disabled={loading || !studioTopic.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-adisseo-crimson px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Wand2 size={16} />
            )}
            Generate &lt;60s short
          </button>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              {error}
            </p>
          )}

          <AnchorInVault
            species="swine"
            defaultQuery={studioTopic || "ASF nursery recovery"}
            compact
          />

          {response && (
            <>
              <ProseQualityCard
                text={collectSwineProse(response.short)}
                language={(["en", "zh", "vi", "th", "id"].includes(studioLanguage)
                  ? studioLanguage
                  : "en") as "en" | "zh" | "vi" | "th" | "id"}
                onGateChange={(passes, score) => {
                  setGatePasses(passes);
                  setGateScore(score);
                }}
                compact
              />

              <SendToHQButton
                kind="swine-short"
                title={`Swine short · ${response.short.hook ?? studioTopic}`}
                summary={`${studioLanguage.toUpperCase()} · ${studioAccount || "no account"} · trust ${gateScore}/100`}
                href="/studio/swine"
                payload={{
                  language: studioLanguage,
                  account: studioAccount,
                  topic: studioTopic,
                  trustScore: gateScore,
                }}
                gateBlocked={!gatePasses}
                gateReason={gateScore < 60 ? `Trust score ${gateScore}/100 below 60.` : undefined}
              />
            </>
          )}
        </aside>

        <section className="min-h-[400px] rounded-2xl border border-adisseo-line bg-white p-6 shadow-sm">
          {!response && !loading && (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-20 text-adisseo-muted">
              <Clapperboard size={36} />
              <p className="text-sm">Pick a topic + language &rarr; generate.</p>
              <p className="text-xs">
                Output: hook, 4-7 scenes with shot/text/voiceover, CTA, brand-guardrail audit.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-20 text-adisseo-muted">
              <Loader2 size={28} className="animate-spin" />
              <p className="text-sm">Drafting storyboard&hellip;</p>
            </div>
          )}

          {response && (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
                    Hook (first 3 seconds)
                  </p>
                  <h2 className="mt-1 text-xl font-semibold leading-snug text-adisseo-ink">
                    &ldquo;{response.short.hook}&rdquo;
                  </h2>
                </div>
                <div className="flex flex-none items-center gap-2">
                  <button
                    onClick={playAll}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition ${
                      playingAll
                        ? "bg-red-500 text-white hover:opacity-90"
                        : "bg-adisseo-crimson text-white hover:opacity-90"
                    }`}
                    title="Play all scenes with voiceover"
                  >
                    {playingAll ? (
                      <>
                        <Pause size={12} fill="currentColor" /> Stop
                      </>
                    ) : (
                      <>
                        <Volume2 size={12} /> Play all
                      </>
                    )}
                  </button>
                  <div className="flex items-center gap-1.5 rounded-full bg-adisseo-crimson/10 px-3 py-1.5 text-xs font-semibold text-adisseo-crimson">
                    <Play size={12} fill="currentColor" />
                    {response.short.totalDurationSec}s
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-adisseo-line">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-[10px] uppercase tracking-widest text-adisseo-muted">
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Sec</th>
                      <th className="px-3 py-2">Shot</th>
                      <th className="px-3 py-2">On-screen</th>
                      <th className="px-3 py-2">Voiceover</th>
                      <th className="px-3 py-2 text-center">Audio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {response.short.scenes.map((sc) => (
                      <tr key={sc.index} className="border-t border-adisseo-line align-top">
                        <td className="px-3 py-3 font-bold text-adisseo-crimson">
                          {sc.index}
                        </td>
                        <td className="px-3 py-3 text-adisseo-muted">{sc.durationSec}s</td>
                        <td className="px-3 py-3 text-xs text-adisseo-ink">
                          {sc.shot}
                        </td>
                        <td className="px-3 py-3 text-xs font-semibold text-adisseo-ink">
                          {sc.onScreenText}
                        </td>
                        <td className="px-3 py-3 text-xs italic text-adisseo-muted">
                          {sc.voiceover || "—"}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => playScene(sc)}
                            disabled={!sc.voiceover.trim() || playingAll}
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition ${
                              playingIdx === sc.index
                                ? "bg-red-500 text-white"
                                : "bg-adisseo-crimson/10 text-adisseo-crimson hover:bg-adisseo-crimson hover:text-white"
                            } disabled:opacity-30`}
                            title={
                              !sc.voiceover.trim()
                                ? "No voiceover"
                                : playingIdx === sc.index
                                ? "Stop"
                                : "Play voiceover"
                            }
                          >
                            {audioLoadingIdx === sc.index ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : playingIdx === sc.index ? (
                              <Pause size={12} fill="currentColor" />
                            ) : (
                              <Play size={12} fill="currentColor" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-adisseo-line p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
                    Call to Action
                  </p>
                  <p className="mt-1 text-sm text-adisseo-ink">{response.short.cta}</p>
                </div>
                <div className="rounded-xl border border-adisseo-line p-4">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
                    <Hash size={11} /> Hashtags
                  </p>
                  <p className="mt-1 text-sm text-adisseo-ink">
                    {response.short.hashtags.join(" ")}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-amber-800">
                  <ShieldCheck size={11} /> Brand-guardrail audit (Langfuse-logged)
                </p>
                <ul className="mt-2 space-y-1 text-xs text-amber-900">
                  {response.short.guardrailNotes.map((n, i) => (
                    <li key={i}>&middot; {n}</li>
                  ))}
                </ul>
              </div>

              {audioError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                  {audioError}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-adisseo-line pt-4 text-xs text-adisseo-muted">
                <span>
                  Model: <span className="font-mono">{response.meta.usedModel}</span>
                  {response.meta.account &&
                    ` · Adapted for ${response.meta.account.name}`}
                </span>
                <button
                  onClick={generate}
                  className="flex items-center gap-1.5 rounded-md border border-adisseo-line px-3 py-1.5 hover:bg-slate-50"
                >
                  <Wand2 size={12} /> Re-generate
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
