import type {
  CognitiveType,
  DifficultyTier,
  EdgeRelationType,
  LocaleCode,
  MasteryStatus,
  SubjectId,
  UserRole,
} from "@/types/taxonomy";
import { c, uiPick, type UiCopy } from "./index";

export const NAV_COPY = {
  brandBadge: c(
    "万象学阶 · 9地全科",
    "9-Region All-Subject KG",
    "9地域・全教科グラフ",
    "9개 지역 전과목 지식그래프",
    "Graf K12 9 Rantau"
  ),
  brandSubtitle: c(
    "全球 K12 标准知识图谱与自适应导师系统",
    "Global Canonical Knowledge Graph & Adaptive Tutor",
    "グローバル K12 知識グラフ＆適応型 AI チューター",
    "글로벌 K12 표준 지식그래프 & 적응형 AI 튜터",
    "Graf Pengetahuan Kanonik Global & Tutor Adaptif"
  ),
  roles: {
    student: c("🎒 学生端", "🎒 Student", "🎒 生徒", "🎒 학생", "🎒 Pelajar"),
    teacher: c("👩‍🏫 教师端", "👩‍🏫 Teacher", "👩‍🏫 教員", "👩‍🏫 교사", "👩‍🏫 Guru"),
    parent: c("👨‍👧 家长端", "👨‍👧 Parent", "👨‍👧 保護者", "👨‍👧 학부모", "👨‍👧 Ibu Bapa"),
  } satisfies Record<UserRole, UiCopy>,
  tabs: {
    overview: c("个人总览", "Overview", "マイページ", "학습 개요", "Gambaran"),
    explore: c("知识图谱星海", "Knowledge Map", "知識グラフ探索", "지식그래프 탐색", "Peta Ilmu"),
    diagnose: c("靶向回溯诊断", "Adaptive Diagnose", "遡及アダプティブ診断", "역추적 적응형 진단", "Diagnosis Adaptif"),
    capture: c("AI智能录错题", "AI Capture", "AI誤答キャプチャ", "AI 오답 캡처", "Rakaman AI"),
    wrongBook: c("FSRS 错题清零", "FSRS Clearance", "FSRS 誤答クリア", "FSRS 오답 클리어", "Buku Salah FSRS"),
    teacher: c("教师教研台", "Teacher Hub", "教員ダッシュボード", "교사 연구실", "Hab Guru"),
    paperBuilder: c("9地组AB卷", "A/B Exam Builder", "A/B 試験作成", "A/B 시험지 빌더", "Pembina Kertas A/B"),
    studio: c("校本工坊/IRT", "School Studio / IRT", "校内工房 / IRT", "학교 스튜디오 / IRT", "Studio / IRT"),
    parent: c("家长伴学空间", "Parent Space", "保護者スペース", "학부모 공간", "Ruang Ibu Bapa"),
    auth: c("账号/PIN/隐私盾", "Auth / PIN / Privacy", "認証 / PIN / 保護", "계정 / PIN / 보호", "Akaun / PIN / Privasi"),
  },
  studentAria: c(
    "切换当前学生档案",
    "Switch active student persona",
    "対象生徒プロフィールの切替",
    "현재 학생 프로필 전환",
    "Tukar profil pelajar aktif"
  ),
  regionAria: c(
    "切换 9 地课标与学制",
    "Switch 9-region curriculum",
    "9地域の学習指導要領を切替",
    "9개 지역 교육과정 전환",
    "Tukar kurikulum 9 rantau"
  ),
  localeAria: c(
    "切换界面语言",
    "Switch UI language",
    "表示言語を切替",
    "인터페이스 언어 전환",
    "Tukar bahasa antara muka"
  ),
  bilingualTitle: c(
    "切换双语对照（适配香港 EMI / 新加坡 / 马来西亚 DLP / 国际课程衔接）",
    "Toggle bilingual side-by-side labels (for HK EMI, SG, MY DLP & international bridging)",
    "バイリンガル併記の切替（国際カリキュラム移行サポート）",
    "이중언어 병기 전환 (국제 교육과정 연계 지원)",
    "Togol paparan dwibahasa (untuk DLP Malaysia, Singapura & HK EMI)"
  ),
  bilingualBtn: c("双语", "Bilingual", "二言語", "이중언어", "Dwibahasa"),
  resetDemoTitle: c(
    "重置演示数据库至初始状态",
    "Reset demo database to initial seed state",
    "デモデータベースを初期状態にリセット",
    "데모 데이터베이스 초기 상태로 재설정",
    "Tetapkan semula pangkalan data demo"
  ),
};

