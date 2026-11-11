import type {
  GeneratedQuestionInstance,
  LocaleCode,
  RegionCode,
} from "@/types/taxonomy";
import { ALL_REGIONAL_ALIGNMENTS } from "@/data/canonical-graph";
import { REGIONS_DATA } from "@/data/regions-and-subjects";
import {
  c,
  localizePrompt,
  localizeScaffold,
  localizeText,
  uiPick,
} from "@/lib/i18n";
import { getDirectPrerequisites, getTopicById } from "./dag-engine";
import {
  areAlgebraicExpressionsEquivalent,
  evaluateAlgebraicExpression,
  normalizeAnswerText,
} from "./grader";

export interface TutorChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface WorkingStepTransitionIssue {
  fromStepIndex: number; // 1-based
  toStepIndex: number; // 1-based
  fromStepText: string;
  toStepText: string;
  errorType: "sign_or_constant" | "coefficient_or_distribution" | "non_equivalent";
}

export interface WorkingStepDiagnosis {
  totalSteps: number;
  steps: string[];
  allStepsValid: boolean;
  firstBrokenTransition?: WorkingStepTransitionIssue;
  localizedSummary: string;
  englishSummary: string;
}

export interface SocraticTutorRequest {
  topicId: string;
  regionCode: RegionCode;
  locale?: LocaleCode;
  bilingual?: boolean;
  question?: GeneratedQuestionInstance;
  studentWrongAnswer?: string;
  detectedMisconceptionTag?: string;
  checkStepsMode?: boolean;
  messages: TutorChatMessage[];
}

export interface SocraticTutorResponse {
  reply: string;
  provider: "gemini" | "openai" | "socratic_kg_engine";
  groundedStandardCode: string;
  referencedPrerequisites: string[];
  stepDiagnosis?: WorkingStepDiagnosis | null;
}

const STEP_EVAL_ENVS: Array<Record<string, number>> = [
  { x: 1.7, y: -2.3, a: 3.1, b: -1.4, m: 2.2, n: 0.9, t: 1.5, r: 2.4 },
  { x: -2.9, y: 1.6, a: -1.8, b: 2.7, m: -0.7, n: 3.3, t: 2.8, r: 1.3 },
  { x: 0.65, y: 3.4, a: 1.25, b: 4.1, m: 1.9, n: -2.1, t: -1.3, r: 3.7 },
  { x: 4.2, y: -0.8, a: -2.5, b: -3.2, m: 3.6, n: 1.4, t: 0.45, r: 0.8 },
];

function cleanSingleWorkingLine(line: string): string {
  return line
    .trim()
    .replace(/^(?:step\s*\d+|第\s*\d+\s*步|ステップ\s*\d+|\d+\s*단계|langkah\s*\d+)\s*[:：.)）-]?\s*/i, "")
    .replace(/^(?:\(\d+\)|\d+[.)）]|[①②③④⑤⑥⑦⑧⑨•\-*])\s*/, "")
    .trim();
}

function splitWorkingSteps(raw: string): string[] {
  const normalizedArrows = raw
    .replace(/\\implies|\\Rightarrow|⟹|⇒|->|=>|→/g, "\n")
    .replace(/[;；]/g, "\n");
  const rawLines = normalizedArrows
    .split(/\r?\n/)
    .map(cleanSingleWorkingLine)
    .filter(Boolean);

  // Also support single-line chained expression simplifications like `(x+3)^2 = x^2 + 9 = ...`
  if (rawLines.length === 1) {
    const eqParts = rawLines[0]
      .split("=")
      .map((p) => p.trim())
      .filter(Boolean);
    if (eqParts.length >= 3) {
      return eqParts;
    }
  }

  return rawLines;
}

