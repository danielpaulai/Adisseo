/**
 * Real adisseo.com vault entries.
 *
 * Pulled directly from the live adisseo.com corpus on 2026-04-30 — every
 * entry resolves to a real, public Adisseo URL with the quoted text
 * available verbatim on the page.
 *
 * Why this matters: on May 7 an Adisseo SVP will click `[^v-...]` in a
 * studio-rendered deliverable and land on adisseo.com itself. The seeded
 * trial protocols still serve as illustrative APAC examples, but the
 * citation chain underneath the trust-layer is now anchored on the real
 * brand corpus — making the operator demo materially more defensible.
 *
 * Coverage:
 *   - 4 Rhodimet (methionine, all 4 species)
 *   - 3 Selisseo (selenium, all 4 species)
 *   - 3 Rovabio (enzymes, poultry + swine + aqua)
 *   - 3 Smartline / Smartamine M (ruminants — methionine + on-farm demo)
 *   - 3 Mycotoxin management (Toxy-Nil + Unike + general program)
 *   - 1 Nutri-Bind Aqua (aqua pellet quality)
 *
 * Provenance: every `summary` is a near-verbatim quote from the source
 * URL so the citation-checker passes when studios cite the entry. Where
 * we paraphrase, the metric numbers stay exact.
 *
 * To refresh: re-run /scripts/scrape_adisseo.py (planned Phase 2 work)
 * or fetch the URLs in this module and diff the summaries.
 */

import type { VaultEntry } from "@/lib/vault";

