# AdiPlan AI — Phase-2 Repository Adds

Repos that would make the build better, beyond what's already in `repos.md`. Researched Apr 28, 2026 against current 2026 stack.

Priority legend (consistent with `repos.md`):

- **P0** — should add for May 7 demo (high-leverage, low-integration-cost)
- **P1** — needed for v1 APAC pilot (next 2 weeks)
- **P2** — V2 / global rollout / nice-to-have

---

## Top 6 highest-leverage adds for the May 7 demo

If you only adopt 6 of the items below, in order:

| # | Repo | Why it changes the demo |
|---|---|---|
| 1 | **shadcn/ui** | Replaces hand-rolled components with the 2026 de-facto standard — Radix accessibility + Tailwind. 1-day swap, demo looks 2x more polished. |
| 2 | **Liveblocks `@liveblocks/react-flow`** | Drops live multi-cursor + multiplayer state into the existing xyflow Stakeholder Map in ~10 lines. *This is exactly Ricardo's "drag/redraw in the workshop" use case.* |
| 3 | **ElevenLabs Multilingual v2 / Flash v2.5** | Generates actual voiceover audio in EN/ZH/VI/TH/ID for the Claire/Swine TikTok shorts. Turns the storyboard from "concept" into a playable artefact in front of HQ. |
| 4 | **Aceternity UI + Magic UI** | Animated landing-page components (Animated Beam, Spotlight, 3D Card) — perfect for the hero "News → Strategy → Deliverable" pipeline visualization. |
| 5 | **React Email 6.0 (Resend)** | The Vish/Poultry "AGP-Free emailer" module is literally one library swap away from done. Visual editor + Stripe/Vercel/Notion templates. |
| 6 | **LangGraph** | Replaces the linear API calls with a stateful agent graph that supports human-in-the-loop checkpointing — i.e. the HQ-approval pause/resume Adisseo will need for governance. |

---

## 1. UI components (the polish gap)

Right now the app uses hand-rolled Tailwind components. Three repos fix that.

| Repo | URL | Install | Priority | Role |
|---|---|---|---|---|
| **shadcn/ui** | https://github.com/shadcn-ui/ui | `npx shadcn@latest init` | **P0** | 85k stars, Radix-primitive-based, copy-paste components. The 2026 default for new React apps. Replaces our select/button/input with accessible versions. CLI: `npx shadcn add button select dialog dropdown-menu card sheet tabs toast`. |
| **Aceternity UI** | https://ui.aceternity.com | copy-paste | **P0** | 28k stars, 330+ animated components (Spotlight, 3D Card, Background Beams, Bento Grid, Animated Tooltip). Free tier covers everything we need. Use for the landing-page hero + the "AdiPlan layers" architecture diagram. |
| **Magic UI** | https://github.com/magicuidesign/magicui | `npx shadcn add ...` | **P0** | 15k stars, designed for shadcn-compatible motion components. **Animated Beam** is *the* component for visualizing the news→strategy→deliverable pipeline live. Number Ticker for the Malaysia-ASF engagement metrics. |
| **Sonner** | https://github.com/emilkowalski/sonner | `npm i sonner` | P1 | Toast notifications (better than Radix toast). Use for "Match generated", "Brand-guardrail flag raised", etc. |
| **Framer Motion** | https://github.com/framer/motion | `npm i motion` | P1 | Required by Aceternity + Magic UI. Also unlocks the smooth Stakeholder Map node-selection animations. |

---

## 2. Real-time collaboration (the workshop mode gap)

Ricardo's #1 unspoken requirement: *"I drag the stakeholders live in front of the team"*. Right now drag state is local. Make it multiplayer.

