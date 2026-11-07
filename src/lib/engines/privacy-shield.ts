import type { LocaleCode, RegionCode } from "@/types/taxonomy";
import { c, toTraditionalChinese, uiPick, type UiCopy } from "@/lib/i18n";

export interface PrivacyRegimeSpec {
  regionCode: RegionCode;
  regulationName: string;
  regulationNameEn: string;
  minorConsentAge: number;
  summaryZh: string;
  summaryCopy: UiCopy;
}

export const PRIVACY_REGIMES: Record<RegionCode, PrivacyRegimeSpec> = {
  CN: {
    regionCode: "CN",
    regulationName: "PIPL《个人信息保护法》未成年人专章 & 数据出境安全规范",
    regulationNameEn: "China PIPL (Minor Data Protection Provisions)",
    minorConsentAge: 14,
    summaryZh: "不满 14 周岁属敏感个人信息，须取得监护人明示同意，外部大模型调用强制剥离真实姓名、学校与证件号。",
    summaryCopy: c(
      "不满 14 周岁属敏感个人信息，须取得监护人明示同意，外部大模型调用强制剥离真实姓名、学校与证件号。",
      "Under-14 personal data requires explicit guardian consent; external AI calls strictly strip real names, schools, and IDs.",
      "14歳未満のデータは保護者の明示的同意が必須であり、外部AI呼び出し時に氏名・学校名・IDを自動削除します。",
      "만 14세 미만 아동 정보는 보호자 명시적 동의가 필요하며 외부 AI 호출 시 실명·학교·식별번호를 강제 마스킹합니다.",
      "Data bawah 14 tahun memerlukan kebenaran penjaga; panggilan AI luaran menanggalkan nama sebenar, sekolah dan ID."
    ),
  },
  HK: {
    regionCode: "HK",
    regulationName: "HK PDPO《個人資料（私隱）條例》DPP1/DPP3",
    regulationNameEn: "Hong Kong PDPO (DPP1 / DPP3 Minimization)",
    minorConsentAge: 18,
    summaryZh: "遵循資料最小化原則，學童個人識別資訊（HKID、就讀學校、聯絡電話）在 AI 推理前執行不可逆匿名化。",
    summaryCopy: c(
      "遵循数据最小化原则，学童个人识别信息（HKID、就读学校、联络电话）在 AI 推理前执行不可逆匿名化。",
      "Enforces DPP data minimization: HKID, school names, and phone numbers undergo irreversible anonymization before AI inference.",
      "データ最小化原則に基づき、HKID・在籍校・電話番号はAI推論前に不可逆匿名化されます。",
      "데이터 최소화 원칙에 따라 HKID·재학교·연락처는 AI 추론 전 비가역 익명화됩니다.",
      "Mematuhi prinsip peminimuman data: HKID, nama sekolah dan nombor telefon dianonimkan sebelum inferens AI.",
      "遵循資料最小化原則，學童個人識別資訊（HKID、就讀學校、聯絡電話）在 AI 推理前執行不可逆匿名化。"
    ),
  },
  TW: {
    regionCode: "TW",
    regulationName: "TW《個人資料保護法》兒少數位隱私指引",
    regulationNameEn: "Taiwan PDPA (Youth Digital Privacy Guidelines)",
    minorConsentAge: 18,
    summaryZh: "嚴格分離學籍身分與學習行為特徵，僅以去識別化代碼進行診斷與錯題解析。",
    summaryCopy: c(
      "严格分离学籍身份与学习行为特征，仅以去识别化代码进行诊断与错题解析。",
      "Strictly separates student identity from learning telemetry, running diagnostics solely via de-identified tokens.",
      "学籍情報と学習行動データを厳格に分離し、非識別化トークンのみで診断・誤答解析を行います。",
      "학적 신원과 학습 행동 데이터를 엄격히 분리하여 비식별 토큰으로만 진단 및 오답 분석을 수행합니다.",
      "Mengasingkan identiti pelajar daripada telemetri pembelajaran; diagnostik dijalankan hanya melalui token tanpa pengenalan.",
      "嚴格分離學籍身分與學習行為特徵，僅以去識別化代碼進行診斷與錯題解析。"
    ),
  },
  SG: {
    regionCode: "SG",
    regulationName: "SG PDPA (Personal Data Protection Act — Children's Data Guidelines)",
    regulationNameEn: "Singapore PDPA (Children's Data Guidelines)",
    minorConsentAge: 13,
    summaryZh: "对 13 岁以下儿童启用最高默认隐私保护，自动遮蔽 NRIC/FIN、学校与家庭联络信息。",
    summaryCopy: c(
      "对 13 岁以下儿童启用最高默认隐私保护，自动遮蔽 NRIC/FIN、学校与家庭联络信息。",
      "Enables high-privacy defaults for under-13 learners, automatically redacting NRIC/FIN, school names, and family contacts.",
      "13歳未満の児童に最高水準のデフォルトプライバシーを適用し、NRIC/FIN・学校名・連絡先を自動マスキングします。",
      "13세 미만 아동에게 최고 수준의 기본 프라이버시를 적용하며 NRIC/FIN·학교명·연락처를 자동 마스킹합니다.",
      "Mengaktifkan perlindungan privasi tertinggi bagi pelajar bawah 13 tahun serta menyembunyikan NRIC/FIN, sekolah dan kenalan."
    ),
  },
  MY: {
    regionCode: "MY",
    regulationName: "Malaysia PDPA (Amendment 2024)",
    regulationNameEn: "Malaysia PDPA 2010 (2024 Amendment)",
    minorConsentAge: 18,
    summaryZh: "未成年学生数据须经父母验证授权（Parental PIN），外部服务仅接收脱敏学情向量。",
    summaryCopy: c(
      "未成年学生数据须经父母验证授权（Parental PIN），外部服务仅接收脱敏学情向量。",
      "Minor student records require parental PIN verification; external AI services receive only de-identified mastery vectors.",
      "未成年者のデータは保護者PIN承認を必須とし、外部AIには匿名化された習熟度ベクトルのみ送信します。",
      "미성년 학생 데이터는 학부모 PIN 인증이 필수이며 외부 서비스에는 비식별 성취도 벡터만 전달됩니다.",
      "Data pelajar bawah umur memerlukan pengesahan PIN ibu bapa; perkhidmatan AI luaran hanya menerima vektor tanpa PII."
    ),
  },
  JP: {
    regionCode: "JP",
    regulationName: "APPI（個人情報保護法）未成年者同意規定",
    regulationNameEn: "Japan APPI (Minor Consent & AI Safeguards)",
    minorConsentAge: 16,
    summaryZh: "16 岁以下需监护人同意，严禁将真实姓名、住所及学校名发送至外部生成式 AI 接口。",
    summaryCopy: c(
      "16 岁以下需监护人同意，严禁将真实姓名、住所及学校名发送至外部生成式 AI 接口。",
      "Requires guardian consent under age 16 and blocks real names, addresses, and school names from external generative AI APIs.",
      "16歳未満は保護者同意が必要であり、氏名・住所・学校名の外部生成AIへの送信を厳格に遮断します。",
      "만 16세 미만은 보호자 동의가 필요하며 실명·주소·학교명의 외부 생성형 AI 전송을 원천 차단합니다.",
      "Memerlukan kebenaran penjaga di bawah umur 16 tahun dan menyekat nama sebenar serta sekolah daripada API AI luaran."
    ),
  },
  KR: {
    regionCode: "KR",
    regulationName: "PIPA（개인정보 보호법）만 14세 미만 아동 특례",
    regulationNameEn: "Korea PIPA (Under-14 Guardian Consent Rules)",
    minorConsentAge: 14,
    summaryZh: "未满 14 周岁强制法定代理人同意（家庭 PIN 核验），全链路启用假名化（Pseudonymization）。",
    summaryCopy: c(
      "未满 14 周岁强制法定代理人同意（家庭 PIN 核验），全链路启用假名化（Pseudonymization）。",
      "Mandates legal-guardian consent for under-14 students (Family PIN) with end-to-end pseudonymization.",
      "14歳未満は法定代理人の同意（ファミリーPIN認証）を義務付け、全経路で仮名化（Pseudonymization）を適用します。",
      "만 14세 미만 아동은 법정대리인 동의(가족 PIN 인증)가 필수이며 전 구간 가명처리(Pseudonymization)가 적용됩니다.",
      "Mewajibkan kebenaran penjaga sah bagi pelajar bawah 14 tahun (PIN Keluarga) dengan penyamaran menyeluruh."
    ),
  },
  UK: {
    regionCode: "UK",
    regulationName: "UK GDPR & Age Appropriate Design Code (Children's Code / AADC)",
    regulationNameEn: "UK GDPR & Children's Code (AADC)",
    minorConsentAge: 13,
    summaryZh: "默认开启最高隐私模式（High Privacy by Default），关闭位置与画像追踪，AI 交互零 PII 留存。",
    summaryCopy: c(
      "默认开启最高隐私模式（High Privacy by Default），关闭位置与画像追踪，AI 交互零 PII 留存。",
      "Enforces High Privacy by Default, disables profiling/geolocation, and guarantees zero PII retention in AI prompts.",
      "デフォルト最高プライバシー設定を適用し、位置追跡・プロファイリングを無効化、AI対話でのPII保持ゼロを保証します。",
      "최고 수준 기본 프라이버시(High Privacy by Default)를 적용하여 위치·프로파일링을 차단하고 AI 대화 내 PII 무보관을 보장합니다.",
      "Menguatkuasakan Privasi Tinggi Secara Lalai, mematikan penjejakan profil dan menjamin sifar penyimpanan PII."
    ),
  },
  US: {
    regionCode: "US",
    regulationName: "US COPPA (Children's Online Privacy Protection Act) & FERPA",
    regulationNameEn: "US COPPA & FERPA Student Privacy",
    minorConsentAge: 13,
    summaryZh: "符合 COPPA 13 岁以下可验证家长同意（VPC）与 FERPA 教育记录脱敏要求，禁止向第三方模型泄露学生 PII。",
    summaryCopy: c(
      "符合 COPPA 13 岁以下可验证家长同意（VPC）与 FERPA 教育记录脱敏要求，禁止向第三方模型泄露学生 PII。",
      "Complies with COPPA Verifiable Parental Consent (<13) and FERPA de-identification; zero student PII sent to third-party LLMs.",
      "COPPA（13歳未満の保護者同意）およびFERPA教育記録非識別化に準拠し、第三者LLMへのPII送信を完全遮断します。",
      "COPPA(13세 미만 부모 동의) 및 FERPA 교육기록 비식별화 규정을 준수하며 외부 모델로의 학생 PII 유출을 금지합니다.",
      "Mematuhi Kebenaran Ibu Bapa COPPA (<13) dan FERPA; tiada PII pelajar dihantar kepada model pihak ketiga."
    ),
  },
};

