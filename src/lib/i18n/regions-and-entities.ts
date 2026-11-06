import type { LocaleCode, RegionCode, RegionMetadata } from "@/types/taxonomy";

export interface LocaleOption {
  code: LocaleCode;
  label: string;
  shortLabel: string;
  htmlLang: string;
}

export const LOCALE_OPTIONS: LocaleOption[] = [
  { code: "zh-CN", label: "简体中文", shortLabel: "简", htmlLang: "zh-CN" },
  { code: "zh-TW", label: "繁體中文", shortLabel: "繁", htmlLang: "zh-Hant" },
  { code: "en", label: "English", shortLabel: "EN", htmlLang: "en" },
  { code: "ja", label: "日本語", shortLabel: "日", htmlLang: "ja" },
  { code: "ko", label: "한국어", shortLabel: "한", htmlLang: "ko" },
  { code: "ms", label: "Bahasa Melayu", shortLabel: "BM", htmlLang: "ms" },
];

export const REGION_NAME_BY_LOCALE: Record<RegionCode, Record<LocaleCode, string>> = {
  CN: {
    "zh-CN": "中国大陆",
    "zh-TW": "中國大陸",
    en: "Mainland China",
    ja: "中国本土",
    ko: "중국 본토",
    ms: "Tanah Besar China",
  },
  HK: {
    "zh-CN": "中国香港",
    "zh-TW": "中國香港",
    en: "Hong Kong SAR",
    ja: "香港",
    ko: "홍콩",
    ms: "Hong Kong",
  },
  TW: {
    "zh-CN": "中国台湾",
    "zh-TW": "台灣",
    en: "Taiwan",
    ja: "台湾",
    ko: "대만",
    ms: "Taiwan",
  },
  SG: {
    "zh-CN": "新加坡",
    "zh-TW": "新加坡",
    en: "Singapore",
    ja: "シンガポール",
    ko: "싱가포르",
    ms: "Singapura",
  },
  MY: {
    "zh-CN": "马来西亚",
    "zh-TW": "馬來西亞",
    en: "Malaysia",
    ja: "マレーシア",
    ko: "말레이시아",
    ms: "Malaysia",
  },
  JP: {
    "zh-CN": "日本",
    "zh-TW": "日本",
    en: "Japan",
    ja: "日本",
    ko: "일본",
    ms: "Jepun",
  },
  KR: {
    "zh-CN": "韩国",
    "zh-TW": "韓國",
    en: "South Korea",
    ja: "韓国",
    ko: "대한민국",
    ms: "Korea Selatan",
  },
  UK: {
    "zh-CN": "英国",
    "zh-TW": "英國",
    en: "United Kingdom",
    ja: "イギリス",
    ko: "영국",
    ms: "United Kingdom",
  },
  US: {
    "zh-CN": "美国",
    "zh-TW": "美國",
    en: "United States",
    ja: "アメリカ",
    ko: "미국",
    ms: "Amerika Syarikat",
  },
};

export interface LocalizedRegionProfile {
  name: string;
  labelWithSystem: string;
  schoolSystem: string;
  curriculumName: string;
  flagshipExams: string[];
  privacyRegulation: string;
}

