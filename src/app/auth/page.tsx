"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  KeyRound,
  UserPlus,
  Users,
  EyeOff,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { usePlatform } from "@/components/PlatformProvider";
import { PRIVACY_REGIMES } from "@/lib/engines/privacy-shield";
import type { RegionCode, UserRole } from "@/types/taxonomy";

export default function AuthAndPrivacyPage() {
  const {
    data,
    loading,
    regionCode,
    setRegionCode,
    setActiveRole,
    activeStudentId,
    setActiveStudentId,
    loggedInUserId,
    setLoggedInUserId,
    refreshData,
  } = usePlatform();

  // --- 1. Login & Kid PIN State ---
  const [loginMode, setLoginMode] = useState<"credentials" | "kid_pin" | "register">(
    "credentials"
  );
  const [loginHandle, setLoginHandle] = useState<string>("wang@omnigraph.edu");
  const [secretCode, setSecretCode] = useState<string>("teach123");
  const [kidPinInput, setKidPinInput] = useState<string>("880901");
  const [regName, setRegName] = useState<string>("");
  const [regRole, setRegRole] = useState<UserRole>("student");
  const [regGrade, setRegGrade] = useState<number>(8);
  const [authBanner, setAuthBanner] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);

  // --- 2. Parent Child Sub-Account Creator ---
  const [childName, setChildName] = useState<string>("");
  const [childRegion, setChildRegion] = useState<RegionCode>("SG");
  const [childGrade, setChildGrade] = useState<number>(4);
  const [childDailyLimit, setChildDailyLimit] = useState<number>(35);
  const [consentChecked, setConsentChecked] = useState<boolean>(true);
  const [createdChildResult, setCreatedChildResult] = useState<{
    childId: string;
    kidPin: string;
    privacyRegime: string;
  } | null>(null);

  // --- 3. Student Join Class by Invite Code ---
  const [inviteCode, setInviteCode] = useState<string>("OMNI-9A");
  const [joinMsg, setJoinMsg] = useState<string | null>(null);

  // --- 4. Live PII De-Identification Sandbox ---
  const [sandboxRaw, setSandboxRaw] = useState<string>(
    "老师您好，我是深圳南山实验中学的林小宇（手机 13812345678，邮箱 leo.lin@school.cn），请问 1/R = 1/6 + 1/12 为什么不能直接把分母相加？"
  );
  const [sandboxResult, setSandboxResult] = useState<{
    sanitizedText: string;
    redactedTypes: string[];
    regulation: string;
    anonToken: string;
  } | null>(null);

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-400">
        正在加载三端账号认证与 9 地未成年人隐私合规中心...
      </div>
    );
  }

  const currentLoggedUser = data.users.find((u) => u.id === loggedInUserId);

  const handleCredentialsLogin = async () => {
    setAuthBanner(null);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login_credentials",
        loginHandle,
        secretCode,
      }),
    });
    const json = await res.json();
    if (json.ok && json.user) {
      setLoggedInUserId(json.user.id);
      setActiveRole(json.user.role);
      setRegionCode(json.user.regionCode);
      if (json.user.role === "student") {
        setActiveStudentId(json.user.id);
      }
      setAuthBanner({
        ok: true,
        msg: `登录成功！当前身份：${json.user.avatarEmoji} ${json.user.displayName}（匿名合规令牌：${json.authProfile.anonymousToken}）`,
      });
    } else {
      setAuthBanner({ ok: false, msg: json.error || "登录失败" });
    }
  };

  const handleKidPinLogin = async () => {
    setAuthBanner(null);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login_kid_pin",
        kidPin: kidPinInput,
      }),
    });
    const json = await res.json();
    if (json.ok && json.user) {
      setLoggedInUserId(json.user.id);
      setActiveRole("student");
      setActiveStudentId(json.user.id);
      setRegionCode(json.user.regionCode);
      setAuthBanner({
        ok: true,
        msg: `🎉 儿童家庭 PIN 免密登录成功！欢迎回来，${json.user.displayName}（受 ${json.authProfile.privacyRegime} 保护）`,
      });
    } else {
      setAuthBanner({ ok: false, msg: json.error || "PIN 码无效" });
    }
  };

  const handleRegister = async () => {
    setAuthBanner(null);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "register_user",
        role: regRole,
        displayName: regName,
        loginHandle,
        secretCode,
        regionCode,
        currentGrade: regGrade,
        parentConsentVerified: true,
      }),
    });
    const json = await res.json();
    if (json.ok && json.user) {
      await refreshData();
      setLoggedInUserId(json.user.id);
      setActiveRole(json.user.role);
      if (json.user.role === "student") {
        setActiveStudentId(json.user.id);
      }
      setAuthBanner({
        ok: true,
        msg: `注册并登录成功！${
          json.kidPin ? `专属 6 位快捷 PIN 码：${json.kidPin}` : ""
        }`,
      });
    } else {
      setAuthBanner({ ok: false, msg: json.error || "注册失败" });
    }
  };

  const handleCreateChildAccount = async () => {
    setCreatedChildResult(null);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create_child_subaccount",
        parentId: "par_lin",
        childName,
        regionCode: childRegion,
        grade: childGrade,
        dailyLimitMinutes: childDailyLimit,
        consentConfirmed: consentChecked,
      }),
    });
    const json = await res.json();
    if (json.ok) {
      setCreatedChildResult({
        childId: json.childId,
        kidPin: json.kidPin,
        privacyRegime: json.privacyRegime,
      });
      setChildName("");
      await refreshData();
    } else {
      setAuthBanner({ ok: false, msg: json.error });
    }
  };

  const handleJoinClass = async () => {
    setJoinMsg(null);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "join_class_by_code",
        studentId: activeStudentId,
        inviteCode,
      }),
    });
    const json = await res.json();
    if (json.ok) {
      setJoinMsg(
        `✅ 学生已凭邀请码加入班级《${json.classroom.name}》！教师端热力图将实时同步其掌握度。`
      );
      await refreshData();
    } else {
      setJoinMsg(`❌ ${json.error}`);
    }
  };

  const runPrivacySandbox = async () => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "test_privacy_shield",
        rawText: sandboxRaw,
        studentId: activeStudentId,
        regionCode,
      }),
    });
    const json = await res.json();
    if (json.ok) {
      setSandboxResult(json.result);
      await refreshData();
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            <span>三端真实认证、家庭 PIN / 班级邀请码与 9 地未成年人隐私脱敏盾</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            全面对齐中国 <code>PIPL</code>、美国 <code>COPPA/FERPA</code>、英国{" "}
            <code>AADC</code>、新加坡 <code>PDPA</code>、日韩 <code>APPI/PIPA</code>{" "}
            未成年人数据最小化与监护人可验证授权规范。
          </p>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-3.5 py-2 text-xs text-emerald-200">
          当前会话身份：<strong>{currentLoggedUser?.avatarEmoji} {currentLoggedUser?.displayName}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Card 1: Login / Kid PIN / Register */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-indigo-400" />
              <span>1. 三端账号认证 & 低龄儿童 6 位 PIN 免密登录</span>
            </h2>
            <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-0.5 text-[11px]">
              {(
                [
                  { id: "credentials", label: "账号口令" },
                  { id: "kid_pin", label: "儿童 PIN 码" },
                  { id: "register", label: "新用户注册" },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setLoginMode(m.id)}
                  className={`rounded-md px-2.5 py-1 font-semibold ${
                    loginMode === m.id
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Demo Quick-Fill Pills */}
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setLoginMode("credentials");
                setLoginHandle("wang@omnigraph.edu");
                setSecretCode("teach123");
              }}
              className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-slate-300 hover:border-indigo-400"
            >
              👩‍🏫 填入教师演示号
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode("credentials");
                setLoginHandle("lin@family.org");
                setSecretCode("parent123");
              }}
              className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-slate-300 hover:border-indigo-400"
            >
              👨‍👧‍👦 填入家长演示号
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode("kid_pin");
                setKidPinInput("880901");
              }}
              className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-slate-300 hover:border-emerald-400"
            >
              🧑‍🚀 小宇 PIN: 880901
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode("kid_pin");
                setKidPinInput("550502");
              }}
              className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-slate-300 hover:border-emerald-400"
            >
              🦄 小朵 PIN: 550502
            </button>
          </div>

          {loginMode === "credentials" && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">登录邮箱 / 账号：</label>
                <input
                  value={loginHandle}
                  onChange={(e) => setLoginHandle(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">访问口令：</label>
                <input
                  type="password"
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>
              <button
                type="button"
                onClick={() => void handleCredentialsLogin()}
                className="w-full rounded-xl bg-indigo-600 py-2.5 font-bold text-white hover:bg-indigo-500"
              >
                安全登录并同步工作台角色
              </button>
            </div>
          )}

          {loginMode === "kid_pin" && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-400">
                低龄中小学生无需记忆邮箱或暴露手机号，凭家长签发的 6 位家庭 PIN 码即可安全进入伴学舱：
              </p>
              <input
                value={kidPinInput}
                onChange={(e) => setKidPinInput(e.target.value)}
                maxLength={6}
                placeholder="输入 6 位数字 PIN 码"
                className="w-full rounded-xl border border-emerald-500/40 bg-slate-950 px-4 py-3 text-center font-mono text-lg tracking-widest text-emerald-300"
              />
              <button
                type="button"
                onClick={() => void handleKidPinLogin()}
                className="w-full rounded-xl bg-emerald-600 py-2.5 font-bold text-white hover:bg-emerald-500"
              >
                凭家庭 PIN 码进入学生个人学习舱
              </button>
            </div>
          )}

          {loginMode === "register" && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2.5">
                <input
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="显示昵称（如：张思远）"
                  className="col-span-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-2 text-white"
                >
                  <option value="student">学生</option>
                  <option value="teacher">教师</option>
                  <option value="parent">家长</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <input
                  value={loginHandle}
                  onChange={(e) => setLoginHandle(e.target.value)}
                  placeholder="登录账号 / 邮箱"
                  className="col-span-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={regGrade}
                  onChange={(e) => setRegGrade(Number(e.target.value))}
                  placeholder="年级"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>
              <input
                type="password"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                placeholder="设置至少 4 位登录口令"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <button
                type="button"
                onClick={() => void handleRegister()}
                className="w-full rounded-xl bg-violet-600 py-2.5 font-bold text-white hover:bg-violet-500"
              >
                立即注册真实账号（写入 SQLite）
              </button>
            </div>
          )}

          {authBanner && (
            <div
              className={`rounded-xl border p-3 text-xs font-semibold ${
                authBanner.ok
                  ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300"
                  : "border-rose-500/40 bg-rose-950/30 text-rose-300"
              }`}
            >
              {authBanner.msg}
            </div>
          )}
        </div>

        {/* Card 2: Parent Sub-Account Creator + Class Invite Code Joiner */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3.5 text-xs">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-emerald-400" />
              <span>2. 家长创建低龄子账号（9 地未成年人监护授权 VPC + 签发家庭 PIN）</span>
            </h2>

            <div className="grid grid-cols-3 gap-2.5">
              <input
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="孩子昵称（如：林小星）"
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <select
                value={childRegion}
                onChange={(e) => setChildRegion(e.target.value as RegionCode)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-2 text-white"
              >
                {data.regions.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.flag} {r.code} 课标与法规
                  </option>
                ))}
              </select>
              <select
                value={childGrade}
                onChange={(e) => setChildGrade(Number(e.target.value))}
                className="rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-2 text-white"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                  <option key={g} value={g}>
                    Grade {g} ({g}年级)
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 space-y-1.5">
              <div className="font-semibold text-indigo-300">
                📜 适用司法辖区保护条例：{PRIVACY_REGIMES[childRegion].regulationName}
              </div>
              <p className="text-[11px] text-slate-400">
                {PRIVACY_REGIMES[childRegion].summaryZh}
              </p>
              <label className="flex items-center gap-2 pt-1 text-emerald-300 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="accent-emerald-500"
                />
                <span>
                  我作为法定监护人已阅读并授权创建低龄脱敏学习档案（每日防沉迷上限{" "}
                  {childDailyLimit} 分钟）
                </span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => void handleCreateChildAccount()}
              className="w-full rounded-xl bg-emerald-600 py-2.5 font-bold text-white hover:bg-emerald-500"
            >
              创建子账号并自动绑定至家长伴学端
            </button>

            {createdChildResult && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-emerald-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>
                    子账号创建成功！专属 6 位家庭 PIN 码：
                    <code className="ml-1 rounded bg-slate-950 px-2 py-0.5 text-sm font-bold text-amber-300">
                      {createdChildResult.kidPin}
                    </code>
                  </span>
                </div>
                <div className="text-[11px] text-slate-300">
                  现在可在上方切换器或用该 PIN 码免密登录，且已在「家长伴学空间」自动绑定。
                </div>
              </div>
            )}
          </div>

          {/* Student Classroom Invite Joiner */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3 text-xs">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-violet-400" />
              <span>3. 学生凭班级邀请码一键入班（师生学情绑定）</span>
            </h2>
            <div className="flex gap-2">
              <input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="输入教师发放的班级邀请码（如 OMNI-9A）"
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono uppercase text-white"
              />
              <button
                type="button"
                onClick={() => void handleJoinClass()}
                className="rounded-xl bg-violet-600 px-4 py-2 font-bold text-white hover:bg-violet-500"
              >
                加入班级
              </button>
            </div>
            {joinMsg && <div className="text-indigo-300 font-medium">{joinMsg}</div>}
          </div>
        </div>
      </div>

      {/* Card 4: Live 9-Region PII De-Identification Inspector & Audit Trail */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <EyeOff className="h-4 w-4 text-emerald-400" />
            <span>
              4. 9 地未成年人 PII 物理脱敏盾实时检验台 & 合规审计台账（Zero-PII LLM Gateway）
            </span>
          </h2>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-300">
            <Lock className="h-3.5 w-3.5" /> 数学公式与比例尺数字 100% 零损保留
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-6 space-y-2.5 text-xs">
            <textarea
              rows={3}
              value={sandboxRaw}
              onChange={(e) => setSandboxRaw(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white leading-relaxed"
            />
            <button
              type="button"
              onClick={() => void runPrivacySandbox()}
              className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-500"
            >
              执行 {regionCode} 法规脱敏检测并写入合规审计日志
            </button>

            {sandboxResult && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-3.5 space-y-2">
                <div className="flex justify-between font-mono text-[11px] text-emerald-300">
                  <span>假名令牌：{sandboxResult.anonToken}</span>
                  <span>剥离字段：{sandboxResult.redactedTypes.join(", ") || "无"}</span>
                </div>
                <div className="rounded-lg bg-slate-950 p-2.5 font-mono text-slate-200">
                  {sandboxResult.sanitizedText}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-6 space-y-2">
            <div className="text-xs font-bold text-slate-300">
              最近外部 AI 调用隐私合规审计记录（SQLite <code>privacy_audit_logs</code>）：
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {(data.privacyAuditLogs ?? []).slice(0, 8).map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 text-[11px] space-y-1"
                >
                  <div className="flex items-center justify-between font-mono text-indigo-300">
                    <span>
                      [{log.regionCode}] {log.endpoint} · {log.actorAnonToken}
                    </span>
                    <span className="text-emerald-300">
                      剥离: {log.redactedFieldsJson.join(",")}
                    </span>
                  </div>
                  <div className="text-slate-400 truncate">{log.payloadPreview}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
