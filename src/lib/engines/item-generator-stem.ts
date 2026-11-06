import type { DifficultyTier } from "@/types/taxonomy";
import {
  formatFrac,
  svgCircuit,
  svgForceDiagram,
  type DeterministicRng,
  type RawGeneratedCore,
} from "./item-generator-shared";

/**
 * Parameterized generators for the Phase 1 science / humanities micro-topics (#19–#30):
 * physics, chemistry, biology, English, computing, geography and history.
 */
export function generateStemCore(
  generatorKey: string,
  rng: DeterministicRng,
  dTier: DifficultyTier
): RawGeneratedCore | null {
  let core: RawGeneratedCore | null = null;
  switch (generatorKey) {
    // 19. Physics: Density & SI units
    case "phy_density": {
      const rhoGcm3 = rng.pick([2.7, 7.8, 8.9, 2.5]);
      const volCm3 = rng.pick([10, 20, 40, 50]);
      const massG = Math.round(rhoGcm3 * volCm3);
      const ansKgM3 = Math.round(rhoGcm3 * 1000);
      const wrongDiv1000 = rhoGcm3 / 1000;
      core = {
        promptZh: `测得某均匀金属块质量 m = ${massG} g，体积 V = ${volCm3} cm³。求该金属的密度是多少 kg/m³？（提示：1 g/cm³ = 1000 kg/m³）`,
        promptEn: `A uniform metal block has mass m = ${massG} g and volume V = ${volCm3} cm³. Find its density in kg/m³:`,
        promptI18n: {
          ja: `質量 m = ${massG} g、体積 V = ${volCm3} cm³ の一様な金属のかたまりがある。この金属の密度は何 kg/m³ か。`,
          ko: `질량 m = ${massG} g, 부피 V = ${volCm3} cm³인 균일한 금속 덩어리가 있다. 이 금속의 밀도는 몇 kg/m³인지 구하시오.`,
          ms: `Sebuah blok logam seragam mempunyai jisim m = ${massG} g dan isi padu V = ${volCm3} cm³. Cari ketumpatannya dalam kg/m³:`,
        },
        answer: `${ansKgM3}`,
        unit: "kg/m³",
        explanationZh: `先算 ρ = m / V = ${massG} / ${volCm3} = ${rhoGcm3} g/cm³；再换算国际单位：${rhoGcm3} × 1000 = ${ansKgM3} kg/m³。`,
        explanationEn: `ρ = ${massG} / ${volCm3} = ${rhoGcm3} g/cm³ = ${ansKgM3} kg/m³.`,
        explanationI18n: {
          ja: `ρ = m / V = ${massG} / ${volCm3} = ${rhoGcm3} g/cm³ であり、単位を換算すると ${rhoGcm3} × 1000 = ${ansKgM3} kg/m³ となる。`,
          ko: `ρ = m / V = ${massG} / ${volCm3} = ${rhoGcm3} g/cm³이고, 단위를 환산하면 ${rhoGcm3} × 1000 = ${ansKgM3} kg/m³이다.`,
          ms: `ρ = m / V = ${massG} / ${volCm3} = ${rhoGcm3} g/cm³; tukar kepada unit SI: ${rhoGcm3} × 1000 = ${ansKgM3} kg/m³.`,
        },
        scaffolds: [
          {
            promptZh: `先求该金属以 g/cm³ 为单位的密度：${massG} ÷ ${volCm3} = ?`,
            promptEn: `First compute ρ in g/cm³ (${massG} ÷ ${volCm3}):`,
            promptI18n: {
              ja: `まず、g/cm³ 単位での密度 ρ を求めなさい（${massG} ÷ ${volCm3}）：`,
              ko: `먼저 g/cm³ 단위의 밀도 ρ를 구하시오 (${massG} ÷ ${volCm3}):`,
              ms: `Mula-mula, hitung ρ dalam g/cm³ (${massG} ÷ ${volCm3}):`,
            },
            hintZh: `m ÷ V`,
            hintEn: `m / V`,
            expectedAnswer: `${rhoGcm3}`,
          },
          {
            promptZh: `1 g/cm³ = 1000 kg/m³，换算成 kg/m³ 是多少？`,
            promptEn: `Convert ${rhoGcm3} g/cm³ to kg/m³:`,
            promptI18n: {
              ja: `${rhoGcm3} g/cm³ を kg/m³ に換算しなさい：`,
              ko: `${rhoGcm3} g/cm³를 kg/m³로 환산하시오:`,
              ms: `Tukarkan ${rhoGcm3} g/cm³ kepada kg/m³:`,
            },
            hintZh: `乘以 1000`,
            hintEn: `Multiply by 1000`,
            hintI18n: { ja: `1000 を掛ける`, ko: `1000을 곱한다`, ms: `Darab dengan 1000` },
            expectedAnswer: `${ansKgM3}`,
          },
        ],
        distractors: [
          { text: `${wrongDiv1000}`, misconceptionTag: "misc_density_halved" },
          { text: `${Math.round(ansKgM3 / 2)}`, misconceptionTag: "misc_density_halved" },
          { text: `${rhoGcm3}` },
        ],
        misconceptionsByValue: {
          [`${wrongDiv1000}`]: "misc_density_halved",
          [`${Math.round(ansKgM3 / 2)}`]: "misc_density_halved",
        },
      };
      break;
    }

    // 20. Physics: Average speed & motion graphs
    case "phy_motion_speed": {
      const pairs = [
        [2, 6, 3, 4], // v1=2, v2=6 -> harmonic=3, arith=4
        [3, 6, 4, 4.5], // v1=3, v2=6 -> harmonic=4, arith=4.5
        [4, 12, 6, 8], // v1=4, v2=12 -> harmonic=6, arith=8
        [6, 12, 8, 9], // v1=6, v2=12 -> harmonic=8, arith=9
      ] as const;
      const [v1, v2, vAvg, arithTrap] = rng.pick(pairs);
      const halfDist = v1 * v2; // Guarantees integer times!
      const t1 = halfDist / v1;
      const t2 = halfDist / v2;
      core = {
        promptZh: `一辆智能小车沿直线跑道测试：前 ${halfDist} m 以 v₁ = ${v1} m/s 匀速行驶，后 ${halfDist} m 以 v₂ = ${v2} m/s 匀速行驶。求全程 ${2 * halfDist} m 的平均速度（m/s）：`,
        promptEn: `A rover travels the first ${halfDist} m at v₁ = ${v1} m/s and the next ${halfDist} m at v₂ = ${v2} m/s. Find its average speed (m/s) over the entire ${2 * halfDist} m trip:`,
        promptI18n: {
          ja: `探査車が直線コースの最初の ${halfDist} m を v₁ = ${v1} m/s、続く ${halfDist} m を v₂ = ${v2} m/s の一定の速さで走った。全体 ${2 * halfDist} m の平均の速さ [m/s] を求めなさい。`,
          ko: `탐사 로봇 차량이 처음 ${halfDist} m를 v₁ = ${v1} m/s로, 다음 ${halfDist} m를 v₂ = ${v2} m/s로 이동하였다. 전체 ${2 * halfDist} m 구간에서의 평균 속력(m/s)을 구하시오.`,
          ms: `Sebuah rover bergerak sejauh ${halfDist} m pertama pada v₁ = ${v1} m/s dan ${halfDist} m berikutnya pada v₂ = ${v2} m/s. Cari laju puratanya (m/s) bagi keseluruhan perjalanan ${2 * halfDist} m:`,
        },
        answer: `${vAvg}`,
        unit: "m/s",
        explanationZh: `前段耗时 t₁ = ${halfDist}/${v1} = ${t1} s，后段耗时 t₂ = ${halfDist}/${v2} = ${t2} s；全程平均速度 v = 总路程 / 总时间 = ${2 * halfDist} / (${t1} + ${t2}) = ${vAvg} m/s（绝不能直接算 (${v1}+${v2})/2 = ${arithTrap} m/s！）。`,
        explanationEn: `t₁ = ${t1} s, t₂ = ${t2} s; Average speed = Total distance / Total time = ${2 * halfDist} / ${t1 + t2} = ${vAvg} m/s.`,
        explanationI18n: {
          ja: `t₁ = ${t1} s、t₂ = ${t2} s。平均の速さ = 全体の道のり ÷ 全体の時間 = ${2 * halfDist} / ${t1 + t2} = ${vAvg} m/s となる（(${v1}+${v2})/2 = ${arithTrap} m/s としてはいけない）。`,
          ko: `t₁ = ${t1} s, t₂ = ${t2} s이므로 평균 속력 = 전체 이동 거리 ÷ 전체 걸린 시간 = ${2 * halfDist} / ${t1 + t2} = ${vAvg} m/s이다 ((${v1}+${v2})/2 = ${arithTrap} m/s로 계산하면 안 된다).`,
          ms: `t₁ = ${t1} s, t₂ = ${t2} s; laju purata = jumlah jarak / jumlah masa = ${2 * halfDist} / ${t1 + t2} = ${vAvg} m/s (bukan (${v1}+${v2})/2 = ${arithTrap} m/s).`,
        },
        scaffolds: [
          {
            promptZh: `分别算出两段耗时之和 t_总 = ${halfDist}÷${v1} + ${halfDist}÷${v2} 等于多少秒？`,
            promptEn: `Find total time t₁ + t₂ = ${halfDist}/${v1} + ${halfDist}/${v2} (in s):`,
            promptI18n: {
              ja: `かかった時間の合計 t₁ + t₂ = ${halfDist}/${v1} + ${halfDist}/${v2} を求めなさい（単位 s）：`,
              ko: `걸린 시간의 합 t₁ + t₂ = ${halfDist}/${v1} + ${halfDist}/${v2}의 값을 구하시오 (단위: s):`,
              ms: `Cari jumlah masa t₁ + t₂ = ${halfDist}/${v1} + ${halfDist}/${v2} (dalam s):`,
            },
            hintZh: `${t1} + ${t2}`,
            hintEn: `${t1} + ${t2}`,
            expectedAnswer: `${t1 + t2}`,
          },
          {
            promptZh: `用总路程 ${2 * halfDist} m 除以总时间 ${t1 + t2} s，平均速度是？`,
            promptEn: `Divide total distance ${2 * halfDist} by total time ${t1 + t2}:`,
            promptI18n: {
              ja: `全体の道のり ${2 * halfDist} m を全体の時間 ${t1 + t2} s で割りなさい：`,
              ko: `전체 이동 거리 ${2 * halfDist} m를 전체 걸린 시간 ${t1 + t2} s로 나누시오:`,
              ms: `Bahagikan jumlah jarak ${2 * halfDist} dengan jumlah masa ${t1 + t2}:`,
            },
            hintZh: `s_总 ÷ t_总`,
            hintEn: `Total distance / Total time`,
            hintI18n: {
              ja: `全体の道のり ÷ 全体の時間`,
              ko: `전체 이동 거리 ÷ 전체 걸린 시간`,
              ms: `Jumlah jarak / jumlah masa`,
            },
            expectedAnswer: `${vAvg}`,
          },
        ],
        distractors: [
          { text: `${arithTrap}`, misconceptionTag: "misc_avg_speed_mean" },
          { text: `${v1 + v2}` },
          { text: `${vAvg + 1}` },
        ],
        misconceptionsByValue: { [`${arithTrap}`]: "misc_avg_speed_mean" },
      };
      break;
    }

    // 21. Physics: Forces & Newton's F_net = ma
    case "phy_newton_fma": {
      const m = rng.int(2, 6);
      const a = rng.int(2, 5);
      const f = rng.int(3, 10);
      const pull = m * a + f;
      const ignoreFricTrap = formatFrac(pull, m);
      core = {
        promptZh: `如图所示，质量 m = ${m} kg 的物块受水平向右拉力 F = ${pull} N 和水平向左滑动摩擦力 f = ${f} N 作用，求物块的加速度 a（单位 m/s²）：`,
        promptEn: `A ${m} kg block experiences a rightward pull F = ${pull} N and leftward friction f = ${f} N. Find its acceleration a (in m/s²):`,
        promptI18n: {
          ja: `図のように、質量 ${m} kg の物体に右向きに引く力 F = ${pull} N と左向きの動摩擦力 f = ${f} N がはたらいている。物体の加速度 a [m/s²] を求めなさい。`,
          ko: `그림과 같이 질량 ${m} kg인 물체에 오른쪽으로 당기는 힘 F = ${pull} N과 왼쪽으로 마찰력 f = ${f} N이 작용한다. 물체의 가속도 a(단위: m/s²)를 구하시오.`,
          ms: `Sebuah blok ${m} kg dikenakan daya tarikan ke kanan F = ${pull} N dan daya geseran ke kiri f = ${f} N. Cari pecutannya a (dalam m/s²):`,
        },
        svgDiagram: svgForceDiagram(m, pull, f),
        answer: `${a}`,
        unit: "m/s²",
        explanationZh: `先求合外力 F_合 = F - f = ${pull} - ${f} = ${m * a} N，再由牛顿第二定律 a = F_合 / m = ${m * a} / ${m} = ${a} m/s²（切勿忽略摩擦力直接算 F/m = ${ignoreFricTrap}）。`,
        explanationEn: `Net force F_net = ${pull} - ${f} = ${m * a} N; acceleration a = F_net / m = ${m * a} / ${m} = ${a} m/s².`,
        explanationI18n: {
          ja: `合力 F_net = ${pull} - ${f} = ${m * a} N。運動方程式より加速度 a = F_net / m = ${m * a} / ${m} = ${a} m/s² となる（摩擦力を無視して F/m = ${ignoreFricTrap} としてはいけない）。`,
          ko: `알짜힘 F_net = ${pull} - ${f} = ${m * a} N이고, 뉴턴 운동 제2법칙에 의해 가속도 a = F_net / m = ${m * a} / ${m} = ${a} m/s²이다 (마찰력을 무시하고 F/m = ${ignoreFricTrap}처럼 계산하면 안 된다).`,
          ms: `Daya paduan F_net = ${pull} - ${f} = ${m * a} N; pecutan a = F_net / m = ${m * a} / ${m} = ${a} m/s².`,
        },
        scaffolds: [
          {
            promptZh: `水平方向合力 F_合 = ${pull} - ${f} 等于多少 N？`,
            promptEn: `Compute net horizontal force F - f:`,
            promptI18n: {
              ja: `水平方向の合力 F - f を求めなさい：`,
              ko: `수평 방향의 알짜힘 F - f를 구하시오:`,
              ms: `Hitung daya paduan mengufuk F - f:`,
            },
            hintZh: `反向力相减`,
            hintEn: `Subtract opposing friction`,
            hintI18n: {
              ja: `逆向きの摩擦力を引く`,
              ko: `반대 방향의 마찰력을 뺀다`,
              ms: `Tolak daya geseran yang bertentangan`,
            },
            expectedAnswer: `${m * a}`,
          },
          {
            promptZh: `由 a = F_合 / m，除以质量 ${m} kg 得加速度 a = ?`,
            promptEn: `Divide net force by mass ${m} kg:`,
            promptI18n: {
              ja: `合力を質量 ${m} kg で割りなさい：`,
              ko: `알짜힘을 질량 ${m} kg으로 나누시오:`,
              ms: `Bahagikan daya paduan dengan jisim ${m} kg:`,
            },
            hintZh: `${m * a} ÷ ${m}`,
            hintEn: `${m * a} / ${m}`,
            expectedAnswer: `${a}`,
          },
        ],
        distractors: [
          { text: ignoreFricTrap, misconceptionTag: "misc_newton_ignore_friction" },
          { text: formatFrac(pull + f, m) },
          { text: `${m * a}` },
        ],
        misconceptionsByValue: { [ignoreFricTrap]: "misc_newton_ignore_friction" },
      };
      break;
    }

    // 22. Physics: Series & parallel circuit laws
    case "phy_circuits_laws": {
      const i1 = rng.pick([0.4, 0.6, 0.8, 1.2]);
      const i2 = rng.pick([0.3, 0.5, 0.7]);
      const uSource = rng.pick([3, 6, 9, 12]);
      if (dTier === "basic") {
        // Series current invariance!
        core = {
          promptZh: `如图串联电路中，电源电压为 ${uSource} V，R₁ = 10 Ω，R₂ = 20 Ω。若通过 R₁ 的电流为 ${i1} A，则流经 R₂ 的电流是多少 A？`,
          promptEn: `In the series circuit shown (R₁ = 10 Ω, R₂ = 20 Ω), if the current entering R₁ is ${i1} A, what is the current through R₂ (in A)?`,
          promptI18n: {
            ja: `図の直列回路（R₁ = 10 Ω、R₂ = 20 Ω）で、R₁ に流れこむ電流が ${i1} A のとき、R₂ を流れる電流は何 A か。`,
            ko: `그림의 직렬 회로(R₁ = 10 Ω, R₂ = 20 Ω)에서 R₁에 흘러 들어가는 전류가 ${i1} A일 때, R₂에 흐르는 전류는 몇 A인가?`,
            ms: `Dalam litar sesiri yang ditunjukkan (R₁ = 10 Ω, R₂ = 20 Ω), jika arus yang memasuki R₁ ialah ${i1} A, berapakah arus yang melalui R₂ (dalam A)?`,
          },
          svgDiagram: svgCircuit("series", "R₁=10Ω", "R₂=20Ω", `${uSource}V`),
          answer: `${i1}`,
          unit: "A",
          explanationZh: `串联电路只有一条通路，电荷不堆积不消失，处处电流相等：I₂ = I₁ = ${i1} A（电流绝不会每过一个电阻就“消耗变小”！）。`,
          explanationEn: `In a single-loop series circuit, current is identical everywhere: I₂ = I₁ = ${i1} A.`,
          explanationI18n: {
            ja: `直列回路は電流の通り道が1本だけなので、電流はどこでも等しい：I₂ = I₁ = ${i1} A（抵抗を通るたびに電流が減るわけではない）。`,
            ko: `직렬 회로는 전류가 흐르는 길이 하나뿐이므로 어느 지점에서나 전류의 세기가 같다: I₂ = I₁ = ${i1} A (저항을 지날 때마다 전류가 줄어드는 것이 아니다).`,
            ms: `Dalam litar sesiri dengan satu laluan sahaja, arus adalah sama di semua titik: I₂ = I₁ = ${i1} A.`,
          },
          scaffolds: [
            {
              promptZh: `串联电路只有唯一路径，流过 R₁ 和 R₂ 的电流大小关系是？写出 I₂ 数值：`,
              promptEn: `In a series loop, I₂ equals I₁. Enter I₂:`,
              promptI18n: {
                ja: `直列回路では I₂ は I₁ に等しい。I₂ の値を入力しなさい：`,
                ko: `직렬 회로에서 I₂는 I₁과 같다. I₂의 값을 입력하시오:`,
                ms: `Dalam litar sesiri, I₂ sama dengan I₁. Masukkan nilai I₂:`,
              },
              hintZh: `串联处处电流相等`,
              hintEn: `Same current everywhere`,
              hintI18n: {
                ja: `直列回路では電流はどこでも等しい`,
                ko: `직렬 회로에서는 어디서나 전류가 같다`,
                ms: `Arus sama di semua titik`,
              },
              expectedAnswer: `${i1}`,
            },
          ],
          distractors: [
            { text: `${Math.round(i1 * 50) / 100}`, misconceptionTag: "misc_series_current_drop" },
            { text: `0`, misconceptionTag: "misc_series_current_drop" },
            { text: `${2 * i1}` },
          ],
          misconceptionsByValue: { [`${Math.round(i1 * 50) / 100}`]: "misc_series_current_drop" },
        };
      } else {
        const iTotal = Math.round((i1 + i2) * 10) / 10;
        core = {
          promptZh: `在并联电路中，干路总电流 I = ${iTotal} A，通过支路 R₁ 的电流 I₁ = ${i1} A，求通过另一支路 R₂ 的电流 I₂（单位 A）：`,
          promptEn: `In a parallel circuit, main-branch current is I = ${iTotal} A and branch R₁ carries I₁ = ${i1} A. Find branch current I₂ (in A):`,
          promptI18n: {
            ja: `並列回路で、枝分かれする前の電流が I = ${iTotal} A、R₁ を流れる電流が I₁ = ${i1} A である。もう一方の R₂ を流れる電流 I₂ [A] を求めなさい。`,
            ko: `병렬 회로에서 갈라지기 전 전체 전류가 I = ${iTotal} A이고, R₁에 흐르는 전류가 I₁ = ${i1} A이다. R₂에 흐르는 전류 I₂(단위: A)를 구하시오.`,
            ms: `Dalam litar selari, arus utama ialah I = ${iTotal} A dan cabang R₁ membawa arus I₁ = ${i1} A. Cari arus cabang I₂ (dalam A):`,
          },
          svgDiagram: svgCircuit("parallel", `I₁=${i1}A`, `I₂=?`, `${uSource}V`),
          answer: `${i2}`,
          unit: "A",
          explanationZh: `并联干路电流等于各支路电流之和 I = I₁ + I₂，故 I₂ = ${iTotal} - ${i1} = ${i2} A。`,
          explanationEn: `By parallel junction law I = I₁ + I₂, so I₂ = ${iTotal} - ${i1} = ${i2} A.`,
          explanationI18n: {
            ja: `並列回路では全体の電流は各枝の電流の和 I = I₁ + I₂ となるので、I₂ = ${iTotal} - ${i1} = ${i2} A。`,
            ko: `병렬 회로에서 전체 전류는 각 갈래 전류의 합 I = I₁ + I₂이므로 I₂ = ${iTotal} - ${i1} = ${i2} A이다.`,
            ms: `Mengikut hukum simpang litar selari I = I₁ + I₂, maka I₂ = ${iTotal} - ${i1} = ${i2} A.`,
          },
          scaffolds: [
            {
              promptZh: `根据并联分流 I = I₁ + I₂，计算 ${iTotal} - ${i1} = ?`,
              promptEn: `Subtract I₁ from total current I (${iTotal} - ${i1}):`,
              promptI18n: {
                ja: `全体の電流 I から I₁ を引きなさい（${iTotal} - ${i1}）：`,
                ko: `전체 전류 I에서 I₁을 빼시오 (${iTotal} - ${i1}):`,
                ms: `Tolak I₁ daripada jumlah arus I (${iTotal} - ${i1}):`,
              },
              hintZh: `干路减支路`,
              hintEn: `I - I₁`,
              expectedAnswer: `${i2}`,
            },
          ],
          distractors: [
            { text: `${iTotal}`, misconceptionTag: "misc_series_current_drop" },
            { text: `${Math.round((iTotal + i1) * 10) / 10}` },
            { text: `${i1}` },
          ],
          misconceptionsByValue: { [`${iTotal}`]: "misc_series_current_drop" },
        };
      }
      break;
    }

    // 23. Physics: Ohm's law & parallel equivalent resistance (Cross-subject link to Rational Equations!)
    case "phy_ohm_law": {
      const pairs = [
        [3, 6, 2],
        [4, 12, 3],
        [6, 12, 4],
        [10, 15, 6],
        [20, 30, 12],
      ] as const;
      const [r1, r2, rEq] = rng.pick(pairs);
      const u = rEq * rng.int(2, 4);
      const iTotal = u / rEq;
      if (dTier === "challenge") {
        core = {
          promptZh: `如图所示，电阻 R₁ = ${r1} Ω 与 R₂ = ${r2} Ω 并联在 U = ${u} V 的恒压电源两端。求干路总电流 I 是多少 A？`,
          promptEn: `Resistors R₁ = ${r1} Ω and R₂ = ${r2} Ω are connected in parallel across a ${u} V source. Find the total main-branch current I (in A):`,
          promptI18n: {
            ja: `図のように、抵抗 R₁ = ${r1} Ω と R₂ = ${r2} Ω を並列につなぎ、${u} V の電源に接続した。回路全体を流れる電流 I [A] を求めなさい。`,
            ko: `그림과 같이 저항 R₁ = ${r1} Ω과 R₂ = ${r2} Ω을 병렬로 연결하여 ${u} V 전원에 연결하였다. 전체 전류 I(단위: A)를 구하시오.`,
            ms: `Perintang R₁ = ${r1} Ω dan R₂ = ${r2} Ω disambungkan secara selari merentasi bekalan kuasa ${u} V. Cari jumlah arus utama I (dalam A):`,
          },
          svgDiagram: svgCircuit("parallel", `R₁=${r1}Ω`, `R₂=${r2}Ω`, `${u}V`),
          answer: `${iTotal}`,
          unit: "A",
          explanationZh: `由 1/R = 1/${r1} + 1/${r2} = 1/${rEq} 得并联总电阻 R = ${rEq} Ω；干路电流 I = U / R = ${u} / ${rEq} = ${iTotal} A（若把并联电阻错加成 ${r1 + r2} Ω 会严重算错！）。`,
          explanationEn: `Equivalent parallel resistance R = (${r1}×${r2})/(${r1}+${r2}) = ${rEq} Ω; total current I = ${u}/${rEq} = ${iTotal} A.`,
          explanationI18n: {
            ja: `並列の合成抵抗は R = (${r1}×${r2})/(${r1}+${r2}) = ${rEq} Ω。オームの法則より全体の電流 I = ${u}/${rEq} = ${iTotal} A となる（抵抗を ${r1 + r2} Ω と単純にたしてはいけない）。`,
            ko: `병렬 합성저항은 R = (${r1}×${r2})/(${r1}+${r2}) = ${rEq} Ω이고, 옴의 법칙에 의해 전체 전류 I = ${u}/${rEq} = ${iTotal} A이다 (저항을 단순히 더해 ${r1 + r2} Ω으로 계산하면 안 된다).`,
            ms: `Rintangan setara selari R = (${r1}×${r2})/(${r1}+${r2}) = ${rEq} Ω; jumlah arus I = ${u}/${rEq} = ${iTotal} A.`,
          },
          scaffolds: [
            {
              promptZh: `先用 1/R = 1/${r1} + 1/${r2} 求出并联等效总电阻 R（Ω）：`,
              promptEn: `First find parallel equivalent resistance R (Ω):`,
              promptI18n: {
                ja: `まず並列の合成抵抗 R [Ω] を求めなさい：`,
                ko: `먼저 병렬 합성저항 R(Ω)을 구하시오:`,
                ms: `Mula-mula, cari rintangan setara selari R (Ω):`,
              },
              hintZh: `R = (${r1}×${r2}) ÷ (${r1}+${r2})`,
              hintEn: `Product over sum`,
              hintI18n: {
                ja: `和分の積（積 ÷ 和）`,
                ko: `두 저항의 곱 ÷ 합`,
                ms: `Hasil darab ÷ hasil tambah`,
              },
              expectedAnswer: `${rEq}`,
            },
            {
              promptZh: `再用欧姆定律 I = U / R = ${u} ÷ ${rEq} 求总电流（A）：`,
              promptEn: `Now compute I = ${u} / ${rEq} (in A):`,
              promptI18n: {
                ja: `次に I = ${u} / ${rEq} を計算しなさい（単位 A）：`,
                ko: `이제 I = ${u} / ${rEq}의 값을 계산하시오 (단위: A):`,
                ms: `Sekarang hitung I = ${u} / ${rEq} (dalam A):`,
              },
              hintZh: `U ÷ R`,
              hintEn: `U / R`,
              expectedAnswer: `${iTotal}`,
            },
          ],
          distractors: [
            { text: formatFrac(u, r1 + r2), misconceptionTag: "misc_ohm_parallel_add" },
            { text: `${rEq}` },
            { text: `${r1 + r2}`, misconceptionTag: "misc_ohm_parallel_add" },
          ],
          misconceptionsByValue: { [formatFrac(u, r1 + r2)]: "misc_ohm_parallel_add" },
        };
      } else {
        core = {
          promptZh: `如图将电阻 R₁ = ${r1} Ω 与 R₂ = ${r2} Ω 并联接入电路，求它们的并联等效总电阻 R（单位 Ω）：`,
          promptEn: `Two resistors R₁ = ${r1} Ω and R₂ = ${r2} Ω are connected in parallel. Find their equivalent resistance R (in Ω):`,
          promptI18n: {
            ja: `図のように、2つの抵抗 R₁ = ${r1} Ω と R₂ = ${r2} Ω を並列につないだ。合成抵抗 R [Ω] を求めなさい。`,
            ko: `그림과 같이 두 저항 R₁ = ${r1} Ω과 R₂ = ${r2} Ω을 병렬로 연결하였다. 합성저항 R(단위: Ω)을 구하시오.`,
            ms: `Dua perintang R₁ = ${r1} Ω dan R₂ = ${r2} Ω disambungkan secara selari. Cari rintangan setaranya R (dalam Ω):`,
          },
          latexFormula: `\\frac{1}{R_{\\text{eq}}} = \\frac{1}{R_1} + \\frac{1}{R_2} = \\frac{1}{${r1}} + \\frac{1}{${r2}}`,
          svgDiagram: svgCircuit("parallel", `R₁=${r1}Ω`, `R₂=${r2}Ω`, `U`),
          interactiveWidget: {
            kind: "ohm_parallel_lab",
            min: 2,
            max: 36,
            step: 1,
            initialValue: r2,
            fixedParamA: r1,
            captionZh: `固定支路 R₁=${r1}Ω，调节滑动变阻器 R₂ 至 ${r2}Ω 观测并联等效电阻`,
            captionEn: `Adjust R₂ to ${r2}Ω alongside R₁=${r1}Ω`,
            captionI18n: {
              ja: `R₁=${r1}Ω を固定し、可変抵抗 R₂ を ${r2}Ω に調整して合成抵抗を観察しよう`,
              ko: `R₁=${r1}Ω을 고정하고 가변 저항 R₂를 ${r2}Ω으로 조정하여 합성저항을 관찰해 보자`,
              ms: `Laraskan R₂ kepada ${r2}Ω bersama R₁=${r1}Ω dan perhatikan rintangan setara`,
            },
            bindToAnswer: false,
          },
          answer: `${rEq}`,
          unit: "Ω",
          explanationZh: `1/R = 1/${r1} + 1/${r2} = 1/${rEq}，取倒数得 R = ${rEq} Ω（并联越并越宽、总电阻必小于最小支路 ${r1} Ω，绝不是相加得 ${r1 + r2} Ω！）。`,
          explanationEn: `1/R = 1/${r1} + 1/${r2} = 1/${rEq} ⇒ R = ${rEq} Ω.`,
          explanationI18n: {
            ja: `1/R = 1/${r1} + 1/${r2} = 1/${rEq} より、逆数をとって R = ${rEq} Ω（並列の合成抵抗は最も小さい抵抗 ${r1} Ω より小さくなり、和の ${r1 + r2} Ω にはならない）。`,
            ko: `1/R = 1/${r1} + 1/${r2} = 1/${rEq}이므로 역수를 취하면 R = ${rEq} Ω이다 (병렬 합성저항은 가장 작은 저항 ${r1} Ω보다 작으며, 두 저항의 합 ${r1 + r2} Ω이 아니다).`,
            ms: `1/R = 1/${r1} + 1/${r2} = 1/${rEq} ⇒ R = ${rEq} Ω (rintangan setara selari sentiasa lebih kecil daripada rintangan terkecil ${r1} Ω).`,
          },
          scaffolds: [
            {
              promptZh: `计算 1/${r1} + 1/${r2} 化简后的分数是？`,
              promptEn: `Simplify 1/${r1} + 1/${r2}:`,
              promptI18n: {
                ja: `1/${r1} + 1/${r2} を計算して約分しなさい：`,
                ko: `1/${r1} + 1/${r2}의 값을 계산하여 약분하시오:`,
                ms: `Permudahkan 1/${r1} + 1/${r2}:`,
              },
              hintZh: `通分相加`,
              hintEn: `Add fractions`,
              hintI18n: { ja: `通分してたす`, ko: `통분하여 더한다`, ms: `Tambah pecahan` },
              expectedAnswer: `1/${rEq}`,
            },
            {
              promptZh: `对 1/R = 1/${rEq} 两边取倒数，等效电阻 R = ?`,
              promptEn: `Invert to obtain R (in Ω):`,
              promptI18n: {
                ja: `逆数をとって R [Ω] を求めなさい：`,
                ko: `역수를 취하여 R(단위: Ω)을 구하시오:`,
                ms: `Ambil salingan untuk mendapatkan R (dalam Ω):`,
              },
              hintZh: `取倒数`,
              hintEn: `Reciprocal`,
              hintI18n: { ja: `逆数をとる`, ko: `역수를 취한다`, ms: `Salingan` },
              expectedAnswer: `${rEq}`,
            },
          ],
          distractors: [
            { text: `${r1 + r2}`, misconceptionTag: "misc_ohm_parallel_add" },
            { text: `1/${rEq}`, misconceptionTag: "misc_ohm_parallel_add" },
            { text: `${r2 - r1}` },
          ],
          misconceptionsByValue: {
            [`${r1 + r2}`]: "misc_ohm_parallel_add",
            [`1/${rEq}`]: "misc_ohm_parallel_add",
          },
        };
      }
      break;
    }

    // 24. Physics: Work & Kinetic Energy E_k = 1/2 m v^2
    case "phy_work_energy": {
      const m = rng.pick([2, 4, 6]);
      const v = rng.int(3, 8);
      const ek = 0.5 * m * v * v;
      const linearTrap = 0.5 * m * v;
      core = {
        promptZh: `一个质量 m = ${m} kg 的滑块在光滑水平面上以速度 v = ${v} m/s 运动，它的动能 E_k 是多少焦耳（J）？`,
        promptEn: `A ${m} kg glider moves at speed v = ${v} m/s. Find its kinetic energy E_k in joules (J):`,
        promptI18n: {
          ja: `質量 ${m} kg の物体が、なめらかな水平面上を速さ v = ${v} m/s で運動している。この物体の運動エネルギー E_k は何ジュール (J) か。`,
          ko: `질량 ${m} kg인 물체가 마찰이 없는 수평면에서 속력 v = ${v} m/s로 운동하고 있다. 이 물체의 운동 에너지 E_k는 몇 줄(J)인가?`,
          ms: `Sebuah peluncur ${m} kg bergerak pada laju v = ${v} m/s. Cari tenaga kinetiknya E_k dalam joule (J):`,
        },
        answer: `${ek}`,
        unit: "J",
        explanationZh: `由动能公式 E_k = ½mv² = 0.5 × ${m} × ${v}² = ${ek} J（注意速度项必须平方，漏平方会错算成 ${linearTrap} J）。`,
        explanationEn: `E_k = ½mv² = 0.5 × ${m} × ${v}² = ${ek} J.`,
        explanationI18n: {
          ja: `運動エネルギーの式より E_k = ½mv² = 0.5 × ${m} × ${v}² = ${ek} J（速さを2乗し忘れると ${linearTrap} J と誤ってしまう）。`,
          ko: `운동 에너지 공식에 의해 E_k = ½mv² = 0.5 × ${m} × ${v}² = ${ek} J이다 (속력을 제곱하지 않으면 ${linearTrap} J로 잘못 계산하게 된다).`,
          ms: `Menggunakan rumus tenaga kinetik, E_k = ½mv² = 0.5 × ${m} × ${v}² = ${ek} J.`,
        },
        scaffolds: [
          {
            promptZh: `先算速度的平方 v² = ${v}² = ?`,
            promptEn: `First compute v² = ${v}²:`,
            promptI18n: {
              ja: `まず v² = ${v}² を計算しなさい：`,
              ko: `먼저 v² = ${v}²의 값을 구하시오:`,
              ms: `Mula-mula, hitung v² = ${v}²:`,
            },
            hintZh: `${v} × ${v}`,
            hintEn: `${v} × ${v}`,
            expectedAnswer: `${v * v}`,
          },
          {
            promptZh: `代入 ½ × ${m} × ${v * v}，动能 E_k = ?`,
            promptEn: `Multiply ½ × ${m} × ${v * v}:`,
            promptI18n: {
              ja: `½ × ${m} × ${v * v} を計算しなさい：`,
              ko: `½ × ${m} × ${v * v}의 값을 구하시오:`,
              ms: `Darabkan ½ × ${m} × ${v * v}:`,
            },
            hintZh: `单位 J`,
            hintEn: `In joules`,
            hintI18n: { ja: `単位はジュール (J)`, ko: `단위는 줄(J)`, ms: `Dalam joule` },
            expectedAnswer: `${ek}`,
          },
        ],
        distractors: [
          { text: `${linearTrap}`, misconceptionTag: "misc_ke_linear_v" },
          { text: `${m * v * v}` },
          { text: `${m * v}` },
        ],
        misconceptionsByValue: { [`${linearTrap}`]: "misc_ke_linear_v" },
      };
      break;
    }

    // 25. Chemistry: Stoichiometry & Conservation of Mass
    case "chem_balance_mass": {
      // 2H2 + O2 -> 2H2O (mass ratio 4 : 32 : 36 = 1 : 8 : 9)
      const k = rng.int(2, 9);
      const h2Mass = 1 * k;
      const o2Mass = 8 * k;
      const h2oMass = 9 * k;
      core = {
        promptZh: `根据质量守恒定律与化学方程式 2H₂ + O₂ = 2H₂O（质量比 1 : 8 : 9），${h2Mass} g 氢气与 ${o2Mass} g 氧气恰好完全反应，生成水的质量是多少 g？`,
        promptEn: `By conservation of mass in 2H₂ + O₂ → 2H₂O (mass ratio 1 : 8 : 9), if ${h2Mass} g of H₂ reacts completely with ${o2Mass} g of O₂, how many grams of H₂O are produced?`,
        promptI18n: {
          ja: `質量保存の法則と化学反応式 2H₂ + O₂ → 2H₂O（質量比 1 : 8 : 9）より、${h2Mass} g の水素 H₂ と ${o2Mass} g の酸素 O₂ が過不足なく反応したとき、生成する水 H₂O は何 g か。`,
          ko: `질량 보존 법칙과 화학 반응식 2H₂ + O₂ → 2H₂O(질량비 1 : 8 : 9)에 따라, 수소 H₂ ${h2Mass} g과 산소 O₂ ${o2Mass} g이 모두 반응할 때 생성되는 물 H₂O는 몇 g인가?`,
          ms: `Mengikut hukum keabadian jisim dalam 2H₂ + O₂ → 2H₂O (nisbah jisim 1 : 8 : 9), jika ${h2Mass} g H₂ bertindak balas lengkap dengan ${o2Mass} g O₂, berapakah jisim H₂O (dalam g) yang terhasil?`,
        },
        answer: `${h2oMass}`,
        unit: "g",
        explanationZh: `恰好完全反应时，参加反应的各物质质量总和等于生成物质量总和：${h2Mass} g + ${o2Mass} g = ${h2oMass} g。`,
        explanationEn: `By conservation of mass when reactants are in exact stoichiometric ratio: ${h2Mass} + ${o2Mass} = ${h2oMass} g.`,
        explanationI18n: {
          ja: `過不足なく反応するとき、反応した物質の質量の和は生成した物質の質量の和に等しい（質量保存の法則）：${h2Mass} g + ${o2Mass} g = ${h2oMass} g。`,
          ko: `반응물이 남김없이 모두 반응하면 반응한 물질의 질량 합은 생성된 물질의 질량 합과 같다(질량 보존 법칙): ${h2Mass} g + ${o2Mass} g = ${h2oMass} g.`,
          ms: `Mengikut hukum keabadian jisim apabila bahan tindak balas berada dalam nisbah stoikiometri yang tepat: ${h2Mass} + ${o2Mass} = ${h2oMass} g.`,
        },
        scaffolds: [
          {
            promptZh: `参加反应的 H₂ 与 O₂ 总质量 ${h2Mass} + ${o2Mass} 是多少 g？`,
            promptEn: `Sum the exact reacting masses ${h2Mass} + ${o2Mass}:`,
            promptI18n: {
              ja: `反応した H₂ と O₂ の質量の和 ${h2Mass} + ${o2Mass} を求めなさい：`,
              ko: `반응한 H₂와 O₂의 질량 합 ${h2Mass} + ${o2Mass}의 값을 구하시오:`,
              ms: `Jumlahkan jisim yang bertindak balas ${h2Mass} + ${o2Mass}:`,
            },
            hintZh: `质量守恒定律`,
            hintEn: `Mass is conserved`,
            hintI18n: { ja: `質量保存の法則`, ko: `질량 보존 법칙`, ms: `Hukum keabadian jisim` },
            expectedAnswer: `${h2oMass}`,
          },
        ],
        distractors: [
          { text: `${o2Mass - h2Mass}`, misconceptionTag: "misc_chem_alter_subscript" },
          { text: `${2 * h2oMass}`, misconceptionTag: "misc_chem_alter_subscript" },
          { text: `${o2Mass}` },
        ],
        misconceptionsByValue: { [`${2 * h2oMass}`]: "misc_chem_alter_subscript" },
      };
      break;
    }

    // 26. Biology: Mendelian Punnett square probability
    case "bio_punnett": {
      const mode = rng.pick(["hetero_hetero_rec", "hetero_hetero_dom", "test_cross"] as const);
      if (mode === "test_cross") {
        core = {
          promptZh: `在孟德尔豌豆杂交实验中，高茎杂合子（Aa）与矮茎隐性纯合子（aa）测交，子代出现矮茎（aa）的概率是多少（填百分数如 50%）？`,
          promptEn: `In a Mendelian test cross Aa × aa, what percentage of offspring are expected to be homozygous recessive (aa)?`,
          promptI18n: {
            ja: `メンデルの検定交雑 Aa × aa において、子のうち潜性ホモ接合体（aa）となるものは何 % と予想されるか。`,
            ko: `멘델의 검정 교배 Aa × aa에서 자손 중 열성 동형 접합자(aa)는 몇 %로 예상되는가?`,
            ms: `Dalam kacukan uji Mendel Aa × aa, berapakah peratusan anak yang dijangka homozigot resesif (aa)?`,
          },
          answer: `50%`,
          acceptedEquivalents: ["1/2", "0.5", "50"],
          explanationZh: `Aa 产生 A、a 配子各占 1/2，aa 只产生 a 配子，子代基因型 Aa : aa = 1 : 1，故 aa 占 50%（每次受精独立同分布）。`,
          explanationEn: `Punnett square for Aa × aa yields 50% Aa and 50% aa.`,
          explanationI18n: {
            ja: `Aa は A と a の配偶子を 1/2 ずつつくり、aa は a の配偶子だけをつくる。パネットの方形より、子は Aa が 50%、aa が 50% となる。`,
            ko: `Aa는 A와 a 생식세포를 각각 1/2씩 만들고, aa는 a 생식세포만 만든다. 퍼넷 사각형에 따르면 자손은 Aa 50%, aa 50%이다.`,
            ms: `Segi empat Punnett bagi Aa × aa menghasilkan 50% Aa dan 50% aa.`,
          },
          scaffolds: [
            {
              promptZh: `亲本 Aa 产生隐性配子 a 的概率是几分之几？`,
              promptEn: `Probability that parent Aa contributes allele 'a':`,
              promptI18n: {
                ja: `親 Aa が対立遺伝子 a をもつ配偶子をつくる確率は？`,
                ko: `어버이 Aa가 대립유전자 a를 물려줄 확률은?`,
                ms: `Kebarangkalian induk Aa menyumbang alel 'a':`,
              },
              hintZh: `一半配子为 a`,
              hintEn: `1/2`,
              expectedAnswer: `1/2`,
            },
            {
              promptZh: `与 aa 提供的 a（概率 1）结合，aa 占比化成百分数是？`,
              promptEn: `Express 1/2 as a percentage:`,
              promptI18n: {
                ja: `1/2 を百分率で表しなさい：`,
                ko: `1/2을 백분율로 나타내시오:`,
                ms: `Nyatakan 1/2 dalam bentuk peratusan:`,
              },
              hintZh: `50%`,
              hintEn: `50%`,
              expectedAnswer: `50%`,
            },
          ],
          distractors: [
            { text: `25%`, misconceptionTag: "misc_bio_gambler_fallacy" },
            { text: `75%` },
            { text: `0%`, misconceptionTag: "misc_bio_gambler_fallacy" },
          ],
          misconceptionsByValue: { "25%": "misc_bio_gambler_fallacy", "0%": "misc_bio_gambler_fallacy" },
        };
      } else if (mode === "hetero_hetero_dom") {
        core = {
          promptZh: `两株杂合高茎豌豆（Aa × Aa）自交，子代展现显性高茎性状（AA 或 Aa）的概率是多少（填百分数如 75%）？`,
          promptEn: `In a monohybrid cross Aa × Aa, what percentage of offspring display the dominant phenotype (AA or Aa)?`,
          promptI18n: {
            ja: `一遺伝子雑種の交配 Aa × Aa で、子のうち顕性の表現型（AA または Aa）を示すものは何 % か。`,
            ko: `단성 잡종 교배 Aa × Aa에서 자손 중 우성 표현형(AA 또는 Aa)을 나타내는 비율은 몇 %인가?`,
            ms: `Dalam kacukan monohibrid Aa × Aa, berapakah peratusan anak yang menunjukkan fenotip dominan (AA atau Aa)?`,
          },
          answer: `75%`,
          acceptedEquivalents: ["3/4", "0.75", "75"],
          explanationZh: `Aa × Aa 庞氏表四格为 1 AA : 2 Aa : 1 aa，显性性状（AA + Aa）占 3/4 = 75%。`,
          explanationEn: `Punnett square gives 1 AA : 2 Aa : 1 aa, so 3/4 = 75% show the dominant trait.`,
          explanationI18n: {
            ja: `パネットの方形より 1 AA : 2 Aa : 1 aa となるので、顕性形質を示すのは 3/4 = 75% である。`,
            ko: `퍼넷 사각형에서 1 AA : 2 Aa : 1 aa이므로 우성 형질을 나타내는 비율은 3/4 = 75%이다.`,
            ms: `Segi empat Punnett memberikan 1 AA : 2 Aa : 1 aa, maka 3/4 = 75% menunjukkan ciri dominan.`,
          },
          scaffolds: [
            {
              promptZh: `2×2 庞氏表共 4 种等可能组合，其中含至少一个 A 的有几格？`,
              promptEn: `Out of 4 Punnett cells (AA, Aa, aA, aa), how many carry at least one A?`,
              promptI18n: {
                ja: `パネットの方形の4マス（AA, Aa, aA, aa）のうち、A を少なくとも1つ含むのは何マスか。`,
                ko: `퍼넷 사각형의 4칸(AA, Aa, aA, aa) 중 A를 적어도 하나 가진 칸은 몇 개인가?`,
                ms: `Daripada 4 petak Punnett (AA, Aa, aA, aa), berapakah petak yang mengandungi sekurang-kurangnya satu A?`,
              },
              hintZh: `AA, Aa, aA`,
              hintEn: `Count cells with A`,
              hintI18n: { ja: `A を含むマスを数える`, ko: `A가 들어 있는 칸을 센다`, ms: `Kira petak yang mengandungi A` },
              expectedAnswer: `3`,
            },
            {
              promptZh: `3/4 写成百分数是多少？`,
              promptEn: `Convert 3/4 to a percentage:`,
              promptI18n: {
                ja: `3/4 を百分率で表しなさい：`,
                ko: `3/4을 백분율로 나타내시오:`,
                ms: `Tukarkan 3/4 kepada peratusan:`,
              },
              hintZh: `75%`,
              hintEn: `75%`,
              expectedAnswer: `75%`,
            },
          ],
          distractors: [
            { text: `50%`, misconceptionTag: "misc_bio_gambler_fallacy" },
            { text: `25%` },
            { text: `100%` },
          ],
          misconceptionsByValue: { "50%": "misc_bio_gambler_fallacy" },
        };
      } else {
        core = {
          promptZh: `已知白化病为常染色体隐性遗传（aa）。一对表现正常的携带者夫妇（Aa × Aa）已生育一个白化病孩子，他们再生第二个孩子患白化病（aa）的概率是多少（填百分数）？`,
          promptEn: `Two carrier parents (Aa × Aa) already had one affected child (aa). What is the probability that their NEXT child will have genotype aa?`,
          promptI18n: {
            ja: `保因者どうしの両親（Aa × Aa）には、すでに発症した子（aa）が1人いる。次に生まれる子の遺伝子型が aa となる確率はいくらか。`,
            ko: `보인자인 부모(Aa × Aa) 사이에서 이미 형질이 발현된 자녀(aa)가 한 명 태어났다. 다음 자녀의 유전자형이 aa일 확률은 얼마인가?`,
            ms: `Dua ibu bapa pembawa (Aa × Aa) sudah mempunyai seorang anak yang terjejas (aa). Apakah kebarangkalian anak SETERUSNYA mempunyai genotip aa?`,
          },
          answer: `25%`,
          acceptedEquivalents: ["1/4", "0.25", "25"],
          explanationZh: `每次独立生殖事件互不影响（克服赌徒谬误）！Aa × Aa 产生 aa 的概率恒为 1/2 × 1/2 = 1/4 = 25%，绝不是“已经有1个患病所以接下来3个必正常（0%）”！`,
          explanationEn: `Each birth is an independent event! Aa × Aa always has a 1/4 = 25% chance of aa.`,
          explanationI18n: {
            ja: `出産はそれぞれ独立な事象である！ Aa × Aa から aa が生まれる確率は毎回 1/2 × 1/2 = 1/4 = 25% で変わらない（ギャンブラーの誤謬に注意）。`,
            ko: `각각의 출산은 서로 독립적인 사건이다! Aa × Aa에서 aa가 나올 확률은 매번 1/2 × 1/2 = 1/4 = 25%로 변하지 않는다 (도박사의 오류에 주의).`,
            ms: `Setiap kelahiran ialah peristiwa tak bersandar! Aa × Aa sentiasa mempunyai peluang 1/4 = 25% untuk menghasilkan aa.`,
          },
          scaffolds: [
            {
              promptZh: `二胎基因组合受头胎结果影响吗？直接算 Aa × Aa 得到 aa 的概率分数：`,
              promptEn: `Since births are independent, what fraction of Aa × Aa is aa?`,
              promptI18n: {
                ja: `出産は独立なので、Aa × Aa の子のうち aa となる割合を分数で答えなさい：`,
                ko: `출산은 서로 독립적이므로, Aa × Aa의 자손 중 aa의 비율을 분수로 나타내시오:`,
                ms: `Oleh sebab kelahiran adalah tak bersandar, berapakah pecahan aa bagi Aa × Aa?`,
              },
              hintZh: `1/2 × 1/2`,
              hintEn: `1/2 × 1/2`,
              expectedAnswer: `1/4`,
            },
            {
              promptZh: `1/4 对应百分数是多少？`,
              promptEn: `Write 1/4 as a percentage:`,
              promptI18n: {
                ja: `1/4 を百分率で表しなさい：`,
                ko: `1/4을 백분율로 나타내시오:`,
                ms: `Tulis 1/4 sebagai peratusan:`,
              },
              hintZh: `25%`,
              hintEn: `25%`,
              expectedAnswer: `25%`,
            },
          ],
          distractors: [
            { text: `0%`, misconceptionTag: "misc_bio_gambler_fallacy" },
            { text: `50%` },
            { text: `75%` },
          ],
          misconceptionsByValue: { "0%": "misc_bio_gambler_fallacy", "0": "misc_bio_gambler_fallacy" },
        };
      }
      break;
    }

    // 27. English: Relative clauses (choice item)
    case "eng_relative_clause": {
      const scenarios = [
        {
          noun: "science museum",
          verbPhrase: "we visited last Friday",
          roleZh: "及物动词 visited 缺宾语",
          roleJa: "他動詞 visited の目的語が欠けている",
          roleKo: "타동사 visited의 목적어가 빠져 있다",
          roleMs: "kata kerja transitif visited tidak mempunyai objek",
          ans: "which",
          trap: "where",
        },
        {
          noun: "ancient city",
          verbPhrase: "the archaeologists discovered in 1986",
          roleZh: "及物动词 discovered 缺宾语",
          roleJa: "他動詞 discovered の目的語が欠けている",
          roleKo: "타동사 discovered의 목적어가 빠져 있다",
          roleMs: "kata kerja transitif discovered tidak mempunyai objek",
          ans: "which",
          trap: "where",
        },
        {
          noun: "community library",
          verbPhrase: "our school built two years ago",
          roleZh: "及物动词 built 缺宾语",
          roleJa: "他動詞 built の目的語が欠けている",
          roleKo: "타동사 built의 목적어가 빠져 있다",
          roleMs: "kata kerja transitif built tidak mempunyai objek",
          ans: "which",
          trap: "where",
        },
      ] as const;
      const sc = rng.pick(scenarios);
      core = {
        promptZh: `【定语从句句法诊断】选择正确的关系词填空：\n"The ${sc.noun} ______ ${sc.verbPhrase} has an interactive robotics lab."`,
        promptEn: `Choose the correct relative word to complete the sentence:\n"The ${sc.noun} ______ ${sc.verbPhrase} has an interactive robotics lab."`,
        promptI18n: {
          ja: `正しい関係詞を選んで空所を補い、文を完成させなさい：\n"The ${sc.noun} ______ ${sc.verbPhrase} has an interactive robotics lab."`,
          ko: `알맞은 관계사를 골라 빈칸을 채워 문장을 완성하시오:\n"The ${sc.noun} ______ ${sc.verbPhrase} has an interactive robotics lab."`,
          ms: `Pilih kata relatif yang betul untuk melengkapkan ayat:\n"The ${sc.noun} ______ ${sc.verbPhrase} has an interactive robotics lab."`,
        },
        answer: sc.ans,
        answerEn: sc.ans,
        explanationZh: `虽然先行词 "${sc.noun}" 表示地点，但将它代入从句后发现 "${sc.verbPhrase}" 中${sc.roleZh}（visit/discover/build sth.），关系词充当宾语，故必须用 which/that 而不能用关系副词 where！`,
        explanationEn: `Even though "${sc.noun}" is a place noun, it functions as the direct OBJECT of the transitive verb inside "${sc.verbPhrase}", requiring the relative pronoun "which" rather than "where".`,
        explanationI18n: {
          ja: `先行詞 "${sc.noun}" は場所を表す名詞だが、関係詞節 "${sc.verbPhrase}" に戻してみると${sc.roleJa}ことがわかる（visit/discover/build sth.）。関係詞は目的語のはたらきをするので、関係副詞 "where" ではなく関係代名詞 "which"（または that）を使う。`,
          ko: `선행사 "${sc.noun}" 자체는 장소를 나타내는 명사이지만, 관계절 "${sc.verbPhrase}"에 넣어 보면 ${sc.roleKo}는 것을 알 수 있다(visit/discover/build sth.). 관계사가 목적어 역할을 하므로 관계부사 "where"가 아니라 관계대명사 "which"(또는 that)를 써야 한다.`,
          ms: `Walaupun "${sc.noun}" ialah kata nama tempat, apabila dimasukkan semula ke dalam klausa "${sc.verbPhrase}", didapati ${sc.roleMs} (visit/discover/build sth.). Kata relatif itu berfungsi sebagai OBJEK, maka kata ganti nama relatif "which" mesti digunakan, bukan "where".`,
        },
        scaffolds: [
          {
            promptZh: `把先行词放回从句末尾："${sc.verbPhrase} [the ${sc.noun}]"，需要加介词 in/at 吗？（不需要说明缺宾语，应选关系代词 which）`,
            promptEn: `Does "${sc.verbPhrase}" need a preposition before "${sc.noun}"? No — it needs a direct object pronoun ("which").`,
            promptI18n: {
              ja: `先行詞を関係詞節の後ろに戻すと "${sc.verbPhrase} [the ${sc.noun}]" となる。前置詞 in/at は必要か？ — 不要。目的語となる関係代名詞（"which"）が必要である。`,
              ko: `선행사를 관계절 뒤에 다시 넣으면 "${sc.verbPhrase} [the ${sc.noun}]"이 된다. 전치사 in/at이 필요한가? 아니다 — 목적어 역할을 하는 관계대명사("which")가 필요하다.`,
              ms: `Adakah "${sc.verbPhrase}" memerlukan kata sendi nama sebelum "${sc.noun}"? Tidak — ia memerlukan kata ganti nama relatif sebagai objek langsung ("which").`,
            },
            hintZh: `缺宾语选 which`,
            hintEn: `Direct object -> which`,
            hintI18n: {
              ja: `目的語が欠けている → which`,
              ko: `목적어가 빠져 있음 → which`,
              ms: `Objek langsung -> which`,
            },
            expectedAnswer: sc.ans,
          },
        ],
        distractors: [
          { text: sc.trap, textEn: sc.trap, misconceptionTag: "misc_eng_place_always_where" },
          { text: "who", textEn: "who" },
          { text: "when", textEn: "when" },
        ],
      };
      break;
    }

    // 28. Computing: Binary place-value & Boolean logic
    case "cs_binary": {
      const dec = rng.int(9, 29);
      const bin = dec.toString(2);
      // Trap: starting powers of 2 at 2^1 instead of 2^0 => 2 * dec!
      const shiftTrap = dec * 2;
      core = {
        promptZh: `将无符号二进制数 (${bin})₂ 转换为十进制整数：`,
        promptEn: `Convert the unsigned binary number (${bin})₂ to base-10 decimal:`,
        promptI18n: {
          ja: `符号なしの二進数 (${bin})₂ を十進数に変換しなさい：`,
          ko: `부호 없는 이진수 (${bin})₂를 십진수로 변환하시오:`,
          ms: `Tukarkan nombor perduaan tanpa tanda (${bin})₂ kepada nombor perpuluhan (asas 10):`,
        },
        answer: `${dec}`,
        explanationZh: `从最右位（最低位 2⁰ = 1）向左按权展开相加，(${bin})₂ = ${dec}（注意最右边第一位权值是 2⁰ = 1 而非 2¹ = 2，否则会翻倍错算成 ${shiftTrap}）。`,
        explanationEn: `Expanding powers of 2 from right to left starting at 2⁰ = 1 gives (${bin})₂ = ${dec}.`,
        explanationI18n: {
          ja: `右端の桁（2⁰ = 1）から左へ順に 2 の累乗の重みをかけてたすと、(${bin})₂ = ${dec} となる（右端の重みを 2¹ = 2 とすると、2倍の ${shiftTrap} と誤ってしまう）。`,
          ko: `가장 오른쪽 자리(2⁰ = 1)부터 왼쪽으로 2의 거듭제곱 자릿값을 곱해 더하면 (${bin})₂ = ${dec}이다 (가장 오른쪽 자릿값을 2¹ = 2로 잡으면 결과가 두 배로 잘못 계산된다: ${shiftTrap}).`,
          ms: `Kembangkan kuasa 2 dari kanan ke kiri bermula dengan 2⁰ = 1 untuk mendapat (${bin})₂ = ${dec}.`,
        },
        scaffolds: [
          {
            promptZh: `二进制最右边末位代表 2⁰ 还是 2¹？写出它的位权数值：`,
            promptEn: `What is the place weight of the rightmost bit (2⁰)?`,
            promptI18n: {
              ja: `右端のビット（2⁰）の位の重みはいくつか。`,
              ko: `가장 오른쪽 비트(2⁰)의 자릿값은 얼마인가?`,
              ms: `Apakah nilai tempat bagi bit paling kanan (2⁰)?`,
            },
            hintZh: `任何非零数的 0 次方`,
            hintEn: `2⁰ = 1`,
            expectedAnswer: `1`,
          },
          {
            promptZh: `将所有为 1 的数位对应权值相加，十进制结果是？`,
            promptEn: `Sum the weights of all '1' bits in (${bin})₂:`,
            promptI18n: {
              ja: `(${bin})₂ で 1 となっているビットの重みをすべてたしなさい：`,
              ko: `(${bin})₂에서 1인 비트의 자릿값을 모두 더하시오:`,
              ms: `Jumlahkan nilai tempat semua bit '1' dalam (${bin})₂:`,
            },
            hintZh: `从右往左权值依次为 1, 2, 4, 8, 16`,
            hintEn: `Weights: 1, 2, 4, 8, 16`,
            hintI18n: {
              ja: `右から順に重みは 1, 2, 4, 8, 16`,
              ko: `오른쪽부터 자릿값: 1, 2, 4, 8, 16`,
              ms: `Nilai tempat: 1, 2, 4, 8, 16`,
            },
            expectedAnswer: `${dec}`,
          },
        ],
        distractors: [
          { text: `${shiftTrap}`, misconceptionTag: "misc_cs_power_start_one" },
          { text: `${dec + 1}` },
          { text: `${dec - 2}` },
        ],
        misconceptionsByValue: { [`${shiftTrap}`]: "misc_cs_power_start_one" },
      };
      break;
    }

    // 29. Geography: Map scale & timezones
    case "geo_scale_time": {
      const mapCm = rng.int(3, 9);
      const scaleDenom = rng.pick([100000, 200000, 500000]); // 1 km = 100,000 cm
      const kmPerCm = scaleDenom / 100000;
      const ansKm = mapCm * kmPerCm;
      const zeroTrap = ansKm * 10;
      core = {
        promptZh: `在一幅比例尺为 1 : ${scaleDenom} 的区域地形图上，量得甲、乙两座气象站的图上直线距离为 ${mapCm} cm，求两站的实地水平距离是多少 km？（提示：1 km = 100,000 cm）`,
        promptEn: `On a topographic map with scale 1 : ${scaleDenom}, two stations are ${mapCm} cm apart. Find the actual ground distance in km (1 km = 100,000 cm):`,
        promptI18n: {
          ja: `縮尺 1 : ${scaleDenom} の地形図上で、2つの気象観測所の間の長さをはかると ${mapCm} cm であった。実際の距離は何 km か（1 km = 100,000 cm）。`,
          ko: `축척이 1 : ${scaleDenom}인 지형도에서 두 기상 관측소 사이의 거리를 재었더니 ${mapCm} cm였다. 실제 거리는 몇 km인지 구하시오 (1 km = 100,000 cm).`,
          ms: `Pada peta topografi berskala 1 : ${scaleDenom}, jarak antara dua stesen ialah ${mapCm} cm. Cari jarak sebenar di atas tanah dalam km (1 km = 100,000 cm):`,
        },
        answer: `${ansKm}`,
        unit: "km",
        explanationZh: `实地距离 = ${mapCm} × ${scaleDenom} cm = ${mapCm * scaleDenom} cm；因为 1 km = 1000 m = 100,000 cm（去掉 5 个零），换算得 ${ansKm} km。`,
        explanationEn: `Ground distance = ${mapCm} × ${scaleDenom} cm = ${ansKm} km (dividing cm by 100,000).`,
        explanationI18n: {
          ja: `実際の距離 = ${mapCm} × ${scaleDenom} cm = ${mapCm * scaleDenom} cm。1 km = 100,000 cm なので、100,000 で割ると ${ansKm} km となる。`,
          ko: `실제 거리 = ${mapCm} × ${scaleDenom} cm = ${mapCm * scaleDenom} cm이고, 1 km = 100,000 cm이므로 100,000으로 나누면 ${ansKm} km이다.`,
          ms: `Jarak sebenar = ${mapCm} × ${scaleDenom} cm = ${mapCm * scaleDenom} cm; bahagikan dengan 100,000 untuk menukar cm kepada km: ${ansKm} km.`,
        },
        scaffolds: [
          {
            promptZh: `图上 1 cm 代表实地 ${scaleDenom} cm，换算成 km 是多少 km？`,
            promptEn: `How many km does 1 cm on a 1:${scaleDenom} map represent?`,
            promptI18n: {
              ja: `縮尺 1:${scaleDenom} の地図上の 1 cm は、実際には何 km を表すか。`,
              ko: `축척 1:${scaleDenom}인 지도에서 1 cm는 실제로 몇 km를 나타내는가?`,
              ms: `Berapakah km yang diwakili oleh 1 cm pada peta berskala 1:${scaleDenom}?`,
            },
            hintZh: `${scaleDenom} ÷ 100000`,
            hintEn: `Divide by 100,000`,
            hintI18n: { ja: `100,000 で割る`, ko: `100,000으로 나눈다`, ms: `Bahagi dengan 100,000` },
            expectedAnswer: `${kmPerCm}`,
          },
          {
            promptZh: `图上 ${mapCm} cm 对应实地多少 km？`,
            promptEn: `Multiply by ${mapCm} cm:`,
            promptI18n: {
              ja: `それに地図上の長さ ${mapCm} cm をかけなさい：`,
              ko: `여기에 지도상 거리 ${mapCm} cm를 곱하시오:`,
              ms: `Darab dengan ${mapCm} cm:`,
            },
            hintZh: `${mapCm} × ${kmPerCm}`,
            hintEn: `${mapCm} × ${kmPerCm}`,
            expectedAnswer: `${ansKm}`,
          },
        ],
        distractors: [
          { text: `${zeroTrap}`, misconceptionTag: "misc_geo_cm_km_zeros" },
          { text: `${ansKm / 10}`, misconceptionTag: "misc_geo_cm_km_zeros" },
          { text: `${mapCm + kmPerCm}` },
        ],
        misconceptionsByValue: {
          [`${zeroTrap}`]: "misc_geo_cm_km_zeros",
          [`${ansKm / 10}`]: "misc_geo_cm_km_zeros",
        },
      };
      break;
    }

    // 30. History: BCE/CE chronology (No Year 0!)
    case "his_chronology": {
      const bce = rng.pick([221, 202, 44, 509, 776]);
      const ce = rng.pick([2025, 2026, 618, 1066]);
      const ansYears = bce + ce - 1;
      const yearZeroTrap = bce + ce;
      core = {
        promptZh: `【历史纪年跨度】公历纪年没有“公元 0 年”（公元前 1 年紧接公元 1 年）。从公元前 ${bce} 年（${bce} BCE）到公元 ${ce} 年（${ce} CE）同月同日，一共相距多少周年？`,
        promptEn: `[Historical Chronology] Since the Gregorian/Julian calendar has NO Year 0 (1 BCE is followed immediately by 1 CE), how many full years elapsed from ${bce} BCE to the same date in ${ce} CE?`,
        promptI18n: {
          ja: `【歴史の年代計算】西暦（グレゴリオ暦・ユリウス暦）には「紀元0年」がない（紀元前1年の次はすぐ紀元1年）。紀元前 ${bce} 年から紀元 ${ce} 年の同じ月日までに、何年が経過したか。`,
          ko: `[역사 연대 계산] 서력기원(그레고리력/율리우스력)에는 '0년'이 없다(기원전 1년 바로 다음 해가 기원후 1년이다). 기원전 ${bce}년부터 기원후 ${ce}년의 같은 날짜까지 몇 년이 지났는가?`,
          ms: `[Kronologi Sejarah] Oleh sebab kalendar Gregory/Julius TIDAK mempunyai Tahun 0 (1 SM diikuti terus oleh 1 M), berapakah bilangan tahun penuh yang berlalu dari tahun ${bce} SM hingga tarikh yang sama pada tahun ${ce} M?`,
        },
        answer: `${ansYears}`,
        explanationZh: `跨越公元元年时因不存在公元 0 年，周年跨度 = ${bce} + ${ce} - 1 = ${ansYears} 年（直接相加 ${bce} + ${ce} = ${yearZeroTrap} 会多算虚构的“公元 0 年”）。`,
        explanationEn: `Spanning 1 BCE → 1 CE requires subtracting 1 for the missing Year 0: ${bce} + ${ce} - 1 = ${ansYears} years.`,
        explanationI18n: {
          ja: `紀元前1年 → 紀元1年をまたぐときは、存在しない「紀元0年」の分として1を引く：${bce} + ${ce} - 1 = ${ansYears} 年（単純に ${bce} + ${ce} = ${yearZeroTrap} とすると、架空の「紀元0年」を数えてしまう）。`,
          ko: `기원전 1년 → 기원후 1년을 넘어갈 때는 존재하지 않는 '0년'만큼 1을 빼야 한다: ${bce} + ${ce} - 1 = ${ansYears}년 (단순히 ${bce} + ${ce} = ${yearZeroTrap}처럼 더하면 존재하지 않는 '0년'까지 세게 된다).`,
          ms: `Merentasi 1 SM → 1 M memerlukan penolakan 1 bagi Tahun 0 yang tidak wujud: ${bce} + ${ce} - 1 = ${ansYears} tahun.`,
        },
        scaffolds: [
          {
            promptZh: `若按普通数轴算 ${bce} + ${ce} 是多少？`,
            promptEn: `First sum ${bce} + ${ce}:`,
            promptI18n: {
              ja: `まず ${bce} + ${ce} を計算しなさい：`,
              ko: `먼저 ${bce} + ${ce}의 값을 구하시오:`,
              ms: `Mula-mula, jumlahkan ${bce} + ${ce}:`,
            },
            hintZh: `${bce} + ${ce}`,
            hintEn: `${bce} + ${ce}`,
            expectedAnswer: `${yearZeroTrap}`,
          },
          {
            promptZh: `扣除不存在的“公元 0 年”（减 1），实际相隔多少年？`,
            promptEn: `Subtract 1 for the non-existent Year 0:`,
            promptI18n: {
              ja: `存在しない「紀元0年」の分として1を引きなさい：`,
              ko: `존재하지 않는 '0년'만큼 1을 빼시오:`,
              ms: `Tolak 1 bagi Tahun 0 yang tidak wujud:`,
            },
            hintZh: `${yearZeroTrap} - 1`,
            hintEn: `${yearZeroTrap} - 1`,
            expectedAnswer: `${ansYears}`,
          },
        ],
        distractors: [
          { text: `${yearZeroTrap}`, misconceptionTag: "misc_his_year_zero" },
          { text: `${Math.abs(ce - bce)}` },
          { text: `${ansYears - 1}` },
        ],
        misconceptionsByValue: { [`${yearZeroTrap}`]: "misc_his_year_zero" },
      };
      break;
    }
    default:
      return null;
  }
  return core;
}