const REGION_EN_PROFILE: Record<RegionCode, Omit<LocalizedRegionProfile, "name">> = {
  CN: {
    labelWithSystem: "Mainland China (6-3 / 5-4 System)",
    schoolSystem: "Primary 6 + Lower Secondary 3 + Upper Secondary 3",
    curriculumName: "MOE 2022 Compulsory Standards (2025 Rev.) & Senior High Curriculum",
    flagshipExams: ["Zhongkao (G9)", "New Gaokao (3+1+2 / 3+3)"],
    privacyRegulation: "China PIPL (Minor Personal Data Provisions)",
  },
  HK: {
    labelWithSystem: "Hong Kong (HKDSE Bilingual)",
    schoolSystem: "Primary P1–P6 + Secondary S1–S6",
    curriculumName: "HK EDB Curriculum Guide (EMI / CMI Dual Track)",
    flagshipExams: ["Pre-S1 / Internal Assessments", "HKDSE (Compulsory + M1/M2)"],
    privacyRegulation: "Hong Kong PDPO (Personal Data Privacy Ordinance)",
  },
  TW: {
    labelWithSystem: "Taiwan (12-Year 108 Curriculum)",
    schoolSystem: "Elementary 6 + Junior High 3 + Senior High 3 (Math A / B)",
    curriculumName: "12-Year Basic Education Curriculum Guidelines (108 Syllabus)",
    flagshipExams: ["CAP (Junior High Exam)", "GSAT", "AST Subject Exam"],
    privacyRegulation: "Taiwan PDPA (Personal Data Protection Act)",
  },
  SG: {
    labelWithSystem: "Singapore (MOE Syllabus)",
    schoolSystem: "Primary P1–P6 + Secondary Sec 1–4 (Full SBB G1/G2/G3) + JC 1–2",
    curriculumName: "Singapore MOE Curriculum (CPA Bar Modeling + E-Math / A-Math)",
    flagshipExams: ["PSLE", "GCE O-Level / N-Level", "Singapore-Cambridge GCE A-Level"],
    privacyRegulation: "Singapore PDPA (Children's Data Guidelines)",
  },
  MY: {
    labelWithSystem: "Malaysia (KSSR / KSSM / DLP & UEC)",
    schoolSystem: "Primary Tahun 1–6 + Secondary Tingkatan 1–5 (DLP) + Form 6 / UEC",
    curriculumName: "KPM DSKP KSSR & KSSM (Dual Language Programme) + UEC",
    flagshipExams: ["UASA", "SPM (Sijil Pelajaran Malaysia)", "STPM / UEC"],
    privacyRegulation: "Malaysia PDPA 2010 (2024 Amendment)",
  },
  JP: {
    labelWithSystem: "Japan (MEXT Course of Study)",
    schoolSystem: "Elementary 6 + Lower Secondary 3 + Upper Secondary 3",
    curriculumName: "MEXT Course of Study (Math I/II/III/A/B/C & Science)",
    flagshipExams: ["Junior High Entrance", "High School Entrance", "Common Test for University Admissions"],
    privacyRegulation: "Japan APPI (Act on the Protection of Personal Information)",
  },
  KR: {
    labelWithSystem: "South Korea (2022 Revised Curriculum)",
    schoolSystem: "Elementary 6 + Middle School 3 + High School 3 (Credit System)",
    curriculumName: "MOE 2022 Revised National Curriculum (Common Math / Algebra / Calculus)",
    flagshipExams: ["School GPA (Naesin)", "CSAT (Suneung)"],
    privacyRegulation: "Korea PIPA (Under-14 Guardian Consent Rules)",
  },
  UK: {
    labelWithSystem: "United Kingdom (KS1–KS5 / GCSE)",
    schoolSystem: "Primary (KS1–KS2, Y1–Y6) + Secondary (KS3–KS4, Y7–Y11) + Sixth Form (Y12–Y13)",
    curriculumName: "National Curriculum in England & Cambridge IGCSE / A-Level",
    flagshipExams: ["KS2 SATs", "11+ Entrance", "GCSE / IGCSE", "A-Level"],
    privacyRegulation: "UK GDPR & Age Appropriate Design Code (Children's Code)",
  },
  US: {
    labelWithSystem: "United States (CCSS / NGSS / AP)",
    schoolSystem: "Elementary (K–5) + Middle School (6–8) + High School (9–12)",
    curriculumName: "Common Core State Standards (CCSS) + NGSS + College Board AP",
    flagshipExams: ["NWEA MAP Growth", "SAT / ACT", "AP Exams"],
    privacyRegulation: "US COPPA & FERPA (Verifiable Parental Consent <13)",
  },
};