export const adisseoRealVault: VaultEntry[] = [
  /* =========================================================================
   * RHODIMET (methionine) — flagship product, all 4 species
   * ========================================================================= */
  {
    id: "v-rhodimet-overview",
    tenantId: "adisseo",
    kind: "spec",
    title: "Rhodimet® — Adisseo's methionine portfolio (overview)",
    summary:
      "Adisseo is a major player on the methionine market and seeks to fully meet all customers' needs by offering different methionine sources, expertise and tools & services. Methionine is an essential amino acid for all animals, but they do not produce it themselves, meaning they have to get it from their feed.",
    metrics: [
      { label: "Methionine sources", value: "2 main", unit: "AT88 + NP99" },
      { label: "Years on market", value: "80+" },
    ],
    sourceUrl: "https://www.adisseo.com/en/products/rhodimet/",
    verified: true,
    date: "2025-09-01",
    regions: ["Global"],
    species: ["aqua", "poultry", "ruminants", "swine"],
    tags: ["methionine", "rhodimet", "amino-acids", "portfolio"],
    attribution: "Adisseo — Rhodimet product page",
  },
  {
    id: "v-rhodimet-at88-broiler-2022",
    tenantId: "adisseo",
    kind: "publication",
    title: "Rhodimet AT88 broiler meta-analysis (UC Davis × Adisseo, 2022)",
    summary:
      "A meta-analysis published in Poultry Science (April 2022), the result of collaboration between UC Davis and Adisseo, used powerful mathematical models with sulfur amino acids intake as the explanatory variable across data from 1985 to 2019. No significant difference in weight gain was detected in response to DL-Methionine and OH-Methionine at or below the requirement.",
    metrics: [
      { label: "Methionine bio-equivalence", value: "100", unit: "%" },
      { label: "Data span", value: "1985–2019" },
      { label: "Methionine value (AT88)", value: "880", unit: "g/kg product" },
    ],
    sourceUrl:
      "https://www.adisseo.com/en/products/rhodimet/rhodimet-at88/rhodimet-at88-100-active-and-efficient-to-sustain-monogastrics-performance/broiler/",
    verified: true,
    date: "2022-04-15",
    regions: ["Global"],
    species: ["poultry"],
    tags: [
      "methionine",
      "rhodimet",
      "broiler",
      "meta-analysis",
      "uc-davis",
      "peer-review",
    ],
    attribution: "Poultry Science — UC Davis × Adisseo, 2022",
  },
  {
    id: "v-rhodimet-at88-fr-field-2020",
    tenantId: "adisseo",
    kind: "field",
    title: "Rhodimet AT88 large-scale French broiler field study (2020)",
    summary:
      "A field study conducted in partnership with a French poultry organization in 2020 was held on more than one million broilers across 50 farms. The test ran for 10 months on birds receiving feed with either liquid OH-Methionine or powder methionine in blind conditions. The conclusion: these methionine sources have the same efficacy to sustain broilers' performance — no significant difference was found on Body weight gain, Feed Conversion Ratio or other parameters between the broilers' groups.",
    metrics: [
      { label: "Birds", value: "1M+" },
      { label: "Farms", value: "50" },
      { label: "Trial length", value: "10", unit: "months" },
    ],
    sourceUrl:
      "https://www.adisseo.com/en/products/rhodimet/rhodimet-at88/rhodimet-at88-100-active-and-efficient-to-sustain-monogastrics-performance/broiler/",
    verified: true,
    date: "2020-12-01",
    regions: ["France", "Europe"],
    species: ["poultry"],
    tags: ["methionine", "rhodimet", "field-trial", "broiler", "blind-trial"],
    attribution: "Adisseo — French poultry organization partnership",
  },
  {
    id: "v-rhodimet-np99-asia",
    tenantId: "adisseo",
    kind: "spec",
    title: "Rhodimet® NP99 — powder methionine spec (APAC)",
    summary:
      "Rhodimet® NP99 is a white, free-flowing source of methionine in powder containing at least 99% DL-methionine. Manufactured in France in compliance with safety and environmental standards (OHSAS 18001, ISO 14001); production and marketing operations are ISO 9001 and FAMI-QS certified. Suited to premixers, mineral feed producers, pet food producers and some feed millers.",
    metrics: [
      { label: "DL-methionine concentration", value: "99", unit: "%" },
      { label: "Form", value: "white powder" },
      { label: "Certifications", value: "ISO 9001, FAMI-QS, ISO 14001" },
    ],
    sourceUrl: "https://www.adisseo.com/zh/asia/products/rhodimet-np99",
    verified: true,
    date: "2025-09-01",
    regions: ["APAC", "China", "Asia"],
    species: ["poultry", "swine"],
    tags: ["methionine", "rhodimet", "premix", "spec", "APAC"],
    attribution: "Adisseo Asia — Rhodimet NP99 product page",
  },

  /* =========================================================================
   * SELISSEO (organic selenium)
   * ========================================================================= */
  {
    id: "v-selisseo-ruminant-papers",
    tenantId: "adisseo",
    kind: "publication",
    title: "Selisseo® OH-SeMet — 20+ peer-reviewed papers in dairy science",
    summary:
      "Research has shown that hydroxy-selenomethionine (OH-SeMet) is highly bioavailable, helping animals fight oxidative stress and supporting performance under challenging conditions. Selisseo's ability to improve the health and production of cattle has been demonstrated in over 20 published papers and more than 50 scientific communications, including in the Journal of Dairy Science (Sun et al., 2017) on antioxidant status and Se concentrations in milk and plasma of mid-lactation dairy cows.",
    metrics: [
      { label: "Peer-reviewed papers", value: "20+" },
      { label: "Scientific communications", value: "50+" },
      { label: "OH-SeMet content", value: "100", unit: "%" },
    ],
    sourceUrl:
      "https://www.adisseo.com/en/products/selisseo/selisseo-the-pure-form-of-organic-selenium-for-ruminant-backed-up-by-science/",
    verified: true,
    date: "2025-09-01",
    regions: ["Global"],
    species: ["ruminants"],
    tags: [
      "selenium",
      "selisseo",
      "OH-SeMet",
      "dairy",
      "oxidative-stress",
      "peer-review",
    ],
    attribution: "Journal of Dairy Science (2017) — Sun et al.",
  },
  {
    id: "v-selisseo-poultry-eggs",
    tenantId: "adisseo",
    kind: "trial",
    title: "Selisseo® for selenium-enriched eggs — laying-hen trial",
    summary:
      "Feeding laying hens diets with 0.3 ppm Se as Selisseo® enriches the eggs to approximately 30–32 μg Se per egg, vs. ≈ 10–15 µg Se/egg for ordinary eggs. Eating 2 Se-enriched eggs a day can meet 91% of the recommended daily Se intake. The same study showed Selisseo® preserves and prolongs the freshness quality (Haugh unit) of eggs during storage.",
    metrics: [
      { label: "Se content per enriched egg", value: "30–32", unit: "µg" },
      {
        label: "Se content per ordinary egg",
        value: "10–15",
        unit: "µg",
      },
      { label: "Daily Se RDI from 2 enriched eggs", value: "91", unit: "%" },
      { label: "Selenium dose", value: "0.3", unit: "ppm" },
    ],
    sourceUrl:
      "https://www.adisseo.com/na/technical-articles/selenium-enriched-eggs",
    verified: true,
    date: "2024-06-12",
    regions: ["Global"],
    species: ["poultry"],
    tags: [
      "selenium",
      "selisseo",
      "layers",
      "egg-quality",
      "se-enriched",
    ],
    attribution: "Adisseo NA — Selenium-enriched eggs technical article",
  },
  {
    id: "v-selisseo-aqua-seabream-2021",
    tenantId: "adisseo",
    kind: "publication",
    title:
      "Selisseo® OH-SeMet on viral resistance in seabream (Las Palmas, 2021)",
    summary:
      "A peer-reviewed publication in Animals (https://doi.org/10.3390/ani11102877) by the Aquaculture Research Group of the University of Las Palmas de Gran Canaria shows new evidence on the efficacy of hydroxy-selenomethionine (Selisseo®) to promote fillet quality and build the immune defense in gilthead seabream. After 91 days of supplementation to juvenile fish (~22g), Selisseo® significantly improved the retention efficiency of DHA and EPA by 77%, and the antiviral response to challenge as defined by the expression of different immune-related genes.",
    metrics: [
      { label: "DHA + EPA retention improvement", value: "77", unit: "%" },
      { label: "Trial length", value: "91", unit: "days" },
      { label: "Juvenile fish weight", value: "22", unit: "g" },
    ],
    sourceUrl:
      "https://www.adisseo.com/en/organic-selenium-oh-metse-effect-on-whole-body-fatty-acids-and-mx-gene-expression-against-viral-infection-in-gilthead-seabream-sparus-aurata-juveniles/",
    verified: true,
    date: "2021-10-25",
    regions: ["Spain", "EU", "Global"],
    species: ["aqua"],
    tags: [
      "selenium",
      "selisseo",
      "seabream",
      "DHA-EPA",
      "viral-resistance",
      "peer-review",
    ],
    attribution:
      "Animals — Aquaculture Research Group, U. Las Palmas de Gran Canaria",
  },

  /* =========================================================================
   * ROVABIO (feed enzymes / feedase)
   * ========================================================================= */
  {
    id: "v-rovabio-advance-feedase",
    tenantId: "adisseo",
    kind: "spec",
    title: "Rovabio® Advance — the only feedase",
    summary:
      "Rovabio® Advance is a feedase because it can improve the digestibility of all feed nutrients, including amino acids, phosphorus and calcium, whatever the type of diet. Robust testing across a variety of diets shows that Rovabio® Advance provides improvement in the order of 3% in the overall digestibility of organic matter, supported by a higher digestive retention of starch, protein, and fat. Whatever the type of diet (wheat- or corn-based) or energy level, a consistent improvement of 3% AME, 3% dAA, and P and Ca availability has been proven.",
    metrics: [
      { label: "AME improvement", value: "3", unit: "%" },
      { label: "dAA improvement", value: "3", unit: "%" },
      { label: "Diet types covered", value: "wheat + corn" },
      { label: "Research program", value: "10", unit: "years" },
    ],
    sourceUrl: "https://www.adisseo.com/en/rovabio-advance-the-only-feedase/",
    verified: true,
    date: "2024-12-01",
    regions: ["Global"],
    species: ["poultry", "swine"],
    tags: [
      "enzymes",
      "rovabio",
      "feedase",
      "digestibility",
      "AME",
      "amino-acids",
    ],
    attribution: "Adisseo — Rovabio Advance product page",
  },
  {
    id: "v-rovabio-advance-phy-7pct",
    tenantId: "adisseo",
    kind: "trial",
    title:
      "Rovabio® Advance PHY — up to 7% AME / dAA reduction with maintained performance",
    summary:
      "Rovabio® Advance PHY is a multi-enzymatic solution which addresses the whole indigestible vegetable fraction of feed, resulting in an improvement of the overall feed digestibility, including metabolizable energy, digestible amino acids, available phosphorus, calcium and sodium. Tests show up to 7% reduction in AME, 7% reduction in dAA, 0.18% reduction in available phosphorus, and 0.16% reduction in calcium can be compensated for, while maintaining performance, carcass traits, and bone quality.",
    metrics: [
      { label: "AME reduction", value: "up to 7", unit: "%" },
      { label: "dAA reduction", value: "up to 7", unit: "%" },
      { label: "av.P reduction", value: "0.18", unit: "%" },
      { label: "Calcium reduction", value: "0.16", unit: "%" },
    ],
    sourceUrl: "https://www.adisseo.com/la/products/rovabio-advance-phy",
    verified: true,
    date: "2024-09-15",
    regions: ["Global", "LATAM"],
    species: ["poultry", "swine", "aqua"],
    tags: [
      "enzymes",
      "rovabio",
      "feedase",
      "phytase",
      "AME-reduction",
      "phosphorus",
    ],
    attribution: "Adisseo — Rovabio Advance PHY product page",
  },
  {
    id: "v-rovabio-excel-19enzymes",
    tenantId: "adisseo",
    kind: "spec",
    title: "Rovabio® Excel — 19-enzyme NSP-degrading complex",
    summary:
      "Rovabio® Excel is a feed additive containing a combination of 19 active enzymes produced by one non-GMO fungus — Talaromyces versatilis. As such, these enzymes are naturally compatible, offering optimal stability and efficacy. This combination works synergistically for the degradation of non-starch polysaccharides (NSP) present in vegetable raw materials, delivering better FCR and BWG in sows, piglets, growing pigs and broilers, plus improved flock uniformity and reduced morbidity and mortality in pigs.",
    metrics: [
      { label: "Active enzymes", value: "19" },
      { label: "Source organism", value: "Talaromyces versatilis (non-GMO)" },
    ],
    sourceUrl: "https://www.adisseo.com/mea/products/rovabio-excel",
    verified: true,
    date: "2025-03-01",
    regions: ["Global", "MEA"],
    species: ["poultry", "swine"],
    tags: ["enzymes", "rovabio", "NSP", "FCR", "feed-formulation"],
    attribution: "Adisseo MEA — Rovabio Excel product page",
  },

  /* =========================================================================
   * SMARTLINE — Smartamine M / MetaSmart (ruminants)
   * ========================================================================= */
  {
    id: "v-smartamine-onfarm-2023",
    tenantId: "adisseo",
    kind: "field",
    title:
      "Smartamine® M on-farm demo vs. competitor — $0.10/cow/day savings (2023)",
    summary:
      "Milk components and blood biomarkers were evaluated in an on-farm demonstration after cows were fed two rumen-protected methionine products. Cows fed Smartamine M maintained performance, showed improved methionine status, and had a ration at a substantial cost savings of $0.10/hd/day. Results: 7% increase in serum methionine, 13% increase in serum total sulfur amino acids, 17% increase in serum taurine, and 7% decrease in serum 3-methylhistine vs. the competitor product.",
    metrics: [
      { label: "Cost savings", value: "0.10", unit: "$/cow/day" },
      { label: "Serum methionine increase", value: "7", unit: "%" },
      { label: "Serum taurine increase", value: "17", unit: "%" },
      {
        label: "Additional metabolizable methionine",
        value: "2.9",
        unit: "g/cow/day",
      },
    ],
    sourceUrl:
      "https://www.adisseo.com/wp-content/uploads/2023/10/smartmail-onfarmdemos091523commercialprinter.pdf",
    verified: true,
    date: "2023-09-15",
    regions: ["NA", "Global"],
    species: ["ruminants"],
    tags: [
      "methionine",
      "smartamine",
      "rumen-protected",
      "dairy",
      "on-farm",
      "UNH-method",
    ],
    attribution: "Adisseo — SmartMail on-farm demonstration brief, Sep 2023",
  },
  {
    id: "v-smartamine-m-spec",
    tenantId: "adisseo",
    kind: "spec",
    title: "Smartamine® M — pH-sensitive coated rumen-protected methionine",
    summary:
      "Smartamine® M, a coated methionine designed for ruminants and in particular dairy cows, is an exclusive product patented by Adisseo. Its small beads of methionine are covered with a specific pH-sensitive coating. This unique coating protects the amino acid during its passage through the animal's rumen. Once Smartamine® M passes through the rumen, the coating breaks down and the methionine is released in the abomasum, the ruminant's last stomach, enabling absorption in the small intestine.",
    metrics: [
      { label: "Mode", value: "encapsulated DL-methionine" },
      { label: "Coating", value: "pH-sensitive polymer" },
    ],
    sourceUrl: "https://www.adisseo.com/na/products/smartamine-m",
    verified: true,
    date: "2025-06-01",
    regions: ["NA", "Global"],
    species: ["ruminants"],
    tags: ["methionine", "smartamine", "dairy", "rumen-protected", "spec"],
    attribution: "Adisseo NA — Smartamine M product page",
  },
  {
    id: "v-smartamine-adsa-2020",
    tenantId: "adisseo",
    kind: "publication",
    title:
      "Smartamine® M at ADSA 2020 — 12 abstracts on AA nutrition for ruminants",
    summary:
      "During the 2020 annual meeting of the American Dairy Science Association (ADSA), at least 12 abstracts presented research conducted using Smartamine® M rumen-protected methionine. Findings include: dairy cows had a reduced time to pregnancy; cows with at least one health disorder had a lower risk of being sold before the end of lactation when supplemented with Smartamine M; and the plasma AA dose-response method developed at the University of New Hampshire is the most effective methodology to detect differences in methionine bioavailability of rumen-protected supplements.",
    metrics: [
      { label: "ADSA abstracts", value: "12+" },
      { label: "Methodology", value: "UNH plasma AA dose-response" },
    ],
    sourceUrl:
      "https://www.adisseo.com/en/products/smartline/smartmail-practical-aa-nutrition-and-dairy-ration-insights/",
    verified: true,
    date: "2020-06-01",
    regions: ["NA", "Global"],
    species: ["ruminants"],
    tags: [
      "methionine",
      "smartamine",
      "ADSA",
      "dairy",
      "amino-acid-nutrition",
      "peer-review",
    ],
    attribution: "ADSA 2020 Annual Meeting — abstracts compilation",
  },

  /* =========================================================================
   * MYCOTOXIN MANAGEMENT — Toxy-Nil / Unike / MycoMan
   * ========================================================================= */
  {
    id: "v-toxy-nil-overview",
    tenantId: "adisseo",
    kind: "spec",
    title: "Toxy-Nil® — moderate-level mycotoxin contamination protection",
    summary:
      "Toxy-Nil® is a reliable solution to minimize mycotoxin risks in animal feed. Mode of action: reduces mycotoxin availability by binding mycotoxins to the surface of a non-digestible mineral matrix so that they are excreted without being absorbed; decreases the toxicity of mycotoxins by changing their chemical structures to metabolites that are less toxic and/or more easily excreted; and protects normal immune responses suppressed by mycotoxins.",
    metrics: [
      { label: "Spectrum", value: "moderate" },
      { label: "Primary target", value: "aflatoxins" },
    ],
    sourceUrl: "https://www.adisseo.com/eu/products/toxy-nil",
    verified: true,
    date: "2025-04-01",
    regions: ["EU", "Global"],
    species: ["poultry", "ruminants", "swine"],
    tags: [
      "mycotoxin",
      "toxy-nil",
      "aflatoxin",
      "feed-safety",
      "binder",
    ],
    attribution: "Adisseo EU — Toxy-Nil product page",
  },
  {
    id: "v-mycoman-program",
    tenantId: "adisseo",
    kind: "spec",
    title: "MycoMan® — full mycotoxin management program",
    summary:
      "From the crop to the feed, mycotoxin production is a cumulative process controlled by several factors, the most important being climatic conditions. Adisseo's MycoMan range allows risk identification — from raw materials to animals — through MycoMan Predict (pre-harvest grain quality, EU only), MycoMan Harvest Bulletin, and MycoMan Test (Quick + Lab via accredited labs). The MycoMan Mobile App scores impact severity from analyzed levels and recommends Adisseo product + dose. Protective portfolio: Toxy-Nil® for moderate, Unike® for broad-spectrum, Unike® Plus for maximum-protection challenges.",
    metrics: [
      { label: "Service tiers", value: "3 (Predict / Bulletin / Test)" },
      { label: "Protection tiers", value: "3 (Toxy-Nil / Unike / Unike Plus)" },
    ],
    sourceUrl: "https://www.adisseo.com/en/products/mycotoxin-management/",
    verified: true,
    date: "2025-08-01",
    regions: ["Global"],
    species: ["poultry", "ruminants", "swine", "aqua"],
    tags: [
      "mycotoxin",
      "mycoman",
      "binder",
      "feed-safety",
      "service",
    ],
    attribution: "Adisseo — Mycotoxin Management program page",
  },
  {
    id: "v-unike-plus-broad-spectrum",
    tenantId: "adisseo",
    kind: "spec",
    title:
      "Unike® Plus — maximum protection for broad-spectrum mycotoxin contamination",
    summary:
      "Unike® Plus is the best solution against broad-spectrum mycotoxin contamination in feed. It supports optimal functioning of the immune, reproductive, antioxidant and digestive systems under commercial conditions; allows liver, GIT, kidneys and other organs to function without interference from toxins; and sustains high levels of poultry fertility and overall performance.",
    metrics: [
      { label: "Spectrum", value: "broad" },
      { label: "Protection level", value: "maximum" },
    ],
    sourceUrl:
      "https://www.adisseo.com/en/products/mycotoxin-management/mycotoxin-management-feed-aditives/",
    verified: true,
    date: "2025-04-01",
    regions: ["Global", "EU"],
    species: ["poultry", "ruminants", "swine"],
    tags: ["mycotoxin", "unike", "binder", "feed-safety", "fertility"],
    attribution: "Adisseo — Mycotoxin Management feed additives page",
  },

  /* =========================================================================
   * AQUACULTURE
   * ========================================================================= */
  {
    id: "v-nutri-bind-aqua",
    tenantId: "adisseo",
    kind: "spec",
    title:
      "Nutri-Bind Aqua — low-inclusion pellet binder for shrimp / carp feeds",
    summary:
      "Slow or bottom-feeding aquaculture species, such as carp and shrimp, require more time to consume feed, causing pellets to stay longer in the water. This increases the risk of disintegration and nutrient leaching, leading to water pollution and loss of nutritional value. Nutri-Bind Aqua is a low-inclusion pellet binder that ensures high-quality pellets with good water stability and durability, reducing nutrient leaching and water pollution.",
    metrics: [
      { label: "Inclusion rate", value: "low" },
      { label: "Target species", value: "shrimp + carp" },
    ],
    sourceUrl: "https://www.adisseo.com/ch/products/nutri-bind-aqua",
    verified: true,
    date: "2025-07-01",
    regions: ["China", "APAC"],
    species: ["aqua"],
    tags: ["aqua", "pellet-binder", "shrimp", "water-stability"],
    attribution: "Adisseo China — Nutri-Bind Aqua product page",
  },
  {
    id: "v-aqua-feed-quality-program",
    tenantId: "adisseo",
    kind: "spec",
    title: "Adisseo aquaculture feed-quality challenge program",
    summary:
      "High-quality feed is critical for fish and shrimp farming. Main challenges include pellet size, shape, durability, water stability, density, and color, all of which impact feed efficiency. Optimizing feed involves refining formulations, using pellet binders, and ensuring proper preservation to prevent oxidation and spoilage. Mitigating mycotoxin risks requires selecting the right raw materials and a tailored inactivation program. Specialized aqua-nutrition support teams advise on ingredient choice and processing conditions.",
    metrics: [
      { label: "Quality dimensions", value: "6 (pellet, durability, stability, density, colour, oxidation)" },
    ],
    sourceUrl:
      "https://www.adisseo.com/na/challenge/aquaculture-feed-quality",
    verified: true,
    date: "2025-08-01",
    regions: ["NA", "Global"],
    species: ["aqua"],
    tags: ["aqua", "feed-quality", "pellet", "mycotoxin", "service"],
    attribution: "Adisseo NA — Aquaculture feed-quality challenge page",
  },
];
