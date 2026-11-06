import { NextResponse } from "next/server";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { customSchoolQuestions, irtItemStats } from "@/db/schema";
import type { DifficultyTier, RegionCode, SubjectId } from "@/types/taxonomy";
import { buildSmartExamPapers } from "@/lib/engines/smart-capture-and-paper";

export async function POST(req: Request) {
  try {
    await ensureSeeded(false);
    const body = await req.json();

    const regionCode = ((body.regionCode as RegionCode) || "CN") as RegionCode;
    const subjectId = ((body.subjectId as SubjectId) || "math") as SubjectId;
    const topicIds = Array.isArray(body.topicIds) ? (body.topicIds as string[]) : [];
    const totalItems = Number(body.totalItems ?? 8);
    const includeCustom = Boolean(body.includeCustom ?? true);
    const paperTitle = String(body.paperTitle ?? "");
    const paperSeed = String(body.paperSeed ?? `paper_${Date.now()}`);

    const ratio = {
      basicPct: Number(body.ratio?.basicPct ?? 30),
      standardPct: Number(body.ratio?.standardPct ?? 50),
      challengePct: Number(body.ratio?.challengePct ?? 20),
    };

    const [allIrt, allCustom] = await Promise.all([
      db.select().from(irtItemStats),
      includeCustom ? db.select().from(customSchoolQuestions) : Promise.resolve([]),
    ]);

    const irtBetaByTemplate: Record<string, number> = {};
    for (const row of allIrt) {
      irtBetaByTemplate[row.templateId] = row.calibratedBeta;
    }

    const bundle = buildSmartExamPapers({
      paperTitle,
      regionCode,
      subjectId,
      topicIds,
      totalItems,
      ratio,
      paperSeed,
      irtBetaByTemplate,
      customQuestions: allCustom.map((cq) => ({
        id: cq.id,
        topicId: cq.topicId,
        difficulty: (cq.difficulty as DifficultyTier) || "standard",
        promptZh: cq.promptZh,
        promptEn: cq.promptEn,
        latexFormula: cq.latexFormula,
        choicesJson: cq.choicesJson,
        answer: cq.answer,
        explanationZh: cq.explanationZh,
      })),
    });

    return NextResponse.json({
      ok: true,
      bundle,
    });
  } catch (error) {
    console.error("Smart Paper Builder API error:", error);
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
