import type {
  DifficultyTier,
  EdgeRelationType,
  LocalizedText,
  RegionalAlignmentRecord,
  RegionCode,
} from "@/types/taxonomy";
import { REGIONS_DATA } from "./regions-and-subjects";
import { MATH_TOPICS, type TopicSeedDefinition } from "./canonical-topics-math";
import { STEM_AND_ALL_SUBJECT_TOPICS } from "./canonical-topics-stem";
import { SCIENCE_AND_CS_EXPANSION_TOPICS } from "./canonical-topics-science-cs";
import { HUMANITIES_AND_LANG_EXPANSION_TOPICS } from "./canonical-topics-humanities-lang";
import { applyEdgeReasonOverlay, applyTopicContentOverlay } from "./i18n/overlay";
import { TOPIC_CONTENT_I18N_MATH } from "./i18n/topic-content-math";
import { TOPIC_CONTENT_I18N_STEM } from "./i18n/topic-content-stem";
import { TOPIC_CONTENT_I18N_SCIENCE_CS } from "./i18n/topic-content-science-cs";
import { TOPIC_CONTENT_I18N_HUMANITIES_LANG } from "./i18n/topic-content-humanities-lang";
import { EDGE_REASON_I18N } from "./i18n/edge-reasons";

/**
 * 50 Global Canonical Micro-Topics across all 9 K12 Subjects:
 *   - Mathematics (18: G3 -> G12)
 *   - Physics & Integrated Science (6: G7 -> G11)
 *   - Chemistry (4: G8 -> G10)
 *   - Biology (4: G7 -> G11)
 *   - English & Academic Literacy (4: G6 -> G11)
 *   - Computing & AI (4: G7 -> G11)
 *   - Geography & Earth Science (3: G7 -> G10)
 *   - History & Social Inquiry (3: G7 -> G10)
 *   - Mother-Tongue & Critical Reading Literacy (4: G5 -> G11)
 *
 * Native ja / ko / ms teaching content is merged in from ./i18n/topic-content-*.ts overlays.
 */
export const ALL_CANONICAL_TOPICS: TopicSeedDefinition[] = applyTopicContentOverlay(
  [
    ...MATH_TOPICS,
    ...STEM_AND_ALL_SUBJECT_TOPICS,
    ...SCIENCE_AND_CS_EXPANSION_TOPICS,
    ...HUMANITIES_AND_LANG_EXPANSION_TOPICS,
  ],
  {
    ...TOPIC_CONTENT_I18N_MATH,
    ...TOPIC_CONTENT_I18N_STEM,
    ...TOPIC_CONTENT_I18N_SCIENCE_CS,
    ...TOPIC_CONTENT_I18N_HUMANITIES_LANG,
  }
);

export interface EdgeSeedDefinition {
  topicId: string; // Downstream target topic
  prerequisiteId: string; // Upstream required topic
  relationType: EdgeRelationType;
  reason: LocalizedText;
}

/**
 * Directed Acyclic Graph (DAG) Edges (78 Prerequisite & Cross-Subject Edges)
 * Convention: `topicId` depends on `prerequisiteId`
 */
