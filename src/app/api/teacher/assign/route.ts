import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { differentiatedAssignments } from "@/db/schema";
import {
  authorizeEducatorMutation,
  authorizeStudentAccess,
} from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    await ensureSeeded(false);
    const body = await req.json();
    const action = body.action as string;

    if (action === "create_packs") {
      const packs = body.packs as Array<{
        classId?: string;
        teacherId?: string;
        title: string;
        tier: "foundational" | "standard" | "challenge";
        targetTopicIds: string[];
        assignedStudentIds: string[];
        dueDate?: string;
      }>;

      const claimedTeacherId = packs?.[0]?.teacherId;
      const access = authorizeEducatorMutation(req, claimedTeacherId);
      if (!access.allowed) {
        return NextResponse.json(
          { ok: false, error: access.reason },
          { status: 403 }
        );
      }

      const nowIso = new Date().toISOString();
      const defaultDue = new Date(Date.now() + 5 * 24 * 3600 * 1000)
        .toISOString()
        .slice(0, 10);

      const createdIds: string[] = [];
      for (const p of packs) {
        const id = `asg_${p.tier}_${Date.now().toString(36)}_${Math.random()
          .toString(36)
          .slice(2, 5)}`;
        createdIds.push(id);
        await db.insert(differentiatedAssignments).values({
          id,
          classId: p.classId ?? "cls_global_g9",
          teacherId: p.teacherId ?? "tch_wang",
          title: p.title,
          tier: p.tier,
          targetTopicIdsJson: p.targetTopicIds,
          assignedStudentIdsJson: p.assignedStudentIds,
          completedStudentIdsJson: [],
          dueDate: p.dueDate ?? defaultDue,
          createdAt: nowIso,
        });
      }

      return NextResponse.json({ ok: true, createdIds });
    }

    if (action === "toggle_complete") {
      const assignmentId = body.assignmentId as string;
      const studentId = body.studentId as string;

      const access = await authorizeStudentAccess(req, studentId);
      if (!access.allowed) {
        return NextResponse.json(
          { ok: false, error: access.reason },
          { status: 403 }
        );
      }

      const rows = await db
        .select()
        .from(differentiatedAssignments)
        .where(eq(differentiatedAssignments.id, assignmentId));

      if (!rows[0]) {
        return NextResponse.json(
          { ok: false, error: "Assignment not found" },
          { status: 404 }
        );
      }

      const current = new Set(rows[0].completedStudentIdsJson);
      if (current.has(studentId)) {
        current.delete(studentId);
      } else {
        current.add(studentId);
      }

      await db
        .update(differentiatedAssignments)
        .set({ completedStudentIdsJson: [...current] })
        .where(eq(differentiatedAssignments.id, assignmentId));

      return NextResponse.json({
        ok: true,
        completedStudentIds: [...current],
      });
    }

    return NextResponse.json(
      { ok: false, error: `Unknown action: ${action}` },
      { status: 400 }
    );
  } catch (error) {
    console.error("Teacher assign API error:", error);
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
