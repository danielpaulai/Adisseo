# Adisseo — AdiPlan AI Build Context

> Self-contained context doc for picking this up in Cursor (or any other tool).
> Generated from a working session on 2026-04-28 after Danny's call with Ricardo Communod (Adisseo APAC).

---

## 0. Situation in one paragraph

Adisseo is a global feed-additive company. Ricardo runs marketing for APAC. Danny already built and shipped an internal **competitor news web-scraper platform** for Ricardo (83 competitors, 125+ websites scraped, timeline filter, chat layer, analytics). Ricardo is presenting it to Adisseo's **global team on Thursday May 7, 2026**. On the Apr 28 call, Ricardo asked Danny to build the **next layer**: bridge the scraped news to Adisseo's marketing strategy (the AdiPlan framework) and auto-produce campaign-ready deliverables per species, country, persona, and language. APAC is the pilot; global rollout follows. Working name: **AdiPlan AI**. Next call: **Thursday Apr 30, 2026 at 9:30 AM Danny's time / 2:30 PM Ricardo's time**.

---

## 1. Source files in this folder

| File | What it is |
|---|---|
| `Marketing training in Aqua.docx` | Mar 5 transcript — Aileen (Aqua species manager) |
| `Marketing training in Poultry.docx` | Mar 12 transcript — Vish (Poultry species manager) |
| `Marketing training in Ruminants.docx` | Apr 13 transcript — Antoine (Ruminants species manager) |
| `Marketing training in Swine.docx` | Mar 12 transcript — Claire (Swine species manager) |
| `AdiPlan_March Workshop - Value build template.pptx` | The 22-slide AdiPlan framework template (Impact Planning Group) |
| `WhatsApp Image 2026-04-21 at 11.51.46.jpeg` | Stakeholder Analysis example screenshot (14 stakeholder rows) |

Plain-text extractions live at `/tmp/adisseo_extract/{aqua,poultry,ruminants,swine,adiplan}.txt` (regenerable — see `/tmp/extract_docx.py`).

---

## 2. Key insights from the Apr 28 call

- **The "missing link" Ricardo named:** *"We have all the news, we have our strategy. The missing link is putting them together with RAG to take the decision for us and tell us what to do."*
- **AI governance constraint** (hard): internal proprietary data must stay inside Microsoft Copilot. Public/already-published content + scraped competitor data → external LLMs allowed. Architecture must split the pipeline at exactly that seam.
- **APAC pilot was approved precisely because** the team confirmed external tools are allowed for already-published content.
- **The Stakeholder Influence Map** Ricardo sketched verbally at the end of the call is the killer demo asset — bubble-sized influence, dotted future-circles, who-influences-whom arrows. Drives downstream CBI/CSF and persona work.
- **Measurement template:** Malaysia ASF case — 7 serious viewers (>2.5 min watch time) → 3 customer conversions. Institutionalize this metric.
- **Timeline Ricardo offered:** *"With you and I, we can go public in two weeks."*
- **Side ask for Thursday May 7 demo:** add "top-5 competitors by published-news count" to the existing scraper analytics page.
- **Side ask logged:** Jovita (small-business client) to be offered a demo of Danny's all-in-one content/marketing platform.

---

## 3. AdiPlan framework (the strategic spine)

The platform must live inside this framework, not invent a new one.

| Stage | Module | Output |
|---|---|---|
| **Assessing** | Stakeholder Map | Influence network — bubbles sized by current influence, dotted rings = future, arrows = who-influences-whom |
| | CBI & CSF Ladder | Per-stakeholder "Help me to…" outcomes laddered up to underlying values (WITI = Why Is This Important) |
| | We Wish We Knew (WWWK) | Research questions tied to specific decisions |
| **Creating** | Enterprise Personas | Diagonal-CSF matrix; named by top priority, not by species/region/account-size |
| | Total Value Solution | Products + Application Add-ons + Services + Data/Digital/Advisory bound to top CSFs |
| | Billboard Campaign | Headline + Adisseo Differentiation + Reason to Believe + Visual; passes Unique/Important/Believable test |
| **Executing** | Plan on a Page | Single-page strategy summary |
| | KPIs | Leading + Progress-check + Lagging metrics |

CBI = Critical Business Issue. CSF = Customer Success Factor.

---

## 4. The four species-manager personalities (must support all four out of one platform)

