"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  GeneratedQuestionInstance,
  LocaleCode,
  LocalizedText,
  MasteryStatus,
  RegionalAlignmentRecord,
  RegionCode,
  RegionMetadata,
  SubjectId,
  UserRole,
} from "@/types/taxonomy";
import type { SubjectSeed } from "@/data/regions-and-subjects";
import type { TopicSeedDefinition } from "@/data/canonical-topics-math";
import type { EdgeSeedDefinition } from "@/data/canonical-graph";
import {
  LOCALE_OPTIONS,
  getLocalizedGradeLabel,
  getLocalizedRegionProfile,
  getRegionDisplayName,
  localizeAlignment,
  localizeText,
  localizeUserName,
  localizeUserTrack,
  toTraditionalChinese,
  uiPick,
  type LocalizedRegionProfile,
  type UiCopy,
} from "@/lib/i18n";

export interface UserRecord {
  id: string;
  role: UserRole;
  displayName: string;
  avatarEmoji: string;
  regionCode: RegionCode;
  currentGrade: number | null;
  schoolTrack: string | null;
  targetTransitionRegion: RegionCode | null;
}

export interface StudentTopicStateRecord {
  studentId: string;
  topicId: string;
  status: MasteryStatus;
  pMastery: number;
  attemptsCount: number;
  correctCount: number;
  isRootCause: boolean;
  lastMisconception: string | null;
  fsrsDifficulty: number;
  fsrsStability: number;
  lastPracticedAt: string | null;
  nextReviewAt: string | null;
}

export interface EnrichedWrongQuestion {
  id: string;
  studentId: string;
  topicId: string;
  templateId: string;
  questionSnapshotJson: GeneratedQuestionInstance;
  wrongUserAnswer: string;
  misconceptionTag: string | null;
  misconceptionLabel: string | null;
  status: "active" | "reviewing" | "cleared";
  fsrsDifficulty: number;
  fsrsStability: number;
  reps: number;
  lapses: number;
  twinClearStreak: number;
  createdAt: string;
  lastReviewedAt: string;
  nextReviewAt: string;
  retrievability: number;
  isDue: boolean;
}

export interface AssignmentRecord {
  id: string;
  classId: string;
  teacherId: string;
  title: string;
  tier: "foundational" | "standard" | "challenge";
  targetTopicIdsJson: string[];
  assignedStudentIdsJson: string[];
  completedStudentIdsJson: string[];
  dueDate: string;
  createdAt: string;
}

export interface BootstrapPayload {
  regions: RegionMetadata[];
  subjects: SubjectSeed[];
  topics: TopicSeedDefinition[];
  edges: EdgeSeedDefinition[];
  alignments: RegionalAlignmentRecord[];
  users: UserRecord[];
  classrooms: Array<{
    id: string;
    name: string;
    teacherId: string;
    regionCode: RegionCode;
    grade: number;
    subjectId: SubjectId;
    inviteCode: string;
  }>;
  classMemberships: Array<{ classId: string; studentId: string }>;
  parentChildLinks: Array<{
    parentId: string;
    studentId: string;
    relationshipLabel: string;
  }>;
  studentStates: StudentTopicStateRecord[];
  wrongQuestions: EnrichedWrongQuestion[];
  assignments: AssignmentRecord[];
  authProfiles?: Array<{
    userId: string;
    loginHandle: string;
    hasKidPin: boolean;
    anonymousToken: string;
    ageGroup: string;
    parentConsentVerified: boolean;
    privacyRegime: string;
  }>;
  studyPacts?: Array<{
    id: string;
    studentId: string;
    parentId: string;
    dailyLimitMinutes: number;
    todayUsedMinutes: number;
    weeklyTargetNodes: number;
    completedNodesThisWeek: number;
    rewardTitle: string;
    badgeUnlocked: boolean;
    updatedAt: string;
  }>;
  customEdges?: Array<{
    id: string;
    topicId: string;
    prerequisiteId: string;
    relationType: string;
    reasonZh: string;
    reasonEn: string;
    createdBy: string;
    createdAt: string;
  }>;
  customQuestions?: Array<{
    id: string;
    topicId: string;
    difficulty: string;
    promptZh: string;
    promptEn: string;
    latexFormula: string | null;
    choicesJson: string[];
    answer: string;
    explanationZh: string;
    createdBy: string;
    createdAt: string;
  }>;
  irtStats?: Array<{
    templateId: string;
    topicId: string;
    priorBeta: number;
    calibratedBeta: number;
    discriminationAlpha: number;
    attempts: number;
    correct: number;
    updatedAt: string;
  }>;
  attemptLogs?: Array<{
    id: string;
    studentAnonToken: string;
    studentId: string;
    topicId: string;
    templateId: string;
    isCorrect: boolean;
    pMasteryAfter: number;
    thetaEstimate: number;
    createdAt: string;
  }>;
  privacyAuditLogs?: Array<{
    id: string;
    timestamp: string;
    actorAnonToken: string;
    regionCode: string;
    regulation: string;
    endpoint: string;
    redactedFieldsJson: string[];
    payloadPreview: string;
  }>;
}