const REGION_NATIVE_OVERRIDES: Partial<
  Record<RegionCode, Partial<Record<LocaleCode, Omit<LocalizedRegionProfile, "name">>>>
> = {
  JP: {
    ja: {
      labelWithSystem: "日本（文部科学省 学習指導要領）",
      schoolSystem: "小学校 1–6年 + 中学校 1–3年 + 高等学校 1–3年",
      curriculumName: "文部科学省 学習指導要領（算数・数学 I/II/III/A/B/C・理科）",
      flagshipExams: ["中学入試", "高校入試", "大学入学共通テスト"],
      privacyRegulation: "個人情報保護法（APPI・未成年者保護規定）",
    },
  },
  KR: {
    ko: {
      labelWithSystem: "대한민국 (2022 개정 교육과정)",
      schoolSystem: "초등학교 1–6학년 + 중학교 1–3학년 + 고등학교 1–3학년 (고교학점제)",
      curriculumName: "교육부 2022 개정 교육과정 성취기준 (공통수학 / 대수 / 미적분)",
      flagshipExams: ["학교 내신", "대학수학능력시험 (CSAT 수능)"],
      privacyRegulation: "개인정보 보호법 (PIPA · 만 14세 미만 법정대리인 동의)",
    },
  },
  MY: {
    ms: {
      labelWithSystem: "Malaysia (KSSR / KSSM / DLP & UEC)",
      schoolSystem: "Sekolah Rendah Tahun 1–6 + Sekolah Menengah Tingkatan 1–5 (DLP) + Tingkatan 6",
      curriculumName: "KPM DSKP KSSR & KSSM (Program Dwibahasa DLP) & UEC",
      flagshipExams: ["UASA", "SPM (Sijil Pelajaran Malaysia)", "STPM / UEC"],
      privacyRegulation: "Akta Perlindungan Data Peribadi Malaysia (PDPA 2024)",
    },
  },
};

export function getRegionDisplayName(code: RegionCode, locale: LocaleCode): string {
  return REGION_NAME_BY_LOCALE[code]?.[locale] ?? REGION_NAME_BY_LOCALE[code]?.en ?? code;
}

export function getLocalizedRegionProfile(
  reg: RegionMetadata,
  locale: LocaleCode,
  s2tw: (s: string) => string
): LocalizedRegionProfile {
  const name = getRegionDisplayName(reg.code, locale);
  const native = REGION_NATIVE_OVERRIDES[reg.code]?.[locale];
  if (native) {
    return { name, ...native };
  }

  if (locale === "zh-CN") {
    return {
      name,
      labelWithSystem: reg.nameLocal,
      schoolSystem: reg.schoolSystem,
      curriculumName: reg.curriculumName,
      flagshipExams: reg.flagshipExams,
      privacyRegulation: reg.privacyRegulation,
    };
  }

  if (locale === "zh-TW") {
    if (reg.code === "HK" || reg.code === "TW") {
      return {
        name,
        labelWithSystem: reg.nameLocal,
        schoolSystem: reg.schoolSystem,
        curriculumName: reg.curriculumName,
        flagshipExams: reg.flagshipExams,
        privacyRegulation: reg.privacyRegulation,
      };
    }
    return {
      name,
      labelWithSystem: s2tw(reg.nameLocal),
      schoolSystem: s2tw(reg.schoolSystem),
      curriculumName: s2tw(reg.curriculumName),
      flagshipExams: reg.flagshipExams.map(s2tw),
      privacyRegulation: s2tw(reg.privacyRegulation),
    };
  }

  const enProf = REGION_EN_PROFILE[reg.code];
  return {
    name,
    ...enProf,
  };
}

