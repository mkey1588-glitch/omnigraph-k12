import { NextResponse } from "next/server";
import { and, eq, or } from "drizzle-orm";
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
import type { LocaleCode, RegionCode, UserRole } from "@/types/taxonomy";
import { c, uiPick } from "@/lib/i18n";
import {
  computeAnonToken,
  getLocalizedPrivacyRegime,
  PRIVACY_REGIMES,
  sanitizeForExternalAi,
} from "@/lib/engines/privacy-shield";
import {
  attachSessionCookie,
  authorizeParentMutation,
  authorizeStudentAccess,
  clearSessionCookie,
  hashKidPin,
  hashSecret,
  isDemoUserId,
  verifyKidPin,
  verifySecret,
} from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    await ensureSeeded(false);
    const body = await req.json();
    const action = String(body.action ?? "");
    const locale: LocaleCode = (body.locale as LocaleCode) || "zh-CN";

    // 1. Standard Handle + Secret Code Login (O(1) Unique Index Lookup + scrypt Verification + HttpOnly Session)
    if (action === "login_credentials") {
      const handle = String(body.loginHandle ?? "").trim().toLowerCase();
      const secretCode = String(body.secretCode ?? "").trim();

      const authRows = await db
        .select()
        .from(userAuthProfiles)
        .where(eq(userAuthProfiles.loginHandle, handle));

      const matched = authRows[0];
      if (!matched || !verifySecret(secretCode, matched.secretCode)) {
        return NextResponse.json(
          {
            ok: false,
            error: uiPick(
              locale,
              c(
                "账号或口令不匹配，请核对演示账号或重新注册。",
                "Invalid login handle or passcode. Please check the demo credentials or register.",
                "アカウントまたはパスコードが一致しません。デモ資格情報を確認してください。",
                "계정 또는 비밀번호가 일치하지 않습니다. 데모 계정을 확인하거나 가입해 주세요.",
                "Akaun atau kod laluan tidak sepadan. Sila semak akaun demo atau daftar."
              )
            ),
          },
          { status: 401 }
        );
      }

      const userRows = await db
        .select()
        .from(users)
        .where(eq(users.id, matched.userId));
      const user = userRows[0];
      if (!user) {
        return NextResponse.json(
          { ok: false, error: "User record missing" },
          { status: 404 }
        );
      }

      const res = NextResponse.json({
        ok: true,
        user,
        authProfile: {
          userId: matched.userId,
          loginHandle: matched.loginHandle,
          anonymousToken: matched.anonymousToken,
          privacyRegime: matched.privacyRegime,
          parentConsentVerified: matched.parentConsentVerified,
        },
      });
      attachSessionCookie(res, {
        uid: user.id,
        role: user.role as UserRole,
        reg: user.regionCode as RegionCode,
        demo: isDemoUserId(user.id),
      });
      return res;
    }

    // 2. Family 6-Digit Kid PIN Login (Peppered scrypt Index Lookup + HttpOnly Session)
    if (action === "login_kid_pin") {
      const kidPin = String(body.kidPin ?? "").trim();
      const hashedPin = hashKidPin(kidPin);

      const candidateRows = await db
        .select()
        .from(userAuthProfiles)
        .where(
          or(
            eq(userAuthProfiles.kidPin, hashedPin),
            eq(userAuthProfiles.kidPin, kidPin)
          )
        );

      const matched = candidateRows.find((r) => verifyKidPin(kidPin, r.kidPin));

      if (!matched) {
        return NextResponse.json(
          {
            ok: false,
            error: uiPick(
              locale,
              c(
                "未找到该 6 位家庭儿童 PIN 码（演示可用：880901 或 550502）。",
                "6-digit Family Kid PIN not found (demo PINs: 880901 or 550502).",
                "6桁のファミリーPINが見つかりません（デモPIN：880901 または 550502）。",
                "해당 6자리 가족 아동 PIN을 찾을 수 없습니다 (데모 PIN: 880901 또는 550502).",
                "PIN Kanak-kanak 6 digit tidak ditemui (PIN demo: 880901 atau 550502)."
              )
            ),
          },
          { status: 401 }
        );
      }

      const userRows = await db
        .select()
        .from(users)
        .where(eq(users.id, matched.userId));
      const user = userRows[0];
      if (!user) {
        return NextResponse.json(
          { ok: false, error: "User record missing" },
          { status: 404 }
        );
      }

      const res = NextResponse.json({
        ok: true,
        user,
        authProfile: {
          userId: matched.userId,
          loginHandle: matched.loginHandle,
          anonymousToken: matched.anonymousToken,
          privacyRegime: matched.privacyRegime,
        },
      });
      attachSessionCookie(res, {
        uid: user.id,
        role: user.role as UserRole,
        reg: user.regionCode as RegionCode,
        demo: isDemoUserId(user.id),
      });
      return res;
    }

    // 3. Switch Sandbox Demo Persona (Strictly gated to DEMO_SEED_USER_IDS!)
    if (action === "switch_demo_persona") {
      const targetUserId = String(body.userId ?? "").trim();
      if (!isDemoUserId(targetUserId)) {
        return NextResponse.json(
          {
            ok: false,
            error: "Forbidden: switch_demo_persona is restricted to sandbox demo accounts.",
          },
          { status: 403 }
        );
      }
      const userRows = await db
        .select()
        .from(users)
        .where(eq(users.id, targetUserId));
      const user = userRows[0];
      if (!user) {
        return NextResponse.json(
          { ok: false, error: "Demo user not found" },
          { status: 404 }
        );
      }
      const res = NextResponse.json({ ok: true, user });
      attachSessionCookie(res, {
        uid: user.id,
        role: user.role as UserRole,
        reg: user.regionCode as RegionCode,
        demo: true,
      });
      return res;
    }

    // 4. Logout / Clear HttpOnly Session Cookie
    if (action === "logout") {
      const res = NextResponse.json({ ok: true });
      clearSessionCookie(res);
      return res;
    }

    // 5. Register a New Adult/Teen Account (Student / Teacher / Parent)
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
          {
            ok: false,
            error: uiPick(
              locale,
              c(
                "请填写完整昵称、登录账号及至少 4 位口令。",
                "Please enter display name, login handle, and a passcode of at least 4 characters.",
                "表示名・ログインID・4文字以上のパスコードを入力してください。",
                "표시 이름, 로그인 ID 및 4자 이상의 비밀번호를 입력해 주세요.",
                "Sila lengkapkan nama paparan, ID log masuk dan kod laluan sekurang-kurangnya 4 aksara."
              )
            ),
          },
          { status: 400 }
        );
      }

      const existing = await db
        .select({ userId: userAuthProfiles.userId })
        .from(userAuthProfiles)
        .where(eq(userAuthProfiles.loginHandle, loginHandle));

      if (existing.length > 0) {
        return NextResponse.json(
          {
            ok: false,
            error: uiPick(
              locale,
              c(
                "该登录账号已存在，请直接登录或更换账号标识。",
                "This login handle already exists. Please sign in or choose another handle.",
                "このログインIDは既に登録されています。ログインするか別のIDを指定してください。",
                "이미 존재하는 로그인 ID입니다. 로그인하거나 다른 ID를 사용해 주세요.",
                "ID log masuk ini sudah wujud. Sila log masuk atau pilih ID lain."
              )
            ),
          },
          { status: 409 }
        );
      }

      const nowIso = new Date().toISOString();
      const newId = `${role.slice(0, 3)}_${Date.now().toString(36)}_${Math.random()
        .toString(36)
        .slice(2, 5)}`;
      const emoji =
        role === "teacher" ? "👩‍🏫" : role === "parent" ? "👨‍👩‍👧" : "🧑‍🎓";

      await db.insert(users).values({
        id: newId,
        role,
        displayName,
        avatarEmoji: emoji,
        regionCode,
        currentGrade: role === "parent" ? null : currentGrade,
        schoolTrack: uiPick(
          locale,
          c(
            `${regionCode} 自定义注册学习路径`,
            `${regionCode} Custom Learning Track`,
            `${regionCode} カスタム学習トラック`,
            `${regionCode} 맞춤형 학습 트랙`,
            `Laluan Pembelajaran Tersuai ${regionCode}`
          )
        ),
        targetTransitionRegion: regionCode === "CN" ? "HK" : "UK",
        createdAt: nowIso,
      });

      const plainKidPin =
        role === "student"
          ? String(Math.floor(100000 + Math.random() * 900000))
          : null;

      await db.insert(userAuthProfiles).values({
        userId: newId,
        loginHandle,
        secretCode: hashSecret(secretCode),
        kidPin: plainKidPin ? hashKidPin(plainKidPin) : null,
        anonymousToken: computeAnonToken(newId, regionCode),
        ageGroup: role === "student" ? "u16" : "adult",
        parentConsentVerified: parentalConsent,
        privacyRegime: PRIVACY_REGIMES[regionCode].regulationName,
      });

      const createdUser = (
        await db.select().from(users).where(eq(users.id, newId))
      )[0];

      const res = NextResponse.json({
        ok: true,
        user: createdUser,
        kidPin: plainKidPin,
      });
      attachSessionCookie(res, {
        uid: createdUser.id,
        role: createdUser.role as UserRole,
        reg: createdUser.regionCode as RegionCode,
        demo: false,
      });
      return res;
    }

    // 6. Parent Creates Low-Age Child Sub-Account (with 9-Region COPPA/PIPL Consent + PIN + Pact)
    if (action === "create_child_subaccount") {
      const parentId = String(body.parentId || "par_lin");
      const access = authorizeParentMutation(req, parentId);
      if (!access.allowed) {
        return NextResponse.json(
          { ok: false, error: access.reason },
          { status: 403 }
        );
      }

      const childName = String(body.childName ?? "").trim();
      const regionCode = ((body.regionCode as RegionCode) || "CN") as RegionCode;
      const grade = Math.max(1, Math.min(12, Number(body.grade ?? 6)));
      const relationshipLabel =
        String(body.relationshipLabel ?? "").trim() ||
        uiPick(
          locale,
          c(
            `子账号 · G${grade}（${regionCode} 监护人授权）`,
            `Child Sub-Account · G${grade} (${regionCode} Guardian Verified)`,
            `子アカウント・G${grade}（${regionCode} 保護者承認済）`,
            `자녀 계정 · G${grade} (${regionCode} 보호자 동의)`,
            `Sub-Akaun Anak · G${grade} (Disahkan Penjaga ${regionCode})`
          )
        );
      const customPin = String(body.kidPin ?? "").trim();
      const dailyLimitMinutes = Math.max(
        15,
        Math.min(180, Number(body.dailyLimitMinutes ?? 40))
      );

      if (!childName) {
        return NextResponse.json(
          {
            ok: false,
            error: uiPick(
              locale,
              c(
                "请输入孩子昵称。",
                "Please enter the child's display name.",
                "お子様のニックネームを入力してください。",
                "자녀의 이름을 입력해 주세요.",
                "Sila masukkan nama panggilan anak."
              )
            ),
          },
          { status: 400 }
        );
      }
      if (!body.consentConfirmed) {
        const regSpec = getLocalizedPrivacyRegime(regionCode, locale);
        return NextResponse.json(
          {
            ok: false,
            error: uiPick(
              locale,
              c(
                `根据 ${regSpec.regulationName}，创建未成年子账号必须勾选监护人知情同意。`,
                `Under ${regSpec.regulationName}, guardian consent must be checked to create a minor sub-account.`,
                `${regSpec.regulationName} に基づき、未成年アカウントの作成には保護者同意のチェックが必須です。`,
                `${regSpec.regulationName}에 따라 미성년 자녀 계정 생성 시 보호자 동의 체크가 필수입니다.`,
                `Di bawah ${regSpec.regulationName}, kebenaran penjaga mesti ditandakan untuk akaun bawah umur.`
              )
            ),
          },
          { status: 400 }
        );
      }

      const plainKidPin = /^\d{6}$/.test(customPin)
        ? customPin
        : String(Math.floor(100000 + Math.random() * 900000));

      const nowIso = new Date().toISOString();
      const childId = `stu_${Date.now().toString(36)}_${Math.random()
        .toString(36)
        .slice(2, 5)}`;

      await db.insert(users).values({
        id: childId,
        role: "student",
        displayName: childName,
        avatarEmoji: "🌱",
        regionCode,
        currentGrade: grade,
        schoolTrack: uiPick(
          locale,
          c(
            `${regionCode} G${grade}（家长监护子账号）`,
            `${regionCode} G${grade} (Parent-Managed Sub-Account)`,
            `${regionCode} G${grade}（保護者管理アカウント）`,
            `${regionCode} G${grade} (학부모 관리 자녀 계정)`,
            `${regionCode} G${grade} (Sub-Akaun Kawalan Ibu Bapa)`
          )
        ),
        targetTransitionRegion: "SG",
        createdAt: nowIso,
      });

      await db.insert(userAuthProfiles).values({
        userId: childId,
        loginHandle: `${childId}@family.omnigraph.org`,
        secretCode: hashSecret(plainKidPin),
        kidPin: hashKidPin(plainKidPin),
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
        rewardTitle: uiPick(
          locale,
          c(
            "完成本周微技能目标解锁科学探索勋章",
            "Complete weekly micro-topic goals to unlock the Science Explorer Badge",
            "週間目標達成でサイエンス探検バッジをアンロック",
            "주간 목표 달성 시 과학 탐험 배지 잠금 해제",
            "Lengkapkan sasaran mingguan untuk membuka Lencana Peneroka Sains"
          )
        ),
        badgeUnlocked: false,
        updatedAt: nowIso,
      });

      return NextResponse.json({
        ok: true,
        childId,
        kidPin: plainKidPin,
        privacyRegime: PRIVACY_REGIMES[regionCode].regulationName,
      });
    }

    // 7. Student Joins Classroom via Invite Code (e.g. OMNI-9A)
    if (action === "join_class_by_code") {
      const studentId = String(body.studentId || "stu_mia");
      const access = await authorizeStudentAccess(req, studentId);
      if (!access.allowed) {
        return NextResponse.json(
          { ok: false, error: access.reason },
          { status: 403 }
        );
      }

      const inviteCode = String(body.inviteCode ?? "").trim().toUpperCase();

      const allClasses = await db.select().from(classrooms);
      const targetClass = allClasses.find(
        (cl) => cl.inviteCode.toUpperCase() === inviteCode
      );

      if (!targetClass) {
        return NextResponse.json(
          {
            ok: false,
            error: uiPick(
              locale,
              c(
                `邀请码「${inviteCode}」无效（演示班级邀请码：OMNI-9A）。`,
                `Invalid invite code "${inviteCode}" (demo class code: OMNI-9A).`,
                `招待コード「${inviteCode}」は無効です（デモ招待コード：OMNI-9A）。`,
                `초대 코드 「${inviteCode}」가 유효하지 않습니다 (데모 반 코드: OMNI-9A).`,
                `Kod jemputan "${inviteCode}" tidak sah (kod kelas demo: OMNI-9A).`
              )
            ),
          },
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

    // 8. Parent Updates Screen-Time & Positive Reward Pact (P4)
    if (action === "update_study_pact") {
      const studentId = String(body.studentId || "stu_leo");
      const parentId = String(body.parentId || "par_lin");
      const access = authorizeParentMutation(req, parentId);
      if (!access.allowed) {
        return NextResponse.json(
          { ok: false, error: access.reason },
          { status: 403 }
        );
      }

      const dailyLimitMinutes = Math.max(
        15,
        Math.min(180, Number(body.dailyLimitMinutes ?? 45))
      );
      const weeklyTargetNodes = Math.max(
        1,
        Math.min(20, Number(body.weeklyTargetNodes ?? 4))
      );
      const rewardTitle = String(
        body.rewardTitle ??
          uiPick(
            locale,
            c(
              "周末亲子博物馆探索时光",
              "Weekend Family Science Museum Outing",
              "週末の科学館ファミリー探検",
              "주말 가족 과학관 탐방 시간",
              "Lawatan Muzium Sains Keluarga Hujung Minggu"
            )
          )
      ).trim();
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

    // 9. Live 9-Region PII De-Identification Sandbox + Compliance Log
    if (action === "test_privacy_shield") {
      const rawText = String(body.rawText ?? "");
      const studentId = String(body.studentId || "stu_leo");
      const regionCode = ((body.regionCode as RegionCode) || "CN") as RegionCode;

      const access = await authorizeStudentAccess(req, studentId);
      if (!access.allowed) {
        return NextResponse.json(
          { ok: false, error: access.reason },
          { status: 403 }
        );
      }

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