| Repo | URL | Install | Priority | Role |
|---|---|---|---|---|
| **Liveblocks** | https://github.com/liveblocks/liveblocks | `npm i @liveblocks/client @liveblocks/react @liveblocks/react-flow` | **P0** | Has a **dedicated `@liveblocks/react-flow` package** that wraps xyflow with multiplayer state in ~10 lines. Built-in: live cursors, multiplayer undo/redo, presence avatars, comment threads on nodes, AI-agent co-editing API. Free tier covers a workshop with 100 concurrent. |
| **Yjs** | https://github.com/yjs/yjs | `npm i yjs y-websocket` | P1 | Open-source CRDT alternative if Liveblocks pricing gets in the way at scale. xyflow has a Pro example using Yjs. |
| **PartyKit** | https://github.com/partykit/partykit | `npm i partykit` | P2 | Edge multiplayer infra — alternative to Liveblocks for self-host. |

The Liveblocks integration is the single biggest demo-impact addition we haven't made. It's also their explicit AI-agent collab story — fits the "AI matches an article, then a human edits the result live" narrative.

---

## 3. Email rendering (the Vish/Poultry module)

The current Swine Studio is the only Studio built. The Vish module needs HQ-guardrail-compliant emailers.

| Repo | URL | Install | Priority | Role |
|---|---|---|---|---|
| **React Email 6.0** | https://github.com/resend/react-email | `npx create-email@latest` | **P0** for V1 | 18k stars, by Resend. **2M weekly downloads, 6.0 shipped Apr 16, 2026**. Ships with cloned templates from Stripe / Vercel / Notion / Linear / AWS / Apple / Nike — drop-in starting points for Vish's HQ-style emailers. New open-source visual editor can embed in the AdiPlan UI. |
| **Resend** | https://github.com/resendlabs/resend-node | `npm i resend` | P1 | Transactional email send API by the same team. `resend.emails.send({ react: <Email/> })`. |
| **MJML** | https://github.com/mjmlio/mjml | `npm i mjml` | P2 | Older industry-standard markup for responsive email — fallback if HQ insists on a non-React templating system. |
| **Maizzle** | https://github.com/maizzle/framework | `npx create-maizzle@latest` | P2 | Tailwind-for-email; useful if we want to share design tokens between web + email. |

---

## 4. Multilingual TTS (turn storyboards into playable audio)

The Swine Studio outputs scripts. Adding voiceover audio in 5 languages turns it into a deliverable Ricardo can actually screen.

| Repo / API | URL | Install | Priority | Role |
|---|---|---|---|---|
| **ElevenLabs API** | https://elevenlabs.io/docs | `npm i @elevenlabs/elevenlabs-js` | **P0** | Multilingual v2 covers EN/ZH/JP/ID. Flash v2.5 (75ms latency) adds VI. v3 (74 languages) covers THA. Voice cloning available. Fits all 5 target languages we ship: EN/ZH/VI/TH/ID. |
| **Cartesia Sonic** | https://github.com/cartesia-ai/cartesia-python | `pip install cartesia` | P1 | Lower-latency alternative; fewer languages but very fast. |
| **OpenVoice v2 (MyShell)** | https://github.com/myshell-ai/OpenVoice | `pip install` | P2 | Open-source voice cloning with cross-lingual transfer. Self-host option for "no audio leaves Adisseo tenant" governance scenario. Newer than Coqui XTTS-v2 (which is in `repos.md`). |
| **Bark** | https://github.com/suno-ai/bark | `pip install bark` | P2 | Open-source, can do non-speech (laughter, music). Less polished than ElevenLabs. |

---

## 5. Agent orchestration (the multi-step pipeline gap)

Right now `match-article` and `generate-swine-short` are independent API calls. The full AdiPlan pipeline (news → CBI → persona → format → script → audio → guardrail check → HQ approval → publish) is 8 stages. Make it a graph.

