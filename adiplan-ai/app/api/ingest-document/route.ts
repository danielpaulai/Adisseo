/**
 * Tier 1 — document OCR / parse endpoint.
 *
 * What it does
 * ------------
 * Takes a PDF (or image of a document page) and returns a unified shape:
 *
 *   {
 *     mode: "mistral-ocr" | "pdf-parse" | "stub",
 *     pages: { index, markdown, text }[],
 *     tables: { caption?, rows: string[][] }[],
 *     citations: { id, page, anchor, snippet }[],
 *     wordCount: number
 *   }
 *
 * Real mode = Mistral OCR (https://mistral.ai/news/mistral-ocr) — best public
 * doc-AI for tables + figures + multi-language. We use it for the published
 * Adisseo whitepapers (Rovabio, Selisseo, FRA LeciMax) so trial numbers can
 * land verbatim with verifiable page anchors.
 *
 * Fallback = pdf-parse — pure JS, runs offline, lossy on tables but fine for
 * body text. Used when MISTRAL_API_KEY is not set.
 *
 * Inputs
 * ------
 * Either:
 *   - JSON  { documentBase64: "data:application/pdf;base64,...", fileName? }
 *   - multipart/form-data with file field "document"
 *
 * Notes for callers
 * -----------------
 * - The route caps the upload at 25 MB to keep the demo snappy.
 * - We DO NOT persist anything — call sites are expected to push the
 *   structured response into lib/vault.ts via their own ingest pipeline.
 */

import { NextRequest, NextResponse } from "next/server";
import { startTrace } from "@/lib/llm-trace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

const MAX_BYTES = 25 * 1024 * 1024;

interface DocPage {
  index: number;
  markdown: string;
  text: string;
}

interface DocTable {
  caption?: string;
  rows: string[][];
}

interface DocCitation {
  id: string;
  page: number;
  anchor: string;
  snippet: string;
}

interface IngestDocumentResult {
  mode: "mistral-ocr" | "pdf-parse" | "stub";
  fileName?: string;
  pages: DocPage[];
  tables: DocTable[];
  citations: DocCitation[];
  wordCount: number;
}

interface DocInput {
  bytes: Buffer;
  mimeType: string;
  fileName?: string;
}

async function readInput(req: NextRequest): Promise<DocInput> {
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("document");
    if (!(file instanceof File)) {
      throw new Error('multipart payload must include a "document" file field');
    }
    if (file.size > MAX_BYTES) throw new Error(`file too large: ${file.size} > ${MAX_BYTES}`);
    return {
      bytes: Buffer.from(await file.arrayBuffer()),
      mimeType: file.type || "application/pdf",
      fileName: file.name,
    };
  }
  const json = (await req.json()) as { documentBase64?: string; fileName?: string };
  if (!json.documentBase64) {
    throw new Error('JSON body must include "documentBase64"');
  }
  const m = json.documentBase64.match(/^data:(.+?);base64,(.*)$/);
  let mime = "application/pdf";
  let base64 = json.documentBase64;
  if (m) {
    mime = m[1];
    base64 = m[2];
  }
  const bytes = Buffer.from(base64, "base64");
  if (bytes.byteLength > MAX_BYTES) throw new Error(`file too large: ${bytes.byteLength}`);
  return { bytes, mimeType: mime, fileName: json.fileName };
}

/* ----------------------------------------------------------------------------
 * Mistral OCR — real cloud doc-AI
 * -------------------------------------------------------------------------- */

interface MistralOcrPage {
  index?: number;
  markdown?: string;
  text?: string;
}

interface MistralOcrResponse {
  pages?: MistralOcrPage[];
}

async function callMistralOcr(input: DocInput): Promise<IngestDocumentResult> {
  const apiKey = process.env.MISTRAL_API_KEY!;
  // Use Mistral's "document_url" mode with a base64 data URL so we don't
  // have to host the file. This is the documented pattern for ad-hoc OCR.
  const dataUrl = `data:${input.mimeType};base64,${input.bytes.toString("base64")}`;

  const res = await fetch("https://api.mistral.ai/v1/ocr", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistral-ocr-latest",
      document: { type: "document_url", document_url: dataUrl },
      include_image_base64: false,
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`mistral-ocr ${res.status}: ${txt.slice(0, 240)}`);
  }
  const json = (await res.json()) as MistralOcrResponse;
  const pages: DocPage[] = (json.pages ?? []).map((p, i) => ({
    index: p.index ?? i,
    markdown: p.markdown ?? p.text ?? "",
    text: stripMarkdown(p.markdown ?? p.text ?? ""),
  }));
  const tables = extractMarkdownTables(pages);
  return {
    mode: "mistral-ocr",
    fileName: input.fileName,
    pages,
    tables,
    citations: [],
    wordCount: pages.reduce((n, p) => n + countWords(p.text), 0),
  };
}

