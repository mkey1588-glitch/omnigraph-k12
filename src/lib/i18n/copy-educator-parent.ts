import type { LocaleCode } from "@/types/taxonomy";
import {
  SEED_USER_I18N,
  c,
  localizeUserName,
  uiPick,
} from "./index";

/**
 * Localizes creator names stored in custom school edges / custom questions
 * (e.g. "王知行老师 Ms. Evelyn Wang") with zero foreign-script leakage.
 */
export function localizeCreatorName(createdBy: string, locale: LocaleCode): string {
  if (!createdBy) {
    return SEED_USER_I18N.tch_wang.name[locale];
  }
  if (createdBy.includes("Evelyn Wang") || createdBy.includes("王知行")) {
    return SEED_USER_I18N.tch_wang.name[locale];
  }
  return localizeUserName({ id: "custom_creator", displayName: createdBy }, locale);
}

// ==================== 1. TEACHER WORKBENCH (/teacher) ====================

export const TEACHER_COPY = {
  loading: c(
    "正在加载班级学情热力图与跨科共性病灶引擎…",
    "Loading class mastery heatmap & cross-subject root-cause radar…",
    "クラス習熟度ヒートマップと教科横断の根本原因レーダーを読み込み中…",
    "학급 숙련도 히트맵 및 교과 간 근본원인 레이더를 불러오는 중…",
    "Memuatkan peta haba penguasaan kelas & radar punca rentas subjek…"
  ),
  headerTitle: (className: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `教师教研与分层指挥台 — ${className}`,
        `Teacher Hub & Differentiated Command — ${className}`,
        `教員ダッシュボード＆レベル別指導台 — ${className}`,
        `교사 연구실 및 수준별 지휘 본부 — ${className}`,
        `Hab Guru & Pusat Tugasan Terbeza — ${className}`
      )
    ),
  inviteCodeLabel: c("邀请码", "Invite", "招待コード", "초대 코드", "Kod Jemputan"),
  headerSubtitle: (regionLabel: string, regionCode: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `支持多学制插班生统一归口到全球概念核（当前课标视图：${regionLabel} · ${regionCode}），自动识别全班跨科前置根因并一键派发三档分层作业。`,
        `Unifies transfer students across school systems onto canonical micro-topics (Active curriculum view: ${regionLabel} · ${regionCode}), auto-detecting class-wide prerequisite bottlenecks and publishing 3-tier assignments.`,
        `異なる学制からの編入生を共通の概念コアに統合（現在の基準表示：${regionLabel} · ${regionCode}）。クラス共通の教科横断的な前提弱点を自動検出し、3段階の課題をワンクリックで配信します。`,
        `다양한 학제의 전학생을 글로벌 표준 개념 코어로 통합하여 (현재 교육과정 보기: ${regionLabel} · ${regionCode}), 학급 공통의 교과 간 선수 취약 원인을 자동 감지하고 3단계 수준별 과제를 배포합니다.`,
        `Menyatukan pelajar pelbagai aliran ke dalam topik mikro kanonik (Paparan kurikulum semasa: ${regionLabel} · ${regionCode}), mengesan punca kelemahan prasyarat kelas secara automatik dan mengagihkan tugasan 3 aras.`
      )
    ),
  radarTitle: c(
    "全班共性前置病灶与跨学科预警（DAG 自动根因雷达）",
    "Class-Wide Prerequisite Bottlenecks & Cross-Subject Alerts (DAG Root-Cause Radar)",
    "クラス共通の前提弱点＆教科横断アラート（DAG 自動根本原因レーダー）",
    "학급 공통 선수 취약점 및 교과 간 경보 (DAG 자동 근본원인 레이더)",
    "Amaran Kelemahan Prasyarat Kelas & Rentas Subjek (Radar Punca DAG)"
  ),
  downstreamBlocked: c(
    "下游受阻：",
    "Downstream Bottleneck: ",
    "下流のつまずき：",
    "하위 막힘 단원: ",
    "Sekatan Hiliran: "
  ),
  blockedCountBadge: (weakCount: number, totalCount: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `${weakCount}/${totalCount} 人卡壳`,
        `${weakCount}/${totalCount} struggling`,
        `${weakCount}/${totalCount} 名がつまずき`,
        `${weakCount}/${totalCount}명 막힘`,
        `${weakCount}/${totalCount} pelajar tersekat`
      )
    ),
  crossSubjectTraceLabel: c(
    "跨科数学根因溯源：",
    "Cross-Subject Math Root Cause: ",
    "教科横断の数学的根本原因：",
    "교과 간 수학 근본원인 역추적: ",
    "Surihan Punca Matematik Rentas Subjek: "
  ),
  sameSubjectTraceLabel: c(
    "同科上游根因溯源：",
    "Upstream Prerequisite Root Cause: ",
    "同一教科の上流根本原因：",
    "동일 교과 상위 근본원인 역추적: ",
    "Surihan Punca Prasyarat Huluan: "
  ),
  radarBodyBefore: c(
    "图谱检测到受阻学生共同在先修节点 ",
    "Graph tracing shows affected students share an upstream gap at ",
    "つまずいている生徒に共通して前提ノード ",
    "막힌 학생들이 공통적으로 선수 노드 ",
    "Surihan graf menunjukkan pelajar terlibat berkongsi jurang huluan pada "
  ),
  radarBodyAfter: c(
    " 存在薄弱断层！建议优先安排 15 分钟微专题补基后再讲评新课。",
    " — schedule a 15-minute targeted micro-review before introducing new material.",
    " の弱点が見られます。新単元の解説前に15分間の基礎補強ミニ演習を推奨します。",
    "에서 취약 단절을 보입니다. 새 진도 수업 전 15분 집중 보강을 권장합니다.",
    " — jadualkan ulang kaji mikro 15 minit sebelum meneruskan topik baharu."
  ),
  affectedStudentsPrefix: c(
    "涉及学生：",
    "Affected students: ",
    "対象生徒：",
    "해당 학생: ",
    "Pelajar terlibat: "
  ),
  listSeparator: c("、", ", ", "・", ", ", ", "),
  heatmapTitle: c(
    "班级学生 × 核心微技能掌握度热力矩阵（点击学生姓名可切换视角）",
    "Class × Core Micro-Topic Mastery Heatmap (Click a student to switch persona)",
    "クラス生徒 × コア単元習熟度ヒートマップ（生徒名クリックで視点切替）",
    "학급 학생 × 핵심 마이크로 스킬 숙련도 히트맵 (학생 이름 클릭 시 시점 전환)",
    "Matriks Peta Haba Penguasaan Pelajar × Topik Mikro (Klik pelajar untuk tukar profil)"
  ),
  legendMastered: c(
    "■ 已掌握 (≥85%)",
    "■ Mastered (≥85%)",
    "■ 習得済 (≥85%)",
    "■ 마스터 (≥85%)",
    "■ Dikuasai (≥85%)"
  ),
  legendShaky: c(
    "■ 滑档待稳",
    "■ Shaky",
    "■ 要定着",
    "■ 불안정",
    "■ Perlu Kukuh"
  ),
  legendWeak: c(
    "■ 薄弱卡点",
    "■ Weak Gap",
    "■ 弱点",
    "■ 취약",
    "■ Jurang Lemah"
  ),
  colStudentProfile: c(
    "学生档案（原生学制）",
    "Student Profile (School Track)",
    "生徒プロフィール（在籍課程）",
    "학생 프로필 (원적 학제)",
    "Profil Pelajar (Aliran Sekolah)"
  ),
  assignSectionTitle: c(
    "一键智能三档分层派题",
    "1-Click 3-Tier Differentiated Assignment Publisher",
    "ワンクリック3段階レベル別課題配信",
    "원클릭 3단계 수준별 맞춤 과제 배포",
    "Penerbit Tugasan Terbeza 3 Aras Satu Klik"
  ),
  assignSectionSubtitle: c(
    "系统已根据全班 DAG 掌握向量自动聚类为「补基层 / 巩固层 / 拔高层」，每位学生收到各自最近发展区（ZPD）变式题。",
    "Automatically clusters students by DAG mastery vectors into Foundational, Standard, and Challenge tiers within each learner's Zone of Proximal Development (ZPD).",
    "クラス全員の DAG 習熟度ベクトルから「基礎補強・標準定着・発展挑戦」の3層へ自動分類し、各生徒の最近接発達領域（ZPD）に合わせた類題を配信します。",
    "학급 전체의 DAG 숙련도 벡터를 분석하여 기초 보강 / 표준 정착 / 심화 챌린지 3단계로 자동 군집화하고 학생별 근접발달영역(ZPD) 변형문제를 배정합니다.",
    "Mengelompokkan pelajar secara automatik mengikut vektor penguasaan DAG kepada aras Asas, Standard dan Cabaran dalam Zon Perkembangan Proksimal (ZPD) masing-masing."
  ),
  defaultPackPrefix: c(
    "第11周数理跨科靶向分层单",
    "Week 11 Cross-STEM Differentiated Pack",
    "第11週 理数横断レベル別演習パック",
    "11주차 융합수리 맞춤형 수준별 과제",
    "Pek Terbeza Rentas STEM Minggu 11"
  ),
  publishBtn: c(
    "一键派发三档分层任务包",
    "Assign 3-Tier Packs to Class",
    "3段階レベル別課題を一括配信",
    "3단계 수준별 과제 팩 일괄 배포",
    "Agihkan Pek Tugasan 3 Aras"
  ),
  publishingBtn: c(
    "正在派发…",
    "Publishing…",
    "配信中…",
    "배포 중…",
    "Mengagihkan…"
  ),
  publishSuccess: (count: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `✅ 已成功向全班精准派发 ${count} 档分层作业包（已同步至各学生端首页）！`,
        `✅ Published ${count} differentiated assignment pack(s) to the class (synced to student dashboards)!`,
        `✅ クラスへ ${count} 段階のレベル別課題パックを配信しました（生徒ホーム画面に同期済み）！`,
        `✅ 학급 전체에 ${count}단계 수준별 과제 팩을 성공적으로 배포했습니다 (학생 홈 화면 동기화 완료)!`,
        `✅ Berjaya mengagihkan ${count} pek tugasan terbeza kepada kelas (disegerakkan ke papan pemuka pelajar)!`
      )
    ),
  buildPackTitle: (
    tier: "foundational" | "standard" | "challenge",
    prefix: string,
    locale: LocaleCode
  ) => {
    if (tier === "foundational") {
      return uiPick(
        locale,
        c(
          `【补基层】${prefix}：分式方程倒数变形与并联欧姆定律`,
          `[Foundational] ${prefix}: Rational Reciprocals & Parallel Ohm's Law`,
          `【基礎補強】${prefix}：分数方程式の逆数変形と並列オームの法則`,
          `[기초 보강] ${prefix}: 분수방정식 역수 변형과 병렬 옴의 법칙`,
          `[Aras Asas] ${prefix}: Persamaan Salingan Nisbah & Hukum Ohm Selari`
        )
      );
    }
    if (tier === "standard") {
      return uiPick(
        locale,
        c(
          `【巩固层】${prefix}：二次函数抛物线顶点式与机械能`,
          `[Standard] ${prefix}: Parabola Vertex Form & Work-Kinetic Energy`,
          `【標準定着】${prefix}：二次関数の頂点形と力学的エネルギー`,
          `[표준 정착] ${prefix}: 이차함수 꼭짓점 식과 역학적 에너지`,
          `[Aras Standard] ${prefix}: Bentuk Verteks Parabola & Tenaga Kinetik`
        )
      );
    }
    return uiPick(
      locale,
      c(
        `【拔高层】${prefix}：三角比综合与多项式导数切线探究`,
        `[Challenge] ${prefix}: Right-Triangle Trig & Polynomial Derivative Tangents`,
        `【発展挑戦】${prefix}：三角比の総合と多項式の導関数・接線探究`,
        `[심화 챌린지] ${prefix}: 삼각비 종합 및 다항함수 미분 접선 탐구`,
        `[Aras Cabaran] ${prefix}: Trigonometri & Tangen Terbitan Polinomial`
      )
    );
  },
  tierFoundationalTitle: (count: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `🛠️ 第一档：靶向补基层（Foundational · ${count}人）`,
        `🛠️ Tier 1: Foundational Remediation (${count} students)`,
        `🛠️ 第1層：基礎補強グループ（Foundational・${count}名）`,
        `🛠️ 1단계: 기초 보강 그룹 (Foundational · ${count}명)`,
        `🛠️ Aras 1: Pemulihan Asas (Foundational · ${count} pelajar)`
      )
    ),
  tierFoundationalDesc: c(
    "先补「完全平方因式分解」与「分式方程倒数变形」，再回攻「物理并联欧姆定律」。",
    "Remediate special-product factoring and rational reciprocal equations first, then unlock parallel Ohm's Law in physics.",
    "「乗法公式・因数分解」と「分数方程式の逆数変形」を先に補強し、物理の「並列回路・オームの法則」へつなげます。",
    "완전제곱식 인수분해와 분수방정식 역수 변형을 먼저 보강한 뒤 물리 병렬회로 옴의 법칙을 공략합니다.",
    "Kukuhkan pemfaktoran kuasa dua sempurna dan persamaan nisbah dahulu sebelum menguasai Hukum Ohm selari dalam fizik."
  ),
  tierStandardTitle: (count: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `📈 第二档：稳固进阶层（Standard · ${count}人）`,
        `📈 Tier 2: Core Consolidation (${count} students)`,
        `📈 第2層：標準定着グループ（Standard・${count}名）`,
        `📈 2단계: 표준 정착 그룹 (Standard · ${count}명)`,
        `📈 Aras 2: Pengukuhan Standard (Standard · ${count} pelajar)`
      )
    ),
  tierStandardDesc: c(
    "聚焦「二次函数顶点式对称轴符号」与「动能定理速度平方项」易错滑档点强化。",
    "Target common sign slips in parabola vertex form and velocity-squared scaling in work-kinetic energy.",
    "「二次関数頂点形の軸の符号ミス」と「運動エネルギーの速度2乗項」のケアレスミス防止を重点強化します。",
    "이차함수 꼭짓점 식의 대칭축 부호 실수와 운동에너지 정리의 속도 제곱항 취약 지점을 집중 강화합니다.",
    "Fokus pada kesilapan tanda paksi simetri bentuk verteks parabola dan sebutan kuasa dua halaju dalam tenaga kinetik."
  ),
  tierChallengeTitle: (count: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `🚀 第三档：竞赛/先修拔高层（Challenge · ${count}人）`,
        `🚀 Tier 3: Honours & Pre-Calculus Challenge (${count} students)`,
        `🚀 第3層：発展・先取り挑戦グループ（Challenge・${count}名）`,
        `🚀 3단계: 심화·선행 챌린지 그룹 (Challenge · ${count}명)`,
        `🚀 Aras 3: Cabaran Lanjutan & Pra-Kalkulus (Challenge · ${count} pelajar)`
      )
    ),
  tierChallengeDesc: c(
    "已扎实掌握初三数理主干，开放「直角三角比综合」与高中/A-Math「导数切线斜率」先修挑战。",
    "Core G9 STEM mastered — unlocks multi-step right-triangle trigonometry and A-Math / Honours derivative tangent slopes.",
    "中3理数の主要単元を習得済み。「直角三角形の三角比応用」と高校数学/A-Math「導関数と接線の傾き」に挑戦します。",
    "중3 수리 핵심 과정을 완벽히 마스터하여 직각삼각형 삼각비 심화 및 고교/A-Math 미분 접선의 기울기 도전을 개방합니다.",
    "Telah menguasai teras STEM G9 — membuka cabaran trigonometri segi tiga bersudut tegak dan kecerunan tangen terbitan A-Math."
  ),
  publishedListHeader: c(
    "📋 已发布任务包实时完成率追踪（SQLite 持久化）：",
    "📋 Published Assignment Packs & Live Completion (SQLite Persisted):",
    "📋 配信済み課題パックのリアルタイム達成率（SQLite 永続化）：",
    "📋 배포된 과제 팩 실시간 완료율 추적 (SQLite 영구 저장):",
    "📋 Penjejakan Kadar Siap Pek Tugasan Aktif (Disimpan dalam SQLite):"
  ),
  assignmentProgress: (
    done: number,
    total: number,
    dueDate: string,
    locale: LocaleCode
  ) =>
    uiPick(
      locale,
      c(
        `完成进度 ${done} / ${total} 人 · 截止 ${dueDate}`,
        `Completed ${done} / ${total} · Due ${dueDate}`,
        `達成 ${done} / ${total} 名 · 期限 ${dueDate}`,
        `완료 ${done} / ${total}명 · 마감 ${dueDate}`,
        `Siap ${done} / ${total} pelajar · Tarikh akhir ${dueDate}`
      )
    ),
};