export const FOOTER_COPY = {
  left: c(
    "OmniGraph K12（万象学阶） · 洁净室商用级架构（MIT 代码 + 标准核心图谱 + 9 地课标映射）",
    "OmniGraph K12 · Clean-Room Commercial-Ready Architecture (MIT Code + Canonical Core + 9-Region Standard Overlays)",
    "OmniGraph K12 · クリーンルーム商用対応アーキテクチャ（MIT + 標準コアグラフ + 9地域カリキュラム対応）",
    "OmniGraph K12 · 클린룸 상용 아키텍처 (MIT 코드 + 표준 코어 그래프 + 9개 지역 교육과정 매핑)",
    "OmniGraph K12 · Seni Bina Sedia Komersial (Kod MIT + Graf Kanonik + Jajaran 9 Rantau)"
  ),
  right: c(
    "支持地区：🇨🇳中 · 🇭🇰港 · 🇹🇼台 · 🇸🇬新 · 🇲🇾马 · 🇯🇵日 · 🇰🇷韩 · 🇬🇧英 · 🇺🇸美",
    "Regions: 🇨🇳CN · 🇭🇰HK · 🇹🇼TW · 🇸🇬SG · 🇲🇾MY · 🇯🇵JP · 🇰🇷KR · 🇬🇧UK · 🇺🇸US",
    "対応地域：🇨🇳CN · 🇭🇰HK · 🇹🇼TW · 🇸🇬SG · 🇲🇾MY · 🇯🇵JP · 🇰🇷KR · 🇬🇧UK · 🇺🇸US",
    "지원 지역: 🇨🇳CN · 🇭🇰HK · 🇹🇼TW · 🇸🇬SG · 🇲🇾MY · 🇯🇵JP · 🇰🇷KR · 🇬🇧UK · 🇺🇸US",
    "Rantau: 🇨🇳CN · 🇭🇰HK · 🇹🇼TW · 🇸🇬SG · 🇲🇾MY · 🇯🇵JP · 🇰🇷KR · 🇬🇧UK · 🇺🇸US"
  ),
};

export const WIDGET_COPY = {
  numberLineTitle: c(
    "🎛️ 交互数轴探针：",
    "🎛️ Interactive Number Line: ",
    "🎛️ 数直線プローブ：",
    "🎛️ 수직선 탐침: ",
    "🎛️ Garis Nombor Interaktif: "
  ),
  currentPos: c("当前位置 =", "Position =", "現在位置 =", "현재 위치 =", "Kedudukan ="),
  ohmLabTitle: c(
    "⚡ 虚拟电学并联实验台：",
    "⚡ Virtual Parallel Circuit Lab: ",
    "⚡ 並列回路バーチャル実験室：",
    "⚡ 가상 병렬회로 실험실: ",
    "⚡ Makmal Litar Selari Maya: "
  ),
  ohmReadout: (rFixed: number, rVar: number, rEq: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `固定 R₁=${rFixed}Ω ∥ 滑动 R₂=${rVar}Ω → 等效 R_eq = ${rEq}Ω`,
        `Fixed R₁=${rFixed}Ω ∥ Slider R₂=${rVar}Ω → R_eq = ${rEq}Ω`,
        `固定 R₁=${rFixed}Ω ∥ 可変 R₂=${rVar}Ω → 合成 R_eq = ${rEq}Ω`,
        `고정 R₁=${rFixed}Ω ∥ 가변 R₂=${rVar}Ω → 합성 R_eq = ${rEq}Ω`,
        `Tetap R₁=${rFixed}Ω ∥ Gelongsor R₂=${rVar}Ω → R_eq = ${rEq}Ω`
      )
    ),
  ohmFillBtn: (rEq: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `将当前实验读数 ${rEq} Ω 填入答案框`,
        `Insert lab reading ${rEq} Ω into answer box`,
        `実験値 ${rEq} Ω を解答欄に入力`,
        `실험 측정값 ${rEq} Ω 답안란에 입력`,
        `Masukkan bacaan ${rEq} Ω ke kotak jawapan`
      )
    ),
  funcProbeTitle: c(
    "📈 函数动态探针：",
    "📈 Dynamic Function Probe: ",
    "📈 関数ダイナミックプローブ：",
    "📈 함수 동적 탐침: ",
    "📈 Prob Fungsi Dinamik: "
  ),
  funcReadout: (x: number, y: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `当 x = ${x} 时，y = ${y}`,
        `At x = ${x}, y = ${y}`,
        `x = ${x} のとき y = ${y}`,
        `x = ${x} 일 때, y = ${y}`,
        `Apabila x = ${x}, y = ${y}`
      )
    ),
  funcFillBtn: (x: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `锁定对称轴 x = ${x} 填入答案框`,
        `Lock axis of symmetry x = ${x} into answer box`,
        `対称軸 x = ${x} を解答欄に入力`,
        `대칭축 x = ${x} 답안란에 입력`,
        `Kunci paksi simetri x = ${x} ke kotak jawapan`
      )
    ),
};

