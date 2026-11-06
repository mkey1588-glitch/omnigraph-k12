import type { TopicSeedDefinition } from "./canonical-topics-math";

/**
 * Phase 2 Expansion: Multi-Grade Connected Subgraphs for Chemistry (+3 -> 4), Biology (+3 -> 4), and Computing (+3 -> 4)
 */
export const SCIENCE_AND_CS_EXPANSION_TOPICS: TopicSeedDefinition[] = [
  // ==================== CHEMISTRY MULTI-GRADE CHAIN ====================
  {
    id: "mt_chem_atomic_periodic",
    subjectId: "chemistry",
    domain: "Atomic Structure & Periodicity",
    domainI18n: { "zh-CN": "微粒结构与元素周期律", "zh-TW": "原子結構與週期表", en: "Atomic Structure & Periodicity", ja: "原子の構造と周期表", ko: "원자의 구조와 주기율표", ms: "Struktur Atom & Jadual Berkala" },
    cognitiveType: "conceptual",
    baselineGrade: 8,
    centrality: 0.88,
    rootReason: "化学学科微粒观起点：质子数决定元素种类，最外层电子数决定化学性质与得失电子趋势。",
    title: {
      "zh-CN": "原子核外电子排布、质子数与元素周期律",
      "zh-TW": "原子結構、質子數與元素週期律",
      en: "Protons, Valence Electrons & Periodic Trends",
      ja: "原子番号・価電子と周期律",
      ko: "원자 번호·원자가 전자와 주기율",
      ms: "Nombor Proton & Elektron Valens",
    },
    description: {
      "zh-CN": "掌握核电荷数 = 质子数 = 中性原子核外电子数，能由原子序数推导前 20 号元素最外层电子数与离子电荷。",
      en: "Relate atomic number Z to protons and electron shells (2, 8, 8) and predict ion charge from valence electrons.",
    },
    masteryCriteria: [
      { "zh-CN": "明确中性原子失去电子显正电（阳离子），得到电子显负电（阴离子）", en: "Identify cations (losing e⁻ → +) vs anions (gaining e⁻ → -)" },
      { "zh-CN": "熟练运用 2-8-8 分层规则写出前 18 号元素最外层电子数", en: "Determine valence electrons for Z ≤ 18 using 2-8-8 shell filling" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：钠原子（11号）失去 1 个带负电的电子后，为什么变成带“正电”的 Na⁺ 而不是带负电？",
      en: "Ask: When a neutral sodium atom (Z=11) loses 1 negatively charged electron, why does it become positively charged Na⁺?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "质子像稳坐原子核里的“正电锚”，化学反应从不动质子，只增减外围带负电的电子！少一个负电，正电就多出 +1。",
        en: "Protons stay locked in the nucleus (+Z); losing negative electrons leaves net positive charge!",
      },
      coreFormula: "Z = N_{\\text{protons}}, \\quad q_{\\text{ion}} = Z - N_{e^-}",
      steps: [
        {
          title: { "zh-CN": "2-8-8 电子分层速算", en: "2-8-8 Shell Rule" },
          body: { "zh-CN": "第一层最多 2 个，第二层最多 8 个：如 12 号镁 Mg 排布为 2-8-2，易失 2 个电子成 Mg²⁺（核外剩 10 个电子）。", en: "Mg (Z=12) has shells 2-8-2 and loses 2 valence electrons to form Mg²⁺ (10 e⁻)." },
          checkQuestion: { "zh-CN": "13 号铝原子 Al（2-8-3）形成 Al³⁺ 阳离子后，核外还有几个电子？", en: "How many electrons remain in Al³⁺ (Z = 13)?" },
          checkAnswer: "10",
        },
      ],
      misconceptions: [
        {
          tag: "misc_chem_ion_sign_flip",
          label: { "zh-CN": "把“失去电子”误算成电子数增加，或把阳离子正负号弄反", en: "Adding electrons instead of subtracting for a positive cation" },
          wrongPattern: { "zh-CN": "12 号 Mg²⁺ 核外电子数误算成 12 + 2 = 14", en: "Computing electrons in Mg²⁺ (Z=12) as 12 + 2 = 14 instead of 10" },
          remediationTip: { "zh-CN": "电子本身带负电（-1）：显 +2 价代表负电比正电少 2 个，即电子数 = 12 - 2 = 10。", en: "Electrons carry -1 charge; +2 charge means 2 fewer electrons than protons: Z - 2." },
        },
      ],
    },
    generatorKey: "chem_atomic_shells",
    regionalCodeOverrides: {
      CN: { grade: 9, code: "ccs-2022:2.2.1", chapter: "九上 第三单元 物质构成的奥秘：原子的结构", edition: "人教版化学" },
      HK: { grade: 9, code: "HKDSE-Chem-II", chapter: "S3 Microscopic World I: Atomic Structure", edition: "HKDSE Chemistry" },
      TW: { grade: 8, code: "108-Sci:Ia-IV-1", chapter: "國中八下 原子結構與週期表", edition: "108課綱 自然" },
      SG: { grade: 8, code: "SG-O-Chem-2.1", chapter: "Sec 2/3 Atomic Structure", edition: "MOE Chemistry" },
      MY: { grade: 9, code: "MY-KSSM-Kimia-T4-2.3", chapter: "Struktur Atom & Susunan Elektron", edition: "DSKP Kimia" },
      JP: { grade: 9, code: "JP-MEXT-Sci-3A1", chapter: "中3理科 原子の成り立ちとイオン", edition: "学習指導要領" },
      KR: { grade: 8, code: "KR-2022:[9과01-03]", chapter: "중2 원자와 이온의 형성", edition: "2022 개정 과학" },
      UK: { grade: 9, code: "UK-GCSE-Chem-4.1.1", chapter: "GCSE Atomic Structure & Periodic Table", edition: "AQA/Edexcel GCSE" },
      US: { grade: 8, code: "NGSS.MS-PS1-1", chapter: "Atomic Composition & Valence Electrons", edition: "NGSS Chemistry" },
    },
  },
  {
    id: "mt_chem_bonding_formula",
    subjectId: "chemistry",
    domain: "Chemical Bonding & Formulas",
    domainI18n: { "zh-CN": "化合价与化学式", "zh-TW": "化學鍵與化學式", en: "Oxidation States & Chemical Formulas", ja: "化学式とイオン結合", ko: "화학식과 이온 결합", ms: "Formula Kimia & Ikatan" },
    cognitiveType: "procedural",
    baselineGrade: 9,
    centrality: 0.85,
    title: {
      "zh-CN": "化合价代数和为零法则与化合物化学式推断",
      "zh-TW": "氧化數代數和為零與化學式推斷",
      en: "Zero-Sum Oxidation Rule & Chemical Formula Writing",
      ja: "酸化数の和ゼロ則と化学式",
      ko: "산화수 합 0 법칙과 화학식 작성",
      ms: "Nombor Pengoksidaan & Formula Kimia",
    },
    description: {
      "zh-CN": "利用化合物中各元素正负化合价代数和为 0，反求未知中心元素化合价并正确书写离子化合物角标。",
      en: "Use the zero-sum charge/oxidation rule to determine unknown oxidation states and balance ionic subscripts.",
    },
    masteryCriteria: [
      { "zh-CN": "熟练记住 H(+1)、O(-2) 基准价态，列一次方程求含氧酸根中心元素化合价", en: "Solve for unknown central atom oxidation state using H(+1) and O(-2)" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：碳酸钙 CaCO₃ 整体不带电，已知 Ca 是 +2、每个 O 是 -2，中间那个 C 是正几价？",
      en: "Ask: Since CaCO₃ is neutral overall, with Ca = +2 and three O = -2 each, what charge/state balances C?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "电中性化合物就像完美配平的账本：所有正价总收入 + 所有负价总支出 = 0！",
        en: "Every neutral compound is a balanced ledger: sum of all positive and negative oxidation states equals 0.",
      },
      coreFormula: "\\sum n_i \\cdot v_i = 0",
      steps: [
        {
          title: { "zh-CN": "列零和方程求未知价态", en: "Set Up the Zero-Sum Equation" },
          body: { "zh-CN": "例如求 KMnO₄ 中 Mn 的化合价：(+1) + x + 4×(-2) = 0 ⇒ x = +7。", en: "In KMnO₄: (+1) + x + 4(-2) = 0 ⇒ x = +7." },
          checkQuestion: { "zh-CN": "在 H₂SO₄ 中（H为+1，O为-2），硫元素 S 的化合价是正几？", en: "Find the oxidation state of S in H₂SO₄ (H=+1, O=-2):" },
          checkAnswer: "6",
        },
      ],
      misconceptions: [
        {
          tag: "misc_chem_valence_ignore_sub",
          label: { "zh-CN": "计算化合价代数和时漏乘原子个数角标", en: "Forgetting to multiply oxygen's -2 state by its subscript" },
          wrongPattern: { "zh-CN": "求 H₂SO₄ 中 S 价态时只算 (+1) + x + (-2) = 0 得 +1", en: "Writing (+1) + x + (-2) = 0 instead of 2(+1) + x + 4(-2) = 0" },
          remediationTip: { "zh-CN": "每个原子都贡献一份电荷，角标是几就必须乘几！", en: "Multiply each element's oxidation state by its atom count subscript." },
        },
      ],
    },
    generatorKey: "chem_valence_formula",
    regionalCodeOverrides: {
      CN: { grade: 9, code: "ccs-2022:2.2.3", chapter: "九上 第四单元 化学式与化合价", edition: "人教版化学" },
      HK: { grade: 9, code: "HKDSE-Chem-II-Bond", chapter: "S3 Ionic Bonding & Chemical Formulae", edition: "HKDSE Chemistry" },
      TW: { grade: 8, code: "108-Sci:Ib-IV-2", chapter: "國中八下 化學式與離子化合物", edition: "108課綱 自然" },
      SG: { grade: 9, code: "SG-O-Chem-3.2", chapter: "Sec 3 Chemical Bonding & Formulae", edition: "MOE Chemistry" },
      MY: { grade: 10, code: "MY-KSSM-Kimia-T4-3.3", chapter: "Formula Kimia & Persamaan", edition: "DSKP Kimia" },
      JP: { grade: 9, code: "JP-MEXT-Sci-3A2", chapter: "中3・化学基礎 化学式と酸化数", edition: "学習指導要領" },
      KR: { grade: 9, code: "KR-2022:[9과08-02]", chapter: "중3/통합과학 화학 결합과 화학식", edition: "2022 개정 과학" },
      UK: { grade: 9, code: "UK-GCSE-Chem-4.2.1", chapter: "GCSE Chemical Bonds & Formulae", edition: "GCSE Chemistry" },
      US: { grade: 10, code: "NGSS.HS-PS1-2", chapter: "High School Bonding & Oxidation Numbers", edition: "HS Chemistry" },
    },
  },
  {
    id: "mt_chem_molar_concentration",
    subjectId: "chemistry",
    domain: "Solutions & Quantitative Chemistry",
    domainI18n: { "zh-CN": "物质的量与溶液浓度", "zh-TW": "莫耳濃度與溶液稀釋", en: "Molarity & Solution Dilution", ja: "物質量とモル濃度", ko: "몰 농도와 용액의 희석", ms: "Kemolaran & Pencairan Larutan" },
    cognitiveType: "application",
    baselineGrade: 10,
    centrality: 0.84,
    title: {
      "zh-CN": "物质的量浓度 c = n/V 与溶液稀释溶质守恒",
      "zh-TW": "體積莫耳濃度 c = n/V 與稀釋定律",
      en: "Molar Concentration c = n/V & Dilution Law c₁V₁ = c₂V₂",
      ja: "モル濃度 c = n/V と希釈の法則",
      ko: "몰 농도 c = n/V 와 희석 법칙",
      ms: "Kepekatan Molar & Hukum Pencairan",
    },
    description: {
      "zh-CN": "运用 c = n/V（注意 mL 换算为 L）及加水稀释前后溶质物质的量不变 c₁V₁ = c₂V₂ 进行定量计算。",
      en: "Calculate molarity c = n/V (converting mL to L) and apply solute conservation c₁V₁ = c₂V₂ during dilution.",
    },
    masteryCriteria: [
      { "zh-CN": "将体积 mL 除以 1000 换算为 L 后再代入 c = n/V", en: "Convert volume from mL to L before computing c = n/V" },
      { "zh-CN": "区分“加水至 V₂”与“加入 V_水”对应的终态总体积", en: "Apply c₁V₁ = c₂V₂ using final total solution volume V₂" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：一杯浓果汁加一倍水冲淡到原来的 2 倍体积，里面的纯果汁总量变了吗？浓度变成原来的几分之几？",
      en: "Ask: When you dilute juice with water to double its total volume, does the amount of pure juice change? What happens to concentration?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "加水稀释只增加了溶剂水，溶质微粒一颗没多一颗没少！故溶质总量 n = c₁V₁ = c₂V₂ 恒定守恒。",
        en: "Adding water changes total volume V while solute moles n = cV stay strictly constant: c₁V₁ = c₂V₂.",
      },
      coreFormula: "c = \\frac{n}{V\\,(\\text{L})}, \\qquad c_1 V_1 = c_2 V_2",
      steps: [
        {
          title: { "zh-CN": "稀释比例反比速算", en: "Inverse Scaling in Dilution" },
          body: { "zh-CN": "取 100 mL 2 mol/L 的 NaCl 溶液加水定容至 500 mL：体积扩大 5 倍，浓度变为 2 ÷ 5 = 0.4 mol/L。", en: "Diluting 100 mL of 2 M NaCl to 500 mL scales volume 5×, so c₂ = 2 / 5 = 0.4 mol/L." },
          checkQuestion: { "zh-CN": "将 0.5 mol 溶质配成 250 mL（0.25 L）溶液，物质的量浓度是多少 mol/L？", en: "Dissolve 0.5 mol of solute to make 250 mL (0.25 L) of solution. Find molarity (mol/L):" },
          checkAnswer: "2",
        },
      ],
      misconceptions: [
        {
          tag: "misc_chem_ml_not_liter",
          label: { "zh-CN": "未将毫升 mL 换算为升 L 就直接代入 c = n/V，差 1000 倍", en: "Dividing moles directly by mL instead of L (off by 1000×)" },
          wrongPattern: { "zh-CN": "0.5 mol 溶于 500 mL 算成 0.5 / 500 = 0.001 mol/L", en: "Computing 0.5 mol / 500 mL = 0.001 M instead of 1 M" },
          remediationTip: { "zh-CN": "单位 mol/L 的分母写得清清楚楚是 L！看到 mL 先除以 1000 变成 L。", en: "Always convert mL → L (÷ 1000) before dividing n / V." },
        },
      ],
    },
    generatorKey: "chem_molarity_dilution",
    regionalCodeOverrides: {
      CN: { grade: 10, code: "hcs-2017:B1-2.3", chapter: "高一必修一 物质的量浓度及溶液配制", edition: "人教版高中化学" },
      HK: { grade: 10, code: "HKDSE-Chem-IV", chapter: "S4 Acids & Bases: Molarity & Dilution", edition: "HKDSE Chemistry" },
      TW: { grade: 10, code: "108-Chem:CAc-Va-4", chapter: "高一化學 溶液與體積莫耳濃度", edition: "108課綱 化學" },
      SG: { grade: 9, code: "SG-O-Chem-5.3", chapter: "Sec 3/4 Mole Concept & Stoichiometry", edition: "MOE O-Level Chem" },
      MY: { grade: 10, code: "MY-KSSM-Kimia-T4-6.5", chapter: "Kepekatan Larutan Akueus & Pencairan", edition: "DSKP Kimia" },
      JP: { grade: 10, code: "JP-MEXT-ChemBasic-2B", chapter: "高校化学基礎 物質量とモル濃度", edition: "学習指導要領" },
      KR: { grade: 11, code: "KR-2022:[12화학01-04]", chapter: "화학 몰 농도와 용액 제조", edition: "2022 개정 화학" },
      UK: { grade: 10, code: "UK-GCSE-Chem-4.3.4", chapter: "GCSE Concentration of Solutions (mol/dm³)", edition: "GCSE Chemistry" },
      US: { grade: 10, code: "AP-Chem-SPQ-3.A", chapter: "Solutions, Molarity & Dilution", edition: "HS / AP Chemistry" },
    },
  },

  // ==================== BIOLOGY MULTI-GRADE CHAIN ====================
  {
    id: "mt_bio_cell_transport",
    subjectId: "biology",
    domain: "Cell Structure & Transport",
    domainI18n: { "zh-CN": "细胞结构与跨膜运输", "zh-TW": "細胞構造與滲透運輸", en: "Cell Organelles & Osmosis", ja: "細胞の構造と浸透", ko: "세포의 구조와 삼투", ms: "Struktur Sel & Osmosis" },
    cognitiveType: "conceptual",
    baselineGrade: 7,
    centrality: 0.85,
    rootReason: "生命科学结构基础起点：细胞膜选择透过性、细胞器能量分工与水分子渗透方向判读。",
    title: {
      "zh-CN": "细胞器功能分工与水分子渗透作用方向判读",
      "zh-TW": "細胞胞器分工與滲透作用",
      en: "Cell Organelles, Diffusion & Osmotic Water Movement",
      ja: "細胞小器官の働きと浸透圧",
      ko: "세포 소기관과 삼투 현상",
      ms: "Organel Sel & Osmosis",
    },
    description: {
      "zh-CN": "区分动植物细胞结构（细胞壁、叶绿体、液泡），掌握水分子顺水势梯度（由低渗稀溶液向高渗浓溶液）跨膜渗透规律。",
      en: "Contrast plant/animal organelles and predict water flow across semi-permeable membranes from dilute (hypotonic) to concentrated (hypertonic) solutions.",
    },
    masteryCriteria: [
      { "zh-CN": "准确判断高浓度盐水中植物细胞失水（质壁分离）与清水中吸水膨胀", en: "Predict plasmolysis in hypertonic salt water vs turgidity in pure water" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：凉拌黄瓜撒上盐一会儿就会渗出很多水，是盐钻进了细胞，还是细胞里的水往浓盐水方向跑出来了？",
      en: "Ask: When you sprinkle salt on sliced cucumbers and water comes out, which way did water move across the cell membrane and why?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "水分子总是“仗义疏财去稀释浓的那一边”：哪里溶质浓度高（水分子占比低），水就穿过半透膜往哪里跑！",
        en: "Water moves across a semi-permeable membrane toward the higher solute concentration to equalize concentration.",
      },
      coreFormula: "\\text{Water Flow}: c_{\\text{solute, low}} \\longrightarrow c_{\\text{solute, high}}",
      steps: [
        {
          title: { "zh-CN": "比较膜内外溶质浓度百分比", en: "Compare Inside vs Outside Solute %" },
          body: { "zh-CN": "细胞液浓度 2%，外界蔗糖溶液浓度 10% → 外界更浓 → 水向细胞外流失，细胞质量减小。", en: "If cell sap is 2% solute and external solution is 10%, water exits the cell and cell mass decreases." },
          checkQuestion: { "zh-CN": "将细胞液浓度为 3% 的马铃薯条放入 0.5% 的稀盐水中，马铃薯条质量会增加（填1）还是减小（填2）？", en: "Potato strips (3% internal solute) are placed in 0.5% solution. Does mass increase (1) or decrease (2)?" },
          checkAnswer: "1",
        },
      ],
      misconceptions: [
        {
          tag: "misc_bio_osmosis_reverse",
          label: { "zh-CN": "混淆“溶质扩散方向”与“水分子渗透方向”，误以为水从高浓溶液流向低浓溶液", en: "Confusing solute concentration with water potential (predicting water moves from high solute to low solute)" },
          wrongPattern: { "zh-CN": "认为 10% 浓盐水浓度高，所以水会流进 2% 的细胞里", en: "Claiming water flows from 10% salt solution into a 2% cell" },
          remediationTip: { "zh-CN": "10% 盐水意味着只有 90% 是水，而 2% 细胞液有 98% 是水！水从 98% 流向 90%，即流向浓盐水。", en: "10% salt = 90% water, whereas 2% salt = 98% water; water flows from 98% → 90%!" },
        },
      ],
    },
    generatorKey: "bio_osmosis_mass",
    regionalCodeOverrides: {
      CN: { grade: 7, code: "cbs-2022:1.1.2", chapter: "七上 细胞的生活 / 高一必修一 水进出细胞的原理", edition: "人教版生物" },
      HK: { grade: 9, code: "HKDSE-Bio-I-Cell", chapter: "S3 Cells & Movement of Substances (Osmosis)", edition: "HKDSE Biology" },
      TW: { grade: 7, code: "108-Sci:Da-IV-1", chapter: "國中七上 細胞的構造與物質進出", edition: "108課綱 自然" },
      SG: { grade: 8, code: "SG-O-Bio-2.1", chapter: "Movement of Substances: Diffusion & Osmosis", edition: "MOE Biology" },
      MY: { grade: 9, code: "MY-KSSM-Bio-T4-3.2", chapter: "Pergerakan Bahan Merentasi Membran Plasma", edition: "DSKP Biologi" },
      JP: { grade: 8, code: "JP-MEXT-BioBasic-1A", chapter: "細胞の構造と浸透現象", edition: "学習指導要領" },
      KR: { grade: 10, code: "KR-2022:[10통과02-03]", chapter: "세포막을 통한 물질 이동(삼투)", edition: "2022 개정 통합과학" },
      UK: { grade: 9, code: "UK-GCSE-Bio-4.1.3", chapter: "GCSE Transport in Cells: Osmosis", edition: "GCSE Biology" },
      US: { grade: 7, code: "NGSS.MS-LS1-2", chapter: "Cell Structure & Membrane Transport", edition: "NGSS Life Science" },
    },
  },
  {
    id: "mt_bio_photosynthesis_resp",
    subjectId: "biology",
    domain: "Metabolism & Bioenergetics",
    domainI18n: { "zh-CN": "光合作用与细胞呼吸", "zh-TW": "光合作用與呼吸作用", en: "Photosynthesis & Cellular Respiration", ja: "光合成と呼吸", ko: "광합성과 세포 호흡", ms: "Fotosintesis & Respirasi Sel" },
    cognitiveType: "reasoning",
    baselineGrade: 8,
    centrality: 0.84,
    title: {
      "zh-CN": "净光合速率、真光合速率与光补偿点定量关系",
      "zh-TW": "光合作用速率與呼吸作用平衡",
      en: "Net vs. Gross Photosynthesis & Light Compensation Point",
      ja: "見かけの光合成速度と真の光合成速度",
      ko: "순광합성량·총광합성량과 보상점",
      ms: "Kadar Fotosintesis Bersih & Titik Pampasan",
    },
    description: {
      "zh-CN": "理解植物光照下同时进行光合作用与细胞呼吸：真光合速率 = 净光合速率（实测 O₂ 释放或 CO₂ 吸收）+ 黑暗呼吸速率。",
      en: "Compute gross photosynthetic rate as measured net gas exchange plus dark cellular respiration rate.",
    },
    masteryCriteria: [
      { "zh-CN": "牢记总（真）光合速率 = 净光合速率 + 呼吸速率，不漏加呼吸消耗量", en: "Apply P_gross = P_net + R_dark accurately" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：一家小店白天净存进银行 300 元，而店里一天水电开销固定花掉 80 元，那今天实际营业毛收入是多少元？植物测氧气释放也是同一个道理！",
      en: "Ask: If a plant releases 12 mg/h of net O₂ in light while consuming 4 mg/h in respiration, how much O₂ did its chloroplasts actually produce?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "叶绿体像工厂赚钱（真光合），线粒体像全天候花钱（呼吸）：传感器在叶外测到的“净释放 O₂”是扣除自用呼吸后的结余！",
        en: "Measured O₂ release is NET profit after subtracting continuous mitochondrial respiration: Gross = Net + Respiration.",
      },
      coreFormula: "P_{\\text{gross}} = P_{\\text{net}} + R_{\\text{resp}}",
      steps: [
        {
          title: { "zh-CN": "黑暗测呼吸，光照测净光合", en: "Dark Measures R, Light Measures P_net" },
          body: { "zh-CN": "黑暗中每小时耗氧 5 mg（即 R=5）；光照下每小时净释氧 13 mg（P_net=13），则叶绿体真光合产氧 = 13 + 5 = 18 mg/h。", en: "If dark O₂ uptake R = 5 and light net O₂ release P_net = 13, then P_gross = 13 + 5 = 18." },
          checkQuestion: { "zh-CN": "某植物黑暗下 CO₂ 释放速率为 4 mg/h，光照下 CO₂ 净吸收速率为 11 mg/h，其真光合固定 CO₂ 速率是多少 mg/h？", en: "Dark CO₂ release = 4 mg/h; light net CO₂ uptake = 11 mg/h. Find gross CO₂ fixation (mg/h):" },
          checkAnswer: "15",
        },
      ],
      misconceptions: [
        {
          tag: "misc_bio_net_minus_resp",
          label: { "zh-CN": "求真光合速率时把呼吸速率减掉（误以为光照下植物停止呼吸）", en: "Subtracting respiration instead of adding it to net photosynthesis" },
          wrongPattern: { "zh-CN": "净释氧 13、呼吸耗氧 5，真光合错算成 13 - 5 = 8", en: "Computing P_gross = 13 - 5 = 8 instead of 13 + 5 = 18" },
          remediationTip: { "zh-CN": "植物白天也一刻不停在呼吸！叶绿体必须先填平呼吸消耗的 5，再往外吐出 13，一共造了 18。", en: "Respiration runs 24/7; chloroplasts must supply R internally PLUS the exported P_net." },
        },
      ],
    },
    generatorKey: "bio_photo_net_gross",
    regionalCodeOverrides: {
      CN: { grade: 8, code: "cbs-2022:2.2.3", chapter: "七下/高一 绿色植物的光合作用与细胞呼吸", edition: "人教版生物" },
      HK: { grade: 10, code: "HKDSE-Bio-III-Photo", chapter: "S4 Photosynthesis & Respiration Gas Exchange", edition: "HKDSE Biology" },
      TW: { grade: 7, code: "108-Sci:Db-IV-2", chapter: "國中生物 光合作用與呼吸作用", edition: "108課綱 自然" },
      SG: { grade: 9, code: "SG-O-Bio-6.2", chapter: "Nutrition in Plants & Compensation Point", edition: "MOE Biology" },
      MY: { grade: 10, code: "MY-KSSM-Bio-T5-2.4", chapter: "Fotosintesis & Titik Pampasan", edition: "DSKP Biologi" },
      JP: { grade: 10, code: "JP-MEXT-Bio-1B2", chapter: "光合成速度・呼吸速度と補償点", edition: "学習指導要領" },
      KR: { grade: 8, code: "KR-2022:[9과05-02]", chapter: "중2 식물과 에너지(광합성과 호흡)", edition: "2022 개정 과학" },
      UK: { grade: 9, code: "UK-GCSE-Bio-4.4.1", chapter: "GCSE Bioenergetics: Photosynthesis & Respiration", edition: "GCSE Biology" },
      US: { grade: 9, code: "NGSS.HS-LS1-5", chapter: "Photosynthesis & Cellular Energy Cycling", edition: "NGSS Biology" },
    },
  },
  {
    id: "mt_bio_population_ecology",
    subjectId: "biology",
    domain: "Ecology & Energy Flow",
    domainI18n: { "zh-CN": "生态系统与能量流动", "zh-TW": "生態系與能量塔", en: "Trophic Pyramids & 10% Energy Law", ja: "生態系とエネルギーの流れ", ko: "생태계와 에너지 흐름", ms: "Aliran Tenaga Ekosistem" },
    cognitiveType: "modeling",
    baselineGrade: 10,
    centrality: 0.8,
    title: {
      "zh-CN": "食物链营养级与生态金字塔 10%~20% 能量传递效率",
      "zh-TW": "食物鏈營養階層與十分之一定律",
      en: "Food Chains & Trophic Energy Transfer Efficiency (10%–20%)",
      ja: "食物連鎖と栄養段階のエネルギー効率",
      ko: "먹이 사슬과 에너지 전환 효율",
      ms: "Piramid Tenaga & Kecekapan Pemindahan",
    },
    description: {
      "zh-CN": "理解生态系统能量单向流动、逐级递减，掌握相邻营养级 10%–20% 极值能量核算。",
      en: "Model unidirectional energy flow across trophic levels using 10%–20% transfer bounds.",
    },
    masteryCriteria: [
      { "zh-CN": "已知高营养级增重求“至少”消耗生产者时选最大传递率 20%（除以 0.2），求“至多”选 10%", en: "Use 20% transfer for minimum producer required and 10% for maximum producer required" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：为什么草原上的草总是成片成片，羊比草少得多，而狼又比羊稀少得多？能量每往上一级去哪儿了？",
      en: "Ask: Why are top predators like wolves always vastly outnumbered by herbivores and plants in an ecosystem?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "每个营养级约 80%~90% 的能量都通过呼吸散热和未利用流走了，只有 10%~20% 能变成下一级的肉！",
        en: "Only 10%–20% of energy at one trophic level becomes biomass at the next level; the rest dissipates as heat.",
      },
      coreFormula: "E_{k+1} = \\eta \\cdot E_k \\quad (10\\% \\le \\eta \\le 20\\%)",
      steps: [
        {
          title: { "zh-CN": "“至少消耗生产者”用最高效率 20%（即乘 5）", en: "Minimum Producer Uses 20% Efficiency (×5 per step)" },
          body: { "zh-CN": "草 → 兔 → 鹰：鹰增重 1 kg，至少需兔 1 ÷ 20% = 5 kg，至少需草 5 ÷ 20% = 25 kg。", en: "Grass → Rabbit → Hawk: +1 kg hawk requires at least 1 / 0.2 = 5 kg rabbit and 5 / 0.2 = 25 kg grass." },
          checkQuestion: { "zh-CN": "在“浮游植物 → 小鱼 → 大鱼”链中，大鱼增重 2 kg 至少需要消耗多少 kg 浮游植物（按20%效率算）？", en: "In Phytoplankton → Small Fish → Big Fish, at 20% efficiency, gaining 2 kg of Big Fish requires at least how many kg of phytoplankton?" },
          checkAnswer: "50",
        },
      ],
      misconceptions: [
        {
          tag: "misc_bio_trophic_wrong_bound",
          label: { "zh-CN": "求“至少消耗低营养级”时误用 10% 而非 20%，或少算一级传递", en: "Using 10% instead of 20% when asked for MINIMUM producer required" },
          wrongPattern: { "zh-CN": "跨越两级增重 2 kg，至少消耗生产者错按 10% 算成 200 kg，或只乘一次 5 得 10 kg", en: "Multiplying by 10×10 = 100 instead of 5×5 = 25 for minimum producer" },
          remediationTip: { "zh-CN": "“至少消耗原料”代表转化率最高、最省料，所以选上限 20%（每级反推乘 5）！", en: "'Minimum input required' corresponds to maximum efficiency (20%, i.e., ×5 per trophic step)." },
        },
      ],
    },
    generatorKey: "bio_trophic_energy",
    regionalCodeOverrides: {
      CN: { grade: 11, code: "cbs-2017:XB2-3.2", chapter: "高中选必二 生态系统的能量流动", edition: "人教版高中生物" },
      HK: { grade: 10, code: "HKDSE-Bio-II-Eco", chapter: "S4 Ecosystems: Energy Flow & Pyramids", edition: "HKDSE Biology" },
      TW: { grade: 7, code: "108-Sci:Ja-IV-2", chapter: "國中七下 生態系的能量流動（十分之一定律）", edition: "108課綱 自然" },
      SG: { grade: 10, code: "SG-O-Bio-15.2", chapter: "Organisms & Environment: Energy Flow", edition: "MOE Biology" },
      MY: { grade: 10, code: "MY-KSSM-Bio-T5-9.1", chapter: "Ekosistem & Aliran Tenaga", edition: "DSKP Biologi" },
      JP: { grade: 10, code: "JP-MEXT-BioBasic-4B", chapter: "生態系内の物質循環とエネルギーの流れ", edition: "学習指導要領" },
      KR: { grade: 10, code: "KR-2022:[10통과04-01]", chapter: "생태계 구성 요소와 에너지 피라미드", edition: "2022 개정 통합과학" },
      UK: { grade: 10, code: "UK-GCSE-Bio-4.7.4", chapter: "GCSE Trophic Levels & Transfer of Biomass", edition: "GCSE Biology" },
      US: { grade: 9, code: "NGSS.HS-LS2-4", chapter: "Cycling of Matter & Flow of Energy in Ecosystems", edition: "NGSS Biology" },
    },
  },

  // ==================== COMPUTING & AI MULTI-GRADE CHAIN ====================
  {
    id: "mt_cs_loops_trace",
    subjectId: "computing",
    domain: "Algorithms & Control Flow",
    domainI18n: { "zh-CN": "算法控制流与循环追踪", "zh-TW": "迴圈與演算法追蹤", en: "Control Flow & Loop Tracing", ja: "反復構造と変数トレース", ko: "반복 구조와 변수 추적", ms: "Struktur Kawalan & Gelung" },
    cognitiveType: "procedural",
    baselineGrade: 8,
    centrality: 0.86,
    title: {
      "zh-CN": "分支循环控制流与累加器变量状态表追踪",
      "zh-TW": "條件分支與迴圈變數狀態追蹤",
      en: "Conditionals, For/While Loops & Variable State Tracing",
      ja: "条件分岐・反復処理とトレース表",
      ko: "조건·반복문과 변수 상태 추적",
      ms: "Gelung & Penjejakan Pemboleh Ubah",
    },
    description: {
      "zh-CN": "精准追踪 `for i in range(1, n)` / 步长累加循环中边界条件是否包含终点（左闭右开 vs 闭区间）。",
      en: "Trace accumulator updates across loop iterations and watch inclusive vs exclusive loop bounds.",
    },
    masteryCriteria: [
      { "zh-CN": "在 Python `range(1, n)` 中明确上界 `n` 不包含在内（执行到 `n-1` 停止）", en: "Recognize that `range(1, n)` stops at `n - 1` (half-open interval)" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：在 Python 里写 `range(1, 5)` 让机器人报数，机器人最后报出的数字是 5 还是 4？",
      en: "Ask: In Python, if a robot counts `for i in range(1, 5)`, is the last number it says 4 or 5?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "Python 的 `range(a, b)` 是“左闭右开”站台：从 `a` 上车，一看到 `b` 站牌立刻下车（不执行 `b`）！",
        en: "`range(a, b)` is half-open `[a, b)`: it starts at `a` and halts right BEFORE reaching `b`.",
      },
      coreFormula: "\\sum_{i=1}^{n-1} i = \\frac{(n-1)n}{2}",
      steps: [
        {
          title: { "zh-CN": "画出每轮 i 与 s 的状态行", en: "Write a 2-Row Trace Table (i, s)" },
          body: { "zh-CN": "`s = 0; for i in range(1, 5): s += i` → i 依次取 1, 2, 3, 4，最终 s = 1+2+3+4 = 10。", en: "For `range(1, 5)`, `i` takes 1, 2, 3, 4, giving `s = 10` (not 15!)." },
          checkQuestion: { "zh-CN": "执行 `s = 0; for i in range(1, 6): s += i` 后，s 的最终值是多少？", en: "After `s = 0; for i in range(1, 6): s += i`, what is `s`?" },
          checkAnswer: "15",
        },
      ],
      misconceptions: [
        {
          tag: "misc_cs_off_by_one_range",
          label: { "zh-CN": "差一错误（Off-by-One）：误把 `range(1, n)` 的右端点 `n` 也累加进去", en: "Off-by-one error: including the exclusive stop value `n` in `range(1, n)`" },
          wrongPattern: { "zh-CN": "把 `range(1, 5)` 累加和算成 1+2+3+4+5 = 15", en: "Evaluating sum of `range(1, 5)` as 15 instead of 10" },
          remediationTip: { "zh-CN": "`range(a, b)` 共有 `b - a` 个数，最大只到 `b - 1`！", en: "`range(a, b)` yields `b - a` iterations, ending at `b - 1`." },
        },
      ],
    },
    generatorKey: "cs_loop_trace",
    regionalCodeOverrides: {
      CN: { grade: 8, code: "cit-2022:Alg-8.2", chapter: "八年级信息科技 算法的控制结构与循环", edition: "2022 信息科技课标" },
      HK: { grade: 9, code: "HKDSE-ICT-D1", chapter: "S3/DSE ICT: Iteration & Algorithm Tracing", edition: "HKDSE ICT" },
      TW: { grade: 8, code: "108-Tech:Alg-IV-2", chapter: "國中資訊科技 結構化程式設計（迴圈）", edition: "108課綱 科技" },
      SG: { grade: 9, code: "SG-O-Comp-2.2", chapter: "O-Level Computing: Selection & Iteration", edition: "MOE Computing" },
      MY: { grade: 8, code: "MY-KSSM-ASK-T2-3.2", chapter: "Asas Sains Komputer: Struktur Kawalan Ulangan", edition: "DSKP ASK" },
      JP: { grade: 10, code: "JP-MEXT-Info1-3A", chapter: "高校情報I アルゴリズムと反復構造", edition: "学習指導要領" },
      KR: { grade: 8, code: "KR-2022:[9정03-03]", chapter: "중학 정보 제어 구조와 반복", edition: "2022 개정 정보" },
      UK: { grade: 8, code: "UK-GCSE-CS-2.2", chapter: "KS3/GCSE Programming Fundamentals & Trace Tables", edition: "OCR/AQA GCSE CS" },
      US: { grade: 9, code: "AP-CSP-AAP-2.K", chapter: "Iteration & Program State Tracing", edition: "CSTA / AP CSP" },
    },
  },
  {
    id: "mt_cs_arrays_binary_search",
    subjectId: "computing",
    domain: "Searching & Divide-and-Conquer",
    domainI18n: { "zh-CN": "二分查找与分治思想", "zh-TW": "二分搜尋法", en: "Binary Search & Halving Bounds", ja: "二分探索法", ko: "이진 탐색 알고리즘", ms: "Carian Perduaan" },
    cognitiveType: "reasoning",
    baselineGrade: 9,
    centrality: 0.83,
    title: {
      "zh-CN": "有序序列二分查找原理与最坏比较次数 ⌊log₂N⌋ + 1",
      "zh-TW": "有序陣列二分搜尋與最多比較次數",
      en: "Binary Search Preconditions & Worst-Case Comparisons",
      ja: "整列済み配列の二分探索と最大比較回数",
      ko: "정렬된 배열의 이진 탐색과 최대 비교 횟수",
      ms: "Carian Perduaan & Bilangan Perbandingan Maksimum",
    },
    description: {
      "zh-CN": "理解二分查找必须以“数据已按单调顺序排列”为前提，每次比较排除一半候选区间，计算最坏情况比较次数。",
      en: "Apply binary search on sorted arrays and compute worst-case comparison count ⌊log₂ N⌋ + 1.",
    },
    masteryCriteria: [
      { "zh-CN": "精准计算长度为 2^k - 1（如 7、15、31、63、127）的有序表二分查找最多比较 k 次", en: "Compute exact worst-case comparisons k for N = 2^k - 1 sorted elements" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：心里想一个 1 到 100 之间的整数，每次只回答“大了/小了/猜中了”，为什么最多 7 次保证能猜中？",
      en: "Ask: In a 'Guess My Number' game from 1 to 100 with Higher/Lower hints, why are 7 guesses ALWAYS enough?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "每问一次正中间那个数，候选范围直接砍半！2⁷ = 128 > 100，所以哪怕 100 个数最多砍 7 刀必见分晓。",
        en: "Each midpoint check halves the search space; since 2⁷ = 128 ≥ 100, at most 7 comparisons find any element.",
      },
      coreFormula: "C_{\\max}(N) = \\lfloor \\log_2 N \\rfloor + 1",
      steps: [
        {
          title: { "zh-CN": "对数折半计数法", en: "Halving Count via Powers of 2" },
          body: { "zh-CN": "N = 15 时：15 → 7 → 3 → 1 → 0，共需最多 4 次比较（因 2³ ≤ 15 < 2⁴）。", en: "For N = 15 sorted items, 2³ ≤ 15 < 2⁴, so worst-case comparisons = 3 + 1 = 4." },
          checkQuestion: { "zh-CN": "在含 31 个升序元素的数组中执行二分查找，最坏情况下最多需要比较几次？", en: "In a sorted array of 31 elements, what is the maximum number of binary search comparisons?" },
          checkAnswer: "5",
        },
      ],
      misconceptions: [
        {
          tag: "misc_cs_bsearch_half_linear",
          label: { "zh-CN": "把二分查找最坏比较次数误算成 N/2（混淆折半对数与线性减半）", en: "Computing worst-case binary search comparisons as N/2 instead of ⌊log₂ N⌋ + 1" },
          wrongPattern: { "zh-CN": "31 个元素二分查找最多比较次数错算成 15 或 16 次", en: "Saying 31 elements require 15 comparisons instead of 5" },
          remediationTip: { "zh-CN": "不是只折半一次，而是“每一轮都继续折半”！看 2 的几次方能盖住 N。", en: "Binary search halves REPEATEDLY every step: count powers of 2, not N ÷ 2!" },
        },
      ],
    },
    generatorKey: "cs_binary_search",
    regionalCodeOverrides: {
      CN: { grade: 10, code: "cit-2017:B1-Alg-3", chapter: "高中信息科技必修一 二分查找算法效率", edition: "人教/浙教版信息科技" },
      HK: { grade: 10, code: "HKDSE-ICT-D2", chapter: "HKDSE ICT: Linear vs Binary Search", edition: "HKDSE ICT" },
      TW: { grade: 9, code: "108-Tech:Alg-V-1", chapter: "國中九/高一 搜尋演算法（二分搜尋）", edition: "108課綱 資訊科技" },
      SG: { grade: 10, code: "SG-O-Comp-2.4", chapter: "Search Algorithms: Binary Search", edition: "MOE Computing" },
      MY: { grade: 9, code: "MY-KSSM-ASK-T3-3.1", chapter: "Carian Linear & Carian Perduaan", edition: "DSKP ASK" },
      JP: { grade: 10, code: "JP-MEXT-Info1-3B", chapter: "高校情報I 線形探索と二分探索の比較回数", edition: "学習指導要領" },
      KR: { grade: 10, code: "KR-2022:[12정03-02]", chapter: "고등학교 정보 순차 탐색과 이진 탐색", edition: "2022 개정 정보" },
      UK: { grade: 10, code: "UK-GCSE-CS-2.1.2", chapter: "GCSE Standard Searching Algorithms: Binary Search", edition: "GCSE Computer Science" },
      US: { grade: 10, code: "AP-CSA-CON-2.P", chapter: "Binary Search & Logarithmic Halving", edition: "AP CSP / CSA" },
    },
  },
  {
    id: "mt_cs_algo_complexity",
    subjectId: "computing",
    domain: "Computational Complexity",
    domainI18n: { "zh-CN": "算法时间复杂度分析", "zh-TW": "時間複雜度 Big-O", en: "Time Complexity & Nested Loops", ja: "計算量とオーダー記法", ko: "알고리즘 시간 복잡도", ms: "Kerumitan Masa Algoritma" },
    cognitiveType: "modeling",
    baselineGrade: 11,
    centrality: 0.78,
    title: {
      "zh-CN": "嵌套循环基本操作次数与渐进时间复杂度 O(n²)",
      "zh-TW": "巢狀迴圈執行次數與時間複雜度",
      en: "Nested Loop Operation Counts & Quadratic Scaling O(n²)",
      ja: "二重ループの実行回数と計算量 O(n²)",
      ko: "중첩 반복문 수행 횟수와 시간 복잡도 O(n²)",
      ms: "Gelung Bersarang & Kerumitan O(n²)",
    },
    description: {
      "zh-CN": "统计双重循环内层语句执行总次数，理解数据规模扩大 k 倍时 O(n²) 算法耗时扩大 k² 倍。",
      en: "Count inner-loop executions in nested loops and predict k² runtime scaling when input size scales by k.",
    },
    masteryCriteria: [
      { "zh-CN": "准确推算 O(n²) 算法在输入规模翻 k 倍后的运行时间倍率 k²", en: "Predict T(k·n) = k² · T(n) for quadratic O(n²) algorithms" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：班里每个人都要和其他所有人握一次手，人数从 20 人翻倍到 40 人，握手总次数是翻 2 倍，还是翻大约 4 倍？",
      en: "Ask: If everyone in a room shakes hands with everyone else, when room size doubles from 20 to 40, do handshakes double or roughly quadruple?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "外层跑 n 圈、每圈里面又跑 n 步，总步数是面积 n×n = n²！边长翻 3 倍，正方形面积翻 3² = 9 倍。",
        en: "An n × n nested loop behaves like the area of a square: scaling side n by k scales work by k²!",
      },
      coreFormula: "T(k \\cdot n) \\approx k^2 \\cdot T(n) \\quad \\text{for } \\Theta(n^2)",
      steps: [
        {
          title: { "zh-CN": "二次倍率速算", en: "Quadratic Scaling Factor" },
          body: { "zh-CN": "冒泡排序处理 1000 条数据耗时 2 秒；当数据量扩大 3 倍至 3000 条时，耗时约 2 × 3² = 18 秒。", en: "If an O(n²) sort takes 2 s for N = 1000, then for N = 3000 (3×) it takes ≈ 2 × 3² = 18 s." },
          checkQuestion: { "zh-CN": "某 O(n²) 算法处理 N=500 耗时 3 秒，处理 N=1000（扩大2倍）约耗时多少秒？", en: "An O(n²) algorithm takes 3 s for N=500. Estimate runtime (s) for N=1000:" },
          checkAnswer: "12",
        },
      ],
      misconceptions: [
        {
          tag: "misc_cs_quad_linear_scale",
          label: { "zh-CN": "将 O(n²) 二次复杂度当成线性比例算耗时（漏掉倍率平方）", en: "Scaling O(n²) runtime linearly by k instead of quadratically by k²" },
          wrongPattern: { "zh-CN": "规模扩大 3 倍，O(n²) 原耗时 2 秒错算成 2 × 3 = 6 秒", en: "Predicting 2 × 3 = 6 s instead of 2 × 9 = 18 s" },
          remediationTip: { "zh-CN": "O(n²) 看指数 2：输入乘 k，时间必须乘 k²！", en: "In O(n²), multiplying input size by k multiplies operations by k²." },
        },
      ],
    },
    generatorKey: "cs_complexity_scale",
    regionalCodeOverrides: {
      CN: { grade: 11, code: "cit-2017:XB1-Alg-4", chapter: "高中选必一 数据结构与算法效率度量", edition: "浙教/人教版" },
      HK: { grade: 11, code: "HKDSE-ICT-Elective-A", chapter: "S5 ICT Software Dev: Algorithm Efficiency", edition: "HKDSE ICT" },
      TW: { grade: 10, code: "108-Tech:Alg-V-3", chapter: "高中資訊科技 演算法效能分析", edition: "108課綱 資訊" },
      SG: { grade: 11, code: "SG-A-Comp-H2-2.3", chapter: "H2 Computing: Complexity O(n) vs O(n²)", edition: "GCE A-Level Computing" },
      MY: { grade: 11, code: "MY-KSSM-SK-T5-1.4", chapter: "Sains Komputer: Kecekapan Algoritma", edition: "DSKP Sains Komputer" },
      JP: { grade: 11, code: "JP-MEXT-Info2-2A", chapter: "情報II アルゴリズムの計算量比較", edition: "学習指導要領" },
      KR: { grade: 11, code: "KR-2022:[12정03-04]", chapter: "알고리즘 수행 시간과 효율성 분석", edition: "2022 개정 정보" },
      UK: { grade: 11, code: "UK-ALevel-CS-4.4", chapter: "A-Level Big-O Time Complexity", edition: "AQA/OCR CS" },
      US: { grade: 11, code: "AP-CSP-AAP-4.A", chapter: "Reasonable vs Quadratic/Exponential Runtime", edition: "AP CSP / CSA" },
    },
  },
];
