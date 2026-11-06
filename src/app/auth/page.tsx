"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  KeyRound,
  UserPlus,
  Users,
  EyeOff,
  CheckCircle2,
  Lock,
  Globe2,
} from "lucide-react";
import { usePlatform, type UserRecord } from "@/components/PlatformProvider";
import { getLocalizedPrivacyRegime } from "@/lib/engines/privacy-shield";
import { localizeAuditPreview, localizeClassroomName } from "@/lib/i18n";
import {
  AUTH_COPY,
  getPiiSandboxSample,
} from "@/lib/i18n/copy-capture-clearance-auth";
import type { LocaleCode, RegionCode, UserRole } from "@/types/taxonomy";

type AuthBannerState =
  | { kind: "login_ok"; user: UserRecord; anonToken: string }
  | { kind: "pin_ok"; user: UserRecord }
  | { kind: "register_ok"; kidPin: string | null }
  | { kind: "error"; msg: string }
  | null;

type JoinClassState =
  | { ok: true; classroom: { id: string; name: string } }
  | { ok: false; error: string }
  | null;

export default function AuthAndPrivacyPage() {
  const {
    data,
    loading,
    locale,
    regionCode,
    setRegionCode,
    setActiveRole,
    activeStudentId,
    setActiveStudentId,
    loggedInUserId,
    setLoggedInUserId,
    pick,
    userName,
    regionName,
    gradeLabel,
    refreshData,
  } = usePlatform();

  // --- 1. Login & Kid PIN State ---
  const [loginMode, setLoginMode] = useState<
    "credentials" | "kid_pin" | "register"
  >("credentials");
  const [loginHandle, setLoginHandle] = useState<string>("wang@omnigraph.edu");
  const [secretCode, setSecretCode] = useState<string>("teach123");
  const [kidPinInput, setKidPinInput] = useState<string>("880901");
  const [regName, setRegName] = useState<string>("");
  const [regRole, setRegRole] = useState<UserRole>("student");
  const [regGrade, setRegGrade] = useState<number>(8);
  const [authBanner, setAuthBanner] = useState<AuthBannerState>(null);

  // --- 2. Parent Child Sub-Account Creator ---
  const [childName, setChildName] = useState<string>("");
  const [childRegion, setChildRegion] = useState<RegionCode>("SG");
  const [childGrade, setChildGrade] = useState<number>(4);
  const [childDailyLimit] = useState<number>(35);
  const [consentChecked, setConsentChecked] = useState<boolean>(true);
  const [createdChildResult, setCreatedChildResult] = useState<{
    childId: string;
    kidPin: string;
    regionCode: RegionCode;
  } | null>(null);

  // --- 3. Student Join Class by Invite Code ---
  const [inviteCode, setInviteCode] = useState<string>("OMNI-9A");
  const [joinState, setJoinState] = useState<JoinClassState>(null);

  // --- 4. Live PII De-Identification Sandbox ---
  const [sandboxEdited, setSandboxEdited] = useState<boolean>(false);
  const [sandboxRaw, setSandboxRaw] = useState<string>(() =>
    getPiiSandboxSample(locale)
  );
  const [sandboxResult, setSandboxResult] = useState<{
    sanitizedText: string;
    redactedTypes: string[];
    regulation: string;
    anonToken: string;
  } | null>(null);

  const prevLocaleRef = useRef<LocaleCode>(locale);
  useEffect(() => {
    if (!sandboxEdited) {
      setSandboxRaw(getPiiSandboxSample(locale));
    }
    if (prevLocaleRef.current !== locale) {
      prevLocaleRef.current = locale;
      if (!sandboxEdited) {
        setSandboxResult(null);
      }
      setAuthBanner((prev) => (prev?.kind === "error" ? null : prev));
      setJoinState((prev) => (prev && !prev.ok ? null : prev));
    }
  }, [locale, sandboxEdited]);

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-400">
        {pick(AUTH_COPY.loading)}
      </div>
    );
  }

  const currentLoggedUser = data.users.find((u) => u.id === loggedInUserId);
  const childRegimeSpec = getLocalizedPrivacyRegime(childRegion, locale);

  const handleCredentialsLogin = async () => {
    setAuthBanner(null);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login_credentials",
        loginHandle,
        secretCode,
        locale,
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
        kind: "login_ok",
        user: json.user as UserRecord,
        anonToken: String(json.authProfile.anonymousToken),
      });
    } else {
      setAuthBanner({
        kind: "error",
        msg: json.error || pick(AUTH_COPY.loginFailFallback),
      });
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
        locale,
      }),
    });
    const json = await res.json();
    if (json.ok && json.user) {
      setLoggedInUserId(json.user.id);
      setActiveRole("student");
      setActiveStudentId(json.user.id);
      setRegionCode(json.user.regionCode);
      setAuthBanner({
        kind: "pin_ok",
        user: json.user as UserRecord,
      });
    } else {
      setAuthBanner({
        kind: "error",
        msg: json.error || pick(AUTH_COPY.pinFailFallback),
      });
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
        locale,
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
        kind: "register_ok",
        kidPin: json.kidPin ? String(json.kidPin) : null,
      });
    } else {
      setAuthBanner({
        kind: "error",
        msg: json.error || pick(AUTH_COPY.registerFailFallback),
      });
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
        locale,
      }),
    });
    const json = await res.json();
    if (json.ok) {
      setCreatedChildResult({
        childId: String(json.childId),
        kidPin: String(json.kidPin),
        regionCode: childRegion,
      });
      setChildName("");
      await refreshData();
    } else {
      setAuthBanner({
        kind: "error",
        msg: String(json.error || pick(AUTH_COPY.registerFailFallback)),
      });
    }
  };

  const handleJoinClass = async () => {
    setJoinState(null);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "join_class_by_code",
        studentId: activeStudentId,
        inviteCode,
        locale,
      }),
    });
    const json = await res.json();
    if (json.ok && json.classroom) {
      setJoinState({
        ok: true,
        classroom: {
          id: String(json.classroom.id),
          name: String(json.classroom.name),
        },
      });
      await refreshData();
    } else {
      setJoinState({
        ok: false,
        error: `❌ ${String(json.error ?? "")}`,
      });
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
        locale,
      }),
    });
    const json = await res.json();
    if (json.ok) {
      setSandboxResult(json.result);
      await refreshData();
    }
  };

  const renderBannerText = (banner: Exclude<AuthBannerState, null>): string => {
    switch (banner.kind) {
      case "login_ok":
        return AUTH_COPY.loginSuccessMsg(
          banner.user.avatarEmoji,
          userName(banner.user),
          banner.anonToken,
          locale
        );
      case "pin_ok": {
        const regNameStr = getLocalizedPrivacyRegime(
          banner.user.regionCode,
          locale
        ).regulationName;
        return AUTH_COPY.pinSuccessMsg(
          userName(banner.user),
          regNameStr,
          locale
        );
      }
      case "register_ok":
        return AUTH_COPY.registerSuccessMsg(banner.kidPin, locale);
      case "error":
        return banner.msg;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            <span>{pick(AUTH_COPY.title)}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {pick(AUTH_COPY.subtitle)}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-3.5 py-2 text-xs text-emerald-200">
          {pick(AUTH_COPY.activeSessionLabel)}
          <strong>
            {currentLoggedUser?.avatarEmoji}{" "}
            {currentLoggedUser ? userName(currentLoggedUser) : ""}
          </strong>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Card 1: Login / Kid PIN / Register */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-indigo-400" />
              <span>{pick(AUTH_COPY.card1Title)}</span>
            </h2>
            <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-0.5 text-[11px]">
              {(
                [
                  { id: "credentials", label: pick(AUTH_COPY.modeCredentials) },
                  { id: "kid_pin", label: pick(AUTH_COPY.modeKidPin) },
                  { id: "register", label: pick(AUTH_COPY.modeRegister) },
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
              {pick(AUTH_COPY.demoTeacherBtn)}
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
              {pick(AUTH_COPY.demoParentBtn)}
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode("kid_pin");
                setKidPinInput("880901");
              }}
              className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-slate-300 hover:border-emerald-400"
            >
              {pick(AUTH_COPY.demoLeoPinBtn)}
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode("kid_pin");
                setKidPinInput("550502");
              }}
              className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-slate-300 hover:border-emerald-400"
            >
              {pick(AUTH_COPY.demoMiaPinBtn)}
            </button>
          </div>

          {loginMode === "credentials" && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">
                  {pick(AUTH_COPY.loginHandleLabel)}
                </label>
                <input
                  value={loginHandle}
                  onChange={(e) => setLoginHandle(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">
                  {pick(AUTH_COPY.passcodeLabel)}
                </label>
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
                {pick(AUTH_COPY.loginSubmitBtn)}
              </button>
            </div>
          )}

          {loginMode === "kid_pin" && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-400">{pick(AUTH_COPY.kidPinLead)}</p>
              <input
                value={kidPinInput}
                onChange={(e) =>
                  setKidPinInput(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                maxLength={6}
                placeholder={pick(AUTH_COPY.kidPinPlaceholder)}
                className="w-full rounded-xl border border-emerald-500/40 bg-slate-950 px-4 py-3 text-center font-mono text-lg tracking-widest text-emerald-300"
              />
              {/* Interactive Kid PIN Keypad */}
              <div className="grid grid-cols-6 gap-1.5">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() =>
                      setKidPinInput((prev) =>
                        prev.length < 6 ? `${prev}${d}` : prev
                      )
                    }
                    className="rounded-lg border border-slate-800 bg-slate-950 py-1.5 font-mono text-sm font-bold text-slate-200 hover:border-emerald-400 hover:text-emerald-300"
                  >
                    {d}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setKidPinInput((prev) => prev.slice(0, -1))}
                  className="rounded-lg border border-slate-800 bg-slate-950 py-1.5 text-[11px] font-semibold text-slate-300 hover:border-amber-400"
                >
                  {pick(AUTH_COPY.kidPinBackBtn)}
                </button>
                <button
                  type="button"
                  onClick={() => setKidPinInput("")}
                  className="rounded-lg border border-slate-800 bg-slate-950 py-1.5 text-[11px] font-semibold text-slate-300 hover:border-rose-400"
                >
                  {pick(AUTH_COPY.kidPinClearBtn)}
                </button>
              </div>
              <button
                type="button"
                onClick={() => void handleKidPinLogin()}
                className="w-full rounded-xl bg-emerald-600 py-2.5 font-bold text-white hover:bg-emerald-500"
              >
                {pick(AUTH_COPY.kidPinSubmitBtn)}
              </button>
            </div>
          )}

          {loginMode === "register" && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2.5">
                <input
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder={pick(AUTH_COPY.regNamePlaceholder)}
                  className="col-span-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-2 text-white"
                >
                  <option value="student">{pick(AUTH_COPY.roleStudent)}</option>
                  <option value="teacher">{pick(AUTH_COPY.roleTeacher)}</option>
                  <option value="parent">{pick(AUTH_COPY.roleParent)}</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <input
                  value={loginHandle}
                  onChange={(e) => setLoginHandle(e.target.value)}
                  placeholder={pick(AUTH_COPY.regHandlePlaceholder)}
                  className="col-span-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={regGrade}
                  onChange={(e) => setRegGrade(Number(e.target.value))}
                  placeholder={pick(AUTH_COPY.regGradePlaceholder)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>
              <input
                type="password"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                placeholder={pick(AUTH_COPY.regPasscodePlaceholder)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <button
                type="button"
                onClick={() => void handleRegister()}
                className="w-full rounded-xl bg-violet-600 py-2.5 font-bold text-white hover:bg-violet-500"
              >
                {pick(AUTH_COPY.regSubmitBtn)}
              </button>
            </div>
          )}

          {authBanner && (
            <div
              className={`rounded-xl border p-3 text-xs font-semibold ${
                authBanner.kind !== "error"
                  ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300"
                  : "border-rose-500/40 bg-rose-950/30 text-rose-300"
              }`}
            >
              {renderBannerText(authBanner)}
            </div>
          )}
        </div>

        {/* Card 2: Parent Sub-Account Creator + Class Invite Code Joiner */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3.5 text-xs">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-emerald-400" />
              <span>{pick(AUTH_COPY.card2Title)}</span>
            </h2>

            <div className="grid grid-cols-3 gap-2.5">
              <input
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder={pick(AUTH_COPY.childNamePlaceholder)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <select
                value={childRegion}
                onChange={(e) => setChildRegion(e.target.value as RegionCode)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-2 text-white"
              >
                {data.regions.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.flag} {regionName(r.code)} ({r.code})
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
                    {gradeLabel(g, childRegion)}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 space-y-1.5">
              <div className="font-semibold text-indigo-300">
                {pick(AUTH_COPY.jurisdictionPrefix)}
                {childRegimeSpec.regulationName}
              </div>
              <p className="text-[11px] text-slate-400">
                {childRegimeSpec.summary}
              </p>
              <label className="flex items-center gap-2 pt-1 text-emerald-300 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="accent-emerald-500"
                />
                <span>
                  {AUTH_COPY.guardianConsentCheckbox(childDailyLimit, locale)}
                </span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => void handleCreateChildAccount()}
              className="w-full rounded-xl bg-emerald-600 py-2.5 font-bold text-white hover:bg-emerald-500"
            >
              {pick(AUTH_COPY.createChildSubmitBtn)}
            </button>

            {createdChildResult && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-emerald-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>
                    {pick(AUTH_COPY.childCreatedSuccessPrefix)}
                    <code className="ml-1 rounded bg-slate-950 px-2 py-0.5 text-sm font-bold text-amber-300">
                      {createdChildResult.kidPin}
                    </code>
                  </span>
                </div>
                <div className="text-[11px] text-slate-300">
                  {pick(AUTH_COPY.childCreatedHint)}
                </div>
              </div>
            )}
          </div>

          {/* Student Classroom Invite Joiner */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3 text-xs">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-violet-400" />
              <span>{pick(AUTH_COPY.card3Title)}</span>
            </h2>
            <div className="flex gap-2">
              <input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder={pick(AUTH_COPY.inviteCodePlaceholder)}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono uppercase text-white"
              />
              <button
                type="button"
                onClick={() => void handleJoinClass()}
                className="rounded-xl bg-violet-600 px-4 py-2 font-bold text-white hover:bg-violet-500"
              >
                {pick(AUTH_COPY.joinClassBtn)}
              </button>
            </div>
            {joinState && (
              <div
                className={`font-medium ${
                  joinState.ok ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                {joinState.ok
                  ? AUTH_COPY.joinClassSuccessMsg(
                      localizeClassroomName(joinState.classroom, locale),
                      locale
                    )
                  : joinState.error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card 4: Live 9-Region PII De-Identification Inspector, Audit Trail & 9-Region Regime Matrix */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <EyeOff className="h-4 w-4 text-emerald-400" />
            <span>{pick(AUTH_COPY.card4Title)}</span>
          </h2>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-300">
            <Lock className="h-3.5 w-3.5" /> {pick(AUTH_COPY.formulaPreservedTag)}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-6 space-y-2.5 text-xs">
            <textarea
              rows={3}
              value={sandboxRaw}
              onChange={(e) => {
                setSandboxEdited(true);
                setSandboxRaw(e.target.value);
              }}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white leading-relaxed"
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void runPrivacySandbox()}
                className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-500"
              >
                {AUTH_COPY.runSandboxBtn(regionCode, locale)}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSandboxEdited(false);
                  setSandboxRaw(getPiiSandboxSample(locale));
                  setSandboxResult(null);
                }}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-semibold text-slate-300 hover:border-emerald-400"
              >
                {pick(AUTH_COPY.sandboxResetBtn)}
              </button>
            </div>

            {sandboxResult && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-3.5 space-y-2">
                <div className="flex flex-wrap justify-between gap-2 font-mono text-[11px] text-emerald-300">
                  <span>
                    {AUTH_COPY.sandboxTokenLabel(sandboxResult.anonToken, locale)}
                  </span>
                  <span>
                    {AUTH_COPY.sandboxRedactedLabel(
                      sandboxResult.redactedTypes,
                      locale
                    )}
                  </span>
                </div>
                <div className="rounded-lg bg-slate-950 p-2.5 font-mono text-slate-200 break-words">
                  {sandboxResult.sanitizedText}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-6 space-y-2">
            <div className="text-xs font-bold text-slate-300">
              {pick(AUTH_COPY.auditLogTitlePrefix)}
              <code>privacy_audit_logs</code>
              {pick(AUTH_COPY.auditLogTitleSuffix)}
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
                      {pick(AUTH_COPY.auditRedactedPrefix)}{" "}
                      {log.redactedFieldsJson.join(",")}
                    </span>
                  </div>
                  <div className="text-slate-400 truncate">
                    {localizeAuditPreview(log, locale)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* All 9-Region Privacy Regime Cards */}
        <div className="pt-2 border-t border-slate-800/80 space-y-3">
          <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Globe2 className="h-4 w-4 text-emerald-400" />
            <span>{pick(AUTH_COPY.regimeMatrixTitle)}</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.regions.map((r) => {
              const spec = getLocalizedPrivacyRegime(r.code, locale);
              const isActive = r.code === regionCode;
              return (
                <button
                  key={r.code}
                  type="button"
                  onClick={() => setChildRegion(r.code)}
                  className={`rounded-xl border p-3.5 text-left space-y-1.5 transition ${
                    isActive
                      ? "border-emerald-500/60 bg-emerald-950/20"
                      : "border-slate-800 bg-slate-950/70 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-white">
                      {r.flag} {regionName(r.code)} ({r.code})
                    </span>
                    <span className="rounded bg-indigo-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-indigo-300">
                      {AUTH_COPY.minorAgeBadge(spec.minorConsentAge, locale)}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-300">
                    {spec.regulationName}
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    {spec.summary}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
