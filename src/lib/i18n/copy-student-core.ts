import type { LocaleCode } from "@/types/taxonomy";
import { c, toTraditionalChinese, uiPick, type UiCopy } from "./index";

const ROOT_REASON_FALLBACK = c(
  "学科起点核心地基节点（无更早先修依赖）。",
  "Foundational domain entry node (no upstream prerequisites required).",
  "この分野の出発点となる基礎コアノード（前提単元なし）。",
  "해당 영역의 출발점이 되는 핵심 기초 노드(상위 선수 단원 없음).",
  "Nod asas permulaan bagi domain ini (tiada prasyarat huluan diperlukan)."
);

const ROOT_REASON_BY_TOPIC: Record<string, UiCopy> = {
  mt_math_place_value_ops: c(
    "小学算术核心地基节点：十进制位值制与加减乘除四则运算互逆关系。",
    "Foundational primary arithmetic node: base-10 place value and inverse relationships across the four operations.",
    "小学校算数の基礎ノード：十進位取り記数法と四則演算の逆関係。",
    "초등 산수 핵심 기초 노드: 십진법 자릿값과 사칙연산의 역관계.",
    "Nod asas aritmetik rendah: nilai tempat asas-10 dan hubungan songsang empat operasi."
  ),
  mt_eng_sentence_sva_tense: c(
    "英语核心句法地基：剥离介词短语干扰定位真正核心主语单复数，匹配时态轴。",
    "Core English syntax foundation: isolate true head subjects from prepositional modifiers and align subject-verb agreement with tense.",
    "英語統語論の基礎：前置詞句を除いて真の主語の単複を特定し、時制軸と一致させる。",
    "영어 핵심 구문 기초: 전치사구 수식을 걷어내고 핵심 주어의 단복수와 시제를 일치시킴.",
    "Asas sintaks Bahasa Inggeris: mengenal pasti subjek utama tanpa gangguan frasa sendi nama serta memadankan kala."
  ),
  mt_lit_main_idea_structure: c(
    "全语种阅读素养地基节点：区分核心论点（Claim）与论据例子（Evidence），识别总分、转折与递进结构。",
    "Cross-lingual reading literacy root: distinguish central claims from supporting evidence and identify rhetorical structures.",
    "読解リテラシーの基礎ノード：中心主張（Claim）と根拠・具体例（Evidence）を区別し、文章構造を把握する。",
    "범언어 독해 문해력 기초 노드: 핵심 주장(Claim)과 근거(Evidence)를 구분하고 글의 논리 구조를 파악함.",
    "Nod asas literasi bacaan: membezakan pernyataan utama (Claim) daripada bukti (Evidence) serta struktur wacana."
  ),
  mt_chem_atomic_periodic: c(
    "化学学科微粒观起点：质子数决定元素种类，最外层电子数决定化学性质与得失电子趋势。",
    "Chemistry particulate foundation: proton number defines the element, while valence electrons govern chemical reactivity.",
    "化学粒子観の出発点：陽子数が元素を決め、最外殻電子数が化学的性質とイオン化傾向を決める。",
    "화학 입자관의 출발점: 양성자수가 원소 종류를 결정하고 원자가전자가 화학적 성질을 결정함.",
    "Titik mula zarah kimia: bilangan proton menentukan unsur, manakala elektron valens menentukan kereaktifan kimia."
  ),
  mt_bio_cell_transport: c(
    "生命科学结构基础起点：细胞膜选择透过性、细胞器能量分工与水分子渗透方向判读。",
    "Life sciences structural root: selective membrane permeability, organelle division of labor, and osmotic water movement.",
    "生命科学の構造的出発点：細胞膜の選択的透過性、細胞小器官の役割分担、浸透圧による水移動の理解。",
    "생명과학 구조적 출발점: 세포막의 선택적 투과성, 세포소기관의 역할 분담 및 삼투 방향 판별.",
    "Asas struktur sains hayat: ketelapan memilih membran sel, fungsi organel, dan arah osmosis molekul air."
  ),
  mt_phy_measurement_density: c(
    "初中物理与综合科学起点：质量与体积测量及物质特性密度定义（依赖跨科数学比与比例）。",
    "Lower-secondary physics & science root: mass/volume measurement and density as an intrinsic property (bridged with math ratios).",
    "中学物理・理科の出発点：質量と体積の測定および物質固有の密度定義（数学の比・比例と連携）。",
    "중등 물리·과학 출발점: 질량과 부피 측정 및 물질의 특성인 밀도 정의(수학 비와 비례 연계).",
    "Titik mula fizik & sains menengah rendah: pengukuran jisim/isi padu dan takrif ketumpatan (jambatan nisbah matematik)."
  ),
  mt_chem_stoichiometry_conservation: c(
    "化学定量计算核心基石：原子个数守恒与化学方程式配平（跨科桥接数学比例与线性方程）。",
    "Quantitative chemistry cornerstone: conservation of atoms and balancing chemical equations (bridged with math proportions).",
    "化学定量計算の礎石：原子数の保存と化学反応式の係数合わせ（数学の比例・一次方程式と連携）。",
    "화학 정량 계산의 초석: 원자 수 보존과 화학 반응식 계수 맞추기(수학 비례식·일차방정식 연계).",
    "Asas pengiraan kuantitatif kimia: keabadian atom dan pengimbangan persamaan kimia (jambatan kadaran matematik)."
  ),
  mt_bio_mendelian_genetics: c(
    "生物学定量推理核心节点：等位基因分离与庞氏表（Punnett Square）概率计算（桥接数学分数与概率）。",
    "Quantitative biology node: allele segregation and Punnett Square probability modeling (bridged with math fractions & probability).",
    "生物学的定量推論ノード：対立遺伝子の分離とパネットスクエアによる確率計算（数学の分数・確率と連携）。",
    "생물학 정량 추론 핵심 노드: 대립유전자 분리와 퍼넷 사각형 확률 계산(수학 분수·확률 연계).",
    "Nod penaakulan kuantitatif biologi: pengasingan alel dan kebarangkalian Segi Empat Punnett (jambatan pecahan & kebarangkalian)."
  ),
  mt_eng_relative_clauses: c(
    "英语学术阅读与复杂句写作核心节点：关系代词与关系副词引导的定语从句逻辑成分判定。",
    "Academic English reading & complex writing node: identifying syntactic roles of relative pronouns and adverbs in relative clauses.",
    "学術英語読解・複文ライティングの核：関係代名詞・関係副詞が導く関係詞節の文法的役割の判定。",
    "학술 영어 독해 및 복문 작문 핵심 노드: 관계대명사와 관계부사가 이끄는 관계사절의 문장 성분 판별.",
    "Nod bacaan akademik & ayat majmuk Bahasa Inggeris: menentukan peranan kata ganti nama dan kata keterangan relatif."
  ),
  mt_cs_binary_logic: c(
    "计算思维地基节点：二进制位权展开与布尔逻辑门（桥接数学十进制位值与乘方运算）。",
    "Computational thinking root: binary positional expansion and Boolean logic gates (bridged with base-10 place value & powers).",
    "計算論的思考の基礎ノード：二進数の位取り展開とブール論理ゲート（数学の位取り・累乗と連携）。",
    "컴퓨팅 사고력 기초 노드: 이진수 자릿값 전개와 불 논리 게이트(수학 십진 자릿값·거듭제곱 연계).",
    "Nod asas pemikiran komputasional: pengembangan nilai tempat perduaan dan get logik Boolean (jambatan nilai tempat & kuasa)."
  ),
  mt_geo_map_scale_timezones: c(
    "地理空间定量推理基础：地图比例尺换算与经度时区计算（桥接数学比例与正负数）。",
    "Geospatial quantitative root: map scale conversion and longitude time-zone calculation (bridged with ratios & signed integers).",
    "地理空間定量推論の基礎：地図の縮尺換算と経度・時差計算（数学の比例・正負の数と連携）。",
    "지리 공간 정량 추론 기초: 지도 축척 환산과 경도 시차 계산(수학 비례·정수 연산 연계).",
    "Asas penaakulan kuantitatif geografi: penukaran skala peta dan pengiraan zon waktu longitud (jambatan nisbah & integer)."
  ),
  mt_his_chronology_evidence: c(
    "历史学科核心素养起点：公元前后跨零点纪年跨度计算与一手/二手史料证据链辨析。",
    "Historical inquiry root: BCE/CE cross-zero chronological span calculation and primary vs. secondary source evaluation.",
    "歴史探究の出発点：紀元前・紀元後をまたぐ年数計算と一次史料・二次史料の証拠評価。",
    "역사 탐구 핵심 역량 출발점: 기원전·기원후 연대 간격 계산 및 1차·2차 사료 증거 판별.",
    "Titik mula inkuiri sejarah: pengiraan garis masa SM/M merentas sifar serta penilaian sumber primer dan sekunder."
  ),
};