// ==================== 2. 9-REGION A/B EXAM PAPER BUILDER (/paper-builder) ====================

export const PAPER_COPY = {
  loading: c(
    "正在加载 9 地课标智能组卷与双向细目表引擎…",
    "Loading 9-Region Parallel A/B Exam Builder & Two-Way Blueprint Engine…",
    "9地域カリキュラム対応スマート試験作成＆双方向細目表エンジンを読み込み中…",
    "9개 지역 교육과정 스마트 시험지 빌더 및 이원목적분류표 엔진을 불러오는 중…",
    "Memuatkan Pembina Kertas Peperiksaan A/B 9 Rantau & Enjin Jadual Spesifikasi…"
  ),
  headerTitle: c(
    "教师 9 地教材一键组 A/B 平行卷 & 双向细目表中心",
    "9-Region Parallel A/B Exam Paper & Two-Way Blueprint Builder",
    "9地域カリキュラム対応 A/B 並行試験＆双方向細目表ビルダー",
    "9개 지역 교육과정 맞춤형 A/B 평행 시험지 및 이원목적분류표 빌더",
    "Pembina Kertas Peperiksaan Selari A/B & Jadual Spesifikasi 9 Rantau"
  ),
  headerSubtitleBefore: c(
    "勾选当地教材章节与难度配比 → 毫秒级生成防作弊同构 ",
    "Select local textbook chapters & difficulty mix → instantly generate isomorphic anti-copying ",
    "地域の教科書単元と難易度配分を選択 → カンニング防止の同型 ",
    "현지 교과서 단원과 난이도 비율을 선택하면 부정행위 방지 동형 ",
    "Pilih bab buku teks tempatan & nisbah kesukaran → jana serta-merta "
  ),
  headerSubtitleBold: c(
    "A 卷 / B 卷 + 课标双向细目表 + 评分解析卷",
    "Form A / Form B + Two-Way Specification Matrix + Grading Key",
    "Aフォーム / Bフォーム + 双方向細目表 + 採点解説シート",
    "A형 / B형 시험지 + 이원목적분류표 + 채점 해설지",
    "Kertas A / Kertas B + Jadual Spesifikasi Dua Hala + Skema Pemarkahan"
  ),
  headerSubtitleAfter: c(
    "（内置 IRT 真实校准难度 β，支持 A4 打印）。",
    " (with empirical IRT β calibration, A4 print-ready).",
    "（IRT 実測難易度 β 内蔵・A4印刷対応）を瞬時に生成。",
    "를 즉시 생성합니다 (IRT 실측 난이도 β 내장 · A4 인쇄 지원).",
    " (dengan kalibrasi kesukaran IRT β sebenar, sedia cetak A4)."
  ),
  printBtn: c(
    "打印当前视图（A4 试卷 / 细目表）",
    "Print Current View (A4 Exam / Blueprint)",
    "現在の表示を印刷（A4 試験紙 / 細目表）",
    "현재 화면 인쇄 (A4 시험지 / 분류표)",
    "Cetak Paparan Semasa (Kertas A4 / Spesifikasi)"
  ),
  step1Title: c(
    "1. 试卷课标与难度结构设定",
    "1. Curriculum Standard & Difficulty Structure",
    "1. 準拠カリキュラムと難易度構成の設定",
    "1. 교육과정 기준 및 난이도 구조 설정",
    "1. Tetapan Standard Kurikulum & Struktur Kesukaran"
  ),
  regionLabel: c(
    "适用地区课标：",
    "Target Curriculum Region:",
    "対象地域カリキュラム：",
    "적용 지역 교육과정:",
    "Rantau Kurikulum Sasaran:"
  ),
  subjectLabel: c(
    "测评学科：",
    "Assessment Subject:",
    "対象教科：",
    "평가 과목:",
    "Subjek Penilaian:"
  ),
  totalItemsLabel: c(
    "试卷总题量（满分自动配平 100 分）：",
    "Total Items (Auto-scaled to 100 pts):",
    "総問題数（100点満点に自動配点）：",
    "총 문항 수 (100점 만점 자동 배점):",
    "Jumlah Soalan (Diskalakan automatik ke 100 markah):"
  ),
  customTitleLabel: c(
    "自定义卷头名称（可选）：",
    "Custom Exam Title (Optional):",
    "カスタム試験タイトル（任意）：",
    "사용자 지정 시험지 제목 (선택):",
    "Tajuk Peperiksaan Tersuai (Pilihan):"
  ),
  paperTitlePlaceholder: (regCode: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `${regCode} 阶段性诊断联考卷`,
        `${regCode} Diagnostic Benchmark Exam`,
        `${regCode} 段階診断ベンチマーク試験`,
        `${regCode} 단계별 진단 벤치마크 평가`,
        `Peperiksaan Diagnostik Penanda Aras ${regCode}`
      )
    ),
  defaultBundleTitle: (regCode: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `${regCode} 课标对齐 · 阶段性诊断测评卷（A/B 平行防作弊卷）`,
        `${regCode} Standards-Aligned Diagnostic Assessment (Parallel Form A / B)`,
        `${regCode} 基準準拠・段階診断テスト（A/B 並行フォーム）`,
        `${regCode} 교육과정 정렬 · 단계별 진단평가 (A/B 평행형 시험지)`,
        `Penilaian Diagnostik Jajaran Standard ${regCode} (Kertas Selari A / B)`
      )
    ),
  ratioHeader: c(
    "三档难度配比",
    "3-Tier Difficulty Mix",
    "3段階の難易度配分",
    "3단계 난이도 비율",
    "Nisbah Kesukaran 3 Aras"
  ),
  ratioSummary: (b: number, s: number, ch: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `基础 ${b}% / 巩固 ${s}% / 拔高 ${ch}%`,
        `Basic ${b}% / Standard ${s}% / Challenge ${ch}%`,
        `基礎 ${b}% / 標準 ${s}% / 発展 ${ch}%`,
        `기초 ${b}% / 표준 ${s}% / 심화 ${ch}%`,
        `Asas ${b}% / Standard ${s}% / Cabaran ${ch}%`
      )
    ),
  includeCustomLabel: c(
    "优先混编「校本教研工坊（/studio）」自建题库题目",
    "Prioritize custom items from School Studio (/studio)",
    "「校内工房（/studio）」の自作問題を優先して編成する",
    "학교 스튜디오(/studio) 자체 제작 문항 우선 혼합 편성",
    "Utamakan soalan tersuai daripada Studio Sekolah (/studio)"
  ),
  generateBtn: c(
    "一键重新随机生成 A/B 防作弊平行卷",
    "Regenerate Parallel Anti-Cheat Form A / B Papers",
    "A/B 並行フォーム試験をランダム再生成",
    "A/B 부정행위 방지 평행 시험지 무작위 재생성",
    "Jana Semula Kertas Selari A/B Anti-Tiru"
  ),
  generatingBtn: c(
    "正在并行合成 A/B 卷与细目表…",
    "Synthesizing Parallel Form A/B & Blueprint…",
    "A/B 試験と細目表を並列生成中…",
    "A/B 시험지 및 이원목적분류표 병렬 생성 중…",
    "Mensintesis Kertas A/B & Jadual Spesifikasi…"
  ),
  step2Title: (regCode: string, selected: number, total: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `2. 勾选纳入命题范围的 ${regCode} 教材章节微技能（已选 ${selected}/${total}）`,
        `2. Select ${regCode} Textbook Micro-Topics in Scope (${selected}/${total} selected)`,
        `2. 出題範囲に含める ${regCode} 教科書単元を選択（${selected}/${total} 選択中）`,
        `2. 출제 범위에 포함할 ${regCode} 교과서 마이크로 스킬 선택 (${selected}/${total} 선택됨)`,
        `2. Pilih Topik Mikro Buku Teks ${regCode} dalam Skop (${selected}/${total} dipilih)`
      )
    ),
  selectAllBtn: c("全选本学科", "Select All", "すべて選択", "전체 선택", "Pilih Semua"),
  selectTop3Btn: c(
    "精简前3章",
    "First 3 Chapters",
    "最初の3単元",
    "상위 3개 단원",
    "3 Bab Pertama"
  ),
  tabBlueprint: c(
    "📊 双向细目表",
    "📊 Two-Way Blueprint",
    "📊 双方向細目表",
    "📊 이원목적분류표",
    "📊 Jadual Spesifikasi"
  ),
  tabPaperA: c(
    "📝 A 卷（学生测评卷）",
    "📝 Form A (Student Exam)",
    "📝 Aフォーム（生徒用本試験）",
    "📝 A형 (학생 평가용)",
    "📝 Kertas A (Peperiksaan)"
  ),
  tabPaperB: c(
    "🛡️ B 卷（同构防作弊平行卷）",
    "🛡️ Form B (Isomorphic Parallel)",
    "🛡️ Bフォーム（同型並行試験）",
    "🛡️ B형 (동형 평행 시험지)",
    "🛡️ Kertas B (Selari Anti-Tiru)"
  ),
  tabAnswerKey: c(
    "✅ 教师评分标准答案与解析卷",
    "✅ Teacher Answer Key & Rubric",
    "✅ 教員用模範解答＆採点解説",
    "✅ 교사용 정답 및 채점 해설지",
    "✅ Skema Jawapan & Penjelasan Guru"
  ),
  bundleSummaryPrefix: (pts: number, items: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `总分：${pts} 分 · 题量：${items} 题 · 全卷平均实测难度 β = `,
        `Total: ${pts} pts · Items: ${items} · Mean Empirical IRT β = `,
        `満点：${pts} 点 · 問題数：${items} 問 · 平均実測難易度 β = `,
        `총점: ${pts}점 · 문항 수: ${items}문항 · 평균 실측 난이도 β = `,
        `Jumlah: ${pts} markah · Soalan: ${items} · Purata IRT β = `
      )
    ),
  blueprintTitle: (title: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `${title} — 命题双向细目表`,
        `${title} — Two-Way Specification Matrix`,
        `${title} — 出題双方向細目表`,
        `${title} — 출제 이원목적분류표`,
        `${title} — Matriks Spesifikasi Dua Hala`
      )
    ),
  blueprintSubtitle: (regName: string, regCode: string, pts: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `对标地区：${regName} (${regCode}) · 满分：${pts} 分 · 同构平行双卷防作弊校验通过`,
        `Aligned Region: ${regName} (${regCode}) · Max Score: ${pts} pts · Parallel A/B anti-copying verified`,
        `準拠地域：${regName} (${regCode}) · 満点：${pts} 点 · 同型 A/B 並行フォーム検証済み`,
        `기준 지역: ${regName} (${regCode}) · 만점: ${pts}점 · 동형 A/B 평행 시험지 검증 완료`,
        `Rantau Jajaran: ${regName} (${regCode}) · Markah Penuh: ${pts} · Pengesahan selari A/B lulus`
      )
    ),
  zeroDuplicateBadge: c(
    "A/B 卷参数零重样",
    "Zero Parameter Overlap (A/B)",
    "A/B パラメータ重複ゼロ",
    "A/B 문항 수치 중복 제로",
    "Sifar Pertindihan Parameter A/B"
  ),
  colItemNo: c("题号", "Item", "問番号", "문항", "No."),
  colTopic: c("微技能节点", "Micro-Topic", "単元ノード", "마이크로 스킬", "Topik Mikro"),
  colStdCode: (regCode: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `${regCode} 官方课标码`,
        `${regCode} Standard Code`,
        `${regCode} 指導要領コード`,
        `${regCode} 성취기준 코드`,
        `Kod Standard ${regCode}`
      )
    ),
  colChapter: c("本地教材章节", "Local Chapter", "現地教科書単元", "현지 교과서 단원", "Bab Tempatan"),
  colCognitive: c("认知层级", "Cognitive Level", "認知レベル", "인지 영역", "Aras Kognitif"),
  colDifficulty: c("难度档位", "Difficulty", "難易度", "난이도", "Kesukaran"),
  colIrtBeta: c("IRT 实测 β", "Empirical IRT β", "IRT 実測 β", "IRT 실측 β", "IRT β Sebenar"),
  colPoints: c("赋分", "Points", "配点", "배점", "Markah"),
  colAnsA: c("A卷答案", "Form A Key", "A解答", "A형 정답", "Jawapan A"),
  colAnsB: c("B卷答案", "Form B Key", "B解答", "B형 정답", "Jawapan B"),
  schoolCustomBadge: c("校本自建", "School Custom", "校内自作", "학교 자체문항", "Tersuai Sekolah"),
  pointsValue: (pts: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(`${pts} 分`, `${pts} pts`, `${pts} 点`, `${pts}점`, `${pts} m`)
    ),
  paperABadge: c(
    "【A 卷 · 标准测评卷】",
    "[Form A · Standard Assessment]",
    "【Aフォーム・標準本試験】",
    "[A형 · 표준 평가 시험지]",
    "[Kertas A · Penilaian Standard]"
  ),
  paperBBadge: c(
    "【B 卷 · 同构防作弊平行卷】",
    "[Form B · Isomorphic Anti-Copy Parallel]",
    "【Bフォーム・同型並行試験】",
    "[B형 · 동형 부정행위 방지 평행 시험지]",
    "[Kertas B · Selari Isomorfik Anti-Tiru]"
  ),
  studentInfoLine: (pts: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `姓名：____________    班级：____________    学号：____________    满分：${pts} 分`,
        `Name: ____________    Class: ____________    Student ID: ____________    Max Score: ${pts} pts`,
        `氏名：____________    クラス：____________    出席番号：____________    満点：${pts} 点`,
        `이름: ____________    학급: ____________    학번: ____________    만점: ${pts}점`,
        `Nama: ____________    Kelas: ____________    ID Pelajar: ____________    Markah Penuh: ${pts}`
      )
    ),
  paperItemHeading: (
    num: number,
    pts: number,
    stdCode: string,
    topicTitle: string,
    locale: LocaleCode
  ) =>
    uiPick(
      locale,
      c(
        `第 ${num} 题（${pts} 分）· [${stdCode}] ${topicTitle}`,
        `Question ${num} (${pts} pts) · [${stdCode}] ${topicTitle}`,
        `第 ${num} 問（${pts} 点）・[${stdCode}] ${topicTitle}`,
        `문항 ${num} (${pts}점) · [${stdCode}] ${topicTitle}`,
        `Soalan ${num} (${pts} markah) · [${stdCode}] ${topicTitle}`
      )
    ),
  answerBlankLine: (unit: string | undefined, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `作答区：________________________${unit ? `（单位：${unit}）` : ""}`,
        `Answer: ________________________${unit ? ` (Unit: ${unit})` : ""}`,
        `解答欄：________________________${unit ? `（単位：${unit}）` : ""}`,
        `답안란: ________________________${unit ? ` (단위: ${unit})` : ""}`,
        `Jawapan: ________________________${unit ? ` (Unit: ${unit})` : ""}`
      )
    ),
  answerKeyHeader: c(
    "教师标准答案与解析评分细则（A / B 双卷对照）",
    "Teacher Master Answer Key & Step-by-Step Solutions (Form A & Form B)",
    "教員用模範解答・採点解説（A / B 両フォーム対照）",
    "교사용 정답 및 단계별 채점 해설 (A형 / B형 대조)",
    "Skema Jawapan & Penyelesaian Langkah demi Langkah Guru (Kertas A & B)"
  ),
  paperAKeyLabel: c(
    "【A 卷标准答案】：",
    "[Form A Answer]: ",
    "【Aフォーム正解】：",
    "[A형 정답]: ",
    "[Jawapan Kertas A]: "
  ),
  paperBKeyLabel: c(
    "【B 卷标准答案】：",
    "[Form B Answer]: ",
    "【Bフォーム正解】：",
    "[B형 정답]: ",
    "[Jawapan Kertas B]: "
  ),
};

