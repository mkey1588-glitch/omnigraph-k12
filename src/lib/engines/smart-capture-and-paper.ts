import type {
  DifficultyTier,
  GeneratedQuestionInstance,
  LocaleCode,
  RegionCode,
  SubjectId,
} from "@/types/taxonomy";
import {
  ALL_CANONICAL_TOPICS,
  ALL_REGIONAL_ALIGNMENTS,
  CANONICAL_EDGES,
} from "@/data/canonical-graph";
import { REGIONS_DATA } from "@/data/regions-and-subjects";
import {
  c,
  localizeAlignment,
  localizeCustomQuestionExplanation,
  localizeText,
  toTraditionalChinese,
  uiPick,
} from "@/lib/i18n";
import { generateQuestion } from "./item-generator";
import { priorBetaForDifficulty } from "./irt-engine";

// ==================== 1. SMART WRONG-QUESTION CAPTURE & ATTRIBUTION ====================

const TOPIC_SIGNAL_LEXICON: Record<string, string[]> = {
  mt_math_place_value_ops: [
    "余数", "被除数", "运算顺序", "先乘除", "remainder", "quotient",
    "あまり", "商", "四則計算", "나머지", "몫", "사칙연산", "baki", "hasil bahagi",
  ],
  mt_math_frac_concept_equiv: [
    "约分", "通分", "真分数", "假分数", "equivalent fraction",
    "約分", "仮分数", "帯分数", "약분", "통분", "기약분수", "pecahan setara", "permudahkan pecahan",
  ],
  mt_math_frac_add_sub: [
    "异分母", "分数加减", "公分母", "common denominator",
    "異分母", "分数のたし算", "通分して", "이분모", "분수의 덧셈", "공통분모", "penyebut sepunya", "tambah pecahan",
  ],
  mt_math_frac_mul_div: [
    "倒数", "分数除法", "除以一个分数", "reciprocal", "divide fraction",
    "逆数", "分数のわり算", "역수", "분수의 나눗셈", "salingan", "bahagi pecahan",
  ],
  mt_math_ratio_percent: [
    "百分比", "折扣", "条形图", "比与比例", "discount", "percent", "bar model",
    "割合", "パーセント", "割引", "백분율", "할인율", "비와 비율", "peratus", "diskaun", "nisbah",
  ],
  mt_math_geometry_area_perim: [
    "三角形面积", "梯形面积", "周长", "上底下底", "trapezoid", "perimeter",
    "台形の面積", "周りの長さ", "上底", "사다리꼴 넓이", "둘레", "luas trapezium", "perimeter segitiga",
  ],
  mt_math_signed_numbers: [
    "有理数", "负数", "绝对值", "相反数", "乘方优先级", "signed", "absolute value",
    "正負の数", "絶対値", "累乗", "음수", "절댓값", "유리수", "nilai mutlak", "integer negatif",
  ],
  mt_math_alg_expressions: [
    "同类项", "去括号", "整式加减", "like terms", "simplify expression",
    "同類項", "文字式の計算", "カッコを外す", "동류항", "다항식 정리", "sebutan serupa", "ungkapan algebra",
  ],
  mt_math_linear_eq_one: [
    "一元一次方程", "去分母", "移项", "linear equation",
    "一次方程式", "移項", "分母をはらう", "일차방정식", "이항", "persamaan linear satu pemboleh ubah",
  ],
  mt_math_linear_systems: [
    "二元一次方程组", "加减消元", "代入消元", "system of equations",
    "連立方程式", "加減法", "代入法", "연립방정식", "가감법", "대입법", "persamaan linear serentak", "penghapusan",
  ],
  mt_math_coord_linear_func: [
    "一次函数", "斜率", "截距", "y=kx+b", "slope", "intercept",
    "一次関数", "傾き", "切片", "일차함수", "기울기", "절편", "fungsi linear", "kecerunan", "pintasan-y",
  ],
  mt_math_special_products_factor: [
    "完全平方", "平方差", "因式分解", "十字相乘", "(a+b)^2", "(a+b)²", "factor",
    "因数分解", "乗法公式", "たすき掛け", "인수분해", "곱셈공식", "완전제곱식", "pemfaktoran", "kembangan",
  ],
  mt_math_rational_eq: [
    "分式方程", "增根", "最简公分母", "1/x", "rational equation", "extraneous",
    "分数方程式", "無縁解", "분수방정식", "무연근", "persamaan pecahan", "punca palsu", "penyebut",
  ],
  mt_math_radicals_pythagoras: [
    "勾股定理", "二次根式", "斜边", "直角边", "pythagoras", "hypotenuse", "√",
    "三平方の定理", "ピタゴラス", "斜辺", "平方根", "피타고라스", "빗변", "제곱근", "teorem pythagoras", "hipotenus", "punca kuasa dua",
  ],
  mt_math_quad_complete_sq: [
    "一元二次方程", "配方法", "求根公式", "判别式", "x²", "x^2", "quadratic equation", "roots",
    "二次方程式", "平方完成", "解の公式", "判別式", "이차방정식", "완전제곱", "근의 공식", "판별식", "persamaan kuadratik", "penyempurnaan kuasa dua", "pembezalayan",
  ],
  mt_math_quad_function_parabola: [
    "二次函数", "抛物线", "顶点式", "对称轴", "vertex", "parabola", "axis of symmetry",
    "二次関数", "放物線", "頂点", "対称軸", "이차함수", "포물선", "꼭짓점", "대칭축", "fungsi kuadratik", "parabola", "verteks", "paksi simetri",
  ],
  mt_math_trig_right_triangle: [
    "正弦", "余弦", "正切", "sin", "cos", "tan", "仰角", "trigonometry",
    "三角比", "正弦", "余弦", "正接", "仰角", "삼각비", "사인", "코사인", "탄젠트", "trigonometri", "sinus", "kosinus", "tangen",
  ],
  mt_math_func_exp_log: [
    "指数函数", "对数", "log", "ln", "半衰期", "exponential", "logarithm",
    "指数関数", "対数", "半減期", "지수함수", "로그", "반감기", "fungsi eksponen", "logaritma", "separuh hayat",
  ],
  mt_math_prob_stats: [
    "概率", "古典概型", "方差", "中位数", "条件概率", "probability", "median",
    "確率", "中央値", "分散", "条件付き確率", "확률", "중앙값", "분산", "조건부확률", "kebarangkalian", "median", "varians",
  ],
  mt_math_calc_derivative_tangent: [
    "导数", "切线斜率", "极值", "驻点", "f'(x)", "derivative", "tangent",
    "微分係数", "導関数", "接線の傾き", "極値", "미분계수", "도함수", "접선의 기울기", "극값", "pembezaan", "terbitan", "garisan tangen",
  ],
  mt_phy_measurement_density: [
    "密度", "质量与体积", "g/cm³", "kg/m³", "density",
    "密度", "質量と体積", "밀도", "질량과 부피", "ketumpatan", "jisim dan isi padu",
  ],
  mt_phy_speed_motion_graphs: [
    "匀速", "路程时间", "速度时间", "s-t", "v-t", "平均速度", "velocity",
    "等速直線運動", "平均の速さ", "v-tグラフ", "등속 운동", "평균 속력", "이동 거리", "halaju purata", "graf gerakan",
  ],
  mt_phy_forces_newton: [
    "牛顿第二定律", "合外力", "摩擦力", "加速度", "F=ma", "friction", "newton",
    "運動方程式", "ニュートンの第2法則", "合力", "摩擦力", "뉴턴 제2법칙", "알짜힘", "마찰력", "가속도", "hukum newton kedua", "daya paduan", "geseran", "pecutan",
  ],
  mt_phy_circuits_series_parallel: [
    "串联", "并联", "电流表", "电压表", "支路", "series", "parallel circuit",
    "直列回路", "並列回路", "電流計", "電圧計", "직렬회로", "병렬회로", "전류계", "전압계", "litar sesiri", "litar selari", "ammeter", "voltmeter",
  ],
  mt_phy_ohm_law: [
    "欧姆定律", "等效电阻", "1/R", "U/R", "并联电阻", "Ω", "ohm",
    "オームの法則", "合成抵抗", "並列接続", "옴의 법칙", "합성저항", "등가저항", "hukum ohm", "rintangan setara", "perintang",
  ],
  mt_phy_work_kinetic_energy: [
    "动能", "做功", "机械能", "1/2mv", "½mv²", "焦耳", "kinetic energy",
    "運動エネルギー", "仕事", "力学的エネルギー", "ジュール", "운동에너지", "일과 에너지", "역학적 에너지", "tenaga kinetik", "kerja mekanikal", "joule",
  ],
  mt_chem_atomic_periodic: [
    "质子数", "中子数", "核外电子", "离子", "元素周期律", "proton", "neutron", "isotope",
    "陽子数", "中性子数", "価電子", "同位体", "周期表", "양성자수", "중성자수", "동위원소", "원자가전자", "주기율표", "nombor proton", "isotop", "elektron valens", "jadual berkala",
  ],
  mt_chem_bonding_formula: [
    "化合价", "化学式", "离子键", "共价键", "Al2O3", "valence", "ionic",
    "イオン結合", "共有結合", "化学式", "酸化数", "이온결합", "공유결합", "산화수", "화학식", "ikatan ion", "ikatan kovalen", "formula kimia",
  ],
  mt_chem_stoichiometry_conservation: [
    "质量守恒", "化学方程式配平", "恰好完全反应", "stoichiometry", "conservation of mass",
    "質量保存の法則", "化学反応式の係数", "질량 보존 법칙", "화학 반응식 계수", "양적 관계", "keabadian jisim", "stoikiometri", "seimbangkan persamaan kimia",
  ],
  mt_chem_molar_concentration: [
    "物质的量", "摩尔", "mol/L", "溶液稀释", "c1V1", "molarity", "dilution",
    "モル濃度", "物質量", "溶液の希釈", "몰농도", "몰수", "용액 희석", "kemolaran", "kepekatan molar", "pencairan larutan",
  ],
  mt_bio_cell_transport: [
    "渗透作用", "质壁分离", "主动运输", "自由扩散", "半透膜", "osmosis", "active transport",
    "浸透", "原形質分離", "能動輸送", "半透膜", "삼투", "원형질 분리", "능동수송", "반투과성 막", "osmosis", "pengangkutan aktif", "membran separa telap",
  ],
  mt_bio_photosynthesis_resp: [
    "光合作用", "细胞呼吸", "净光合", "真正光合", "光补偿点", "CO₂", "photosynthesis", "respiration",
    "光合成", "細胞呼吸", "光補償点", "見かけの光合成", "광합성", "세포호흡", "보상점", "순광합성", "fotosintesis", "respirasi sel", "titik pampasan",
  ],
  mt_bio_mendelian_genetics: [
    "孟德尔", "基因型", "表现型", "Aa", "杂交", "显性", "隐性", "punnett", "heterozygous",
    "メンデル", "遺伝子型", "表現型", "顕性", "潜性", "멘델", "유전자형", "표현형", "우성", "열성", "잡종", "genotip", "fenotip", "dominan", "resesif", "kacukan",
  ],
  mt_bio_population_ecology: [
    "能量流动", "营养级", "10%", "20%", "食物链", "标志重捕法", "trophic",
    "生態ピラミッド", "食物連鎖", "エネルギー効率", "標識再捕法", "생태계 에너지 흐름", "영양단계", "먹이사슬", "표지재포획법", "aras trofik", "rantai makanan", "aliran tenaga",
  ],
  mt_eng_sentence_sva_tense: [
    "主谓一致", "as well as", "neither", "完成时", "since", "subject-verb", "has been",
    "主語と動詞の一致", "現在完了", "수일치", "현재완료", "주어 동사 일치", "keselarasan subjek-kata kerja", "kala",
  ],
  mt_eng_passive_participle: [
    "被动语态", "非谓语", "现在分词", "过去分词", "seen from", "participle", "passive",
    "受動態", "分詞構文", "過去分詞", "수동태", "분사구문", "현재분사", "과거분사", "ayat pasif", "partisipel",
  ],
  mt_eng_relative_clauses: [
    "定语从句", "关系代词", "关系副词", "which", "where", "whose", "relative clause",
    "関係代名詞", "関係副詞", "関係詞節", "先行詞", "관계대명사", "관계부사", "관계사절", "선행사", "klausa relatif", "kata ganti nama relatif",
  ],
  mt_eng_conditionals_academic: [
    "虚拟语气", "if i had", "would have", "衔接词", "however", "conditional", "subjunctive",
    "仮定法過去完了", "仮定法", "接続副詞", "가정법 과거완료", "가정법", "접속부사", "ayat syarat", "klausa bersyarat",
  ],
  mt_cs_binary_logic: [
    "二进制", "十六进制", "逻辑门", "与或非", "XOR", "AND", "binary", "boolean",
    "二進法", "16進数", "論理回路", "真理値表", "이진수", "십육진수", "논리게이트", "진리표", "nombor perduaan", "get logik", "boolean",
  ],
  mt_cs_loops_trace: [
    "for循环", "while循环", "累加器", "continue", "break", "流程图", "loop trace",
    "ループ処理", "繰り返し", "フローチャート", "変数トレース", "반복문", "순서도", "누적 변수", "gelung for", "gelung while", "carta alir",
  ],
  mt_cs_arrays_binary_search: [
    "二分查找", "数组下标", "mid", "折半查找", "binary search", "array",
    "二分探索", "配列", "ソート済み", "이진 탐색", "배열 인덱스", "오름차순 배열", "carian binari", "tatasusunan",
  ],
  mt_cs_algo_complexity: [
    "时间复杂度", "O(n)", "O(log n)", "O(n²)", "嵌套循环", "递归", "big-o", "complexity",
    "計算量", "オーダー記法", "二重ループ", "再帰", "시간 복잡도", "중첩 반복문", "재귀", "빅오", "kerumitan masa", "gelung bersarang",
  ],
  mt_geo_map_scale_timezones: [
    "比例尺", "经纬网", "图上距离", "实地距离", "1:50000", "map scale", "latitude",
    "縮尺", "時差", "経度", "緯度", "축척", "시차", "경도", "위도", "skala peta", "zon waktu", "longitud", "latitud",
  ],
  mt_geo_contour_elevation: [
    "等高线", "等高距", "山脊", "山谷", "陡崖", "相对高度", "contour", "elevation",
    "等高線", "尾根", "谷", "比高", "地形図", "등고선", "능선", "계곡", "상대고도", "garisan kontur", "ketinggian", "rabung",
  ],
  mt_geo_solar_angle_climate: [
    "正午太阳高度", "直射点", "夏至", "冬至", "地中海气候", "季风", "solar altitude", "solstice",
    "南中高度", "夏至", "冬至", "地中海性気候", "季節風", "남중고도", "하지", "동지", "지중해성 기후", "계절풍", "sudut tegak matahari", "solstis", "monsun",
  ],
  mt_his_chronology_evidence: [
    "公元前", "公元元年", "世纪", "BCE", "CE", "周年", "纪年",
    "紀元前", "世紀", "一次史料", "二次史料", "기원전", "세기", "1차 사료", "2차 사료", "연대 계산", "sebelum masihi", "abad", "sumber primer",
  ],
  mt_his_trade_demographics: [
    "丝绸之路", "哥伦布大交换", "朝贡贸易", "白银", "史料互证", "silk road", "columbian",
    "シルクロード", "コロンブス交換", "銀の流通", "실크로드", "콜럼버스 교환", "은 유통", "laluan sutera", "pertukaran columbian",
  ],
  mt_his_industrial_modern: [
    "工业革命", "蒸汽机", "城市化", "人口普查", "铁路里程", "industrial revolution", "urbanization",
    "産業革命", "蒸気機関", "都市化", "鉄道網", "산업혁명", "증기기관", "도시화", "철도", "revolusi perindustrian", "pembandaran", "enjin wap",
  ],
  mt_lit_main_idea_structure: [
    "中心论点", "总分总", "论证结构", "段意概括", "main idea", "thesis",
    "中心主張", "段落構成", "要旨", "핵심 논지", "글의 구조", "중심 문장", "idea utama", "struktur hujah", "tesis",
  ],
  mt_lit_inference_rhetoric: [
    "修辞手法", "比喻", "拟人", "排比", "言外之意", "隐含推断", "metaphor", "inference",
    "比喩", "擬人法", "修辞技法", "行間を読む", "비유", "의인법", "수사법", "추론", "metafora", "inferens", "gaya bahasa",
  ],
  mt_lit_logical_fallacy: [
    "逻辑谬误", "相关性", "因果倒置", "幸存者偏差", "以偏概全", "稻草人", "fallacy", "survivorship",
    "論理的誤謬", "相関と因果", "生存者バイアス", "藁人形論法", "논리적 오류", "상관관계와 인과관계", "생존자 편향", "성급한 일반화", "falasi logik", "korelasi", "bias kemandirian",
  ],
  mt_lit_classical_comparative: [
    "文言实词", "古今异义", "词类活用", "互文", "对比阅读", "classical chinese",
    "古文", "漢文", "比較読解", "고전 산문", "비교 독해", "문맥적 의미", "teks klasik", "bacaan perbandingan",
  ],
};