export function getLocalizedRootReason(
  topicId: string,
  rawRootReason: string | undefined,
  locale: LocaleCode
): string {
  const entry = ROOT_REASON_BY_TOPIC[topicId];
  if (entry) return uiPick(locale, entry);
  if (rawRootReason) {
    if (locale === "zh-CN") return rawRootReason;
    if (locale === "zh-TW") return toTraditionalChinese(rawRootReason);
  }
  return uiPick(locale, ROOT_REASON_FALLBACK);
}

/**
 * 6-locale UI copy for `src/app/page.tsx` (Student Overview Dashboard)
 */
export const STUDENT_DASHBOARD_COPY = {
  loading: c(
    "正在加载 OmniGraph K12 全球 9 地知识图谱与个性化学习画像...",
    "Loading OmniGraph K12 9-Region Knowledge Graph & Personalized Mastery Profile...",
    "OmniGraph K12 9地域知識グラフと個別学習プロファイルを読み込み中...",
    "OmniGraph K12 9개 지역 지식그래프 및 맞춤형 학습 프로필을 불러오는 중...",
    "Memuatkan Graf Pengetahuan 9 Rantau OmniGraph K12 & Profil Pembelajaran Peribadi..."
  ),
  currentLensPrefix: c(
    "当前课标透镜：",
    "Curriculum Lens: ",
    "現在のカリキュラム：",
    "현재 교육과정 렌즈: ",
    "Lensa Kurikulum: "
  ),
  gradeStagePrefix: c(
    "对应学段：",
    "Stage: ",
    "対象学年：",
    "해당 학년: ",
    "Tahap Gred: "
  ),
  privacyBaselinePrefix: c(
    "隐私合规基线：",
    "Privacy Baseline: ",
    "プライバシー基準：",
    "개인정보 준수 기준: ",
    "Asas Privasi: "
  ),
  greeting: (name: string, locale: LocaleCode): string =>
    uiPick(
      locale,
      c(
        `你好，${name}！`,
        `Hello, ${name}!`,
        `こんにちは、${name}さん！`,
        `안녕하세요, ${name}님!`,
        `Hai, ${name}!`
      )
    ),
  heroIntroBefore: c(
    "系统正基于 ",
    "Powered by the ",
    "システムは ",
    "시스템이 ",
    "Sistem sedang menjejak penguasaan anda melalui "
  ),
  heroIntroHighlight: (regionCode: string, locale: LocaleCode): string =>
    uiPick(
      locale,
      c(
        `全球统一概念核（Canonical Core）+ ${regionCode} 课标映射层`,
        `Global Canonical Core + ${regionCode} Curriculum Overlay`,
        `グローバル共通概念コア（Canonical Core）＋ ${regionCode} カリキュラムマッピング層`,
        `글로벌 표준 개념 코어(Canonical Core) + ${regionCode} 교육과정 매핑 레이어`,
        `Teras Konsep Kanonik Global + Lapisan Kurikulum ${regionCode}`
      )
    ),
  heroIntroAfter: c(
    " 实时追踪你的上下游先修掌握度与跨学科数学工具链。",
    ", tracking your upstream prerequisites and cross-subject STEM toolchains in real time.",
    " に基づき、前提単元の習得度と教科横断の数学ツールチェーンをリアルタイムで追跡しています。",
    " 를 기반으로 상하위 선수 개념 숙달도와 교과 융합 수학 도구 체인을 실시간 추적합니다.",
    " secara masa nyata merentas prasyarat huluan dan jambatan antara subjek."
  ),
  ctaDiagnose: c(
    "启动靶向回溯诊断",
    "Start Adaptive Diagnosis",
    "遡及アダプティブ診断を開始",
    "역추적 적응형 진단 시작",
    "Mulakan Diagnosis Adaptif"
  ),
  ctaExplore: c(
    "探索全科 DAG 星海",
    "Explore All-Subject DAG",
    "全教科 DAG マップを探索",
    "전과목 DAG 지식맵 탐색",
    "Teroka Peta DAG Semua Subjek"
  ),
  metricMasteredLabel: c(
    "已掌握 / 剪枝豁免",
    "Mastered / Pruned Exempt",
    "習得済 / 前提免除",
    "마스터 / 선수 면제",
    "Dikuasai / Dikecualikan"
  ),
  metricMasteredTotal: (total: number, locale: LocaleCode): string =>
    uiPick(
      locale,
      c(
        `/ ${total} 核心微技能`,
        `/ ${total} micro-skills`,
        `/ ${total} マイクロスキル`,
        `/ ${total}개 핵심 마이크로 스킬`,
        `/ ${total} kemahiran mikro`
      )
    ),
  metricShakyLabel: c(
    "粗心滑档待巩固 (Shaky)",
    "Careless Slip to Consolidate (Shaky)",
    "ケアレスミス・要定着 (Shaky)",
    "실수 흔들림 보강 필요 (Shaky)",
    "Perlu Pengukuhan Pantas (Shaky)"
  ),
  metricShakySub: c(
    "无需深层回溯",
    "No deep backtracking needed",
    "深層遡及は不要",
    "심층 역추적 불필요",
    "Tiada jejak balik mendalam"
  ),
  metricWeakLabel: c(
    "薄弱与前置病灶 (Weak)",
    "Weak & Prerequisite Gaps (Weak)",
    "弱点・前提ボトルネック (Weak)",
    "취약 및 선수 결손 (Weak)",
    "Jurang Lemah & Prasyarat (Weak)"
  ),
  metricWeakSub: (rootCount: number, locale: LocaleCode): string =>
    uiPick(
      locale,
      c(
        `含 ${rootCount} 个源头根因`,
        `incl. ${rootCount} root cause(s)`,
        `うち根本原因 ${rootCount} 件`,
        `근본 원인 ${rootCount}개 포함`,
        `termasuk ${rootCount} punca akar`
      )
    ),
  metricWrongLabel: c(
    "FSRS 错题待孪生清零",
    "FSRS Twin Clearance Queue",
    "FSRS 双子類題クリア待ち",
    "FSRS 쌍둥이 오답 클리어 대기",
    "Giliran Pembersihan Kembar FSRS"
  ),
  metricWrongAction: c(
    "去清零 →",
    "Clear now →",
    "クリアへ →",
    "클리어하러 가기 →",
    "Selesaikan →"
  ),
  rootPrescriptionTitle: c(
    "图谱溯源处方：优先攻克「上游根因」解锁下游多科卡点",
    "Topological Prescription: Fix Upstream Root Causes to Unlock Downstream Subjects",
    "グラフ遡及処方箋：「上流の根本原因」から攻略し下流の多教科ボトルネックを解放",
    "그래프 역추적 처방: '상위 근본 원인'을 우선 해결하여 하위 다교과 병목 해금",
    "Preskripsi Topologi: Atasi Punca Huluan Dahulu untuk Membuka Sekatan Hiliran"
  ),
  rootPrescriptionBadge: c(
    "DAG 拓扑最短修复路径",
    "Shortest DAG Remediation Path",
    "DAG 最短修復パス",
    "DAG 위상 최단 복구 경로",
    "Laluan Pemulihan DAG Terpendek"
  ),
  rootEmptyMsg: c(
    "🎉 太棒了！当前已测节点未发现上游先修断层，可直接前往「知识图谱星海」挑战更高学段微积分或拔高专题！",
    "🎉 Awesome! No upstream prerequisite gaps detected in your tested nodes — head to the Knowledge Map to tackle advanced topics!",
    "🎉 素晴らしい！診断済みノードに上流の前提欠損はありません。「知識グラフ探索」でさらに高度な単元に挑戦しましょう！",
    "🎉 훌륭합니다! 진단된 노드에서 상위 선수 결손이 발견되지 않았습니다. 지식그래프 탐색에서 상위 심화 단원에 도전해 보세요!",
    "🎉 Syabas! Tiada jurang prasyarat huluan dikesan — teruskan ke Peta Ilmu untuk mencuba topik aras tinggi!"
  ),
  rootCauseTag: c(
    "🎯 源头病灶 Root Cause",
    "🎯 Root Cause",
    "🎯 根本原因 Root Cause",
    "🎯 근본 원인 Root Cause",
    "🎯 Punca Akar Root Cause"
  ),
  bktMasteryProb: c(
    "BKT 掌握概率",
    "BKT P(Mastery)",
    "BKT 習得確率",
    "BKT 숙달 확률",
    "Kebarangkalian BKT"
  ),
  downstreamUnlockPrefix: c(
    "⚡ 修复该节点将直接打通下游：",
    "⚡ Fixing this node directly unlocks downstream: ",
    "⚡ このノードの修復で直結する下流単元：",
    "⚡ 이 노드를 보완하면 즉시 해금되는 하위 단원: ",
    "⚡ Membaiki nod ini membuka topik hiliran secara terus: "
  ),
  listSep: c("、", ", ", "・", ", ", ", "),
  crossSubjectTag: (subjectUpper: string, locale: LocaleCode): string =>
    uiPick(
      locale,
      c(
        `[跨科:${subjectUpper}] `,
        `[Cross:${subjectUpper}] `,
        `[横断:${subjectUpper}] `,
        `[융합:${subjectUpper}] `,
        `[Rentas:${subjectUpper}] `
      )
    ),
  learnMicroLessonBtn: c(
    "学 3 分钟微课件",
    "3-Min Micro-Lesson",
    "3分マイクロ講義",
    "3분 마이크로 레슨",
    "Pelajaran Mikro 3 Minit"
  ),
  retestTargetBtn: c(
    "靶向复测确认",
    "Targeted Retest",
    "ターゲット再診断",
    "타깃 재진단 확인",
    "Ujian Semula Sasaran"
  ),
  assignmentsTitle: c(
    "班级分层个性化任务单",
    "Differentiated Class Assignments",
    "クラス階層別パーソナライズ課題",
    "학급 수준별 맞춤형 과제",
    "Tugasan Kelas Terbeza"
  ),
  assignmentsSubtitle: c(
    "教师端精准靶向派发",
    "Targeted by Teacher Hub",
    "教員ダッシュボードから配信",
    "교사 연구실 맞춤형 배정",
    "Diagihkan oleh Hab Guru"
  ),
  assignmentsEmpty: c(
    "当前学生暂无班级派发任务（可切换至 G9 班级学生查看分层作业，或在教师端一键派发）。",
    "No class assignments for this student yet (switch to a G9 cohort student or assign a pack from Teacher Hub).",
    "現在この生徒への配信課題はありません（G9 クラスの生徒に切り替えるか、教員画面から配信できます）。",
    "현재 배정된 학급 과제가 없습니다(G9 학급 학생으로 전환하거나 교사 연구실에서 배정할 수 있습니다).",
    "Tiada tugasan kelas buat masa ini (tukar kepada pelajar G9 atau agihkan daripada Hab Guru)."
  ),
  assignmentTierLabel: (tier: string, locale: LocaleCode): string => {
    const map: Record<string, UiCopy> = {
      foundational: c("基础补基", "FOUNDATIONAL", "基礎補強", "기초 보강", "ASAS"),
      standard: c("标准巩固", "STANDARD", "標準定着", "표준 정착", "STANDARD"),
      challenge: c("拔高拓展", "CHALLENGE", "発展挑戦", "심화 챌린지", "CABARAN"),
    };
    return uiPick(locale, map[tier] ?? map.standard);
  },
  assignmentMeta: (topicCount: number, dueDate: string, locale: LocaleCode): string =>
    uiPick(
      locale,
      c(
        `关联 ${topicCount} 个图谱微技能 · 截止 ${dueDate}`,
        `${topicCount} linked micro-skill(s) · Due ${dueDate}`,
        `関連マイクロスキル ${topicCount} 件 ・ 期限 ${dueDate}`,
        `연결 마이크로 스킬 ${topicCount}개 · 마감 ${dueDate}`,
        `${topicCount} kemahiran mikro berkaitan · Tarikh akhir ${dueDate}`
      )
    ),
  assignmentStartBtn: c(
    "开始闯关 →",
    "Start Quest →",
    "挑戦開始 →",
    "도전 시작 →",
    "Mula Cabaran →"
  ),
  fsrsQueueTitle: c(
    "今日 FSRS 遗忘曲线待复习队列",
    "Today's FSRS Spaced-Repetition Queue",
    "本日の FSRS 忘却曲線レビュー待ち",
    "오늘의 FSRS 망각곡선 복습 대기열",
    "Giliran Ulang Kaji Lengkung Lupa FSRS Hari Ini"
  ),
  fsrsAllLink: c(
    "全部错题本 →",
    "Full Notebook →",
    "誤答ノート一覧 →",
    "전체 오답노트 →",
    "Semua Buku Salah →"
  ),
  fsrsQueueDesc: c(
    "拒绝死记原题答案！系统每次提取均动态生成「同构不同数」孪生变式题，连续 3 次 Good/Easy 方可彻底清零。",
    "Zero rote memorization: every review dynamically generates isomorphic twin variants with fresh numbers. Achieve a 3x Good/Easy streak to clear.",
    "丸暗記を防止！復習のたびに数値や文脈を変えた同型「双子類題」を動的生成し、3回連続 Good/Easy で完全クリアとなります。",
    "단순 답 암기 방지! 복습할 때마다 숫자와 맥락이 바뀐 동형 '쌍둥이 변형 문제'가 생성되며, 3회 연속 Good/Easy 달성 시 완전 클리어됩니다.",
    "Elakkan hafalan jawapan! Setiap ulang kaji menjana soalan kembar seiras dengan nombor baharu. Capai 3x Good/Easy berturut-turut untuk selesai."
  ),
  fsrsQueueEmpty: c(
    "今日暂无待清零错题！去「靶向回溯诊断」做一次体检吧。",
    "No pending wrong items today! Run an Adaptive Diagnosis checkup to discover new growth edges.",
    "本日クリア待ちの誤答はありません！「遡及アダプティブ診断」で実力チェックをしてみましょう。",
    "오늘 클리어할 오답이 없습니다! '역추적 적응형 진단'에서 실력을 점검해 보세요.",
    "Tiada soalan salah tertunggak hari ini! Cuba Diagnosis Adaptif untuk semakan penguasaan."
  ),
  clearStreak: (streak: number, locale: LocaleCode): string =>
    uiPick(
      locale,
      c(
        `清零连击 ${streak}/3`,
        `Clear Streak ${streak}/3`,
        `連続クリア ${streak}/3`,
        `클리어 연속 ${streak}/3`,
        `Rentak Selesai ${streak}/3`
      )
    ),
  misconceptionPrefix: c(
    "迷思诊断：",
    "Misconception: ",
    "誤概念診断：",
    "오개념 진단: ",
    "Salah Konsep: "
  ),
  retrievabilityPrefix: c(
    "记忆保留率 R =",
    "Retrievability R =",
    "記憶保持率 R =",
    "기억 보존율 R =",
    "Kebolehingatan R ="
  ),
  stabilityLabel: (days: number, locale: LocaleCode): string =>
    uiPick(
      locale,
      c(
        `稳定性 S = ${days}d`,
        `Stability S = ${days}d`,
        `安定度 S = ${days}d`,
        `안정성 S = ${days}d`,
        `Kestabilan S = ${days}h`
      )
    ),
  practiceTwinBtn: c(
    "练孪生变式",
    "Practice Twin",
    "双子類題を解く",
    "쌍둥이 문제 풀기",
    "Latih Kembar"
  ),
  regionCardTitle: (regionDisplayName: string, locale: LocaleCode): string =>
    uiPick(
      locale,
      c(
        `${regionDisplayName} 学制与升学考纲基座`,
        `${regionDisplayName} School System & Exam Framework`,
        `${regionDisplayName} 学制・入試カリキュラム基盤`,
        `${regionDisplayName} 학제 및 진학 시험 기준`,
        `Sistem Sekolah & Rangka Peperiksaan ${regionDisplayName}`
      )
    ),
  currencySymbolLabel: (symbol: string, locale: LocaleCode): string =>
    uiPick(
      locale,
      c(
        `货币符号 ${symbol}`,
        `Currency ${symbol}`,
        `通貨記号 ${symbol}`,
        `통화 기호 ${symbol}`,
        `Mata Wang ${symbol}`
      )
    ),
  schoolSystemLabel: c(
    "学制结构：",
    "School System: ",
    "学制構造：",
    "학제 구조: ",
    "Sistem Sekolah: "
  ),
  officialCurriculumLabel: c(
    "官方课标：",
    "Official Curriculum: ",
    "公式基準：",
    "공식 교육과정: ",
    "Kurikulum Rasmi: "
  ),
  allSubjectGridTitle: c(
    "全科 K12 知识图谱矩阵（数学深度主干 + 物理跨科桥接 + 六科全科扩展）",
    "All-Subject K12 Knowledge Graph Matrix (Math Spine + Physics Bridges + 6 Extended Domains)",
    "全教科 K12 知識グラフマトリクス（数学コア幹線＋物理横断ブリッジ＋6教科拡張）",
    "전과목 K12 지식그래프 매트릭스 (수학 심층 주축 + 물리 교과 브리지 + 6개 확장 교과)",
    "Matriks Graf Pengetahuan K12 Semua Subjek (Teras Matematik + Jambatan Fizik + 6 Subjek Lanjutan)"
  ),
  openFullDagLink: c(
    "打开完整 DAG 画布 →",
    "Open Full DAG Canvas →",
    "完全な DAG キャンバスを開く →",
    "전체 DAG 캔버스 열기 →",
    "Buka Kanvas DAG Penuh →"
  ),
  subjectNodeCount: (mastered: number, total: number, locale: LocaleCode): string =>
    uiPick(
      locale,
      c(
        `${mastered}/${total} 节点`,
        `${mastered}/${total} nodes`,
        `${mastered}/${total} ノード`,
        `${mastered}/${total} 노드`,
        `${mastered}/${total} nod`
      )
    ),
};

