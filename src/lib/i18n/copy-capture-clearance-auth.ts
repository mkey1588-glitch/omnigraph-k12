import type { LocaleCode, RegionCode, SubjectId } from "@/types/taxonomy";
import { c, findSimplifiedOnlyChars, toTraditionalChinese, uiPick, type UiCopy } from "./index";

export interface CaptureSamplePreset {
  label: string;
  subject: SubjectId;
  stem: string;
  wrongAns: string;
}

const CAPTURE_SAMPLE_PRESETS_RAW: Array<{
  subject: SubjectId;
  label: UiCopy;
  stem: Record<LocaleCode, string>;
  wrongAns: Record<LocaleCode, string>;
}> = [
  {
    subject: "physics",
    label: c(
      "⚡ 物理并联欧姆（含姓名学校自动脱敏）",
      "⚡ Parallel Ohm's Law (with PII Redaction Demo)",
      "⚡ 物理・並列オームの法則（氏名・学校PII自動マスク）",
      "⚡ 물리 병렬 옴의 법칙 (실명·학교 PII 자동 마스킹)",
      "⚡ Hukum Ohm Selari (Demo Penyahpengenalan PII)",
      "⚡ 物理並聯歐姆（含姓名學校自動去識別化）"
    ),
    stem: {
      "zh-CN":
        "深圳南山实验中学初三，我是林小宇（电话 13812345678，邮箱 leo.lin@school.cn）：电阻 R1 = 6 Ω 与 R2 = 12 Ω 并联在 12V 电源两端，用欧姆定律求并联等效总电阻 R 是多少 Ω？",
      "zh-TW":
        "南山國際學校九年級，我是林小宇（電話 0912-345-678，信箱 leo.lin@school.edu.tw）：電阻 R1 = 6 Ω 與 R2 = 12 Ω 並聯在 12V 電源兩端，由歐姆定律（Ohm's Law, 1/R）求並聯等效總電阻 R 是多少 Ω？",
      en: "Student Name: Alex Chen, Nanshan High School (phone +1-415-555-0192, email alex.chen@school.edu): Resistors R1 = 6 Ω and R2 = 12 Ω are connected in a parallel circuit across a 12V source. Using Ohm's law (1/R), find the equivalent resistance R in Ω.",
      ja: "南山中学校3年、私は佐藤健太です（電話 090-1234-5678、メール kenta.sato@school.jp）。抵抗 R1 = 6 Ω と R2 = 12 Ω を 12V 電源に並列接続したとき、オームの法則（Ohm's law, 1/R）を用いて合成抵抗 R は何 Ω になりますか？",
      ko: "남산중학교 3학년 저는 김민준입니다(연락처 010-1234-5678, 이메일 minjun.kim@school.kr): 저항 R1 = 6 Ω과 R2 = 12 Ω이 12V 전원에 병렬 연결되어 있을 때, 옴의 법칙(Ohm's law, 1/R)으로 구한 합성 등가저항 R의 값은 몇 Ω인가요?",
      ms: "Nama pelajar: Amir Razak, SMK Nanshan (telefon 012-345-6789, e-mel amir.razak@school.edu.my): Perintang R1 = 6 Ω dan R2 = 12 Ω disambung dalam litar selari pada bekalan 12V. Gunakan Hukum Ohm (ohm, 1/R) untuk mencari rintangan setara R dalam Ω.",
    },
    wrongAns: {
      "zh-CN": "18",
      "zh-TW": "18",
      en: "18",
      ja: "18",
      ko: "18",
      ms: "18",
    },
  },
  {
    subject: "chemistry",
    label: c(
      "🧪 化学物质的量浓度稀释（单位换算陷阱）",
      "🧪 Molarity & Solution Dilution (Unit Trap)",
      "🧪 化学・モル濃度と溶液希釈（単位換算の罠）",
      "🧪 화학 몰농도 및 용액 희석 (단위 환산 함정)",
      "🧪 Kemolaran & Pencairan Larutan (Perangkap Unit)",
      "🧪 化學莫耳濃度稀釋（單位換算陷阱）"
    ),
    stem: {
      "zh-CN":
        "实验室配制溶液：将 250 mL 物质的量浓度为 2 mol/L 的 NaCl 溶液加水稀释至 500 mL，求溶质的物质的量 n 是多少 mol？",
      "zh-TW":
        "實驗室配製溶液：將 250 mL 莫耳濃度（molarity）為 2 mol/L 的 NaCl 溶液加水稀釋（dilution, c1V1）至 500 mL，求溶質的莫耳數 n 是多少 mol？",
      en: "Lab dilution problem: 250 mL of a 2 mol/L NaCl solution (molarity) is diluted with water to 500 mL (c1V1 = c2V2). How many moles (mol) of NaCl solute n are present?",
      ja: "溶液の希釈（molarity / dilution）：モル濃度 2 mol/L の NaCl 水溶液 250 mL に水を加えて 500 mL に希釈（c1V1）したとき、溶質 NaCl の物質量 n は何 mol ですか？",
      ko: "용액 희석 실험(molarity & dilution): 몰농도 2 mol/L인 NaCl 수용액 250 mL에 물을 넣어 500 mL로 희석(c1V1)할 때, 용질 NaCl의 몰수 n(mol)은 몇 mol인가요?",
      ms: "Pencairan larutan makmal (molarity & dilution): 250 mL larutan NaCl berkepekatan 2 mol/L dicairkan dengan air sehingga 500 mL (c1V1). Berapakah bilangan mol zat terlarut n?",
    },
    wrongAns: {
      "zh-CN": "500",
      "zh-TW": "500",
      en: "500",
      ja: "500",
      ko: "500",
      ms: "500",
    },
  },
  {
    subject: "computing",
    label: c(
      "💻 信息学二分查找与复杂度",
      "💻 Binary Search & Worst-Case Steps",
      "💻 情報・二分探索と最悪比較回数",
      "💻 정보 이진 탐색 및 최악 비교 횟수",
      "💻 Carian Binari & Kerumitan Masa",
      "💻 資訊科技二分搜尋與複雜度"
    ),
    stem: {
      "zh-CN":
        "在长度为 n = 1024 的升序有序数组中执行二分查找（Binary Search），最坏情况下折半查找的时间复杂度与最大比较次数是多少？",
      "zh-TW":
        "在長度為 n = 1024 的升冪有序陣列（array）中執行二分搜尋（Binary Search, mid），最壞情況下的最大比較次數是多少？",
      en: "When running binary search (mid index) on a sorted array of length n = 1024, what is the worst-case maximum number of comparisons?",
      ja: "要素数 n = 1024 の昇順ソート済み配列（array）に対して二分探索（binary search, mid）を行うとき、最悪ケースでの最大比較回数は何回ですか？",
      ko: "길이가 n = 1024인 오름차순 정렬 배열(array)에서 이진 탐색(binary search, mid)을 수행할 때, 최악의 경우 최대 비교 횟수는 몇 번인가요?",
      ms: "Apabila menjalankan carian binari (binary search, mid) pada tatasusunan terisih (array) sepanjang n = 1024, berapakah bilangan perbandingan maksimum dalam kes terburuk?",
    },
    wrongAns: {
      "zh-CN": "512",
      "zh-TW": "512",
      en: "512",
      ja: "512",
      ko: "512",
      ms: "512",
    },
  },
  {
    subject: "english",
    label: c(
      "🔤 英语定语从句（地点先行词作宾语）",
      "🔤 Relative Clauses (Place Noun as Object)",
      "🔤 英語・関係代名詞と関係副詞の識別",
      "🔤 영어 관계대명사 vs 관계부사 식별",
      "🔤 Klausa Relatif Bahasa Inggeris (which / where)",
      "🔤 英語關係子句（地點先行詞作受詞）"
    ),
    stem: {
      "zh-CN":
        "语法填空错题：This is the science museum ______ we visited with our teacher last Friday. (which / where)",
      "zh-TW":
        "關係子句（relative clause）語法題：This is the science museum ______ we visited with our teacher last Friday. (which / where)",
      en: "Relative clause grammar check: This is the science museum ______ we visited with our teacher last Friday. (which / where)",
      ja: "関係詞節（relative clause）の英文法問題：空欄に入る適切な語はどちらですか？ This is the science museum ______ we visited with our teacher last Friday. (which / where)",
      ko: "관계사절(relative clause) 영문법 문제: 다음 빈칸에 알맞은 관계사는 무엇인가요? This is the science museum ______ we visited with our teacher last Friday. (which / where)",
      ms: "Soalan tatabahasa klausa relatif (relative clause): This is the science museum ______ we visited with our teacher last Friday. (which / where)",
    },
    wrongAns: {
      "zh-CN": "where",
      "zh-TW": "where",
      en: "where",
      ja: "where",
      ko: "where",
      ms: "where",
    },
  },
  {
    subject: "literacy",
    label: c(
      "📚 思辨阅读：相关性与因果倒置谬误",
      "📚 Critical Literacy: Correlation vs. Causation Fallacy",
      "📚 論理読解：相関と因果の混同（論理的誤謬）",
      "📚 비판적 독해: 상관관계와 인과관계 혼동 오류",
      "📚 Bacaan Kritis: Falasi Korelasi vs Sebab-Akibat",
      "📚 思辨閱讀：相關性與因果倒置謬誤"
    ),
    stem: {
      "zh-CN":
        "阅读论证分析：调查显示『常去图书馆的学生近视率更高，因此去图书馆会导致近视』，指出该推论犯了哪类逻辑谬误？",
      "zh-TW":
        "閱讀論證分析：調查顯示「常去圖書館的學生近視率更高，因此去圖書館會導致近視」，指出該推論犯了哪類邏輯謬誤（fallacy）？",
      en: "Critical reading argument analysis: A survey shows that students who visit the library frequently have higher myopia rates, concluding that libraries cause myopia. Which logical fallacy (correlation vs. causation or survivorship) does this commit?",
      ja: "批判的読解・論理的誤謬（fallacy）の分析：「図書館によく通う生徒ほど近視率が高い。したがって図書館に行くと近視になる」という推論には、どのような論理的誤謬が含まれていますか？",
      ko: "비판적 독해 논리적 오류(fallacy) 분석: '도서관에 자주 가는 학생일수록 근시율이 높으므로 도서관이 근시를 유발한다'라는 추론이 범한 논리적 오류는 무엇인가요?",
      ms: "Analisis hujah bacaan kritis (fallacy): Tinjauan mendapati pelajar yang kerap ke perpustakaan mempunyai kadar rabun lebih tinggi, lalu menyimpulkan perpustakaan menyebabkan rabun. Apakah falasi logik dalam kesimpulan ini?",
    },
    wrongAns: {
      "zh-CN": "数据造假",
      "zh-TW": "資料造假",
      en: "Data fabrication",
      ja: "データ捏造",
      ko: "데이터 조작",
      ms: "Pemalsuan data",
    },
  },
];