/**
 * Language-agnostic structural formula & notation signatures for hybrid attribution
 */
const FORMULA_SIGNATURES_BY_TOPIC: Partial<Record<string, RegExp[]>> = {
  mt_phy_ohm_law: [
    /\b1\s*\/\s*r\b/i,
    /\br[12]\s*=\s*\d+(?:\.\d+)?\s*(?:Ω|ohm)/i,
    /\b[uv]\s*=\s*i\s*\*?\s*r\b/i,
  ],
  mt_math_rational_eq: [
    /\b\d+\s*\/\s*\(?x\s*[+-]\s*\d+\)?/i,
    /\b1\s*\/\s*x\s*[+=]/i,
  ],
  mt_math_quad_function_parabola: [
    /y\s*=\s*[+-]?\d*\s*\(\s*x\s*[+-]\s*\d+\s*\)\s*(?:\^2|²)/i,
    /y\s*=\s*[+-]?\d*x(?:\^2|²)\s*[+-]/i,
  ],
  mt_math_quad_complete_sq: [
    /x(?:\^2|²)\s*[+-]\s*\d*x\s*[+-]\s*\d+\s*=\s*0/i,
    /b(?:\^2|²)\s*-\s*4\s*\*?\s*a\s*\*?\s*c/i,
  ],
  mt_math_linear_eq_one: [
    /\b\d+x\s*[+-]\s*\d+\s*=\s*[+-]?\d+/i,
  ],
  mt_chem_molar_concentration: [
    /\bc1\s*\*?\s*v1\s*=\s*c2\s*\*?\s*v2\b/i,
    /\b\d+(?:\.\d+)?\s*mol\s*\/\s*(?:l|dm(?:\^3|³))\b/i,
  ],
  mt_phy_work_kinetic_energy: [
    /\b(?:1\/2|0\.5)\s*\*?\s*m\s*\*?\s*v(?:\^2|²)/i,
  ],
  mt_phy_forces_newton: [
    /\bf\s*=\s*m\s*\*?\s*a\b/i,
  ],
  mt_cs_algo_complexity: [
    /\bo\s*\(\s*(?:1|n|log\s*n|n\s*log\s*n|n\^2|n²|2\^n)\s*\)/i,
  ],
  mt_geo_map_scale_timezones: [
    /\b1\s*:\s*\d{3,}\b/,
  ],
  mt_bio_mendelian_genetics: [
    /\b(?:AA|Aa|aa)\s*[×x*]\s*(?:AA|Aa|aa)\b/,
  ],
  mt_eng_relative_clauses: [
    /\b(?:museum|school|house|city|place|person|scientist|book)\s+_{2,}/i,
  ],
  mt_eng_conditionals_academic: [
    /\bif\s+\w+\s+had\s+\w+ed\b/i,
    /\bwould\s+have\b/i,
  ],
};

