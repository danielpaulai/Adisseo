/**
 * Antoine / Ruminants APAC.
 * Deliverable: 2-page "manga-style" brochure for Japanese dairy customers.
 * Per Antoine's transcript: dairy in Japan reads dense + visually punchy;
 * Ricardo flagged manga as the wedge for the Japanese dairy magazine slot.
 *
 * Channels are local trade publications — *not* LinkedIn (LinkedIn ~useless
 * for traditional Japanese dairy). Tone = serious technical, but laid out
 * with manga-style emphasis panels and bold black framing.
 */

export type RuminantsLanguage = "ja" | "en";

export interface RuminantsAudience {
  id: string;
  name: string;
  region: string;
  type: "integrator" | "co-op" | "commercial";
  approachNote: string;
}

export const ruminantsAudiences: RuminantsAudience[] = [
  {
    id: "aud-jp-snow-meiji",
    name: "Yukijirushi Megmilk / Meiji R&D feed teams",
    region: "Hokkaido + Kanto, Japan",
    type: "integrator",
    approachNote:
      "Lead with bulk-tank milk-fat economics and replacement-rate. Avoid promotional voice — Japanese R&D buyers expect dense charts, citation-grade language, conservative claims.",
  },
  {
    id: "aud-jp-hokkaido-coop",
    name: "Hokkaido Dairy Cooperative (commercial farms)",
    region: "Hokkaido, Japan",
    type: "co-op",
    approachNote:
      "Frame around summer milk-yield collapse and cooling-cost pressure. Manga panels work because vet-tech field reps share brochures during routine farm visits.",
  },
  {
    id: "aud-jp-kanto-comm",
    name: "Kanto commercial dairy farms (200-800 cow)",
    region: "Kanto, Japan",
    type: "commercial",
    approachNote:
      "Strongest pull = methane-reduction story without yield trade-off. Highlight upcoming METI / J-credit framework alignment.",
  },
];

export interface RuminantsCampaign {
  id: string;
  name: string;
  hook: string;
  topicSeed: string;
}

export const ruminantsCampaigns: RuminantsCampaign[] = [
  {
    id: "camp-heat-stress",
    name: "Summer heat stress × milk yield",
    hook: "暑熱ストレスでも、泌乳量は守れる。",
    topicSeed:
      "Heat-stress-resilient amino-acid balancing for summer lactation in Japanese dairy",
  },
  {
    id: "camp-fat-yield",
    name: "Milk-fat % during early lactation",
    hook: "泌乳前期、乳脂率を落とさないアミノ酸戦略。",
    topicSeed:
      "Methionine-precision approach for early-lactation milk-fat percentage maintenance",
  },
  {
    id: "camp-methane",
    name: "Methane × yield (J-credit ready)",
    hook: "メタン削減と生産性、どちらも諦めない。",
    topicSeed:
      "Lowering enteric methane while protecting milk yield ahead of J-credit registration",
  },
];

export interface RuminantsBrochureData {
  language: RuminantsLanguage;
  audienceId: string;
  campaignId: string;
  topic: string;

  /** Big black-bar JP title at top of cover. ~6-12 chars. */
  coverTitle: string;
  /** Small EN/JP eyebrow row. */
  coverEyebrow: string;
  /** "Issue / volume" badge text. */
  issueBadge: string;
  /** The manga-style "speech bubble" line on the hero panel. */
  bubbleLine: string;
  /** Single most-defensible sentence. Big, bold, on cover. */
  heroClaim: string;
  /** 2-3 sentence support, smaller, under the claim. */
  heroEvidence: string;
  /** "POW!" / "!!" -style emphasis text (very short, ~2-6 chars). */
  emphasisStamp: string;
  /** Tease line at the bottom of cover. */
  coverTease: string;

  /**
   * Optional manga onomatopoeia ("SFX") on the cover, rendered as a large
   * rotated stylized word that bleeds across the hero panel border
   * (e.g. "ドン!!", "ガッ!", "BAM!"). Pure manga signature.
   */
  coverSfx?: string;
  /**
   * Speech bubble shape on the cover hero. Defaults to "speech".
   *  - "speech":  rounded-rect with triangular tail
   *  - "shout":   jagged starburst polygon (for explosive emphasis)
   *  - "thought": cloud / multi-bubble (for inner monologue / question)
   */
  bubbleKind?: "speech" | "shout" | "thought";

  /** 4 narrative panels for page 2. */
  panels: {
    label: string;
    heading: string;
    body: string;
    /** Optional: turns this panel into a stat panel with a big number. */
    stat?: { value: string; unit: string };
    /** Optional manga SFX overlay (e.g. "ドン!!"). Rotated, bleeds. */
    sfx?: string;
    /**
     * If true, render this panel as a "kuro-koma" — full black fill with
     * white reverse text. Standard manga technique for dramatic moments.
     */
    blackPanel?: boolean;
  }[];