export function getCaptureSamplePresets(locale: LocaleCode): CaptureSamplePreset[] {
  return CAPTURE_SAMPLE_PRESETS_RAW.map((item) => ({
    label: uiPick(locale, item.label),
    subject: item.subject,
    stem:
      locale === "zh-TW"
        ? toTraditionalChinese(item.stem["zh-TW"])
        : item.stem[locale] ?? item.stem.en,
    wrongAns:
      locale === "zh-TW"
        ? toTraditionalChinese(item.wrongAns["zh-TW"])
        : item.wrongAns[locale] ?? item.wrongAns.en,
  }));
}

const PII_SANDBOX_SAMPLE_BY_LOCALE: Record<LocaleCode, string> = {
  "zh-CN":
    "老师您好，深圳南山实验中学初三，我是林小宇（手机 13812345678，邮箱 leo.lin@school.cn），请问 1/R = 1/6 + 1/12 为什么不能直接把分母相加？",
  "zh-TW":
    "老師您好，南山國際學校九年級，我是林小宇（手機 0912-345-678，信箱 leo.lin@school.edu.tw），請問 1/R = 1/6 + 1/12 為什麼不能直接把分母相加？",
  en: "Hello teacher, Student Name: Leo Lin, Nanshan High School (mobile +1-415-555-0192, email leo.lin@school.edu). Why can't we add the denominators directly in 1/R = 1/6 + 1/12?",
  ja: "先生こんにちは、南山中学校の私は佐藤健太です（電話 090-1234-5678、メール kenta.sato@school.jp）。1/R = 1/6 + 1/12 で分母をそのまま足してはいけない理由を教えてください。",
  ko: "선생님 안녕하세요, 남산중학교에 다니는 저는 김민준입니다(휴대폰 010-1234-5678, 이메일 minjun.kim@school.kr). 1/R = 1/6 + 1/12에서 왜 분모를 바로 더하면 안 되나요?",
  ms: "Helo cikgu, Nama pelajar: Amir Razak, SMK Nanshan (telefon 012-345-6789, e-mel amir.razak@school.edu.my). Mengapakah kita tidak boleh menambah penyebut secara terus dalam 1/R = 1/6 + 1/12?",
};

export function getPiiSandboxSample(locale: LocaleCode): string {
  if (locale === "zh-TW") {
    return toTraditionalChinese(PII_SANDBOX_SAMPLE_BY_LOCALE["zh-TW"]);
  }
  return PII_SANDBOX_SAMPLE_BY_LOCALE[locale] ?? PII_SANDBOX_SAMPLE_BY_LOCALE.en;
}

const LEGACY_PENDING_ANSWERS = new Set([
  "待订正作答",
  "待訂正作答",
  "待订正",
  "待訂正",
  "未留存原误答",
  "未留存原誤答",
  "未作答",
]);

export function localizeWrongUserAnswer(rawAns: string, locale: LocaleCode): string {
  const trimmed = (rawAns ?? "").trim();
  if (!trimmed || LEGACY_PENDING_ANSWERS.has(trimmed)) {
    return uiPick(
      locale,
      c(
        "待订正作答",
        "Pending correction",
        "未解答（要復習）",
        "미응답 (복습 대기)",
        "Belum dijawab (perlu semakan)",
        "待訂正作答"
      )
    );
  }
  if (trimmed === "__AGAIN__") {
    return uiPick(
      locale,
      c(
        "重排复习 (Again)",
        "Marked Again",
        "再学習 (Again)",
        "다시 학습 (Again)",
        "Ulang semula (Again)",
        "重排複習 (Again)"
      )
    );
  }
  if (trimmed === "数据造假" || trimmed === "資料造假" || trimmed === "數據造假") {
    return uiPick(
      locale,
      c(
        "数据造假",
        "Data fabrication",
        "データ捏造",
        "데이터 조작",
        "Pemalsuan data",
        "資料造假"
      )
    );
  }
  if (locale === "zh-CN") return trimmed;
  if (locale === "zh-TW") return toTraditionalChinese(trimmed);
  if (
    (locale === "en" || locale === "ms" || locale === "ko") &&
    /[\u3400-\u9FFF]/.test(trimmed)
  ) {
    return uiPick(
      locale,
      c(
        trimmed,
        "Recorded incorrect attempt",
        "記録済み誤答",
        "기록된 오답 시도",
        "Cubaan salah direkodkan"
      )
    );
  }
  if (locale === "ja" && findSimplifiedOnlyChars(trimmed).length > 0) {
    return "記録済み誤答";
  }
  return trimmed;
}