// ==================== 3. SCHOOL STUDIO & IRT FLYWHEEL (/studio) ====================

export const STUDIO_COPY = {
  loading: c(
    "正在加载校本教研图谱工坊与 IRT 数据飞轮…",
    "Loading School Knowledge Studio & Elo-IRT Calibration Flywheel…",
    "校内知識グラフ工房＆Elo-IRT データフライホイールを読み込み中…",
    "학교 지식그래프 스튜디오 및 Elo-IRT 데이터 플라이휠을 불러오는 중…",
    "Memuatkan Studio Graf Sekolah & Roda Tenaga Kalibrasi Elo-IRT…"
  ),
  headerTitle: c(
    "校本图谱教研工坊 & Elo-IRT 真实难度数据飞轮看板",
    "School Curriculum Studio & Elo-IRT Empirical Calibration Flywheel",
    "校内カリキュラム研究工房 ＆ Elo-IRT 実測難易度データフライホイール",
    "학교 교육과정 연구 스튜디오 & Elo-IRT 실측 난이도 데이터 플라이휠",
    "Studio Kurikulum Sekolah & Papan Pemuka Kalibrasi Elo-IRT"
  ),
  headerSubtitle: c(
    "支持学校教研组扩展跨科先修边（内置实时有向无环图环路拦截）、编写 KaTeX 校本真题，并基于全站作答日志动态校准题目难度 β 与区分度 α。",
    "Empower school departments to author custom cross-subject prerequisite edges (guarded by live BFS DAG cycle detection), create KaTeX benchmark items, and calibrate empirical item difficulty β and discrimination α from attempt logs.",
    "校内教科会による教科横断の前提エッジ追加（リアルタイム有向非巡回グラフ閉路防止付き）、KaTeX 自作問題の登録、解答ログに基づく難易度 β・識別力 α の動的較正を支援します。",
    "학교 교원 연구회가 교과 간 선수 간선을 확장하고(실시간 BFS 방향 비순환 그래프 사이클 차단 내장), KaTeX 자체 문항을 제작하며, 풀이 로그로 문항 난이도 β와 변별도 α를 실시간 보정합니다.",
    "Membolehkan panitia sekolah menambah sisi prasyarat rentas subjek (dilindungi pengesan kitaran DAG masa nyata), menggubal soalan KaTeX sekolah, dan menentukur kesukaran β serta diskriminasi α secara dinamik."
  ),
  tabEdges: c(
    "🔗 校本先修边 & 环路守护",
    "🔗 Custom Edges & Cycle Guard",
    "🔗 校内前提エッジ＆閉路防止",
    "🔗 학교 선수 간선 & 사이클 보호",
    "🔗 Sisi Prasyarat & Pengawal Kitaran"
  ),
  tabQuestions: c(
    "✍️ KaTeX 校本题库自建",
    "✍️ KaTeX Item Authoring",
    "✍️ KaTeX 校内問題作成",
    "✍️ KaTeX 학교 문항 제작",
    "✍️ Penggubalan Soalan KaTeX"
  ),
  tabIrt: c(
    "📈 Elo-IRT 难度校准与成长曲线",
    "📈 Elo-IRT Calibration & θ Curve",
    "📈 Elo-IRT 難易度較正＆成長曲線",
    "📈 Elo-IRT 난이도 보정 & 성장 곡선",
    "📈 Kalibrasi Elo-IRT & Lengkung θ"
  ),
  addEdgeTitle: c(
    "新增校本先修依赖边（自动执行 BFS 拓扑环路校验）",
    "Add School Prerequisite Edge (Live BFS Topological Cycle Guard)",
    "校内前提エッジの追加（BFS トポロジカル閉路検証を実行）",
    "학교 선수 의존 간선 추가 (자동 BFS 위상 사이클 검증)",
    "Tambah Sisi Prasyarat Sekolah (Pengesahan Kitaran Topologi BFS)"
  ),
  demoCycleBtn: c(
    "🧪 演示环路自动拦截",
    "🧪 Demo Cycle Guard",
    "🧪 閉路自動ブロックをデモ",
    "🧪 사이클 자동 차단 시연",
    "🧪 Demo Sekatan Kitaran"
  ),
  targetTopicLabel: c(
    "后继目标微技能（Topic）：",
    "Target Downstream Micro-Topic:",
    "後続の対象単元ノード（Topic）：",
    "후속 대상 마이크로 스킬 (Topic):",
    "Topik Mikro Hiliran Sasaran (Topic):"
  ),
  prereqTopicLabel: c(
    "需要前置掌握的上游先修微技能（Prerequisite）：",
    "Required Upstream Prerequisite:",
    "事前習得が必要な上流前提ノード（Prerequisite）：",
    "사전 숙지가 필요한 상위 선수 스킬 (Prerequisite):",
    "Prasyarat Huluan Diperlukan (Prerequisite):"
  ),
  relTypeLabel: c(
    "依赖强弱类型：",
    "Dependency Relation Type:",
    "依存関係タイプ：",
    "의존 관계 유형:",
    "Jenis Hubungan Kebergantungan:"
  ),
  reasonLabel: c(
    "教研备注说明：",
    "Pedagogical Rationale:",
    "指導上の根拠メモ：",
    "교수·학습 비고 설명:",
    "Catatan Pedagogi:"
  ),
  defaultEdgeReason: c(
    "校本教研：动能随速度二次方增长曲线与二次函数开口特征对照",
    "School Studio: Quadratic scaling of kinetic energy with velocity mirrors parabola curvature",
    "校内研究：運動エネルギーの速度2乗曲線と二次関数の開き具合の対照",
    "학교 연구: 속도의 제곱에 비례하는 운동에너지 곡선과 이차함수 포물선 폭 비교",
    "Studio Sekolah: Lengkung tenaga kinetik kuasa dua halaju selari dengan bukaan parabola"
  ),
  saveEdgeBtn: c(
    "校验无环性并保存至校本知识图谱",
    "Verify Acyclicity & Save to School Graph",
    "非巡回性を検証して校内グラフに保存",
    "비순환성 검증 후 학교 지식그래프에 저장",
    "Sahkan Tanpa Kitaran & Simpan ke Graf Sekolah"
  ),
  edgeSavedBanner: c(
    "✅ 已通过 DAG 无环拓扑校验并写入校本先修图谱（已在图谱星海实时生效）！",
    "✅ Passed DAG acyclicity check and saved to school graph (live in Knowledge Map)!",
    "✅ DAG 非巡回チェックを通過し、校内前提グラフへ保存しました（知識グラフ探索に即時反映）！",
    "✅ DAG 비순환 위상 검증을 통과하여 학교 선수 그래프에 저장되었습니다 (지식그래프 탐색에 즉시 반영)!",
    "✅ Lulus semakan tanpa kitaran DAG dan disimpan ke graf sekolah (aktif serta-merta dalam Peta Ilmu)!"
  ),
  edgeAddFailedFallback: c(
    "添加失败",
    "Failed to add edge",
    "エッジの追加に失敗しました",
    "간선 추가 실패",
    "Gagal menambah sisi"
  ),
  cyclePathPrefix: c(
    "拦截环路轨迹：",
    "Blocked cycle path: ",
    "ブロックされた閉路経路：",
    "차단된 사이클 경로: ",
    "Laluan kitaran disekat: "
  ),
  activeEdgesTitle: (customCount: number, totalCount: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `当前生效的校本自定义先修边（${customCount} 条 · 已合并至全局 ${totalCount} 条图谱边）`,
        `Active Custom School Edges (${customCount} custom · merged with ${totalCount} canonical edges)`,
        `現在有効な校内カスタム前提エッジ（${customCount} 件・標準 ${totalCount} エッジと統合済）`,
        `현재 활성화된 학교 사용자 정의 선수 간선 (${customCount}개 · 전체 ${totalCount}개 표준 간선과 병합됨)`,
        `Sisi Prasyarat Tersuai Sekolah Aktif (${customCount} tersuai · digabung dengan ${totalCount} sisi kanonik)`
      )
    ),
  edgeMetaLine: (relLabel: string, creator: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `类型：${relLabel} · 创建人：${creator}`,
        `Type: ${relLabel} · Author: ${creator}`,
        `種別：${relLabel} · 作成者：${creator}`,
        `유형: ${relLabel} · 작성자: ${creator}`,
        `Jenis: ${relLabel} · Pencipta: ${creator}`
      )
    ),
  deleteEdgeTitle: c(
    "移除该校本边",
    "Remove custom school edge",
    "この校内エッジを削除",
    "이 학교 간선 삭제",
    "Buang sisi sekolah ini"
  ),
  authorQuestionTitle: c(
    "录入校本自建题（原生支持 $...$ 与 $$...$$ KaTeX 数学理化公式）",
    "Author Custom School Item (Native $...$ & $$...$$ KaTeX Math/Science Support)",
    "校内自作問題の登録（$...$ および $$...$$ KaTeX 数式・理科式にネイティブ対応）",
    "학교 자체 문항 등록 ($...$ 및 $$...$$ KaTeX 수식·과학 기호 기본 지원)",
    "Gubal Soalan Tersuai Sekolah (Sokongan Asli Formula KaTeX $...$ & $$...$$)"
  ),
  linkedTopicLabel: c(
    "挂靠微技能节点：",
    "Linked Micro-Topic:",
    "紐付ける単元ノード：",
    "연결할 마이크로 스킬 노드:",
    "Topik Mikro Berkaitan:"
  ),
  difficultyTierLabel: c(
    "难度档位：",
    "Difficulty Tier:",
    "難易度レベル：",
    "난이도 단계:",
    "Aras Kesukaran:"
  ),
  stemLabel: c(
    "题干内容（支持 LaTeX）：",
    "Question Stem (LaTeX supported):",
    "問題文（LaTeX 対応）：",
    "문제 지문 (LaTeX 지원):",
    "Pernyataan Soalan (LaTeX disokong):"
  ),
  latexLabel: c(
    "核心独立展示公式（可选纯 LaTeX，无需写 $$）：",
    "Standalone Display Equation (Optional raw LaTeX without $$):",
    "独立表示する中心数式（任意・$$ 不要の純粋な LaTeX）：",
    "독립 표시 핵심 수식 (선택 · $$ 제외 순수 LaTeX):",
    "Formula Paparan Utama (LaTeX tulen pilihan tanpa $$):"
  ),
  optPlaceholder: (letter: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `选项 ${letter}`,
        `Option ${letter}`,
        `選択肢 ${letter}`,
        `선택지 ${letter}`,
        `Pilihan ${letter}`
      )
    ),
  correctOptionLabel: c(
    "正确选项：",
    "Correct Option:",
    "正解の選択肢：",
    "정답 선택지:",
    "Pilihan Betul:"
  ),
  explanationLabel: c(
    "标准解析：",
    "Step-by-Step Solution:",
    "標準解説：",
    "표준 해설:",
    "Penjelasan Langkah demi Langkah:"
  ),
  sampleQPrompt: c(
    "【校本自建期中真题】用配方法解一元二次方程 $x^2 - 8x + 7 = 0$，其两个实数根为：",
    "[School Midterm Benchmark] Solve $x^2 - 8x + 7 = 0$ by completing the square. Its two real roots are:",
    "【校内中間テスト問題】平方完成を用いて二次方程式 $x^2 - 8x + 7 = 0$ を解くと、2つの実数解は：",
    "[학교 중간고사 기출] 완전제곱식을 이용하여 이차방정식 $x^2 - 8x + 7 = 0$을 풀 때, 두 실근은:",
    "[Soalan Pertengahan Penggal Sekolah] Selesaikan persamaan kuadratik $x^2 - 8x + 7 = 0$ dengan penyempurnaan kuasa dua. Dua punca nyata ialah:"
  ),
  sampleOptC: c(
    "仅 $x = 7$（漏负平方根）",
    "Only $x = 7$ (dropped negative root)",
    "$x = 7$ のみ（負の平方根漏れ）",
    "$x = 7$만 (음의 제곱근 누락)",
    "Hanya $x = 7$ (tertinggal punca negatif)"
  ),
  sampleQExplain: c(
    "配方得 $(x - 4)^2 = 9 \\Rightarrow x - 4 = \\pm 3$，解得 $x_1 = 7,\\; x_2 = 1$。",
    "Completing the square gives $(x - 4)^2 = 9 \\Rightarrow x - 4 = \\pm 3$, so $x_1 = 7,\\; x_2 = 1$.",
    "平方完成より $(x - 4)^2 = 9 \\Rightarrow x - 4 = \\pm 3$ となり、$x_1 = 7,\\; x_2 = 1$ が得られます。",
    "완전제곱식으로 변형하면 $(x - 4)^2 = 9 \\Rightarrow x - 4 = \\pm 3$이므로 $x_1 = 7,\\; x_2 = 1$입니다.",
    "Penyempurnaan kuasa dua memberikan $(x - 4)^2 = 9 \\Rightarrow x - 4 = \\pm 3$, maka $x_1 = 7,\\; x_2 = 1$."
  ),
  saveQuestionBtn: c(
    "保存至校本精品题库（同步赋能 AB 卷智能组卷）",
    "Save to School Question Bank (Auto-enabled in A/B Exam Builder)",
    "校内問題バンクに保存（A/B 試験作成に自動連携）",
    "학교 문항 뱅크에 저장 (A/B 시험지 빌더 자동 연동)",
    "Simpan ke Bank Soalan Sekolah (Diaktifkan dalam Pembina Kertas A/B)"
  ),
  questionSavedBanner: (id: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `✅ 校本题目已入库（ID: ${id}），可在「9地组AB卷」中自动混编并生成防作弊平行卷！`,
        `✅ Saved to School Question Bank (ID: ${id}) — ready for parallel mixing in the A/B Exam Builder!`,
        `✅ 校内問題バンクへ登録しました（ID: ${id}）。「A/B 試験作成」で自動的に並行フォームへ編成できます！`,
        `✅ 학교 문항이 저장되었습니다 (ID: ${id}) — A/B 시험지 빌더에서 자동 혼합 편성할 수 있습니다!`,
        `✅ Disimpan ke Bank Soalan Sekolah (ID: ${id}) — sedia digabungkan dalam Pembina Kertas A/B!`
      )
    ),
  livePreviewHeader: c(
    "👁️ KaTeX 实时排版渲染预览（所见即所得）：",
    "👁️ Live KaTeX Typesetting Preview (WYSIWYG):",
    "👁️ KaTeX リアルタイム組版プレビュー（WYSIWYG）：",
    "👁️ KaTeX 실시간 수식 렌더링 미리보기 (WYSIWYG):",
    "👁️ Pratonton Atur Huruf KaTeX Masa Nyata (WYSIWYG):"
  ),
  explanationPreviewPrefix: c(
    "解析预览：",
    "Solution Preview: ",
    "解説プレビュー：",
    "해설 미리보기: ",
    "Pratonton Penjelasan: "
  ),
  savedBankHeader: (count: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `已入库校本精品题（${count} 题）：`,
        `Saved School Question Bank (${count} items):`,
        `登録済みの校内問題バンク（${count} 問）：`,
        `등록된 학교 자체 문항 (${count}문항):`,
        `Bank Soalan Sekolah Tersimpan (${count} soalan):`
      )
    ),
  savedQuestionMeta: (
    ans: string,
    diffLabel: string,
    creator: string,
    locale: LocaleCode
  ) =>
    uiPick(
      locale,
      c(
        `正解：${ans} · 难度：${diffLabel} · 创建人：${creator}`,
        `Answer: ${ans} · Tier: ${diffLabel} · Author: ${creator}`,
        `正解：${ans} · 難易度：${diffLabel} · 作成者：${creator}`,
        `정답: ${ans} · 난이도: ${diffLabel} · 작성자: ${creator}`,
        `Jawapan: ${ans} · Aras: ${diffLabel} · Pencipta: ${creator}`
      )
    ),
  deleteQuestionTitle: c(
    "移除该校本题",
    "Remove custom question",
    "この校内問題を削除",
    "이 학교 문항 삭제",
    "Buang soalan sekolah ini"
  ),
  scatterTitle: c(
    "全站 150 套母题 Elo-IRT 2PL 实测难度校准散点（先验 β₀ vs 实测 β̂）",
    "Empirical Elo-IRT 2PL Calibration Scatter Across 150 Templates (Prior β₀ vs Calibrated β̂)",
    "全150テンプレートの Elo-IRT 2PL 実測難易度散布図（事前 β₀ vs 実測 β̂）",
    "전체 150개 모문항 Elo-IRT 2PL 실측 난이도 보정 산점도 (사전 β₀ vs 실측 β̂)",
    "Plot Serakan Kalibrasi Elo-IRT 2PL 150 Templat (Prior β₀ lwn Kalibrasi β̂)"
  ),
  scatterHint: c(
    "对角线上方 = 实测比预期更难（高频卡点）",
    "Above diagonal = empirically harder than expected",
    "対角線より上 ＝ 想定より実測難易度が高い単元",
    "대각선 위쪽 = 예상보다 실측 난이도가 높은 빈출 함정",
    "Atas pepenjuru = lebih sukar secara empirikal daripada jangkaan"
  ),
  svgPriorAxis: c(
    "先验难度 β₀ (-2.5 → +2.5)",
    "Prior Difficulty β₀ (-2.5 → +2.5)",
    "事前難易度 β₀ (-2.5 → +2.5)",
    "사전 난이도 β₀ (-2.5 → +2.5)",
    "Kesukaran Prior β₀ (-2.5 → +2.5)"
  ),
  svgCalibratedAxis: c(
    "实测 β̂",
    "Empirical β̂",
    "実測 β̂",
    "실측 β̂",
    "β̂ Sebenar"
  ),
  driftAlertTitle: c(
    "🔥 教研预警：实测难度显著高于课标预期（Δβ > +0.30）的高频暗礁母题 Top 6：",
    "🔥 Pedagogical Alert: Top 6 Templates Where Empirical Difficulty Exceeds Prior (Δβ > +0.30):",
    "🔥 指導アラート：実測難易度が想定を大きく上回る要注意テンプレート Top 6（Δβ > +0.30）：",
    "🔥 교수학습 경보: 실측 난이도가 기준 예상치를 크게 웃도는 고위험 문항 Top 6 (Δβ > +0.30):",
    "🔥 Amaran Pedagogi: 6 Templat Teratas dengan Kesukaran Sebenar Melebihi Jangkaan (Δβ > +0.30):"
  ),
  colTopic: c("微技能节点", "Micro-Topic", "単元ノード", "마이크로 스킬", "Topik Mikro"),
  colPriorBeta: c("先验 β₀", "Prior β₀", "事前 β₀", "사전 β₀", "Prior β₀"),
  colCalibratedBeta: c("实测 β̂", "Empirical β̂", "実測 β̂", "실측 β̂", "β̂ Sebenar"),
  colAlpha: c("区分度 α", "Discrim. α", "識別力 α", "변별도 α", "Diskrim. α"),
  colAccuracy: c("样本正确率", "Pass Rate", "正答率", "표본 정답률", "Kadar Lulus"),
  trajectoryTitle: (emoji: string, name: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `📈 ${emoji} ${name} 纵向能力值 θ(t) 与掌握度轨迹`,
        `📈 ${emoji} ${name} — Longitudinal Latent Ability θ(t) & Mastery Trajectory`,
        `📈 ${emoji} ${name} の縦断的能力値 θ(t) ＆習熟度推移`,
        `📈 ${emoji} ${name} 종단 잠재능력 θ(t) 및 숙련도 성장 궤적`,
        `📈 ${emoji} ${name} — Trajektori Keupayaan θ(t) & Penguasaan`
      )
    ),
  trajectoryDesc: c(
    "每次在「靶向诊断」或「错题孪生变式」作答后，系统以零 PII 匿名令牌实时记录并更新潜在能力估计 θ。",
    "After every Adaptive Diagnostic or Twin-Variant attempt, latent ability θ is updated in real time under a zero-PII anonymous token.",
    "「さかのぼり診断」や「ペア類題」に解答するたび、PII ゼロの匿名トークンで潜在能力推定値 θ がリアルタイム更新されます。",
    "역추적 진단이나 쌍둥이 변형문제를 풀 때마다 개인식별정보 없는 익명 토큰으로 잠재능력 추정치 θ가 실시간 갱신됩니다.",
    "Setiap kali menjawab Diagnosis Adaptif atau Variasi Kembar, anggaran keupayaan θ dikemas kini secara masa nyata melalui token tanpa PII."
  ),
  logHit: c("✔ 命中", "✔ Correct", "✔ 正解", "✔ 정답", "✔ Betul"),
  logMiss: c("✘ 失误", "✘ Miss", "✘ 誤答", "✘ 오답", "✘ Salah"),
  logMasteryProb: (pct: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `P(掌握)=${pct}%`,
        `P(Mastery)=${pct}%`,
        `P(習得)=${pct}%`,
        `P(숙련)=${pct}%`,
        `P(Kuasai)=${pct}%`
      )
    ),
  emptyTrajectory: c(
    "当前学生暂无历史轨迹，前往「靶向回溯诊断」作答 1 题即可实时点亮成长曲线！",
    "No attempt trajectory yet for this student — answer 1 item in Adaptive Diagnose to light up the live θ growth curve!",
    "この生徒の履歴ログはまだありません。「さかのぼり診断」で1問解答すると成長曲線が点灯します！",
    "현재 학생의 풀이 이력이 아직 없습니다. 역추적 적응형 진단에서 1문항을 풀면 성장 곡선이 즉시 활성화됩니다!",
    "Tiada rekod cubaan lagi untuk pelajar ini — jawab 1 soalan dalam Diagnosis Adaptif untuk mengaktifkan lengkung pertumbuhan θ!"
  ),
};