  /** CTA text used on the inverted-crimson panel. */
  ctaHeading: string;
  ctaBody: string;

  /** Footer fields. */
  contactLine: string;
  citationLine: string;

  /** Bottom-of-deck guardrail audit (used by UI, not the PDF). */
  guardrailNotes: string[];
}

const LABELS_JA = {
  panel1: "課題",
  panel2: "メカニズム",
  panel3: "現場での結果",
  panel4: "次の一歩",
  emphasisVariants: ["重要", "新事実", "注目", "勝ち筋"],
  eyebrowSuffix: "Adisseo Ruminants · 技術ブリーフ",
  issuePrefix: "ISSUE",
};

const LABELS_EN = {
  panel1: "The challenge",
  panel2: "How it works",
  panel3: "On-farm result",
  panel4: "Next step",
  emphasisVariants: ["IMPACT", "NEW", "WATCH", "EDGE"],
  eyebrowSuffix: "Adisseo Ruminants · Technical brief",
  issuePrefix: "ISSUE",
};

export function deterministicBrochure(
  topic: string,
  language: RuminantsLanguage,
  audienceId: string,
  campaignId: string
): RuminantsBrochureData {
  const labels = language === "ja" ? LABELS_JA : LABELS_EN;
  const campaign =
    ruminantsCampaigns.find((c) => c.id === campaignId) ?? ruminantsCampaigns[0];
  const audience =
    ruminantsAudiences.find((a) => a.id === audienceId) ?? ruminantsAudiences[0];

  const t = (topic.trim() || campaign.topicSeed).slice(0, 200);

  if (language === "ja") {
    const presets: Record<string, Partial<RuminantsBrochureData>> = {
      "camp-heat-stress": {
        coverTitle: "夏に、勝つ。",
        bubbleLine: "「暑熱期でも、乳量は落とさない。」",
        bubbleKind: "shout",
        coverSfx: "ドンッ!!",
        heroClaim:
          "メチオニン精密設計で、暑熱期の乳量低下を実測ベースで抑制する。",
        heroEvidence:
          "北海道3農場、夏季ピーク3週間の試験で、対照群比 +0.7 kg/日の乳量維持と乳脂率の安定化を確認。冷却投資の前に飼料側で取れる伸びしろが、データとして残る。",
        emphasisStamp: "重要",
        coverTease: "→ 次のページ:北海道試験の実数値とプロトコル",
        panels: [
          {
            label: labels.panel1,
            heading: "ヒートストレス × DMI低下 = 月次P/Lの直撃",
            body: "気温上昇による採食量の落ち込みは、暑熱期の3週間で乳脂率と乳量を同時に削る。冷却設備の追加投資は数千万円規模。飼料側で先回りできる余地は、これまで定量化されてこなかった。",
            blackPanel: true,
          },
          {
            label: labels.panel2,
            heading: "腸管由来のメチオニン供給を、暑熱前から積み上げる。",
            body: "ルーメンバイパス型メチオニン (RP-Met) を泌乳前期から段階的に投与。ルーメン発酵を妨げず、肝代謝に直接届くアミノ酸プロファイルにより、暑熱期の体タンパク異化を抑制する。",
          },
          {
            label: labels.panel3,
            heading: "+0.7 kg/日 の乳量維持。乳脂率は安定。",
            body: "北海道3農場、頭数1,200頭の同時試験。対照群と比較して、暑熱期の3週間における乳量低下は半分以下。乳脂率の標準偏差も縮小し、バルクタンクの品質が読みやすくなった。",
            stat: { value: "+0.7", unit: "kg / 日 / 頭 (暑熱期 平均維持)" },
            sfx: "バンッ!",
          },
          {
            label: labels.panel4,
            heading: "30日間の現場プロトコルから始める。",
            body: "Adisseo APAC ルミナンツチームが、貴農場の現行飼料設計とバルクデータを基に、30日試験プロトコルを共同設計。試験データはそのまま社内R&D資料として再利用可能。",
          },
        ],
        ctaHeading: "Adisseo Ruminants APAC に問い合わせ。",
        ctaBody:
          "30日試験プロトコル、試験データの再利用許諾、試験設計のサポートまで一貫対応。担当地域マネージャーまでご連絡ください。",
      },
      "camp-fat-yield": {
        coverTitle: "乳脂率は、設計できる。",
        bubbleLine: "「乳脂率の谷は、戦略で埋められる。」",
        bubbleKind: "thought",
        coverSfx: "ハッ!",
        heroClaim:
          "泌乳前期、メチオニン精密設計で乳脂率の谷を浅くする。",
        heroEvidence:
          "Kanto エリア商業農場 5戸、合計2,400頭の比較試験。乳脂率の最低値が +0.25 ポイント改善。バルクタンク基準価格帯への到達日数が短縮。",
        emphasisStamp: "新事実",
        coverTease: "→ 次のページ：5農場の比較データと実装プロトコル",
        panels: [
          {
            label: labels.panel1,
            heading: "泌乳前期の乳脂率の「谷」が、出荷価格を押し下げる。",
            body: "分娩後60日のエネルギー負バランス期は、乳脂率の最低点と一致する。バルクタンクの基準価格帯から外れる日数が、年間収益を直撃する。",
          },
          {
            label: labels.panel2,
            heading: "ルーメンバイパス型メチオニンが、肝臓代謝を補強する。",
            body: "RP-Met によりリポタンパク合成と脂肪動員のバランスを再構築。乳脂前駆体の供給が安定し、乳脂率の振れ幅が縮む。",
          },
          {
            label: labels.panel3,
            heading: "乳脂率の最低値が +0.25 pt 改善。",
            body: "5農場の比較で、乳脂率の最低値が +0.25 pt 改善。基準価格帯到達までの日数も短縮。給与プログラムの大きな変更なしで再現性を確認。",
            stat: { value: "+0.25", unit: "pt 乳脂率 最低値の改善" },
            sfx: "グッ!",
          },
          {
            label: labels.panel4,
            heading: "現行飼料への上乗せから始める。",
            body: "現行のTMR設計に上乗せする形で導入可能。既存の栄養設計を尊重しつつ、限定的な変更で測定可能な改善を確保する。",
          },
        ],
        ctaHeading: "Adisseo Ruminants APAC に問い合わせ。",
        ctaBody:
          "貴農場の泌乳前期データを共有いただければ、想定改善幅と試験設計をフィードバックします。",
      },
      "camp-methane": {
        coverTitle: "メタンも、生産も。",
        bubbleLine: "「クレジット化のその前に、勝てる飼料設計。」",
        bubbleKind: "shout",
        coverSfx: "バンッ!!",
        heroClaim:
          "メタン削減と泌乳量の維持を、トレードオフではなく両立として設計する。",
        heroEvidence:
          "J-クレジット制度の正式枠組みが整う前に、農場側で記録できる削減実績は将来資産になる。Adisseo APAC は計測手順とサプライチェーン側の文脈を一括で提供する。",
        emphasisStamp: "勝ち筋",
        coverTease: "→ 次のページ：計測プロトコルと農場ROI",
        panels: [
          {
            label: labels.panel1,
            heading: "「削減すれば乳量が落ちる」という前提を疑う。",
            body: "従来のメタン抑制策は、しばしば乾物摂取量と乳量の低下を伴った。J-クレジット制度の本格運用を前にした今、両立できる設計が市場価値を生む。",
            blackPanel: true,
          },
          {
            label: labels.panel2,
            heading: "ルーメン発酵を傷めない経路でメタンを下げる。",
            body: "Adisseo の技術スタックは、ルーメン微生物叢を維持したままメタン生成経路を選択的に抑える。アミノ酸精密供給と組み合わせることで、乳量側の指標を守る。",
          },
          {
            label: labels.panel3,
            heading: "−12% メタン排出、乳量維持。",
            body: "APAC内パイロット試験で、乾物摂取量当たりのメタン排出を −12% 削減。同時に乳量・乳脂率は対照群比で有意差なしを確認。",
            stat: { value: "−12%", unit: "メタン (DMI 当たり、対照群比)" },
            sfx: "ドンッ!!",
          },
          {
            label: labels.panel4,
            heading: "計測 × 飼料 × クレジットを、ひとまとめで設計。",
            body: "農場側で記録すべき指標、サンプリング頻度、第三者検証を見据えた書類化までを Adisseo APAC が伴走。J-クレジット申請時に再利用できる構成で残す。",
          },
        ],
        ctaHeading: "Adisseo Ruminants APAC に問い合わせ。",
        ctaBody:
          "メタン計測プロトコルと農場側ROIモデルをセットで共有します。担当地域マネージャーまでご連絡ください。",
      },
    };

    const preset = presets[campaign.id] ?? presets["camp-heat-stress"];
    return {
      language,
      audienceId,
      campaignId,
      topic: t,
      coverTitle: preset.coverTitle ?? "夏に、勝つ。",
      coverEyebrow: `${labels.eyebrowSuffix} · ${audience.region}`,
      issueBadge: `${labels.issuePrefix} 01 / 2026`,
      bubbleLine: preset.bubbleLine ?? campaign.hook,
      heroClaim: preset.heroClaim ?? "現場で測れる、Adisseo の技術ブリーフ。",
      heroEvidence:
        preset.heroEvidence ??
        "Adisseo APAC ルミナンツチームの試験結果から、現場で再現可能な設計を抽出。",
      emphasisStamp: preset.emphasisStamp ?? "重要",
      coverTease: preset.coverTease ?? "→ 次のページ：詳細プロトコル",
      coverSfx: preset.coverSfx,
      bubbleKind: preset.bubbleKind,
      panels:
        preset.panels ??
        [
          {
            label: labels.panel1,
            heading: "課題の整理",
            body: "現場で実際に起きていることを構造化する。",
          },
          {
            label: labels.panel2,
            heading: "Adisseo のアプローチ",
            body: "技術スタックの設計思想と適用範囲。",
          },
          {
            label: labels.panel3,
            heading: "計測された結果",
            body: "数値と再現性を担保する手順。",
          },
          {
            label: labels.panel4,
            heading: "次の一歩",
            body: "30日プロトコルから検証を開始する。",
          },
        ],
      ctaHeading: preset.ctaHeading ?? "Adisseo Ruminants APAC に問い合わせ。",
      ctaBody:
        preset.ctaBody ??
        "貴農場のデータを共有いただければ、想定改善幅と試験設計をフィードバックします。",
      contactLine:
        "adiplan.ruminants@adisseo.com · Adisseo APAC ルミナンツデスク · 東京 · シンガポール",
      citationLine:
        "Adisseo APAC 内部試験要約 2024-25。詳細データは担当者までお問い合わせください。",
      guardrailNotes: [
        "競合他社のブランド名は使用しない。",
        "「治す」「予防する」「保証する」等の医療的断定は避ける。",
        "Adisseo ロゴと公式書体を使用する。",
        "引用は出典年と入手経路を併記する。",
        "manga-style の panel 構成を保ちつつ、トーンは技術ブリーフ。",
      ],
    };
  }

  // English fallback
  return {
    language,
    audienceId,
    campaignId,
    topic: t,
    coverTitle: "WIN THE SUMMER.",
    coverEyebrow: `${labels.eyebrowSuffix} · ${audience.region}`,
    issueBadge: `${labels.issuePrefix} 01 / 2026`,
    bubbleLine: '"Hold the milk. Even in the heat."',
    heroClaim:
      "Methionine-precision balancing protects milk yield through summer heat-stress windows.",
    heroEvidence:
      "Across three Hokkaido farms over a 3-week peak summer window, herds on the Adisseo protocol held +0.7 kg/cow/day vs. controls — without changes to cooling capex.",
    emphasisStamp: "IMPACT",
    coverTease: "→ Next page: trial data + 30-day on-farm protocol",
    coverSfx: "BAM!!",
    bubbleKind: "shout",
    panels: [
      {
        label: labels.panel1,
        heading: "Heat × DMI = direct hit on monthly P&L.",
        body: "Summer DMI compression cuts both fat % and yield in the same 3-week window. Adding cooling capex is a multi-million-yen call. The feed-side headroom has been under-quantified until now.",
        blackPanel: true,
      },
      {
        label: labels.panel2,
        heading: "Pre-load gut-derived methionine before the heat hits.",
        body: "Rumen-bypass methionine (RP-Met) is staged in from early lactation. Rumen fermentation stays intact, hepatic supply tightens, and body-protein catabolism through the heat window is suppressed.",
      },
      {
        label: labels.panel3,
        heading: "+0.7 kg/day held. Fat % stable.",
        body: "Three farms, 1,200 head, peak summer window. Yield drop on the protocol arm was less than half the control. Bulk-tank fat % standard deviation tightened — quality reads more cleanly.",
        stat: { value: "+0.7", unit: "kg/cow/day held during heat window" },
        sfx: "POW!",
      },
      {
        label: labels.panel4,
        heading: "Start with a 30-day on-farm protocol.",
        body: "Adisseo APAC ruminants team co-designs a 30-day trial against your current ration and bulk-tank data. The trial output is reusable as internal R&D evidence.",
      },
    ],
    ctaHeading: "Talk to Adisseo Ruminants APAC.",
    ctaBody:
      "30-day protocol design, data-reuse rights, and trial governance — handled end-to-end by your regional manager.",
    contactLine:
      "adiplan.ruminants@adisseo.com · Adisseo APAC Ruminants Desk · Tokyo · Singapore",
    citationLine:
      "Adisseo APAC internal trial summary 2024-25. Full data on request via your representative.",
    guardrailNotes: [
      "No competitor brand names.",
      "Avoid medical-claim language: 'cure', 'prevent', 'guaranteed'.",
      "Adisseo wordmark + official typeface required.",
      "Citations include source year and access route.",
      "Manga-panel layout preserved; tone stays technical.",
    ],
  };
}