export const WRONG_BOOK_COPY = {
  loading: c(
    "正在加载 FSRS 间隔重复错题账本…",
    "Loading FSRS Spaced-Repetition Wrong-Question Ledger…",
    "FSRS 間隔反復・誤答ノートを読み込み中…",
    "FSRS 간격 반복 오답 노트를 불러오는 중…",
    "Memuatkan Buku Kesilapan Ulangan Berjarak FSRS…",
    "正在載入 FSRS 間隔重複錯題帳本…"
  ),
  headerTitle: (studentLabel: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `FSRS 智能错题本 & 防刷穿孪生变式清零台（${studentLabel}）`,
        `FSRS Smart Wrong-Book & Twin-Variant Clearance (${studentLabel})`,
        `FSRS スマート誤答ノート＆ペア類題クリア台（${studentLabel}）`,
        `FSRS 스마트 오답 노트 & 쌍둥이 변형문제 클리어 (${studentLabel})`,
        `Buku Kesilapan Pintar FSRS & Arena Variasi Kembar (${studentLabel})`,
        `FSRS 智慧錯題本 & 防刷穿孿生變式清零台（${studentLabel}）`
      )
    ),
  subtitle: c(
    "基于 FSRS 动态遗忘曲线（难度 D · 稳定性 S · 记忆保留率 R）调度复习；每次重练实时生成全新参数孪生题，连续 3 次掌握自动归档清零。",
    "Scheduled via the FSRS forgetting curve (Difficulty D · Stability S · Retrievability R); spawns fresh parameterized Twin Variants each review and archives after 3 consecutive Good/Easy clears.",
    "FSRS 忘却曲線（難易度 D・安定性 S・記憶保持率 R）で復習を最適化します。毎回新しい数値の類題（ペア問題）を生成し、3連続クリアで完全習得へ移行します。",
    "FSRS 망각곡선(난이도 D · 안정성 S · 기억 유지율 R)에 따라 복습을 스케줄링하며, 매번 새로운 난수 쌍둥이 문제를 생성해 3연속 통과 시 완전 클리어됩니다.",
    "Dijadualkan melalui lengkung lupa FSRS (Kesukaran D · Kestabilan S · Kebolehingatan R); menjana Variasi Kembar baharu setiap ulangan dan selesai selepas 3 kejayaan berturut-turut.",
    "基於 FSRS 動態遺忘曲線（難度 D · 穩定性 S · 記憶保留率 R）排程複習；每次重練即時產生全新參數孿生題，連續 3 次掌握自動歸檔清零。"
  ),
  tabPending: (count: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `待孪生清零 (${count})`,
        `Pending Clearance (${count})`,
        `未クリア (${count})`,
        `클리어 대기 (${count})`,
        `Belum Selesai (${count})`,
        `待孿生清零 (${count})`
      )
    ),
  tabCleared: (count: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `已彻底清零 (${count})`,
        `Cleared (${count})`,
        `完全クリア済 (${count})`,
        `클리어 완료 (${count})`,
        `Telah Selesai (${count})`,
        `已徹底清零 (${count})`
      )
    ),
  emptyPending: c(
    "🎉 当前学生所有错题均已清零！可前往「靶向回溯诊断」探索新章节。",
    "🎉 All wrong questions for this student are cleared! Head to Adaptive Diagnose to explore new chapters.",
    "🎉 現在の誤答はすべてクリア済みです！「さかのぼり診断」で新しい単元に挑戦しましょう。",
    "🎉 현재 학생의 모든 오답이 클리어되었습니다! '역추적 적응형 진단'에서 새 단원을 탐색해 보세요.",
    "🎉 Semua soalan salah pelajar ini telah diselesaikan! Terokai bab baharu di Diagnosis Adaptif.",
    "🎉 目前學生所有錯題均已清零！可前往「靶向回溯診斷」探索新章節。"
  ),
  emptyCleared: c(
    "暂无已清零错题记录——在右侧连续答对第 3 次孪生变式即可清零晋级！",
    "No cleared records yet — answer a 3rd consecutive Twin Variant in the right panel to graduate an item!",
    "まだクリア済みの記録はありません。右パネルのペア類題で3連続正解を達成するとクリアになります！",
    "아직 클리어된 오답 기록이 없습니다 — 오른쪽 패널에서 쌍둥이 변형문제를 3연속 맞히면 클리어됩니다!",
    "Tiada rekod selesai lagi — jawab betul Variasi Kembar kali ke-3 berturut-turut di panel kanan!",
    "暫無已清零錯題記錄——在右側連續答對第 3 次孿生變式即可清零晉級！"
  ),
  streakBadge: (streak: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `清零进度 ${streak}/3`,
        `Clear Streak ${streak}/3`,
        `クリア進捗 ${streak}/3`,
        `클리어 연속 ${streak}/3`,
        `Rentetan ${streak}/3`,
        `清零進度 ${streak}/3`
      )
    ),
  snapshotLabel: c(
    "原错题快照：",
    "Captured Snapshot: ",
    "元の誤答問題：",
    "원본 오답 스냅샷: ",
    "Petikan Soalan Asal: ",
    "原錯題快照："
  ),
  wrongAnswerLabel: c(
    "当时误答：",
    "Past Wrong Attempt: ",
    "当時の誤答：",
    "당시 오답: ",
    "Jawapan Salah Lalu: ",
    "當時誤答："
  ),
  correctAnswerLabel: c(
    "原题正解：",
    "Original Key: ",
    "元の正解：",
    "원본 정답: ",
    "Jawapan Betul Asal: ",
    "原題正解："
  ),
  misconceptionPrefix: c(
    "认知迷思归因：",
    "Diagnosed Misconception: ",
    "つまずき原因：",
    "진단된 오개념: ",
    "Salah Tanggapan Dikesan: ",
    "認知迷思歸因："
  ),
  difficultyMetric: (d: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `难度 D=${d}`,
        `Diff D=${d}`,
        `難易度 D=${d}`,
        `난이도 D=${d}`,
        `Kesukaran D=${d}`,
        `難度 D=${d}`
      )
    ),
  stabilityMetric: (s: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `稳定性 S=${s}d`,
        `Stability S=${s}d`,
        `安定性 S=${s}d`,
        `안정성 S=${s}d`,
        `Kestabilan S=${s}h`,
        `穩定性 S=${s}d`
      )
    ),
  retrievabilityPrefix: c(
    "保留率 R=",
    "Recall R=",
    "保持率 R=",
    "유지율 R=",
    "Ingatan R=",
    "保留率 R="
  ),
  spawnTwinBtn: c(
    "生成防背题孪生变式重练",
    "Spawn Anti-Memorization Twin Variant",
    "暗記防止・ペア類題を生成して再演習",
    "암기 방지 쌍둥이 변형문제 생성",
    "Jana Variasi Kembar & Ulang Latih",
    "產生防背題孿生變式重練"
  ),
  arenaTitle: c(
    "孪生变式防刷穿演练舱（Twin-Variant Arena）",
    "Twin-Variant Anti-Memorization Arena",
    "ペア類題・転移力検証アリーナ",
    "쌍둥이 변형문제 전이력 검증 아레나",
    "Arena Variasi Kembar Anti-Hafalan",
    "孿生變式防刷穿演練艙（Twin-Variant Arena）"
  ),
  arenaSubtitle: c(
    "同母题结构 · 全新随机参数 · 检验真实迁移能力",
    "Isomorphic template · Fresh random parameters · Verifies genuine skill transfer",
    "同一構造テンプレート・新しいランダム数値・真の応用力を検証",
    "동형 문항 구조 · 새로운 무작위 계수 · 진짜 개념 전이력 검증",
    "Struktur seiras · Parameter rawak baharu · Menguji pemindahan konsep sebenar",
    "同母題結構 · 全新隨機參數 · 檢驗真實遷移能力"
  ),
  arenaEmptyLead: c(
    "👈 点击左侧任意错题的「生成防背题孪生变式重练」按钮",
    "👈 Click 'Spawn Anti-Memorization Twin Variant' on any card on the left",
    "👈 左リストの誤答カードから「暗記防止・ペア類題を生成して再演習」をクリックしてください",
    "👈 왼쪽 오답 카드의 '암기 방지 쌍둥이 변형문제 생성' 버튼을 클릭하세요",
    "👈 Klik 'Jana Variasi Kembar & Ulang Latih' pada mana-mana kad di sebelah kiri",
    "👈 點擊左側任意錯題的「產生防背題孿生變式重練」按鈕"
  ),
  arenaEmptyTip: (studentName: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `💡 提示：${studentName} 有错题当前连击已达 2/3，再答对 1 次即可见证「彻底清零晋级」！`,
        `💡 Tip: ${studentName} has an item at 2/3 streak — 1 more Good/Easy clear promotes it to Cleared & upgrades Knowledge Graph mastery!`,
        `💡 ヒント：${studentName} には進捗 2/3 の問題があります。あと1回正解すると「完全クリア」に昇格します！`,
        `💡 팁: ${studentName} 학생의 2/3 연속 달성 문항은 1번만 더 맞히면 '완전 클리어'로 승급됩니다!`,
        `💡 Petua: ${studentName} mempunyai item pada rentetan 2/3 — 1 lagi jawapan betul akan melengkapkan penguasaan!`,
        `💡 提示：${studentName} 有錯題目前連擊已達 2/3，再答對 1 次即可見證「徹底清零晉級」！`
      )
    ),
  freshSeedBadge: (seedSuffix: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `全新种子 ${seedSuffix}`,
        `Fresh Seed ${seedSuffix}`,
        `新規シード ${seedSuffix}`,
        `신규 시드 ${seedSuffix}`,
        `Benih Baharu ${seedSuffix}`,
        `全新種子 ${seedSuffix}`
      )
    ),
  rerollTwinBtn: c(
    "换一组新数字",
    "Roll New Numbers",
    "別の数値で再生成",
    "새 숫자로 바꾸기",
    "Tukar Nombor Baharu",
    "換一組新數字"
  ),
  ratingLabel: c(
    "FSRS 4 档提取自评（影响下次间隔天数 S 与连击）：",
    "FSRS 4-Point Recall Rating (controls next Stability S & streak):",
    "FSRS 4段階想起自己評価（次回間隔 S と連続記録に反映）：",
    "FSRS 4단계 인출 자기평가 (다음 복습 간격 S 및 연속 기록 반영):",
    "Penilaian Ingatan 4-Tahap FSRS (menentukan selang S & rentetan):",
    "FSRS 4 檔提取自評（影響下次間隔天數 S 與連擊）："
  ),
  ratings: {
    1: c("🔁 重来 (Again)", "🔁 Again", "🔁 もう一度", "🔁 다시 (Again)", "🔁 Ulang", "🔁 重來 (Again)"),
    2: c("😓 吃力 (Hard)", "😓 Hard", "😓 難しい", "😓 어려움 (Hard)", "😓 Sukar", "😓 吃力 (Hard)"),
    3: c("🙂 顺畅 (Good)", "🙂 Good", "🙂 順調", "🙂 보통 (Good)", "🙂 Baik", "🙂 順暢 (Good)"),
    4: c("⚡ 秒杀 (Easy)", "⚡ Easy", "⚡ 余裕", "⚡ 쉬움 (Easy)", "⚡ Mudah", "⚡ 秒殺 (Easy)"),
  } satisfies Record<1 | 2 | 3 | 4, UiCopy>,
  answerPlaceholder: c(
    "输入新变式题答案（多根用逗号隔开）…",
    "Enter Twin Variant answer (comma-separate multiple roots)…",
    "類題の解答を入力（複数解はカンマ区切り）…",
    "변형문제 정답 입력 (여러 근은 쉼표로 구분)…",
    "Masukkan jawapan variasi kembar (pisahkan punca dengan koma)…",
    "輸入新變式題答案（多根用逗號隔開）…"
  ),
  submitTwinBtn: c(
    "验证清零",
    "Verify Clear",
    "解答を判定",
    "정답 검증",
    "Semak Jawapan",
    "驗證清零"
  ),
  requeueAgainBtn: c(
    "记为遗忘重排",
    "Mark Again (6h)",
    "再学習へ回す",
    "재학습 예약",
    "Jadual Semula",
    "記為遺忘重排"
  ),
  resultClearedMsg: c(
    "🏆 达成 3 连击！该错题已彻底清零并同步升级图谱掌握度！",
    "🏆 3-Streak Achieved! Item graduated to Cleared & Knowledge Graph mastery upgraded!",
    "🏆 3連続正解達成！この誤答は完全クリアとなり、知識グラフの習熟度も昇格しました！",
    "🏆 3연속 정답 달성! 해당 오답이 완전 클리어되었으며 지식그래프 숙련도가 승급되었습니다!",
    "🏆 Rentetan 3 Dicapai! Soalan ini telah selesai sepenuhnya dan penguasaan graf dinaik taraf!",
    "🏆 達成 3 連擊！該錯題已徹底清零並同步升級圖譜掌握度！"
  ),
  resultStreakUpMsg: (streak: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `回答正确！清零连击升至 ${streak}/3`,
        `Correct! Twin-Clearance streak is now ${streak}/3`,
        `正解です！クリア連続記録が ${streak}/3 に進みました`,
        `정답입니다! 클리어 연속 기록 ${streak}/3 달성`,
        `Betul! Rentetan penyelesaian kini ${streak}/3`,
        `回答正確！清零連擊升至 ${streak}/3`
      )
    ),
  resultMissMsg: (answer: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `仍未命中（正解：${answer}），连击归零，6 小时后再次调度！`,
        `Not quite (Key: ${answer}) — streak reset to 0, re-queued in 6 hours!`,
        `不正解です（正解：${answer}）。連続記録はリセットされ、6時間後に再出題されます！`,
        `아쉽네요 (정답: ${answer}) — 연속 기록 초기화, 6시간 후 다시 스케줄링됩니다!`,
        `Belum tepat (Jawapan: ${answer}) — rentetan diset semula ke 0, dijadualkan semula dalam 6 jam!`,
        `仍未命中（正解：${answer}），連擊歸零，6 小時後再次排程！`
      )
    ),
  resultFsrsSchedule: (nextStability: number, scheduledDays: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `FSRS 新稳定性 S = ${nextStability} 天 · 下次复习间隔 ${scheduledDays} 天`,
        `FSRS Updated Stability S = ${nextStability}d · Next review interval: ${scheduledDays}d`,
        `FSRS 更新安定性 S = ${nextStability}日 · 次回復習間隔 ${scheduledDays}日`,
        `FSRS 갱신 안정성 S = ${nextStability}일 · 다음 복습 간격 ${scheduledDays}일`,
        `Kestabilan Baharu FSRS S = ${nextStability}h · Selang ulangan seterusnya: ${scheduledDays}h`,
        `FSRS 新穩定性 S = ${nextStability} 天 · 下次複習間隔 ${scheduledDays} 天`
      )
    ),
  practiceAnotherTwinBtn: c(
    "再练一道新参数孪生题 →",
    "Practice Another Fresh Twin Variant →",
    "別の数値でペア類題をもう1問解く →",
    "새로운 쌍둥이 변형문제 한 문제 더 풀기 →",
    "Cuba Satu Lagi Variasi Kembar Baharu →",
    "再練一道新參數孿生題 →"
  ),
  coachTitle: c(
    "🤖 苏格拉底分步引导教练（不直接泄题）",
    "🤖 KG Socratic Step-by-Step Coach (No Answer Spoilers)",
    "🤖 ソクラテス式ステップ指導コーチ（答えを直接教えません）",
    "🤖 소크라테스식 단계별 AI 코치 (정답 스포일러 방지)",
    "🤖 Jurulatih Langkah demi Langkah Sokratik (Tanpa Jawapan Terus)",
    "🤖 蘇格拉底分步引導教練（不直接洩題）"
  ),
  coachHintBtn: c(
    "获取第 1 步启发提示",
    "Get Step 1 Socratic Hint",
    "ステップ1のヒントを聞く",
    "1단계 소크라테스 힌트 받기",
    "Dapatkan Petunjuk Langkah 1",
    "取得第 1 步啟發提示"
  ),
  coachDefaultPrompt: c(
    "请结合我之前的易错点，给我第 1 步思考提示，先不要直接告诉我最终答案。",
    "Based on my past misconception, please give me a Step 1 guiding question without revealing the final answer.",
    "これまでのつまずきを踏まえて、最終的な答えは伏せたままステップ1のヒントを教えてください。",
    "이전 오개념을 바탕으로 최종 답을 알려주지 말고 1단계 유도 질문을 주세요.",
    "Berdasarkan kesilapan lalu saya, berikan soalan panduan Langkah 1 tanpa mendedahkan jawapan akhir.",
    "請結合我之前的易錯點，給我第 1 步思考提示，先不要直接告訴我最終答案。"
  ),
  coachPlaceholder: c(
    "向苏格拉底教练追问中间步骤…",
    "Ask the Socratic Coach about an intermediate step…",
    "途中式の考え方をコーチに質問する…",
    "중간 풀이 단계에 대해 코치에게 질문하기…",
    "Tanya Jurulatih Sokratik tentang langkah perantaraan…",
    "向蘇格拉底教練追問中間步驟…"
  ),
  coachSendBtn: c("发送", "Ask", "送信", "질문", "Hantar", "傳送"),
  coachThinking: c(
    "教练正在检索先修图谱生成引导问句…",
    "Coach is grounding hint in Knowledge Graph…",
    "知識グラフを参照してヒントを生成中…",
    "지식그래프 기반으로 유도 질문 생성 중…",
    "Jurulatih sedang menyemak Graf Pengetahuan…",
    "教練正在檢索先修圖譜產生引導問句…"
  ),
};