| Manager | Species | Wants most | Killer constraint / quirk |
|---|---|---|---|
| **Aileen** | Aqua | 1-2 page technical leaflets, drawing-style explainer videos (parasite life cycles, mycotoxin lateral-flow, lecithin breakdown), infographics, monthly Aqua-EPAC newsletter, raw-material price dashboard (pangasius / shrimp / fishmeal / methionine) | Local mags in Indonesian, Vietnamese, Thai. Says **LinkedIn is useless for Aqua**. Wants website articles she keeps not finding time to write |
| **Vish** | Poultry | Campaign-specific emailers (AGP-Free template worked), LinkedIn carousels under HQ guardrails, sales-engagement dashboard, KOL podcast aspiration | Brand-guardrail compliance is the gating issue. He reposts global, doesn't originate. Wants to NOT reach customers directly — wants to enable sales to reach them |
| **Antoine** | Ruminants | Monthly bilingual newsletter (Japanese + English), Manga-style brochures for Japan, 90-second pasture-system education videos for NZ/Australia, "MyCommand-personality" 2-page brochure | **Refuses to lose authorship** — AI must augment, not replace ("if AI does it for you, you don't own it in front of the customer"). New Zealand has zero amino-acid awareness — pure education play |
| **Claire** | Swine | <60s social videos for **TikTok / WeChat / Instagram (NOT LinkedIn)**, WeChat live-broadcast/webinar engine, ASF/PRRS/Tasvax video kit in 4 languages, account-based adaptation for top-10 customers/country with distributor-portfolio filter, MCQ knowledge base for sales support | Account-based adaptation is the time sink she explicitly named. Distinguishes by-customer not by-segment |

Cross-cutting: localization with **culturally-tuned register** — `koon` for Thai, `park` for Indonesian, manga voice for Japanese, different tone for Filipino vs. Vietnamese. Already validated in MyCommand newsletter.

---

## 5. Architecture — five layers

```
┌─────────────────────────────────────────────────────────────────┐
│ Layer 5: ACTIVATION                                             │
│   Account-Adaptation Engine · Sales Weekly Dashboard ·          │
│   Engagement Tracker (Malaysia-ASF model) · Publishing rails    │
├─────────────────────────────────────────────────────────────────┤
│ Layer 4: CONTENT STUDIO (per persona × country × language)      │
│   Aqua leaflets · Poultry emailers · Ruminants Manga ·          │
│   Swine <60s shorts · explainer videos · podcast scripts        │
│   ↑ Brand-Guardrail Pack enforces HQ-approved style             │
├─────────────────────────────────────────────────────────────────┤
│ Layer 3: STRATEGIC FRAME (the AdiPlan engine)                   │
│   Stakeholder Map · CBI/CSF Ladder · Personas · TVS · Billboard │
├─────────────────────────────────────────────────────────────────┤
│ Layer 2: SYNTHESIS / RAG                                        │
│   Match scraped news ↔ strategy ↔ persona ↔ CBI                 │
├─────────────────────────────────────────────────────────────────┤
│ Layer 1: INTEL                                                  │
│   Existing scraper · Raw-material price feeds · Approved        │
│   internal corpus (Copilot-only, never external LLM)            │
└─────────────────────────────────────────────────────────────────┘
```

The seam between Layer 1 and Layer 2 is where AI governance is enforced. Internal proprietary docs stay inside Copilot/Microsoft tenant. Public + scraped + already-published content can flow into external LLMs.

---

## 6. Stakeholder Influence Map (the hero demo for Thursday May 7)

Spec:

- **Nodes** = stakeholders (Corporate Nutrition Director, Vet KOL, Premixer, Integrator Tech Mgr, Procurement Lead, etc. — same 14 from the screenshot)
- **Node size** = current influence (small / medium / large)
- **Dotted ring** around node = projected future influence (growing / shrinking / not changing)
- **Directed arrows** = influence-flow (who-influences-whom) — power map, not org chart
- **Color cluster** = persona (Efficiency Optimizer, System Simplifier, etc.)
- **Filters**: country × species × campaign
- **Editable in workshop**: Ricardo drags/redraws live in his Thursday meeting
- **Auto-feeds**: CBI Ladder builder + Persona generator downstream

Seed dataset (from the Adisseo example screenshot):

| Stakeholder | Current Influence | Trend |
|---|---|---|
| Corporate Nutrition Directors | medium | shrinking |
| Procurement Leads | medium | not changing |
| Regulatory Affairs Managers | medium | growing |
| Sustainability CSR Officers | small | growing |
| Nutrition Managers | large | growing |
| Vets (Clinic & Field) | medium | shrinking |
| Farm Managers | small | not changing |
| Feed Mill Operators | small | not changing |
| University/Research Partners | small | shrinking |
| Integrator Nutrition or Tech Manager | large | not changing |
| Premixer — Formulator/Category Mgr | medium | growing |
| Distributor — Bus Dvlpmt Lead | small | shrinking |
| Financial Controllers | small | not changing |
| Vet KOLs/Consultants | medium | shrinking |
| NGO/Trade Assoc. Policy Lead | small | not changing |

---

## 7. GitHub repo stack