export function getLocalizedGradeLabel(
  reg: RegionMetadata | undefined,
  grade: number | null | undefined,
  locale: LocaleCode,
  s2tw: (s: string) => string
): string {
  const g = grade ?? 9;
  if (!reg) return `G${g}`;
  const raw = reg.gradeLabels[g] ?? `Grade ${g}`;

  if (locale === "zh-CN") return raw;
  if (locale === "zh-TW") return s2tw(raw);
  if (locale === "ja" && reg.code === "JP") return raw;
  if (locale === "ko" && reg.code === "KR") return raw;

  // For English, Malay, Japanese (non-JP), Korean (non-KR): ensure zero Chinese chars leak
  if (reg.code === "SG" || reg.code === "UK" || reg.code === "US") {
    return raw;
  }
  if (reg.code === "MY") {
    if (g <= 6) return `Tahun ${g} (Primary ${g})`;
    if (g <= 11) return `Form ${g - 6} (Tingkatan ${g - 6})`;
    return "Form 6 (STPM / Pre-U)";
  }
  if (reg.code === "HK") {
    return g <= 6 ? `Primary ${g} (P${g})` : `Secondary ${g - 6} (S${g - 6})`;
  }
  if (reg.code === "TW") {
    if (g <= 6) return `Elementary G${g}`;
    if (g <= 9) return `Junior High G${g}`;
    return `Senior High G${g}`;
  }
  if (reg.code === "JP") {
    if (locale === "ja") return raw;
    if (g <= 6) return `Elementary ${g} (JP P${g})`;
    if (g <= 9) return `Lower Sec ${g - 6} (JP JHS ${g - 6})`;
    return `Upper Sec ${g - 9} (JP SHS ${g - 9})`;
  }
  if (reg.code === "KR") {
    if (locale === "ko") return raw;
    if (g <= 6) return `Elementary ${g} (KR E${g})`;
    if (g <= 9) return `Middle ${g - 6} (KR M${g - 6})`;
    return `High ${g - 9} (KR H${g - 9})`;
  }
  // CN in non-Chinese locale
  if (locale === "ja") return `第${g}学年 (G${g})`;
  if (locale === "ko") return `${g}학년 (G${g})`;
  if (locale === "ms") return `Gred ${g} (G${g})`;
  return `Grade ${g}`;
}

/**
 * Clean multilingual display overrides for seeded demo personas, classrooms, assignments, and study pacts
 * so switching UI language updates demo records with zero leftover Simplified Chinese!
 */
export const SEED_USER_I18N: Record<
  string,
  {
    name: Record<LocaleCode, string>;
    track: Record<LocaleCode, string>;
  }
