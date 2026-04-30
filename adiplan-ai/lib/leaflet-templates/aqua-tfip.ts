/**
 * Tier 2 — HTML template for the Aqua / TFIP-style leaflet.
 *
 * Goal: render a one-page A4 leaflet whose visual language matches the
 * published "Final_Leaflet_poultry_FEED EFFICIENCY.pdf" Adisseo PDF (the
 * version Ricardo's team prints + emails). We're targeting:
 *
 *   • Real Adisseo logo (PNG from /public/brand/adisseo-logo.png)
 *   • White BANDEAU header band (PNG from /public/brand/tfip-bandeau.png)
 *   • Adisseo crimson + ink palette (Hérubel tokens)
 *   • TFIP QR in the footer corner
 *   • Persona-tuned hero claim, evidence stat, body sections, specs panel
 *
 * The function returns a self-contained HTML document (with inlined CSS and
 * file:// URLs for assets), ready to be passed to `htmlToPdf()`.
 *
 * Why a function-string template (not React) for now: zero build deps in the
 * server, instant iteration, no hydration concerns. We can swap to React /
 * Satori if we ever need component-level reuse.
 */

import fs from "node:fs";
import path from "node:path";
import { herubel } from "@/lib/design-system-herubel";
import type { AquaLeafletData } from "@/lib/aqua-leaflet";

const P = herubel.palette;

/**
 * Inline a /public asset as a base64 data URL. We do this rather than letting
 * Chrome fetch over file:// because `page.setContent()` runs from an
 * `about:blank` origin which blocks file:// fetches even with
 * `--allow-file-access-from-files`. Inlining is small (~50 KB per image)
 * and removes a whole class of "missing logo" failures.
 */