export const CAPTURE_COPY = {
  loading: c(
    "正在加载 AI 智能录错题与 9 地课标归因引擎…",
    "Loading AI Smart Capture & 9-Region Curriculum Attribution Engine…",
    "AI誤答キャプチャ＆9地域カリキュラムつまずき原因診断エンジンを読み込み中…",
    "AI 스마트 오답 캡처 및 9개 지역 성취기준 분석 엔진을 불러오는 중…",
    "Memuatkan Rakaman Pintar AI & Enjin Jajaran 9 Rantau…",
    "正在載入 AI 智慧錄錯題與 9 地課標歸因引擎…"
  ),
  title: c(
    "AI 智能拍题 / 录错题归因台（9 地课标锚定 + PII 隐私脱敏盾）",
    "AI Smart Problem Capture & Root-Cause Attribution (9-Region Standards + PII Shield)",
    "AI スマート誤答キャプチャ＆つまずき原因診断（9地域基準＋PII保護シールド）",
    "AI 스마트 오답 캡처 & 선수 근본원인 진단 (9개 지역 교육과정 + PII 보호막)",
    "Rakaman Masalah Pintar AI & Surihan Punca (9 Rantau + Perisai Privasi PII)",
    "AI 智慧拍題 / 錄錯題歸因台（9 地課標錨定 + PII 隱私去識別化盾）"
  ),
  subtitle: (regionCode: RegionCode, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `粘贴纸质试卷错题或上传题目照片 → 自动剥离学生姓名/学校/电话 PII → 精准映射 ${regionCode} 官方课标节点、跨科先修根因与防背题孪生变式。`,
        `Paste a missed worksheet problem or upload a photo → auto-redact student name/school/phone PII → map directly to ${regionCode} official standards, cross-subject prerequisites & Twin Variants.`,
        `問題文の貼り付けまたは写真アップロード → 氏名・学校・電話番号などの PII を自動除去 → ${regionCode} 公式カリキュラム単元・教科横断の前提原因・類題（ペア問題）へ即座にマッピングします。`,
        `시험지 오답 지문 붙여넣기 또는 사진 업로드 → 학생 실명·학교·연락처 PII 자동 마스킹 → ${regionCode} 공식 성취기준 단원, 교과 간 선수 원인 및 쌍둥이 변형문제로 정밀 매핑합니다.`,
        `Tampal soalan kertas ujian atau muat naik foto → tanggalkan PII nama/sekolah/telefon secara automatik → petakan terus ke standard rasmi ${regionCode}, prasyarat rentas subjek & Variasi Kembar.`,
        `貼上紙本試卷錯題或上傳題目照片 → 自動剝離學生姓名/學校/電話 PII → 精準對應 ${regionCode} 官方課標節點、跨科先修根因與防背題孿生變式。`
      )
    ),
  viewWrongBookLink: (studentName: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `查看 ${studentName} 的 FSRS 错题本`,
        `Open ${studentName}'s FSRS Wrong-Book`,
        `${studentName} の FSRS 誤答ノートを開く`,
        `${studentName}의 FSRS 오답 노트 보기`,
        `Buka Buku Kesilapan FSRS ${studentName}`,
        `查看 ${studentName} 的 FSRS 錯題本`
      )
    ),
  presetStripTitle: c(
    "⚡ 一键载入跨学科真实错题样例（含未成年人隐私信息自动脱敏演示）：",
    "⚡ One-Click Cross-Subject Sample Captures (with Minor PII Auto-Redaction Demo):",
    "⚡ ワンクリック教科横断サンプル読込（未成年 PII 自動マスキング実演つき）：",
    "⚡ 원클릭 융합교과 실제 오답 샘플 불러오기 (미성년자 PII 자동 마스킹 시연 포함):",
    "⚡ Muat Segera Contoh Soalan Rentas Subjek (dengan Demo Penyahpengenalan PII):",
    "⚡ 一鍵載入跨學科真實錯題樣例（含未成年人隱私資訊自動去識別化演示）："
  ),
  step1Title: c(
    "1. 录入错题题干或上传试卷截图",
    "1. Enter Problem Text or Upload Worksheet Photo",
    "1. 問題文の入力または答案写真のアップロード",
    "1. 오답 지문 입력 또는 시험지 사진 업로드",
    "1. Masukkan Teks Soalan atau Muat Naik Foto Kertas Kerja",
    "1. 錄入錯題題幹或上傳試卷截圖"
  ),
  activePersonaBadge: (
    emoji: string,
    studentName: string,
    regionCode: RegionCode,
    locale: LocaleCode
  ) =>
    uiPick(
      locale,
      c(
        `当前档案：${emoji} ${studentName} (${regionCode})`,
        `Active Profile: ${emoji} ${studentName} (${regionCode})`,
        `対象プロフィール：${emoji} ${studentName} (${regionCode})`,
        `현재 프로필: ${emoji} ${studentName} (${regionCode})`,
        `Profil Aktif: ${emoji} ${studentName} (${regionCode})`,
        `目前檔案：${emoji} ${studentName} (${regionCode})`
      )
    ),
  uploadedImageStatus: (fileName: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `已载入图片：${fileName}`,
        `Loaded image: ${fileName}`,
        `読込済み画像：${fileName}`,
        `불러온 이미지: ${fileName}`,
        `Imej dimuatkan: ${fileName}`,
        `已載入圖片：${fileName}`
      )
    ),
  uploadPrompt: c(
    "上传纸质试卷拍照 / 作业截图（支持 PNG/JPG 多模态识别）",
    "Upload worksheet photo / screenshot (PNG/JPG multimodal OCR)",
    "答案写真・スクリーンショットをアップロード（PNG/JPG マルチモーダル認識）",
    "종이 시험지 사진 / 과제 스크린샷 업로드 (PNG/JPG 멀티모달 OCR 지원)",
    "Muat naik foto kertas ujian / tangkapan skrin (OCR pelbagai mod PNG/JPG)",
    "上傳紙本試卷拍照 / 作業截圖（支援 PNG/JPG 多模態辨識）"
  ),
  chooseImageBtn: c(
    "选择图片",
    "Choose Image",
    "画像を選択",
    "이미지 선택",
    "Pilih Imej",
    "選擇圖片"
  ),
  previewAlt: c(
    "上传的试卷预览图",
    "Uploaded worksheet preview",
    "アップロードされた答案プレビュー",
    "업로드된 시험지 미리보기",
    "Pratonton lembaran kerja yang dimuat naik",
    "上傳的試卷預覽圖"
  ),
  ocrSimulatedStem: (fileName: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `[拍照识题文件：${fileName}] 已知二次函数 y = (x - 3)^2 - 4，求抛物线顶点坐标与对称轴 x 的值。`,
        `[OCR Image Capture: ${fileName}] Given the quadratic function parabola y = (x - 3)^2 - 4, find the vertex coordinates and the axis of symmetry x.`,
        `[画像OCR読取：${fileName}] 二次関数の放物線（parabola） y = (x - 3)^2 - 4 について、頂点（vertex）の座標と対称軸（axis of symmetry）x の値を求めてください。`,
        `[이미지 OCR 인식: ${fileName}] 이차함수 포물선(parabola) y = (x - 3)^2 - 4의 꼭짓점(vertex) 좌표와 대칭축(axis of symmetry) x의 값을 구하시오.`,
        `[Imbasan OCR Imej: ${fileName}] Diberi fungsi kuadratik parabola y = (x - 3)^2 - 4, cari koordinat verteks (vertex) dan paksi simetri (axis of symmetry) x.`,
        `[拍照識題檔案：${fileName}] 已知二次函數 y = (x - 3)^2 - 4，求拋物線（parabola）頂點座標（vertex）與對稱軸（axis of symmetry）x 的值。`
      )
    ),
  subjectScopeLabel: c(
    "学科范围（可选自动识别）：",
    "Subject Scope (or Auto-Detect):",
    "教科範囲（自動判定可）：",
    "과목 범위 (자동 감지 가능):",
    "Skop Subjek (atau Kesan Automatik):",
    "學科範圍（可選自動辨識）："
  ),
  allSubjectsOption: c(
    "🌐 全科 9 学科自动识别",
    "🌐 Auto-Detect Across All 9 Subjects",
    "🌐 全9教科から自動判定",
    "🌐 9개 전과목 자동 식별",
    "🌐 Kesan Automatik Merentas 9 Subjek",
    "🌐 全科 9 學科自動辨識"
  ),
  wrongAttemptLabel: c(
    "当时错误作答（用于迷思归因）：",
    "Student's Wrong Attempt (for Misconception Diagnosis):",
    "当時の誤答（つまずき分析用）：",
    "당시 오답 (오개념 진단용):",
    "Cubaan Salah Pelajar (untuk Diagnosis):",
    "當時錯誤作答（用於迷思歸因）："
  ),
  wrongAttemptPlaceholder: c(
    "例如：18 / where / 25",
    "e.g. 18 / where / 25",
    "例：18 / where / 25",
    "예: 18 / where / 25",
    "cth. 18 / where / 25",
    "例如：18 / where / 25"
  ),
  stemLabel: c(
    "错题题干文本（支持 LaTeX 公式，含姓名/学校/电话将被自动脱敏）：",
    "Problem Stem (LaTeX supported; student names, schools & phones auto-redacted):",
    "問題文テキスト（LaTeX 数式対応・氏名/学校/電話番号は自動マスク）：",
    "오답 문제 지문 (LaTeX 수식 지원 · 실명/학교/전화번호 자동 마스킹):",
    "Teks Soalan (LaTeX disokong; nama, sekolah & telefon ditanggalkan automatik):",
    "錯題題幹文字（支援 LaTeX 公式，含姓名/學校/電話將被自動去識別化）："
  ),
  stemPlaceholder: c(
    "粘贴或输入做错的题目内容…",
    "Paste or type the missed problem statement…",
    "間違えた問題文を貼り付けるか入力してください…",
    "틀린 문제 내용을 붙여넣거나 입력하세요…",
    "Tampal atau taip pernyataan masalah yang salah…",
    "貼上或輸入做錯的題目內容…"
  ),
  analyzingBtn: c(
    "正在执行 PII 脱敏与 9 地课标图谱溯源…",
    "Redacting PII & Tracing 9-Region Knowledge Graph…",
    "PII マスキング＆9地域知識グラフさかのぼり解析を実行中…",
    "PII 비식별화 및 9개 지역 지식그래프 역추적 중…",
    "Menyahpengenalan PII & Menyurih Graf 9 Rantau…",
    "正在執行 PII 去識別化與 9 地課標圖譜溯源…"
  ),
  runAnalyzeBtn: c(
    "开始 AI 智能归因 · 定位先修病灶并生成孪生题",
    "Run AI Attribution · Trace Root Causes & Spawn Twin Variant",
    "AI つまずき原因診断を開始・前提の弱点特定＆ペア類題を生成",
    "AI 스마트 진단 시작 · 선수 병목 추적 및 쌍둥이 문제 생성",
    "Jalankan Analisis AI · Kesan Punca & Jana Variasi Kembar",
    "開始 AI 智慧歸因 · 定位先修病灶並產生孿生題"
  ),
  noRecordedWrongAnswer: c(
    "待订正作答",
    "Pending correction",
    "未解答（要復習）",
    "미응답 (복습 대기)",
    "Belum dijawab (perlu semakan)",
    "待訂正作答"
  ),
  waitingTitle: c(
    "等待错题归因分析",
    "Ready for Problem Attribution",
    "つまずき原因診断の待機中",
    "오답 귀인 분석 대기 중",
    "Sedia untuk Analisis Masalah",
    "等待錯題歸因分析"
  ),
  waitingBody: (regionCode: RegionCode, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `点击左侧「开始 AI 智能归因」按钮，系统将先通过 9 地未成年人 PII 脱敏盾剥离姓名、学校与联系方式，再精准锚定至 ${regionCode} 课标微技能节点与上游跨科根因。`,
        `Click "Run AI Attribution" on the left. The 9-Region Minor PII Shield will strip names, schools, and contact info before anchoring to ${regionCode} micro-topic standards and upstream cross-subject root causes.`,
        `左側の「AI つまずき原因診断を開始」をクリックすると、9地域未成年 PII 保護シールドで氏名・学校・連絡先を除去した上で、${regionCode} 基準のマイクロ単元と上流の前提原因を特定します。`,
        `왼쪽의 'AI 스마트 진단 시작' 버튼을 클릭하면 9개 지역 미성년자 PII 보호막이 실명·학교·연락처를 분리한 뒤 ${regionCode} 교육과정 마이크로 단원과 상위 선수 원인을 정밀 매핑합니다.`,
        `Klik "Jalankan Analisis AI" di sebelah kiri. Perisai PII Bawah Umur 9 Rantau akan menanggalkan nama, sekolah dan kenalan sebelum memetakan ke nod mikro ${regionCode} serta punca huluan.`,
        `點擊左側「開始 AI 智慧歸因」按鈕，系統將先透過 9 地未成年人 PII 去識別化盾剝離姓名、學校與聯絡方式，再精準錨定至 ${regionCode} 課標微技能節點與上游跨科根因。`
      )
    ),
  shieldActiveBanner: (regulationName: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `9 地未成年人隐私脱敏盾已生效（${regulationName}）`,
        `9-Region Minor Privacy Shield Active (${regulationName})`,
        `9地域・未成年プライバシー保護シールド適用済（${regulationName}）`,
        `9개 지역 미성년자 개인정보 보호막 적용됨 (${regulationName})`,
        `Perisai Privasi Bawah Umur 9 Rantau Aktif (${regulationName})`,
        `9 地未成年人隱私去識別化盾已生效（${regulationName}）`
      )
    ),
  anonTokenLabel: (token: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `匿名令牌：${token}`,
        `Pseudonymous Token: ${token}`,
        `匿名トークン：${token}`,
        `가명 토큰: ${token}`,
        `Token Nama Samaran: ${token}`,
        `匿名權杖：${token}`
      )
    ),
  sanitizedPayloadLabel: (text: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `脱敏后载荷：${text}`,
        `Sanitized Payload: ${text}`,
        `マスク後ペイロード：${text}`,
        `비식별 페이로드: ${text}`,
        `Muatan Disanitasi: ${text}`,
        `去識別化後載荷：${text}`
      )
    ),
  redactedFieldBadge: (field: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `已剥离：${field}`,
        `Redacted: ${field}`,
        `除去済：${field}`,
        `마스킹됨: ${field}`,
        `Ditanggalkan: ${field}`,
        `已剝離：${field}`
      )
    ),
  noPiiDetectedNote: c(
    "本次输入未检测到外露姓名/学校/电话 PII，已按零知识匿名令牌审计归档",
    "No raw name/school/phone PII detected; logged under zero-knowledge pseudonymous token",
    "生の氏名・学校・電話番号 PII は検出されませんでした（匿名トークンで監査記録済）",
    "노출된 실명/학교/전화번호 PII 없음 — 영지식 가명 토큰으로 감사 기록됨",
    "Tiada PII nama/sekolah/telefon mentah dikesan; direkodkan di bawah token tanpa pengetahuan",
    "本次輸入未偵測到外露姓名/學校/電話 PII，已按零知識匿名權杖稽核歸檔"
  ),
  matchedSkillPrefix: c(
    "🎯 归因微技能：",
    "🎯 Matched Micro-Topic: ",
    "🎯 特定マイクロ単元：",
    "🎯 매핑된 마이크로 단원: ",
    "🎯 Nod Mikro Dipadankan: ",
    "🎯 歸因微技能："
  ),
  confidenceBadge: (pct: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `置信度 ${pct}%`,
        `Confidence ${pct}%`,
        `一致度 ${pct}%`,
        `신뢰도 ${pct}%`,
        `Keyakinan ${pct}%`,
        `信賴度 ${pct}%`
      )
    ),
  detectedMisconceptionPrefix: c(
    "识别认知迷思：",
    "Detected Misconception: ",
    "検出されたつまずき：",
    "감지된 오개념: ",
    "Salah Tanggapan Dikesan: ",
    "辨識認知迷思："
  ),
  remediationTipPrefix: c(
    "🛠️ 靶向纠偏处方：",
    "🛠️ Targeted Remediation: ",
    "🛠️ 処方アドバイス：",
    "🛠️ 맞춤형 교정 처방: ",
    "🛠️ Pemulihan Tersasar: ",
    "🛠️ 靶向糾偏處方："
  ),
  upstreamChainTitle: c(
    "上游先修与跨学科根因链路（点击可直接跳转回溯诊断）：",
    "Upstream Prerequisite & Cross-Subject Root-Cause Chain (click to launch Adaptive Diagnose):",
    "上流の前提単元＆教科横断ルート原因（クリックでさかのぼり診断へ移動）：",
    "상위 선수 단원 및 교과 간 근본원인 체인 (클릭 시 역추적 진단으로 이동):",
    "Rantaian Prasyarat Huluan & Punca Rentas Subjek (klik untuk Diagnosis Adaptif):",
    "上游先修與跨學科根因鏈路（點擊可直接跳轉回溯診斷）："
  ),
  crossSubjectBadge: c(
    "🌉 跨科数学桥",
    "🌉 Cross-Subject Bridge",
    "🌉 教科横断ブリッジ",
    "🌉 교과 간 브리지",
    "🌉 Jambatan Rentas Subjek",
    "🌉 跨科數學橋"
  ),
  directPrereqBadge: c(
    "⬆️ 直接先修",
    "⬆️ Direct Prerequisite",
    "⬆️ 直接の前提単元",
    "⬆️ 직접 선수 단원",
    "⬆️ Prasyarat Langsung",
    "⬆️ 直接先修"
  ),
  savedPrefix: c(
    "已收录至 FSRS 错题本（编号 ",
    "Saved to FSRS Wrong-Book (ID ",
    "FSRS 誤答ノートに登録しました（ID ",
    "FSRS 오답 노트에 저장됨 (ID ",
    "Disimpan ke Buku Kesilapan FSRS (ID ",
    "已收錄至 FSRS 錯題本（編號 "
  ),
  savedSuffix: c(
    "），按 90% 记忆保留率自动排期复习！",
    ") — scheduled automatically at 90% target retrievability!",
    "）— 記憶保持率 90% 基準で自動スケジューリング完了！",
    ") — 기억 유지율 90% 기준으로 자동 복습 예약 완료!",
    ") — dijadualkan secara automatik pada sasaran ingatan 90%!",
    "），按 90% 記憶保留率自動排程複習！"
  ),
  saveToWrongBookBtn: c(
    "一键加入 FSRS 错题本并开启三连清零计划",
    "Save to FSRS Wrong-Book & Start 3-Streak Clearance",
    "FSRS 誤答ノートに追加して3連続クリアを開始",
    "FSRS 오답 노트에 추가하고 3연속 클리어 시작",
    "Simpan ke Buku Kesilapan FSRS & Mulakan Rentetan 3",
    "一鍵加入 FSRS 錯題本並開啟三連清零計畫"
  ),
  exploreNodeLink: c(
    "在图谱星海中查看该节点 9 地课标 →",
    "Inspect 9-Region Standards in Knowledge Map →",
    "知識グラフでこの単元の9地域基準を見る →",
    "지식그래프에서 9개 지역 성취기준 보기 →",
    "Lihat Standard 9 Rantau dalam Peta Ilmu →",
    "在圖譜星海中查看該節點 9 地課標 →"
  ),
  instantTwinTitle: c(
    "🧬 即时生成的防背题同构「孪生变式题」（立即检验是否真正搞懂）：",
    "🧬 Instant Anti-Memorization Isomorphic Twin Variant (verify transfer right now):",
    "🧬 即時生成された暗記防止「類題（ペア問題）」（本当に理解できたか今すぐ確認）：",
    "🧬 즉시 생성된 암기 방지 동형 '쌍둥이 변형문제' (개념 전이 즉시 확인):",
    "🧬 Variasi Kembar Seiras Segera (uji kefahaman sebenar sekarang):",
    "🧬 即時產生的防背題同構「孿生變式題」（立即檢驗是否真正搞懂）："
  ),
  instantTwinPlaceholder: c(
    "输入孪生变式题答案…",
    "Enter Twin Variant answer…",
    "ペア類題の解答を入力…",
    "쌍둥이 변형문제 정답 입력…",
    "Masukkan jawapan variasi kembar…",
    "輸入孿生變式題答案…"
  ),
  checkTwinBtn: c(
    "核对变式",
    "Check Twin",
    "類題を判定",
    "변형문제 확인",
    "Semak Variasi",
    "核對變式"
  ),
  twinRightPrefix: c(
    "🎉 变式秒通！解析：",
    "🎉 Nailed the Twin Variant! Explanation: ",
    "🎉 ペア類題クリア！解説：",
    "🎉 쌍둥이 변형문제 정답! 해설: ",
    "🎉 Variasi Kembar Tepat! Penjelasan: ",
    "🎉 變式秒通！解析："
  ),
  twinWrongPrefix: (answer: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `再试一次！正确答案是 ${answer}。解析：`,
        `Try once more! The correct answer is ${answer}. Explanation: `,
        `もう一歩！正解は ${answer} です。解説：`,
        `다시 확인해 보세요! 정답은 ${answer}입니다. 해설: `,
        `Cuba lagi! Jawapan betul ialah ${answer}. Penjelasan: `,
        `再試一次！正確答案是 ${answer}。解析：`
      )
    ),
};

