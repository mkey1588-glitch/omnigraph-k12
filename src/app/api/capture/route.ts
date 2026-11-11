import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import {
  customSchoolEdges,
  privacyAuditLogs,
  studentTopicStates,
  users,
  wrongQuestions,
} from "@/db/schema";
import type {
  GeneratedQuestionInstance,
  LocaleCode,
  RegionCode,
  SubjectId,
} from "@/types/taxonomy";
import { c, uiPick } from "@/lib/i18n";
import { CAPTURE_COPY } from "@/lib/i18n/copy-capture-clearance-auth";
import { sanitizeForExternalAi } from "@/lib/engines/privacy-shield";
import { analyzeCapturedWrongQuestion } from "@/lib/engines/smart-capture-and-paper";
import { createInitialWrongCard } from "@/lib/engines/fsrs-engine";
import { generateQuestion } from "@/lib/engines/item-generator";
import { authorizeStudentAccess } from "@/lib/auth/session";

interface VisionOcrExtraction {
  stemText: string;
  wrongAnswer: string;
  handwrittenSteps: string;
  detectedSubjectId: SubjectId;
  provider: "gemini_vision" | "openai_vision" | "local_demo_ocr";
}

function parseJsonObjectFromModelText(raw: string): Record<string, unknown> | null {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace < 0 || lastBrace <= firstBrace) return null;
  try {
    return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)) as Record<
      string,
      unknown
    >;
  } catch {
    return null;
  }
}

async function runMultimodalVisionOcr(params: {
  imageDataUrl: string;
  fileName: string;
  locale: LocaleCode;
  preferredSubjectId: SubjectId | "all";
}): Promise<VisionOcrExtraction> {
  const dataUrlMatch = params.imageDataUrl.match(
    /^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/
  );

  const visionPrompt = [
    "You are an educational K12 worksheet Vision OCR & LaTeX formula extractor.",
    "Extract ONLY the academic problem stem, formulas (use concise inline LaTeX or ASCII math), any visible student wrong answer, and any handwritten working steps.",
    "PRIVACY RULE: Immediately omit and redact any student name, student ID, school name, class header, phone number, or email visible on the page.",
    "Return ONLY valid JSON with keys: {\"stemText\": string, \"wrongAnswer\": string, \"handwrittenSteps\": string, \"detectedSubjectId\": \"math\"|\"physics\"|\"chemistry\"|\"biology\"|\"english\"|\"computing\"|\"geography\"|\"history\"|\"literacy\"}.",
  ].join("\n");

  const validSubjects = new Set<SubjectId>([
    "math",
    "physics",
    "chemistry",
    "biology",
    "english",
    "computing",
    "geography",
    "history",
    "literacy",
  ]);

  // 1. Live Gemini Multimodal Vision API
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (geminiKey && dataUrlMatch) {
    try {
      const mimeType = dataUrlMatch[1];
      const base64Data = dataUrlMatch[2].replace(/\s+/g, "");
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { text: visionPrompt },
                  { inline_data: { mime_type: mimeType, data: base64Data } },
                ],
              },
            ],
            generationConfig: { temperature: 0.1, maxOutputTokens: 500 },
          }),
        }
      );
      if (resp.ok) {
        const json = (await resp.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        const parsed = parseJsonObjectFromModelText(rawText);
        if (parsed && typeof parsed.stemText === "string" && parsed.stemText.trim()) {
          const subj = String(parsed.detectedSubjectId || "math") as SubjectId;
          return {
            stemText: parsed.stemText.trim(),
            wrongAnswer: String(parsed.wrongAnswer ?? "").trim(),
            handwrittenSteps: String(parsed.handwrittenSteps ?? "").trim(),
            detectedSubjectId: validSubjects.has(subj) ? subj : "math",
            provider: "gemini_vision",
          };
        }
      }
    } catch {
      // Fall through cleanly
    }
  }

  // 2. Live OpenAI / Vercel AI Gateway Vision API
  const openaiKey = (
    process.env.OPENAI_API_KEY || process.env.AI_GATEWAY_API_KEY
  )?.trim();
  if (openaiKey && dataUrlMatch) {
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
            process.env.OPENAI_VISION_MODEL ||
            process.env.OPENAI_MODEL ||
            (process.env.OPENAI_API_KEY ? "gpt-4o-mini" : "openai/gpt-4o-mini"),
          temperature: 0.1,
          max_tokens: 500,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: visionPrompt },
                {
                  type: "image_url",
                  image_url: { url: params.imageDataUrl },
                },
              ],
            },
          ],
        }),
      });
      if (resp.ok) {
        const json = (await resp.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const rawText = json.choices?.[0]?.message?.content ?? "";
        const parsed = parseJsonObjectFromModelText(rawText);
        if (parsed && typeof parsed.stemText === "string" && parsed.stemText.trim()) {
          const subj = String(parsed.detectedSubjectId || "math") as SubjectId;
          return {
            stemText: parsed.stemText.trim(),
            wrongAnswer: String(parsed.wrongAnswer ?? "").trim(),
            handwrittenSteps: String(parsed.handwrittenSteps ?? "").trim(),
            detectedSubjectId: validSubjects.has(subj) ? subj : "math",
            provider: "openai_vision",
          };
        }
      }
    } catch {
      // Fall through cleanly
    }
  }

  // 3. Deterministic 6-locale offline fallback when no external Vision API key is set
  const fallbackSubj: SubjectId =
    params.preferredSubjectId !== "all" ? params.preferredSubjectId : "math";
  return {
    stemText: CAPTURE_COPY.ocrSimulatedStem(
      params.fileName || "worksheet.png",
      params.locale
    ),
    wrongAnswer: "(-3, -4)",
    handwrittenSteps: "y = (x - 3)^2 - 4 => vertex = (-3, -4)",
    detectedSubjectId: fallbackSubj,
    provider: "local_demo_ocr",
  };
}

