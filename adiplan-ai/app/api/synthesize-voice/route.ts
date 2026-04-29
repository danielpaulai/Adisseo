import { NextRequest, NextResponse } from "next/server";

/**
 * ElevenLabs TTS endpoint.
 *
 * Set ELEVENLABS_API_KEY in .env.local to enable. Returns audio/mpeg.
 * Without a key, returns 503 — the UI handles this and shows a hint.
 *
 * Language model mapping (Apr 2026):
 *   en/zh/id  -> eleven_multilingual_v2  (highest quality)
 *   vi        -> eleven_flash_v2_5       (v2 doesn't cover Vietnamese)
 *   th        -> eleven_v3               (v3 is the only model with Thai)
 */

type LangCode = "en" | "zh" | "vi" | "th" | "id";

const modelByLang: Record<LangCode, string> = {
  en: "eleven_multilingual_v2",
  zh: "eleven_multilingual_v2",
  id: "eleven_multilingual_v2",
  vi: "eleven_flash_v2_5",
  th: "eleven_v3",
};

const DEFAULT_VOICE_ID =
  process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM"; // Rachel — multilingual

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "ELEVENLABS_API_KEY not configured. Add it to adiplan-ai/.env.local to enable voiceover synthesis.",
      },
      { status: 503 }
    );
  }

  const { text, language = "en", voiceId } = (await req.json()) as {
    text?: string;
    language?: LangCode;
    voiceId?: string;
  };

  if (!text || !text.trim()) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  const model = modelByLang[language] ?? "eleven_multilingual_v2";
  const voice = voiceId ?? DEFAULT_VOICE_ID;

  const upstream = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: model,
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.75,
          style: 0.35,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!upstream.ok) {
    const body = await upstream.text();
    return NextResponse.json(
      { error: `ElevenLabs ${upstream.status}: ${body.slice(0, 300)}` },
      { status: upstream.status }
    );
  }

  const buf = await upstream.arrayBuffer();
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "private, max-age=300",
      "X-Adiplan-Model": model,
      "X-Adiplan-Voice": voice,
    },
  });
}
