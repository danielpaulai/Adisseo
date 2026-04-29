"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2, Play, Pause } from "lucide-react";

/**
 * Lightweight in-browser MediaRecorder.
 *
 * Captures up to 90s of audio (browser default codec, usually webm/opus on
 * Chrome / Edge or mp4/aac on Safari). Caller receives the Blob via the
 * onRecorded callback for upload to /api/transcribe-voice.
 */

interface Props {
  onRecorded: (blob: Blob, mimeType: string) => void;
  /** Max recording time in ms before auto-stop. Default 90s. */
  maxMs?: number;
  disabled?: boolean;
}

type Status = "idle" | "asking" | "recording" | "processing" | "ready" | "error";

export function VoiceRecorder({
  onRecorded,
  maxMs = 90_000,
  disabled,
}: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startedAtRef = useRef<number>(0);
  const tickRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
      if (mediaRef.current && mediaRef.current.state !== "inactive") {
        mediaRef.current.stream.getTracks().forEach((t) => t.stop());
      }
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = async () => {
    setErrorMsg(null);
    setStatus("asking");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType });
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setStatus("ready");
        stream.getTracks().forEach((t) => t.stop());
        onRecorded(blob, mr.mimeType);
      };
      mr.start();
      startedAtRef.current = Date.now();
      setElapsedMs(0);
      setStatus("recording");

      tickRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startedAtRef.current;
        setElapsedMs(elapsed);
        if (elapsed >= maxMs) stop();
      }, 100);
    } catch (e) {
      setStatus("error");
      setErrorMsg(
        e instanceof Error ? e.message : "Microphone access denied"
      );
    }
  };

  const stop = () => {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (mediaRef.current && mediaRef.current.state === "recording") {
      mediaRef.current.stop();
      setStatus("processing");
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const seconds = Math.floor(elapsedMs / 1000);
  const ss = (seconds % 60).toString().padStart(2, "0");
  const mm = Math.floor(seconds / 60).toString().padStart(2, "0");

  return (
    <div className="rounded-2xl border border-adisseo-line bg-white p-4">
      <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-adisseo-crimson">
        <Mic size={12} /> Voice memo
      </div>

      <div className="flex items-center gap-3">
        {status !== "recording" ? (
          <button
            onClick={start}
            disabled={disabled || status === "asking" || status === "processing"}
            className="flex items-center gap-2 rounded-lg bg-adisseo-crimson px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
          >
            {status === "asking" || status === "processing" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Mic size={14} />
            )}
            {status === "asking"
              ? "Asking for mic\u2026"
              : status === "processing"
                ? "Processing\u2026"
                : status === "ready"
                  ? "Re-record"
                  : "Start recording"}
          </button>
        ) : (
          <button
            onClick={stop}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            <Square size={14} fill="currentColor" />
            Stop
          </button>
        )}

        <div className="flex-1 text-right font-mono text-sm font-bold text-adisseo-ink-strong">
          {mm}:{ss}{" "}
          <span className="text-[10px] font-normal uppercase tracking-widest text-adisseo-muted">
            / {Math.floor(maxMs / 60000)
              .toString()
              .padStart(2, "0")}
            :00
          </span>
        </div>
      </div>

      {/* level meter (decorative, real-time pulse) */}
      {status === "recording" && (
        <div className="mt-3 flex items-end gap-1 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => {
            const phase = (Date.now() / 80 + i) % 24;
            const height = 4 + Math.abs(Math.sin(phase * 0.4)) * 18;
            return (
              <span
                key={i}
                style={{ height: `${height}px` }}
                className="block w-1 rounded-t-sm bg-adisseo-crimson/70"
              />
            );
          })}
        </div>
      )}

      {previewUrl && status !== "recording" && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-adisseo-line bg-adisseo-bg p-2">
          <button
            onClick={togglePlayback}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-adisseo-crimson text-white"
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
          </button>
          <audio
            ref={audioRef}
            src={previewUrl}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            className="flex-1"
            controls
          />
        </div>
      )}

      {status === "error" && errorMsg && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