interface PlatformContextValue {
  data: BootstrapPayload | null;
  loading: boolean;
  locale: LocaleCode;
  setLocale: (loc: LocaleCode) => void;
  regionCode: RegionCode;
  setRegionCode: (code: RegionCode) => void;
  bilingual: boolean;
  setBilingual: (v: boolean) => void;
  activeRole: UserRole;
  setActiveRole: (r: UserRole) => void;
  activeStudentId: string;
  setActiveStudentId: (id: string) => void;
  loggedInUserId: string;
  setLoggedInUserId: (id: string) => void;
  activeRegion: RegionMetadata | undefined;
  activeStudent: UserRecord | undefined;
  refreshData: () => Promise<void>;
  resetDemoData: () => Promise<void>;
  pick: (copy: UiCopy) => string;
  localize: (text: LocalizedText | undefined) => string;
  localizePlain: (text: LocalizedText | undefined) => string;
  userName: (u: { id: string; displayName: string }) => string;
  userTrack: (u: {
    id: string;
    schoolTrack: string | null;
    regionCode: RegionCode;
    currentGrade: number | null;
  }) => string;
  regionName: (code: RegionCode) => string;
  regionProfile: (reg: RegionMetadata) => LocalizedRegionProfile;
  gradeLabel: (grade: number | null | undefined, overrideRegion?: RegionCode) => string;
  getAlignment: (
    topicId: string,
    overrideRegion?: RegionCode
  ) => RegionalAlignmentRecord | undefined;
  getStudentTopicState: (
    topicId: string,
    studentId?: string
  ) => StudentTopicStateRecord | undefined;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

const VALID_LOCALES = new Set<LocaleCode>(["zh-CN", "zh-TW", "en", "ja", "ko", "ms"]);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<BootstrapPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [locale, setLocaleState] = useState<LocaleCode>("zh-CN");
  const [regionCode, setRegionCodeState] = useState<RegionCode>("CN");
  const [bilingual, setBilingual] = useState<boolean>(false);
  const [activeRole, setActiveRole] = useState<UserRole>("student");
  const [activeStudentId, setActiveStudentIdState] = useState<string>("stu_leo");
  const [loggedInUserId, setLoggedInUserId] = useState<string>("stu_leo");