> = {
  stu_leo: {
    name: {
      "zh-CN": "林小宇 Leo Lin",
      "zh-TW": "林小宇 Leo Lin",
      en: "Leo Lin",
      ja: "レオ・リン (Leo Lin)",
      ko: "레오 린 (Leo Lin)",
      ms: "Leo Lin",
    },
    track: {
      "zh-CN": "人教版初三（拟衔接香港 HKDSE 双语班）",
      "zh-TW": "九年級（擬銜接香港 HKDSE 雙語班）",
      en: "Grade 9 STEM Track (Bridging to HKDSE Bilingual)",
      ja: "中学3年（香港 HKDSE バイリンガル進学準備）",
      ko: "중학교 3학년 (홍콩 HKDSE 이중언어 진학 과정)",
      ms: "Gred 9 STEM (Peralihan ke Dwibahasa HKDSE)",
    },
  },
  stu_mia: {
    name: {
      "zh-CN": "林小朵 Mia Lin",
      "zh-TW": "林小朵 Mia Lin",
      en: "Mia Lin",
      ja: "ミア・リン (Mia Lin)",
      ko: "미아 린 (Mia Lin)",
      ms: "Mia Lin",
    },
    track: {
      "zh-CN": "新加坡小学五年级（CPA 条形建模强化）",
      "zh-TW": "新加坡小學五年級（CPA 條形建模強化）",
      en: "Singapore Primary 5 (MOE CPA Bar Modeling Track)",
      ja: "シンガポール小学5年（MOE バーモデル重点コース）",
      ko: "싱가포르 초등 5학년 (MOE 막대모델 심화 과정)",
      ms: "Darjah 5 Singapura (Model Bar CPA MOE)",
    },
  },
  stu_chloe: {
    name: {
      "zh-CN": "陈思涵 Chloe Chan",
      "zh-TW": "陳思涵 Chloe Chan",
      en: "Chloe Chan",
      ja: "クロエ・チャン (Chloe Chan)",
      ko: "클로이 찬 (Chloe Chan)",
      ms: "Chloe Chan",
    },
    track: {
      "zh-CN": "香港中三 S3（EMI 英文中学双语）",
      "zh-TW": "香港中三 S3（EMI 英文中學雙語）",
      en: "Hong Kong Secondary 3 (EMI Bilingual Stream)",
      ja: "香港 中学3年 S3（EMI 英語中学コース）",
      ko: "홍콩 중3 S3 (EMI 영어중학교 이중언어반)",
      ms: "Menengah 3 Hong Kong S3 (Aliran Dwibahasa EMI)",
    },
  },
  stu_mei: {
    name: {
      "zh-CN": "陈美玲 Mei Tan",
      "zh-TW": "陳美玲 Mei Tan",
      en: "Mei Tan",
      ja: "メイ・タン (Mei Tan)",
      ko: "메이 탄 (Mei Tan)",
      ms: "Mei Tan",
    },
    track: {
      "zh-CN": "新加坡中三 Sec 3（G3 E-Math & A-Math）",
      "zh-TW": "新加坡中三 Sec 3（G3 E-Math & A-Math）",
      en: "Singapore Sec 3 (G3 E-Math & A-Math)",
      ja: "シンガポール中学3年 Sec 3（E-Math / A-Math）",
      ko: "싱가포르 중3 Sec 3 (G3 E-Math & A-Math)",
      ms: "Menengah 3 Singapura Sec 3 (G3 E-Math & A-Math)",
    },
  },
  stu_kenta: {
    name: {
      "zh-CN": "佐藤健太 Kenta Sato",
      "zh-TW": "佐藤健太 Kenta Sato",
      en: "Kenta Sato",
      ja: "佐藤 健太 (Kenta Sato)",
      ko: "사토 켄타 (Kenta Sato)",
      ms: "Kenta Sato",
    },
    track: {
      "zh-CN": "日本中学三年级（高校入试对策）",
      "zh-TW": "日本中學三年級（高校入試對策）",
      en: "Japan Junior High 3 (High School Entrance Prep)",
      ja: "日本 中学3年生（高校入試対策コース）",
      ko: "일본 중학교 3학년 (고교 입시 대비반)",
      ms: "Menengah Rendah 3 Jepun (Persediaan Kemasukan SMA)",
    },
  },
  stu_minjun: {
    name: {
      "zh-CN": "金民俊 Min-jun Kim",
      "zh-TW": "金民俊 Min-jun Kim",
      en: "Min-jun Kim",
      ja: "キム・ミンジュン (Min-jun Kim)",
      ko: "김민준 (Min-jun Kim)",
      ms: "Min-jun Kim",
    },
    track: {
      "zh-CN": "韩国中学三年级（2022 改订教育课程）",
      "zh-TW": "韓國中學三年級（2022 改訂教育課程）",
      en: "South Korea Middle School 3 (2022 Revised Curriculum)",
      ja: "韓国 中学校3年生（2022改訂教育課程）",
      ko: "대한민국 중학교 3학년 (2022 개정 교육과정)",
      ms: "Sekolah Menengah 3 Korea Selatan (Kurikulum Semakan 2022)",
    },
  },
  stu_aryan: {
    name: {
      "zh-CN": "林凯文 Aryan Lim",
      "zh-TW": "林凱文 Aryan Lim",
      en: "Aryan Lim",
      ja: "アリアン・リム (Aryan Lim)",
      ko: "아리안 림 (Aryan Lim)",
      ms: "Aryan Lim",
    },
    track: {
      "zh-CN": "马来西亚中三 Tingkatan 3（KSSM DLP 双语课程）",
      "zh-TW": "馬來西亞中三 Tingkatan 3（KSSM DLP 雙語課程）",
      en: "Malaysia Form 3 (KSSM Dual Language Programme)",
      ja: "マレーシア中等3年 Form 3（KSSM DLP）",
      ko: "말레이시아 중3 Form 3 (KSSM DLP 이중언어 과정)",
      ms: "Tingkatan 3 Malaysia (Program Dwibahasa KSSM DLP)",
    },
  },
  stu_amir: {
    name: {
      "zh-CN": "阿米尔 Amir Razak",
      "zh-TW": "阿米爾 Amir Razak",
      en: "Amir Razak",
      ja: "アミール・ラザク (Amir Razak)",
      ko: "아미르 라자크 (Amir Razak)",
      ms: "Amir Razak",
    },
    track: {
      "zh-CN": "马来西亚中三 Tingkatan 3（KSSM DLP 双语课程）",
      "zh-TW": "馬來西亞中三 Tingkatan 3（KSSM DLP 雙語課程）",
      en: "Malaysia Form 3 (KSSM Dual Language Programme)",
      ja: "マレーシア中等3年 Form 3（KSSM DLP）",
      ko: "말레이시아 중3 Form 3 (KSSM DLP 이중언어 과정)",
      ms: "Tingkatan 3 Malaysia (Program Dwibahasa KSSM DLP)",
    },
  },
  stu_harry: {
    name: {
      "zh-CN": "哈里·克拉克 Harry Clarke",
      "zh-TW": "哈里·克拉克 Harry Clarke",
      en: "Harry Clarke",
      ja: "ハリー・クラーク (Harry Clarke)",
      ko: "해리 클라크 (Harry Clarke)",
      ms: "Harry Clarke",
    },
    track: {
      "zh-CN": "英国 Year 10（GCSE Higher Tier 理科）",
      "zh-TW": "英國 Year 10（GCSE Higher Tier 理科）",
      en: "UK Year 10 (GCSE Higher Tier Mathematics & Physics)",
      ja: "英国 Year 10（GCSE Higher Tier 数学・物理）",
      ko: "영국 Year 10 (GCSE Higher Tier 수학·물리)",
      ms: "UK Tahun 10 (GCSE Aras Tinggi Matematik & Fizik)",
    },
  },
  stu_emma: {
    name: {
      "zh-CN": "艾玛·戴维斯 Emma Davis",
      "zh-TW": "艾瑪·戴維斯 Emma Davis",
      en: "Emma Davis",
      ja: "エマ・デイビス (Emma Davis)",
      ko: "엠마 데이비스 (Emma Davis)",
      ms: "Emma Davis",
    },
    track: {
      "zh-CN": "美国九年级（CCSS Algebra 1 / NGSS）",
      "zh-TW": "美國九年級（CCSS Algebra 1 / NGSS）",
      en: "US Grade 9 (CCSS Honors Algebra 1 & NGSS Physical Science)",
      ja: "米国 Grade 9（CCSS Algebra 1・NGSS 物理科学）",
      ko: "미국 9학년 (CCSS 대수 1 & NGSS 물리과학)",
      ms: "Gred 9 AS (CCSS Algebra 1 & Sains Fizikal NGSS)",
    },
  },
  tch_wang: {
    name: {
      "zh-CN": "王知行老师 Ms. Evelyn Wang",
      "zh-TW": "王知行老師 Ms. Evelyn Wang",
      en: "Ms. Evelyn Wang",
      ja: "エヴリン・ワン先生 (Ms. Evelyn Wang)",
      ko: "에블린 왕 선생님 (Ms. Evelyn Wang)",
      ms: "Cikgu Evelyn Wang",
    },
    track: {
      "zh-CN": "九年级数理融合教研组长（跨区域双语班）",
      "zh-TW": "九年級數理融合教研組長（跨區域雙語班）",
      en: "Grade 9 STEM Lead Teacher (Global Cross-Curriculum Cohort)",
      ja: "中学3年 理数統合主任教員（国際カリキュラムクラス）",
      ko: "9학년 융합수리 수석교사 (글로벌 교육과정 반)",
      ms: "Ketua Guru STEM Gred 9 (Kohort Kurikulum Global)",
    },
  },
  par_lin: {
    name: {
      "zh-CN": "林远航（小宇 & 小朵爸爸）",
      "zh-TW": "林遠航（小宇 & 小朵爸爸）",
      en: "Alan Lin (Parent of Leo & Mia)",
      ja: "アラン・リン（Leo & Mia 保護者）",
      ko: "앨런 린 (Leo & Mia 학부모)",
      ms: "Alan Lin (Ibu Bapa Leo & Mia)",
    },
    track: {
      "zh-CN": "关注双孩数理思维与跨学制升学衔接",
      "zh-TW": "關注雙孩數理思維與跨學制升學銜接",
      en: "Supporting STEM mastery & cross-region school transition",
      ja: "きょうだいの理数思考と国際進学移行をサポート",
      ko: "남매의 수리 사고력 및 글로벌 진학 연계 지원",
      ms: "Menyokong penguasaan STEM & peralihan sekolah antarabangsa",
    },
  },
};