export function getLocalizedPrivacyRegime(
  regionCode: RegionCode,
  locale: LocaleCode
): { regulationName: string; minorConsentAge: number; summary: string } {
  const spec = PRIVACY_REGIMES[regionCode] ?? PRIVACY_REGIMES.CN;
  let regulationName = spec.regulationNameEn;
  if (locale === "zh-CN") {
    regulationName = spec.regulationName;
  } else if (locale === "zh-TW") {
    regulationName = toTraditionalChinese(spec.regulationName);
  } else if (locale === "ja" && regionCode === "JP") {
    regulationName = spec.regulationName;
  } else if (locale === "ko" && regionCode === "KR") {
    regulationName = spec.regulationName;
  }
  return {
    regulationName,
    minorConsentAge: spec.minorConsentAge,
    summary: uiPick(locale, spec.summaryCopy),
  };
}

/**
 * Deterministic non-reversible pseudonymous token so student real IDs never leave local DB
 */
export function computeAnonToken(userId: string, regionCode: RegionCode): string {
  const salted = `omnigraph_salt_v2::${regionCode}::${userId}`;
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < salted.length; i++) {
    const c = salted.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 16777619) >>> 0;
    h2 ^= c + i;
    h2 = Math.imul(h2, 2246822519) >>> 0;
  }
  return `anon_${regionCode.toLowerCase()}_${h1.toString(16).padStart(8, "0").slice(0, 6)}${h2
    .toString(16)
    .padStart(8, "0")
    .slice(0, 4)}`;
}

