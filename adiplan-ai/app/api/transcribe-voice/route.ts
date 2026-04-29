import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/transcribe-voice
 *
 * Multipart form with field `audio` = Blob (browser MediaRecorder output).
 * Optional `language` hint = "en"|"ja"|"th"|"vi"|"id"|"zh".
 *
 * Calls OpenAI Whisper via the public REST endpoint when OPENAI_API_KEY is
 * present. Returns { transcript, source } where source is "whisper" |
 * "stub". The stub path returns a deterministic placeholder so the rest of
 * the pipeline keeps working in demo mode without a key.
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  let audio: Blob | null = null;
  let language: string | undefined;
  try {
    const form = await req.formData();
    const a = form.get("audio");
    if (a instanceof Blob) audio = a;
    const l = form.get("language");
    if (typeof l === "string" && l.length > 0) language = l;
  } catch (e) {
    return NextResponse.json(
      { error: "invalid form data", detail: String(e) },
      { status: 400 }
    );
  }
  if (!audio) {
    return NextResponse.json({ error: "audio field missing" }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({
      transcript:
        "Demo transcript · Heat-stress is hitting Hokkaido bulk-tank fat percentage in the second week of August. We held the protocol arm at +0.7 kg per cow per day across three farms, peer-reviewed and bulk-tank verified. Farmers are asking for a J-credit-ready dossier because buyer audits are now annual.",
      source: "stub",
      bytes: audio.size,
    });
  }

  try {
    const fd = new FormData();
    fd.append("file", audio, audio.type.includes("webm") ? "memo.webm" : "memo.mp4");
    fd.append("model", "whisper-1");
    if (language) fd.append("language", language);
    fd.append("response_format", "json");

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: fd,
    });
    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: "whisper failed", detail, status: res.status },
        { status: 502 }
      );
    }
    const data = (await res.json()) as { text?: string };
    return NextResponse.json({
      transcript: data.text ?? "",
      source: "whisper",
      bytes: audio.size,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: "whisper request error",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
