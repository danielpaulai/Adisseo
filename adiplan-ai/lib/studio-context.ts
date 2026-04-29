"use client";

/**
 * Cross-module hand-off helpers.
 *
 * Once an article has been matched in the News Bridge, we want the chosen
 * Studio (Aqua / Poultry / Ruminants / Swine) to *open with everything
 * pre-filled* — the topic, the campaign, the audience, the language. That's
 * the demo's killer move: News → Strategy → Deliverable in three clicks.
 *
 * These helpers live client-side because they read scraped article tags +
 * match output (both already in the persisted Zustand store).
 */

import type { ScrapedArticle } from "@/lib/scraper-api";
import type { MatchedArticle } from "@/lib/store";

export interface StudioContextHints {
  topic: string;
  /** Aqua */
  aquaLanguage?: "en" | "id" | "vi" | "th";
  aquaMagazineId?: string;
  /** Poultry */
  poultryCampaignId?: string;
  poultryAudienceId?: string;
  /** Ruminants */
  ruminantsLanguage?: "ja" | "en";
  ruminantsCampaignId?: string;
  ruminantsAudienceId?: string;
  /** Swine */
  swineLanguage?: "en" | "zh" | "vi" | "th" | "id";
  swineAccountId?: string;
}

const has = (a: ScrapedArticle, tag: string) =>
  a.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase())) ||
  a.summary.toLowerCase().includes(tag.toLowerCase()) ||
  a.title.toLowerCase().includes(tag.toLowerCase());

const tagged = (a: ScrapedArticle, ...tags: string[]) =>
  tags.some((t) => has(a, t));

/**
 * Derive sensible defaults for every studio from a matched article.
 * Conservative — when the article doesn't strongly suggest something,
 * we leave the hint undefined and the studio's own defaults apply.
 */
export function deriveStudioContext(
  article: ScrapedArticle,
  match: MatchedArticle | null
): StudioContextHints {
  const region = article.region.toLowerCase();
  const topic = article.title;

  // ===== AQUA =====
  let aquaLanguage: StudioContextHints["aquaLanguage"];
  let aquaMagazineId: string | undefined;
  if (article.species.includes("aqua") || match?.speciesFit?.includes("aqua")) {
    if (article.language === "vi" || tagged(article, "vietnam", "pangasius")) {
      aquaLanguage = "vi";
      aquaMagazineId = "mag-vn-thuysan";
    } else if (article.language === "id" || tagged(article, "indonesia", "java")) {
      aquaLanguage = "id";
      aquaMagazineId = "mag-id-aquaculture";
    } else if (article.language === "th" || tagged(article, "thailand", "bangkok")) {
      aquaLanguage = "th";
      aquaMagazineId = "mag-th-aqua";
    } else {
      aquaLanguage = "en";
      aquaMagazineId = "mag-en-asia";
    }
  }

  // ===== POULTRY =====
  let poultryCampaignId: string | undefined;
  let poultryAudienceId: string | undefined;
  if (
    article.species.includes("poultry") ||
    match?.speciesFit?.includes("poultry")
  ) {
    if (tagged(article, "AGP", "antibiotic", "premixer", "regulatory")) {
      poultryCampaignId = "agp-free-asia";
    } else if (tagged(article, "uniformity", "CV", "broiler", "weight")) {
      poultryCampaignId = "uniformity-ladder";
    } else if (tagged(article, "heat", "summer", "humidity")) {
      poultryCampaignId = "heat-stress-sea";
    } else {
      poultryCampaignId = "agp-free-asia";
    }

    if (tagged(article, "japfa")) {
      poultryAudienceId = "integrator-japfa";
    } else if (tagged(article, "indonesia", "sreeya", "java")) {
      poultryAudienceId = "commercial-id-jabar";
    } else if (tagged(article, "luzon", "philippines")) {
      poultryAudienceId = "commercial-ph-luzon";
    } else if (tagged(article, "vietnam", "charoen pokphand vietnam")) {
      poultryAudienceId = "integrator-charoen-vn";
    } else if (tagged(article, "thailand", "cp foods", "cpf")) {
      poultryAudienceId = "integrator-cp";
    }
  }

  // ===== RUMINANTS =====
  let ruminantsLanguage: StudioContextHints["ruminantsLanguage"];
  let ruminantsCampaignId: string | undefined;
  let ruminantsAudienceId: string | undefined;
  if (
    article.species.includes("ruminants") ||
    match?.speciesFit?.includes("ruminants")
  ) {
    ruminantsLanguage =
      article.language === "ja" || tagged(article, "japan", "hokkaido", "jp", "夏")
        ? "ja"
        : "ja";

    if (tagged(article, "methane", "carbon", "j-credit", "sustainability")) {
      ruminantsCampaignId = "camp-methane";
    } else if (tagged(article, "fat", "lactation", "early")) {
      ruminantsCampaignId = "camp-fat-yield";
    } else if (tagged(article, "heat", "summer", "shimmer")) {
      ruminantsCampaignId = "camp-heat-stress";
    } else {
      ruminantsCampaignId = "camp-heat-stress";
    }

    if (tagged(article, "snow", "yukijirushi", "meiji", "morinaga", "snow-brand")) {
      ruminantsAudienceId = "aud-jp-snow-meiji";
    } else if (tagged(article, "kanto")) {
      ruminantsAudienceId = "aud-jp-kanto-comm";
    } else {
      ruminantsAudienceId = "aud-jp-hokkaido-coop";
    }
  }

  // ===== SWINE =====
  let swineLanguage: StudioContextHints["swineLanguage"];
  let swineAccountId: string | undefined;
  if (article.species.includes("swine") || match?.speciesFit?.includes("swine")) {
    if (article.language === "zh" || tagged(article, "china", "wechat", "chinese")) {
      swineLanguage = "zh";
    } else if (
      article.language === "vi" ||
      tagged(article, "vietnam", "vietnamese")
    ) {
      swineLanguage = "vi";
    } else if (article.language === "th" || tagged(article, "thailand")) {
      swineLanguage = "th";
    } else if (
      article.language === "id" ||
      tagged(article, "indonesia", "indonesian")
    ) {
      swineLanguage = "id";
    } else {
      swineLanguage = "en";
    }

    if (tagged(article, "wechat", "muyuan")) {
      swineAccountId = "acc-muyuan";
    } else if (tagged(article, "new hope", "newhope")) {
      swineAccountId = "acc-newhope";
    } else if (tagged(article, "wens")) {
      swineAccountId = "acc-wens";
    } else if (tagged(article, "china") || article.language === "zh") {
      swineAccountId = "acc-muyuan";
    } else if (tagged(article, "mavin")) {
      swineAccountId = "acc-mavin";
    } else if (tagged(article, "vietnam") || article.language === "vi") {
      swineAccountId = "acc-cp-vn";
    } else if (tagged(article, "thailand", "cp foods", "cpf")) {
      swineAccountId = "acc-cpf-th";
    } else if (tagged(article, "betagro")) {
      swineAccountId = "acc-betagro";
    } else if (tagged(article, "philippines", "luzon", "san miguel")) {
      swineAccountId = "acc-sanmiguel";
    }
  }

  // Region fallback
  if (!swineLanguage && region.includes("china")) swineLanguage = "zh";

  return {
    topic,
    aquaLanguage,
    aquaMagazineId,
    poultryCampaignId,
    poultryAudienceId,
    ruminantsLanguage,
    ruminantsCampaignId,
    ruminantsAudienceId,
    swineLanguage,
    swineAccountId,
  };
}
