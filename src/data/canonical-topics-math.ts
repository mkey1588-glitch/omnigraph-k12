import type {
  CognitiveType,
  LocalizedText,
  MicroLessonPayload,
  RegionCode,
  SubjectId,
} from "@/types/taxonomy";

export interface TopicSeedDefinition {
  id: string;
  subjectId: SubjectId;
  domain: string;
  domainI18n: LocalizedText;
  cognitiveType: CognitiveType;
  baselineGrade: number;
  centrality: number;
  title: LocalizedText;
  description: LocalizedText;
  masteryCriteria: LocalizedText[];
  homeCheckPrompt: LocalizedText;
  microLesson: MicroLessonPayload;
  rootReason?: string;
  generatorKey: string;
  regionalCodeOverrides: Partial<
    Record<
      RegionCode,
      {
        grade?: number;
        code: string;
        chapter: string;
        edition?: string;
        note?: string;
      }
    >
  >;
}

export const MATH_TOPICS: TopicSeedDefinition[] = [
  {
    id: "mt_math_place_value_ops",
    subjectId: "math",
    domain: "Number & Operations",
    domainI18n: { "zh-CN": "数与代数", "zh-TW": "數與量", en: "Number & Operations", ja: "数と計算", ko: "수와 연산", ms: "Nombor & Operasi" },
    cognitiveType: "conceptual",
    baselineGrade: 3,
    centrality: 0.92,
    rootReason: "小学算术核心地基节点：十进制位值制与加减乘除四则运算互逆关系。",
    title: {
      "zh-CN": "十进制位值制与四则运算互逆关系",
      "zh-TW": "十進位值制與四則運算互逆關係",
      en: "Place Value & Inverse Four Operations",
      ja: "十進位取り記数法と四則演算の関係",
      ko: "십진법 자릿값과 사칙연산의 역관계",
      ms: "Nilai Tempat & Hubungan Songsang Empat Operasi",
    },
    description: {
      "zh-CN": "理解多位数每一位代表的数量级，掌握加减互逆、乘除互逆与有余数除法关系式。",
      en: "Understand positional value in base-10 and use inverse relationships between addition/subtraction and multiplication/division.",
    },
    masteryCriteria: [
      { "zh-CN": "能利用“被除数 = 商 × 除数 + 余数（余数 < 除数）”逆向验算", en: "Verify division using Dividend = Quotient × Divisor + Remainder (R < D)" },
      { "zh-CN": "能在含括号的混合运算中遵循先乘除后加减法则", en: "Apply order of operations accurately with parentheses" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：一盒饼干分给 6 个小朋友每人 7 块还剩 4 块，怎样最快算出原来有几块？余数能不能是 6？",
      en: "Ask your child: If cookies shared among 6 kids give 7 each with 4 left over, how many were there originally, and could 6 be left over?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "除法不是孤立口诀，而是“平均分组后清点剩余”的逆过程；余数一旦够再分一轮，商就该加 1。",
        en: "Division reverses equal grouping; if leftovers can form another group, the quotient increases by 1.",
      },
      coreFormula: "$N = d \\times q + r \\quad (0 \\le r < d)$",
      visualType: "bar_model",
      steps: [
        {
          title: { "zh-CN": "第1步：看清整体与分组", en: "Step 1: Whole vs. Equal Parts" },
          body: { "zh-CN": "把总数看作一条完整长条，每份长度为除数 d，共拼出 q 份，尾巴多出一截 r。", en: "Model the total as a bar of q equal segments of size d plus a tail r." },
          checkQuestion: { "zh-CN": "某数除以 5 商 8 余 3，这个数是多少？", en: "A number divided by 5 gives quotient 8 and remainder 3. What is it?" },
          checkAnswer: "43",
        },
      ],
      misconceptions: [
        {
          tag: "misc_order_left_to_right",
          label: { "zh-CN": "无视运算优先级纯从左往右算", en: "Ignoring order of operations (computing strictly left-to-right)" },
          wrongPattern: { "zh-CN": "把 12 + 8 × 3 算成 20 × 3 = 60", en: "Evaluating 12 + 8 × 3 as (12 + 8) × 3 = 60" },
          remediationTip: { "zh-CN": "乘法是“成组打包”，必须先把 8×3 这包算出来再和零散的 12 相加。", en: "Multiplication bundles groups together; unpack 8×3 before adding 12." },
        },
      ],
    },
    generatorKey: "math_place_value_ops",
    regionalCodeOverrides: {
      CN: { grade: 3, code: "cms-2022:2.NA.02", chapter: "三下 第二单元 除数是一位数的除法 / 四下 四则运算", edition: "人教版 2022课标新教材" },
      HK: { grade: 3, code: "HK-EDB-KS1-N4", chapter: "P3 四則混合計算與餘數", edition: "EDB 小學數學" },
      TW: { grade: 3, code: "108-Math:N-3-5", chapter: "國小三下 除法與兩步驟問題", edition: "108課綱 翰林/康軒" },
      SG: { grade: 3, code: "SG-MOE-P3-N1.4", chapter: "P3 Whole Numbers & Word Problems (Bar Model)", edition: "MOE Primary Syllabus" },
      MY: { grade: 3, code: "MY-KSSR-T3-2.4", chapter: "Tahun 3 Operasi Asas & Penyelesaian Masalah", edition: "DSKP KSSR" },
      JP: { grade: 3, code: "JP-MEXT-825023A1", chapter: "小3 あまりのあるわり算と計算のきまり", edition: "学習指導要領" },
      KR: { grade: 3, code: "KR-2022:[4수01-06]", chapter: "초3 나눗셈의 몫과 나머지", edition: "2022 개정 교육과정" },
      UK: { grade: 4, code: "UK-NC-KS2-Y4-N2", chapter: "Year 4 Place Value & Four Operations", edition: "England National Curriculum" },
      US: { grade: 4, code: "CCSS.MATH.4.NBT.B.6", chapter: "Grade 4 Quotients & Remainders", edition: "Common Core" },
    },
  },
  {
    id: "mt_math_frac_concept_equiv",
    subjectId: "math",
    domain: "Number & Operations",
    domainI18n: { "zh-CN": "数与代数", "zh-TW": "數與量", en: "Number & Operations", ja: "数と計算", ko: "수와 연산", ms: "Nombor & Operasi" },
    cognitiveType: "conceptual",
    baselineGrade: 5,
    centrality: 0.89,
    title: {
      "zh-CN": "分数的基本性质、约分与通分",
      "zh-TW": "分數的基本性質、約分與通分",
      en: "Equivalent Fractions, Simplifying & Common Denominators",
      ja: "分数の性質・約分と通分",
      ko: "분수의 성질, 약분과 통분",
      ms: "Pecahan Setara, Permudah & Penyebut Sepunya",
    },
    description: {
      "zh-CN": "理解分子分母同乘或同除以非零数大小不变，利用最大公因数约分、最小公倍数通分。",
      en: "Generate equivalent fractions, reduce to simplest form via GCD, and find common denominators via LCM.",
    },
    masteryCriteria: [
      { "zh-CN": "能熟练求两个数的最大公因数（GCD）将分数化为最简分数", en: "Simplify fractions to lowest terms using GCD" },
      { "zh-CN": "能用最小公倍数（LCM）对异分母分数通分并比较大小", en: "Convert unlike fractions to a least common denominator" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：2/3 和 4/6 切出来的蛋糕块数不一样，为什么吃的量却一样多？",
      en: "Ask: 2/3 and 4/6 have different numbers of slices—why do you get the exact same amount of cake?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "通分的本质是“统一测量刻度”——每一份切细 k 倍，拿的份数也同步乘 k 倍，总量丝毫未变。",
        en: "Finding a common denominator means choosing a finer ruler so both fractions use the exact same unit size.",
      },
      coreFormula: "$\\frac{a}{b} = \\frac{a \\times k}{b \\times k} \\quad (k \\ne 0)$",
      visualType: "bar_model",
      steps: [
        {
          title: { "zh-CN": "寻找最小公共网格", en: "Find the Least Common Grid" },
          body: { "zh-CN": "要比较 3/4 与 5/6，取 4 和 6 的最小公倍数 12，化为 9/12 与 10/12 一目了然。", en: "For 3/4 and 5/6, use LCM(4,6)=12 to rewrite as 9/12 and 10/12." },
          checkQuestion: { "zh-CN": "将 12/18 化为最简分数是多少？", en: "Simplify 12/18 to lowest terms." },
          checkAnswer: "2/3",
        },
      ],
      misconceptions: [
        {
          tag: "misc_frac_add_const",
          label: { "zh-CN": "误以为分子分母同时加同一个数分数不变", en: "Adding the same constant to numerator and denominator" },
          wrongPattern: { "zh-CN": "认为 2/3 = (2+2)/(3+2) = 4/5", en: "Thinking 2/3 equals (2+2)/(3+2) = 4/5" },
          remediationTip: { "zh-CN": "分数基本性质是倍数缩放（同乘同除），绝不是同加同减！1/2 分子分母各加 1 变成 2/3 明显变大了。", en: "Equivalence scales multiplicatively, never additively: 1/2 ≠ 2/3!" },
        },
      ],
    },
    generatorKey: "math_frac_equiv",
    regionalCodeOverrides: {
      CN: { grade: 5, code: "cms-2022:3.NA.03", chapter: "五下 第四单元 分数的意义和性质（约分与通分）", edition: "人教版 2022课标新教材" },
      HK: { grade: 4, code: "HK-EDB-KS2-N3", chapter: "P4 擴分、約分與分數比較", edition: "EDB 小學數學" },
      TW: { grade: 5, code: "108-Math:N-5-3", chapter: "國小五上 公因數、公倍數與約分通分", edition: "108課綱" },
      SG: { grade: 4, code: "SG-MOE-P4-F1.1", chapter: "P4 Equivalent Fractions & Comparing Fractions", edition: "MOE Syllabus" },
      MY: { grade: 4, code: "MY-KSSR-T4-2.1", chapter: "Tahun 4 Pecahan Setara & Permudahkan", edition: "DSKP KSSR" },
      JP: { grade: 5, code: "JP-MEXT-825025A4", chapter: "小5 分数の約分と通分", edition: "学習指導要領" },
      KR: { grade: 5, code: "KR-2022:[6수01-02]", chapter: "초5 약분과 통분", edition: "2022 개정 교육과정" },
      UK: { grade: 5, code: "UK-NC-KS2-Y5-F1", chapter: "Year 5 Equivalent Fractions", edition: "England NC" },
      US: { grade: 4, code: "CCSS.MATH.4.NF.A.1", chapter: "Grade 4 Visual Fraction Equivalence", edition: "Common Core" },
    },
  },
  {
    id: "mt_math_frac_add_sub",
    subjectId: "math",
    domain: "Number & Operations",
    domainI18n: { "zh-CN": "数与代数", "zh-TW": "數與量", en: "Number & Operations", ja: "数と計算", ko: "수와 연산", ms: "Nombor & Operasi" },
    cognitiveType: "procedural",
    baselineGrade: 5,
    centrality: 0.87,
    title: {
      "zh-CN": "异分母分数加减法与条形建模",
      "zh-TW": "異分母分數加減法與條形建模",
      en: "Adding & Subtracting Unlike Fractions (Bar Model)",
      ja: "異分母の分数のたし算・ひき算",
      ko: "분모가 다른 분수의 덧셈과 뺄셈",
      ms: "Tambah & Tolak Pecahan Tak Sama Penyebut",
    },
    description: {
      "zh-CN": "先通分化为同分母分数再加减，结果约分为最简分数，并能用条形图解决分数实际问题。",
      en: "Add and subtract fractions with unlike denominators via LCD and solve multi-step bar model word problems.",
    },
    masteryCriteria: [
      { "zh-CN": "异分母加减必先通分，不犯“分子加分子、分母加分母”的典型错误", en: "Convert to common denominator first without adding denominators directly" },
      { "zh-CN": "计算结果自动约分至最简形式", en: "Express final sums/differences in simplest rational form" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：1/2 加 1/3 为什么不等于 2/5？（明明已经超过一半了，2/5 反而不到一半！）",
      en: "Ask: Why can't 1/2 + 1/3 equal 2/5? (Hint: 1/2 is already half, whereas 2/5 is less than half!)",
    },
    microLesson: {
      intuition: {
        "zh-CN": "1 个苹果加 1 个西瓜不能叫“2 个苹瓜”——1/2 和 1/3 的分数单位不同，必须先切分成同样大小的 1/6 才能合并计数。",
        en: "You cannot add halves and thirds until both are sliced into sixths—the same unit size.",
      },
      coreFormula: "$\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}$",
      visualType: "bar_model",
      steps: [
        {
          title: { "zh-CN": "先通分统一单位，再加减分子", en: "Unify Denominator, Then Combine Numerators" },
          body: { "zh-CN": "计算 1/2 + 1/3：先化为 3/6 + 2/6 = 5/6，分母 6 代表单位大小保持不变。", en: "1/2 + 1/3 = 3/6 + 2/6 = 5/6; keep the denominator unchanged once unified." },
          checkQuestion: { "zh-CN": "计算 1/3 + 1/4 的结果（用 a/b 表示）", en: "Compute 1/3 + 1/4 (as a/b)." },
          checkAnswer: "7/12",
        },
      ],
      misconceptions: [
        {
          tag: "misc_frac_add_denom",
          label: { "zh-CN": "直接把分子加分子、分母加分母", en: "Adding numerators and denominators directly (a/b + c/d = (a+c)/(b+d))" },
          wrongPattern: { "zh-CN": "1/3 + 1/4 错算为 2/7", en: "Computing 1/3 + 1/4 as 2/7" },
          remediationTip: { "zh-CN": "用数感检验：1/3 > 2/7，正数相加怎么可能越加越小？必须先通分为十二分之几！", en: "Sanity check: 2/7 is smaller than 1/3! Always find a common denominator first." },
        },
      ],
    },
    generatorKey: "math_frac_add_sub",
    regionalCodeOverrides: {
      CN: { grade: 5, code: "cms-2022:3.NA.05", chapter: "五下 第六单元 分数的加法和减法", edition: "人教版 2022课标新教材" },
      HK: { grade: 5, code: "HK-EDB-KS2-N5", chapter: "P5 異分母分數加減", edition: "EDB 小學數學" },
      TW: { grade: 5, code: "108-Math:N-5-4", chapter: "國小五上 異分母分數的加減", edition: "108課綱" },
      SG: { grade: 5, code: "SG-MOE-P5-F1.2", chapter: "P5 Addition & Subtraction of Unlike Fractions (CPA Bar Model)", edition: "MOE Primary" },
      MY: { grade: 5, code: "MY-KSSR-T5-2.1", chapter: "Tahun 5 Tambah & Tolak Pecahan", edition: "DSKP KSSR" },
      JP: { grade: 5, code: "JP-MEXT-825025A5", chapter: "小5 異分母の分数の加減", edition: "学習指導要領" },
      KR: { grade: 5, code: "KR-2022:[6수01-03]", chapter: "초5 분모가 다른 분수의 덧셈과 뺄셈", edition: "2022 개정 교육과정" },
      UK: { grade: 6, code: "UK-NC-KS2-Y6-F2", chapter: "Year 6 Add & Subtract Fractions with Different Denominators", edition: "England NC" },
      US: { grade: 5, code: "CCSS.MATH.5.NF.A.1", chapter: "Grade 5 Add & Subtract Fractions with Unlike Denominators", edition: "Common Core" },
    },
  },
  {
    id: "mt_math_frac_mul_div",
    subjectId: "math",
    domain: "Number & Operations",
    domainI18n: { "zh-CN": "数与代数", "zh-TW": "數與量", en: "Number & Operations", ja: "数と計算", ko: "수와 연산", ms: "Nombor & Operasi" },
    cognitiveType: "procedural",
    baselineGrade: 6,
    centrality: 0.90,
    title: {
      "zh-CN": "分数乘除法与倒数变换",
      "zh-TW": "分數乘除法與倒數變換",
      en: "Multiplying & Dividing Fractions via Reciprocals",
      ja: "分数のかけ算・わり算と逆数",
      ko: "분수의 곱셈과 나눗셈(역수)",
      ms: "Darab & Bahagi Pecahan (Salingan)",
    },
    description: {
      "zh-CN": "理解一个数乘分数的倍比意义，掌握“除以一个非零数等于乘它的倒数”并先约分再计算。",
      en: "Interpret fraction multiplication as scaling and divide fractions by multiplying by the divisor's reciprocal.",
    },
    masteryCriteria: [
      { "zh-CN": "准确写出任意分数或整数的倒数，除以分数时只翻转除数、不误翻被除数", en: "Invert only the divisor (never the dividend) when dividing fractions" },
      { "zh-CN": "能区分“求一个数的几分之几（用乘）”与“已知一个数的几分之几求原数（用除）”", en: "Distinguish finding a fraction of a quantity vs. finding the whole from a fractional part" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：2 升果汁每 1/4 升装一杯，为什么算出来杯数不是变小而是变大成 8 杯？",
      en: "Ask: If 2 liters of juice are poured into 1/4-liter cups, why does dividing by 1/4 make the answer bigger (8 cups)?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "除以 1/b 就是问“包含多少个 1/b”——每 1 个单位里都藏着 b 个 1/b，所以总数必然放大 b 倍！",
        en: "Dividing by 1/b asks how many 1/b pieces fit inside; since b pieces fit in each 1, you multiply by b.",
      },
      coreFormula: "$\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c}$",
      visualType: "bar_model",
      steps: [
        {
          title: { "zh-CN": "留被除数、改除号为乘号、翻除数为倒数", en: "Keep – Change – Flip (Divisor Only)" },
          body: { "zh-CN": "(3/4) ÷ (9/8) = (3/4) × (8/9)，交叉约分后得 2/3。", en: "(3/4) ÷ (9/8) = (3/4) × (8/9) = 2/3 after cross-canceling." },
          checkQuestion: { "zh-CN": "计算 (2/3) ÷ (4/9) 的最简结果", en: "Compute (2/3) ÷ (4/9) in simplest form." },
          checkAnswer: "3/2",
        },
      ],
      misconceptions: [
        {
          tag: "misc_flip_dividend",
          label: { "zh-CN": "误把被除数翻转成倒数或分子分母直接相乘未翻转", en: "Inverting the dividend instead of the divisor, or multiplying straight across without flipping" },
          wrongPattern: { "zh-CN": "把 (2/3) ÷ (4/9) 算成 (2/3) × (4/9) = 8/27", en: "Computing (2/3) ÷ (4/9) as 8/27 without flipping 4/9" },
          remediationTip: { "zh-CN": "牢记：只有“除号后面的除数”才取倒数！被除数是待切分的总量，位置不动。", en: "Only flip the divisor (the number you are dividing BY)!" },
        },
      ],
    },
    generatorKey: "math_frac_mul_div",
    regionalCodeOverrides: {
      CN: { grade: 6, code: "cms-2022:3.NA.06", chapter: "六上 第二、三单元 分数乘法与分数除法", edition: "人教版 2022课标新教材" },
      HK: { grade: 5, code: "HK-EDB-KS2-N6", chapter: "P5–P6 分數乘法與分數除法", edition: "EDB 小學數學" },
      TW: { grade: 6, code: "108-Math:N-6-3", chapter: "國小六上 分數的除法", edition: "108課綱" },
      SG: { grade: 6, code: "SG-MOE-P6-F1.1", chapter: "P6 Dividing a Fraction by a Proper Fraction (PSLE Core)", edition: "MOE Primary" },
      MY: { grade: 6, code: "MY-KSSR-T6-2.1", chapter: "Tahun 6 Darab & Bahagi Pecahan", edition: "DSKP KSSR" },
      JP: { grade: 6, code: "JP-MEXT-825026A1", chapter: "小6 分数の乗法及び除法", edition: "学習指導要領" },
      KR: { grade: 6, code: "KR-2022:[6수01-11]", chapter: "초6 분수의 나눗셈", edition: "2022 개정 교육과정" },
      UK: { grade: 6, code: "UK-NC-KS2-Y6-F3", chapter: "Year 6 Multiply & Divide Proper Fractions", edition: "England NC" },
      US: { grade: 6, code: "CCSS.MATH.6.NS.A.1", chapter: "Grade 6 Quotients of Fractions", edition: "Common Core" },
    },
  },
  {
    id: "mt_math_ratio_percent",
    subjectId: "math",
    domain: "Number & Operations",
    domainI18n: { "zh-CN": "数与代数", "zh-TW": "數與量", en: "Number & Operations", ja: "数と計算", ko: "수와 연산", ms: "Nombor & Operasi" },
    cognitiveType: "application",
    baselineGrade: 6,
    centrality: 0.91,
    title: {
      "zh-CN": "比、比例性质与百分数增长率",
      "zh-TW": "比、比例性質與百分率應用",
      en: "Ratios, Proportions & Percentage Change",
      ja: "比と比例・百分率と歩合",
      ko: "비와 비율, 비례식과 백분율",
      ms: "Nisbah, Kadaran & Perubahan Peratus",
    },
    description: {
      "zh-CN": "掌握比例外项积等于内项积（交叉相乘），解决按比分配、折扣与百分数增减变化问题。",
      en: "Solve proportions via cross-products, partition quantities by ratio, and compute percentage increase/decrease.",
    },
    masteryCriteria: [
      { "zh-CN": "计算增长率/降低率时准确以“变化前的原基准量”作分母", en: "Use the original baseline quantity as the denominator in percentage change" },
      { "zh-CN": "熟练运用 a : b = c : d ⇔ ad = bc 解比例", en: "Apply cross-multiplication ad = bc to solve proportions" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：一件衣服先涨价 20%，再打八折（降价 20%），最后价格和原来一样吗？为什么？",
      en: "Ask: If a jacket goes up 20% and then drops 20%, is it back to the original price? Why not?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "百分数永远绑定一个“基准单位 1”：涨 20% 是在 100 上涨 20 变 120；再降 20% 是在 120 上降 24 变 96！",
        en: "Every percentage acts on a specific base: +20% of 100 gives 120, then -20% of 120 subtracts 24 to leave 96!",
      },
      coreFormula: "$\\text{Change}\\% = \\frac{\\text{New} - \\text{Old}}{\\text{Old}} \\times 100\\%$",
      visualType: "bar_model",
      steps: [
        {
          title: { "zh-CN": "锁定基准量（“比”字后面的量）", en: "Anchor on the Original Base" },
          body: { "zh-CN": "从 80 增至 100，增长率 = (100-80)/80 = 25%；但从 100 降回 80，降低率 = (100-80)/100 = 20%。", en: "From 80 to 100 is +25% (20/80), whereas 100 down to 80 is -20% (20/100)." },
          checkQuestion: { "zh-CN": "某商品原价 80 元，现价 100 元，增长了百分之几？（只填数字）", en: "Price rose from 80 to 100. What is the percentage increase (number only)?" },
          checkAnswer: "25",
        },
      ],
      misconceptions: [
        {
          tag: "misc_percent_wrong_base",
          label: { "zh-CN": "计算增长率时误用变化后的新数值当分母", en: "Dividing by the new value instead of the original baseline in percentage change" },
          wrongPattern: { "zh-CN": "从 80 涨到 100，错算成 (100-80)/100 = 20%", en: "Computing (100-80)/100 = 20% instead of 20/80 = 25%" },
          remediationTip: { "zh-CN": "变化率永远除以“出发点（原值 Old）”，而不是终点（新值 New）！", en: "Always divide change by the starting value (Old), never the ending value." },
        },
      ],
    },
    generatorKey: "math_ratio_percent",
    regionalCodeOverrides: {
      CN: { grade: 6, code: "cms-2022:3.NA.08", chapter: "六上 第五单元 百分数 / 六下 第四单元 比例", edition: "人教版 2022课标新教材" },
      HK: { grade: 6, code: "HK-EDB-KS2-N7", chapter: "P6 百分數應用與中一百分變化", edition: "EDB 數學" },
      TW: { grade: 6, code: "108-Math:N-6-6", chapter: "國小六下 比與比值、基準量與比較量", edition: "108課綱" },
      SG: { grade: 6, code: "SG-MOE-P6-R1.2", chapter: "P6 Ratio & Percentage Change Heuristics (PSLE)", edition: "MOE Primary" },
      MY: { grade: 6, code: "MY-KSSR-T6-4.1", chapter: "Tahun 6 Peratus & Nisbah", edition: "DSKP KSSR" },
      JP: { grade: 6, code: "JP-MEXT-825026C2", chapter: "小5 割合（百分率）と小6 比", edition: "学習指導要領" },
      KR: { grade: 6, code: "KR-2022:[6수04-03]", chapter: "초6 비와 비율, 비례식", edition: "2022 개정 교육과정" },
      UK: { grade: 7, code: "UK-NC-KS3-R3", chapter: "KS3 Ratio, Proportion & Percentage Change", edition: "England NC / Oak" },
      US: { grade: 7, code: "CCSS.MATH.7.RP.A.3", chapter: "Grade 7 Multistep Ratio & Percent Problems", edition: "Common Core" },
    },
  },
  {
    id: "mt_math_geometry_area_perim",
    subjectId: "math",
    domain: "Geometry & Measurement",
    domainI18n: { "zh-CN": "图形与几何", "zh-TW": "空間與形狀", en: "Geometry & Measurement", ja: "図形と測定", ko: "도형과 측정", ms: "Sukatan & Geometri" },
    cognitiveType: "procedural",
    baselineGrade: 5,
    centrality: 0.81,
    title: {
      "zh-CN": "多边形周长、面积割补推导（平行四边形/三角形/梯形）",
      "zh-TW": "多邊形周長與面積推導（平行四邊形／三角形／梯形）",
      en: "Perimeter & Area of Polygons via Decomposition",
      ja: "多角形の周の長さと面積（平行四辺形・三角形・台形）",
      ko: "다각형의 둘레와 넓이(평행사변형·삼각형·사다리꼴)",
      ms: "Perimeter & Luas Poligon",
    },
    description: {
      "zh-CN": "区分一维边界周长与二维铺满面积，通过剪拼转化推导平行四边形、三角形与梯形面积公式。",
      en: "Distinguish perimeter from area and derive area formulas for parallelograms, triangles, and trapezoids.",
    },
    masteryCriteria: [
      { "zh-CN": "计算三角形/平行四边形面积时，严格选用互相垂直的一组“对应底和高”", en: "Pair a base strictly with its perpendicular height" },
      { "zh-CN": "计算三角形和梯形面积不漏除以 2", en: "Remember the 1/2 factor when computing triangle and trapezoid areas" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：把一个长方形木框拉歪变成平行四边形，四根木条总长（周长）没变，里面的面积变了吗？",
      en: "Ask: If you push a rectangular wooden frame into a slanted parallelogram, its perimeter stays the same—does its area change?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "两个完全一样的三角形总能拼成一个等底等高的平行四边形，所以三角形面积必然要除以 2；拉歪木框高变矮了，面积随之缩小。",
        en: "Two identical triangles form a parallelogram of the same base and perpendicular height, explaining the ÷2.",
      },
      coreFormula: "$S_{\\triangle} = \\frac{1}{2} b h, \\quad S_{\\text{trap}} = \\frac{1}{2}(a + b)h$",
      visualType: "right_triangle",
      steps: [
        {
          title: { "zh-CN": "认准垂直符号找对应高", en: "Match Base with Perpendicular Height" },
          body: { "zh-CN": "斜边长度决定周长，但决定面积的是垂直高度 h，切勿拿斜边充当高相乘。", en: "Slanted sides count toward perimeter, never height; look for the right-angle mark." },
          checkQuestion: { "zh-CN": "底为 10 cm、对应高为 6 cm 的三角形面积是多少 cm²？", en: "Find the area (cm²) of a triangle with base 10 cm and perpendicular height 6 cm." },
          checkAnswer: "30",
        },
      ],
      misconceptions: [
        {
          tag: "misc_triangle_forget_half",
          label: { "zh-CN": "算三角形或梯形面积漏除以 2，或误拿邻边当高", en: "Forgetting to divide by 2 for triangles/trapezoids, or multiplying by slant side" },
          wrongPattern: { "zh-CN": "底 10 高 6 的三角形面积算成 60", en: "Computing triangle area as 10 × 6 = 60 instead of 30" },
          remediationTip: { "zh-CN": "10 × 6 是包住它的长方形/平行四边形面积，三角形只占其中一半！", en: "b × h is the enclosing parallelogram; a triangle is exactly half of it." },
        },
      ],
    },
    generatorKey: "math_polygon_area",
    regionalCodeOverrides: {
      CN: { grade: 5, code: "cms-2022:3.GG.04", chapter: "五上 第六单元 多边形的面积", edition: "人教版 2022课标新教材" },
      HK: { grade: 5, code: "HK-EDB-KS2-M4", chapter: "P5 平行四邊形、三角形及梯形面積", edition: "EDB 小學數學" },
      TW: { grade: 5, code: "108-Math:S-5-2", chapter: "國小五上 三角形與四邊形的面積", edition: "108課綱" },
      SG: { grade: 5, code: "SG-MOE-P5-MG1.1", chapter: "P5 Area of Triangle & Composite Figures", edition: "MOE Primary" },
      MY: { grade: 5, code: "MY-KSSR-T5-6.3", chapter: "Tahun 5 Perimeter dan Luas Gabungan", edition: "DSKP KSSR" },
      JP: { grade: 5, code: "JP-MEXT-825025B3", chapter: "小5 三角形・平行四辺形・ひし形・台形の面積", edition: "学習指導要領" },
      KR: { grade: 5, code: "KR-2022:[6수03-06]", chapter: "초5 다각형의 둘레와 넓이", edition: "2022 개정 교육과정" },
      UK: { grade: 6, code: "UK-NC-KS2-Y6-M4", chapter: "Year 6 Area of Parallelograms and Triangles", edition: "England NC" },
      US: { grade: 6, code: "CCSS.MATH.6.G.A.1", chapter: "Grade 6 Area of Triangles & Polygons", edition: "Common Core" },
    },
  },
  {
    id: "mt_math_signed_numbers",
    subjectId: "math",
    domain: "Algebra",
    domainI18n: { "zh-CN": "数与代数", "zh-TW": "代數", en: "Algebra", ja: "数と式", ko: "문자와 식", ms: "Perkaitan dan Algebra" },
    cognitiveType: "procedural",
    baselineGrade: 7,
    centrality: 0.93,
    title: {
      "zh-CN": "有理数正负混合运算、数轴与乘方符号法则",
      "zh-TW": "正負數四則運算、數線與次方符號法則",
      en: "Signed Rational Numbers, Absolute Value & Exponents",
      ja: "正負の数と四則・累乗の符号",
      ko: "정수와 유리수의 사칙계산과 거듭제곱 부호",
      ms: "Nombor Nisbah Berarah & Kuasa",
    },
    description: {
      "zh-CN": "借助数轴理解相反数与绝对值，熟练进行正负数加减乘除，严格区分 (-a)² 与 -a²。",
      en: "Operate fluently with positive/negative rationals on the number line and distinguish (-a)^2 from -a^2.",
    },
    masteryCriteria: [
      { "zh-CN": "掌握“减去一个负数等于加上它的相反数”及“负负得正”", en: "Apply a - (-b) = a + b and sign rules for multiplication/division" },
      { "zh-CN": "准确区分 (-3)² = 9 与 -3² = -9 的底数范围差异", en: "Distinguish (-3)^2 = 9 (base is -3) from -3^2 = -9 (base is 3)" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：气温从零下 5 度变到零上 3 度升高了几度？另外 -3² 和 (-3)² 算出来符号一样吗？",
      en: "Ask: How many degrees did it warm from -5°C to +3°C? Also, do -3² and (-3)² have the same sign?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "指数 2 只管紧挨着它的左边那个整体：有括号 (-3)² 连负号一起平方得 +9；没括号 -3² 先算 3² 再添负号得 -9！",
        en: "An exponent binds tightly only to what is immediately to its left: parentheses include the minus sign; without them, square first then negate.",
      },
      coreFormula: "$(-a)^2 = +a^2, \\quad -a^2 = -(a^2)$",
      visualType: "number_line",
      steps: [
        {
          title: { "zh-CN": "看括号定底数", en: "Check Parentheses to Identify the Base" },
          body: { "zh-CN": "计算 -2² + (-3)×(-4)：先算 -2² = -4，再算 (-3)×(-4) = +12，相加得 8。", en: "-2² + (-3)(-4) = -4 + 12 = 8." },
          checkQuestion: { "zh-CN": "计算 -3² + (-2)² 的结果", en: "Evaluate -3² + (-2)²." },
          checkAnswer: "-5",
        },
      ],
      misconceptions: [
        {
          tag: "misc_neg_square_sign",
          label: { "zh-CN": "混淆 -a² 与 (-a)²，把 -3² 误算为 +9", en: "Confusing -a^2 with (-a)^2 and evaluating -3^2 as +9" },
          wrongPattern: { "zh-CN": "把 -3² + 4 算成 9 + 4 = 13", en: "Evaluating -3^2 + 4 as 9 + 4 = 13" },
          remediationTip: { "zh-CN": "没有括号包住负号时，乘方优先级高于取负号：-3² = -(3 × 3) = -9！", en: "Exponentiation precedes negation unless parentheses group the minus sign: -3^2 = -(3·3) = -9." },
        },
      ],
    },
    generatorKey: "math_signed_numbers",
    regionalCodeOverrides: {
      CN: { grade: 7, code: "cms-2022:4.NA.01", chapter: "七上 第一、二章 有理数及其运算", edition: "人教版 2024 审定" },
      HK: { grade: 7, code: "HK-EDB-KS3-NA1", chapter: "S1 Directed Numbers (有向數四則運算)", edition: "EDB 初中數學" },
      TW: { grade: 7, code: "108-Math:N-7-3", chapter: "國中七上 負數與數的四則混合運算", edition: "108課綱" },
      SG: { grade: 7, code: "SG-MOE-S1-N1.2", chapter: "Sec 1 Negative Numbers, Rational Numbers & Order of Operations", edition: "MOE G3 Math" },
      MY: { grade: 7, code: "MY-KSSM-T1-1.2", chapter: "Form 1 Rational Numbers (Nombor Nisbah)", edition: "DSKP KSSM" },
      JP: { grade: 7, code: "JP-MEXT-835027A1", chapter: "中1 正の数・負の数の四則と累乗", edition: "学習指導要領" },
      KR: { grade: 7, code: "KR-2022:[9수01-04]", chapter: "중1 정수와 유리수의 사칙계산", edition: "2022 개정 교육과정" },
      UK: { grade: 7, code: "UK-NC-KS3-N4", chapter: "Year 7 Directed Numbers & Powers", edition: "England NC / Oak" },
      US: { grade: 7, code: "CCSS.MATH.7.NS.A.2", chapter: "Grade 7 Operations with Rational Numbers", edition: "Common Core" },
    },
  },
  {
    id: "mt_math_alg_expressions",
    subjectId: "math",
    domain: "Algebra",
    domainI18n: { "zh-CN": "数与代数", "zh-TW": "代數", en: "Algebra", ja: "数と式", ko: "문자와 식", ms: "Perkaitan dan Algebra" },
    cognitiveType: "procedural",
    baselineGrade: 7,
    centrality: 0.90,
    title: {
      "zh-CN": "代数式、去括号变号法则与合并同类项",
      "zh-TW": "代數式、去括號變號法則與同類項合併",
      en: "Algebraic Expressions, Distributive Sign Rules & Like Terms",
      ja: "文字式の計算・分配法則とカッコ外し",
      ko: "일차식의 덧셈과 뺄셈(괄호 풀기와 동류항)",
      ms: "Ungkapan Algebra & Kembangan",
    },
    description: {
      "zh-CN": "识别同类项，运用乘法分配律展开括号（尤其括号前是负号时括号内每一项全变号）并化简求值。",
      en: "Simplify algebraic expressions by distributing negative multipliers across parentheses and combining like terms.",
    },
    masteryCriteria: [
      { "zh-CN": "括号前为负系数（如 -2(3x - 4)）时，第二项准确变号得 -6x + 8", en: "Flip signs of ALL terms inside parentheses when distributing a negative factor" },
      { "zh-CN": "只合并字母及相同字母指数完全一致的同类项", en: "Combine only genuine like terms with identical variables and exponents" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：化简 5x - (2x - 3) 时，最后是 +3 还是 -3？“少扣了 3 分”相当于加 3 分还是减 3 分？",
      en: "Ask: When simplifying 5x - (2x - 3), does it end with +3 or -3? Think: cancelling a 3-point penalty adds or subtracts 3?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "括号前的负号代表“整体取反”——减去“支出 3 元（-3）”，等价于净增 3 元（+3）。最常见失分就是第二项漏变号！",
        en: "A minus sign in front of parentheses negates EVERY term inside—subtracting a debt of 3 adds +3.",
      },
      coreFormula: "$a - (b - c) = a - b + c$",
      steps: [
        {
          title: { "zh-CN": "把系数连同正负号一起乘进每一项", en: "Distribute the Signed Factor to Every Term" },
          body: { "zh-CN": "化简 4x - 2(x - 5)：把 -2 分别乘 x 和 -5，得到 4x - 2x + 10 = 2x + 10。", en: "4x - 2(x - 5) = 4x + (-2)(x) + (-2)(-5) = 2x + 10." },
          checkQuestion: { "zh-CN": "当 x = 2 时，代数式 5x - 2(x - 3) 的值是多少？", en: "Evaluate 5x - 2(x - 3) when x = 2." },
          checkAnswer: "12",
        },
      ],
      misconceptions: [
        {
          tag: "misc_dist_neg_sign",
          label: { "zh-CN": "去负括号时漏改括号内第二项的符号", en: "Failing to flip the sign of the second term when removing negative parentheses" },
          wrongPattern: { "zh-CN": "把 5x - 2(x - 3) 错展成 5x - 2x - 6", en: "Expanding 5x - 2(x - 3) as 5x - 2x - 6" },
          remediationTip: { "zh-CN": "把减号绑在系数上看作 (-2) × (-3) = +6，逐项画弧线检查符号！", en: "Treat the multiplier as (-2) and draw arrows to EVERY term: (-2)·(-3) = +6." },
        },
      ],
    },
    generatorKey: "math_alg_expressions",
    regionalCodeOverrides: {
      CN: { grade: 7, code: "cms-2022:4.NA.04", chapter: "七上 第四章 整式的加减", edition: "人教版 2024 审定" },
      HK: { grade: 7, code: "HK-EDB-KS3-NA3", chapter: "S1 Algebraic Expressions & Polynomials", edition: "EDB 初中數學" },
      TW: { grade: 7, code: "108-Math:A-7-1", chapter: "國中七上 代數式的化簡", edition: "108課綱" },
      SG: { grade: 7, code: "SG-MOE-S1-A1.2", chapter: "Sec 1 Linear Algebraic Expressions", edition: "MOE G3 Math" },
      MY: { grade: 7, code: "MY-KSSM-T1-5.2", chapter: "Form 1 Ungkapan Algebra", edition: "DSKP KSSM" },
      JP: { grade: 7, code: "JP-MEXT-835027A2", chapter: "中1 文字を用いた式の計算", edition: "学習指導要領" },
      KR: { grade: 7, code: "KR-2022:[9수02-02]", chapter: "중1 일차식의 덧셈과 뺄셈", edition: "2022 개정 교육과정" },
      UK: { grade: 7, code: "UK-NC-KS3-A2", chapter: "KS3 Expanding Brackets & Collecting Like Terms", edition: "England NC" },
      US: { grade: 7, code: "CCSS.MATH.7.EE.A.1", chapter: "Grade 7 Factor & Expand Linear Expressions", edition: "Common Core" },
    },
  },
  {
    id: "mt_math_linear_eq_one",
    subjectId: "math",
    domain: "Algebra",
    domainI18n: { "zh-CN": "数与代数", "zh-TW": "代數", en: "Algebra", ja: "数と式", ko: "문자와 식", ms: "Perkaitan dan Algebra" },
    cognitiveType: "procedural",
    baselineGrade: 7,
    centrality: 0.94,
    title: {
      "zh-CN": "一元一次方程解法（去分母/移项）与应用建模",
      "zh-TW": "一元一次方程式解法與應用問題",
      en: "Solving Linear Equations with Fractions & Modeling",
      ja: "一次方程式の解法（分母を払う・移項）と利用",
      ko: "일차방정식의 풀이와 활용",
      ms: "Persamaan Linear Satu Pemboleh Ubah",
    },
    description: {
      "zh-CN": "基于等式基本性质进行去分母、去括号、移项变号与系数化 1，建立方程解决实际问题。",
      en: "Solve multi-step linear equations with fractional coefficients by clearing denominators and balancing terms.",
    },
    masteryCriteria: [
      { "zh-CN": "方程两边同乘公分母去分母时，不含分母的整数项也必须同乘、绝不漏乘", en: "Multiply EVERY term (including integer terms) by the LCD when clearing denominators" },
      { "zh-CN": "移项跨过等号必变号，且分子是多项式时去分母自动加括号保护", en: "Wrap numerator polynomials in parentheses when clearing fraction bars" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：解 (x+1)/2 - 1 = 3 时，两边同乘 2 把分母去掉，中间那个“-1”要不要也乘 2？",
      en: "Ask: When multiplying both sides of (x+1)/2 - 1 = 3 by 2 to clear the fraction, do we also multiply the '-1' by 2?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "等式就像天平：左边托盘放了两件物品，把整个左边放大 2 倍时，每一件物品都必须乘 2，天平才不会倾斜！",
        en: "An equation is a balance scale: doubling one side requires doubling EVERY item sitting on that pan.",
      },
      coreFormula: "$\\frac{x - a}{b} - k = c \\implies (x - a) - b \\cdot k = b \\cdot c$",
      visualType: "balance_scale",
      steps: [
        {
          title: { "zh-CN": "去分母两铁律：整数项不漏乘、分子多项式加括号", en: "Two Iron Rules for Clearing Denominators" },
          body: { "zh-CN": "解 (2x+1)/3 - 1 = x/2：同乘 6 得 2(2x+1) - 6 = 3x ⇒ 4x + 2 - 6 = 3x ⇒ x = 4。", en: "Multiply every term of (2x+1)/3 - 1 = x/2 by 6: 2(2x+1) - 6 = 3x ⇒ x = 4." },
          checkQuestion: { "zh-CN": "解方程：(x + 2)/3 - 1 = 2，x 等于多少？", en: "Solve (x + 2)/3 - 1 = 2 for x." },
          checkAnswer: "7",
        },
      ],
      misconceptions: [
        {
          tag: "misc_eq_skip_const_lcd",
          label: { "zh-CN": "去分母时漏乘不含分母的常数项", en: "Forgetting to multiply standalone integer terms by the LCD" },
          wrongPattern: { "zh-CN": "把 (x+2)/3 - 1 = 2 同乘 3 错写成 x + 2 - 1 = 6（漏把 -1 乘 3）", en: "Writing x + 2 - 1 = 6 instead of x + 2 - 3 = 6" },
          remediationTip: { "zh-CN": "动笔前先用圆圈圈出方程里的每一个独立项（含常数项），确保每圈都乘上最小公倍数！", en: "Circle every separate term before multiplying by the LCD so standalone constants are never skipped." },
        },
      ],
    },
    generatorKey: "math_linear_eq_one",
    regionalCodeOverrides: {
      CN: { grade: 7, code: "cms-2022:4.NA.06", chapter: "七上 第五章 一元一次方程", edition: "人教版 2024 审定" },
      HK: { grade: 7, code: "HK-EDB-KS3-NA4", chapter: "S1 Linear Equations in One Unknown", edition: "EDB 初中數學" },
      TW: { grade: 7, code: "108-Math:A-7-2", chapter: "國中七上 一元一次方程式", edition: "108課綱" },
      SG: { grade: 7, code: "SG-MOE-S1-A2.1", chapter: "Sec 1 Simple Fractional & Linear Equations", edition: "MOE G3 Math" },
      MY: { grade: 7, code: "MY-KSSM-T1-6.1", chapter: "Form 1 Persamaan Linear", edition: "DSKP KSSM" },
      JP: { grade: 7, code: "JP-MEXT-835027A3", chapter: "中1 一元一次方程式", edition: "学習指導要領" },
      KR: { grade: 7, code: "KR-2022:[9수02-04]", chapter: "중1 일차방정식의 풀이", edition: "2022 개정 교육과정" },
      UK: { grade: 8, code: "UK-NC-KS3-A4", chapter: "KS3 Solving Linear Equations with Unknowns on Both Sides", edition: "England NC" },
      US: { grade: 8, code: "CCSS.MATH.8.EE.C.7", chapter: "Grade 8 Linear Equations in One Variable", edition: "Common Core" },
    },
  },
  {
    id: "mt_math_linear_systems",
    subjectId: "math",
    domain: "Algebra",
    domainI18n: { "zh-CN": "数与代数", "zh-TW": "代數", en: "Algebra", ja: "数と式", ko: "문자와 식", ms: "Perkaitan dan Algebra" },
    cognitiveType: "procedural",
    baselineGrade: 8,
    centrality: 0.84,
    title: {
      "zh-CN": "二元一次方程组（代入消元与加减消元法）",
      "zh-TW": "二元一次聯立方程式（代入與加減消去法）",
      en: "Systems of Linear Equations (Substitution & Elimination)",
      ja: "連立二元一次方程式の解法と利用",
      ko: "연립일차방정식의 풀이와 활용",
      ms: "Sistem Persamaan Linear Dua Pemboleh Ubah",
    },
    description: {
      "zh-CN": "掌握“消元降维”核心思想，熟练用加减消元法或代入法解二元一次方程组并建模鸡兔同笼/行程调配问题。",
      en: "Eliminate variables systematically via substitution or linear combination to solve 2×2 systems.",
    },
    masteryCriteria: [
      { "zh-CN": "两式相减消元时，准确处理减式各项的正负号翻转", en: "Subtract equations carefully without sign errors on negative terms" },
      { "zh-CN": "求出两个未知数后能代回原方程组双检验", en: "Verify solutions in BOTH original equations" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：买 2 杯奶茶和 1 块蛋糕花 32 元，买 2 杯奶茶和 3 块蛋糕花 56 元，不用设方程怎么一眼看出 2 块蛋糕多少钱？",
      en: "Ask: 2 teas + 1 cake cost $32, and 2 teas + 3 cakes cost $56. How do you spot the price of 2 cakes instantly? (That's elimination!)",
    },
    microLesson: {
      intuition: {
        "zh-CN": "对比两张购物小票找差价，就是“加减消元法”的直觉原型：相同的部分抵消掉，剩下的差价只由单一未知量产生。",
        en: "Comparing two receipts with identical tea counts cancels out tea, isolating the cake price—pure elimination.",
      },
      coreFormula: "$\\{ a_1 x + b_1 y = c_1, \\; a_2 x + b_2 y = c_2 \\}$",
      steps: [
        {
          title: { "zh-CN": "同号相减、异号相加", en: "Same Sign Subtract, Opposite Sign Add" },
          body: { "zh-CN": "对齐系数后，若 y 的系数互为相反数（+2y 与 -2y），直接两式相加最不易出错！", en: "When coefficients have opposite signs (+2y and -2y), add the equations directly to avoid subtraction sign traps." },
          checkQuestion: { "zh-CN": "解方程组 x + y = 7, x - y = 3，求 x 的值", en: "Solve x + y = 7 and x - y = 3. What is x?" },
          checkAnswer: "5",
        },
      ],
      misconceptions: [
        {
          tag: "misc_sys_sub_sign",
          label: { "zh-CN": "两式相减消元时，被减式负项未变成加号", en: "Sign error when subtracting an equation containing a negative term" },
          wrongPattern: { "zh-CN": "(2x + y = 8) 减去 (2x - 3y = 0) 错算成 -2y = 8 而非 4y = 8", en: "Computing y - (-3y) as -2y instead of +4y" },
          remediationTip: { "zh-CN": "相减极易错符号，推荐把第二式两边同乘 -1 后再“两式相加”！", en: "Multiply the second equation by -1 first, then ADD—much safer than mental subtraction!" },
        },
      ],
    },
    generatorKey: "math_linear_systems",
    regionalCodeOverrides: {
      CN: { grade: 7, code: "cms-2022:4.NA.07", chapter: "七下 第十章 二元一次方程组", edition: "人教版 2024 审定" },
      HK: { grade: 8, code: "HK-EDB-KS3-NA7", chapter: "S2 Simultaneous Linear Equations", edition: "EDB 初中數學" },
      TW: { grade: 7, code: "108-Math:A-7-4", chapter: "國中七下 二元一次聯立方程式", edition: "108課綱" },
      SG: { grade: 8, code: "SG-MOE-S2-A2.2", chapter: "Sec 2 Simultaneous Linear Equations", edition: "MOE G3 Math" },
      MY: { grade: 7, code: "MY-KSSM-T1-6.3", chapter: "Form 1 Persamaan Linear Serentak", edition: "DSKP KSSM" },
      JP: { grade: 8, code: "JP-MEXT-835028A2", chapter: "中2 連立二元一次方程式", edition: "学習指導要領" },
      KR: { grade: 8, code: "KR-2022:[9수02-08]", chapter: "중2 연립일차방정식", edition: "2022 개정 교육과정" },
      UK: { grade: 9, code: "UK-NC-KS3-A7", chapter: "Year 9 (KS3) Simultaneous Linear Equations", edition: "England NC KS3" },
      US: { grade: 8, code: "CCSS.MATH.8.EE.C.8", chapter: "Grade 8 / Algebra 1 Linear Systems", edition: "Common Core" },
    },
  },
  {
    id: "mt_math_coord_linear_func",
    subjectId: "math",
    domain: "Functions",
    domainI18n: { "zh-CN": "函数与图像", "zh-TW": "函數與圖形", en: "Functions & Graphs", ja: "関数", ko: "변화와 관계(함수)", ms: "Fungsi & Graf" },
    cognitiveType: "conceptual",
    baselineGrade: 8,
    centrality: 0.91,
    title: {
      "zh-CN": "平面直角坐标系、斜率与一次函数 y = kx + b",
      "zh-TW": "直角坐標平面、斜率與線型函數 y = kx + b",
      en: "Coordinate Plane, Slope Rate of Change & Linear Functions",
      ja: "座標平面・変化の割合（傾き）と一次関数 y = ax + b",
      ko: "좌표평면과 일차함수 y = ax + b의 기울기·절편",
      ms: "Satah Cartes, Kecerunan & Fungsi Linear",
    },
    description: {
      "zh-CN": "连接代数表达式与几何直线：理解斜率 k = Δy/Δx 代表变化率与增减性，截距 b 代表与 y 轴交点。",
      en: "Connect equations to lines: interpret slope k = Δy/Δx as constant rate of change and b as the y-intercept.",
    },
    masteryCriteria: [
      { "zh-CN": "由两点坐标准确计算斜率 k = (y₂ - y₁)/(x₂ - x₁)，不颠倒分子分母", en: "Calculate slope accurately as Δy / Δx (rise over run)" },
      { "zh-CN": "根据 k、b 正负瞬间判断直线经过哪些象限及函数增减性", en: "Determine quadrants and monotonicity from signs of k and b" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：出租车起步价 10 元、每公里 3 元，写成 y = 3x + 10 后，图像上的起点高度和倾斜程度分别对应哪个数字？",
      en: "Ask: A taxi charges $10 base plus $3/km (y = 3x + 10). Which number sets the starting height and which sets the steepness?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "斜率 k 是“每向右走 1 步，高度变化多少步（Δy/Δx）”；k > 0 爬坡，k < 0 下坡，b 是 x = 0 时的初始高度。",
        en: "Slope k is vertical rise per unit horizontal step (Δy/Δx); b is where the line crosses the vertical axis at x = 0.",
      },
      coreFormula: "$k = \\frac{y_2 - y_1}{x_2 - x_1}, \\quad y = kx + b$",
      visualType: "parabola",
      steps: [
        {
          title: { "zh-CN": "纵向变化 Δy 在上，横向变化 Δx 在下", en: "Vertical Change Over Horizontal Change" },
          body: { "zh-CN": "过点 (1, 3) 和 (3, 7) 的直线：k = (7 - 3)/(3 - 1) = 2，代入得 3 = 2(1) + b ⇒ b = 1。", en: "Through (1,3) and (3,7): k = (7-3)/(3-1) = 2, so b = 3 - 2(1) = 1." },
          checkQuestion: { "zh-CN": "过点 (0, 2) 和 (2, 8) 的一次函数斜率 k 是多少？", en: "Find the slope k of the line passing through (0, 2) and (2, 8)." },
          checkAnswer: "3",
        },
      ],
      misconceptions: [
        {
          tag: "misc_slope_run_over_rise",
          label: { "zh-CN": "把斜率算反成 Δx / Δy，或图像平移“左加右减”记反", en: "Inverting slope as Δx / Δy instead of Δy / Δx" },
          wrongPattern: { "zh-CN": "过 (0,2) 和 (2,8) 的斜率算成 (2-0)/(8-2) = 1/3", en: "Computing slope as (2-0)/(8-2) = 1/3 instead of 3" },
          remediationTip: { "zh-CN": "坡度陡不陡看“高度抬升除以水平前进”：Δy 永远在分子！", en: "Steepness is vertical rise divided by horizontal run: Δy is always on top!" },
        },
      ],
    },
    generatorKey: "math_linear_func",
    regionalCodeOverrides: {
      CN: { grade: 8, code: "cms-2022:4.NA.11", chapter: "八下 第二十二章 函数与一次函数", edition: "人教版 2024 审定" },
      HK: { grade: 8, code: "HK-EDB-KS3-MG3", chapter: "S2–S3 Coordinate Geometry of Straight Lines", edition: "EDB 初中數學" },
      TW: { grade: 7, code: "108-Math:A-7-6", chapter: "國中七下 二元一次方程式的圖形 / 八下 線型函數", edition: "108課綱" },
      SG: { grade: 8, code: "SG-MOE-S2-A3.1", chapter: "Sec 2 Linear Functions, Graphs & Gradient", edition: "MOE G3 Math" },
      MY: { grade: 8, code: "MY-KSSM-T2-9.1", chapter: "Form 2–3 Garis Lurus (Gradient & y = mx + c)", edition: "DSKP KSSM" },
      JP: { grade: 8, code: "JP-MEXT-835028C1", chapter: "中2 一次関数（変化の割合・傾きと切片）", edition: "学習指導要領" },
      KR: { grade: 8, code: "KR-2022:[9수02-10]", chapter: "중2 일차함수와 그 그래프", edition: "2022 개정 교육과정" },
      UK: { grade: 8, code: "UK-NC-KS3-A9", chapter: "Year 8 (KS3) y = mx + c, Gradient & Intercepts", edition: "England NC KS3" },
      US: { grade: 8, code: "CCSS.MATH.8.F.B.4", chapter: "Grade 8 Linear Functions & Rate of Change", edition: "Common Core" },
    },
  },
  {
    id: "mt_math_special_products_factor",
    subjectId: "math",
    domain: "Algebra",
    domainI18n: { "zh-CN": "数与代数", "zh-TW": "代數", en: "Algebra", ja: "数と式", ko: "문자와 식", ms: "Perkaitan dan Algebra" },
    cognitiveType: "procedural",
    baselineGrade: 8,
    centrality: 0.95,
    title: {
      "zh-CN": "完全平方公式、平方差公式与十字相乘因式分解",
      "zh-TW": "乘法公式（完全平方／平方差）與因式分解",
      en: "Special Products (Perfect Square / Difference of Squares) & Factoring",
      ja: "乗法公式と因数分解（平方完成の基礎）",
      ko: "곱셈 공식과 인수분해(완전제곱식·합차공식)",
      ms: "Kembangan Istimewa & Pemfaktoran Polinomial",
    },
    description: {
      "zh-CN": "双向贯通整式乘法与因式分解：熟练展开与逆用 (a±b)² = a²±2ab+b²、a²-b² = (a+b)(a-b) 及二次三项式分解。",
      en: "Master bidirectional expansion and factoring of (a±b)^2, a^2-b^2, and quadratic trinomials x^2 + bx + c.",
    },
    masteryCriteria: [
      { "zh-CN": "展开 (a ± b)² 绝不漏写中间交叉项 ±2ab", en: "Never omit the middle cross-term ±2ab when expanding (a ± b)^2" },
      { "zh-CN": "能给定 x² + bx 快速补全常数项 (b/2)² 配成完全平方式", en: "Complete x^2 + bx into a perfect square trinomial by adding (b/2)^2" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：边长 (a + b) 的大正方形面积，除了小正方形 a² 和 b² 之外，角落里还多出哪两块长方形？（为什么 (a+b)² 不等于 a²+b²？）",
      en: "Ask: A square of side (a+b) contains squares a² and b²—what two rectangles fill the remaining corners so (a+b)² ≠ a² + b²?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "几何面积图一眼破除头号迷思：边长 (a+b) 的正方形分成四格：a²、b² 以及两个长为 a 宽为 b 的长方形，中间项 2ab 永远跑不掉！",
        en: "An (a+b)×(a+b) square partitions into four regions: a², b², and TWO a×b rectangles—making 2ab unforgettable.",
      },
      coreFormula: "$(a \\pm b)^2 = a^2 \\pm 2ab + b^2, \\quad a^2 - b^2 = (a + b)(a - b)$",
      steps: [
        {
          title: { "zh-CN": "首平方、尾平方，首尾两倍放中央", en: "First Squared, Last Squared, Twice the Product in the Middle" },
          body: { "zh-CN": "(x - 5)² = x² - 2·x·5 + 25 = x² - 10x + 25；反之要让 x² - 10x + k 成为完全平方式，k = (-10/2)² = 25。", en: "(x - 5)² = x² - 10x + 25; to make x² - 10x + k a perfect square, k = (-10/2)² = 25." },
          checkQuestion: { "zh-CN": "若 x² + 8x + k 是完全平方式，常数 k 等于多少？", en: "If x² + 8x + k is a perfect square trinomial, what is k?" },
          checkAnswer: "16",
        },
      ],
      misconceptions: [
        {
          tag: "misc_freshman_dream",
          label: { "zh-CN": "漏掉交叉项 2ab，误把 (a + b)² 写成 a² + b²", en: "Omitting the 2ab middle term ('Freshman's Dream': (a+b)^2 = a^2 + b^2)" },
          wrongPattern: { "zh-CN": "把 (x + 3)² 展开成 x² + 9，漏掉 +6x", en: "Expanding (x + 3)^2 as x^2 + 9 without +6x" },
          remediationTip: { "zh-CN": "代数字验算：(2+3)² = 25，而 2²+3² = 13，差的那 12 正是 2×2×3！", en: "Test with numbers: (2+3)² = 25, while 2²+3² = 13. The missing 12 is 2·2·3!" },
        },
      ],
    },
    generatorKey: "math_special_products",
    regionalCodeOverrides: {
      CN: { grade: 8, code: "cms-2022:4.NA.05", chapter: "八上 第十六、十七章 整式的乘法与因式分解", edition: "人教版 2024 审定" },
      HK: { grade: 8, code: "HK-EDB-KS3-NA5", chapter: "S2 Identities & Factorization (恆等式與因式分解)", edition: "EDB 初中數學" },
      TW: { grade: 8, code: "108-Math:A-8-1", chapter: "國中八上 乘法公式與因式分解", edition: "108課綱" },
      SG: { grade: 8, code: "SG-MOE-S2-A1.3", chapter: "Sec 2 Expansion & Factorisation using Special Algebraic Identities", edition: "MOE G3 Math" },
      MY: { grade: 8, code: "MY-KSSM-T2-2.1", chapter: "Form 2 Pemfaktoran dan Pecahan Algebra", edition: "DSKP KSSM" },
      JP: { grade: 9, code: "JP-MEXT-835029A1", chapter: "中3 多項式の展開と因数分解", edition: "学習指導要領" },
      KR: { grade: 9, code: "KR-2022:[9수02-11]", chapter: "중3 다항식의 곱셈과 인수분해", edition: "2022 개정 교육과정" },
      UK: { grade: 9, code: "UK-NC-KS3-A4", chapter: "Year 9 (KS3) Expanding Quadratics & Factorising", edition: "England NC KS3" },
      US: { grade: 9, code: "CCSS.MATH.HSA.SSE.A.2", chapter: "Algebra 1 Factoring & Structure in Expressions", edition: "Common Core" },
    },
  },
  {
    id: "mt_math_rational_eq",
    subjectId: "math",
    domain: "Algebra",
    domainI18n: { "zh-CN": "数与代数", "zh-TW": "代數", en: "Algebra", ja: "数と式", ko: "문자와 식", ms: "Perkaitan dan Algebra" },
    cognitiveType: "procedural",
    baselineGrade: 8,
    centrality: 0.85,
    title: {
      "zh-CN": "分式化简、公式变形与分式方程增根检验",
      "zh-TW": "分式化簡、公式變形與分式方程式",
      en: "Rational Equations, Formula Rearrangement & Extraneous Roots",
      ja: "分数式・等式の変形（物理公式の基礎）",
      ko: "유리식 변형과 분수방정식",
      ms: "Pecahan Algebra & Rumus Algebra",
    },
    description: {
      "zh-CN": "熟练对含分母的代数式变形（如物理 I=U/R、1/R=1/R₁+1/R₂），解分式方程并必检分母不为零（排除增根）。",
      en: "Manipulate algebraic formulas with variables in denominators and solve rational equations while checking for extraneous roots.",
    },
    masteryCriteria: [
      { "zh-CN": "能将物理/几何公式如 I = U/R 双向变形求 R = U/I，以及由 1/f = 1/u + 1/v 通分求 f", en: "Rearrange rational formulas such as R = U/I and parallel resistance 1/R = 1/R₁ + 1/R₂" },
      { "zh-CN": "解完分式方程必代入最简公分母检验，舍去令分母为 0 的增根", en: "Check candidate solutions against zero denominators to reject extraneous roots" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：解出分式方程得到 x = 2 后，为什么不能直接写答，还得回头看一眼原方程的分母是不是 x - 2？",
      en: "Ask: After solving a rational equation and getting x = 2, why must you check whether (x - 2) sat in the original denominator?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "两边同乘 (x - 2) 去分母时，若恰巧 x = 2，相当于两边同乘了 0（0 乘任何数都相等），这会凭空造出使原分母爆炸的“假解（增根）”！",
        en: "Multiplying by (x - 2) is invalid if x = 2 because multiplying by zero destroys equivalence and creates extraneous roots.",
      },
      coreFormula: "$\\frac{P(x)}{Q(x)} = k \\implies P(x) = k \\cdot Q(x) \\quad (Q(x) \\ne 0)$",
      steps: [
        {
          title: { "zh-CN": "一化整式、二求解、三验分母不为零", en: "Clear LCD → Solve → Check Denominator ≠ 0" },
          body: { "zh-CN": "同时这也是物理欧姆定律 R = U/I 与并联电阻公式的核心数学底座。", en: "This skill directly powers Ohm's law R = U/I and lens/parallel-resistor equations in Physics." },
          checkQuestion: { "zh-CN": "解分式方程 12 / (x + 1) = 3，求 x 的值", en: "Solve 12 / (x + 1) = 3 for x." },
          checkAnswer: "3",
        },
      ],
      misconceptions: [
        {
          tag: "misc_rational_invert_sum",
          label: { "zh-CN": "把 1/R = 1/R₁ + 1/R₂ 直接逐项取倒数写成 R = R₁ + R₂", en: "Inverting term-by-term: turning 1/R = 1/a + 1/b into R = a + b" },
          wrongPattern: { "zh-CN": "1/R = 1/3 + 1/6 错算为 R = 3 + 6 = 9", en: "Solving 1/R = 1/3 + 1/6 as R = 9 instead of R = 2" },
          remediationTip: { "zh-CN": "必须先把右边通分合并成单个分数 (R₁+R₂)/(R₁R₂)，最后才能整体取倒数得 R = R₁R₂/(R₁+R₂)！", en: "Combine the right side into a single fraction FIRST: 1/3 + 1/6 = 3/6 = 1/2 ⇒ R = 2!" },
        },
      ],
    },
    generatorKey: "math_rational_eq",
    regionalCodeOverrides: {
      CN: { grade: 8, code: "cms-2022:4.NA.08", chapter: "八上 第十八章 分式与分式方程", edition: "人教版 2024 审定" },
      HK: { grade: 8, code: "HK-EDB-KS3-NA6", chapter: "S2 Algebraic Fractions & Change of Subject of Formula", edition: "EDB 初中數學" },
      TW: { grade: 8, code: "108-Math:A-8-3 / A-10-2", chapter: "國中八上 多項式四則與高一分式運算", edition: "108課綱" },
      SG: { grade: 8, code: "SG-MOE-S2-A1.4", chapter: "Sec 2 Algebraic Fractions & Changing the Subject of a Formula", edition: "MOE G3 Math" },
      MY: { grade: 8, code: "MY-KSSM-T2-3.1", chapter: "Form 2 Rumus Algebra (Algebraic Formulae)", edition: "DSKP KSSM" },
      JP: { grade: 8, code: "JP-MEXT-835028A1", chapter: "中2 等式の変形 / 高1 分数式", edition: "学習指導要領" },
      KR: { grade: 8, code: "KR-2022:[9수02-06]", chapter: "중2 등식의 변형 / 고1 유리식", edition: "2022 개정 교육과정" },
      UK: { grade: 9, code: "UK-NC-KS3-A5", chapter: "Year 9 (KS3) Rearranging Formulae & Algebraic Fractions", edition: "England NC KS3" },
      US: { grade: 9, code: "CCSS.MATH.HSA.REI.A.2", chapter: "Algebra 1 & 2 Rational Equations & Extraneous Solutions", edition: "Common Core" },
    },
  },
  {
    id: "mt_math_radicals_pythagoras",
    subjectId: "math",
    domain: "Geometry & Measurement",
    domainI18n: { "zh-CN": "图形与几何", "zh-TW": "空間與形狀", en: "Geometry & Measurement", ja: "図形と測定", ko: "도형과 측정", ms: "Sukatan & Geometri" },
    cognitiveType: "reasoning",
    baselineGrade: 8,
    centrality: 0.88,
    title: {
      "zh-CN": "算术平方根、二次根式化简与勾股定理 a² + b² = c²",
      "zh-TW": "平方根、根式化簡與畢氏定理 a² + b² = c²",
      en: "Square Roots, Radicals & the Pythagorean Theorem",
      ja: "平方根と三平方の定理 a² + b² = c²",
      ko: "제곱근과 피타고라스 정리 a² + b² = c²",
      ms: "Punca Kuasa Dua & Teorem Pythagoras",
    },
    description: {
      "zh-CN": "理解平方根与算术平方根，熟练运用勾股定理求直角三角形未知边及坐标平面两点间距离。",
      en: "Simplify square roots and apply a^2 + b^2 = c^2 to right triangles and coordinate distance problems.",
    },
    masteryCriteria: [
      { "zh-CN": "准确识别直角所对的最长边为斜边 c：求直角边时用 c² - a² 而非相加", en: "Identify the hypotenuse opposite the 90° angle; subtract squares when solving for a leg" },
      { "zh-CN": "区分算术平方根 √9 = 3 与方程 x² = 9 的双根 x = ±3", en: "Distinguish principal root √9 = 3 from the two solutions x = ±3 of x^2 = 9" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：装修工人没有量角器，为什么拿一根绳子量出 3 米、4 米、5 米拉紧，就能卡出一个标准直角墙角？",
      en: "Ask: With no protractor, why do carpenters measure 3m, 4m, and 5m of rope to guarantee a perfect 90° corner?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "勾股定理不是随便三条边平方相加，而是“两条直角边上的正方形面积之和，恰好铺满斜边上的大正方形”。",
        en: "Squares built on the two perpendicular legs have areas summing exactly to the square built on the hypotenuse.",
      },
      coreFormula: "$a^2 + b^2 = c^2 \\quad (\\angle C = 90^\\circ)$",
      visualType: "right_triangle",
      steps: [
        {
          title: { "zh-CN": "先找 90° 对面的斜边 c，再列加或减", en: "Locate the Hypotenuse First" },
          body: { "zh-CN": "常见勾股数组：(3,4,5)、(5,12,13)、(6,8,10)、(8,15,17)。已知斜边 13 和一直角边 5，另一直角边 = √(13² - 5²) = 12。", en: "Know classic triples (3,4,5), (5,12,13), (8,15,17). Given hypotenuse 13 and leg 5, leg b = √(169 - 25) = 12." },
          checkQuestion: { "zh-CN": "直角三角形斜边长为 10，一条直角边为 6，另一条直角边长是多少？", en: "A right triangle has hypotenuse 10 and one leg 6. Find the other leg." },
          checkAnswer: "8",
        },
      ],
      misconceptions: [
        {
          tag: "misc_pythag_always_add",
          label: { "zh-CN": "不看哪条是斜边，机械地把题目给的两条边平方相加", en: "Mechanically adding squares of any two given sides even when one is the hypotenuse" },
          wrongPattern: { "zh-CN": "斜边 10、直角边 6，错算成 √(10² + 6²) = √136", en: "Computing √(10² + 6²) when 10 is already the longest side (hypotenuse)" },
          remediationTip: { "zh-CN": "斜边 c 永远是最长边！已知斜边求直角边必须用减法：b = √(c² - a²)。", en: "The hypotenuse is always the longest side; subtract to find a leg: b = √(c² - a²)." },
        },
      ],
    },
    generatorKey: "math_pythagoras",
    regionalCodeOverrides: {
      CN: { grade: 8, code: "cms-2022:4.GG.14", chapter: "八下 第十九章 二次根式 / 第二十章 勾股定理", edition: "人教版 2024 审定" },
      HK: { grade: 8, code: "HK-EDB-KS3-MG2", chapter: "S2 Pythagoras' Theorem & Surds (畢氏定理與根式)", edition: "EDB 初中數學" },
      TW: { grade: 8, code: "108-Math:S-8-6", chapter: "國中八上 平方根與畢氏定理", edition: "108課綱" },
      SG: { grade: 8, code: "SG-MOE-S2-G2.1", chapter: "Sec 2 Pythagoras' Theorem", edition: "MOE G3 Math" },
      MY: { grade: 7, code: "MY-KSSM-T1-13.1", chapter: "Form 1 Teorem Pythagoras", edition: "DSKP KSSM" },
      JP: { grade: 9, code: "JP-MEXT-835029B3", chapter: "中3 平方根と三平方の定理", edition: "学習指導要領" },
      KR: { grade: 8, code: "KR-2022:[9수02-16]", chapter: "중2 피타고라스 정리 / 중3 제곱근", edition: "2022 개정 교육과정" },
      UK: { grade: 9, code: "UK-NC-KS3-G6", chapter: "Year 9 (KS3) Pythagoras' Theorem & Roots", edition: "England NC KS3" },
      US: { grade: 8, code: "CCSS.MATH.8.G.B.7", chapter: "Grade 8 Apply the Pythagorean Theorem", edition: "Common Core" },
    },
  },
  {
    id: "mt_math_quad_complete_sq",
    subjectId: "math",
    domain: "Algebra",
    domainI18n: { "zh-CN": "数与代数", "zh-TW": "代數", en: "Algebra", ja: "数と式", ko: "문자와 식", ms: "Perkaitan dan Algebra" },
    cognitiveType: "procedural",
    baselineGrade: 9,
    centrality: 0.96,
    title: {
      "zh-CN": "配方法、判别式 Δ 与求根公式解一元二次方程",
      "zh-TW": "配方法、判別式 Δ 與公式解一元二次方程式",
      en: "Completing the Square, Discriminant & Quadratic Formula",
      ja: "二次方程式（平方完成・解の公式・判別式）",
      ko: "이차방정식의 풀이(완전제곱식·근의 공식·판별식)",
      ms: "Penyempurnaan Kuasa Dua & Rumus Kuadratik",
    },
    description: {
      "zh-CN": "将一般式 x² + bx + c = 0 配方为 (x + b/2)² = k 降次求解，掌握求根公式与判别式 Δ = b² - 4ac 判断实根个数。",
      en: "Transform quadratics into (x + h)^2 = k by completing the square, apply the quadratic formula, and analyze Δ = b^2 - 4ac.",
    },
    masteryCriteria: [
      { "zh-CN": "二次项系数为 1 时，方程两边准确同加“一次项系数一半的平方 (b/2)²”", en: "Add (b/2)^2 to both sides after normalizing the leading coefficient to 1" },
      { "zh-CN": "开平方时保留正负双解 x + h = ±√k，不漏掉负根", en: "Include both positive and negative square roots (±√k) when taking roots" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：解 (x - 3)² = 16 时，为什么答案有两个（7 和 -1），只答 7 漏掉了什么情况？",
      en: "Ask: When solving (x - 3)² = 16, why are there TWO answers (7 and -1) instead of just 7?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "一元二次方程难在 x² 和 bx 混在一起无法直接移项；“配方法”通过补全 (b/2)² 把它们打包进同一个平方括号 (x + b/2)²，瞬间降为一元一次！",
        en: "Completing the square packs x² and bx into a single squared binomial (x + b/2)², letting a square root reduce degree 2 to degree 1.",
      },
      coreFormula: "$x^2 + bx + \\left(\\frac{b}{2}\\right)^2 = \\left(x + \\frac{b}{2}\\right)^2, \\quad \\Delta = b^2 - 4ac$",
      steps: [
        {
          title: { "zh-CN": "移常数、配一半平方、开方取正负", en: "Move Constant → Add (b/2)² → Take ±√" },
          body: { "zh-CN": "解 x² - 6x + 5 = 0：移项 x² - 6x = -5 ⇒ 两边加 (-3)²=9 得 (x - 3)² = 4 ⇒ x - 3 = ±2 ⇒ x₁ = 5, x₂ = 1。", en: "x² - 6x = -5 ⇒ add 9 to both sides: (x - 3)² = 4 ⇒ x - 3 = ±2 ⇒ x = 5 or 1." },
          checkQuestion: { "zh-CN": "方程 (x - 2)² = 9 的两个实数根是什么？（用逗号隔开）", en: "Find both solutions of (x - 2)² = 9 (comma-separated)." },
          checkAnswer: "5, -1",
        },
      ],
      misconceptions: [
        {
          tag: "misc_quad_drop_neg_root",
          label: { "zh-CN": "开平方漏写 ± 号导致丢掉一个实根，或左边加了 (b/2)² 右边忘加", en: "Dropping the negative square root (±) or adding (b/2)^2 to only one side" },
          wrongPattern: { "zh-CN": "由 (x - 2)² = 9 只写出 x - 2 = 3 即 x = 5，漏掉 -1", en: "Solving (x - 2)^2 = 9 as only x = 5, missing x = -1" },
          remediationTip: { "zh-CN": "(+3)² = 9 且 (-3)² = 9，任何正数开平方必有一正一负两个平方根！", en: "Both (+3)² and (-3)² equal 9—always write ± immediately upon taking square roots!" },
        },
      ],
    },
    generatorKey: "math_quad_complete_sq",
    regionalCodeOverrides: {
      CN: { grade: 9, code: "cms-2022:4.NA.09", chapter: "九上 第二十三章 一元二次方程（配方法与公式法）", edition: "人教版 2024 审定" },
      HK: { grade: 10, code: "HK-DSE-Comp-NA2", chapter: "S4 Quadratic Equations in One Unknown (配方法與判別式)", edition: "HKDSE Compulsory" },
      TW: { grade: 8, code: "108-Math:A-8-7", chapter: "國中八上 一元二次方程式（配方法與公式解）", edition: "108課綱" },
      SG: { grade: 9, code: "SG-MOE-S3-A1.1", chapter: "Sec 3 Solving Quadratic Equations by Completing the Square (O-Level 4052)", edition: "MOE E/A-Math" },
      MY: { grade: 10, code: "MY-KSSM-T4-1.1", chapter: "Form 4 Fungsi & Persamaan Kuadratik / Add Math", edition: "DSKP KSSM SPM" },
      JP: { grade: 9, code: "JP-MEXT-835029A3", chapter: "中3 二次方程式（平方完成・解の公式）", edition: "学習指導要領" },
      KR: { grade: 9, code: "KR-2022:[9수02-14]", chapter: "중3 이차방정식의 풀이(완전제곱식·근의 공식)", edition: "2022 개정 교육과정" },
      UK: { grade: 10, code: "UK-GCSE-Higher-A18", chapter: "GCSE Higher: Completing the Square & Quadratic Formula", edition: "Edexcel / AQA GCSE" },
      US: { grade: 9, code: "CCSS.MATH.HSA.REI.B.4a", chapter: "Algebra 1 Solve Quadratics by Completing the Square", edition: "Common Core" },
    },
  },
  {
    id: "mt_math_quad_function_parabola",
    subjectId: "math",
    domain: "Functions",
    domainI18n: { "zh-CN": "函数与图像", "zh-TW": "函數與圖形", en: "Functions & Graphs", ja: "関数", ko: "변화와 관계(함수)", ms: "Fungsi & Graf" },
    cognitiveType: "modeling",
    baselineGrade: 9,
    centrality: 0.92,
    title: {
      "zh-CN": "二次函数顶点式 y = a(x - h)² + k、对称轴与最值",
      "zh-TW": "二次函數頂點式 y = a(x - h)² + k 與拋物線極值",
      en: "Quadratic Functions, Vertex Form & Parabola Optimization",
      ja: "二次関数のグラフ・頂点・軸と最大最小（数I）",
      ko: "이차함수의 그래프(꼭짓점·대칭축·최댓값과 최솟값)",
      ms: "Fungsi Kuadratik, Bentuk Verteks & Nilai Optimum",
    },
    description: {
      "zh-CN": "通过配方将一般式转化为顶点式 y = a(x - h)² + k，确定开口方向、顶点 (h, k)、对称轴 x = h 及区间最值。",
      en: "Convert quadratics to vertex form y = a(x - h)^2 + k to read opening direction, vertex (h, k), axis of symmetry, and extrema.",
    },
    masteryCriteria: [
      { "zh-CN": "由 y = a(x - h)² + k 准确读出顶点坐标 (h, k)，不把括号内负号看反成 (-h, k)", en: "Read vertex coordinates accurately as (h, k) from y = a(x - h)^2 + k" },
      { "zh-CN": "结合开口方向（a > 0 有最小值 k，a < 0 有最大值 k）解决面积/利润最优化建模", en: "Solve area/profit optimization problems using parabola vertex properties" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：投篮抛物线写成 y = -(x - 3)² + 5 时，篮球在水平距离几米处飞到最高点？最高点是几米？",
      en: "Ask: If a basketball's arc follows y = -(x - 3)² + 5, at what horizontal distance x does it peak, and what is the peak height?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "因为平方项 (x - h)² ≥ 0 永远非负：当 x = h 时平方项归零，函数刚好取到顶点极值 k！这就是为什么括号里是减号时顶点横坐标是 +h。",
        en: "Since (x - h)² ≥ 0 vanishes precisely at x = h, the vertex sits at (+h, k), not (-h, k)!",
      },
      coreFormula: "$y = a(x - h)^2 + k \\implies \\text{Vertex } (h, k), \\; x = h$",
      visualType: "parabola",
      steps: [
        {
          title: { "zh-CN": "令括号归零找对称轴与顶点横坐标", en: "Set Squared Term to Zero to Find h" },
          body: { "zh-CN": "对于 y = 2(x + 3)² - 4，令 x + 3 = 0 得 h = -3，故顶点为 (-3, -4)，开口向上有最小值 -4。", en: "In y = 2(x + 3)² - 4, setting x + 3 = 0 gives h = -3, so the vertex is (-3, -4) with minimum -4." },
          checkQuestion: { "zh-CN": "二次函数 y = -(x - 4)² + 9 的最大值是多少？", en: "What is the maximum value of y = -(x - 4)² + 9?" },
          checkAnswer: "9",
        },
      ],
      misconceptions: [
        {
          tag: "misc_vertex_h_sign",
          label: { "zh-CN": "读顶点式 y = a(x - h)² + k 时把横坐标符号读反", en: "Reversing the sign of h when reading the vertex from y = a(x - h)^2 + k" },
          wrongPattern: { "zh-CN": "把 y = 2(x - 3)² + 5 的顶点读成 (-3, 5)", en: "Reading the vertex of y = 2(x - 3)^2 + 5 as (-3, 5) instead of (3, 5)" },
          remediationTip: { "zh-CN": "想“谁让括号等于 0”：x = 3 时 (x - 3)² = 0，所以顶点横坐标是 +3！", en: "Ask 'what x makes (x - 3) zero?' x = +3!" },
        },
      ],
    },
    generatorKey: "math_quad_parabola",
    regionalCodeOverrides: {
      CN: { grade: 9, code: "cms-2022:4.NA.12", chapter: "九上 第二十四章 二次函数", edition: "人教版 2024 审定" },
      HK: { grade: 10, code: "HK-DSE-Comp-NA4", chapter: "S4 Functions and Graphs (二次函數頂點與極值)", edition: "HKDSE Compulsory" },
      TW: { grade: 9, code: "108-Math:F-9-1", chapter: "國中九下 二次函數的圖形與極值", edition: "108課綱" },
      SG: { grade: 9, code: "SG-MOE-S3-A3.2", chapter: "Sec 3 Quadratic Functions & Sketching Graphs via Completing the Square", edition: "MOE E/A-Math" },
      MY: { grade: 10, code: "MY-KSSM-T4-AddM-2.3", chapter: "Form 4 Additional Math: Quadratic Functions Vertex", edition: "DSKP KSSM" },
      JP: { grade: 10, code: "JP-MEXT-845030I2", chapter: "高1（数学I）二次関数とグラフ・最大最小", edition: "高校学習指導要領" },
      KR: { grade: 9, code: "KR-2022:[9수02-17]", chapter: "중3 이차함수와 그 그래프 / 고1 최대·최소", edition: "2022 개정 교육과정" },
      UK: { grade: 10, code: "UK-GCSE-Higher-A11", chapter: "GCSE Higher: Turning Points of Quadratic Graphs", edition: "Edexcel / AQA GCSE" },
      US: { grade: 9, code: "CCSS.MATH.HSF.IF.C.8a", chapter: "Algebra 1 Extreme Values & Symmetry of Quadratics", edition: "Common Core" },
    },
  },
  {
    id: "mt_math_trig_right_triangle",
    subjectId: "math",
    domain: "Geometry & Measurement",
    domainI18n: { "zh-CN": "图形与几何", "zh-TW": "空間與形狀", en: "Geometry & Measurement", ja: "図形と計量", ko: "도형과 측정", ms: "Sukatan & Geometri" },
    cognitiveType: "application",
    baselineGrade: 9,
    centrality: 0.86,
    title: {
      "zh-CN": "锐角三角函数（sin / cos / tan）与解直角三角形",
      "zh-TW": "銳角三角比（sin / cos / tan）與直角三角形應用",
      en: "Right-Triangle Trigonometry (SOH-CAH-TOA) & Special Angles",
      ja: "三角比（正弦・余弦・正接）と直角三角形の計量",
      ko: "삼각비(sin, cos, tan)의 뜻과 활용",
      ms: "Nisbah Trigonometri (sin, kos, tan)",
    },
    description: {
      "zh-CN": "理解正弦、余弦、正切是随角度唯一确定的边长比值，熟记 30°/45°/60° 特殊角三角函数值并用于仰角俯角与力学分解。",
      en: "Define sine, cosine, and tangent ratios in right triangles, recall 30°/45°/60° exact values, and resolve vectors/heights.",
    },
    masteryCriteria: [
      { "zh-CN": "随所选锐角 θ 改变准确切换“对边（Opposite）”与“邻边（Adjacent）”", en: "Switch Opposite and Adjacent legs accurately relative to the chosen acute angle θ" },
      { "zh-CN": "熟记 sin 30° = 1/2, cos 60° = 1/2, tan 45° = 1 等特殊角精确值", en: "Recall exact trigonometric values for 30°, 45°, and 60°" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：站在地面离铁塔 30 米远抬头看塔顶仰角 45°，不用爬塔怎么立刻知道塔有多高？",
      en: "Ask: Standing 30m from a tower and looking up at 45°, how do you know the tower's height instantly without climbing it?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "角度一旦固定，直角三角形无论放大缩小多少倍都是相似三角形，所以“对边/斜边（sin）”等比值永远恒定！",
        en: "All right triangles sharing an acute angle θ are similar, keeping side ratios (SOH-CAH-TOA) invariant across scales.",
      },
      coreFormula: "$\\sin\\theta = \\frac{\\text{Opp}}{\\text{Hyp}}, \\quad \\cos\\theta = \\frac{\\text{Adj}}{\\text{Hyp}}, \\quad \\tan\\theta = \\frac{\\text{Opp}}{\\text{Adj}}$",
      visualType: "right_triangle",
      steps: [
        {
          title: { "zh-CN": "先标斜边，再对着角 θ 找对边", en: "Label Hypotenuse First, Then Opposite to θ" },
          body: { "zh-CN": "在物理斜面分解重力 mg 时，沿斜面向下分力为 mg·sin θ，垂直斜面分力为 mg·cos θ。", en: "On an inclined plane of angle θ, gravity mg splits into mg·sin θ (parallel) and mg·cos θ (normal)." },
          checkQuestion: { "zh-CN": "在 Rt△ABC 中，∠C=90°，斜边 AB=10，∠A=30°，则对边 BC 的长是多少？", en: "In right △ABC (∠C=90°), hypotenuse AB=10 and ∠A=30°. Find opposite leg BC." },
          checkAnswer: "5",
        },
      ],
      misconceptions: [
        {
          tag: "misc_trig_swap_sin_cos",
          label: { "zh-CN": "混淆对边与邻边，把 sin θ 与 cos θ 用反", en: "Swapping Opposite and Adjacent legs (confusing sin θ and cos θ)" },
          wrongPattern: { "zh-CN": "已知斜边 10 和 ∠A=30°，求对边错用 cos 30°", en: "Using adjacent/hypotenuse instead of opposite/hypotenuse" },
          remediationTip: { "zh-CN": "从角 θ 的顶点射出一支箭：正对的那条边才是对边（sin），挨在角旁边的直角边是邻边（cos）！", en: "Shoot an arrow from angle θ across the triangle—the side it hits is Opposite (sin)!" },
        },
      ],
    },
    generatorKey: "math_trig_right",
    regionalCodeOverrides: {
      CN: { grade: 9, code: "cms-2022:4.GG.22", chapter: "九下 锐角三角函数与解直角三角形", edition: "人教版 2024 审定" },
      HK: { grade: 8, code: "HK-EDB-KS3-MG5", chapter: "S2–S3 Trigonometric Ratios (三角比)", edition: "EDB 初中數學" },
      TW: { grade: 9, code: "108-Math:S-9-4", chapter: "國中九上 直角三角形的邊角關係 / 高一三角比", edition: "108課綱" },
      SG: { grade: 8, code: "SG-MOE-S2-G3.1", chapter: "Sec 2–3 Trigonometric Ratios of Acute Angles", edition: "MOE G3 Math" },
      MY: { grade: 9, code: "MY-KSSM-T3-5.1", chapter: "Form 3 Nisbah Trigonometri", edition: "DSKP KSSM" },
      JP: { grade: 10, code: "JP-MEXT-845030I3", chapter: "高1（数学I）図形と計量（三角比）", edition: "高校学習指導要領" },
      KR: { grade: 9, code: "KR-2022:[9수03-09]", chapter: "중3 삼각비", edition: "2022 개정 교육과정" },
      UK: { grade: 9, code: "UK-NC-KS3-G20", chapter: "Year 9 (KS3) Right-Angled Trigonometry (SOHCAHTOA)", edition: "England NC KS3" },
      US: { grade: 10, code: "CCSS.MATH.HSG.SRT.C.8", chapter: "Geometry Trigonometric Ratios & Right Triangles", edition: "Common Core" },
    },
  },
  {
    id: "mt_math_calc_derivative_tangent",
    subjectId: "math",
    domain: "Functions",
    domainI18n: { "zh-CN": "函数与微积分", "zh-TW": "微積分初步", en: "Calculus & Functions", ja: "微分・積分", ko: "미적분", ms: "Kalkulus" },
    cognitiveType: "reasoning",
    baselineGrade: 11,
    centrality: 0.83,
    title: {
      "zh-CN": "瞬时变化率、幂函数求导法则与曲线切线极值",
      "zh-TW": "導數、多項式微分法則與切線斜率極值",
      en: "Instantaneous Rate of Change, Power Rule Derivatives & Extrema",
      ja: "微分係数・導関数と接線・極値（数学II）",
      ko: "미분계수와 도함수, 접선의 기울기와 극값",
      ms: "Pembezaan, Kecerunan Tangen & Nilai Ekstremum",
    },
    description: {
      "zh-CN": "从割线斜率 Δy/Δx 极限理解导数 f'(x₀) 的切线几何意义，掌握多项式求导法则判定单调区间与极值。",
      en: "Interpret derivatives as tangent slopes, differentiate polynomials via the power rule, and locate local extrema where f'(x) = 0.",
    },
    masteryCriteria: [
      { "zh-CN": "准确运用 (xⁿ)' = n·xⁿ⁻¹ 求导（常数项导数为 0）并计算指定点切线斜率", en: "Differentiate polynomial terms using d/dx(x^n) = n·x^(n-1) and constants → 0" },
      { "zh-CN": "通过解 f'(x) = 0 并检查导数变号求出函数极大值/极小值", en: "Find critical points f'(x) = 0 and verify sign change for local extrema" },
    ],
    homeCheckPrompt: {
      "zh-CN": "问孩子：汽车仪表盘上指着的“时速 80 公里”，和用总路程除以总时间算出来的速度有什么本质区别？",
      en: "Ask: How does your car speedometer's instant reading of 80 km/h differ from total distance divided by total trip time?",
    },
    microLesson: {
      intuition: {
        "zh-CN": "一次函数的斜率处处相同；弯曲曲线每一点陡峭度都在变，把两点间距 Δx 缩到无穷小，割线斜率就变成了该点的切线斜率 f'(x)！",
        en: "Zooming in on any smooth curve makes it look locally straight; the derivative f'(x) measures that local slope.",
      },
      coreFormula: "$(x^n)' = n x^{n-1}, \\quad k_{\\text{tan}} = f'(x_0)$",
      steps: [
        {
          title: { "zh-CN": "指数搬下来乘系数，原指数减 1，常数归 0", en: "Bring Power Down, Subtract 1, Constants Vanish" },
          body: { "zh-CN": "对 f(x) = x³ - 3x + 2 求导得 f'(x) = 3x² - 3；在 x = 2 处切线斜率为 3(4) - 3 = 9。", en: "For f(x) = x³ - 3x + 2, f'(x) = 3x² - 3; at x = 2 the tangent slope is 3(4) - 3 = 9." },
          checkQuestion: { "zh-CN": "函数 f(x) = x² - 4x + 7 在 x = 3 处的切线斜率 f'(3) 是多少？", en: "Find the tangent slope f'(3) of f(x) = x² - 4x + 7." },
          checkAnswer: "2",
        },
      ],
      misconceptions: [
        {
          tag: "misc_deriv_const_keep",
          label: { "zh-CN": "求导时忘记常数项导数为 0（把常数项原样保留）", en: "Keeping standalone constant terms instead of differentiating them to 0" },
          wrongPattern: { "zh-CN": "把 (x² + 5)' 错算成 2x + 5", en: "Differentiating x^2 + 5 as 2x + 5 instead of 2x" },
          remediationTip: { "zh-CN": "常数 +5 只是把整条曲线上下平移，丝毫不改变任何一点的倾斜度（斜率），所以常数的导数必为 0！", en: "Adding +5 shifts the graph vertically without tilting it anywhere—so its rate of change is 0!" },
        },
      ],
    },
    generatorKey: "math_derivative",
    regionalCodeOverrides: {
      CN: { grade: 11, code: "cms-2017:H.FUN.20", chapter: "选必二 第五章 一元函数的导数及其应用", edition: "人教 A 版 2019" },
      HK: { grade: 11, code: "HK-DSE-M1M2-C2", chapter: "S5 HKDSE M1/M2 Differentiation & Applications", edition: "HKDSE Extended M1/M2" },
      TW: { grade: 12, code: "108-Math:F-12甲-2", chapter: "高三選修數學甲 微分與導函數應用", edition: "108課綱" },
      SG: { grade: 10, code: "SG-MOE-S4-AM-C1", chapter: "Sec 4 Additional Math: Differentiation & Stationary Points (O-Level 4049)", edition: "MOE A-Math" },
      MY: { grade: 11, code: "MY-KSSM-T5-AddM-2.2", chapter: "Form 5 Add Math: Pembezaan (Differentiation)", edition: "DSKP KSSM SPM" },
      JP: { grade: 11, code: "JP-MEXT-845030II5", chapter: "高2（数学II）微分法の考え（導関数と極値）", edition: "高校学習指導要領" },
      KR: { grade: 11, code: "KR-2022:[12미적I-02]", chapter: "고2 미적분I 미분계수와 도함수", edition: "2022 개정 교육과정" },
      UK: { grade: 12, code: "UK-ALevel-Math-Pure-Y12", chapter: "A-Level Maths Pure Year 12: Differentiation & Stationary Points", edition: "Edexcel / AQA A-Level Maths" },
      US: { grade: 12, code: "AP-CALC-CHA-2.2", chapter: "AP Calculus AB Defining & Applying Derivatives", edition: "College Board AP" },
    },
  },
];
