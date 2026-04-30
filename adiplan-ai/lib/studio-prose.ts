/**
 * Studio-prose collectors.
 *
 * Each studio's response is a different shape. The trust-layer scorer needs
 * a single string of all the human-readable prose to grade. These helpers
 * extract that prose.
 */

import type { RuminantsBrochureData } from "@/lib/ruminants-brochure";
import type { PoultryDeliverablePack, PoultryEmailBlock } from "@/lib/poultry-pack";
import type { AquaLeafletData } from "@/lib/aqua-leaflet";

/** Aqua leaflet — headline, deck, body sections, CTA. */
export function collectAquaProse(d: AquaLeafletData | null | undefined): string {
  if (!d) return "";
  const parts: string[] = [
    d.eyebrow ?? "",
    d.title ?? "",
    d.subtitle ?? "",
    d.heroClaim ?? "",
    d.heroEvidence ?? "",
    ...(d.sections ?? []).flatMap((s) => [s.label ?? "", s.heading ?? "", s.body ?? ""]),
    ...(d.specs ?? []).map((p) => `${p.label}: ${p.value}`),
    d.cta ?? "",
    d.contactLine ?? "",
    d.citationLine ?? "",
  ];
  return parts.filter(Boolean).join("\n\n");
}

/** Poultry pack — email subject + preheader + greeting + body + carousel slides. */
export function collectPoultryProse(p: PoultryDeliverablePack | null | undefined): string {
  if (!p) return "";
  const parts: string[] = [
    p.email.subject,
    p.email.preheader,
    p.email.greeting,
    ...(p.email.body ?? []).map((b) => emailBlockToText(b)),
    p.email.signOff ?? "",
    ...(p.carousel ?? []).flatMap((s) => [s.headline ?? "", s.body ?? "", s.cta ?? ""]),
  ];
  return parts.filter(Boolean).join("\n\n");
}

function emailBlockToText(block: PoultryEmailBlock): string {
  if (block.kind === "p") return block.text;
  if ("text" in block) return block.text as string;
  return "";
}

/** Ruminants brochure — cover, narrative panels, CTA, footer. */
export function collectRuminantsProse(d: RuminantsBrochureData | null | undefined): string {
  if (!d) return "";
  const parts: string[] = [
    d.coverTitle ?? "",
    d.coverEyebrow ?? "",
    d.bubbleLine ?? "",
    d.heroClaim ?? "",
    d.heroEvidence ?? "",
    d.emphasisStamp ?? "",
    d.coverTease ?? "",
    d.coverSfx ?? "",
    ...(d.panels ?? []).flatMap((p) => [
      p.label ?? "",
      p.heading ?? "",
      p.body ?? "",
      p.stat ? `${p.stat.value} ${p.stat.unit}` : "",
      p.sfx ?? "",
    ]),
    d.ctaHeading ?? "",
    d.ctaBody ?? "",
    d.contactLine ?? "",
    d.citationLine ?? "",
  ];
  return parts.filter(Boolean).join("\n\n");
}

/** Swine short — hook, scenes, CTA. */
export function collectSwineProse(
  short:
    | {
        hook?: string;
        cta?: string;
        scenes?: Array<{
          shot?: string;
          shotDescription?: string;
          onScreenText?: string;
          voiceover?: string;
        }>;
        hashtags?: string[];
      }
    | null
    | undefined
): string {
  if (!short) return "";
  const parts: string[] = [
    short.hook ?? "",
    ...(short.scenes ?? []).flatMap((s) => [
      s.shot ?? s.shotDescription ?? "",
      s.onScreenText ?? "",
      s.voiceover ?? "",
    ]),
    short.cta ?? "",
  ];
  return parts.filter(Boolean).join("\n\n");
}
