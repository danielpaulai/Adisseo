# AdiPlan AI — Repository Reference

Every GitHub repo / package suggested in `context.md`, organized by role, with install commands and priority for the **May 7 demo**.

Priority legend:

- **P0** — must ship for May 7 demo
- **P1** — needed for the v1 APAC pilot (within 2 weeks)
- **P2** — V2 / global rollout

---

## 1. Stakeholder Influence Map (the hero demo)

| Repo | URL | Install | Priority | Role |
|---|---|---|---|---|
| `xyflow/xyflow` | https://github.com/xyflow/xyflow | `npm i @xyflow/react` | **P0** | Primary canvas — interactive draggable nodes/edges. The Stakeholder Map IS this. |
| `d3/d3-force` | https://github.com/d3/d3-force | `npm i d3-force d3` | **P0** | Influence-bubble physics — nodes repel/attract by influence weight |
| `cytoscape/cytoscape.js` | https://github.com/cytoscape/cytoscape.js | `npm i cytoscape` | P1 | Graph analytics (centrality, betweenness) → "leverage points" feature |
| `tldraw/tldraw` | https://github.com/tldraw/tldraw | `npm i tldraw` | P2 | Optional freehand whiteboard mode for live workshops |

---

## 2. Slide / PDF / Leaflet generation (the AdiPlan deliverables)

| Repo | URL | Install | Priority | Role |
|---|---|---|---|---|
| `gka/pptxgenjs` | https://github.com/gitbrent/PptxGenJS | `npm i pptxgenjs` | **P0** | Auto-generate Plan-on-a-Page, Billboard, Stakeholder Map slides into AdiPlan PPT template |
| `diegomura/react-pdf` | https://github.com/diegomura/react-pdf | `npm i @react-pdf/renderer` | **P0** | Aileen's 1-2 page leaflets, Antoine's MyCommand-style brochures |
| `foliojs/pdfkit` | https://github.com/foliojs/pdfkit | `npm i pdfkit` | P1 | Lower-level alternative to react-pdf if needed |

---

## 3. Drawing-style explainer videos (Aileen + Antoine)

| Repo | URL | Install | Priority | Role |
|---|---|---|---|---|
| `ManimCommunity/manim` | https://github.com/ManimCommunity/manim | `pip install manim` | P1 | Programmatic scientific animation — parasite life cycle, lateral-flow test, amino-acid balancing |
| `3b1b/manim` | https://github.com/3b1b/manim | (use ManimCommunity fork) | reference | Original 3Blue1Brown engine — community fork is the maintained one |
| `remotion-dev/remotion` | https://github.com/remotion-dev/remotion | `npx create-video@latest` | P1 | React-based <60s social cuts for Claire (TikTok/WeChat/Instagram) |

---

## 4. Brand-guardrail image generation

| Repo | URL | Install | Priority | Role |
|---|---|---|---|---|
| `comfyanonymous/ComfyUI` | https://github.com/comfyanonymous/ComfyUI | `git clone` + Python env | P1 | LoRA + ControlNet pipeline, locks Adisseo brand colors. Manga LoRAs available for Antoine |
| `huggingface/diffusers` | https://github.com/huggingface/diffusers | `pip install diffusers` | P1 | Programmatic image gen for batch workflows |

---

## 5. RAG / document ingestion (Layer 2)

| Repo | URL | Install | Priority | Role |
|---|---|---|---|---|
| `microsoft/markitdown` | https://github.com/microsoft/markitdown | `pip install markitdown` | **P0** | Convert PPT/DOCX/PDF brochures → markdown for embedding. Already need it to ingest the AdiPlan template + 4 species transcripts |
| `Unstructured-IO/unstructured` | https://github.com/Unstructured-IO/unstructured | `pip install "unstructured[all-docs]"` | P1 | Best-in-class technical-PDF parsing for Adisseo brochures |
| `run-llama/llama_index` | https://github.com/run-llama/llama_index | `pip install llama-index` | P1 | RAG orchestration — pick this OR langchain |
| `langchain-ai/langchain` | https://github.com/langchain-ai/langchain | `pip install langchain` | P1 | RAG orchestration alternative |
| `pgvector/pgvector` | https://github.com/pgvector/pgvector | (already in Supabase) | **P0** | Vector store — already provisioned |