  // Restore saved UI locale preference on client mount
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("omnigraph_locale") as LocaleCode | null;
      if (saved && VALID_LOCALES.has(saved)) {
        setLocaleState(saved);
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  // Sync <html lang="..."> dynamically whenever locale changes
  useEffect(() => {
    const opt = LOCALE_OPTIONS.find((o) => o.code === locale);
    if (typeof document !== "undefined" && opt) {
      document.documentElement.lang = opt.htmlLang;
    }
  }, [locale]);

  const setLocale = useCallback((loc: LocaleCode) => {
    setLocaleState(loc);
    try {
      window.localStorage.setItem("omnigraph_locale", loc);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const res = await fetch("/api/bootstrap", { cache: "no-store" });
      const json = await res.json();
      if (json.ok) {
        setData(json as BootstrapPayload);
      }
    } catch (e) {
      console.error("Failed to load bootstrap payload:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const setRegionCode = useCallback(
    (code: RegionCode) => {
      setRegionCodeState(code);
      const reg = data?.regions.find((r) => r.code === code);
      if (reg) {
        setLocale(reg.primaryLocale);
      }
    },
    [data, setLocale]
  );

  const setActiveStudentId = useCallback(
    (id: string) => {
      setActiveStudentIdState(id);
      const stu = data?.users.find((u) => u.id === id);
      if (stu) {
        setRegionCodeState(stu.regionCode);
        const reg = data?.regions.find((r) => r.code === stu.regionCode);
        if (reg) {
          setLocale(reg.primaryLocale);
        }
      }
    },
    [data, setLocale]
  );

  const resetDemoData = useCallback(async () => {
    setLoading(true);
    await fetch("/api/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset_demo" }),
    });
    await refreshData();
  }, [refreshData]);

  const activeRegion = useMemo(
    () => data?.regions.find((r) => r.code === regionCode),
    [data, regionCode]
  );

  const activeStudent = useMemo(
    () => data?.users.find((u) => u.id === activeStudentId),
    [data, activeStudentId]
  );

  const pick = useCallback(
    (copy: UiCopy): string => uiPick(locale, copy),
    [locale]
  );

  const localize = useCallback(
    (text: LocalizedText | undefined): string => {
      return localizeText(text, locale, bilingual, regionCode);
    },
    [locale, bilingual, regionCode]
  );

  const localizePlain = useCallback(
    (text: LocalizedText | undefined): string => {
      return localizeText(text, locale, false, regionCode);
    },
    [locale, regionCode]
  );

  const userName = useCallback(
    (u: { id: string; displayName: string }) => localizeUserName(u, locale),
    [locale]
  );

  const userTrack = useCallback(
    (u: {
      id: string;
      schoolTrack: string | null;
      regionCode: RegionCode;
      currentGrade: number | null;
    }) => localizeUserTrack(u, locale),
    [locale]
  );

  const regionName = useCallback(
    (code: RegionCode) => getRegionDisplayName(code, locale),
    [locale]
  );

  const regionProfile = useCallback(
    (reg: RegionMetadata) =>
      getLocalizedRegionProfile(reg, locale, toTraditionalChinese),
    [locale]
  );

  const regionMap = useMemo(() => {
    const m = new Map<RegionCode, RegionMetadata>();
    for (const r of data?.regions ?? []) {
      m.set(r.code, r);
    }
    return m;
  }, [data]);

  const topicMap = useMemo(() => {
    const m = new Map<string, TopicSeedDefinition>();
    for (const t of data?.topics ?? []) {
      m.set(t.id, t);
    }
    return m;
  }, [data]);

  const gradeLabel = useCallback(
    (grade: number | null | undefined, overrideRegion?: RegionCode) => {
      const reg = regionMap.get(overrideRegion ?? regionCode);
      return getLocalizedGradeLabel(reg, grade, locale, toTraditionalChinese);
    },
    [regionMap, regionCode, locale]
  );

  const alignmentMap = useMemo(() => {
    const m = new Map<string, RegionalAlignmentRecord>();
    for (const a of data?.alignments ?? []) {
      m.set(`${a.topicId}::${a.regionCode}`, a);
    }
    return m;
  }, [data]);

  const getAlignment = useCallback(
    (topicId: string, overrideRegion?: RegionCode) => {
      const targetRegion = overrideRegion ?? regionCode;
      const raw = alignmentMap.get(`${topicId}::${targetRegion}`);
      if (!raw) return undefined;
      return localizeAlignment(
        raw,
        topicMap.get(topicId),
        regionMap.get(targetRegion),
        locale
      );
    },
    [alignmentMap, regionCode, topicMap, regionMap, locale]
  );

  const stateMap = useMemo(() => {
    const m = new Map<string, StudentTopicStateRecord>();
    for (const st of data?.studentStates ?? []) {
      m.set(`${st.studentId}::${st.topicId}`, st);
    }
    return m;
  }, [data]);

  const getStudentTopicState = useCallback(
    (topicId: string, studentId?: string) => {
      return stateMap.get(`${studentId ?? activeStudentId}::${topicId}`);
    },
    [stateMap, activeStudentId]
  );

  const value: PlatformContextValue = {
    data,
    loading,
    locale,
    setLocale,
    regionCode,
    setRegionCode,
    bilingual,
    setBilingual,
    activeRole,
    setActiveRole,
    activeStudentId,
    setActiveStudentId,
    loggedInUserId,
    setLoggedInUserId,
    activeRegion,
    activeStudent,
    refreshData,
    resetDemoData,
    pick,
    localize,
    localizePlain,
    userName,
    userTrack,
    regionName,
    regionProfile,
    gradeLabel,
    getAlignment,
    getStudentTopicState,
  };

  return (
    <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>
  );
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) {
    throw new Error("usePlatform must be used inside PlatformProvider");
  }
  return ctx;
}
