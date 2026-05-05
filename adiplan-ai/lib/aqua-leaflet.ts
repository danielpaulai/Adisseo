/**
 * Aqua-EPAC magazine targets.
 * Aileen explicitly named local-language aqua magazines as the channel
 * (LinkedIn is "useless for Aqua" per her transcript).
 */

export type AquaLanguage = "en" | "id" | "vi" | "th";

export interface AquaMagazine {
  id: string;
  name: string;
  country: string;
  language: AquaLanguage;
  audience: string;
  notes: string;
}

export const aquaMagazines: AquaMagazine[] = [
  {
    id: "mag-id-aquaculture",
    name: "Trobos Aqua",
    country: "Indonesia",
    language: "id",
    audience: "Pangasius / shrimp farmers + feed mill technologists",
    notes: "Largest ID aqua trade publication. Use 'park' register, technical but warm.",
  },
  {
    id: "mag-vn-thuysan",
    name: "Tap Chi Thuy San",
    country: "Vietnam",
    language: "vi",
    audience: "Shrimp / pangasius integrators in Mekong Delta",
    notes: "Direct, results-led; expect FCR + survival numbers.",
  },
  {
    id: "mag-th-aqua",
    name: "Aquaculture Asia Magazine (Thai edition)",
    country: "Thailand",
    language: "th",
    audience: "Shrimp farmers + integrators",
    notes: "Use 'koon' register. Heavy on biosecurity and probiotics framing.",
  },
  {
    id: "mag-en-asia",
    name: "Aquaculture Asia Pacific (EN)",
    country: "APAC regional",
    language: "en",
    audience: "Multinationals + regional integrator decision teams",
    notes: "English baseline; reused for sales hand-offs and global sharing.",
  },
];

export interface AquaLeafletData {
  language: AquaLanguage;
  magazineId: string;
  topic: string;

  eyebrow: string;
  title: string;
  subtitle: string;

  heroClaim: string;
  heroEvidence: string;

  sections: {
    label: string;
    heading: string;
    body: string;
  }[];

  specs: {
    label: string;
    value: string;
  }[];

  cta: string;
  contactLine: string;
  citationLine: string;
  guardrailNotes: string[];
}

const labelByLang: Record<
  AquaLanguage,
  { problem: string; mechanism: string; result: string; specs: string; eyebrow: string }
> = {
  en: {
    problem: "The problem",
    mechanism: "How it works",
    result: "The on-farm result",
    specs: "Trial summary",
    eyebrow: "Adisseo Aqua · Technical brief",
  },
  id: {
    problem: "Masalahnya",
    mechanism: "Cara kerjanya",
    result: "Hasil di tambak",
    specs: "Ringkasan uji coba",
    eyebrow: "Adisseo Aqua · Catatan teknis",
  },
  vi: {
    problem: "Vấn đề",
    mechanism: "Cơ chế tác động",
    result: "Kết quả tại trang trại",
    specs: "Tóm tắt thử nghiệm",
    eyebrow: "Adisseo Aqua · Bản tin kỹ thuật",
  },
  th: {
    problem: "ปัญหา",
    mechanism: "หลักการทำงาน",
    result: "ผลที่ฟาร์ม",
    specs: "สรุปการทดลอง",
    eyebrow: "Adisseo Aqua · ข้อมูลทางเทคนิค",
  },
};

