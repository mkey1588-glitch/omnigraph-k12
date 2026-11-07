import type { TopicSeedDefinition } from "./canonical-topics-math";

/**
 * Phase 2 Expansion: Multi-Grade Connected Subgraphs for English (+3 -> 4), Geography (+2 -> 3),
 * History (+2 -> 3), and 9th Subject Literacy / Critical Reading (+4)
 */
export const HUMANITIES_AND_LANG_EXPANSION_TOPICS: TopicSeedDefinition[] = [
  // ==================== ENGLISH & ACADEMIC LITERACY CHAIN ====================
  {
    id: "mt_eng_sentence_sva_tense",
    subjectId: "english",
    domain: "Sentence Core & Tense Logic",
    domainI18n: { "zh-CN": "主谓一致与时态时间轴", "zh-TW": "主詞動詞一致與時態邏輯", en: "Subject-Verb Agreement & Tense Timeline", ja: "主語と動詞の一致・時制", ko: "주어-동사 수일치와 시제", ms: "Keselarasan Subjek-Kata Kerja & Kala" },
    cognitiveType: "procedural",
    baselineGrade: 6,
    centrality: 0.89,
    rootReason: "英语核心句法地基：剥离介词短语干扰定位真正核心主语单复数，匹配时态轴。",
    title: {
      "zh-CN": "剥离修饰语定位核心主语（主谓一致）与完成时态辨析",
      "zh-TW": "主詞動詞單複數一致與現在完成式",
      en: "Core Head-Noun Subject-Verb Agreement & Present Perfect",
      ja: "修飾語を除いた主語と動詞の一致・現在完了",
      ko: "수식어구 분리 수일치와 현재완료",
      ms: "Keselarasan Subjek Teras & Present Perfect",
    },
    description: {
      "zh-CN": "排除 `of / with / together with` 介词短语就近干扰，依据中心名词单复数确定谓语动词。",
      en: "Ignore intervening prepositional phrases (`of...`, `along with...`) to match the verb to the true head subject.",
    },
    masteryCriteria: [
      { "zh-CN": "在 `The list of items is/are` 结构中精准锁定单数中心词 `list` 选 `is`", en: "Match singular head noun `The list` with `is`, ignoring plural object `items`" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：英语里说“一箱苹果很重”（A box of apples ___ heavy），谓语动词看“一箱（单数）”还是看“苹果们（复数）”？",
      en: "Ask: In 'A box of apples ___ heavy', does the verb agree with singular 'box' or plural 'apples'?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "把介词短语 `of ...` 用括号括起来隐身，剩下的真正主心骨是谁，动词就听谁的！",
        en: "Bracket out prepositional phrases `(of ...)`: the remaining head noun controls the verb!",
      },
      coreFormula: "$\\text{Head Noun}_{\\text{sg}} + (\\text{of Noun}_{\\text{pl}}) \\implies \\text{Verb}_{\\text{sg}}$",
      steps: [
        {
          title: { "zh-CN": "括号剥离法", en: "Bracket Out Modifiers" },
          body: { "zh-CN": "`The quality [of these sensors] ___ (is / are) reliable.` 隐去 `[of these sensors]`，主语 `quality` 为不可数单数，填 `is`。", en: "`The quality [of these sensors] is reliable` — head noun `quality` is singular." },
          checkQuestion: { "zh-CN": "选词填空：`The results of the experiment ___ (show / shows) a clear trend.` 应填哪个词？", en: "Fill in: `The results of the experiment ___ (show / shows) a clear trend.`" },
          checkAnswer: "show",
        },
      ],
      misconceptions: [
        {
          tag: "misc_eng_proximity_trap",
          label: { "zh-CN": "就近原则误用：被紧挨着动词的复数宾语带偏谓语单复数", en: "Proximity error: matching verb to the nearest noun inside a prepositional phrase" },
          wrongPattern: { "zh-CN": "`A box of books are heavy`（被复数 `books` 误导选 `are`）", en: "Writing `The list of participants are...` instead of `is...`" },
          remediationTip: { "zh-CN": "介词后面的名词永远只是宾语配角，绝不能越权决定主句谓语！", en: "Objects of prepositions never govern the main clause verb." },
        },
      ],
    },
    generatorKey: "eng_sva_tense",
    regionalCodeOverrides: {
      CN: { grade: 7, code: "CN-2022-Eng-L3-Gram", chapter: "七年级/八年级 核心句法与现在完成时", edition: "义务教育英语课标(2022)" },
      HK: { grade: 6, code: "HK-EDB-Eng-KS2-G3", chapter: "P6/S1 Agreement & Present Perfect", edition: "HK EDB English" },
      TW: { grade: 8, code: "108-Eng:G-IV-3", chapter: "國中英語 主詞動詞一致與完成式", edition: "108課綱 英語文" },
      SG: { grade: 6, code: "SG-EL-P6-Gram-4", chapter: "PSLE Synthesis & Subject-Verb Agreement", edition: "MOE English" },
      MY: { grade: 7, code: "MY-CEFR-B1-Gram1", chapter: "Form 1/2 Grammar: Agreement & Tenses", edition: "KSSM English" },
      JP: { grade: 8, code: "JP-MEXT-Eng-2G", chapter: "中2・中3英語 主語と動詞・現在完了形", edition: "学習指導要領" },
      KR: { grade: 8, code: "KR-2022:[9영02-04]", chapter: "중학 영어 주어-동사 수일치와 시제", edition: "2022 개정 영어과" },
      UK: { grade: 6, code: "UK-KS2-GPS-G1", chapter: "KS2/KS3 Standard English Verb Inflections", edition: "England NC English" },
      US: { grade: 6, code: "CCSS.ELA-L.6.1", chapter: "Conventions of Standard English Agreement", edition: "Common Core ELA" },
    },
  },
  {
    id: "mt_eng_passive_participle",
    subjectId: "english",
    domain: "Voice & Non-Finite Verbs",
    domainI18n: { "zh-CN": "被动语态与非谓语分词", "zh-TW": "被動語態與分詞構句", en: "Passive Voice & Participle Clauses", ja: "受動態と分詞の形容詞的用法", ko: "수동태와 현재/과거분사", ms: "Ayat Pasif & Partisipel" },
    cognitiveType: "reasoning",
    baselineGrade: 8,
    centrality: 0.83,
    title: {
      "zh-CN": "现在分词（主动 -ing）与过去分词（被动 -ed）逻辑主语辨析",
      "zh-TW": "現在分詞與過去分詞修飾邏輯辨析",
      en: "Present (-ing Active) vs. Past (-ed Passive) Participle Clauses",
      ja: "現在分詞（能動）と過去分詞（受動）の識別",
      ko: "능동(-ing) 분사와 수동(-ed/p.p.) 분사 구별",
      ms: "Partisipel Kini (-ing) vs. Lepas (-ed)",
    },
    description: {
      "zh-CN": "找到非谓语动词的逻辑主语（主句主语或被修饰名词），判断其发出动作（用 `-ing`）还是承受动作（用过去分词）。",
      en: "Identify the logical subject of a participle and choose `-ing` for active agents vs past participle for passive recipients.",
    },
    masteryCriteria: [
      { "zh-CN": "准确判断分词状语与主句主语的主被动关系，杜绝悬垂分词", en: "Match participle voice (`Seeing` vs `Seen`) to the main clause subject" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：“从山顶往下看，这座城市很美”用英语开头写 `Seeing from the hill, the city...` 为什么闹了“城市自己长眼睛看”的笑话？",
      en: "Ask: Why does 'Seeing from the hilltop, the city looked tiny' accidentally claim the city has eyes?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "分词前面没写主语时，默认借用逗号后面的主句主语！“城市”是被看的对象，必须用被动 `Seen`，不能用主动 `Seeing`。",
        en: "An opening participle borrows the main clause's subject: `the city` IS seen (passive `Seen`), not doing the seeing!",
      },
      coreFormula: "$\\text{Subject executes action} \\to V\\text{-ing}; \\quad \\text{Subject receives action} \\to V\\text{-ed/p.p.}$",
      steps: [
        {
          title: { "zh-CN": "一找逻辑主语，二判主动被动", en: "Find Logical Subject → Check Active vs Passive" },
          body: { "zh-CN": "`______ (Build / Built) in 1920, the bridge still stands.` 逻辑主语是 `the bridge`（被建造），故填过去分词 `Built`。", en: "`Built in 1920, the bridge still stands` — the bridge was built (passive)." },
          checkQuestion: { "zh-CN": "选词填空：`______ (Writing / Written) in clear English, the manual is easy to follow.`", en: "Fill in: `______ (Writing / Written) in clear English, the manual is easy to follow.`" },
          checkAnswer: "written",
        },
      ],
      misconceptions: [
        {
          tag: "misc_eng_dangling_ing",
          label: { "zh-CN": "悬垂分词误用：不看主句主语是“物”就直接套用 `V-ing` 开头", en: "Dangling active `-ing` participle when main subject is the passive receiver" },
          wrongPattern: { "zh-CN": "`Comparing with last year, output rose 20%`（误用主动 `Comparing` 替代 `Compared`）", en: "Writing `Designing by students, the robot won` instead of `Designed`" },
          remediationTip: { "zh-CN": "永远问一句：逗号后面的主语是“施事者”还是“受事者”？受事者果断选过去分词！", en: "Ask whether the main-clause subject performs or receives the action." },
        },
      ],
    },
    generatorKey: "eng_participle_voice",
    regionalCodeOverrides: {
      CN: { grade: 10, code: "CN-2017-Eng-B2", chapter: "高中英语必修 非谓语动词（分词作定语与状语）", edition: "普通高中英语课标(2017/2020)" },
      HK: { grade: 9, code: "HK-EDB-S3-Eng-Part", chapter: "S3 English: Participle Phrases & Passive Voice", edition: "EDB English Language" },
      TW: { grade: 10, code: "108-Eng:G-V-4", chapter: "高中英文 分詞構句與被動語態", edition: "108課綱 英語文" },
      SG: { grade: 8, code: "SG-O-EL-Editing-3", chapter: "Sec 2/3 Editing: Participle Modifiers", edition: "MOE English" },
      MY: { grade: 9, code: "MY-CEFR-B1-Pass", chapter: "Form 3/4 Passive & Participle Clauses", edition: "KSSM English" },
      JP: { grade: 9, code: "JP-MEXT-Eng-3G1", chapter: "中3・高校英語 分詞の後置修飾と分詞構文", edition: "学習指導要領" },
      KR: { grade: 9, code: "KR-2022:[9영02-07]", chapter: "중3/고1 분사구문과 능동·수동", edition: "2022 개정 영어과" },
      UK: { grade: 8, code: "UK-NC-KS3-Eng-Gram2", chapter: "KS3 Active/Passive & Non-Finite Clauses", edition: "England NC KS3" },
      US: { grade: 8, code: "CCSS.ELA-L.8.1a", chapter: "Verbals (Participles) & Dangling Modifiers", edition: "Common Core / SAT" },
    },
  },
  {
    id: "mt_eng_conditionals_academic",
    subjectId: "english",
    domain: "Subjunctive & Academic Discourse",
    domainI18n: { "zh-CN": "虚拟条件句与学术论证", "zh-TW": "假設語氣與學術寫作", en: "Counterfactual Conditionals & Argumentation", ja: "仮定法過去・仮定法過去完了", ko: "가정법 과거완료와 학술 담화", ms: "Ayat Bersyarat & Wacana Akademik" },
    cognitiveType: "application",
    baselineGrade: 10,
    centrality: 0.79,
    title: {
      "zh-CN": "与过去事实相反的第三类虚拟条件句（If had done, would have done）",
      "zh-TW": "與過去事實相反之假設語氣",
      en: "Third Conditional Counterfactuals (If + had p.p., would have p.p.)",
      ja: "仮定法過去完了（過去の事実の反対）",
      ko: "가정법 과거완료 시제 호응",
      ms: "Ayat Bersyarat Jenis Ketiga (Counterfactual)",
    },
    description: {
      "zh-CN": "掌握对过去已发生事实进行反事实假设的从句与主句时态严格配对：从句 `had + p.p.`，主句 `would/could + have + p.p.`。",
      en: "Pair `If + past perfect (had + p.p.)` in the condition clause with `would/could have + p.p.` in the result clause.",
    },
    masteryCriteria: [
      { "zh-CN": "严禁在 `If` 条件从句中重复出现 `would have`（即避免 `If I would have...`）", en: "Never use `would have` inside the `if`-clause of a third conditional" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：英语表达“要是昨天设了闹钟，我就不会迟到了”，`If` 那半句里能不能写 `If I would have set`？",
      en: "Ask: Why is 'If I would have studied, I would have passed' non-standard in academic English?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "英语对过去遗憾的“时光倒流法则”：时态整体往过去退一格——过去式退成过去完成 `had done`，主句配 `would have done`！",
        en: "To express an unreal past, backshift one step further into the past: `If + had done` → `would have done`.",
      },
      coreFormula: "$\\text{If } S + \\text{had } V_{\\text{p.p.}}, \\quad S + \\text{would have } V_{\\text{p.p.}}$",
      steps: [
        {
          title: { "zh-CN": "主从句时态镜像检验", en: "Check Clause Pairing" },
          body: { "zh-CN": "看到主句有 `would have arrived`，立刻确认 `If` 从句必须是 `had left`（而非 `left` 或 `would have left`）。", en: "When result has `would have arrived`, the `if`-clause requires `had left`." },
          checkQuestion: { "zh-CN": "用动词 `check` 的适当形式填空：`If the team ______ (check) the sensor yesterday, the launch would have succeeded.`（填两个英文词）", en: "Complete using the verb 'check': `If the team ______ (check) the sensor yesterday, the launch would have succeeded.`" },
          checkAnswer: "had checked",
        },
      ],
      misconceptions: [
        {
          tag: "misc_eng_if_would_have",
          label: { "zh-CN": "在 `If` 从句里误塞入 `would have`（双 `would` 语病）", en: "Inserting `would have` inside the `if`-clause instead of `had + p.p.`" },
          wrongPattern: { "zh-CN": "`If she would have known earlier, she would have called.`", en: "`If she would have known...` instead of `If she had known...`" },
          remediationTip: { "zh-CN": "口诀：`If` 从句绝不跟 `would` 同住一屋！过去虚拟认准 `If ... had done`。", en: "Keep `would` out of the `if`-clause; use `had + past participle`." },
        },
      ],
    },
    generatorKey: "eng_third_conditional",
    regionalCodeOverrides: {
      CN: { grade: 11, code: "CN-2017-Eng-XB1", chapter: "高中选择性必修英语 虚拟语气与学术写作", edition: "普通高中英语课标(2017/2020)" },
      HK: { grade: 10, code: "HKDSE-Eng-Cond3", chapter: "S4/S5 Conditional Sentences Type 3", edition: "HKDSE English" },
      TW: { grade: 11, code: "108-Eng:G-V-6", chapter: "高二英文 與過去事實相反的假設語氣", edition: "108課綱 英語文" },
      SG: { grade: 9, code: "SG-O-EL-Cond-4", chapter: "Upper Sec Grammar: Counterfactual Conditionals", edition: "MOE O-Level English" },
      MY: { grade: 10, code: "MY-CEFR-B2-Cond", chapter: "Form 4/5 Third & Mixed Conditionals", edition: "KSSM English" },
      JP: { grade: 10, code: "JP-MEXT-EngComm-1G", chapter: "高校英語コミュニケーションI 仮定法過去完了", edition: "高校学習指導要領" },
      KR: { grade: 10, code: "KR-2022:[12영02-04]", chapter: "고등 공통영어 가정법 과거완료", edition: "2022 개정 영어과" },
      UK: { grade: 10, code: "UK-GCSE-Eng-Discourse", chapter: "GCSE Academic Modality & Conditionals", edition: "GCSE English" },
      US: { grade: 10, code: "CCSS.ELA-L.9-10.1", chapter: "Subjunctive/Conditional Mood in Argumentation", edition: "Common Core / SAT" },
    },
  },

  // ==================== GEOGRAPHY & EARTH SCIENCE CHAIN ====================
  {
    id: "mt_geo_contour_elevation",
    subjectId: "geography",
    domain: "Topography & Atmosphere",
    domainI18n: { "zh-CN": "等高线地形与气温垂直递减率", "zh-TW": "等高線地形與氣溫垂直遞減率", en: "Contour Relief & Environmental Lapse Rate", ja: "等高線地形図と気温減率", ko: "등고선 지형도와 기온 감률", ms: "Garisan Kontur & Kadar Susut Suhu" },
    cognitiveType: "application",
    baselineGrade: 8,
    centrality: 0.83,
    title: {
      "zh-CN": "相对高度计算与对流层气温垂直递减率（-0.6°C / 100m）",
      "zh-TW": "相對高度與對流層氣溫垂直遞減（-0.6°C/100m）",
      en: "Relative Elevation & Tropospheric Lapse Rate (-0.6°C per 100 m)",
      ja: "標高差と対流圏の気温減率（100mにつき-0.6℃）",
      ko: "해발고도 차와 대류권 기온 감률(-0.6°C/100m)",
      ms: "Ketinggian Relatif & Kadar Susut Suhu (-0.6°C/100m)",
    },
    description: {
      "zh-CN": "判读等高线海拔高差 Δh，运用对流层海拔每升高 100 m 气温约下降 0.6°C（即 6°C/km）推算山顶或盆地气温。",
      en: "Compute elevation difference Δh from contour maps and apply the 6°C/km tropospheric lapse rate.",
    },
    masteryCriteria: [
      { "zh-CN": "海拔升高做减法、海拔降低做加法，严防把 -0.6°C/100m 正负号弄反", en: "Subtract 0.6°C per 100 m ascent and add 0.6°C per 100 m descent" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：夏天山脚下 30°C 很热，爬上高出山脚 2000 米的山峰顶上，气温大约降到了多少度？要不要带外套？",
      en: "Ask: If it is 30°C at the foot of a mountain, roughly what temperature is it 2000 m higher at the summit?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "对流层大气主要靠地面长波辐射加热——离地面越远越冷！每往上爬 1000 米，温度计就往下掉 6°C。",
        en: "The troposphere is warmed from the ground up: climbing 1000 m drops air temperature by 6°C.",
      },
      coreFormula: "$T_{\\text{top}} = T_{\\text{base}} - 0.6^\\circ\\text{C} \\times \\frac{h_{\\text{top}} - h_{\\text{base}}}{100}$",
      steps: [
        {
          title: { "zh-CN": "先求相对高度差 Δh，再乘 6°C/km", en: "Find Δh in km, Multiply by 6°C" },
          body: { "zh-CN": "山脚海拔 500 m 气温 24°C，山顶海拔 2500 m：高差 Δh = 2000 m = 2 km，降温 2 × 6 = 12°C，山顶为 12°C。", en: "From 500 m (24°C) to 2500 m: Δh = 2 km → drop 12°C → summit is 12°C." },
          checkQuestion: { "zh-CN": "山麓海拔 200 m 处气温为 21°C，求海拔 1200 m 处的理论气温是多少 °C？", en: "At 200 m elevation, T = 21°C. Estimate T (°C) at 1200 m elevation:" },
          checkAnswer: "15",
        },
      ],
      misconceptions: [
        {
          tag: "misc_geo_lapse_use_abs_h",
          label: { "zh-CN": "直接用山顶绝对海拔算降温（漏减山脚起始海拔），或把降温算成升温", en: "Using absolute summit altitude instead of relative height Δh = h₂ - h₁" },
          wrongPattern: { "zh-CN": "山脚 500 m (24°C) 到山顶 2500 m，直接用 2500 m 算降温 15°C 得 9°C", en: "Subtracting 0.6 × (2500/100) instead of 0.6 × ((2500-500)/100)" },
          remediationTip: { "zh-CN": "山脚已知温度是在 500 m 测的，必须先算相对高差 Δh = 2500 - 500！", en: "Always subtract the base station's elevation first to get Δh!" },
        },
      ],
    },
    generatorKey: "geo_lapse_rate",
    regionalCodeOverrides: {
      CN: { grade: 7, code: "cgs-2022:Earth-2.2", chapter: "七上 等高线地形图与气温的变化分布", edition: "人教版地理" },
      HK: { grade: 8, code: "HK-EDB-S2-Geog-Map", chapter: "S2 Geography: Map Reading, Relief & Climatic Gradient", edition: "EDB 初中地理" },
      TW: { grade: 7, code: "108-Soc:Geog-IV-2", chapter: "國中地理 地形與氣候（氣溫垂直遞減）", edition: "108課綱 社會" },
      SG: { grade: 8, code: "SG-O-Geog-Weather-1", chapter: "Weather & Climate: Altitude & Temperature", edition: "MOE Geography" },
      MY: { grade: 8, code: "MY-KSSM-Geog-T2-3", chapter: "Form 2 Ketinggian & Pengaruh terhadap Cuaca", edition: "DSKP Geografi" },
      JP: { grade: 10, code: "JP-MEXT-GeoComp-2A", chapter: "高校地理総合 地形図の読図と気候要素", edition: "高校学習指導要領" },
      KR: { grade: 8, code: "KR-2022:[9사(지리)02-01]", chapter: "기후 요소와 해발고도에 따른 기온 변화", edition: "2022 개정 사회과" },
      UK: { grade: 8, code: "UK-NC-KS3-Geog-Weather", chapter: "KS3 Geography: Relief, Contour Lines & Microclimates", edition: "England NC KS3" },
      US: { grade: 8, code: "NGSS.MS-ESS2-2", chapter: "Tropospheric Weather & Elevation Gradient", edition: "NGSS Earth Science" },
    },
  },
  {
    id: "mt_geo_solar_angle_climate",
    subjectId: "geography",
    domain: "Earth's Motion & Solar Geometry",
    domainI18n: { "zh-CN": "地球公转与正午太阳高度角", "zh-TW": "地球公轉與正午太陽仰角", en: "Earth's Tilt & Noon Solar Altitude Angle", ja: "地球の公転と南中高度", ko: "지구의 공전과 남중 고도", ms: "Sudut Tengah Hari Matahari" },
    cognitiveType: "modeling",
    baselineGrade: 10,
    centrality: 0.79,
    title: {
      "zh-CN": "正午太阳高度角公式 H = 90° - |φ - δ| 与二至日纬度计算",
      "zh-TW": "正午太陽仰角公式與回歸線四季判讀",
      en: "Noon Solar Altitude H = 90° - |φ - δ| at Solstices & Equinoxes",
      ja: "春分・夏至・冬至における太陽の南中高度計算",
      ko: "춘추분·하지·동지 태양의 남중 고도 계산",
      ms: "Pengiraan Sudut Matahari Tengah Hari",
    },
    description: {
      "zh-CN": "运用纬度差法则计算二分二至日某地正午太阳高度角（同半球纬度相减，异半球纬度相加）。",
      en: "Compute solar noon elevation angle H = 90° - |latitude - subsolar declination| across hemispheres.",
    },
    masteryCriteria: [
      { "zh-CN": "当观测地与太阳直射点分处南北异半球时，纬度差取两者绝对值之和 |φ - (-δ)| = φ + δ", en: "Add latitudes when observer and subsolar point lie in opposite hemispheres" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：冬至那天太阳直射南回归线（南纬 23.5°），为什么北半球的我们中午影子拉得全年最长？",
      en: "Ask: On the December solstice when the sun is overhead at 23.5°S, why are noon shadows longest in the Northern Hemisphere?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "直射点头顶是 90°；你离直射点在球面上隔了多少度纬度，太阳高度就从 90° 往下扣多少度！",
        en: "The subsolar point sees the sun at 90°; every 1° of latitudinal separation tilts noon sun down by 1°.",
      },
      coreFormula: "$H = 90^\\circ - |\\varphi - \\delta| \\quad (\\text{North } +, \\text{ South } -)$",
      steps: [
        {
          title: { "zh-CN": "北正南负，统一用数轴距离 |φ - δ|", en: "Assign N = +, S = - and Take |φ - δ|" },
          body: { "zh-CN": "求 40°N 在春分日（直射赤道 δ=0°）的正午太阳高度：H = 90° - |40° - 0°| = 50°。", en: "At 40°N on the equinox (δ = 0°): H = 90° - |40° - 0°| = 50°." },
          checkQuestion: { "zh-CN": "春分日太阳直射赤道（0°），北纬 30° 地区的正午太阳高度角是多少度？", en: "On the equinox (subsolar point 0°), find noon solar altitude (°) at 30°N:" },
          checkAnswer: "60",
        },
      ],
      misconceptions: [
        {
          tag: "misc_geo_solar_same_sign",
          label: { "zh-CN": "异半球求纬度差时误用减法而非加法（如 40°N 在冬至直射 23.5°S 时错算 |40 - 23.5|）", en: "Subtracting instead of adding latitudes when observer and subsolar point are in opposite hemispheres" },
          wrongPattern: { "zh-CN": "北纬 40° 冬至日（直射南纬 23.5°）纬度差错算成 40° - 23.5° = 16.5°", en: "Using 40 - 23.5 instead of 40 - (-23.5) = 63.5°" },
          remediationTip: { "zh-CN": "记住跨赤道就像跨数轴零点：北纬 +40° 到南纬 -23.5° 的距离是 40 + 23.5 = 63.5°！", en: "Treat N as + and S as - on a number line: |+40 - (-23.5)| = 63.5°!" },
        },
      ],
    },
    generatorKey: "geo_solar_altitude",
    regionalCodeOverrides: {
      CN: { grade: 11, code: "hgs-2017:XB1-1.1", chapter: "高中地理选择性必修1 地球公转的地理意义（正午太阳高度）", edition: "人教版高中地理" },
      HK: { grade: 10, code: "HKDSE-Geog-Solar", chapter: "Solar Insolation & Seasonal Angle", edition: "HKDSE Geography" },
      TW: { grade: 10, code: "108-Earth:ES-V-1", chapter: "高中地球科學/地理 太陽視運動與正午仰角", edition: "108課綱" },
      SG: { grade: 9, code: "SG-O-Geog-Solar", chapter: "Latitude & Solar Angle", edition: "MOE Geography" },
      MY: { grade: 8, code: "MY-KSSM-Geog-T2-2", chapter: "Form 2 Pergerakan Bumi & Solstis/Ekuinoks", edition: "DSKP Geografi" },
      JP: { grade: 9, code: "JP-MEXT-Sci-3Earth", chapter: "中3理科 地球の公転と太陽の南中高度", edition: "学習指導要領" },
      KR: { grade: 9, code: "KR-2022:[9과04-02]", chapter: "중학교 과학 태양계와 지구의 운동(계절별 남중 고도)", edition: "2022 개정 과학과" },
      UK: { grade: 9, code: "UK-NC-KS3-Geog-Clim", chapter: "KS3 Geography: Latitude, Insolation & Global Climate", edition: "England NC KS3" },
      US: { grade: 8, code: "NGSS.MS-ESS1-1", chapter: "Earth-Sun System & Seasonal Solar Angle", edition: "NGSS Earth & Space" },
    },
  },

  // ==================== HISTORY & SOCIAL INQUIRY CHAIN ====================
  {
    id: "mt_his_trade_demographics",
    subjectId: "history",
    domain: "Quantitative Economic History",
    domainI18n: { "zh-CN": "经济史表格与人口贸易统计判读", "zh-TW": "歷史經濟數據與貿易順逆差", en: "Historical Trade Balance & Demographic Data", ja: "歴史統計資料の読解（貿易・人口）", ko: "역사 통계 사료와 무역 수지 해석", ms: "Analisis Data Sejarah & Perdagangan" },
    cognitiveType: "reasoning",
    baselineGrade: 8,
    centrality: 0.78,
    title: {
      "zh-CN": "近代经济史料表格解读：贸易顺逆差（出超/入超）与增长率辨析",
      "zh-TW": "近代貿易出超入超與歷史統計表判讀",
      en: "Historical Trade Surplus/Deficit & Growth Rate Fallacies",
      ja: "貿易黒字（出超）・赤字（入超）と歴史統計読解",
      ko: "무역 흑자·적자 사료와 비중 변화 분석",
      ms: "Lebihan/Defisit Perdagangan dalam Sumber Sejarah",
    },
    description: {
      "zh-CN": "精确区分历史贸易“出超（出口 > 进口，白银流入）”与“入超（逆差）”，区分“占比下降”与“绝对总量下降”。",
      en: "Calculate historical trade balance (exports minus imports) and avoid confusing a falling percentage share with falling total output.",
    },
    masteryCriteria: [
      { "zh-CN": "准确核算出口额 - 进口额判断出超/入超，不混淆份额占比与绝对数值", en: "Distinguish percentage share changes from absolute quantity changes in historical tables" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：如果一个国家手工业占比从 80% 降到了 50%，但全国经济总盘子扩大了 3 倍，手工业实际产量是变少了还是变多了？",
      en: "Ask: If agriculture's share of GDP dropped from 80% to 50% while total GDP tripled, did farm output shrink or grow?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "历史材料题头号陷阱：比重（%）下降 ≠ 绝对产量下降！蛋糕做大 3 倍后，哪怕分到的比例变小，吃到的蛋糕克数反而更多。",
        en: "A smaller slice (%) of a much larger pie can still be a LARGER absolute amount!",
      },
      coreFormula: "$\\text{Trade Balance} = \\text{Exports} - \\text{Imports}$",
      steps: [
        {
          title: { "zh-CN": "先看表头单位是“万两白银（绝对量）”还是“占比（%）”", en: "Check Units: Absolute Silver vs. % Share" },
          body: { "zh-CN": "某港口出口丝茶 420 万两、进口呢绒 290 万两 → 出超（顺差）= 420 - 290 = 130 万两。", en: "Exports 420 minus Imports 290 yields a trade surplus of +130 units." },
          checkQuestion: { "zh-CN": "史料载某年甲国对乙国出口额为 380 万银元，进口额为 230 万银元，该年甲国贸易顺差（出超）为多少万银元？", en: "Exports = 380 ten-thousand silver dollars (3.8 million), Imports = 230 ten-thousand (2.3 million). Find the trade surplus in ten-thousand silver dollars:" },
          checkAnswer: "150",
        },
      ],
      misconceptions: [
        {
          tag: "misc_his_share_vs_abs",
          label: { "zh-CN": "把“出口减去进口”方向算反，或把“比重下降”误判为“绝对额萎缩”", en: "Reversing Exports - Imports or equating % share drop with absolute decline" },
          wrongPattern: { "zh-CN": "出口 380、进口 230，把顺差算成总和 610 或负值", en: "Adding exports + imports (total volume) when asked for net trade balance" },
          remediationTip: { "zh-CN": "贸易总额 = 出口 + 进口；贸易差额（顺逆差）= 出口 - 进口！审清题干问的是“总额”还是“顺差”。", en: "Total trade volume = X + M; Net trade balance = X - M." },
        },
      ],
    },
    generatorKey: "his_trade_balance",
    regionalCodeOverrides: {
      CN: { grade: 8, code: "chs-2022:Mod-2.1", chapter: "八上/高一 中外历史纲要 近代经济结构变动与贸易统计", edition: "统编版历史" },
      HK: { grade: 9, code: "HK-EDB-S3-Hist-DBQ", chapter: "S3 History: Data-Based Economic & Trade Sources", edition: "EDB 初中歷史" },
      TW: { grade: 8, code: "108-Soc:Hist-IV-4", chapter: "國中八下 近代東亞商貿出超與入超", edition: "108課綱 歷史" },
      SG: { grade: 9, code: "SG-O-Hist-SBQ", chapter: "Source-Based Case Study: Quantitative Evidence", edition: "MOE History" },
      MY: { grade: 9, code: "MY-KSSM-Sej-T3-Perdagangan", chapter: "Form 3 Sejarah Ekonomi & Perdagangan", edition: "DSKP Sejarah" },
      JP: { grade: 10, code: "JP-MEXT-HistComp-2A", chapter: "高校歴史総合 近代の世界市場と貿易統計読解", edition: "高校学習指導要領" },
      KR: { grade: 9, code: "KR-2022:[9역05-02]", chapter: "근대 교역망 확대와 통계 사료 읽기", edition: "2022 개정 역사" },
      UK: { grade: 9, code: "UK-NC-KS3-Hist-Enq", chapter: "KS3 History: Source Utility & Quantitative Evidence", edition: "England NC KS3" },
      US: { grade: 10, code: "C3:D2.Eco.1.9-12 / AP-World", chapter: "AP World DBQ: Trade & Demographic Charts", edition: "C3 / AP World" },
    },
  },
  {
    id: "mt_his_industrial_modern",
    subjectId: "history",
    domain: "Global Modernization & Causation",
    domainI18n: { "zh-CN": "工业革命与多维因果史观", "zh-TW": "工業革命與歷史因果分析", en: "Industrial Revolutions & Historical Causation", ja: "産業革命と社会変容", ko: "산업혁명과 인과관계 분석", ms: "Revolusi Perindustrian & Sebab-Akibat" },
    cognitiveType: "conceptual",
    baselineGrade: 9,
    centrality: 0.76,
    title: {
      "zh-CN": "两次工业革命技术标志、能源代际演进与根本原因 vs 直接导火索辨析",
      "zh-TW": "兩次工業革命技術特徵與歷史因果層次",
      en: "First vs. Second Industrial Revolution & Root Cause vs. Trigger",
      ja: "第一次・第二次産業革命の技術革新と因果構造",
      ko: "1·2차 산업혁명 비교와 근본 원인·도화선 구분",
      ms: "Revolusi Perindustrian Pertama vs Kedua",
    },
    description: {
      "zh-CN": "准确区分第一次工业革命（煤炭+改良蒸汽机+铁路工厂制）与第二次工业革命（电力+内燃机+石油化工+科学与技术紧密结合），辨析历史“根本原因”与“直接导火索”。",
      en: "Contrast 1st (coal/steam/textiles) vs 2nd (electricity/internal combustion/science-led R&D) Industrial Revolutions.",
    },
    masteryCriteria: [
      { "zh-CN": "不将内燃机、电灯、飞机等第二次工业革命成果张冠李戴到第一次工业革命（时代错置 Anachronism）", en: "Avoid anachronisms between 18th-century steam era and late-19th-century electrical/oil era" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：如果拍一部 1820 年英国伦敦的历史剧，街上出现蒸汽火车和电灯电话，哪一样是“穿帮镜头”？",
      en: "Ask: In a movie set in London in 1820, if you see both a steam locomotive and an electric lightbulb, which one is a historical anachronism?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "第一次工业革命（18世纪中叶起）靠工匠经验驱动“蒸汽与煤”；第二次（19世纪中后期起）靠实验室电磁学与热力学驱动“电与石油”！",
        en: "1st IR (~1760–1840) = Coal + Steam + Mechanized Textiles; 2nd IR (~1870–1914) = Electricity + Oil + Internal Combustion.",
      },
      coreFormula: "$\\text{1st IR: Steam/Coal (1760s)} \\longrightarrow \\text{2nd IR: Electricity/Oil (1870s)}$",
      steps: [
        {
          title: { "zh-CN": "能源与动力排期法", en: "Anchor by Power Source" },
          body: { "zh-CN": "瓦特改良蒸汽机（1780s）与斯蒂芬森蒸汽机车（1814/1825）属第一次；发电机、内燃机汽车与电话属第二次。", en: "Steam engines/railways belong to 1st IR; dynamos, automobiles, and telephones belong to 2nd IR." },
          checkQuestion: { "zh-CN": "内燃机汽车与电灯属于第一次工业革命（填 1）还是第二次工业革命（填 2）的代表成果？", en: "Do internal-combustion automobiles and electric lightbulbs belong to the 1st (1) or 2nd (2) Industrial Revolution? (Enter 1 or 2)" },
          checkAnswer: "2",
        },
      ],
      misconceptions: [
        {
          tag: "misc_his_ir_anachronism",
          label: { "zh-CN": "时代错置（Anachronism）：把内燃机或电力应用归入第一次工业革命", en: "Placing internal combustion engines or electrical grids into the First Industrial Revolution" },
          wrongPattern: { "zh-CN": "认为 1851 年伦敦第一届世博会展出了卡尔·本茨的内燃机汽车", en: "Placing gasoline automobiles at the 1851 Crystal Palace Exhibition" },
          remediationTip: { "zh-CN": "1851 年水晶宫世博会是蒸汽时代的巅峰，汽车和电灯要等到 1870–1880 年代才诞生！", en: "1851 Crystal Palace showcased steam machinery; electric lamps and cars arrived in the 1870s–1880s." },
        },
      ],
    },
    generatorKey: "his_industrial_era",
    regionalCodeOverrides: {
      CN: { grade: 9, code: "chs-2022:World-3.2", chapter: "九上/九下 两次工业革命与近代科学与文化", edition: "统编版世界历史" },
      HK: { grade: 9, code: "HK-EDB-S3-Hist-Mod", chapter: "S3 History: Growth & Transformation of Industrial Society", edition: "EDB 初中歷史" },
      TW: { grade: 9, code: "108-Soc:Hist-IV-6", chapter: "國中九上 工業革命與現代社會變遷", edition: "108課綱 歷史" },
      SG: { grade: 8, code: "SG-LSH-IndRev", chapter: "Industrialization & Global Impact", edition: "MOE History" },
      MY: { grade: 9, code: "MY-KSSM-Sej-T3-1.2", chapter: "Form 3 Kedatangan Kuasa Barat & Revolusi Perindustrian", edition: "DSKP Sejarah" },
      JP: { grade: 10, code: "JP-MEXT-HistComp-1B", chapter: "高校歴史総合 工業化と世界市場の形成", edition: "高校学習指導要領" },
      KR: { grade: 9, code: "KR-2022:[9역04-03]", chapter: "산업혁명과 자본주의의 확산", edition: "2022 개정 역사" },
      UK: { grade: 8, code: "UK-NC-KS3-Hist-IR", chapter: "KS3 Ideas, Industry & Empire in Britain 1745–1901", edition: "England NC KS3" },
      US: { grade: 10, code: "C3:D2.His.2.9-12 / AP-World-5.3", chapter: "Industrial Revolution Begins & Spreads", edition: "C3 / AP World History" },
    },
  },

  // ==================== 9TH SUBJECT: MOTHER-TONGUE & CRITICAL READING LITERACY ====================
  {
    id: "mt_lit_main_idea_structure",
    subjectId: "literacy",
    domain: "Discourse Structure & Thesis",
    domainI18n: { "zh-CN": "段落结构与中心论点", "zh-TW": "篇章結構與主旨提取", en: "Thesis Identification & Discourse Structure", ja: "文章構成と要旨の把握", ko: "글의 구조와 중심 생각 파악", ms: "Idea Utama & Struktur Wacana" },
    cognitiveType: "conceptual",
    baselineGrade: 5,
    centrality: 0.9,
    rootReason: "全语种阅读素养地基节点：区分核心论点（Claim）与论据例子（Evidence），识别总分、转折与递进结构。",
    title: {
      "zh-CN": "议论/说明文主旨提取：转折词后核心观点与“论点 vs 论据”区分",
      "zh-TW": "說明與議論文主旨提取與轉折結構",
      en: "Distinguishing Core Claim from Supporting Examples & Pivot Markers",
      ja: "論理的文章の要旨把握（主張と具体例の区別）",
      ko: "중심 문장과 뒷받침 예시 구분 및 역접 표지",
      ms: "Membezakan Pernyataan Tesis daripada Contoh",
    },
    description: {
      "zh-CN": "抓住“虽然……但是/然而（However/Yet）”转折后的核心判断句，不把具体举例细节（如“以某城市为例”）误当成全文中心论点。",
      en: "Locate the author's primary claim after contrastive pivot markers and avoid mistaking illustrative examples for the main thesis.",
    },
    masteryCriteria: [
      { "zh-CN": "排除仅复述局部例子的干扰项，锁定统摄全段的概括性论断", en: "Eliminate narrow example-only distractors in main-idea questions" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：当一段话先说“很多人以为多做题就能提高成绩”，紧接着来一句“然而，不总结错题根因只会重复犯错”，作者真正想强调的是前半句还是“然而”后面那半句？",
      en: "Ask: When an author writes 'Many assume X; however, evidence shows Y', which half carries the author's actual thesis?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "阅读抓主旨黄金律：“然而/但是”之前往往是铺垫靶子，转折词之后才是作者亮出的真刀真枪；“比如/例如”后面全是给主旨打工的配角！",
        en: "Concession ('Although/Many think...') sets the stage; the pivot ('However...') delivers the thesis; 'For example...' merely illustrates it.",
      },
      steps: [
        {
          title: { "zh-CN": "三步主旨定位法", en: "3-Step Thesis Lock" },
          body: { "zh-CN": "① 圈出转折词（然而/事实上/However）；② 划掉“例如…”具体案例；③ 匹配能概括剩余核心句的选项。", en: "1. Circle pivot words; 2. Bracket out 'For instance...' examples; 3. Match the overarching claim." },
          checkQuestion: { "zh-CN": "“许多人认为熬夜能增加学习时间；然而，睡眠不足会显著降低记忆巩固效率。”作者的核心论点在“然而”之前（填 1）还是之后（填 2）？", en: "In 'Many think staying up late adds study time; however, sleep deprivation impairs memory consolidation,' is the core claim before (1) or after (2) 'however'?" },
          checkAnswer: "2",
        },
      ],
      misconceptions: [
        {
          tag: "misc_lit_example_as_thesis",
          label: { "zh-CN": "以例代主：把文中生动具体的例子细节误选为全文中心主旨", en: "Selecting a vivid supporting example instead of the overarching thesis" },
          wrongPattern: { "zh-CN": "文段用蜜蜂跳舞举例说明动物信息传递，主旨题却误选“蜜蜂如何采蜜”", en: "Choosing 'How honeybees dance' when bees were just one example of animal communication" },
          remediationTip: { "zh-CN": "例子只为证明观点服务！凡是选项只提到局部案例名而漏掉核心规律的，一律排除。", en: "If an option names only the narrow case study and omits the general principle, cross it out!" },
        },
      ],
    },
    generatorKey: "lit_main_claim",
    regionalCodeOverrides: {
      CN: { grade: 5, code: "cls-2022:Read-3.2", chapter: "五/六年级语文 把握文章主要内容与说明/议论方法", edition: "统编版语文" },
      HK: { grade: 6, code: "HK-EDB-Chi-KS2-R2", chapter: "小六/中一中文 歸納段意與主旨", edition: "EDB 中國語文" },
      TW: { grade: 6, code: "108-Mandarin:5-III-8", chapter: "國小高年級國語 理解文章主旨與結構", edition: "108課綱 國語文" },
      SG: { grade: 5, code: "SG-CL-P5-Comp", chapter: "Primary Reading Comprehension: Main Idea", edition: "MOE MTL / EL" },
      MY: { grade: 6, code: "MY-KSSR-BM-T6-2.3", chapter: "Membaca & Mengenal Pasti Idea Utama", edition: "DSKP Bahasa" },
      JP: { grade: 5, code: "JP-MEXT-Kokugo-5C", chapter: "小5・小6国語 要旨の把握と事実・意見の区別", edition: "学習指導要領 国語" },
      KR: { grade: 5, code: "KR-2022:[6국02-02]", chapter: "글의 구조를 고려하여 중심 생각 요약하기", edition: "2022 개정 국어" },
      UK: { grade: 5, code: "UK-KS2-Read-2c", chapter: "KS2 Summarising Main Ideas from Paragraphs", edition: "England NC" },
      US: { grade: 5, code: "CCSS.ELA-RI.5.2", chapter: "Determine Two or More Main Ideas & Key Details", edition: "Common Core ELA" },
    },
  },
  {
    id: "mt_lit_inference_rhetoric",
    subjectId: "literacy",
    domain: "Inference & Rhetorical Analysis",
    domainI18n: { "zh-CN": "隐含推断与论证修辞赏析", "zh-TW": "推論理解與修辭論證效果", en: "Implicit Inference & Rhetorical Function", ja: "行間の推論と表現効果", ko: "추론적 읽기와 수사적 표현 효과", ms: "Inferens & Kesan Retorik" },
    cognitiveType: "reasoning",
    baselineGrade: 7,
    centrality: 0.84,
    title: {
      "zh-CN": "基于文本证据的合理推断（拒绝过度无中生有）与对比/比喻论证作用",
      "zh-TW": "文本證據推論與對比喻證效果分析",
      en: "Evidence-Bound Inference vs. Over-Extrapolation",
      ja: "根拠に基づく推論と比喩・対比の効果",
      ko: "근거 기반 추론과 비유·대조 논증 효과",
      ms: "Inferens Berasaskan Bukti Teks",
    },
    description: {
      "zh-CN": "严格依据原文已知信息推导必然或高度可信的隐含结论，识别绝对化偷换（“所有/必然/唯一”）导致的过度推断。",
      en: "Draw valid textual inferences while rejecting extreme absolutist leaps ('always', 'only', 'completely').",
    },
    masteryCriteria: [
      { "zh-CN": "敏锐识别阅读题中把原文“可能/部分/有助于”篡改为“一定/全部/决定性”的过度推断陷阱", en: "Spot modality inflation ('helps' → 'guarantees', 'some' → 'all') in reading options" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：原文说“每天慢跑有助于改善睡眠”，如果选项写成“只要每天慢跑就一定不会失眠”，这个选项错在哪个词太绝对了？",
      en: "Ask: If a passage says 'Jogging often improves sleep', why is 'Jogging cures all insomnia' an invalid inference?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "客观阅读推断的铁律是“有一分证据说一分话”：警惕范围扩大（部分→全部）、或然变必然（可能→必定）、先后变因果！",
        en: "Valid inference never inflates scope ('some' → 'all') or certainty ('may' → 'must') beyond textual evidence.",
      },
      steps: [
        {
          title: { "zh-CN": "限定词显微镜比对", en: "Compare Modifiers & Quantifiers" },
          body: { "zh-CN": "把选项里的数量词（全部/大多数/个别）和模态词（必然/或许/唯一）回原文逐词核对，一抓一个准。", en: "Audit quantifiers (all/most/some) and modals (must/can/might) directly against the source sentence." },
          checkQuestion: { "zh-CN": "原文：“定期慢跑有助于缓解焦虑。”哪项推断更严密？1：慢跑是缓解焦虑的可行方式之一；2：只要慢跑就绝不会焦虑。（填 1 或 2）", en: "Text: 'Regular jogging helps relieve anxiety.' Which inference is valid? (1) Jogging is one helpful way to ease anxiety; (2) Anyone who jogs will never feel anxious. (Enter 1 or 2)" },
          checkAnswer: "1",
        },
      ],
      misconceptions: [
        {
          tag: "misc_lit_absolutist_leap",
          label: { "zh-CN": "或然变必然 / 以偏概全：忽略选项中的绝对化限定词“唯一、彻底、必然”", en: "Accepting an absolutist over-generalization ('only', 'inevitably') unsupported by the text" },
          wrongPattern: { "zh-CN": "原文写“重要因素之一”，误选“唯一决定因素”", en: "Equating 'a major factor' with 'the sole determinant'" },
          remediationTip: { "zh-CN": "在学术与考场阅读中，越是严谨的真命题越留有分寸；看到“唯一/杜绝/所有”立即亮红灯回查原文！", en: "Treat extreme words ('sole', 'always', 'never') as red flags requiring explicit proof in the text." },
        },
      ],
    },
    generatorKey: "lit_inference_modality",
    regionalCodeOverrides: {
      CN: { grade: 8, code: "cls-2022:Read-4.3", chapter: "初中语文 实用类/论述类文本信息筛选与推断", edition: "统编版语文" },
      HK: { grade: 8, code: "HK-EDB-S2-Chi-Inf", chapter: "中二中國語文：閱讀字面與深層推論", edition: "EDB 初中中國語文" },
      TW: { grade: 8, code: "108-Mandarin:5-IV-3", chapter: "國中國文 推論文本隱含意義與修辭效果", edition: "108課綱 國語文" },
      SG: { grade: 8, code: "SG-O-EL-Inferential", chapter: "Sec Comprehension: Inferential & Evaluative Questions", edition: "MOE Syllabus" },
      MY: { grade: 8, code: "MY-KSSM-BM-T2-KBAT", chapter: "Form 2 Kemahiran Berfikir Aras Tinggi: Inferens", edition: "DSKP Bahasa" },
      JP: { grade: 8, code: "JP-MEXT-Kokugo-2C", chapter: "中2国語 論拠と表現の効果の吟味", edition: "学習指導要領 国語" },
      KR: { grade: 8, code: "KR-2022:[9국02-04]", chapter: "중학 국어 생략된 내용과 숨겨진 의도 추론", edition: "2022 개정 국어" },
      UK: { grade: 8, code: "UK-NC-KS3-Eng-Inf", chapter: "KS3 Reading: Explicit & Implicit Inference", edition: "England NC KS3" },
      US: { grade: 8, code: "CCSS.ELA-RI.8.1", chapter: "Cite Strongest Textual Evidence for Inferences", edition: "Common Core / SAT Reading" },
    },
  },
  {
    id: "mt_lit_logical_fallacy",
    subjectId: "literacy",
    domain: "Critical Thinking & Logical Fallacies",
    domainI18n: { "zh-CN": "逻辑谬误与论证严密性", "zh-TW": "邏輯謬誤與批判思辨", en: "Logical Fallacies & Causal Reasoning", ja: "論理的誤謬と批判的思考", ko: "논리적 오류와 비판적 사고", ms: "Falasi Logik & Penaakulan Kritis" },
    cognitiveType: "reasoning",
    baselineGrade: 9,
    centrality: 0.85,
    title: {
      "zh-CN": "思辨阅读逻辑谬误识别：强加因果、幸存者偏差与逆命题混淆",
      "zh-TW": "思辨閱讀：強加因果、倖存者偏差與充分必要條件",
      en: "Detecting Correlation-Causation, Survivorship Bias & Converse Fallacies",
      ja: "相関と因果の混同・生存者バイアス・逆の誤謬",
      ko: "상관관계와 인과관계 혼동·생존자 편향·역의 오류",
      ms: "Mengesan Falasi Sebab-Akibat & Bias Kemandirian",
    },
    description: {
      "zh-CN": "识别论证中的“先后伴随 ≠ 因果关系（冰淇淋销量与溺水率同受夏季高温影响）”、“幸存者偏差”及“若P则Q 误推 若Q则P”。",
      en: "Identify confounding third variables in spurious correlations, survivorship bias, and affirming the consequent.",
    },
    masteryCriteria: [
      { "zh-CN": "能指出“相关性数据”背后的共同第三变量（Confounding Variable），不被表面同步增减迷惑", en: "Identify hidden confounding variables behind correlated trends" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：二战时统计安全返航飞机的弹孔大多在机翼，机头和引擎几乎没弹孔，工程师为什么说“最该加厚装甲的恰恰是没弹孔的引擎”？",
      en: "Ask: Returning WWII planes had bullet holes on wings but none on engines—why did statistician Abraham Wald armor the engines instead of the wings?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "因为引擎中弹的飞机根本没能飞回来纳入统计（幸存者偏差）！同样，夏天冷饮卖得多时中暑也多，不是冷饮导致中暑，而是第三变量“高温”同时推高了两者。",
        en: "Planes hit in the engine didn't return to be counted (survivorship bias)! Always ask what unseen cases or third variables are missing.",
      },
      coreFormula: "$(P \\implies Q) \\not\\implies (Q \\implies P); \\quad \\text{Corr}(A,B) \\not\\implies A \\to B$",
      steps: [
        {
          title: { "zh-CN": "三问排谬法", en: "3-Question Fallacy Audit" },
          body: { "zh-CN": "① 样本是否漏掉了沉默失败者？② A和B同步变化是否有共同幕后因素C？③ 是否把充分条件当成了必要条件？", en: "1. Are failed samples missing? 2. Is a third variable C driving both A and B? 3. Was P→Q flipped into Q→P?" },
          checkQuestion: { "zh-CN": "“夏天冰淇淋销量高时溺水人数也多，因此吃冰淇淋会导致溺水。”这一推理是否合理？（合理因果填 1，忽略共同变量“高温”的强加因果谬误填 2）", en: "'Ice cream sales and drowning both rise in summer, so eating ice cream causes drowning.' Is this valid causation (1) or a confounding-variable fallacy ignoring summer heat (2)?" },
          checkAnswer: "2",
        },
      ],
      misconceptions: [
        {
          tag: "misc_lit_spurious_cause",
          label: { "zh-CN": "轻信表面相关性即因果关系，忽略共同混杂变量或沉默样本", en: "Treating statistical correlation or biased survivor samples as direct causation" },
          wrongPattern: { "zh-CN": "看到“家里藏书多的孩子阅读分高”就断定“只要买一屋子书不拆封也能提分”", en: "Assuming buying unread books directly causes higher scores without family reading habits" },
          remediationTip: { "zh-CN": "相关性只是线索，必须排查背后的混杂变量（如家庭阅读氛围）才算严密论证。", en: "Look for the underlying mechanism or confounding factor before claiming causation." },
        },
      ],
    },
    generatorKey: "lit_logical_fallacy",
    regionalCodeOverrides: {
      CN: { grade: 11, code: "cls-2017:XB-Logic-4", chapter: "高中语文选择性必修 逻辑的力量（发现潜藏的逻辑谬误）", edition: "统编版高中语文" },
      HK: { grade: 9, code: "HK-EDB-S3-Chi-Crit", chapter: "中三中國語文：批判性閱讀與論證漏洞辨析", edition: "EDB 初中中國語文" },
      TW: { grade: 10, code: "108-Mandarin:GSAT-Crit", chapter: "高中學測國寫 知性題邏輯思辨與謬誤分析", edition: "108課綱 國語文" },
      SG: { grade: 11, code: "SG-GP-8881-Crit", chapter: "JC 1 H1 General Paper: Critical Reading & Argument Evaluation", edition: "SEAB GCE A-Level H1 GP" },
      MY: { grade: 10, code: "MY-MUET-CritRead", chapter: "Form 4/5 Critical Evaluation of Claims & Fallacies", edition: "KSSM / MUET" },
      JP: { grade: 10, code: "JP-MEXT-LogicKokugo-1", chapter: "高校論理国語 論証の妥当性と誤謬の検討", edition: "高校学習指導要領 論理国語" },
      KR: { grade: 10, code: "KR-2022:[10국02-03]", chapter: "고등 국어 논증의 타당성과 논리적 오류 점검", edition: "2022 개정 국어" },
      UK: { grade: 10, code: "UK-GCSE-Eng-ArgEval", chapter: "Evaluating Rhetoric, Bias & Flawed Reasoning", edition: "GCSE / Thinking Skills" },
      US: { grade: 10, code: "CCSS.ELA-RI.9-10.8", chapter: "Delineate & Evaluate Argument & Fallacious Reasoning", edition: "Common Core / AP Lang" },
    },
  },
  {
    id: "mt_lit_classical_comparative",
    subjectId: "literacy",
    domain: "Multi-Source Synthesis",
    domainI18n: { "zh-CN": "非连续性多文本互证阅读", "zh-TW": "多文本與圖表非連續閱讀", en: "Multi-Text & Quantitative Chart Synthesis", ja: "複数資料・グラフ統合読解（PISA型）", ko: "복합 지문 및 도표 통합 독해", ms: "Sintesis Pelbagai Teks & Graf" },
    cognitiveType: "modeling",
    baselineGrade: 10,
    centrality: 0.81,
    title: {
      "zh-CN": "PISA 型非连续性文本综合：文字政策材料与统计图表交叉核验",
      "zh-TW": "非連續性文本：圖表數據與多源文字互證",
      en: "PISA-Style Multi-Source Synthesis: Cross-Checking Text & Data Tables",
      ja: "複数テキストと統計図表の統合的読解",
      ko: "비연속적 텍스트(도표)와 복수 지문 교차 검증",
      ms: "Sintesis Teks Tidak Berterusan & Jadual Data",
    },
    description: {
      "zh-CN": "整合文字说明材料与多维统计表数据，交叉核对阈值条件与变化率，制定符合双重约束的决策方案。",
      en: "Synthesize textual rules with multi-column data tables to verify claims and make multi-constraint decisions.",
    },
    masteryCriteria: [
      { "zh-CN": "同时核对文字条款中的“且/或”双重门槛与表格具体行数据，不漏判任一约束条件", en: "Cross-reference ALL conjunctive criteria in prose against exact table rows" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：买高铁票或看场馆预约规则时，文字写着“身高满1.2米且未满1.5米享半价”，为什么单看表格数字不看“且”字很容易选错档位？",
      en: "Ask: When combining a written policy rule with a price table, why do most mistakes come from overlooking a single 'AND / EXCEPT' footnote?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "现代 PISA 与新中高考阅读考的是“信息交叉定位力”：文字材料给判定规则，图表材料给实测数值，两者像钥匙对锁孔逐条勾选！",
        en: "Prose provides the rule conditions; the table provides raw measurements—evaluate every condition as a checklist.",
      },
      steps: [
        {
          title: { "zh-CN": "将文字条件列成勾选清单", en: "Turn Prose Rules into a Column Checklist" },
          body: { "zh-CN": "规则：补贴需同时满足①绿电占比 ≥ 60% 且 ②单位能耗 ≤ 45。逐行排除任一指标不达标的方案。", en: "Filter table candidates sequentially by Condition 1 AND Condition 2." },
          checkQuestion: { "zh-CN": "补贴规则要求同时满足：①绿电占比 ≥ 60% 且 ②单位能耗 ≤ 45。甲厂（绿电 65%，能耗 40）、乙厂（绿电 75%，能耗 50），哪家符合条件？（甲填 1，乙填 2）", en: "Subsidy rule requires BOTH: (1) green power ≥ 60% AND (2) energy use ≤ 45. Plant A (65%, 40) vs. Plant B (75%, 50)—which qualifies? (Enter 1 for A, 2 for B)" },
          checkAnswer: "1",
        },
      ],
      misconceptions: [
        {
          tag: "misc_lit_single_criterion",
          label: { "zh-CN": "顾此失彼：只看图表中最显眼的第一项指标达标，漏查文字材料里的第二项附加限制条件", en: "Checking only the first prominent table column while ignoring the secondary constraint in the text" },
          wrongPattern: { "zh-CN": "只看绿电占比最高就拍板入选，忽略了其能耗超标违反第二条细则", en: "Picking the highest score in Column A even though Column B violates the threshold" },
          remediationTip: { "zh-CN": "把文字里的所有限制条件标上 ①②③，在表格每一行旁边打勾，全勾才放行！", en: "Number every rule constraint ①②③ and verify all of them per row." },
        },
      ],
    },
    generatorKey: "lit_pisa_synthesis",
    regionalCodeOverrides: {
      CN: { grade: 9, code: "cls-2022:PISA-MultiText", chapter: "中考/高考语文 非连续性实用类多材料阅读", edition: "统编版语文" },
      HK: { grade: 10, code: "HKDSE-Integrative-Data", chapter: "整合拓展與多源資料交叉判讀", edition: "HKDSE" },
      TW: { grade: 9, code: "108-Mandarin:PISA-IV", chapter: "國中會考/學測 圖表非連續性文本與雙文對讀", edition: "108課綱 國語文" },
      SG: { grade: 9, code: "SG-O-EL-VisualText", chapter: "Visual & Multi-Modal Text Comprehension", edition: "MOE Syllabus" },
      MY: { grade: 9, code: "MY-PISA-Literasi-3", chapter: "Sintesis Maklumat Teks & Jadual", edition: "KSSM Literasi" },
      JP: { grade: 10, code: "JP-MEXT-ModKokugo-PISA", chapter: "現代の国語 実用的な文章・図表の統合的読解", edition: "学習指導要領（共通テスト型）" },
      KR: { grade: 10, code: "KR-2022:[10국02-05]", chapter: "복합 양식 매체와 다문서 통합 독해", edition: "2022 개정 국어" },
      UK: { grade: 10, code: "UK-GCSE-Eng-Synthesis", chapter: "Paper 2 Non-Fiction Synthesis Across Sources", edition: "GCSE English Language" },
      US: { grade: 10, code: "SAT-RW-CommandOfEvidence", chapter: "Quantitative Command of Evidence (Text + Table)", edition: "Digital SAT / AP Seminar" },
    },
  },
];
