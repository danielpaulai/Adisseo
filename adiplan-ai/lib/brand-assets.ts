/**
 * Tier 1 — single source of truth for Adisseo brand assets used by
 * PDF renderers, OG cards, and the design-system page.
 *
 * All paths are public:// URLs (i.e. resolve from /public). They are
 * referenced with `process.cwd() + path` in @react-pdf renderers and as
 * relative URLs in the browser.
 */

import path from "node:path";

const PUBLIC_ROOT = path.join(process.cwd(), "public");

export const BRAND_ASSETS = {
  /** Adisseo wordmark (color, transparent BG). Real asset from WeTransfer. */
  logo: {
    publicUrl: "/brand/adisseo-logo.png",
    fsPath: path.join(PUBLIC_ROOT, "brand/adisseo-logo.png"),
    widthHint: 220,
  },
  /** QR code for "Turning Feed Into Profit" campaign — drop on leaflet/footer. */
  tfipQr: {
    publicUrl: "/brand/tfip-qr.png",
    fsPath: path.join(PUBLIC_ROOT, "brand/tfip-qr.png"),
    widthHint: 96,
    caption: "Scan for the full APAC poultry campaign",
  },
  /** Flattened white "BANDEAU" header band. Used at the top of leaflets. */
  tfipBandeau: {
    publicUrl: "/brand/tfip-bandeau.png",
    fsPath: path.join(PUBLIC_ROOT, "brand/tfip-bandeau.png"),
    widthHint: 1200,
  },
  /** Species marks. */
  species: {
    aqua: "/brand/aqua.svg",
    poultry: "/brand/poultry.svg",
    ruminants: "/brand/ruminants.svg",
    swine: "/brand/swine.svg",
  },
} as const;

/**
 * Convenience for renderers that need to feed @react-pdf's <Image>
 * component a Buffer-friendly source. We standardise on the FS path.
 */
export function brandLogoSrc() {
  return BRAND_ASSETS.logo.fsPath;
}

export function tfipQrSrc() {
  return BRAND_ASSETS.tfipQr.fsPath;
}

export function tfipBandeauSrc() {
  return BRAND_ASSETS.tfipBandeau.fsPath;
}
