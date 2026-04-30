import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  Lock,
  RadioTower,
  Shield,
  Webhook,
  XCircle,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { TenantSwitcher } from "@/components/TenantSwitcher";
import { LiveModeChip } from "@/components/LiveModeChip";
import { TENANT_LIST, CHANNELS } from "@/lib/tenant";
import {
  getTenantCredentials,
  getWebhookSecret,
} from "@/lib/channel-credentials";
import { signWebhookPayload } from "@/lib/webhook-signing";
import { readInbox } from "@/lib/webhook-inbox";

export const dynamic = "force-dynamic";

/* ============================================================================
 * /credentials — operator view of every tenant's integration state.
 *
 * Server-rendered so process.env reads work. Shows:
 *   - Per-tenant credential matrix (channel × required env vars × present?)
 *   - Webhook URL + per-tenant secret (truncated) + a copy-paste curl
 *     example so operators can test signing locally
 *   - Recent inbound webhook events from /lib/webhook-inbox
 *   - Channel rate-limit + integration notes
 * ========================================================================== */
export default function CredentialsPage() {
  return (
    <main className="min-h-screen bg-adisseo-bg pb-24 text-adisseo-ink">
      <header className="sticky top-0 z-20 border-b border-adisseo-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-adisseo-muted transition hover:text-adisseo-crimson"
          >
            <ArrowLeft size={14} />
            Home
          </Link>
          <Logo />
          <div className="flex items-center gap-2">
            <LiveModeChip />
            <TenantSwitcher />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 pt-10">
        <div className="rounded-3xl border border-adisseo-line bg-white p-8 shadow-sm">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
            <KeyRound size={10} /> Phase 6 · Production-readiness
          </p>
          <h1 className="mt-3 text-3xl font-black text-adisseo-ink-strong">
            Channel credentials &amp; webhook inbox
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-adisseo-muted">
            AdiPlan ships with mock dispatchers everywhere. To go live for a
            tenant + channel, set the env vars listed below. The dispatcher
            detects the presence of every required field at request time and
            falls back to mock when anything is missing — so the demo always
            works, and so partial roll-outs (e.g. Adisseo LinkedIn live, the
            rest still mocked) are safe.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Stat
              label="Tenants modelled"
              value={TENANT_LIST.length}
              icon={Building2}
            />
            <Stat
              label="Channels per tenant"
              value={5}
              icon={RadioTower}
            />
            <Stat
              label="HMAC algorithm"
              value="SHA-256"
              icon={Shield}
              valueClass="text-base"
            />
          </div>
        </div>

        {TENANT_LIST.map((t) => {
          const creds = getTenantCredentials(t.id);
          const webhookSecret = getWebhookSecret(t.id);
          const liveCount = creds.filter((c) => c.ready).length;
          const inbox = readInbox({ tenantId: t.id, limit: 8 });
          return (
            <section
              key={t.id}
              className="mt-10 rounded-3xl border border-adisseo-line bg-white p-6 shadow-sm"
              style={{ borderColor: t.accent }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white"
                    style={{ backgroundColor: t.accent }}
                  >
                    <Building2 size={10} /> {t.id === "adisseo" ? "Live customer" : "Onboarding blueprint"}
                  </p>
                  <h2
                    className="mt-2 text-2xl font-black"
                    style={{ color: t.accent }}
                  >
                    {t.name}
                  </h2>
                  <p className="text-xs text-adisseo-muted">
                    {liveCount} / {creds.length} channels live · trust floor{" "}
                    {t.trustFloor} · {t.requiresHqApproval
                      ? "HQ approval required"
                      : "no approval gate"}
                  </p>
                </div>
                <div className="rounded-xl border border-adisseo-line bg-stone-50 px-3 py-2 text-[10px]">
                  <p className="font-bold uppercase tracking-widest text-adisseo-muted">
                    Webhook secret (env-driven)
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 font-mono text-stone-700">
                    <Lock size={10} />
                    {maskSecret(webhookSecret)}
                  </p>
                  <p className="mt-0.5 text-adisseo-muted">
                    Set{" "}
                    <code className="rounded bg-white px-1 text-[10px] font-mono">
                      ADIPLAN_{tenantTag(t.id)}_WEBHOOK_SECRET
                    </code>{" "}
                    to override
                  </p>
                </div>
              </div>

              {/* Channel × credentials matrix */}
              <div className="mt-5 overflow-hidden rounded-2xl border border-adisseo-line">
                <table className="w-full text-left text-sm">
                  <thead className="bg-stone-50 text-[10px] uppercase tracking-widest text-adisseo-muted">
                    <tr>
                      <th className="px-3 py-2">Channel</th>
                      <th className="px-3 py-2">Mode</th>
                      <th className="px-3 py-2">Required env vars</th>
                      <th className="px-3 py-2 text-right">Rate-limit</th>
                      <th className="px-3 py-2 text-right">Webhook URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creds.map((c) => (
                      <tr
                        key={c.channel}
                        className="border-t border-adisseo-line align-top"
                      >
                        <td className="px-3 py-2">
                          <p className="text-xs font-bold text-adisseo-ink-strong">
                            {CHANNELS[c.channel].label}
                          </p>
                          <p className="line-clamp-2 text-[10px] text-adisseo-muted">
                            {c.note}
                          </p>
                          <a
                            href={c.docUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-adisseo-crimson hover:underline"
                          >
                            <ExternalLink size={9} /> docs
                          </a>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                              c.ready
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {c.ready ? (
                              <CheckCircle2 size={10} />
                            ) : (
                              <XCircle size={10} />
                            )}
                            {c.ready ? "Live" : "Mock"}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <ul className="space-y-1 text-[10px] font-mono text-stone-700">
                            {c.fields.map((f) => (
                              <li
                                key={f.envVar}
                                className="flex items-center gap-1.5"
                              >
                                <span
                                  className={
                                    f.present
                                      ? "text-emerald-600"
                                      : "text-stone-300"
                                  }
                                >
                                  {f.present ? "●" : "○"}
                                </span>
                                <span className="font-mono">{f.envVar}</span>
                                <span className="text-[9px] uppercase text-adisseo-muted">
                                  {f.kind}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-3 py-2 text-right text-[11px] font-semibold text-adisseo-ink-strong">
                          {c.rateLimitPerMin}/min
                        </td>
                        <td className="px-3 py-2 text-right">
                          <code className="rounded bg-stone-100 px-1 py-0.5 text-[10px] font-mono text-stone-700">
                            POST /api/webhook/{t.id}/{c.channel}
                          </code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sample curl */}
              <div className="mt-4 rounded-xl border border-adisseo-line bg-stone-900 p-3 font-mono text-[11px] text-stone-100">
                <p className="mb-2 text-[10px] uppercase tracking-widest text-stone-400">
                  Operator copy-paste · sample HMAC-signed inbound
                </p>
                <pre className="whitespace-pre-wrap leading-snug">
                  {sampleSignedCurl(t.id, webhookSecret)}
                </pre>
              </div>

              {/* Inbox */}
              <div className="mt-4">
                <p className="flex items-center gap-1.5 text-[11px] font-bold text-adisseo-ink-strong">
                  <Webhook size={12} /> Recent inbound webhooks ({inbox.length})
                </p>
                {inbox.length === 0 ? (
                  <p className="mt-1 text-[11px] text-adisseo-muted">
                    No events yet — POST to{" "}
                    <code className="rounded bg-stone-100 px-1 py-0.5 text-[10px] font-mono">
                      /api/webhook/{t.id}/&lt;channel&gt;
                    </code>{" "}
                    with a valid HMAC signature to populate this list.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-1">
                    {inbox.map((e) => (
                      <li
                        key={e.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-adisseo-line bg-white px-3 py-1.5 text-[11px]"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[9px] uppercase tracking-widest ${
                              e.status === "ok"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {e.status}
                          </span>
                          <span className="font-bold text-adisseo-ink-strong">
                            {CHANNELS[e.channel].label}
                          </span>
                          <span className="text-adisseo-muted">
                            {e.bodyBytes}B
                          </span>
                          {e.reason && (
                            <span className="text-rose-600">{e.reason}</span>
                          )}
                        </div>
                        <span className="text-[10px] text-adisseo-muted">
                          {new Date(e.receivedAt).toLocaleTimeString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          );
        })}

        <section className="mt-10 rounded-2xl border border-adisseo-line bg-white p-6">
          <h2 className="text-lg font-black text-adisseo-ink-strong">
            How a tenant goes live
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-adisseo-muted">
            <li>
              Operator sets the channel's env vars in 1Password / Doppler /
              Vercel. The dispatcher reads them at request time.
            </li>
            <li>
              Operator generates a webhook secret (per tenant) and pastes it
              into both the channel's webhook config and AdiPlan&rsquo;s env.
            </li>
            <li>
              Channel POSTs to{" "}
              <code className="rounded bg-stone-100 px-1 py-0.5 text-[11px] font-mono">
                /api/webhook/&lt;tenant&gt;/&lt;channel&gt;
              </code>{" "}
              with{" "}
              <code className="rounded bg-stone-100 px-1 py-0.5 text-[11px] font-mono">
                x-adiplan-signature: t=&lt;ts&gt;,v1=&lt;hex hmac&gt;
              </code>
              .
            </li>
            <li>
              AdiPlan verifies the signature, rejects stale (&gt;5min) /
              malformed / mismatched payloads, and stores accepted events in
              the inbox.
            </li>
            <li>
              The next dispatch from that tenant + channel runs through the
              live HTTP shell instead of the mock; the rest of the pipeline
              (engagement-tracker, observability, audit log) is unchanged.
            </li>
          </ol>
        </section>
      </div>
    </main>
  );
}

/* ----------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------- */

function tenantTag(id: string): string {
  return id.toUpperCase().replace(/[^A-Z0-9]+/g, "");
}

function maskSecret(s: string): string {
  if (s.length <= 8) return "•".repeat(s.length);
  return `${s.slice(0, 4)}${"•".repeat(8)}${s.slice(-4)}`;
}

function sampleSignedCurl(tenantId: string, secret: string): string {
  const body = JSON.stringify(
    {
      eventType: "engagement.update",
      externalId: "live-linkedin-mokz1234",
      impressions: 24500,
      qualifiedViews: 612,
      conversations: 142,
      conversions: 84,
      ts: new Date().toISOString(),
    },
    null,
    0
  );
  const sig = signWebhookPayload(body, secret);
  return [
    `curl -X POST 'https://adiplan.example.com/api/webhook/${tenantId}/linkedin' \\`,
    `  -H 'content-type: application/json' \\`,
    `  -H 'x-adiplan-timestamp: ${sig.timestamp}' \\`,
    `  -H 'x-adiplan-signature: ${sig.signature}' \\`,
    `  -d '${body}'`,
  ].join("\n");
}

function Stat({
  label,
  value,
  icon: Icon,
  valueClass,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number }>;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-adisseo-line p-3">
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-adisseo-muted">
        <Icon size={11} /> {label}
      </p>
      <p
        className={`mt-1 font-black text-adisseo-ink-strong ${
          valueClass ?? "text-2xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
