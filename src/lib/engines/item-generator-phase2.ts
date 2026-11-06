import type { DifficultyTier } from "@/types/taxonomy";
import type { DeterministicRng, RawGeneratedCore } from "./item-generator";

/**
 * Parameterized Generators for Phase 2's 20 New All-Subject Canonical Micro-Topics
 * (Chemistry, Biology, Computing, English, Geography, History, and Literacy/Critical Reading)
 */
export function generatePhase2Core(
  generatorKey: string,
  rng: DeterministicRng,
  _dTier: DifficultyTier
): RawGeneratedCore | null {
  switch (generatorKey) {
    // 31. Chemistry: Atomic shells & ionic electrons
    case "chem_atomic_shells": {
      const ions = [
        { nameZh: "钠离子 Na⁺", sym: "Na^+", z: 11, charge: 1 },
        { nameZh: "镁离子 Mg²⁺", sym: "Mg^{2+}", z: 12, charge: 2 },
        { nameZh: "铝离子 Al³⁺", sym: "Al^{3+}", z: 13, charge: 3 },
        { nameZh: "钙离子 Ca²⁺", sym: "Ca^{2+}", z: 20, charge: 2 },
        { nameZh: "氧离子 O²⁻", sym: "O^{2-}", z: 8, charge: -2 },
        { nameZh: "氯离子 Cl⁻", sym: "Cl^-", z: 17, charge: -1 },
      ] as const;
      const item = rng.pick(ions);
      const ans = item.z - item.charge;
      const signFlipTrap = item.z + item.charge;
      return {
        promptZh: `已知元素原子序数（质子数）$Z = ${item.z}$，当该原子形成稳定离子 $${item.sym}$（${item.nameZh}）后，核外一共还有多少个电子？`,
        promptEn: `An element has atomic number (protons) $Z = ${item.z}$. How many electrons surround the nucleus in its ion $${item.sym}$?`,
        latexFormula: `N_{e^-} = Z - q = ${item.z} - (${item.charge})`,
        answer: `${ans}`,
        explanationZh: `原子得失电子时质子数 $Z=${item.z}$ 不变；离子电荷 $q = ${item.charge > 0 ? `+${item.charge}` : item.charge}$，故核外电子数 $N_{e^-} = Z - q = ${ans}$（切勿把符号弄反错算成 ${signFlipTrap}）。`,
        explanationEn: `Protons stay fixed at ${item.z}; electron count = Z - charge = ${item.z} - (${item.charge}) = ${ans}.`,
        scaffolds: [
          { promptZh: `中性原子时核外电子数等于质子数，是多少？`, promptEn: `Neutral electron count (= Z):`, hintZh: `等于 Z`, hintEn: `Equals Z`, expectedAnswer: `${item.z}` },
          { promptZh: `形成 $${item.sym}$ 后电子增减调整，最终电子数为？`, promptEn: `Adjust for ionic charge:`, hintZh: `阳离子减电子，阴离子加电子`, hintEn: `Z - q`, expectedAnswer: `${ans}` },
        ],
        distractors: [
          { text: `${signFlipTrap}`, misconceptionTag: "misc_chem_ion_sign_flip" },
          { text: `${item.z}` },
          { text: `${Math.abs(item.charge)}` },
        ],
        misconceptionsByValue: { [`${signFlipTrap}`]: "misc_chem_ion_sign_flip" },
      };
    }

    // 32. Chemistry: Oxidation state & zero-sum rule
    case "chem_valence_formula": {
      const compounds = [
        { formula: "KMnO_4", plain: "KMnO₄", target: "Mn", hOrMetal: "+1 (K)", hSum: 1, oCount: 4, ans: 7, ignoreSubTrap: 1 },
        { formula: "H_2SO_4", plain: "H₂SO₄", target: "S", hOrMetal: "+1 (H)", hSum: 2, oCount: 4, ans: 6, ignoreSubTrap: 1 },
        { formula: "HNO_3", plain: "HNO₃", target: "N", hOrMetal: "+1 (H)", hSum: 1, oCount: 3, ans: 5, ignoreSubTrap: 1 },
        { formula: "Na_2CO_3", plain: "Na₂CO₃", target: "C", hOrMetal: "+1 (Na)", hSum: 2, oCount: 3, ans: 4, ignoreSubTrap: 0 },
        { formula: "KClO_3", plain: "KClO₃", target: "Cl", hOrMetal: "+1 (K)", hSum: 1, oCount: 3, ans: 5, ignoreSubTrap: 1 },
      ] as const;
      const c = rng.pick(compounds);
      return {
        promptZh: `根据化合物正负化合价代数和为 $0$ 法则，已知氧为 $-2$ 价、${c.hOrMetal}，求 $${c.formula}$（${c.plain}）中中心元素 $\\text{${c.target}}$ 的化合价数值（如 +6 填 6）：`,
        promptEn: `Using the zero-sum oxidation rule (with O = -2 and ${c.hOrMetal}), find the oxidation state of ${c.target} in $${c.formula}$:`,
        latexFormula: `(+${c.hSum}) + x + ${c.oCount}\\times(-2) = 0`,
        answer: `${c.ans}`,
        acceptedEquivalents: [`+${c.ans}`],
        explanationZh: `列零和方程：$(+${c.hSum}) + x + ${c.oCount}\\times(-2) = 0 \\implies x = +${c.ans}$。注意氧原子角标 ${c.oCount} 必须乘上 $-2$！`,
        explanationEn: `(+${c.hSum}) + x + ${c.oCount}(-2) = 0 ⇒ x = +${c.ans}.`,
        scaffolds: [
          { promptZh: `${c.oCount} 个氧原子贡献的总负价是多少？`, promptEn: `Total negative charge from ${c.oCount} oxygen atoms:`, hintZh: `${c.oCount} × (-2)`, hintEn: `${c.oCount} × (-2)`, expectedAnswer: `${-2 * c.oCount}` },
          { promptZh: `解出中心元素 ${c.target} 的正化合价 x = ?`, promptEn: `Solve for x:`, hintZh: `${2 * c.oCount} - ${c.hSum}`, hintEn: `${2 * c.oCount} - ${c.hSum}`, expectedAnswer: `${c.ans}` },
        ],
        distractors: [
          { text: `${c.ignoreSubTrap}`, misconceptionTag: "misc_chem_valence_ignore_sub" },
          { text: `${2 * c.oCount}` },
          { text: `${-c.ans}` },
        ],
        misconceptionsByValue: { [`${c.ignoreSubTrap}`]: "misc_chem_valence_ignore_sub" },
      };
    }

    // 33. Chemistry: Molarity & dilution c1*V1 = c2*V2
    case "chem_molarity_dilution": {
      const moles = rng.pick([0.2, 0.5, 1.0, 1.5]);
      const volMl = rng.pick([200, 250, 500]);
      const volL = volMl / 1000;
      const molarity = Math.round((moles / volL) * 100) / 100;
      const mlTrap = moles / volMl;
      return {
        promptZh: `将 $n = ${moles}\\text{ mol}$ 的溶质完全溶解并定容成 $V = ${volMl}\\text{ mL}$ 溶液，求该溶液的物质的量浓度 $c$（单位 $\\text{mol/L}$）：`,
        promptEn: `If $n = ${moles}\\text{ mol}$ of solute is dissolved to make $V = ${volMl}\\text{ mL}$ of solution, find its molarity $c$ (in $\\text{mol/L}$):`,
        latexFormula: `c = \\frac{n}{V\\,(\\text{L})}`,
        answer: `${molarity}`,
        unit: "mol/L",
        explanationZh: `先将体积换算为升：$V = ${volMl}\\text{ mL} = ${volL}\\text{ L}$；再算 $c = ${moles} / ${volL} = ${molarity}\\text{ mol/L}$（切忌不换算单位直接除以 ${volMl} 得 ${mlTrap}）。`,
        explanationEn: `Convert ${volMl} mL = ${volL} L first; then c = ${moles} / ${volL} = ${molarity} mol/L.`,
        scaffolds: [
          { promptZh: `先把 ${volMl} mL 除以 1000 换算成多少 L？`, promptEn: `Convert ${volMl} mL to L:`, hintZh: `${volMl} ÷ 1000`, hintEn: `Divide by 1000`, expectedAnswer: `${volL}` },
          { promptZh: `计算 c = ${moles} ÷ ${volL} = ?`, promptEn: `Compute ${moles} / ${volL}:`, hintZh: `单位 mol/L`, hintEn: `In mol/L`, expectedAnswer: `${molarity}` },
        ],
        distractors: [
          { text: `${mlTrap}`, misconceptionTag: "misc_chem_ml_not_liter" },
          { text: `${Math.round(moles * volL * 100) / 100}` },
          { text: `${molarity * 10}` },
        ],
        misconceptionsByValue: { [`${mlTrap}`]: "misc_chem_ml_not_liter" },
      };
    }

    // 34. Biology: Osmosis water movement & potato strip mass
    case "bio_osmosis_mass": {
      const cellConc = rng.pick([2, 3, 4]);
      const extConc = rng.pick([8, 10, 12]);
      const initMass = rng.int(10, 20);
      const delta = rng.pick([1, 2]);
      // Since external sucrose (extConc%) > cell sap (cellConc%), water exits cell -> mass decreases to initMass - delta!
      const finalMass = initMass - delta;
      const gainTrap = initMass + delta;
      return {
        promptZh: `某马铃薯细胞液浓度相当于 $${cellConc}\\%$ 蔗糖溶液。将初始质量为 $${initMass}\\text{ g}$ 的马铃薯条浸入 $${extConc}\\%$ 的高浓度蔗糖溶液中一段时间，测得跨膜净移动水质量为 $${delta}\\text{ g}$。此时马铃薯条的质量变为多少 $\\text{g}$？`,
        promptEn: `Potato tissue (internal sap $\\approx ${cellConc}\\%$ sucrose, initial mass $${initMass}\\text{ g}$) is immersed in a hypertonic $${extConc}\\%$ sucrose solution, causing $${delta}\\text{ g}$ of osmotic water movement. Find its new mass (in $\\text{g}$):`,
        answer: `${finalMass}`,
        unit: "g",
        explanationZh: `外界溶液浓度（$${extConc}\\%$）高于细胞液（$${cellConc}\\%$），水分子顺水势梯度向细胞外渗透流失，马铃薯条失水质量减小为 $${initMass} - ${delta} = ${finalMass}\\text{ g}$。`,
        explanationEn: `Since external ${extConc}% > internal ${cellConc}% (hypertonic), water exits the cells by osmosis, reducing mass to ${initMass} - ${delta} = ${finalMass} g.`,
        scaffolds: [
          { promptZh: `外界 ${extConc}% 比细胞内 ${cellConc}% 更浓，细胞是失水减重还是吸水增重？（失水则用 ${initMass} 减 ${delta}）`, promptEn: `Hypertonic outside means water leaves the cell. Compute ${initMass} - ${delta}:`, hintZh: `${initMass} - ${delta}`, hintEn: `${initMass} - ${delta}`, expectedAnswer: `${finalMass}` },
        ],
        distractors: [
          { text: `${gainTrap}`, misconceptionTag: "misc_bio_osmosis_reverse" },
          { text: `${initMass}` },
          { text: `${extConc - cellConc}` },
        ],
        misconceptionsByValue: { [`${gainTrap}`]: "misc_bio_osmosis_reverse" },
      };
    }

    // 35. Biology: Net vs Gross Photosynthesis
    case "bio_photo_net_gross": {
      const rDark = rng.int(3, 7);
      const pNet = rng.int(9, 18);
      const pGross = pNet + rDark;
      const subTrap = pNet - rDark;
      return {
        promptZh: `密闭透光叶室实验测得：某植物在完全黑暗下 $\\text{O}_2$ 吸收速率（呼吸速率）为 $${rDark}\\text{ mg/h}$；在适宜光照下叶室 $\\text{O}_2$ 净增加速率（净光合速率）为 $${pNet}\\text{ mg/h}$。求该光照下叶绿体的真（总）光合产氧速率（$\\text{mg/h}$）：`,
        promptEn: `A plant consumes $${rDark}\\text{ mg/h}$ of $\\text{O}_2$ in darkness (respiration) and shows a net $\\text{O}_2$ release of $${pNet}\\text{ mg/h}$ in light. Find its gross photosynthetic $\\text{O}_2$ production rate ($\\text{mg/h}$):`,
        latexFormula: `P_{\\text{gross}} = P_{\\text{net}} + R_{\\text{resp}}`,
        answer: `${pGross}`,
        unit: "mg/h",
        explanationZh: `光照下呼吸作用照常进行，真光合速率 $P_{\\text{gross}} = P_{\\text{net}} + R = ${pNet} + ${rDark} = ${pGross}\\text{ mg/h}$（切忌误减得 ${subTrap}）。`,
        explanationEn: `Gross photosynthesis = Net O₂ release + Dark respiration = ${pNet} + ${rDark} = ${pGross} mg/h.`,
        scaffolds: [
          { promptZh: `叶绿体除了向外净释放 ${pNet}，还要供给自身线粒体呼吸消耗的 ${rDark}，两者相加是多少？`, promptEn: `Add P_net + R (${pNet} + ${rDark}):`, hintZh: `${pNet} + ${rDark}`, hintEn: `${pNet} + ${rDark}`, expectedAnswer: `${pGross}` },
        ],
        distractors: [
          { text: `${subTrap}`, misconceptionTag: "misc_bio_net_minus_resp" },
          { text: `${pNet}` },
          { text: `${pGross + rDark}` },
        ],
        misconceptionsByValue: { [`${subTrap}`]: "misc_bio_net_minus_resp" },
      };
    }

    // 36. Biology: Trophic energy pyramid 10%-20%
    case "bio_trophic_energy": {
      const topGain = rng.int(1, 4);
      // 3-level chain: Producer -> Primary Consumer -> Secondary Consumer; minimum producer uses 20% (x5 per step -> x25)
      const minProducer = topGain * 25;
      const tenPctTrap = topGain * 100;
      const oneStepTrap = topGain * 5;
      return {
        promptZh: `在食物链“牧草 $\\to$ 野兔 $\\to$ 草原狐”中，相邻营养级能量传递效率为 $10\\%\\sim 20\\%$。若草原狐体重增加 $${topGain}\\text{ kg}$，**至少**需要消耗多少 $\\text{kg}$ 牧草？`,
        promptEn: `In the food chain Grass $\\to$ Rabbit $\\to$ Fox (trophic transfer efficiency $10\\%\\text{–}20\\%$), gaining $${topGain}\\text{ kg}$ of Fox biomass requires **at least** how many $\\text{kg}$ of Grass?`,
        answer: `${minProducer}`,
        unit: "kg",
        explanationZh: `求“至少消耗生产者”取最高传递率 $20\\%$（即每级反推除以 $0.2$ 相当于乘 $5$）：跨越两级需 $${topGain} \\div 20\\% \\div 20\\% = ${topGain} \\times 25 = ${minProducer}\\text{ kg}$。`,
        explanationEn: `Minimum producer corresponds to maximum 20% transfer across 2 steps: ${topGain} / 0.2 / 0.2 = ${minProducer} kg.`,
        scaffolds: [
          { promptZh: `求“至少”应选最高传递效率 20%，先求至少需要多少 kg 野兔（${topGain} ÷ 0.2）？`, promptEn: `At 20% efficiency, kg of Rabbit needed (${topGain} × 5):`, hintZh: `${topGain} × 5`, hintEn: `${topGain} × 5`, expectedAnswer: `${oneStepTrap}` },
          { promptZh: `再反推上一级牧草（${oneStepTrap} ÷ 0.2），至少需要多少 kg 牧草？`, promptEn: `Now multiply by 5 again for Grass:`, hintZh: `${oneStepTrap} × 5`, hintEn: `${oneStepTrap} × 5`, expectedAnswer: `${minProducer}` },
        ],
        distractors: [
          { text: `${tenPctTrap}`, misconceptionTag: "misc_bio_trophic_wrong_bound" },
          { text: `${oneStepTrap}`, misconceptionTag: "misc_bio_trophic_wrong_bound" },
          { text: `${topGain * 10}` },
        ],
        misconceptionsByValue: {
          [`${tenPctTrap}`]: "misc_bio_trophic_wrong_bound",
          [`${oneStepTrap}`]: "misc_bio_trophic_wrong_bound",
        },
      };
    }

    // 37. Computing: Loop accumulator trace
    case "cs_loop_trace": {
      const n = rng.int(4, 8);
      // s = 0; for i in range(1, n): s = s + i  => sum 1..(n-1) = (n-1)*n/2
      const ans = ((n - 1) * n) / 2;
      const offByOneTrap = (n * (n + 1)) / 2;
      return {
        promptZh: `阅读以下 Python 循环代码：\n\`s = 0\`\n\`for i in range(1, ${n}):\`\n\`    s = s + i\`\n程序运行结束后，变量 \`s\` 的值是多少？`,
        promptEn: `Trace the Python snippet:\n\`s = 0\`\n\`for i in range(1, ${n}):\`\n\`    s = s + i\`\nWhat is the final value of \`s\`?`,
        answer: `${ans}`,
        explanationZh: `\`range(1, ${n})\` 左闭右开，\`i\` 依次取 $1, 2, \\dots, ${n - 1}$（不包含 ${n}！），累加得 $s = ${ans}$（误把 ${n} 加进去会错得 ${offByOneTrap}）。`,
        explanationEn: `\`range(1, ${n})\` iterates i = 1 .. ${n - 1}, so s = (${n - 1} × ${n}) / 2 = ${ans}.`,
        scaffolds: [
          { promptZh: `在 range(1, ${n}) 中，变量 i 取到的最后一个整数是多少？`, promptEn: `What is the last integer generated by range(1, ${n})?`, hintZh: `上界减 1`, hintEn: `${n} - 1`, expectedAnswer: `${n - 1}` },
          { promptZh: `将 1 到 ${n - 1} 的所有整数相加，结果 s = ?`, promptEn: `Sum 1 + 2 + ... + ${n - 1}:`, hintZh: `等差求和`, hintEn: `Sum 1..${n - 1}`, expectedAnswer: `${ans}` },
        ],
        distractors: [
          { text: `${offByOneTrap}`, misconceptionTag: "misc_cs_off_by_one_range" },
          { text: `${n - 1}` },
          { text: `${ans - (n - 1)}` },
        ],
        misconceptionsByValue: { [`${offByOneTrap}`]: "misc_cs_off_by_one_range" },
      };
    }

    // 38. Computing: Binary search worst-case comparisons
    case "cs_binary_search": {
      const cases = [
        [7, 3, 4],
        [15, 4, 8],
        [31, 5, 16],
        [63, 6, 32],
        [127, 7, 64],
      ] as const;
      const [n, kAns, halfTrap] = rng.pick(cases);
      return {
        promptZh: `在一个包含 $N = ${n}$ 个互不相同且已按升序排列的数组中使用二分查找（Binary Search）寻找某目标值，最坏情况下最多需要比较多少次元素？`,
        promptEn: `In a sorted array of $N = ${n}$ distinct elements, what is the worst-case (maximum) number of element comparisons needed by binary search?`,
        latexFormula: `C_{\\max}(N) = \\lfloor \\log_2 ${n} \\rfloor + 1`,
        answer: `${kAns}`,
        explanationZh: `每次比较将剩余区间砍半：因 $2^{${kAns}} - 1 = ${n}$，最多只需 $\\lfloor \\log_2 ${n} \\rfloor + 1 = ${kAns}$ 次比较（绝不是线性折半一次算 $N/2 \\approx ${halfTrap}$）。`,
        explanationEn: `Since $2^{${kAns}} - 1 = ${n}$, repeated halving takes at most ${kAns} comparisons.`,
        scaffolds: [
          { promptZh: `计算 2 的几次方等于 ${n + 1}？`, promptEn: `Find k such that 2^k = ${n + 1}:`, hintZh: `2^${kAns} = ${n + 1}`, hintEn: `2^${kAns} = ${n + 1}`, expectedAnswer: `${kAns}` },
        ],
        distractors: [
          { text: `${halfTrap}`, misconceptionTag: "misc_cs_bsearch_half_linear" },
          { text: `${kAns - 1}` },
          { text: `${n}` },
        ],
        misconceptionsByValue: { [`${halfTrap}`]: "misc_cs_bsearch_half_linear" },
      };
    }

    // 39. Computing: Quadratic O(n^2) scaling
    case "cs_complexity_scale": {
      const t0 = rng.int(2, 5);
      const scaleK = rng.pick([2, 3, 4, 5]);
      const ans = t0 * scaleK * scaleK;
      const linearTrap = t0 * scaleK;
      return {
        promptZh: `某双重嵌套循环算法的时间复杂度为 $\\Theta(n^2)$。已知处理规模 $n = 1000$ 的数据集耗时 $${t0}\\text{ s}$，当数据规模扩大为原来的 $${scaleK}$ 倍（即 $n = ${scaleK * 1000}$）时，预计耗时约为多少 $\\text{s}$？`,
        promptEn: `An $\\Theta(n^2)$ nested-loop algorithm takes $${t0}\\text{ s}$ for $n = 1000$. Estimate its runtime (in $\\text{s}$) when input size increases $${scaleK}\\times$ to $n = ${scaleK * 1000}$:`,
        latexFormula: `T(${scaleK}n) \\approx ${scaleK}^2 \\cdot T(n)`,
        answer: `${ans}`,
        unit: "s",
        explanationZh: `二次复杂度 $\\Theta(n^2)$ 耗时与规模平方成正比：规模乘 $${scaleK}$，耗时乘 $${scaleK}^2 = ${scaleK * scaleK}$，故约需 $${t0} \\times ${scaleK * scaleK} = ${ans}\\text{ s}$。`,
        explanationEn: `For O(n²), scaling input by ${scaleK}× scales time by ${scaleK}² = ${scaleK * scaleK}×: ${t0} × ${scaleK * scaleK} = ${ans} s.`,
        scaffolds: [
          { promptZh: `规模扩大 ${scaleK} 倍，平方项 n² 扩大多少倍？`, promptEn: `By what factor does n² grow when n scales by ${scaleK}?`, hintZh: `${scaleK}²`, hintEn: `${scaleK}²`, expectedAnswer: `${scaleK * scaleK}` },
          { promptZh: `乘以原耗时 ${t0} s，预计耗时是多少 s？`, promptEn: `Multiply ${t0} s by ${scaleK * scaleK}:`, hintZh: `${t0} × ${scaleK * scaleK}`, hintEn: `${t0} × ${scaleK * scaleK}`, expectedAnswer: `${ans}` },
        ],
        distractors: [
          { text: `${linearTrap}`, misconceptionTag: "misc_cs_quad_linear_scale" },
          { text: `${t0 + scaleK * scaleK}` },
          { text: `${t0 * scaleK * scaleK * scaleK}` },
        ],
        misconceptionsByValue: { [`${linearTrap}`]: "misc_cs_quad_linear_scale" },
      };
    }

    // 40. English: Subject-Verb Agreement
    case "eng_sva_tense": {
      const items = [
        {
          sentence: "The list of shortlisted candidates ______ posted on the noticeboard every Monday.",
          head: "list (单数)",
          ans: "is",
          trap: "are",
        },
        {
          sentence: "A bouquet of fresh yellow roses ______ sitting on the teacher's desk right now.",
          head: "bouquet (单数)",
          ans: "is",
          trap: "are",
        },
        {
          sentence: "The reliability of these autonomous drones ______ improved dramatically since 2024.",
          head: "reliability (不可数单数)",
          ans: "has",
          trap: "have",
        },
      ] as const;
      const it = rng.pick(items);
      return {
        promptZh: `【主谓一致诊断】剥离介词短语修饰成分，选出语法正确的谓语动词：\n"${it.sentence}"`,
        promptEn: `Choose the verb that agrees with the true head subject:\n"${it.sentence}"`,
        answer: it.ans,
        answerEn: it.ans,
        explanationZh: `将 \`of ...\` 介词短语括起来隐去后，真正的核心主语是 ${it.head}，故谓语必须用单数 \`${it.ans}\`（不能被紧邻的复数宾语带偏选 \`${it.trap}\`）。`,
        explanationEn: `Ignoring the prepositional phrase, the singular head noun requires "${it.ans}" rather than "${it.trap}".`,
        scaffolds: [
          { promptZh: `去掉 of 后面的复数修饰词，主语中心词是单数还是复数？应选 ${it.ans}。`, promptEn: `The head noun before 'of' is singular, requiring "${it.ans}".`, hintZh: `单数谓语`, hintEn: `Singular verb`, expectedAnswer: it.ans },
        ],
        distractors: [
          { text: it.trap, textEn: it.trap, misconceptionTag: "misc_eng_proximity_trap" },
          { text: "were", textEn: "were" },
          { text: "be", textEn: "be" },
        ],
      };
    }

    // 41. English: Participle voice (-ing vs -ed)
    case "eng_participle_voice": {
      const items = [
        {
          sentence: "______ from the orbit of Mars, Earth looks like a pale blue dot.",
          subj: "Earth（被观测）",
          ans: "Seen",
          trap: "Seeing",
        },
        {
          sentence: "______ with traditional incandescent bulbs, LED lamps consume 80% less energy.",
          subj: "LED lamps（被拿来比较）",
          ans: "Compared",
          trap: "Comparing",
        },
        {
          sentence: "______ by three high-school students, the solar boat won first prize.",
          subj: "the solar boat（被设计）",
          ans: "Designed",
          trap: "Designing",
        },
      ] as const;
      const it = rng.pick(items);
      return {
        promptZh: `【非谓语分词逻辑主语辨析】选择正确的分词形式补全句子：\n"${it.sentence}"`,
        promptEn: `Select the non-finite participle that matches the main clause's subject:\n"${it.sentence}"`,
        answer: it.ans,
        answerEn: it.ans,
        explanationZh: `句首分词逻辑主语等于逗号后的主句主语 ${it.subj}，二者为被动承受关系，必须用过去分词 \`${it.ans}\`（选 \`${it.trap}\` 会造成悬垂分词错误）。`,
        explanationEn: `The main-clause subject receives the action passively, requiring "${it.ans}" instead of dangling "${it.trap}".`,
        scaffolds: [
          { promptZh: `看逗号后面的主语 ${it.subj}，它是主动发出动作还是被动承受动作？`, promptEn: `Is the main subject performing or receiving the action?`, hintZh: `被动承受选过去分词`, hintEn: `Passive -> past participle`, expectedAnswer: it.ans },
        ],
        distractors: [
          { text: it.trap, textEn: it.trap, misconceptionTag: "misc_eng_dangling_ing" },
          { text: "To see", textEn: "To see" },
          { text: "Having saw", textEn: "Having saw" },
        ],
      };
    }

    // 42. English: Third conditional counterfactuals
    case "eng_third_conditional": {
      const items = [
        {
          sentence: "If the engineers ______ the backup valve earlier, the pipeline leak would have been prevented.",
          ans: "had tested",
          trap: "would have tested",
        },
        {
          sentence: "If we ______ the earlier express train yesterday, we would have arrived before noon.",
          ans: "had caught",
          trap: "would have caught",
        },
      ] as const;
      const it = rng.pick(items);
      return {
        promptZh: `【过去反事实虚拟条件句】根据主句 \`would have + p.p.\` 选择正确的 \`If\` 从句谓语：\n"${it.sentence}"`,
        promptEn: `Complete the counterfactual third-conditional sentence:\n"${it.sentence}"`,
        answer: it.ans,
        answerEn: it.ans,
        explanationZh: `与过去事实相反的第三类条件句：\`If\` 从句严格用过去完成时 \`${it.ans}\`，严禁在 \`If\` 从句内重复写 \`${it.trap}\`！`,
        explanationEn: `Third conditionals pair "If + had + p.p." (${it.ans}) with "would have + p.p." in the main clause.`,
        scaffolds: [
          { promptZh: `主句已是 would have done，If 从句应搭配什么时态结构？`, promptEn: `What tense belongs inside the If-clause of a 3rd conditional?`, hintZh: `had + 过去分词`, hintEn: `had + past participle`, expectedAnswer: it.ans },
        ],
        distractors: [
          { text: it.trap, textEn: it.trap, misconceptionTag: "misc_eng_if_would_have" },
          { text: "tested", textEn: "tested" },
          { text: "have tested", textEn: "have tested" },
        ],
      };
    }

    // 43. Geography: Tropospheric lapse rate (-0.6°C / 100m)
    case "geo_lapse_rate": {
      const hBase = rng.pick([300, 500, 800]);
      const deltaKm = rng.pick([1.5, 2.0, 2.5, 3.0]);
      const hTop = hBase + deltaKm * 1000;
      const tBase = rng.int(20, 28);
      const drop = Math.round(deltaKm * 6 * 10) / 10;
      const tTop = Math.round((tBase - drop) * 10) / 10;
      const absHTrap = Math.round((tBase - (hTop / 1000) * 6) * 10) / 10;
      return {
        promptZh: `某山地等高线测得山麓甲站海拔 $${hBase}\\text{ m}$，实测气温为 $${tBase}^\\circ\\text{C}$。按照对流层气温垂直递减率（海拔每升高 $100\\text{ m}$ 气温下降 $0.6^\\circ\\text{C}$），推算同一时刻海拔 $${hTop}\\text{ m}$ 山顶乙站的气温（单位 $^\\circ\\text{C}$）：`,
        promptEn: `Station A at $${hBase}\\text{ m}$ elevation records $${tBase}^\\circ\\text{C}$. Using the environmental lapse rate ($-0.6^\\circ\\text{C}$ per $100\\text{ m}$), estimate air temperature ($^\\circ\\text{C}$) at summit Station B ($${hTop}\\text{ m}$):`,
        latexFormula: `T_B = T_A - 0.6 \\times \\frac{${hTop} - ${hBase}}{100}`,
        answer: `${tTop}`,
        unit: "°C",
        explanationZh: `先算两站相对高差 $\\Delta h = ${hTop} - ${hBase} = ${deltaKm * 1000}\\text{ m}$；降温幅度为 $${deltaKm} \\times 6 = ${drop}^\\circ\\text{C}$，故山顶气温为 $${tBase} - ${drop} = ${tTop}^\\circ\\text{C}$（切勿直接拿绝对海拔 ${hTop} m 算得 ${absHTrap}°C）。`,
        explanationEn: `Relative elevation gain Δh = ${hTop - hBase} m → temperature drop = ${drop}°C → summit T = ${tBase} - ${drop} = ${tTop}°C.`,
        scaffolds: [
          { promptZh: `山顶与山麓的相对高度差 ${hTop} - ${hBase} 是多少米？`, promptEn: `Compute elevation difference ${hTop} - ${hBase} (m):`, hintZh: `两站海拔相减`, hintEn: `h_B - h_A`, expectedAnswer: `${hTop - hBase}` },
          { promptZh: `降温 ${drop}°C 后，用 ${tBase} - ${drop} 得山顶气温：`, promptEn: `Subtract ${drop}°C from ${tBase}°C:`, hintZh: `${tBase} - ${drop}`, hintEn: `${tBase} - ${drop}`, expectedAnswer: `${tTop}` },
        ],
        distractors: [
          { text: `${absHTrap}`, misconceptionTag: "misc_geo_lapse_use_abs_h" },
          { text: `${tBase + drop}`, misconceptionTag: "misc_geo_lapse_use_abs_h" },
          { text: `${drop}` },
        ],
        misconceptionsByValue: {
          [`${absHTrap}`]: "misc_geo_lapse_use_abs_h",
          [`${tBase + drop}`]: "misc_geo_lapse_use_abs_h",
        },
      };
    }

    // 44. Geography: Noon solar altitude angle H = 90 - |phi - delta|
    case "geo_solar_angle_climate":
    case "geo_solar_altitude": {
      const latN = rng.pick([30, 35, 40, 45]);
      // Winter solstice in Northern Hemisphere: subsolar point at 23.5°S (-23.5°)
      const latDiff = latN + 23.5;
      const ans = 90 - latDiff; // e.g. latN=40 -> 90 - 63.5 = 26.5
      const sameSignTrap = 90 - Math.abs(latN - 23.5); // e.g. 90 - 16.5 = 73.5 (actually summer solstice!)
      return {
        promptZh: `北半球冬至日（太阳直射南纬 $23.5^\\circ$，即 $\\delta = -23.5^\\circ$），求位于北纬 $${latN}^\\circ$ 某城市的正午太阳高度角 $H$（单位：度）：`,
        promptEn: `On the December solstice (subsolar declination $\\delta = 23.5^\\circ\\text{S}$), calculate the noon solar altitude angle $H$ (in degrees) at latitude $${latN}^\\circ\\text{N}$:`,
        latexFormula: `H = 90^\\circ - |+${latN}^\\circ - (-23.5^\\circ)|`,
        answer: `${ans}`,
        unit: "°",
        explanationZh: `观测地（北纬 $+${latN}^\\circ$）与直射点（南纬 $-23.5^\\circ$）分处南北异半球，纬度差相加为 $${latN}^\\circ + 23.5^\\circ = ${latDiff}^\\circ$，故 $H = 90^\\circ - ${latDiff}^\\circ = ${ans}^\\circ$（若误相减会算成夏至日的 ${sameSignTrap}°）。`,
        explanationEn: `Opposite hemispheres add latitudinal separation: ${latN}° + 23.5° = ${latDiff}°, so H = 90° - ${latDiff}° = ${ans}°.`,
        scaffolds: [
          { promptZh: `北纬 ${latN}° 与南纬 23.5° 跨赤道相隔多少度纬度？`, promptEn: `Total latitude separation (${latN} + 23.5):`, hintZh: `异半球相加`, hintEn: `Add latitudes`, expectedAnswer: `${latDiff}` },
          { promptZh: `用 90° 减去 ${latDiff}°，正午太阳高度角 H = ?`, promptEn: `Compute 90 - ${latDiff}:`, hintZh: `90 - ${latDiff}`, hintEn: `90 - ${latDiff}`, expectedAnswer: `${ans}` },
        ],
        distractors: [
          { text: `${sameSignTrap}`, misconceptionTag: "misc_geo_solar_same_sign" },
          { text: `${latDiff}` },
          { text: `${90 - latN}` },
        ],
        misconceptionsByValue: { [`${sameSignTrap}`]: "misc_geo_solar_same_sign" },
      };
    }

    // 45. History: Quantitative trade balance
    case "his_trade_balance": {
      const exportsVal = rng.int(34, 58) * 10;
      const importsVal = rng.int(18, 31) * 10;
      const surplus = exportsVal - importsVal;
      const totalVolumeTrap = exportsVal + importsVal;
      return {
        promptZh: `【经济史料定量解读】海关档案记载某通商口岸某年度商品出口总额为 $${exportsVal}$ 万银元，商品进口总额为 $${importsVal}$ 万银元。该年度该口岸对外贸易出超（顺差）净额为多少万银元？`,
        promptEn: `[Historical Trade Archives] Customs records show annual exports of $${exportsVal}$ million silver dollars and imports of $${importsVal}$ million. Find the net trade surplus (in millions):`,
        answer: `${surplus}`,
        explanationZh: `贸易顺差（出超）= 出口总额 - 进口总额 = $${exportsVal} - ${importsVal} = ${surplus}$ 万银元（注意区分“贸易总额” $${totalVolumeTrap}$ 与“顺差净额” $${surplus}$）。`,
        explanationEn: `Net trade surplus = Exports - Imports = ${exportsVal} - ${importsVal} = ${surplus}.`,
        scaffolds: [
          { promptZh: `用出口额 ${exportsVal} 减去进口额 ${importsVal} 得顺差：`, promptEn: `Subtract imports ${importsVal} from exports ${exportsVal}:`, hintZh: `出口 - 进口`, hintEn: `Exports - Imports`, expectedAnswer: `${surplus}` },
        ],
        distractors: [
          { text: `${totalVolumeTrap}`, misconceptionTag: "misc_his_share_vs_abs" },
          { text: `${-surplus}`, misconceptionTag: "misc_his_share_vs_abs" },
          { text: `${importsVal}` },
        ],
        misconceptionsByValue: {
          [`${totalVolumeTrap}`]: "misc_his_share_vs_abs",
          [`${-surplus}`]: "misc_his_share_vs_abs",
        },
      };
    }

    // 46. History: Industrial Revolutions & anachronism check
    case "his_industrial_era": {
      const prompts = [
        {
          qZh: "某历史展馆复原“1825年英国第一次工业革命时期城市生活”场景，以下哪项陈列品属于违背史实的**时代错置（穿帮）**？",
          qEn: "In a museum exhibit reconstructing daily life in Britain in 1825 (First Industrial Revolution), which artifact is a historical anachronism?",
          ansZh: "街道上方架设白炽电灯与卡尔·本茨内燃机汽车",
          ansEn: "Incandescent electric streetlamps and Benz gasoline automobiles",
          d1: "用煤炭驱动的瓦特改良蒸汽机抽水装置",
          d2: "斯蒂芬森设计的蒸汽机车在铁轨上试运行",
          d3: "采用水力与蒸汽动力的棉纺织机械化工厂",
        },
        {
          qZh: "关于两次工业革命技术演进特征的比较，下列史学论断最严密的是：",
          qEn: "Which historical statement most accurately contrasts the First and Second Industrial Revolutions?",
          ansZh: "第二次工业革命体现自然科学理论突破（如电磁学）与工业技术发明紧密结合",
          ansEn: "The Second IR tightly coupled scientific theory (e.g., electromagnetism) with industrial R&D",
          d1: "第一次工业革命已普及电力照明与石油化工合成材料",
          d2: "两次工业革命均完全依赖工匠个人经验而无需科学实验室参与",
          d3: "蒸汽机在第二次工业革命后期才首次被引入纺织业",
        },
      ] as const;
      const p = rng.pick(prompts);
      return {
        promptZh: p.qZh,
        promptEn: p.qEn,
        answer: p.ansZh,
        answerEn: p.ansEn,
        explanationZh: `第一次工业革命（18世纪60年代—19世纪中期）以蒸汽与煤为标志；发电机、白炽电灯与内燃机汽车属于19世纪70年代后的第二次工业革命成果。`,
        explanationEn: `Electricity and internal combustion belong to the Second Industrial Revolution (post-1870), not 1825.`,
        scaffolds: [
          { promptZh: `回想 1825 年处于蒸汽时代还是电气/内燃机时代？`, promptEn: `Was 1825 the Steam Age or the Electrical/Oil Age?`, hintZh: `蒸汽时代`, hintEn: `Steam Age`, expectedAnswer: p.ansZh },
        ],
        distractors: [
          { text: p.d1, misconceptionTag: "misc_his_ir_anachronism" },
          { text: p.d2 },
          { text: p.d3 },
        ],
      };
    }

    // 47. Literacy: Main idea vs supporting example
    case "lit_main_claim": {
      return {
        promptZh: `【论述文本主旨提取】阅读以下短段：\n“许多初学者认为刷题数量直接决定数学成绩。**然而**，认知科学追踪表明，缺乏先修概念溯源的机械重复只会固化错误习惯。例如，某校实验班将每日刷题量减半，改为针对错题上游薄弱点做变式清零，期末达标率反而提升了 24%。”\n该段文字的核心论点是：`,
        promptEn: `Identify the author's primary claim in the passage:\n"Many learners assume drill volume determines math achievement. HOWEVER, cognitive research shows rote repetition without prerequisite root-cause remediation merely reinforces misconceptions. For instance, Class A halved daily drills in favor of targeted root-cause variants and raised mastery by 24%."`,
        answer: "精准溯源修复先修薄弱点比单纯堆砌刷题量更能有效提升学业表现",
        answerEn: "Targeted prerequisite remediation is far more effective than sheer drill volume",
        explanationZh: `首句立靶子，“然而”引出全文中心论点；“例如……”中的实验班与 24% 数据只是支撑中心论点的论据案例，不能“以例代主”。`,
        explanationEn: `The sentence right after 'However' states the overarching thesis; Class A's 24% gain is a supporting example.`,
        scaffolds: [
          { promptZh: `定位转折词“然而”之后、“例如”之前的核心判断句！`, promptEn: `Locate the claim right after 'However' and before 'For instance'.`, hintZh: `排除局部实验班例子`, hintEn: `Exclude narrow example`, expectedAnswer: "精准溯源修复先修薄弱点比单纯堆砌刷题量更能有效提升学业表现" },
        ],
        distractors: [
          { text: "某校实验班通过将作业减半使期末达标率提升了 24%", misconceptionTag: "misc_lit_example_as_thesis" },
          { text: "刷题数量越多，学生的数学成绩一定越差" },
          { text: "所有学科都不需要任何练习题" },
        ],
      };
    }

    // 48. Literacy: Evidence-bound inference vs absolutist leap
    case "lit_inference_modality": {
      return {
        promptZh: `【信息推断与限定词审查】原文载：“城市绿道树冠覆盖率每提高 10%，夏季午后地表热岛温度平均可降低约 0.8°C，有助于缓解部分老旧街区的微气候闷热感。”\n根据原文，下列推断**最严密合理**的一项是：`,
        promptEn: `Passage: "Each 10% increase in urban tree-canopy cover lowers afternoon surface temperature by ~0.8°C on average, helping ease heat stress in older neighborhoods."\nWhich inference is strictly supported by the text?`,
        answer: "科学规划并增加城市街道绿化树冠覆盖，是改善局部街区夏季热环境的可行手段之一",
        answerEn: "Expanding street tree canopy is a viable measure to help mitigate local urban heat",
        explanationZh: `原文使用“平均约”“有助于”“部分”，严谨克制；干扰项中“彻底消除”“唯一途径”“所有时段均降温”均犯了或然变必然、范围绝对化的推断错误。`,
        explanationEn: `Valid inferences preserve the passage's hedged scope ('helps', 'on average') rather than inflating to 'eliminates completely' or 'only way'.`,
        scaffolds: [
          { promptZh: `排查四个选项中的绝对化词语（“唯一”“彻底消除”），选出分寸与原文“有助于”一致的一项。`, promptEn: `Reject options with extreme words like 'completely' or 'sole'.`, hintZh: `可行手段之一`, hintEn: `One viable measure`, expectedAnswer: "科学规划并增加城市街道绿化树冠覆盖，是改善局部街区夏季热环境的可行手段之一" },
        ],
        distractors: [
          { text: "只要种树就一定能彻底消除全球所有城市的夏季高温热浪", misconceptionTag: "misc_lit_absolutist_leap" },
          { text: "增加树冠覆盖率是降低城市温度的唯一决定性途径", misconceptionTag: "misc_lit_absolutist_leap" },
          { text: "冬季午夜气温也会随树冠覆盖率增加而下降 0.8°C" },
        ],
      };
    }

    // 49. Literacy: Logical fallacies (Correlation vs Causation / Survivorship bias)
    case "lit_logical_fallacy": {
      return {
        promptZh: `【批判思辨：逻辑谬误诊断】某报告宣称：“统计显示，随身携带打火机的人群患肺癌比例显著高于不带打火机的人群，因此打火机金属外壳辐射会导致肺癌。”\n该论证最核心的逻辑漏洞在于：`,
        promptEn: `[Logical Fallacy Audit] Claim: "People who carry lighters have a much higher lung-cancer rate than those who do not; therefore, lighter metal causes lung cancer."\nWhat is the primary flaw in this reasoning?`,
        answer: "忽略了共同混杂变量“吸烟习惯”，将相关性伴随现象强加为直接因果关系",
        answerEn: "Confusing correlation with causation while ignoring the confounding variable (smoking)",
        explanationZh: `“吸烟”这一第三变量（Confounding Variable）既导致常带打火机，又导致肺癌率升高；原论证犯了典型的“强加因果 / 忽略混杂因素”谬误。`,
        explanationEn: `Smoking is a confounding factor driving both lighter carrying and lung cancer; correlation alone does not prove causation.`,
        scaffolds: [
          { promptZh: `想一想：常带打火机的人通常有什么共同生活习惯，而这个习惯恰恰伤肺？`, promptEn: `What hidden third factor explains both carrying a lighter and lung risk?`, hintZh: `混杂变量：吸烟`, hintEn: `Confounding variable: smoking`, expectedAnswer: "忽略了共同混杂变量“吸烟习惯”，将相关性伴随现象强加为直接因果关系" },
        ],
        distractors: [
          { text: "样本统计人数还不够多，只要扩大样本就能证明打火机致癌", misconceptionTag: "misc_lit_spurious_cause" },
          { text: "没有说明打火机品牌价格差异" },
          { text: "论点完全正确，无任何逻辑瑕疵", misconceptionTag: "misc_lit_spurious_cause" },
        ],
      };
    }

    // 50. Literacy: PISA multi-source text + table synthesis
    case "lit_pisa_synthesis": {
      const limitEnergy = rng.pick([42, 45, 48]);
      return {
        promptZh: `【PISA 多源非连续性文本决策】\n• 政策细则：申请“绿色示范实验室”认证须**同时满足**：① 可再生绿电占比 $\\ge 60\\%$；② 单位算力能耗 $\\le ${limitEnergy}\\text{ W}$。\n• 实测数据表：\n  - 甲馆：绿电占比 $78\\%$，单位能耗 $${limitEnergy + 6}\\text{ W}$\n  - 乙馆：绿电占比 $64\\%$，单位能耗 $${limitEnergy - 3}\\text{ W}$\n  - 丙馆：绿电占比 $55\\%$，单位能耗 $${limitEnergy - 8}\\text{ W}$\n最终哪座场馆符合认证资格？`,
        promptEn: `[Multi-Source Synthesis]\n• Policy Rule: Certification requires BOTH (1) Renewable share $\\ge 60\\%$ AND (2) Energy intensity $\\le ${limitEnergy}\\text{ W}$.\n• Data: Lab A ($78\\%, ${limitEnergy + 6}\\text{ W}$); Lab B ($64\\%, ${limitEnergy - 3}\\text{ W}$); Lab C ($55\\%, ${limitEnergy - 8}\\text{ W}$).\nWhich lab qualifies?`,
        answer: "仅乙馆符合资格",
        answerEn: "Only Lab B qualifies",
        explanationZh: `逐条交叉核验双重约束：甲馆绿电最高但能耗 $${limitEnergy + 6} > ${limitEnergy}$ 超标淘汰；丙馆能耗最低但绿电 $55\\% < 60\\%$ 不达标；唯有乙馆两项指标同时达标！`,
        explanationEn: `Lab A fails Condition 2 (${limitEnergy + 6} > ${limitEnergy}); Lab C fails Condition 1 (55% < 60%); only Lab B satisfies both.`,
        scaffolds: [
          { promptZh: `甲馆绿电 78% 看似最高，但它的第二项指标 ${limitEnergy + 6} W 满足 ≤ ${limitEnergy} W 吗？`, promptEn: `Does Lab A satisfy ≤ ${limitEnergy} W? No — check Lab B on both rules.`, hintZh: `双重条件都打勾才行`, hintEn: `Both conditions must hold`, expectedAnswer: "仅乙馆符合资格" },
        ],
        distractors: [
          { text: "甲馆（因其绿电占比 78% 位居第一）", misconceptionTag: "misc_lit_single_criterion" },
          { text: "丙馆（因其单位能耗最低最节能）", misconceptionTag: "misc_lit_single_criterion" },
          { text: "甲馆与乙馆均符合资格" },
        ],
      };
    }

    default:
      return null;
  }
}
