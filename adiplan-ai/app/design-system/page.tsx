"use client";

import Link from "next/link";
import { ArrowLeft, Palette, Type, Grid3x3, Sparkles, Layers } from "lucide-react";
import { Logo } from "@/components/Logo";
import {
  herubel,
  herubelPalette,
  herubelType,
  herubelSlots,
  herubelFrames,
  type HerubelTypeRole,
  type HerubelSlot,
} from "@/lib/design-system-herubel";

/**
 * /design-system — visible Hérubel design system documentation.
 *
 * What lives here:
 *   1. Why Hérubel (the rules)
 *   2. The palette swatches
 *   3. The typographic hierarchy
 *   4. The slot blueprint (per-slot char budget, type role, rationale)
 *   5. The named content frames (Hook→Context→Body, PAS, BAB, 5-step)
 *   6. Before / after — old Adisseo carousel render vs Hérubel-tuned
 */

const PALETTE_ENTRIES: { key: keyof typeof herubelPalette; label: string }[] = [
  { key: "surface", label: "Surface (off-white page)" },
  { key: "ink", label: "Ink (body + 90% color)" },
  { key: "inkSoft", label: "Ink soft (secondary text)" },
  { key: "line", label: "Line (1px hairlines)" },
  { key: "blockTint", label: "Block tint (panels)" },
  { key: "accent", label: "Accent (Adisseo crimson)" },
  { key: "accentInk", label: "Accent ink (text on accent)" },
  { key: "accent2", label: "Accent 2 (compare columns)" },
  { key: "good", label: "Good (do this)" },
  { key: "warn", label: "Warn (stop this)" },
];

