import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import {
  classMemberships,
  classrooms,
  parentChildLinks,
  privacyAuditLogs,
  studyPacts,
  userAuthProfiles,
  users,
} from "@/db/schema";
import type { RegionCode, UserRole } from "@/types/taxonomy";
import {
  computeAnonToken,
  PRIVACY_REGIMES,
  sanitizeForExternalAi,
} from "@/lib/engines/privacy-shield";

export async function POST(req: Request) {
  try {
    await ensureSeeded(false);
    const body = await req.json();
    const action = String(body.action ?? "");

    // 1. Standard Handle + Secret Code Login
    if (action === "login_credentials") {
      const handle = String(body.loginHandle ?? "").trim().toLowerCase();
      const secretCode = String(body.secretCode ?? "").trim();

      const allAuth = await db.select().from(userAuthProfiles);
      const matched = allAuth.find(
        (p) =>
          p.loginHandle.toLowerCase() === handle && p.secretCode === secretCode
      );

      if (!matched) {
        return NextResponse.json(
          { ok: false, error: "账号或口令不匹配，请核对演示账号或重新注册。" },
          { status: 401 }
        );
      }

      const userRows = await db
        .select()
        .from(users)
        .where(eq(users.id, matched.userId));
      return NextResponse.json({
        ok: true,
        user: userRows[0],
        authProfile: {
          userId: matched.userId,
          loginHandle: matched.loginHandle,
          anonymousToken: matched.anonymousToken,
          privacyRegime: matched.privacyRegime,
          parentConsentVerified: matched.parentConsentVerified,
        },
      });
    }

    // 2. Family 6-Digit Kid PIN Login (Passwordless Low-Age Student Entry)
    if (action === "login_kid_pin") {
      const kidPin = String(body.kidPin ?? "").trim();
      const matchedRows = await db
        .select()
        .from(userAuthProfiles)
        .where(eq(userAuthProfiles.kidPin, kidPin));

      if (!matchedRows[0]) {
        return NextResponse.json(
          { ok: false, error: "未找到该 6 位家庭儿童 PIN 码（演示可用：880901 或 550502）。" },
          { status: 401 }
        );
      }

      const matched = matchedRows[0];
      const userRows = await db
        .select()
        .from(users)
        .where(eq(users.id, matched.userId));

      return NextResponse.json({
        ok: true,
        user: userRows[0],
        authProfile: {
          userId: matched.userId,
          loginHandle: matched.loginHandle,
          anonymousToken: matched.anonymousToken,
          privacyRegime: matched.privacyRegime,
        },
      });
    }

    // 3. Register a New Adult/Teen Account (Student / Teacher / Parent)
    if (action === "register_user") {
      const role = (body.role as UserRole) || "student";
      const displayName = String(body.displayName ?? "").trim();
      const loginHandle = String(body.loginHandle ?? "").trim().toLowerCase();
      const secretCode = String(body.secretCode ?? "").trim();
      const regionCode = ((body.regionCode as RegionCode) || "CN") as RegionCode;
      const currentGrade = body.currentGrade ? Number(body.currentGrade) : 8;
      const parentalConsent = Boolean(body.parentConsentVerified ?? true);

      if (!displayName || !loginHandle || secretCode.length < 4) {
        return NextResponse.json(
          { ok: false, error: "请填写完整昵称、登录账号及至少 4 位口令。" },
          { status: 400 }
        );
      }

      const existing = await db.select().from(userAuthProfiles);
      if (existing.some((e) => e.loginHandle.toLowerCase() === loginHandle)) {
        return NextResponse.json(
          { ok: false, error: "该登录账号已存在，请直接登录或更换账号标识。" },
          { status: 409 }
        );
      }

      const nowIso = new Date().toISOString();
      const newId = `${role.slice(0, 3)}_${Date.now().toString(36)}`;
      const emoji =
        role === "teacher" ? "👩‍🏫" : role === "parent" ? "👨‍👩‍👧" : "🧑‍🎓";

      await db.insert(users).values({
        id: newId,
        role,
        displayName,
        avatarEmoji: emoji,
        regionCode,
        currentGrade: role === "parent" ? null : currentGrade,
        schoolTrack: `${regionCode} 自定义注册学习路径`,
        targetTransitionRegion: regionCode === "CN" ? "HK" : "UK",
        createdAt: nowIso,
      });

      const kidPin =
        role === "student"
          ? String(Math.floor(100000 + Math.random() * 900000))
          : null;

      await db.insert(userAuthProfiles).values({
        userId: newId,
        loginHandle,
        secretCode,
        kidPin,
        anonymousToken: computeAnonToken(newId, regionCode),
        ageGroup: role === "student" ? "u16" : "adult",
        parentConsentVerified: parentalConsent,
        privacyRegime: PRIVACY_REGIMES[regionCode].regulationName,
      });

      const createdUser = (
        await db.select().from(users).where(eq(users.id, newId))
      )[0];

      return NextResponse.json({
        ok: true,
        user: createdUser,
        kidPin,
      });
    }

    // 4. Parent Creates Low-Age Child Sub-Account (with 9-Region COPPA/PIPL Consent + PIN + Pact)
    if (action === "create_child_subaccount") {
      const parentId = String(body.parentId || "par_lin");
      const childName = String(body.childName ?? "").trim();
      const regionCode = ((body.regionCode as RegionCode) || "CN") as RegionCode;
      const grade = Math.max(1, Math.min(12, Number(body.grade ?? 6)));
      const relationshipLabel =
        String(body.relationshipLabel ?? "").trim() ||
        `子账号 · G${grade}（${regionCode} 监护人授权）`;
      const customPin = String(body.kidPin ?? "").trim();
      const dailyLimitMinutes = Math.max(15, Math.min(180, Number(body.dailyLimitMinutes ?? 40)));

      if (!childName) {
        return NextResponse.json(
          { ok: false, error: "请输入孩子昵称。" },
          { status: 400 }
        );
      }
      if (!body.consentConfirmed) {
        return NextResponse.json(
          {
            ok: false,
            error: `根据 ${PRIVACY_REGIMES[regionCode].regulationName}，创建未成年子账号必须勾选监护人知情同意。`,
          },
          { status: 400 }
        );
      }

      const kidPin =
        /^\d{6}$/.test(customPin)
          ? customPin
          : String(Math.floor(100000 + Math.random() * 900000));

      const nowIso = new Date().toISOString();
      const childId = `stu_${Date.now().toString(36)}`;

      await db.insert(users).values({
        id: childId,
        role: "student",
        displayName: childName,
        avatarEmoji: "🌱",
        regionCode,
        currentGrade: grade,
        schoolTrack: `${regionCode} G${grade}（家长监护子账号）`,
        targetTransitionRegion: "SG",
        createdAt: nowIso,
      });

      await db.insert(userAuthProfiles).values({
        userId: childId,
        loginHandle: `${childId}@family.omnigraph.org`,
        secretCode: kidPin,
        kidPin,
        anonymousToken: computeAnonToken(childId, regionCode),
        ageGroup: grade <= 6 ? "u13" : "u16",
        parentConsentVerified: true,
        privacyRegime: PRIVACY_REGIMES[regionCode].regulationName,
      });

      await db
        .insert(parentChildLinks)
        .values({
          parentId,
          studentId: childId,
          relationshipLabel,
        })
        .onConflictDoNothing();

      await db.insert(studyPacts).values({
        id: `pact_${childId}`,
        studentId: childId,
        parentId,
        dailyLimitMinutes,
        todayUsedMinutes: 0,
        weeklyTargetNodes: 3,
        completedNodesThisWeek: 0,
        rewardTitle: "完成本周微技能目标解锁科学探索勋章",
        badgeUnlocked: false,
        updatedAt: nowIso,
      });

      return NextResponse.json({
        ok: true,
        childId,
        kidPin,
        privacyRegime: PRIVACY_REGIMES[regionCode].regulationName,
      });
    }

    // 5. Student Joins Classroom via Invite Code (e.g. OMNI-9A)
    if (action === "join_class_by_code") {
      const studentId = String(body.studentId || "stu_mia");
      const inviteCode = String(body.inviteCode ?? "").trim().toUpperCase();

      const allClasses = await db.select().from(classrooms);
      const targetClass = allClasses.find(
        (c) => c.inviteCode.toUpperCase() === inviteCode
      );

      if (!targetClass) {
        return NextResponse.json(
          { ok: false, error: `邀请码「${inviteCode}」无效（演示班级邀请码：OMNI-9A）。` },
          { status: 404 }
        );
      }

      await db
        .insert(classMemberships)
        .values({
          classId: targetClass.id,
          studentId,
        })
        .onConflictDoNothing();

      return NextResponse.json({
        ok: true,
        classroom: targetClass,
      });
    }

    // 6. Parent Updates Screen-Time & Positive Reward Pact (P4)
    if (action === "update_study_pact") {
      const studentId = String(body.studentId || "stu_leo");
      const parentId = String(body.parentId || "par_lin");
      const dailyLimitMinutes = Math.max(15, Math.min(180, Number(body.dailyLimitMinutes ?? 45)));
      const weeklyTargetNodes = Math.max(1, Math.min(20, Number(body.weeklyTargetNodes ?? 4)));
      const rewardTitle = String(body.rewardTitle ?? "周末亲子博物馆探索时光").trim();
      const badgeUnlocked = Boolean(body.badgeUnlocked);
      const nowIso = new Date().toISOString();

      const existing = await db
        .select()
        .from(studyPacts)
        .where(
          and(
            eq(studyPacts.studentId, studentId),
            eq(studyPacts.parentId, parentId)
          )
        );

      if (existing[0]) {
        await db
          .update(studyPacts)
          .set({
            dailyLimitMinutes,
            weeklyTargetNodes,
            rewardTitle,
            badgeUnlocked,
            updatedAt: nowIso,
          })
          .where(eq(studyPacts.id, existing[0].id));
      } else {
        await db.insert(studyPacts).values({
          id: `pact_${studentId}`,
          studentId,
          parentId,
          dailyLimitMinutes,
          todayUsedMinutes: 20,
          weeklyTargetNodes,
          completedNodesThisWeek: 2,
          rewardTitle,
          badgeUnlocked,
          updatedAt: nowIso,
        });
      }

      return NextResponse.json({ ok: true });
    }

    // 7. Live 9-Region PII De-Identification Sandbox + Compliance Log
    if (action === "test_privacy_shield") {
      const rawText = String(body.rawText ?? "");
      const studentId = String(body.studentId || "stu_leo");
      const regionCode = ((body.regionCode as RegionCode) || "CN") as RegionCode;

      const userRows = await db
        .select()
        .from(users)
        .where(eq(users.id, studentId));
      const result = sanitizeForExternalAi({
        rawText,
        userId: studentId,
        displayName: userRows[0]?.displayName,
        regionCode,
      });

      await db.insert(privacyAuditLogs).values({
        id: `pal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        actorAnonToken: result.anonToken,
        regionCode,
        regulation: result.regulation,
        endpoint: "/api/auth:privacy_sandbox",
        redactedFieldsJson:
          result.redactedTypes.length > 0
            ? result.redactedTypes
            : ["NO_RAW_PII_DETECTED"],
        payloadPreview: result.sanitizedText.slice(0, 160),
      });

      return NextResponse.json({
        ok: true,
        result,
      });
    }

    return NextResponse.json(
      { ok: false, error: `Unknown auth action: ${action}` },
      { status: 400 }
    );
  } catch (error) {
    console.error("Auth API error:", error);
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