export const CANVAS_COPY = {
  legend: c("图例：", "Legend:", "凡例：", "범례:", "Petunjuk:"),
  legendMastered: c("已掌握/豁免", "Mastered / Exempt", "習得済/免除", "마스터/면제", "Dikuasai / Dikecuali"),
  legendShaky: c("滑档待稳", "Shaky", "要定着", "불안정", "Tidak Stabil"),
  legendWeak: c("薄弱/根因", "Weak / Root Cause", "弱点/根本原因", "취약/근본원인", "Lemah / Punca"),
  legendHard: c("── 强先修", "── Hard Prereq", "── 必須前提", "── 필수 선수", "── Prasyarat Keras"),
  legendSoft: c("- - 弱先修", "- - Soft Prereq", "- - 推奨前提", "- - 권장 선수", "- - Prasyarat Lembut"),
  legendCross: c("━━ 跨科桥", "━━ Cross-Subject Bridge", "━━ 教科横断ブリッジ", "━━ 교과 간 브리지", "━━ Jambatan Rentas Subjek"),
  zoomOut: c("缩小画布", "Zoom out", "縮小", "축소", "Zum keluar"),
  zoomIn: c("放大画布", "Zoom in", "拡大", "확대", "Zum masuk"),
  zoomReset: c("重置比例", "Reset zoom", "リセット", "배율 초기화", "Tetapkan semula zum"),
  gradeHeader: (g: number, locale: LocaleCode) =>
    uiPick(locale, c(`学段 G${g}`, `Grade G${g}`, `学年 G${g}`, `학년 G${g}`, `Gred G${g}`)),
  rootTag: c(" · 🎯根因", " · 🎯Root", " · 🎯根本", " · 🎯원인", " · 🎯Punca"),
  upstreamTag: c(" · ⬆先修", " · ⬆Prereq", " · ⬆前提", " · ⬆선수", " · ⬆Huluan"),
  downstreamTag: c(" · ⬇解锁", " · ⬇Unlocks", " · ⬇解放", " · ⬇후속", " · ⬇Hiliran"),
};

const STATUS_LABELS: Record<MasteryStatus, UiCopy> = {
  mastered: c("已掌握", "Mastered", "習得済", "마스터", "Dikuasai"),
  inferred_mastered: c("先修豁免", "Prereq Exempt", "前提免除", "선수 면제", "Dikecualikan"),
  shaky: c("滑档待稳", "Shaky", "要定着", "불안정", "Perlu Kukuh"),
  weak: c("薄弱卡点", "Weak Gap", "弱点", "취약", "Lemah"),
  untested: c("待诊断", "Untested", "未診断", "미진단", "Belum Diuji"),
};

const DIFFICULTY_LABELS: Record<DifficultyTier, UiCopy> = {
  basic: c("基础降维", "Basic", "基礎", "기초", "Asas"),
  standard: c("标准课标", "Standard", "標準", "표준", "Standard"),
  challenge: c("拔高挑战", "Challenge", "発展", "심화", "Cabaran"),
};