function dataUrl(publicRel: string, mime = "image/png"): string {
  try {
    const abs = path.join(process.cwd(), "public", publicRel.replace(/^\//, ""));
    const buf = fs.readFileSync(abs);
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return "";
  }
}

/** When WeTransfer PNGs are not in /public/brand yet — still print a recognisable strip. */
function fallbackLogoDataUrl(accent: string, ink: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="44" viewBox="0 0 220 44"><rect width="220" height="44" rx="4" fill="#fff"/><text x="10" y="30" font-family="Helvetica Neue,Arial,sans-serif" font-weight="800" font-size="18" fill="${accent}">ADISSEO</text><text x="118" y="30" font-family="Helvetica Neue,Arial,sans-serif" font-weight="700" font-size="11" fill="${ink}">APAC</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function fallbackQrDataUrl(accent: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="#fff"/><rect x="12" y="12" width="32" height="32" fill="${accent}"/><rect x="76" y="12" width="32" height="32" fill="${accent}"/><rect x="12" y="76" width="32" height="32" fill="${accent}"/><text x="60" y="68" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" fill="#333">TFIP</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface AquaTfipTemplateOptions {
  data: AquaLeafletData;
  /** Optional persona/role label printed in the eyebrow. */
  personaLabel?: string;
  /** Optional disclaimer line below specs. */
  disclaimer?: string;
}

export function renderAquaTfipHtml(opts: AquaTfipTemplateOptions): string {
  const { data, personaLabel, disclaimer } = opts;

  const logoRaw = dataUrl("/brand/adisseo-logo.png");
  const logoUrl = logoRaw || fallbackLogoDataUrl(P.accent, P.ink);
  const bandeauUrl = dataUrl("/brand/tfip-bandeau.png");
  const qrRaw = dataUrl("/brand/tfip-qr.png");
  const qrUrl = qrRaw || fallbackQrDataUrl(P.accent);

  const headerBgCss = bandeauUrl
    ? `background-image: url('${bandeauUrl}'); background-size: cover; background-position: center;`
    : `background: linear-gradient(105deg, #f8f8f8 0%, #ffffff 42%, #efefef 100%);`;

  const sections = data.sections
    .map(
      (s) => `
      <section class="block">
        <div class="block-eyebrow">${escapeHtml(s.label)}</div>
        <h3 class="block-heading">${escapeHtml(s.heading)}</h3>
        <p class="block-body">${escapeHtml(s.body)}</p>
      </section>`
    )
    .join("\n");

  const specs = data.specs
    .map(
      (sp) => `
      <li class="spec-row">
        <span class="spec-label">${escapeHtml(sp.label)}</span>
        <span class="spec-value">${escapeHtml(sp.value)}</span>
      </li>`
    )
    .join("\n");

  return `<!doctype html>
<html lang="${data.language}">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(data.title)}</title>
<style>
@page { size: A4 portrait; margin: 0; }
* { box-sizing: border-box; }
html, body {
  margin: 0; padding: 0;
  background: ${P.surface};
  color: ${P.ink};
  font-family: -apple-system, "Inter", "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
  -webkit-font-smoothing: antialiased;
}
body {
  width: 210mm; min-height: 297mm;
  display: flex; flex-direction: column;
}

/* Header band — mirrors the published BANDEAU shape. */
.header {
  position: relative;
  height: 22mm;
  ${headerBgCss}
  border-bottom: 5px solid ${P.accent};
}
.header-inner {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 16mm;
}
.header-logo { height: 12mm; width: auto; }
.header-meta {
  text-align: right;
  font-size: 9pt;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  font-weight: 700;
  color: ${P.ink};
  line-height: 1.3;
}
.header-meta .campaign {
  color: ${P.accent};
  letter-spacing: 2px;
}

/* Hero block. */
.hero {
  padding: 9mm 16mm 5mm 16mm;
  display: grid;
  grid-template-columns: 1fr;
  gap: 5mm;
}
.eyebrow {
  font-size: 9pt;
  letter-spacing: 2px;
  font-weight: 800;
  color: ${P.accent};
  text-transform: uppercase;
}
.title {
  font-size: 26pt;
  line-height: 1.05;
  letter-spacing: -0.6px;
  font-weight: 800;
  margin: 1mm 0 2mm 0;
  color: ${P.ink};
}
.subtitle {
  font-size: 11.5pt;
  line-height: 1.4;
  font-weight: 500;
  color: ${P.inkSoft};
  margin: 0;
  max-width: 160mm;
}

.hero-claim {
  display: flex;
  flex-direction: column;
  gap: 3mm;
  border-top: 1px solid ${P.line};
  border-bottom: 1px solid ${P.line};
  padding: 4mm 0;
}
.claim-text {
  font-size: 17pt;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.2px;
  color: ${P.ink};
}
.evidence {
  font-size: 8.5pt;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: ${P.accent2};
  line-height: 1.5;
}

/* Body grid. */
.body-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 8mm;
  padding: 0 16mm;
  flex: 1;
}
.blocks {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4mm;
}
.block {
  border-left: 3px solid ${P.accent};
  padding: 1mm 0 1mm 5mm;
}
.block-eyebrow {
  font-size: 8.5pt;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: ${P.inkSoft};
  margin-bottom: 1mm;
}
.block-heading {
  font-size: 12.5pt;
  font-weight: 800;
  line-height: 1.18;
  margin: 0 0 1mm 0;
  letter-spacing: -0.2px;
  color: ${P.ink};
}
.block-body {
  font-size: 9.5pt;
  line-height: 1.42;
  margin: 0;
  color: ${P.ink};
}

/* Specs panel — right column. */
.specs {
  background: ${P.blockTint};
  border: 1px solid ${P.line};
  border-radius: 4mm;
  padding: 6mm;
  align-self: start;
  position: sticky; top: 0;
}
.specs-title {
  font-size: 9pt;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  font-weight: 800;
  color: ${P.accent};
  margin-bottom: 3mm;
}
.specs-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex; flex-direction: column;
  gap: 3mm;
}
.spec-row {
  display: flex; justify-content: space-between; gap: 4mm;
  padding: 0 0 2mm 0;
  border-bottom: 1px dotted ${P.line};
  font-size: 10pt;
}
.spec-row:last-child { border-bottom: none; padding-bottom: 0; }
.spec-label { color: ${P.inkSoft}; font-weight: 600; }
.spec-value { color: ${P.ink}; font-weight: 800; text-align: right; }

.disclaimer {
  margin-top: 4mm;
  font-size: 8pt;
  line-height: 1.4;
  color: ${P.inkSoft};
}

/* CTA + footer band — one cohesive black strip at the bottom of page 1. */
.cta-strip {
  margin: 4mm 16mm 8mm 16mm;
  background: ${P.ink};
  color: ${P.accentInk};
  border-radius: 4mm;
  padding: 5mm 6mm;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 5mm;
  align-items: center;
}
.cta-qr {
  width: 18mm; height: 18mm;
  background: white; padding: 1mm; border-radius: 2mm;
  display: block;
}
.cta-stack { display: flex; flex-direction: column; gap: 1.5mm; min-width: 0; }
.cta-text {
  font-size: 11pt;
  line-height: 1.3;
  font-weight: 700;
}
.cta-contact {
  font-size: 8pt;
  letter-spacing: 1.1px;
  text-transform: uppercase;
  color: ${P.accent};
  font-weight: 800;
}
.cta-citation {
  font-size: 7.5pt;
  font-style: italic;
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.35;
}

/* (Footer was merged into .cta-strip — bottom band keeps QR + citation
    + CTA + contact line in one Adisseo-black panel.) */
</style>
</head>
<body>
  <header class="header">
    <div class="header-inner">
      <img class="header-logo" src="${logoUrl}" alt="Adisseo" />
      <div class="header-meta">
        <div class="campaign">Turning feed into profit</div>
        <div>APAC poultry · ${escapeHtml(data.language.toUpperCase())}${
          personaLabel ? ` · ${escapeHtml(personaLabel)}` : ""
        }</div>
      </div>
    </div>
  </header>

  <section class="hero">
    <div>
      <div class="eyebrow">${escapeHtml(data.eyebrow)}</div>
      <h1 class="title">${escapeHtml(data.title)}</h1>
      <p class="subtitle">${escapeHtml(data.subtitle)}</p>
    </div>
    <div class="hero-claim">
      <div class="claim-text">${escapeHtml(data.heroClaim)}</div>
      <div class="evidence">${escapeHtml(data.heroEvidence)}</div>
    </div>
  </section>

  <section class="body-grid">
    <div class="blocks">
      ${sections}
    </div>
    <aside class="specs">
      <div class="specs-title">At a glance</div>
      <ul class="specs-list">
        ${specs}
      </ul>
      ${
        disclaimer
          ? `<div class="disclaimer">${escapeHtml(disclaimer)}</div>`
          : ""
      }
    </aside>
  </section>

  <div class="cta-strip">
    <img class="cta-qr" src="${qrUrl}" alt="Scan for the campaign" />
    <div class="cta-stack">
      <div class="cta-text">${escapeHtml(data.cta)}</div>
      <div class="cta-contact">${escapeHtml(data.contactLine)}</div>
      <div class="cta-citation">${escapeHtml(data.citationLine)} · Adisseo APAC ${new Date().getFullYear()}</div>
    </div>
  </div>
</body>
</html>`;
}
