import type { DifficultyTier, TriLocaleText } from "@/types/taxonomy";
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
        promptI18n: {
          ja: `原子番号（陽子数）$Z = ${item.z}$ の元素がイオン $${item.sym}$ になったとき、電子は何個ありますか。`,
          ko: `원자 번호(양성자 수)가 $Z = ${item.z}$인 원소가 이온 $${item.sym}$이 되었을 때 전자는 몇 개인가?`,
          ms: `Satu unsur mempunyai nombor atom (proton) $Z = ${item.z}$. Berapakah bilangan elektron dalam ion $${item.sym}$?`,
        },
        latexFormula: `N_{e^-} = Z - q = ${item.z} - (${item.charge})`,
        answer: `${ans}`,
        explanationZh: `原子得失电子时质子数 $Z=${item.z}$ 不变；离子电荷 $q = ${item.charge > 0 ? `+${item.charge}` : item.charge}$，故核外电子数 $N_{e^-} = Z - q = ${ans}$（切勿把符号弄反错算成 ${signFlipTrap}）。`,
        explanationEn: `Protons stay fixed at ${item.z}; electron count = Z - charge = ${item.z} - (${item.charge}) = ${ans}.`,
        explanationI18n: {
          ja: `陽子数は ${item.z} のまま変わりません。電子数 = Z - 電荷 = ${item.z} - (${item.charge}) = ${ans}（符号を逆にして ${signFlipTrap} としないこと）。`,
          ko: `양성자 수는 ${item.z}로 변하지 않는다. 전자 수 = Z - 전하 = ${item.z} - (${item.charge}) = ${ans}이다(부호를 반대로 하여 ${signFlipTrap}로 계산하지 않도록 주의).`,
          ms: `Bilangan proton kekal ${item.z}; bilangan elektron = Z - cas = ${item.z} - (${item.charge}) = ${ans} (jangan terbalikkan tanda sehingga mendapat ${signFlipTrap}).`,
        },
        scaffolds: [
          {
            promptZh: `中性原子时核外电子数等于质子数，是多少？`,
            promptEn: `Neutral electron count (= Z):`,
            promptI18n: {
              ja: `中性原子の電子数（= Z）はいくつですか。`,
              ko: `중성 원자의 전자 수(= Z)는?`,
              ms: `Bilangan elektron atom neutral (= Z):`,
            },
            hintZh: `等于 Z`,
            hintEn: `Equals Z`,
            hintI18n: { ja: `Z に等しい`, ko: `Z와 같다`, ms: `Sama dengan Z` },
            expectedAnswer: `${item.z}`,
          },
          {
            promptZh: `形成 $${item.sym}$ 后电子增减调整，最终电子数为？`,
            promptEn: `Adjust for ionic charge:`,
            promptI18n: {
              ja: `$${item.sym}$ になるときの電子の増減を考えると、最終的な電子数はいくつですか。`,
              ko: `$${item.sym}$이 될 때 전자의 증감을 반영하면 최종 전자 수는?`,
              ms: `Laraskan mengikut cas ion $${item.sym}$:`,
            },
            hintZh: `阳离子减电子，阴离子加电子`,
            hintEn: `Z - q`,
            hintI18n: {
              ja: `Z - q（陽イオンは電子を失い、陰イオンは電子を得る）`,
              ko: `Z - q (양이온은 전자를 잃고, 음이온은 전자를 얻는다)`,
              ms: `Z - q (kation kehilangan elektron, anion menerima elektron)`,
            },
            expectedAnswer: `${ans}`,
          },
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
        promptI18n: {
          ja: `化合物中の酸化数の総和は $0$ になるという規則（O = -2、${c.hOrMetal}）を用いて、$${c.formula}$ 中の ${c.target} の酸化数を求めなさい（+6 なら 6 と答える）：`,
          ko: `화합물에서 산화수의 합은 $0$이라는 규칙(O = -2, ${c.hOrMetal})을 이용하여 $${c.formula}$에서 ${c.target}의 산화수를 구하시오(+6이면 6으로 답한다):`,
          ms: `Menggunakan peraturan jumlah sifar nombor pengoksidaan (O = -2 dan ${c.hOrMetal}), cari nombor pengoksidaan ${c.target} dalam $${c.formula}$ (jika +6, tulis 6):`,
        },
        latexFormula: `(+${c.hSum}) + x + ${c.oCount}\\times(-2) = 0`,
        answer: `${c.ans}`,
        acceptedEquivalents: [`+${c.ans}`],
        explanationZh: `列零和方程：$(+${c.hSum}) + x + ${c.oCount}\\times(-2) = 0 \\implies x = +${c.ans}$。注意氧原子角标 ${c.oCount} 必须乘上 $-2$！`,
        explanationEn: `(+${c.hSum}) + x + ${c.oCount}(-2) = 0 ⇒ x = +${c.ans}.`,
        explanationI18n: {
          ja: `総和 0 の式を立てる：(+${c.hSum}) + x + ${c.oCount}(-2) = 0 ⇒ x = +${c.ans}。酸素原子の数 ${c.oCount} に -2 を掛けるのを忘れないこと。`,
          ko: `합이 0인 식을 세운다: (+${c.hSum}) + x + ${c.oCount}(-2) = 0 ⇒ x = +${c.ans}. 산소 원자 수 ${c.oCount}에 -2를 곱하는 것을 잊지 말자.`,
          ms: `Bina persamaan jumlah sifar: (+${c.hSum}) + x + ${c.oCount}(-2) = 0 ⇒ x = +${c.ans}. Ingat untuk mendarab bilangan atom oksigen ${c.oCount} dengan -2.`,
        },
        scaffolds: [
          {
            promptZh: `${c.oCount} 个氧原子贡献的总负价是多少？`,
            promptEn: `Total negative charge from ${c.oCount} oxygen atoms:`,
            promptI18n: {
              ja: `酸素原子 ${c.oCount} 個による負の酸化数の合計はいくつですか。`,
              ko: `산소 원자 ${c.oCount}개가 기여하는 음의 산화수의 합은?`,
              ms: `Jumlah cas negatif daripada ${c.oCount} atom oksigen:`,
            },
            hintZh: `${c.oCount} × (-2)`,
            hintEn: `${c.oCount} × (-2)`,
            expectedAnswer: `${-2 * c.oCount}`,
          },
          {
            promptZh: `解出中心元素 ${c.target} 的正化合价 x = ?`,
            promptEn: `Solve for x:`,
            promptI18n: {
              ja: `中心元素 ${c.target} の酸化数 x を求めなさい：`,
              ko: `중심 원소 ${c.target}의 산화수 x를 구하시오:`,
              ms: `Selesaikan untuk x (nombor pengoksidaan ${c.target}):`,
            },
            hintZh: `${2 * c.oCount} - ${c.hSum}`,
            hintEn: `${2 * c.oCount} - ${c.hSum}`,
            expectedAnswer: `${c.ans}`,
          },
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
        promptI18n: {
          ja: `溶質 $n = ${moles}\\text{ mol}$ を溶かして $V = ${volMl}\\text{ mL}$ の溶液をつくった。この溶液のモル濃度 $c$（単位 $\\text{mol/L}$）を求めなさい：`,
          ko: `용질 $n = ${moles}\\text{ mol}$을 녹여 $V = ${volMl}\\text{ mL}$의 용액을 만들었다. 이 용액의 몰농도 $c$(단위 $\\text{mol/L}$)를 구하시오:`,
          ms: `Jika $n = ${moles}\\text{ mol}$ zat terlarut dilarutkan untuk menghasilkan $V = ${volMl}\\text{ mL}$ larutan, cari kemolarannya $c$ (dalam $\\text{mol/L}$):`,
        },
        latexFormula: `c = \\frac{n}{V\\,(\\text{L})}`,
        answer: `${molarity}`,
        unit: "mol/L",
        explanationZh: `先将体积换算为升：$V = ${volMl}\\text{ mL} = ${volL}\\text{ L}$；再算 $c = ${moles} / ${volL} = ${molarity}\\text{ mol/L}$（切忌不换算单位直接除以 ${volMl} 得 ${mlTrap}）。`,
        explanationEn: `Convert ${volMl} mL = ${volL} L first; then c = ${moles} / ${volL} = ${molarity} mol/L.`,
        explanationI18n: {
          ja: `まず ${volMl} mL = ${volL} L に換算し、c = ${moles} / ${volL} = ${molarity} mol/L となる（換算せずに ${volMl} で割って ${mlTrap} としないこと）。`,
          ko: `먼저 ${volMl} mL = ${volL} L로 환산한 뒤 c = ${moles} / ${volL} = ${molarity} mol/L이다(환산하지 않고 ${volMl}로 나누어 ${mlTrap}을 얻지 않도록 주의).`,
          ms: `Tukar ${volMl} mL = ${volL} L dahulu; kemudian c = ${moles} / ${volL} = ${molarity} mol/L (jangan bahagi terus dengan ${volMl} hingga mendapat ${mlTrap}).`,
        },
        scaffolds: [
          {
            promptZh: `先把 ${volMl} mL 除以 1000 换算成多少 L？`,
            promptEn: `Convert ${volMl} mL to L:`,
            promptI18n: {
              ja: `${volMl} mL を L に換算するといくつですか。`,
              ko: `${volMl} mL를 L로 환산하면?`,
              ms: `Tukar ${volMl} mL kepada L:`,
            },
            hintZh: `${volMl} ÷ 1000`,
            hintEn: `Divide by 1000`,
            hintI18n: { ja: `1000 で割る`, ko: `1000으로 나눈다`, ms: `Bahagi dengan 1000` },
            expectedAnswer: `${volL}`,
          },
          {
            promptZh: `计算 c = ${moles} ÷ ${volL} = ?`,
            promptEn: `Compute ${moles} / ${volL}:`,
            promptI18n: {
              ja: `${moles} / ${volL} を計算しなさい：`,
              ko: `${moles} / ${volL}을 계산하시오:`,
              ms: `Kira ${moles} / ${volL}:`,
            },
            hintZh: `单位 mol/L`,
            hintEn: `In mol/L`,
            hintI18n: { ja: `単位は mol/L`, ko: `단위는 mol/L`, ms: `Dalam mol/L` },
            expectedAnswer: `${molarity}`,
          },
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
        promptI18n: {
          ja: `ジャガイモの組織（細胞液 $\\approx ${cellConc}\\%$ スクロース相当、初めの質量 $${initMass}\\text{ g}$）を高張の $${extConc}\\%$ スクロース溶液に浸したところ、浸透により $${delta}\\text{ g}$ の水が移動した。このときの組織の質量（単位 $\\text{g}$）を求めなさい：`,
          ko: `감자 조직(세포액 $\\approx ${cellConc}\\%$ 설탕 용액에 해당, 처음 질량 $${initMass}\\text{ g}$)을 고장액인 $${extConc}\\%$ 설탕 용액에 담갔더니 삼투에 의해 $${delta}\\text{ g}$의 물이 이동하였다. 이때 감자 조직의 질량(단위 $\\text{g}$)을 구하시오:`,
          ms: `Tisu kentang (sap sel $\\approx ${cellConc}\\%$ sukrosa, jisim awal $${initMass}\\text{ g}$) direndam dalam larutan sukrosa hipertonik $${extConc}\\%$, menyebabkan $${delta}\\text{ g}$ air bergerak secara osmosis. Cari jisim baharunya (dalam $\\text{g}$):`,
        },
        answer: `${finalMass}`,
        unit: "g",
        explanationZh: `外界溶液浓度（$${extConc}\\%$）高于细胞液（$${cellConc}\\%$），水分子顺水势梯度向细胞外渗透流失，马铃薯条失水质量减小为 $${initMass} - ${delta} = ${finalMass}\\text{ g}$。`,
        explanationEn: `Since external ${extConc}% > internal ${cellConc}% (hypertonic), water exits the cells by osmosis, reducing mass to ${initMass} - ${delta} = ${finalMass} g.`,
        explanationI18n: {
          ja: `外液 ${extConc}% > 細胞液 ${cellConc}%（高張）なので、水は浸透によって細胞外へ出ていき、質量は ${initMass} - ${delta} = ${finalMass} g に減少する。`,
          ko: `외부 용액 ${extConc}% > 세포액 ${cellConc}%(고장액)이므로 물이 삼투에 의해 세포 밖으로 빠져나가 질량이 ${initMass} - ${delta} = ${finalMass} g으로 감소한다.`,
          ms: `Oleh sebab larutan luar ${extConc}% > sap sel ${cellConc}% (hipertonik), air keluar dari sel secara osmosis dan jisim berkurang kepada ${initMass} - ${delta} = ${finalMass} g.`,
        },
        scaffolds: [
          {
            promptZh: `外界 ${extConc}% 比细胞内 ${cellConc}% 更浓，细胞是失水减重还是吸水增重？（失水则用 ${initMass} 减 ${delta}）`,
            promptEn: `Hypertonic outside means water leaves the cell. Compute ${initMass} - ${delta}:`,
            promptI18n: {
              ja: `外液が高張なら水は細胞から出ていく。${initMass} - ${delta} を計算しなさい：`,
              ko: `바깥 용액이 고장액이면 물이 세포 밖으로 나간다. ${initMass} - ${delta}를 계산하시오:`,
              ms: `Larutan luar yang hipertonik bermakna air keluar dari sel. Kira ${initMass} - ${delta}:`,
            },
            hintZh: `${initMass} - ${delta}`,
            hintEn: `${initMass} - ${delta}`,
            expectedAnswer: `${finalMass}`,
          },
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
        promptI18n: {
          ja: `ある植物は暗所で $\\text{O}_2$ を $${rDark}\\text{ mg/h}$ 吸収し（呼吸速度）、光を当てると $\\text{O}_2$ を見かけ上 $${pNet}\\text{ mg/h}$ 放出する（見かけの光合成速度）。この光条件での光合成による $\\text{O}_2$ 発生速度（真の光合成速度、$\\text{mg/h}$）を求めなさい：`,
          ko: `어떤 식물은 암실에서 $\\text{O}_2$를 $${rDark}\\text{ mg/h}$ 흡수하고(호흡), 빛을 비추면 $\\text{O}_2$를 $${pNet}\\text{ mg/h}$씩 순방출한다(순광합성). 이 빛 조건에서 총광합성에 의한 $\\text{O}_2$ 생성 속도($\\text{mg/h}$)를 구하시오:`,
          ms: `Sejenis tumbuhan menggunakan $${rDark}\\text{ mg/h}$ $\\text{O}_2$ dalam gelap (respirasi) dan membebaskan $\\text{O}_2$ bersih sebanyak $${pNet}\\text{ mg/h}$ dalam cahaya. Cari kadar penghasilan $\\text{O}_2$ fotosintesis kasar ($\\text{mg/h}$):`,
        },
        latexFormula: `P_{\\text{gross}} = P_{\\text{net}} + R_{\\text{resp}}`,
        answer: `${pGross}`,
        unit: "mg/h",
        explanationZh: `光照下呼吸作用照常进行，真光合速率 $P_{\\text{gross}} = P_{\\text{net}} + R = ${pNet} + ${rDark} = ${pGross}\\text{ mg/h}$（切忌误减得 ${subTrap}）。`,
        explanationEn: `Gross photosynthesis = Net O₂ release + Dark respiration = ${pNet} + ${rDark} = ${pGross} mg/h.`,
        explanationI18n: {
          ja: `光の下でも呼吸は続いているので、真の光合成速度 = 見かけの O₂ 放出速度 + 呼吸速度 = ${pNet} + ${rDark} = ${pGross} mg/h（引き算して ${subTrap} としないこと）。`,
          ko: `빛이 있을 때도 호흡은 계속되므로 총광합성 속도 = 순 O₂ 방출 속도 + 호흡 속도 = ${pNet} + ${rDark} = ${pGross} mg/h이다(빼서 ${subTrap}로 계산하지 않도록 주의).`,
          ms: `Fotosintesis kasar = Pembebasan O₂ bersih + Respirasi dalam gelap = ${pNet} + ${rDark} = ${pGross} mg/h (respirasi tetap berlaku dalam cahaya; jangan tolak hingga mendapat ${subTrap}).`,
        },
        scaffolds: [
          {
            promptZh: `叶绿体除了向外净释放 ${pNet}，还要供给自身线粒体呼吸消耗的 ${rDark}，两者相加是多少？`,
            promptEn: `Add P_net + R (${pNet} + ${rDark}):`,
            promptI18n: {
              ja: `P_net + R（${pNet} + ${rDark}）を計算しなさい：`,
              ko: `P_net + R (${pNet} + ${rDark})를 계산하시오:`,
              ms: `Tambah P_net + R (${pNet} + ${rDark}):`,
            },
            hintZh: `${pNet} + ${rDark}`,
            hintEn: `${pNet} + ${rDark}`,
            expectedAnswer: `${pGross}`,
          },
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
        promptI18n: {
          ja: `食物連鎖「草 $\\to$ ウサギ $\\to$ キツネ」（栄養段階間のエネルギー効率 $10\\%\\text{–}20\\%$）において、キツネの体重が $${topGain}\\text{ kg}$ 増加するには、草が**少なくとも**何 $\\text{kg}$ 必要ですか。`,
          ko: `먹이 사슬 "풀 $\\to$ 토끼 $\\to$ 여우"(영양 단계 간 에너지 전달 효율 $10\\%\\text{–}20\\%$)에서 여우의 몸무게가 $${topGain}\\text{ kg}$ 늘어나려면 풀이 **최소** 몇 $\\text{kg}$ 필요한가?`,
          ms: `Dalam rantai makanan Rumput $\\to$ Arnab $\\to$ Musang (kecekapan pemindahan tenaga antara aras trofik $10\\%\\text{–}20\\%$), untuk menambah $${topGain}\\text{ kg}$ biojisim musang, **sekurang-kurangnya** berapa $\\text{kg}$ rumput diperlukan?`,
        },
        answer: `${minProducer}`,
        unit: "kg",
        explanationZh: `求“至少消耗生产者”取最高传递率 $20\\%$（即每级反推除以 $0.2$ 相当于乘 $5$）：跨越两级需 $${topGain} \\div 20\\% \\div 20\\% = ${topGain} \\times 25 = ${minProducer}\\text{ kg}$。`,
        explanationEn: `Minimum producer corresponds to maximum 20% transfer across 2 steps: ${topGain} / 0.2 / 0.2 = ${minProducer} kg.`,
        explanationI18n: {
          ja: `生産者の量を最小にするには最大効率 20% を使って 2 段階さかのぼる（1 段階ごとに 0.2 で割る = 5 倍）：${topGain} / 0.2 / 0.2 = ${minProducer} kg。`,
          ko: `생산자의 양을 최소로 하려면 최대 효율 20%로 2단계를 거슬러 계산한다(단계마다 0.2로 나눔 = 5배): ${topGain} / 0.2 / 0.2 = ${minProducer} kg.`,
          ms: `Jumlah pengeluar minimum sepadan dengan pemindahan maksimum 20% merentasi 2 aras (setiap aras bahagi dengan 0.2 = darab 5): ${topGain} / 0.2 / 0.2 = ${minProducer} kg.`,
        },
        scaffolds: [
          {
            promptZh: `求“至少”应选最高传递效率 20%，先求至少需要多少 kg 野兔（${topGain} ÷ 0.2）？`,
            promptEn: `At 20% efficiency, kg of Rabbit needed (${topGain} × 5):`,
            promptI18n: {
              ja: `効率 20% のとき、必要なウサギは何 kg ですか（${topGain} × 5）：`,
              ko: `효율이 20%일 때 필요한 토끼는 몇 kg인가 (${topGain} × 5):`,
              ms: `Pada kecekapan 20%, jisim arnab yang diperlukan dalam kg (${topGain} × 5):`,
            },
            hintZh: `${topGain} × 5`,
            hintEn: `${topGain} × 5`,
            expectedAnswer: `${oneStepTrap}`,
          },
          {
            promptZh: `再反推上一级牧草（${oneStepTrap} ÷ 0.2），至少需要多少 kg 牧草？`,
            promptEn: `Now multiply by 5 again for Grass:`,
            promptI18n: {
              ja: `さらに 5 を掛けて、必要な草の量（kg）を求めなさい：`,
              ko: `다시 5를 곱하여 필요한 풀의 양(kg)을 구하시오:`,
              ms: `Darab dengan 5 sekali lagi untuk mendapatkan jisim rumput:`,
            },
            hintZh: `${oneStepTrap} × 5`,
            hintEn: `${oneStepTrap} × 5`,
            expectedAnswer: `${minProducer}`,
          },
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
        promptI18n: {
          ja: `次の Python のループをトレースしなさい：\n\`s = 0\`\n\`for i in range(1, ${n}):\`\n\`    s = s + i\`\n実行終了後の変数 \`s\` の値はいくつですか。`,
          ko: `다음 Python 반복문을 추적하시오:\n\`s = 0\`\n\`for i in range(1, ${n}):\`\n\`    s = s + i\`\n실행이 끝난 뒤 변수 \`s\`의 값은?`,
          ms: `Surih kod Python berikut:\n\`s = 0\`\n\`for i in range(1, ${n}):\`\n\`    s = s + i\`\nApakah nilai akhir \`s\`?`,
        },
        answer: `${ans}`,
        explanationZh: `\`range(1, ${n})\` 左闭右开，\`i\` 依次取 $1, 2, \\dots, ${n - 1}$（不包含 ${n}！），累加得 $s = ${ans}$（误把 ${n} 加进去会错得 ${offByOneTrap}）。`,
        explanationEn: `\`range(1, ${n})\` iterates i = 1 .. ${n - 1}, so s = (${n - 1} × ${n}) / 2 = ${ans}.`,
        explanationI18n: {
          ja: `\`range(1, ${n})\` では i = 1 .. ${n - 1} をとる（${n} は含まない）ので、s = (${n - 1} × ${n}) / 2 = ${ans}（${n} まで足すと誤って ${offByOneTrap} になる）。`,
          ko: `\`range(1, ${n})\`에서 i는 1 .. ${n - 1}의 값을 가지므로(${n}은 포함되지 않음) s = (${n - 1} × ${n}) / 2 = ${ans}이다(${n}까지 더하면 ${offByOneTrap}이라는 오답이 나온다).`,
          ms: `\`range(1, ${n})\` mengulang i = 1 .. ${n - 1} (tidak termasuk ${n}), maka s = (${n - 1} × ${n}) / 2 = ${ans} (jika ${n} turut ditambah, jawapan salah ${offByOneTrap}).`,
        },
        scaffolds: [
          {
            promptZh: `在 range(1, ${n}) 中，变量 i 取到的最后一个整数是多少？`,
            promptEn: `What is the last integer generated by range(1, ${n})?`,
            promptI18n: {
              ja: `range(1, ${n}) が生成する最後の整数はいくつですか。`,
              ko: `range(1, ${n})이 생성하는 마지막 정수는?`,
              ms: `Apakah integer terakhir yang dijana oleh range(1, ${n})?`,
            },
            hintZh: `上界减 1`,
            hintEn: `${n} - 1`,
            hintI18n: { ja: `上限から 1 を引く：${n} - 1`, ko: `상한에서 1을 뺀다: ${n} - 1`, ms: `Had atas tolak 1: ${n} - 1` },
            expectedAnswer: `${n - 1}`,
          },
          {
            promptZh: `将 1 到 ${n - 1} 的所有整数相加，结果 s = ?`,
            promptEn: `Sum 1 + 2 + ... + ${n - 1}:`,
            promptI18n: {
              ja: `1 + 2 + ... + ${n - 1} の和を求めなさい：`,
              ko: `1 + 2 + ... + ${n - 1}의 합을 구하시오:`,
              ms: `Jumlahkan 1 + 2 + ... + ${n - 1}:`,
            },
            hintZh: `等差求和`,
            hintEn: `Sum 1..${n - 1}`,
            hintI18n: { ja: `1..${n - 1} の和`, ko: `1..${n - 1}의 합`, ms: `Jumlah 1..${n - 1}` },
            expectedAnswer: `${ans}`,
          },
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
        promptI18n: {
          ja: `互いに異なる $N = ${n}$ 個の要素が昇順に並んだ配列で二分探索を行うとき、最悪の場合（最大）に必要な要素の比較回数は何回ですか。`,
          ko: `서로 다른 $N = ${n}$개의 원소가 오름차순으로 정렬된 배열에서 이진 탐색을 할 때, 최악의 경우(최대) 필요한 원소 비교 횟수는?`,
          ms: `Dalam tatasusunan terisih yang mengandungi $N = ${n}$ unsur berbeza, berapakah bilangan perbandingan unsur maksimum (kes terburuk) yang diperlukan oleh carian binari?`,
        },
        latexFormula: `C_{\\max}(N) = \\lfloor \\log_2 ${n} \\rfloor + 1`,
        answer: `${kAns}`,
        explanationZh: `每次比较将剩余区间砍半：因 $2^{${kAns}} - 1 = ${n}$，最多只需 $\\lfloor \\log_2 ${n} \\rfloor + 1 = ${kAns}$ 次比较（绝不是线性折半一次算 $N/2 \\approx ${halfTrap}$）。`,
        explanationEn: `Since $2^{${kAns}} - 1 = ${n}$, repeated halving takes at most ${kAns} comparisons.`,
        explanationI18n: {
          ja: `比較のたびに残りの範囲が半分になる。$2^{${kAns}} - 1 = ${n}$ なので、比較は最大 ${kAns} 回で済む（$N/2 \\approx ${halfTrap}$ 回ではない）。`,
          ko: `비교할 때마다 남은 범위가 절반으로 줄어든다. $2^{${kAns}} - 1 = ${n}$이므로 최대 ${kAns}번 비교하면 된다($N/2 \\approx ${halfTrap}$번이 아니다).`,
          ms: `Setiap perbandingan membahagi dua julat yang tinggal. Oleh sebab $2^{${kAns}} - 1 = ${n}$, paling banyak ${kAns} perbandingan diperlukan (bukan $N/2 \\approx ${halfTrap}$).`,
        },
        scaffolds: [
          {
            promptZh: `计算 2 的几次方等于 ${n + 1}？`,
            promptEn: `Find k such that 2^k = ${n + 1}:`,
            promptI18n: {
              ja: `2^k = ${n + 1} となる k を求めなさい：`,
              ko: `2^k = ${n + 1}을 만족하는 k를 구하시오:`,
              ms: `Cari k supaya 2^k = ${n + 1}:`,
            },
            hintZh: `2^${kAns} = ${n + 1}`,
            hintEn: `2^${kAns} = ${n + 1}`,
            expectedAnswer: `${kAns}`,
          },
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
        promptI18n: {
          ja: `計算量が $\\Theta(n^2)$ の二重ループのアルゴリズムは、$n = 1000$ のとき $${t0}\\text{ s}$ かかる。入力サイズが $${scaleK}$ 倍の $n = ${scaleK * 1000}$ になったときの実行時間（単位 $\\text{s}$）を見積もりなさい：`,
          ko: `시간 복잡도가 $\\Theta(n^2)$인 이중 반복문 알고리즘이 $n = 1000$일 때 $${t0}\\text{ s}$가 걸린다. 입력 크기가 $${scaleK}$배인 $n = ${scaleK * 1000}$이 되면 실행 시간(단위 $\\text{s}$)은 약 얼마인가?`,
          ms: `Satu algoritma gelung bersarang $\\Theta(n^2)$ mengambil masa $${t0}\\text{ s}$ untuk $n = 1000$. Anggarkan masa larian (dalam $\\text{s}$) apabila saiz input meningkat $${scaleK}\\times$ kepada $n = ${scaleK * 1000}$:`,
        },
        latexFormula: `T(${scaleK}n) \\approx ${scaleK}^2 \\cdot T(n)`,
        answer: `${ans}`,
        unit: "s",
        explanationZh: `二次复杂度 $\\Theta(n^2)$ 耗时与规模平方成正比：规模乘 $${scaleK}$，耗时乘 $${scaleK}^2 = ${scaleK * scaleK}$，故约需 $${t0} \\times ${scaleK * scaleK} = ${ans}\\text{ s}$。`,
        explanationEn: `For O(n²), scaling input by ${scaleK}× scales time by ${scaleK}² = ${scaleK * scaleK}×: ${t0} × ${scaleK * scaleK} = ${ans} s.`,
        explanationI18n: {
          ja: `O(n²) では実行時間は入力サイズの 2 乗に比例する。入力が ${scaleK} 倍になると時間は ${scaleK}² = ${scaleK * scaleK} 倍：${t0} × ${scaleK * scaleK} = ${ans} s。`,
          ko: `O(n²)에서는 실행 시간이 입력 크기의 제곱에 비례한다. 입력이 ${scaleK}배가 되면 시간은 ${scaleK}² = ${scaleK * scaleK}배: ${t0} × ${scaleK * scaleK} = ${ans} s.`,
          ms: `Bagi O(n²), masa berkadar dengan kuasa dua saiz input. Input didarab ${scaleK}× menyebabkan masa didarab ${scaleK}² = ${scaleK * scaleK}×: ${t0} × ${scaleK * scaleK} = ${ans} s.`,
        },
        scaffolds: [
          {
            promptZh: `规模扩大 ${scaleK} 倍，平方项 n² 扩大多少倍？`,
            promptEn: `By what factor does n² grow when n scales by ${scaleK}?`,
            promptI18n: {
              ja: `n が ${scaleK} 倍になると、n² は何倍になりますか。`,
              ko: `n이 ${scaleK}배가 되면 n²은 몇 배가 되는가?`,
              ms: `Dengan faktor berapakah n² bertambah apabila n didarab ${scaleK}?`,
            },
            hintZh: `${scaleK}²`,
            hintEn: `${scaleK}²`,
            expectedAnswer: `${scaleK * scaleK}`,
          },
          {
            promptZh: `乘以原耗时 ${t0} s，预计耗时是多少 s？`,
            promptEn: `Multiply ${t0} s by ${scaleK * scaleK}:`,
            promptI18n: {
              ja: `${t0} s に ${scaleK * scaleK} を掛けなさい：`,
              ko: `${t0} s에 ${scaleK * scaleK}를 곱하시오:`,
              ms: `Darab ${t0} s dengan ${scaleK * scaleK}:`,
            },
            hintZh: `${t0} × ${scaleK * scaleK}`,
            hintEn: `${t0} × ${scaleK * scaleK}`,
            expectedAnswer: `${ans}`,
          },
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
          headWord: "list",
          ans: "is",
          trap: "are",
        },
        {
          sentence: "A bouquet of fresh yellow roses ______ sitting on the teacher's desk right now.",
          head: "bouquet (单数)",
          headWord: "bouquet",
          ans: "is",
          trap: "are",
        },
        {
          sentence: "The reliability of these autonomous drones ______ improved dramatically since 2024.",
          head: "reliability (不可数单数)",
          headWord: "reliability",
          ans: "has",
          trap: "have",
        },
      ] as const;
      const it = rng.pick(items);
      return {
        promptZh: `【主谓一致诊断】剥离介词短语修饰成分，选出语法正确的谓语动词：\n"${it.sentence}"`,
        promptEn: `Choose the verb that agrees with the true head subject:\n"${it.sentence}"`,
        promptI18n: {
          ja: `【主語と動詞の一致】前置詞句の修飾を取り除き、真の主語（中心となる名詞）と一致する動詞を選びなさい：\n"${it.sentence}"`,
          ko: `[주어-동사 수 일치] 전치사구 수식어를 걷어 내고, 진짜 주어(핵심 명사)와 수가 일치하는 동사를 고르시오:\n"${it.sentence}"`,
          ms: `[Persetujuan Subjek-Kata Kerja] Abaikan frasa sendi nama dan pilih kata kerja yang sepadan dengan subjek utama sebenar:\n"${it.sentence}"`,
        },
        answer: it.ans,
        answerEn: it.ans,
        explanationZh: `将 \`of ...\` 介词短语括起来隐去后，真正的核心主语是 ${it.head}，故谓语必须用单数 \`${it.ans}\`（不能被紧邻的复数宾语带偏选 \`${it.trap}\`）。`,
        explanationEn: `Ignoring the prepositional phrase, the singular head noun requires "${it.ans}" rather than "${it.trap}".`,
        explanationI18n: {
          ja: `前置詞句（of ...）を除くと、中心となる主語は単数の ${it.headWord} なので、"${it.trap}" ではなく単数形の "${it.ans}" を使う（直前の複数名詞につられないこと）。`,
          ko: `전치사구(of ...)를 빼고 보면 핵심 주어는 단수인 ${it.headWord}이므로 "${it.trap}" 대신 단수형 "${it.ans}"를 써야 한다(바로 앞의 복수 명사에 끌려가지 않도록 주의).`,
          ms: `Abaikan frasa sendi nama (of ...); kata nama utama ${it.headWord} adalah tunggal, jadi gunakan "${it.ans}", bukan "${it.trap}" (jangan terpengaruh oleh kata nama jamak yang berdekatan).`,
        },
        scaffolds: [
          {
            promptZh: `去掉 of 后面的复数修饰词，主语中心词是单数还是复数？应选 ${it.ans}。`,
            promptEn: `The head noun before 'of' is singular, requiring "${it.ans}".`,
            promptI18n: {
              ja: `of の前にある中心の名詞 ${it.headWord} は単数なので、"${it.ans}" が必要です。`,
              ko: `of 앞의 핵심 명사 ${it.headWord}는 단수이므로 "${it.ans}"가 필요하다.`,
              ms: `Kata nama utama sebelum 'of' (${it.headWord}) adalah tunggal, maka memerlukan "${it.ans}".`,
            },
            hintZh: `单数谓语`,
            hintEn: `Singular verb`,
            hintI18n: { ja: `単数の動詞`, ko: `단수 동사`, ms: `Kata kerja tunggal` },
            expectedAnswer: it.ans,
          },
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
          subjWord: "Earth",
          ans: "Seen",
          trap: "Seeing",
        },
        {
          sentence: "______ with traditional incandescent bulbs, LED lamps consume 80% less energy.",
          subj: "LED lamps（被拿来比较）",
          subjWord: "LED lamps",
          ans: "Compared",
          trap: "Comparing",
        },
        {
          sentence: "______ by three high-school students, the solar boat won first prize.",
          subj: "the solar boat（被设计）",
          subjWord: "the solar boat",
          ans: "Designed",
          trap: "Designing",
        },
      ] as const;
      const it = rng.pick(items);
      return {
        promptZh: `【非谓语分词逻辑主语辨析】选择正确的分词形式补全句子：\n"${it.sentence}"`,
        promptEn: `Select the non-finite participle that matches the main clause's subject:\n"${it.sentence}"`,
        promptI18n: {
          ja: `【分詞構文の意味上の主語】主節の主語に合う分詞の形を選び、文を完成させなさい：\n"${it.sentence}"`,
          ko: `[분사구문의 의미상 주어] 주절의 주어에 맞는 분사 형태를 골라 문장을 완성하시오:\n"${it.sentence}"`,
          ms: `[Subjek Logik Partisipel] Pilih bentuk partisipel yang sepadan dengan subjek klausa utama untuk melengkapkan ayat:\n"${it.sentence}"`,
        },
        answer: it.ans,
        answerEn: it.ans,
        explanationZh: `句首分词逻辑主语等于逗号后的主句主语 ${it.subj}，二者为被动承受关系，必须用过去分词 \`${it.ans}\`（选 \`${it.trap}\` 会造成悬垂分词错误）。`,
        explanationEn: `The main-clause subject receives the action passively, requiring "${it.ans}" instead of dangling "${it.trap}".`,
        explanationI18n: {
          ja: `文頭の分詞の意味上の主語はコンマの後の主節の主語 ${it.subjWord} であり、動作を受ける側（受動）なので過去分詞 "${it.ans}" を使う（"${it.trap}" にすると懸垂分詞の誤りになる）。`,
          ko: `문두 분사의 의미상 주어는 쉼표 뒤 주절의 주어 ${it.subjWord}이며, 동작을 받는 쪽(수동)이므로 과거분사 "${it.ans}"를 써야 한다("${it.trap}"를 쓰면 현수 분사 오류가 된다).`,
          ms: `Subjek klausa utama (${it.subjWord}) menerima tindakan secara pasif, jadi gunakan partisipel lampau "${it.ans}", bukan "${it.trap}" yang menjadi partisipel tergantung (dangling participle).`,
        },
        scaffolds: [
          {
            promptZh: `看逗号后面的主语 ${it.subj}，它是主动发出动作还是被动承受动作？`,
            promptEn: `Is the main subject performing or receiving the action?`,
            promptI18n: {
              ja: `コンマの後の主語 ${it.subjWord} は、動作をする側ですか、それとも動作を受ける側ですか。`,
              ko: `쉼표 뒤의 주어 ${it.subjWord}는 동작을 하는 쪽인가, 받는 쪽인가?`,
              ms: `Adakah subjek utama (${it.subjWord}) melakukan atau menerima tindakan itu?`,
            },
            hintZh: `被动承受选过去分词`,
            hintEn: `Passive -> past participle`,
            hintI18n: { ja: `受動 -> 過去分詞`, ko: `수동 -> 과거분사`, ms: `Pasif -> partisipel lampau` },
            expectedAnswer: it.ans,
          },
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
        promptI18n: {
          ja: `【過去の事実に反する仮定（仮定法過去完了）】主節の \`would have + p.p.\` に合わせて、\`If\` 節の正しい動詞の形を選びなさい：\n"${it.sentence}"`,
          ko: `[과거 사실의 반대를 가정하는 가정법 과거완료] 주절의 \`would have + p.p.\`에 맞게 \`If\`절의 알맞은 동사 형태를 고르시오:\n"${it.sentence}"`,
          ms: `[Ayat Syarat Ketiga – andaian bertentangan dengan fakta lampau] Berdasarkan klausa utama \`would have + p.p.\`, pilih bentuk kata kerja yang betul untuk klausa \`If\`:\n"${it.sentence}"`,
        },
        answer: it.ans,
        answerEn: it.ans,
        explanationZh: `与过去事实相反的第三类条件句：\`If\` 从句严格用过去完成时 \`${it.ans}\`，严禁在 \`If\` 从句内重复写 \`${it.trap}\`！`,
        explanationEn: `Third conditionals pair "If + had + p.p." (${it.ans}) with "would have + p.p." in the main clause.`,
        explanationI18n: {
          ja: `仮定法過去完了（第3条件文）では、If 節に "had + 過去分詞"（${it.ans}）、主節に "would have + 過去分詞" を用いる。If 節に "${it.trap}" を使ってはいけない。`,
          ko: `가정법 과거완료(제3조건문)에서는 If절에 "had + 과거분사"(${it.ans}), 주절에 "would have + 과거분사"를 쓴다. If절에 "${it.trap}"를 써서는 안 된다.`,
          ms: `Ayat syarat ketiga menggandingkan "If + had + p.p." (${it.ans}) dengan "would have + p.p." dalam klausa utama. Jangan gunakan "${it.trap}" dalam klausa If.`,
        },
        scaffolds: [
          {
            promptZh: `主句已是 would have done，If 从句应搭配什么时态结构？`,
            promptEn: `What tense belongs inside the If-clause of a 3rd conditional?`,
            promptI18n: {
              ja: `主節が would have done のとき、If 節にはどの時制を使いますか。`,
              ko: `주절이 would have done일 때 If절에는 어떤 시제를 쓰는가?`,
              ms: `Kala apakah yang digunakan dalam klausa If bagi ayat syarat ketiga?`,
            },
            hintZh: `had + 过去分词`,
            hintEn: `had + past participle`,
            hintI18n: { ja: `had + 過去分詞`, ko: `had + 과거분사`, ms: `had + partisipel lampau` },
            expectedAnswer: it.ans,
          },
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
        promptI18n: {
          ja: `標高 $${hBase}\\text{ m}$ の山麓の地点 A で気温 $${tBase}^\\circ\\text{C}$ を観測した。気温減率（$100\\text{ m}$ につき $-0.6^\\circ\\text{C}$）を用いて、同じ時刻の標高 $${hTop}\\text{ m}$ の山頂の地点 B の気温（$^\\circ\\text{C}$）を推定しなさい：`,
          ko: `해발 고도 $${hBase}\\text{ m}$인 산기슭 A 지점의 기온은 $${tBase}^\\circ\\text{C}$이다. 기온 감률($100\\text{ m}$당 $-0.6^\\circ\\text{C}$)을 이용하여 같은 시각 해발 고도 $${hTop}\\text{ m}$인 산꼭대기 B 지점의 기온($^\\circ\\text{C}$)을 추정하시오:`,
          ms: `Stesen A pada ketinggian $${hBase}\\text{ m}$ mencatatkan suhu $${tBase}^\\circ\\text{C}$. Menggunakan kadar susut suhu ($-0.6^\\circ\\text{C}$ bagi setiap $100\\text{ m}$), anggarkan suhu udara ($^\\circ\\text{C}$) di Stesen B di puncak ($${hTop}\\text{ m}$):`,
        },
        latexFormula: `T_B = T_A - 0.6 \\times \\frac{${hTop} - ${hBase}}{100}`,
        answer: `${tTop}`,
        unit: "°C",
        explanationZh: `先算两站相对高差 $\\Delta h = ${hTop} - ${hBase} = ${deltaKm * 1000}\\text{ m}$；降温幅度为 $${deltaKm} \\times 6 = ${drop}^\\circ\\text{C}$，故山顶气温为 $${tBase} - ${drop} = ${tTop}^\\circ\\text{C}$（切勿直接拿绝对海拔 ${hTop} m 算得 ${absHTrap}°C）。`,
        explanationEn: `Relative elevation gain Δh = ${hTop - hBase} m → temperature drop = ${drop}°C → summit T = ${tBase} - ${drop} = ${tTop}°C.`,
        explanationI18n: {
          ja: `2 地点の高度差 Δh = ${hTop - hBase} m → 気温低下 = ${drop}°C → 山頂の気温 T = ${tBase} - ${drop} = ${tTop}°C（山頂の標高 ${hTop} m をそのまま使って ${absHTrap}°C としないこと）。`,
          ko: `두 지점의 고도 차 Δh = ${hTop - hBase} m → 기온 하강 = ${drop}°C → 산꼭대기 기온 T = ${tBase} - ${drop} = ${tTop}°C(산꼭대기의 해발 고도 ${hTop} m를 그대로 써서 ${absHTrap}°C로 계산하지 않도록 주의).`,
          ms: `Beza ketinggian relatif Δh = ${hTop - hBase} m → penurunan suhu = ${drop}°C → suhu puncak T = ${tBase} - ${drop} = ${tTop}°C (jangan guna ketinggian mutlak ${hTop} m hingga mendapat ${absHTrap}°C).`,
        },
        scaffolds: [
          {
            promptZh: `山顶与山麓的相对高度差 ${hTop} - ${hBase} 是多少米？`,
            promptEn: `Compute elevation difference ${hTop} - ${hBase} (m):`,
            promptI18n: {
              ja: `高度差 ${hTop} - ${hBase}（m）を計算しなさい：`,
              ko: `고도 차 ${hTop} - ${hBase}(m)를 계산하시오:`,
              ms: `Kira beza ketinggian ${hTop} - ${hBase} (m):`,
            },
            hintZh: `两站海拔相减`,
            hintEn: `h_B - h_A`,
            hintI18n: { ja: `2 地点の標高の差：h_B - h_A`, ko: `두 지점의 해발 고도 차: h_B - h_A`, ms: `Beza ketinggian dua stesen: h_B - h_A` },
            expectedAnswer: `${hTop - hBase}`,
          },
          {
            promptZh: `降温 ${drop}°C 后，用 ${tBase} - ${drop} 得山顶气温：`,
            promptEn: `Subtract ${drop}°C from ${tBase}°C:`,
            promptI18n: {
              ja: `${tBase}°C から ${drop}°C を引きなさい：`,
              ko: `${tBase}°C에서 ${drop}°C를 빼시오:`,
              ms: `Tolak ${drop}°C daripada ${tBase}°C:`,
            },
            hintZh: `${tBase} - ${drop}`,
            hintEn: `${tBase} - ${drop}`,
            expectedAnswer: `${tTop}`,
          },
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
        promptI18n: {
          ja: `冬至の日（太陽の直射点は南緯 $23.5^\\circ$、$\\delta = 23.5^\\circ\\text{S}$）に、北緯 $${latN}^\\circ$（$${latN}^\\circ\\text{N}$）の都市での南中高度 $H$（度）を求めなさい：`,
          ko: `12월 동지(태양 직하점이 남위 $23.5^\\circ$, $\\delta = 23.5^\\circ\\text{S}$)에 북위 $${latN}^\\circ$($${latN}^\\circ\\text{N}$)에 있는 도시의 남중 고도 $H$(단위: 도)를 구하시오:`,
          ms: `Pada solstis Disember (deklinasi titik subsuria $\\delta = 23.5^\\circ\\text{S}$), hitung sudut altitud suria tengah hari $H$ (dalam darjah) di latitud $${latN}^\\circ\\text{N}$:`,
        },
        latexFormula: `H = 90^\\circ - |+${latN}^\\circ - (-23.5^\\circ)|`,
        answer: `${ans}`,
        unit: "°",
        explanationZh: `观测地（北纬 $+${latN}^\\circ$）与直射点（南纬 $-23.5^\\circ$）分处南北异半球，纬度差相加为 $${latN}^\\circ + 23.5^\\circ = ${latDiff}^\\circ$，故 $H = 90^\\circ - ${latDiff}^\\circ = ${ans}^\\circ$（若误相减会算成夏至日的 ${sameSignTrap}°）。`,
        explanationEn: `Opposite hemispheres add latitudinal separation: ${latN}° + 23.5° = ${latDiff}°, so H = 90° - ${latDiff}° = ${ans}°.`,
        explanationI18n: {
          ja: `観測地（北緯）と直射点（南緯）は異なる半球にあるので緯度差は足し合わせる：${latN}° + 23.5° = ${latDiff}°。よって H = 90° - ${latDiff}° = ${ans}°（誤って引き算すると夏至の ${sameSignTrap}° になってしまう）。`,
          ko: `관측 지점(북위)과 태양 직하점(남위)이 서로 다른 반구에 있으므로 위도 차를 더한다: ${latN}° + 23.5° = ${latDiff}°, 따라서 H = 90° - ${latDiff}° = ${ans}°이다(잘못 빼면 하지의 ${sameSignTrap}°가 된다).`,
          ms: `Hemisfera yang berlainan menjumlahkan beza latitud: ${latN}° + 23.5° = ${latDiff}°, maka H = 90° - ${latDiff}° = ${ans}° (jika ditolak secara salah, hasilnya ${sameSignTrap}° iaitu nilai solstis Jun).`,
        },
        scaffolds: [
          {
            promptZh: `北纬 ${latN}° 与南纬 23.5° 跨赤道相隔多少度纬度？`,
            promptEn: `Total latitude separation (${latN} + 23.5):`,
            promptI18n: {
              ja: `北緯 ${latN}° と南緯 23.5° の緯度差の合計（${latN} + 23.5）はいくつですか。`,
              ko: `북위 ${latN}°와 남위 23.5°의 전체 위도 차(${latN} + 23.5)는?`,
              ms: `Jumlah beza latitud (${latN} + 23.5):`,
            },
            hintZh: `异半球相加`,
            hintEn: `Add latitudes`,
            hintI18n: { ja: `異なる半球なので緯度を足す`, ko: `다른 반구이므로 위도를 더한다`, ms: `Tambah latitud (hemisfera berlainan)` },
            expectedAnswer: `${latDiff}`,
          },
          {
            promptZh: `用 90° 减去 ${latDiff}°，正午太阳高度角 H = ?`,
            promptEn: `Compute 90 - ${latDiff}:`,
            promptI18n: {
              ja: `90 - ${latDiff} を計算しなさい：`,
              ko: `90 - ${latDiff}를 계산하시오:`,
              ms: `Kira 90 - ${latDiff}:`,
            },
            hintZh: `90 - ${latDiff}`,
            hintEn: `90 - ${latDiff}`,
            expectedAnswer: `${ans}`,
          },
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
        promptEn: `[Historical Trade Archives] Customs records show annual exports of $${exportsVal}$ ten-thousand silver dollars (×10,000) and imports of $${importsVal}$ ten-thousand silver dollars. Find the net trade surplus (in ten-thousand silver dollars):`,
        promptI18n: {
          ja: `【経済史料の数量的読解】税関の記録によると、ある開港場のある年の輸出総額は $${exportsVal}$ 万銀元、輸入総額は $${importsVal}$ 万銀元であった。この年の貿易黒字（輸出超過）の純額は何万銀元か求めなさい：`,
          ko: `[경제 사료의 정량적 해석] 세관 기록에 따르면 어느 개항장의 한 해 수출 총액은 $${exportsVal}$만 은화, 수입 총액은 $${importsVal}$만 은화였다. 이해의 무역 흑자(수출 초과) 순액을 구하시오(단위: 만 은화):`,
          ms: `[Arkib Perdagangan Sejarah] Rekod kastam menunjukkan eksport tahunan bernilai $${exportsVal}$ puluh ribu dolar perak (×10,000) dan import bernilai $${importsVal}$ puluh ribu dolar perak. Cari lebihan dagangan bersih (dalam unit 10,000 dolar perak):`,
        },
        answer: `${surplus}`,
        explanationZh: `贸易顺差（出超）= 出口总额 - 进口总额 = $${exportsVal} - ${importsVal} = ${surplus}$ 万银元（注意区分“贸易总额” $${totalVolumeTrap}$ 与“顺差净额” $${surplus}$）。`,
        explanationEn: `Net trade surplus = Exports - Imports = ${exportsVal} - ${importsVal} = ${surplus}.`,
        explanationI18n: {
          ja: `貿易黒字（輸出超過）= 輸出総額 - 輸入総額 = ${exportsVal} - ${importsVal} = ${surplus}（貿易総額 ${totalVolumeTrap} と黒字の純額 ${surplus} を区別すること）。`,
          ko: `무역 흑자(수출 초과) = 수출 총액 - 수입 총액 = ${exportsVal} - ${importsVal} = ${surplus}(무역 총액 ${totalVolumeTrap}과 흑자 순액 ${surplus}을 구별할 것).`,
          ms: `Lebihan dagangan bersih = Eksport - Import = ${exportsVal} - ${importsVal} = ${surplus} (bezakan jumlah dagangan ${totalVolumeTrap} dengan lebihan bersih ${surplus}).`,
        },
        scaffolds: [
          {
            promptZh: `用出口额 ${exportsVal} 减去进口额 ${importsVal} 得顺差：`,
            promptEn: `Subtract imports ${importsVal} from exports ${exportsVal}:`,
            promptI18n: {
              ja: `輸出額 ${exportsVal} から輸入額 ${importsVal} を引きなさい：`,
              ko: `수출액 ${exportsVal}에서 수입액 ${importsVal}을 빼시오:`,
              ms: `Tolak import ${importsVal} daripada eksport ${exportsVal}:`,
            },
            hintZh: `出口 - 进口`,
            hintEn: `Exports - Imports`,
            hintI18n: { ja: `輸出 - 輸入`, ko: `수출 - 수입`, ms: `Eksport - Import` },
            expectedAnswer: `${surplus}`,
          },
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
          qI18n: {
            ja: "1825年のイギリス（第一次産業革命期）の都市生活を再現した博物館の展示で、史実に反する**時代錯誤（アナクロニズム）**の展示品はどれか。",
            ko: "1825년 영국(제1차 산업 혁명 시기)의 도시 생활을 재현한 박물관 전시에서 역사적 사실에 어긋나는 **시대착오적인** 전시품은 무엇인가?",
            ms: "Dalam pameran muzium yang membina semula kehidupan harian di Britain pada tahun 1825 (Revolusi Perindustrian Pertama), artifak manakah yang merupakan **anakronisme sejarah**?",
          },
          ansZh: "街道上方架设白炽电灯与卡尔·本茨内燃机汽车",
          ansEn: "Incandescent electric streetlamps and Benz gasoline automobiles",
          ansI18n: {
            ja: "白熱電球の街灯とカール・ベンツのガソリン自動車",
            ko: "백열전구 가로등과 카를 벤츠의 가솔린 자동차",
            ms: "Lampu jalan elektrik pijar dan kereta petrol Benz",
          },
          d1: "用煤炭驱动的瓦特改良蒸汽机抽水装置",
          d1En: "Coal-fired Watt steam pumping engines",
          d1I18n: {
            ja: "石炭で動くワットの改良蒸気機関による揚水ポンプ",
            ko: "석탄으로 움직이는 와트의 개량 증기 기관 양수 펌프",
            ms: "Enjin pam stim Watt berbahan api arang batu",
          },
          d2: "斯蒂芬森设计的蒸汽机车在铁轨上试运行",
          d2En: "Stephenson's steam locomotive operating on iron rails",
          d2I18n: {
            ja: "鉄のレールの上を走るスティーブンソンの蒸気機関車",
            ko: "철로 위를 달리는 스티븐슨의 증기 기관차",
            ms: "Lokomotif stim Stephenson yang bergerak di atas landasan besi",
          },
          d3: "采用水力与蒸汽动力的棉纺织机械化工厂",
          d3En: "Mechanized cotton textile mills powered by water and steam",
          d3I18n: {
            ja: "水力と蒸気力で動く機械化された綿織物工場",
            ko: "수력과 증기력으로 움직이는 기계화된 면직물 공장",
            ms: "Kilang tekstil kapas berjentera yang digerakkan oleh kuasa air dan stim",
          },
        },
        {
          qZh: "关于两次工业革命技术演进特征的比较，下列史学论断最严密的是：",
          qEn: "Which historical statement most accurately contrasts the First and Second Industrial Revolutions?",
          qI18n: {
            ja: "第一次産業革命と第二次産業革命の技術的特徴を比較した記述として、最も正確なものはどれか。",
            ko: "제1차 산업 혁명과 제2차 산업 혁명의 기술적 특징을 가장 정확하게 비교한 역사적 진술은 무엇인가?",
            ms: "Pernyataan sejarah manakah yang paling tepat membezakan Revolusi Perindustrian Pertama dan Kedua?",
          },
          ansZh: "第二次工业革命体现自然科学理论突破（如电磁学）与工业技术发明紧密结合",
          ansEn: "The Second IR tightly coupled scientific theory (e.g., electromagnetism) with industrial R&D",
          ansI18n: {
            ja: "第二次産業革命では、科学理論（電磁気学など）と工業技術の研究開発が密接に結びついた",
            ko: "제2차 산업 혁명에서는 과학 이론(예: 전자기학)과 산업 기술의 연구 개발이 긴밀하게 결합되었다",
            ms: "Revolusi Perindustrian Kedua menggabungkan rapat teori sains (cth. keelektromagnetan) dengan penyelidikan dan pembangunan industri",
          },
          d1: "第一次工业革命已普及电力照明与石油化工合成材料",
          d1En: "The First IR already popularized electric lighting and petrochemical synthetics",
          d1I18n: {
            ja: "第一次産業革命の時点で、電灯や石油化学の合成素材がすでに普及していた",
            ko: "제1차 산업 혁명 때 이미 전등과 석유 화학 합성 소재가 보급되었다",
            ms: "Revolusi Perindustrian Pertama sudah mempopularkan lampu elektrik dan bahan sintetik petrokimia",
          },
          d2: "两次工业革命均完全依赖工匠个人经验而无需科学实验室参与",
          d2En: "Both revolutions relied solely on artisan trial-and-error without scientific laboratories",
          d2I18n: {
            ja: "どちらの産業革命も職人の試行錯誤だけに頼り、科学の実験室は関わらなかった",
            ko: "두 산업 혁명 모두 과학 실험실 없이 오직 장인의 시행착오에만 의존하였다",
            ms: "Kedua-dua revolusi hanya bergantung pada cuba jaya tukang tanpa makmal saintifik",
          },
          d3: "蒸汽机在第二次工业革命后期才首次被引入纺织业",
          d3En: "Steam engines were only introduced into textile mills late in the Second IR",
          d3I18n: {
            ja: "蒸気機関が繊維工場に初めて導入されたのは第二次産業革命の後期である",
            ko: "증기 기관은 제2차 산업 혁명 후기에 이르러서야 처음으로 직물 공장에 도입되었다",
            ms: "Enjin stim hanya diperkenalkan ke kilang tekstil pada akhir Revolusi Perindustrian Kedua",
          },
        },
      ] as const;
      const p = rng.pick(prompts);
      return {
        promptZh: p.qZh,
        promptEn: p.qEn,
        promptI18n: p.qI18n,
        answer: p.ansZh,
        answerEn: p.ansEn,
        answerI18n: p.ansI18n,
        explanationZh: `第一次工业革命（18世纪60年代—19世纪中期）以蒸汽与煤为标志；发电机、白炽电灯与内燃机汽车属于19世纪70年代后的第二次工业革命成果。`,
        explanationEn: `Electricity and internal combustion belong to the Second Industrial Revolution (post-1870), not 1825.`,
        explanationI18n: {
          ja: `第一次産業革命（1760年代〜19世紀半ば）は蒸気と石炭が象徴であり、電力と内燃機関は1870年代以降の第二次産業革命の成果で、1825年のものではない。`,
          ko: `제1차 산업 혁명(1760년대~19세기 중엽)은 증기와 석탄이 상징이며, 전기와 내연 기관은 1825년이 아니라 1870년대 이후 제2차 산업 혁명의 산물이다.`,
          ms: `Revolusi Perindustrian Pertama (1760-an hingga pertengahan abad ke-19) dilambangkan oleh stim dan arang batu; elektrik dan enjin pembakaran dalam tergolong dalam Revolusi Perindustrian Kedua (selepas 1870), bukan tahun 1825.`,
        },
        scaffolds: [
          {
            promptZh: `回想 1825 年处于蒸汽时代还是电气/内燃机时代？`,
            promptEn: `Was 1825 the Steam Age or the Electrical/Oil Age?`,
            promptI18n: {
              ja: `1825 年は蒸気の時代ですか、それとも電気・石油の時代ですか。`,
              ko: `1825년은 증기 시대였는가, 전기·석유 시대였는가?`,
              ms: `Adakah tahun 1825 berada dalam Zaman Stim atau Zaman Elektrik/Minyak?`,
            },
            hintZh: `蒸汽时代`,
            hintEn: `Steam Age`,
            hintI18n: { ja: `蒸気の時代`, ko: `증기 시대`, ms: `Zaman Stim` },
            expectedAnswer: p.ansZh,
            expectedAnswerEn: p.ansEn,
            expectedAnswerI18n: p.ansI18n,
          },
        ],
        distractors: [
          { text: p.d1, textEn: p.d1En, textI18n: p.d1I18n, misconceptionTag: "misc_his_ir_anachronism" },
          { text: p.d2, textEn: p.d2En, textI18n: p.d2I18n },
          { text: p.d3, textEn: p.d3En, textI18n: p.d3I18n },
        ],
      };
    }

    // 47. Literacy: Main idea vs supporting example
    case "lit_main_claim": {
      const answerI18n: TriLocaleText = {
        ja: "前提となる弱点を的確に修正するほうが、単に演習量を増やすよりはるかに効果的である",
        ko: "선수 학습의 약점을 정확히 보완하는 것이 단순히 문제 풀이 양을 늘리는 것보다 훨씬 효과적이다",
        ms: "Pemulihan prasyarat yang bersasar jauh lebih berkesan daripada jumlah latih tubi semata-mata",
      };
      return {
        promptZh: `【论述文本主旨提取】阅读以下短段：\n“许多初学者认为刷题数量直接决定数学成绩。**然而**，认知科学追踪表明，缺乏先修概念溯源的机械重复只会固化错误习惯。例如，某校实验班将每日刷题量减半，改为针对错题上游薄弱点做变式清零，期末达标率反而提升了 24%。”\n该段文字的核心论点是：`,
        promptEn: `Identify the author's primary claim in the passage:\n"Many learners assume drill volume determines math achievement. HOWEVER, cognitive research shows rote repetition without prerequisite root-cause remediation merely reinforces misconceptions. For instance, Class A halved daily drills in favor of targeted root-cause variants and raised mastery by 24%."`,
        promptI18n: {
          ja: `【論説文の主張の読み取り】次の文章を読みなさい：\n「多くの学習者は、問題演習の量が数学の成績を決めると考えている。**しかし**、認知科学の研究によれば、前提となる概念の弱点にさかのぼって修正しない機械的な反復は、誤った理解を固定させるだけである。例えば、A クラスでは毎日の演習量を半分にし、つまずきの根本原因に絞った類題演習に切り替えたところ、習熟率が 24% 向上した。」\nこの文章の筆者の中心となる主張はどれか。`,
          ko: `[논설문의 중심 주장 찾기] 다음 글을 읽으시오:\n"많은 학습자는 문제 풀이의 양이 수학 성적을 결정한다고 생각한다. **그러나** 인지 과학 연구에 따르면, 선수 개념의 근본 원인을 바로잡지 않은 기계적 반복은 오개념을 굳힐 뿐이다. 예를 들어, A반은 매일의 문제 풀이 양을 절반으로 줄이고 근본 원인을 겨냥한 변형 문제로 바꾸어 성취율을 24% 높였다."\n이 글에서 글쓴이의 핵심 주장은 무엇인가?`,
          ms: `Kenal pasti dakwaan utama pengarang dalam petikan:\n"Ramai pelajar beranggapan bahawa jumlah latih tubi menentukan pencapaian matematik. WALAU BAGAIMANAPUN, kajian kognitif menunjukkan bahawa pengulangan hafalan tanpa pemulihan punca akar bagi konsep prasyarat hanya mengukuhkan salah faham. Sebagai contoh, Kelas A mengurangkan separuh latih tubi harian dan menggantikannya dengan variasi soalan yang menyasarkan punca akar, lalu meningkatkan tahap penguasaan sebanyak 24%."`,
        },
        answer: "精准溯源修复先修薄弱点比单纯堆砌刷题量更能有效提升学业表现",
        answerEn: "Targeted prerequisite remediation is far more effective than sheer drill volume",
        answerI18n,
        explanationZh: `首句立靶子，“然而”引出全文中心论点；“例如……”中的实验班与 24% 数据只是支撑中心论点的论据案例，不能“以例代主”。`,
        explanationEn: `The sentence right after 'However' states the overarching thesis; Class A's 24% gain is a supporting example.`,
        explanationI18n: {
          ja: `最初の文は反論の対象を示し、「しかし」の直後の文が全体の主張を述べている。「例えば」以下の A クラスの 24% 向上は主張を支える具体例にすぎず、例を主張と取り違えてはいけない。`,
          ko: `첫 문장은 반박할 통념을 제시하고, '그러나' 바로 뒤의 문장이 글 전체의 중심 주장이다. '예를 들어' 이하 A반의 24% 향상은 이를 뒷받침하는 사례일 뿐이므로 사례를 주장으로 착각하면 안 된다.`,
          ms: `Ayat sejurus selepas 'Walau bagaimanapun' menyatakan tesis keseluruhan; peningkatan 24% Kelas A hanyalah contoh sokongan, bukan dakwaan utama.`,
        },
        scaffolds: [
          {
            promptZh: `定位转折词“然而”之后、“例如”之前的核心判断句！`,
            promptEn: `Locate the claim right after 'However' and before 'For instance'.`,
            promptI18n: {
              ja: `「しかし」の後、「例えば」の前にある中心の主張を見つけなさい。`,
              ko: `'그러나' 뒤, '예를 들어' 앞에 있는 핵심 주장을 찾으시오.`,
              ms: `Cari dakwaan sejurus selepas 'Walau bagaimanapun' dan sebelum 'Sebagai contoh'.`,
            },
            hintZh: `排除局部实验班例子`,
            hintEn: `Exclude narrow example`,
            hintI18n: { ja: `限られた具体例（A クラス）は除く`, ko: `A반의 좁은 사례는 제외한다`, ms: `Kecualikan contoh sempit (Kelas A)` },
            expectedAnswer: "精准溯源修复先修薄弱点比单纯堆砌刷题量更能有效提升学业表现",
            expectedAnswerEn: "Targeted prerequisite remediation is far more effective than sheer drill volume",
            expectedAnswerI18n: answerI18n,
          },
        ],
        distractors: [
          {
            text: "某校实验班通过将作业减半使期末达标率提升了 24%",
            textEn: "Class A raised its final mastery rate by 24% by halving daily homework",
            textI18n: {
              ja: "A クラスは毎日の宿題を半分にして、期末の習熟率を 24% 向上させた",
              ko: "A반은 매일 숙제를 절반으로 줄여 기말 성취율을 24% 높였다",
              ms: "Kelas A meningkatkan kadar penguasaan akhir sebanyak 24% dengan mengurangkan separuh kerja rumah harian",
            },
            misconceptionTag: "misc_lit_example_as_thesis",
          },
          {
            text: "刷题数量越多，学生的数学成绩一定越差",
            textEn: "Practicing more problems always lowers a student's math score",
            textI18n: {
              ja: "問題を多く解くほど、数学の成績は必ず下がる",
              ko: "문제를 많이 풀수록 수학 성적은 반드시 떨어진다",
              ms: "Berlatih lebih banyak soalan sentiasa menurunkan markah matematik pelajar",
            },
          },
          {
            text: "所有学科都不需要任何练习题",
            textEn: "Academic subjects require zero practice exercises altogether",
            textI18n: {
              ja: "どの教科も練習問題はまったく必要ない",
              ko: "모든 교과는 연습 문제가 전혀 필요 없다",
              ms: "Mata pelajaran akademik langsung tidak memerlukan sebarang latihan",
            },
          },
        ],
      };
    }

    // 48. Literacy: Evidence-bound inference vs absolutist leap
    case "lit_inference_modality": {
      const answerI18n: TriLocaleText = {
        ja: "街路樹の樹冠を広げることは、地域の都市の暑さを和らげるのに役立つ有効な手段である",
        ko: "가로수의 수관(나무 그늘)을 넓히는 것은 국지적인 도시 열기를 완화하는 데 도움이 되는 실행 가능한 방법이다",
        ms: "Meluaskan kanopi pokok jalan ialah satu langkah yang boleh dilaksanakan untuk membantu mengurangkan haba bandar setempat",
      };
      return {
        promptZh: `【信息推断与限定词审查】原文载：“城市绿道树冠覆盖率每提高 10%，夏季午后地表热岛温度平均可降低约 0.8°C，有助于缓解部分老旧街区的微气候闷热感。”\n根据原文，下列推断**最严密合理**的一项是：`,
        promptEn: `Passage: "Each 10% increase in urban tree-canopy cover lowers afternoon surface temperature by ~0.8°C on average, helping ease heat stress in older neighborhoods."\nWhich inference is strictly supported by the text?`,
        promptI18n: {
          ja: `本文：「都市の樹冠被覆率が 10% 上がるごとに、午後の地表面温度は平均で約 0.8°C 下がり、古い街区の暑さによる負担の緩和に役立つ。」\n本文から厳密に導ける推論はどれか。`,
          ko: `본문: "도시의 수관 피복률(나무 그늘이 덮는 비율)이 10% 높아질 때마다 오후 지표면 온도가 평균 약 0.8°C 낮아져, 오래된 동네의 더위 스트레스를 완화하는 데 도움이 된다."\n본문에 의해 엄밀하게 뒷받침되는 추론은 무엇인가?`,
          ms: `Petikan: "Setiap peningkatan 10% litupan kanopi pokok bandar menurunkan suhu permukaan pada waktu petang sebanyak ~0.8°C secara purata, sekali gus membantu mengurangkan tekanan haba di kawasan kejiranan lama."\nInferens manakah yang benar-benar disokong oleh teks?`,
        },
        answer: "科学规划并增加城市街道绿化树冠覆盖，是改善局部街区夏季热环境的可行手段之一",
        answerEn: "Expanding street tree canopy is a viable measure to help mitigate local urban heat",
        answerI18n,
        explanationZh: `原文使用“平均约”“有助于”“部分”，严谨克制；干扰项中“彻底消除”“唯一途径”“所有时段均降温”均犯了或然变必然、范围绝对化的推断错误。`,
        explanationEn: `Valid inferences preserve the passage's hedged scope ('helps', 'on average') rather than inflating to 'eliminates completely' or 'only way'.`,
        explanationI18n: {
          ja: `妥当な推論は本文の控えめな範囲（「役立つ」「平均で」）を保っている。「完全になくす」「唯一の方法」のように、可能性を必然に、限られた範囲を全体に誇張してはいけない。`,
          ko: `타당한 추론은 본문의 신중한 범위('도움이 된다', '평균')를 유지한다. '완전히 없앤다'나 '유일한 방법'처럼 가능성을 필연으로, 일부를 전체로 과장해서는 안 된다.`,
          ms: `Inferens yang sah mengekalkan skop berhati-hati petikan ('membantu', 'secara purata') dan tidak membesar-besarkannya kepada 'menghapuskan sepenuhnya' atau 'satu-satunya cara'.`,
        },
        scaffolds: [
          {
            promptZh: `排查四个选项中的绝对化词语（“唯一”“彻底消除”），选出分寸与原文“有助于”一致的一项。`,
            promptEn: `Reject options with extreme words like 'completely' or 'sole'.`,
            promptI18n: {
              ja: `「完全に」「唯一」のような極端な言葉を含む選択肢を除きなさい。`,
              ko: `'완전히', '유일한'과 같은 극단적인 표현이 들어간 선택지를 제외하시오.`,
              ms: `Tolak pilihan yang mengandungi perkataan melampau seperti 'sepenuhnya' atau 'satu-satunya'.`,
            },
            hintZh: `可行手段之一`,
            hintEn: `One viable measure`,
            hintI18n: { ja: `有効な手段の一つ`, ko: `실행 가능한 방법 중 하나`, ms: `Satu langkah yang boleh dilaksanakan` },
            expectedAnswer: "科学规划并增加城市街道绿化树冠覆盖，是改善局部街区夏季热环境的可行手段之一",
            expectedAnswerEn: "Expanding street tree canopy is a viable measure to help mitigate local urban heat",
            expectedAnswerI18n: answerI18n,
          },
        ],
        distractors: [
          {
            text: "只要种树就一定能彻底消除全球所有城市的夏季高温热浪",
            textEn: "Planting trees is guaranteed to eliminate summer heatwaves across all cities worldwide",
            textI18n: {
              ja: "木を植えれば、世界中のすべての都市で夏の熱波を必ずなくすことができる",
              ko: "나무를 심으면 전 세계 모든 도시의 여름 폭염을 반드시 없앨 수 있다",
              ms: "Menanam pokok pasti menghapuskan gelombang haba musim panas di semua bandar di seluruh dunia",
            },
            misconceptionTag: "misc_lit_absolutist_leap",
          },
          {
            text: "增加树冠覆盖率是降低城市温度的唯一决定性途径",
            textEn: "Increasing tree canopy cover is the sole decisive way to lower urban temperatures",
            textI18n: {
              ja: "樹冠被覆率を上げることが、都市の気温を下げる唯一の決定的な方法である",
              ko: "수관 피복률을 높이는 것이 도시 기온을 낮추는 유일한 결정적 방법이다",
              ms: "Meningkatkan litupan kanopi pokok ialah satu-satunya cara penentu untuk menurunkan suhu bandar",
            },
            misconceptionTag: "misc_lit_absolutist_leap",
          },
          {
            text: "冬季午夜气温也会随树冠覆盖率增加而下降 0.8°C",
            textEn: "Winter midnight temperatures also drop by exactly 0.8°C per 10% canopy increase",
            textI18n: {
              ja: "冬の真夜中の気温も、樹冠被覆率が 10% 増えるごとにちょうど 0.8°C 下がる",
              ko: "겨울 한밤중 기온도 수관 피복률이 10% 늘 때마다 정확히 0.8°C 내려간다",
              ms: "Suhu tengah malam musim sejuk juga turun tepat 0.8°C bagi setiap peningkatan kanopi sebanyak 10%",
            },
          },
        ],
      };
    }

    // 49. Literacy: Logical fallacies (Correlation vs Causation / Survivorship bias)
    case "lit_logical_fallacy": {
      const answerI18n: TriLocaleText = {
        ja: "交絡変数（喫煙）を見落とし、相関関係を因果関係と取り違えている",
        ko: "교란 변수(흡연)를 무시하고 상관관계를 인과 관계로 혼동하였다",
        ms: "Mengelirukan korelasi dengan sebab-akibat sambil mengabaikan pemboleh ubah pengeliru (merokok)",
      };
      return {
        promptZh: `【批判思辨：逻辑谬误诊断】某报告宣称：“统计显示，随身携带打火机的人群患肺癌比例显著高于不带打火机的人群，因此打火机金属外壳辐射会导致肺癌。”\n该论证最核心的逻辑漏洞在于：`,
        promptEn: `[Logical Fallacy Audit] Claim: "People who carry lighters have a much higher lung-cancer rate than those who do not; therefore, lighter metal causes lung cancer."\nWhat is the primary flaw in this reasoning?`,
        promptI18n: {
          ja: `【論理的誤謬の診断】ある報告の主張：「ライターを持ち歩く人は、持ち歩かない人より肺がんの発症率がはるかに高い。したがって、ライターの金属が肺がんを引き起こす。」\nこの推論の最も重大な欠陥は何か。`,
          ko: `[논리적 오류 진단] 어떤 보고서의 주장: "라이터를 가지고 다니는 사람은 그렇지 않은 사람보다 폐암 발생률이 훨씬 높다. 따라서 라이터의 금속이 폐암을 일으킨다."\n이 추론의 가장 핵심적인 결함은 무엇인가?`,
          ms: `[Audit Kesilapan Logik] Dakwaan: "Orang yang membawa pemetik api mempunyai kadar kanser paru-paru yang jauh lebih tinggi berbanding mereka yang tidak; oleh itu, logam pemetik api menyebabkan kanser paru-paru."\nApakah kelemahan utama dalam penaakulan ini?`,
        },
        answer: "忽略了共同混杂变量“吸烟习惯”，将相关性伴随现象强加为直接因果关系",
        answerEn: "Confusing correlation with causation while ignoring the confounding variable (smoking)",
        answerI18n,
        explanationZh: `“吸烟”这一第三变量（Confounding Variable）既导致常带打火机，又导致肺癌率升高；原论证犯了典型的“强加因果 / 忽略混杂因素”谬误。`,
        explanationEn: `Smoking is a confounding factor driving both lighter carrying and lung cancer; correlation alone does not prove causation.`,
        explanationI18n: {
          ja: `喫煙は、ライターを持ち歩くことと肺がんの発症率の高さの両方をもたらす第三の要因（交絡因子）である。相関があるだけでは因果関係は証明できない。`,
          ko: `흡연은 라이터를 가지고 다니는 것과 높은 폐암 발생률 모두에 영향을 주는 제3의 요인(교란 요인)이다. 상관관계만으로는 인과 관계가 증명되지 않는다.`,
          ms: `Merokok ialah faktor pengeliru yang menyebabkan kedua-dua tabiat membawa pemetik api dan kanser paru-paru; korelasi semata-mata tidak membuktikan sebab-akibat.`,
        },
        scaffolds: [
          {
            promptZh: `想一想：常带打火机的人通常有什么共同生活习惯，而这个习惯恰恰伤肺？`,
            promptEn: `What hidden third factor explains both carrying a lighter and lung risk?`,
            promptI18n: {
              ja: `ライターを持ち歩くことと肺がんのリスクの両方を説明する、隠れた第三の要因は何ですか。`,
              ko: `라이터를 가지고 다니는 것과 폐암 위험을 모두 설명하는 숨은 제3의 요인은 무엇인가?`,
              ms: `Apakah faktor ketiga tersembunyi yang menjelaskan kedua-dua tabiat membawa pemetik api dan risiko penyakit paru-paru?`,
            },
            hintZh: `混杂变量：吸烟`,
            hintEn: `Confounding variable: smoking`,
            hintI18n: { ja: `交絡変数：喫煙`, ko: `교란 변수: 흡연`, ms: `Pemboleh ubah pengeliru: merokok` },
            expectedAnswer: "忽略了共同混杂变量“吸烟习惯”，将相关性伴随现象强加为直接因果关系",
            expectedAnswerEn: "Confusing correlation with causation while ignoring the confounding variable (smoking)",
            expectedAnswerI18n: answerI18n,
          },
        ],
        distractors: [
          {
            text: "样本统计人数还不够多，只要扩大样本就能证明打火机致癌",
            textEn: "The sample size is merely too small; a larger sample would prove lighters cause cancer",
            textI18n: {
              ja: "標本の人数が少なすぎるだけで、標本を増やせばライターががんの原因だと証明できる",
              ko: "표본 수가 너무 적을 뿐이며, 표본을 늘리면 라이터가 암을 일으킨다는 것을 증명할 수 있다",
              ms: "Saiz sampel cuma terlalu kecil; sampel yang lebih besar akan membuktikan pemetik api menyebabkan kanser",
            },
            misconceptionTag: "misc_lit_spurious_cause",
          },
          {
            text: "没有说明打火机品牌价格差异",
            textEn: "The report fails to compare different brands and prices of lighters",
            textI18n: {
              ja: "報告はライターのブランドや価格の違いを比較していない",
              ko: "보고서가 라이터의 브랜드와 가격 차이를 비교하지 않았다",
              ms: "Laporan itu gagal membandingkan jenama dan harga pemetik api yang berbeza",
            },
          },
          {
            text: "论点完全正确，无任何逻辑瑕疵",
            textEn: "The argument is completely sound and free of any logical flaw",
            textI18n: {
              ja: "この論証は完全に正しく、論理的な欠陥はまったくない",
              ko: "이 논증은 완전히 타당하며 논리적 결함이 전혀 없다",
              ms: "Hujah itu benar-benar kukuh dan bebas daripada sebarang kelemahan logik",
            },
            misconceptionTag: "misc_lit_spurious_cause",
          },
        ],
      };
    }

    // 50. Literacy: PISA multi-source text + table synthesis
    case "lit_pisa_synthesis": {
      const limitEnergy = rng.pick([42, 45, 48]);
      const answerI18n: TriLocaleText = {
        ja: "ラボ B のみが条件を満たす",
        ko: "연구실 B만 자격을 갖춘다",
        ms: "Hanya Makmal B yang layak",
      };
      return {
        promptZh: `【PISA 多源非连续性文本决策】\n• 政策细则：申请“绿色示范实验室”认证须**同时满足**：① 可再生绿电占比 $\\ge 60\\%$；② 单位算力能耗 $\\le ${limitEnergy}\\text{ W}$。\n• 实测数据表：\n  - 甲馆：绿电占比 $78\\%$，单位能耗 $${limitEnergy + 6}\\text{ W}$\n  - 乙馆：绿电占比 $64\\%$，单位能耗 $${limitEnergy - 3}\\text{ W}$\n  - 丙馆：绿电占比 $55\\%$，单位能耗 $${limitEnergy - 8}\\text{ W}$\n最终哪座场馆符合认证资格？`,
        promptEn: `[Multi-Source Synthesis]\n• Policy Rule: Certification requires BOTH (1) Renewable share $\\ge 60\\%$ AND (2) Energy intensity $\\le ${limitEnergy}\\text{ W}$.\n• Data: Lab A ($78\\%, ${limitEnergy + 6}\\text{ W}$); Lab B ($64\\%, ${limitEnergy - 3}\\text{ W}$); Lab C ($55\\%, ${limitEnergy - 8}\\text{ W}$).\nWhich lab qualifies?`,
        promptI18n: {
          ja: `【複数資料の統合】\n• 規定：認証には (1) 再生可能エネルギーの割合 $\\ge 60\\%$ と (2) 演算単位あたりの消費電力 $\\le ${limitEnergy}\\text{ W}$ の**両方**を満たす必要がある。\n• データ：ラボ A ($78\\%, ${limitEnergy + 6}\\text{ W}$)、ラボ B ($64\\%, ${limitEnergy - 3}\\text{ W}$)、ラボ C ($55\\%, ${limitEnergy - 8}\\text{ W}$)。\n認証を受けられるのはどのラボか。`,
          ko: `[다중 자료 종합]\n• 정책 규정: 인증을 받으려면 (1) 재생 에너지 비율 $\\ge 60\\%$와 (2) 연산 단위당 전력 소비 $\\le ${limitEnergy}\\text{ W}$를 **모두** 충족해야 한다.\n• 자료: 연구실 A ($78\\%, ${limitEnergy + 6}\\text{ W}$), 연구실 B ($64\\%, ${limitEnergy - 3}\\text{ W}$), 연구실 C ($55\\%, ${limitEnergy - 8}\\text{ W}$).\n인증 자격을 갖춘 연구실은 어디인가?`,
          ms: `[Sintesis Pelbagai Sumber]\n• Peraturan Dasar: Pensijilan memerlukan KEDUA-DUA (1) Bahagian tenaga boleh baharu $\\ge 60\\%$ DAN (2) Keamatan tenaga $\\le ${limitEnergy}\\text{ W}$.\n• Data: Makmal A ($78\\%, ${limitEnergy + 6}\\text{ W}$); Makmal B ($64\\%, ${limitEnergy - 3}\\text{ W}$); Makmal C ($55\\%, ${limitEnergy - 8}\\text{ W}$).\nMakmal manakah yang layak?`,
        },
        answer: "仅乙馆符合资格",
        answerEn: "Only Lab B qualifies",
        answerI18n,
        explanationZh: `逐条交叉核验双重约束：甲馆绿电最高但能耗 $${limitEnergy + 6} > ${limitEnergy}$ 超标淘汰；丙馆能耗最低但绿电 $55\\% < 60\\%$ 不达标；唯有乙馆两项指标同时达标！`,
        explanationEn: `Lab A fails Condition 2 (${limitEnergy + 6} > ${limitEnergy}); Lab C fails Condition 1 (55% < 60%); only Lab B satisfies both.`,
        explanationI18n: {
          ja: `ラボ A は条件 2 を満たさない（${limitEnergy + 6} > ${limitEnergy}）。ラボ C は条件 1 を満たさない（55% < 60%）。両方を満たすのはラボ B だけである。`,
          ko: `연구실 A는 조건 2를 충족하지 못하고(${limitEnergy + 6} > ${limitEnergy}), 연구실 C는 조건 1을 충족하지 못한다(55% < 60%). 두 조건을 모두 충족하는 것은 연구실 B뿐이다.`,
          ms: `Makmal A gagal Syarat 2 (${limitEnergy + 6} > ${limitEnergy}); Makmal C gagal Syarat 1 (55% < 60%); hanya Makmal B memenuhi kedua-dua syarat.`,
        },
        scaffolds: [
          {
            promptZh: `甲馆绿电 78% 看似最高，但它的第二项指标 ${limitEnergy + 6} W 满足 ≤ ${limitEnergy} W 吗？`,
            promptEn: `Does Lab A satisfy ≤ ${limitEnergy} W? No — check Lab B on both rules.`,
            promptI18n: {
              ja: `ラボ A は ≤ ${limitEnergy} W を満たしますか。満たしません。ラボ B を両方の条件で確認しよう。`,
              ko: `연구실 A는 ≤ ${limitEnergy} W를 충족하는가? 아니다. 연구실 B를 두 조건 모두로 확인하자.`,
              ms: `Adakah Makmal A memenuhi ≤ ${limitEnergy} W? Tidak — semak Makmal B bagi kedua-dua peraturan.`,
            },
            hintZh: `双重条件都打勾才行`,
            hintEn: `Both conditions must hold`,
            hintI18n: { ja: `両方の条件を満たす必要がある`, ko: `두 조건을 모두 충족해야 한다`, ms: `Kedua-dua syarat mesti dipenuhi` },
            expectedAnswer: "仅乙馆符合资格",
            expectedAnswerEn: "Only Lab B qualifies",
            expectedAnswerI18n: answerI18n,
          },
        ],
        distractors: [
          {
            text: "甲馆（因其绿电占比 78% 位居第一）",
            textEn: "Lab A (because its 78% renewable share is the highest)",
            textI18n: {
              ja: "ラボ A（再生可能エネルギーの割合 78% が最も高いから）",
              ko: "연구실 A (재생 에너지 비율 78%가 가장 높기 때문)",
              ms: "Makmal A (kerana bahagian tenaga boleh baharunya 78% adalah yang tertinggi)",
            },
            misconceptionTag: "misc_lit_single_criterion",
          },
          {
            text: "丙馆（因其单位能耗最低最节能）",
            textEn: "Lab C (because its energy intensity per compute unit is the lowest)",
            textI18n: {
              ja: "ラボ C（演算単位あたりの消費電力が最も低いから）",
              ko: "연구실 C (연산 단위당 전력 소비가 가장 낮기 때문)",
              ms: "Makmal C (kerana keamatan tenaga bagi setiap unit pengkomputerannya adalah yang terendah)",
            },
            misconceptionTag: "misc_lit_single_criterion",
          },
          {
            text: "甲馆与乙馆均符合资格",
            textEn: "Both Lab A and Lab B qualify",
            textI18n: {
              ja: "ラボ A とラボ B の両方が条件を満たす",
              ko: "연구실 A와 연구실 B 모두 자격을 갖춘다",
              ms: "Makmal A dan Makmal B kedua-duanya layak",
            },
          },
        ],
      };
    }

    default:
      return null;
  }
}