// ==================== 4. PARENT PORTAL (/parent) ====================

export const PARENT_COPY = {
  loading: c(
    "正在生成家长白话学情周报与 9 地升学衔接对标…",
    "Generating plain-language weekly parent digest & 9-region transition benchmark…",
    "保護者向け週間レポートと9地域進学移行ベンチマークを生成中…",
    "학부모 눈높이 주간 학습 리포트 및 9개 지역 진학 연계 지표를 생성하는 중…",
    "Menjana laporan mingguan ibu bapa & penanda aras peralihan 9 rantau…"
  ),
  eyebrow: c(
    "家长伴学与全球升学衔接空间（零术语焦虑 · 聚焦成长可操作建议）",
    "Parent Companion & Global School Transition Hub (Jargon-Free · Actionable Growth Guidance)",
    "保護者サポート＆国際進学移行スペース（専門用語ゼロ・実践的な声かけ提案）",
    "학부모 동반 학습 및 글로벌 진학 연계 공간 (전문용어 부담 제로 · 실천 중심 가이드)",
    "Ruang Ibu Bapa & Peralihan Sekolah Global (Bebas Jargon · Panduan Praktikal)"
  ),
  greetingBefore: (parentName: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `👨‍👧‍👦 ${parentName}，您好！正在查看 `,
        `👨‍👧‍👦 Welcome, ${parentName}! Viewing weekly growth map for `,
        `👨‍👧‍👦 ${parentName} 様、こんにちは！ `,
        `👨‍👧‍👦 ${parentName}님, 안녕하세요! `,
        `👨‍👧‍👦 Selamat datang, ${parentName}! Memaparkan laporan mingguan untuk `
      )
    ),
  greetingAfter: c(
    " 的图谱成长周报",
    "",
    " さんの週間成長レポートを表示中",
    " 학생의 주간 지식그래프 성장 리포트",
    ""
  ),
  exportPrintCta: c(
    "导出 A4 防背题重练打印卷",
    "Export A4 Twin-Variant Redo Worksheet",
    "A4 ペア類題リトライ印刷シートを出力",
    "A4 쌍둥이 변형 복습 인쇄지 내보내기",
    "Eksport Lembaran Kerja A4 Variasi Kembar"
  ),
  weeklyInsightTitle: c(
    "本周白话版学情解读（为什么孩子新课某几题总卡壳？）",
    "Plain-Language Weekly Insight (Why do certain new problems feel sticky?)",
    "今週のやさしい学習解説（なぜ新しい単元の特定の問題で手が止まるのでしょうか？）",
    "이번 주 눈높이 학습 해설 (왜 새 단원의 특정 문제에서 자꾸 막힐까요?)",
    "Ulasan Pembelajaran Mingguan Mudah Faham (Mengapa topik baharu tertentu terasa sukar?)"
  ),
  insightPoint1Title: c(
    "扎实闪光点：",
    "Solid Strengths: ",
    "定着している強み：",
    "탄탄한 강점 영역: ",
    "Kekuatan Kukuh: "
  ),
  insightPoint1Body: (childName: string, count: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `${childName} 目前已稳固掌握 ${count} 个核心知识模块，基础运算、正负符号和图像直觉非常扎实，请先给予充分肯定！`,
        `${childName} has solidly mastered ${count} core micro-topics with strong number sense and graph intuition — celebrate this progress first!`,
        `${childName} さんは現在 ${count} 個のコア単元をしっかり習得しており、基礎計算やグラフの直感が非常に安定しています。まずは大いに褒めてあげてください！`,
        `${childName} 학생은 현재 ${count}개 핵심 지식 모듈을 탄탄히 마스터했으며 기초 연산과 그래프 직관이 매우 안정적입니다. 먼저 충분히 칭찬해 주세요!`,
        `${childName} telah menguasai ${count} modul teras dengan kukuh termasuk operasi asas dan intuisi graf — berikan pujian atas pencapaian ini dahulu!`
      )
    ),
  insightPoint2Title: c(
    "真正的根源并非“粗心或笨”：",
    "Not Carelessness — Just an Upstream Stepping-Stone: ",
    "原因は「不注意」ではなく上流の小さな部品：",
    "원인은 단순 실수가 아닌 상위 기초 연결고리: ",
    "Bukan Cuai — Hanya Batu Loncatan Huluan: "
  ),
  insightPoint2Body: (gapTitle: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `知识图谱追踪发现，孩子近期在「${gapTitle}」遇到阻力，其实是因为早先的 1~2 个“上游工具小零件”（如公式中间交叉项或倒数通分）还没熟透。只要花 15 分钟把这个上游小零件补齐，后面几章物理和数学新课就会顺理成章打通！`,
        `Graph tracing shows recent friction on "${gapTitle}" comes from 1–2 earlier upstream stepping-stones (such as middle cross-terms or reciprocal common denominators). Spending just 15 minutes shoring up that prerequisite unlocks upcoming math and physics chapters naturally!`,
        `知識グラフの追跡によると、最近の「${gapTitle}」でのつまずきは、少し前の1〜2個の「上流パーツ」（展開の中央項や逆数の通分など）が未定着なためです。15分ほどその前提パーツを補強すれば、後続の数学・物理単元もスムーズに理解できます！`,
        `지식그래프 추적 결과, 최근 [${gapTitle}]에서 겪는 어려움은 이전에 배운 1~2개의 상위 기초 도구(완전제곱식 중간항이나 역수 통분 등)가 덜 익숙하기 때문입니다. 15분만 투자해 이 연결고리를 보강하면 이후 수학과 물리 단원이 자연스럽게 열립니다!`,
        `Surihan graf menunjukkan kesukaran terkini dalam "${gapTitle}" berpunca daripada 1–2 kemahiran prasyarat awal (seperti sebutan tengah atau penyebut sepunya salingan). Luangkan 15 minit sahaja untuk mengukuhkan prasyarat tersebut dan bab matematik serta fizik seterusnya akan menjadi jauh lebih mudah!`
      )
    ),
  advancedSynthesisFallback: c(
    "进阶综合题",
    "multi-step synthesis problems",
    "応用総合問題",
    "심화 융합 문항",
    "soalan sintesis lanjutan"
  ),
  dinnerSectionTitle: c(
    "餐桌 / 放学路上 3 分钟轻松互动提问话术",
    "3-Minute Dinner-Table / Car-Ride Conversation Starters",
    "食卓や帰り道でできる3分間コミュニケーション質問例",
    "식탁이나 하굣길 3분 가벼운 대화형 질문 가이드",
    "Soalan Santai 3 Minit di Meja Makan / Dalam Perjalanan Pulang"
  ),
  dinnerSectionSubtitle: c(
    "无需家长自己会解难题！照着下面的一句话问孩子，让孩子当“小老师”讲给你听（费曼学习法）：",
    "No need to solve tough equations yourself! Ask one prompt below and let your child teach you like a mini-professor (Feynman technique):",
    "保護者が難問を解ける必要はありません！下の質問をひとつ投げかけ、お子様に「小さな先生」として説明してもらいましょう（ファインマン技法）：",
    "학부모님이 어려운 문제를 직접 풀 필요가 없습니다! 아래 질문 한 문장으로 아이가 일일 선생님이 되어 설명하게 해 보세요 (파인만 학습법):",
    "Ibu bapa tidak perlu menyelesaikan persamaan sukar sendiri! Tanya salah satu soalan di bawah dan biarkan anak menerangkannya seperti guru kecil (teknik Feynman):"
  ),
  dinnerAllSolid: c(
    "当前所有已测知识点非常稳固，可以让孩子挑一道今天最得意的题讲给您听！",
    "All tested topics are solid right now — ask your child to share their favorite problem from today!",
    "現在テスト済みの単元はすべて安定しています。今日一番自信のある問題を1問紹介してもらいましょう！",
    "현재 진단된 모든 개념이 매우 탄탄합니다. 오늘 가장 뿌듯했던 문제 하나를 골라 설명해 달라고 해 보세요!",
    "Semua topik yang diuji sangat kukuh sekarang — minta anak berkongsi satu soalan kegemaran mereka hari ini!"
  ),
  microSkillPrefix: c(
    "对应微技能：",
    "Micro-Topic: ",
    "対象単元：",
    "관련 마이크로 스킬: ",
    "Topik Mikro: "
  ),
  priorityRemediateBadge: c(
    "优先补基",
    "Priority Prerequisite",
    "優先補強",
    "우선 보강",
    "Keutamaan Asas"
  ),
  antiSlipConsolidateBadge: c(
    "防粗心巩固",
    "Consolidate & Polish",
    "ケアレス防止定着",
    "실수 방지 다지기",
    "Kukuhkan Ketepatan"
  ),
  readinessTitle: c(
    "9 地跨学制转学 / 升学课程衔接度雷达",
    "9-Region Cross-Border Curriculum Transition Readiness",
    "9地域カリキュラム編入・進学移行レディネス診断",
    "9개 지역 학제 간 전학·진학 교육과정 연계 준비도 레이더",
    "Radar Kesediaan Peralihan Kurikulum 9 Rantau"
  ),
  readinessSubtitle: (grade: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `对比当前掌握度与目标国家/地区同年级（G${grade}）官方课标要求`,
        `Compares current mastery against official Grade ${grade} (G${grade}) standards in the destination region`,
        `現在の習熟度を移行先地域の同学年（G${grade}）公式カリキュラム基準と比較`,
        `현재 숙련도를 목표 국가·지역의 동학년(G${grade}) 공식 교육과정 기준과 비교`,
        `Membandingkan penguasaan semasa dengan standard rasmi Gred ${grade} (G${grade}) di rantau sasaran`
      )
    ),
  targetRegionOption: (
    flag: string,
    regName: string,
    code: string,
    locale: LocaleCode
  ) =>
    uiPick(
      locale,
      c(
        `目标对标：${flag} ${regName} (${code})`,
        `Target: ${flag} ${regName} (${code})`,
        `比較対象：${flag} ${regName} (${code})`,
        `목표 지역: ${flag} ${regName} (${code})`,
        `Sasaran: ${flag} ${regName} (${code})`
      )
    ),
  readinessMeterBefore: c(
    "衔接 ",
    "Readiness for ",
    "移行先 ",
    "목표 과정 ",
    "Kesediaan ke "
  ),
  readinessMeterAfter: c(
    " 核心先修准备度：",
    " Core Prerequisites:",
    " コア前提準備度：",
    " 핵심 선수 준비도:",
    " Prasyarat Teras:"
  ),
  readinessSummary: (
    exams: string,
    expected: number,
    ready: number,
    gaps: number,
    locale: LocaleCode
  ) =>
    uiPick(
      locale,
      c(
        `目标考纲：${exams} · 共覆盖 ${expected} 个必学模块（已达标 ${ready} 个，待衔接补齐 ${gaps} 个）`,
        `Key Exams: ${exams} · ${expected} required modules (${ready} ready, ${gaps} bridge gaps)`,
        `主要試験：${exams} ・ 必須 ${expected} 単元（習得済 ${ready} 単元・要補強 ${gaps} 単元）`,
        `주요 시험: ${exams} · 필수 ${expected}개 모듈 중 ${ready}개 충족, 연계 보강 필요 ${gaps}개`,
        `Peperiksaan Utama: ${exams} · ${expected} modul wajib (${ready} sedia, ${gaps} jurang peralihan)`
      )
    ),
  gapModulesHeader: (regName: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `📌 衔接 ${regName} 需重点关注的差异/薄弱章节：`,
        `📌 Key Bridge & Prerequisite Modules for ${regName}:`,
        `📌 ${regName} への移行で重点確認すべき差分・弱点単元：`,
        `📌 ${regName} 과정 연계 시 중점 보강이 필요한 단원:`,
        `📌 Modul Jambatan & Prasyarat Utama untuk ${regName}:`
      )
    ),
  gapAllCovered: c(
    "已 100% 覆盖目标地区该年级全部核心先修要求！",
    "100% of core grade-level prerequisites for the target region are mastered!",
    "移行先地域における当該学年のコア前提要件を 100% カバーしています！",
    "목표 지역 해당 학년의 핵심 선수 요건을 100% 충족했습니다!",
    "100% keperluan prasyarat teras gred ini bagi rantau sasaran telah dikuasai!"
  ),
  targetAlignmentPrefix: c(
    "目标课标：",
    "Target Standard: ",
    "目標基準：",
    "목표 성취기준: ",
    "Standard Sasaran: "
  ),
  remediateWeakBtn: c(
    "补齐薄弱",
    "Remediate Gap",
    "弱点を補強",
    "취약 보강",
    "Pulihkan Jurang"
  ),
  bridgeSelfCheckBtn: c(
    "衔接自测",
    "Bridge Check",
    "移行チェック",
    "연계 자가진단",
    "Ujian Jambatan"
  ),
  pactTitle: c(
    "健康屏幕时长契约 & 正向勋章签发",
    "Healthy Screen-Time Pact & Family Milestone Badge",
    "健全なスクリーンタイム規約＆ファミリー達成バッジ",
    "건강한 학습 시간 협약 & 긍정 격려 배지 수여",
    "Janji Masa Skrin Sihat & Lencana Galakan Keluarga"
  ),
  badgeUnlockedPill: c(
    "已点亮荣誉勋章",
    "Milestone Badge Unlocked",
    "栄誉バッジ獲得済",
    "명예 배지 달성",
    "Lencana Pencapaian Aktif"
  ),
  todayUsedLine: (used: number, limit: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `今日已用伴学时长：${used} / ${limit} 分钟`,
        `Today's Study Time: ${used} / ${limit} min`,
        `本日の学習時間：${used} / ${limit} 分`,
        `오늘 사용한 학습 시간: ${used} / ${limit}분`,
        `Masa Belajar Hari Ini: ${used} / ${limit} min`
      )
    ),
  weeklyNodesLine: (done: number, target: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `本周攻克节点：${done}/${target}`,
        `Weekly Nodes Cleared: ${done}/${target}`,
        `今週の達成ノード：${done}/${target}`,
        `이번 주 정복 노드: ${done}/${target}`,
        `Nod Minggu Ini: ${done}/${target}`
      )
    ),
  dailyLimitLabel: c(
    "每日健康用眼上限（分钟）：",
    "Daily Healthy Screen Limit (min):",
    "1日の健康スクリーン上限（分）：",
    "일일 건강 화면 시간 상한 (분):",
    "Had Masa Skrin Harian Sihat (min):"
  ),
  weeklyTargetLabel: c(
    "每周微技能清零目标数：",
    "Weekly Micro-Topic Clearance Goal:",
    "週間クリア目標ノード数：",
    "주간 마이크로 스킬 클리어 목표 수:",
    "Sasaran Penguasaan Topik Mingguan:"
  ),
  rewardLabel: c(
    "家庭正向激励约定（达成目标解锁）：",
    "Family Positive Reward Pledge (Unlocked on Goal):",
    "ご家庭のポジティブご褒美約束（目標達成で解放）：",
    "가정 긍정 보상 약속 (목표 달성 시 잠금 해제):",
    "Ganjaran Positif Keluarga (Dibuka Apabila Sasaran Dicapai):"
  ),
  defaultPactReward: c(
    "周末科学馆探索特展 + 户外运动时光",
    "Weekend Science Museum Visit + Outdoor Sports Time",
    "週末の科学館特別展 + アウトドアスポーツ時間",
    "주말 과학관 특별전 탐방 + 야외 스포츠 시간",
    "Lawatan Muzium Sains Hujung Minggu + Aktiviti Sukan Luar"
  ),
  unlockBadgeCheckbox: c(
    "签发本周「跨科闯关小达人」亲子激励勋章",
    "Award This Week's 'Cross-STEM Explorer' Family Badge",
    "今週の「理数横断チャレンジャー」親子バッジを授与する",
    "이번 주 '융합수리 탐구 챔피언' 가족 격려 배지 수여",
    "Anugerahkan Lencana Keluarga 'Peneroka Rentas STEM' Minggu Ini"
  ),
  savePactBtn: c(
    "保存亲子契约",
    "Save Family Pact",
    "親子規約を保存",
    "가족 협약 저장",
    "Simpan Janji Keluarga"
  ),
  pactSavedToast: c(
    "✅ 已同步保存亲子学习时长契约与勋章状态！",
    "✅ Saved family screen-time pact & milestone badge status!",
    "✅ 親子学習時間規約とバッジ状態を保存しました！",
    "✅ 가족 학습 시간 협약 및 배지 상태가 저장되었습니다!",
    "✅ Janji masa belajar keluarga & status lencana berjaya disimpan!"
  ),
};

