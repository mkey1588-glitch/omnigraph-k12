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
  mt_math_place_value_ops: ["余数", "被除数", "运算顺序", "先乘除", "remainder", "quotient"],
  mt_math_frac_concept_equiv: ["约分", "通分", "真分数", "假分数", "equivalent fraction"],
  mt_math_frac_add_sub: ["异分母", "分数加减", "公分母", "common denominator"],
  mt_math_frac_mul_div: ["倒数", "分数除法", "除以一个分数", "reciprocal", "divide fraction"],
  mt_math_ratio_percent: ["百分比", "折扣", "条形图", "比与比例", "discount", "percent", "bar model"],
  mt_math_geometry_area_perim: ["三角形面积", "梯形面积", "周长", "上底下底", "trapezoid", "perimeter"],
  mt_math_signed_numbers: ["有理数", "负数", "绝对值", "相反数", "乘方优先级", "signed", "absolute value"],
  mt_math_alg_expressions: ["同类项", "去括号", "整式加减", "like terms", "simplify expression"],
  mt_math_linear_eq_one: ["一元一次方程", "去分母", "移项", "linear equation"],
  mt_math_linear_systems: ["二元一次方程组", "加减消元", "代入消元", "system of equations"],
  mt_math_coord_linear_func: ["一次函数", "斜率", "截距", "y=kx+b", "slope", "intercept"],
  mt_math_special_products_factor: ["完全平方", "平方差", "因式分解", "十字相乘", "(a+b)^2", "(a+b)²", "factor"],
  mt_math_rational_eq: ["分式方程", "增根", "最简公分母", "1/x", "rational equation", "extraneous"],
  mt_math_radicals_pythagoras: ["勾股定理", "二次根式", "斜边", "直角边", "pythagoras", "hypotenuse", "√"],
  mt_math_quad_complete_sq: ["一元二次方程", "配方法", "求根公式", "判别式", "x²", "x^2", "quadratic equation", "roots"],
  mt_math_quad_function_parabola: ["二次函数", "抛物线", "顶点式", "对称轴", "vertex", "parabola", "axis of symmetry"],
  mt_math_trig_right_triangle: ["正弦", "余弦", "正切", "sin", "cos", "tan", "仰角", "trigonometry"],
  mt_math_func_exp_log: ["指数函数", "对数", "log", "ln", "半衰期", "exponential", "logarithm"],
  mt_math_prob_stats: ["概率", "古典概型", "方差", "中位数", "条件概率", "probability", "median"],
  mt_math_calc_derivative_tangent: ["导数", "切线斜率", "极值", "驻点", "f'(x)", "derivative", "tangent"],
  mt_phy_measurement_density: ["密度", "质量与体积", "g/cm³", "kg/m³", "density"],
  mt_phy_speed_motion_graphs: ["匀速", "路程时间", "速度时间", "s-t", "v-t", "平均速度", "velocity"],
  mt_phy_forces_newton: ["牛顿第二定律", "合外力", "摩擦力", "加速度", "F=ma", "friction", "newton"],
  mt_phy_circuits_series_parallel: ["串联", "并联", "电流表", "电压表", "支路", "series", "parallel circuit"],
  mt_phy_ohm_law: ["欧姆定律", "等效电阻", "1/R", "U/R", "并联电阻", "Ω", "ohm"],
  mt_phy_work_kinetic_energy: ["动能", "做功", "机械能", "1/2mv", "½mv²", "焦耳", "kinetic energy"],
  mt_chem_atomic_periodic: ["质子数", "中子数", "核外电子", "离子", "元素周期律", "proton", "neutron", "isotope"],
  mt_chem_bonding_formula: ["化合价", "化学式", "离子键", "共价键", "Al2O3", "valence", "ionic"],
  mt_chem_stoichiometry_conservation: ["质量守恒", "化学方程式配平", "恰好完全反应", "stoichiometry", "conservation of mass"],
  mt_chem_molar_concentration: ["物质的量", "摩尔", "mol/L", "溶液稀释", "c1V1", "molarity", "dilution"],
  mt_bio_cell_transport: ["渗透作用", "质壁分离", "主动运输", "自由扩散", "半透膜", "osmosis", "active transport"],
  mt_bio_photosynthesis_resp: ["光合作用", "细胞呼吸", "净光合", "真正光合", "光补偿点", "CO₂", "photosynthesis", "respiration"],
  mt_bio_mendelian_genetics: ["孟德尔", "基因型", "表现型", "Aa", "杂交", "显性", "隐性", "punnett", "heterozygous"],
  mt_bio_population_ecology: ["能量流动", "营养级", "10%", "20%", "食物链", "标志重捕法", "trophic"],
  mt_eng_sentence_sva_tense: ["主谓一致", "as well as", "neither", "完成时", "since", "subject-verb", "has been"],
  mt_eng_passive_participle: ["被动语态", "非谓语", "现在分词", "过去分词", "seen from", "participle", "passive"],
  mt_eng_relative_clauses: ["定语从句", "关系代词", "关系副词", "which", "where", "whose", "relative clause"],
  mt_eng_conditionals_academic: ["虚拟语气", "if i had", "would have", "衔接词", "however", "conditional", "subjunctive"],
  mt_cs_binary_logic: ["二进制", "十六进制", "逻辑门", "与或非", "XOR", "AND", "binary", "boolean"],
  mt_cs_loops_trace: ["for循环", "while循环", "累加器", "continue", "break", "流程图", "loop trace"],
  mt_cs_arrays_binary_search: ["二分查找", "数组下标", "mid", "折半查找", "binary search", "array"],
  mt_cs_algo_complexity: ["时间复杂度", "O(n)", "O(log n)", "O(n²)", "嵌套循环", "递归", "big-o", "complexity"],
  mt_geo_map_scale_timezones: ["比例尺", "经纬网", "图上距离", "实地距离", "1:50000", "map scale", "latitude"],
  mt_geo_contour_elevation: ["等高线", "等高距", "山脊", "山谷", "陡崖", "相对高度", "contour", "elevation"],
  mt_geo_solar_angle_climate: ["正午太阳高度", "直射点", "夏至", "冬至", "地中海气候", "季风", "solar altitude", "solstice"],
  mt_his_chronology_evidence: ["公元前", "公元元年", "世纪", "BCE", "CE", "周年", "纪年"],
  mt_his_trade_demographics: ["丝绸之路", "哥伦布大交换", "朝贡贸易", "白银", "史料互证", "silk road", "columbian"],
  mt_his_industrial_modern: ["工业革命", "蒸汽机", "城市化", "人口普查", "铁路里程", "industrial revolution", "urbanization"],
  mt_lit_main_idea_structure: ["中心论点", "总分总", "论证结构", "段意概括", "main idea", "thesis"],
  mt_lit_inference_rhetoric: ["修辞手法", "比喻", "拟人", "排比", "言外之意", "隐含推断", "metaphor", "inference"],
  mt_lit_logical_fallacy: ["逻辑谬误", "相关性", "因果倒置", "幸存者偏差", "以偏概全", "稻草人", "fallacy", "survivorship"],
  mt_lit_classical_comparative: ["文言实词", "古今异义", "词类活用", "互文", "对比阅读", "classical chinese"],
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

    for (const val of Object.values(topic.title)) {
      if (val && qLower.includes(val.toLowerCase())) score += 12;
    }

    const keywords = TOPIC_SIGNAL_LEXICON[topic.id] ?? [];
    for (const kw of keywords) {
      if (qLower.includes(kw.toLowerCase())) {
        score += 8;
      }
    }

    // Token overlap against description & misconceptions
    const descZh = topic.description["zh-CN"];
    for (let i = 0; i < descZh.length - 1; i++) {
      const bi = descZh.slice(i, i + 2);
      if (/[\u4e00-\u9fa5]{2}/.test(bi) && qLower.includes(bi)) {
        score += 0.6;
      }
    }
    const descEnWords = topic.description.en.toLowerCase().split(/\W+/).filter((w) => w.length >= 5);
    for (const w of descEnWords) {
      if (qLower.includes(w)) score += 1.2;
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

  // Upstream prerequisite root causes from DAG
  const directEdges = CANONICAL_EDGES.filter((e) => e.topicId === primaryTopic.id);
  const upstreamRootCauses: RootCausePrereqBrief[] = directEdges.map((edge) => {
    const preTopic = ALL_CANONICAL_TOPICS.find((t) => t.id === edge.prerequisiteId)!;
    const preAlign = ALL_REGIONAL_ALIGNMENTS.find(
      (a) => a.topicId === edge.prerequisiteId && a.regionCode === params.regionCode
    );
    return {
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
    };
  });

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