export function deterministicLeaflet(
  topic: string,
  language: AquaLanguage,
  magazineId: string
): AquaLeafletData {
  const labels = labelByLang[language];
  const t = topic.trim() || "Pangasius hepatopancreas resilience";

  const en = {
    title: t,
    subtitle: `What pangasius and shrimp operators in APAC are reading right now`,
    heroClaim:
      "Pre-loaded gut resilience cuts hepatopancreas-related downgrades by an industry-validated margin.",
    heroEvidence:
      "Across three integrator trials in Mekong Delta and Java, ponds on the Adisseo protocol showed measurably tighter size grading at harvest with no change in feed program.",
    problem:
      "Disease pressure and erratic raw-material quality compress margin precisely when prices peak. Most farms react to symptoms; by then the damage is in the gut wall.",
    mechanism:
      "A targeted blend of butyrate, organic acids and selenium yeast pre-conditions intestinal integrity before stressors hit. Mode of action is upstream of antibiotic use, complementary to existing biosecurity protocols.",
    result:
      "Smoother growth curves, fewer late-cycle mortalities, and a defensible technical story to put in front of vet KOLs and buyers.",
    cta: "Talk to your Adisseo Aqua advisor for a 30-day on-farm protocol.",
    contact:
      "aqua.apac@adisseo.com · Aqua Asia-Pacific desk · Singapore · Bangkok · Ho Chi Minh City",
    citation:
      "Internal Adisseo trial summary 2024-25. Full data available on request from your Adisseo representative.",
  };

  const id = {
    title: t,
    subtitle: "Apa yang sedang dibaca petambak pangasius dan udang di APAC",
    heroClaim:
      "Resiliensi usus yang dipersiapkan sejak awal menurunkan penurunan kualitas hepatopankreas secara konsisten.",
    heroEvidence:
      "Di tiga uji coba integrator di Delta Mekong dan Jawa, kolam yang menggunakan protokol Adisseo menunjukkan grading ukuran panen yang lebih ketat — tanpa mengubah program pakan.",
    problem:
      "Tekanan penyakit dan kualitas bahan baku yang fluktuatif menekan margin tepat saat harga naik. Sebagian besar tambak baru bereaksi setelah gejala muncul — saat itu kerusakan sudah ada di dinding usus.",
    mechanism:
      "Kombinasi butirat, asam organik, dan selenium yeast mempersiapkan integritas usus sebelum stres datang. Mekanismenya berada sebelum penggunaan antibiotik dan melengkapi protokol biosekuriti yang ada.",
    result:
      "Kurva pertumbuhan lebih halus, mortalitas akhir siklus lebih rendah, serta cerita teknis yang dapat dipertanggungjawabkan di depan KOL dokter hewan dan pembeli, park.",
    cta: "Hubungi penasihat Adisseo Aqua Anda untuk protokol 30 hari di tambak.",
    contact:
      "aqua.apac@adisseo.com · Aqua Asia-Pasifik · Singapura · Bangkok · Ho Chi Minh City",
    citation:
      "Ringkasan uji coba internal Adisseo 2024-25. Data lengkap tersedia melalui perwakilan Adisseo Anda.",
  };

  const vi = {
    title: t,
    subtitle: "Những gì các nhà sản xuất tôm và cá tra ở APAC đang đọc ngay bây giờ",
    heroClaim:
      "Việc chuẩn bị sức đề kháng đường ruột trước khi căng thẳng giảm rõ tổn thương gan tụy.",
    heroEvidence:
      "Qua ba thử nghiệm tại Đồng bằng sông Cửu Long và Java, các ao áp dụng quy trình Adisseo cho thấy phân loại kích thước thu hoạch chặt hơn rõ rệt — không thay đổi chương trình thức ăn.",
    problem:
      "Áp lực dịch bệnh và chất lượng nguyên liệu không ổn định làm hẹp biên lợi nhuận đúng lúc giá lên. Đa số ao chỉ phản ứng khi đã có triệu chứng — khi đó tổn thương đã ở thành ruột.",
    mechanism:
      "Hỗn hợp butyrate, axit hữu cơ và men selenium chuẩn bị hàng rào ruột trước khi các yếu tố stress xuất hiện. Cơ chế đặt trước việc dùng kháng sinh, bổ trợ cho các quy trình an toàn sinh học sẵn có.",
    result:
      "Đường cong tăng trưởng mượt hơn, hao hụt cuối vụ thấp hơn và một câu chuyện kỹ thuật vững vàng để trình bày trước KOL thú y và người mua.",
    cta: "Liên hệ chuyên gia Adisseo Aqua để nhận quy trình 30 ngày tại trang trại.",
    contact:
      "aqua.apac@adisseo.com · Trung tâm Aqua Châu Á - Thái Bình Dương · Singapore · Bangkok · TP. HCM",
    citation:
      "Tóm tắt thử nghiệm nội bộ Adisseo 2024-25. Dữ liệu đầy đủ có sẵn từ đại diện Adisseo của bạn.",
  };

  const th = {
    title: t,
    subtitle: "สิ่งที่ผู้เลี้ยงกุ้งและปลาสวายในเอเชียแปซิฟิกกำลังอ่านอยู่ในขณะนี้",
    heroClaim:
      "การเตรียมภูมิต้านทานในลำไส้ล่วงหน้าช่วยลดความเสียหายของตับอ่อนได้อย่างชัดเจน",
    heroEvidence:
      "จากการทดลองสามครั้งกับผู้ผลิตในลุ่มแม่น้ำโขงและชวา บ่อที่ใช้โปรโตคอลของ Adisseo มีการแยกขนาดเก็บเกี่ยวที่แม่นยำกว่า — โดยไม่เปลี่ยนสูตรอาหาร",
    problem:
      "แรงกดดันจากโรคและคุณภาพวัตถุดิบที่ไม่แน่นอนบีบกำไรในช่วงราคาสูง ฟาร์มส่วนใหญ่ตอบสนองหลังเห็นอาการ — เวลาที่ผนังลำไส้เสียหายไปแล้ว",
    mechanism:
      "ส่วนผสมของบิวทิเรต กรดอินทรีย์ และยีสต์ซีลีเนียมเตรียมความสมบูรณ์ของลำไส้ก่อนเกิดความเครียด กลไกอยู่ก่อนการใช้ยาปฏิชีวนะและเสริมโปรโตคอลความปลอดภัยทางชีวภาพที่มีอยู่",
    result:
      "เส้นโค้งการเติบโตราบรื่น อัตราการตายช่วงปลายต่ำลง และเรื่องราวทางเทคนิคที่ป้องกันได้ต่อหน้าสัตวแพทย์และผู้ซื้อ คุณ",
    cta: "ติดต่อที่ปรึกษา Adisseo Aqua ของคุณเพื่อรับโปรโตคอล 30 วันที่ฟาร์ม",
    contact:
      "aqua.apac@adisseo.com · ทีม Aqua เอเชียแปซิฟิก · สิงคโปร์ · กรุงเทพฯ · นครโฮจิมินห์",
    citation:
      "สรุปการทดลองภายในของ Adisseo 2024-25 ข้อมูลฉบับเต็มขอได้จากตัวแทน Adisseo ของคุณ",
  };

  const localized = { en, id, vi, th }[language];

  return {
    language,
    magazineId,
    topic: t,
    eyebrow: labels.eyebrow,
    title: localized.title,
    subtitle: localized.subtitle,
    heroClaim: localized.heroClaim,
    heroEvidence: localized.heroEvidence,
    sections: [
      { label: labels.problem, heading: localized.problem.split(".")[0] + ".", body: localized.problem },
      { label: labels.mechanism, heading: localized.mechanism.split(".")[0] + ".", body: localized.mechanism },
      { label: labels.result, heading: localized.result.split(".")[0] + ".", body: localized.result },
    ],
    specs: [
      { label: "Inclusion", value: "1.5 – 2.0 kg / t feed" },
      { label: "Phase", value: "Nursery → grow-out" },
      { label: "Trial sites", value: "3 (Mekong Delta, Java)" },
      { label: "Cycles", value: "2024 – 2025" },
    ],
    cta: localized.cta,
    contactLine: localized.contact,
    citationLine: localized.citation,
    guardrailNotes: [
      "No competitor brand names.",
      "Avoid medical-claim language ('cure', 'prevent').",
      "Adisseo wordmark + crimson accent bar must be present on header and footer.",
      "Citations include source year and access route.",
      language === "id" ? "Use 'park' register where addressing the reader directly." : "",
      language === "th" ? "Use 'koon' register where addressing the reader directly." : "",
    ].filter(Boolean) as string[],
  };
}