export interface SmartCaptureMatchCandidate {
  topicId: string;
  subjectId: SubjectId;
  title: string;
  titleZh: string;
  titleEn: string;
  confidence: number;
  standardCode: string;
  localChapterTitle: string;
  localStageLabel: string;
}

export interface RootCausePrereqBrief {
  topicId: string;
  subjectId: SubjectId;
  title: string;
  titleZh: string;
  titleEn: string;
  relationType: "hard" | "soft" | "cross_subject";
  standardCode: string;
  reason: string;
  reasonZh: string;
  reasonEn: string;
}

export interface SmartCaptureAnalysisResult {
  matchedPrimary: SmartCaptureMatchCandidate;
  alternatives: SmartCaptureMatchCandidate[];
  upstreamRootCauses: RootCausePrereqBrief[];
  detectedMisconception: {
    tag: string;
    label: string;
    labelZh: string;
    labelEn: string;
    remediationTip: string;
    remediationTipZh: string;
    remediationTipEn: string;
  };
  canonicalSnapshot: GeneratedQuestionInstance;
  twinVariant: GeneratedQuestionInstance;
  analysisSummary: string;
  analysisSummaryZh: string;
}

export function analyzeCapturedWrongQuestion(params: {
  sanitizedQuestionText: string;
  studentWrongAnswer?: string;
  regionCode: RegionCode;
  locale?: LocaleCode;
  preferredSubjectId?: SubjectId | "all";
  seed?: string;
  extraEdges?: Array<{
    topicId: string;
    prerequisiteId: string;
    relationType: "hard" | "soft" | "cross_subject";
    reasonZh?: string;
    reasonEn?: string;
  }>;
}): SmartCaptureAnalysisResult {
  const regMeta = REGIONS_DATA.find((r) => r.code === params.regionCode);
  const locale: LocaleCode = params.locale ?? regMeta?.primaryLocale ?? "zh-CN";
  const qLower = params.sanitizedQuestionText.toLowerCase();

  const scored = ALL_CANONICAL_TOPICS.map((topic) => {
    let score = 0;
    if (
      params.preferredSubjectId &&
      params.preferredSubjectId !== "all" &&
      topic.subjectId === params.preferredSubjectId
    ) {
      score += 4;
    }

    // 1. Structural mathematical / scientific / grammar formula regex signatures
    const sigs = FORMULA_SIGNATURES_BY_TOPIC[topic.id] ?? [];
    for (const re of sigs) {
      if (re.test(params.sanitizedQuestionText)) {
        score += 15;
      }
    }

    // 2. Match canonical topic titles across all 6 locales (including auto-converted zh-TW)
    const titleVariants = [
      ...Object.values(topic.title),
      toTraditionalChinese(topic.title["zh-CN"]),
    ];
    for (const val of titleVariants) {
      if (val && qLower.includes(val.toLowerCase())) score += 12;
    }

    // 3. Curated 6-locale domain signal lexicon
    const keywords = TOPIC_SIGNAL_LEXICON[topic.id] ?? [];
    for (const kw of keywords) {
      const kwTw = toTraditionalChinese(kw);
      if (qLower.includes(kw.toLowerCase()) || (kwTw !== kw && qLower.includes(kwTw.toLowerCase()))) {
        score += 8;
      }
    }

    // 4. Hybrid n-gram & BM25-style token overlap across descriptions + microLesson intuition & misconceptions
    const miscTextZh = topic.microLesson.misconceptions
      .map((m) => `${m.label["zh-CN"]} ${m.wrongPattern["zh-CN"]}`)
      .join(" ");
    const miscTextJa = topic.microLesson.misconceptions
      .map((m) => `${m.label.ja ?? ""} ${m.wrongPattern.ja ?? ""}`)
      .join(" ");
    const cjkPool = [
      topic.description["zh-CN"],
      toTraditionalChinese(topic.description["zh-CN"]),
      topic.description.ja ?? "",
      miscTextZh,
      miscTextJa,
    ].join(" ");
    for (let i = 0; i < cjkPool.length - 1; i++) {
      const bi = cjkPool.slice(i, i + 2);
      if (/[\u3040-\u30ff\u3400-\u9fff]{2}/.test(bi) && qLower.includes(bi.toLowerCase())) {
        score += 0.6;
      }
    }

    // Korean Hangul 2-syllable stem overlap
    const miscTextKo = topic.microLesson.misconceptions
      .map((m) => `${m.label.ko ?? ""} ${m.wrongPattern.ko ?? ""}`)
      .join(" ");
    const koPool = `${topic.title.ko ?? ""} ${topic.description.ko ?? ""} ${miscTextKo}`;
    for (let i = 0; i < koPool.length - 1; i++) {
      const bi = koPool.slice(i, i + 2);
      if (/[\uac00-\ud7a3]{2}/.test(bi) && qLower.includes(bi)) {
        score += 1.0;
      }
    }

    // Latin (English & Bahasa Melayu) word overlap
    const miscTextLatin = topic.microLesson.misconceptions
      .map((m) => `${m.label.en} ${m.label.ms ?? ""}`)
      .join(" ");
    const latinPool = `${topic.description.en} ${topic.description.ms ?? ""} ${miscTextLatin}`;
    const latinWords = [
      ...new Set(
        latinPool
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter((w) => w.length >= 4)
      ),
    ];
    for (const w of latinWords) {
      if (qLower.includes(w)) score += 1.4;
    }

    const align = ALL_REGIONAL_ALIGNMENTS.find(
      (a) => a.topicId === topic.id && a.regionCode === params.regionCode
    );
    if (align && qLower.includes(align.standardCode.toLowerCase())) {
      score += 18;
    }

    return { topic, align, score };
  }).sort((a, b) => b.score - a.score);

  const top3 = scored.slice(0, 3).map((entry, idx) => {
    const rawConf = Math.min(0.98, Math.max(0.56, 0.72 + entry.score * 0.012 - idx * 0.11));
    const locAln = localizeAlignment(entry.align, entry.topic, regMeta, locale);
    const titleLoc = localizeText(entry.topic.title, locale, false);
    return {
      topicId: entry.topic.id,
      subjectId: entry.topic.subjectId,
      title: titleLoc,
      titleZh: entry.topic.title["zh-CN"],
      titleEn: entry.topic.title.en,
      confidence: Math.round(rawConf * 100) / 100,
      standardCode: entry.align?.standardCode ?? "CORE-STD",
      localChapterTitle: locAln?.localChapterTitle ?? titleLoc,
      localStageLabel: locAln?.localStageLabel ?? `G${entry.topic.baselineGrade}`,
    };
  });

  const primaryTopic = scored[0].topic;
  const primaryCandidate = top3[0];

  // Upstream prerequisite root causes from Canonical DAG + Custom School Graph Studio Edges
  const seenPrereqs = new Set<string>();
  const upstreamRootCauses: RootCausePrereqBrief[] = [];

  for (const edge of CANONICAL_EDGES) {
    if (edge.topicId !== primaryTopic.id) continue;
    const preTopic = ALL_CANONICAL_TOPICS.find((t) => t.id === edge.prerequisiteId);
    if (!preTopic) continue;
    seenPrereqs.add(edge.prerequisiteId);
    const preAlign = ALL_REGIONAL_ALIGNMENTS.find(
      (a) => a.topicId === edge.prerequisiteId && a.regionCode === params.regionCode
    );
    upstreamRootCauses.push({
      topicId: edge.prerequisiteId,
      subjectId: preTopic.subjectId,
      title: localizeText(preTopic.title, locale, false),
      titleZh: preTopic.title["zh-CN"],
      titleEn: preTopic.title.en,
      relationType: edge.relationType,
      standardCode: preAlign?.standardCode ?? "PRE-STD",
      reason: localizeText(edge.reason, locale, false),
      reasonZh: edge.reason["zh-CN"],
      reasonEn: edge.reason.en,
    });
  }

  for (const custom of params.extraEdges ?? []) {
    if (custom.topicId !== primaryTopic.id || seenPrereqs.has(custom.prerequisiteId)) {
      continue;
    }
    const preTopic = ALL_CANONICAL_TOPICS.find((t) => t.id === custom.prerequisiteId);
    if (!preTopic) continue;
    seenPrereqs.add(custom.prerequisiteId);
    const preAlign = ALL_REGIONAL_ALIGNMENTS.find(
      (a) => a.topicId === custom.prerequisiteId && a.regionCode === params.regionCode
    );
    const effectiveRel =
      preTopic.subjectId !== primaryTopic.subjectId
        ? "cross_subject"
        : custom.relationType;
    const rZh = custom.reasonZh || "校本先修依赖";
    const rEn = custom.reasonEn || "School-configured prerequisite edge";
    upstreamRootCauses.push({
      topicId: custom.prerequisiteId,
      subjectId: preTopic.subjectId,
      title: localizeText(preTopic.title, locale, false),
      titleZh: preTopic.title["zh-CN"],
      titleEn: preTopic.title.en,
      relationType: effectiveRel,
      standardCode: preAlign?.standardCode ?? "PRE-STD",
      reason: localizeText({ "zh-CN": rZh, en: rEn }, locale, false),
      reasonZh: rZh,
      reasonEn: rEn,
    });
  }

  const firstMisc = primaryTopic.microLesson.misconceptions[0] ?? {
    tag: "misc_general_careless",
    label: { "zh-CN": "概念边界偏移", en: "Boundary slip" },
    wrongPattern: { "zh-CN": "关键概念边界或符号变形失误", en: "Conceptual boundary slip" },
    remediationTip: {
      "zh-CN": "回溯上游先修微课并完成 3 道同构孪生变式清零。",
      en: "Review micro-lesson and solve 3 twin variants.",
    },
  };

  const miscLabelLoc = localizeText(firstMisc.wrongPattern, locale, false);
  const miscTipLoc = localizeText(firstMisc.remediationTip, locale, false);

  const baseSeed = params.seed ?? `capture_${Date.now()}`;
  const canonicalSnapshot = generateQuestion({
    topicId: primaryTopic.id,
    difficulty: "standard",
    seed: `${baseSeed}::orig`,
    regionCode: params.regionCode,
    variantIndex: 0,
  });

  const trimmedUserStem = params.sanitizedQuestionText.trim();
  const hasCjkInUserStem = /[\u3400-\u9FFF]/.test(trimmedUserStem);
  const snapshotToSave: GeneratedQuestionInstance =
    trimmedUserStem.length >= 8
      ? {
          ...canonicalSnapshot,
          promptZh: `【录题原题归档】${trimmedUserStem}\n\n（系统同构标定母题参考：${canonicalSnapshot.promptZh}）`,
          promptZhTw: toTraditionalChinese(
            `【錄題原題歸檔】${trimmedUserStem}\n\n（系統同構標定母題參考：${canonicalSnapshot.promptZh}）`
          ),
          promptEn: hasCjkInUserStem
            ? canonicalSnapshot.promptEn
            : `[Captured Problem] ${trimmedUserStem}\n\n(Calibrated Twin Reference: ${canonicalSnapshot.promptEn})`,
        }
      : canonicalSnapshot;

  const twinVariant = generateQuestion({
    topicId: primaryTopic.id,
    difficulty: "standard",
    seed: `${baseSeed}::twin`,
    regionCode: params.regionCode,
    variantIndex: 1,
  });

  const confPct = Math.round(primaryCandidate.confidence * 100);
  const crossBridgeLabel = uiPick(
    locale,
    c("跨学科先修", "cross-subject bridge", "教科横断の前提", "교과 간 선수", "jambatan rentas subjek")
  );
  const directPrereqLabel = uiPick(
    locale,
    c("直接先修", "direct prerequisite", "直接の前提", "직접 선수", "prasyarat langsung")
  );

  const analysisSummary = uiPick(
    locale,
    c(
      `已将该错题精准锚定至【${params.regionCode} · ${primaryCandidate.localStageLabel} · ${primaryCandidate.standardCode}】《${primaryCandidate.title}》（匹配置信度 ${confPct}%）。${
        params.studentWrongAnswer ? `结合你填写的错误作答「${params.studentWrongAnswer}」，` : ""
      }高发认知迷思为「${miscLabelLoc}」。${
        upstreamRootCauses.length > 0
          ? `图谱溯源显示需同步排查 ${upstreamRootCauses
              .map(
                (u) =>
                  `《${u.title}》(${
                    u.relationType === "cross_subject" ? crossBridgeLabel : directPrereqLabel
                  })`
              )
              .join("、")}。`
          : "该节点为本学段基础根节点，建议直接通过下方孪生变式题完成三连清零。"
      }`,
      `Anchored to [${params.regionCode} · ${primaryCandidate.localStageLabel} · ${primaryCandidate.standardCode}] "${primaryCandidate.title}" (${confPct}% confidence). ${
        params.studentWrongAnswer ? `Based on your attempt "${params.studentWrongAnswer}", ` : ""
      }likely misconception: "${miscLabelLoc}". ${
        upstreamRootCauses.length > 0
          ? `Graph root-cause tracing recommends checking ${upstreamRootCauses
              .map(
                (u) =>
                  `"${u.title}" (${
                    u.relationType === "cross_subject" ? crossBridgeLabel : directPrereqLabel
                  })`
              )
              .join(", ")}.`
          : "This is a foundational root node—complete 3 consecutive Twin Variants below to clear it."
      }`,
      `この誤答を【${params.regionCode} · ${primaryCandidate.localStageLabel} · ${primaryCandidate.standardCode}】「${primaryCandidate.title}」（一致度 ${confPct}%）に特定しました。${
        params.studentWrongAnswer ? `入力された解答「${params.studentWrongAnswer}」から、` : ""
      }主なつまずきパターンは「${miscLabelLoc}」です。${
        upstreamRootCauses.length > 0
          ? `前提グラフより ${upstreamRootCauses
              .map(
                (u) =>
                  `「${u.title}」（${
                    u.relationType === "cross_subject" ? crossBridgeLabel : directPrereqLabel
                  }）`
              )
              .join("・")} の確認を推奨します。`
          : "この単元は基礎ルートノードです。下の双子類題で3連続正解を達成しましょう。"
      }`,
      `이 오답을 [${params.regionCode} · ${primaryCandidate.localStageLabel} · ${primaryCandidate.standardCode}] 「${primaryCandidate.title}」(신뢰도 ${confPct}%)에 매핑했습니다. ${
        params.studentWrongAnswer ? `입력한 오답 「${params.studentWrongAnswer}」 기준 ` : ""
      }주요 오개념은 「${miscLabelLoc}」입니다. ${
        upstreamRootCauses.length > 0
          ? `지식그래프 역추적 결과 ${upstreamRootCauses
              .map(
                (u) =>
                  `「${u.title}」(${
                    u.relationType === "cross_subject" ? crossBridgeLabel : directPrereqLabel
                  })`
              )
              .join(", ")} 점검을 권장합니다.`
          : "기초 루트 노드이므로 아래 쌍둥이 변형문제로 3연속 클리어를 달성하세요."
      }`,
      `Dipetakan kepada [${params.regionCode} · ${primaryCandidate.localStageLabel} · ${primaryCandidate.standardCode}] "${primaryCandidate.title}" (keyakinan ${confPct}%). ${
        params.studentWrongAnswer ? `Berdasarkan cubaan "${params.studentWrongAnswer}", ` : ""
      }salah tanggapan utama: "${miscLabelLoc}". ${
        upstreamRootCauses.length > 0
          ? `Surihan graf mencadangkan semakan ${upstreamRootCauses
              .map(
                (u) =>
                  `"${u.title}" (${
                    u.relationType === "cross_subject" ? crossBridgeLabel : directPrereqLabel
                  })`
              )
              .join(", ")}.`
          : "Ini ialah nod asas—selesaikan 3 variasi kembar berturut-turut di bawah."
      }`
    )
  );

  return {
    matchedPrimary: primaryCandidate,
    alternatives: top3.slice(1),
    upstreamRootCauses,
    detectedMisconception: {
      tag: firstMisc.tag,
      label: miscLabelLoc,
      labelZh: firstMisc.wrongPattern["zh-CN"],
      labelEn: firstMisc.wrongPattern.en,
      remediationTip: miscTipLoc,
      remediationTipZh: firstMisc.remediationTip["zh-CN"],
      remediationTipEn: firstMisc.remediationTip.en,
    },
    canonicalSnapshot: snapshotToSave,
    twinVariant,
    analysisSummary,
    analysisSummaryZh: analysisSummary,
  };
}

