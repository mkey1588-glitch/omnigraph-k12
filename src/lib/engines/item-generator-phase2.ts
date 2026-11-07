import type { DifficultyTier, TriLocaleText } from "@/types/taxonomy";
import type { DeterministicRng, RawGeneratedCore } from "./item-generator";
import { koP } from "./item-generator-shared";

/**
 * Parameterized Generators for Phase 2's 20 New All-Subject Canonical Micro-Topics
 * (Chemistry, Biology, Computing, English, Geography, History, and Literacy/Critical Reading)
 */
export function generatePhase2Core(
  generatorKey: string,
  rng: DeterministicRng,
  dTier: DifficultyTier
): RawGeneratedCore | null {
  switch (generatorKey) {
    // 31. Chemistry: Atomic shells & ionic electrons
    case "chem_atomic_shells": {
      if (dTier === "challenge") {
        // Polyatomic ions: sum of atomic numbers minus net ionic charge
        const polyIons = [
          {
            nameZh: "铵根离子 NH₄⁺",
            nameEn: "ammonium ion NH₄⁺",
            nameJa: "アンモニウムイオン NH₄⁺",
            nameKo: "암모늄 이온 NH₄⁺",
            nameMs: "ion amonium NH₄⁺",
            sym: "\\text{NH}_4^+",
            zFormulaZh: "Z(\\text{N})=7,\\; Z(\\text{H})=1",
            zSum: 11,
            charge: 1,
          },
          {
            nameZh: "水合氢离子 H₃O⁺",
            nameEn: "hydronium ion H₃O⁺",
            nameJa: "オキソニウムイオン H₃O⁺",
            nameKo: "하이드로늄 이온 H₃O⁺",
            nameMs: "ion hidronium H₃O⁺",
            sym: "\\text{H}_3\\text{O}^+",
            zFormulaZh: "Z(\\text{H})=1,\\; Z(\\text{O})=8",
            zSum: 11,
            charge: 1,
          },
          {
            nameZh: "氢氧根离子 OH⁻",
            nameEn: "hydroxide ion OH⁻",
            nameJa: "水酸化物イオン OH⁻",
            nameKo: "수산화 이온 OH⁻",
            nameMs: "ion hidroksida OH⁻",
            sym: "\\text{OH}^-",
            zFormulaZh: "Z(\\text{O})=8,\\; Z(\\text{H})=1",
            zSum: 9,
            charge: -1,
          },
          {
            nameZh: "硫氢根离子 HS⁻",
            nameEn: "bisulfide ion HS⁻",
            nameJa: "硫化水素イオン HS⁻",
            nameKo: "황화 수소 이온 HS⁻",
            nameMs: "ion hidrogen sulfida HS⁻",
            sym: "\\text{HS}^-",
            zFormulaZh: "Z(\\text{H})=1,\\; Z(\\text{S})=16",
            zSum: 17,
            charge: -1,
          },
        ] as const;
        const item = rng.pick(polyIons);
        const ans = item.zSum - item.charge;
        const signFlipTrap = item.zSum + item.charge;
        return {
          promptZh: `已知原子序数 $${item.zFormulaZh}$，求多原子离子 $${item.sym}$（${item.nameZh}）中所含电子的总数：`,
          promptEn: `Given $${item.zFormulaZh}$, find the total number of electrons in the polyatomic ${item.nameEn} ($${item.sym}$):`,
          promptI18n: {
            ja: `原子番号 $${item.zFormulaZh}$ とするとき、多原子イオンである${item.nameJa}（$${item.sym}$）に含まれる電子の総数は何個ですか。`,
            ko: `원자 번호가 $${item.zFormulaZh}$일 때, 다원자 이온인 ${item.nameKo}($${item.sym}$)에 들어 있는 전자의 총개수는 몇 개입니까?`,
            ms: `Diberi nombor atom $${item.zFormulaZh}$, berapakah jumlah bilangan elektron dalam ${item.nameMs} ($${item.sym}$)?`,
          },
          latexFormula: `N_{e^-} = \\sum Z - q = ${item.zSum} - (${item.charge})`,
          answer: `${ans}`,
          explanationZh: `先算各原子质子总数 $\\sum Z = ${item.zSum}$，再按离子电荷 $q = ${item.charge > 0 ? `+${item.charge}` : item.charge}$ 修正：$N_{e^-} = ${item.zSum} - (${item.charge}) = ${ans}$（切勿符号弄反错算成 ${signFlipTrap}）。`,
          explanationEn: `Total protons = ${item.zSum}; total electrons = ${item.zSum} - (${item.charge}) = ${ans} (not ${signFlipTrap}).`,
          explanationI18n: {
            ja: `構成原子の陽子数の合計は ${item.zSum} 個であり、電荷 $q = ${item.charge > 0 ? `+${item.charge}` : item.charge}$ を反映すると電子の総数は ${item.zSum} - (${item.charge}) = ${ans} 個です（符号を逆にして ${signFlipTrap} 個としないよう注意しましょう）。`,
            ko: `구성 원자의 양성자 수 합은 ${item.zSum}개이며, 이온 전하를 반영하면 총 전자 수는 ${item.zSum} - (${item.charge}) = ${ans}개입니다(부호를 반대로 하여 ${signFlipTrap}개로 계산하지 않도록 주의하십시오).`,
            ms: `Jumlah proton ialah ${item.zSum}; jumlah elektron = ${item.zSum} - (${item.charge}) = ${ans} (jangan terbalikkan tanda sehingga mendapat ${signFlipTrap}).`,
          },
          scaffolds: [
            {
              promptZh: `第一步：把离子中所有原子的质子数（原子序数）相加，总质子数是多少？`,
              promptEn: `Step 1: Sum the atomic numbers (protons) of all atoms in the group:`,
              promptI18n: {
                ja: `ステップ 1：イオン内のすべての原子の陽子数（原子番号）の合計はいくつですか。`,
                ko: `1단계: 이온을 이루는 모든 원자의 양성자 수(원자 번호) 합은 얼마입니까?`,
                ms: `Langkah 1: Jumlahkan nombor atom (proton) bagi semua atom dalam ion tersebut:`,
              },
              hintZh: `按角标累加 Z`,
              hintEn: `Sum Z with subscripts`,
              hintI18n: { ja: `添字に注意して Z を足す`, ko: `아래첨자를 반영하여 Z를 더합니다`, ms: `Jumlahkan Z mengikut subskrip` },
              expectedAnswer: `${item.zSum}`,
            },
            {
              promptZh: `第二步：根据整体电荷 ${item.charge > 0 ? `+${item.charge}` : item.charge} 调整得失电子后，总电子数为？`,
              promptEn: `Step 2: Apply N_e = ${item.zSum} - (${item.charge}):`,
              promptI18n: {
                ja: `ステップ 2：全体の電荷を考慮して ${item.zSum} - (${item.charge}) を計算しなさい：`,
                ko: `2단계: 전체 전하를 반영하여 ${item.zSum} - (${item.charge})를 계산하시오:`,
                ms: `Langkah 2: Kira ${item.zSum} - (${item.charge}) mengikut cas keseluruhan ion:`,
              },
              hintZh: `阳离子减电子，阴离子加电子`,
              hintEn: `Cation loses e⁻, anion gains e⁻`,
              hintI18n: {
                ja: `陽イオンは電子を失い、陰イオンは電子を得ます`,
                ko: `양이온은 전자를 잃고 음이온은 전자를 얻습니다`,
                ms: `Kation kehilangan e⁻, anion menerima e⁻`,
              },
              expectedAnswer: `${ans}`,
            },
          ],
          distractors: [
            { text: `${signFlipTrap}`, misconceptionTag: "misc_chem_ion_sign_flip" },
            { text: `${item.zSum}` },
            { text: `${ans + 4}` },
          ],
          misconceptionsByValue: { [`${signFlipTrap}`]: "misc_chem_ion_sign_flip" },
        };
      }

      const cationPool = [
        { nameZh: "钠离子 Na⁺", sym: "Na^+", z: 11, charge: 1 },
        { nameZh: "镁离子 Mg²⁺", sym: "Mg^{2+}", z: 12, charge: 2 },
        { nameZh: "铝离子 Al³⁺", sym: "Al^{3+}", z: 13, charge: 3 },
        { nameZh: "钙离子 Ca²⁺", sym: "Ca^{2+}", z: 20, charge: 2 },
      ] as const;
      const anionPool = [
        { nameZh: "氧离子 O²⁻", sym: "O^{2-}", z: 8, charge: -2 },
        { nameZh: "氟离子 F⁻", sym: "F^-", z: 9, charge: -1 },
        { nameZh: "硫离子 S²⁻", sym: "S^{2-}", z: 16, charge: -2 },
        { nameZh: "氯离子 Cl⁻", sym: "Cl^-", z: 17, charge: -1 },
      ] as const;
      const item = dTier === "standard" ? rng.pick(anionPool) : rng.pick(cationPool);
      const ans = item.z - item.charge;
      const signFlipTrap = item.z + item.charge;
      return {
        promptZh: `已知元素原子序数（质子数）$Z = ${item.z}$，当该原子形成稳定离子 $${item.sym}$（${item.nameZh}）后，核外一共还有多少个电子？`,
        promptEn: `An element has atomic number (protons) $Z = ${item.z}$. How many electrons surround the nucleus in its ion $${item.sym}$?`,
        promptI18n: {
          ja: `原子番号（陽子数）$Z = ${item.z}$ の元素がイオン（$${item.sym}$）になったとき、電子は何個ありますか。`,
          ko: `원자 번호(양성자 수)가 $Z = ${item.z}$인 원소가 이온($${item.sym}$)이 되었을 때 전자는 몇 개입니까?`,
          ms: `Satu unsur mempunyai nombor atom (proton) $Z = ${item.z}$. Berapakah bilangan elektron dalam ion $${item.sym}$?`,
        },
        latexFormula: `N_{e^-} = Z - q = ${item.z} - (${item.charge})`,
        answer: `${ans}`,
        explanationZh: `原子得失电子时质子数 $Z=${item.z}$ 不变；离子电荷 $q = ${item.charge > 0 ? `+${item.charge}` : item.charge}$，故核外电子数 $N_{e^-} = Z - q = ${ans}$（切勿把符号弄反错算成 ${signFlipTrap}）。`,
        explanationEn: `Protons stay fixed at ${item.z}; electron count = Z - charge = ${item.z} - (${item.charge}) = ${ans}.`,
        explanationI18n: {
          ja: `陽子数は ${item.z} のまま変わりません。電子数 = Z - 電荷 = ${item.z} - (${item.charge}) = ${ans} 個です（符号を逆にして ${signFlipTrap} 個としないよう注意しましょう）。`,
          ko: `양성자 수는 ${item.z}로 변하지 않습니다. 전자 수 = Z - 전하 = ${item.z} - (${item.charge}) = ${ans}개입니다(부호를 반대로 하여 ${signFlipTrap}개로 계산하지 않도록 주의하십시오).`,
          ms: `Bilangan proton kekal ${item.z}; bilangan elektron = Z - cas = ${item.z} - (${item.charge}) = ${ans} (jangan terbalikkan tanda sehingga mendapat ${signFlipTrap}).`,
        },
        scaffolds: [
          {
            promptZh: `中性原子时核外电子数等于质子数，是多少？`,
            promptEn: `Neutral electron count (= Z):`,
            promptI18n: {
              ja: `中性原子の電子数（= Z）はいくつですか。`,
              ko: `중성 원자의 전자 수(= Z)는 얼마입니까?`,
              ms: `Bilangan elektron atom neutral (= Z):`,
            },
            hintZh: `等于 Z`,
            hintEn: `Equals Z`,
            hintI18n: { ja: `Z に等しいです`, ko: `Z와 같습니다`, ms: `Sama dengan Z` },
            expectedAnswer: `${item.z}`,
          },
          {
            promptZh: `形成 $${item.sym}$ 后电子增减调整，最终电子数为？`,
            promptEn: `Adjust for ionic charge:`,
            promptI18n: {
              ja: `イオン（$${item.sym}$）になるときの電子の増減を考えると、最終的な電子数はいくつですか。`,
              ko: `이온($${item.sym}$)이 될 때 전자의 증감을 반영하면 최종 전자 수는 얼마입니까?`,
              ms: `Laraskan mengikut cas ion $${item.sym}$:`,
            },
            hintZh: `阳离子减电子，阴离子加电子`,
            hintEn: `Z - q`,
            hintI18n: {
              ja: `Z - q（陽イオンは電子を失い、陰イオンは電子を得ます）`,
              ko: `Z - q (양이온은 전자를 잃고, 음이온은 전자를 얻습니다)`,
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

    // 32. Chemistry: Oxidation state & algebraic charge-sum rule
    case "chem_valence_formula": {
      if (dTier === "challenge") {
        // Polyatomic ions: sum of oxidation states equals overall ionic charge q != 0
        const polyOx = [
          { formula: "\\text{Cr}_2\\text{O}_7^{2-}", plain: "Cr₂O₇²⁻", target: "Cr", tCount: 2, oCount: 7, netCharge: -2, ans: 6, zeroSumTrap: 7 },
          { formula: "\\text{SO}_4^{2-}", plain: "SO₄²⁻", target: "S", tCount: 1, oCount: 4, netCharge: -2, ans: 6, zeroSumTrap: 8 },
          { formula: "\\text{NO}_3^-", plain: "NO₃⁻", target: "N", tCount: 1, oCount: 3, netCharge: -1, ans: 5, zeroSumTrap: 6 },
          { formula: "\\text{PO}_4^{3-}", plain: "PO₄³⁻", target: "P", tCount: 1, oCount: 4, netCharge: -3, ans: 5, zeroSumTrap: 8 },
          { formula: "\\text{ClO}_4^-", plain: "ClO₄⁻", target: "Cl", tCount: 1, oCount: 4, netCharge: -1, ans: 7, zeroSumTrap: 8 },
        ] as const;
        const c = rng.pick(polyOx);
        return {
          promptZh: `根据原子团化合价代数和等于离子所带电荷法则（已知氧为 $-2$ 价），求原子团离子 $${c.formula}$（${c.plain}）中元素 $\\text{${c.target}}$ 的化合价数值（如 $+6$ 填 $6$）：`,
          promptEn: `Using the polyatomic ion oxidation-state sum rule (with $\\text{O} = -2$), find the oxidation state of $\\text{${c.target}}$ in $${c.formula}$:`,
          promptI18n: {
            ja: `多原子イオンの酸化数の総和はイオンの価数に等しいという規則（$\\text{O} = -2$）を用いて、$${c.formula}$ 中の $\\text{${c.target}}$ の酸化数を求めなさい（$+6$ なら $6$ と答える）：`,
            ko: `다원자 이온에서 산화수의 합은 이온의 전하와 같다는 규칙($\\text{O} = -2$)을 이용하여 $${c.formula}$에서 $\\text{${c.target}}$의 산화수를 구하시오($+6$이면 $6$으로 답함):`,
            ms: `Menggunakan peraturan hasil tambah nombor pengoksidaan ion poliatom ($\\text{O} = -2$), cari nombor pengoksidaan $\\text{${c.target}}$ dalam $${c.formula}$ (jika $+6$, tulis $6$):`,
          },
          latexFormula: `${c.tCount > 1 ? `${c.tCount}x` : "x"} + ${c.oCount}\\times(-2) = ${c.netCharge}`,
          answer: `${c.ans}`,
          acceptedEquivalents: [`+${c.ans}`],
          explanationZh: `多原子离子代数和等于离子电荷 $${c.netCharge}$（而非 $0$！）：$${c.tCount > 1 ? `${c.tCount}x` : "x"} + ${c.oCount}\\times(-2) = ${c.netCharge} \\implies x = +${c.ans}$（若误令右边等于 $0$ 会错得 $+${c.zeroSumTrap}$）。`,
          explanationEn: `Set the sum equal to the ionic charge ${c.netCharge}: ${c.tCount > 1 ? `${c.tCount}x` : "x"} + ${c.oCount}(-2) = ${c.netCharge} ⇒ x = +${c.ans} (setting the sum to 0 wrongly gives +${c.zeroSumTrap}).`,
          explanationI18n: {
            ja: `多原子イオンでは酸化数の総和がイオンの電荷 ${c.netCharge} に等しくなります：${c.tCount > 1 ? `${c.tCount}x` : "x"} + ${c.oCount}(-2) = ${c.netCharge} より x = +${c.ans} です（右辺を 0 と誤ると +${c.zeroSumTrap} になります）。`,
            ko: `다원자 이온에서 산화수의 합은 이온 전하 ${c.netCharge}와 같습니다: ${c.tCount > 1 ? `${c.tCount}x` : "x"} + ${c.oCount}(-2) = ${c.netCharge}에서 x = +${c.ans}입니다(우변을 0으로 잘못 놓으면 +${c.zeroSumTrap}이 됩니다).`,
            ms: `Hasil tambah nombor pengoksidaan ion poliatom menyamai cas ion ${c.netCharge}: ${c.tCount > 1 ? `${c.tCount}x` : "x"} + ${c.oCount}(-2) = ${c.netCharge} ⇒ x = +${c.ans} (menyamanilai dengan 0 secara salah memberikan +${c.zeroSumTrap}).`,
          },
          scaffolds: [
            {
              promptZh: `第一步：${c.oCount} 个氧原子贡献的总负化合价是多少？`,
              promptEn: `Step 1: Total negative oxidation state from ${c.oCount} oxygen atoms:`,
              promptI18n: {
                ja: `ステップ 1：酸素原子 ${c.oCount} 個による負の酸化数の合計はいくつですか。`,
                ko: `1단계: 산소 원자 ${c.oCount}개가 기여하는 음의 산화수 합은 얼마입니까?`,
                ms: `Langkah 1: Jumlah nombor pengoksidaan negatif daripada ${c.oCount} atom oksigen:`,
              },
              hintZh: `${c.oCount} × (-2)`,
              hintEn: `${c.oCount} × (-2)`,
              expectedAnswer: `${-2 * c.oCount}`,
            },
            {
              promptZh: `第二步：令 ${c.tCount > 1 ? `${c.tCount}x` : "x"} + (${-2 * c.oCount}) = ${c.netCharge}，解出 x = ?`,
              promptEn: `Step 2: Solve ${c.tCount > 1 ? `${c.tCount}x` : "x"} + (${-2 * c.oCount}) = ${c.netCharge} for x:`,
              promptI18n: {
                ja: `ステップ 2：${c.tCount > 1 ? `${c.tCount}x` : "x"} + (${-2 * c.oCount}) = ${c.netCharge} から x を求めなさい：`,
                ko: `2단계: ${c.tCount > 1 ? `${c.tCount}x` : "x"} + (${-2 * c.oCount}) = ${c.netCharge}에서 x를 구하시오:`,
                ms: `Langkah 2: Selesaikan ${c.tCount > 1 ? `${c.tCount}x` : "x"} + (${-2 * c.oCount}) = ${c.netCharge} untuk x:`,
              },
              hintZh: `注意等号右边是 ${c.netCharge}`,
              hintEn: `Right-hand side is ${c.netCharge}`,
              hintI18n: {
                ja: `右辺は 0 ではなく ${c.netCharge} です`,
                ko: `등호의 우변은 ${c.netCharge}입니다`,
                ms: `Sebelah kanan persamaan ialah ${c.netCharge}`,
              },
              expectedAnswer: `${c.ans}`,
            },
          ],
          distractors: [
            { text: `${c.zeroSumTrap}`, misconceptionTag: "misc_chem_valence_ignore_sub" },
            { text: `${-c.ans}` },
            { text: `${Math.abs(c.netCharge)}` },
          ],
          misconceptionsByValue: { [`${c.zeroSumTrap}`]: "misc_chem_valence_ignore_sub" },
        };
      }

      const compounds = [
        { formula: "KMnO_4", plain: "KMnO₄", target: "Mn", hOrMetal: "+1 (K)", hSum: 1, oCount: 4, ans: 7, ignoreSubTrap: 1 },
        { formula: "H_2SO_4", plain: "H₂SO₄", target: "S", hOrMetal: "+1 (H)", hSum: 2, oCount: 4, ans: 6, ignoreSubTrap: 0 },
        { formula: "HNO_3", plain: "HNO₃", target: "N", hOrMetal: "+1 (H)", hSum: 1, oCount: 3, ans: 5, ignoreSubTrap: 1 },
        { formula: "Na_2CO_3", plain: "Na₂CO₃", target: "C", hOrMetal: "+1 (Na)", hSum: 2, oCount: 3, ans: 4, ignoreSubTrap: 0 },
        { formula: "KClO_3", plain: "KClO₃", target: "Cl", hOrMetal: "+1 (K)", hSum: 1, oCount: 3, ans: 5, ignoreSubTrap: 1 },
      ] as const;
      const c = dTier === "standard" ? rng.pick(compounds.slice(0, 3)) : rng.pick(compounds.slice(2));
      return {
        promptZh: `根据化合物正负化合价代数和为 $0$ 法则，已知氧为 $-2$ 价、${c.hOrMetal}，求 $${c.formula}$（${c.plain}）中中心元素 $\\text{${c.target}}$ 的化合价数值（如 $+6$ 填 $6$）：`,
        promptEn: `Using the zero-sum oxidation rule (with $\\text{O} = -2$ and ${c.hOrMetal}), find the oxidation state of $\\text{${c.target}}$ in $${c.formula}$:`,
        promptI18n: {
          ja: `化合物中の酸化数の総和は $0$ になるという規則（$\\text{O} = -2$、${c.hOrMetal}）を用いて、$${c.formula}$ 中の $\\text{${c.target}}$ の酸化数を求めなさい（$+6$ なら $6$ と答える）：`,
          ko: `화합물에서 산화수의 합은 $0$이라는 규칙($\\text{O} = -2$, ${c.hOrMetal})을 이용하여 $${c.formula}$에서 $\\text{${c.target}}$의 산화수를 구하시오($+6$이면 $6$으로 답함):`,
          ms: `Menggunakan peraturan jumlah sifar nombor pengoksidaan ($\\text{O} = -2$ dan ${c.hOrMetal}), cari nombor pengoksidaan $\\text{${c.target}}$ dalam $${c.formula}$ (jika $+6$, tulis $6$):`,
        },
        latexFormula: `(+${c.hSum}) + x + ${c.oCount}\\times(-2) = 0`,
        answer: `${c.ans}`,
        acceptedEquivalents: [`+${c.ans}`],
        explanationZh: `列零和方程：$(+${c.hSum}) + x + ${c.oCount}\\times(-2) = 0 \\implies x = +${c.ans}$。注意氧原子角标 ${c.oCount} 必须乘上 $-2$！`,
        explanationEn: `(+${c.hSum}) + x + ${c.oCount}(-2) = 0 ⇒ x = +${c.ans}.`,
        explanationI18n: {
          ja: `総和が 0 になる式を立てます：(+${c.hSum}) + x + ${c.oCount}(-2) = 0 より x = +${c.ans} です。酸素原子の数 ${c.oCount} に -2 を掛けるのを忘れないようにしましょう。`,
          ko: `합이 0인 식을 세웁니다: (+${c.hSum}) + x + ${c.oCount}(-2) = 0에서 x = +${c.ans}입니다. 산소 원자 수 ${c.oCount}에 -2를 곱하는 것을 잊지 마십시오.`,
          ms: `Bina persamaan jumlah sifar: (+${c.hSum}) + x + ${c.oCount}(-2) = 0 ⇒ x = +${c.ans}. Ingat untuk mendarab bilangan atom oksigen ${c.oCount} dengan -2.`,
        },
        scaffolds: [
          {
            promptZh: `${c.oCount} 个氧原子贡献的总负价是多少？`,
            promptEn: `Total negative charge from ${c.oCount} oxygen atoms:`,
            promptI18n: {
              ja: `酸素原子 ${c.oCount} 個による負の酸化数の合計はいくつですか。`,
              ko: `산소 원자 ${c.oCount}개가 기여하는 음의 산화수 합은 얼마입니까?`,
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
      if (dTier === "challenge") {
        // Dilution: find volume of distilled water ADDED (Delta V = V2 - V1), assuming additive volumes
        const c1 = rng.pick([2.0, 2.5, 4.0, 5.0]);
        const v1Ml = rng.pick([50, 100]);
        const factor = rng.pick([4, 5]);
        const c2 = Math.round((c1 / factor) * 100) / 100;
        const v2Ml = v1Ml * factor;
        const addedWaterMl = v2Ml - v1Ml;
        return {
          promptZh: `现将 $V_1 = ${v1Ml}\\text{ mL}$、浓度为 $c_1 = ${c1}\\text{ mol/L}$ 的浓溶液加蒸馏水稀释至 $c_2 = ${c2}\\text{ mol/L}$（忽略混合体积变化）。求**需要加入蒸馏水的体积** $\\Delta V$（单位 $\\text{mL}$）：`,
          promptEn: `To dilute $V_1 = ${v1Ml}\\text{ mL}$ of a $c_1 = ${c1}\\text{ mol/L}$ stock solution to $c_2 = ${c2}\\text{ mol/L}$ (assuming additive volumes), how many $\\text{mL}$ of distilled water must be **added**?`,
          promptI18n: {
            ja: `$c_1 = ${c1}\\text{ mol/L}$ の原液 $V_1 = ${v1Ml}\\text{ mL}$ に蒸留水を加えて $c_2 = ${c2}\\text{ mol/L}$ に希釈します（体積変化は無視します）。**加える蒸留水の体積**は何 $\\text{mL}$ ですか。`,
            ko: `농도 $c_1 = ${c1}\\text{ mol/L}$인 원액 $V_1 = ${v1Ml}\\text{ mL}$에 증류수를 넣어 $c_2 = ${c2}\\text{ mol/L}$로 희석하려고 합니다(부피 변화 무시). **더 넣어야 하는 증류수의 부피**는 몇 $\\text{mL}$입니까?`,
            ms: `Untuk mencairkan $V_1 = ${v1Ml}\\text{ mL}$ larutan stok $c_1 = ${c1}\\text{ mol/L}$ kepada $c_2 = ${c2}\\text{ mol/L}$ (anggap isi padu bersifat tambah), berapakah isi padu air suling (dalam $\\text{mL}$) yang perlu **ditambah**?`,
          },
          latexFormula: `c_1 V_1 = c_2 V_2,\\quad \\Delta V = V_2 - V_1`,
          answer: `${addedWaterMl}`,
          unit: "mL",
          explanationZh: `由溶质守恒 $c_1 V_1 = c_2 V_2$ 得稀释后总体积 $V_2 = \\frac{${c1} \\times ${v1Ml}}{${c2}} = ${v2Ml}\\text{ mL}$；注意题目问的是**新加入的水体积** $\\Delta V = V_2 - V_1 = ${v2Ml} - ${v1Ml} = ${addedWaterMl}\\text{ mL}$（切勿直接填总体积 ${v2Ml} mL！）。`,
          explanationEn: `By $c_1 V_1 = c_2 V_2$, final total volume $V_2 = ${v2Ml}\\text{ mL}$. Water added = $V_2 - V_1 = ${v2Ml} - ${v1Ml} = ${addedWaterMl}\\text{ mL}$ (do not confuse total volume ${v2Ml} mL with added water).`,
          explanationI18n: {
            ja: `$c_1 V_1 = c_2 V_2$ より希釈後の全量 $V_2 = ${v2Ml}\\text{ mL}$ です。求めるのは加える水の量なので $\\Delta V = V_2 - V_1 = ${v2Ml} - ${v1Ml} = ${addedWaterMl}\\text{ mL}$ となります（全量 ${v2Ml} mL と混同しないようにしましょう）。`,
            ko: `$c_1 V_1 = c_2 V_2$에 의해 희석 후 전체 부피는 $V_2 = ${v2Ml}\\text{ mL}$입니다. 더 넣어야 할 증류수의 양은 $\\Delta V = V_2 - V_1 = ${v2Ml} - ${v1Ml} = ${addedWaterMl}\\text{ mL}$입니다(전체 부피 ${v2Ml} mL와 혼동하지 마십시오).`,
            ms: `Melalui $c_1 V_1 = c_2 V_2$, jumlah isi padu akhir ialah $V_2 = ${v2Ml}\\text{ mL}$. Air suling yang ditambah = $V_2 - V_1 = ${v2Ml} - ${v1Ml} = ${addedWaterMl}\\text{ mL}$ (jangan keliru dengan jumlah isi padu ${v2Ml} mL).`,
          },
          scaffolds: [
            {
              promptZh: `第一步：根据 c₁V₁ = c₂V₂，稀释后的溶液总体积 V₂ 是多少 mL？`,
              promptEn: `Step 1: Using c₁V₁ = c₂V₂, what is the final total volume V₂ (in mL)?`,
              promptI18n: {
                ja: `ステップ 1：$c_1 V_1 = c_2 V_2$ より、希釈後の溶液全体の体積 $V_2$（mL）はいくつですか。`,
                ko: `1단계: $c_1 V_1 = c_2 V_2$를 이용하면 희석 후 전체 용액의 부피 $V_2$(mL)는 얼마입니까?`,
                ms: `Langkah 1: Menggunakan $c_1 V_1 = c_2 V_2$, berapakah jumlah isi padu akhir $V_2$ (dalam mL)?`,
              },
              hintZh: `(${c1} × ${v1Ml}) ÷ ${c2}`,
              hintEn: `(${c1} × ${v1Ml}) / ${c2}`,
              expectedAnswer: `${v2Ml}`,
            },
            {
              promptZh: `第二步：用总体积 ${v2Ml} mL 减去原有浓溶液体积 ${v1Ml} mL，得需加水量：`,
              promptEn: `Step 2: Subtract initial volume ${v1Ml} mL from ${v2Ml} mL:`,
              promptI18n: {
                ja: `ステップ 2：全体の体積 ${v2Ml} mL から元の原液 ${v1Ml} mL を引きなさい：`,
                ko: `2단계: 전체 부피 ${v2Ml} mL에서 처음 원액 ${v1Ml} mL를 빼시오:`,
                ms: `Langkah 2: Tolak isi padu awal ${v1Ml} mL daripada ${v2Ml} mL:`,
              },
              hintZh: `${v2Ml} - ${v1Ml}`,
              hintEn: `${v2Ml} - ${v1Ml}`,
              expectedAnswer: `${addedWaterMl}`,
            },
          ],
          distractors: [
            { text: `${v2Ml}`, misconceptionTag: "misc_chem_ml_not_liter" },
            { text: `${v2Ml + v1Ml}` },
            { text: `${v1Ml}` },
          ],
          misconceptionsByValue: { [`${v2Ml}`]: "misc_chem_ml_not_liter" },
        };
      }

      const moles = dTier === "standard" ? rng.pick([0.3, 0.6, 1.2, 1.5]) : rng.pick([0.2, 0.5, 1.0]);
      const volMl = dTier === "standard" ? rng.pick([200, 250, 400]) : rng.pick([250, 500]);
      const volL = volMl / 1000;
      const molarity = Math.round((moles / volL) * 100) / 100;
      const mlTrap = Math.round((moles / volMl) * 10000) / 10000;
      return {
        promptZh: `将 $n = ${moles}\\text{ mol}$ 的溶质完全溶解并定容成 $V = ${volMl}\\text{ mL}$ 溶液，求该溶液的物质的量浓度 $c$（单位 $\\text{mol/L}$）：`,
        promptEn: `If $n = ${moles}\\text{ mol}$ of solute is dissolved to make $V = ${volMl}\\text{ mL}$ of solution, find its molarity $c$ (in $\\text{mol/L}$):`,
        promptI18n: {
          ja: `溶質 $n = ${moles}\\text{ mol}$ を溶かして $V = ${volMl}\\text{ mL}$ の溶液をつくりました。この溶液のモル濃度 $c$（単位 $\\text{mol/L}$）を求めなさい：`,
          ko: `용질 $n = ${moles}\\text{ mol}$을 녹여 $V = ${volMl}\\text{ mL}$의 용액을 만들었습니다. 이 용액의 몰농도 $c$(단위 $\\text{mol/L}$)를 구하시오:`,
          ms: `Jika $n = ${moles}\\text{ mol}$ zat terlarut dilarutkan untuk menghasilkan $V = ${volMl}\\text{ mL}$ larutan, cari kemolarannya $c$ (dalam $\\text{mol/L}$):`,
        },
        latexFormula: `c = \\frac{n}{V\\,(\\text{L})}`,
        answer: `${molarity}`,
        unit: "mol/L",
        explanationZh: `先将体积换算为升：$V = ${volMl}\\text{ mL} = ${volL}\\text{ L}$；再算 $c = ${moles} / ${volL} = ${molarity}\\text{ mol/L}$（切忌不换算单位直接除以 ${volMl} 得 ${mlTrap}）。`,
        explanationEn: `Convert ${volMl} mL = ${volL} L first; then c = ${moles} / ${volL} = ${molarity} mol/L.`,
        explanationI18n: {
          ja: `まず ${volMl} mL = ${volL} L に換算し、c = ${moles} / ${volL} = ${molarity} mol/L と求めます（換算せずに ${volMl} で割って ${mlTrap} としないよう注意しましょう）。`,
          ko: `먼저 ${volMl} mL = ${volL} L로 환산한 뒤 c = ${moles} / ${volL} = ${molarity} mol/L로 계산합니다(단위 환산 없이 ${volMl}로 나누어 ${mlTrap}로 잘못 구하지 마십시오).`,
          ms: `Tukar ${volMl} mL = ${volL} L dahulu; kemudian c = ${moles} / ${volL} = ${molarity} mol/L (jangan bahagi terus dengan ${volMl} hingga mendapat ${mlTrap}).`,
        },
        scaffolds: [
          {
            promptZh: `先把 ${volMl} mL 除以 1000 换算成多少 L？`,
            promptEn: `Convert ${volMl} mL to L:`,
            promptI18n: {
              ja: `${volMl} mL を L に換算するといくつですか。`,
              ko: `${volMl} mL를 L로 환산하면 얼마입니까?`,
              ms: `Tukar ${volMl} mL kepada L:`,
            },
            hintZh: `${volMl} ÷ 1000`,
            hintEn: `Divide by 1000`,
            hintI18n: { ja: `1000 で割ります`, ko: `1000으로 나눕니다`, ms: `Bahagi dengan 1000` },
            expectedAnswer: `${volL}`,
          },
          {
            promptZh: `计算 c = ${moles} ÷ ${volL} = ?`,
            promptEn: `Compute ${moles} / ${volL}:`,
            promptI18n: {
              ja: `${moles} / ${volL} を計算しなさい：`,
              ko: `${moles} / ${volL}를 계산하시오:`,
              ms: `Kira ${moles} / ${volL}:`,
            },
            hintZh: `单位 mol/L`,
            hintEn: `In mol/L`,
            hintI18n: { ja: `単位は mol/L です`, ko: `단위는 mol/L입니다`, ms: `Dalam mol/L` },
            expectedAnswer: `${molarity}`,
          },
        ],
        distractors: [
          { text: `${mlTrap}`, misconceptionTag: "misc_chem_ml_not_liter" },
          { text: `${Math.round(moles * volL * 1000) / 1000}` },
          { text: `${molarity * 10}` },
        ],
        misconceptionsByValue: { [`${mlTrap}`]: "misc_chem_ml_not_liter" },
      };
    }

    // 34. Biology: Osmosis water movement & potato strip mass (zero distractor collision + challenge isotonic point!)
    case "bio_osmosis_mass": {
      if (dTier === "challenge") {
        // Isotonic concentration interpolation: +gain g in lowConc%, -gain g in highConc% -> isotonic at midpoint!
        const lowConc = rng.pick([1, 2, 3]);
        const halfGap = rng.pick([2, 3]);
        const isoConc = lowConc + halfGap;
        const highConc = isoConc + halfGap;
        const deltaMass = rng.pick([1.2, 1.5, 1.8]);
        return {
          promptZh: `将相同规格的马铃薯条分别浸入不同浓度蔗糖溶液中：在 $${lowConc}\\%$ 溶液中吸水增重 $+${deltaMass}\\text{ g}$，在 $${highConc}\\%$ 溶液中失水减重 $-${deltaMass}\\text{ g}$。若质量变化与外液浓度在近等渗区呈线性关系，该马铃薯细胞液的等渗蔗糖浓度是多少 $\\%$（填数字，如 $4$）？`,
          promptEn: `Identical potato strips gain $+${deltaMass}\\text{ g}$ in a $${lowConc}\\%$ sucrose solution and lose $-${deltaMass}\\text{ g}$ in a $${highConc}\\%$ sucrose solution. Assuming linear mass change near the isotonic point, estimate the isotonic sucrose concentration (in $\\%$):`,
          promptI18n: {
            ja: `同じ大きさのジャガイモ片を異なる濃度のスクロース溶液に浸したところ、$${lowConc}\\%$ 溶液では $+${deltaMass}\\text{ g}$ 増加し、$${highConc}\\%$ 溶液では $-${deltaMass}\\text{ g}$ 減少しました。等張付近で質量変化が濃度に比例するとき、細胞液と等張なスクロース濃度（$\\%$）を求めなさい：`,
            ko: `같은 크기의 감자 조각을 서로 다른 농도의 설탕 용액에 담갔더니 $${lowConc}\\%$ 용액에서는 $+${deltaMass}\\text{ g}$ 증가하고, $${highConc}\\%$ 용액에서는 $-${deltaMass}\\text{ g}$ 감소했습니다. 등장점 부근에서 질량 변화가 농도에 선형 비례할 때, 세포액의 등장 설탕 농도($\\%$)는 얼마입니까?`,
            ms: `Jalur kentang yang serupa bertambah jisim $+${deltaMass}\\text{ g}$ dalam larutan sukrosa $${lowConc}\\%$ dan berkurang $-${deltaMass}\\text{ g}$ dalam larutan $${highConc}\\%$. Dengan menganggap perubahan jisim adalah linear, anggarkan kepekatan sukrosa isotonik (dalam $\\%$):`,
          },
          answer: `${isoConc}`,
          acceptedEquivalents: [`${isoConc}%`],
          unit: "%",
          explanationZh: `等渗点对应净水分进出为 $0$（$\\Delta m = 0$）。因 $+${deltaMass}\\text{ g}$ 与 $-${deltaMass}\\text{ g}$ 幅度对称相等，等渗浓度恰为 $${lowConc}\\%$ 与 $${highConc}\\%$ 的中点：$\\frac{${lowConc} + ${highConc}}{2} = ${isoConc}\\%$。`,
          explanationEn: `At the isotonic point Δm = 0. Since +${deltaMass} g and -${deltaMass} g have equal magnitude, the x-intercept lies halfway between ${lowConc}% and ${highConc}%: (${lowConc} + ${highConc}) / 2 = ${isoConc}%.`,
          explanationI18n: {
            ja: `等張点では水の移動がつり合い質量変化が 0 になります。$+${deltaMass}\\text{ g}$ と $-${deltaMass}\\text{ g}$ は大きさが等しいため、等張濃度は $${lowConc}\\%$ と $${highConc}\\%$ の中点 $(${lowConc} + ${highConc}) / 2 = ${isoConc}\\%$ です。`,
            ko: `등장점에서는 질량 변화가 0이 됩니다. $+${deltaMass}\\text{ g}$와 $-${deltaMass}\\text{ g}$의 크기가 같으므로 등장 농도는 $${lowConc}\\%$와 $${highConc}\\%$의 중점인 $(${lowConc} + ${highConc}) / 2 = ${isoConc}\\%$입니다.`,
            ms: `Pada titik isotonik, perubahan jisim ialah 0. Oleh sebab $+${deltaMass}\\text{ g}$ dan $-${deltaMass}\\text{ g}$ mempunyai magnitud yang sama, kepekatan isotonik ialah titik tengah $(${lowConc} + ${highConc}) / 2 = ${isoConc}\\%$.`,
          },
          scaffolds: [
            {
              promptZh: `第一步：等渗溶液中马铃薯条的质量变化 Δm 等于多少 g？`,
              promptEn: `Step 1: What is the net mass change Δm (in g) at the isotonic concentration?`,
              promptI18n: {
                ja: `ステップ 1：等張液の中では質量変化 Δm（g）はいくつになりますか。`,
                ko: `1단계: 등장액에서 감자 조각의 질량 변화 Δm(g)은 얼마입니까?`,
                ms: `Langkah 1: Berapakah perubahan jisim bersih Δm (g) pada kepekatan isotonik?`,
              },
              hintZh: `吸水与失水动态平衡`,
              hintEn: `Zero net water movement`,
              hintI18n: {
                ja: `水の出入りがつり合い正味の移動は 0 です`,
                ko: `물의 순이동량이 0입니다`,
                ms: `Tiada pergerakan bersih air (0)`,
              },
              expectedAnswer: `0`,
            },
            {
              promptZh: `第二步：求 ${lowConc} 与 ${highConc} 的中点平均值：`,
              promptEn: `Step 2: Find the midpoint of ${lowConc} and ${highConc}:`,
              promptI18n: {
                ja: `ステップ 2：${lowConc} と ${highConc} の中点を求めなさい：`,
                ko: `2단계: ${lowConc}와 ${highConc}의 평균(중점)을 구하시오:`,
                ms: `Langkah 2: Cari titik tengah bagi ${lowConc} dan ${highConc}:`,
              },
              hintZh: `(${lowConc} + ${highConc}) ÷ 2`,
              hintEn: `(${lowConc} + ${highConc}) / 2`,
              expectedAnswer: `${isoConc}`,
            },
          ],
          distractors: [
            { text: `${highConc}`, misconceptionTag: "misc_bio_osmosis_reverse" },
            { text: `${lowConc}`, misconceptionTag: "misc_bio_osmosis_reverse" },
            { text: `${lowConc + highConc}` },
          ],
          misconceptionsByValue: {
            [`${highConc}`]: "misc_bio_osmosis_reverse",
            [`${lowConc}`]: "misc_bio_osmosis_reverse",
          },
        };
      }

      const cellConc = rng.pick([2, 3, 4]);
      const extConc = rng.pick([8, 10, 12]);
      // Choose initMass >= 15 so finalMass >= 13 never collides with (extConc - cellConc) <= 10!
      const initMass = dTier === "standard" ? rng.int(16, 24) : rng.int(15, 20);
      const delta = rng.pick([1, 2]);
      const finalMass = initMass - delta;
      const gainTrap = initMass + delta;
      return {
        promptZh: `某马铃薯细胞液浓度相当于 $${cellConc}\\%$ 蔗糖溶液。将初始质量为 $${initMass}\\text{ g}$ 的马铃薯条浸入 $${extConc}\\%$ 的高浓度蔗糖溶液中一段时间，测得跨膜净移动水质量为 $${delta}\\text{ g}$。此时马铃薯条的质量变为多少 $\\text{g}$？`,
        promptEn: `Potato tissue (internal sap $\\approx ${cellConc}\\%$ sucrose, initial mass $${initMass}\\text{ g}$) is immersed in a hypertonic $${extConc}\\%$ sucrose solution, causing $${delta}\\text{ g}$ of osmotic water movement. Find its new mass (in $\\text{g}$):`,
        promptI18n: {
          ja: `ジャガイモの組織（細胞液 $\\approx ${cellConc}\\%$ スクロース相当、初めの質量 $${initMass}\\text{ g}$）を高張の $${extConc}\\%$ スクロース溶液に浸したところ、浸透により $${delta}\\text{ g}$ の水が移動しました。このときの組織の質量（単位 $\\text{g}$）を求めなさい：`,
          ko: `감자 조직(세포액 $\\approx ${cellConc}\\%$ 설탕 용액에 해당, 처음 질량 $${initMass}\\text{ g}$)을 고장액인 $${extConc}\\%$ 설탕 용액에 담갔더니 삼투에 의해 $${delta}\\text{ g}$의 물이 이동했습니다. 이때 감자 조직의 질량(단위 $\\text{g}$)을 구하시오:`,
          ms: `Tisu kentang (sap sel $\\approx ${cellConc}\\%$ sukrosa, jisim awal $${initMass}\\text{ g}$) direndam dalam larutan sukrosa hipertonik $${extConc}\\%$, menyebabkan $${delta}\\text{ g}$ air bergerak secara osmosis. Cari jisim baharunya (dalam $\\text{g}$):`,
        },
        answer: `${finalMass}`,
        unit: "g",
        explanationZh: `外界溶液浓度（$${extConc}\\%$）高于细胞液（$${cellConc}\\%$），水分子顺水势梯度向细胞外渗透流失，马铃薯条失水质量减小为 $${initMass} - ${delta} = ${finalMass}\\text{ g}$。`,
        explanationEn: `Since external ${extConc}% > internal ${cellConc}% (hypertonic), water exits the cells by osmosis, reducing mass to ${initMass} - ${delta} = ${finalMass} g.`,
        explanationI18n: {
          ja: `外液 ${extConc}% > 細胞液 ${cellConc}%（高張）なので、水は浸透によって細胞外へ出ていき、質量は ${initMass} - ${delta} = ${finalMass} g に減少します。`,
          ko: `외부 용액 ${extConc}% > 세포액 ${cellConc}%(고장액)이므로 물이 삼투에 의해 세포 밖으로 빠져나가 질량이 ${initMass} - ${delta} = ${finalMass} g으로 감소합니다.`,
          ms: `Oleh sebab larutan luar ${extConc}% > sap sel ${cellConc}% (hipertonik), air keluar dari sel secara osmosis dan jisim berkurang kepada ${initMass} - ${delta} = ${finalMass} g.`,
        },
        scaffolds: [
          {
            promptZh: `第一步：外界蔗糖浓度 ${extConc}% 高于细胞液 ${cellConc}%，水分子向细胞外流出（填 1）还是向内流入（填 2）？`,
            promptEn: `Step 1: Since external ${extConc}% > internal ${cellConc}%, does water move out of the cell (1) or into the cell (2)?`,
            promptI18n: {
              ja: `ステップ 1：外液 ${extConc}% > 細胞液 ${cellConc}% なので、水は細胞の外へ出ますか（1）、内へ入りますか（2）？（1 / 2）`,
              ko: `1단계: 바깥 용액 ${extConc}% > 세포액 ${cellConc}%이므로 물은 세포 밖으로 나갑니까(1), 안으로 들어옵니까(2)? (1/2)`,
              ms: `Langkah 1: Oleh sebab larutan luar ${extConc}% > sap sel ${cellConc}%, adakah air bergerak keluar dari sel (1) atau masuk ke dalam sel (2)?`,
            },
            hintZh: `高渗外液导致细胞失水`,
            hintEn: `Hypertonic outside draws water out`,
            hintI18n: {
              ja: `高張の外液により細胞から水が出ていきます`,
              ko: `고장액에 담그면 세포 밖으로 물이 빠져나갑니다`,
              ms: `Larutan luar hipertonik menarik air keluar dari sel`,
            },
            expectedAnswer: `1`,
          },
          {
            promptZh: `第二步：用初始质量 ${initMass} g 减去流失的水分 ${delta} g：`,
            promptEn: `Step 2: Compute ${initMass} - ${delta}:`,
            promptI18n: {
              ja: `ステップ 2：${initMass} - ${delta} を計算しなさい：`,
              ko: `2단계: ${initMass} - ${delta}를 계산하시오:`,
              ms: `Langkah 2: Kira ${initMass} - ${delta}:`,
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

    // 35. Biology: Net vs Gross Photosynthesis (2-step scaffold + 24h light-dark cycle challenge!)
    case "bio_photo_net_gross": {
      if (dTier === "challenge") {
        // 24-hour cycle: lightHours of light (net O2 gain rate pNet) + darkHours of dark (respiration O2 loss rate rDark)
        const lightHours = rng.pick([10, 12, 14]);
        const darkHours = 24 - lightHours;
        const rDark = rng.int(3, 5);
        const pNet = rng.int(8, 12);
        const netDayGain = lightHours * pNet - darkHours * rDark;
        const doubleCountRespTrap = lightHours * pNet - 24 * rDark;
        const ignoreNightTrap = lightHours * pNet;
        return {
          promptZh: `某密闭生态箱中的植物在适宜光照下净光合释放 $\\text{O}_2$ 速率为 $${pNet}\\text{ mg/h}$，黑暗下呼吸消耗 $\\text{O}_2$ 速率为 $${rDark}\\text{ mg/h}$。若一昼夜（$24\\text{ h}$）给予 $${lightHours}\\text{ h}$ 光照、$${darkHours}\\text{ h}$ 黑暗，求一昼夜生态箱内 $\\text{O}_2$ 的净积累量（单位 $\\text{mg}$）：`,
          promptEn: `A plant has a net photosynthetic $\\text{O}_2$ release rate of $${pNet}\\text{ mg/h}$ in light and a dark respiration consumption rate of $${rDark}\\text{ mg/h}$. Over a $24\\text{ h}$ cycle with $${lightHours}\\text{ h}$ of light and $${darkHours}\\text{ h}$ of darkness, what is the total net $\\text{O}_2$ accumulation (in $\\text{mg}$)?`,
          promptI18n: {
            ja: `ある植物は明期に見かけの光合成速度として $\\text{O}_2$ を $${pNet}\\text{ mg/h}$ 放出し、暗期に呼吸として $\\text{O}_2$ を $${rDark}\\text{ mg/h}$ 吸収します。1 日（$24\\text{ h}$）のうち明期が $${lightHours}\\text{ h}$、暗期が $${darkHours}\\text{ h}$ のとき、1 日あたりの正味の $\\text{O}_2$ 増加量（単位 $\\text{mg}$）を求めなさい：`,
            ko: `어떤 식물은 명기에 순광합성으로 $\\text{O}_2$를 $${pNet}\\text{ mg/h}$씩 방출하고, 암기에 호흡으로 $\\text{O}_2$를 $${rDark}\\text{ mg/h}$씩 소비합니다. 하루($24\\text{ h}$) 중 명기가 $${lightHours}\\text{ h}$, 암기가 $${darkHours}\\text{ h}$일 때 하루 동안의 순 $\\text{O}_2$ 축적량(단위 $\\text{mg}$)을 구하시오:`,
            ms: `Sejenis tumbuhan mempunyai kadar pembebasan $\\text{O}_2$ fotosintesis bersih $${pNet}\\text{ mg/h}$ dalam cahaya dan kadar penggunaan $\\text{O}_2$ respirasi $${rDark}\\text{ mg/h}$ dalam gelap. Bagi kitaran $24\\text{ h}$ dengan $${lightHours}\\text{ h}$ cahaya dan $${darkHours}\\text{ h}$ gelap, berapakah jumlah pengumpulan bersih $\\text{O}_2$ (dalam $\\text{mg}$)?`,
          },
          latexFormula: `\\Delta \\text{O}_2 = ${lightHours} P_{\\text{net}} - ${darkHours} R`,
          answer: `${netDayGain}`,
          unit: "mg",
          explanationZh: `光照期的“净光合速率”$${pNet}\\text{ mg/h}$ 已经扣除了白天的呼吸消耗！因此只需用白天净积累 $${lightHours} \\times ${pNet} = ${lightHours * pNet}\\text{ mg}$ 减去夜间黑暗消耗 $${darkHours} \\times ${rDark} = ${darkHours * rDark}\\text{ mg}$，得 $${netDayGain}\\text{ mg}$（切忌重复扣除白天呼吸错算成 $${doubleCountRespTrap}\\text{ mg}$）。`,
          explanationEn: `Since $P_{\\text{net}}$ already subtracts daytime respiration, net 24 h gain = ${lightHours} × ${pNet} - ${darkHours} × ${rDark} = ${lightHours * pNet} - ${darkHours * rDark} = ${netDayGain} mg (do not subtract daytime respiration twice to get ${doubleCountRespTrap} mg).`,
          explanationI18n: {
            ja: `見かけの光合成速度 $${pNet}\\text{ mg/h}$ にはすでに昼間の呼吸消費が差し引かれています。したがって明期の増加量 ${lightHours} × ${pNet} = ${lightHours * pNet} mg から暗期の消費量 ${darkHours} × ${rDark} = ${darkHours * rDark} mg を引いて ${netDayGain} mg です（昼の呼吸を二重に引いて ${doubleCountRespTrap} mg としないよう注意しましょう）。`,
            ko: `순광합성 속도 $${pNet}\\text{ mg/h}$에는 이미 낮 동안의 호흡량이 차감되어 있습니다. 따라서 낮 순축적량 ${lightHours} × ${pNet} = ${lightHours * pNet} mg에서 밤 호흡 소비량 ${darkHours} × ${rDark} = ${darkHours * rDark} mg만 빼면 ${netDayGain} mg입니다(낮 호흡을 중복 차감하여 ${doubleCountRespTrap} mg로 계산하지 마십시오).`,
            ms: `Oleh sebab $P_{\\text{net}}$ sudah menolak respirasi waktu siang, pengumpulan bersih 24 jam = ${lightHours} × ${pNet} - ${darkHours} × ${rDark} = ${netDayGain} mg (jangan tolak respirasi siang dua kali sehingga mendapat ${doubleCountRespTrap} mg).`,
          },
          scaffolds: [
            {
              promptZh: `第一步：计算 ${lightHours} h 光照期间净释放的 O₂ 总量（${lightHours} × ${pNet}）：`,
              promptEn: `Step 1: Net O₂ accumulated during ${lightHours} h of light (${lightHours} × ${pNet}):`,
              promptI18n: {
                ja: `ステップ 1：明期 ${lightHours} h の正味の O₂ 放出量（${lightHours} × ${pNet}）はいくつですか。`,
                ko: `1단계: 명기 ${lightHours} h 동안의 순 O₂ 방출량(${lightHours} × ${pNet})은 얼마입니까?`,
                ms: `Langkah 1: Jumlah O₂ bersih sepanjang ${lightHours} h cahaya (${lightHours} × ${pNet}):`,
              },
              hintZh: `${lightHours} × ${pNet}`,
              hintEn: `${lightHours} × ${pNet}`,
              expectedAnswer: `${lightHours * pNet}`,
            },
            {
              promptZh: `第二步：减去 ${darkHours} h 黑暗期呼吸消耗的 ${darkHours * rDark} mg，一昼夜净积累为：`,
              promptEn: `Step 2: Subtract dark loss ${darkHours} × ${rDark} = ${darkHours * rDark} from ${lightHours * pNet}:`,
              promptI18n: {
                ja: `ステップ 2：${lightHours * pNet} から暗期の消費量 ${darkHours * rDark} を引きなさい：`,
                ko: `2단계: ${lightHours * pNet}에서 암기 호흡 소비량 ${darkHours * rDark}를 빼시오:`,
                ms: `Langkah 2: Tolak penggunaan gelap ${darkHours * rDark} daripada ${lightHours * pNet}:`,
              },
              hintZh: `${lightHours * pNet} - ${darkHours * rDark}`,
              hintEn: `${lightHours * pNet} - ${darkHours * rDark}`,
              expectedAnswer: `${netDayGain}`,
            },
          ],
          distractors: [
            { text: `${doubleCountRespTrap}`, misconceptionTag: "misc_bio_net_minus_resp" },
            { text: `${ignoreNightTrap}` },
            { text: `${lightHours * pNet + darkHours * rDark}` },
          ],
          misconceptionsByValue: { [`${doubleCountRespTrap}`]: "misc_bio_net_minus_resp" },
        };
      }

      const rDark = dTier === "standard" ? rng.int(5, 8) : rng.int(3, 6);
      const pNet = dTier === "standard" ? rng.int(12, 19) : rng.int(9, 14);
      const pGross = pNet + rDark;
      const subTrap = pNet - rDark;
      return {
        promptZh: `密闭透光叶室实验测得：某植物在完全黑暗下 $\\text{O}_2$ 吸收速率（呼吸速率）为 $${rDark}\\text{ mg/h}$；在适宜光照下叶室 $\\text{O}_2$ 净增加速率（净光合速率）为 $${pNet}\\text{ mg/h}$。求该光照下叶绿体的真（总）光合产氧速率（$\\text{mg/h}$）：`,
        promptEn: `A plant consumes $${rDark}\\text{ mg/h}$ of $\\text{O}_2$ in darkness (respiration) and shows a net $\\text{O}_2$ release of $${pNet}\\text{ mg/h}$ in light. Find its gross photosynthetic $\\text{O}_2$ production rate ($\\text{mg/h}$):`,
        promptI18n: {
          ja: `ある植物は暗所で $\\text{O}_2$ を $${rDark}\\text{ mg/h}$ 吸収し（呼吸速度）、光を当てると $\\text{O}_2$ を見かけ上 $${pNet}\\text{ mg/h}$ 放出します（見かけの光合成速度）。この光条件での真の光合成速度（$\\text{O}_2$ 発生速度、$\\text{mg/h}$）を求めなさい：`,
          ko: `어떤 식물은 암실에서 $\\text{O}_2$를 $${rDark}\\text{ mg/h}$ 흡수하고(호흡), 빛을 비추면 $\\text{O}_2$를 $${pNet}\\text{ mg/h}$씩 순방출합니다(순광합성). 이 빛 조건에서 총광합성에 의한 $\\text{O}_2$ 생성 속도($\\text{mg/h}$)를 구하시오:`,
          ms: `Sejenis tumbuhan menggunakan $${rDark}\\text{ mg/h}$ $\\text{O}_2$ dalam gelap (respirasi) dan membebaskan $\\text{O}_2$ bersih sebanyak $${pNet}\\text{ mg/h}$ dalam cahaya. Cari kadar penghasilan $\\text{O}_2$ fotosintesis kasar ($\\text{mg/h}$):`,
        },
        latexFormula: `P_{\\text{gross}} = P_{\\text{net}} + R_{\\text{resp}}`,
        answer: `${pGross}`,
        unit: "mg/h",
        explanationZh: `光照下呼吸作用照常进行，真光合速率 $P_{\\text{gross}} = P_{\\text{net}} + R = ${pNet} + ${rDark} = ${pGross}\\text{ mg/h}$（切忌误减得 ${subTrap}）。`,
        explanationEn: `Gross photosynthesis = Net O₂ release + Dark respiration = ${pNet} + ${rDark} = ${pGross} mg/h.`,
        explanationI18n: {
          ja: `光の下でも呼吸は続いているため、真の光合成速度 = 見かけの O₂ 放出速度 + 呼吸速度 = ${pNet} + ${rDark} = ${pGross} mg/h です（引き算して ${subTrap} としないよう注意しましょう）。`,
          ko: `빛이 있을 때도 호흡은 계속되므로 총광합성 속도 = 순 O₂ 방출 속도 + 호흡 속도 = ${pNet} + ${rDark} = ${pGross} mg/h입니다(빼서 ${subTrap}로 계산하지 않도록 주의하십시오).`,
          ms: `Fotosintesis kasar = Pembebasan O₂ bersih + Respirasi dalam gelap = ${pNet} + ${rDark} = ${pGross} mg/h (respirasi tetap berlaku dalam cahaya; jangan tolak hingga mendapat ${subTrap}).`,
        },
        scaffolds: [
          {
            promptZh: `第一步：光照条件下细胞呼吸每小时消耗多少 mg O₂？`,
            promptEn: `Step 1: How many mg/h of O₂ are consumed by cellular respiration during illumination?`,
            promptI18n: {
              ja: `ステップ 1：光を当てている間、呼吸によって毎時何 mg の O₂ が消費されますか。`,
              ko: `1단계: 빛을 비추는 동안 세포 호흡으로 시간당 몇 mg의 O₂가 소비됩니까?`,
              ms: `Langkah 1: Berapakah O₂ (mg/h) yang digunakan oleh respirasi sel semasa pencahayaan?`,
            },
            hintZh: `呼吸速率保持不变`,
            hintEn: `Equals dark respiration rate`,
            hintI18n: {
              ja: `暗所での呼吸速度と等しくなります`,
              ko: `암실에서의 호흡 속도와 같습니다`,
              ms: `Sama dengan kadar respirasi dalam gelap`,
            },
            expectedAnswer: `${rDark}`,
          },
          {
            promptZh: `第二步：将净释放 ${pNet} 与呼吸消耗 ${rDark} 相加，求真光合速率：`,
            promptEn: `Step 2: Add P_net + R (${pNet} + ${rDark}):`,
            promptI18n: {
              ja: `ステップ 2：P_net + R（${pNet} + ${rDark}）を計算しなさい：`,
              ko: `2단계: P_net + R (${pNet} + ${rDark})를 계산하시오:`,
              ms: `Langkah 2: Tambah P_net + R (${pNet} + ${rDark}):`,
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
      if (dTier === "challenge") {
        // Challenge: Maximum producer biomass required across 3 trophic levels -> uses minimum 10% efficiency (x100)!
        const topGain = rng.int(2, 5);
        const maxProducer = topGain * 100;
        const minProducerTrap = topGain * 25;
        const oneStepTenTrap = topGain * 10;
        return {
          promptZh: `在食物链“浮游植物 $\\to$ 小型鱼类 $\\to$ 翠鸟”中，相邻营养级能量传递效率为 $10\\%\\sim 20\\%$。若翠鸟同化量增加 $${topGain}\\text{ kJ}$，**至多**需要消耗多少 $\\text{kJ}$ 浮游植物同化能？`,
          promptEn: `In the food chain Phytoplankton $\\to$ Small Fish $\\to$ Kingfisher (transfer efficiency $10\\%\\text{–}20\\%$), gaining $${topGain}\\text{ kJ}$ at the Kingfisher level requires **at most** how many $\\text{kJ}$ of Phytoplankton energy?`,
          promptI18n: {
            ja: `食物連鎖「植物プランクトン $\\to$ 小魚 $\\to$ カワセミ」（エネルギー効率 $10\\%\\text{–}20\\%$）において、カワセミが $${topGain}\\text{ kJ}$ を同化するには、植物プランクトンのエネルギーが**最大で**何 $\\text{kJ}$ 必要ですか。`,
            ko: `먹이 사슬 "식물성 플랑크톤 $\\to$ 작은 물고기 $\\to$ 물총새"(에너지 전달 효율 $10\\%\\text{–}20\\%$)에서 물총새의 에너지가 $${topGain}\\text{ kJ}$ 증가하려면 식물성 플랑크톤 에너지가 **최대** 몇 $\\text{kJ}$ 필요합니까?`,
            ms: `Dalam rantai makanan Fitoplankton $\\to$ Ikan Kecil $\\to$ Burung Pekaka (kecekapan pemindahan tenaga $10\\%\\text{–}20\\%$), pertambahan $${topGain}\\text{ kJ}$ pada Burung Pekaka memerlukan **paling banyak** berapa $\\text{kJ}$ tenaga Fitoplankton?`,
          },
          answer: `${maxProducer}`,
          unit: "kJ",
          explanationZh: `求“至多消耗生产者”应取**最低**传递效率 $10\\%$（每级反推乘 $10$）：跨越两级需 $${topGain} \\div 10\\% \\div 10\\% = ${topGain} \\times 100 = ${maxProducer}\\text{ kJ}$（若误用 $20\\%$ 会算成最小值 $${minProducerTrap}\\text{ kJ}$）。`,
          explanationEn: `"At most" producer energy corresponds to the minimum 10% transfer rate across 2 steps: ${topGain} / 0.1 / 0.1 = ${maxProducer} kJ (using 20% gives the minimum ${minProducerTrap} kJ).`,
          explanationI18n: {
            ja: `生産者の必要量が「最大」になるのは最小効率 $10\\%$ で 2 段階さかのぼるときです：${topGain} ÷ 0.1 ÷ 0.1 = ${maxProducer} kJ となります（$20\\%$ を使うと最小値の ${minProducerTrap} kJ になります）。`,
            ko: `'최대' 생산자 에너지는 최소 전달 효율 $10\\%$를 적용해 2단계를 거슬러 올라갈 때입니다: ${topGain} ÷ 0.1 ÷ 0.1 = ${maxProducer} kJ입니다($20\\%$를 쓰면 최솟값 ${minProducerTrap} kJ가 됩니다).`,
            ms: `Tenaga pengeluar "paling banyak" diperoleh menggunakan kecekapan minimum $10\\%$ merentasi 2 langkah: ${topGain} / 0.1 / 0.1 = ${maxProducer} kJ (kecekapan 20% memberikan nilai minimum ${minProducerTrap} kJ).`,
          },
          scaffolds: [
            {
              promptZh: `第一步：求“至多”应取最低效率 10%，先算至多需要多少 kJ 小型鱼类（${topGain} ÷ 0.1）：`,
              promptEn: `Step 1: At 10% efficiency, Small Fish energy needed (${topGain} × 10):`,
              promptI18n: {
                ja: `ステップ 1：最小効率 10% のとき、必要な小魚のエネルギー（${topGain} × 10）は何 kJ ですか。`,
                ko: `1단계: 최소 효율 10%일 때 필요한 작은 물고기 에너지(${topGain} × 10)는 몇 kJ입니까?`,
                ms: `Langkah 1: Pada kecekapan 10%, tenaga Ikan Kecil yang diperlukan (${topGain} × 10):`,
              },
              hintZh: `${topGain} × 10`,
              hintEn: `${topGain} × 10`,
              expectedAnswer: `${oneStepTenTrap}`,
            },
            {
              promptZh: `第二步：再按 10% 反推浮游植物（${oneStepTenTrap} × 10）：`,
              promptEn: `Step 2: Multiply ${oneStepTenTrap} by 10 again for Phytoplankton:`,
              promptI18n: {
                ja: `ステップ 2：さらに 10 を掛けて植物プランクトンのエネルギー（kJ）を求めなさい：`,
                ko: `2단계: 다시 10을 곱하여 식물성 플랑크톤 에너지(kJ)를 구하시오:`,
                ms: `Langkah 2: Darabkan ${oneStepTenTrap} dengan 10 sekali lagi:`,
              },
              hintZh: `${oneStepTenTrap} × 10`,
              hintEn: `${oneStepTenTrap} × 10`,
              expectedAnswer: `${maxProducer}`,
            },
          ],
          distractors: [
            { text: `${minProducerTrap}`, misconceptionTag: "misc_bio_trophic_wrong_bound" },
            { text: `${oneStepTenTrap}`, misconceptionTag: "misc_bio_trophic_wrong_bound" },
            { text: `${topGain * 50}` },
          ],
          misconceptionsByValue: {
            [`${minProducerTrap}`]: "misc_bio_trophic_wrong_bound",
            [`${oneStepTenTrap}`]: "misc_bio_trophic_wrong_bound",
          },
        };
      }

      const topGain = dTier === "standard" ? rng.int(3, 6) : rng.int(1, 3);
      const minProducer = topGain * 25;
      const tenPctTrap = topGain * 100;
      const oneStepTrap = topGain * 5;
      return {
        promptZh: `在食物链“牧草 $\\to$ 野兔 $\\to$ 草原狐”中，相邻营养级能量传递效率为 $10\\%\\sim 20\\%$。若草原狐体重增加 $${topGain}\\text{ kg}$，**至少**需要消耗多少 $\\text{kg}$ 牧草？`,
        promptEn: `In the food chain Grass $\\to$ Rabbit $\\to$ Fox (trophic transfer efficiency $10\\%\\text{–}20\\%$), gaining $${topGain}\\text{ kg}$ of Fox biomass requires **at least** how many $\\text{kg}$ of Grass?`,
        promptI18n: {
          ja: `食物連鎖「草 $\\to$ ウサギ $\\to$ キツネ」（栄養段階間のエネルギー効率 $10\\%\\text{–}20\\%$）において、キツネの体重が $${topGain}\\text{ kg}$ 増加するには、草が**少なくとも**何 $\\text{kg}$ 必要ですか。`,
          ko: `먹이 사슬 "풀 $\\to$ 토끼 $\\to$ 여우"(영양 단계 간 에너지 전달 효율 $10\\%\\text{–}20\\%$)에서 여우의 몸무게가 $${topGain}\\text{ kg}$ 늘어나려면 풀이 **최소** 몇 $\\text{kg}$ 필요합니까?`,
          ms: `Dalam rantai makanan Rumput $\\to$ Arnab $\\to$ Musang (kecekapan pemindahan tenaga antara aras trofik $10\\%\\text{–}20\\%$), untuk menambah $${topGain}\\text{ kg}$ biojisim musang, **sekurang-kurangnya** berapa $\\text{kg}$ rumput diperlukan?`,
        },
        answer: `${minProducer}`,
        unit: "kg",
        explanationZh: `求“至少消耗生产者”取最高传递率 $20\\%$（即每级反推除以 $0.2$ 相当于乘 $5$）：跨越两级需 $${topGain} \\div 20\\% \\div 20\\% = ${topGain} \\times 25 = ${minProducer}\\text{ kg}$。`,
        explanationEn: `Minimum producer corresponds to maximum 20% transfer across 2 steps: ${topGain} / 0.2 / 0.2 = ${minProducer} kg.`,
        explanationI18n: {
          ja: `生産者の量を最小にするには最大効率 20% を使って 2 段階さかのぼります（1 段階ごとに 0.2 で割る = 5 倍）：${topGain} / 0.2 / 0.2 = ${minProducer} kg です。`,
          ko: `생산자의 양을 최소로 하려면 최대 효율 20%로 2단계를 거슬러 계산합니다(단계마다 0.2로 나눔 = 5배): ${topGain} / 0.2 / 0.2 = ${minProducer} kg입니다.`,
          ms: `Jumlah pengeluar minimum sepadan dengan pemindahan maksimum 20% merentasi 2 aras (setiap aras bahagi dengan 0.2 = darab 5): ${topGain} / 0.2 / 0.2 = ${minProducer} kg.`,
        },
        scaffolds: [
          {
            promptZh: `求“至少”应选最高传递效率 20%，先求至少需要多少 kg 野兔（${topGain} ÷ 0.2）？`,
            promptEn: `At 20% efficiency, kg of Rabbit needed (${topGain} × 5):`,
            promptI18n: {
              ja: `効率 20% のとき、必要なウサギは何 kg ですか（${topGain} × 5）：`,
              ko: `효율이 20%일 때 필요한 토끼는 몇 kg입니까 (${topGain} × 5):`,
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

    // 37. Computing: Loop accumulator trace (zero distractor collision + stepped range challenge!)
    case "cs_loop_trace": {
      if (dTier === "challenge") {
        // Stepped loop: range(1, 2*k, 2) sums 1 + 3 + ... + (2k-1) = k^2; stop value 2*k is excluded!
        const k = rng.int(3, 6);
        const stopVal = 2 * k; // even, e.g. 6, 8, 10, 12 -> last odd visited is 2k - 1
        const ans = k * k;
        const offByOneTrap = ans + stopVal;
        const ignoreStepTrap = ((stopVal - 1) * stopVal) / 2;
        return {
          promptZh: `阅读带步长的 Python 循环代码：\n\`s = 0\`\n\`for i in range(1, ${stopVal}, 2):\`\n\`    s = s + i\`\n程序运行结束后，变量 \`s\` 的值是多少？`,
          promptEn: `Trace the Python stepped loop:\n\`s = 0\`\n\`for i in range(1, ${stopVal}, 2):\`\n\`    s = s + i\`\nWhat is the final value of \`s\`?`,
          promptI18n: {
            ja: `次のステップ付き Python ループをトレースしなさい：\n\`s = 0\`\n\`for i in range(1, ${stopVal}, 2):\`\n\`    s = s + i\`\n実行終了後の変数 \`s\` の値はいくつですか。`,
            ko: `다음 증가 폭(step)이 있는 Python 반복문을 추적하시오:\n\`s = 0\`\n\`for i in range(1, ${stopVal}, 2):\`\n\`    s = s + i\`\n실행이 끝난 뒤 변수 \`s\`의 값은 얼마입니까?`,
            ms: `Surih gelung Python berlangkah berikut:\n\`s = 0\`\n\`for i in range(1, ${stopVal}, 2):\`\n\`    s = s + i\`\nApakah nilai akhir \`s\`?`,
          },
          answer: `${ans}`,
          explanationZh: `\`range(1, ${stopVal}, 2)\` 从 $1$ 开始每次加 $2$ 且严格小于 $${stopVal}$，故 \`i\` 取前 $${k}$ 个正奇数 $1, 3, \\dots, ${stopVal - 1}$，累加和为 $${k}^2 = ${ans}$。`,
          explanationEn: `\`range(1, ${stopVal}, 2)\` visits odd integers $1, 3, \\dots, ${stopVal - 1}$ (${k} terms), giving $s = ${k}^2 = ${ans}$.`,
          explanationI18n: {
            ja: `\`range(1, ${stopVal}, 2)\` は 1 から 2 ずつ増え、上限 ${stopVal} 未満の奇数 $1, 3, \\dots, ${stopVal - 1}$（計 ${k} 個）をとります。したがって和は $s = ${k}^2 = ${ans}$ です。`,
            ko: `\`range(1, ${stopVal}, 2)\`는 1부터 2씩 증가하며 상한 ${stopVal} 미만의 홀수 $1, 3, \\dots, ${stopVal - 1}$(총 ${k}개)을 순회하므로 합은 $s = ${k}^2 = ${ans}$입니다.`,
            ms: `\`range(1, ${stopVal}, 2)\` mengambil integer ganjil $1, 3, \\dots, ${stopVal - 1}$ (${k} sebutan), maka hasil tambahnya ialah $s = ${k}^2 = ${ans}$.`,
          },
          scaffolds: [
            {
              promptZh: `第一步：在 range(1, ${stopVal}, 2) 中，变量 i 取到的最后一个奇数是多少？`,
              promptEn: `Step 1: What is the last odd integer generated by range(1, ${stopVal}, 2)?`,
              promptI18n: {
                ja: `ステップ 1：range(1, ${stopVal}, 2) が生成する最後の奇数はいくつですか。`,
                ko: `1단계: range(1, ${stopVal}, 2)가 생성하는 마지막 홀수는 얼마입니까?`,
                ms: `Langkah 1: Apakah integer ganjil terakhir yang dijana oleh range(1, ${stopVal}, 2)?`,
              },
              hintZh: `小于 ${stopVal} 的最大奇数`,
              hintEn: `Largest odd < ${stopVal}`,
              hintI18n: {
                ja: `${stopVal} 未満の最大の奇数です`,
                ko: `${stopVal}보다 작은 가장 큰 홀수입니다`,
                ms: `Integer ganjil terbesar yang kurang daripada ${stopVal}`,
              },
              expectedAnswer: `${stopVal - 1}`,
            },
            {
              promptZh: `第二步：将奇数序列 1 + 3 + ... + ${stopVal - 1} 相加，求 s：`,
              promptEn: `Step 2: Sum 1 + 3 + ... + ${stopVal - 1}:`,
              promptI18n: {
                ja: `ステップ 2：1 + 3 + ... + ${stopVal - 1} の和を求めなさい：`,
                ko: `2단계: 1 + 3 + ... + ${stopVal - 1}의 합을 구하시오:`,
                ms: `Langkah 2: Jumlahkan 1 + 3 + ... + ${stopVal - 1}:`,
              },
              hintZh: `前 ${k} 个奇数之和等于 ${k}²`,
              hintEn: `Sum of first ${k} odds = ${k}²`,
              hintI18n: {
                ja: `最初の ${k} 個の奇数の和は ${k}² です`,
                ko: `처음 ${k}개 홀수의 합은 ${k}²입니다`,
                ms: `Hasil tambah ${k} nombor ganjil pertama ialah ${k}²`,
              },
              expectedAnswer: `${ans}`,
            },
          ],
          distractors: [
            { text: `${ignoreStepTrap}`, misconceptionTag: "misc_cs_off_by_one_range" },
            { text: `${offByOneTrap}`, misconceptionTag: "misc_cs_off_by_one_range" },
            { text: `${stopVal - 1}` },
          ],
          misconceptionsByValue: {
            [`${ignoreStepTrap}`]: "misc_cs_off_by_one_range",
            [`${offByOneTrap}`]: "misc_cs_off_by_one_range",
          },
        };
      }

      // Use n >= 5 so (n - 1) and ans - (n - 1) = (n - 2)(n - 1)/2 NEVER collide (collision happened at n = 4)!
      const n = dTier === "standard" ? rng.int(7, 10) : rng.int(5, 7);
      const ans = ((n - 1) * n) / 2;
      const offByOneTrap = (n * (n + 1)) / 2;
      return {
        promptZh: `阅读以下 Python 循环代码：\n\`s = 0\`\n\`for i in range(1, ${n}):\`\n\`    s = s + i\`\n程序运行结束后，变量 \`s\` 的值是多少？`,
        promptEn: `Trace the Python snippet:\n\`s = 0\`\n\`for i in range(1, ${n}):\`\n\`    s = s + i\`\nWhat is the final value of \`s\`?`,
        promptI18n: {
          ja: `次の Python のループをトレースしなさい：\n\`s = 0\`\n\`for i in range(1, ${n}):\`\n\`    s = s + i\`\n実行終了後の変数 \`s\` の値はいくつですか。`,
          ko: `다음 Python 반복문을 추적하시오:\n\`s = 0\`\n\`for i in range(1, ${n}):\`\n\`    s = s + i\`\n실행이 끝난 뒤 변수 \`s\`의 값은 얼마입니까?`,
          ms: `Surih kod Python berikut:\n\`s = 0\`\n\`for i in range(1, ${n}):\`\n\`    s = s + i\`\nApakah nilai akhir \`s\`?`,
        },
        answer: `${ans}`,
        explanationZh: `\`range(1, ${n})\` 左闭右开，\`i\` 依次取 $1, 2, \\dots, ${n - 1}$（不包含 ${n}！），累加得 $s = ${ans}$（误把 ${n} 加进去会错得 ${offByOneTrap}）。`,
        explanationEn: `\`range(1, ${n})\` iterates i = 1 .. ${n - 1}, so s = (${n - 1} × ${n}) / 2 = ${ans}.`,
        explanationI18n: {
          ja: `\`range(1, ${n})\` では i = 1 .. ${n - 1} をとります（上限 ${n} は含みません）。よって s = (${n - 1} × ${n}) / 2 = ${ans} です（誤って ${n} まで足すと ${offByOneTrap} になります）。`,
          ko: `\`range(1, ${n})\`에서 i는 1 .. ${n - 1}의 값을 가지므로(${koP(n, "은", "는")} 포함되지 않음) s = (${n - 1} × ${n}) / 2 = ${ans}입니다(${n}까지 더하면 ${offByOneTrap}이 됩니다).`,
          ms: `\`range(1, ${n})\` mengulang i = 1 .. ${n - 1} (tidak termasuk ${n}), maka s = (${n - 1} × ${n}) / 2 = ${ans} (jika ${n} turut ditambah, jawapan salah ${offByOneTrap}).`,
        },
        scaffolds: [
          {
            promptZh: `在 range(1, ${n}) 中，变量 i 取到的最后一个整数是多少？`,
            promptEn: `What is the last integer generated by range(1, ${n})?`,
            promptI18n: {
              ja: `range(1, ${n}) が生成する最後の整数はいくつですか。`,
              ko: `range(1, ${n})이 생성하는 마지막 정수는 얼마입니까?`,
              ms: `Apakah integer terakhir yang dijana oleh range(1, ${n})?`,
            },
            hintZh: `上界减 1`,
            hintEn: `${n} - 1`,
            hintI18n: { ja: `上限から 1 を引きます：${n} - 1`, ko: `상한에서 1을 뺍니다: ${n} - 1`, ms: `Had atas tolak 1: ${n} - 1` },
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
            hintI18n: { ja: `1..${n - 1} の和です`, ko: `1..${n - 1}의 합입니다`, ms: `Jumlah 1..${n - 1}` },
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

    // 38. Computing: Binary search worst-case comparisons (2-step scaffold + non-power-of-two challenge!)
    case "cs_binary_search": {
      const challengeCases = [
        [50, 6, 25, 32],
        [100, 7, 50, 64],
        [200, 8, 100, 128],
        [500, 9, 250, 256],
        [1000, 10, 500, 512],
      ] as const;
      const baseCases = [
        [7, 3, 4, 4],
        [15, 4, 8, 8],
        [31, 5, 16, 16],
        [63, 6, 32, 32],
        [127, 7, 64, 64],
      ] as const;
      const [n, kAns, halfTrap, lowPow2] = dTier === "challenge"
        ? rng.pick(challengeCases)
        : dTier === "standard"
          ? rng.pick(baseCases.slice(2))
          : rng.pick(baseCases.slice(0, 3));
      const floorLog = kAns - 1;
      return {
        promptZh: `在一个包含 $N = ${n}$ 个互不相同且已按升序排列的数组中使用标准二分查找（每次取中间一个元素作等值/大小比较）寻找某目标值，最坏情况下最多需要比较多少次元素？`,
        promptEn: `In a sorted array of $N = ${n}$ distinct elements, what is the worst-case (maximum) number of element comparisons needed by binary search?`,
        promptI18n: {
          ja: `互いに異なる $N = ${n}$ 個の要素が昇順に並んだ配列で二分探索を行うとき、最悪の場合（最大）に必要な要素の比較回数は何回ですか。`,
          ko: `서로 다른 $N = ${n}$개의 원소가 오름차순으로 정렬된 배열에서 이진 탐색을 할 때, 최악의 경우(최대) 필요한 원소 비교 횟수는 몇 번입니까?`,
          ms: `Dalam tatasusunan terisih yang mengandungi $N = ${n}$ unsur berbeza, berapakah bilangan perbandingan unsur maksimum (kes terburuk) yang diperlukan oleh carian binari?`,
        },
        latexFormula: `C_{\\max}(N) = \\lfloor \\log_2 ${n} \\rfloor + 1`,
        answer: `${kAns}`,
        explanationZh: `由 $2^{${floorLog}} = ${lowPow2} \\le ${n} < 2^{${kAns}} = ${lowPow2 * 2}$ 知 $\\lfloor \\log_2 ${n} \\rfloor = ${floorLog}$，故最坏情况最多需比較 $${floorLog} + 1 = ${kAns}$ 次（绝不是线性折半算 $N/2 \\approx ${halfTrap}$ 次）。`,
        explanationEn: `Since $2^{${floorLog}} = ${lowPow2} \\le ${n} < 2^{${kAns}} = ${lowPow2 * 2}$, $\\lfloor \\log_2 ${n} \\rfloor + 1 = ${kAns}$ comparisons suffice in the worst case.`,
        explanationI18n: {
          ja: `$2^{${floorLog}} = ${lowPow2} \\le ${n} < 2^{${kAns}} = ${lowPow2 * 2}$ より $\\lfloor \\log_2 ${n} \\rfloor = ${floorLog}$ なので、比較は最大 ${floorLog} + 1 = ${kAns} 回で済みます（$N/2 \\approx ${halfTrap}$ 回ではありません）。`,
          ko: `$2^{${floorLog}} = ${lowPow2} \\le ${n} < 2^{${kAns}} = ${lowPow2 * 2}$이므로 $\\lfloor \\log_2 ${n} \\rfloor = ${floorLog}$이며, 최악의 경우 최대 ${floorLog} + 1 = ${kAns}번 비교하면 됩니다($N/2 \\approx ${halfTrap}$번이 아닙니다).`,
          ms: `Oleh sebab $2^{${floorLog}} = ${lowPow2} \\le ${n} < 2^{${kAns}} = ${lowPow2 * 2}$, paling banyak ${floorLog} + 1 = ${kAns} perbandingan diperlukan (bukan $N/2 \\approx ${halfTrap}$).`,
        },
        scaffolds: [
          {
            promptZh: `第一步：找出满足 2^m ≤ ${n} 的最大整数指数 m = ⌊log₂(${n})⌋：`,
            promptEn: `Step 1: Find the largest integer m such that 2^m ≤ ${n}:`,
            promptI18n: {
              ja: `ステップ 1：$2^m \\le ${n}$ を満たす最大の整数 $m$ はいくつですか。`,
              ko: `1단계: $2^m \\le ${n}$을 만족하는 가장 큰 정수 $m$은 얼마입니까?`,
              ms: `Langkah 1: Cari integer terbesar $m$ supaya $2^m \\le ${n}$:`,
            },
            hintZh: `2^${floorLog} = ${lowPow2}`,
            hintEn: `2^${floorLog} = ${lowPow2}`,
            expectedAnswer: `${floorLog}`,
          },
          {
            promptZh: `第二步：加上最后 1 个剩余元素的校验比较（m + 1），最坏总比较次数为：`,
            promptEn: `Step 2: Add 1 for the final single-element check (${floorLog} + 1):`,
            promptI18n: {
              ja: `ステップ 2：最後の 1 要素の比較分 1 を足して（${floorLog} + 1）を求めなさい：`,
              ko: `2단계: 마지막 원소 비교 1회를 더하여(${floorLog} + 1) 최악 비교 횟수를 구하시오:`,
              ms: `Langkah 2: Tambah 1 untuk semakan unsur terakhir (${floorLog} + 1):`,
            },
            hintZh: `${floorLog} + 1`,
            hintEn: `${floorLog} + 1`,
            expectedAnswer: `${kAns}`,
          },
        ],
        distractors: [
          { text: `${halfTrap}`, misconceptionTag: "misc_cs_bsearch_half_linear" },
          { text: `${floorLog}` },
          { text: `${n}` },
        ],
        misconceptionsByValue: { [`${halfTrap}`]: "misc_cs_bsearch_half_linear" },
      };
    }

    // 39. Computing: Quadratic O(n^2) scaling (zero distractor collision + inverse budget challenge!)
    case "cs_complexity_scale": {
      if (dTier === "challenge") {
        // Inverse scaling: O(n^2) takes t0 s for n0; given budget t0 * k^2 s, how many times larger can input n be? -> k (NOT k^2!)
        const t0 = rng.int(2, 5);
        const scaleK = rng.pick([3, 4, 5]);
        const tBudget = t0 * scaleK * scaleK;
        const n0 = 1000;
        const maxN = n0 * scaleK;
        const linearTrapN = n0 * scaleK * scaleK;
        return {
          promptZh: `某 $\\Theta(n^2)$ 排序算法处理规模 $n_0 = ${n0}$ 的数据耗时 $${t0}\\text{ s}$。若系统最大允许运行时间放宽至 $${tBudget}\\text{ s}$，该算法最多可处理多大规模的数据量 $n$？`,
          promptEn: `An $\\Theta(n^2)$ algorithm takes $${t0}\\text{ s}$ for $n_0 = ${n0}$. If the time budget increases to $${tBudget}\\text{ s}$, what is the maximum input size $n$ it can process?`,
          promptI18n: {
            ja: `計算量が $\\Theta(n^2)$ のアルゴリズムは、$n_0 = ${n0}$ の処理に $${t0}\\text{ s}$ かかります。制限時間が $${tBudget}\\text{ s}$ に緩和されたとき、処理できる最大の入力サイズ $n$ はいくつですか。`,
            ko: `시간 복잡도가 $\\Theta(n^2)$인 알고리즘이 $n_0 = ${n0}$을 처리하는 데 $${t0}\\text{ s}$가 걸립니다. 허용 실행 시간이 $${tBudget}\\text{ s}$로 늘어나면 최대 얼마의 입력 크기 $n$까지 처리할 수 있습니까?`,
            ms: `Satu algoritma $\\Theta(n^2)$ mengambil masa $${t0}\\text{ s}$ bagi $n_0 = ${n0}$. Jika had masa ditingkatkan kepada $${tBudget}\\text{ s}$, apakah saiz input maksimum $n$ yang dapat diproses?`,
          },
          latexFormula: `\\left(\\frac{n}{${n0}}\\right)^2 = \\frac{${tBudget}}{${t0}} = ${scaleK * scaleK}`,
          answer: `${maxN}`,
          explanationZh: `时间放宽为 $\\frac{${tBudget}}{${t0}} = ${scaleK * scaleK}$ 倍；因 $T \\propto n^2$，反推输入规模倍数为 $\\sqrt{${scaleK * scaleK}} = ${scaleK}$ 倍，故最大规模 $n = ${n0} \\times ${scaleK} = ${maxN}$（切忌按线性比例算成 $${linearTrapN}$！）。`,
          explanationEn: `Time increases by ${tBudget}/${t0} = ${scaleK * scaleK}×. Since $T \\propto n^2$, input size scales by $\\sqrt{${scaleK * scaleK}} = ${scaleK}\\times$, giving $n = ${maxN}$ (not ${linearTrapN}).`,
          explanationI18n: {
            ja: `許容時間は ${tBudget}/${t0} = ${scaleK * scaleK} 倍になりました。$T \\propto n^2$ なので、入力サイズはその平方根 $\\sqrt{${scaleK * scaleK}} = ${scaleK}$ 倍となり、$n = ${maxN}$ です（比例と誤って ${linearTrapN} としないよう注意しましょう）。`,
            ko: `허용 시간이 ${tBudget}/${t0} = ${scaleK * scaleK}배가 되었으므로, $T \\propto n^2$에서 입력 크기는 제곱근인 $\\sqrt{${scaleK * scaleK}} = ${scaleK}$배가 되어 $n = ${maxN}$입니다(선형 비례로 착각해 ${linearTrapN}으로 계산하지 마십시오).`,
            ms: `Masa meningkat sebanyak ${tBudget}/${t0} = ${scaleK * scaleK}×. Oleh sebab $T \\propto n^2$, saiz input meningkat sebanyak $\\sqrt{${scaleK * scaleK}} = ${scaleK}\\times$, memberikan $n = ${maxN}$ (bukan ${linearTrapN}).`,
          },
          scaffolds: [
            {
              promptZh: `第一步：时间从 ${t0} s 放宽到 ${tBudget} s，扩大了多少倍？`,
              promptEn: `Step 1: By what factor did the time budget increase (${tBudget} / ${t0})?`,
              promptI18n: {
                ja: `ステップ 1：時間は何倍になりましたか（${tBudget} / ${t0}）：`,
                ko: `1단계: 허용 시간은 몇 배로 늘어났습니까(${tBudget} / ${t0})?`,
                ms: `Langkah 1: Berapa kali gandakah had masa meningkat (${tBudget} / ${t0})?`,
              },
              hintZh: `${tBudget} ÷ ${t0}`,
              hintEn: `${tBudget} / ${t0}`,
              expectedAnswer: `${scaleK * scaleK}`,
            },
            {
              promptZh: `第二步：对时间倍数 ${scaleK * scaleK} 开算术平方根，再乘以 ${n0} 得最大规模 n：`,
              promptEn: `Step 2: Multiply ${n0} by √${scaleK * scaleK} = ${scaleK}:`,
              promptI18n: {
                ja: `ステップ 2：平方根 ${scaleK} を元のサイズ ${n0} に掛けなさい：`,
                ko: `2단계: 제곱근 ${scaleK}에 원래 크기 ${n0}을 곱하시오:`,
                ms: `Langkah 2: Darabkan ${n0} dengan √${scaleK * scaleK} = ${scaleK}:`,
              },
              hintZh: `${n0} × ${scaleK}`,
              hintEn: `${n0} × ${scaleK}`,
              expectedAnswer: `${maxN}`,
            },
          ],
          distractors: [
            { text: `${linearTrapN}`, misconceptionTag: "misc_cs_quad_linear_scale" },
            { text: `${n0 + scaleK * scaleK}` },
            { text: `${n0 * 2}` },
          ],
          misconceptionsByValue: { [`${linearTrapN}`]: "misc_cs_quad_linear_scale" },
        };
      }

      const t0 = rng.int(2, 5);
      const scaleK = dTier === "standard" ? rng.pick([3, 4, 5]) : rng.pick([2, 3]);
      const ans = t0 * scaleK * scaleK;
      const linearTrap = t0 * scaleK;
      const cubicTrap = t0 * scaleK * scaleK * scaleK;
      // Avoid t0 + scaleK^2 === t0 * scaleK when t0 = 4, scaleK = 2 by using ans + scaleK (strictly > linearTrap and != cubicTrap)
      const offsetDistractor = ans + scaleK;
      return {
        promptZh: `某双重嵌套循环算法的时间复杂度为 $\\Theta(n^2)$。已知处理规模 $n = 1000$ 的数据集耗时 $${t0}\\text{ s}$，当数据规模扩大为原来的 $${scaleK}$ 倍（即 $n = ${scaleK * 1000}$）时，预计耗时约为多少 $\\text{s}$？`,
        promptEn: `An $\\Theta(n^2)$ nested-loop algorithm takes $${t0}\\text{ s}$ for $n = 1000$. Estimate its runtime (in $\\text{s}$) when input size increases $${scaleK}\\times$ to $n = ${scaleK * 1000}$:`,
        promptI18n: {
          ja: `計算量が $\\Theta(n^2)$ の二重ループのアルゴリズムは、$n = 1000$ のとき $${t0}\\text{ s}$ かかります。入力サイズが $${scaleK}$ 倍の $n = ${scaleK * 1000}$ になったときの実行時間（単位 $\\text{s}$）を見積もりなさい：`,
          ko: `시간 복잡도가 $\\Theta(n^2)$인 이중 반복문 알고리즘이 $n = 1000$일 때 $${t0}\\text{ s}$가 걸립니다. 입력 크기가 $${scaleK}$배인 $n = ${scaleK * 1000}$이 되면 실행 시간(단위 $\\text{s}$)은 약 얼마입니까?`,
          ms: `Satu algoritma gelung bersarang $\\Theta(n^2)$ mengambil masa $${t0}\\text{ s}$ untuk $n = 1000$. Anggarkan masa larian (dalam $\\text{s}$) apabila saiz input meningkat $${scaleK}\\times$ kepada $n = ${scaleK * 1000}$:`,
        },
        latexFormula: `T(${scaleK}n) \\approx ${scaleK}^2 \\cdot T(n)`,
        answer: `${ans}`,
        unit: "s",
        explanationZh: `二次复杂度 $\\Theta(n^2)$ 耗时与规模平方成正比：规模乘 $${scaleK}$，耗时乘 $${scaleK}^2 = ${scaleK * scaleK}$，故约需 $${t0} \\times ${scaleK * scaleK} = ${ans}\\text{ s}$。`,
        explanationEn: `For O(n²), scaling input by ${scaleK}× scales time by ${scaleK}² = ${scaleK * scaleK}×: ${t0} × ${scaleK * scaleK} = ${ans} s.`,
        explanationI18n: {
          ja: `O(n²) では実行時間は入力サイズの 2 乗に比例します。入力が ${scaleK} 倍になると時間は ${scaleK}² = ${scaleK * scaleK} 倍となり、${t0} × ${scaleK * scaleK} = ${ans} s です。`,
          ko: `O(n²)에서는 실행 시간이 입력 크기의 제곱에 비례합니다. 입력이 ${scaleK}배가 되면 시간은 ${scaleK}² = ${scaleK * scaleK}배가 되어 ${t0} × ${scaleK * scaleK} = ${ans} s입니다.`,
          ms: `Bagi O(n²), masa berkadar dengan kuasa dua saiz input. Input didarab ${scaleK}× menyebabkan masa didarab ${scaleK}² = ${scaleK * scaleK}×: ${t0} × ${scaleK * scaleK} = ${ans} s.`,
        },
        scaffolds: [
          {
            promptZh: `规模扩大 ${scaleK} 倍，平方项 n² 扩大多少倍？`,
            promptEn: `By what factor does n² grow when n scales by ${scaleK}?`,
            promptI18n: {
              ja: `n が ${scaleK} 倍になると、n² は何倍になりますか。`,
              ko: `n이 ${scaleK}배가 되면 n²은 몇 배가 됩니까?`,
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
              ko: `${t0} s에 ${koP(scaleK * scaleK, "을", "를")} 곱하시오:`,
              ms: `Darab ${t0} s dengan ${scaleK * scaleK}:`,
            },
            hintZh: `${t0} × ${scaleK * scaleK}`,
            hintEn: `${t0} × ${scaleK * scaleK}`,
            expectedAnswer: `${ans}`,
          },
        ],
        distractors: [
          { text: `${linearTrap}`, misconceptionTag: "misc_cs_quad_linear_scale" },
          { text: `${offsetDistractor}` },
          { text: `${cubicTrap}` },
        ],
        misconceptionsByValue: { [`${linearTrap}`]: "misc_cs_quad_linear_scale" },
      };
    }

    // 40. English: Subject-Verb Agreement (2-step Socratic scaffold with ZERO answer leak + 3-tier progression)
    case "eng_sva_tense": {
      const challengeItems = [
        {
          sentence: "The number of electric buses operating on urban routes ______ doubled over the past three years.",
          headDescZh: "The number（表示“……的数量”，单数核心名词）",
          headWord: "number",
          ans: "has",
          trap: "have",
          d2: "are",
          d3: "were",
          ruleZh: `"The number of + 复数名词" 表示“……的数量”，中心词是单数名词 number（区别于表示“许多”的 A number of），且有 over the past three years 现在完成时标志，故填单数助动词 has。`,
          ruleEn: `"The number of..." has the singular head noun "number" (unlike plural-meaning "A number of...") and pairs with "over the past three years", requiring singular present perfect "has".`,
          ruleJa: `"The number of + 複数名詞"（〜の数）の中心となる主語は単数名詞 number です。"over the past three years" と呼応するため単数の現在完了 "has" を用います。`,
          ruleKo: `"The number of + 복수 명사"(~의 수)의 핵심 주어는 단수 명사 number입니다. "over the past three years"와 호응하므로 단수 현재완료 조동사 "has"를 씁니다.`,
          ruleMs: `Subjek utama dalam "The number of..." ialah kata nama tunggal "number", dan frasa masa "over the past three years" memerlukan bentuk tunggal "has".`,
        },
        {
          sentence: "Neither the lead researcher nor the lab assistants ______ informed of the schedule change yesterday.",
          headDescZh: "assistants（neither...nor 就近原则匹配紧邻复数主语）",
          headWord: "assistants",
          ans: "were",
          trap: "was",
          d2: "are",
          d3: "has been",
          ruleZh: `"Neither A nor B" 遵循就近一致原则，谓语与靠近它的复数名词 assistants 保持一致；结合过去时间状语 yesterday，应填复数过去式 were。`,
          ruleEn: `Correlative "Neither A nor B" follows proximity agreement with the nearer plural subject "assistants", and "yesterday" requires past tense "were".`,
          ruleJa: `"Neither A nor B" では動詞に近い側の主語（複数の assistants）に一致させます。さらに yesterday があるため過去形複数 "were" が正解です。`,
          ruleKo: `"Neither A nor B" 구문은 동사에 가까운 주어(복수 명사 assistants)에 수를 일치시키며, 과거 부사 yesterday에 맞춰 "were"를 씁니다.`,
          ruleMs: `Struktur "Neither A nor B" mengikut subjek yang lebih dekat ("assistants", jamak) dan keterangan masa lampau "yesterday" memerlukan "were".`,
        },
      ] as const;

      const baseItems = [
        {
          sentence: "The list of shortlisted candidates ______ posted on the noticeboard every Monday.",
          headDescZh: "list（单数可数名词）",
          headWord: "list",
          ans: "is",
          trap: "are",
          d2: "were",
          d3: "have been",
          ruleZh: `将 \`of shortlisted candidates\` 介词短语剥离后，真正的核心主语是单数名词 list，结合 every Monday 一般现在时被动结构，必须用单数谓语 is（切忌被紧邻复数 candidates 误导选 are）。`,
          ruleEn: `Stripping away "of shortlisted candidates", the singular head noun "list" with habitual "every Monday" requires "is", not proximity trap "are".`,
          ruleJa: `前置詞句 "of shortlisted candidates" を除くと、中心となる主語は単数の list です。直前の複数名詞につられず単数形 "is" を選びます。`,
          ruleKo: `전치사구 "of shortlisted candidates"를 걷어 내면 핵심 주어는 단수인 list이므로 바로 앞 복수 명사에 끌리지 말고 단수 동사 "is"를 골라야 합니다.`,
          ruleMs: `Selepas mengabaikan frasa sendi nama "of shortlisted candidates", subjek utama "list" adalah tunggal, maka gunakan "is" dan bukannya "are".`,
        },
        {
          sentence: "A bouquet of fresh yellow roses ______ sitting on the teacher's desk right now.",
          headDescZh: "bouquet（单数可数名词）",
          headWord: "bouquet",
          ans: "is",
          trap: "are",
          d2: "were",
          d3: "have",
          ruleZh: `剥离修饰语 \`of fresh yellow roses\` 后，真正的核心主语是单数名词 bouquet（一束花），结合 right now 现在进行时，必须用单数助动词 is。`,
          ruleEn: `Ignoring "of fresh yellow roses", the singular head subject "bouquet" with "right now" requires singular "is" rather than "are".`,
          ruleJa: `修飾句 "of fresh yellow roses" を取り除くと、真の主語は単数の bouquet です。"right now" と合わせて単数形 "is" を使います。`,
          ruleKo: `수식어구 "of fresh yellow roses"를 제외하면 진짜 주어는 단수 명사 bouquet이므로 현재진행형에 맞는 단수 동사 "is"를 씁니다.`,
          ruleMs: `Abaikan "of fresh yellow roses"; kata nama utama "bouquet" adalah tunggal dan memerlukan "is" bagi masa sekarang ("right now").`,
        },
        {
          sentence: "The reliability of these autonomous drones ______ improved dramatically since 2024.",
          headDescZh: "reliability（不可数抽象名词，视作单数）",
          headWord: "reliability",
          ans: "has",
          trap: "have",
          d2: "are",
          d3: "were",
          ruleZh: `剥离 \`of these autonomous drones\` 后，主语中心词是不可数抽象名词 reliability，结合 \`since 2024\` 现在完成时标志，谓语必须用单数助动词 has。`,
          ruleEn: `Ignoring "of these autonomous drones", the uncountable singular head noun "reliability" with "since 2024" requires "has" rather than "have".`,
          ruleJa: `"of these autonomous drones" を除くと、中心の主語は不可算名詞（単数扱い）の reliability です。"since 2024" と呼応する単数の "has" を選びます。`,
          ruleKo: `"of these autonomous drones"를 빼면 핵심 주어는 단수 취급하는 추상명사 reliability이므로 "since 2024"와 호응하는 단수 조동사 "has"를 씁니다.`,
          ruleMs: `Kata nama utama "reliability" ialah kata nama tak boleh bilang (tunggal) dan penanda masa "since 2024" memerlukan "has", bukan "have".`,
        },
      ] as const;

      const it = dTier === "challenge"
        ? rng.pick(challengeItems)
        : dTier === "standard"
          ? rng.pick(baseItems.slice(1))
          : rng.pick(baseItems.slice(0, 2));
      return {
        promptZh: `【主谓一致与时态诊断】定位真正决定谓语单复数的核心主语，选出语法严密的谓语形式：\n"${it.sentence}"`,
        promptEn: `[Subject-Verb Agreement] Identify the true governing subject and choose the grammatically correct verb:\n"${it.sentence}"`,
        promptI18n: {
          ja: `【主語と動詞の一致】動詞の形を決める真の主語を見極め、文法的に正しい動詞を選びなさい：\n"${it.sentence}"`,
          ko: `[주어-동사 수 일치] 동사의 수를 결정하는 핵심 주어를 찾아 문법적으로 알맞은 동사를 고르시오:\n"${it.sentence}"`,
          ms: `[Persetujuan Subjek-Kata Kerja] Kenal pasti subjek utama sebenar dan pilih bentuk kata kerja yang tepat:\n"${it.sentence}"`,
        },
        answer: it.ans,
        answerEn: it.ans,
        explanationZh: it.ruleZh,
        explanationEn: it.ruleEn,
        explanationI18n: { ja: it.ruleJa, ko: it.ruleKo, ms: it.ruleMs },
        scaffolds: [
          {
            promptZh: `第一步：剥离干扰性的介词修饰成分（或按并列就近规则），写出真正决定横线处单复数的那一个核心主语英文单词：`,
            promptEn: `Step 1: Type the single English head noun that governs the verb's number in this sentence:`,
            promptI18n: {
              ja: `ステップ 1：動詞の単複を決める中心の名詞（英単語 1 語）を書きなさい：`,
              ko: `1단계: 이 문장에서 동사의 단수·복수를 결정하는 핵심 명사(영단어 1개)를 쓰시오:`,
              ms: `Langkah 1: Taipkan satu kata nama bahasa Inggeris utama yang menentukan bilangan kata kerja:`,
            },
            hintZh: `忽略 of 短语宾语，找真正主干词`,
            hintEn: `Ignore prepositional modifiers like "of ..."`,
            hintI18n: {
              ja: `前置詞句（of ...）の中の複数名詞に惑わされないようにしましょう`,
              ko: `전치사구(of ...) 안의 명사에 현혹되지 마십시오`,
              ms: `Jangan terpengaruh dengan kata nama di dalam frasa sendi nama "of ..."`,
            },
            expectedAnswer: it.headWord,
          },
          {
            promptZh: `第二步：根据核心词 ${it.headDescZh} 及句末时间状语，选出匹配的谓语动词：`,
            promptEn: `Step 2: Match both number (singular/plural) of "${it.headWord}" and the sentence's time marker:`,
            promptI18n: {
              ja: `ステップ 2：主語 "${it.headWord}" の単複と時制を表す語句の両方に合う動詞を選びなさい：`,
              ko: `2단계: 주어 "${it.headWord}"의 수와 문장의 시제 단서에 모두 맞는 동사를 고르시오:`,
              ms: `Langkah 2: Pilih kata kerja yang sepadan dengan bilangan "${it.headWord}" serta penanda masa ayat:`,
            },
            hintZh: `同时核对单复数与时态`,
            hintEn: `Check both number agreement and tense`,
            hintI18n: { ja: `単複と時制の両方を確認します`, ko: `수 일치와 시제를 함께 확인합니다`, ms: `Semak bilangan dan kala serentak` },
            expectedAnswer: it.ans,
          },
        ],
        distractors: [
          { text: it.trap, textEn: it.trap, misconceptionTag: "misc_eng_proximity_trap" },
          { text: it.d2, textEn: it.d2 },
          { text: it.d3, textEn: it.d3 },
        ],
      };
    }

    // 41. English: Participle voice (-ing vs -ed, matched verb-family options, zero "Having saw"!)
    case "eng_participle_voice": {
      const challengeItems = [
        {
          sentence: "______ in rough ocean currents for six months, the autonomous buoy was cleared for Pacific deployment.",
          subjZh: "the autonomous buoy（被动接受测试且先于主句完成）",
          subjWord: "the autonomous buoy",
          voiceCue: "passive",
          ans: "Having been tested",
          trap: "Having tested",
          d2: "Testing",
          d3: "To test",
          explZh: `主句主语 \`the autonomous buoy\`（浮标）是“被测试”的承受者，且 \`for six months\` 发生在主句之前，故须用完成被动分词 \`Having been tested\`（误选主动 \`Having tested\` 会造成悬垂分词错误）。`,
          explEn: `The subject "the autonomous buoy" was passively tested prior to deployment, requiring the perfect passive participle "Having been tested" rather than active "Having tested".`,
          explJa: `主節の主語 "the autonomous buoy" はテストを「受ける」側であり、主節より前の継続を表すため完了受動分詞 "Having been tested" を用います。`,
          explKo: `주절의 주어 "the autonomous buoy"는 시험을 받는 대상이며 주절보다 앞선 기간을 나타내므로 완료 수동 분사구문 "Having been tested"가 정답입니다.`,
          explMs: `Subjek "the autonomous buoy" diuji secara pasif sebelum digunakan, maka bentuk partisipel pasif sempurna "Having been tested" diperlukan.`,
        },
        {
          sentence: "______ all safety inspections ahead of schedule, the engineering team launched the prototype.",
          subjZh: "the engineering team（主动完成全部安全检查）",
          subjWord: "the engineering team",
          voiceCue: "active",
          ans: "Having completed",
          trap: "Completed",
          d2: "Having been completed",
          d3: "To be completed",
          explZh: `主句主语 \`the engineering team\`（工程团队）与“完成安全检查”之间是**主动发出**且先于主句发生的关系，故须用现在分词完成式 \`Having completed\`（误选过去分词 \`Completed\` 会变成“团队被完成”）。`,
          explEn: `Here "the engineering team" actively performed the inspections before launching, requiring active perfect participle "Having completed" rather than passive "Completed".`,
          explJa: `主節の主語 "the engineering team" が自ら検査を完了した（能動）ため、能動の完了分詞 "Having completed" を選びます（"Completed" にすると受動になってしまいます）。`,
          explKo: `주절의 주어 "the engineering team"이 능동적으로 안전 점검을 마쳤으므로 능동 완료 분사구문인 "Having completed"를 써야 합니다.`,
          explMs: `Subjek "the engineering team" melakukan pemeriksaan secara aktif sebelum pelancaran, maka gunakan bentuk aktif "Having completed".`,
        },
      ] as const;

      const baseItems = [
        {
          sentence: "______ from the orbit of Mars, Earth looks like a pale blue dot.",
          subjZh: "Earth（被观测）",
          subjWord: "Earth",
          voiceCue: "passive",
          ans: "Seen",
          trap: "Seeing",
          d2: "To see",
          d3: "Having seen",
          explZh: `句首分词逻辑主语等于逗号后的主句主语 \`Earth\`（地球被观测），二者为被动承受关系，必须用过去分词 \`Seen\`（选 \`Seeing\` 或 \`Having seen\` 会造成“地球主动看”的悬垂分词错误）。`,
          explEn: `The main-clause subject "Earth" is passively observed from Mars, requiring past participle "Seen" instead of active/dangling "Seeing" or "Having seen".`,
          explJa: `文頭の分詞の意味上の主語は主節の主語 Earth であり、「見られる」受動の関係なので過去分詞 "Seen" を使います（"Seeing" にすると懸垂分詞の誤りになります）。`,
          explKo: `문두 분사의 의미상 주어는 주절의 주어 Earth이며 '관측되는' 수동 관계이므로 과거분사 "Seen"을 써야 합니다("Seeing"은 현수 분사 오류입니다).`,
          explMs: `Subjek klausa utama "Earth" diperhatikan secara pasif, maka gunakan partisipel lampau "Seen" dan bukannya bentuk aktif "Seeing".`,
        },
        {
          sentence: "______ with traditional incandescent bulbs, LED lamps consume 80% less energy.",
          subjZh: "LED lamps（被拿来比较）",
          subjWord: "LED lamps",
          voiceCue: "passive",
          ans: "Compared",
          trap: "Comparing",
          d2: "To compare",
          d3: "Having compared",
          explZh: `主句主语 \`LED lamps\` 是“被拿来与白炽灯比较”的对象，逻辑上为被动关系，必须用过去分词 \`Compared\`（选 \`Comparing\` 会造成悬垂分词错误）。`,
          explEn: `The subject "LED lamps" is passively compared with incandescent bulbs, requiring past participle "Compared" rather than dangling "Comparing".`,
          explJa: `主節の主語 "LED lamps" は比較される側（受動）なので、過去分詞 "Compared" を用います（"Comparing" にすると意味上の主語がずれてしまいます）。`,
          explKo: `주절의 주어 "LED lamps"는 비교되는 대상(수동)이므로 과거분사 "Compared"를 써야 합니다("Comparing"을 쓰면 현수 분사 오류가 됩니다).`,
          explMs: `Subjek utama "LED lamps" dibandingkan secara pasif, jadi gunakan partisipel lampau "Compared" dan bukannya "Comparing".`,
        },
        {
          sentence: "______ by three high-school students, the solar boat won first prize.",
          subjZh: "the solar boat（被设计）",
          subjWord: "the solar boat",
          voiceCue: "passive",
          ans: "Designed",
          trap: "Designing",
          d2: "To design",
          d3: "Having designed",
          explZh: `逗号后的主语 \`the solar boat\` 与设计动作之间有 \`by three high-school students\` 明确标示被动承受关系，故填过去分词 \`Designed\`。`,
          explEn: `"The solar boat" receives the action passively ("by three high-school students"), requiring the past participle "Designed" rather than "Designing".`,
          explJa: `"by three high-school students" からも分かる通り、主節の主語 "the solar boat" は設計された側（受動）なので過去分詞 "Designed" が正解です。`,
          explKo: `뒤따르는 "by three high-school students"와 주절 주어 "the solar boat"가 수동 관계이므로 과거분사 "Designed"가 정답입니다.`,
          explMs: `Subjek "the solar boat" direka bentuk secara pasif ("by three high-school students"), maka gunakan partisipel lampau "Designed".`,
        },
      ] as const;

      const it = dTier === "challenge"
        ? rng.pick(challengeItems)
        : dTier === "standard"
          ? rng.pick(baseItems.slice(1))
          : rng.pick(baseItems.slice(0, 2));
      return {
        promptZh: `【非谓语分词逻辑主语辨析】选择与主句主语构成正确主被动关系的非谓语形式：\n"${it.sentence}"`,
        promptEn: `[Participle Voice & Attachment] Select the non-finite participle form that properly attaches to the main clause's subject:\n"${it.sentence}"`,
        promptI18n: {
          ja: `【分詞構文の意味上の主語と態】主節の主語と正しい能動・受動関係を結ぶ分詞の形を選びなさい：\n"${it.sentence}"`,
          ko: `[분사구문의 의미상 주어와 태] 주절의 주어와 올바른 능동·수동 관계를 이루는 분사 형태를 고르시오:\n"${it.sentence}"`,
          ms: `[Subjek Logik & Ragam Partisipel] Pilih bentuk partisipel yang sepadan dengan subjek klausa utama:\n"${it.sentence}"`,
        },
        answer: it.ans,
        answerEn: it.ans,
        explanationZh: it.explZh,
        explanationEn: it.explEn,
        explanationI18n: { ja: it.explJa, ko: it.explKo, ms: it.explMs },
        scaffolds: [
          {
            promptZh: `第一步：观察逗号后的主句主语 "${it.subjWord}"——它对于句首动词而言是主动发出者（填 active）还是被动承受者（填 passive）？`,
            promptEn: `Step 1: Relative to the opening verb, is "${it.subjWord}" active or passive? (type active or passive)`,
            promptI18n: {
              ja: `ステップ 1：コンマの後の主語 "${it.subjWord}" は、文頭の動作をする側（active）ですか、受ける側（passive）ですか？`,
              ko: `1단계: 쉼표 뒤의 주어 "${it.subjWord}"는 동작을 하는 주체(active)입니까, 받는 대상(passive)입니까?`,
              ms: `Langkah 1: Adakah subjek "${it.subjWord}" melakukan tindakan (active) atau menerima tindakan (passive)?`,
            },
            hintZh: `把 "${it.subjWord}" 放到句首动词前试读主被动`,
            hintEn: `Test whether "${it.subjWord}" performs or receives the action`,
            hintI18n: {
              ja: `"${it.subjWord}" が動作を行うか受けるかを考えます`,
              ko: `"${it.subjWord}"가 동작을 행하는지 받는지 확인합니다`,
              ms: `Semak sama ada "${it.subjWord}" melakukan atau menerima perbuatan`,
            },
            expectedAnswer: it.voiceCue,
          },
          {
            promptZh: `第二步：根据该主被动关系（${it.subjZh}）选出唯一语法正确的分词选项：`,
            promptEn: `Step 2: Select the participle form matching that ${it.voiceCue} voice relationship:`,
            promptI18n: {
              ja: `ステップ 2：その態（${it.voiceCue}）に一致する正しい分詞を選びなさい：`,
              ko: `2단계: 확인한 태(${it.voiceCue})에 부합하는 분사 형태를 고르시오:`,
              ms: `Langkah 2: Pilih bentuk partisipel yang menepati ragam (${it.voiceCue}) tersebut:`,
            },
            hintZh: `主动用 -ing / Having done，被动用 -ed / Having been done`,
            hintEn: `Active: -ing / Having + p.p.; Passive: -ed / Having been + p.p.`,
            hintI18n: {
              ja: `能動は -ing / Having + 過去分詞、受動は -ed / Having been + 過去分詞`,
              ko: `능동은 -ing / Having + p.p., 수동은 -ed / Having been + p.p.`,
              ms: `Aktif: -ing / Having + p.p.; Pasif: -ed / Having been + p.p.`,
            },
            expectedAnswer: it.ans,
          },
        ],
        distractors: [
          { text: it.trap, textEn: it.trap, misconceptionTag: "misc_eng_dangling_ing" },
          { text: it.d2, textEn: it.d2 },
          { text: it.d3, textEn: it.d3 },
        ],
      };
    }

    // 42. English: Third conditional counterfactuals (verb-matched distractors + inverted challenge!)
    case "eng_third_conditional": {
      const challengeItems = [
        {
          sentence: "______ the pressure drop ten minutes earlier, the automated system would have isolated the faulty pipe.",
          ans: "Had the sensors detected",
          trap: "If the sensors would have detected",
          d2: "Did the sensors detect",
          d3: "Were the sensors detecting",
          explZh: `省略 \`If\` 的第三类虚拟条件句采用部分倒装 \`Had + 主语 + 过去分词\`（即 \`Had the sensors detected\` = \`If the sensors had detected\`），严禁在条件从句中使用 \`would have\`！`,
          explEn: `Omitting "If" in a third conditional triggers auxiliary inversion: "Had + subject + past participle" ("Had the sensors detected"), never "If ... would have detected".`,
          explJa: `仮定法過去完了で \`If\` を省略すると \`Had + 主語 + 過去分詞\` の倒置形（"Had the sensors detected"）になります。条件節の中で "would have" は使えません。`,
          explKo: `가정법 과거완료에서 \`If\`를 생략하면 조동사 도치가 일어나 \`Had + 주어 + 과거분사\`("Had the sensors detected") 형태가 됩니다. 조건절 안에 "would have"는 쓸 수 없습니다.`,
          explMs: `Pengguguran "If" dalam ayat syarat ketiga menghasilkan songsangan "Had + subjek + partisipel lampau" ("Had the sensors detected"), bukannya "would have" dalam klausa syarat.`,
        },
      ] as const;

      const baseItems = [
        {
          sentence: "If the engineers ______ the backup valve earlier, the pipeline leak would have been prevented.",
          ans: "had tested",
          trap: "would have tested",
          d2: "tested",
          d3: "have tested",
          explZh: `与过去事实相反的第三类条件句：主句为 \`would have been prevented\`，\`If\` 从句严格用过去完成时 \`had tested\`，严禁在 \`If\` 从句内重复写 \`would have tested\`！`,
          explEn: `Third conditionals pair "If + had + p.p." ("had tested") with "would have + p.p." in the main clause — never put "would have tested" inside the If-clause.`,
          explJa: `仮定法過去完了（第 3 条件文）では、If 節に "had + 過去分詞"（had tested）、主節に "would have + 過去分詞" を用います。If 節に "would have tested" は使えません。`,
          explKo: `가정법 과거완료(제3조건문)에서는 If절에 "had + 과거분사"(had tested), 주절에 "would have + 과거분사"를 씁니다. If절 안에 "would have tested"를 쓰지 않도록 주의하십시오.`,
          explMs: `Ayat syarat ketiga menggandingkan "If + had + p.p." ("had tested") dengan "would have + p.p." dalam klausa utama; jangan gunakan "would have tested" dalam klausa If.`,
        },
        {
          sentence: "If we ______ the earlier express train yesterday, we would have arrived before noon.",
          ans: "had caught",
          trap: "would have caught",
          d2: "caught",
          d3: "have caught",
          explZh: `针对昨天已发生的过去事件作反事实假设，主句为 \`would have arrived\`，故 \`If\` 从句必须用过去完成时 \`had caught\`（而非 \`would have caught\` 或一般过去时 \`caught\`）。`,
          explEn: `For a counterfactual past event ("yesterday", "would have arrived"), the If-clause requires past perfect "had caught", not "would have caught" or "caught".`,
          explJa: `過去の事実に反する仮定（yesterday, would have arrived）なので、If 節には過去完了形 "had caught" を用います（"would have caught" は誤りです）。`,
          explKo: `어제 일어난 과거 사실의 반대를 가정하므로(would have arrived), If절에는 과거완료 "had caught"를 써야 하며 "would have caught"는 오답입니다.`,
          explMs: `Bagi andaian bertentangan dengan fakta lampau ("yesterday", "would have arrived"), klausa If memerlukan "had caught", bukannya "would have caught".`,
        },
        {
          sentence: "If the botanist ______ the greenhouse thermostat last night, the rare orchids would not have wilted.",
          ans: "had checked",
          trap: "would have checked",
          d2: "checked",
          d3: "has checked",
          explZh: `主句 \`would not have wilted\` 表明是对昨晚（last night）过去事实的虚拟假设，\`If\` 从句须填过去完成时 \`had checked\`。`,
          explEn: `Paired with "would not have wilted" and "last night", the third-conditional If-clause requires past perfect "had checked".`,
          explJa: `主節の "would not have wilted" と "last night" に合わせ、If 節には過去完了形 "had checked" を選びます。`,
          explKo: `주절의 "would not have wilted" 및 "last night"과 호응하도록 If절에는 과거완료 "had checked"를 고릅니다.`,
          explMs: `Selaras dengan "would not have wilted" dan "last night", klausa If memerlukan bentuk "had checked".`,
        },
      ] as const;

      const it = dTier === "challenge"
        ? challengeItems[0]
        : dTier === "standard"
          ? rng.pick(baseItems.slice(1))
          : rng.pick(baseItems.slice(0, 2));
      return {
        promptZh: `【过去反事实虚拟条件句】根据主句 \`would have + p.p.\` 结构，选出语法严密的条件从句表达：\n"${it.sentence}"`,
        promptEn: `[Third Conditional Counterfactuals] Complete the past counterfactual conditional clause:\n"${it.sentence}"`,
        promptI18n: {
          ja: `【仮定法過去完了】主節の \`would have + 過去分詞\` に呼応する正しい条件節を選びなさい：\n"${it.sentence}"`,
          ko: `[가정법 과거완료] 주절의 \`would have + 과거분사\`에 호응하는 올바른 조건절 표현을 고르시오:\n"${it.sentence}"`,
          ms: `[Ayat Syarat Ketiga] Lengkapkan klausa syarat andaian lampau yang berpadanan dengan \`would have + p.p.\`:\n"${it.sentence}"`,
        },
        answer: it.ans,
        answerEn: it.ans,
        explanationZh: it.explZh,
        explanationEn: it.explEn,
        explanationI18n: { ja: it.explJa, ko: it.explKo, ms: it.explMs },
        scaffolds: [
          {
            promptZh: `第一步：与过去事实相反的虚拟条件从句中，能直接出现助动词 would 吗？（填 yes 或 no）`,
            promptEn: `Step 1: Is the modal "would" allowed inside the conditional If-clause itself? (yes/no)`,
            promptI18n: {
              ja: `ステップ 1：条件を表す If 節（または倒置節）の中に助動詞 would を入れてよいですか？（yes / no）`,
              ko: `1단계: 조건을 나타내는 If절(또는 도치절) 안에 조동사 would를 쓸 수 있습니까? (yes/no)`,
              ms: `Langkah 1: Adakah kata bantu "would" dibenarkan di dalam klausa syarat If itu sendiri? (yes/no)`,
            },
            hintZh: `主句用 would have done，条件从句绝不用 would`,
            hintEn: `"would have" belongs only in the main result clause`,
            hintI18n: {
              ja: `"would have" は帰結の主節でのみ使います`,
              ko: `"would have"는 귀결절(주절)에만 씁니다`,
              ms: `"would have" hanya digunakan dalam klausa induk keputusan`,
            },
            expectedAnswer: `no`,
          },
          {
            promptZh: `第二步：条件从句必须采用 \`had + 过去分词\`（省略 If 时倒装为 \`Had + 主语 + 过去分词\`），请选出正确项：`,
            promptEn: `Step 2: Select the option built on past perfect "had + past participle":`,
            promptI18n: {
              ja: `ステップ 2：過去完了形 \`had + 過去分詞\`（If 省略時は \`Had + 主語 + 過去分詞\`）を用いた選択肢を選びなさい：`,
              ko: `2단계: 과거완료 \`had + 과거분사\`(If 생략 시 \`Had + 주어 + 과거분사\`) 구조를 사용한 보기를 고르시오:`,
              ms: `Langkah 2: Pilih jawapan yang menggunakan struktur "had + partisipel lampau":`,
            },
            hintZh: `核对助动词 had 与过去分词形式`,
            hintEn: `Check auxiliary "had" + past participle`,
            hintI18n: {
              ja: `助動詞 had と過去分詞の形を確認します`,
              ko: `조동사 had와 과거분사 형태를 확인합니다`,
              ms: `Semak kata bantu "had" dan bentuk partisipel lampau`,
            },
            expectedAnswer: it.ans,
          },
        ],
        distractors: [
          { text: it.trap, textEn: it.trap, misconceptionTag: "misc_eng_if_would_have" },
          { text: it.d2, textEn: it.d2 },
          { text: it.d3, textEn: it.d3 },
        ],
      };
    }

    // 43. Geography: Tropospheric lapse rate (-0.6°C / 100m, unified Malay kadar susut suhu + snowline challenge!)
    case "geo_lapse_rate": {
      if (dTier === "challenge") {
        // Inverse freezing altitude (0°C snowline isotherm): h_0 = hBase + (tBase / 0.6) * 100
        const hBase = rng.pick([500, 800, 1100]);
        const tBase = rng.pick([12, 15, 18]);
        const deltaH = Math.round((tBase / 0.6) * 100); // 2000, 2500, 3000
        const hFreeze = hBase + deltaH;
        const subtractTrap = deltaH - hBase;
        return {
          promptZh: `某高山科考大本营位于海拔 $${hBase}\\text{ m}$ 处，实测气温为 $${tBase}^\\circ\\text{C}$。按对流层气温垂直递减率（海拔每升高 $100\\text{ m}$ 降温 $0.6^\\circ\\text{C}$），推算此时该山坡气温恰好降至冰点 $0^\\circ\\text{C}$ 处的**海拔高度**（单位 $\\text{m}$）：`,
          promptEn: `Base Camp sits at $${hBase}\\text{ m}$ elevation with an air temperature of $${tBase}^\\circ\\text{C}$. Using the environmental lapse rate ($-0.6^\\circ\\text{C}$ per $100\\text{ m}$), find the **elevation** (in $\\text{m}$) of the $0^\\circ\\text{C}$ freezing level:`,
          promptI18n: {
            ja: `標高 $${hBase}\\text{ m}$ のベースキャンプの気温は $${tBase}^\\circ\\text{C}$ です。気温減率（$100\\text{ m}$ につき $-0.6^\\circ\\text{C}$）を用いて、気温がちょうど $0^\\circ\\text{C}$ になる地点の**標高**（単位 $\\text{m}$）を求めなさい：`,
            ko: `해발 고도 $${hBase}\\text{ m}$인 베이스캠프의 기온이 $${tBase}^\\circ\\text{C}$입니다. 기온 감률($100\\text{ m}$당 $-0.6^\\circ\\text{C}$)을 적용할 때 기온이 정확히 $0^\\circ\\text{C}$가 되는 지점의 **해발 고도**(단위 $\\text{m}$)를 구하시오:`,
            ms: `Kem Pangkalan terletak pada ketinggian $${hBase}\\text{ m}$ dengan suhu udara $${tBase}^\\circ\\text{C}$. Menggunakan kadar susut suhu ($-0.6^\\circ\\text{C}$ bagi setiap $100\\text{ m}$), cari **ketinggian** (dalam $\\text{m}$) bagi aras beku $0^\\circ\\text{C}$:`,
          },
          latexFormula: `h_{0^\\circ\\text{C}} = ${hBase} + \\frac{${tBase}}{0.6}\\times 100`,
          answer: `${hFreeze}`,
          unit: "m",
          explanationZh: `从 $${tBase}^\\circ\\text{C}$ 降至 $0^\\circ\\text{C}$ 需降温 $${tBase}^\\circ\\text{C}$，对应相对升高 $\\Delta h = \\frac{${tBase}}{0.6} \\times 100 = ${deltaH}\\text{ m}$；再加上大本营起始海拔 $${hBase}\\text{ m}$，得 $0^\\circ\\text{C}$ 线海拔为 $${hBase} + ${deltaH} = ${hFreeze}\\text{ m}$（切忌漏加起始海拔只填相对高差 $${deltaH}\\text{ m}$！）。`,
          explanationEn: `Cooling from ${tBase}°C to 0°C requires rising Δh = (${tBase} / 0.6) × 100 = ${deltaH} m above Base Camp, so the freezing elevation is ${hBase} + ${deltaH} = ${hFreeze} m (do not forget base elevation ${hBase} m).`,
          explanationI18n: {
            ja: `$${tBase}^\\circ\\text{C}$ から $0^\\circ\\text{C}$ まで下がるのに必要な高度差は $\\Delta h = (${tBase} \\div 0.6) \\times 100 = ${deltaH}\\text{ m}$ です。ベースキャンプの標高 $${hBase}\\text{ m}$ を足して $${hBase} + ${deltaH} = ${hFreeze}\\text{ m}$ となります（高度差 $${deltaH}\\text{ m}$ をそのまま標高としないよう注意しましょう）。`,
            ko: `$${tBase}^\\circ\\text{C}$에서 $0^\\circ\\text{C}$까지 내려가려면 고도가 $\\Delta h = (${tBase} \\div 0.6) \\times 100 = ${deltaH}\\text{ m}$ 높아져야 합니다. 기준 해발 고도 $${hBase}\\text{ m}$를 더하면 $${hBase} + ${deltaH} = ${hFreeze}\\text{ m}$입니다(상대 고도 차 $${deltaH}\\text{ m}$만 쓰지 마십시오).`,
            ms: `Menggunakan kadar susut suhu, penurunan suhu $${tBase}^\\circ\\text{C}$ memerlukan kenaikan relatif $\\Delta h = (${tBase} / 0.6) \\times 100 = ${deltaH}\\text{ m}$. Tambahkan ketinggian asal $${hBase}\\text{ m}$ untuk mendapat $${hFreeze}\\text{ m}$ (jangan abaikan ketinggian tapak $${hBase}\\text{ m}$).`,
          },
          scaffolds: [
            {
              promptZh: `第一步：气温下降 ${tBase}°C 需要相对升高多少米（(${tBase} ÷ 0.6) × 100）？`,
              promptEn: `Step 1: Relative elevation gain Δh (in m) needed to drop ${tBase}°C:`,
              promptI18n: {
                ja: `ステップ 1：気温が ${tBase}°C 下がるのに必要な高度差 Δh（m）はいくつですか。`,
                ko: `1단계: 기온이 ${tBase}°C 내려가는 데 필요한 상대 고도 상승량 Δh(m)는 얼마입니까?`,
                ms: `Langkah 1: Kenaikan ketinggian relatif Δh (m) mengikut kadar susut suhu untuk turun ${tBase}°C:`,
              },
              hintZh: `(${tBase} ÷ 0.6) × 100`,
              hintEn: `(${tBase} / 0.6) × 100`,
              expectedAnswer: `${deltaH}`,
            },
            {
              promptZh: `第二步：加上大本营海拔 ${hBase} m，求 0°C 等温线的海拔高度：`,
              promptEn: `Step 2: Add Base Camp elevation ${hBase} m to ${deltaH} m:`,
              promptI18n: {
                ja: `ステップ 2：ベースキャンプの標高 ${hBase} m に ${deltaH} m を足しなさい：`,
                ko: `2단계: 베이스캠프 해발 고도 ${hBase} m에 ${deltaH} m를 더하시오:`,
                ms: `Langkah 2: Tambahkan ketinggian Kem Pangkalan ${hBase} m kepada ${deltaH} m:`,
              },
              hintZh: `${hBase} + ${deltaH}`,
              hintEn: `${hBase} + ${deltaH}`,
              expectedAnswer: `${hFreeze}`,
            },
          ],
          distractors: [
            { text: `${deltaH}`, misconceptionTag: "misc_geo_lapse_use_abs_h" },
            { text: `${subtractTrap}`, misconceptionTag: "misc_geo_lapse_use_abs_h" },
            { text: `${hBase}` },
          ],
          misconceptionsByValue: {
            [`${deltaH}`]: "misc_geo_lapse_use_abs_h",
            [`${subtractTrap}`]: "misc_geo_lapse_use_abs_h",
          },
        };
      }

      // Strictly disjoint ranges: drop <= 12 < 13.4 <= absHTrap < 17 <= tTop < tBase + drop
      const hBase = rng.pick([400, 600]);
      const deltaKm = dTier === "standard" ? rng.pick([1.5, 2.0]) : 1.5;
      const hTop = hBase + deltaKm * 1000;
      const tBase = rng.int(29, 33);
      const drop = Math.round(deltaKm * 6 * 10) / 10;
      const tTop = Math.round((tBase - drop) * 10) / 10;
      const absHTrap = Math.round((tBase - (hTop / 1000) * 6) * 10) / 10;
      return {
        promptZh: `某山地等高线测得山麓甲站海拔 $${hBase}\\text{ m}$，实测气温为 $${tBase}^\\circ\\text{C}$。按照对流层气温垂直递减率（海拔每升高 $100\\text{ m}$ 气温下降 $0.6^\\circ\\text{C}$），推算同一时刻海拔 $${hTop}\\text{ m}$ 山顶乙站的气温（单位 $^\\circ\\text{C}$）：`,
        promptEn: `Station A at $${hBase}\\text{ m}$ elevation records $${tBase}^\\circ\\text{C}$. Using the environmental lapse rate ($-0.6^\\circ\\text{C}$ per $100\\text{ m}$), estimate air temperature ($^\\circ\\text{C}$) at summit Station B ($${hTop}\\text{ m}$):`,
        promptI18n: {
          ja: `標高 $${hBase}\\text{ m}$ の山麓の地点 A で気温 $${tBase}^\\circ\\text{C}$ を観測しました。気温減率（$100\\text{ m}$ につき $-0.6^\\circ\\text{C}$）を用いて、同じ時刻の標高 $${hTop}\\text{ m}$ の山頂の地点 B の気温（$^\\circ\\text{C}$）を推定しなさい：`,
          ko: `해발 고도 $${hBase}\\text{ m}$인 산기슭 A 지점의 기온은 $${tBase}^\\circ\\text{C}$입니다. 기온 감률($100\\text{ m}$당 $-0.6^\\circ\\text{C}$)을 이용하여 같은 시각 해발 고도 $${hTop}\\text{ m}$인 산꼭대기 B 지점의 기온($^\\circ\\text{C}$)을 추정하시오:`,
          ms: `Stesen A pada ketinggian $${hBase}\\text{ m}$ mencatatkan suhu $${tBase}^\\circ\\text{C}$. Menggunakan kadar susut suhu ($-0.6^\\circ\\text{C}$ bagi setiap $100\\text{ m}$), anggarkan suhu udara ($^\\circ\\text{C}$) di Stesen B di puncak ($${hTop}\\text{ m}$):`,
        },
        latexFormula: `T_B = T_A - 0.6 \\times \\frac{${hTop} - ${hBase}}{100}`,
        answer: `${tTop}`,
        unit: "°C",
        explanationZh: `先算两站相对高差 $\\Delta h = ${hTop} - ${hBase} = ${deltaKm * 1000}\\text{ m}$；降温幅度为 $${deltaKm} \\times 6 = ${drop}^\\circ\\text{C}$，故山顶气温为 $${tBase} - ${drop} = ${tTop}^\\circ\\text{C}$（切勿直接拿绝对海拔 ${hTop} m 算得 ${absHTrap}°C）。`,
        explanationEn: `Relative elevation gain Δh = ${hTop - hBase} m → temperature drop = ${drop}°C → summit T = ${tBase} - ${drop} = ${tTop}°C.`,
        explanationI18n: {
          ja: `2 地点の高度差 Δh = ${hTop - hBase} m より気温低下は ${drop}°C となるため、山頂の気温は T = ${tBase} - ${drop} = ${tTop}°C です（山頂の標高 ${hTop} m をそのまま使って ${absHTrap}°C としないよう注意しましょう）。`,
          ko: `두 지점의 고도 차 Δh = ${hTop - hBase} m에 따른 기온 하강은 ${drop}°C이므로 산꼭대기 기온은 T = ${tBase} - ${drop} = ${tTop}°C입니다(산꼭대기의 해발 고도 ${hTop} m를 그대로 써서 ${absHTrap}°C로 계산하지 마십시오).`,
          ms: `Berdasarkan kadar susut suhu, beza ketinggian relatif Δh = ${hTop - hBase} m menyebabkan penurunan suhu ${drop}°C, maka suhu puncak T = ${tBase} - ${drop} = ${tTop}°C (jangan guna ketinggian mutlak ${hTop} m hingga mendapat ${absHTrap}°C).`,
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

    // 44. Geography: Noon solar altitude angle H = 90 - |phi - delta| (zero 68.5 collision + inverse latitude challenge!)
    case "geo_solar_angle_climate":
    case "geo_solar_altitude": {
      if (dTier === "challenge") {
        // Inverse latitude: Northern mid-latitude station (> 23.5°N) measures noon solar altitude H on June solstice (+23.5°N)
        const noonH = rng.pick([65, 70, 75, 80]);
        const zenithDist = 90 - noonH; // 25, 20, 15, 10
        const latAns = zenithDist + 23.5; // 48.5, 43.5, 38.5, 33.5
        const subTrap = Math.abs(23.5 - zenithDist); // 1.5, 3.5, 8.5, 13.5 (actually inside tropics south of 23.5°N!)
        return {
          promptZh: `北半球夏至日（太阳直射北回归线 $\\delta = +23.5^\\circ\\text{N}$），位于北回归线以北的某气象站测得正午太阳高度角为 $H = ${noonH}^\\circ$。求该气象站的地理纬度（单位：$^\\circ\\text{N}$，填数字如 $38.5$）：`,
          promptEn: `On the June solstice ($\\delta = 23.5^\\circ\\text{N}$), a weather station located north of the Tropic of Cancer records a noon solar altitude of $H = ${noonH}^\\circ$. Find the station's latitude (in $^\\circ\\text{N}$):`,
          promptI18n: {
            ja: `夏至の日（太陽の直射点は北回帰線 $\\delta = 23.5^\\circ\\text{N}$）、北回帰線より北にある気象観測所で南中高度 $H = ${noonH}^\\circ$ を観測しました。この観測所の北緯（単位：$^\\circ\\text{N}$）を求めなさい：`,
            ko: `하지(태양 직하점이 북회귀선 $\\delta = 23.5^\\circ\\text{N}$)에 북회귀선보다 북쪽에 위치한 기상 관측소에서 남중 고도 $H = ${noonH}^\\circ$를 관측했습니다. 이 관측소의 북위(단위: $^\\circ\\text{N}$)를 구하시오:`,
            ms: `Pada solstis Jun ($\\delta = 23.5^\\circ\\text{N}$), sebuah stesen kaji cuaca di utara Garisan Sartan mencatatkan sudut altitud suria tengah hari $H = ${noonH}^\\circ$. Cari latitud stesen tersebut (dalam $^\\circ\\text{N}$):`,
          },
          latexFormula: `90^\\circ - (\\varphi - 23.5^\\circ) = ${noonH}^\\circ \\implies \\varphi = ${zenithDist}^\\circ + 23.5^\\circ`,
          answer: `${latAns}`,
          unit: "°N",
          explanationZh: `由 $H = 90^\\circ - |\\varphi - 23.5^\\circ| = ${noonH}^\\circ$ 得纬度差 $|\\varphi - 23.5^\\circ| = 90^\\circ - ${noonH}^\\circ = ${zenithDist}^\\circ$；因站点位于北回归线以北（$\\varphi > 23.5^\\circ\\text{N}$），故 $\\varphi = 23.5^\\circ + ${zenithDist}^\\circ = ${latAns}^\\circ\\text{N}$。`,
          explanationEn: `Zenith distance = $90^\\circ - ${noonH}^\\circ = ${zenithDist}^\\circ$. Since the station lies north of $23.5^\\circ\\text{N}$, $\\varphi = 23.5^\\circ + ${zenithDist}^\\circ = ${latAns}^\\circ\\text{N}$.`,
          explanationI18n: {
            ja: `緯度差 $|\\varphi - 23.5^\\circ| = 90^\\circ - ${noonH}^\\circ = ${zenithDist}^\\circ$ です。北回帰線より北（$\\varphi > 23.5^\\circ\\text{N}$）にあるため、$\\varphi = 23.5^\\circ + ${zenithDist}^\\circ = ${latAns}^\\circ\\text{N}$ となります。`,
            ko: `위도 차 $|\\varphi - 23.5^\\circ| = 90^\\circ - ${noonH}^\\circ = ${zenithDist}^\\circ$이며, 북회귀선 북쪽($\\varphi > 23.5^\\circ\\text{N}$)이므로 $\\varphi = 23.5^\\circ + ${zenithDist}^\\circ = ${latAns}^\\circ\\text{N}$입니다.`,
            ms: `Beza latitud $|\\varphi - 23.5^\\circ| = 90^\\circ - ${noonH}^\\circ = ${zenithDist}^\\circ$. Oleh sebab stesen berada di utara $23.5^\\circ\\text{N}$, $\\varphi = 23.5^\\circ + ${zenithDist}^\\circ = ${latAns}^\\circ\\text{N}$.`,
          },
          scaffolds: [
            {
              promptZh: `第一步：由 H = 90° - Δφ，观测站与北回归线相差多少度纬度（90 - ${noonH}）？`,
              promptEn: `Step 1: Find the latitudinal distance Δφ = 90 - ${noonH}:`,
              promptI18n: {
                ja: `ステップ 1：北回帰線との緯度差 $\\Delta\\varphi = 90 - ${noonH}$ を求めなさい：`,
                ko: `1단계: 북회귀선과의 위도 차 $\\Delta\\varphi = 90 - ${noonH}$을 구하시오:`,
                ms: `Langkah 1: Cari jarak latitud $\\Delta\\varphi = 90 - ${noonH}$:`,
              },
              hintZh: `90 - ${noonH}`,
              hintEn: `90 - ${noonH}`,
              expectedAnswer: `${zenithDist}`,
            },
            {
              promptZh: `第二步：站点在 23.5°N 以北，将 23.5 + ${zenithDist} 得该站纬度：`,
              promptEn: `Step 2: Add 23.5 + ${zenithDist} for north of the Tropic of Cancer:`,
              promptI18n: {
                ja: `ステップ 2：北回帰線より北なので $23.5 + ${zenithDist}$ を計算しなさい：`,
                ko: `2단계: 북회귀선 북쪽이므로 $23.5 + ${zenithDist}$을 계산하시오:`,
                ms: `Langkah 2: Tambahkan $23.5 + ${zenithDist}$:`,
              },
              hintZh: `23.5 + ${zenithDist}`,
              hintEn: `23.5 + ${zenithDist}`,
              expectedAnswer: `${latAns}`,
            },
          ],
          distractors: [
            { text: `${subTrap}`, misconceptionTag: "misc_geo_solar_same_sign" },
            { text: `${zenithDist}` },
            { text: `${noonH - 23.5}` },
          ],
          misconceptionsByValue: { [`${subTrap}`]: "misc_geo_solar_same_sign" },
        };
      }

      // Use [28, 32, 36, 40] so ans (<=38.5), latDiff (51.5..63.5), sameSignTrap (73.5..85.5), and 90-latN (integers) NEVER collide!
      const latN = dTier === "standard" ? rng.pick([36, 40]) : rng.pick([28, 32]);
      const latDiff = latN + 23.5;
      const ans = 90 - latDiff;
      const sameSignTrap = 90 - Math.abs(latN - 23.5);
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
          ja: `観測地（北緯）と直射点（南緯）は異なる半球にあるため緯度差は足し合わせます：${latN}° + 23.5° = ${latDiff}°。よって H = 90° - ${latDiff}° = ${ans}° です（誤って引き算すると夏至の ${sameSignTrap}° になります）。`,
          ko: `관측 지점(북위)과 태양 직하점(남위)이 서로 다른 반구에 있으므로 위도 차를 더합니다: ${latN}° + 23.5° = ${latDiff}°, 따라서 H = 90° - ${latDiff}° = ${ans}°입니다(잘못 빼면 하지의 ${sameSignTrap}°가 됩니다).`,
          ms: `Hemisfera yang berlainan menjumlahkan beza latitud: ${latN}° + 23.5° = ${latDiff}°, maka H = 90° - ${latDiff}° = ${ans}° (jika ditolak secara salah, hasilnya ${sameSignTrap}° iaitu nilai solstis Jun).`,
        },
        scaffolds: [
          {
            promptZh: `北纬 ${latN}° 与南纬 23.5° 跨赤道相隔多少度纬度？`,
            promptEn: `Total latitude separation (${latN} + 23.5):`,
            promptI18n: {
              ja: `北緯 ${latN}° と南緯 23.5° の緯度差の合計（${latN} + 23.5）はいくつですか。`,
              ko: `북위 ${latN}°와 남위 23.5°의 전체 위도 차(${latN} + 23.5)는 얼마입니까?`,
              ms: `Jumlah beza latitud (${latN} + 23.5):`,
            },
            hintZh: `异半球相加`,
            hintEn: `Add latitudes`,
            hintI18n: { ja: `異なる半球なので緯度を足します`, ko: `다른 반구이므로 위도를 더합니다`, ms: `Tambah latitud (hemisfera berlainan)` },
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

    // 45. History: Quantitative trade balance (zero surplus===importsVal collision + share-vs-absolute challenge!)
    case "his_trade_balance": {
      if (dTier === "challenge") {
        // Share vs Absolute Value trap: total exports double/triple while silk's % share drops slightly -> absolute silk export GROWS!
        const totalY1 = 200; // million silver dollars
        const shareY1 = 40; // % -> 80
        const totalY2 = rng.pick([400, 500, 600]);
        const shareY2 = 30; // % -> 120, 150, 180
        const valY1 = (totalY1 * shareY1) / 100; // 80
        const valY2 = (totalY2 * shareY2) / 100; // 120, 150, 180
        const netIncrease = valY2 - valY1; // +40, +70, +100
        const pctDiffTrap = shareY2 - shareY1; // -10 (confusing percentage-point drop with value change!)
        return {
          promptZh: `【经济史料“比重 vs 绝对额”辨析】档案记载：甲年某口岸出口总额为 $${totalY1}$ 万银元，其中生丝占 $${shareY1}\\%$；乙年出口总额增至 $${totalY2}$ 万银元，生丝占比降至 $${shareY2}\\%$。尽管占比下降，乙年生丝实际出口额比甲年**净增加了**多少万银元？`,
          promptEn: `[Historical Economic Data: Share vs. Absolute Value] In Year A, total port exports were $${totalY1}$ ten-thousand silver dollars with silk accounting for $${shareY1}\\%$. In Year B, total exports rose to $${totalY2}$ ten-thousand silver dollars while silk's share fell to $${shareY2}\\%$. By how many ten-thousand silver dollars did silk exports **actually increase** from Year A to Year B?`,
          promptI18n: {
            ja: `【経済史料：割合と実額の区別】記録によると、A 年の輸出総額は $${totalY1}$ 万銀元で生糸が $${shareY1}\\%$ を占め、B 年には輸出総額が $${totalY2}$ 万銀元に増える一方、生糸の割合は $${shareY2}\\%$ に低下しました。B 年の生糸の実際の輸出額は A 年より何万銀元**増加**しましたか。`,
            ko: `[경제 사료: 비중과 절대액의 구분] 기록에 따르면 A년 수출 총액은 $${totalY1}$만 은화(생사 비중 $${shareY1}\\%$)였고, B년 수출 총액은 $${totalY2}$만 은화로 늘어난 반면 생사 비중은 $${shareY2}\\%$로 낮아졌습니다. B년 생사의 실제 수출액은 A년보다 몇 만 은화 **순증가**했습니까?`,
            ms: `[Data Ekonomi Sejarah: Peratusan lwn Nilai Mutlak] Pada Tahun A, jumlah eksport ialah $${totalY1}$ puluh ribu dolar perak (sutera $${shareY1}\\%$). Pada Tahun B, jumlah eksport meningkat kepada $${totalY2}$ puluh ribu dolar perak manakala bahagian sutera turun kepada $${shareY2}\\%$. Berapakah **pertambahan bersih** nilai eksport sutera (dalam unit 10,000 dolar perak) dari Tahun A ke Tahun B?`,
          },
          latexFormula: `\\Delta V = ${totalY2}\\times ${shareY2}\\% - ${totalY1}\\times ${shareY1}\\%`,
          answer: `${netIncrease}`,
          explanationZh: `切忌把“比重下降”误判为“绝对额减少”！甲年生丝出口额 $= ${totalY1} \\times ${shareY1}\\% = ${valY1}$ 万银元；乙年生丝出口额 $= ${totalY2} \\times ${shareY2}\\% = ${valY2}$ 万银元；实际净增加 $${valY2} - ${valY1} = ${netIncrease}$ 万银元。`,
          explanationEn: `A falling share inside a rapidly expanding pie can still yield higher absolute volume: Year A = ${valY1}, Year B = ${valY2}, net increase = ${valY2} - ${valY1} = ${netIncrease}.`,
          explanationI18n: {
            ja: `割合が下がっても総額が大きく伸びれば実額は増えます。A 年 = ${valY1} 万銀元、B 年 = ${valY2} 万銀元なので、差は ${valY2} - ${valY1} = ${netIncrease} 万銀元の増加です。`,
            ko: `비중이 줄어도 전체 규모가 크게 늘어나면 절대액은 증가합니다. A년 = ${valY1}만 은화, B년 = ${valY2}만 은화이므로 실제 순증가액은 ${valY2} - ${valY1} = ${netIncrease}만 은화입니다.`,
            ms: `Walaupun peratusan menurun, jumlah keseluruhan berkembang pesat: Tahun A = ${valY1}, Tahun B = ${valY2}, maka pertambahan bersih = ${valY2} - ${valY1} = ${netIncrease}.`,
          },
          scaffolds: [
            {
              promptZh: `第一步：分别算出乙年生丝实际出口额（${totalY2} × ${shareY2}%）：`,
              promptEn: `Step 1: Compute Year B's actual silk export value (${totalY2} × ${shareY2}%):`,
              promptI18n: {
                ja: `ステップ 1：B 年の生糸の実際の輸出額（${totalY2} × ${shareY2}%）を求めなさい：`,
                ko: `1단계: B년 생사의 실제 수출액(${totalY2} × ${shareY2}%)을 구하시오:`,
                ms: `Langkah 1: Kira nilai sebenar eksport sutera Tahun B (${totalY2} × ${shareY2}%):`,
              },
              hintZh: `${totalY2} × 0.3`,
              hintEn: `${totalY2} × 0.3`,
              expectedAnswer: `${valY2}`,
            },
            {
              promptZh: `第二步：减去甲年生丝实际出口额 ${valY1}（${totalY1} × ${shareY1}%），求净增加额：`,
              promptEn: `Step 2: Subtract Year A's silk export value (${valY1}) from ${valY2}:`,
              promptI18n: {
                ja: `ステップ 2：${valY2} から A 年の実額 ${valY1} を引きなさい：`,
                ko: `2단계: ${valY2}에서 A년 실제 수출액 ${valY1}을 빼시오:`,
                ms: `Langkah 2: Tolak nilai Tahun A (${valY1}) daripada ${valY2}:`,
              },
              hintZh: `${valY2} - ${valY1}`,
              hintEn: `${valY2} - ${valY1}`,
              expectedAnswer: `${netIncrease}`,
            },
          ],
          distractors: [
            { text: `${pctDiffTrap}`, misconceptionTag: "misc_his_share_vs_abs" },
            { text: `${valY2}`, misconceptionTag: "misc_his_share_vs_abs" },
            { text: `${valY1}` },
          ],
          misconceptionsByValue: {
            [`${pctDiffTrap}`]: "misc_his_share_vs_abs",
            [`${valY2}`]: "misc_his_share_vs_abs",
          },
        };
      }

      // Strictly disjoint: exportsVal in [490..620], importsVal in [160..240] -> surplus >= 250 > importsVal!
      const exportsVal = (dTier === "standard" ? rng.int(54, 62) : rng.int(49, 55)) * 10;
      const importsVal = (dTier === "standard" ? rng.int(19, 24) : rng.int(16, 20)) * 10;
      const surplus = exportsVal - importsVal;
      const totalVolumeTrap = exportsVal + importsVal;
      return {
        promptZh: `【经济史料定量解读】海关档案记载某通商口岸某年度商品出口总额为 $${exportsVal}$ 万银元，商品进口总额为 $${importsVal}$ 万银元。该年度该口岸对外贸易出超（顺差）净额为多少万银元？`,
        promptEn: `[Historical Trade Archives] Customs records show annual exports of $${exportsVal}$ ten-thousand silver dollars (×10,000) and imports of $${importsVal}$ ten-thousand silver dollars. Find the net trade surplus (in ten-thousand silver dollars):`,
        promptI18n: {
          ja: `【経済史料の数量的読解】税関の記録によると、ある開港場のある年の輸出総額は $${exportsVal}$ 万銀元、輸入総額は $${importsVal}$ 万銀元でした。この年の貿易黒字（輸出超過）の純額は何万銀元ですか。`,
          ko: `[경제 사료의 정량적 해석] 세관 기록에 따르면 어느 개항장의 한 해 수출 총액은 $${exportsVal}$만 은화, 수입 총액은 $${importsVal}$만 은화였습니다. 이해의 무역 흑자(수출 초과) 순액을 구하시오(단위: 만 은화):`,
          ms: `[Arkib Perdagangan Sejarah] Rekod kastam menunjukkan eksport tahunan bernilai $${exportsVal}$ puluh ribu dolar perak (×10,000) dan import bernilai $${importsVal}$ puluh ribu dolar perak. Cari lebihan dagangan bersih (dalam unit 10,000 dolar perak):`,
        },
        answer: `${surplus}`,
        explanationZh: `贸易顺差（出超）= 出口总额 - 进口总额 = $${exportsVal} - ${importsVal} = ${surplus}$ 万银元（注意区分“贸易总额” $${totalVolumeTrap}$ 与“顺差净额” $${surplus}$）。`,
        explanationEn: `Net trade surplus = Exports - Imports = ${exportsVal} - ${importsVal} = ${surplus}.`,
        explanationI18n: {
          ja: `貿易黒字（輸出超過）= 輸出総額 - 輸入総額 = ${exportsVal} - ${importsVal} = ${surplus} 万銀元です（貿易総額 ${totalVolumeTrap} 万銀元と黒字の純額 ${surplus} 万銀元を区別しましょう）。`,
          ko: `무역 흑자(수출 초과) = 수출 총액 - 수입 총액 = ${exportsVal} - ${importsVal} = ${surplus}만 은화입니다(무역 총액 ${totalVolumeTrap}만 은화와 흑자 순액 ${surplus}만 은화를 구별하십시오).`,
          ms: `Lebihan dagangan bersih = Eksport - Import = ${exportsVal} - ${importsVal} = ${surplus} (bezakan jumlah dagangan ${totalVolumeTrap} dengan lebihan bersih ${surplus}).`,
        },
        scaffolds: [
          {
            promptZh: `第一步：出口额 $${exportsVal}$ 大于进口额 $${importsVal}$，顺差（出超）应用减法还是加法？（填 - 或 +）`,
            promptEn: `Step 1: Should you subtract (-) or add (+) imports to compute net trade surplus?`,
            promptI18n: {
              ja: `ステップ 1：貿易黒字（輸出超過）を求めるときは引き算（-）ですか、足し算（+）ですか？`,
              ko: `1단계: 무역 흑자(수출 초과) 순액을 구할 때 뺄셈(-)과 덧셈(+) 중 무엇을 씁니까?`,
              ms: `Langkah 1: Untuk mengira lebihan dagangan bersih, gunakan penolakan (-) atau penambahan (+)?`,
            },
            hintZh: `顺差 = 出口 - 进口；进出口相加是贸易总额`,
            hintEn: `Surplus = Exports - Imports`,
            hintI18n: {
              ja: `貿易黒字 = 輸出額 - 輸入額`,
              ko: `무역 흑자 = 수출액 - 수입액`,
              ms: `Lebihan dagangan = Eksport - Import`,
            },
            expectedAnswer: `-`,
          },
          {
            promptZh: `第二步：计算 ${exportsVal} - ${importsVal} 得顺差净额：`,
            promptEn: `Step 2: Subtract imports ${importsVal} from exports ${exportsVal}:`,
            promptI18n: {
              ja: `ステップ 2：輸出額 ${exportsVal} から輸入額 ${importsVal} を引きなさい：`,
              ko: `2단계: 수출액 ${exportsVal}에서 수입액 ${importsVal}을 빼시오:`,
              ms: `Langkah 2: Tolak import ${importsVal} daripada eksport ${exportsVal}:`,
            },
            hintZh: `${exportsVal} - ${importsVal}`,
            hintEn: `${exportsVal} - ${importsVal}`,
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

    // 46. History: Industrial Revolutions & per-variant explanations/scaffolds across 3 tiers
    case "his_industrial_era": {
      const variants = [
        {
          // Basic: 1825 First IR anachronism check
          qZh: "某历史展馆复原“1825年英国第一次工业革命时期城市生活”场景，以下哪项陈列品属于违背史实的**时代错置（穿帮）**？",
          qEn: "In a museum exhibit reconstructing daily life in Britain in 1825 (First Industrial Revolution), which artifact is a historical anachronism?",
          qI18n: {
            ja: "1825年のイギリス（第一次産業革命期）の都市生活を再現した博物館の展示で、史実に反する**時代錯誤（アナクロニズム）**の展示品はどれですか。",
            ko: "1825년 영국(제1차 산업 혁명 시기)의 도시 생활을 재현한 박물관 전시에서 역사적 사실에 어긋나는 **시대착오적인** 전시품은 무엇입니까?",
            ms: "Dalam pameran muzium yang membina semula kehidupan harian di Britain pada tahun 1825 (Revolusi Perindustrian Pertama), artifak manakah yang merupakan **anakronisme sejarah**?",
          },
          ansZh: "街道上方架设白炽电灯与卡尔·本茨内燃机汽车",
          ansEn: "Incandescent electric streetlamps and Benz gasoline automobiles",
          ansI18n: {
            ja: "白熱電球の街灯とカール・ベンツのガソリン自動車",
            ko: "백열전구 가로등과 카를 벤츠의 가솔린 자동차",
            ms: "Lampu jalan elektrik pijar dan kereta petrol Benz",
          },
          explZh: "第一次工业革命（18世纪60年代—19世纪中期）以煤炭与瓦特改良蒸汽机为标志；实用白炽电灯（1879）与本茨内燃机汽车（1885/1886）属于19世纪晚期第二次工业革命的成果，不可能出现在1825年。",
          explEn: "The First Industrial Revolution (c. 1760–1840) centered on coal, iron, and steam; incandescent electric lamps (1879) and Benz gasoline cars (1885/1886) belong to the Second Industrial Revolution.",
          explI18n: {
            ja: "第一次産業革命（1760年代〜19世紀半ば）は石炭と蒸気機関が中心であり、白熱電球（1879年）とガソリン自動車（1885/1886年）は1870年代以降の第二次産業革命の成果なので1825年には存在しません。",
            ko: "제1차 산업 혁명(1760년대~19세기 중엽)은 석탄과 증기 기관이 중심이었으며, 백열전구(1879년)와 가솔린 자동차(1885/1886년)는 1870년대 이후 제2차 산업 혁명의 산물이므로 1825년에 등장할 수 없습니다.",
            ms: "Revolusi Perindustrian Pertama (1760-an–1840-an) berasaskan arang batu dan enjin stim; lampu elektrik pijar (1879) dan kereta petrol Benz (1885/1886) ialah ciptaan Revolusi Perindustrian Kedua.",
          },
          step1PromptZh: "第一步：1825年处于“蒸汽与煤炭时代”（填 1）还是“电力与石油内燃机时代”（填 2）？",
          step1PromptEn: "Step 1: Does the year 1825 fall in the Steam & Coal Age (1) or the Electricity & Oil Age (2)?",
          step1PromptI18n: {
            ja: "ステップ 1：1825 年は「蒸気と石炭の時代（1）」ですか、「電力と石油・内燃機関の時代（2）」ですか？",
            ko: "1단계: 1825년은 '증기와 석탄의 시대(1)'입니까, '전기와 석유 내연 기관의 시대(2)'입니까?",
            ms: "Langkah 1: Adakah tahun 1825 berada dalam Zaman Stim & Arang Batu (1) atau Zaman Elektrik & Enjin Pembakaran Dalam (2)?",
          },
          step1Expected: "1",
          step2PromptZh: "第二步：找出选项中不属于蒸汽时代、而属于1870年代后第二次工业革命的陈列品：",
          step2PromptEn: "Step 2: Select the exhibit item invented only during the post-1870 Second Industrial Revolution:",
          step2PromptI18n: {
            ja: "ステップ 2：1870 年代以降の第二次産業革命ではじめて登場した展示品を選びなさい：",
            ko: "2단계: 1870년대 이후 제2차 산업 혁명 시기에야 발명된 전시품을 고르시오:",
            ms: "Langkah 2: Pilih artifak yang hanya dicipta semasa Revolusi Perindustrian Kedua selepas 1870:",
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
          // Standard: R&D science-technology coupling contrast between 1st and 2nd IR
          qZh: "关于两次工业革命技术演进特征的比较，下列史学论断最严密的是：",
          qEn: "Which historical statement most accurately contrasts the First and Second Industrial Revolutions?",
          qI18n: {
            ja: "第一次産業革命と第二次産業革命の技術的特徴を比較した記述として、最も正確なものはどれですか。",
            ko: "제1차 산업 혁명과 제2차 산업 혁명의 기술적 특징을 가장 정확하게 비교한 역사적 진술은 무엇입니까?",
            ms: "Pernyataan sejarah manakah yang paling tepat membezakan Revolusi Perindustrian Pertama dan Kedua?",
          },
          ansZh: "第二次工业革命体现自然科学理论突破（如电磁学、有机化学）与工业研发紧密结合",
          ansEn: "The Second IR tightly coupled breakthroughs in scientific theory (e.g., electromagnetism, organic chemistry) with industrial R&D",
          ansI18n: {
            ja: "第二次産業革命では、自然科学の理論的発展（電磁気学・有機化学など）と工業技術の研究開発が密接に結びついた",
            ko: "제2차 산업 혁명에서는 자연과학 이론의 발전(예: 전자기학, 유기화학)과 산업 기술 연구 개발이 긴밀하게 결합되었다",
            ms: "Revolusi Perindustrian Kedua menggabungkan rapat kemajuan teori sains (cth. keelektromagnetan, kimia organik) dengan penyelidikan dan pembangunan industri",
          },
          explZh: "第一次工业革命的发明多源于熟练工匠和技师的实践改良；而第二次工业革命（1870年后）中法拉第电磁感应定律、有机合成化学等基础科学理论直接转化为发电机、合成染料与内燃机工业，标志着科学与技术真正走向深度融合。",
          explEn: "While First IR inventions came largely from shop-floor mechanical craftsmanship, the Second IR (post-1870) translated laboratory science — such as Maxwell/Faraday electromagnetism and organic chemistry — directly into electrical, chemical, and automotive industries.",
          explI18n: {
            ja: "第一次産業革命の技術革新は熟練職人の現場での改良が中心でしたが、第二次産業革命（1870年代以降）では電磁気学や有機化学などの科学理論が企業の研究施設を通じて発電・化学・自動車産業へ直結しました。",
            ko: "제1차 산업 혁명의 발명이 주로 숙련 기술자의 현장 경험에서 비롯된 것과 달리, 제2차 산업 혁명(1870년대 이후)에서는 전자기학·유기화학 등 자연과학 이론이 연구소를 통해 전력·화학·자동차 산업으로 직결되었습니다.",
            ms: "Berbeza dengan Revolusi Pertama yang banyak berasaskan kemahiran mekanikal tukang, Revolusi Perindustrian Kedua (selepas 1870) menterjemahkan teori sains makmal seperti keelektromagnetan dan kimia organik secara terus ke dalam industri.",
          },
          step1PromptZh: "第一步：法拉第电磁感应理论直接催生发电机与电力工业，发生在第几次工业革命？（填 1 或 2）",
          step1PromptEn: "Step 1: Which Industrial Revolution translated electromagnetic theory directly into electric power grids? (1 or 2)",
          step1PromptI18n: {
            ja: "ステップ 1：電磁気学の理論が発電機や電力網の産業化に直結したのは第何次産業革命ですか？（1 / 2）",
            ko: "1단계: 전자기학 이론이 발전기와 전력 산업으로 직접 이어진 것은 제몇 차 산업 혁명입니까? (1 또는 2)",
            ms: "Langkah 1: Revolusi Perindustrian ke berapakah yang menterjemahkan teori keelektromagnetan kepada industri kuasa elektrik? (1 atau 2)",
          },
          step1Expected: "2",
          step2PromptZh: "第二步：据此选出准确概括第二次工业革命“科学理论与工业研发紧密结合”特征的论断：",
          step2PromptEn: "Step 2: Select the statement that accurately captures this science–industry R&D coupling:",
          step2PromptI18n: {
            ja: "ステップ 2：「科学理論と工業研究開発の密接な結合」を正しく述べた選択肢を選びなさい：",
            ko: "2단계: '과학 이론과 산업 연구 개발의 긴밀한 결합'을 정확히 서술한 보기를 고르시오:",
            ms: "Langkah 2: Pilih pernyataan yang tepat menggambarkan gabungan teori sains dan R&D industri ini:",
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
        {
          // Challenge: Structural economic & geographic shift (multi-polar US/Germany heavy industry & steel/oil/electricity in 1870-1914)
          qZh: "【经济史统计印证】据史料统计，1870—1913年间全球钢产量增长逾 100 倍，且美国、德国在电机、有机化工与钢铁产值上相继超越英国。推动这一产业格局巨变的核心历史动因是：",
          qEn: "[Historical Industrial Structure] Between 1870 and 1913, world steel output surged over 100-fold while the United States and Germany overtook Britain in electrical equipment, chemicals, and steel. What primarily drove this structural shift?",
          qI18n: {
            ja: "【経済史データの読解】1870〜1913年の間に世界の鋼鉄生産量は100倍以上に急増し、電機・化学・鉄鋼分野でアメリカとドイツがイギリスを追い抜きました。この構造変化をもたらした主な要因はどれですか。",
            ko: "[경제사 통계 해석] 1870~1913년 사이 세계 강철 생산량이 100배 이상 급증하고 전기·화학·철강 분야에서 미국과 독일이 영국을 추월했습니다. 이러한 산업 구조 변화를 이끈 핵심 요인은 무엇입니까?",
            ms: "[Struktur Ekonomi Sejarah] Antara tahun 1870 hingga 1913, pengeluaran keluli dunia melonjak melebihi 100 kali ganda manakala Amerika Syarikat dan Jerman memintas Britain dalam peralatan elektrik, kimia, dan keluli. Apakah pemacu utama perubahan struktur ini?",
          },
          ansZh: "第二次工业革命在美、德等多中心同步推进，廉价炼钢法、电力网与重化工业体系迅速崛起",
          ansEn: "Simultaneous Second IR adoption across multiple centers (especially the US and Germany) in cheap steelmaking, electric power, and heavy chemicals",
          ansI18n: {
            ja: "第二次産業革命が米・独など複数の国で同時に進展し、安価な製鋼法・電力網・重化学工業が急速に拡大したこと",
            ko: "제2차 산업 혁명이 미국·독일 등 다중 중심지에서 동시에 전개되며 대량 제강법·전력망·중화학 공업이 급성장한 것",
            ms: "Perkembangan serentak Revolusi Perindustrian Kedua di pelbagai pusat (AS dan Jerman) melalui pembuatan keluli kos rendah, kuasa elektrik, dan industri kimia berat",
          },
          explZh: "1870—1913年正值第二次工业革命高潮：不同于第一次工业革命“英国一枝独秀、轻纺与生铁为主”，第二次工业革命在美、德等多国同步突破，贝塞麦/平炉炼钢法、远距离输电与现代化工企业研究实验室造就了重化工业时代的赶超。",
          explEn: "Unlike the First IR (which began chiefly in Britain around textiles and wrought/cast iron), 1870–1913 marks the Second IR, when Bessemer/open-hearth steel, electrical grids, and corporate chemical R&D advanced simultaneously in the US and Germany.",
          explI18n: {
            ja: "1870〜1913年は第二次産業革命の時期にあたります。イギリス中心の綿工業が主導した第一次産業革命とは異なり、大量製鋼法・電力・化学工業を軸にアメリカやドイツなど複数の国で同時に重化学工業化が進みました。",
            ko: "1870~1913년은 제2차 산업 혁명기로, 영국 중심의 면방직 공업이 주도했던 제1차 산업 혁명과 달리 대량 제강법·전력·화학 공업을 바탕으로 미국과 독일 등에서 다원적으로 중화학 공업화가 진행되었습니다.",
            ms: "Tempoh 1870–1913 ialah era Revolusi Perindustrian Kedua. Berbeza dengan Revolusi Pertama yang tertumpu pada tekstil di Britain, pembuatan keluli pukal, grid elektrik, dan kimia berat berkembang pesat secara serentak di AS dan Jerman.",
          },
          step1PromptZh: "第一步：材料中的时间段“1870—1913年”及“电机、化工、炼钢”对应第几次工业革命？（填 1 或 2）",
          step1PromptEn: "Step 1: Do the years 1870–1913 and electrical/chemical/steel industries belong to Industrial Revolution 1 or 2?",
          step1PromptI18n: {
            ja: "ステップ 1：「1870〜1913年」と「電機・化学・鉄鋼」は第何次産業革命に対応しますか？（1 / 2）",
            ko: "1단계: '1870~1913년'과 '전기·화학·철강'은 제몇 차 산업 혁명에 해당합니까? (1 또는 2)",
            ms: "Langkah 1: Adakah tempoh 1870–1913 serta industri elektrik/kimia/keluli merujuk kepada Revolusi Perindustrian 1 atau 2?",
          },
          step1Expected: "2",
          step2PromptZh: "第二步：结合第二次工业革命多中心发展与重化工业特征，选出史实严密的解释：",
          step2PromptEn: "Step 2: Choose the explanation matching multi-center Second IR heavy industrialization:",
          step2PromptI18n: {
            ja: "ステップ 2：複数国での同時進展と重化学工業化を正しく説明した選択肢を選びなさい：",
            ko: "2단계: 다중 중심지 발전과 중화학 공업화 특징을 정확히 설명한 보기를 고르시오:",
            ms: "Langkah 2: Pilih penjelasan yang menepati perindustrian berat berbilang pusat Revolusi Kedua:",
          },
          d1: "珍妮纺纱机与水利织布机在美、德手工作坊的首次发明",
          d1En: "Initial invention of the spinning jenny and water-powered looms in US and German workshops",
          d1I18n: {
            ja: "ジェニー紡績機と水力織機が米・独の手仕事場で初めて発明されたこと",
            ko: "제니 방적기와 수력 직기가 미국과 독일 수공업장에서 처음 발명된 것",
            ms: "Penciptaan awal mesin pintal Jenny dan alat tenun kuasa air di bengkel AS dan Jerman",
          },
          d2: "核电站商业并网与微电子集成电路在19世纪末的全面普及",
          d2En: "Widespread late-19th-century deployment of commercial nuclear power plants and microchips",
          d2I18n: {
            ja: "19世紀末に商業用原子力発電と集積回路（IC）が全面的に普及したこと",
            ko: "19세기 말 상업용 원자력 발전소와 마이크로칩 집적 회로가 전면 보급된 것",
            ms: "Penggunaan meluas loji kuasa nuklear komersial dan mikrocip pada akhir abad ke-19",
          },
          d3: "英国主动关闭所有煤矿与铁路，完全退回中世纪庄园农业",
          d3En: "Britain voluntarily shutting down all coal mines and railways to return to medieval manorial farming",
          d3I18n: {
            ja: "イギリスがすべての炭鉱と鉄道を閉鎖し、中世の荘園農業へ戻ったこと",
            ko: "영국이 모든 탄광과 철도를 폐쇄하고 중세 장원 농업으로 회귀한 것",
            ms: "Britain menutup semua lombong arang batu dan kereta api untuk kembali kepada pertanian manor zaman pertengahan",
          },
        },
      ] as const;

      const p = dTier === "challenge" ? variants[2] : dTier === "standard" ? variants[1] : variants[0];
      return {
        promptZh: p.qZh,
        promptEn: p.qEn,
        promptI18n: p.qI18n,
        answer: p.ansZh,
        answerEn: p.ansEn,
        answerI18n: p.ansI18n,
        explanationZh: p.explZh,
        explanationEn: p.explEn,
        explanationI18n: p.explI18n,
        scaffolds: [
          {
            promptZh: p.step1PromptZh,
            promptEn: p.step1PromptEn,
            promptI18n: p.step1PromptI18n,
            hintZh: `1760s–1840s 为第一次（蒸汽/煤），1870s–1914 为第二次（电力/内燃机/重化工）`,
            hintEn: `1st IR: c. 1760–1840 (steam/coal); 2nd IR: post-1870 (electricity/oil/steel/chemicals)`,
            hintI18n: {
              ja: `第一次：1760年代〜（蒸気・石炭）、第二次：1870年代〜（電力・石油・鉄鋼・化学）`,
              ko: `제1차: 1760년대~(증기·석탄), 제2차: 1870년대~(전력·석유·철강·화학)`,
              ms: `Pertama: 1760-an (stim/arang batu); Kedua: selepas 1870 (elektrik/minyak/keluli/kimia)`,
            },
            expectedAnswer: p.step1Expected,
          },
          {
            promptZh: p.step2PromptZh,
            promptEn: p.step2PromptEn,
            promptI18n: p.step2PromptI18n,
            hintZh: `核对各技术发明所属年代与产业特征`,
            hintEn: `Match technologies and R&D traits to the correct era`,
            hintI18n: {
              ja: `技術革新や研究開発の特徴を正しい時代と対応させます`,
              ko: `기술 발명과 연구 개발 특징을 해당 시대와 연결합니다`,
              ms: `Padankan teknologi dan ciri R&D dengan era yang betul`,
            },
            expectedAnswer: p.ansZh,
            expectedAnswerEn: p.ansEn,
            expectedAnswerI18n: p.ansI18n,
          },
        ],
        distractors: [
          { text: p.d1, textEn: p.d1En, textI18n: p.d1I18n, misconceptionTag: "misc_his_ir_anachronism" },
          { text: p.d2, textEn: p.d2En, textI18n: p.d2I18n, misconceptionTag: "misc_his_ir_anachronism" },
          { text: p.d3, textEn: p.d3En, textI18n: p.d3I18n },
        ],
      };
    }

    // 47. Literacy: Main idea vs supporting example (3 distinct passages across basic / standard / challenge)
    case "lit_main_claim": {
      const passages = [
        {
          // Basic: Pivot marker ("However") + single illustrative classroom study
          promptZh: `【论述文本主旨提取】阅读以下短段：\n“许多初学者认为刷题数量直接决定数学成绩。**然而**，认知科学追踪表明，缺乏先修概念溯源的机械重复只会固化错误习惯。例如，某校实验班将每日刷题量减半，改为针对错题上游薄弱点做变式清零，期末达标率反而提升了 24%。”\n该段文字的核心论点是：`,
          promptEn: `[Main Claim vs. Example] Identify the author's primary claim in the passage:\n"Many learners assume drill volume determines math achievement. HOWEVER, cognitive research shows rote repetition without prerequisite root-cause remediation merely reinforces misconceptions. For instance, Class A halved daily drills in favor of targeted root-cause variants and raised mastery by 24%."`,
          promptI18n: {
            ja: `【論説文の主張の読み取り】次の文章を読みなさい：\n「多くの学習者は、問題演習の量が数学の成績を決めると考えています。**しかし**、認知科学の研究によれば、前提となる概念の弱点にさかのぼって修正しない機械的な反復は、誤った理解を固定させるだけです。例えば、A クラスでは毎日の演習量を半分にし、つまずきの根本原因に絞った類題演習に切り替えたところ、習熟率が 24% 向上しました。」\nこの文章の筆者の中心となる主張はどれですか。`,
            ko: `[논설문의 중심 주장 찾기] 다음 글을 읽으시오:\n"많은 학습자는 문제 풀이의 양이 수학 성적을 결정한다고 생각합니다. **그러나** 인지 과학 연구에 따르면, 선수 개념의 근본 원인을 바로잡지 않은 기계적 반복은 오개념을 굳힐 뿐입니다. 예를 들어, A반은 매일의 문제 풀이 양을 절반으로 줄이고 근본 원인을 겨냥한 변형 문제로 바꾸어 성취율을 24% 높였습니다."\n이 글에서 글쓴이의 핵심 주장은 무엇입니까?`,
            ms: `[Dakwaan Utama lwn Contoh] Kenal pasti dakwaan utama pengarang dalam petikan:\n"Ramai pelajar beranggapan bahawa jumlah latih tubi menentukan pencapaian matematik. WALAU BAGAIMANAPUN, kajian kognitif menunjukkan bahawa pengulangan hafalan tanpa pemulihan punca akar bagi konsep prasyarat hanya mengukuhkan salah faham. Sebagai contoh, Kelas A mengurangkan separuh latih tubi harian dan menggantikannya dengan variasi soalan yang menyasarkan punca akar, lalu meningkatkan tahap penguasaan sebanyak 24%."`,
          },
          ansZh: "精准溯源修复先修薄弱点比单纯堆砌刷题量更能有效提升学业表现",
          ansEn: "Targeted prerequisite remediation is far more effective than sheer drill volume",
          ansI18n: {
            ja: "前提となる弱点を的確に修正するほうが、単に演習量を増やすよりはるかに効果的である",
            ko: "선수 학습의 약점을 정확히 보완하는 것이 단순히 문제 풀이 양을 늘리는 것보다 훨씬 효과적이다",
            ms: "Pemulihan prasyarat yang bersasar jauh lebih berkesan daripada jumlah latih tubi semata-mata",
          },
          explZh: "首句引出常见误区，“然而”之后直接亮出全文中心论点；“例如……”中的实验班与 24% 数据只是支撑中心论点的具体论据，不能“以例代主”。",
          explEn: "The sentence immediately following 'However' states the overarching thesis; Class A's 24% improvement is a supporting example, not the main claim.",
          explI18n: {
            ja: "最初の文は通念を示し、「しかし」の直後の文が全体の主張を述べています。「例えば」以下の A クラスの 24% 向上は主張を支える具体例にすぎません。",
            ko: "첫 문장은 통념을 제시하고, '그러나' 바로 뒤의 문장이 글 전체의 중심 주장입니다. '예를 들어' 이하 A반의 24% 향상은 이를 뒷받침하는 사례일 뿐입니다.",
            ms: "Ayat sejurus selepas 'Walau bagaimanapun' menyatakan tesis utama; peningkatan 24% Kelas A hanyalah contoh sokongan.",
          },
          step1Cue: "2",
          step1PromptZh: "第一步：按句子功能划分，第 1 句是靶子，第 3 句“例如……”是论据，第几句是统领全段的中心论点？（填 1、2 或 3）",
          step1PromptEn: "Step 1: Sentence 1 states a common myth and Sentence 3 ('For instance...') gives an example. Which sentence number states the main thesis? (1, 2, or 3)",
          step1PromptI18n: {
            ja: "ステップ 1：第 1 文は通念、第 3 文（例えば…）は具体例です。中心の主張は何番目の文ですか？（1 / 2 / 3）",
            ko: "1단계: 1문장은 통념, 3문장('예를 들어…')은 사례입니다. 중심 주장이 담긴 문장은 몇 번째 문장입니까? (1, 2, 3)",
            ms: "Langkah 1: Ayat 1 ialah tanggapan umum dan Ayat 3 ('Sebagai contoh...') ialah contoh. Ayat ke berapakah yang menyatakan tesis utama? (1, 2, atau 3)",
          },
          d1Zh: "某校实验班通过将作业减半使期末达标率提升了 24%",
          d1En: "Class A raised its final mastery rate by 24% by halving daily homework",
          d1I18n: {
            ja: "A クラスは毎日の宿題を半分にして、期末の習熟率を 24% 向上させた",
            ko: "A반은 매일 숙제를 절반으로 줄여 기말 성취율을 24% 높였다",
            ms: "Kelas A meningkatkan kadar penguasaan akhir sebanyak 24% dengan mengurangkan separuh kerja rumah harian",
          },
          d2Zh: "刷题数量越多，学生的数学成绩一定越差",
          d2En: "Practicing more problems always lowers a student's math score",
          d2I18n: {
            ja: "問題を多く解くほど、数学の成績は必ず下がる",
            ko: "문제를 많이 풀수록 수학 성적은 반드시 떨어진다",
            ms: "Berlatih lebih banyak soalan sentiasa menurunkan markah matematik pelajar",
          },
          d3Zh: "所有学科都不需要任何练习题",
          d3En: "Academic subjects require zero practice exercises altogether",
          d3I18n: {
            ja: "どの教科も練習問題はまったく必要ない",
            ko: "모든 교과는 연습 문제가 전혀 필요 없다",
            ms: "Mata pelajaran akademik langsung tidak memerlukan sebarang latihan",
          },
        },
        {
          // Standard: Biodiversity & ecosystem resilience (synthesis conclusion at end after empirical case)
          promptZh: `【议论结构辨析】阅读以下生态学论述：\n“单一树种人工林虽然初期造林成本低，但一旦遭遇专食性害虫极易大面积枯死。以松材线虫疫情为例，纯松林受害率往往超过 70%，而针阔混交林因天敌昆虫丰富，受害率不足 15%。**由此可见**，物种多样性是维系森林生态系统抗风险韧性的关键屏障。”\n作者的核心主张是：`,
          promptEn: `[Argument Structure] Identify the author's central claim:\n"Monoculture plantations cost less initially, yet a single specialist pest can devastate them. During pine-wilt outbreaks, pure pine stands often suffer over 70% loss, whereas mixed broadleaf-conifer forests lose under 15% thanks to diverse natural predators. THEREFORE, species diversity is a vital buffer sustaining forest ecosystem resilience."`,
          promptI18n: {
            ja: `【論証構造の読み取り】次の文章の中心となる主張を選びなさい：\n「単一樹種の人工林は初期費用こそ低いものの、特定の害虫が発生すると広範囲で枯死しやすくなります。マツ材線虫病の例では、マツの純林の被害率が 70% を超える一方、天敵昆虫が豊富な針広混交林では 15% 未満にとどまります。**したがって**、種の多様性こそが森林生態系の回復力・耐性を支える重要な砦なのです。」`,
            ko: `[논증 구조 파악] 다음 글의 중심 주장을 고르시오:\n"단일 수종 인공림은 초기 조성 비용이 낮지만 특정 해충이 창궐하면 대규모로 고사하기 쉽습니다. 소나무재선충병 사례에서 소나무 단순림의 피해율은 70%를 넘지만, 천적 곤충이 풍부한 침활 혼효림은 15% 미만에 그칩니다. **따라서** 종 다양성은 산림 생태계의 회복 탄력성을 지탱하는 핵심 장벽입니다."`,
            ms: `[Struktur Hujah] Kenal pasti dakwaan utama pengarang:\n"Ladang monokultur mempunyai kos awal yang rendah, namun satu perosak khusus mudah memusnahkannya. Dalam wabak layu pain, hutan pain tulen mengalami lebih 70% kerosakan manakala hutan campuran kurang daripada 15% kerana kehadiran pemangsa semula jadi. OLEH ITU, kepelbagaian spesies ialah penampan penting yang mengekalkan daya tahan ekosistem hutan."`,
          },
          ansZh: "保护并提升物种多样性对于维持森林生态系统的抗风险韧性至关重要",
          ansEn: "Species diversity is essential for maintaining the resilience of forest ecosystems against disturbances",
          ansI18n: {
            ja: "種の多様性を保つことは、森林生態系の攪乱に対する耐性・回復力を維持するために不可欠である",
            ko: "종 다양성을 확보하는 것은 교란에 대한 산림 생태계의 회복 탄력성을 유지하는 데 필수적이다",
            ms: "Kepelbagaian spesies amat penting untuk mengekalkan daya tahan ekosistem hutan terhadap gangguan",
          },
          explZh: "首句对举背景，第 2 句松材线虫的 70% 与 15% 对比属于实证案例，末句总结标志词“由此可见（Therefore）”引出的才是统摄全段的核心论点。",
          explEn: "The pine-wilt statistics (70% vs. 15%) serve as empirical evidence leading into 'Therefore', which introduces the author's general ecological thesis.",
          explI18n: {
            ja: "マツ材線虫病の数値（70% と 15%）は根拠となる具体例であり、結論の標識語「したがって」に続く最後の文が全体の中心主張です。",
            ko: "소나무재선충병 수치(70% 대 15%)는 뒷받침 사례이며, 결론 표지어 '따라서' 뒤에 이어지는 마지막 문장이 글 전체의 중심 주장입니다.",
            ms: "Data wabak pain (70% lwn 15%) ialah bukti empirikal, manakala penanda kesimpulan 'Oleh itu' memperkenalkan tesis utama pengarang.",
          },
          step1Cue: "3",
          step1PromptZh: "第一步：全段共 3 句，第 2 句列举松林数据，哪一句由总结词“由此可见”引出最终论点？（填 1、2 或 3）",
          step1PromptEn: "Step 1: Out of the 3 sentences, Sentence 2 cites pine data. Which sentence number introduces the conclusion via 'Therefore'? (1, 2, or 3)",
          step1PromptI18n: {
            ja: "ステップ 1：3 つの文のうち、結論を示す「したがって」で中心主張をまとめているのは第何文ですか？（1 / 2 / 3）",
            ko: "1단계: 총 3문장 중 결론 표지어 '따라서'를 통해 핵심 주장을 제시하는 문장은 몇 번째입니까? (1, 2, 3)",
            ms: "Langkah 1: Antara 3 ayat tersebut, ayat ke berapakah yang menyatakan kesimpulan utama selepas 'Oleh itu'? (1, 2, atau 3)",
          },
          d1Zh: "松材线虫使纯松林的受害率超过 70%，而混交林受害率不足 15%",
          d1En: "Pine-wilt outbreaks damage over 70% of pure pine stands but under 15% of mixed stands",
          d1I18n: {
            ja: "マツ材線虫病によりマツ純林は 70% 以上被害を受けるが、混交林は 15% 未満である",
            ko: "소나무재선충병으로 단순림은 70% 이상 피해를 입지만 혼효림은 15% 미만이다",
            ms: "Wabak layu pain merosakkan lebih 70% hutan pain tulen tetapi kurang daripada 15% hutan campuran",
          },
          d2Zh: "初期造林成本越低的人工林，未来的经济收益必然越高",
          d2En: "Lower initial planting costs always guarantee higher long-term timber profits",
          d2I18n: {
            ja: "初期の造林費用が低い人工林ほど、長期的な収益が必ず高くなる",
            ko: "초기 조림 비용이 낮을수록 장기적인 경제 수익이 반드시 높아진다",
            ms: "Kos penanaman awal yang lebih rendah pasti menjamin keuntungan jangka panjang yang lebih tinggi",
          },
          d3Zh: "人类应当禁止种植一切松树品种",
          d3En: "Forestry agencies should ban the planting of all pine species permanently",
          d3I18n: {
            ja: "すべてのマツ類の植林を全面的に禁止すべきである",
            ko: "모든 소나무 품종의 식재를 전면 금지해야 한다",
            ms: "Semua spesies pokok pain harus diharamkan sepenuhnya daripada ditanam",
          },
        },
        {
          // Challenge: Concession ("Although...") + Synthesis claim vs background concession & narrow museum example
          promptZh: `【复杂让步论述主旨】阅读以下学术评论：\n“诚然，高分辨率三维扫描为濒危石窟造像建立了宝贵的数字档案；**但若因此认为**数字化可以取代实体原址保护，则是本末倒置。岩体水盐运移、壁画矿物颜料老化等真实物质语境，唯有在原址微环境调控中才能得以留存——正如敦煌莫高窟在完成全洞窟数字采集后，仍持续投入巨资加固崖体与监测洞内湿度。”\n作者立论的核心旨归是：`,
          promptEn: `[Concession-Counterclaim Thesis] Identify the author's overarching thesis:\n"Admittedly, high-resolution 3D scanning creates invaluable digital archives for endangered cave sculptures; YET assuming digitization can replace physical in-situ conservation puts the cart before the horse. Material realities such as rock-salt migration and mineral pigment aging can only be preserved through on-site microclimate control — just as Dunhuang's Mogao Caves continue investing heavily in cliff stabilization and humidity monitoring even after full digital scanning."`,
          promptI18n: {
            ja: `【譲歩構文における主張の特定】次の評論の中心となる主張を選びなさい：\n「確かに、高精細な3Dスキャンは危機に瀕する石窟彫像の貴重なデジタル記録を生み出します。**しかし**、だからといってデジタル化が現地での実物保存に取って代われると考えるのは本末転倒です。岩盤の塩類移動や鉱物顔料の劣化といった物質的文脈は現地の微気候管理によってのみ守られるのであり、現に敦煌莫高窟でもデジタル撮影完了後に崖体の補強や湿度監視へ多額の投資が続けられています。」`,
            ko: `[양보-반박 논증의 핵심 주장] 다음 비평문의 중심 주장을 고르시오:\n"물론 고해상도 3D 스캔은 위기에 처한 석굴 조상의 귀중한 디지털 기록을 남겨 줍니다. **하지만** 그렇다고 해서 디지털화가 현장 실물 보존을 대체할 수 있다고 여기는 것은 본말이 전도된 생각입니다. 암반의 염분 이동이나 광물 안료 노화 같은 물질적 맥락은 오직 현장 미세 환경 제어를 통해서만 보존될 수 있으며, 실제로 둔황 막고굴 역시 디지털 촬영 완료 후에도 절벽 보강과 습도 감시에 막대한 투자를 이어 가고 있습니다."`,
            ms: `[Tesis Konsesi-balas] Kenal pasti tesis utama pengarang:\n"Memang benar imbasan 3D resolusi tinggi mewujudkan arkib digital berharga bagi arca gua terancam; NAMUN anggapan bahawa pendigitalan boleh menggantikan pemuliharaan fizikal di tapak asal adalah tersasar. Konteks bahan sebenar seperti pergerakan garam batuan dan penuaan pigmen mineral hanya dapat dipelihara melalui kawalan mikroiklim tapak — sebagaimana Gua Mogao di Dunhuang terus melabur besar dalam pengukuhan tebing dan pemantauan kelembapan walaupun selepas pendigitalan selesai."`,
          },
          ansZh: "数字化存档只是辅助手段，绝不能取代针对文物物质本体的原址保护",
          ansEn: "Digital archiving complements but can never replace physical in-situ conservation of heritage sites",
          ansI18n: {
            ja: "デジタル記録は補助手段であり、文化財の実物を現地で守る保存対策に取って代わることはできない",
            ko: "디지털 아카이빙은 보조 수단일 뿐 문화유산 실물에 대한 현장 보존을 결코 대체할 수 없다",
            ms: "Pengarkiban digital hanyalah pelengkap dan sama sekali tidak boleh menggantikan pemuliharaan fizikal di tapak asal",
          },
          explZh: "“诚然……”是让步承认数字化价值，“但若因此认为……”转折破立亮出核心主张，“正如敦煌莫高窟……”是印证论点的典型例证；切忌误选让步分句或莫高窟个案。",
          explEn: "'Admittedly...' concedes digitization's value, 'YET...' delivers the central thesis, and the Mogao Caves clause is an illustrative case supporting that thesis.",
          explI18n: {
            ja: "「確かに…」は譲歩、「しかし…」以下が筆者の中心主張であり、敦煌莫高窟の記述はその主張を裏づける具体例です。",
            ko: "'물론…'은 양보절이고 '하지만…' 이하가 핵심 주장이며, 둔황 막고굴 언급은 이를 뒷받침하는 구체적 사례입니다.",
            ms: "'Memang benar...' ialah konsesi, 'NAMUN...' menyampaikan tesis utama, manakala rujukan Gua Mogao ialah contoh sokongan.",
          },
          step1Cue: "2",
          step1PromptZh: "第一步：区分“诚然……”（1：让步分句）、“但若因此认为……”（2：转折主旨）与“正如莫高窟……”（3：例证），核心论点位于哪一部分？（填 1、2 或 3）",
          step1PromptEn: "Step 1: Among (1) the 'Admittedly' concession, (2) the 'YET' pivot clause, and (3) the 'just as Mogao Caves' example, which part carries the core claim? (1, 2, or 3)",
          step1PromptI18n: {
            ja: "ステップ 1：(1)「確かに」の譲歩、(2)「しかし」の逆接主張、(3)「莫高窟」の具体例のうち、中心主張はどれですか？（1 / 2 / 3）",
            ko: "1단계: (1) '물론' 양보절, (2) '하지만' 역접 주장절, (3) '막고굴' 예시 중 핵심 주장은 어디에 있습니까? (1, 2, 3)",
            ms: "Langkah 1: Antara (1) konsesi 'Memang benar', (2) klausa 'NAMUN', dan (3) contoh 'Gua Mogao', bahagian manakah membawa dakwaan utama? (1, 2, atau 3)",
          },
          d1Zh: "敦煌莫高窟已完成全洞窟三维数字采集并投入巨资监测湿度",
          d1En: "Dunhuang's Mogao Caves completed full 3D scanning and funded humidity monitoring",
          d1I18n: {
            ja: "敦煌莫高窟は全窟の3Dデジタル計測を終え、湿度監視に多額の資金を投じている",
            ko: "둔황 막고굴은 전 석굴 3D 스캔을 마치고 습도 감시에 거액을 투자하고 있다",
            ms: "Gua Mogao di Dunhuang telah menyelesaikan imbasan 3D penuh dan membiayai pemantauan kelembapan",
          },
          d2Zh: "高分辨率三维扫描技术对文物保护没有任何实际价值",
          d2En: "High-resolution 3D scanning offers no practical value for cultural heritage preservation",
          d2I18n: {
            ja: "高精細な3Dスキャン技術は文化財保護にとって実用的な価値がまったくない",
            ko: "고해상도 3D 스캔 기술은 문화재 보존에 실질적 가치가 전혀 없다",
            ms: "Teknologi imbasan 3D resolusi tinggi tidak mempunyai sebarang nilai praktikal bagi pemuliharaan warisan",
          },
          d3Zh: "只要建立数字档案即可永久停止石窟崖体加固工程",
          d3En: "Once a digital archive exists, physical cliff stabilization can be permanently halted",
          d3I18n: {
            ja: "デジタル記録さえ作れば、石窟の崖体補強工事は永久に中止してよい",
            ko: "디지털 아카이브만 구축하면 석굴 절벽 보강 공사를 영구 중단해도 된다",
            ms: "Sebaik sahaja arkib digital wujud, kerja pengukuhan tebing fizikal boleh dihentikan selama-lamanya",
          },
        },
      ] as const;

      const p = dTier === "challenge" ? passages[2] : dTier === "standard" ? passages[1] : passages[0];
      return {
        promptZh: p.promptZh,
        promptEn: p.promptEn,
        promptI18n: p.promptI18n,
        answer: p.ansZh,
        answerEn: p.ansEn,
        answerI18n: p.ansI18n,
        explanationZh: p.explZh,
        explanationEn: p.explEn,
        explanationI18n: p.explI18n,
        scaffolds: [
          {
            promptZh: p.step1PromptZh,
            promptEn: p.step1PromptEn,
            promptI18n: p.step1PromptI18n,
            hintZh: `转折词（然而/但）或总结词（由此可见）引导核心论点，“例如/正如”引导论据`,
            hintEn: `Pivot/conclusion markers ('However', 'Therefore', 'Yet') signal claims; 'For instance'/'just as' signal examples`,
            hintI18n: {
              ja: `逆接（しかし）や結論（したがって）に注目し、具体例（例えば）と区別します`,
              ko: `역접(그러나/하지만)·결론(따라서) 표지어를 찾고 예시(예를 들어)와 구분합니다`,
              ms: `Perhatikan penanda wacana ('Walau bagaimanapun', 'Oleh itu', 'Namun') dan bezakannya daripada contoh`,
            },
            expectedAnswer: p.step1Cue,
          },
          {
            promptZh: `第二步：排除“以偏概全的局部案例”与“极端绝对化表述”，选出准确概括核心论点的一项：`,
            promptEn: `Step 2: Exclude narrow examples and extreme distortions to select the accurate thesis statement:`,
            promptI18n: {
              ja: `ステップ 2：具体例だけの選択肢や極端な歪曲を除き、中心の主張を正確にまとめたものを選びなさい：`,
              ko: `2단계: 지엽적인 사례나 극단적인 왜곡을 제외하고 중심 주장을 정확히 요약한 보기를 고르시오:`,
              ms: `Langkah 2: Singkirkan contoh sempit serta pernyataan melampau, kemudian pilih tesis utama yang tepat:`,
            },
            hintZh: `对应核心判断句`,
            hintEn: `Match the thesis sentence`,
            hintI18n: {
              ja: `中心となる主張の文と一致させます`,
              ko: `중심 주장을 담은 문장과 일치시킵니다`,
              ms: `Padankan dengan ayat tesis utama`,
            },
            expectedAnswer: p.ansZh,
            expectedAnswerEn: p.ansEn,
            expectedAnswerI18n: p.ansI18n,
          },
        ],
        distractors: [
          { text: p.d1Zh, textEn: p.d1En, textI18n: p.d1I18n, misconceptionTag: "misc_lit_example_as_thesis" },
          { text: p.d2Zh, textEn: p.d2En, textI18n: p.d2I18n },
          { text: p.d3Zh, textEn: p.d3En, textI18n: p.d3I18n },
        ],
      };
    }

    // 48. Literacy: Evidence-bound inference vs absolutist leap (3 distinct passages across basic / standard / challenge)
    case "lit_inference_modality": {
      const passages = [
        {
          // Basic: Urban tree canopy microclimate hedged scope
          promptZh: `【信息推断与限定词审查】原文载：“城市绿道树冠覆盖率每提高 10%，夏季午后地表热岛温度平均可降低约 0.8°C，有助于缓解部分老旧街区的微气候闷热感。”\n根据原文，下列推断**最严密合理**的一项是：`,
          promptEn: `[Evidence-Bound Inference] Passage: "Each 10% increase in urban tree-canopy cover lowers summer afternoon surface temperature by ~0.8°C on average, helping ease heat stress in older neighborhoods."\nWhich inference is strictly supported by the text?`,
          promptI18n: {
            ja: `【根拠に基づく推論】本文：「都市の樹冠被覆率が 10% 上がるごとに、夏の午後の地表面温度は平均で約 0.8°C 下がり、古い街区の暑さによる負担の緩和に役立ちます。」\n本文から厳密に導ける推論はどれですか。`,
            ko: `[근거 기반 추론] 본문: "도시의 수관 피복률(나무 그늘 비율)이 10% 높아질 때마다 여름 오후 지표면 온도가 평균 약 0.8°C 낮아져, 오래된 동네의 더위 스트레스를 완화하는 데 도움이 됩니다."\n본문에 의해 엄밀하게 뒷받침되는 추론은 무엇입니까?`,
            ms: `[Inferens Berasaskan Bukti] Petikan: "Setiap peningkatan 10% litupan kanopi pokok bandar menurunkan suhu permukaan petang musim panas sebanyak ~0.8°C secara purata, sekali gus membantu mengurangkan tekanan haba di kawasan kejiranan lama."\nInferens manakah yang benar-benar disokong oleh teks?`,
          },
          ansZh: "科学规划并增加城市街道绿化树冠覆盖，是改善局部街区夏季热环境的可行手段之一",
          ansEn: "Expanding street tree canopy is a viable measure to help mitigate local urban summer heat",
          ansI18n: {
            ja: "街路樹の樹冠を広げることは、地域の夏の暑さを和らげるのに役立つ有効な手段の一つである",
            ko: "가로수의 수관을 넓히는 것은 국지적인 여름 도시 열기를 완화하는 데 도움이 되는 실행 가능한 방법 중 하나이다",
            ms: "Meluaskan kanopi pokok jalan ialah satu langkah yang boleh dilaksanakan untuk membantu mengurangkan haba bandar setempat",
          },
          explZh: "原文使用“平均约”“有助于”“部分”，措辞严谨克制；干扰项中“彻底消除”“唯一途径”“冬季午夜同幅降温”均犯了绝对化或偷换时空的推断错误。",
          explEn: "Valid inferences preserve the passage's hedged modality ('helps', 'on average', 'summer afternoon') rather than inflating to 'eliminates completely', 'sole way', or 'winter midnight'.",
          explI18n: {
            ja: "妥当な推論は本文の限定表現（「役立つ」「平均で」「夏の午後」）を守っています。「完全になくす」「唯一の方法」「冬の真夜中」は範囲の誇張・すり替えです。",
            ko: "타당한 추론은 본문의 한정 표현('도움이 된다', '평균', '여름 오후')을 지킵니다. '완전히 없앤다', '유일한 방법', '겨울 한밤중'은 과장 및 조건 왜곡입니다.",
            ms: "Inferens yang sah mengekalkan skop berhati-hati teks ('membantu', 'secara purata', 'petang musim panas') tanpa membesar-besarkannya kepada 'menghapuskan sepenuhnya' atau 'satu-satunya cara'.",
          },
          d1Zh: "只要种树就一定能彻底消除全球所有城市的夏季高温热浪",
          d1En: "Planting trees is guaranteed to eliminate summer heatwaves across all cities worldwide",
          d1I18n: {
            ja: "木を植えれば、世界中のすべての都市で夏の熱波を必ず完全になくすことができる",
            ko: "나무를 심으면 전 세계 모든 도시의 여름 폭염을 반드시 완전히 없앨 수 있다",
            ms: "Menanam pokok pasti menghapuskan gelombang haba musim panas di semua bandar di seluruh dunia",
          },
          d2Zh: "增加树冠覆盖率是降低城市温度的唯一决定性途径",
          d2En: "Increasing tree canopy cover is the sole decisive way to lower urban temperatures",
          d2I18n: {
            ja: "樹冠被覆率を上げることが、都市の気温を下げる唯一の決定的な方法である",
            ko: "수관 피복률을 높이는 것이 도시 기온을 낮추는 유일한 결정적 방법이다",
            ms: "Meningkatkan litupan kanopi pokok ialah satu-satunya cara penentu untuk menurunkan suhu bandar",
          },
          d3Zh: "冬季午夜气温也会随树冠覆盖率每增 10% 而精确下降 0.8°C",
          d3En: "Winter midnight temperatures also drop by exactly 0.8°C per 10% canopy increase",
          d3I18n: {
            ja: "冬の真夜中の気温も、樹冠被覆率が 10% 増えるごとにちょうど 0.8°C 下がる",
            ko: "겨울 한밤중 기온도 수관 피복률이 10% 늘 때마다 정확히 0.8°C 내려간다",
            ms: "Suhu tengah malam musim sejuk juga turun tepat 0.8°C bagi setiap peningkatan kanopi sebanyak 10%",
          },
        },
        {
          // Standard: Adolescent sleep & blue-light melatonin study (hedged scope & subgroup conditions)
          promptZh: `【科学报道模态词审查】原文载：“受控睡眠实验显示，青少年睡前连续两小时近距离注视高亮度冷白光屏幕，褪黑素分泌峰值平均推迟约 35 分钟，可能增加次日晨间注意力涣散的风险。”\n根据原文，下列哪项推断完全符合证据边界？`,
          promptEn: `[Modality & Scope Check] Passage: "Controlled sleep trials indicate that when adolescents view bright cool-white screens at close range for two hours before bed, peak melatonin secretion is delayed by ~35 minutes on average, which may heighten morning attention lapses."\nWhich inference stays strictly within the evidence?`,
          promptI18n: {
            ja: `【限定表現の検証】本文：「管理された睡眠実験によると、青少年が就寝前の 2 時間、高輝度の冷白色画面を至近距離で見続けると、メラトニン分泌のピークが平均で約 35 分遅れ、翌朝の注意力低下リスクが高まる可能性があります。」\n本文の根拠の範囲に厳密に収まる推論はどれですか。`,
            ko: `[양상·범위 검증] 본문: "통제된 수면 실험에 따르면 청소년이 취침 전 2시간 동안 고휘도 차가운 백색 화면을 가까이서 계속 보면 멜라토닌 분비 정점이 평균 약 35분 늦춰져 다음 날 아침 주의력 저하 위험이 커질 수 있습니다."\n본문의 근거 범위 안에 엄밀히 부합하는 추론은 무엇입니까?`,
            ms: `[Semakan Modaliti & Skop] Petikan: "Ujian tidur terkawal menunjukkan apabila remaja melihat skrin putih-sejuk terang pada jarak dekat selama dua jam sebelum tidur, puncak rembesan melatonin lewat ~35 minit secara purata, yang mungkin meningkatkan risiko kurang tumpuan pada waktu pagi."\nInferens manakah yang kekal dalam batas bukti teks?`,
          },
          ansZh: "减少睡前长时间高亮度屏幕暴露，可能有助于青少年维持较正常的褪黑素节律与晨间专注状态",
          ansEn: "Reducing prolonged bright screen exposure before bedtime may help adolescents maintain steadier melatonin timing and morning alertness",
          ansI18n: {
            ja: "就寝前の長時間の高輝度画面の使用を控えることは、青少年のメラトニンリズムや翌朝の集中力の維持に役立つ可能性がある",
            ko: "취침 전 장시간의 고휘도 화면 노출을 줄이는 것은 청소년의 멜라토닌 리듬과 아침 집중력 유지에 도움이 될 수 있다",
            ms: "Mengurangkan pendedahan lama kepada skrin terang sebelum tidur mungkin membantu remaja mengekalkan ritma melatonin dan tumpuan pagi",
          },
          explZh: "原文明确限定了人群（青少年）、条件（睡前两小时高亮度屏幕）及或然模态词（“平均约”“可能增加”）；正确项保留了“可能有助于”的审慎边界，其余三项均把或然夸大为必然或越界推广。",
          explEn: "The text hedges with 'on average' and 'may heighten' under specific pre-bedtime conditions; the valid inference keeps 'may help' without claiming total insomnia or sole causation.",
          explI18n: {
            ja: "本文は「平均で約」「可能性がある」と慎重に限定しています。正解はその控えめなモダリティを保っており、「完全に停止する」「唯一の原因」といった誇張を避けています。",
            ko: "본문은 '평균 약', '커질 수 있다'처럼 신중하게 한정하고 있습니다. 정답은 이러한 양상 표현을 유지하며, '완전히 멈춘다'나 '유일한 원인' 같은 과장을 피합니다.",
            ms: "Petikan menggunakan ungkapan berhati-hati ('secara purata', 'mungkin meningkatkan'); jawapan betul mengekalkan batas bukti tersebut tanpa membuat dakwaan mutlak.",
          },
          d1Zh: "任何年龄段的人只要看一眼手机屏幕就会彻底停止分泌褪黑素",
          d1En: "Glancing briefly at a phone screen at any age completely halts melatonin secretion",
          d1I18n: {
            ja: "どの年齢の人も、スマートフォンの画面を一瞬見るだけでメラトニン分泌が完全に止まる",
            ko: "어느 연령대든 스마트폰 화면을 잠깐만 보아도 멜라토닌 분비가 완전히 멈춘다",
            ms: "Melihat skrin telefon seketika pada sebarang umur akan menghentikan rembesan melatonin sepenuhnya",
          },
          d2Zh: "睡前使用电子屏幕是导致青少年早读走神的唯一原因",
          d2En: "Evening screen use is the sole cause of morning inattention among adolescents",
          d2I18n: {
            ja: "就寝前の画面使用こそが、青少年の朝の注意力低下を引き起こす唯一の原因である",
            ko: "취침 전 화면 사용이 청소년의 아침 주의력 저하를 일으키는 유일한 원인이다",
            ms: "Penggunaan skrin sebelum tidur ialah satu-satunya punca remaja hilang tumpuan pada waktu pagi",
          },
          d3Zh: "白天上午使用电脑学习同样会使当晚入睡时间固定推迟 35 分钟",
          d3En: "Using a computer in the morning always delays that night's sleep onset by exactly 35 minutes",
          d3I18n: {
            ja: "午前中にパソコンを使って学習しても、その夜の入眠時刻が必ずちょうど 35 分遅れる",
            ko: "오전에 컴퓨터로 학습하더라도 그날 밤 입면 시각이 반드시 정확히 35분 늦춰진다",
            ms: "Menggunakan komputer pada waktu pagi juga pasti melambatkan waktu tidur malam itu tepat 35 minit",
          },
        },
        {
          // Challenge: Archaeological isotope analysis with double hedging & necessary-vs-sufficient distinction
          promptZh: `【高阶实证边界审查】考古报告载：“在河西走廊某青铜时代遗址出土的 18 件青铜器中，有 5 件铅同位素比值与中原殷墟同期矿料高度吻合；这表明两地当时**可能存在**金属原料或成品的远距离交流，但尚不足以证明该聚落直接受殷商王室行政管辖。”\n下列哪项判断最忠实于报告原意？`,
          promptEn: `[Evidentiary Scope & Sufficiency] Archaeological report: "Among 18 bronze artifacts excavated at a Hexi Corridor site, 5 match the lead-isotope ratios of contemporary Central Plains ores; this suggests possible long-distance exchange of metal raw materials or finished goods, though it is insufficient to prove direct administrative rule by the Shang court."\nWhich conclusion strictly respects the report's evidentiary boundary?`,
          promptI18n: {
            ja: `【証拠の射程と十分性の検討】考古学報告：「河西回廊の青銅器時代遺跡から出土した青銅器 18 点のうち 5 点は、中原の同時期の鉱石と鉛同位体比が極めてよく一致しました。これは両地域間に金属原料や製品の遠距離交流があった可能性を示唆しますが、この集落が殷王朝の直接統治下にあったことを証明するには不十分です。」\n報告の趣旨に最も忠実な判断はどれですか。`,
            ko: `[증거 범위와 충분성 검토] 고고학 보고서: "하서회랑의 한 청동기 유적에서 출토된 청동기 18점 중 5점은 중원 지역 동시기 광석과 납 동위원소 비율이 매우 일치했습니다. 이는 두 지역 사이에 금속 원료나 완제품의 원거리 교류가 있었을 가능성을 시사하지만, 해당 취락이 상 왕실의 직접적인 행정 관할 아래 있었음을 증명하기에는 충분하지 않습니다."\n보고서의 증거 경계를 가장 엄밀하게 지킨 판단은 무엇입니까?`,
            ms: `[Semakan Skop Bukti] Laporan arkeologi: "Daripada 18 artifak gangsa yang ditemui di tapak Koridor Hexi, 5 sepadan rapat dengan nisbah isotop plumbum bijih Dataran Tengah sezaman; ini mencadangkan kemungkinan wujudnya pertukaran jarak jauh bahan mentah atau barangan siap, namun belum cukup untuk membuktikan pentadbiran langsung oleh istana Shang."\nKesimpulan manakah yang paling mematuhi batas bukti laporan tersebut?`,
          },
          ansZh: "同位素证据支持两地间存在物质文化或原料流通的可能性，但物质交流不等同于政治直接管辖",
          ansEn: "Isotope data supports potential material or trade contact between the two regions, without equating material exchange to direct political rule",
          ansI18n: {
            ja: "同位体データは両地域間の物質・交易上の接触の可能性を裏づけるが、物の流通は政治的な直接統治を意味しない",
            ko: "동위원소 자료는 두 지역 간 물질·교역 접촉 가능성을 뒷받침하지만, 물자 교류가 곧 직접적인 정치 관할을 뜻하지는 않는다",
            ms: "Data isotop menyokong kemungkinan hubungan bahan atau perdagangan antara dua wilayah, tanpa menyamakan pertukaran barang dengan pemerintahan politik langsung",
          },
          explZh: "报告同时划定了“正向支持的或然推论”（5/18 吻合 → 可能存在原料或器物交流）与“不可越界的结论上限”（不足以证明直接行政管辖），正确项完整守住了这两条证据红线。",
          explEn: "The report carefully separates what the 5/18 isotope match supports (possible trade/material contact) from what it cannot establish (direct Shang administrative control).",
          explI18n: {
            ja: "報告書は「示唆される可能性（遠距離交流）」と「証明できない飛躍（直接統治）」を明確に区別しており、正解はその両方の境界を正確に保っています。",
            ko: "보고서는 5/18 동위원소 일치가 시사하는 바(원거리 물자 교류 가능성)와 증명할 수 없는 비약(직접 행정 통치)을 명확히 구분하며, 정답은 이 경계를 정확히 반영합니다.",
            ms: "Laporan itu membezakan dengan teliti perkara yang disokong oleh bukti isotop (kemungkinan pertukaran barang) daripada perkara yang tidak dapat dibuktikan (kawalan pentadbiran langsung).",
          },
          d1Zh: "该遗址出土的全部 18 件青铜器均由中原工坊铸造后赐予当地驻军",
          d1En: "All 18 bronze artifacts at the site were cast in Central Plains royal workshops for garrison troops",
          d1I18n: {
            ja: "出土した全 18 点の青銅器はすべて中原の王室工房で鋳造され駐屯軍に下賜されたものである",
            ko: "출토된 청동기 18점 전부가 중원 왕실 공방에서 주조되어 주둔군에게 하사된 것이다",
            ms: "Kesemua 18 artifak gangsa di tapak itu ditempa di bengkel diraja Dataran Tengah untuk tentera",
          },
          d2Zh: "铅同位素吻合确凿证明河西走廊当时已是殷商直接设立郡县管辖的领土",
          d2En: "The matching lead isotopes conclusively prove the Hexi Corridor was under direct Shang administrative rule",
          d2I18n: {
            ja: "鉛同位体の一致は、河西回廊が殷王朝の直接の行政管轄下にあったことを決定的に証明している",
            ko: "납 동위원소 일치는 하서회랑이 상 왕실의 직접 행정 관할령이었음을 결정적으로 증명한다",
            ms: "Padanan isotop plumbum membuktikan secara muktamad bahawa Koridor Hexi berada di bawah pentadbiran langsung Shang",
          },
          d3Zh: "河西走廊与中原在青铜时代完全隔绝，没有任何技术或物资往来",
          d3En: "The Hexi Corridor and the Central Plains were completely isolated with zero material contact",
          d3I18n: {
            ja: "青銅器時代において河西回廊と中原は完全に隔絶しており、物資の往来は一切なかった",
            ko: "청동기 시대에 하서회랑과 중원은 완전히 단절되어 어떠한 물자 왕래도 없었다",
            ms: "Koridor Hexi dan Dataran Tengah terpisah sepenuhnya tanpa sebarang pertukaran bahan",
          },
        },
      ] as const;

      const p = dTier === "challenge" ? passages[2] : dTier === "standard" ? passages[1] : passages[0];
      return {
        promptZh: p.promptZh,
        promptEn: p.promptEn,
        promptI18n: p.promptI18n,
        answer: p.ansZh,
        answerEn: p.ansEn,
        answerI18n: p.ansI18n,
        explanationZh: p.explZh,
        explanationEn: p.explEn,
        explanationI18n: p.explI18n,
        scaffolds: [
          {
            promptZh: `第一步：原文的表述语气属于“存在统计平均/可能性边界的审慎推断”（填 1）还是“百分之百无条件绝对成立”（填 2）？`,
            promptEn: `Step 1: Is the passage's evidentiary tone hedged/qualified (1) or 100% unconditional/absolute (2)?`,
            promptI18n: {
              ja: `ステップ 1：本文の根拠の述べ方は、条件付きの慎重な表現（1）ですか、100% 無条件の断定（2）ですか？（1 / 2）`,
              ko: `1단계: 본문의 서술 어조는 조건부·가능성을 담은 신중한 표현(1)입니까, 100% 무조건적 단정(2)입니까? (1/2)`,
              ms: `Langkah 1: Adakah nada bukti petikan ini bersifat berhati-hati/bersyarat (1) atau mutlak 100% (2)?`,
            },
            hintZh: `留意“平均约、有助于、可能、尚不足以”等限定词`,
            hintEn: `Look for qualifiers like 'on average', 'helps', 'may', 'insufficient to prove'`,
            hintI18n: {
              ja: `「平均で」「役立つ」「可能性」「不十分」などの限定語に注目します`,
              ko: `'평균', '도움이 된다', '가능성', '충분하지 않다' 같은 한정어를 확인합니다`,
              ms: `Perhatikan perkataan seperti 'secara purata', 'membantu', 'mungkin', 'belum cukup'`,
            },
            expectedAnswer: `1`,
          },
          {
            promptZh: `第二步：剔除含有“唯一、彻底、全部、必然”等越界绝对词的选项，选出严守原文证据边界的一项：`,
            promptEn: `Step 2: Eliminate options containing absolutist leaps ('all', 'sole', 'completely', 'conclusively') and choose the evidence-bound inference:`,
            promptI18n: {
              ja: `ステップ 2：「すべて」「唯一」「完全に」といった飛躍を含む選択肢を除き、根拠の範囲内の推論を選びなさい：`,
              ko: `2단계: '모두', '유일한', '완전히' 같은 과잉 일반화를 제외하고 증거 범위 안의 추론을 고르시오:`,
              ms: `Langkah 2: Singkirkan pilihan melampau ('semua', 'satu-satunya', 'sepenuhnya') dan pilih inferens yang sah:`,
            },
            hintZh: `分寸与原文限定词保持一致`,
            hintEn: `Keep modality aligned with the source text`,
            hintI18n: {
              ja: `本文の限定表現とモダリティをそろえます`,
              ko: `본문의 한정 표현 및 양상과 일치시킵니다`,
              ms: `Pastikan kesimpulan selaras dengan batas bukti teks asal`,
            },
            expectedAnswer: p.ansZh,
            expectedAnswerEn: p.ansEn,
            expectedAnswerI18n: p.ansI18n,
          },
        ],
        distractors: [
          { text: p.d1Zh, textEn: p.d1En, textI18n: p.d1I18n, misconceptionTag: "misc_lit_absolutist_leap" },
          { text: p.d2Zh, textEn: p.d2En, textI18n: p.d2I18n, misconceptionTag: "misc_lit_absolutist_leap" },
          { text: p.d3Zh, textEn: p.d3En, textI18n: p.d3I18n },
        ],
      };
    }

    // 49. Literacy: Logical fallacies (3 distinct critical-thinking scenarios across basic / standard / challenge, unified ms pemboleh ubah pengeliru!)
    case "lit_logical_fallacy": {
      const fallacies = [
        {
          // Basic: Confounding variable (lighter & lung cancer -> smoking)
          promptZh: `【批判思辨：逻辑谬误诊断】某报告宣称：“统计显示，随身携带打火机的人群患肺癌比例显著高于不带打火机的人群，因此打火机金属外壳辐射会导致肺癌。”\n该论证最核心的逻辑漏洞在于：`,
          promptEn: `[Logical Fallacy Audit] Claim: "People who carry lighters have a much higher lung-cancer rate than those who do not; therefore, lighter metal causes lung cancer."\nWhat is the primary flaw in this reasoning?`,
          promptI18n: {
            ja: `【論理的誤謬の診断】ある報告の主張：「ライターを持ち歩く人は、持ち歩かない人より肺がんの発症率がはるかに高いです。したがって、ライターの金属が肺がんを引き起こします。」\nこの推論の最も重大な欠陥は何ですか。`,
            ko: `[논리적 오류 진단] 어떤 보고서의 주장: "라이터를 가지고 다니는 사람은 그렇지 않은 사람보다 폐암 발생률이 훨씬 높습니다. 따라서 라이터의 금속이 폐암을 일으킵니다."\n이 추론의 가장 핵심적인 결함은 무엇입니까?`,
            ms: `[Audit Kesilapan Logik] Dakwaan: "Orang yang membawa pemetik api mempunyai kadar kanser paru-paru yang jauh lebih tinggi berbanding mereka yang tidak; oleh itu, logam pemetik api menyebabkan kanser paru-paru."\nApakah kelemahan utama dalam penaakulan ini?`,
          },
          ansZh: "忽略了共同混杂变量“吸烟习惯”，将相关性伴随现象强加为直接因果关系",
          ansEn: "Confusing correlation with causation while ignoring the confounding variable (smoking)",
          ansI18n: {
            ja: "交絡変数（喫煙習慣）を見落とし、相関関係を因果関係と取り違えている",
            ko: "교란 변수(흡연 습관)를 무시하고 상관관계를 인과 관계로 혼동하였다",
            ms: "Mengelirukan korelasi dengan sebab-akibat sambil mengabaikan pemboleh ubah pengeliru (merokok)",
          },
          explZh: "“吸烟”这一第三混杂变量（Confounding Variable）既导致常带打火机，又直接增加肺癌风险；原论证犯了典型的“忽略混杂因素、将相关性等同于因果性”谬误。",
          explEn: "Smoking is a confounding variable driving both lighter carrying and lung cancer; mere statistical correlation does not establish direct causation.",
          explI18n: {
            ja: "喫煙習慣は、ライターの携帯と肺がんリスクの双方を高める交絡変数です。単なる相関関係から直接の因果関係を導くことはできません。",
            ko: "흡연은 라이터 휴대와 높은 폐암 발생률 모두에 영향을 미치는 교란 변수입니다. 상관관계만으로는 인과 관계가 증명되지 않습니다.",
            ms: "Merokok ialah pemboleh ubah pengeliru yang menyebabkan kedua-dua tabiat membawa pemetik api dan kanser paru-paru; korelasi semata-mata tidak membuktikan sebab-akibat.",
          },
          step1Cue: "1",
          step1PromptZh: "第一步：带打火机与患肺癌同时受“吸烟”这一隐藏第三因素驱动，这类谬误属于忽略混杂变量（填 1）还是循环论证（填 2）？",
          step1PromptEn: "Step 1: When a hidden third factor (smoking) drives both variables, is the flaw an ignored confounding variable (1) or circular reasoning (2)?",
          step1PromptI18n: {
            ja: "ステップ 1：隠れた第三の要因（喫煙）が両方の変数を動かしているとき、この欠陥は交絡変数の見落とし（1）ですか、循環論法（2）ですか？（1 / 2）",
            ko: "1단계: 숨은 제3의 요인(흡연)이 두 변수를 동시에 유발할 때, 이 오류는 교란 변수 무시(1)입니까, 순환 논증(2)입니까? (1/2)",
            ms: "Langkah 1: Apabila faktor ketiga tersembunyi (merokok) mempengaruhi kedua-dua pemboleh ubah, adakah kelemahan ini melibatkan pemboleh ubah pengeliru (1) atau penaakulan berputar (2)?",
          },
          d1Zh: "样本统计人数还不够多，只要扩大样本就能证明打火机致癌",
          d1En: "The sample size is merely too small; a larger sample would prove lighters cause cancer",
          d1I18n: {
            ja: "標本の人数が少なすぎるだけで、標本を増やせばライターががんの原因だと証明できる",
            ko: "표본 수가 너무 적을 뿐이며, 표본을 늘리면 라이터가 암을 일으킨다는 것을 증명할 수 있다",
            ms: "Saiz sampel cuma terlalu kecil; sampel yang lebih besar akan membuktikan pemetik api menyebabkan kanser",
          },
          d2Zh: "没有详细列出打火机的品牌与外壳颜色差异",
          d2En: "The report fails to compare different brands and casing colors of lighters",
          d2I18n: {
            ja: "報告はライターのブランドや色の違いを比較していない",
            ko: "보고서가 라이터의 브랜드와 색상 차이를 비교하지 않았다",
            ms: "Laporan itu gagal membandingkan jenama dan warna pemetik api yang berbeza",
          },
          d3Zh: "论证链条严密无懈可击，不存在任何逻辑瑕疵",
          d3En: "The causal argument is completely rigorous and free of any logical flaw",
          d3I18n: {
            ja: "この因果推論は完全に厳密であり、論理的な欠陥はまったくない",
            ko: "이 인과 논증은 완전히 엄밀하며 논리적 결함이 전혀 없다",
            ms: "Hujah sebab-akibat itu benar-benar kukuh dan bebas daripada sebarang kelemahan logik",
          },
        },
        {
          // Standard: Survivorship bias (Wald's WWII returning aircraft / drop-out founders)
          promptZh: `【批判思辨：幸存者偏差诊断】某商业专栏写道：“我们访谈了 30 位身家过亿的连续创业成功者，发现他们全都曾抵押房产孤注一掷；可见只要抵押房产创业，就一定能获得巨额商业成功。”\n该推论最致命的方法论缺陷是：`,
          promptEn: `[Methodological Fallacy Audit] Columnist: "We interviewed 30 billionaire entrepreneurs and found every one of them had mortgaged their home to take an all-in risk; therefore, mortgaging your home guarantees entrepreneurial success."\nWhat is the fatal methodological flaw here?`,
          promptI18n: {
            ja: `【方法論的誤謬の診断】コラム：「資産数十億の成功した起業家 30 人を取材したところ、全員が自宅を担保に勝負をかけていました。したがって、自宅を担保に起業すれば必ず大成功できます。」\nこの推論の致命的な欠陥は何ですか。`,
            ko: `[방법론적 오류 진단] 칼럼: "성공한 억만장자 창업가 30명을 인터뷰한 결과 모두가 집을 담보로 모험을 감행했습니다. 따라서 집을 담보로 창업하면 반드시 큰 성공을 거둡니다."\n이 추론의 치명적인 결함은 무엇입니까?`,
            ms: `[Audit Kesilapan Metodologi] Kolumnis: "Kami menemubual 30 usahawan jutawan dan mendapati kesemuanya pernah mencagarkan rumah untuk mengambil risiko besar; oleh itu, mencagarkan rumah pasti menjamin kejayaan perniagaan."\nApakah kelemahan metodologi yang paling ketara di sini?`,
          },
          ansZh: "犯了“幸存者偏差”，仅统计成功样本而完全遗漏了同样抵押房产却破产失败的沉默大多数",
          ansEn: "Survivorship bias — sampling only winners while ignoring the silent majority who took the same risk and went bankrupt",
          ansI18n: {
            ja: "成功者だけを調べ、同じリスクを取って破産した大多数の失敗者を除外する「生存者バイアス」に陥っている",
            ko: "성공한 사례만 표집하고 똑같은 위험을 감수했다가 파산한 수많은 실패자를 배제한 '생존자 편향'에 빠졌다",
            ms: "Pincang kemandirian (survivorship bias) — hanya meninjau golongan berjaya sambil mengabaikan majoriti yang mengambil risiko sama tetapi muflis",
          },
          explZh: "评估某策略的真实成功率必须同时考察分母中“采取该策略但失败退出”的群体；只看最终留存的成功者属于典型的“幸存者偏差（Survivorship Bias）”。",
          explEn: "Evaluating whether a risky strategy works requires counting everyone who tried it — both winners and bankrupt failures. Observing only survivors creates classic survivorship bias.",
          explI18n: {
            ja: "ある戦略の成功率を正しく測るには、同じ行動をとって失敗・撤退した母集団（分母）も含めて比較しなければなりません。生き残った成功例だけを見る誤りを「生存者バイアス」と呼びます。",
            ko: "전략의 실제 성공률을 판단하려면 같은 시도를 했다가 실패해 사라진 집단(분모)까지 함께 살펴보아야 합니다. 살아남은 성공자만 관찰하는 오류를 '생존자 편향'이라 합니다.",
            ms: "Untuk menilai keberkesanan strategi berisiko, semua pihak yang mencubanya (termasuk yang gagal) wajib diambil kira; memerhati pemenang sahaja menghasilkan pincang kemandirian.",
          },
          step1Cue: "1",
          step1PromptZh: "第一步：调查只看“留下来的成功者”而看不见“失败退场者”，这种抽样偏差叫幸存者偏差（填 1）还是人身攻击（填 2）？",
          step1PromptEn: "Step 1: Observing only winners while invisible failures drop out of the sample is called survivorship bias (1) or ad hominem (2)?",
          step1PromptI18n: {
            ja: "ステップ 1：成功して残った例だけを観察し失敗例を見落とす偏りは、生存者バイアス（1）ですか、人身攻撃（2）ですか？（1 / 2）",
            ko: "1단계: 살아남은 성공자만 관찰하고 탈락한 실패자를 놓치는 표집 오류는 생존자 편향(1)입니까, 인신공격(2)입니까? (1/2)",
            ms: "Langkah 1: Memerhati hanya golongan berjaya sambil mengabaikan yang gagal dikenali sebagai pincang kemandirian (1) atau serangan peribadi (2)?",
          },
          d1Zh: "访谈的成功创业者人数如果是 35 人而非 30 人，结论就完全成立",
          d1En: "Interviewing 35 billionaires instead of 30 would make the guarantee completely valid",
          d1I18n: {
            ja: "取材する成功者を 30 人から 35 人に増やせば、結論は完全に正しくなる",
            ko: "인터뷰 대상을 30명에서 35명으로 늘리기만 하면 결론이 완전히 타당해진다",
            ms: "Menemubual 35 jutawan berbanding 30 orang sudah cukup untuk menjadikan kesimpulan itu sahih",
          },
          d2Zh: "专栏作者忘记询问这 30 位创业者喜爱的咖啡口味",
          d2En: "The columnist forgot to ask the 30 entrepreneurs about their favorite coffee flavors",
          d2I18n: {
            ja: "コラム筆者が 30 人の起業家に好みのコーヒーの味を尋ね忘れたこと",
            ko: "칼럼 필자가 창업가 30명에게 좋아하는 커피 맛을 묻지 않은 것",
            ms: "Kolumnis terlupa bertanya tentang perisa kopi kegemaran 30 usahawan tersebut",
          },
          d3Zh: "凡是谨慎控制财务风险的企业都必定在一年内倒闭",
          d3En: "Any company that prudently manages financial risk is guaranteed to fail within a year",
          d3I18n: {
            ja: "財務リスクを慎重に管理する企業はすべて 1 年以内に必ず倒産する",
            ko: "재무 위험을 신중히 관리하는 기업은 모두 1년 안에 반드시 도산한다",
            ms: "Mana-mana syarikat yang mengurus risiko kewangan secara berhemat pasti muflis dalam setahun",
          },
        },
        {
          // Challenge: Reverse causation + summer heat confounder (ice-cream sales & drowning incidents)
          promptZh: `【高阶因果方向与混杂审查】某市政简报推论：“过去五年沿海浴场周边冷饮雪糕周销量每上升 30%，同期海水浴场中暑与抽筋救援事件也上升约 28%；可见食用雪糕是诱发海滩救援激增的直接元凶，应全面禁售冷饮。”\n对上述推论最精准的科学批驳是：`,
          promptEn: `[Causal Direction & Confounding Audit] Municipal brief: "Whenever weekly ice-cream sales near coastal beaches rise by 30%, beach heatstroke and cramp rescues rise by ~28%; therefore, eating ice cream directly triggers beach emergencies and should be banned."\nWhich critique best exposes the fallacy?`,
          promptI18n: {
            ja: `【因果の向きと交絡の検証】ある自治体の報告：「海岸周辺のアイスクリームの週間売上高が 30% 増える時期には、海水浴場での熱中症やけいれんによる救助件数も約 28% 増えています。したがってアイスクリームの摂取が事故の直接の原因であり、販売を禁止すべきです。」\nこの推論に対する最も的確な批判はどれですか。`,
            ko: `[인과 방향 및 교란 변수 검증] 어느 지자체 브리핑: "해수욕장 인근 아이스크림 주간 판매량이 30% 늘어날 때마다 해변 온열 질환 및 경련 구조 건수도 약 28% 증가했습니다. 따라서 아이스크림 섭취가 해변 응급 사고의 직접 원인이므로 판매를 금지해야 합니다."\n이 추론의 오류를 가장 정확히 지적한 비판은 무엇입니까?`,
            ms: `[Audit Arah Sebab-Akibat & Pengeliru] Laporan perbandaran: "Setiap kali jualan mingguan aiskrim berhampiran pantai meningkat 30%, kes kecemasan strok haba dan kekejangan di pantai turut meningkat ~28%; oleh itu, memakan aiskrim ialah punca langsung kecemasan pantai."\nKritikan manakah yang paling tepat mendedahkan kesilapan logik ini?`,
          },
          ansZh: "“盛夏高温与客流高峰”这一共同混杂变量同时推高了冷饮销量与海滩救援数，二者并非直接因果",
          ansEn: "Summer heatwaves and crowd surges act as a confounding variable driving up both ice-cream sales and beach rescues simultaneously",
          ansI18n: {
            ja: "「猛暑と海水浴客の急増」という交絡変数がアイスの売上と救助件数の両方を同時に押し上げており、直接の因果関係ではない",
            ko: "'여름철 폭염과 피서객 급증'이라는 공통 교란 변수가 아이스크림 판매량과 구조 건수를 동시에 높인 것이지 직접적인 인과 관계가 아니다",
            ms: "Cuaca panas musim panas dan pertambahan pengunjung bertindak sebagai pemboleh ubah pengeliru yang meningkatkan kedua-dua jualan aiskrim dan kes kecemasan pantai",
          },
          explZh: "夏季炎热高温与海滩游客激增（第三混杂变量 / `pemboleh ubah pengeliru`）既让人们大量购买雪糕，又导致更多下水者发生中暑或抽筋；禁售雪糕丝毫不会降低气温或减少溺水风险。",
          explEn: "Hot summer weather and larger beach crowds simultaneously boost ice-cream purchases and heat/swimming emergencies; banning ice cream removes a co-symptom while leaving the true confounder untouched.",
          explI18n: {
            ja: "夏の高温と遊泳客の増加という共通の交絡変数が、アイスの購入増と熱中症・水難事故増の双方を引き起こしています。アイスを禁止しても真の原因は解消されません。",
            ko: "무더운 날씨와 해수욕객 급증이라는 공통 교란 변수가 아이스크림 소비와 안전사고를 동시에 증가시킨 것입니다. 아이스크림을 금지해도 실제 원인은 사라지지 않습니다.",
            ms: "Suhu tinggi musim panas dan kesesakan pengunjung ialah pemboleh ubah pengeliru yang memacu kedua-dua jualan aiskrim dan kes kecemasan; mengharamkan aiskrim tidak menangani punca sebenar.",
          },
          step1Cue: "1",
          step1PromptZh: "第一步：同时导致“雪糕热销”和“海滩中暑救援增多”的幕后环境因素是夏季气温升高（填 1）还是雪糕包装纸（填 2）？",
          step1PromptEn: "Step 1: Which underlying third factor drives both ice-cream sales and heatstroke rescues — rising summer temperature (1) or ice-cream wrappers (2)?",
          step1PromptI18n: {
            ja: "ステップ 1：アイスの売上と熱中症救助の両方を同時に増やす背後の要因は、夏の気温上昇（1）ですか、包み紙（2）ですか？（1 / 2）",
            ko: "1단계: 아이스크림 판매와 온열 질환 구조를 동시에 늘리는 배후 요인은 여름철 기온 상승(1)입니까, 포장지(2)입니까? (1/2)",
            ms: "Langkah 1: Apakah pemboleh ubah pengeliru sebenar yang meningkatkan kedua-dua jualan aiskrim dan kes strok haba — kenaikan suhu musim panas (1) atau pembalut aiskrim (2)?",
          },
          d1Zh: "28% 与 30% 相差 2 个百分点，只要两个百分比完全相等就能证明因果关系",
          d1En: "If rescue growth matched 30% instead of 28%, direct causation would be conclusively proven",
          d1I18n: {
            ja: "28% が 30% と完全に一致しさえすれば、アイスクリームが原因だと証明できる",
            ko: "28%가 30%와 정확히 일치하기만 하면 직접적인 인과 관계가 완전히 증명된다",
            ms: "Jika peningkatan kecemasan mencecah tepat 30%, maka hubungan sebab-akibat langsung terbukti sepenuhnya",
          },
          d2Zh: "简报没有统计草莓味与香草味雪糕各自的价格弹性",
          d2En: "The brief failed to separate price elasticity between strawberry and vanilla ice cream",
          d2I18n: {
            ja: "イチゴ味とバニラ味の価格弾力性を分けて集計していないことが問題である",
            ko: "딸기맛과 바닐라맛 아이스크림의 가격 탄력성을 구분하지 않은 것이 문제이다",
            ms: "Laporan itu gagal mengasingkan keanjalan harga antara aiskrim perisa strawberi dan vanila",
          },
          d3Zh: "其实是海滩救援行动反过来直接制造并生产了雪糕",
          d3En: "Beach rescue operations physically manufacture the ice cream sold at nearby shops",
          d3I18n: {
            ja: "実際には海岸の救助活動そのものが近隣店舗のアイスクリームを製造している",
            ko: "실제로는 해변 구조 활동 자체가 인근 상점의 아이스크림을 물리적으로 생산한다",
            ms: "Operasi menyelamat di pantai sebenarnya yang menghasilkan aiskrim di kedai berhampiran",
          },
        },
      ] as const;

      const f = dTier === "challenge" ? fallacies[2] : dTier === "standard" ? fallacies[1] : fallacies[0];
      // Repair tiny Arabic-script typo guard in Malay survivorship text so 100% Latin script is preserved:
      const cleanAnsI18n: TriLocaleText =
        dTier === "standard"
          ? {
              ja: f.ansI18n.ja,
              ko: f.ansI18n.ko,
              ms: "Pincang kemandirian (survivorship bias) — hanya meninjau golongan berjaya sambil mengabaikan majoriti yang mengambil risiko sama tetapi muflis",
            }
          : f.ansI18n;

      return {
        promptZh: f.promptZh,
        promptEn: f.promptEn,
        promptI18n: f.promptI18n,
        answer: f.ansZh,
        answerEn: f.ansEn,
        answerI18n: cleanAnsI18n,
        explanationZh: f.explZh,
        explanationEn: f.explEn,
        explanationI18n: f.explI18n,
        scaffolds: [
          {
            promptZh: f.step1PromptZh,
            promptEn: f.step1PromptEn,
            promptI18n: f.step1PromptI18n,
            hintZh: `检查是否存在共同混杂变量或抽样偏差`,
            hintEn: `Check for a hidden confounding factor or missing failure denominator`,
            hintI18n: {
              ja: `交絡変数や除外された失敗例（分母）がないか確認します`,
              ko: `교란 변수나 누락된 실패 표본(분모)이 없는지 확인합니다`,
              ms: `Semak kewujudan pemboleh ubah pengeliru atau sampel kegagalan yang tercicir`,
            },
            expectedAnswer: f.step1Cue,
          },
          {
            promptZh: `第二步：选出准确指出这一因果/抽样逻辑漏洞的诊断项：`,
            promptEn: `Step 2: Select the critique that accurately identifies this causal or sampling flaw:`,
            promptI18n: {
              ja: `ステップ 2：この因果推論または標本抽出の欠陥を正確に指摘している選択肢を選びなさい：`,
              ko: `2단계: 이러한 인과 추론 또는 표집상의 핵심 오류를 정확히 짚어낸 보기를 고르시오:`,
              ms: `Langkah 2: Pilih kritikan yang tepat mengenal pasti kelemahan sebab-akibat atau persampelan ini:`,
            },
            hintZh: `相关性不等于因果性；局部幸存者不代表总体成功率`,
            hintEn: `Correlation ≠ causation; survivors alone ≠ full denominator`,
            hintI18n: {
              ja: `相関は因果を意味せず、生存例だけでは全体の母集団を表せません`,
              ko: `상관관계는 인과 관계가 아니며 생존 표본만으로는 전체 분모를 대변할 수 없습니다`,
              ms: `Korelasi bukan sebab-akibat; sampel pemenang sahaja tidak mewakili keseluruhan populasi`,
            },
            expectedAnswer: f.ansZh,
            expectedAnswerEn: f.ansEn,
            expectedAnswerI18n: cleanAnsI18n,
          },
        ],
        distractors: [
          { text: f.d1Zh, textEn: f.d1En, textI18n: f.d1I18n, misconceptionTag: "misc_lit_spurious_cause" },
          { text: f.d2Zh, textEn: f.d2En, textI18n: f.d2I18n },
          { text: f.d3Zh, textEn: f.d3En, textI18n: f.d3I18n, misconceptionTag: "misc_lit_spurious_cause" },
        ],
      };
    }

    // 50. Literacy: PISA multi-source text + table synthesis (parameterized + 3-constraint challenge!)
    case "lit_pisa_synthesis": {
      if (dTier === "challenge") {
        // Challenge: 3 simultaneous policy rules + footnote adjustment!
        const maxNoise = rng.pick([50, 52, 55]);
        const minGreen = rng.pick([35, 40]);
        const ansI18n: TriLocaleText = {
          ja: "候補地 Y のみがすべての基準を満たす",
          ko: "후보지 Y만 모든 기준을 충족한다",
          ms: "Hanya Tapak Y yang memenuhi kesemua kriteria",
        };
        return {
          promptZh: `【PISA 多源规则与脚注交叉核验】\n• 市政图书馆选址准则（须**全部满足**）：\n  ① 步行至最近地铁口距离 $\\le 500\\text{ m}$；\n  ② 日间环境噪音实测值 $\\le ${maxNoise}\\text{ dB}$（注：若临近主干道但加装双层隔音幕墙，可按实测值减 $8\\text{ dB}$ 折算）；\n  ③ 地块绿化透水率 $\\ge ${minGreen}\\%$。\n• 勘测数据：\n  - 地块 X：距地铁 $320\\text{ m}$，噪音 $${maxNoise - 4}\\text{ dB}$（无幕墙），绿化率 $${minGreen - 5}\\%$\n  - 地块 Y：距地铁 $460\\text{ m}$，临干道实测噪音 $${maxNoise + 5}\\text{ dB}$（承诺加装双层隔音幕墙），绿化率 $${minGreen + 4}\\%$\n  - 地块 Z：距地铁 $610\\text{ m}$，噪音 $${maxNoise - 9}\\text{ dB}$（无幕墙），绿化率 $${minGreen + 12}\\%$\n综合正文与脚注折算规则，最终符合选址资格的是：`,
          promptEn: `[PISA Multi-Source Policy & Footnote Synthesis]\n• Public Library Siting Rules (ALL three required):\n  (1) Metro walk $\\le 500\\text{ m}$;\n  (2) Daytime noise $\\le ${maxNoise}\\text{ dB}$ *(Footnote: sites installing double-glazed acoustic facades deduct $8\\text{ dB}$ from raw readings)*;\n  (3) Permeable green ratio $\\ge ${minGreen}\\%$.\n• Survey Data:\n  - Site X: $320\\text{ m}$ metro, $${maxNoise - 4}\\text{ dB}$ (no facade), $${minGreen - 5}\\%$ green\n  - Site Y: $460\\text{ m}$ metro, $${maxNoise + 5}\\text{ dB}$ raw (installs double-glazed facade), $${minGreen + 4}\\%$ green\n  - Site Z: $610\\text{ m}$ metro, $${maxNoise - 9}\\text{ dB}$ (no facade), $${minGreen + 12}\\%$ green\nWhich site qualifies?`,
          promptI18n: {
            ja: `【複数資料と注記の統合読解】\n• 図書館建設地の選定基準（**3 条件すべて**必須）：\n  (1) 最寄り駅からの徒歩距離 $\\le 500\\text{ m}$；\n  (2) 昼間騒音 $\\le ${maxNoise}\\text{ dB}$（※注：二重防音壁を設置する場合は実測値から $8\\text{ dB}$ 差し引いて判定）；\n  (3) 緑化透水率 $\\ge ${minGreen}\\%$。\n• 調査データ：\n  - 候補地 X：駅 $320\\text{ m}$、騒音 $${maxNoise - 4}\\text{ dB}$（防音壁なし）、緑化率 $${minGreen - 5}\\%$\n  - 候補地 Y：駅 $460\\text{ m}$、実測騒音 $${maxNoise + 5}\\text{ dB}$（二重防音壁を設置）、緑化率 $${minGreen + 4}\\%$\n  - 候補地 Z：駅 $610\\text{ m}$、騒音 $${maxNoise - 9}\\text{ dB}$（防音壁なし）、緑化率 $${minGreen + 12}\\%$\nすべての基準を満たす候補地はどれですか。`,
            ko: `[다중 자료 및 각주 통합 해석]\n• 공공 도서관 부지 선정 기준(**세 조건 모두** 충족 필수):\n  (1) 지하철역 도보 거리 $\\le 500\\text{ m}$;\n  (2) 주간 소음 $\\le ${maxNoise}\\text{ dB}$ (*각주: 이중 방음 외벽 설치 시 실측치에서 $8\\text{ dB}$을 차감하여 판정*);\n  (3) 녹지 투수율 $\\ge ${minGreen}\\%$.\n• 조사 자료:\n  - 후보지 X: 역 $320\\text{ m}$, 소음 $${maxNoise - 4}\\text{ dB}$(방음벽 없음), 녹지율 $${minGreen - 5}\\%$\n  - 후보지 Y: 역 $460\\text{ m}$, 실측 소음 $${maxNoise + 5}\\text{ dB}$(이중 방음 외벽 설치), 녹지율 $${minGreen + 4}\\%$\n  - 후보지 Z: 역 $610\\text{ m}$, 소음 $${maxNoise - 9}\\text{ dB}$(방음벽 없음), 녹지율 $${minGreen + 12}\\%$\n최종 적격 후보지는 어디입니까?`,
            ms: `[Sintesis Pelbagai Sumber & Nota Kaki PISA]\n• Syarat Tapak Perpustakaan Awam (**KETIGA-TIGA** syarat wajib dipenuhi):\n  (1) Jarak berjalan ke stesen metro $\\le 500\\text{ m}$;\n  (2) Bunyi bising siang $\\le ${maxNoise}\\text{ dB}$ *(Nota kaki: pemasangan fasad akustik dwilapis menolak $8\\text{ dB}$ daripada bacaan asal)*;\n  (3) Nisbah hijau telap air $\\ge ${minGreen}\\%$.\n• Data Tinjauan:\n  - Tapak X: metro $320\\text{ m}$, $${maxNoise - 4}\\text{ dB}$ (tiada fasad), hijau $${minGreen - 5}\\%$\n  - Tapak Y: metro $460\\text{ m}$, $${maxNoise + 5}\\text{ dB}$ asal (pasang fasad dwilapis), hijau $${minGreen + 4}\\%$\n  - Tapak Z: metro $610\\text{ m}$, $${maxNoise - 9}\\text{ dB}$ (tiada fasad), hijau $${minGreen + 12}\\%$\nTapak manakah yang layak?`,
          },
          answer: "仅地块 Y 符合全部选址准则",
          answerEn: "Only Site Y satisfies all criteria",
          answerI18n: ansI18n,
          explanationZh: `逐一核验三项指标与脚注：地块 X 绿化率 $${minGreen - 5}\\% < ${minGreen}\\%$ 淘汰；地块 Z 距地铁 $610\\text{ m} > 500\\text{ m}$ 淘汰；地块 Y 距地铁 $460\\text{ m}$ 达标，折算噪音 $${maxNoise + 5} - 8 = ${maxNoise - 3}\\text{ dB} \\le ${maxNoise}\\text{ dB}$ 达标，绿化率 $${minGreen + 4}\\% \\ge ${minGreen}\\%$ 达标！`,
          explanationEn: `Site X fails green ratio (${minGreen - 5}% < ${minGreen}%); Site Z fails metro distance (610 m > 500 m); Site Y's adjusted noise is ${maxNoise + 5} - 8 = ${maxNoise - 3} dB ≤ ${maxNoise} dB, passing all three rules.`,
          explanationI18n: {
            ja: `候補地 X は緑化率（${minGreen - 5}% < ${minGreen}%）で不適格、候補地 Z は駅距離（610 m > 500 m）で不適格です。候補地 Y は注記の防音壁補正により騒音が ${maxNoise + 5} - 8 = ${maxNoise - 3} dB ≤ ${maxNoise} dB となり、3 条件すべてを満たします。`,
            ko: `후보지 X는 녹지율(${minGreen - 5}% < ${minGreen}%) 미달, 후보지 Z는 역 거리(610 m > 500 m) 초과로 탈락합니다. 후보지 Y는 각주의 방음벽 차감 규정을 적용하면 소음이 ${maxNoise + 5} - 8 = ${maxNoise - 3} dB ≤ ${maxNoise} dB가 되어 세 기준을 모두 충족합니다.`,
            ms: `Tapak X gagal syarat hijau (${minGreen - 5}% < ${minGreen}%); Tapak Z gagal jarak metro (610 m > 500 m); bunyi terlaras Tapak Y ialah ${maxNoise + 5} - 8 = ${maxNoise - 3} dB ≤ ${maxNoise} dB, maka lulus ketiga-tiga syarat.`,
          },
          scaffolds: [
            {
              promptZh: `第一步：按脚注折算，地块 Y 加装双层隔音幕墙后的判定噪音值（${maxNoise + 5} - 8）是多少 dB？`,
              promptEn: `Step 1: Applying the footnote deduction, what is Site Y's adjusted noise (${maxNoise + 5} - 8) in dB?`,
              promptI18n: {
                ja: `ステップ 1：注記の 8 dB 控除を適用すると、候補地 Y の判定騒音（${maxNoise + 5} - 8）は何 dB ですか。`,
                ko: `1단계: 각주의 8 dB 차감 규정을 적용하면 후보지 Y의 판정 소음(${maxNoise + 5} - 8)은 몇 dB입니까?`,
                ms: `Langkah 1: Menggunakan tolakan nota kaki, berapakah bunyi terlaras Tapak Y (${maxNoise + 5} - 8) dalam dB?`,
              },
              hintZh: `${maxNoise + 5} - 8`,
              hintEn: `${maxNoise + 5} - 8`,
              expectedAnswer: `${maxNoise - 3}`,
            },
            {
              promptZh: `第二步：对比 X（差在绿化）、Y（三项全过）、Z（差在地铁距离），选出最终合格项：`,
              promptEn: `Step 2: Cross-check all 3 conditions across X, Y, and Z to select the qualifying option:`,
              promptI18n: {
                ja: `ステップ 2：X・Y・Z の 3 条件をすべて照合し、適格な選択肢を選びなさい：`,
                ko: `2단계: X, Y, Z의 세 가지 기준 충족 여부를 모두 대조하여 알맞은 보기를 고르시오:`,
                ms: `Langkah 2: Semak silang ketiga-tiga syarat bagi X, Y, dan Z untuk memilih jawapan yang tepat:`,
              },
              hintZh: `不可遗漏脚注与任一硬性门槛`,
              hintEn: `Every rule plus the footnote must be satisfied`,
              hintI18n: {
                ja: `3 つの基準と注記の条件をすべて満たす必要があります`,
                ko: `세 가지 기준과 각주 조건을 모두 충족해야 합니다`,
                ms: `Kesemua peraturan termasuk nota kaki mesti dipenuhi`,
              },
              expectedAnswer: "仅地块 Y 符合全部选址准则",
              expectedAnswerEn: "Only Site Y satisfies all criteria",
              expectedAnswerI18n: ansI18n,
            },
          ],
          distractors: [
            {
              text: "三个地块均不符合资格（因忽略了地块 Y 的隔音折算脚注）",
              textEn: "None of the three sites qualify (ignoring Site Y's facade footnote)",
              textI18n: {
                ja: "3 つの候補地はいずれも基準を満たさない（注記の控除を見落とした場合）",
                ko: "세 후보지 모두 부적격이다(후보지 Y의 각주 차감 조건을 놓친 경우)",
                ms: "Tiada satu pun tapak yang layak (mengabaikan nota kaki fasad Tapak Y)",
              },
              misconceptionTag: "misc_lit_single_criterion",
            },
            {
              text: "地块 X（因其距离地铁口最近仅 320 m）",
              textEn: "Site X (because its 320 m metro walk is the shortest)",
              textI18n: {
                ja: "候補地 X（駅からの距離が 320 m で最も近いから）",
                ko: "후보지 X (지하철역 거리가 320 m로 가장 가깝기 때문)",
                ms: "Tapak X (kerana jarak berjalan ke metro 320 m adalah paling dekat)",
              },
              misconceptionTag: "misc_lit_single_criterion",
            },
            {
              text: "地块 Z（因其原始噪音最低且绿化率最高）",
              textEn: "Site Z (because it has the lowest raw noise and highest green ratio)",
              textI18n: {
                ja: "候補地 Z（実測騒音が最も低く緑化率も最も高いから）",
                ko: "후보지 Z (실측 소음이 가장 낮고 녹지율이 가장 높기 때문)",
                ms: "Tapak Z (kerana bunyi asalnya paling rendah dan nisbah hijaunya paling tinggi)",
              },
              misconceptionTag: "misc_lit_single_criterion",
            },
          ],
        };
      }

      const limitEnergy = dTier === "standard" ? rng.pick([44, 46, 48]) : rng.pick([40, 42, 45]);
      const minShare = dTier === "standard" ? 62 : 60;
      const labBShare = minShare + 4;
      const labCShare = minShare - 5;
      const answerI18n: TriLocaleText = {
        ja: "ラボ B のみが条件を満たす",
        ko: "연구실 B만 자격을 갖춘다",
        ms: "Hanya Makmal B yang layak",
      };
      return {
        promptZh: `【PISA 多源非连续性文本决策】\n• 政策细则：申请“绿色示范实验室”认证须**同时满足**：① 可再生绿电占比 $\\ge ${minShare}\\%$；② 单位算力能耗 $\\le ${limitEnergy}\\text{ W}$。\n• 实测数据表：\n  - 甲馆：绿电占比 $78\\%$，单位能耗 $${limitEnergy + 6}\\text{ W}$\n  - 乙馆：绿电占比 $${labBShare}\\%$，单位能耗 $${limitEnergy - 3}\\text{ W}$\n  - 丙馆：绿电占比 $${labCShare}\\%$，单位能耗 $${limitEnergy - 8}\\text{ W}$\n最终哪座场馆符合认证资格？`,
        promptEn: `[Multi-Source Synthesis]\n• Policy Rule: Certification requires BOTH (1) Renewable share $\\ge ${minShare}\\%$ AND (2) Energy intensity $\\le ${limitEnergy}\\text{ W}$.\n• Data: Lab A ($78\\%, ${limitEnergy + 6}\\text{ W}$); Lab B ($${labBShare}\\%, ${limitEnergy - 3}\\text{ W}$); Lab C ($${labCShare}\\%, ${limitEnergy - 8}\\text{ W}$).\nWhich lab qualifies?`,
        promptI18n: {
          ja: `【複数資料の統合】\n• 規定：認証には (1) 再生可能エネルギーの割合 $\\ge ${minShare}\\%$ と (2) 演算単位あたりの消費電力 $\\le ${limitEnergy}\\text{ W}$ の**両方**を満たす必要があります。\n• データ：ラボ A ($78\\%, ${limitEnergy + 6}\\text{ W}$)、ラボ B ($${labBShare}\\%, ${limitEnergy - 3}\\text{ W}$)、ラボ C ($${labCShare}\\%, ${limitEnergy - 8}\\text{ W}$)。\n認証を受けられるのはどのラボですか。`,
          ko: `[다중 자료 종합]\n• 정책 규정: 인증을 받으려면 (1) 재생 에너지 비율 $\\ge ${minShare}\\%$와 (2) 연산 단위당 전력 소비 $\\le ${limitEnergy}\\text{ W}$를 **모두** 충족해야 합니다.\n• 자료: 연구실 A ($78\\%, ${limitEnergy + 6}\\text{ W}$), 연구실 B ($${labBShare}\\%, ${limitEnergy - 3}\\text{ W}$), 연구실 C ($${labCShare}\\%, ${limitEnergy - 8}\\text{ W}$).\n인증 자격을 갖춘 연구실은 어디입니까?`,
          ms: `[Sintesis Pelbagai Sumber]\n• Peraturan Dasar: Pensijilan memerlukan KEDUA-DUA (1) Bahagian tenaga boleh baharu $\\ge ${minShare}\\%$ DAN (2) Keamatan tenaga $\\le ${limitEnergy}\\text{ W}$.\n• Data: Makmal A ($78\\%, ${limitEnergy + 6}\\text{ W}$); Makmal B ($${labBShare}\\%, ${limitEnergy - 3}\\text{ W}$); Makmal C ($${labCShare}\\%, ${limitEnergy - 8}\\text{ W}$).\nMakmal manakah yang layak?`,
        },
        answer: "仅乙馆符合资格",
        answerEn: "Only Lab B qualifies",
        answerI18n,
        explanationZh: `逐条交叉核验双重约束：甲馆绿电最高但能耗 $${limitEnergy + 6} > ${limitEnergy}$ 超标淘汰；丙馆能耗最低但绿电 $${labCShare}\\% < ${minShare}\\%$ 不达标；唯有乙馆两项指标同时达标！`,
        explanationEn: `Lab A fails Condition 2 (${limitEnergy + 6} > ${limitEnergy}); Lab C fails Condition 1 (${labCShare}% < ${minShare}%); only Lab B satisfies both.`,
        explanationI18n: {
          ja: `ラボ A は条件 2 を満たさず（${limitEnergy + 6} > ${limitEnergy}）、ラボ C は条件 1 を満たしません（${labCShare}% < ${minShare}%）。両方の条件を満たすのはラボ B だけです。`,
          ko: `연구실 A는 조건 2를 충족하지 못하고(${limitEnergy + 6} > ${limitEnergy}), 연구실 C는 조건 1을 충족하지 못합니다(${labCShare}% < ${minShare}%). 두 조건을 모두 충족하는 곳은 연구실 B뿐입니다.`,
          ms: `Makmal A gagal Syarat 2 (${limitEnergy + 6} > ${limitEnergy}); Makmal C gagal Syarat 1 (${labCShare}% < ${minShare}%); hanya Makmal B memenuhi kedua-dua syarat.`,
        },
        scaffolds: [
          {
            promptZh: `第一步：甲馆虽然绿电高达 78%，但它的单位能耗 ${limitEnergy + 6} W 满足 ≤ ${limitEnergy} W 吗？（填 yes 或 no）`,
            promptEn: `Step 1: Does Lab A's energy intensity (${limitEnergy + 6} W) satisfy the rule ≤ ${limitEnergy} W? (yes/no)`,
            promptI18n: {
              ja: `ステップ 1：ラボ A の消費電力（${limitEnergy + 6} W）は基準（≤ ${limitEnergy} W）を満たしますか？（yes / no）`,
              ko: `1단계: 연구실 A의 전력 소비(${limitEnergy + 6} W)는 기준(≤ ${limitEnergy} W)을 충족합니까? (yes/no)`,
              ms: `Langkah 1: Adakah keamatan tenaga Makmal A (${limitEnergy + 6} W) memenuhi syarat ≤ ${limitEnergy} W? (yes/no)`,
            },
            hintZh: `比较 ${limitEnergy + 6} 与 ${limitEnergy}`,
            hintEn: `Compare ${limitEnergy + 6} against ${limitEnergy}`,
            hintI18n: {
              ja: `${limitEnergy + 6} と基準値 ${limitEnergy} を比べます`,
              ko: `${limitEnergy + 6}과 기준치 ${limitEnergy}을 비교합니다`,
              ms: `Bandingkan ${limitEnergy + 6} dengan had ${limitEnergy}`,
            },
            expectedAnswer: `no`,
          },
          {
            promptZh: `第二步：继续核验乙馆与丙馆的两项硬指标，选出两项全部达标的场馆：`,
            promptEn: `Step 2: Check both rules on Lab B and Lab C to identify the qualifying lab:`,
            promptI18n: {
              ja: `ステップ 2：ラボ B とラボ C を両方の条件で確認し、適格なものを選びなさい：`,
              ko: `2단계: 연구실 B와 연구실 C를 두 조건 모두에 대조하여 자격을 갖춘 곳을 고르시오:`,
              ms: `Langkah 2: Semak kedua-dua syarat bagi Makmal B dan Makmal C untuk memilih makmal yang layak:`,
            },
            hintZh: `双重条件都打勾才行`,
            hintEn: `Both conditions must hold simultaneously`,
            hintI18n: { ja: `両方の条件を満たす必要があります`, ko: `두 조건을 모두 충족해야 합니다`, ms: `Kedua-dua syarat mesti dipenuhi` },
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
