"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowLeft, Copy, Image as ImageIcon, Settings2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";

interface CardSpec {
  id: string;
  title: string;
  deck: string;
  species: "aqua" | "poultry" | "ruminants" | "swine" | "cross";
  manager: string;
  trust: number;
  citations: number;
}

const SAMPLE_CARDS: CardSpec[] = [
  {
    id: "poultry-id-q1",
    title: "Indonesia AGP-removal: FCR within 0.05 of pre-AGP baseline across four farms",
    deck: "Q1 2026 trial · trial-anchored deliverable",
    species: "poultry",
    manager: "Vish",
    trust: 87,
    citations: 4,
  },
  {
    id: "aqua-mt-vn",
    title: "Vietnam mycotoxin gate: 38% reduction in DON carry-over after 12 batches",
    deck: "Acceptance-gate Q4 2025 · mill QC desk",
    species: "aqua",
    manager: "Aileen",
    trust: 82,
    citations: 5,
  },
  {
    id: "ruminants-jp-jcred",
    title: "Hokkaido summer-yield drop: 2.4 → 0.9 kg/cow/day under heat-stress nutrition",
    deck: "240 cows · three herds · J-credit threshold within reach",
    species: "ruminants",
    manager: "Antoine",
    trust: 79,
    citations: 3,
  },
  {
    id: "swine-cn-asf",
    title: "ASF nursery recovery: mortality – 0.7pp, FCR 1.62 vs. 1.71 control",
    deck: "Four farms · vet-desk validated · protocol available",
    species: "swine",
    manager: "Claire",
    trust: 81,
    citations: 4,
  },
  {
    id: "apac-engagement",
    title: "Adisseo APAC: 43% qualified-view-to-conversion rate — the bar holds two quarters",
    deck: "Engagement tracker · above benchmark · trust-gated",
    species: "cross",
    manager: "Ricardo",
    trust: 90,
    citations: 6,
  },
];