// ==================== 2. SMART 9-REGION A/B EXAM PAPER & TWO-WAY BLUEPRINT BUILDER ====================

export interface CustomQuestionInput {
  id: string;
  topicId: string;
  difficulty: DifficultyTier;
  promptZh: string;
  promptEn: string;
  latexFormula?: string | null;
  choicesJson: string[];
  answer: string;
  explanationZh: string;
}

export interface BlueprintRow {
  itemNumber: number;
  topicId: string;
  topicTitle: string;
  topicTitleZh: string;
  topicTitleEn: string;
  standardCode: string;
  localChapterTitle: string;
  cognitiveType: string;
  difficulty: DifficultyTier;
  calibratedBeta: number;
  points: number;
  sourceType: "canonical_generator" | "school_custom";
  answerA: string;
  answerB: string;
}

export interface ExamPaperItem {
  itemNumber: number;
  points: number;
  standardCode: string;
  topicId: string;
  topicTitle: string;
  topicTitleZh: string;
  topicTitleEn: string;
  sourceType: "canonical_generator" | "school_custom";
  instance: GeneratedQuestionInstance;
}

export interface SmartExamBundle {
  paperTitle: string;
  regionCode: RegionCode;
  subjectId: SubjectId;
  totalPoints: number;
  totalItems: number;
  averageBeta: number;
  blueprint: BlueprintRow[];
  paperA: ExamPaperItem[];
  paperB: ExamPaperItem[];
}