/* ----------------------------------------------------------------------------
 * pdf-parse fallback — body-text only, no tables, no figures
 * -------------------------------------------------------------------------- */

interface PdfParsePage {
  pageIndex?: number;
  text?: string;
}

interface PdfParseTextResult {
  text?: string;
  pages?: PdfParsePage[];
}

interface PdfParseCtor {
  new (init: { data: Uint8Array }): {
    getText(): Promise<PdfParseTextResult>;
    destroy?(): Promise<void>;
  };
}

async function callPdfParse(input: DocInput): Promise<IngestDocumentResult> {
  const mod = (await import("pdf-parse")) as unknown as { PDFParse: PdfParseCtor };
  const parser = new mod.PDFParse({ data: new Uint8Array(input.bytes) });
  let out: PdfParseTextResult;
  try {
    out = await parser.getText();
  } finally {
    await parser.destroy?.().catch(() => undefined);
  }

  // Prefer per-page output when the lib returns it; otherwise split the text
  // blob on form-feed (poppler convention) so callers always get page anchors.
  let pages: DocPage[];
  if (out.pages && out.pages.length > 0) {
    pages = out.pages.map((p, i) => ({
      index: p.pageIndex ?? i,
      markdown: (p.text ?? "").trim(),
      text: (p.text ?? "").trim(),
    }));
  } else {
    const text = out.text ?? "";
    const chunks = text.split(/\f/g).map((s) => s.trim()).filter(Boolean);
    pages = (chunks.length ? chunks : [text]).map((t, i) => ({
      index: i,
      markdown: t,
      text: t,
    }));
  }
  return {
    mode: "pdf-parse",
    fileName: input.fileName,
    pages,
    tables: [],
    citations: [],
    wordCount: pages.reduce((n, p) => n + countWords(p.text), 0),
  };
}

/* ----------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------- */

function countWords(s: string): number {
  return s.split(/\s+/).filter(Boolean).length;
}

function stripMarkdown(md: string): string {
  return md
    .replace(/^#+\s+/gm, "")
    .replace(/[*_`]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1");
}

/**
 * Cheap markdown-table extractor. Mistral OCR returns clean GFM tables, so
 * a regex over `| ... |` lines is enough for the demo.
 */
function extractMarkdownTables(pages: DocPage[]): DocTable[] {
  const tables: DocTable[] = [];
  for (const p of pages) {
    const lines = p.markdown.split(/\r?\n/);
    let buf: string[] = [];
    const flush = () => {
      if (buf.length < 2) {
        buf = [];
        return;
      }
      const rows: string[][] = [];
      for (const line of buf) {
        if (/^\s*\|?\s*-+\s*\|/.test(line)) continue;
        const cells = line
          .replace(/^\s*\|/, "")
          .replace(/\|\s*$/, "")
          .split("|")
          .map((c) => c.trim());
        if (cells.length >= 2) rows.push(cells);
      }
      if (rows.length >= 2) tables.push({ rows });
      buf = [];
    };
    for (const line of lines) {
      if (/^\s*\|.*\|\s*$/.test(line)) buf.push(line);
      else flush();
    }
    flush();
  }
  return tables;
}

/* ----------------------------------------------------------------------------
 * Route handler
 * -------------------------------------------------------------------------- */

export async function POST(req: NextRequest) {
  let input: DocInput;
  try {
    input = await readInput(req);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "bad request" },
      { status: 400 }
    );
  }

  const useMistral = !!process.env.MISTRAL_API_KEY;
  const trace = startTrace({
    kind: "ingest-document",
    title: input.fileName ?? `(${input.mimeType})`,
    model: useMistral ? "mistral-ocr-latest" : "pdf-parse",
    determined: !useMistral,
  });

  try {
    let result: IngestDocumentResult;
    if (useMistral) {
      try {
        result = await callMistralOcr(input);
      } catch (e) {
        // Soft fall-through — keep the demo alive on a bad cloud day.
        const detail = e instanceof Error ? e.message : "mistral-ocr error";
        trace.finish({
          summary: `mistral failed → pdf-parse fallback (${detail.slice(0, 80)})`,
          status: "warn",
        });
        result = await callPdfParse(input);
      }
    } else {
      result = await callPdfParse(input);
    }

    if (trace) {
      trace.finish({
        summary: `${result.mode} · ${result.pages.length}p · ${result.wordCount}w · ${result.tables.length}t`,
        outputTokens: Math.ceil(result.wordCount * 1.3),
        costUsd: result.mode === "mistral-ocr" ? 0.005 * result.pages.length : 0,
      });
    }
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "ingest failed";
    trace.fail(message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