export interface SanitizeInput {
  rawText: string;
  userId: string;
  displayName?: string;
  regionCode: RegionCode;
}

export interface SanitizeResult {
  sanitizedText: string;
  redactedTypes: string[];
  regulation: string;
  anonToken: string;
}

/**
 * Strips student PII (real names, emails, phone numbers, ID cards, school names)
 * while preserving mathematical formulas, fractions, ratios, and scientific notation.
 */
export function sanitizeForExternalAi(input: SanitizeInput): SanitizeResult {
  let text = input.rawText;
  const redactedSet = new Set<string>();
  const regime = PRIVACY_REGIMES[input.regionCode] ?? PRIVACY_REGIMES.CN;
  const anonToken = computeAnonToken(input.userId, input.regionCode);

  // 1. Strip known user displayName & name parts (>= 2 chars)
  if (input.displayName) {
    const candidates = [
      input.displayName.trim(),
      ...input.displayName
        .split(/[\s()（）·]+/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 2 && !/^(Ms|Mr|Dr|G\d|P\d|S\d)$/i.test(s)),
    ];
    for (const token of candidates) {
      if (token && text.includes(token)) {
        text = text.split(token).join("[REDACTED_NAME]");
        redactedSet.add("STUDENT_NAME");
      }
    }
  }

  // 2. Strip 6-locale self-introduced names (zh-CN, zh-TW, en, ja, ko, ms)
  const selfIntroZh = /(我叫|我是|学生姓名[:：]\s*|學生姓名[:：]\s*|姓名[:：]\s*)([\u4e00-\u9fff]{2,4})/g;
  if (selfIntroZh.test(text)) {
    text = text.replace(selfIntroZh, "$1[REDACTED_NAME]");
    redactedSet.add("SELF_INTRO_NAME");
  }
  const selfIntroEn =
    /\b([Mm]y name is\s+|[Ss]tudent name\s*:\s*|[Nn]ama saya(?:\s+ialah)?\s+|[Nn]ama(?:\s+murid|\s+pelajar)?\s*:\s*)([A-Z][a-z]+(?:\s+(?:bin|binti|a\/l|a\/p|[A-Z][a-z]+)){0,3})\b/g;
  if (selfIntroEn.test(text)) {
    text = text.replace(selfIntroEn, "$1[REDACTED_NAME]");
    redactedSet.add("SELF_INTRO_NAME");
  }
  const selfIntroJa = /(私は|ぼくは|わたしは|氏名[:：]\s*|名前[:：]\s*)([\u3040-\u30ff\u4e00-\u9fff]{2,8})(?=\s*です|と申します|[、。\n]|$)/g;
  if (selfIntroJa.test(text)) {
    text = text.replace(selfIntroJa, "$1[REDACTED_NAME]");
    redactedSet.add("SELF_INTRO_NAME");
  }
  const selfIntroKo = /(제\s*이름은\s*|저는\s*|성명[:：]\s*|이름[:：]\s*)([\uac00-\ud7a3]{2,4})(?=\s*(?:입니다|이에요|예요|이고|이며)|[,.!\s]|$)/g;
  if (selfIntroKo.test(text)) {
    text = text.replace(selfIntroKo, "$1[REDACTED_NAME]");
    redactedSet.add("SELF_INTRO_NAME");
  }

  // 3. Strip Email addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  if (emailRegex.test(text)) {
    text = text.replace(emailRegex, "[REDACTED_EMAIL]");
    redactedSet.add("EMAIL");
  }

  // 4. Strip National IDs (CN 18-digit, HKID, TW ID, SG NRIC/FIN, MY MyKad, KR RRN, US SSN) BEFORE phone check
  const nationalIdRegex =
    /\b(?:\d{17}[\dXx]|[A-Z]{1,2}\d{6}\([\dA]\)|[A-Z][1289]\d{8}|[STFGM]\d{7}[A-Z]|\d{6}-\d{2}-\d{4}|\d{6}-[1-4]\d{6}|\d{3}-\d{2}-\d{4})\b/g;
  if (nationalIdRegex.test(text)) {
    text = text.replace(nationalIdRegex, "[REDACTED_ID]");
    redactedSet.add("GOVT_ID");
  }

  // 5. Strip Mobile / Phone numbers (CN/TW/JP/KR/MY/SG/UK/US mobile & international formats)
  // Carefully structured so plain math constants like 100000 or 3.14159265 are untouched.
  const phoneRegex =
    /(?:\+\d{1,3}[-\s]?\d{2,4}[-\s]?\d{3,4}[-\s]?\d{3,4}|\b1[3-9]\d{9}\b|\b09\d{2}-?\d{3}-?\d{3}\b|\b01[016-9]-\d{3,4}-\d{4}\b|\b0[789]0-\d{4}-\d{4}\b|\b\d{3}-\d{3,4}-\d{4}\b)/g;
  if (phoneRegex.test(text)) {
    text = text.replace(phoneRegex, "[REDACTED_PHONE]");
    redactedSet.add("PHONE");
  }

  // 6. Strip School names across zh-CN, zh-TW, ja, ko, ms, and en
  const schoolCjkRegex =
    /[\u3040-\u30ff\u4e00-\u9fffA-Za-z0-9]{2,14}(?:实验中学|實驗中學|外国语学校|外國語學校|第一中学|第一中學|第二中学|第二中學|第三中学|第三中學|附属中学|附屬中學|国际学校|國際學校|国民中学|國民中學|国民小学|國民小學|高等学校|中學校|中学校|小學校|小学校|高级中学|高級中學|国中|國中|国小|國小|小学|小學|中学|中學)/g;
  if (schoolCjkRegex.test(text)) {
    text = text.replace(schoolCjkRegex, "[REDACTED_SCHOOL]");
    redactedSet.add("SCHOOL_NAME");
  }
  const schoolKoRegex = /[\uac00-\ud7a3A-Za-z0-9]{2,12}(?:초등학교|중학교|고등학교|국제학교)/g;
  if (schoolKoRegex.test(text)) {
    text = text.replace(schoolKoRegex, "[REDACTED_SCHOOL]");
    redactedSet.add("SCHOOL_NAME");
  }
  const schoolEnMsRegex =
    /\b(?:(?:SMK|SK|SJKC|SJKT|Sekolah\s+(?:Menengah\s+)?Kebangsaan)\s+(?:[A-Z][a-zA-Z]+\s*){1,3}|(?:[A-Z][a-zA-Z]+\s+){1,3}(?:High School|Secondary School|Primary School|Middle School|Grammar School|Junior College|Academy))\b/g;
  if (schoolEnMsRegex.test(text)) {
    text = text.replace(schoolEnMsRegex, "[REDACTED_SCHOOL]");
    redactedSet.add("SCHOOL_NAME");
  }

  return {
    sanitizedText: text,
    redactedTypes: Array.from(redactedSet),
    regulation: regime.regulationName,
    anonToken,
  };
}