/**
 * 6-locale UI copy for `src/app/explore/page.tsx` (Global Canonical DAG Explorer)
 */
export const EXPLORE_COPY = {
  loading: c(
    "正在渲染全球概念核 DAG 星图...",
    "Rendering Global Canonical DAG Constellation...",
    "グローバル概念コア DAG マップを描画中...",
    "글로벌 표준 개념 코어 DAG 지식맵을 렌더링하는 중...",
    "Memaparkan Peta Bintang DAG Konsep Kanonik Global..."
  ),
  title: c(
    "知识图谱星海（Global Canonical DAG Explorer）",
    "Global Canonical Knowledge Graph Explorer",
    "知識グラフ探索（Global Canonical DAG Explorer）",
    "지식그래프 탐색 (Global Canonical DAG Explorer)",
    "Peneroka Graf Pengetahuan Kanonik Global (DAG)"
  ),
  subtitle: c(
    "点击任意微技能节点，高亮追踪其「上游先修地基」与「下游跨科解锁链路」，实时对比中/日/韩/港/台/新/马/英/美 9 地课标。",
    "Click any micro-skill node to trace its upstream prerequisites and downstream cross-subject unlocks across all 9 regional curricula (CN/HK/TW/SG/MY/JP/KR/UK/US).",
    "任意のマイクロスキルをクリックすると、「上流の前提基盤」と「下流の教科横断アンロック経路」をハイライト表示し、9地域のカリキュラムを即時比較できます。",
    "마이크로 스킬 노드를 클릭하여 '상위 선수 기반'과 '하위 교과 융합 해금 경로'를 추적하고 9개 지역 교육과정을 실시간 비교하세요.",
    "Klik mana-mana nod kemahiran mikro untuk menjejak prasyarat huluan dan laluan buka kunci merentas subjek bagi 9 kurikulum serantau."
  ),
  stemCoreFilter: (count: number, locale: LocaleCode): string =>
    uiPick(
      locale,
      c(
        `📐+⚡ 数理跨科主干 (${count})`,
        `📐+⚡ Math-Physics Core (${count})`,
        `📐+⚡ 数理横断コア (${count})`,
        `📐+⚡ 수리·물리 융합 주축 (${count})`,
        `📐+⚡ Teras Mat-Fizik (${count})`
      )
    ),
  allSubjectsFilter: (count: number, locale: LocaleCode): string =>
    uiPick(
      locale,
      c(
        `🌌 全科总览 (${count})`,
        `🌌 All Subjects (${count})`,
        `🌌 全教科一覧 (${count})`,
        `🌌 전과목 전체 (${count})`,
        `🌌 Semua Subjek (${count})`
      )
    ),
  upstreamTitle: c(
    "⬆ 直接先修依赖（Upstream Prerequisites）",
    "⬆ Direct Upstream Prerequisites",
    "⬆ 直接の上流前提単元（Upstream Prerequisites）",
    "⬆ 직접 상위 선수 단원 (Upstream Prerequisites)",
    "⬆ Prasyarat Huluan Terus (Upstream)"
  ),
  rootNodePrefix: c(
    "学科起点根节点：",
    "Domain Entry Root Node: ",
    "分野の出発点ルートノード：",
    "영역 출발 루트 노드: ",
    "Nod Akar Permulaan: "
  ),
  downstreamTitle: c(
    "⬇ 直接解锁后继（Downstream Unlocked）",
    "⬇ Direct Downstream Unlocks",
    "⬇ 直接アンロックされる後続単元（Downstream）",
    "⬇ 직접 해금되는 후속 단원 (Downstream)",
    "⬇ Topik Hiliran Dibuka Terus (Downstream)"
  ),
  terminalNodeMsg: c(
    "🏁 当前子图高阶终点技能节点",
    "🏁 High-tier capstone skill node in this subgraph",
    "🏁 現在のサブグラフにおける高次到達ノード",
    "🏁 현재 서브그래프의 상위 종착 스킬 노드",
    "🏁 Nod kemahiran puncak dalam subgraf semasa"
  ),
  crossEmpowerBadge: (subjectBadge: string, locale: LocaleCode): string =>
    uiPick(
      locale,
      c(
        `跨科赋能 ${subjectBadge}`,
        `Powers ${subjectBadge}`,
        `横断連携 ${subjectBadge}`,
        `교과 융합 ${subjectBadge}`,
        `Memperkasa ${subjectBadge}`
      )
    ),
  downstreamStepBadge: c(
    "后继进阶",
    "Next Step",
    "後続発展",
    "후속 심화",
    "Langkah Seterusnya"
  ),
  currentStatusLabel: c(
    "当前状态：",
    "Current Status:",
    "現在の状態：",
    "현재 상태:",
    "Status Semasa:"
  ),
  textbookPosition: (edition: string, chapter: string, locale: LocaleCode): string =>
    uiPick(
      locale,
      c(
        `本土教材定位：${edition} — 《${chapter}》`,
        `Local Textbook Alignment: ${edition} — "${chapter}"`,
        `地域教材の位置づけ：${edition} — 『${chapter}』`,
        `현지 교재 단원 위치: ${edition} — "${chapter}"`,
        `Jajaran Buku Teks Tempatan: ${edition} — "${chapter}"`
      )
    ),
  wrapChapterTitle: (chapter: string, locale: LocaleCode): string =>
    uiPick(
      locale,
      c(
        `《${chapter}》`,
        `"${chapter}"`,
        `『${chapter}』`,
        `"${chapter}"`,
        `"${chapter}"`
      )
    ),
  launchDiagnoseFromNode: c(
    "从该节点启动自适应回溯诊断",
    "Start Adaptive Backtracking Diagnosis Here",
    "このノードから遡及アダプティブ診断を開始",
    "이 노드에서 역추적 적응형 진단 시작",
    "Mulakan Diagnosis Jejak Balik dari Nod Ini"
  ),
  tabLesson: c(
    "交互微课件与迷思纠偏",
    "Micro-Lesson & Misconceptions",
    "対話型マイクロ講義・誤概念対策",
    "마이크로 레슨 & 오개념 교정",
    "Pelajaran Mikro & Salah Konsep"
  ),
  tabCrosswalk: c(
    "9 地官方课标横评",
    "9-Region Curriculum Crosswalk",
    "9地域カリキュラム比較",
    "9개 지역 공식 교육과정 비교",
    "Perbandingan Kurikulum 9 Rantau"
  ),
  coreIntuitionTitle: c(
    "💡 核心本质直觉（Core Intuition）",
    "💡 Core Conceptual Intuition",
    "💡 本質的コア直観（Core Intuition）",
    "💡 핵심 본질 직관 (Core Intuition)",
    "💡 Intuisi Konsep Teras (Core Intuition)"
  ),
  masteryCriteriaTitle: c(
    "✅ 掌握通关标准（Mastery Criteria）",
    "✅ Mastery Criteria",
    "✅ 習得クリア基準（Mastery Criteria）",
    "✅ 마스터 통과 기준 (Mastery Criteria)",
    "✅ Kriteria Penguasaan (Mastery Criteria)"
  ),
  quickCheckPrefix: c(
    "即学即测：",
    "Quick Check: ",
    "即時チェック：",
    "즉시 확인 퀴즈: ",
    "Semakan Pantas: "
  ),
  quickCheckPlaceholder: c(
    "输入口算结果验证...",
    "Enter mental-math answer...",
    "暗算結果を入力して確認...",
    "암산 결과를 입력해 확인...",
    "Masukkan jawapan kiraan..."
  ),
  quickCheckBtn: c("核对", "Check", "判定", "확인", "Semak"),
  quickCheckRight: c(
    "🎉 完全正确！你已抓住核心直觉，可直接启动靶向诊断！",
    "🎉 Spot on! You've grasped the core intuition — ready to launch targeted diagnosis!",
    "🎉 大正解！本質的な直観を掴めました。このまま診断に挑戦しましょう！",
    "🎉 정답입니다! 핵심 직관을 완벽히 파악했습니다. 바로 타깃 진단을 시작해 보세요!",
    "🎉 Tepat sekali! Anda telah memahami intuisi teras — sedia untuk diagnosis sasaran!"
  ),
  quickCheckWrongPrefix: c(
    "再想一想！参考答案提示：",
    "Think again! Reference answer:",
    "もう一度考えてみよう！参考解答：",
    "다시 한번 생각해 보세요! 참고 정답:",
    "Cuba fikir semula! Jawapan rujukan:"
  ),
  misconceptionAlertPrefix: c(
    "高频认知迷思预警：",
    "High-Frequency Misconception Alert: ",
    "頻出する誤概念アラート：",
    "빈출 오개념 주의보: ",
    "Amaran Salah Konsep Kerap: "
  ),
  wrongPatternLabel: c(
    "典型错法：",
    "Typical Pitfall: ",
    "典型的な誤り：",
    "대표적인 오답 패턴: ",
    "Kesilapan Lazim: "
  ),
  remediationTipLabel: c(
    "纠偏锦囊：",
    "Remediation Tip: ",
    "克服のポイント：",
    "교정 팁: ",
    "Tip Pemulihan: "
  ),
  regionalNotePrefix: c(
    "区域特色：",
    "Regional Highlight: ",
    "地域の特色：",
    "지역 특색: ",
    "Sorotan Rantau: "
  ),
};