function checkEquationTransition(
  lhsA: string,
  rhsA: string,
  lhsB: string,
  rhsB: string
): { valid: boolean; errorType?: WorkingStepTransitionIssue["errorType"] } | null {
  const resA = `(${lhsA}) - (${rhsA})`;
  const resB = `(${lhsB}) - (${rhsB})`;

  const ratios: number[] = [];
  const diffs: number[] = [];
  let validPairs = 0;

  for (const env of STEP_EVAL_ENVS) {
    const dA = evaluateAlgebraicExpression(resA, env);
    const dB = evaluateAlgebraicExpression(resB, env);
    if (dA === null || dB === null) continue;
    validPairs += 1;
    diffs.push(dB - dA);
    if (Math.abs(dA) > 1e-8) {
      ratios.push(dB / dA);
    }
  }

  if (validPairs < 3) return null;

  // 1. Non-zero constant scalar multiple: D_B(x) === c * D_A(x), c != 0
  if (ratios.length >= 3) {
    const c0 = ratios[0];
    const allSameRatio =
      Math.abs(c0) > 1e-7 &&
      ratios.every((r) => Math.abs(r - c0) < 1e-5 * Math.max(1, Math.abs(c0)));
    if (allSameRatio) {
      return { valid: true };
    }
  }

  // 2. Root-implication check for valid square-root / factor branch steps
  // e.g. `(x - 3)^2 = 16 => x - 3 = 4` where x* = 7 satisfies D_A(7) = 0
  const varMatches = [
    ...new Set(
      [...`${lhsA} ${rhsA} ${lhsB} ${rhsB}`.matchAll(/[a-zA-Z]/g)].map((m) =>
        m[0].toLowerCase()
      )
    ),
  ];
  if (varMatches.length === 1) {
    const v = varMatches[0];
    const b0 = evaluateAlgebraicExpression(resB, { [v]: 0 });
    const b1 = evaluateAlgebraicExpression(resB, { [v]: 1 });
    const b2 = evaluateAlgebraicExpression(resB, { [v]: 2 });
    if (b0 !== null && b1 !== null && b2 !== null) {
      const slope1 = b1 - b0;
      const slope2 = b2 - b1;
      // Linear in `v` with non-zero slope
      if (Math.abs(slope1 - slope2) < 1e-6 && Math.abs(slope1) > 1e-7) {
        const root = -b0 / slope1;
        const aAtRoot = evaluateAlgebraicExpression(resA, { [v]: root });
        if (aAtRoot !== null && Math.abs(aAtRoot) < 1e-5) {
          return { valid: true };
        }
      }
    }
  }

  // Classify why equivalence broke:
  // If parentheses/brackets were expanded across this step, a constant-only discrepancy happens when
  // the outer factor multiplied the variable term but missed the constant inside the brackets
  // (e.g. `2(x - 3) = 8 => 2x - 3 = 8`), which is a classic distributive error.
  const expandedBrackets =
    /[()[\]]/.test(`${lhsA} ${rhsA}`) && !/[()[\]]/.test(`${lhsB} ${rhsB}`);
  const diff0 = diffs[0];
  const isConstantShift =
    Math.abs(diff0) > 1e-6 && diffs.every((d) => Math.abs(d - diff0) < 1e-5);

  return {
    valid: false,
    errorType:
      isConstantShift && !expandedBrackets
        ? "sign_or_constant"
        : "coefficient_or_distribution",
  };
}

/**
 * Deterministic Algebraic Step-by-Step Working Checker:
 * Evaluates multi-line student derivations (`2x - 6 = 10 => 2x = 4 => x = 2` or `(x+3)^2 => x^2 + 9`)
 * and pinpoints the exact first line transition (`Step k -> Step k+1`) where equivalence broke!
 */
