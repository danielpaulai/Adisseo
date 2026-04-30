#!/usr/bin/env python3
"""Inject Phase 5 body/region/citation/hashtag fields into DEMO_DELIVERABLES."""

import re
import pathlib

P = pathlib.Path("adiplan-ai/lib/distribution.ts")
src = P.read_text()

bodies = {
    "del-adi-poultry-id": dict(
        region="Indonesia",
        citationCount=4,
        hashtags=["#poultry", "#feed", "#APAC", "#AGPfree"],
        body=(
            "Indonesia mills are removing AGPs faster than the regulators expected. "
            "Trial across 6 commercial broiler farms (n=144,000 birds) shows that "
            "holding FCR within 3 points of the AGP baseline takes a methionine + "
            "organic-acid stack, not a single-additive swap. Day-7 mortality drops "
            "from 1.8% to 1.1%. Rhodimet AT88 is the spine; Adisseo's APAC team has "
            "the protocol. [^v-poultry-id-2025]"
        ),
    ),
    "del-adi-aqua-vn": dict(
        region="Vietnam",
        citationCount=3,
        hashtags=["#aqua", "#shrimp", "#mycotoxin"],
        body=(
            "Vietnamese shrimp-feed mill QC trial (n=12 batches) showed a 38% "
            "reduction in DON contamination after switching to the mycotoxin "
            "binder protocol. Average dry-matter intake recovered to baseline "
            "within 7 days. The leaflet captures the 4-step gate Adisseo's APAC "
            "team uses with three top-3 integrators in HCMC. [^v-aqua-asfu-2025]"
        ),
    ),
    "del-adi-ruminants-jp": dict(
        region="Hokkaido",
        citationCount=2,
        hashtags=["#ruminants", "#dairy", "#methane", "#JCredit"],
        body=(
            "Hokkaido dairy farmers face heat stress + methane reporting in the "
            "same Q2. The manga 2-pager pitches the J-credit pathway as a margin "
            "tool, not a compliance tax. Bovaer-style 27% methane suppression "
            "with no milk-yield trade-off; Mizuho's J-credit auction last cleared "
            "at \u00a51,400/tCO2. [^v-rumi-bovaer-2025]"
        ),
    ),
    "del-adi-swine-cn": dict(
        region="China",
        citationCount=2,
        hashtags=["#swine", "#ASF", "#nursery"],
        body=(
            "ASF nursery recovery starts at the feed bunk. 60-second short captures "
            "the 4-day re-introduction protocol Adisseo's swine team validated "
            "across 4 SE-Asia integrators. Mortality falls from 2.4% to 0.9%; FCR "
            "holds within 2 points of pre-outbreak baseline. [^v-swine-asf-2025]"
        ),
    ),
    "del-adi-poultry-th": dict(
        region="Thailand",
        citationCount=1,
        hashtags=["#poultry", "#mycotoxin", "#APAC"],
        body=(
            "Thailand integrator panel confirms the mycotoxin gate from the "
            "Indonesia trial holds up at the Thai humidity baseline. The emailer "
            "is a single-page brief; the carousel is the 5-slide deep dive. Send "
            "both in one push for the integrator vet desks."
        ),
    ),
    "del-dsm-bovaer-eu": dict(
        region="EU",
        citationCount=5,
        hashtags=["#dairy", "#methane", "#Bovaer"],
        body=(
            "DSM-Firmenich Bovaer (3-NOP) hits 27% enteric methane suppression "
            "with no milk-yield trade-off. Trade-pack covers the EU Sustainable "
            "Dairy framework anchor, the meta-analysis across 14 trials, and the "
            "regulatory compliance posture for EU Reg 2018/848. [^v-dsm-bovaer-2026]"
        ),
    ),
    "del-dsm-balancius-nl": dict(
        region="Netherlands",
        citationCount=3,
        hashtags=["#poultry", "#enzyme", "#EU"],
        body=(
            "Balancius enzyme tested across 6 commercial Dutch broiler farms "
            "(n=144,000 birds). FCR improvement of 3.1 points, 1.4pp mortality "
            "reduction vs control. Compliant with EU Reg 2018/848. The 5-slide "
            "carousel breaks down the protocol for nutritionist-side decisions. "
            "[^v-dsm-balancius-2026]"
        ),
    ),
    "del-cargill-promote-mx": dict(
        region="Mexico",
        citationCount=4,
        hashtags=["#swine", "#nursery", "#LatAm"],
        body=(
            "Cargill Promote nursery protocol \u2014 4 sites, 14,200 piglets, "
            "mortality reduction of 0.8pp and nursery FCR improvement of 2.4 "
            "points. The WhatsApp pack lands as a one-bubble brief plus a 5-slide "
            "carousel for the LatAm distributor list. [^v-cargill-promote-2026]"
        ),
    ),
    "del-kemin-clostat": dict(
        region="Global",
        citationCount=6,
        hashtags=["#poultry", "#probiotic", "#NE"],
        body=(
            "CLOSTAT (Bacillus subtilis) reduces necrotic enteritis incidence by "
            "41% and improves bird uniformity by 2.8pp across 8 university "
            "trials. The trade-mag submission walks through the meta-analysis "
            "and the on-farm protocol nutritionists can deploy in week one. "
            "[^v-kemin-clostat-2026]"
        ),
    ),
}

def js_string(s: str) -> str:
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'

def js_arr(xs):
    return "[" + ", ".join(js_string(x) for x in xs) + "]"

def patch_entry(text: str, key: str, fields: dict) -> str:
    pattern = re.compile(
        r'(\{\s*\n\s*id:\s*"' + re.escape(key) + r'",[^}]*?studio:\s*"[^"]+",)\s*\n\s*\}',
        re.DOTALL,
    )
    extra_lines = [
        f'    region: {js_string(fields["region"])},',
        f'    citationCount: {fields["citationCount"]},',
        f'    hashtags: {js_arr(fields["hashtags"])},',
        f'    body:\n      {js_string(fields["body"])},',
    ]
    repl = r"\1\n" + "\n".join(extra_lines) + "\n  }"
    new = pattern.sub(repl, text, count=1)
    if new == text:
        raise SystemExit(f"failed to patch {key}")
    return new

out = src
for k, fields in bodies.items():
    out = patch_entry(out, k, fields)

P.write_text(out)
print("patched", len(bodies), "entries")
