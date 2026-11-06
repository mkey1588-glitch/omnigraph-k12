import type { GeneratedQuestionInstance, RegionCode } from "@/types/taxonomy";
import { ALL_REGIONAL_ALIGNMENTS } from "@/data/canonical-graph";
import { getDirectPrerequisites, getTopicById } from "./dag-engine";

export interface TutorChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SocraticTutorRequest {
  topicId: string;
  regionCode: RegionCode;
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

/**
 * KG-Grounded Socratic AI Tutor:
 *   1. Injects Canonical Topic Mastery Criteria, Regional Standard Code, Upstream Prerequisites, Scaffolds, and Detected Misconception.
 *   2. Never dumps the final answer on Turn 1 — guides step-by-step via Socratic questioning.
 *   3. Supports GEMINI_API_KEY or OPENAI_API_KEY when present, with a rich multi-turn deterministic KG Socratic Coach out-of-the-box!
 */
export async function generateSocraticTutorReply(
  req: SocraticTutorRequest
): Promise<SocraticTutorResponse> {
  const topic = getTopicById(req.topicId);
  const alignment = ALL_REGIONAL_ALIGNMENTS.find(
    (a) => a.topicId === req.topicId && a.regionCode === req.regionCode
  );
  const prereqEdges = getDirectPrerequisites(req.topicId, true);
  const prereqNames = prereqEdges
    .map((e) => getTopicById(e.prerequisiteId)?.title["zh-CN"])
    .filter((x): x is string => Boolean(x));

  const groundedStandardCode = alignment?.standardCode ?? `${req.regionCode}-CORE`;

  const misconceptionObj = topic?.microLesson.misconceptions.find(
    (m) => m.tag === req.detectedMisconceptionTag
  ) ?? topic?.microLesson.misconceptions[0];

  const systemInstruction = [
    `你是 OmniGraph K12（万象学阶）苏格拉底启发式导师，严格锚定知识图谱节点讲题。`,
    `当前地区与课标代码：${req.regionCode} (${groundedStandardCode} · ${alignment?.localStageLabel ?? ""})`,
    `当前微技能节点：${topic?.title["zh-CN"] ?? req.topicId} (${topic?.title.en ?? ""})`,
    `核心直觉与公式：${topic?.microLesson.intuition["zh-CN"] ?? ""} | ${topic?.microLesson.coreFormula ?? ""}`,
    `上游先修依赖节点：${prereqNames.join("、") || "基础根节点"}`,
    req.question ? `当前题目：${req.question.promptZh}（内部标准答案供你核对，严禁首轮直接透露：${req.question.answer}）` : "",
    req.studentWrongAnswer ? `学生刚才提交的作答：${req.studentWrongAnswer}` : "",
    misconceptionObj
      ? `重点防范迷思概念 [${misconceptionObj.tag}]：${misconceptionObj.label["zh-CN"]} — 纠偏方向：${misconceptionObj.remediationTip["zh-CN"]}`
      : "",
    `教学铁律：每次回复控制在 120 字以内，先肯定学生的思考切入点，指出卡点所在的先修原理，并用 1 个具体的小问题引导学生自己算出下一步，绝不直接替学生写出最终答案！${
      req.bilingual ? "请采用中英双语对照（Bilingual Chinese + English）回复。" : ""
    }`,
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
    const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
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

  // 3. Built-in Multi-Turn KG-Grounded Socratic Heuristic Coach (Zero-Config Out-of-the-Box!)
  const userTurns = req.messages.filter((m) => m.role === "user");
  const lastUserMsg = (userTurns[userTurns.length - 1]?.content ?? "").trim();
  const scaffolds = req.question?.scaffolds ?? [];
  const turnIdx = Math.max(0, userTurns.length - 1);

  let replyZh = "";
  let replyEn = "";

  // Check if the user actually typed the expected intermediate scaffold answer!
  const prevScaffold = scaffolds[Math.min(Math.max(0, turnIdx - 1), Math.max(0, scaffolds.length - 1))];
  const matchedPrevScaffold =
    prevScaffold &&
    lastUserMsg !== "" &&
    lastUserMsg.toLowerCase().includes(prevScaffold.expectedAnswer.toLowerCase());

  if (turnIdx === 0 || (!matchedPrevScaffold && turnIdx === 1 && scaffolds.length > 0)) {
    const s0 = scaffolds[0];
    if (misconceptionObj && (req.detectedMisconceptionTag || req.studentWrongAnswer)) {
      replyZh = `我注意到你容易掉进「**${misconceptionObj.label["zh-CN"]}**」这个常见陷阱！\n\n💡 **图谱锚点提示（${groundedStandardCode}）**：${misconceptionObj.remediationTip["zh-CN"]}\n\n我们先不急着写最终答案，试着回答第 1 小步：\n👉 **${s0 ? s0.promptZh : topic?.microLesson.steps[0]?.checkQuestion?.["zh-CN"] ?? "你能先写出本题用到的核心公式吗？"}**`;
      replyEn = `Watch out for the common trap **"${misconceptionObj.label.en}"**! ${misconceptionObj.remediationTip.en}\n👉 **Step 1 Check**: ${s0 ? s0.promptEn : "What is the first intermediate quantity we need?"}`;
    } else {
      replyZh = `很好的提问！在「**${topic?.title["zh-CN"] ?? ""}**」（课标 \`${groundedStandardCode}\`）中，核心直觉是：${topic?.microLesson.intuition["zh-CN"] ?? ""}\n\n${
        prereqNames.length > 0 ? `🔗 本题调用了先修工具：**${prereqNames.join("、")}**。\n\n` : ""
      }让我们拆解第 1 步：\n👉 **${s0 ? s0.promptZh : "观察已知条件，你觉得第一步应该先化简哪一部分？"}**`;
      replyEn = `Core intuition (${groundedStandardCode}): ${topic?.microLesson.intuition.en ?? ""}\n👉 **Step 1**: ${s0 ? s0.promptEn : "Which expression should we simplify first?"}`;
    }
  } else if (matchedPrevScaffold && scaffolds.length > 1 && turnIdx <= scaffolds.length) {
    const nextStep = scaffolds[Math.min(turnIdx, scaffolds.length - 1)];
    replyZh = `✅ 太棒了，中间量 **${prevScaffold.expectedAnswer}** 算得完全准确！\n\n乘胜追击，来看最后一步推导：\n👉 **${nextStep.promptZh}**（提示：${nextStep.hintZh}）`;
    replyEn = `✅ Spot on — **${prevScaffold.expectedAnswer}** is right! Now for the next step:\n👉 **${nextStep.promptEn}** (Hint: ${nextStep.hintEn})`;
  } else {
    const lastStep = scaffolds[scaffolds.length - 1];
    replyZh = `思路已经非常接近终点啦！回顾核心关系式 \`${topic?.microLesson.coreFormula ?? ""}\`：\n${
      lastStep
        ? `• 关键中间提示：${lastStep.promptZh}（线索：\`${lastStep.hintZh}\`）\n`
        : ""
    }把你算出的数值填进左侧作答框提交验证吧——如果某一步正负号或单位不确定，把你的算式发给我，我帮你逐行诊断！`;
    replyEn = `You're right at the finish line! Apply \`${topic?.microLesson.coreFormula ?? ""}\` ${
      lastStep ? `(Hint: ${lastStep.hintEn})` : ""
    } and submit your answer on the left—or paste your working so I can check your signs and units!`;
  }

  const finalReply = req.bilingual ? `${replyZh}\n\n---\n${replyEn}` : replyZh;

  return {
    reply: finalReply,
    provider: "socratic_kg_engine",
    groundedStandardCode,
    referencedPrerequisites: prereqNames,
  };
}
