import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { customSchoolEdges, customSchoolQuestions } from "@/db/schema";
import { CANONICAL_EDGES } from "@/data/canonical-graph";
import { validateCustomEdgeAcyclic } from "@/lib/engines/irt-engine";

export async function POST(req: Request) {
  try {
    await ensureSeeded(false);
    const body = await req.json();
    const action = String(body.action ?? "");

    // 1. Add Custom School Prerequisite Edge (Protected by Live DAG Cycle Guard!)
    if (action === "add_edge") {
      const topicId = String(body.topicId ?? "");
      const prerequisiteId = String(body.prerequisiteId ?? "");
      const relationType = String(body.relationType || "hard");
      const reasonZh = String(body.reasonZh ?? "").trim() || "校本教研自定义先修依赖";
      const reasonEn = String(body.reasonEn ?? "").trim() || "Custom school prerequisite";
      const createdBy = String(body.createdBy || "王知行老师 Ms. Evelyn Wang");

      if (!topicId || !prerequisiteId) {
        return NextResponse.json(
          { ok: false, error: "请选择目标节点与上游先修节点。" },
          { status: 400 }
        );
      }

      const existingCustom = await db.select().from(customSchoolEdges);
      const combinedEdges = [
        ...CANONICAL_EDGES.map((e) => ({
          topicId: e.topicId,
          prerequisiteId: e.prerequisiteId,
        })),
        ...existingCustom.map((e) => ({
          topicId: e.topicId,
          prerequisiteId: e.prerequisiteId,
        })),
      ];

      const check = validateCustomEdgeAcyclic(combinedEdges, {
        topicId,
        prerequisiteId,
      });

      if (!check.ok) {
        return NextResponse.json(
          {
            ok: false,
            error: check.reasonZh,
            cyclePath: check.cyclePath,
          },
          { status: 422 }
        );
      }

      const newId = `cse_${Date.now().toString(36)}`;
      await db.insert(customSchoolEdges).values({
        id: newId,
        topicId,
        prerequisiteId,
        relationType,
        reasonZh,
        reasonEn,
        createdBy,
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({
        ok: true,
        id: newId,
      });
    }

    // 2. Delete Custom School Edge
    if (action === "delete_edge") {
      const id = String(body.id ?? "");
      await db.delete(customSchoolEdges).where(eq(customSchoolEdges.id, id));
      return NextResponse.json({ ok: true });
    }

    // 3. Author Custom KaTeX School Question
    if (action === "add_custom_question") {
      const topicId = String(body.topicId ?? "");
      const difficulty = String(body.difficulty || "standard");
      const promptZh = String(body.promptZh ?? "").trim();
      const promptEn = String(body.promptEn ?? "").trim() || promptZh;
      const latexFormula = String(body.latexFormula ?? "").trim() || null;
      const choicesJson = Array.isArray(body.choicesJson)
        ? (body.choicesJson as string[]).map((s) => String(s).trim()).filter(Boolean)
        : [];
      const answer = String(body.answer ?? "A").trim();
      const explanationZh =
        String(body.explanationZh ?? "").trim() || "请参考对应微技能核心公式逐步推导。";
      const createdBy = String(body.createdBy || "王知行老师 Ms. Evelyn Wang");

      if (!topicId || !promptZh) {
        return NextResponse.json(
          { ok: false, error: "请填写题目挂靠的微技能节点与题干内容。" },
          { status: 400 }
        );
      }

      const newId = `csq_${Date.now().toString(36)}`;
      await db.insert(customSchoolQuestions).values({
        id: newId,
        topicId,
        difficulty,
        promptZh,
        promptEn,
        latexFormula,
        choicesJson,
        answer,
        explanationZh,
        createdBy,
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({
        ok: true,
        id: newId,
      });
    }

    // 4. Delete Custom School Question
    if (action === "delete_custom_question") {
      const id = String(body.id ?? "");
      await db
        .delete(customSchoolQuestions)
        .where(eq(customSchoolQuestions.id, id));
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { ok: false, error: `Unknown studio action: ${action}` },
      { status: 400 }
    );
  } catch (error) {
    console.error("School Studio API error:", error);
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