/**
 * 6-locale UI copy for `src/app/diagnose/page.tsx` (Adaptive Diagnostic Cockpit & Socratic AI Tutor)
 */
export const DIAGNOSE_COPY = {
  loading: c(
    "正在初始化自适应前置回溯诊断引擎...",
    "Initializing Adaptive Prerequisite Backtracking Engine...",
    "遡及アダプティブ前提診断エンジンを初期化中...",
    "역추적 적응형 선수 진단 엔진을 초기화하는 중...",
    "Memulakan Enjin Diagnosis Jejak Balik Prasyarat Adaptif..."
  ),
  pageTitle: c(
    "自适应前置回溯诊断舱 & 苏格拉底 AI 伴学导师",
    "Adaptive Backtracking Diagnostic Cockpit & Socratic AI Tutor",
    "遡及アダプティブ診断コックピット ＆ ソクラテス式 AI チューター",
    "역추적 적응형 진단 콕핏 & 소크라테스식 AI 튜터",
    "Kokpit Diagnosis Jejak Balik Adaptif & Tutor AI Sokratik"
  ),
  pageSubtitle: c(
    "答对连胜自动剪枝豁免全部先修节点；首题答错降维复测区分「粗心滑档 Shaky」与「概念薄弱 Weak」，并自动跨科回溯源头病灶。",
    "Consecutive correct answers auto-prune all upstream prerequisites; a first miss triggers a stepped-down retest to separate careless slips (Shaky) from true gaps (Weak) and backtracks across subjects.",
    "連続正解で上流の前提ノードを一括免除。初回不正解時は基礎確認問題で「ケアレスミス（Shaky）」と「本質的弱点（Weak）」を切り分け、教科横断で根本原因へ遡及します。",
    "연속 정답 시 상위 선수 노드를 자동 면제하며, 첫 오답 시 기초 재검증으로 '실수(Shaky)'와 '개념 취약(Weak)'을 구분해 교과 간 근본 원인을 역추적합니다.",
    "Jawapan betul berturut-turut mengecualikan prasyarat huluan secara automatik; kesilapan pertama mencetuskan ujian semula asas untuk membezakan kecuaian (Shaky) daripada kelemahan sebenar (Weak)."
  ),
  reselectTargetBtn: c(
    "重新选择诊断目标",
    "Change Diagnostic Target",
    "診断ターゲットを再選択",
    "진단 목표 다시 선택",
    "Pilih Semula Sasaran Diagnosis"
  ),
  launcherHeading: (
    emoji: string,
    studentName: string,
    regionDisplayName: string,
    locale: LocaleCode
  ): string =>
    uiPick(
      locale,
      c(
        `选择诊断起点（当前受测学生：${emoji} ${studentName} · ${regionDisplayName} 课标）`,
        `Select Diagnostic Entry Topic (Active Student: ${emoji} ${studentName} · ${regionDisplayName})`,
        `診断開始ノードを選択（対象生徒：${emoji} ${studentName} ・ ${regionDisplayName} カリキュラム）`,
        `진단 시작 단원 선택 (현재 학생: ${emoji} ${studentName} · ${regionDisplayName} 교육과정)`,
        `Pilih Topik Permulaan Diagnosis (Pelajar Aktif: ${emoji} ${studentName} · Kurikulum ${regionDisplayName})`
      )
    ),
  selectTopicLabel: c(
    "任意微技能靶向溯源（包含上游全部先修链与跨科数学桥）：",
    "Select any micro-skill target (includes full upstream prerequisite chain & cross-subject bridges):",
    "任意のマイクロスキルを選択（上流の前提チェーンと教科横断ブリッジをすべて含む）：",
    "타깃 마이크로 스킬 선택 (상위 전체 선수 체인 및 교과 융합 수학 브리지 포함):",
    "Pilih mana-mana kemahiran mikro sasaran (merangkumi rantaian prasyarat huluan & jambatan rentas subjek):"
  ),
  startDiagnoseBtn: c(
    "立即启动自适应回溯诊断",
    "Launch Adaptive Backtracking Diagnosis",
    "遡及アダプティブ診断を今すぐ開始",
    "역추적 적응형 진단 지금 시작",
    "Mulakan Diagnosis Jejak Balik Sekarang"
  ),
  demoScriptsLabel: c(
    "🔥 推荐高光演示剧本（一键体验跨科溯源与先修剪枝）：",
    "🔥 Featured Demo Scenarios (One-click cross-subject backtracking & ancestor pruning):",
    "🔥 おすすめ体験シナリオ（ワンクリックで教科横断遡及と前提免除を体験）：",
    "🔥 추천 하이라이트 데모 시나리오 (교과 융합 역추적 및 선수 가지치기 원클릭 체험):",
    "🔥 Senario Demo Pilihan (Satu klik jejak balik rentas subjek & pemangkasan prasyarat):"
  ),
  demoOhmTitle: c(
    "⚡ 跨科回溯展示：物理欧姆定律并联电阻",
    "⚡ Cross-Subject Backtracking: Physics Ohm's Law & Parallel Resistors",
    "⚡ 教科横断遡及デモ：物理「オームの法則と並列合成抵抗」",
    "⚡ 교과 융합 역추적 데모: 물리 옴의 법칙과 병렬 합성저항",
    "⚡ Jejak Balik Rentas Subjek: Hukum Ohm Fizik & Perintang Selari"
  ),
  demoOhmDesc: c(
    "若连续答错物理并联电阻，观察系统如何自动回溯排查「串并联规律」与跨科数学「分式方程 1/x=1/a+1/b」！",
    "Miss parallel resistance twice and watch the engine trace back to Series/Parallel Circuits and cross-subject Math Rational Equations (1/x = 1/a + 1/b)!",
    "並列抵抗で連続不正解になると、物理「直並列回路」さらに数学「分数方程式 1/x=1/a+1/b」へ自動遡及する様子を確認できます！",
    "물리 병렬 저항을 연속 틀리면 '직병렬 회로 법칙'과 수학 '분수방정식 1/x=1/a+1/b'으로 자동 역추적하는 과정을 확인하세요!",
    "Jika tersilap perintang selari, lihat bagaimana sistem menjejak balik ke Litar Siri/Selari dan Persamaan Nisbah Matematik (1/x = 1/a + 1/b)!"
  ),
  demoQuadTitle: c(
    "📐 先修剪枝展示：二次函数抛物线顶点式",
    "📐 Ancestor Pruning Demo: Quadratic Parabola Vertex Form",
    "📐 前提一括免除デモ：二次関数と放物線の頂点形",
    "📐 선수 가지치기 데모: 이차함수 포물선 꼭짓점 표준형",
    "📐 Pemangkasan Prasyarat: Bentuk Verteks Parabola Kuadratik"
  ),
  demoQuadDesc: c(
    "连对 2 题直接豁免上游 12 个小初代数节点；答错则精准回溯配方法、完全平方与勾股根式！",
    "Get 2 right in a row to auto-exempt 12 upstream K-8 algebra nodes — or miss to pinpoint completing the square, factoring, or radicals!",
    "2問連続正解で上流の小中代数12ノードを一括免除！不正解なら平方完成・因数分解・平方根へ精密に遡及します。",
    "2문항 연속 정답 시 상위 초·중 대수 12개 노드를 즉시 면제하며, 오답 시 완전제곱식·인수분해·제곱근을 정밀 추적합니다!",
    "Jawab 2 betul berturut-turut untuk mengecualikan 12 nod algebra huluan — atau jejak balik penyempurnaan kuasa dua & punca kuasa!"
  ),
  howItWorksTitle: c(
    "诊断状态机如何运作？",
    "How Does the Diagnostic State Machine Work?",
    "診断ステートマシンの仕組み",
    "진단 상태 머신 작동 원리",
    "Bagaimana Mesin Keadaan Diagnosis Berfungsi?"
  ),
  rule1Title: c(
    "1. 祖先闭包剪枝（Ancestor Mastery Closure）",
    "1. Ancestor Mastery Closure (Auto-Pruning)",
    "1. 祖先閉包プルーニング（前提一括免除）",
    "1. 조상 폐포 가지치기 (Ancestor Mastery Closure)",
    "1. Penutupan Penguasaan Leluhur (Pemangkasan Automatik)"
  ),
  rule1Desc: c(
    "目标节点连续答对标准题 + 拔高变式题，系统依据 DAG 传递性自动将全部未测上游先修标记为「先修豁免」，省去低年级重复刷题。",
    "Solve a standard item + challenge variant consecutively and DAG transitivity marks all untested upstream prerequisites as Exempt — saving redundant lower-grade drills.",
    "目標ノードで標準問題＋発展類題に連続正解すると、DAG の推移律により未診断の上流前提をすべて「前提免除」とし、低学年の重複演習を省きます。",
    "목표 노드에서 표준 문항과 심화 변형 문항을 연속 맞히면 DAG 추이성에 따라 미진단 상위 선수 단원을 모두 '선수 면제' 처리하여 불필요한 저학년 반복 풀이를 줄입니다.",
    "Jawab soalan standard dan cabaran secara berturut-turut untuk menandakan semua prasyarat huluan sebagai Dikecualikan melalui transitiviti DAG."
  ),
  rule2Title: c(
    "2. 区分「粗心滑档 Shaky」与「真薄弱 Weak」",
    "2. Separating Careless Slips (Shaky) from True Gaps (Weak)",
    "2. 「ケアレスミス（Shaky）」と「本質的弱点（Weak）」の分離",
    "2. '단순 실수(Shaky)'와 '개념 취약(Weak)' 정밀 구분",
    "2. Membezakan Kecuaian (Shaky) daripada Kelemahan Sebenar (Weak)"
  ),
  rule2Desc: c(
    "首题答错不会盲目退回低年级，而是立刻出一道同节点基础辨析题：复测答对判为「粗心滑档」，复测仍错才触发先修回溯！",
    "A first miss doesn't blindly drop you to lower grades — it serves a stepped-down basic check on the same node: pass = Shaky, fail again = prerequisite backtracking!",
    "初回不正解でも即座に低学年へ戻さず、同一ノードの基礎確認問題を出題。再確認で正解なら「要定着（Shaky）」、連続不正解で初めて前提遡及を発動します！",
    "첫 문항을 틀려도 무작정 하위 학년으로 내려가지 않고 동일 노드의 기초 확인 문항을 출제합니다. 재검증 정답 시 '실수(Shaky)', 재차 오답 시에만 선수 역추적을 실행합니다!",
    "Kesilapan pertama tidak terus turun ke gred rendah — sistem memberi soalan asas pada nod sama: lulus = Shaky, gagal lagi = jejak balik prasyarat!"
  ),
  rule3Title: c(
    "3. 强先修与跨科数学桥优先回溯 + 自动入错题本",
    "3. Hard Prereq & Cross-Subject Priority + Auto FSRS Logging",
    "3. 必須前提・教科横断ブリッジ優先遡及 ＋ FSRS 自動登録",
    "3. 필수 선수·교과 브리지 우선 역추적 + FSRS 오답노트 자동 수록",
    "3. Keutamaan Prasyarat Keras & Jambatan Subjek + Log Automatik FSRS"
  ),
  rule3Desc: c(
    "任何错题连同识别出的「认知迷思标签」实时写入 SQLite FSRS 错题账本，按遗忘曲线安排孪生变式清零。",
    "Every missed item and its detected misconception tag are persisted immediately to the SQLite FSRS ledger for spaced twin-variant clearance.",
    "すべての誤答と検出された「誤概念タグ」は即座に SQLite FSRS 誤答台帳へ記録され、忘却曲線に沿って双子類題でクリアします。",
    "모든 오답과 감지된 '오개념 태그'는 즉시 SQLite FSRS 오답 장부에 기록되어 망각곡선에 따라 쌍둥이 변형 문제로 클리어됩니다.",
    "Setiap jawapan salah bersama tag salah konsep direkodkan terus ke lejar SQLite FSRS untuk pembersihan soalan kembar mengikut jadual ulang kaji."
  ),
  engineLiveBanner: (
    step: number,
    maxSteps: number,
    diffLabel: string,
    locale: LocaleCode
  ): string =>
    uiPick(
      locale,
      c(
        `🧭 诊断引擎实时透视（第 ${step} / ${maxSteps} 步 · 难度 ${diffLabel}）`,
        `🧭 Live Diagnostic Trace (Step ${step} / ${maxSteps} · ${diffLabel})`,
        `🧭 診断エンジン実況トレース（ステップ ${step} / ${maxSteps} ・ 難易度：${diffLabel}）`,
        `🧭 진단 엔진 실시간 트레이스 (${step} / ${maxSteps}단계 · 난이도 ${diffLabel})`,
        `🧭 Jejak Diagnosis Langsung (Langkah ${step} / ${maxSteps} · Tahap ${diffLabel})`
      )
    ),
  currentSkillPrefix: c(
    "当前考察微技能：",
    "Active Micro-Skill: ",
    "現在診断中のマイクロスキル：",
    "현재 평가 마이크로 스킬: ",
    "Kemahiran Mikro Semasa: "
  ),
  unitHint: (unit: string, locale: LocaleCode): string =>
    uiPick(
      locale,
      c(
        `单位：${unit}（只需填数值或代数式，支持分数如 3/4、多根逗号分隔）`,
        `Unit: ${unit} (enter number or expression only; fractions like 3/4 and comma-separated roots supported)`,
        `単位：${unit}（数値または式のみ入力。3/4 のような分数やカンマ区切りの複数解に対応）`,
        `단위: ${unit} (숫자나 식만 입력, 3/4 같은 분수 및 쉼표 구분 복수해 지원)`,
        `Unit: ${unit} (masukkan nilai atau ungkapan sahaja; pecahan seperti 3/4 dan jawapan dipisah koma disokong)`
      )
    ),
  answerPlaceholder: c(
    "输入精确数值、分数（如 3/5）或代数式...",
    "Enter exact value, fraction (e.g. 3/5), or algebraic expression...",
    "正確な数値、分数（例: 3/5）、または代数式を入力...",
    "정확한 수치, 분수(예: 3/5) 또는 대수식을 입력하세요...",
    "Masukkan nilai tepat, pecahan (cth. 3/5), atau ungkapan algebra..."
  ),
  submitAnswerBtn: c(
    "提交判分",
    "Submit Answer",
    "解答を送信",
    "답안 제출",
    "Hantar Jawapan"
  ),
  revealScaffoldBtn: (nextIdx: number, total: number, locale: LocaleCode): string =>
    uiPick(
      locale,
      c(
        `卡壳了？展开第 ${nextIdx} 步分步脚手架引导（共 ${total} 步）`,
        `Stuck? Reveal Step ${nextIdx} of ${total} Guided Scaffold`,
        `ヒントが必要ですか？ステップ ${nextIdx} / ${total} の段階的スキャフォールドを表示`,
        `막히셨나요? ${total}단계 중 ${nextIdx}단계 디딤돌 힌트 펼치기`,
        `Tersangkut? Buka Langkah Bimbingan ${nextIdx} daripada ${total}`
      )
    ),
  scaffoldStepTitle: (idx: number, prompt: string, locale: LocaleCode): string =>
    uiPick(
      locale,
      c(
        `脚手架第 ${idx} 步：${prompt}`,
        `Scaffold Step ${idx}: ${prompt}`,
        `スキャフォールド Step ${idx}：${prompt}`,
        `디딤돌 ${idx}단계: ${prompt}`,
        `Langkah Bimbingan ${idx}: ${prompt}`
      )
    ),
  scaffoldHintPrefix: c(
    "线索提示：",
    "Clue: ",
    "ヒント：",
    "단서 힌트: ",
    "Petunjuk: "
  ),
  scaffoldRefPrefix: c(
    "中间参考值：",
    "Intermediate check: ",
    "中間確認値：",
    "중간 확인값: ",
    "Nilai rujukan: "
  ),
  feedbackCorrect: c(
    "回答正确！",
    "Correct!",
    "正解です！",
    "정답입니다!",
    "Jawapan Betul!"
  ),
  feedbackWrong: (expected: string, locale: LocaleCode): string =>
    uiPick(
      locale,
      c(
        `未命中（标准答案：${expected}）· 已自动收录至 FSRS 错题本`,
        `Not quite (Expected: ${expected}) · Logged to FSRS Wrong-Question Book`,
        `不正解（正解：${expected}）・ FSRS 誤答ノートに自動記録しました`,
        `오답 (정답: ${expected}) · FSRS 오답노트에 자동 수록됨`,
        `Kurang tepat (Jawapan: ${expected}) · Direkodkan ke Buku Salah FSRS`
      )
    ),
  prunedBannerTitle: c(
    "祖先闭包剪枝生效：",
    "Ancestor Closure Pruning Applied: ",
    "祖先閉包プルーニング適用：",
    "조상 폐포 가지치기 적용: ",
    "Pemangkasan Leluhur Diaktifkan: "
  ),
  prunedBannerBody: (count: number, locale: LocaleCode): string =>
    uiPick(
      locale,
      c(
        `已自动确认并豁免上游 ${count} 个先修节点！`,
        `Automatically verified and exempted ${count} upstream prerequisite node(s)!`,
        `上流の前提ノード ${count} 件を自動確認・免除しました！`,
        `상위 선수 노드 ${count}개를 자동 확인 및 면제했습니다!`,
        `${count} nod prasyarat huluan telah disahkan dan dikecualikan secara automatik!`
      )
    ),
  pushedBannerTitle: c(
    "触发 DAG 先修/跨科回溯：",
    "DAG Prerequisite / Cross-Subject Backtracking Triggered: ",
    "DAG 前提・教科横断遡及を発動：",
    "DAG 선수/교과 융합 역추적 발동: ",
    "Jejak Balik Prasyarat / Rentas Subjek DAG Dicetuskan: "
  ),
  pushedBannerBody: (count: number, locale: LocaleCode): string =>
    uiPick(
      locale,
      c(
        `已将 ${count} 个直接先修地基压入诊断栈，下一步定位真正病灶！`,
        `Pushed ${count} direct prerequisite foundation(s) onto the diagnostic stack to pinpoint the root cause!`,
        `直接の前提基盤 ${count} 件を診断スタックに追加しました。次ステップで根本原因を特定します！`,
        `직접 선수 기반 ${count}개를 진단 스택에 추가하여 다음 단계에서 근본 원인을 추적합니다!`,
        `Menolak ${count} prasyarat huluan terus ke tindanan diagnosis untuk mengenal pasti punca sebenar!`
      )
    ),
  explanationPrefix: c(
    "解析：",
    "Explanation: ",
    "解説：",
    "해설: ",
    "Penjelasan: "
  ),
  generateReportBtn: c(
    "生成完整根因诊断报告",
    "View Full Root-Cause Report",
    "完全な根本原因診断レポートを表示",
    "전체 근본 원인 진단 리포트 생성",
    "Jana Laporan Diagnosis Punca Lengkap"
  ),
  nextDiagNodeBtn: c(
    "进入下一诊断节点",
    "Next Diagnostic Step",
    "次の診断ステップへ",
    "다음 진단 단계로 이동",
    "Langkah Diagnosis Seterusnya"
  ),
  askTutorReviewBtn: c(
    "让右侧苏格拉底导师带我复盘",
    "Review Step-by-Step with Socratic Tutor",
    "右側のソクラテス式 AI チューターと振り返る",
    "우측 소크라테스 AI 튜터와 단계별 복기하기",
    "Ulang Kaji Langkah demi Langkah bersama Tutor Sokratik"
  ),
  wrongAnswerAutoPrompt: (ans: string, locale: LocaleCode): string =>
    uiPick(
      locale,
      c(
        `我刚才填了 "${ans}" 答错了，请用苏格拉底提问法一步步带我理清思路！`,
        `I just entered "${ans}" and missed it — please guide me step by step using Socratic questions!`,
        `先ほど「${ans}」と答えて間違えました。ソクラテス式の質問で一歩ずつ考え方を導いてください！`,
        `방금 "${ans}"라고 입력해 틀렸어요. 소크라테스식 질문법으로 한 단계씩 풀이 방향을 이끌어 주세요!`,
        `Saya baru menjawab "${ans}" dan tersilap — sila bimbing saya langkah demi langkah secara Sokratik!`
      )
    ),
  tutorTitle: c(
    "苏格拉底图谱锚定 AI 导师",
    "KG-Grounded Socratic AI Tutor",
    "知識グラフ連動ソクラテス式 AI チューター",
    "지식그래프 기반 소크라테스 AI 튜터",
    "Tutor AI Sokratik Berpaksikan Graf Ilmu"
  ),
  tutorSubtitle: (standardCode: string, locale: LocaleCode): string =>
    uiPick(
      locale,
      c(
        `锚定 ${standardCode} · 绝不直接剧透答案`,
        `Grounded in ${standardCode} · Guides without spoiling answers`,
        `${standardCode} 準拠 ・ 答えを直接明かさず思考を誘導`,
        `${standardCode} 기준 연동 · 정답 스포일러 없이 사고 유도`,
        `Berpaksikan ${standardCode} · Membimbing tanpa membocorkan jawapan`
      )
    ),
  tutorWelcomeIntro: (regionDisplayName: string, locale: LocaleCode): string =>
    uiPick(
      locale,
      c(
        `👋 你好！我已挂载当前节点的先修知识链、${regionDisplayName} 官方课标要求与高频迷思库。`,
        `👋 Hi! I'm grounded in this node's prerequisite chain, ${regionDisplayName} curriculum standards, and common misconception library.`,
        `👋 こんにちは！現在のノードの前提知識チェーン、${regionDisplayName} カリキュラム基準、および頻出誤概念データベースと連携しています。`,
        `👋 안녕하세요! 현재 노드의 선수 지식 체인, ${regionDisplayName} 공식 교육과정 성취기준 및 빈출 오개념 라이브러리가 연결되어 있습니다.`,
        `👋 Hai! Saya dipautkan dengan rantaian prasyarat nod ini, piawaian kurikulum ${regionDisplayName}, serta pustaka salah konsep.`
      )
    ),
  tutorWelcomeHint: c(
    "点击下方快捷提问，或输入你的中间算式，我会用启发式提问一步步引导你自己推导出答案：",
    "Tap a quick prompt below or share your intermediate steps — I'll ask guiding questions so you derive the solution yourself:",
    "下のクイック質問をタップするか途中式を入力してください。ヒントとなる問いかけで自力解答までサポートします：",
    "아래 빠른 질문을 누르거나 중간 풀이식을 입력해 보세요. 스스로 답을 도출하도록 단계별 질문으로 안내합니다:",
    "Klik soalan pantas di bawah atau taip langkah pengiraan anda — saya akan membimbing anda mencari jawapan sendiri:"
  ),
  tutorQuickPrompts: (locale: LocaleCode): string[] => [
    uiPick(
      locale,
      c(
        "这道题第一步该从哪里切入？",
        "Where should I start on Step 1?",
        "この問題の最初のステップはどこから手をつければいい？",
        "이 문제의 첫 단계는 어디서부터 시작해야 하나요?",
        "Dari mana saya patut mulakan langkah pertama?"
      )
    ),
    uiPick(
      locale,
      c(
        "本题最容易踩的陷阱是什么？",
        "What is the most common pitfall here?",
        "この問題で一番陥りやすい罠は何ですか？",
        "이 문제에서 가장 빠지기 쉬운 함정은 무엇인가요?",
        "Apakah perangkap paling kerap dalam soalan ini?"
      )
    ),
    uiPick(
      locale,
      c(
        "需要用到哪个上游先修公式？",
        "Which upstream prerequisite formula applies here?",
        "どの上流前提の公式を使えばよいですか？",
        "어떤 상위 선수 공식을 활용해야 하나요?",
        "Formula prasyarat huluan manakah yang perlu digunakan?"
      )
    ),
  ],
  tutorThinking: c(
    "苏格拉底导师正在结合图谱先修链推演引导步骤...",
    "Socratic Tutor is reasoning over the prerequisite graph...",
    "ソクラテス式チューターが前提グラフを参照してヒントを推論中...",
    "소크라테스 튜터가 선수 지식그래프를 바탕으로 유도 단계를 추론 중...",
    "Tutor Sokratik sedang menaakul langkah bimbingan melalui graf prasyarat..."
  ),
  tutorInputPlaceholder: c(
    "输入你的中间步骤或疑问...",
    "Type your intermediate step or question...",
    "途中式や疑問点を入力してください...",
    "중간 풀이 과정이나 궁금한 점을 입력하세요...",
    "Taip langkah pertengahan atau soalan anda..."
  ),
  reportCompletedBadge: c(
    "✅ 诊断完成 · 已同步写入 SQLite 知识状态向量与 FSRS 错题账本",
    "✅ Diagnosis Complete · Synced to SQLite Mastery Vector & FSRS Ledger",
    "✅ 診断完了 ・ SQLite 習得状態ベクトルと FSRS 誤答台帳へ同期済み",
    "✅ 진단 완료 · SQLite 지식 상태 벡터 및 FSRS 오답 장부 동기화 완료",
    "✅ Diagnosis Selesai · Disegerakkan ke Vektor Penguasaan SQLite & Lejar FSRS"
  ),
  reportTitle: (answeredCount: number, accuracyPct: number, locale: LocaleCode): string =>
    uiPick(
      locale,
      c(
        `DAG 靶向溯源诊断报告（共作答 ${answeredCount} 题 · 正确率 ${accuracyPct}%）`,
        `DAG Root-Cause Diagnostic Report (${answeredCount} Items Answered · ${accuracyPct}% Accuracy)`,
        `DAG 遡及診断レポート（全 ${answeredCount} 問解答 ・ 正答率 ${accuracyPct}%）`,
        `DAG 역추적 진단 리포트 (총 ${answeredCount}문항 응답 · 정답률 ${accuracyPct}%)`,
        `Laporan Diagnosis Punca DAG (${answeredCount} Soalan Dijawab · Ketepatan ${accuracyPct}%)`
      )
    ),
  reportGoWrongBook: c(
    "前往 FSRS 错题本练孪生变式 →",
    "Practice Twin Variants in FSRS Book →",
    "FSRS 誤答ノートで双子類題を演習 →",
    "FSRS 오답노트에서 쌍둥이 문제 연습 →",
    "Latih Soalan Kembar dalam Buku FSRS →"
  ),
  reportGoExplore: c(
    "在星图中查看掌握度染色",
    "View Mastery Coloring on DAG Map",
    "知識グラフで習得度カラーを確認",
    "지식그래프에서 숙달도 색상 보기",
    "Lihat Pewarnaan Penguasaan pada Peta DAG"
  ),
  reportWeakRootsTitle: (count: number, locale: LocaleCode): string =>
    uiPick(
      locale,
      c(
        `🎯 锁定的源头病灶根因（Weak Roots: ${count}）`,
        `🎯 Pinpointed Root-Cause Gaps (Weak Roots: ${count})`,
        `🎯 特定された根本原因ボトルネック（Weak Roots: ${count}）`,
        `🎯 특정된 근본 원인 결손 (Weak Roots: ${count})`,
        `🎯 Punca Kelemahan Akar Dikenal Pasti (Weak Roots: ${count})`
      )
    ),
  reportWeakRootsEmpty: c(
    "无深层先修断层！",
    "No deep prerequisite gaps detected!",
    "深層の前提欠損はありません！",
    "심층 선수 결손이 없습니다!",
    "Tiada jurang prasyarat mendalam dikesan!"
  ),
  reportShakyTitle: (count: number, locale: LocaleCode): string =>
    uiPick(
      locale,
      c(
        `⚠️ 粗心滑档待稳（Shaky: ${count}）`,
        `⚠️ Careless Slips to Stabilize (Shaky: ${count})`,
        `⚠️ ケアレスミス・要定着（Shaky: ${count}）`,
        `⚠️ 실수 흔들림 보강 필요 (Shaky: ${count})`,
        `⚠️ Kecuaian Perlu Dikukuhkan (Shaky: ${count})`
      )
    ),
  reportShakyEmpty: c(
    "本次未出现粗心滑档节点。",
    "No shaky nodes recorded in this session.",
    "今回のセッションでケアレスミスノードはありません。",
    "이번 진단에서 실수 흔들림 노드가 없습니다.",
    "Tiada nod tidak stabil direkodkan dalam sesi ini."
  ),
  reportMasteredTitle: (
    masteredCount: number,
    inferredCount: number,
    locale: LocaleCode
  ): string =>
    uiPick(
      locale,
      c(
        `✨ 实测掌握 (${masteredCount}) + 自动剪枝豁免 (${inferredCount})`,
        `✨ Verified Mastered (${masteredCount}) + Auto-Pruned Exempt (${inferredCount})`,
        `✨ 実測習得 (${masteredCount}) ＋ 自動免除 (${inferredCount})`,
        `✨ 실측 마스터 (${masteredCount}) + 자동 가지치기 면제 (${inferredCount})`,
        `✨ Dikuasai (${masteredCount}) + Dikecualikan Automatik (${inferredCount})`
      )
    ),
  reportSavedPrefix: c(
    "通过连对确认与传递闭包，共为你节省了",
    "Streak verification and transitive closure saved you",
    "連続正解確認と推移閉包により、低学年の冗長な基礎テスト",
    "연속 정답 확인과 추이 폐포를 통해 불필요한 기초 확인 문항",
    "Pengesahan berturut-turut dan penutupan transitif menjimatkan"
  ),
  reportSavedSuffix: c(
    "道低年级冗余基础测试题！",
    "redundant lower-grade basic check questions!",
    "問分を節約しました！",
    "문항을 절약했습니다!",
    "soalan ujian asas gred rendah yang berulang!"
  ),
  remedialPathTitle: c(
    "🗺️ 个性化由浅入深拓扑修复路径（Bottom-Up Remedial Sequence）：",
    "🗺️ Personalized Bottom-Up Topological Remediation Sequence:",
    "🗺️ 個別最適化ボトムアップ修復シーケンス（前提から順に対策）：",
    "🗺️ 맞춤형 상향식 위상 복구 경로 (Bottom-Up Remedial Sequence):",
    "🗺️ Urutan Pemulihan Topologi Dari Asas ke Atas (Bottom-Up):"
  ),
  remedialRootSuffix: c(
    " (先补此根因)",
    " (Fix root cause first)",
    "（まずこの根本原因を補強）",
    " (이 근본 원인부터 보강)",
    " (Baiki punca ini dahulu)"
  ),
};