// ==================== 5. PRINTABLE A4 TWIN WORKSHEET (/parent/print) ====================

export const PRINT_COPY = {
  loading: c(
    "正在排版 A4 防背题错题重练卷…",
    "Formatting A4 Twin-Variant Redo Worksheet…",
    "A4 ペア類題リトライシートを組版中…",
    "A4 쌍둥이 변형 오답 복습지를 조판하는 중…",
    "Memformat Lembaran Kerja A4 Variasi Kembar…"
  ),
  backToParent: c(
    "返回家长伴学空间",
    "Back to Parent Space",
    "保護者スペースへ戻る",
    "학부모 공간으로 돌아가기",
    "Kembali ke Ruang Ibu Bapa"
  ),
  refreshTwinBtn: c(
    "换一套全新孪生数字",
    "Generate Fresh Twin Numbers",
    "新しいペア類題の数値に切替",
    "새로운 쌍둥이 숫자 세트로 변경",
    "Jana Set Nombor Kembar Baharu"
  ),
  hideAnswerKeyBtn: c(
    "隐藏家长答案附页",
    "Hide Parent Answer Key",
    "保護者用解答欄を隠す",
    "학부모 정답 부록 숨기기",
    "Sembunyikan Lampiran Jawapan"
  ),
  showAnswerKeyBtn: c(
    "显示家长答案附页",
    "Show Parent Answer Key",
    "保護者用解答欄を表示",
    "학부모 정답 부록 표시",
    "Paparkan Lampiran Jawapan"
  ),
  printPdfBtn: c(
    "打印 / 导出 PDF (A4)",
    "Print / Export PDF (A4)",
    "印刷 / PDF 出力 (A4)",
    "인쇄 / PDF 내보내기 (A4)",
    "Cetak / Eksport PDF (A4)"
  ),
  eyebrow: c(
    "OmniGraph K12 · 个性化孪生变式重练卷",
    "OmniGraph K12 · Personalized Twin-Variant Redo Worksheet",
    "OmniGraph K12 · 個別最適化 ペア類題リトライシート",
    "OmniGraph K12 · 맞춤형 쌍둥이 변형 복습 워크시트",
    "OmniGraph K12 · Lembaran Kerja Ulang Kaji Variasi Kembar"
  ),
  sheetTitle: c(
    "靶向错题孪生变式重练卷",
    "Targeted Mistake Twin-Variant Redo Worksheet",
    "弱点克服・類題（ペア問題）リトライ演習シート",
    "취약 오답 맞춤형 쌍둥이 변형 복습지",
    "Lembaran Kerja Ulang Kaji Variasi Kembar Sasaran"
  ),
  studentLine: (name: string, regName: string, regCode: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `学生姓名：${name}（${regName} · ${regCode} 课标）`,
        `Student: ${name} (${regName} · ${regCode} Standard)`,
        `生徒氏名：${name}（${regName}・${regCode} 基準）`,
        `학생 이름: ${name} (${regName} · ${regCode} 교육과정)`,
        `Pelajar: ${name} (Standard ${regName} · ${regCode})`
      )
    ),
  suggestedTimeLine: c(
    "建议用时：15 分钟 · 请写出关键推导步骤",
    "Suggested Time: 15 min · Show key step-by-step reasoning",
    "目安時間：15分 ・ 途中の重要な式・考え方を記入してください",
    "권장 시간: 15분 · 핵심 풀이 과정을 단계별로 작성하세요",
    "Masa Dicadangkan: 15 min · Tunjukkan langkah pengiraan utama"
  ),
  noPendingMistakes: c(
    "当前学生暂无待清零错题！",
    "No pending mistakes to clear for this student!",
    "現在、この生徒に未クリアの誤答はありません！",
    "현재 이 학생에게 남아 있는 미해결 오답이 없습니다!",
    "Tiada kesilapan tertunggak untuk pelajar ini!"
  ),
  itemHeader: (
    num: number,
    title: string,
    stdCode: string,
    locale: LocaleCode
  ) =>
    uiPick(
      locale,
      c(
        `第 ${num} 题 · ${title}${stdCode ? ` (${stdCode})` : ""}`,
        `Question ${num} · ${title}${stdCode ? ` (${stdCode})` : ""}`,
        `第 ${num} 問 ・ ${title}${stdCode ? ` (${stdCode})` : ""}`,
        `문항 ${num} · ${title}${stdCode ? ` (${stdCode})` : ""}`,
        `Soalan ${num} · ${title}${stdCode ? ` (${stdCode})` : ""}`
      )
    ),
  misconceptionReminder: (label: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `⚠️ 防错提醒：${label}`,
        `⚠️ Watch Out: ${label}`,
        `⚠️ つまずき注意：${label}`,
        `⚠️ 오개념 주의: ${label}`,
        `⚠️ Peringatan Konsep: ${label}`
      )
    ),
  handwritingBoxLabel: (unit: string | undefined, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `手写分步推导区${unit ? `（结果单位：${unit}）` : ""}：`,
        `Show your step-by-step working here${unit ? ` (Unit: ${unit})` : ""}:`,
        `手書き途中式・記述欄${unit ? `（単位：${unit}）` : ""}：`,
        `손글씨 단계별 풀이 작성란${unit ? ` (단위: ${unit})` : ""}:`,
        `Ruang jalan kerja langkah demi langkah${unit ? ` (Unit: ${unit})` : ""}:`
      )
    ),
  answerKeyTitle: c(
    "🔑 家长核对参考答案与分步解析附页（可沿虚线折叠）",
    "🔑 Parent Reference Answer Key & Step-by-Step Guide (Fold along dashed line)",
    "🔑 保護者確認用 模範解答＆ステップ解説（点線に沿って折り曲げ可能）",
    "🔑 학부모 확인용 정답 및 단계별 해설 부록 (점선을 따라 접을 수 있습니다)",
    "🔑 Lampiran Jawapan Rujukan & Panduan Ibu Bapa (Boleh dilipat mengikut garisan putus-putus)"
  ),
  answerItemPrefix: (
    num: number,
    ans: string,
    unit: string | undefined,
    locale: LocaleCode
  ) =>
    uiPick(
      locale,
      c(
        `第 ${num} 题答案：${ans}${unit ? ` ${unit}` : ""}`,
        `Q${num} Answer: ${ans}${unit ? ` ${unit}` : ""}`,
        `第 ${num} 問の正解：${ans}${unit ? ` ${unit}` : ""}`,
        `문항 ${num} 정답: ${ans}${unit ? ` ${unit}` : ""}`,
        `Jawapan S${num}: ${ans}${unit ? ` ${unit}` : ""}`
      )
    ),
};
