# Security policy — Adisseo / APAC pilot repo

This repository powers an internal-style marketing-platform demo. Treat it like production-adjacent software from day one.

## Reporting issues

If you discover a vulnerability or accidental exposure (secrets, customer data, unpublished campaign assets):

1. **Do not** open a public GitHub issue with exploit details.
2. Email or message the repo maintainer directly with: what you found, affected paths/commits if known, and whether anything appears already leaked.

We aim to acknowledge serious reports quickly during active pilot windows.

## Secrets and credentials

- **Never commit** `.env.local`, API keys, Mailgun secrets, Supabase service-role keys, webhook signing secrets, or scraper bearer tokens.
- The tracked **`.env.example`** lists variable names only — placeholders must stay empty or synthetic.
- If any secret was ever pushed — even briefly — **rotate it** at the provider (Anthropic, Mistral, Supabase, Mailgun, etc.). Making the repo private does not unwind history visible while the repo was public.

## Repository visibility

This project may contain **brand assets**, **workshop imagery**, and **campaign-derived structured data**. Keep the GitHub repository **private** whenever those materials are under NDA or regional rollout embargo. Assume anything pushed while the repo was public could have been copied.

## Large / proprietary drops

- Local WeTransfer-style archives under `adiplan-ai/vendor/` may be **gitignored** by path (see `adiplan-ai/.gitignore`). Do not bypass ignores to ship multi‑MB proprietary decks unless legal has cleared redistribution.

## Dependencies

- Run `npm audit` in `adiplan-ai/` before releases when practical.
- Prefer pinning dependency upgrades during demos so supply-chain drift is controlled.

## Application surfaces worth extra review

- **`/api/distribute`** and **`/api/webhook/*`** — outbound sends and inbound callbacks; validate tenant/channel alignment before widening ACL.
- **`/api/ingest-document`** and **`/api/ingest-workshop-photo`** — binary uploads; size limits apply — avoid raising caps without abuse review.

---

This document is maintained for the pilot team; update reporting contacts when ownership moves.