---

## 6. Scraping (Layer 1, already running for the existing platform)

| Repo | URL | Install | Priority | Role |
|---|---|---|---|---|
| `apify/crawlee` | https://github.com/apify/crawlee | `npm i crawlee` | already deployed | Foundation of existing Apify actors |
| `mendableai/firecrawl` | https://github.com/mendableai/firecrawl | `npm i @mendable/firecrawl-js` | P1 | LLM-ready markdown — needed for the GEO/AEO ranking feature |

---

## 7. Voice / podcast (Vish KOL aspiration, Antoine bilingual newsletter audio)

| Repo | URL | Install | Priority | Role |
|---|---|---|---|---|
| `coqui-ai/TTS` (XTTS-v2) | https://github.com/coqui-ai/TTS | `pip install TTS` | P2 | Multilingual voice cloning (JP/Thai/Chinese/Indonesian) |
| `openai/whisper` | https://github.com/openai/whisper | `pip install openai-whisper` | P2 | KOL interview transcription |
| `m-bain/whisperX` | https://github.com/m-bain/whisperX | `pip install whisperx` | P2 | Whisper + speaker diarization + word-level timestamps |

---

## 8. Dashboards / KPI (Malaysia-ASF engagement model)

| Repo | URL | Install | Priority | Role |
|---|---|---|---|---|
| `tremorlabs/tremor` | https://github.com/tremorlabs/tremor | `npm i @tremor/react` | P1 | Engagement tracker — viewer-time bucket, conversion funnel |
| `recharts/recharts` | https://github.com/recharts/recharts | `npm i recharts` | P1 | Lower-level charting alternative |

---

## 9. AI orchestration + observability

| Repo | URL | Install | Priority | Role |
|---|---|---|---|---|
| `vercel/ai` | https://github.com/vercel/ai | `npm i ai` | **P0** | Streaming, tool-calling — already on existing stack |
| `langfuse/langfuse` | https://github.com/langfuse/langfuse | `npm i langfuse` | **P0** | LLM observability + brand-guardrail audit trail. Every generation logged for HQ approval — this is the AI governance evidence trail |

---

## May 7 demo minimum stack

For Thursday May 7, you only need these 7 to get to 80% visual wow:

```bash
npm i @xyflow/react d3-force d3 pptxgenjs @react-pdf/renderer ai langfuse
```

Plus Python-side for the synthesis layer:

```bash
pip install markitdown
```

Everything else is V1/V2 of the APAC pilot.

---

## Bulk clone command (reference checkout, optional)

If you want all repos checked out locally for code reading / LoRA hunting, run from a **separate** folder (these total ~10GB):

```bash
mkdir -p ~/adisseo-vendor && cd ~/adisseo-vendor
for repo in \
  xyflow/xyflow \
  d3/d3-force \
  cytoscape/cytoscape.js \
  tldraw/tldraw \
  gitbrent/PptxGenJS \
  diegomura/react-pdf \
  foliojs/pdfkit \
  ManimCommunity/manim \
  3b1b/manim \
  remotion-dev/remotion \
  comfyanonymous/ComfyUI \
  huggingface/diffusers \
  microsoft/markitdown \
  Unstructured-IO/unstructured \
  run-llama/llama_index \
  langchain-ai/langchain \
  pgvector/pgvector \
  apify/crawlee \
  mendableai/firecrawl \
  coqui-ai/TTS \
  openai/whisper \
  m-bain/whisperX \
  tremorlabs/tremor \
  recharts/recharts \
  vercel/ai \
  langfuse/langfuse; do
  git clone --depth 1 "https://github.com/$repo.git" "$(basename $repo)"
done
```

Don't run this inside the project workspace — keep vendor reference checkouts out of git.