const CANONICAL_EDGE_SEEDS: EdgeSeedDefinition[] = [
  // ==================== 1. MATHEMATICS WITHIN-SUBJECT DAG (28 edges) ====================
  {
    topicId: "mt_math_frac_concept_equiv",
    prerequisiteId: "mt_math_place_value_ops",
    relationType: "hard",
    reason: {
      "zh-CN": "分数的平均分意义及分子分母同乘同除约分通分，建立在整数乘除互逆与整除因数分解之上",
      en: "Equal-partition fraction meaning and equivalence simplification rely on integer multiplication/division fluency",
    },
  },
  {
    topicId: "mt_math_frac_add_sub",
    prerequisiteId: "mt_math_frac_concept_equiv",
    relationType: "hard",
    reason: {
      "zh-CN": "异分母分数加减必须先运用等价分数性质通分为同分母分数单位",
      en: "Adding or subtracting unlike fractions requires rewriting them into common-denominator equivalent fractions",
    },
  },
  {
    topicId: "mt_math_frac_mul_div",
    prerequisiteId: "mt_math_frac_concept_equiv",
    relationType: "hard",
    reason: {
      "zh-CN": "分数乘除中的交叉约分与倒数变换直接依赖分数基本性质",
      en: "Cross-cancellation and reciprocal multiplication rely directly on fraction equivalence",
    },
  },
  {
    topicId: "mt_math_frac_mul_div",
    prerequisiteId: "mt_math_frac_add_sub",
    relationType: "soft",
    reason: {
      "zh-CN": "分数四则混合与剩余量应用题常需先算加减部分量再做乘除量率对应",
      en: "Multi-step fraction word problems combine fractional complements (1 - a/b) with multiplication/division",
    },
  },
  {
    topicId: "mt_math_ratio_percent",
    prerequisiteId: "mt_math_frac_mul_div",
    relationType: "hard",
    reason: {
      "zh-CN": "比值、百分率折扣及新加坡条形建模（Bar Model）量率对应本质是分数乘除法的推广",
      en: "Ratios, percentage change, and Singapore CPA bar-model unitary reasoning generalize fraction multiplication/division",
    },
  },
  {
    topicId: "mt_math_geometry_area_perim",
    prerequisiteId: "mt_math_place_value_ops",
    relationType: "hard",
    reason: {
      "zh-CN": "周长面积公式计算与单位换算依赖整数四则混合运算与十进制数量级",
      en: "Area/perimeter formulas and metric conversions depend on base-10 place value and four operations",
    },
  },
  {
    topicId: "mt_math_geometry_area_perim",
    prerequisiteId: "mt_math_frac_mul_div",
    relationType: "soft",
    reason: {
      "zh-CN": "三角形与梯形面积公式含 1/2 系数，逆求底或高需运用分数乘除互逆",
      en: "Triangle and trapezoid area formulas involve a factor of 1/2 and inverse division when solving for height",
    },
  },
  {
    topicId: "mt_math_signed_numbers",
    prerequisiteId: "mt_math_place_value_ops",
    relationType: "hard",
    reason: {
      "zh-CN": "有理数四则与乘方运算是将非负算术运算优先级扩展到数轴正负双方向",
      en: "Signed rational arithmetic extends whole-number order of operations across positive and negative directions",
    },
  },
  {
    topicId: "mt_math_signed_numbers",
    prerequisiteId: "mt_math_frac_add_sub",
    relationType: "soft",
    reason: {
      "zh-CN": "负分数与有理数混合加减需同步运用通分与符号法则",
      en: "Signed rational addition/subtraction combines common denominators with sign rules",
    },
  },
  {
    topicId: "mt_math_alg_expressions",
    prerequisiteId: "mt_math_signed_numbers",
    relationType: "hard",
    reason: {
      "zh-CN": "整式合并同类项与括号前负号变号规则完全建立在有理数符号法则之上",
      en: "Combining like terms and distributing negative signs depend directly on signed number rules",
    },
  },
  {
    topicId: "mt_math_linear_eq_one",
    prerequisiteId: "mt_math_alg_expressions",
    relationType: "hard",
    reason: {
      "zh-CN": "解一元一次方程的去括号、移项与合并同类项本质是对等式两侧整式的等价变形",
      en: "Solving linear equations requires expanding brackets and combining algebraic terms accurately",
    },
  },
  {
    topicId: "mt_math_linear_eq_one",
    prerequisiteId: "mt_math_frac_add_sub",
    relationType: "soft",
    reason: {
      "zh-CN": "含分母一元一次方程“同乘最小公倍数去分母”依赖公倍数与通分直觉",
      en: "Clearing fractional denominators in linear equations relies on LCM fluency from fraction addition",
    },
  },
  {
    topicId: "mt_math_linear_systems",
    prerequisiteId: "mt_math_linear_eq_one",
    relationType: "hard",
    reason: {
      "zh-CN": "二元一次方程组通过代入或加减消元后，最终归结为求解一元一次方程",
      en: "Elimination and substitution reduce a 2x2 linear system to a single-variable linear equation",
    },
  },
  {
    topicId: "mt_math_coord_linear_func",
    prerequisiteId: "mt_math_linear_eq_one",
    relationType: "hard",
    reason: {
      "zh-CN": "一次函数求 x 轴交点（零点）与给定函数值反求自变量直接转化为一元一次方程",
      en: "Finding x-intercepts and pre-images of y = kx + b requires solving a linear equation",
    },
  },
  {
    topicId: "mt_math_coord_linear_func",
    prerequisiteId: "mt_math_linear_systems",
    relationType: "soft",
    reason: {
      "zh-CN": "待定系数法确定直线解析式及求两直线交点坐标需联立二元一次方程组",
      en: "Determining y = kx + b from two points and finding line intersections require solving 2x2 linear systems",
    },
  },
  {
    topicId: "mt_math_special_products_factor",
    prerequisiteId: "mt_math_alg_expressions",
    relationType: "hard",
    reason: {
      "zh-CN": "平方差、完全平方公式与因式分解是整式分配律展开的结构化逆运算",
      en: "Special products and factoring build directly on polynomial expansion and distributive structure",
    },
  },
  {
    topicId: "mt_math_rational_eq",
    prerequisiteId: "mt_math_linear_eq_one",
    relationType: "hard",
    reason: {
      "zh-CN": "分式方程两边同乘最简公分母去分母后转化为整式方程求解并验根",
      en: "Multiplying through by the LCD converts a rational equation into a linear/polynomial equation",
    },
  },
  {
    topicId: "mt_math_rational_eq",
    prerequisiteId: "mt_math_special_products_factor",
    relationType: "hard",
    reason: {
      "zh-CN": "确定多项式分母的最简公分母与分式约分必须先对分母进行因式分解",
      en: "Finding the LCD and domain restrictions of rational equations requires factoring denominators",
    },
  },
  {
    topicId: "mt_math_radicals_pythagoras",
    prerequisiteId: "mt_math_geometry_area_perim",
    relationType: "hard",
    reason: {
      "zh-CN": "勾股定理的面积割补证明与直角三角形边长计算建立在平面图形面积观念之上",
      en: "Pythagorean theorem proofs and geometric applications rest on polygon area foundations",
    },
  },
  {
    topicId: "mt_math_radicals_pythagoras",
    prerequisiteId: "mt_math_special_products_factor",
    relationType: "soft",
    reason: {
      "zh-CN": "赵爽弦图/毕达哥拉斯面积证法与二次根式分母有理化依赖完全平方与平方差公式",
      en: "Algebraic proof of a² + b² = c² and rationalizing denominators rely on special product identities",
    },
  },
  {
    topicId: "mt_math_quad_complete_sq",
    prerequisiteId: "mt_math_special_products_factor",
    relationType: "hard",
    reason: {
      "zh-CN": "配方法凑 (x + b/2a)² 与因式分解法解一元二次方程直接依赖完全平方公式与十字相乘",
      en: "Completing the square and factoring quadratics rely directly on perfect-square trinomials",
    },
  },
  {
    topicId: "mt_math_quad_complete_sq",
    prerequisiteId: "mt_math_radicals_pythagoras",
    relationType: "hard",
    reason: {
      "zh-CN": "直接开平方法与求根公式化简 √(b² - 4ac) 必须掌握二次根式化简与正负平方根",
      en: "Applying the quadratic formula and taking square roots require simplifying radicals accurately",
    },
  },
  {
    topicId: "mt_math_quad_function_parabola",
    prerequisiteId: "mt_math_coord_linear_func",
    relationType: "hard",
    reason: {
      "zh-CN": "二次函数坐标系描点、对称轴单调区间判读建立在平面直角坐标系与一次函数基础之上",
      en: "Graphing parabolas and analyzing intervals build on coordinate plane and linear function fluency",
    },
  },
  {
    topicId: "mt_math_quad_function_parabola",
    prerequisiteId: "mt_math_quad_complete_sq",
    relationType: "hard",
    reason: {
      "zh-CN": "一般式化顶点式 a(x-h)²+k 需用配方法，求抛物线与 x 轴交点需解一元二次方程",
      en: "Converting to vertex form uses completing the square, and finding x-intercepts solves ax² + bx + c = 0",
    },
  },
  {
    topicId: "mt_math_trig_right_triangle",
    prerequisiteId: "mt_math_radicals_pythagoras",
    relationType: "hard",
    reason: {
      "zh-CN": "由已知两边求第三边及推导 30°/45°/60° 精确三角函数值必须用到勾股定理与根式运算",
      en: "Solving right triangles and deriving exact 30°-45°-60° trig ratios depend on Pythagoras and radicals",
    },
  },
  {
    topicId: "mt_math_trig_right_triangle",
    prerequisiteId: "mt_math_ratio_percent",
    relationType: "soft",
    reason: {
      "zh-CN": "正弦、余弦、正切本质是相似直角三角形对应边的不变比值",
      en: "Sine, cosine, and tangent are invariant side ratios across similar right triangles",
    },
  },
  {
    topicId: "mt_math_calc_derivative_tangent",
    prerequisiteId: "mt_math_quad_function_parabola",
    relationType: "hard",
    reason: {
      "zh-CN": "导数研究曲线瞬时变化率、切线与极值点，以二次及多项式函数图像特征为直接载体",
      en: "Derivatives analyze instantaneous rate of change and extrema starting from quadratic/polynomial curves",
    },
  },
  {
    topicId: "mt_math_calc_derivative_tangent",
    prerequisiteId: "mt_math_coord_linear_func",
    relationType: "hard",
    reason: {
      "zh-CN": "导数几何意义是割线斜率 Δy/Δx 的极限，求切线方程直接调用直线点斜式/斜截式",
      en: "Tangent slope is the limit of secant slope Δy/Δx, and tangent line equations use point-slope form",
    },
  },

  // ==================== 2. PHYSICS WITHIN-SUBJECT + CROSS-SUBJECT BRIDGES (11 edges) ====================
  {
    topicId: "mt_phy_measurement_density",
    prerequisiteId: "mt_math_ratio_percent",
    relationType: "cross_subject",
    reason: {
      "zh-CN": "【跨科数学桥】密度 ρ = m/V 比值定义与复合单位换算依赖数学比例思维",
      en: "[Math Bridge] Density ρ = m/V and compound unit conversion rely on proportional reasoning",
    },
  },
  {
    topicId: "mt_phy_speed_motion_graphs",
    prerequisiteId: "mt_phy_measurement_density",
    relationType: "hard",
    reason: {
      "zh-CN": "运动学速度测量建立在国际单位制长度、时间基本量测量与单位换算基础之上",
      en: "Kinematics builds on SI base unit measurement and compound unit conversions",
    },
  },
  {
    topicId: "mt_phy_speed_motion_graphs",
    prerequisiteId: "mt_math_coord_linear_func",
    relationType: "cross_subject",
    reason: {
      "zh-CN": "【跨科数学桥】s-t 运动图像直线的斜率直接对应速度 v = Δs/Δt",
      en: "[Math Bridge] Interpreting slope on an s-t graph as velocity v = Δs/Δt applies linear function slope",
    },
  },
  {
    topicId: "mt_phy_forces_newton",
    prerequisiteId: "mt_phy_speed_motion_graphs",
    relationType: "hard",
    reason: {
      "zh-CN": "理解牛顿第一定律与加速度 a 必须先掌握速度与运动状态描述",
      en: "Newton's laws of motion and acceleration build directly on velocity and motion graphs",
    },
  },
  {
    topicId: "mt_phy_forces_newton",
    prerequisiteId: "mt_math_linear_eq_one",
    relationType: "cross_subject",
    reason: {
      "zh-CN": "【跨科数学桥】由受力分析列合力方程 F_pull - f = ma 反求未知量需解一元一次方程",
      en: "[Math Bridge] Solving F_net = F_pull - f = ma requires linear equations",
    },
  },
  {
    topicId: "mt_phy_circuits_series_parallel",
    prerequisiteId: "mt_phy_measurement_density",
    relationType: "soft",
    reason: {
      "zh-CN": "电流表与电压表量程选择及最小分度值估读遵循物理基本测量规范",
      en: "Reading ammeters and voltmeters follows foundational physics measurement skills",
    },
  },
  {
    topicId: "mt_phy_circuits_series_parallel",
    prerequisiteId: "mt_math_linear_eq_one",
    relationType: "cross_subject",
    reason: {
      "zh-CN": "【跨科数学桥】串联分压 U = U₁ + U₂ 与并联分流 I = I₁ + I₂ 支路反推需列一次方程",
      en: "[Math Bridge] Solving unknown branch currents and voltages uses conservation equations",
    },
  },
  {
    topicId: "mt_phy_ohm_law",
    prerequisiteId: "mt_phy_circuits_series_parallel",
    relationType: "hard",
    reason: {
      "zh-CN": "欧姆定律动态电路分析必须先准确判断串并联连接方式及各表测量对象",
      en: "Applying Ohm's law requires identifying series/parallel current and voltage rules first",
    },
  },
  {
    topicId: "mt_phy_ohm_law",
    prerequisiteId: "mt_math_rational_eq",
    relationType: "cross_subject",
    reason: {
      "zh-CN": "【跨科数学桥】并联等效电阻公式 1/R = 1/R₁ + 1/R₂ 变形求 R 属于典型分式方程运算",
      en: "[Math Bridge] Solving parallel resistance 1/R = 1/R₁ + 1/R₂ requires rational equation fluency",
    },
  },
  {
    topicId: "mt_phy_work_kinetic_energy",
    prerequisiteId: "mt_phy_forces_newton",
    relationType: "hard",
    reason: {
      "zh-CN": "计算力做的功 W = Fs 及动能定理建立在受力分析与牛顿运动定律之上",
      en: "Work W = Fs and the work-energy theorem depend directly on force analysis and Newton's laws",
    },
  },
  {
    topicId: "mt_phy_work_kinetic_energy",
    prerequisiteId: "mt_math_quad_complete_sq",
    relationType: "cross_subject",
    reason: {
      "zh-CN": "【跨科数学桥】动能公式 E_k = ½mv² 含速度平方项，已知能量反求速度需开平方解二次方程",
      en: "[Math Bridge] Kinetic energy E_k = ½mv² scales quadratically with v",
    },
  },

  // ==================== 3. CHEMISTRY CONNECTED DAG + BRIDGES ====================
  {
    topicId: "mt_chem_atomic_periodic",
    prerequisiteId: "mt_math_signed_numbers",
    relationType: "cross_subject",
    reason: {
      "zh-CN": "【跨科数学桥】核电荷正电 (+Z) 与核外电子负电 (-N_e) 净电荷加减依赖正负数运算",
      en: "[Math Bridge] Net ionic charge (+Z) + (-N_e) relies on signed integer addition",
    },
  },
  {
    topicId: "mt_chem_bonding_formula",
    prerequisiteId: "mt_chem_atomic_periodic",
    relationType: "hard",
    reason: {
      "zh-CN": "元素常见化合价由原子最外层价电子得失数目直接决定",
      en: "Element oxidation states arise directly from outer-shell valence electron gain or loss",
    },
  },
  {
    topicId: "mt_chem_bonding_formula",
    prerequisiteId: "mt_math_linear_eq_one",
    relationType: "cross_subject",
    reason: {
      "zh-CN": "【跨科数学桥】由化合物正负化合价代数和为 0 反推中心原子价态需解一元一次方程",
      en: "[Math Bridge] Solving ∑ n_i · v_i = 0 for an unknown central oxidation state uses a linear equation",
    },
  },
  {
    topicId: "mt_chem_stoichiometry_conservation",
    prerequisiteId: "mt_chem_bonding_formula",
    relationType: "hard",
    reason: {
      "zh-CN": "配平化学方程式前必须先根据化合价正确写出各反应物与生成物的化学式",
      en: "Balancing chemical equations requires writing valid chemical formulas first",
    },
  },
  {
    topicId: "mt_chem_stoichiometry_conservation",
    prerequisiteId: "mt_math_ratio_percent",
    relationType: "cross_subject",
    reason: {
      "zh-CN": "【跨科数学桥】化学方程式反应物与生成物的定比质量换算依赖比例式计算",
      en: "[Math Bridge] Stoichiometric reactant-to-product mass calculations depend on proportional ratios",
    },
  },
  {
    topicId: "mt_chem_molar_concentration",
    prerequisiteId: "mt_chem_stoichiometry_conservation",
    relationType: "hard",
    reason: {
      "zh-CN": "溶液反应滴定与稀释守恒建立在物质的量与质量守恒定量观念之上",
      en: "Solution molarity and dilution stoichiometry extend conservation of moles/mass",
    },
  },
  {
    topicId: "mt_chem_molar_concentration",
    prerequisiteId: "mt_math_linear_eq_one",
    relationType: "cross_subject",
    reason: {
      "zh-CN": "【跨科数学桥】溶液稀释方程 c₁V₁ = c₂V₂ 反求未知浓度或加水量需解一次方程",
      en: "[Math Bridge] Solving dilution law c₁V₁ = c₂V₂ for unknown volume uses linear equations",
    },
  },

  // ==================== 4. BIOLOGY CONNECTED DAG + BRIDGES ====================
  {
    topicId: "mt_bio_cell_transport",
    prerequisiteId: "mt_math_ratio_percent",
    relationType: "cross_subject",
    reason: {
      "zh-CN": "【跨科数学桥】膜内外溶质质量分数（%）对比与细胞表面积/体积比依赖百分率与比值",
      en: "[Math Bridge] Comparing solute percentages and surface-area-to-volume ratios relies on ratios",
    },
  },
  {
    topicId: "mt_bio_photosynthesis_resp",
    prerequisiteId: "mt_bio_cell_transport",
    relationType: "hard",
    reason: {
      "zh-CN": "光合作用（叶绿体）与有氧呼吸（线粒体）的气体交换依赖细胞器分工与跨膜扩散",
      en: "Photosynthesis and cellular respiration rely on chloroplast/mitochondria organelles and gas diffusion",
    },
  },
  {
    topicId: "mt_bio_photosynthesis_resp",
    prerequisiteId: "mt_chem_stoichiometry_conservation",
    relationType: "cross_subject",
    reason: {
      "zh-CN": "【跨科化学桥】光合与呼吸总反应式 CO₂ 与 O₂ 摩尔计量关系遵循化学质量守恒定律",
      en: "[Chemistry Bridge] Gas-exchange stoichiometry in photosynthesis/respiration follows chemical conservation",
    },
  },
  {
    topicId: "mt_bio_mendelian_genetics",
    prerequisiteId: "mt_bio_cell_transport",
    relationType: "soft",
    reason: {
      "zh-CN": "细胞核染色体遗传物质载体认知是理解配子形成与孟德尔遗传规律的基础",
      en: "Understanding nuclear chromosomes in cells underpins Mendelian allele segregation",
    },
  },
  {
    topicId: "mt_bio_mendelian_genetics",
    prerequisiteId: "mt_math_ratio_percent",
    relationType: "cross_subject",
    reason: {
      "zh-CN": "【跨科数学桥】庞氏表配子组合概率及 3:1 / 1:2:1 性状分离比建立在分数与百分率之上",
      en: "[Math Bridge] Punnett square genotype/phenotype probabilities rely on fractions and percentages",
    },
  },
  {
    topicId: "mt_bio_population_ecology",
    prerequisiteId: "mt_bio_photosynthesis_resp",
    relationType: "hard",
    reason: {
      "zh-CN": "生态系统能量金字塔的起点是生产者光合作用固定的太阳能，各营养级损耗源于呼吸散热",
      en: "Ecosystem energy flow begins with gross/net primary productivity and respiratory heat loss",
    },
  },
  {
    topicId: "mt_bio_population_ecology",
    prerequisiteId: "mt_math_ratio_percent",
    relationType: "cross_subject",
    reason: {
      "zh-CN": "【跨科数学桥】相邻营养级 10%~20% 能量传递效率极值反推属于连续百分比乘除运算",
      en: "[Math Bridge] Multi-level 10%–20% trophic transfer bounds apply compound percentage scaling",
    },
  },

  // ==================== 5. ENGLISH CONNECTED DAG ====================
  {
    topicId: "mt_eng_passive_participle",
    prerequisiteId: "mt_eng_sentence_sva_tense",
    relationType: "hard",
    reason: {
      "zh-CN": "区分谓语动词（受主谓一致和时态约束）与非谓语分词修饰语必须先掌握主干谓语规则",
      en: "Distinguishing finite main verbs from non-finite participles builds on clause subject-verb structure",
    },
  },
  {
    topicId: "mt_eng_relative_clauses",
    prerequisiteId: "mt_eng_sentence_sva_tense",
    relationType: "hard",
    reason: {
      "zh-CN": "分析定语从句内部缺主语还是缺宾语及从句谓语单复数，建立在基本主谓宾句法之上",
      en: "Analyzing subject/object gaps and verb agreement inside relative clauses requires core clause syntax",
    },
  },
  {
    topicId: "mt_eng_conditionals_academic",
    prerequisiteId: "mt_eng_passive_participle",
    relationType: "hard",
    reason: {
      "zh-CN": "第三类虚拟条件句 `had + p.p.` 与 `would have + p.p.` 依赖过去分词结构熟练度",
      en: "Forming `had + past participle` and `would have + past participle` requires participle mastery",
    },
  },
  {
    topicId: "mt_eng_conditionals_academic",
    prerequisiteId: "mt_eng_relative_clauses",
    relationType: "soft",
    reason: {
      "zh-CN": "高阶学术长难句常将定语从句与虚拟条件从句嵌套使用",
      en: "Academic complex sentences combine relative modifiers with conditional clauses",
    },
  },

  // ==================== 6. COMPUTING & AI CONNECTED DAG + BRIDGES ====================
  {
    topicId: "mt_cs_binary_logic",
    prerequisiteId: "mt_math_place_value_ops",
    relationType: "cross_subject",
    reason: {
      "zh-CN": "【跨科数学桥】二进制按 2ⁿ 位权展开与十进制按 10ⁿ 位权展开同构",
      en: "[Math Bridge] Base-2 positional expansion generalizes base-10 place-value structure",
    },
  },
  {
    topicId: "mt_cs_loops_trace",
    prerequisiteId: "mt_cs_binary_logic",
    relationType: "hard",
    reason: {
      "zh-CN": "循环继续/终止条件由布尔逻辑表达式真值判定驱动",
      en: "Loop continuation and branch guards are governed by Boolean logic evaluation",
    },
  },
  {
    topicId: "mt_cs_loops_trace",
    prerequisiteId: "mt_math_alg_expressions",
    relationType: "cross_subject",
    reason: {
      "zh-CN": "【跨科数学桥】追踪循环变量递推与等差求和公式需要代数表达式化简能力",
      en: "[Math Bridge] Tracing loop accumulators and arithmetic sums builds on algebraic expressions",
    },
  },
  {
    topicId: "mt_cs_arrays_binary_search",
    prerequisiteId: "mt_cs_loops_trace",
    relationType: "hard",
    reason: {
      "zh-CN": "二分查找通过 `while low <= high` 循环动态收缩左右指针区间",
      en: "Binary search is implemented by tracing `low`, `mid`, `high` pointers across `while` loop iterations",
    },
  },
  {
    topicId: "mt_cs_algo_complexity",
    prerequisiteId: "mt_cs_arrays_binary_search",
    relationType: "hard",
    reason: {
      "zh-CN": "理解对数级 O(log n)、线性级 O(n) 与平方级 O(n²) 的效率鸿沟以查找/排序算法为基准",
      en: "Comparing O(log n), O(n), and O(n²) efficiency builds directly on search/sort loop analysis",
    },
  },
  {
    topicId: "mt_cs_algo_complexity",
    prerequisiteId: "mt_math_quad_function_parabola",
    relationType: "cross_subject",
    reason: {
      "zh-CN": "【跨科数学桥】O(n²) 算法规模翻 k 倍耗时翻 k² 倍直接对应二次函数增长特性",
      en: "[Math Bridge] Quadratic O(n²) runtime growth mirrors quadratic function scaling",
    },
  },

  // ==================== 7. GEOGRAPHY CONNECTED DAG + BRIDGES ====================
  {
    topicId: "mt_geo_map_scale_timezones",
    prerequisiteId: "mt_math_ratio_percent",
    relationType: "cross_subject",
    reason: {
      "zh-CN": "【跨科数学桥】地图比例尺 1 : N 实地距离换算本质是比例缩放",
      en: "[Math Bridge] Map scale 1:N ground-distance conversion directly applies ratio scaling",
    },
  },
  {
    topicId: "mt_geo_map_scale_timezones",
    prerequisiteId: "mt_math_signed_numbers",
    relationType: "cross_subject",
    reason: {
      "zh-CN": "【跨科数学桥】UTC+8 与 UTC-5 跨东西时区差计算是有符号整数在数轴上的有向距离",
      en: "[Math Bridge] Computing time differences across UTC+ and UTC- zones uses signed number subtraction",
    },
  },
  {
    topicId: "mt_geo_contour_elevation",
    prerequisiteId: "mt_geo_map_scale_timezones",
    relationType: "hard",
    reason: {
      "zh-CN": "等高线地形图综合判读需结合平面比例尺估算坡度与高程",
      en: "Interpreting contour relief and slope gradient builds on foundational map-reading skills",
    },
  },
  {
    topicId: "mt_geo_contour_elevation",
    prerequisiteId: "mt_math_coord_linear_func",
    relationType: "cross_subject",
    reason: {
      "zh-CN": "【跨科数学桥】气温随海拔线性递减 T = T₀ - 0.006·Δh 本质是斜率为负的一次函数模型",
      en: "[Math Bridge] Tropospheric temperature T = T₀ - 6·Δh_km is a negative-slope linear function",
    },
  },
  {
    topicId: "mt_geo_solar_angle_climate",
    prerequisiteId: "mt_geo_contour_elevation",
    relationType: "hard",
    reason: {
      "zh-CN": "区域气候综合特征由纬度太阳高度角辐射与海拔地形共同决定",
      en: "Regional climate synthesis combines latitudinal solar insolation with elevation effects",
    },
  },
  {
    topicId: "mt_geo_solar_angle_climate",
    prerequisiteId: "mt_math_signed_numbers",
    relationType: "cross_subject",
    reason: {
      "zh-CN": "【跨科数学桥】南北纬异半球纬度差 |φ - δ| 直接应用数轴正负数绝对值距离",
      en: "[Math Bridge] Cross-hemisphere solar angle |φ - δ| applies signed number absolute distance",
    },
  },

  // ==================== 8. HISTORY CONNECTED DAG + BRIDGES ====================
  {
    topicId: "mt_his_chronology_evidence",
    prerequisiteId: "mt_math_signed_numbers",
    relationType: "cross_subject",
    reason: {
      "zh-CN": "【跨科数学桥】公元前 BCE 与公元 CE 跨元年纪年差依赖数轴距离并修正无零年偏移",
      en: "[Math Bridge] Spanning BCE to CE dates models signed number intervals adjusted for no Year 0",
    },
  },
  {
    topicId: "mt_his_trade_demographics",
    prerequisiteId: "mt_his_chronology_evidence",
    relationType: "hard",
    reason: {
      "zh-CN": "解读历史经济统计表必须先定位世纪纪年分期并辨析一手档案与后世推算史料",
      en: "Evaluating historical trade tables requires chronological periodization and source criticism",
    },
  },
  {
    topicId: "mt_his_trade_demographics",
    prerequisiteId: "mt_math_ratio_percent",
    relationType: "cross_subject",
    reason: {
      "zh-CN": "【跨科数学桥】区分经济史“份额占比（%）变动”与“绝对总量变动”直接依赖百分率基准量思维",
      en: "[Math Bridge] Separating % share shifts from absolute output changes relies on percentage base reasoning",
    },
  },
  {
    topicId: "mt_his_industrial_modern",
    prerequisiteId: "mt_his_trade_demographics",
    relationType: "hard",
    reason: {
      "zh-CN": "两次工业革命引发的世界市场格局与城市化人口变迁依赖近代贸易与人口史料分析基础",
      en: "Analyzing Industrial Revolution impacts builds on demographic and global trade evidence skills",
    },
  },

  // ==================== 9. LITERACY & CRITICAL READING CONNECTED DAG + BRIDGES ====================
  {
    topicId: "mt_lit_inference_rhetoric",
    prerequisiteId: "mt_lit_main_idea_structure",
    relationType: "hard",
    reason: {
      "zh-CN": "深层隐含推断与修辞论证赏析必须建立在准确把握段落中心论点与行文结构之上",
      en: "Implicit inference and rhetorical analysis require grasping the passage's thesis and structure first",
    },
  },
  {
    topicId: "mt_lit_logical_fallacy",
    prerequisiteId: "mt_lit_inference_rhetoric",
    relationType: "hard",
    reason: {
      "zh-CN": "审查论证漏洞（强加因果、幸存者偏差）需要先剥离文本隐含前提与限定词边界",
      en: "Auditing logical fallacies builds on identifying implicit assumptions and quantifier bounds",
    },
  },
  {
    topicId: "mt_lit_logical_fallacy",
    prerequisiteId: "mt_cs_binary_logic",
    relationType: "cross_subject",
    reason: {
      "zh-CN": "【跨科逻辑桥】辨析“充分条件 vs 必要条件”及“逆命题不恒成立”与布尔逻辑真值表同源",
      en: "[Logic Bridge] Distinguishing P → Q from its converse Q → P shares formal Boolean truth logic",
    },
  },
  {
    topicId: "mt_lit_classical_comparative",
    prerequisiteId: "mt_lit_logical_fallacy",
    relationType: "hard",
    reason: {
      "zh-CN": "PISA 多源材料与统计图表的综合决策需同步排除材料间的归因谬误与单维片面判据",
      en: "Synthesizing multi-source texts and charts requires critical fallacy filtering",
    },
  },
  {
    topicId: "mt_lit_classical_comparative",
    prerequisiteId: "mt_math_ratio_percent",
    relationType: "cross_subject",
    reason: {
      "zh-CN": "【跨科数学桥】非连续性文本中的统计图表同比/环比与占比阈值核验依赖数学比例与百分数",
      en: "[Math Bridge] Verifying thresholds and percentage trends in non-continuous text tables uses ratio fluency",
    },
  },
];