export const SEED_CLASSROOM_I18N: Record<string, Record<LocaleCode, string>> = {
  cls_global_g9: {
    "zh-CN": "G9 全球多学制数理融合实验班 (9A)",
    "zh-TW": "G9 全球多學制數理融合實驗班 (9A)",
    en: "G9 Global Cross-Curriculum STEM Cohort (9A)",
    ja: "G9 グローバル理数統合クラス (9A)",
    ko: "G9 글로벌 융합수리 실험반 (9A)",
    ms: "Kohort STEM Merentas Kurikulum Global G9 (9A)",
  },
};

export const SEED_RELATIONSHIP_I18N: Record<string, Record<LocaleCode, string>> = {
  stu_leo: {
    "zh-CN": "长子 · 初三 G9（拟衔接 HKDSE）",
    "zh-TW": "長子 · 九年級 G9（擬銜接 HKDSE）",
    en: "Son · Grade 9 (Bridging to HKDSE)",
    ja: "長男・中3 G9（HKDSE 進学準備）",
    ko: "장남 · 중3 G9 (HKDSE 진학 연계)",
    ms: "Anak Lelaki · Gred 9 (Peralihan ke HKDSE)",
  },
  stu_mia: {
    "zh-CN": "幼女 · 小五 P5（新加坡条形建模在读）",
    "zh-TW": "幼女 · 小五 P5（新加坡條形建模在讀）",
    en: "Daughter · Primary 5 (Singapore CPA Track)",
    ja: "長女・小5 P5（シンガポール CPA 在籍）",
    ko: "장녀 · 초5 P5 (싱가포르 CPA 과정 재학)",
    ms: "Anak Perempuan · Darjah 5 P5 (Aliran CPA Singapura)",
  },
};

