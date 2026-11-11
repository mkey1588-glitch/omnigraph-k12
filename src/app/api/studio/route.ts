import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { customSchoolEdges, customSchoolQuestions } from "@/db/schema";
import type { LocaleCode } from "@/types/taxonomy";
import { CANONICAL_EDGES } from "@/data/canonical-graph";
import { c, uiPick } from "@/lib/i18n";
import { validateCustomEdgeAcyclic } from "@/lib/engines/irt-engine";
import { authorizeEducatorMutation } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    await ensureSeeded(false);
    const access = authorizeEducatorMutation(req);
    if (!access.allowed) {
      return NextResponse.json(
        { ok: false, error: access.reason },
        { status: 403 }
      );
    }
    const body = await req.json();
    const action = String(body.action ?? "");
    const locale: LocaleCode = (body.locale as LocaleCode) || "zh-CN";

    // 1. Add Custom School Prerequisite Edge (Protected by Live DAG Cycle Guard!)
    if (action === "add_edge") {
      const topicId = String(body.topicId ?? "");
      const prerequisiteId = String(body.prerequisiteId ?? "");
      const relationType = String(body.relationType || "hard");
      const reasonZh = String(body.reasonZh ?? "").trim() || "校本教研自定义先修依赖";
      const reasonEn = String(body.reasonEn ?? "").trim() || "Custom school prerequisite";
      const createdBy = String(body.createdBy || "Ms. Evelyn Wang");

      if (!topicId || !prerequisiteId) {
        return NextResponse.json(
          {
            ok: false,
            error: uiPick(
              locale,
              c(
                "请选择目标节点与上游先修节点。",
                "Please select both the target topic and its upstream prerequisite.",
                "対象ノードと前提ノードの両方を選択してください。",
                "대상 노드와 상위 선수 노드를 모두 선택해 주세요.",
                "Sila pilih kedua-dua topik sasaran dan prasyarat huluan."
              )
            ),
          },
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

      const check = validateCustomEdgeAcyclic(
        combinedEdges,
        {
          topicId,
          prerequisiteId,
        },
        locale
      );

      if (!check.ok) {
        return NextResponse.json(
          {
            ok: false,
            error: check.reason ?? check.reasonZh,
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
        String(body.explanationZh ?? "").trim() ||
        "Apply the canonical formula step by step.";
      const createdBy = String(body.createdBy || "Ms. Evelyn Wang");

      if (!topicId || (!promptZh && !promptEn)) {
        return NextResponse.json(
          {
            ok: false,
            error: uiPick(
              locale,
              c(
                "请填写题目挂靠的微技能节点与题干内容。",
                "Please select a micro-topic and enter the question stem.",
                "対象単元と問題文を入力してください。",
                "대상 마이크로 스킬 노드와 문제 지문을 입력해 주세요.",
                "Sila pilih topik mikro dan masukkan pernyataan soalan."
              )
            ),
          },
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
