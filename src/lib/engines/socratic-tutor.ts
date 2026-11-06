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

export interface TutorChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SocraticTutorRequest {
  topicId: string;
  regionCode: RegionCode;
  locale?: LocaleCode;
  bilingual?: boolean;
  question?: GeneratedQuestionInstance;
  studentWrongAnswer?: string;
  detectedMisconceptionTag?: string;
  messages: TutorChatMessage[];
}

export interface SocraticTutorResponse {
  reply: string;
  provider: "gemini" | "openai" | "socratic_kg_engine";
  groundedStandardCode: string;
  referencedPrerequisites: string[];
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
          };
        }
      }
    } catch {
      // Fall through cleanly to deterministic KG Socratic engine
    }
  }

  // 2. Optional Live OpenAI-compatible API integration
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(
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
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
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
          };
        }
      }
    } catch {
      // Fall through cleanly to deterministic KG Socratic engine
    }
  }

  // 3. Built-in Multi-Turn KG-Grounded Socratic Heuristic Coach (6-Locale Native!)
  const userTurns = req.messages.filter((m) => m.role === "user");
  const lastUserMsg = (userTurns[userTurns.length - 1]?.content ?? "").trim();
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
    const formula = topic?.microLesson.coreFormula ?? "";
    primaryReply = uiPick(
      locale,
      c(
        `思路已经非常接近终点啦！回顾核心关系式 \`${formula}\`：\n${
          lastLoc ? `• 关键中间提示：${lastLoc.prompt}（线索：\`${lastLoc.hint}\`）\n` : ""
        }把你算出的数值填进作答框提交验证吧——如果某一步正负号或单位不确定，把你的算式发给我，我帮你逐行诊断！`,
        `You're right at the finish line! Review the core relation \`${formula}\`:\n${
          lastLoc ? `• Key clue: ${lastLoc.prompt} (\`${lastLoc.hint}\`)\n` : ""
        }Enter your result in the answer box to verify — or share your working if you'd like me to check your signs and units!`,
        `ゴールまであと少しです！基本式 \`${formula}\` を確認しましょう：\n${
          lastLoc ? `• ヒント：${lastLoc.prompt}（手がかり：\`${lastLoc.hint}\`）\n` : ""
        }計算結果を解答欄に入力して確認してみましょう。途中式を送ってくれれば符号や単位もチェックします！`,
        `거의 다 왔어요! 핵심 관계식 \`${formula}\`을 다시 확인해 보세요:\n${
          lastLoc ? `• 핵심 단서: ${lastLoc.prompt} (힌트: \`${lastLoc.hint}\`)\n` : ""
        }계산한 값을 답안란에 입력해 제출해 보세요. 부호나 단위가 헷갈리면 풀이 과정을 보내주세요!`,
        `Anda hampir sampai ke jawapan akhir! Semak hubungan teras \`${formula}\`:\n${
          lastLoc ? `• Petunjuk utama: ${lastLoc.prompt} (\`${lastLoc.hint}\`)\n` : ""
        }Masukkan jawapan anda untuk pengesahan, atau kongsikan jalan kerja anda untuk semakan tanda dan unit!`
      )
    );
    englishCompanion = `You're right at the finish line! Apply \`${formula}\` ${
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