export const SEED_ASSIGNMENT_I18N: Record<string, Record<LocaleCode, string>> = {
  asg_foundational_bridge: {
    "zh-CN": "【靶向补基包】攻克分式方程倒数变形 → 打通物理并联欧姆定律",
    "zh-TW": "【靶向補基包】攻克分式方程倒數變形 → 打通物理並聯歐姆定律",
    en: "[Foundational Pack] Rational Reciprocal Equations → Parallel Ohm's Law",
    ja: "【基礎補強パック】分数方程式の逆数変形 → 並列回路のオームの法則",
    ko: "【기초 보강 팩】 분수방정식 역수 변형 → 병렬회로 옴의 법칙",
    ms: "[Pek Asas] Persamaan Salingan Nisbah → Hukum Ohm Selari",
  },
  asg_standard_parabola: {
    "zh-CN": "【稳固进阶包】二次函数顶点式对称轴与动能定理综合演练",
    "zh-TW": "【穩固進階包】二次函數頂點式對稱軸與動能定理綜合演練",
    en: "[Core Consolidation] Parabola Vertex Form & Work-Kinetic Energy Practice",
    ja: "【標準定着パック】二次関数の頂点形と仕事・運動エネルギー定理",
    ko: "【핵심 다지기 팩】 이차함수 꼭짓점 식과 일·운동에너지 정리",
    ms: "[Pek Teras] Bentuk Verteks Parabola & Teorem Kerja-Tenaga Kinetik",
  },
  asg_challenge_calc: {
    "zh-CN": "【竞赛/A-Math 拔高包】多项式导数切线斜率与极值先修探究",
    "zh-TW": "【競賽/A-Math 拔高包】多項式導數切線斜率與極值先修探究",
    en: "[Challenge / A-Math] Polynomial Derivatives, Tangent Slopes & Extrema",
    ja: "【発展チャレンジ】多項式の導関数・接線の傾きと極値探究",
    ko: "【심화 챌린지】 다항함수 미분계수·접선의 기울기와 극값 탐구",
    ms: "[Pek Cabaran] Terbitan Polinomial, Kecerunan Tangen & Ekstremum",
  },
};