const RELATION_LABELS: Record<EdgeRelationType, UiCopy> = {
  hard: c("强先修依赖", "Hard Prerequisite", "必須前提", "필수 선수", "Prasyarat Keras"),
  soft: c("弱先修建议", "Recommended Prereq", "推奨前提", "권장 선수", "Prasyarat Cadangan"),
  cross_subject: c("跨学科桥接", "Cross-Subject Bridge", "教科横断ブリッジ", "교과 간 브리지", "Jambatan Rentas Subjek"),
};

const COGNITIVE_LABELS: Record<CognitiveType, UiCopy> = {
  conceptual: c("概念理解", "Conceptual", "概念理解", "개념 이해", "Konseptual"),
  procedural: c("程序运算", "Procedural", "手続・計算", "절차·연산", "Prosedur"),
  reasoning: c("推理论证", "Reasoning", "推論・論証", "추론·논증", "Penaakulan"),
  application: c("情境应用", "Application", "応用", "상황 적용", "Aplikasi"),
  modeling: c("跨科建模", "Modeling", "モデリング", "모델링", "Pemodelan"),
};

const SUBJECT_SHORT_BADGE: Record<SubjectId, UiCopy> = {
  math: c("📐 数学", "📐 Math", "📐 数学", "📐 수학", "📐 Mat"),
  physics: c("⚡ 物理", "⚡ Phys", "⚡ 物理", "⚡ 물리", "⚡ Fiz"),
  chemistry: c("🧪 化学", "🧪 Chem", "🧪 化学", "🧪 화학", "🧪 Kim"),
  biology: c("🧬 生物", "🧬 Bio", "🧬 生物", "🧬 생물", "🧬 Bio"),
  english: c("🔤 英语", "🔤 Eng", "🔤 英語", "🔤 영어", "🔤 BI"),
  computing: c("💻 信息", "💻 CS", "💻 情報", "💻 정보", "💻 SK"),
  geography: c("🌍 地理", "🌍 Geog", "🌍 地理", "🌍 지리", "🌍 Geo"),
  history: c("🏛️ 历史", "🏛️ Hist", "🏛️ 歴史", "🏛️ 역사", "🏛️ Sej"),
  literacy: c("📚 阅读", "📚 Lit", "📚 読解", "📚 독해", "📚 Baca"),
};

export function getMasteryStatusLabel(status: MasteryStatus, locale: LocaleCode): string {
  return uiPick(locale, STATUS_LABELS[status] ?? STATUS_LABELS.untested);
}

export function getDifficultyLabel(tier: DifficultyTier | string, locale: LocaleCode): string {
  return uiPick(
    locale,
    DIFFICULTY_LABELS[tier as DifficultyTier] ?? DIFFICULTY_LABELS.standard
  );
}

export function getRelationTypeLabel(rel: EdgeRelationType | string, locale: LocaleCode): string {
  return uiPick(
    locale,
    RELATION_LABELS[rel as EdgeRelationType] ?? RELATION_LABELS.hard
  );
}

export function getCognitiveTypeLabel(cog: CognitiveType | string, locale: LocaleCode): string {
  return uiPick(
    locale,
    COGNITIVE_LABELS[cog as CognitiveType] ?? COGNITIVE_LABELS.conceptual
  );
}

export function getSubjectShortBadge(subjectId: SubjectId, locale: LocaleCode): string {
  return uiPick(locale, SUBJECT_SHORT_BADGE[subjectId] ?? SUBJECT_SHORT_BADGE.math);
}

export function getLoadingText(locale: LocaleCode): string {
  return uiPick(
    locale,
    c(
      "正在加载全球 9 地全科知识图谱与自适应学情引擎…",
      "Loading 9-Region Knowledge Graph & Adaptive Mastery Engine…",
      "9地域・全教科知識グラフと適応型学習エンジンを読み込み中…",
      "9개 지역 전과목 지식그래프 및 적응형 학습 엔진을 불러오는 중…",
      "Memuatkan Graf Pengetahuan 9 Rantau & Enjin Penguasaan Adaptif…"
    )
  );
}