/** Canonical edges with native ja / ko / ms reasons merged in from ./i18n/edge-reasons.ts */
export const CANONICAL_EDGES: EdgeSeedDefinition[] = applyEdgeReasonOverlay(
  CANONICAL_EDGE_SEEDS,
  EDGE_REASON_I18N
);

const EXTENSION_TOPICS = new Set([
  "mt_math_calc_derivative_tangent",
  "mt_math_func_exp_log",
  "mt_cs_algo_complexity",
]);

/**
 * Expand all 9-region curriculum alignments (50 topics × 9 regions = 450 records)
 */
export const ALL_REGIONAL_ALIGNMENTS: RegionalAlignmentRecord[] = ALL_CANONICAL_TOPICS.flatMap(
  (topic) =>
    REGIONS_DATA.map((region) => {
      const override = topic.regionalCodeOverrides[region.code as RegionCode];
      const localGrade = override?.grade ?? topic.baselineGrade;
      const clampedGrade = Math.max(1, Math.min(12, localGrade));
      return {
        topicId: topic.id,
        regionCode: region.code,
        localGrade: clampedGrade,
        localStageLabel: region.gradeLabels[clampedGrade] || `Grade ${clampedGrade}`,
        standardCode:
          override?.code ?? `${region.code}-${topic.subjectId.toUpperCase()}-G${clampedGrade}`,
        textbookEdition: override?.edition ?? region.curriculumName,
        localChapterTitle: override?.chapter ?? topic.title["zh-CN"],
        examWeight:
          EXTENSION_TOPICS.has(topic.id) &&
          (clampedGrade >= 12 ||
            region.code === "HK" ||
            region.code === "SG" ||
            region.code === "UK" ||
            region.code === "MY")
            ? "extension"
            : "core",
        regionalNote: override?.note,
      };
    })
);