export function buildSmartExamPapers(params: {
  paperTitle?: string;
  regionCode: RegionCode;
  locale?: LocaleCode;
  subjectId: SubjectId;
  topicIds: string[];
  totalItems: number;
  ratio: { basicPct: number; standardPct: number; challengePct: number };
  paperSeed: string;
  irtBetaByTemplate?: Record<string, number>;
  customQuestions?: CustomQuestionInput[];
}): SmartExamBundle {
  const regMeta = REGIONS_DATA.find((r) => r.code === params.regionCode);
  const locale: LocaleCode = params.locale ?? regMeta?.primaryLocale ?? "zh-CN";

  const validTopics = ALL_CANONICAL_TOPICS.filter((t) =>
    params.topicIds.includes(t.id)
  ).sort((a, b) => a.baselineGrade - b.baselineGrade);

  const fallbackTopics =
    validTopics.length > 0
      ? validTopics
      : ALL_CANONICAL_TOPICS.filter((t) => t.subjectId === params.subjectId).sort(
          (a, b) => a.baselineGrade - b.baselineGrade
        );

  const total = Math.max(3, Math.min(25, params.totalItems));
  const sumPct =
    params.ratio.basicPct + params.ratio.standardPct + params.ratio.challengePct || 100;

  const nBasic = Math.round((total * params.ratio.basicPct) / sumPct);
  const nChallenge = Math.round((total * params.ratio.challengePct) / sumPct);
  const nStandard = Math.max(0, total - nBasic - nChallenge);

  const tierSchedule: DifficultyTier[] = [
    ...Array<DifficultyTier>(nBasic).fill("basic"),
    ...Array<DifficultyTier>(nStandard).fill("standard"),
    ...Array<DifficultyTier>(nChallenge).fill("challenge"),
  ];
  while (tierSchedule.length < total) tierSchedule.push("standard");
  tierSchedule.length = total;

  const rawWeights = tierSchedule.map((d) =>
    d === "basic" ? 4 : d === "standard" ? 6 : 8
  );
  const weightSum = rawWeights.reduce((acc, v) => acc + v, 0) || 1;
  const pointsList = rawWeights.map((w) => Math.max(2, Math.round((w * 100) / weightSum)));
  const pointDiff = 100 - pointsList.reduce((a, b) => a + b, 0);
  if (pointsList.length > 0) {
    pointsList[pointsList.length - 1] += pointDiff;
  }

  const blueprint: BlueprintRow[] = [];
  const paperA: ExamPaperItem[] = [];
  const paperB: ExamPaperItem[] = [];
  const usedCustomIds = new Set<string>();

  for (let i = 0; i < total; i++) {
    const topic = fallbackTopics[i % fallbackTopics.length];
    const tier = tierSchedule[i];
    const pts = pointsList[i];
    const rawAlign = ALL_REGIONAL_ALIGNMENTS.find(
      (a) => a.topicId === topic.id && a.regionCode === params.regionCode
    );
    const locAlign = localizeAlignment(rawAlign, topic, regMeta, locale);
    const stdCode = rawAlign?.standardCode ?? "STD-CORE";
    const topicTitleLoc = localizeText(topic.title, locale, false);
    const chapter = locAlign?.localChapterTitle ?? topicTitleLoc;

    const matchingCustom = (params.customQuestions ?? []).find(
      (cq) =>
        cq.topicId === topic.id &&
        cq.difficulty === tier &&
        !usedCustomIds.has(cq.id)
    );

    if (matchingCustom) {
      usedCustomIds.add(matchingCustom.id);
      const keys = ["A", "B", "C", "D"] as const;
      const choicesA = matchingCustom.choicesJson.slice(0, 4).map((txt, idx) => ({
        key: keys[idx],
        text: txt,
        textEn: txt,
      }));
      const rawOptions = matchingCustom.choicesJson.slice(0, 4);
      const ansIdxA = keys.indexOf(matchingCustom.answer as "A" | "B" | "C" | "D");
      const correctText = ansIdxA >= 0 ? rawOptions[ansIdxA] : matchingCustom.answer;
      const reversedOptions = [...rawOptions].reverse();
      const ansIdxB = reversedOptions.indexOf(correctText);
      const answerB =
        choicesA.length === 4 && ansIdxB >= 0 ? keys[ansIdxB] : matchingCustom.answer;

      const cleanExplEn = localizeCustomQuestionExplanation(matchingCustom, "en");

      const instA: GeneratedQuestionInstance = {
        instanceId: `custom_${matchingCustom.id}_A`,
        templateId: matchingCustom.id,
        topicId: topic.id,
        seed: `${params.paperSeed}::customA`,
        difficulty: tier,
        itemType: choicesA.length === 4 ? "choice" : "expression",
        promptZh: matchingCustom.promptZh,
        promptEn: matchingCustom.promptEn,
        latexFormula: matchingCustom.latexFormula ?? undefined,
        choices: choicesA.length === 4 ? choicesA : undefined,
        answer: matchingCustom.answer,
        explanationZh: matchingCustom.explanationZh,
        explanationEn: cleanExplEn,
        scaffolds: [],
      };

      const instB: GeneratedQuestionInstance = {
        ...instA,
        instanceId: `custom_${matchingCustom.id}_B`,
        seed: `${params.paperSeed}::customB`,
        choices:
          choicesA.length === 4
            ? reversedOptions.map((txt, idx) => ({
                key: keys[idx],
                text: txt,
                textEn: txt,
              }))
            : undefined,
        answer: answerB,
      };

      const beta = priorBetaForDifficulty(tier, topic.baselineGrade);
      paperA.push({
        itemNumber: i + 1,
        points: pts,
        standardCode: stdCode,
        topicId: topic.id,
        topicTitle: topicTitleLoc,
        topicTitleZh: topic.title["zh-CN"],
        topicTitleEn: topic.title.en,
        sourceType: "school_custom",
        instance: instA,
      });
      paperB.push({
        itemNumber: i + 1,
        points: pts,
        standardCode: stdCode,
        topicId: topic.id,
        topicTitle: topicTitleLoc,
        topicTitleZh: topic.title["zh-CN"],
        topicTitleEn: topic.title.en,
        sourceType: "school_custom",
        instance: instB,
      });
      blueprint.push({
        itemNumber: i + 1,
        topicId: topic.id,
        topicTitle: topicTitleLoc,
        topicTitleZh: topic.title["zh-CN"],
        topicTitleEn: topic.title.en,
        standardCode: stdCode,
        localChapterTitle: chapter,
        cognitiveType: topic.cognitiveType,
        difficulty: tier,
        calibratedBeta: beta,
        points: pts,
        sourceType: "school_custom",
        answerA: instA.answer,
        answerB: instB.answer,
      });
      continue;
    }

    const instA = generateQuestion({
      topicId: topic.id,
      difficulty: tier,
      seed: `${params.paperSeed}::item${i + 1}::PaperA`,
      regionCode: params.regionCode,
      variantIndex: i,
    });

    const instB = generateQuestion({
      topicId: topic.id,
      difficulty: tier,
      seed: `${params.paperSeed}::item${i + 1}::PaperB_Twin`,
      regionCode: params.regionCode,
      variantIndex: i + 101,
    });

    const calibratedBeta =
      params.irtBetaByTemplate?.[instA.templateId] ??
      priorBetaForDifficulty(tier, topic.baselineGrade);

    paperA.push({
      itemNumber: i + 1,
      points: pts,
      standardCode: stdCode,
      topicId: topic.id,
      topicTitle: topicTitleLoc,
      topicTitleZh: topic.title["zh-CN"],
      topicTitleEn: topic.title.en,
      sourceType: "canonical_generator",
      instance: instA,
    });
    paperB.push({
      itemNumber: i + 1,
      points: pts,
      standardCode: stdCode,
      topicId: topic.id,
      topicTitle: topicTitleLoc,
      topicTitleZh: topic.title["zh-CN"],
      topicTitleEn: topic.title.en,
      sourceType: "canonical_generator",
      instance: instB,
    });
    blueprint.push({
      itemNumber: i + 1,
      topicId: topic.id,
      topicTitle: topicTitleLoc,
      topicTitleZh: topic.title["zh-CN"],
      topicTitleEn: topic.title.en,
      standardCode: stdCode,
      localChapterTitle: chapter,
      cognitiveType: topic.cognitiveType,
      difficulty: tier,
      calibratedBeta: Math.round(calibratedBeta * 100) / 100,
      points: pts,
      sourceType: "canonical_generator",
      answerA: instA.answer,
      answerB: instB.answer,
    });
  }

  const totalPoints = blueprint.reduce((s, r) => s + r.points, 0);
  const averageBeta =
    Math.round(
      (blueprint.reduce((s, r) => s + r.calibratedBeta, 0) /
        Math.max(1, blueprint.length)) *
        100
    ) / 100;

  const defaultPaperTitle = uiPick(
    locale,
    c(
      `${params.regionCode} 课标对齐 · 阶段性诊断测评卷（A/B 平行防作弊卷）`,
      `${params.regionCode} Standards-Aligned Diagnostic Assessment (Parallel Form A / B)`,
      `${params.regionCode} 基準準拠・段階診断テスト（A/B 並行フォーム）`,
      `${params.regionCode} 교육과정 정렬 · 단계별 진단평가 (A/B 평행형 시험지)`,
      `Penilaian Diagnostik Jajaran Standard ${params.regionCode} (Kertas Selari A / B)`
    )
  );

  return {
    paperTitle: params.paperTitle?.trim() || defaultPaperTitle,
    regionCode: params.regionCode,
    subjectId: params.subjectId,
    totalPoints,
    totalItems: total,
    averageBeta,
    blueprint,
    paperA,
    paperB,
  };
}