| Repo | URL | Install | Priority | Role |
|---|---|---|---|---|
| **LangGraph** | https://github.com/langchain-ai/langgraph | `pip install langgraph` (or `npm i @langchain/langgraph` for TS) | **P0** | S-tier in 2026 production benchmarks (62% complex-task completion vs CrewAI 54%). Stateful graph with checkpointing — the human-in-the-loop nodes are exactly the HQ approval gate. Token-efficient (~36% less spend than CrewAI per request). |
| **LangSmith** | https://www.langchain.com/langsmith | `pip install langsmith` | P1 | LangGraph's observability layer — alternative/complement to Langfuse for the brand-guardrail audit trail. |
| **Mastra** | https://github.com/mastra-ai/mastra | `npm i @mastra/core` | P1 | TypeScript-native LangGraph alternative — better fit for our Next.js stack if Python service feels heavy. Less mature (B-tier in 2026 rankings) but ships faster. |
| **Inngest** | https://github.com/inngest/inngest-js | `npm i inngest` | **P0** | Background jobs + step-function orchestration native to TypeScript. **Perfect for the HQ-approval queue** — pause workflow, wait for human signal, resume. Replaces ad-hoc `setTimeout` and gives you retries + observability for free. |
| **Trigger.dev** | https://github.com/triggerdotdev/trigger.dev | `npm i @trigger.dev/sdk` | P1 | Inngest alternative; better cron + UI. |
| **Vercel AI SDK** | https://github.com/vercel/ai | already installed | already P0 | Already in our build — the lower-level streaming/tool-calling primitive. |

Recommended split: **Inngest** for app-level workflows (HQ approval queue, scheduled scrapes), **LangGraph** or **Mastra** for the AI reasoning chain inside each step.

---

## 6. Document ingestion (the RAG quality gap)

The Adisseo internal brochures + AdiPlan template + 4 species transcripts need to be ingested into pgvector. `markitdown` is fine for clean docs; for the messy ones, upgrade.

| Repo / API | URL | Install | Priority | Role |
|---|---|---|---|---|
| **Mistral OCR 3** | https://mistral.ai/news/mistral-ocr-3 | API | **P0** | Released Dec 2025. **88.9% handwriting accuracy, 96.6% on complex tables, 98.6% multilingual** — beats Azure / AWS / Google Document AI by double digits. **$1 per 1000 pages** via batch API. Critical for ingesting Adisseo's technical brochures + competitor scientific PDFs cleanly. |
| **Reducto** | https://github.com/reducto-ai (closed) | API | P1 | Multi-pass OCR + VLM for the "long tail of cases" Mistral misses (strikethroughs, redlines, complex forms). $0.015/credit. Use for the high-stakes Adisseo regulatory/audit docs. |
| **Cohere Rerank v3** | https://cohere.com/rerank | API | P1 | Reranker on top of pgvector retrievals — material RAG quality boost when the corpus crosses ~5k docs. |
| **Cognee** | https://github.com/topoteretes/cognee | `pip install cognee` | P2 | Knowledge-graph augmented RAG — could power the cross-stakeholder "who-influences-whom" inference better than the static edges we hand-coded. |
| **RAGFlow** | https://github.com/infiniflow/ragflow | docker | P2 | Self-host RAG platform if we move proprietary docs out of Copilot to a private tenant. |

---

## 7. Engagement analytics (the Malaysia-ASF model)

Ricardo's success metric: *7 serious viewers (>2.5 min watch) → 3 conversions*. We need a system to track this.

| Repo | URL | Install | Priority | Role |
|---|---|---|---|---|
| **PostHog** | https://github.com/PostHog/posthog | `npm i posthog-js` (self-host: docker) | **P0** | Open-source product analytics + feature flags + session replay. Self-host fits Adisseo data residency. Feature flags double as the **HQ approval gate** (gate publishing on a flag toggle). Cohort analysis = "serious viewers". |
| **Mux Data** | https://github.com/muxinc/mux-node-sdk | `npm i @mux/mux-node` | P1 | Video-specific analytics — Watch-time bucketing (the >2.5 min metric) is native. Also handles video hosting + adaptive streaming for the WeChat/TikTok shorts. |
| **Cloudflare Stream** | https://github.com/cloudflare/cloudflare-typescript | API | P2 | Mux alternative if we end up on Cloudflare. |
| **Tinybird** | https://github.com/tinybirdco/charts | API | P2 | Real-time analytics dashboards on top of streaming events — for the sales-engagement dashboard Vish wants. |