| Purpose | Repo | Why |
|---|---|---|
| **Stakeholder map (visual hero)** | `xyflow/xyflow` (React Flow) | Interactive draggable nodes/edges. Primary choice. |
| | `cytoscape/cytoscape.js` | Graph analytics (centrality, community) for "leverage points" |
| | `d3/d3-force` | Custom influence-bubble physics |
| | `tldraw/tldraw` | Optional freehand whiteboard mode for workshops |
| **Drawing-style explainer videos** | `3b1b/manim` + `ManimCommunity/manim` | Programmatic scientific animation — parasite life cycle, lateral-flow, amino-acid balancing |
| | `remotion-dev/remotion` | React-based <60s social cuts for Claire |
| **Brand-guardrail image gen** | `comfyanonymous/ComfyUI` | LoRA + ControlNet pipeline — locks Adisseo brand colors. Manga LoRAs available for Antoine |
| | `huggingface/diffusers` | Programmatic image gen |
| **PPT / PDF / leaflet generation** | `gka/pptxgenjs` | Auto-generate Plan-on-a-Page, Billboard, Stakeholder Map slides in AdiPlan template |
| | `foliojs/pdfkit` or `diegomura/react-pdf` | Aileen 1-2 page leaflets, MyCommand-style brochures |
| **RAG / document ingestion** | `microsoft/markitdown` | Convert PPT/DOCX/PDF brochures to markdown for embedding |
| | `Unstructured-IO/unstructured` | Best-in-class technical-PDF parsing |
| | `run-llama/llama_index` or `langchain-ai/langchain` | RAG orchestration |
| | `pgvector/pgvector` | Already in Supabase — vector store |
| **Scraping** | `apify/crawlee` | Foundation of existing Apify actors |
| | `mendableai/firecrawl` | LLM-ready markdown — needed for the GEO/AEO ranking feature |
| **Voice / podcast** | `coqui-ai/TTS` (XTTS-v2) | Multilingual voice cloning (JP/Thai/Chinese) |
| | `openai/whisper` + `m-bain/whisperX` | KOL interview transcription |
| **Dashboards / KPI** | `tremorlabs/tremor` or `recharts/recharts` | Engagement tracker (Malaysia-ASF viewer-time bucket) |
| **AI orchestration** | `vercel/ai` | Streaming, tool-calling — existing stack |
| | `langfuse/langfuse` | LLM observability + brand-guardrail audit trail (every generation logged for HQ approval) |

For the May 7 demo specifically: **xyflow + d3-force + pptxgenjs + Manim** get you 80% of the visual wow.

---

## 8. APAC Pilot scope (May 7 ship list)

Cut everything except:

1. **Stakeholder Map module** — fully interactive, demoed live in Ricardo's meeting, seeded with the 14 stakeholders above
2. **One end-to-end flow per species manager**, one deliverable each:
   - **Aqua → Aileen**: 1-page leaflet (Indonesian + English) generated from a scraped news topic
   - **Poultry → Vish**: AGP-Free-style emailer with attachment
   - **Ruminants → Antoine**: Manga-style 2-page brochure (Japanese)
   - **Swine → Claire**: 45-second TikTok-format video script + storyboard
3. **News → Strategy bridge** — pick a scraped competitor article, hit one button, get back: which CBI it maps to, which persona to target, three deliverable formats ready to publish

Side-quest also confirmed for May 7: add **top-5 competitors by published-news count** card to the existing scraper analytics page.

Everything else is V2.

---

## 9. Constraints, decisions, and open items

**Hard constraints:**
- AI governance: never send Adisseo internal docs to external LLMs. Copilot only.
- HQ brand guardrails apply to all generated visuals/copy — must be encoded as system prompts + LoRA + audit log.
- Carousel/video styles need HQ approval gate before publishing.

**Already decided:**
- APAC is the pilot region
- External LLMs allowed for public/already-published content
- Languages required at minimum: English, Japanese, Vietnamese, Indonesian, Thai, Chinese
- Cultural register variations required (koon, park, manga, etc.)

**Open / awaiting input:**
- Number of competitors / customers / websites for the scraper running-cost proposal (Ricardo to send by Thursday Apr 30)
- Whether HQ will green-light the carousel/video style guardrail templates Danny proposes
- Sophia / global team feedback (post their Apr 28 sales meeting — pending)

---

## 10. Next 3 actions (immediate)

1. **By Wed Apr 29 (today/tomorrow):** Send Ricardo a 1-page MVP scope doc — he asked for thought-process before any building starts.
2. **By Thu Apr 30 (call at 9:30 AM Danny's time):** Have Stakeholder Map MVP ready to show using xyflow + the 14 seeded stakeholders. Use the call to align on which species-manager flow gets built first.
3. **By Tue May 5:** End-to-end pilot flow for the chosen species manager working end-to-end (news → strategic match → published deliverable).

**Followups outside the build:**
- Singapore in-person: May 14-17 (Danny visiting with family). Ricardo's dance school pre-season showcase is **May 17, 3-5 PM at NUS** — Danny plans to attend after his own event.
- Jovita demo of Danny's content/marketing platform: schedule when she confirms interest.

---

## 11. Quick links back to source

- Extracted transcripts: `/tmp/adisseo_extract/{aqua,poultry,ruminants,swine,adiplan}.txt`
- Re-extraction script: `/tmp/extract_docx.py` (uses Python stdlib only — no pip install needed)
- Original `.docx` / `.pptx` files: this folder