export async function POST(req: Request) {
  try {
    await ensureSeeded(false);
    const body = await req.json();
    const action = String(body.action ?? "analyze");

    if (action === "ocr_image") {
      const studentId = String(body.studentId || "stu_leo");
      const access = await authorizeStudentAccess(req, studentId);
      if (!access.allowed) {
        return NextResponse.json(
          { ok: false, error: access.reason ?? "Forbidden" },
          { status: 403 }
        );
      }

      const imageDataUrl = String(body.imageDataUrl ?? "");
      const fileName = String(body.fileName || "worksheet.png");
      const regionCode = ((body.regionCode as RegionCode) || "CN") as RegionCode;
      const locale: LocaleCode = (body.locale as LocaleCode) || "zh-CN";
      const preferredSubjectId =
        (body.preferredSubjectId as SubjectId | "all") || "all";

      if (!imageDataUrl.startsWith("data:image/")) {
        return NextResponse.json(
          { ok: false, error: "Invalid image data URL payload." },
          { status: 400 }
        );
      }
      if (imageDataUrl.length > 8_500_000) {
        return NextResponse.json(
          { ok: false, error: "Image payload exceeds 8MB limit." },
          { status: 413 }
        );
      }

      const ocr = await runMultimodalVisionOcr({
        imageDataUrl,
        fileName,
        locale,
        preferredSubjectId,
      });

      const userRows = await db
        .select()
        .from(users)
        .where(eq(users.id, studentId));

      const shield = sanitizeForExternalAi({
        rawText: ocr.stemText,
        userId: studentId,
        displayName: userRows[0]?.displayName,
        regionCode,
      });

      await db.insert(privacyAuditLogs).values({
        id: `pal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        actorAnonToken: shield.anonToken,
        regionCode,
        regulation: shield.regulation,
        endpoint: "/api/capture:vision_ocr",
        redactedFieldsJson:
          shield.redactedTypes.length > 0
            ? shield.redactedTypes
            : ["VISION_HEADER_MASKED"],
        payloadPreview: shield.sanitizedText.slice(0, 150),
      });

      return NextResponse.json({
        ok: true,
        provider: ocr.provider,
        stemText: shield.sanitizedText,
        wrongAnswer: ocr.wrongAnswer,
        handwrittenSteps: ocr.handwrittenSteps,
        detectedSubjectId: ocr.detectedSubjectId,
        privacyShield: shield,
      });
    }

    if (action === "analyze") {
      const rawQuestionText = String(body.rawQuestionText ?? "");
      const studentWrongAnswer = String(body.studentWrongAnswer ?? "").trim();
      const studentId = String(body.studentId || "stu_leo");
      const access = await authorizeStudentAccess(req, studentId);
      if (!access.allowed) {
        return NextResponse.json(
          { ok: false, error: access.reason ?? "Forbidden" },
          { status: 403 }
        );
      }

      const regionCode = ((body.regionCode as RegionCode) || "CN") as RegionCode;
      const locale = (body.locale as LocaleCode | undefined) ?? undefined;
      const preferredSubjectId = (body.preferredSubjectId as SubjectId | "all") || "all";

      if (rawQuestionText.trim().length < 3) {
        const errLocale: LocaleCode = locale ?? "zh-CN";
        return NextResponse.json(
          {
            ok: false,
            error: uiPick(
              errLocale,
              c(
                "请输入或上传至少 3 个字符的错题题干描述。",
                "Please enter or upload a problem description of at least 3 characters.",
                "問題文を3文字以上入力またはアップロードしてください。",
                "문제 지문을 최소 3자 이상 입력하거나 업로드해 주세요.",
                "Sila masukkan sekurang-kurangnya 3 aksara pernyataan masalah."
              )
            ),
          },
          { status: 400 }
        );
      }

      const [userRows, schoolEdgeRows] = await Promise.all([
        db.select().from(users).where(eq(users.id, studentId)),
        db.select().from(customSchoolEdges),
      ]);

      const shield = sanitizeForExternalAi({
        rawText: rawQuestionText,
        userId: studentId,
        displayName: userRows[0]?.displayName,
        regionCode,
      });

      await db.insert(privacyAuditLogs).values({
        id: `pal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        actorAnonToken: shield.anonToken,
        regionCode,
        regulation: shield.regulation,
        endpoint: "/api/capture",
        redactedFieldsJson:
          shield.redactedTypes.length > 0
            ? shield.redactedTypes
            : ["NO_RAW_PII_DETECTED"],
        payloadPreview: shield.sanitizedText.slice(0, 150),
      });

      const analysis = analyzeCapturedWrongQuestion({
        sanitizedQuestionText: shield.sanitizedText,
        studentWrongAnswer: studentWrongAnswer || undefined,
        regionCode,
        locale,
        preferredSubjectId,
        extraEdges: schoolEdgeRows.map((e) => ({
          topicId: e.topicId,
          prerequisiteId: e.prerequisiteId,
          relationType:
            (e.relationType as "hard" | "soft" | "cross_subject") || "hard",
          reasonZh: e.reasonZh,
          reasonEn: e.reasonEn,
        })),
      });

      return NextResponse.json({
        ok: true,
        analysis,
        privacyShield: shield,
      });
    }

    if (action === "save_to_wrong_book") {
      const studentId = String(body.studentId || "stu_leo");
      const access = await authorizeStudentAccess(req, studentId);
      if (!access.allowed) {
        return NextResponse.json(
          { ok: false, error: access.reason ?? "Forbidden" },
          { status: 403 }
        );
      }
      const regionCode = ((body.regionCode as RegionCode) || "CN") as RegionCode;
      const locale: LocaleCode = (body.locale as LocaleCode) || "zh-CN";
      const topicId = String(body.topicId ?? "");
      const snapshot = body.canonicalSnapshot as GeneratedQuestionInstance;
      const wrongUserAnswer = String(
        body.wrongUserAnswer ||
          uiPick(locale, c("待订正", "Pending review", "要復習", "복습 대기", "Belum disemak"))
      );
      const misconceptionTag = String(body.misconceptionTag || "misc_captured");
      const misconceptionLabel = String(
        body.misconceptionLabel ||
          uiPick(
            locale,
            c(
              "智能录题识别概念易错点",
              "Smart Capture identified misconception",
              "AIキャプチャ検出つまずき点",
              "AI 오답 캡처 감지 오개념",
              "Salah tanggapan dikesan oleh Smart Capture"
            )
          )
      );

      const now = new Date();
      const nowIso = now.toISOString();
      const card = createInitialWrongCard(now);
      const newId = `wq_cap_${Date.now().toString(36)}`;

      await db.insert(wrongQuestions).values({
        id: newId,
        studentId,
        topicId,
        templateId: snapshot.templateId,
        questionSnapshotJson: snapshot,
        wrongUserAnswer,
        misconceptionTag,
        misconceptionLabel,
        status: card.status,
        fsrsDifficulty: card.difficulty,
        fsrsStability: card.stability,
        reps: card.reps,
        lapses: card.lapses,
        twinClearStreak: card.twinClearStreak,
        createdAt: nowIso,
        lastReviewedAt: card.lastReviewedAt,
        nextReviewAt: card.nextReviewAt,
      });

      // Mark topic as at least 'shaky' if untested so student knowledge map highlights it
      const existingState = await db
        .select()
        .from(studentTopicStates)
        .where(
          and(
            eq(studentTopicStates.studentId, studentId),
            eq(studentTopicStates.topicId, topicId)
          )
        );

      if (!existingState[0]) {
        await db.insert(studentTopicStates).values({
          studentId,
          topicId,
          status: "weak",
          pMastery: 0.3,
          attemptsCount: 1,
          correctCount: 0,
          isRootCause: false,
          lastMisconception: misconceptionTag,
          fsrsDifficulty: card.difficulty,
          fsrsStability: card.stability,
          lastPracticedAt: nowIso,
          nextReviewAt: card.nextReviewAt,
        });
      }

      const nextTwin = generateQuestion({
        topicId,
        templateId: snapshot.templateId,
        difficulty: "standard",
        regionCode,
        seed: `cap_twin_${newId}`,
        variantIndex: 2,
      });

      return NextResponse.json({
        ok: true,
        wrongQuestionId: newId,
        nextTwin,
      });
    }

    return NextResponse.json(
      { ok: false, error: `Unknown capture action: ${action}` },
      { status: 400 }
    );
  } catch (error) {
    console.error("Smart Capture API error:", error);
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