export interface QuestionTemplateSeed {
  id: string;
  topicId: string;
  difficulty: DifficultyTier;
  itemType: "choice" | "numeric" | "expression";
  generatorKey: string;
  titleNote: string;
}

const EXPRESSION_GENERATORS = new Set([
  "math_alg_expressions",
  "math_special_products",
]);

const CHOICE_ONLY_GENERATORS = new Set([
  "eng_sva_tense",
  "eng_participle_voice",
  "eng_relative_clause",
  "eng_third_conditional",
  "his_industrial_era",
  "lit_main_claim",
  "lit_inference_modality",
  "lit_logical_fallacy",
  "lit_pisa_synthesis",
]);

/**
 * 150 Parameterized Question Templates (50 canonical topics × 3 difficulty tiers)
 */
export const ALL_QUESTION_TEMPLATES: QuestionTemplateSeed[] = ALL_CANONICAL_TOPICS.flatMap(
  (topic) => {
    const tiers: DifficultyTier[] = ["basic", "standard", "challenge"];
    return tiers.map((difficulty) => {
      let itemType: "choice" | "numeric" | "expression" = "numeric";
      if (CHOICE_ONLY_GENERATORS.has(topic.generatorKey)) {
        itemType = "choice";
      } else if (difficulty === "basic") {
        itemType = "choice";
      } else if (
        EXPRESSION_GENERATORS.has(topic.generatorKey) &&
        difficulty === "challenge"
      ) {
        itemType = "expression";
      }

      const tierLabel =
        difficulty === "basic"
          ? "基础概念辨析与降维复测"
          : difficulty === "standard"
            ? "标准课标应用母题"
            : "综合变式与压轴拔高";

      return {
        id: `tpl_${topic.generatorKey}_${difficulty}`,
        topicId: topic.id,
        difficulty,
        itemType,
        generatorKey: topic.generatorKey,
        titleNote: `${topic.title["zh-CN"]} — ${tierLabel}`,
      };
    });
  }
);