export const AUTH_COPY = {
  loading: c(
    "正在加载三端账号认证与 9 地未成年人隐私合规中心…",
    "Loading 3-Role Authentication & 9-Region Minor Privacy Compliance Center…",
    "3ロール認証＆9地域・未成年プライバシー準拠センターを読み込み中…",
    "3역할 계정 인증 및 9개 지역 미성년자 개인정보 보호 센터를 불러오는 중…",
    "Memuatkan Pusat Pengesahan 3-Peranan & Pematuhan Privasi 9 Rantau…",
    "正在載入三端帳號認證與 9 地未成年人隱私合規中心…"
  ),
  title: c(
    "三端真实认证、家庭 PIN / 班级邀请码与 9 地未成年人隐私脱敏盾",
    "3-Role Auth, Family Kid PIN / Class Invite & 9-Region Minor Privacy Shield",
    "3ロール認証・ファミリーPIN / クラス招待＆9地域未成年プライバシー保護",
    "3역할 인증 · 가족 아동 PIN / 학급 초대코드 & 9개 지역 미성년자 개인정보 보호막",
    "Pengesahan 3-Peranan, PIN Keluarga / Kod Kelas & Perisai Privasi 9 Rantau",
    "三端真實認證、家庭 PIN / 班級邀請碼與 9 地未成年人隱私去識別化盾"
  ),
  subtitle: c(
    "全面对齐中国 PIPL、美国 COPPA/FERPA、英国 AADC、新加坡/马来西亚 PDPA、日韩 APPI/PIPA 未成年人数据最小化与监护人可验证授权规范。",
    "Aligned with China PIPL, US COPPA/FERPA, UK Children's Code (AADC), SG/MY PDPA, and JP/KR APPI/PIPA minor data minimization & verifiable guardian consent.",
    "中国 PIPL・米国 COPPA/FERPA・英国 AADC・シンガポール/マレーシア PDPA・日韓 APPI/PIPA の未成年データ最小化および保護者同意基準に完全準拠。",
    "중국 PIPL, 미국 COPPA/FERPA, 영국 AADC, 싱가포르/말레이시아 PDPA, 한국 PIPA 및 일본 APPI의 아동 데이터 최소화·법정대리인 동의 규정을 준수합니다.",
    "Selaras dengan PIPL China, COPPA/FERPA AS, AADC UK, PDPA SG/MY serta APPI/PIPA JP/KR bagi peminimuman data bawah umur & kebenaran penjaga.",
    "全面對齊中國大陸 PIPL、美國 COPPA/FERPA、英國 AADC、新加坡/馬來西亞 PDPA、日韓 APPI/PIPA 未成年人資料最小化與監護人可驗證授權規範。"
  ),
  activeSessionLabel: c(
    "当前会话身份：",
    "Active Session: ",
    "現在のセッション：",
    "현재 로그인 세션: ",
    "Sesi Aktif: ",
    "目前工作階段身分："
  ),
  card1Title: c(
    "1. 三端账号认证 & 低龄儿童 6 位 PIN 免密登录",
    "1. 3-Role Account Sign-In & Passwordless 6-Digit Kid PIN",
    "1. 3ロールアカウント認証＆児童向け6桁ファミリーPINログイン",
    "1. 3역할 계정 로그인 & 저연령 아동용 6자리 가족 PIN 간편 입장",
    "1. Log Masuk 3-Peranan & PIN Kanak-kanak 6-Digit Tanpa Kata Laluan",
    "1. 三端帳號認證 & 低齡學童 6 位 PIN 免密登入"
  ),
  modeCredentials: c("账号口令", "Credentials", "ID・パスコード", "계정 로그인", "Akaun", "帳號口令"),
  modeKidPin: c("儿童 PIN 码", "Kid PIN", "児童 PIN", "아동 PIN", "PIN Anak", "學童 PIN 碼"),
  modeRegister: c("新用户注册", "Register", "新規登録", "신규 가입", "Daftar", "新使用者註冊"),
  demoTeacherBtn: c(
    "👩‍🏫 填入教师演示号",
    "👩‍🏫 Fill Teacher Demo",
    "👩‍🏫 教員デモを入力",
    "👩‍🏫 교사 데모 입력",
    "👩‍🏫 Isi Demo Guru",
    "👩‍🏫 填入教師演示號"
  ),
  demoParentBtn: c(
    "👨‍👧‍👦 填入家长演示号",
    "👨‍👧‍👦 Fill Parent Demo",
    "👨‍👧‍👦 保護者デモを入力",
    "👨‍👧‍👦 학부모 데모 입력",
    "👨‍👧‍👦 Isi Demo Ibu Bapa",
    "👨‍👧‍👦 填入家長演示號"
  ),
  demoLeoPinBtn: c(
    "🧑‍🚀 小宇 PIN: 880901",
    "🧑‍🚀 Leo PIN: 880901",
    "🧑‍🚀 Leo PIN: 880901",
    "🧑‍🚀 Leo PIN: 880901",
    "🧑‍🚀 PIN Leo: 880901",
    "🧑‍🚀 小宇 PIN: 880901"
  ),
  demoMiaPinBtn: c(
    "🦄 小朵 PIN: 550502",
    "🦄 Mia PIN: 550502",
    "🦄 Mia PIN: 550502",
    "🦄 Mia PIN: 550502",
    "🦄 PIN Mia: 550502",
    "🦄 小朵 PIN: 550502"
  ),
  loginHandleLabel: c(
    "登录邮箱 / 账号：",
    "Login Email / Handle:",
    "ログインメール / ID：",
    "로그인 이메일 / 계정:",
    "E-mel / ID Log Masuk:",
    "登入信箱 / 帳號："
  ),
  passcodeLabel: c(
    "访问口令：",
    "Passcode:",
    "パスコード：",
    "비밀번호:",
    "Kod Laluan:",
    "存取口令："
  ),
  loginSubmitBtn: c(
    "安全登录并同步工作台角色",
    "Sign In Securely & Sync Workspace Role",
    "安全にログインしてロールを同期",
    "안전 로그인 및 워크스페이스 역할 동기화",
    "Log Masuk Selamat & Segerakkan Peranan",
    "安全登入並同步工作台角色"
  ),
  kidPinLead: c(
    "低龄中小学生无需记忆邮箱或暴露手机号，凭家长签发的 6 位家庭 PIN 码即可安全进入伴学舱：",
    "Younger K-12 learners never need an email or phone number — enter or tap a parent-issued 6-digit Family PIN:",
    "低学年の児童・生徒はメールアドレスや電話番号不要で、保護者が発行した6桁のファミリーPINで安全に入室できます：",
    "어린 학생은 이메일이나 전화번호 없이 학부모가 발급한 6자리 가족 PIN 번호만으로 안전하게 학습 공간에 입장합니다:",
    "Pelajar muda tidak memerlukan e-mel atau nombor telefon — masukkan atau ketik PIN Keluarga 6-digit:",
    "低齡中小學生無需記憶信箱或暴露手機號碼，憑家長簽發的 6 位家庭 PIN 碼即可安全進入伴學艙："
  ),
  kidPinPlaceholder: c(
    "输入 6 位数字 PIN 码",
    "Enter 6-digit PIN",
    "6桁の数字PINを入力",
    "6자리 숫자 PIN 입력",
    "Masukkan PIN 6 digit",
    "輸入 6 位數字 PIN 碼"
  ),
  kidPinClearBtn: c("清空", "Clear", "クリア", "지우기", "Kosongkan", "清空"),
  kidPinBackBtn: c("退格", "⌫", "⌫", "⌫", "⌫", "退格"),
  kidPinSubmitBtn: c(
    "凭家庭 PIN 码进入学生个人学习舱",
    "Enter Student Learning Pod with Family PIN",
    "ファミリーPINで生徒学習ポッドに入室",
    "가족 PIN으로 학생 학습 공간 입장",
    "Masuk Ruang Pelajar dengan PIN Keluarga",
    "憑家庭 PIN 碼進入學生個人學習艙"
  ),
  regNamePlaceholder: c(
    "显示昵称（如：张思远）",
    "Display Name (e.g. Alex Tan)",
    "表示ニックネーム（例：Sora Tanaka）",
    "표시 이름 (예: 김하늘)",
    "Nama Paparan (cth. Nurul Aina)",
    "顯示暱稱（如：陳思遠）"
  ),
  roleStudent: c("学生", "Student", "生徒", "학생", "Pelajar", "學生"),
  roleTeacher: c("教师", "Teacher", "教員", "교사", "Guru", "教師"),
  roleParent: c("家长", "Parent", "保護者", "학부모", "Ibu Bapa", "家長"),
  regHandlePlaceholder: c(
    "登录账号 / 邮箱",
    "Login Handle / Email",
    "ログインID / メール",
    "로그인 계정 / 이메일",
    "ID Log Masuk / E-mel",
    "登入帳號 / 信箱"
  ),
  regGradePlaceholder: c("年级", "Grade", "学年", "학년", "Gred", "年級"),
  regPasscodePlaceholder: c(
    "设置至少 4 位登录口令",
    "Set passcode (min 4 chars)",
    "4文字以上のパスコードを設定",
    "4자 이상의 비밀번호 설정",
    "Tetapkan kod laluan (min 4 aksara)",
    "設定至少 4 位登入口令"
  ),
  regSubmitBtn: c(
    "立即注册真实账号（写入 SQLite）",
    "Create Live Account (Persisted in SQLite)",
    "新規アカウントを登録（SQLite に保存）",
    "실제 계정 즉시 가입 (SQLite 저장)",
    "Daftar Akaun Sebenar (Disimpan dalam SQLite)",
    "立即註冊真實帳號（寫入 SQLite）"
  ),
  loginSuccessMsg: (
    emoji: string,
    name: string,
    anonToken: string,
    locale: LocaleCode
  ) =>
    uiPick(
      locale,
      c(
        `登录成功！当前身份：${emoji} ${name}（匿名合规令牌：${anonToken}）`,
        `Signed in! Active identity: ${emoji} ${name} (Pseudonymous Token: ${anonToken})`,
        `ログイン成功！現在のID：${emoji} ${name}（匿名準拠トークン：${anonToken}）`,
        `로그인 성공! 현재 계정: ${emoji} ${name} (가명 준수 토큰: ${anonToken})`,
        `Berjaya log masuk! Identiti aktif: ${emoji} ${name} (Token Nama Samaran: ${anonToken})`,
        `登入成功！目前身分：${emoji} ${name}（匿名合規權杖：${anonToken}）`
      )
    ),
  loginFailFallback: c(
    "登录失败，请检查账号或口令。",
    "Sign-in failed. Please check your handle or passcode.",
    "ログインに失敗しました。IDまたはパスコードを確認してください。",
    "로그인에 실패했습니다. 계정 또는 비밀번호를 확인해 주세요.",
    "Log masuk gagal. Sila semak ID atau kod laluan anda.",
    "登入失敗，請檢查帳號或口令。"
  ),
  pinSuccessMsg: (name: string, regimeName: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `🎉 儿童家庭 PIN 免密登录成功！欢迎回来，${name}（受 ${regimeName} 保护）`,
        `🎉 Family Kid PIN verified! Welcome back, ${name} (Protected under ${regimeName})`,
        `🎉 ファミリーPIN認証成功！おかえりなさい、${name}（${regimeName} 保護適用）`,
        `🎉 가족 아동 PIN 로그인 성공! 환영합니다, ${name} (${regimeName} 보호 적용)`,
        `🎉 Log masuk PIN Keluarga berjaya! Selamat kembali, ${name} (Dilindungi di bawah ${regimeName})`,
        `🎉 學童家庭 PIN 免密登入成功！歡迎回來，${name}（受 ${regimeName} 保護）`
      )
    ),
  pinFailFallback: c(
    "PIN 码无效",
    "Invalid Kid PIN",
    "無効なPINコードです",
    "유효하지 않은 PIN 번호입니다",
    "PIN tidak sah",
    "PIN 碼無效"
  ),
  registerSuccessMsg: (kidPin: string | null, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `注册并登录成功！${kidPin ? `专属 6 位快捷 PIN 码：${kidPin}` : ""}`,
        `Account registered & signed in!${kidPin ? ` Assigned 6-digit Family Kid PIN: ${kidPin}` : ""}`,
        `登録＆ログイン完了！${kidPin ? `専用6桁ファミリーPIN：${kidPin}` : ""}`,
        `가입 및 로그인 완료!${kidPin ? ` 전용 6자리 가족 PIN: ${kidPin}` : ""}`,
        `Akaun didaftarkan & log masuk!${kidPin ? ` PIN Keluarga 6-digit: ${kidPin}` : ""}`,
        `註冊並登入成功！${kidPin ? `專屬 6 位快捷 PIN 碼：${kidPin}` : ""}`
      )
    ),
  registerFailFallback: c(
    "注册失败",
    "Registration failed",
    "登録に失敗しました",
    "가입에 실패했습니다",
    "Pendaftaran gagal",
    "註冊失敗"
  ),
  card2Title: c(
    "2. 家长创建低龄子账号（9 地未成年人监护授权 VPC + 签发家庭 PIN）",
    "2. Parent Child Sub-Account Creator (9-Region Guardian VPC + Family PIN)",
    "2. 保護者による児童サブアカウント作成（9地域・保護者同意 VPC＋PIN発行）",
    "2. 학부모 저연령 자녀 계정 생성 (9개 지역 법정대리인 동의 VPC + 가족 PIN 발급)",
    "2. Pencipta Sub-Akaun Anak (Kebenaran Penjaga VPC 9 Rantau + PIN Keluarga)",
    "2. 家長建立低齡子帳號（9 地未成年人監護授權 VPC + 簽發家庭 PIN）"
  ),
  childNamePlaceholder: c(
    "孩子昵称（如：林小星）",
    "Child Nickname (e.g. Noah Lin)",
    "お子様のニックネーム（例：Haru）",
    "자녀 별명 (예: 이하루)",
    "Nama Panggilan Anak (cth. Adam)",
    "孩子暱稱（如：林小星）"
  ),
  jurisdictionPrefix: c(
    "📜 适用司法辖区保护条例：",
    "📜 Applicable Jurisdiction Statute: ",
    "📜 適用される法域プライバシー法規：",
    "📜 적용 관할권 아동 보호 법규: ",
    "📜 Peraturan Bidang Kuasa Terpakai: ",
    "📜 適用司法轄區保護條例："
  ),
  guardianConsentCheckbox: (dailyLimit: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `我作为法定监护人已阅读并授权创建低龄脱敏学习档案（每日防沉迷上限 ${dailyLimit} 分钟）`,
        `As legal guardian, I consent to creating a de-identified minor learning profile (daily screen-time cap: ${dailyLimit} min)`,
        `法定保護者として非識別化学習プロフィールの作成に同意します（1日の学習上限 ${dailyLimit} 分）`,
        `법정대리인으로서 비식별 아동 학습 프로필 생성에 동의합니다 (일일 사용 상한 ${dailyLimit}분)`,
        `Sebagai penjaga sah, saya membenarkan profil pembelajaran tanpa PII ini (had harian ${dailyLimit} minit)`,
        `我作為法定監護人已閱讀並授權建立低齡去識別化學習檔案（每日防沉迷上限 ${dailyLimit} 分鐘）`
      )
    ),
  createChildSubmitBtn: c(
    "创建子账号并自动绑定至家长伴学端",
    "Create Child Sub-Account & Link to Parent Space",
    "サブアカウントを作成して保護者スペースに連携",
    "자녀 계정 생성 및 학부모 공간 자동 연동",
    "Cipta Sub-Akaun Anak & Pautkan ke Ruang Ibu Bapa",
    "建立子帳號並自動綁定至家長伴學端"
  ),
  childCreatedSuccessPrefix: c(
    "子账号创建成功！专属 6 位家庭 PIN 码：",
    "Child sub-account created! 6-digit Family PIN:",
    "子アカウントを作成しました！専用6桁ファミリーPIN：",
    "자녀 계정 생성 완료! 전용 6자리 가족 PIN:",
    "Sub-akaun anak dicipta! PIN Keluarga 6-digit:",
    "子帳號建立成功！專屬 6 位家庭 PIN 碼："
  ),
  childCreatedHint: c(
    "现在可在上方切换器或用该 PIN 码免密登录，且已在「家长伴学空间」自动绑定。",
    "You can now switch to this learner in the top bar or sign in passwordlessly with this PIN — linked in Parent Space.",
    "上部バーの切替またはこのPINコードでログイン可能になり、「保護者スペース」にも自動連携されました。",
    "이제 상단 전환기 또는 위 PIN 번호로 즉시 입장할 수 있으며 '학부모 공간'에 자동 연동되었습니다.",
    "Kini boleh dipilih pada bar atas atau log masuk terus dengan PIN ini — dipautkan dalam Ruang Ibu Bapa.",
    "現在可在上方切換器或用該 PIN 碼免密登入，且已在「家長伴學空間」自動綁定。"
  ),
  card3Title: c(
    "3. 学生凭班级邀请码一键入班（师生学情绑定）",
    "3. Student Classroom Join via Invite Code (Teacher-Student Telemetry Sync)",
    "3. クラス招待コードで参加（教員ダッシュボードへ習熟度を同期）",
    "3. 학급 초대코드로 반 합류 (교사 대시보드 성취도 실시간 연동)",
    "3. Sertai Kelas melalui Kod Jemputan (Segerak Penguasaan Guru-Pelajar)",
    "3. 學生憑班級邀請碼一鍵入班（師生學情綁定）"
  ),
  inviteCodePlaceholder: c(
    "输入教师发放的班级邀请码（如 OMNI-9A）",
    "Enter teacher's class invite code (e.g. OMNI-9A)",
    "教員から配布された招待コードを入力（例：OMNI-9A）",
    "교사가 배부한 학급 초대코드 입력 (예: OMNI-9A)",
    "Masukkan kod jemputan kelas (cth. OMNI-9A)",
    "輸入教師發放的班級邀請碼（如 OMNI-9A）"
  ),
  joinClassBtn: c("加入班级", "Join Class", "クラスに参加", "학급 합류", "Sertai Kelas", "加入班級"),
  joinClassSuccessMsg: (className: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `✅ 学生已凭邀请码加入班级《${className}》！教师端热力图将实时同步其掌握度。`,
        `✅ Joined classroom "${className}"! Teacher Hub heatmaps now sync this student's live mastery.`,
        `✅ クラス「${className}」に参加しました！教員ダッシュボードのヒートマップにリアルタイム同期されます。`,
        `✅ '${className}' 학급에 합류했습니다! 교사 연구실 히트맵에 성취도가 실시간 동기화됩니다.`,
        `✅ Berjaya menyertai kelas "${className}"! Peta haba Hab Guru kini menyegerakkan penguasaan pelajar ini.`,
        `✅ 學生已憑邀請碼加入班級《${className}》！教師端熱力圖將即時同步其掌握度。`
      )
    ),
  card4Title: c(
    "4. 9 地未成年人 PII 物理脱敏盾实时检验台 & 合规审计台账（Zero-PII LLM Gateway）",
    "4. Live 9-Region Minor PII De-Identification Sandbox & Audit Trail (Zero-PII LLM Gateway)",
    "4. 9地域・未成年 PII 物理マスキング検証台＆監査ログ（Zero-PII LLM Gateway）",
    "4. 9개 지역 미성년자 PII 물리적 비식별화 샌드박스 & 감사 원장 (Zero-PII LLM Gateway)",
    "4. Kotak Pasir Penyahpengenalan PII 9 Rantau & Jejak Audit (Zero-PII LLM Gateway)",
    "4. 9 地未成年人 PII 實體去識別化盾即時檢驗台 & 合規稽核台帳（Zero-PII LLM Gateway）"
  ),
  formulaPreservedTag: c(
    "数学公式与比例尺数字 100% 零损保留",
    "100% lossless preservation of math formulas & ratios",
    "数式・分数・縮尺数値は 100% 無損失で保持",
    "수학 수식·분수·축척 숫자는 100% 무손실 보존",
    "Formula matematik & nisbah dikekalkan 100% tanpa kehilangan",
    "數學公式與比例尺數字 100% 零損保留"
  ),
  runSandboxBtn: (regionCode: RegionCode, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `执行 ${regionCode} 法规脱敏检测并写入合规审计日志`,
        `Run ${regionCode} PII Redaction & Append Compliance Audit Log`,
        `${regionCode} 法規マスキング検証を実行して監査ログに記録`,
        `${regionCode} 법규 비식별화 검사 실행 및 감사 로그 기록`,
        `Jalankan Penyahpengenalan ${regionCode} & Rekod Log Audit`,
        `執行 ${regionCode} 法規去識別化檢測並寫入合規稽核日誌`
      )
    ),
  sandboxResetBtn: c(
    "载入当前语言测试样例",
    "Load Sample PII Input",
    "現言語のサンプル読込",
    "현재 언어 샘플 불러오기",
    "Muat Contoh Input PII",
    "載入目前語言測試樣例"
  ),
  sandboxTokenLabel: (token: string, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `假名令牌：${token}`,
        `Pseudonym Token: ${token}`,
        `仮名トークン：${token}`,
        `가명 토큰: ${token}`,
        `Token Nama Samaran: ${token}`,
        `假名權杖：${token}`
      )
    ),
  sandboxRedactedLabel: (fields: string[], locale: LocaleCode) => {
    const none = uiPick(locale, c("无", "None", "なし", "없음", "Tiada", "無"));
    const joined = fields.length > 0 ? fields.join(", ") : none;
    return uiPick(
      locale,
      c(
        `剥离字段：${joined}`,
        `Redacted Fields: ${joined}`,
        `除去フィールド：${joined}`,
        `마스킹 항목: ${joined}`,
        `Medan Ditanggalkan: ${joined}`,
        `剝離欄位：${joined}`
      )
    );
  },
  auditLogTitlePrefix: c(
    "最近外部 AI 调用隐私合规审计记录（SQLite ",
    "Recent External AI Privacy Compliance Audit Trail (SQLite ",
    "直近の外部 AI 呼び出しプライバシー監査ログ（SQLite ",
    "최근 외부 AI 호출 개인정보 보호 감사 로그 (SQLite ",
    "Rekod Audit Pematuhan Privasi AI Luaran Terkini (SQLite ",
    "最近外部 AI 呼叫隱私合規稽核記錄（SQLite "
  ),
  auditLogTitleSuffix: c("）：", "):", "）：", "):", "):", "）："),
  auditRedactedPrefix: c(
    "剥离:",
    "Redacted:",
    "除去:",
    "마스킹:",
    "Ditanggalkan:",
    "剝離:"
  ),
  regimeMatrixTitle: c(
    "🌍 9 地未成年人数据隐私保护法规矩阵（随当前界面语言自适应展示）：",
    "🌍 9-Region Minor Data Protection Regime Matrix (localized to active UI language):",
    "🌍 9地域・未成年データ保護法規マトリクス（現在の表示言語に連動）：",
    "🌍 9개 지역 미성년자 개인정보 보호 법규 매트릭스 (선택 언어 자동 반영):",
    "🌍 Matriks Peraturan Perlindungan Data Bawah Umur 9 Rantau:",
    "🌍 9 地未成年人資料隱私保護法規矩陣（隨目前介面語言自適應展示）："
  ),
  minorAgeBadge: (age: number, locale: LocaleCode) =>
    uiPick(
      locale,
      c(
        `监护同意线 <${age}岁`,
        `Guardian Consent <${age}`,
        `保護者同意 <${age}歳`,
        `보호자 동의 <${age}세`,
        `Kebenaran Penjaga <${age}`,
        `監護同意線 <${age}歲`
      )
    ),
};
