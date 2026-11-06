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
  localize: (text: LocalizedText | undefined) => string;
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

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<BootstrapPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [regionCode, setRegionCodeState] = useState<RegionCode>("CN");
  const [bilingual, setBilingual] = useState<boolean>(true);
  const [activeRole, setActiveRole] = useState<UserRole>("student");
  const [activeStudentId, setActiveStudentIdState] = useState<string>("stu_leo");
  const [loggedInUserId, setLoggedInUserId] = useState<string>("stu_leo");

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
      if (reg?.notation.defaultBilingual) {
        setBilingual(true);
      }
    },
    [data]
  );

  const setActiveStudentId = useCallback(
    (id: string) => {
      setActiveStudentIdState(id);
      const stu = data?.users.find((u) => u.id === id);
      if (stu) {
        setRegionCodeState(stu.regionCode);
      }
    },
    [data]
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

  const localize = useCallback(
    (text: LocalizedText | undefined): string => {
      if (!text) return "";
      const primaryLocale = activeRegion?.primaryLocale ?? "zh-CN";
      let primary = text["zh-CN"];
      if (primaryLocale === "zh-TW" && text["zh-TW"]) primary = text["zh-TW"];
      else if (primaryLocale === "ja" && text.ja) primary = `${text.ja}（${text["zh-CN"]}）`;
      else if (primaryLocale === "ko" && text.ko) primary = `${text.ko}（${text["zh-CN"]}）`;
      else if (primaryLocale === "ms" && text.ms) primary = `${text.ms} (${text["zh-CN"]})`;
      else if (primaryLocale === "en") primary = `${text.en} · ${text["zh-CN"]}`;

      if (bilingual && primaryLocale !== "en" && text.en && !primary.includes(text.en)) {
        return `${primary} · ${text.en}`;
      }
      return primary;
    },
    [activeRegion, bilingual]
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
      return alignmentMap.get(`${topicId}::${overrideRegion ?? regionCode}`);
    },
    [alignmentMap, regionCode]
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
    localize,
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
