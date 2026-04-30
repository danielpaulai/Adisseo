"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  FileText,
  Loader2,
  Sparkles,
  Upload,
} from "lucide-react";
import { Logo } from "@/components/Logo";

export default function ToolsIngestPage() {
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoHint, setPhotoHint] = useState(
    "CBI ladder · nutritionist · vet · purchaser"
  );
  const [photoJson, setPhotoJson] = useState<string | null>(null);
  const [photoErr, setPhotoErr] = useState<string | null>(null);

  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfJson, setPdfJson] = useState<string | null>(null);
  const [pdfErr, setPdfErr] = useState<string | null>(null);

  const submitPhoto = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPhotoErr(null);
    setPhotoJson(null);
    const fd = new FormData(e.currentTarget);
    const file = fd.get("image");
    if (!(file instanceof File) || file.size === 0) {
      setPhotoErr("Choose an image file.");
      return;
    }
    const hint = typeof fd.get("hint") === "string" ? (fd.get("hint") as string) : "";
    const upload = new FormData();
    upload.append("image", file);
    if (hint.trim()) upload.append("hint", hint.trim());

    setPhotoBusy(true);
    try {
      const res = await fetch("/api/ingest-workshop-photo", {
        method: "POST",
        body: upload,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPhotoErr((data as { error?: string }).error ?? `HTTP ${res.status}`);
        return;
      }
      setPhotoJson(JSON.stringify(data, null, 2));
    } catch (err) {
      setPhotoErr(err instanceof Error ? err.message : "Request failed");
    } finally {
      setPhotoBusy(false);
    }
  };

  const submitPdf = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPdfErr(null);
    setPdfJson(null);
    const fd = new FormData(e.currentTarget);
    const file = fd.get("document");
    if (!(file instanceof File) || file.size === 0) {
      setPdfErr("Choose a PDF.");
      return;
    }
    const upload = new FormData();
    upload.append("document", file);

    setPdfBusy(true);
    try {
      const res = await fetch("/api/ingest-document", {
        method: "POST",
        body: upload,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPdfErr((data as { error?: string }).error ?? `HTTP ${res.status}`);
        return;
      }
      setPdfJson(JSON.stringify(data, null, 2));
    } catch (err) {
      setPdfErr(err instanceof Error ? err.message : "Request failed");
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-adisseo-bg">
      <header className="sticky top-0 z-10 border-b border-adisseo-line bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <div className="h-6 w-px bg-adisseo-line" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
                Tools · Ricardo workshop ingest
              </p>
              <h1 className="text-lg font-semibold text-adisseo-ink-strong">
                Flipchart OCR + PDF extraction
              </h1>
            </div>
          </div>
          <Link
            href="/demo"
            className="flex items-center gap-1 text-xs font-medium text-adisseo-muted hover:text-adisseo-crimson"
          >
            <ArrowLeft size={14} /> Demo path
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-10 px-6 py-10">
        <p className="max-w-3xl text-sm text-adisseo-muted">
          Upload workshop photos to{" "}
          <code className="rounded bg-adisseo-tint px-1 py-0.5 font-mono text-xs">
            /api/ingest-workshop-photo
          </code>{" "}
          (Claude Vision when{" "}
          <code className="rounded bg-adisseo-tint px-1 font-mono text-[11px]">
            ANTHROPIC_API_KEY
          </code>{" "}
          is set). Upload PDFs to{" "}
          <code className="rounded bg-adisseo-tint px-1 py-0.5 font-mono text-xs">
            /api/ingest-document
          </code>{" "}
          (
          <code className="rounded bg-adisseo-tint px-1 font-mono text-[11px]">
            MISTRAL_API_KEY
          </code>{" "}
          → Mistral OCR, else{" "}
          <code className="rounded bg-adisseo-tint px-1 font-mono text-[11px]">
            pdf-parse
          </code>
          ).
        </p>

        <section className="rounded-3xl border border-adisseo-line bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-adisseo-crimson/10 text-adisseo-crimson">
              <Camera size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-serif text-xl font-bold text-adisseo-ink-strong">
                Workshop photo → structured JSON
              </h2>
              <p className="mt-1 text-xs text-adisseo-muted">
                Matrices, CBI ladders, bullet groups — ready to paste into vault seeds.
              </p>
              <form className="mt-5 space-y-3" onSubmit={(ev) => void submitPhoto(ev)}>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
                  Image
                  <input
                    name="image"
                    type="file"
                    accept="image/*"
                    required
                    className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-adisseo-crimson file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
                  />
                </label>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
                  Hint (optional)
                  <textarea
                    name="hint"
                    value={photoHint}
                    onChange={(e) => setPhotoHint(e.target.value)}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-adisseo-line p-2 text-sm"
                  />
                </label>
                <button
                  type="submit"
                  disabled={photoBusy}
                  className="flex items-center gap-2 rounded-lg bg-adisseo-ink-strong px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {photoBusy ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  Extract with Vision
                </button>
              </form>
              {photoErr && (
                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                  {photoErr}
                </p>
              )}
              {photoJson && (
                <pre className="mt-4 max-h-[420px] overflow-auto rounded-xl border border-adisseo-line bg-adisseo-bg p-4 text-[11px] leading-relaxed">
                  {photoJson}
                </pre>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-adisseo-line bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-adisseo-cyan/15 text-adisseo-cyan">
              <FileText size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-serif text-xl font-bold text-adisseo-ink-strong">
                PDF → pages + tables
              </h2>
              <p className="mt-1 text-xs text-adisseo-muted">
                Whitepapers and technical decks — up to 25 MB per upload.
              </p>
              <form className="mt-5 space-y-3" onSubmit={(ev) => void submitPdf(ev)}>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-adisseo-muted">
                  PDF document
                  <input
                    name="document"
                    type="file"
                    accept=".pdf,application/pdf"
                    required
                    className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-adisseo-cyan file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
                  />
                </label>
                <button
                  type="submit"
                  disabled={pdfBusy}
                  className="flex items-center gap-2 rounded-lg border border-adisseo-cyan bg-adisseo-cyan/10 px-4 py-2.5 text-sm font-semibold text-adisseo-ink-strong hover:bg-adisseo-cyan/20 disabled:opacity-50"
                >
                  {pdfBusy ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  Run OCR / parse
                </button>
              </form>
              {pdfErr && (
                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                  {pdfErr}
                </p>
              )}
              {pdfJson && (
                <pre className="mt-4 max-h-[420px] overflow-auto rounded-xl border border-adisseo-line bg-adisseo-bg p-4 text-[11px] leading-relaxed">
                  {pdfJson}
                </pre>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
