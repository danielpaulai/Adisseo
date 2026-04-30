"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import type { TenantId } from "@/lib/tenant";

interface EmailTestSendButtonProps {
  tenantId: TenantId;
  /** True if the tenant has Mailgun fully configured. Disables the button otherwise. */
  ready: boolean;
}

/**
 * Operator-grade "test send" button for the live email channel. Renders
 * inline on /credentials so an operator can confirm the Mailgun wiring
 * without leaving the page.
 *
 * Calls /api/email-test-send and surfaces the result via sonner toasts —
 * either the Mailgun message id (success) or the Mailgun reject reason
 * (so the operator can fix the env var).
 */
export function EmailTestSendButton({
  tenantId,
  ready,
}: EmailTestSendButtonProps) {
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/email-test-send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tenantId }),
      });
      const json = (await res.json()) as
        | { ok: true; externalId: string; audienceCount: number; latencyMs: number; publicUrl?: string }
        | { ok: false; reason: string };
      if (json.ok) {
        toast.success(
          `Mailgun delivered to ${json.audienceCount} recipient${json.audienceCount === 1 ? "" : "s"} in ${json.latencyMs}ms`,
          {
            description: `Message id ${json.externalId.slice(0, 32)}\u2026`,
            action: json.publicUrl
              ? {
                  label: "Open log",
                  onClick: () => window.open(json.publicUrl, "_blank"),
                }
              : undefined,
            duration: 8_000,
          }
        );
      } else {
        toast.error("Mailgun rejected the send", {
          description: json.reason,
          duration: 12_000,
        });
      }
    } catch (e) {
      toast.error("Network error", {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <button
      onClick={send}
      disabled={!ready || sending}
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-widest transition ${
        ready
          ? "border-emerald-500 bg-emerald-500 text-white hover:opacity-90 disabled:opacity-50"
          : "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400"
      }`}
      title={
        ready
          ? "Send a test email via Mailgun. Recipients come from ADIPLAN_<TENANT>_EMAIL_TEST_TO."
          : `Set ADIPLAN_${tenantId
              .toUpperCase()
              .replace(/[^A-Z0-9]+/g, "")}_EMAIL_PROVIDER=mailgun + API_KEY + FROM_DOMAIN to enable live test sends.`
      }
    >
      {sending ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />}
      Test send
    </button>
  );
}
