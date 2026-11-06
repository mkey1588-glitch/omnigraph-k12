export type RegionCode =
  | "CN" // 中国大陆
  | "HK" // 中国香港
  | "TW" // 中国台湾
  | "SG" // 新加坡
  | "MY" // 马来西亚
  | "JP" // 日本
  | "KR" // 韩国
  | "UK" // 英国
  | "US"; // 美国

export type LocaleCode = "zh-CN" | "zh-TW" | "en" | "ja" | "ko" | "ms";

export type LocalizedText = {
  "zh-CN": string;
  "zh-TW"?: string;
  en: string;
  ja?: string;
  ko?: string;
  ms?: string;
};

export type SubjectId =
  | "math"
  | "physics"
  | "chemistry"
  | "biology"
  | "english"
  | "computing"
  | "geography"
  | "history"
  | "literacy";

export type CognitiveType =
  | "conceptual"
  | "procedural"
  | "reasoning"
  | "application"
  | "modeling";

export type EdgeRelationType = "hard" | "soft" | "cross_subject";

export type DifficultyTier = "basic" | "standard" | "challenge";

export type MasteryStatus =
  | "untested"
  | "mastered"
  | "inferred_mastered"
  | "shaky"
  | "weak";

export type UserRole = "student" | "teacher" | "parent";

export interface NotationProfile {
  currencySymbol: string;
  currencyCode: string;
  measurementSystem: "metric" | "imperial_mixed";
  supportsBarModel?: boolean; // e.g. Singapore CPA Bar Modeling
  defaultBilingual?: boolean; // e.g. HK EMI/CMI, MY DLP, SG
  divisionLayout?: "cn_jp" | "us_uk";
}

export interface RegionMetadata {
  code: RegionCode;
  flag: string;
  nameZh: string;
  nameLocal: string;
  nameEn: string;
  primaryLocale: LocaleCode;
  secondaryLocale?: LocaleCode;
  schoolSystem: string;
  curriculumName: string;
  flagshipExams: string[];
  privacyRegulation: string;
  gradeLabels: Record<number, string>; // Global grade 1..12 -> regional label
  notation: NotationProfile;
}

export interface MicroLessonStep {
  title: LocalizedText;
  body: LocalizedText;
  formulaOrHighlight?: string;
  checkQuestion?: LocalizedText;
  checkAnswer?: string;
}

export interface CommonMisconception {
  tag: string;
  label: LocalizedText;
  wrongPattern: LocalizedText;
  remediationTip: LocalizedText;
}

export interface MicroLessonPayload {
  intuition: LocalizedText;
  coreFormula?: string;
  visualType?: "number_line" | "bar_model" | "parabola" | "right_triangle" | "circuit" | "force_diagram" | "balance_scale";
  steps: MicroLessonStep[];
  misconceptions: CommonMisconception[];
}

export interface RegionalAlignmentRecord {
  topicId: string;
  regionCode: RegionCode;
  localGrade: number; // 1..12
  localStageLabel: string; // e.g. "八年级上册", "Sec 2", "中2", "Grade 8", "Key Stage 3"
  standardCode: string; // Official code only (codes-only policy)
  textbookEdition: string; // e.g. "人教版 2024 / 沪教版对照", "MOE Syllabus", "108課綱"
  localChapterTitle: string;
  examWeight: "core" | "extension" | "enrichment";
  regionalNote?: string;
}

export interface GeneratedChoice {
  key: "A" | "B" | "C" | "D";
  text: string;
  textEn?: string;
  misconceptionTag?: string; // If wrong choice selected, pinpoints cognitive misconception!
}

export interface ScaffoldStep {
  promptZh: string;
  promptEn: string;
  hintZh: string;
  hintEn: string;
  expectedAnswer: string;
  expectedAnswerEn?: string;
}

export interface InteractiveWidgetConfig {
  kind: "number_line_slider" | "function_probe" | "ohm_parallel_lab";
  min: number;
  max: number;
  step: number;
  initialValue: number;
  unitLabel?: string;
  captionZh: string;
  captionEn: string;
  bindToAnswer?: boolean; // If true, dragging updates the answer box live!
  fixedParamA?: number;
  fixedParamB?: number;
}

export interface GeneratedQuestionInstance {
  instanceId: string;
  templateId: string;
  topicId: string;
  seed: string;
  difficulty: DifficultyTier;
  itemType: "choice" | "numeric" | "expression";
  promptZh: string;
  promptZhTw?: string;
  promptEn: string;
  latexFormula?: string; // Optional highlighted KaTeX formula card
  svgDiagram?: string; // Clean inline SVG using currentColor
  interactiveWidget?: InteractiveWidgetConfig; // Perseus-grade interactive math/science manipulative
  choices?: GeneratedChoice[];
  answer: string;
  acceptedEquivalents?: string[];
  unorderedMulti?: boolean;
  unit?: string;
  explanationZh: string;
  explanationEn: string;
  scaffolds: ScaffoldStep[];
  misconceptionsByValue?: Record<string, string>; // Maps specific wrong numeric/algebraic answers to misconception tag
}

export interface DiagnosticAnswerEntry {
  order: number;
  topicId: string;
  instance: GeneratedQuestionInstance;
  userAnswer: string;
  isCorrect: boolean;
  detectedMisconception?: string;
  whyAskedZh: string;
  whyAskedEn: string;
  timestamp: string;
}

export interface DiagnosticSessionState {
  sessionId: string;
  studentId: string;
  subjectId: SubjectId;
  regionCode: RegionCode;
  mode: "target" | "chapter" | "grade_screen";
  targets: string[];
  scopeTopicIds: string[]; // Topological ordered subgraph
  confirmRequired: number; // Default 2 or 3 consecutive correct to master
  maxQuestions: number;
  seed: string;
  stack: string[]; // DFS backtracking stack
  statusByTopic: Record<string, MasteryStatus>;
  attemptsByTopic: Record<
    string,
    Array<{ instanceId: string; difficulty: DifficultyTier; isCorrect: boolean; misconception?: string }>
  >;
  backtrackOriginByTopic: Record<string, string>; // Maps prerequisiteId -> downstream failed topicId
  history: DiagnosticAnswerEntry[];
  finished: boolean;
}