---

## 8. Translation (the cultural-register gap)

LLM translation is fine for marketing copy but inconsistent for technical claims. Add a deterministic translation layer for the parts that need to match Adisseo's controlled vocabulary.

| Repo / API | URL | Install | Priority | Role |
|---|---|---|---|---|
| **DeepL API** | https://www.deepl.com/docs-api | `npm i deepl-node` | P1 | Best-in-class for technical translation. Supports glossaries (lock "methionine" / "FCR" / "CBI" terminology). Covers EN/ZH/JP/ID/TH/VI. |
| **Google Cloud Translation v3** | https://cloud.google.com/translate | API | P1 | Better Indonesian + Vietnamese coverage than DeepL historically. Supports custom AutoML models. |
| **NLLB-200 (Meta)** | https://github.com/facebookresearch/fairseq/tree/nllb | `pip install transformers` | P2 | Open-source 200-language model. Self-host for governance. |

---

## 9. Video generation (turn storyboards into actual videos)

The Swine Studio outputs storyboards. To go to actual playable video, three additions:

| Repo / API | URL | Install | Priority | Role |
|---|---|---|---|---|
| **Remotion** | https://github.com/remotion-dev/remotion | already in `repos.md` | P1 | Already listed — React-based programmatic video. Pairs with the storyboard JSON we already generate to render an mp4. |
| **HeyGen API** | https://www.heygen.com/api | API | P2 | AI avatar talking-head video — quick mockup of the "vet KOL" content Cargill is doing on WeChat. Can fake the KOL until real ones are signed. |
| **Synthesia API** | https://www.synthesia.io/api | API | P2 | HeyGen alternative; better Asian-language avatars. |
| **Diffusion Studio** | https://github.com/diffusionstudio/core | `npm i @diffusionstudio/core` | P2 | Browser-based video editing primitives (FFmpeg in WASM). Lets users tweak the generated video in-browser. |
| **revideo** | https://github.com/redotvideo/revideo | `npm i @revideo/core` | P2 | Programmatic video alternative — Motion Canvas based, lighter than Remotion. |

---

## 10. Brand-guardrail image generation (the LoRA gap)

`repos.md` has ComfyUI + diffusers. Add the 2026 generation:

| Repo / API | URL | Install | Priority | Role |
|---|---|---|---|---|
| **Fal.ai (Flux LoRA)** | https://fal.ai | API | P1 | Hosted Flux + ControlNet pipeline. Train a LoRA on Adisseo brand assets, then any prompt produces brand-safe output. Faster than self-hosted ComfyUI. |
| **Replicate** | https://replicate.com | API | P1 | Fal.ai alternative; bigger model catalog. |
| **Black Forest Labs (Flux.1)** | https://github.com/black-forest-labs/flux | self-host | P2 | The model itself — for self-host once governance settles. |

---

## 11. Auth + storage + plumbing

| Repo | URL | Install | Priority | Role |
|---|---|---|---|---|
| **Supabase** | https://github.com/supabase/supabase | `npm i @supabase/supabase-js` | **P0** | Already mentioned (pgvector lives here). Also gives you auth + storage + edge functions in one. |
| **Clerk** | https://github.com/clerk/javascript | `npm i @clerk/nextjs` | P1 | Drop-in auth if Adisseo uses Microsoft SSO (Clerk has native Entra ID support, important for the Copilot tenant story). |
| **Tanstack Query** | https://github.com/TanStack/query | `npm i @tanstack/react-query` | P1 | Replaces the hand-rolled `useEffect(fetch())` patterns we have for `/api/articles` and friends. Caching + background refetch + optimistic updates. |
| **Tanstack Table** | https://github.com/TanStack/table | `npm i @tanstack/react-table` | P1 | For the storyboard scenes table + the eventual analytics dashboards. |
| **Zod** | https://github.com/colinhacks/zod | already installed via `ai` | already P0 | Already used in our API routes — schema validation for `generateObject`. |
| **Plate.js** | https://github.com/udecode/plate | `npm i @udecode/plate` | P2 | Rich text editor — upgrade for the CBI Ladder rung textareas (better than `<textarea>` for the workshop typing experience). |
| **Tiptap** | https://github.com/ueberdub/tiptap | `npm i @tiptap/react` | P2 | Plate alternative; lighter. |