export default function OgCardsPage() {
  const [variant, setVariant] = useState<"linkedin" | "square">("linkedin");
  const [active, setActive] = useState<CardSpec>(SAMPLE_CARDS[0]);
  const [editing, setEditing] = useState<CardSpec>(SAMPLE_CARDS[0]);

  const url = useMemo(() => buildUrl(editing, variant), [editing, variant]);

  function pick(spec: CardSpec) {
    setActive(spec);
    setEditing(spec);
  }

  function copyUrl() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.origin + url);
      toast.success("OG-card URL copied");
    }
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
            <Link href="/voice-fingerprint" className="text-adisseo-muted hover:text-adisseo-crimson">Voice fingerprint</Link>
            <Link href="/observability" className="text-adisseo-muted hover:text-adisseo-crimson">Observability</Link>
            <Link href="/dashboard" className="text-adisseo-muted hover:text-adisseo-crimson">Dashboard</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex items-baseline gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-adisseo-crimson text-white">
            <ImageIcon size={16} />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
              Phase 3 · OG-card generator (Vercel Satori)
            </p>
            <h1 className="text-2xl font-bold text-adisseo-ink-strong">
              Per-deliverable social cards
            </h1>
            <p className="text-sm text-adisseo-muted">
              Every shipped deliverable produces a 1200x630 LinkedIn card or a
              1200x1200 square — from URL params, no Photoshop. The trust
              score and citation count travel with the card so the
              quality signal is visible to the recipient before they click.
            </p>
          </div>
        </div>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT: cards list */}
          <aside className="lg:col-span-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
              Shipped deliverables ({SAMPLE_CARDS.length})
            </p>
            <ul className="space-y-2">
              {SAMPLE_CARDS.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => pick(c)}
                    className={`w-full rounded-2xl border p-3 text-left transition ${
                      active.id === c.id
                        ? "border-adisseo-crimson bg-white"
                        : "border-adisseo-line bg-white hover:border-adisseo-crimson"
                    }`}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
                      {c.species} · {c.manager}
                    </p>
                    <p className="mt-1 text-xs font-bold text-adisseo-ink-strong">{c.title.slice(0, 80)}…</p>
                    <div className="mt-1.5 flex gap-2 text-[10px] text-adisseo-muted">
                      <span>Trust {c.trust}</span>
                      <span>· {c.citations} cites</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* RIGHT: preview + edit */}
          <section className="space-y-4 lg:col-span-9">
            <div className="flex items-center justify-between rounded-2xl border border-adisseo-line bg-white p-3 text-xs">
              <div className="flex items-center gap-2">
                <Settings2 size={12} className="text-adisseo-muted" />
                <span className="font-semibold uppercase tracking-widest text-adisseo-crimson">Variant</span>
                <button
                  onClick={() => setVariant("linkedin")}
                  className={`rounded-md px-2.5 py-1 text-[11px] ${
                    variant === "linkedin"
                      ? "bg-adisseo-crimson text-white"
                      : "border border-adisseo-line text-adisseo-ink-strong"
                  }`}
                >
                  LinkedIn 1200×630
                </button>
                <button
                  onClick={() => setVariant("square")}
                  className={`rounded-md px-2.5 py-1 text-[11px] ${
                    variant === "square"
                      ? "bg-adisseo-crimson text-white"
                      : "border border-adisseo-line text-adisseo-ink-strong"
                  }`}
                >
                  Square 1200×1200
                </button>
              </div>
              <button
                onClick={copyUrl}
                className="inline-flex items-center gap-1 rounded-md border border-adisseo-line bg-white px-2.5 py-1 text-[11px] font-semibold text-adisseo-ink-strong hover:border-adisseo-crimson"
              >
                <Copy size={11} /> Copy public URL
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-adisseo-line bg-white p-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
                Live preview — rendered server-side
              </p>
              <div
                className="relative w-full overflow-hidden rounded-lg bg-stone-100"
                style={{
                  aspectRatio: variant === "square" ? "1 / 1" : "1200 / 630",
                }}
              >
                <Image
                  src={url}
                  alt="OG card preview"
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
              <p className="mt-2 break-all rounded-md bg-adisseo-bg p-2 font-mono text-[10px] text-adisseo-muted">
                {url}
              </p>
            </div>

            {/* EDITOR */}
            <div className="rounded-2xl border border-adisseo-line bg-white p-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
                Edit card
              </p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label="Title">
                  <input
                    type="text"
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    className="w-full rounded-md border border-adisseo-line bg-adisseo-bg/40 p-2 text-xs"
                  />
                </Field>
                <Field label="Deck / sub-headline">
                  <input
                    type="text"
                    value={editing.deck}
                    onChange={(e) => setEditing({ ...editing, deck: e.target.value })}
                    className="w-full rounded-md border border-adisseo-line bg-adisseo-bg/40 p-2 text-xs"
                  />
                </Field>
                <Field label="Species">
                  <select
                    value={editing.species}
                    onChange={(e) => setEditing({ ...editing, species: e.target.value as CardSpec["species"] })}
                    className="w-full rounded-md border border-adisseo-line bg-adisseo-bg/40 p-2 text-xs"
                  >
                    <option value="poultry">Poultry</option>
                    <option value="aqua">Aqua</option>
                    <option value="ruminants">Ruminants</option>
                    <option value="swine">Swine</option>
                    <option value="cross">Cross</option>
                  </select>
                </Field>
                <Field label="Manager">
                  <input
                    type="text"
                    value={editing.manager}
                    onChange={(e) => setEditing({ ...editing, manager: e.target.value })}
                    className="w-full rounded-md border border-adisseo-line bg-adisseo-bg/40 p-2 text-xs"
                  />
                </Field>
                <Field label={`Trust score: ${editing.trust}`}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={editing.trust}
                    onChange={(e) => setEditing({ ...editing, trust: parseInt(e.target.value, 10) })}
                    className="w-full"
                  />
                </Field>
                <Field label={`Citations: ${editing.citations}`}>
                  <input
                    type="range"
                    min={0}
                    max={12}
                    value={editing.citations}
                    onChange={(e) => setEditing({ ...editing, citations: parseInt(e.target.value, 10) })}
                    className="w-full"
                  />
                </Field>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

function buildUrl(spec: CardSpec, variant: "linkedin" | "square"): string {
  const params = new URLSearchParams({
    title: spec.title,
    deck: spec.deck,
    species: spec.species,
    manager: spec.manager,
    trust: spec.trust.toString(),
    citations: spec.citations.toString(),
    variant,
  });
  return `/api/og-card?${params.toString()}`;
}
