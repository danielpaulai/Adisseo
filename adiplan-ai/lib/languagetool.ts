/**
 * LanguageTool wrapper — multi-language grammar / spelling check for the
 * outputs we ship in EN / ZH / VI / TH / JA / ID.
 *
 * Public API: https://api.languagetool.org/v2/check  (rate-limited; for prod
 * we self-host with the LT docker image).
 *
 * The wrapper:
 *   - calls the LT API with the right language code
 *   - filters out the noisy default rules we don't care about
 *     (uppercase sentence start, double-space, punctuation before quote)
 *   - returns a normalised list of issues + a 0–1 grammar compliance ratio
 *
 * If the call fails or LT_DISABLE=1 in env, we return an empty (clean) report
 * so the demo never breaks.
 */

export type LtLanguage = "en" | "zh" | "vi" | "th" | "ja" | "id";

/** Map our short codes to LT codes. */
const LT_CODE: Record<LtLanguage, string> = {
  en: "en-US",
  zh: "zh-CN",
  vi: "vi-VN",
  th: "th-TH",
  ja: "ja-JP",
  id: "id-ID",
};

const NOISE_RULES = new Set([
  "UPPERCASE_SENTENCE_START",
  "WHITESPACE_RULE",
  "EN_QUOTES",
  "DOUBLE_PUNCTUATION",
  "MORFOLOGIK_RULE_EN_US", // many false positives on industry jargon
]);

export interface LtIssue {
  message: string;
  shortMessage?: string;
  ruleId: string;
  category: string;
  offset: number;
  length: number;
  context: string;
  replacements: string[];
  severity: "low" | "medium" | "high";
}

export interface LtReport {
  language: LtLanguage;
  enabled: boolean;
  /** 0–1; 1.0 = clean. */
  compliance: number;
  /** Total issues found before filtering. */
  rawCount: number;
  issues: LtIssue[];
}

const LT_ENDPOINT =
  process.env.LT_ENDPOINT ?? "https://api.languagetool.org/v2/check";

export async function checkGrammar(
  text: string,
  language: LtLanguage = "en"
): Promise<LtReport> {
  const cleanText = text.trim();
  if (!cleanText || cleanText.split(/\s+/).length < 3 || process.env.LT_DISABLE === "1") {
    return { language, enabled: false, compliance: 1, rawCount: 0, issues: [] };
  }

  const body = new URLSearchParams();
  body.set("text", cleanText.slice(0, 18000));
  body.set("language", LT_CODE[language] ?? "en-US");
  body.set("enabledOnly", "false");

  try {
    const res = await fetch(LT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      // 6s timeout via AbortController
      signal: AbortSignal.timeout(6_000),
    });
    if (!res.ok) {
      return { language, enabled: false, compliance: 1, rawCount: 0, issues: [] };
    }
    const json = (await res.json()) as {
      matches: Array<{
        message: string;
        shortMessage?: string;
        rule: { id: string; category: { id: string } };
        offset: number;
        length: number;
        context: { text: string; offset: number; length: number };
        replacements: Array<{ value: string }>;
      }>;
    };

    const raw = json.matches ?? [];
    const issues: LtIssue[] = raw
      .filter((m) => !NOISE_RULES.has(m.rule.id))
      .slice(0, 30)
      .map((m) => ({
        message: m.message,
        shortMessage: m.shortMessage,
        ruleId: m.rule.id,
        category: m.rule.category.id,
        offset: m.offset,
        length: m.length,
        context: m.context.text,
        replacements: (m.replacements ?? []).slice(0, 4).map((r) => r.value),
        severity:
          m.rule.category.id === "TYPOS"
            ? "high"
            : m.rule.category.id === "GRAMMAR"
              ? "medium"
              : "low",
      }));

    const wordCount = cleanText.split(/\s+/).length;
    const issuesPer1000 = (issues.length / Math.max(1, wordCount)) * 1000;
    // Tolerance: 5 issues per 1000 words = 0.5 compliance, 0 issues = 1.0.
    const compliance = Math.max(0, Math.min(1, 1 - issuesPer1000 / 10));

    return {
      language,
      enabled: true,
      compliance: Math.round(compliance * 100) / 100,
      rawCount: raw.length,
      issues,
    };
  } catch {
    return { language, enabled: false, compliance: 1, rawCount: 0, issues: [] };
  }
}
