/**
 * Tier 2 — HTML → PDF wrapper around Puppeteer.
 *
 * Why this exists
 * ---------------
 * @react-pdf/renderer is great for fast structured PDFs but it implements
 * a subset of CSS. Once we want pixel-faithful Adisseo brand (BANDEAU
 * placement, exact letter-spacing, real logos, web fonts, gradients,
 * grid layouts), we hit walls.
 *
 * Puppeteer drives full Chrome, so any HTML/CSS that renders in a browser
 * renders in our PDF. The trade-off is a ~300 MB Chromium binary and
 * ~600–1200 ms cold-start. We mitigate cold-start by caching a single
 * `Browser` instance on `globalThis` and lazy-creating it once per process.
 *
 * Public API
 * ----------
 *   const buf = await htmlToPdf({ html, format: "A4", landscape: false });
 *
 * `html` may include `<link rel="stylesheet">` or local `file://` URLs
 * pointing into /public — Puppeteer is given `--allow-file-access-from-files`
 * so brand assets can be referenced as absolute file paths.
 *
 * If Puppeteer is unavailable (e.g. demo box without Chromium), the wrapper
 * throws a typed `PuppeteerUnavailableError` so callers can fall back to
 * @react-pdf/renderer cleanly.
 */

import path from "node:path";

export class PuppeteerUnavailableError extends Error {
  constructor(reason: string) {
    super(`puppeteer unavailable: ${reason}`);
    this.name = "PuppeteerUnavailableError";
  }
}

export interface HtmlToPdfOptions {
  html: string;
  /** Page format. Default A4 portrait. */
  format?: "A4" | "Letter" | "Legal";
  landscape?: boolean;
  /** CSS margins in mm. Default 0 (template owns its own padding). */
  marginMm?: { top?: number; right?: number; bottom?: number; left?: number };
  /** Print background colors / images. Default true. */
  printBackground?: boolean;
  /** Wait this long for fonts/images before snapshot. Default 1500 ms. */
  warmupMs?: number;
}

interface BrowserCache {
  browser: unknown | null;
  initFailedReason: string | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __htmlPdfBrowser: BrowserCache | undefined;
}

function cache(): BrowserCache {
  if (!globalThis.__htmlPdfBrowser) {
    globalThis.__htmlPdfBrowser = { browser: null, initFailedReason: null };
  }
  return globalThis.__htmlPdfBrowser;
}

interface PuppeteerLaunchOptions {
  headless?: boolean | "shell" | "new";
  args?: string[];
}

interface PuppeteerBrowser {
  newPage(): Promise<PuppeteerPage>;
  close(): Promise<void>;
  process?(): { pid?: number } | null;
}

interface PuppeteerPdfOptions {
  format?: string;
  landscape?: boolean;
  printBackground?: boolean;
  margin?: { top?: string; right?: string; bottom?: string; left?: string };
  preferCSSPageSize?: boolean;
}

interface PuppeteerPage {
  setContent(html: string, opts: { waitUntil?: "load" | "domcontentloaded" | "networkidle0" | "networkidle2" }): Promise<void>;
  evaluate<T>(fn: () => T): Promise<T>;
  pdf(opts?: PuppeteerPdfOptions): Promise<Uint8Array>;
  close(): Promise<void>;
}

interface PuppeteerModule {
  launch(opts?: PuppeteerLaunchOptions): Promise<PuppeteerBrowser>;
}

async function getBrowser(): Promise<PuppeteerBrowser> {
  const c = cache();
  if (c.initFailedReason) {
    throw new PuppeteerUnavailableError(c.initFailedReason);
  }
  if (c.browser) return c.browser as PuppeteerBrowser;

  let mod: PuppeteerModule;
  try {
    mod = (await import("puppeteer")) as unknown as PuppeteerModule;
  } catch (e) {
    const reason = e instanceof Error ? e.message : "import failed";
    c.initFailedReason = reason;
    throw new PuppeteerUnavailableError(reason);
  }

  try {
    const browser = await (mod.launch as (opts: PuppeteerLaunchOptions & { protocolTimeout?: number }) => Promise<PuppeteerBrowser>)({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--allow-file-access-from-files",
        "--font-render-hinting=none",
      ],
      protocolTimeout: 30_000,
    });
    c.browser = browser;
    return browser;
  } catch (e) {
    const reason = e instanceof Error ? e.message : "launch failed";
    c.initFailedReason = reason;
    throw new PuppeteerUnavailableError(reason);
  }
}

export async function htmlToPdf(opts: HtmlToPdfOptions): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    // We intentionally use `load` rather than `networkidle0`. Headless
    // Chrome can hang under `networkidle0` when assets are loaded over
    // file:// (the spec leaves "idle" undefined for non-network protocols).
    // `load` fires once the document and its synchronous sub-resources
    // (images, fonts referenced by url()) have settled. A small explicit
    // warmup catches any late web-font swaps.
    await page.setContent(opts.html, { waitUntil: "load" });
    await new Promise((r) => setTimeout(r, Math.max(opts.warmupMs ?? 200, 50)));

    const pdfBytes = await page.pdf({
      format: opts.format ?? "A4",
      landscape: opts.landscape ?? false,
      printBackground: opts.printBackground ?? true,
      margin: {
        top: `${opts.marginMm?.top ?? 0}mm`,
        right: `${opts.marginMm?.right ?? 0}mm`,
        bottom: `${opts.marginMm?.bottom ?? 0}mm`,
        left: `${opts.marginMm?.left ?? 0}mm`,
      },
      preferCSSPageSize: true,
    });
    return Buffer.from(pdfBytes);
  } finally {
    await page.close().catch(() => undefined);
  }
}

/**
 * Convert a /public-relative or absolute path to a `file://` URL Puppeteer
 * can load. Use this for brand assets so Chrome sees the same fonts and
 * logos that ship with the app.
 */
export function fileUrlForPublic(publicRelativeOrAbsolute: string): string {
  const abs = path.isAbsolute(publicRelativeOrAbsolute)
    ? publicRelativeOrAbsolute
    : path.join(process.cwd(), "public", publicRelativeOrAbsolute.replace(/^\//, ""));
  return `file://${abs}`;
}