export function diagnoseStepByStepWorking(
  rawStepsText: string,
  locale: LocaleCode = "zh-CN"
): WorkingStepDiagnosis | null {
  const steps = splitWorkingSteps(rawStepsText);
  if (steps.length < 2) return null;

  let checkedTransitions = 0;
  let brokenIssue: WorkingStepTransitionIssue | undefined;

  for (let i = 0; i < steps.length - 1; i++) {
    const rawA = steps[i];
    const rawB = steps[i + 1];

    const normA = normalizeAnswerText(rawA);
    const normB = normalizeAnswerText(rawB);

    const eqSplitA = normA.replace(/^=\s*/, "").split("=");
    const eqSplitB = normB.replace(/^=\s*/, "").split("=");

    if (
      !normA.startsWith("=") &&
      !normB.startsWith("=") &&
      eqSplitA.length === 2 &&
      eqSplitB.length === 2
    ) {
      const check = checkEquationTransition(
        eqSplitA[0],
        eqSplitA[1],
        eqSplitB[0],
        eqSplitB[1]
      );
      if (check) {
        checkedTransitions += 1;
        if (!check.valid) {
          brokenIssue = {
            fromStepIndex: i + 1,
            toStepIndex: i + 2,
            fromStepText: rawA,
            toStepText: rawB,
            errorType: check.errorType ?? "non_equivalent",
          };
          break;
        }
      }
      continue;
    }

    // Expression simplification chain (e.g. `3(x - 2) + 4` -> `= 3x - 2 + 4`)
    const exprA = normA.replace(/^=\s*/, "").trim();
    const exprB = normB.replace(/^=\s*/, "").trim();
    const probeA = evaluateAlgebraicExpression(exprA, STEP_EVAL_ENVS[0]);
    const probeB = evaluateAlgebraicExpression(exprB, STEP_EVAL_ENVS[0]);
    if (probeA !== null && probeB !== null) {
      checkedTransitions += 1;
      if (!areAlgebraicExpressionsEquivalent(exprA, exprB)) {
        const expandedBrackets =
          /[()[\]]/.test(exprA) && !/[()[\]]/.test(exprB);
        const d0 =
          (evaluateAlgebraicExpression(exprB, STEP_EVAL_ENVS[0]) ?? 0) -
          (evaluateAlgebraicExpression(exprA, STEP_EVAL_ENVS[0]) ?? 0);
        const d1 =
          (evaluateAlgebraicExpression(exprB, STEP_EVAL_ENVS[1]) ?? 0) -
          (evaluateAlgebraicExpression(exprA, STEP_EVAL_ENVS[1]) ?? 0);
        const isConstShift = Math.abs(d0 - d1) < 1e-5;
        brokenIssue = {
          fromStepIndex: i + 1,
          toStepIndex: i + 2,
          fromStepText: rawA,
          toStepText: rawB,
          errorType:
            isConstShift && !expandedBrackets
              ? "sign_or_constant"
              : "coefficient_or_distribution",
        };
        break;
      }
    }
  }

  if (checkedTransitions === 0) return null;

  if (!brokenIssue) {
    const localizedSummary = uiPick(
      locale,
      c(
        `✅ **逐行步骤等价校验通过（共 ${steps.length} 步）**！\n你的每一步代数变形都保持了严格的等式/代数等价性。请检查是否已化到最简形式，直接填入左侧答案框提交吧！`,
        `✅ **Step-by-Step Equivalence Verified (${steps.length} steps)**!\nEvery algebraic transition in your working preserves equivalence. Double-check simplest form and submit your final value!`,
        `✅ **途中式の行ごと等値チェック完了（全 ${steps.length} ステップ合格）**！\nすべての式変形が数学的に正しく保たれています。最も簡単な形になっているか確認して解答欄から提出しましょう！`,
        `✅ **단계별 풀이 동치 검증 통과 (총 ${steps.length}단계)**!\n모든 대수 변형 단계가 등식 동치성을 정확히 유지하고 있습니다. 기약 형태인지 확인한 뒤 답안란에 제출해 보세요!`,
        `✅ **Semakan Kesetaraan Langkah demi Langkah Lulus (${steps.length} langkah)**!\nSetiap langkah transformasi algebra anda adalah setara. Pastikan bentuk termudah dan hantar jawapan anda!`
      )
    );
    return {
      totalSteps: steps.length,
      steps,
      allStepsValid: true,
      localizedSummary,
      englishSummary: `✅ Step-by-Step Equivalence Verified (${steps.length} steps)! Every algebraic transition preserves equivalence.`,
    };
  }

  const { fromStepIndex, toStepIndex, fromStepText, toStepText, errorType } =
    brokenIssue;

  const hintByType =
    errorType === "sign_or_constant"
      ? c(
          "常数项或移项符号在跨过等号时出现了偏差（移项变号或正负数加减失误）。试着在原第 " +
            `${fromStepIndex} 步等号两边同时做相同的加减运算，重新写出第 ${toStepIndex} 步会是什么？`,
          `The constant term shifted inconsistently (likely a transposition sign flip or signed arithmetic slip). Try applying the exact same inverse operation to BOTH sides of Step ${fromStepIndex} — what should Step ${toStepIndex} become?`,
          `定数項または移項時の符号にずれが生じています（移項の符号反転ミスまたは正負の計算ミス）。ステップ ${fromStepIndex} の両辺に同じ逆演算を行うと、ステップ ${toStepIndex} はどうなりますか？`,
          `상수항 또는 이항 부호에서 오차가 발생했습니다(이항 시 부호 반전 누락 또는 부호 계산 실수). ${fromStepIndex}단계 양변에 똑같은 역연산을 적용하면 ${toStepIndex}단계는 어떻게 바뀌나요?`,
          `Sebutan pemalar berubah secara tidak konsisten (kemungkinan kesilapan tanda semasa pemindahan sebutan). Cuba lakukan operasi songsang yang sama pada KEDUA-DUA belah Langkah ${fromStepIndex} — apakah Langkah ${toStepIndex} yang betul?`
        )
      : c(
          `系数分配或乘除变形不等价（请检查去括号分配律是否乘到了每一项，或两边同除以系数时是否遗漏某一项）。重新核对第 ${fromStepIndex} 步到第 ${toStepIndex} 步的系数变化吧！`,
          `Coefficient scaling or bracket expansion broke equivalence (check whether every term inside parentheses or across both sides was multiplied/divided equally). Re-check the coefficients from Step ${fromStepIndex} to Step ${toStepIndex}!`,
          `係数の処理またはカッコの展開で等値性が崩れています（分配法則ですべての項に掛けたか、両辺を同じ係数で割ったか確認しましょう）。ステップ ${fromStepIndex} からステップ ${toStepIndex} の係数を見直してみてください！`,
          `계수 처리 또는 괄호 전개에서 동치성이 깨졌습니다(분배법칙이 모든 항에 적용되었는지, 양변을 같은 계수로 나누었는지 확인하세요). ${fromStepIndex}단계에서 ${toStepIndex}단계로 갈 때의 계수를 다시 점검해 볼까요?`,
          `Pengembangan kurungan atau pembahagian pekali tidak setara (semak sama ada setiap sebutan didarab/dibahagi secara sekata). Semak semula pekali dari Langkah ${fromStepIndex} ke Langkah ${toStepIndex}!`
        );

  const localizedSummary = uiPick(
    locale,
    c(
      `🔍 **逐行步骤诊断结果：第 ${fromStepIndex} 步 → 第 ${toStepIndex} 步开始不等价！**\n• 第 ${fromStepIndex} 步：\`${fromStepText}\`\n• 第 ${toStepIndex} 步：\`${toStepText}\` ⚠️\n\n💡 **苏格拉底纠偏提问**：${hintByType.zh}`,
      `🔍 **Step-by-Step Check: Equivalence broke between Step ${fromStepIndex} → Step ${toStepIndex}!**\n• Step ${fromStepIndex}: \`${fromStepText}\`\n• Step ${toStepIndex}: \`${toStepText}\` ⚠️\n\n💡 **Socratic Check**: ${hintByType.en}`,
      `🔍 **途中式ステップ診断：ステップ ${fromStepIndex} → ステップ ${toStepIndex} で等値性が崩れています！**\n• ステップ ${fromStepIndex}：\`${fromStepText}\`\n• ステップ ${toStepIndex}：\`${toStepText}\` ⚠️\n\n💡 **ソクラテス式チェック**：${hintByType.ja ?? hintByType.en}`,
      `🔍 **단계별 풀이 진단: ${fromStepIndex}단계 → ${toStepIndex}단계에서 등치성이 깨졌습니다!**\n• ${fromStepIndex}단계: \`${fromStepText}\`\n• ${toStepIndex}단계: \`${toStepText}\` ⚠️\n\n💡 **소크라테스 점검 질문**: ${hintByType.ko ?? hintByType.en}`,
      `🔍 **Semakan Langkah: Kesetaraan terputus antara Langkah ${fromStepIndex} → Langkah ${toStepIndex}!**\n• Langkah ${fromStepIndex}: \`${fromStepText}\`\n• Langkah ${toStepIndex}: \`${toStepText}\` ⚠️\n\n💡 **Soalan Sokratik**: ${hintByType.ms ?? hintByType.en}`
    )
  );

  return {
    totalSteps: steps.length,
    steps,
    allStepsValid: false,
    firstBrokenTransition: brokenIssue,
    localizedSummary,
    englishSummary: `🔍 Step-by-Step Check: Equivalence broke at Step ${fromStepIndex} (\`${fromStepText}\`) → Step ${toStepIndex} (\`${toStepText}\`). ${hintByType.en}`,
  };
}