---

## 12. Niche but high-value

| Repo | URL | Priority | Role |
|---|---|---|---|
| **Reka.ai** | https://github.com/reka-ai/reka-vibe | P2 | Multimodal evaluation — judge the generated TikTok shorts for "would Claire actually publish this". |
| **Helicone** | https://github.com/Helicone/helicone | P2 | LLM logging proxy — alternative/complement to Langfuse for cost tracking + caching. |
| **Arize Phoenix** | https://github.com/Arize-ai/phoenix | P2 | LLM eval + tracing — sits alongside Langfuse for richer evaluation. |
| **Markitdown (already listed)** | — | P0 | Confirmed for AdiPlan template ingestion. |
| **Stagehand** | https://github.com/browserbase/stagehand | P2 | AI-driven browser automation — could augment the existing scraper for sites that use heavy client-side rendering. |
| **Crawl4AI** | https://github.com/unclecode/crawl4ai | P2 | LLM-friendly crawler — alternative to Firecrawl. |

---

## Suggested integration order (1-week plan)

If we have a week to upgrade before May 7:

| Day | Add | Why this order |
|---|---|---|
| Mon | shadcn/ui base + lucide already there | Foundation for everything else |
| Mon | Aceternity Animated Beam on landing page | Hero pipeline animation |
| Tue | Liveblocks `@liveblocks/react-flow` on Stakeholder Map | The single biggest demo upgrade |
| Tue | Sonner + Tanstack Query | UX polish for async ops |
| Wed | ElevenLabs voiceover on Swine storyboards | Turns the studio into a playable artefact |
| Wed | React Email 6 — scaffold Vish/Poultry studio | Second species manager covered |
| Thu | Inngest for HQ-approval workflow stub | The governance evidence story |
| Thu | LangGraph (or Mastra) wrapping the existing match→generate flow | Multi-step reasoning visible to HQ |
| Fri | Mistral OCR 3 ingestion of AdiPlan template + 4 transcripts | Demo "ask AdiPlan" RAG capability |
| Fri | Polish + dry-run | — |

---

## Cost envelope (for the running-cost proposal Ricardo asked for)

Rough monthly at APAC pilot scale (~50 articles/day, ~500 deliverables/month):

| Service | Tier | Est cost |
|---|---|---|
| OpenAI / Anthropic | gpt-4o-mini at scale | ~$80/mo |
| ElevenLabs | Creator plan | $11/mo (or $99/mo Pro for 500k chars) |
| Mistral OCR 3 | Batch API | <$10/mo (10k pages = $10) |
| Liveblocks | Starter | $0 (free) → $99/mo if we cross 100 MAU |
| Inngest | Free tier | $0 → $50/mo at scale |
| Resend | Free tier | $0 (3k emails/mo free) |
| Supabase | Pro | $25/mo |
| LangSmith / Langfuse | Free tier | $0 → $39/mo |
| **Total floor** | — | **~$135/mo** |
| **Total ceiling** | (all paid tiers) | **~$425/mo** |

Cheap enough that the running-cost proposal isn't the blocker.

---

## What's deliberately *not* on this list

- **Specific to Adisseo**: there's no agriculture-specific repo worth adding right now. Industry data is in their CRM + the scraper output.
- **Frontend frameworks**: Next.js + React is fine. No reason to swap.
- **Vector DBs**: pgvector is sufficient at this scale. Qdrant/Weaviate become relevant past ~100k embeddings.
- **Heavy MLOps**: no model training needed for the pilot. Hosted APIs cover it.