const TYPE_ROLES: HerubelTypeRole[] = [
  "display",
  "headline",
  "subhead",
  "body",
  "bodyBold",
  "eyebrow",
  "microCaption",
  "signature",
];

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-adisseo-bg">
      <header className="border-b border-adisseo-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-adisseo-muted transition hover:text-adisseo-crimson"
          >
            <ArrowLeft size={14} /> Home
          </Link>
          <Logo size="sm" />
          <div className="text-[10px] font-bold uppercase tracking-widest text-adisseo-muted">
            Phase 1 · Hérubel design system
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Hero */}
        <section className="rounded-3xl border border-adisseo-line bg-white p-10 shadow-sm">
          <p className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
            <Sparkles size={11} /> Pierre Hérubel · APAC
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black tracking-tight text-adisseo-ink-strong">
            Hérubel grammar. Adisseo accent.
          </h1>
          <p className="mt-4 max-w-3xl text-base text-adisseo-ink">
            The Hérubel design system is the visual language behind the
            best-performing infographic creators on LinkedIn — clear
            hierarchy, one specific problem per asset, signature
            comparison-and-framework formats. We&apos;ve scraped 30+ of his
            published assets, distilled the rules into design tokens, and
            applied them to the carousel, leaflet, and manga renderers
            without losing Adisseo&apos;s crimson + ink brand pairing.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Rule
              n="01"
              title="3-layer carousel"
              body="Hook (curiosity + drives ‘view more’) → Context (problem + named source) → Body (structured list / PAS / BAB)."
            />
            <Rule
              n="02"
              title="One problem per asset"
              body="Single weaponised idea per page. No paragraphs, no hedging, no zigzag. The reader gets the point in 8 seconds or you lose them."
            />
            <Rule
              n="03"
              title="Subtle name + branding"
              body="Bottom-right microcaps signature, never dominant. The asset earns the credit, not the other way around."
            />
          </div>
        </section>

        {/* Palette */}
        <Section
          icon={Palette}
          eyebrow="01 · Tokens"
          title="Palette"
          body="Off-white surface, ink-90% body, crimson accent. Hairline lines and tinted panels do the panel-ing — never gradients, never shadows."
        >
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {PALETTE_ENTRIES.map((p) => (
              <Swatch
                key={p.key}
                label={p.label}
                token={p.key}
                value={herubelPalette[p.key]}
              />
            ))}
          </div>
        </Section>

        {/* Type */}
        <Section
          icon={Type}
          eyebrow="02 · Tokens"
          title="Typography"
          body="Massive display headline, mid subhead, microcaps eyebrow, condensed body. Letter-spacing tightens at display size, opens up at signature size — that contrast is the whole hierarchy."
        >
          <div className="space-y-4">
            {TYPE_ROLES.map((role) => (
              <TypeSample key={role} role={role} />
            ))}
          </div>
        </Section>

        {/* Slots */}
        <Section
          icon={Grid3x3}
          eyebrow="03 · Layout"
          title="Slot blueprint"
          body="Every Hérubel-style asset maps to one of these slots. The slot owns the visual treatment; the renderer just hands content to the right slot. Char budgets prevent layout collapse — paste too much into a hook and we trim it."
        >
          <div className="overflow-hidden rounded-2xl border border-adisseo-line bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-[10px] uppercase tracking-widest text-adisseo-muted">
                <tr>
                  <th className="px-4 py-3">Slot</th>
                  <th className="px-4 py-3">Type role</th>
                  <th className="px-4 py-3">Char budget</th>
                  <th className="px-4 py-3">Why it exists</th>
                </tr>
              </thead>
              <tbody>
                {(Object.keys(herubelSlots) as HerubelSlot[]).map((slot) => {
                  const spec = herubelSlots[slot];
                  return (
                    <tr key={slot} className="border-t border-adisseo-line align-top">
                      <td className="px-4 py-3 font-bold text-adisseo-ink-strong">
                        {slot}
                      </td>
                      <td className="px-4 py-3 text-adisseo-muted">{spec.type}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-adisseo-muted">
                        {spec.charBudget.min}–{spec.charBudget.max}
                      </td>
                      <td className="px-4 py-3 text-adisseo-ink">{spec.rationale}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Frames */}
        <Section
          icon={Layers}
          eyebrow="04 · Composition"
          title="Named content frames"
          body="Every deliverable picks one frame and sticks to it. Hook→Context→Body is the default; PAS for sales-leaning posts; BAB for trial-data; 5-step framework for the DM-save format that dominates Hérubel's archive."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {(Object.keys(herubelFrames) as (keyof typeof herubelFrames)[]).map((k) => (
              <FrameCard
                key={k}
                name={herubelFrames[k].name}
                slots={herubelFrames[k].slots}
                description={herubelFrames[k].description}
              />
            ))}
          </div>
        </Section>

        {/* Before / after */}
        <Section
          icon={Sparkles}
          eyebrow="05 · Result"
          title="Before / After"
          body="Same poultry carousel data, two different design systems. The Hérubel pass collapses the visual noise (stripes, badges, gradients) and gives the headline + body the ~70% of the canvas they should own."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <BeforeCard />
            <AfterCard />
          </div>

          <p className="mt-4 text-xs text-adisseo-muted">
            Live previews: open{" "}
            <a
              className="font-semibold text-adisseo-crimson underline"
              href="/api/render-poultry-carousel"
            >
              the poultry carousel
            </a>{" "}
            or{" "}
            <a
              className="font-semibold text-adisseo-crimson underline"
              href="/api/render-aqua-leaflet"
            >
              the aqua leaflet
            </a>{" "}
            to see the new tokens applied to PDF output. Manga brochure uses
            the hybrid path — manga DNA + Hérubel hierarchy + signature.
          </p>
        </Section>

        {/* Sources */}
        <section className="mt-12 rounded-2xl border border-adisseo-line bg-stone-50 p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-adisseo-muted">
            Sources & scrape
          </p>
          <p className="mt-2 max-w-3xl text-sm text-adisseo-ink">
            Pierre Hérubel — pierreherubel.substack.com (30 most recent posts,
            their full-resolution PNGs, his own published rules on the
            3-layer carousel structure and the 40 / 40 / 20 format mix).
          </p>
          <p className="mt-2 max-w-3xl text-xs text-adisseo-muted">
            Tokens live in{" "}
            <code className="rounded bg-stone-200 px-1.5 py-0.5 text-[11px]">
              lib/design-system-herubel.ts
            </code>
            . Scraper ships at{" "}
            <code className="rounded bg-stone-200 px-1.5 py-0.5 text-[11px]">
              scripts/scrape-herubel.ts
            </code>{" "}
            (Playwright-based, run via <code>pnpm tsx</code>).
          </p>
        </section>
      </div>

      <footer className="border-t border-adisseo-line bg-white py-8 text-center text-xs text-adisseo-muted">
        {herubel.brand.signature}
      </footer>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*  Local components                                                          */
/* -------------------------------------------------------------------------- */

function Rule({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-adisseo-line bg-stone-50 p-5">
      <p className="text-xs font-black tracking-widest text-adisseo-crimson">
        {n}
      </p>
      <p className="mt-2 text-sm font-bold text-adisseo-ink-strong">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-adisseo-muted">{body}</p>
    </div>
  );
}

function Section({
  icon: Icon,
  eyebrow,
  title,
  body,
  children,
}: {
  icon: React.ComponentType<{ size?: number }>;
  eyebrow: string;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <div className="flex items-center gap-2">
        <Icon size={14} />
        <p className="text-[10px] font-bold uppercase tracking-widest text-adisseo-muted">
          {eyebrow}
        </p>
      </div>
      <h2 className="mt-2 text-3xl font-black text-adisseo-ink-strong">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-adisseo-muted">{body}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Swatch({
  label,
  token,
  value,
}: {
  label: string;
  token: string;
  value: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-adisseo-line bg-white">
      <div className="h-16 w-full" style={{ background: value }} />
      <div className="px-3 py-2">
        <p className="text-[10px] font-mono uppercase tracking-widest text-adisseo-muted">
          {token}
        </p>
        <p className="text-[11px] text-adisseo-ink-strong">{label}</p>
        <p className="text-[10px] font-mono text-adisseo-muted">{value}</p>
      </div>
    </div>
  );
}

function TypeSample({ role }: { role: HerubelTypeRole }) {
  const t = herubelType[role];
  const sample =
    role === "display"
      ? "AGP-free poultry"
      : role === "headline"
        ? "How a single methionine swap unlocked 4.3% FCR"
        : role === "subhead"
          ? "What every nutritionist gets wrong about heat-stress"
          : role === "body"
            ? "Field trial · 720,000 broilers · Vietnam · 2025-Q3 · trial #ADS-PA-04"
            : role === "bodyBold"
              ? "Field trial · 720,000 broilers · Vietnam · 2025-Q3"
              : role === "eyebrow"
                ? "POULTRY · APAC TRIAL DATA"
                : role === "microCaption"
                  ? "Source: ADISSEO TRIAL #ADS-PA-04"
                  : "APAC · ADISSEO.COM";
  return (
    <div className="rounded-xl border border-adisseo-line bg-white px-5 py-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-adisseo-muted">
          {role}
        </p>
        <p className="font-mono text-[10px] text-adisseo-muted">
          {t.size}px · {t.weight} · lh {t.lineHeight}
          {t.letterSpacing ? ` · ls ${t.letterSpacing}` : ""}
        </p>
      </div>
      <p
        style={{
          fontSize: Math.min(t.size, 56),
          fontWeight: t.weight,
          lineHeight: t.lineHeight,
          letterSpacing: t.letterSpacing,
          color: herubelPalette.ink,
          textTransform: role === "eyebrow" || role === "signature" || role === "microCaption" ? "uppercase" : "none",
        }}
      >
        {sample}
      </p>
    </div>
  );
}

function FrameCard({
  name,
  slots,
  description,
}: {
  name: string;
  slots: HerubelSlot[];
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-adisseo-line bg-white p-5">
      <p className="text-xs font-black uppercase tracking-widest text-adisseo-ink-strong">
        {name}
      </p>
      <p className="mt-2 text-sm text-adisseo-ink">{description}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {slots.map((s, i) => (
          <span
            key={`${s}-${i}`}
            className="rounded-full bg-stone-900 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Before / after — visual sketch (no PDF render needed)                     */
/* -------------------------------------------------------------------------- */

function BeforeCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-adisseo-line">
      <div className="bg-stone-100 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-adisseo-muted">
        Before · v1 · stripes & badges
      </div>
      <div className="relative aspect-square bg-[#FBF9F9] p-6 text-[11px]">
        <div className="absolute inset-x-0 top-0 h-2 bg-[#A70A2D]" />
        <div className="absolute inset-x-0 bottom-0 h-2 bg-[#A70A2D]" />
        <div className="mt-3 flex items-center justify-between">
          <div className="text-[10px] font-bold tracking-widest text-stone-500">
            ADISSEO
          </div>
          <div className="flex items-center gap-1 rounded-full border border-stone-200 px-2 py-0.5 text-[8px] font-bold tracking-widest text-stone-500">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D97641]" />
            01 / 05
          </div>
        </div>
        <div className="mt-3 text-[8px] font-bold tracking-widest text-[#A70A2D]">
          POULTRY · APAC
        </div>
        <p className="mt-2 text-[15px] font-bold leading-tight text-stone-900">
          The hidden cost of FCR drift in Vietnamese broilers
        </p>
        <div className="mt-3 rounded border-l-4 border-l-[#A70A2D] border border-stone-200 bg-white px-3 py-3">
          <p className="text-[28px] font-bold leading-none text-[#A70A2D]">4.3%</p>
          <p className="mt-1 text-[8px] uppercase tracking-widest text-stone-500">
            FCR improvement vs control
          </p>
        </div>
        <p className="mt-3 text-[10px] leading-snug text-stone-700">
          Field trial across 720,000 broilers in Long An, supplemented diet
          shows lift on day 28.
        </p>
      </div>
    </div>
  );
}

function AfterCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-adisseo-line">
      <div className="bg-stone-900 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white">
        After · v2 · Hérubel hierarchy
      </div>
      <div
        className="relative aspect-square p-6 text-[11px]"
        style={{ background: herubelPalette.surface }}
      >
        <div
          className="absolute inset-y-0 left-0 w-3"
          style={{ background: herubelPalette.accent }}
        />
        <div className="ml-2 flex items-center justify-between">
          <div className="text-[10px] font-bold tracking-widest text-stone-700">
            ADISSEO
          </div>
          <div
            className="flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-extrabold tracking-widest text-stone-900"
            style={{ background: herubelPalette.blockTint }}
          >
            <span
              className="h-1.5 w-1.5"
              style={{ background: herubelPalette.accent }}
            />
            01 / 05
          </div>
        </div>
        <div
          className="ml-2 mt-3 text-[10px] font-extrabold tracking-widest"
          style={{ color: herubelPalette.accent }}
        >
          POULTRY · APAC TRIAL
        </div>
        <p className="ml-2 mt-2 text-[22px] font-black leading-[1.05] tracking-tight text-stone-900">
          The hidden cost of FCR drift in Vietnamese broilers.
        </p>
        <div
          className="ml-2 mt-4 px-4 py-4"
          style={{ background: herubelPalette.ink }}
        >
          <p
            className="text-[40px] font-black leading-none tracking-tight"
            style={{ color: herubelPalette.surface, letterSpacing: -1.4 }}
          >
            4.3%
          </p>
          <p
            className="mt-2 text-[8px] uppercase tracking-widest"
            style={{ color: herubelPalette.surface, opacity: 0.78 }}
          >
            FCR improvement vs control
          </p>
        </div>
        <p className="ml-2 mt-3 text-[10px] leading-snug text-stone-800">
          Field trial · 720,000 broilers · Long An, Vietnam · day-28 lift on
          the supplemented arm.
        </p>
        <p
          className="ml-2 mt-4 text-[8px] font-bold uppercase tracking-[0.2em] text-stone-500"
        >
          {herubel.brand.signature}
        </p>
      </div>
    </div>
  );
}