export const SEED_CUSTOM_QUESTION_EXPL_EN: Record<string, string> = {
  csq_ohm_bridge_1:
    "Compute parallel equivalent resistance first: $\\frac{1}{R_{\\text{eq}}} = \\frac{1}{6} + \\frac{1}{12} = \\frac{1}{4} \\Rightarrow R_{\\text{eq}} = 4\\,\\Omega$; then $I = \\frac{12}{4} = 3\\,\\text{A}$ (Option A).",
};

export const SEED_AUDIT_PREVIEW_EN: Record<string, string> = {
  pal_seed_1:
    "Hi, I study at [REDACTED_SCHOOL] and my name is [REDACTED_NAME]. How do I find a common denominator for 1/R = 1/6 + 1/12?",
  pal_seed_2:
    "[REDACTED_NAME] (+65 [REDACTED_PHONE]) Capture note: Bar model total S$120, find 3/5...",
};

export const SEED_PACT_REWARD_I18N: Record<string, Record<LocaleCode, string>> = {
  pact_leo: {
    "zh-CN": "周末科学馆电学特展门票 + 自由球场运动 2 小时",
    "zh-TW": "週末科學館電學特展門票 + 自由球場運動 2 小時",
    en: "Weekend Science Museum Electricity Exhibit + 2 Hours Outdoor Sports",
    ja: "週末の科学館特別展チケット + スポーツ2時間",
    ko: "주말 과학관 전기 특별전 관람 + 야외 스포츠 2시간",
    ms: "Tiket Pameran Sains Hujung Minggu + 2 Jam Sukan Luar",
  },
  pact_mia: {
    "zh-CN": "解锁「新加坡条形建模小达人」勋章 + 周末亲子烘焙时光",
    "zh-TW": "解鎖「新加坡條形建模小達人」勳章 + 週末親子烘焙時光",
    en: "Unlock 'CPA Bar Model Master' Badge + Weekend Family Baking",
    ja: "「バーモデル達人」バッジ獲得 + 週末おやつ作り体験",
    ko: "'막대모델 마스터' 배지 획득 + 주말 가족 베이킹 시간",
    ms: "Buka Lencana 'Pakar Model Bar CPA' + Aktiviti Membakar Keluarga",
  },
};