const LOCALE_LANGUAGE_NAME: Record<LocaleCode, string> = {
  "zh-CN": "Simplified Chinese (简体中文)",
  "zh-TW": "Traditional Chinese (繁體中文)",
  en: "English",
  ja: "Japanese (日本語)",
  ko: "Korean (한국어)",
  ms: "Bahasa Melayu",
};

/**
 * KG-Grounded Socratic AI Tutor:
 *   1. Injects Canonical Topic Mastery Criteria, Regional Standard Code, Upstream Prerequisites, Scaffolds, and Detected Misconception.
 *   2. Never dumps the final answer on Turn 1 — guides step-by-step via Socratic questioning.
 *   3. Supports GEMINI_API_KEY or OPENAI_API_KEY when present, with a rich multi-turn deterministic KG Socratic Coach out-of-the-box!
 */
export async function generateSocraticTutorReply(
  req: SocraticTutorRequest
): Promise<SocraticTutorResponse> {
  const regionMeta = REGIONS_DATA.find((r) => r.code === req.regionCode);
  const locale: LocaleCode = req.locale ?? regionMeta?.primaryLocale ?? "zh-CN";

  const topic = getTopicById(req.topicId);
  const alignment = ALL_REGIONAL_ALIGNMENTS.find(
    (a) => a.topicId === req.topicId && a.regionCode === req.regionCode
  );
  const prereqEdges = getDirectPrerequisites(req.topicId, true);
  const prereqNames = prereqEdges
    .map((e) => {
      const pt = getTopicById(e.prerequisiteId);
      return pt ? localizeText(pt.title, locale, false) : undefined;
    })
    .filter((x): x is string => Boolean(x));

  const groundedStandardCode = alignment?.standardCode ?? `${req.regionCode}-CORE`;

  const misconceptionObj =
    topic?.microLesson.misconceptions.find(
      (m) => m.tag === req.detectedMisconceptionTag
    ) ?? topic?.microLesson.misconceptions[0];

  const topicTitleLoc = topic ? localizeText(topic.title, locale, false) : req.topicId;
  const intuitionLoc = topic ? localizeText(topic.microLesson.intuition, locale, false) : "";
  const miscLabelLoc = misconceptionObj
    ? localizeText(misconceptionObj.label, locale, false)
    : "";
  const miscTipLoc = misconceptionObj
    ? localizeText(misconceptionObj.remediationTip, locale, false)
    : "";

  const userTurns = req.messages.filter((m) => m.role === "user");
  const lastUserMsg = (userTurns[userTurns.length - 1]?.content ?? "").trim();

  // Deterministic Algebraic Step-by-Step Working Checker (triggers explicitly or on multi-step equations)
  const looksLikeMultiStepWorking =
    Boolean(req.checkStepsMode) ||
    (/(?:\r?\n|=>|->|⇒|⟹|→)/.test(lastUserMsg) &&
      /[=+\-*/^]/.test(lastUserMsg));
  const stepDiagnosis = looksLikeMultiStepWorking
    ? diagnoseStepByStepWorking(lastUserMsg, locale)
    : null;

  const systemInstruction = [
    `You are the OmniGraph K12 Socratic Tutor strictly grounded in the Knowledge Graph.`,
    `Active Region & Standard: ${req.regionCode} (${groundedStandardCode})`,
    `Micro-Topic: ${topicTitleLoc} (${topic?.title.en ?? ""})`,
    `Core Intuition & Formula: ${intuitionLoc} | ${topic?.microLesson.coreFormula ?? ""}`,
    `Upstream Prerequisites: ${prereqNames.join(", ") || "Root Node"}`,
    req.question
      ? `Active Problem: ${localizePrompt(req.question, locale, false)} (Internal answer key — DO NOT reveal directly on Turn 1: ${req.question.answer})`
      : "",
    req.studentWrongAnswer ? `Student's recent attempt: ${req.studentWrongAnswer}` : "",
    stepDiagnosis
      ? `Verified Algebraic Step Check: ${stepDiagnosis.englishSummary}`
      : "",
    misconceptionObj
      ? `Watch for misconception [${misconceptionObj.tag}]: ${miscLabelLoc} — Remediation: ${miscTipLoc}`
      : "",
    `Pedagogical Rule: Keep replies concise (<120 words). Acknowledge the student's effort, point to the relevant prerequisite principle, and ask ONE specific guiding step question without giving away the final answer!`,
    `Language Rule: Respond strictly in ${LOCALE_LANGUAGE_NAME[locale]}${
      req.bilingual && locale !== "en" ? " paired with concise English" : ""
    }. Never output Simplified Chinese unless locale is zh-CN.`,
  ]
    .filter(Boolean)
    .join("\n");

  // 1. Optional Live Gemini API integration
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: req.messages.map((m) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }],
            })),
            generationConfig: { temperature: 0.4, maxOutputTokens: 350 },
          }),
        }
      );
      if (resp.ok) {
        const data = (await resp.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) {
          return {
            reply: text,
            provider: "gemini",
            groundedStandardCode,
            referencedPrerequisites: prereqNames,
            stepDiagnosis,
          };
        }
      }
    } catch {
      // Fall through cleanly to deterministic KG Socratic engine
    }
  }

  // 2. Optional Live OpenAI-compatible / AI Gateway API integration
  const openaiKey = process.env.OPENAI_API_KEY || process.env.AI_GATEWAY_API_KEY;
  if (openaiKey) {
    const defaultBase = process.env.OPENAI_API_KEY
      ? "https://api.openai.com/v1"
      : "https://ai-gateway.vercel.sh/v1";
    const baseUrl = (process.env.OPENAI_BASE_URL || defaultBase).replace(
      /\/$/,
      ""
    );
    try {
      const resp = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model:
            process.env.OPENAI_MODEL ||
            (process.env.OPENAI_API_KEY ? "gpt-4o-mini" : "openai/gpt-4o-mini"),
          temperature: 0.4,
          max_tokens: 350,
          messages: [
            { role: "system", content: systemInstruction },
            ...req.messages,
          ],
        }),
      });
      if (resp.ok) {
        const data = (await resp.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) {
          return {
            reply: text,
            provider: "openai",
            groundedStandardCode,
            referencedPrerequisites: prereqNames,
            stepDiagnosis,
          };
        }
      }
    } catch {
      // Fall through cleanly to deterministic KG Socratic engine
    }
  }

  // 3. Built-in Multi-Turn KG-Grounded Socratic Heuristic Coach + Step Checker (6-Locale Native!)
  if (stepDiagnosis) {
    const finalStepReply =
      req.bilingual && locale !== "en"
        ? `${stepDiagnosis.localizedSummary}\n\n---\n${stepDiagnosis.englishSummary}`
        : stepDiagnosis.localizedSummary;
    return {
      reply: finalStepReply,
      provider: "socratic_kg_engine",
      groundedStandardCode,
      referencedPrerequisites: prereqNames,
      stepDiagnosis,
    };
  }

  const scaffolds = req.question?.scaffolds ?? [];
  const turnIdx = Math.max(0, userTurns.length - 1);

  const prevScaffoldRaw =
    scaffolds[Math.min(Math.max(0, turnIdx - 1), Math.max(0, scaffolds.length - 1))];
  const matchedPrevScaffold =
    prevScaffoldRaw &&
    lastUserMsg !== "" &&
    (lastUserMsg.toLowerCase().includes(prevScaffoldRaw.expectedAnswer.toLowerCase()) ||
      (prevScaffoldRaw.expectedAnswerEn &&
        lastUserMsg
          .toLowerCase()
          .includes(prevScaffoldRaw.expectedAnswerEn.toLowerCase())));

  let primaryReply = "";
  let englishCompanion = "";

  if (turnIdx === 0 || (!matchedPrevScaffold && turnIdx === 1 && scaffolds.length > 0)) {
    const s0 = scaffolds[0] ? localizeScaffold(scaffolds[0], locale) : null;
    const s0En = scaffolds[0] ? localizeScaffold(scaffolds[0], "en") : null;
    const fallbackStepLoc = topic?.microLesson.steps[0]?.checkQuestion
      ? localizeText(topic.microLesson.steps[0].checkQuestion, locale, false)
      : uiPick(
          locale,
          c(
            "你能先写出本题用到的核心公式或第一步关系式吗？",
            "What is the first intermediate quantity or formula we need here?",
            "まずこの問題で使う基本公式や最初のステップを書き出せますか？",
            "먼저 이 문제에 쓰이는 핵심 공식이나 첫 단계를 적어볼까요?",
            "Apakah formula utama atau kuantiti perantaraan pertama yang diperlukan?"
          )
        );

    if (misconceptionObj && (req.detectedMisconceptionTag || req.studentWrongAnswer)) {
      primaryReply = uiPick(
        locale,
        c(
          `我注意到你容易掉进「**${miscLabelLoc}**」这个常见陷阱！\n\n💡 **图谱锚点提示（${groundedStandardCode}）**：${miscTipLoc}\n\n我们先不急着写最终答案，试着回答第 1 小步：\n👉 **${s0 ? s0.prompt : fallbackStepLoc}**`,
          `Watch out for the common misconception **"${miscLabelLoc}"**!\n\n💡 **KG Anchor (${groundedStandardCode})**: ${miscTipLoc}\n\nLet's pause before the final answer and check Step 1:\n👉 **${s0 ? s0.prompt : fallbackStepLoc}**`,
          `よくあるつまずき「**${miscLabelLoc}**」に注意しましょう！\n\n💡 **単元アンカー（${groundedStandardCode}）**：${miscTipLoc}\n\n最終解答の前に、まずステップ1を確認しましょう：\n👉 **${s0 ? s0.prompt : fallbackStepLoc}**`,
          `자주 발생하는 오개념 「**${miscLabelLoc}**」 함정에 주의하세요!\n\n💡 **지식그래프 앵커 (${groundedStandardCode})**: ${miscTipLoc}\n\n최종 답을 적기 전에 먼저 1단계를 확인해 볼까요?\n👉 **${s0 ? s0.prompt : fallbackStepLoc}**`,
          `Berhati-hati dengan salah tanggapan lazim **"${miscLabelLoc}"**!\n\n💡 **Sauh Graf (${groundedStandardCode})**: ${miscTipLoc}\n\nMari semak Langkah 1 terlebih dahulu:\n👉 **${s0 ? s0.prompt : fallbackStepLoc}**`
        )
      );
      englishCompanion = `Watch out for **"${misconceptionObj.label.en}"**! ${misconceptionObj.remediationTip.en}\n👉 **Step 1**: ${s0En ? s0En.prompt : "What is the first intermediate quantity we need?"}`;
    } else {
      const prereqLine =
        prereqNames.length > 0
          ? uiPick(
              locale,
              c(
                `🔗 本题调用了先修工具：**${prereqNames.join("、")}**。\n\n`,
                `🔗 Prerequisites invoked: **${prereqNames.join(", ")}**.\n\n`,
                `🔗 関連する前提単元：**${prereqNames.join("・")}**。\n\n`,
                `🔗 연계된 선수 개념: **${prereqNames.join(", ")}**.\n\n`,
                `🔗 Prasyarat berkaitan: **${prereqNames.join(", ")}**.\n\n`
              )
            )
          : "";
      primaryReply = uiPick(
        locale,
        c(
          `很好的提问！在「**${topicTitleLoc}**」（课标 \`${groundedStandardCode}\`）中，核心直觉是：${intuitionLoc}\n\n${prereqLine}让我们拆解第 1 步：\n👉 **${s0 ? s0.prompt : fallbackStepLoc}**`,
          `Great question! In **${topicTitleLoc}** (\`${groundedStandardCode}\`), the core intuition is: ${intuitionLoc}\n\n${prereqLine}Let's break down Step 1:\n👉 **${s0 ? s0.prompt : fallbackStepLoc}**`,
          `良い質問です！「**${topicTitleLoc}**」（基準 \`${groundedStandardCode}\`）の核心イメージは：${intuitionLoc}\n\n${prereqLine}ステップ1から一緒に解きましょう：\n👉 **${s0 ? s0.prompt : fallbackStepLoc}**`,
          `좋은 질문이에요! 「**${topicTitleLoc}**」(성취기준 \`${groundedStandardCode}\`)의 핵심 직관은 다음과 같습니다: ${intuitionLoc}\n\n${prereqLine}1단계부터 차근차근 풀어볼까요?\n👉 **${s0 ? s0.prompt : fallbackStepLoc}**`,
          `Soalan yang baik! Dalam **${topicTitleLoc}** (\`${groundedStandardCode}\`), intuisi utamanya ialah: ${intuitionLoc}\n\n${prereqLine}Mari mulakan dengan Langkah 1:\n👉 **${s0 ? s0.prompt : fallbackStepLoc}**`
        )
      );
      englishCompanion = `Core intuition (${groundedStandardCode}): ${topic?.microLesson.intuition.en ?? ""}\n👉 **Step 1**: ${s0En ? s0En.prompt : "Which expression should we simplify first?"}`;
    }
  } else if (matchedPrevScaffold && scaffolds.length > 1 && turnIdx <= scaffolds.length) {
    const prevLoc = localizeScaffold(prevScaffoldRaw, locale);
    const nextRaw = scaffolds[Math.min(turnIdx, scaffolds.length - 1)];
    const nextLoc = localizeScaffold(nextRaw, locale);
    const nextEn = localizeScaffold(nextRaw, "en");
    primaryReply = uiPick(
      locale,
      c(
        `✅ 太棒了，中间量 **${prevLoc.expected}** 算得完全准确！\n\n乘胜追击，来看下一步推导：\n👉 **${nextLoc.prompt}**（提示：${nextLoc.hint}）`,
        `✅ Spot on — **${prevLoc.expected}** is completely right!\n\nNow let's take the next step:\n👉 **${nextLoc.prompt}** (Hint: ${nextLoc.hint})`,
        `✅ 素晴らしい！中間値 **${prevLoc.expected}** は大正解です！\n\nこの調子で次のステップに進みましょう：\n👉 **${nextLoc.prompt}**（ヒント：${nextLoc.hint}）`,
        `✅ 정확해요! 중간값 **${prevLoc.expected}** 계산이 완벽합니다!\n\n이어서 다음 단계를 유도해 볼까요?\n👉 **${nextLoc.prompt}** (힌트: ${nextLoc.hint})`,
        `✅ Tepat sekali — **${prevLoc.expected}** adalah betul!\n\nSekarang mari teruskan ke langkah seterusnya:\n👉 **${nextLoc.prompt}** (Petunjuk: ${nextLoc.hint})`
      )
    );
    englishCompanion = `✅ Spot on — **${localizeScaffold(prevScaffoldRaw, "en").expected}** is right! Next step:\n👉 **${nextEn.prompt}** (Hint: ${nextEn.hint})`;
  } else {
    const lastRaw = scaffolds[scaffolds.length - 1];
    const lastLoc = lastRaw ? localizeScaffold(lastRaw, locale) : null;
    const lastEn = lastRaw ? localizeScaffold(lastRaw, "en") : null;
    const rawFormula = topic?.microLesson.coreFormula ?? "";
    const formula = rawFormula.includes("$") ? rawFormula : rawFormula ? `\`${rawFormula}\`` : "";
    primaryReply = uiPick(
      locale,
      c(
        `思路已经非常接近终点啦！回顾核心关系式 ${formula}：\n${
          lastLoc ? `• 关键中间提示：${lastLoc.prompt}（线索：${lastLoc.hint}）\n` : ""
        }把你算出的数值填进作答框提交验证吧——如果某一步正负号或单位不确定，把你的算式发给我，我帮你逐行诊断！`,
        `You're right at the finish line! Review the core relation ${formula}:\n${
          lastLoc ? `• Key clue: ${lastLoc.prompt} (${lastLoc.hint})\n` : ""
        }Enter your result in the answer box to verify — or share your working if you'd like me to check your signs and units!`,
        `ゴールまであと少しです！基本式 ${formula} を確認しましょう：\n${
          lastLoc ? `• ヒント：${lastLoc.prompt}（手がかり：${lastLoc.hint}）\n` : ""
        }計算結果を解答欄に入力して確認してみましょう。途中式を送っていただければ符号や単位もチェックします！`,
        `거의 다 왔어요! 핵심 관계식 ${formula}을(를) 다시 확인해 보세요:\n${
          lastLoc ? `• 핵심 단서: ${lastLoc.prompt} (힌트: ${lastLoc.hint})\n` : ""
        }계산한 값을 답안란에 입력해 제출해 보세요. 부호나 단위가 헷갈리면 풀이 과정을 보내주세요!`,
        `Anda hampir sampai ke jawapan akhir! Semak hubungan teras ${formula}:\n${
          lastLoc ? `• Petunjuk utama: ${lastLoc.prompt} (${lastLoc.hint})\n` : ""
        }Masukkan jawapan anda untuk pengesahan, atau kongsikan jalan kerja anda untuk semakan tanda dan unit!`
      )
    );
    englishCompanion = `You're right at the finish line! Apply ${formula} ${
      lastEn ? `(Hint: ${lastEn.hint})` : ""
    } and submit your answer!`;
  }

  const finalReply =
    req.bilingual && locale !== "en"
      ? `${primaryReply}\n\n---\n${englishCompanion}`
      : primaryReply;

  return {
    reply: finalReply,
    provider: "socratic_kg_engine",
    groundedStandardCode,
    referencedPrerequisites: prereqNames,
  };
}
