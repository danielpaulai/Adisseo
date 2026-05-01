"use client";

/**
 * APAC plan — Phase 8
 *
 * Magic-link login for the demo. Two paths:
 *   • Supabase configured → real magic link, real session
 *   • Supabase not configured → "demo mode" badge, links straight to / (no
 *     auth gate). Lets the demo run at any URL even before Supabase is
 *     live in Singapore.
 *
 * No password, no SSO, no extra UI. One field. One button. The whole
 * point is to make the Saturday EOD link Ricardo gets feel obvious.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import {
  isLive,
  signInWithMagicLink,
  currentAuthUser,
  type ApacAuthUser,
} from "@/lib/supabase-client";

export default function LoginPage() {
  const [live, setLive] = useState(false);
  const [email, setEmail] = useState("ricardo@adisseo.com");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<ApacAuthUser | null>(null);

  useEffect(() => {
    setLive(isLive());
    void currentAuthUser().then(setMe);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!live) {
      // Demo mode — just send them through.
      window.location.href = "/";
      return;
    }
    setBusy(true);
    const r = await signInWithMagicLink(email.trim());
    setBusy(false);
    if (r.ok) {
      setSent(true);
    } else {
      setError(r.error ?? "Sign-in failed");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-adisseo-bg px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-adisseo-line bg-white p-8 shadow-md">
        <div className="flex items-center justify-between">
          <Logo size="md" />
          <span className="rounded-full border border-adisseo-line bg-adisseo-warmth/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-adisseo-muted">
            APAC
          </span>
        </div>

        <h1 className="mt-6 text-2xl font-bold text-adisseo-ink">
          Sign in to APAC
        </h1>
        <p className="mt-1 text-sm text-adisseo-muted">
          Magic-link only. Adisseo + species-manager allowlist.
        </p>

        {!live && (
          <div className="mt-4 flex items-start gap-2 rounded-md bg-amber-50 p-3 text-xs text-amber-900">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Demo mode</p>
              <p>
                Supabase isn&rsquo;t configured for this build. The button
                below opens the app without auth so the demo URL still
                works. Wire <code>NEXT_PUBLIC_SUPABASE_URL</code> +{" "}
                <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to flip to real
                login.
              </p>
            </div>
          </div>
        )}

        {me && (
          <div className="mt-4 flex items-start gap-2 rounded-md bg-emerald-50 p-3 text-xs text-emerald-900">
            <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Already signed in as {me.email}</p>
              <p>
                Role: <span className="font-mono">{me.role}</span> · Tenant:{" "}
                <span className="font-mono">{me.tenantId}</span>
              </p>
              <Link
                href="/"
                className="mt-1 inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
              >
                Continue to APAC <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-3">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-adisseo-muted">
              Work email
            </span>
            <div className="mt-1 flex items-center rounded-md border border-adisseo-line bg-white px-3 py-2 focus-within:border-adisseo-crimson">
              <Mail size={14} className="mr-2 text-adisseo-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ricardo@adisseo.com"
                required
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </label>

          {sent ? (
            <div className="flex items-start gap-2 rounded-md bg-emerald-50 p-3 text-xs text-emerald-900">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
              <p>
                Magic link sent to <strong>{email}</strong>. Check your inbox
                — opens straight into the dashboard.
              </p>
            </div>
          ) : (
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-adisseo-crimson px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-40"
            >
              {busy ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              {live ? "Send magic link" : "Open APAC (demo mode)"}
            </button>
          )}

          {error && (
            <p className="rounded-md bg-red-50 p-2 text-xs text-red-900">
              {error}
            </p>
          )}
        </form>

        <div className="mt-6 space-y-2 border-t border-adisseo-line pt-4 text-[10px] text-adisseo-muted">
          <p className="flex items-center gap-1.5">
            <ShieldCheck size={11} />
            Allowlisted roles: Ricardo (approver), 4 species managers, Daniel
            (admin). Everyone else lands as viewer.
          </p>
          <p className="flex items-center gap-1.5">
            <ExternalLink size={11} />
            Region: Supabase Singapore (ap-southeast-1) for APAC latency.
          </p>
        </div>
      </div>
    </main>
  );
}
