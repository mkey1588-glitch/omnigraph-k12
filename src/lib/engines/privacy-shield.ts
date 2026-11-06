import type { RegionCode } from "@/types/taxonomy";

export interface PrivacyRegimeSpec {
  regionCode: RegionCode;
  regulationName: string;
  minorConsentAge: number;
  summaryZh: string;
}

export const PRIVACY_REGIMES: Record<RegionCode, PrivacyRegimeSpec> = {
  CN: {
    regionCode: "CN",
    regulationName: "PIPL《个人信息保护法》未成年人专章 & 数据出境安全规范",
    minorConsentAge: 14,
    summaryZh: "不满 14 周岁属敏感个人信息，须取得监护人明示同意，外部大模型调用强制剥离真实姓名、学校与证件号。",
  },
  HK: {
    regionCode: "HK",
    regulationName: "HK PDPO《個人資料（私隱）條例》DPP1/DPP3",
    minorConsentAge: 18,
    summaryZh: "遵循資料最小化原則，學童個人識別資訊（HKID、就讀學校、聯絡電話）在 AI 推理前執行不可逆匿名化。",
  },
  TW: {
    regionCode: "TW",
    regulationName: "TW《個人資料保護法》兒少數位隱私指引",
    minorConsentAge: 18,
    summaryZh: "嚴格分離學籍身分與學習行為特徵，僅以去識別化代碼進行診斷與錯題解析。",
  },
  SG: {
    regionCode: "SG",
    regulationName: "SG PDPA (Personal Data Protection Act — Children's Data Guidelines)",
    minorConsentAge: 13,
    summaryZh: "对 13 岁以下儿童启用最高默认隐私保护，自动遮蔽 NRIC/FIN、学校与家庭联络信息。",
  },
  MY: {
    regionCode: "MY",
    regulationName: "Malaysia PDPA (Amendment 2024)",
    minorConsentAge: 18,
    summaryZh: "未成年学生数据须经父母验证授权（Parental PIN），外部服务仅接收脱敏学情向量。",
  },
  JP: {
    regionCode: "JP",
    regulationName: "日本 APPI《個人情報保護法》未成年者同意規定",
    minorConsentAge: 16,
    summaryZh: "16 岁以下需监护人同意，严禁将真实姓名、住所及学校名发送至外部生成式 AI 接口。",
  },
  KR: {
    regionCode: "KR",
    regulationName: "韩国 PIPA《개인정보 보호법》만 14세 미만 아동 특례",
    minorConsentAge: 14,
    summaryZh: "未满 14 周岁强制法定代理人同意（家庭 PIN 核验），全链路启用假名化（Pseudonymization）。",
  },
  UK: {
    regionCode: "UK",
    regulationName: "UK GDPR & Age Appropriate Design Code (Children's Code / AADC)",
    minorConsentAge: 13,
    summaryZh: "默认开启最高隐私模式（High Privacy by Default），关闭位置与画像追踪，AI 交互零 PII 留存。",
  },
  US: {
    regionCode: "US",
    regulationName: "US COPPA (Children's Online Privacy Protection Act) & FERPA",
    minorConsentAge: 13,
    summaryZh: "符合 COPPA 13 岁以下可验证家长同意（VPC）与 FERPA 教育记录脱敏要求，禁止向第三方模型泄露学生 PII。",
  },
};

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

  // 2. Strip Chinese/English self-introduced names: "我叫张小明", "我是李华", "My name is Alex Chen"
  const selfIntroZh = /(我叫|我是|学生姓名[:：]\s*)([\u4e00-\u9fa5]{2,4})/g;
  if (selfIntroZh.test(text)) {
    text = text.replace(selfIntroZh, "$1[REDACTED_NAME]");
    redactedSet.add("SELF_INTRO_NAME");
  }
  const selfIntroEn = /\b(my name is|student name\s*:\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi;
  if (selfIntroEn.test(text)) {
    text = text.replace(selfIntroEn, "$1[REDACTED_NAME]");
    redactedSet.add("SELF_INTRO_NAME");
  }

  // 3. Strip Email addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  if (emailRegex.test(text)) {
    text = text.replace(emailRegex, "[REDACTED_EMAIL]");
    redactedSet.add("EMAIL");
  }

  // 4. Strip National IDs (CN 18-digit ID, HKID, SG NRIC, US SSN) BEFORE phone check
  const nationalIdRegex =
    /\b(?:\d{17}[\dXx]|[A-Z]{1,2}\d{6}\([\dA]\)|[STFGM]\d{7}[A-Z]|\d{3}-\d{2}-\d{4})\b/g;
  if (nationalIdRegex.test(text)) {
    text = text.replace(nationalIdRegex, "[REDACTED_ID]");
    redactedSet.add("GOVT_ID");
  }

  // 5. Strip Mobile / Phone numbers (CN 11-digit mobile, international +852/+65/+44/+1, dashed phone numbers)
  // Carefully structured so plain math constants like 100000 or 3.14159265 are untouched.
  const phoneRegex =
    /(?:\+\d{1,3}[-\s]?\d{3,4}[-\s]?\d{4,6}|\b1[3-9]\d{9}\b|\b\d{3}-\d{3,4}-\d{4}\b)/g;
  if (phoneRegex.test(text)) {
    text = text.replace(phoneRegex, "[REDACTED_PHONE]");
    redactedSet.add("PHONE");
  }

  // 6. Strip School names (Chinese & English school suffixes)
  const schoolZhRegex =
    /[\u4e00-\u9fa5A-Za-z0-9]{2,14}(?:实验中学|外国语学校|第一中学|第二中学|第三中学|附属中学|国际学校|小学|中学)/g;
  if (schoolZhRegex.test(text)) {
    text = text.replace(schoolZhRegex, "[REDACTED_SCHOOL]");
    redactedSet.add("SCHOOL_NAME");
  }
  const schoolEnRegex =
    /\b(?:[A-Z][a-zA-Z]+\s+){1,3}(?:High School|Secondary School|Primary School|Grammar School|Academy)\b/g;
  if (schoolEnRegex.test(text)) {
    text = text.replace(schoolEnRegex, "[REDACTED_SCHOOL]");
    redactedSet.add("SCHOOL_NAME");
  }

  return {
    sanitizedText: text,
    redactedTypes: Array.from(redactedSet),
    regulation: regime.regulationName,
    anonToken,
  };
}
