import type { DifficultyTier } from "@/types/taxonomy";
import {
  formatFrac,
  koP,
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
    // 19. Physics: Density & SI units (100% cross-locale hint parity + challenge mixture density)
    case "phy_density": {
      if (dTier === "challenge") {
        // Miscible liquid mixture density: V1 cm^3 of liquid A (rho1 g/cm^3) + V2 cm^3 of water (1.0 g/cm^3), ignore volume change
        const specs = [
          [0.8, 30, 20], // m1=24, m2=20 => 44 / 50 = 0.88 g/cm^3 = 880 kg/m^3
          [0.8, 25, 25], // m1=20, m2=25 => 45 / 50 = 0.90 g/cm^3 = 900 kg/m^3
          [1.2, 20, 30], // m1=24, m2=30 => 54 / 50 = 1.08 g/cm^3 = 1080 kg/m^3
          [1.5, 20, 20], // m1=30, m2=20 => 50 / 40 = 1.25 g/cm^3 = 1250 kg/m^3
          [1.4, 30, 20], // m1=42, m2=20 => 62 / 50 = 1.24 g/cm^3 = 1240 kg/m^3
        ] as const;
        const [rho1, v1, v2] = rng.pick(specs);
        const m1 = Math.round(rho1 * v1);
        const m2 = v2;
        const mTotal = m1 + m2;
        const vTotal = v1 + v2;
        const rhoMixG = mTotal / vTotal;
        const ansKgM3 = Math.round(rhoMixG * 1000);
        const avgTrap = Math.round(((rho1 + 1.0) / 2) * 1000);
        core = {
          promptZh: `将体积 V₁ = ${v1} cm³、密度 ρ₁ = ${rho1} g/cm³ 的液体甲，与体积 V₂ = ${v2} cm³、密度 ρ₂ = 1.0 g/cm³ 的纯水混合（忽略混合前后的总体积变化）。求混合液的密度是多少 kg/m³？（提示：1 g/cm³ = 1000 kg/m³）`,
          promptEn: `Mix V₁ = ${v1} cm³ of liquid A (density ρ₁ = ${rho1} g/cm³) with V₂ = ${v2} cm³ of water (ρ₂ = 1.0 g/cm³), assuming total volume is unchanged. Find the mixture density in kg/m³ (Hint: 1 g/cm³ = 1000 kg/m³):`,
          promptI18n: {
            ja: `体積 V₁ = ${v1} cm³・密度 ρ₁ = ${rho1} g/cm³ の液体 A と、体積 V₂ = ${v2} cm³・密度 ρ₂ = 1.0 g/cm³ の水を混ぜます（体積変化は無視します）。混合液の密度は何 kg/m³ ですか（ヒント：1 g/cm³ = 1000 kg/m³）。`,
            ko: `부피 V₁ = ${v1} cm³, 밀도 ρ₁ = ${rho1} g/cm³인 액체 A와 부피 V₂ = ${v2} cm³, 밀도 ρ₂ = 1.0 g/cm³인 물을 혼합합니다(부피 변화 무시). 혼합액의 밀도는 몇 kg/m³입니까? (힌트: 1 g/cm³ = 1000 kg/m³)`,
            ms: `Campurkan V₁ = ${v1} cm³ cecair A (ketumpatan ρ₁ = ${rho1} g/cm³) dengan V₂ = ${v2} cm³ air (ρ₂ = 1.0 g/cm³), dengan menganggap jumlah isi padu tidak berubah. Cari ketumpatan campuran dalam kg/m³ (Petunjuk: 1 g/cm³ = 1000 kg/m³):`,
          },
          answer: `${ansKgM3}`,
          unit: "kg/m³",
          explanationZh: `总质量 m_总 = ${rho1}×${v1} + 1.0×${v2} = ${mTotal} g，总体积 V_总 = ${vTotal} cm³；混合密度 ρ = ${mTotal}/${vTotal} = ${rhoMixG} g/cm³ = ${ansKgM3} kg/m³。`,
          explanationEn: `Total mass = ${m1} + ${m2} = ${mTotal} g; total volume = ${vTotal} cm³; ρ = ${mTotal}/${vTotal} = ${rhoMixG} g/cm³ = ${ansKgM3} kg/m³.`,
          explanationI18n: {
            ja: `全体の質量は ${m1} + ${m2} = ${mTotal} g、全体の体積は ${vTotal} cm³ なので、ρ = ${mTotal}/${vTotal} = ${rhoMixG} g/cm³ = ${ansKgM3} kg/m³ です。`,
            ko: `전체 질량은 ${m1} + ${m2} = ${mTotal} g이고 전체 부피는 ${vTotal} cm³이므로, ρ = ${mTotal}/${vTotal} = ${rhoMixG} g/cm³ = ${ansKgM3} kg/m³입니다.`,
            ms: `Jumlah jisim = ${m1} + ${m2} = ${mTotal} g; jumlah isi padu = ${vTotal} cm³; ρ = ${mTotal}/${vTotal} = ${rhoMixG} g/cm³ = ${ansKgM3} kg/m³.`,
          },
          scaffolds: [
            {
              promptZh: `第一步：求两种液体的总质量 m₁ + m₂ = ${m1} + ${m2}（单位 g）：`,
              promptEn: `Step 1: Find total mass m₁ + m₂ = ${m1} + ${m2} (in g):`,
              promptI18n: {
                ja: `ステップ 1：全体の質量 m₁ + m₂ = ${m1} + ${m2} [g] を求めなさい：`,
                ko: `1단계: 전체 질량 m₁ + m₂ = ${m1} + ${m2}(g)를 구하시오:`,
                ms: `Langkah 1: Cari jumlah jisim m₁ + m₂ = ${m1} + ${m2} (dalam g):`,
              },
              hintZh: `${m1} + ${m2}`,
              hintEn: `${m1} + ${m2}`,
              expectedAnswer: `${mTotal}`,
            },
            {
              promptZh: `第二步：除以总体积 ${vTotal} cm³ 并乘以 1000 换算为 kg/m³：`,
              promptEn: `Step 2: Divide ${mTotal} by ${vTotal} cm³ and multiply by 1000 for kg/m³:`,
              promptI18n: {
                ja: `ステップ 2：${mTotal} ÷ ${vTotal} に 1000 をかけて kg/m³ で答えなさい：`,
                ko: `2단계: ${mTotal} ÷ ${vTotal}에 1000을 곱하여 kg/m³ 단위로 답하시오:`,
                ms: `Langkah 2: Bahagikan ${mTotal} dengan ${vTotal} dan darab 1000 untuk kg/m³:`,
              },
              hintZh: `(${mTotal} ÷ ${vTotal}) × 1000`,
              hintEn: `(${mTotal} / ${vTotal}) × 1000`,
              expectedAnswer: `${ansKgM3}`,
            },
          ],
          distractors: [
            { text: `${rhoMixG}`, misconceptionTag: "misc_density_halved" },
            { text: `${avgTrap === ansKgM3 ? ansKgM3 + 100 : avgTrap}`, misconceptionTag: "misc_avg_speed_mean" },
            { text: `${mTotal * 10}` },
          ],
          misconceptionsByValue: { [`${rhoMixG}`]: "misc_density_halved" },
        };
      } else {
        const rhoGcm3 = dTier === "standard" ? rng.pick([2.7, 7.8, 8.9, 10.5]) : rng.pick([2.5, 2.7, 7.8, 8.9]);
        const volCm3 = dTier === "standard" ? rng.pick([20, 40, 50, 80]) : rng.pick([10, 20, 30]);
        const massG = Math.round(rhoGcm3 * volCm3);
        const ansKgM3 = Math.round(rhoGcm3 * 1000);
        const wrongDiv1000 = rhoGcm3 / 1000;
        core = {
          promptZh: `测得某均匀金属块质量 m = ${massG} g，体积 V = ${volCm3} cm³。求该金属的密度是多少 kg/m³？（提示：1 g/cm³ = 1000 kg/m³）`,
          promptEn: `A uniform metal block has mass m = ${massG} g and volume V = ${volCm3} cm³. Find its density in kg/m³ (Hint: 1 g/cm³ = 1000 kg/m³):`,
          promptI18n: {
            ja: `質量 m = ${massG} g、体積 V = ${volCm3} cm³ の一様な金属のかたまりがあります。この金属の密度は何 kg/m³ ですか（ヒント：1 g/cm³ = 1000 kg/m³）。`,
            ko: `질량 m = ${massG} g, 부피 V = ${volCm3} cm³인 균일한 금속 덩어리가 있습니다. 이 금속의 밀도는 몇 kg/m³입니까? (힌트: 1 g/cm³ = 1000 kg/m³)`,
            ms: `Sebuah blok logam seragam mempunyai jisim m = ${massG} g dan isi padu V = ${volCm3} cm³. Cari ketumpatannya dalam kg/m³ (Petunjuk: 1 g/cm³ = 1000 kg/m³):`,
          },
          answer: `${ansKgM3}`,
          unit: "kg/m³",
          explanationZh: `先算 ρ = m / V = ${massG} / ${volCm3} = ${rhoGcm3} g/cm³；再换算国际单位：${rhoGcm3} × 1000 = ${ansKgM3} kg/m³。`,
          explanationEn: `ρ = ${massG} / ${volCm3} = ${rhoGcm3} g/cm³; converting to SI units gives ${rhoGcm3} × 1000 = ${ansKgM3} kg/m³.`,
          explanationI18n: {
            ja: `ρ = m / V = ${massG} / ${volCm3} = ${rhoGcm3} g/cm³ となり、単位を換算すると ${rhoGcm3} × 1000 = ${ansKgM3} kg/m³ です。`,
            ko: `ρ = m / V = ${massG} / ${volCm3} = ${rhoGcm3} g/cm³이고, 단위를 환산하면 ${rhoGcm3} × 1000 = ${ansKgM3} kg/m³입니다.`,
            ms: `ρ = m / V = ${massG} / ${volCm3} = ${rhoGcm3} g/cm³; tukar kepada unit SI: ${rhoGcm3} × 1000 = ${ansKgM3} kg/m³.`,
          },
          scaffolds: [
            {
              promptZh: `先求该金属以 g/cm³ 为单位的密度：${massG} ÷ ${volCm3} = ?`,
              promptEn: `First compute ρ in g/cm³ (${massG} ÷ ${volCm3}):`,
              promptI18n: {
                ja: `まず g/cm³ 単位での密度 ρ を求めなさい（${massG} ÷ ${volCm3}）：`,
                ko: `먼저 g/cm³ 단위의 밀도 ρ를 구하시오 (${massG} ÷ ${volCm3}):`,
                ms: `Mula-mula hitung ρ dalam g/cm³ (${massG} ÷ ${volCm3}):`,
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
              hintI18n: { ja: `1000 をかける`, ko: `1000을 곱하기`, ms: `Darab dengan 1000` },
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
      }
      break;
    }

    // 20. Physics: Average speed & motion graphs (challenge includes intermediate stop duration!)
    case "phy_motion_speed": {
      if (dTier === "challenge") {
        // Multi-stage trip WITH rest stop (classic s-t graph trap: forgetting stop time!)
        const cases = [
          [60, 6, 5, 40, 8], // t1=10, rest=5, t2=5 => T=20s, D=100m => vAvg=5 m/s; noRestTrap=100/15=20/3
          [80, 8, 4, 40, 10], // t1=10, rest=4, t2=4 => T=18? wait: 120/20: let's pick exact integers!
          [60, 6, 4, 60, 10], // t1=10, rest=4, t2=6 => T=20s, D=120m => vAvg=6 m/s; noRestTrap=120/16=7.5
          [90, 9, 5, 60, 6], // t1=10, rest=5, t2=10 => T=25s, D=150m => vAvg=6 m/s; noRestTrap=150/20=7.5
          [80, 10, 4, 100, 12.5],
        ] as const;
        const cleanCases = [
          [60, 6, 5, 40, 8], // t1=10, rest=5, t2=5 => T=20s, D=100m => vAvg=5, skipRest=6.67, meanV=7
          [60, 6, 4, 60, 10], // t1=10, rest=4, t2=6 => T=20s, D=120m => vAvg=6, skipRest=7.5, meanV=8
          [90, 9, 5, 60, 6], // t1=10, rest=5, t2=10 => T=25s, D=150m => vAvg=6, skipRest=7.5, meanV=7.5? Wait 150/20=7.5 and (9+6)/2=7.5! Make t1 != t2:
          [80, 8, 6, 60, 10], // t1=10, rest=6, t2=6 => T=22? Make T=20: rest=4 => D=140, T=20 => vAvg=7, skipRest=140/16=8.75, meanV=9!
          [120, 10, 3, 60, 12], // t1=12, rest=3, t2=5 => T=20s, D=180m => vAvg=9, skipRest=180/17, meanV=11!
        ] as const;
        const [d1, v1, tRest, d2, v2] = rng.pick([
          cleanCases[0],
          cleanCases[1],
          cleanCases[3],
          cleanCases[4],
        ]);
        const t1 = d1 / v1;
        const t2 = d2 / v2;
        const dTotal = d1 + d2;
        const tTotal = t1 + tRest + t2;
        const vAvg = dTotal / tTotal;
        const skipRestTrap = Math.round((dTotal / (t1 + t2)) * 100) / 100;
        const meanTrap = (v1 + v2) / 2;
        core = {
          promptZh: `巡检机器人先以 v₁ = ${v1} m/s 匀速前进 ${d1} m，原地停留采样 ${tRest} s 后，再以 v₂ = ${v2} m/s 匀速前进 ${d2} m。求全程的平均速度（单位 m/s）：`,
          promptEn: `An inspection robot moves ${d1} m at v₁ = ${v1} m/s, stops for ${tRest} s to sample data, and then moves ${d2} m at v₂ = ${v2} m/s. Find its overall average speed (in m/s):`,
          promptI18n: {
            ja: `点検ロボットがまず v₁ = ${v1} m/s で ${d1} m 進み、その場で ${tRest} s 停止した後、v₂ = ${v2} m/s で ${d2} m 進みました。全体の平均の速さ [m/s] を求めなさい。`,
            ko: `점검 로봇이 먼저 v₁ = ${v1} m/s로 ${d1} m를 이동한 뒤 제자리에서 ${tRest} s 동안 정지했다가, 다시 v₂ = ${v2} m/s로 ${d2} m를 이동했습니다. 전체 구간의 평균 속력(m/s)을 구하시오.`,
            ms: `Sebuah robot pemeriksaan bergerak sejauh ${d1} m pada v₁ = ${v1} m/s, berhenti selama ${tRest} s, dan kemudian bergerak sejauh ${d2} m pada v₂ = ${v2} m/s. Cari laju purata keseluruhannya (dalam m/s):`,
          },
          answer: `${vAvg}`,
          unit: "m/s",
          explanationZh: `总路程 s = ${d1} + ${d2} = ${dTotal} m；总时间必须包含中途停留时间：t = ${t1} + ${tRest} + ${t2} = ${tTotal} s，故全程平均速度 v = ${dTotal} / ${tTotal} = ${vAvg} m/s。`,
          explanationEn: `Total distance = ${dTotal} m; total time MUST include the ${tRest} s stop: t = ${t1} + ${tRest} + ${t2} = ${tTotal} s, so v_avg = ${dTotal}/${tTotal} = ${vAvg} m/s.`,
          explanationI18n: {
            ja: `全体の道のりは ${dTotal} m、全体の時間は停止時間も含めて ${t1} + ${tRest} + ${t2} = ${tTotal} s なので、平均の速さは ${dTotal}/${tTotal} = ${vAvg} m/s です。`,
            ko: `전체 이동 거리는 ${dTotal} m이고 전체 걸린 시간은 정지 시간을 포함하여 ${t1} + ${tRest} + ${t2} = ${tTotal} s이므로, 평균 속력은 ${dTotal}/${tTotal} = ${vAvg} m/s입니다.`,
            ms: `Jumlah jarak = ${dTotal} m; jumlah masa MESTI termasuk masa berhenti ${tRest} s: t = ${t1} + ${tRest} + ${t2} = ${tTotal} s, maka laju purata = ${dTotal}/${tTotal} = ${vAvg} m/s.`,
          },
          scaffolds: [
            {
              promptZh: `第一步：含停留 ${tRest} s 在内的全程总耗时 t₁ + t_停 + t₂ 等于多少秒？`,
              promptEn: `Step 1: Find total elapsed time including the ${tRest} s stop (${t1} + ${tRest} + ${t2}):`,
              promptI18n: {
                ja: `ステップ 1：停止時間 ${tRest} s を含めた全体の時間（${t1} + ${tRest} + ${t2}）を求めなさい：`,
                ko: `1단계: 정지 시간 ${tRest} s를 포함한 전체 걸린 시간(${t1} + ${tRest} + ${t2})을 구하시오:`,
                ms: `Langkah 1: Cari jumlah masa termasuk berhenti ${tRest} s (${t1} + ${tRest} + ${t2}):`,
              },
              hintZh: `${t1} + ${tRest} + ${t2}`,
              hintEn: `${t1} + ${tRest} + ${t2}`,
              expectedAnswer: `${tTotal}`,
            },
            {
              promptZh: `第二步：用总路程 ${dTotal} m 除以总时间 ${tTotal} s，平均速度是？`,
              promptEn: `Step 2: Divide total distance ${dTotal} m by total time ${tTotal} s:`,
              promptI18n: {
                ja: `ステップ 2：全体の道のり ${dTotal} m を全体の時間 ${tTotal} s でわりなさい：`,
                ko: `2단계: 전체 이동 거리 ${dTotal} m를 전체 시간 ${tTotal} s로 나누시오:`,
                ms: `Langkah 2: Bahagikan jumlah jarak ${dTotal} m dengan jumlah masa ${tTotal} s:`,
              },
              hintZh: `${dTotal} ÷ ${tTotal}`,
              hintEn: `${dTotal} / ${tTotal}`,
              expectedAnswer: `${vAvg}`,
            },
          ],
          distractors: [
            { text: `${skipRestTrap}`, misconceptionTag: "misc_avg_speed_mean" },
            { text: `${meanTrap}`, misconceptionTag: "misc_avg_speed_mean" },
            { text: `${tTotal}` },
          ],
          misconceptionsByValue: {
            [`${skipRestTrap}`]: "misc_avg_speed_mean",
            [`${meanTrap}`]: "misc_avg_speed_mean",
          },
        };
      } else {
        const pairs = [
          [2, 6, 3, 4],
          [3, 6, 4, 4.5],
          [4, 12, 6, 8],
          [6, 12, 8, 9],
          [5, 20, 8, 12.5],
        ] as const;
        const [v1, v2, vAvg, arithTrap] = rng.pick(pairs);
        const scale = dTier === "standard" ? 2 : 1;
        const halfDist = v1 * v2 * scale;
        const t1 = halfDist / v1;
        const t2 = halfDist / v2;
        core = {
          promptZh: `一辆智能小车沿直线跑道测试：前 ${halfDist} m 以 v₁ = ${v1} m/s 匀速行驶，后 ${halfDist} m 以 v₂ = ${v2} m/s 匀速行驶。求全程 ${2 * halfDist} m 的平均速度（m/s）：`,
          promptEn: `A rover travels the first ${halfDist} m at v₁ = ${v1} m/s and the next ${halfDist} m at v₂ = ${v2} m/s. Find its average speed (m/s) over the entire ${2 * halfDist} m trip:`,
          promptI18n: {
            ja: `探査車が直線コースの最初の ${halfDist} m を v₁ = ${v1} m/s、続く ${halfDist} m を v₂ = ${v2} m/s の一定の速さで走りました。全体 ${2 * halfDist} m の平均の速さ [m/s] を求めなさい。`,
            ko: `탐사 로봇 차량이 처음 ${halfDist} m를 v₁ = ${v1} m/s로, 다음 ${halfDist} m를 v₂ = ${v2} m/s로 이동했습니다. 전체 ${2 * halfDist} m 구간에서의 평균 속력(m/s)을 구하시오.`,
            ms: `Sebuah rover bergerak sejauh ${halfDist} m pertama pada v₁ = ${v1} m/s dan ${halfDist} m berikutnya pada v₂ = ${v2} m/s. Cari laju puratanya (m/s) bagi keseluruhan perjalanan ${2 * halfDist} m:`,
          },
          answer: `${vAvg}`,
          unit: "m/s",
          explanationZh: `前段耗时 t₁ = ${halfDist}/${v1} = ${t1} s，后段耗时 t₂ = ${halfDist}/${v2} = ${t2} s；全程平均速度 v = 总路程 / 总时间 = ${2 * halfDist} / (${t1} + ${t2}) = ${vAvg} m/s（绝不能直接算 (${v1}+${v2})/2 = ${arithTrap} m/s！）。`,
          explanationEn: `t₁ = ${t1} s, t₂ = ${t2} s; Average speed = Total distance / Total time = ${2 * halfDist} / ${t1 + t2} = ${vAvg} m/s.`,
          explanationI18n: {
            ja: `t₁ = ${t1} s、t₂ = ${t2} s より、平均の速さ = 全体の道のり ÷ 全体の時間 = ${2 * halfDist} / ${t1 + t2} = ${vAvg} m/s です（(${v1}+${v2})/2 = ${arithTrap} m/s としてはいけません）。`,
            ko: `t₁ = ${t1} s, t₂ = ${t2} s이므로 평균 속력 = 전체 이동 거리 ÷ 전체 걸린 시간 = ${2 * halfDist} / ${t1 + t2} = ${vAvg} m/s입니다 ((${v1}+${v2})/2 = ${arithTrap} m/s로 계산하면 안 됩니다).`,
            ms: `t₁ = ${t1} s, t₂ = ${t2} s; laju purata = jumlah jarak / jumlah masa = ${2 * halfDist} / ${t1 + t2} = ${vAvg} m/s (bukan (${v1}+${v2})/2 = ${arithTrap} m/s).`,
          },
          scaffolds: [
            {
              promptZh: `分别算出两段耗时之和 t_总 = ${halfDist}÷${v1} + ${halfDist}÷${v2} 等于多少秒？`,
              promptEn: `Find total time t₁ + t₂ = ${halfDist}/${v1} + ${halfDist}/${v2} (in s):`,
              promptI18n: {
                ja: `かかった時間の合計 t₁ + t₂ = ${halfDist}/${v1} + ${halfDist}/${v2} [s] を求めなさい：`,
                ko: `걸린 시간의 합 t₁ + t₂ = ${halfDist}/${v1} + ${halfDist}/${v2}(s)를 구하시오:`,
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
                ja: `全体の道のり ${2 * halfDist} m を全体の時間 ${t1 + t2} s でわりなさい：`,
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
      }
      break;
    }

    // 21. Physics: Forces & Newton's F_net = ma
    case "phy_newton_fma": {
      if (dTier === "challenge") {
        // Inverse synthesis: find required pulling force F = m*a + f so a block accelerates at a m/s^2 against friction f
        const m = rng.int(3, 8);
        const a = rng.int(2, 5);
        const f = rng.int(4, 12);
        const pullAns = m * a + f;
        const subtractFricTrap = Math.abs(m * a - f);
        const ignoreFricTrap = m * a;
        core = {
          promptZh: `质量 m = ${m} kg 的物块在水平地面上运动，受到水平向左的滑动摩擦力 f = ${f} N。若要使物块产生向右 a = ${a} m/s² 的加速度，水平向右的拉力 F 应为多少 N？`,
          promptEn: `A ${m} kg block on a horizontal surface experiences leftward kinetic friction f = ${f} N. What rightward pulling force F (in N) is required to give it a rightward acceleration of a = ${a} m/s²?`,
          promptI18n: {
            ja: `質量 ${m} kg の物体に左向きの動摩擦力 f = ${f} N がはたらいています。右向きに a = ${a} m/s² の加速度を生じさせるには、右向きに引く力 F は何 N 必要ですか。`,
            ko: `질량 ${m} kg인 물체에 왼쪽으로 마찰력 f = ${f} N이 작용합니다. 오른쪽으로 a = ${a} m/s²의 가속도를 내려면 오른쪽으로 당기는 힘 F는 몇 N이어야 합니까?`,
            ms: `Sebuah blok ${m} kg mengalami daya geseran ke kiri f = ${f} N. Berapakah daya tarikan ke kanan F (dalam N) yang diperlukan untuk menghasilkan pecutan a = ${a} m/s² ke kanan?`,
          },
          svgDiagram: svgForceDiagram(m, pullAns, f),
          answer: `${pullAns}`,
          unit: "N",
          explanationZh: `由牛顿第二定律 F - f = ma，得所需拉力 F = ma + f = ${m}×${a} + ${f} = ${pullAns} N（切勿漏加摩擦力只算 ma = ${ignoreFricTrap} N，或加减反号算成 ${subtractFricTrap} N）。`,
          explanationEn: `From F - f = ma, the required pull is F = ma + f = ${m}×${a} + ${f} = ${pullAns} N.`,
          explanationI18n: {
            ja: `運動方程式 F - f = ma より、求める力 F = ma + f = ${m}×${a} + ${f} = ${pullAns} N です。`,
            ko: `운동 방정식 F - f = ma에서 필요한 당기는 힘은 F = ma + f = ${m}×${a} + ${f} = ${pullAns} N입니다.`,
            ms: `Daripada F - f = ma, daya tarikan yang diperlukan ialah F = ma + f = ${m}×${a} + ${f} = ${pullAns} N.`,
          },
          scaffolds: [
            {
              promptZh: `第一步：物块所需的合外力 F_合 = m × a = ${m} × ${a} 等于多少 N？`,
              promptEn: `Step 1: Find required net force F_net = ${m} × ${a} (in N):`,
              promptI18n: {
                ja: `ステップ 1：必要な合力 F_net = ${m} × ${a} [N] を求めなさい：`,
                ko: `1단계: 필요한 알짜힘 F_net = ${m} × ${a}(N)를 구하시오:`,
                ms: `Langkah 1: Cari daya paduan F_net = ${m} × ${a} (dalam N):`,
              },
              hintZh: `${m} × ${a}`,
              hintEn: `${m} × ${a}`,
              expectedAnswer: `${ignoreFricTrap}`,
            },
            {
              promptZh: `第二步：拉力还需抵消摩擦力 ${f} N，故 F = ${ignoreFricTrap} + ${f} = ?`,
              promptEn: `Step 2: Add friction ${f} N to get pulling force F:`,
              promptI18n: {
                ja: `ステップ 2：摩擦力 ${f} N を加えて引く力 F を求めなさい：`,
                ko: `2단계: 마찰력 ${f} N을 더하여 당기는 힘 F를 구하시오:`,
                ms: `Langkah 2: Tambahkan daya geseran ${f} N untuk mendapat F:`,
              },
              hintZh: `${ignoreFricTrap} + ${f}`,
              hintEn: `${ignoreFricTrap} + ${f}`,
              expectedAnswer: `${pullAns}`,
            },
          ],
          distractors: [
            { text: `${ignoreFricTrap}`, misconceptionTag: "misc_newton_ignore_friction" },
            { text: `${subtractFricTrap === pullAns || subtractFricTrap === ignoreFricTrap ? pullAns + f : subtractFricTrap}` },
            { text: `${pullAns + m}` },
          ],
          misconceptionsByValue: { [`${ignoreFricTrap}`]: "misc_newton_ignore_friction" },
        };
      } else {
        const m = rng.int(3, 6);
        const a = rng.int(2, 5);
        // Ensure pull/m !== m*a so distractors never collide!
        const f = rng.pick([3, 5, 7, 9, 11]);
        const pull = m * a + f;
        const ignoreFricTrap = formatFrac(pull, m);
        const addFricTrap = formatFrac(pull + f, m);
        core = {
          promptZh: `如图所示，质量 m = ${m} kg 的物块受水平向右拉力 F = ${pull} N 和水平向左滑动摩擦力 f = ${f} N 作用，求物块的加速度 a（单位 m/s²）：`,
          promptEn: `A ${m} kg block experiences a rightward pull F = ${pull} N and leftward friction f = ${f} N. Find its acceleration a (in m/s²):`,
          promptI18n: {
            ja: `図のように、質量 ${m} kg の物体に右向きに引く力 F = ${pull} N と左向きの動摩擦力 f = ${f} N がはたらいています。物体の加速度 a [m/s²] を求めなさい。`,
            ko: `그림과 같이 질량 ${m} kg인 물체에 오른쪽으로 당기는 힘 F = ${pull} N과 왼쪽으로 마찰력 f = ${f} N이 작용합니다. 물체의 가속도 a(단위: m/s²)를 구하시오.`,
            ms: `Sebuah blok ${m} kg dikenakan daya tarikan ke kanan F = ${pull} N dan daya geseran ke kiri f = ${f} N. Cari pecutannya a (dalam m/s²):`,
          },
          svgDiagram: svgForceDiagram(m, pull, f),
          answer: `${a}`,
          unit: "m/s²",
          explanationZh: `先求合外力 F_合 = F - f = ${pull} - ${f} = ${m * a} N，再由牛顿第二定律 a = F_合 / m = ${m * a} / ${m} = ${a} m/s²（切勿忽略摩擦力直接算 F/m = ${ignoreFricTrap}）。`,
          explanationEn: `Net force F_net = ${pull} - ${f} = ${m * a} N; acceleration a = F_net / m = ${m * a} / ${m} = ${a} m/s².`,
          explanationI18n: {
            ja: `合力 F_net = ${pull} - ${f} = ${m * a} N より、加速度 a = F_net / m = ${m * a} / ${m} = ${a} m/s² です（摩擦力を無視して F/m = ${ignoreFricTrap} としてはいけません）。`,
            ko: `알짜힘 F_net = ${pull} - ${f} = ${m * a} N이고, 뉴턴 운동 제2법칙에 의해 가속도 a = F_net / m = ${m * a} / ${m} = ${a} m/s²입니다 (마찰력을 무시하고 F/m = ${ignoreFricTrap}처럼 계산하면 안 됩니다).`,
            ms: `Daya paduan F_net = ${pull} - ${f} = ${m * a} N; pecutan a = F_net / m = ${m * a} / ${m} = ${a} m/s².`,
          },
          scaffolds: [
            {
              promptZh: `水平方向合力 F_合 = ${pull} - ${f} 等于多少 N？`,
              promptEn: `Compute net horizontal force F - f:`,
              promptI18n: {
                ja: `水平方向の合力 F - f [N] を求めなさい：`,
                ko: `수평 방향의 알짜힘 F - f(N)를 구하시오:`,
                ms: `Hitung daya paduan mengufuk F - f:`,
              },
              hintZh: `反向力相减`,
              hintEn: `Subtract opposing friction`,
              hintI18n: {
                ja: `逆向きの摩擦力を引く`,
                ko: `반대 방향의 마찰력을 빼기`,
                ms: `Tolak daya geseran yang bertentangan`,
              },
              expectedAnswer: `${m * a}`,
            },
            {
              promptZh: `由 a = F_合 / m，除以质量 ${m} kg 得加速度 a = ?`,
              promptEn: `Divide net force by mass ${m} kg:`,
              promptI18n: {
                ja: `合力を質量 ${m} kg でわりなさい：`,
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
            { text: addFricTrap },
            { text: `${m * a}` },
          ],
          misconceptionsByValue: { [ignoreFricTrap]: "misc_newton_ignore_friction" },
        };
      }
      break;
    }

    // 22. Physics: Series & parallel circuit laws (100% Ohm's-law physically consistent!)
    case "phy_circuits_laws": {
      if (dTier === "basic") {
        // Series circuit where U = I * (R1 + R2) holds strictly!
        const setups = [
          [10, 20, 0.2, 6],
          [10, 20, 0.3, 9],
          [10, 20, 0.4, 12],
          [5, 15, 0.6, 12],
          [15, 25, 0.3, 12],
        ] as const;
        const [r1, r2, iSeries, uSource] = rng.pick(setups);
        const dropTrap = Math.round((iSeries * r1) / r2 * 100) / 100;
        core = {
          promptZh: `如图串联电路中，电源电压为 ${uSource} V，R₁ = ${r1} Ω，R₂ = ${r2} Ω。测得通过 R₁ 的电流为 ${iSeries} A，则流经 R₂ 的电流是多少 A？`,
          promptEn: `In the series circuit shown (source ${uSource} V, R₁ = ${r1} Ω, R₂ = ${r2} Ω), the current through R₁ is ${iSeries} A. What is the current through R₂ (in A)?`,
          promptI18n: {
            ja: `図の直列回路（電源 ${uSource} V、R₁ = ${r1} Ω、R₂ = ${r2} Ω）で、R₁ を流れる電流が ${iSeries} A のとき、R₂ を流れる電流は何 A ですか。`,
            ko: `그림의 직렬 회로(전원 ${uSource} V, R₁ = ${r1} Ω, R₂ = ${r2} Ω)에서 R₁에 흐르는 전류가 ${iSeries} A일 때, R₂에 흐르는 전류는 몇 A입니까?`,
            ms: `Dalam litar sesiri yang ditunjukkan (bekalan ${uSource} V, R₁ = ${r1} Ω, R₂ = ${r2} Ω), arus melalui R₁ ialah ${iSeries} A. Berapakah arus melalui R₂ (dalam A)?`,
          },
          svgDiagram: svgCircuit("series", `R₁=${r1}Ω`, `R₂=${r2}Ω`, `${uSource}V`),
          answer: `${iSeries}`,
          unit: "A",
          explanationZh: `串联电路只有唯一电流通路，处处电流相等：I₂ = I₁ = U / (R₁ + R₂) = ${uSource} / (${r1} + ${r2}) = ${iSeries} A（电流绝不会每过一个电阻就“消耗衰减”！）。`,
          explanationEn: `In a single-loop series circuit, current is identical everywhere: I₂ = I₁ = ${uSource}/(${r1}+${r2}) = ${iSeries} A.`,
          explanationI18n: {
            ja: `直列回路は電流の通り道が 1 本だけなので、どこでも電流の大きさは等しく I₂ = I₁ = ${iSeries} A です（抵抗を通るたびに電流が減るわけではありません）。`,
            ko: `직렬 회로는 전류가 흐르는 길이 하나뿐이므로 어느 지점에서나 전류의 세기가 같아 I₂ = I₁ = ${iSeries} A입니다.`,
            ms: `Dalam litar sesiri satu gelung, arus adalah sama di semua titik: I₂ = I₁ = ${iSeries} A.`,
          },
          scaffolds: [
            {
              promptZh: `串联电路中各处电流大小是否相等？（1 表示相等，0 表示不等）：`,
              promptEn: `In a single-loop series circuit, how many independent paths exist for charge to flow?`,
              promptI18n: {
                ja: `1 本道の直列回路において、電流の通り道は何本ありますか？`,
                ko: `직렬 회로에서 전류가 흐르는 통로는 몇 개입니까?`,
                ms: `Dalam litar sesiri satu gelung, berapakah bilangan laluan arus?`,
              },
              hintZh: `单回路只有 1 条通路`,
              hintEn: `1 single loop`,
              hintI18n: {
                ja: `1 本道の単一ループです`,
                ko: `단일 경로 1개뿐입니다`,
                ms: `1 gelung tunggal sahaja`,
              },
              expectedAnswer: `1`,
            },
            {
              promptZh: `既然处处电流相等，通过 R₂ 的电流 I₂ 等于多少 A？`,
              promptEn: `Therefore, enter the current I₂ (in A) through R₂:`,
              promptI18n: {
                ja: `したがって、R₂ を流れる電流 I₂ [A] はいくつですか：`,
                ko: `따라서 R₂에 흐르는 전류 I₂(A)는 얼마입니까:`,
                ms: `Oleh itu, berapakah arus I₂ (dalam A) melalui R₂:`,
              },
              hintZh: `等于 I₁`,
              hintEn: `Same as I₁`,
              hintI18n: {
                ja: `I₁ と同じ大きさです`,
                ko: `I₁과 같습니다`,
                ms: `Sama dengan I₁`,
              },
              expectedAnswer: `${iSeries}`,
            },
          ],
          distractors: [
            { text: `${dropTrap}`, misconceptionTag: "misc_series_current_drop" },
            { text: `0`, misconceptionTag: "misc_series_current_drop" },
            { text: `${Math.round(iSeries * 20) / 10}` },
          ],
          misconceptionsByValue: { [`${dropTrap}`]: "misc_series_current_drop" },
        };
      } else if (dTier === "challenge") {
        // Series voltage division + Kirchhoff loop law: given R1, R2 and U1 across R1, find total source voltage U!
        const setups = [
          [10, 20, 4], // I = 0.4A => U2 = 8V => U = 12V
          [10, 30, 3], // I = 0.3A => U2 = 9V => U = 12V
          [15, 30, 6], // I = 0.4A => U2 = 12V => U = 18V
          [20, 30, 6], // I = 0.3A => U2 = 9V => U = 15V
          [10, 15, 4], // I = 0.4A => U2 = 6V => U = 10V
        ] as const;
        const [r1, r2, u1] = rng.pick(setups);
        const curI = u1 / r1;
        const u2 = Math.round(curI * r2 * 10) / 10;
        const uTotal = u1 + u2;
        core = {
          promptZh: `在串联电路中，定值电阻 R₁ = ${r1} Ω 与 R₂ = ${r2} Ω 串联接在恒压电源两端。若电压表测得 R₁ 两端电压 U₁ = ${u1} V，求电源总电压 U 是多少 V？`,
          promptEn: `Resistors R₁ = ${r1} Ω and R₂ = ${r2} Ω are connected in series. A voltmeter across R₁ reads U₁ = ${u1} V. Find the total source voltage U (in V):`,
          promptI18n: {
            ja: `抵抗 R₁ = ${r1} Ω と R₂ = ${r2} Ω を直列につないだ回路で、R₁ にかかる電圧が U₁ = ${u1} V でした。電源全体の電圧 U [V] を求めなさい。`,
            ko: `저항 R₁ = ${r1} Ω과 R₂ = ${r2} Ω을 직렬로 연결한 회로에서 R₁ 양단의 전압이 U₁ = ${u1} V일 때, 전원 전체 전압 U(단위: V)를 구하시오.`,
            ms: `Perintang R₁ = ${r1} Ω dan R₂ = ${r2} Ω disambungkan secara sesiri. Voltmeter merentasi R₁ menunjukkan U₁ = ${u1} V. Cari jumlah voltan bekalan U (dalam V):`,
          },
          svgDiagram: svgCircuit("series", `R₁=${r1}Ω`, `R₂=${r2}Ω`, `U=?`),
          answer: `${uTotal}`,
          unit: "V",
          explanationZh: `串联电路电流处处相等：I = U₁ / R₁ = ${u1} / ${r1} = ${curI} A；R₂ 两端电压 U₂ = I × R₂ = ${u2} V，故电源总电压 U = U₁ + U₂ = ${u1} + ${u2} = ${uTotal} V。`,
          explanationEn: `Series current I = U₁/R₁ = ${curI} A. Then U₂ = I×R₂ = ${u2} V, so total voltage U = U₁ + U₂ = ${uTotal} V.`,
          explanationI18n: {
            ja: `直列回路の電流は I = U₁/R₁ = ${curI} A で等しく、U₂ = I×R₂ = ${u2} V となるので、電源電圧は U = U₁ + U₂ = ${uTotal} V です。`,
            ko: `직렬 회로의 전류는 I = U₁/R₁ = ${curI} A로 같고 U₂ = I×R₂ = ${u2} V이므로, 전체 전압은 U = U₁ + U₂ = ${uTotal} V입니다.`,
            ms: `Arus sesiri I = U₁/R₁ = ${curI} A. Maka U₂ = I×R₂ = ${u2} V, dan jumlah voltan U = U₁ + U₂ = ${uTotal} V.`,
          },
          scaffolds: [
            {
              promptZh: `第一步：由 I = U₁ / R₁ = ${u1} ÷ ${r1} 求串联电路电流 I（单位 A）：`,
              promptEn: `Step 1: Find the series current I = ${u1} / ${r1} (in A):`,
              promptI18n: {
                ja: `ステップ 1：回路の電流 I = ${u1} ÷ ${r1} [A] を求めなさい：`,
                ko: `1단계: 직렬 회로의 전류 I = ${u1} ÷ ${r1}(A)를 구하시오:`,
                ms: `Langkah 1: Cari arus sesiri I = ${u1} / ${r1} (dalam A):`,
              },
              hintZh: `${u1} ÷ ${r1}`,
              hintEn: `${u1} / ${r1}`,
              expectedAnswer: `${curI}`,
            },
            {
              promptZh: `第二步：算 U = I × (R₁ + R₂) = ${curI} × ${r1 + r2} 求电源总电压（V）：`,
              promptEn: `Step 2: Multiply ${curI} A by total resistance (${r1} + ${r2}) Ω:`,
              promptI18n: {
                ja: `ステップ 2：${curI} A に全体の抵抗 (${r1} + ${r2}) Ω をかけて U [V] を求めなさい：`,
                ko: `2단계: ${curI} A에 전체 저항 (${r1} + ${r2}) Ω을 곱해 U(V)를 구하시오:`,
                ms: `Langkah 2: Darabkan ${curI} A dengan jumlah rintangan (${r1} + ${r2}) Ω:`,
              },
              hintZh: `${u1} + ${u2}`,
              hintEn: `${u1} + ${u2}`,
              expectedAnswer: `${uTotal}`,
            },
          ],
          distractors: [
            { text: `${u2}`, misconceptionTag: "misc_series_current_drop" },
            { text: `${2 * u1}`, misconceptionTag: "misc_series_current_drop" },
            { text: `${r1 + r2}` },
          ],
          misconceptionsByValue: {
            [`${u2}`]: "misc_series_current_drop",
            [`${2 * u1}`]: "misc_series_current_drop",
          },
        };
      } else {
        // Standard parallel junction law with 100% Ohm's-law consistent U, R1, R2, I1, I2!
        const setups = [
          [12, 10, 20, 1.2, 0.6, 1.8],
          [12, 15, 30, 0.8, 0.4, 1.2],
          [6, 10, 15, 0.6, 0.4, 1.0],
          [18, 20, 30, 0.9, 0.6, 1.5],
          [9, 10, 18, 0.9, 0.5, 1.4],
        ] as const;
        const [uSource, r1, r2, i1, i2, iTotal] = rng.pick(setups);
        core = {
          promptZh: `在并联电路（电源电压 U = ${uSource} V，R₁ = ${r1} Ω，R₂ = ${r2} Ω）中，干路总电流 I = ${iTotal} A，通过支路 R₁ 的电流 I₁ = ${i1} A，求通过另一支路 R₂ 的电流 I₂（单位 A）：`,
          promptEn: `In a parallel circuit (${uSource} V source, R₁ = ${r1} Ω, R₂ = ${r2} Ω), the main-branch current is I = ${iTotal} A and branch R₁ carries I₁ = ${i1} A. Find branch current I₂ (in A):`,
          promptI18n: {
            ja: `並列回路（電源 ${uSource} V、R₁ = ${r1} Ω、R₂ = ${r2} Ω）で、枝分かれする前の全体の電流が I = ${iTotal} A、R₁ を流れる電流が I₁ = ${i1} A です。もう一方の R₂ を流れる電流 I₂ [A] を求めなさい。`,
            ko: `병렬 회로(전원 ${uSource} V, R₁ = ${r1} Ω, R₂ = ${r2} Ω)에서 갈라지기 전 전체 전류가 I = ${iTotal} A이고 R₁에 흐르는 전류가 I₁ = ${i1} A일 때, R₂에 흐르는 전류 I₂(단위: A)를 구하시오.`,
            ms: `Dalam litar selari (bekalan ${uSource} V, R₁ = ${r1} Ω, R₂ = ${r2} Ω), arus utama ialah I = ${iTotal} A dan cabang R₁ membawa arus I₁ = ${i1} A. Cari arus cabang I₂ (dalam A):`,
          },
          svgDiagram: svgCircuit("parallel", `R₁=${r1}Ω (${i1}A)`, `R₂=${r2}Ω (I₂=?)`, `${uSource}V`),
          answer: `${i2}`,
          unit: "A",
          explanationZh: `并联干路电流等于各支路电流之和 I = I₁ + I₂，故 I₂ = ${iTotal} - ${i1} = ${i2} A（同时满足欧姆定律 I₂ = U / R₂ = ${uSource} / ${r2} = ${i2} A）。`,
          explanationEn: `By Kirchhoff's current law I = I₁ + I₂, so I₂ = ${iTotal} - ${i1} = ${i2} A (consistent with U/R₂ = ${uSource}/${r2} = ${i2} A).`,
          explanationI18n: {
            ja: `並列回路では全体の電流は各枝の電流の和 I = I₁ + I₂ となるので、I₂ = ${iTotal} - ${i1} = ${i2} A です（U/R₂ = ${uSource}/${r2} = ${i2} A とも一致します）。`,
            ko: `병렬 회로에서 전체 전류는 각 갈래 전류의 합 I = I₁ + I₂이므로 I₂ = ${iTotal} - ${i1} = ${i2} A입니다 (U/R₂ = ${uSource}/${r2} = ${i2} A와도 일치합니다).`,
            ms: `Mengikut hukum arus litar selari I = I₁ + I₂, maka I₂ = ${iTotal} - ${i1} = ${i2} A (selaras dengan U/R₂ = ${uSource}/${r2} = ${i2} A).`,
          },
          scaffolds: [
            {
              promptZh: `并联电路各支路电压相等，均等于电源电压多少 V？`,
              promptEn: `What voltage (in V) is across branch R₂ in this parallel circuit?`,
              promptI18n: {
                ja: `並列回路において、R₂ にかかる電圧は何 V ですか？`,
                ko: `병렬 회로에서 R₂ 양단에 걸리는 전압은 몇 V입니까?`,
                ms: `Berapakah voltan (dalam V) merentasi cabang R₂ dalam litar selari ini?`,
              },
              hintZh: `并联各支路电压等于电源电压`,
              hintEn: `Same as source voltage`,
              hintI18n: {
                ja: `電源電圧と等しくなります`,
                ko: `전원 전압과 같습니다`,
                ms: `Sama dengan voltan bekalan`,
              },
              expectedAnswer: `${uSource}`,
            },
            {
              promptZh: `利用分流规律 I₂ = I - I₁ = ${iTotal} - ${i1}（或 ${uSource} ÷ ${r2}）求 I₂：`,
              promptEn: `Compute I₂ = ${iTotal} - ${i1} (in A):`,
              promptI18n: {
                ja: `I₂ = ${iTotal} - ${i1} [A] を計算しなさい：`,
                ko: `I₂ = ${iTotal} - ${i1}(A)를 계산하시오:`,
                ms: `Hitung I₂ = ${iTotal} - ${i1} (dalam A):`,
              },
              hintZh: `干路电流减支路电流`,
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

    // 23. Physics: Ohm's law & parallel equivalent resistance (No widget initial-value answer leak & clean U label!)
    case "phy_ohm_law": {
      const basicPairs = [
        [3, 6, 2],
        [4, 12, 3],
        [6, 12, 4],
        [10, 15, 6],
      ] as const;
      const stdPairs = [
        [10, 15, 6],
        [12, 24, 8],
        [15, 30, 10],
        [20, 30, 12],
      ] as const;
      const [r1, r2, rEq] = dTier === "basic" ? rng.pick(basicPairs) : rng.pick(stdPairs);
      const u = rEq * rng.int(2, 4);
      const iTotal = u / rEq;
      if (dTier === "challenge") {
        core = {
          promptZh: `如图所示，电阻 R₁ = ${r1} Ω 与 R₂ = ${r2} Ω 并联在 U = ${u} V 的恒压电源两端。求干路总电流 I 是多少 A？`,
          promptEn: `Resistors R₁ = ${r1} Ω and R₂ = ${r2} Ω are connected in parallel across a ${u} V source. Find the total main-branch current I (in A):`,
          promptI18n: {
            ja: `図のように、抵抗 R₁ = ${r1} Ω と R₂ = ${r2} Ω を並列につなぎ、${u} V の電源に接続しました。回路全体を流れる電流 I [A] を求めなさい。`,
            ko: `그림과 같이 저항 R₁ = ${r1} Ω과 R₂ = ${r2} Ω을 병렬로 연결하여 ${u} V 전원에 연결했습니다. 전체 전류 I(단위: A)를 구하시오.`,
            ms: `Perintang R₁ = ${r1} Ω dan R₂ = ${r2} Ω disambungkan secara selari merentasi bekalan kuasa ${u} V. Cari jumlah arus utama I (dalam A):`,
          },
          svgDiagram: svgCircuit("parallel", `R₁=${r1}Ω`, `R₂=${r2}Ω`, `${u}V`),
          answer: `${iTotal}`,
          unit: "A",
          explanationZh: `由 1/R = 1/${r1} + 1/${r2} = 1/${rEq} 得并联总电阻 R = ${rEq} Ω；干路电流 I = U / R = ${u} / ${rEq} = ${iTotal} A（若把并联电阻错加成 ${r1 + r2} Ω 会严重算错！）。`,
          explanationEn: `Equivalent parallel resistance R = (${r1}×${r2})/(${r1}+${r2}) = ${rEq} Ω; total current I = ${u}/${rEq} = ${iTotal} A.`,
          explanationI18n: {
            ja: `並列の合成抵抗は R = (${r1}×${r2})/(${r1}+${r2}) = ${rEq} Ω なので、オームの法則より全体の電流 I = ${u}/${rEq} = ${iTotal} A です。`,
            ko: `병렬 합성저항은 R = (${r1}×${r2})/(${r1}+${r2}) = ${rEq} Ω이고, 옴의 법칙에 의해 전체 전류 I = ${u}/${rEq} = ${iTotal} A입니다.`,
            ms: `Rintangan setara selari R = (${r1}×${r2})/(${r1}+${r2}) = ${rEq} Ω; jumlah arus I = ${u}/${rEq} = ${iTotal} A.`,
          },
          scaffolds: [
            {
              promptZh: `先用 1/R = 1/${r1} + 1/${r2} 求出并联等效总电阻 R（Ω）：`,
              promptEn: `First find parallel equivalent resistance R (Ω):`,
              promptI18n: {
                ja: `まず並列の合成抵抗 R [Ω] を求めなさい：`,
                ko: `먼저 병렬 합성저항 R(Ω)을 구하시오:`,
                ms: `Mula-mula cari rintangan setara selari R (Ω):`,
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
                ja: `次に I = ${u} / ${rEq} [A] を計算しなさい：`,
                ko: `이제 I = ${u} / ${rEq}(A)의 값을 계산하시오:`,
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
        // Initialize slider AWAY from r2 so the widget does not display the final answer out-of-the-box!
        const neutralInitR2 = r2 === r1 ? r1 + 6 : r1;
        core = {
          promptZh: `如图将电阻 R₁ = ${r1} Ω 与 R₂ = ${r2} Ω 并联接入 ${u} V 电路，求它们的并联等效总电阻 R（单位 Ω）：`,
          promptEn: `Two resistors R₁ = ${r1} Ω and R₂ = ${r2} Ω are connected in parallel across a ${u} V source. Find their equivalent resistance R (in Ω):`,
          promptI18n: {
            ja: `図のように、2 つの抵抗 R₁ = ${r1} Ω と R₂ = ${r2} Ω を並列につなぎました。合成抵抗 R [Ω] を求めなさい。`,
            ko: `그림과 같이 두 저항 R₁ = ${r1} Ω과 R₂ = ${r2} Ω을 병렬로 연결했습니다. 합성저항 R(단위: Ω)을 구하시오.`,
            ms: `Dua perintang R₁ = ${r1} Ω dan R₂ = ${r2} Ω disambungkan secara selari. Cari rintangan setaranya R (dalam Ω):`,
          },
          latexFormula: `\\frac{1}{R_{\\text{eq}}} = \\frac{1}{R_1} + \\frac{1}{R_2} = \\frac{1}{${r1}} + \\frac{1}{${r2}}`,
          svgDiagram: svgCircuit("parallel", `R₁=${r1}Ω`, `R₂=${r2}Ω`, `${u}V`),
          interactiveWidget: {
            kind: "ohm_parallel_lab",
            min: 2,
            max: 36,
            step: 1,
            initialValue: neutralInitR2,
            fixedParamA: r1,
            captionZh: `固定 R₁=${r1}Ω，拖动滑块探索并联总电阻与支路电阻的关系（注意总电阻恒小于最小支路电阻）`,
            captionEn: `With R₁=${r1}Ω fixed, explore how parallel equivalent resistance behaves as R₂ varies`,
            captionI18n: {
              ja: `R₁=${r1}Ω を固定して R₂ を変化させ、並列の合成抵抗の性質を観察してみましょう`,
              ko: `R₁=${r1}Ω을 고정하고 R₂를 조절하며 병렬 합성저항의 변화를 관찰해 보세요`,
              ms: `Dengan R₁=${r1}Ω ditetapkan, terokai bagaimana rintangan setara berubah apabila R₂ dilaraskan`,
            },
            bindToAnswer: false,
          },
          answer: `${rEq}`,
          unit: "Ω",
          explanationZh: `1/R = 1/${r1} + 1/${r2} = 1/${rEq}，取倒数得 R = ${rEq} Ω（并联越并越宽、总电阻必小于最小支路 ${r1} Ω，绝不是相加得 ${r1 + r2} Ω！）。`,
          explanationEn: `1/R = 1/${r1} + 1/${r2} = 1/${rEq} ⇒ R = ${rEq} Ω.`,
          explanationI18n: {
            ja: `1/R = 1/${r1} + 1/${r2} = 1/${rEq} より、逆数をとると R = ${rEq} Ω です（和の ${r1 + r2} Ω にはなりません）。`,
            ko: `1/R = 1/${r1} + 1/${r2} = 1/${rEq}이므로 역수를 취하면 R = ${rEq} Ω입니다 (두 저항의 합 ${r1 + r2} Ω이 아닙니다).`,
            ms: `1/R = 1/${r1} + 1/${r2} = 1/${rEq} ⇒ R = ${rEq} Ω.`,
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
              hintI18n: { ja: `通分してたす`, ko: `통분하여 더하기`, ms: `Tambah pecahan` },
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
              hintI18n: { ja: `逆数をとる`, ko: `역수를 취하기`, ms: `Salingan` },
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

    // 24. Physics: Work & Kinetic Energy E_k = 1/2 m v^2 (challenge solves inverse speed v from E_k)
    case "phy_work_energy": {
      if (dTier === "challenge") {
        const m = rng.pick([2, 4, 6, 8]);
        const v = rng.int(4, 10);
        const ek = 0.5 * m * v * v;
        const noSqrtTrap = v * v;
        const forgetTwoTrap = Math.round((ek / m) * 10) / 10;
        core = {
          promptZh: `质量 m = ${m} kg 的实验滑块在水平轨道上的动能为 E_k = ${ek} J，求此时滑块的运动速度大小 v（单位 m/s）：`,
          promptEn: `A ${m} kg lab glider has kinetic energy E_k = ${ek} J on a horizontal track. Find its speed v (in m/s):`,
          promptI18n: {
            ja: `質量 ${m} kg の滑走体の運動エネルギーが E_k = ${ek} J であるとき、速さ v [m/s] を求めなさい。`,
            ko: `질량 ${m} kg인 활주체의 운동 에너지가 E_k = ${ek} J일 때, 속력 v(단위: m/s)를 구하시오.`,
            ms: `Sebuah peluncur makmal ${m} kg mempunyai tenaga kinetik E_k = ${ek} J. Cari lajunya v (dalam m/s):`,
          },
          answer: `${v}`,
          unit: "m/s",
          explanationZh: `由 E_k = ½mv² 变形得 v² = 2E_k / m = 2×${ek} / ${m} = ${v * v}，开算术平方根得 v = ${v} m/s（切勿忘记开方写成 ${noSqrtTrap}，或漏乘 2）。`,
          explanationEn: `From E_k = ½mv², v² = 2E_k / m = 2(${ek})/${m} = ${v * v} ⇒ v = √${v * v} = ${v} m/s.`,
          explanationI18n: {
            ja: `E_k = ½mv² より v² = 2E_k / m = 2×${ek}/${m} = ${v * v} となり、v = √${v * v} = ${v} m/s です。`,
            ko: `E_k = ½mv²에서 v² = 2E_k / m = 2×${ek}/${m} = ${v * v}이므로 v = √${v * v} = ${v} m/s입니다.`,
            ms: `Daripada E_k = ½mv², v² = 2E_k / m = 2(${ek})/${m} = ${v * v} ⇒ v = ${v} m/s.`,
          },
          scaffolds: [
            {
              promptZh: `第一步：由 v² = 2E_k / m 计算 2 × ${ek} ÷ ${m} = ?`,
              promptEn: `Step 1: Compute v² = 2 × ${ek} / ${m}:`,
              promptI18n: {
                ja: `ステップ 1：v² = 2 × ${ek} ÷ ${m} を計算しなさい：`,
                ko: `1단계: v² = 2 × ${ek} ÷ ${m}의 값을 구하시오:`,
                ms: `Langkah 1: Hitung v² = 2 × ${ek} / ${m}:`,
              },
              hintZh: `(2 × ${ek}) ÷ ${m}`,
              hintEn: `(2 × ${ek}) / ${m}`,
              expectedAnswer: `${v * v}`,
            },
            {
              promptZh: `第二步：对 ${v * v} 开正平方根求出速度 v（m/s）：`,
              promptEn: `Step 2: Take √${v * v} to find v (in m/s):`,
              promptI18n: {
                ja: `ステップ 2：√${v * v} から速さ v [m/s] を求めなさい：`,
                ko: `2단계: √${koP(v * v, "을", "를")} 계산하여 속력 v(m/s)를 구하시오:`,
                ms: `Langkah 2: Ambil √${v * v} untuk mencari v (dalam m/s):`,
              },
              hintZh: `√${v * v}`,
              hintEn: `√${v * v}`,
              expectedAnswer: `${v}`,
            },
          ],
          distractors: [
            { text: `${noSqrtTrap}`, misconceptionTag: "misc_ke_linear_v" },
            { text: `${forgetTwoTrap}`, misconceptionTag: "misc_triangle_forget_half" },
            { text: `${2 * v}` },
          ],
          misconceptionsByValue: { [`${noSqrtTrap}`]: "misc_ke_linear_v" },
        };
      } else {
        const m = dTier === "standard" ? rng.pick([4, 6, 8]) : rng.pick([2, 4]);
        const v = dTier === "standard" ? rng.int(5, 9) : rng.int(3, 6);
        const ek = 0.5 * m * v * v;
        const linearTrap = 0.5 * m * v;
        core = {
          promptZh: `一个质量 m = ${m} kg 的滑块在光滑水平面上以速度 v = ${v} m/s 运动，它的动能 E_k 是多少焦耳（J）？`,
          promptEn: `A ${m} kg glider moves at speed v = ${v} m/s. Find its kinetic energy E_k in joules (J):`,
          promptI18n: {
            ja: `質量 ${m} kg の物体が、なめらかな水平面上を速さ v = ${v} m/s で運動しています。この物体の運動エネルギー E_k は何ジュール (J) ですか。`,
            ko: `질량 ${m} kg인 물체가 마찰이 없는 수평면에서 속력 v = ${v} m/s로 운동하고 있습니다. 이 물체의 운동 에너지 E_k는 몇 줄(J)입니까?`,
            ms: `Sebuah peluncur ${m} kg bergerak pada laju v = ${v} m/s. Cari tenaga kinetiknya E_k dalam joule (J):`,
          },
          answer: `${ek}`,
          unit: "J",
          explanationZh: `由动能公式 E_k = ½mv² = 0.5 × ${m} × ${v}² = ${ek} J（注意速度项必须平方，漏平方会错算成 ${linearTrap} J）。`,
          explanationEn: `E_k = ½mv² = 0.5 × ${m} × ${v}² = ${ek} J.`,
          explanationI18n: {
            ja: `運動エネルギーの式より E_k = ½mv² = 0.5 × ${m} × ${v}² = ${ek} J です（速さを 2 乗し忘れると ${linearTrap} J と誤ってしまいます）。`,
            ko: `운동 에너지 공식에 의해 E_k = ½mv² = 0.5 × ${m} × ${v}² = ${ek} J입니다 (속력을 제곱하지 않으면 ${linearTrap} J로 잘못 계산하게 됩니다).`,
            ms: `Menggunakan rumus tenaga kinetik, E_k = ½mv² = 0.5 × ${m} × ${v}² = ${ek} J.`,
          },
          scaffolds: [
            {
              promptZh: `先算速度的平方 v² = ${v}² = ?`,
              promptEn: `First compute v² = ${v}²:`,
              promptI18n: {
                ja: `まず v² = ${v}² を計算しなさい：`,
                ko: `먼저 v² = ${v}²의 값을 구하시오:`,
                ms: `Mula-mula hitung v² = ${v}²:`,
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
      }
      break;
    }

    // 25. Chemistry: Stoichiometry & Conservation of Mass (challenge adds excess/limiting reactant!)
    case "chem_balance_mass": {
      if (dTier === "challenge") {
        // Limiting reactant: 2H2 + O2 -> 2H2O (exact mass ratio H2 : O2 : H2O = 1 : 8 : 9)
        const k = rng.int(2, 6);
        const excessH2 = rng.int(2, 5);
        const givenH2 = k + excessH2;
        const givenO2 = 8 * k;
        const h2oMass = 9 * k;
        const naiveSumTrap = givenH2 + givenO2;
        core = {
          promptZh: `在密闭容器中根据 2H₂ + O₂ = 2H₂O（反应质量比 H₂ : O₂ : H₂O = 1 : 8 : 9），将 ${givenH2} g 氢气与 ${givenO2} g 氧气混合点燃充分反应。最终生成水的质量是多少 g？`,
          promptEn: `In 2H₂ + O₂ → 2H₂O (exact reacting mass ratio H₂ : O₂ : H₂O = 1 : 8 : 9), ${givenH2} g of H₂ is ignited with ${givenO2} g of O₂. How many grams of H₂O are formed?`,
          promptI18n: {
            ja: `化学反応式 2H₂ + O₂ → 2H₂O（反応する質量比 H₂ : O₂ : H₂O = 1 : 8 : 9）において、水素 ${givenH2} g と酸素 ${givenO2} g を混合して完全に反応させました。生成する水 H₂O は何 g ですか。`,
            ko: `화학 반응식 2H₂ + O₂ → 2H₂O(반응 질량비 H₂ : O₂ : H₂O = 1 : 8 : 9)에서 수소 ${givenH2} g과 산소 ${givenO2} g을 혼합하여 완전히 반응시켰습니다. 생성되는 물 H₂O는 몇 g입니까?`,
            ms: `Dalam 2H₂ + O₂ → 2H₂O (nisbah jisim tindak balas H₂ : O₂ : H₂O = 1 : 8 : 9), ${givenH2} g H₂ dicampur dan dibakar dengan ${givenO2} g O₂. Berapakah jisim H₂O (dalam g) yang terbentuk?`,
          },
          answer: `${h2oMass}`,
          unit: "g",
          explanationZh: `按质量比 1 : 8，${givenO2} g 氧气最多只能消耗 ${k} g 氢气（剩余 ${excessH2} g 氢气未反应）；仅实际参加反应的物质计入生成物：${k} g + ${givenO2} g = ${h2oMass} g（切勿把过量未反应的氢气直接加进去误得 ${naiveSumTrap} g！）。`,
          explanationEn: `By the 1 : 8 ratio, ${givenO2} g of O₂ reacts with only ${k} g of H₂ (${excessH2} g of H₂ remains unreacted). Mass of H₂O formed = ${k} + ${givenO2} = ${h2oMass} g (not ${naiveSumTrap} g).`,
          explanationI18n: {
            ja: `質量比 1 : 8 より、酸素 ${givenO2} g と反応する水素は ${k} g だけです（${excessH2} g の水素は余ります）。したがって生成する水は ${k} + ${givenO2} = ${h2oMass} g です（単純な和 ${naiveSumTrap} g ではありません）。`,
            ko: `질량비 1 : 8에 의해 산소 ${givenO2} g은 수소 ${k} g과만 반응하고 수소 ${excessH2} g은 남습니다. 따라서 생성되는 물의 질량은 ${k} + ${givenO2} = ${h2oMass} g입니다 (단순 합 ${naiveSumTrap} g이 아닙니다).`,
            ms: `Mengikut nisbah 1 : 8, ${givenO2} g O₂ hanya bertindak balas dengan ${k} g H₂ (${excessH2} g H₂ berlebihan). Jisim H₂O = ${k} + ${givenO2} = ${h2oMass} g (bukan ${naiveSumTrap} g).`,
          },
          scaffolds: [
            {
              promptZh: `第一步：按 H₂ : O₂ = 1 : 8，${givenO2} g 氧气完全反应实际消耗多少 g 氢气？`,
              promptEn: `Step 1: Using H₂ : O₂ = 1 : 8, how many grams of H₂ actually react with ${givenO2} g of O₂?`,
              promptI18n: {
                ja: `ステップ 1：質量比 1 : 8 より、酸素 ${givenO2} g と実際に反応する水素は何 g ですか？`,
                ko: `1단계: 질량비 1 : 8에 따라 산소 ${givenO2} g과 실제로 반응하는 수소는 몇 g입니까?`,
                ms: `Langkah 1: Mengikut nisbah 1 : 8, berapakah jisim H₂ (g) yang bertindak balas dengan ${givenO2} g O₂?`,
              },
              hintZh: `${givenO2} ÷ 8`,
              hintEn: `${givenO2} / 8`,
              expectedAnswer: `${k}`,
            },
            {
              promptZh: `第二步：将实际反应的氢气 ${k} g 与氧气 ${givenO2} g 相加，生成水多少 g？`,
              promptEn: `Step 2: Sum the reacted masses ${k} + ${givenO2} (in g):`,
              promptI18n: {
                ja: `ステップ 2：実際に反応した ${k} g と ${givenO2} g の和を求めなさい：`,
                ko: `2단계: 실제로 반응한 질량 ${k} + ${koP(givenO2, "을", "를")} 더하시오:`,
                ms: `Langkah 2: Jumlahkan jisim yang bertindak balas ${k} + ${givenO2}:`,
              },
              hintZh: `${k} + ${givenO2}`,
              hintEn: `${k} + ${givenO2}`,
              expectedAnswer: `${h2oMass}`,
            },
          ],
          distractors: [
            { text: `${naiveSumTrap}`, misconceptionTag: "misc_chem_alter_subscript" },
            { text: `${9 * givenH2}`, misconceptionTag: "misc_chem_alter_subscript" },
            { text: `${givenO2}` },
          ],
          misconceptionsByValue: {
            [`${naiveSumTrap}`]: "misc_chem_alter_subscript",
            [`${9 * givenH2}`]: "misc_chem_alter_subscript",
          },
        };
      } else {
        const k = dTier === "standard" ? rng.int(5, 11) : rng.int(2, 6);
        const h2Mass = 1 * k;
        const o2Mass = 8 * k;
        const h2oMass = 9 * k;
        core = {
          promptZh: `根据质量守恒定律与化学方程式 2H₂ + O₂ = 2H₂O（质量比 1 : 8 : 9），${h2Mass} g 氢气与 ${o2Mass} g 氧气恰好完全反应，生成水的质量是多少 g？`,
          promptEn: `By conservation of mass in 2H₂ + O₂ → 2H₂O (mass ratio 1 : 8 : 9), if ${h2Mass} g of H₂ reacts completely with ${o2Mass} g of O₂, how many grams of H₂O are produced?`,
          promptI18n: {
            ja: `質量保存の法則と化学反応式 2H₂ + O₂ → 2H₂O（質量比 1 : 8 : 9）より、${h2Mass} g の水素 H₂ と ${o2Mass} g の酸素 O₂ が過不足なく反応したとき、生成する水 H₂O は何 g ですか。`,
            ko: `질량 보존 법칙과 화학 반응식 2H₂ + O₂ → 2H₂O(질량비 1 : 8 : 9)에 따라, 수소 H₂ ${h2Mass} g과 산소 O₂ ${o2Mass} g이 모두 반응할 때 생성되는 물 H₂O는 몇 g입니까?`,
            ms: `Mengikut hukum keabadian jisim dalam 2H₂ + O₂ → 2H₂O (nisbah jisim 1 : 8 : 9), jika ${h2Mass} g H₂ bertindak balas lengkap dengan ${o2Mass} g O₂, berapakah jisim H₂O (dalam g) yang terhasil?`,
          },
          answer: `${h2oMass}`,
          unit: "g",
          explanationZh: `恰好完全反应时，参加反应的各物质质量总和等于生成物质量总和：${h2Mass} g + ${o2Mass} g = ${h2oMass} g。`,
          explanationEn: `By conservation of mass when reactants are in exact stoichiometric ratio: ${h2Mass} + ${o2Mass} = ${h2oMass} g.`,
          explanationI18n: {
            ja: `過不足なく反応するとき、反応した物質の質量の和は生成した物質の質量の和に等しくなります（質量保存の法則）：${h2Mass} g + ${o2Mass} g = ${h2oMass} g です。`,
            ko: `반응물이 남김없이 모두 반응하면 반응한 물질의 질량 합은 생성된 물질의 질량 합과 같습니다(질량 보존 법칙): ${h2Mass} g + ${o2Mass} g = ${h2oMass} g입니다.`,
            ms: `Mengikut hukum keabadian jisim apabila bahan tindak balas berada dalam nisbah stoikiometri yang tepat: ${h2Mass} + ${o2Mass} = ${h2oMass} g.`,
          },
          scaffolds: [
            {
              promptZh: `比例系数：${h2Mass} g 氢气是基准 1 g 的多少倍？`,
              promptEn: `By what factor is ${h2Mass} g of H₂ scaled relative to 1 g in the 1 : 8 : 9 ratio?`,
              promptI18n: {
                ja: `質量比 1 : 8 : 9 において、水素 ${h2Mass} g は 1 g の何倍ですか？`,
                ko: `질량비 1 : 8 : 9에서 수소 ${h2Mass} g은 1 g의 몇 배입니까?`,
                ms: `Dalam nisbah 1 : 8 : 9, ${h2Mass} g H₂ ialah berapa kali ganda daripada 1 g?`,
              },
              hintZh: `${h2Mass} ÷ 1`,
              hintEn: `${h2Mass} / 1`,
              expectedAnswer: `${k}`,
            },
            {
              promptZh: `根据质量守恒，反应物总质量 ${h2Mass} + ${o2Mass} 等于多少 g？`,
              promptEn: `Sum the reacting masses ${h2Mass} + ${o2Mass} (in g):`,
              promptI18n: {
                ja: `反応した H₂ と O₂ の質量の和 ${h2Mass} + ${o2Mass} [g] を求めなさい：`,
                ko: `반응한 H₂와 O₂의 질량 합 ${h2Mass} + ${o2Mass}(g)를 구하시오:`,
                ms: `Jumlahkan jisim yang bertindak balas ${h2Mass} + ${o2Mass} (dalam g):`,
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
      }
      break;
    }

    // 26. Biology: Mendelian Punnett square probability (unified ja パネットの方形（交配表） + quantitative F2 challenge)
    case "bio_punnett": {
      if (dTier === "challenge") {
        // Quantitative F2 population expectation from Aa x Aa
        const totalOffspring = rng.pick([160, 240, 320, 400, 480]);
        const askHetero = rng.pick([true, false]);
        const expectedCount = askHetero ? totalOffspring / 2 : totalOffspring / 4;
        const domCountTrap = (totalOffspring * 3) / 4;
        const otherCountTrap = askHetero ? totalOffspring / 4 : totalOffspring / 2;
        const targetZh = askHetero ? "杂合子（Aa）" : "隐性纯合子（aa）";
        const targetEn = askHetero ? "heterozygous (Aa)" : "homozygous recessive (aa)";
        const targetJa = askHetero ? "ヘテロ接合体（Aa）" : "潜性ホモ接合体（aa）";
        const targetKo = askHetero ? "이형 접합자(Aa)" : "열성 동형 접합자(aa)";
        const targetMs = askHetero ? "heterozigot (Aa)" : "homozigot resesif (aa)";
        const fracStr = askHetero ? "2/4 = 1/2" : "1/4";
        core = {
          promptZh: `在孟德尔豌豆杂交实验中，两株杂合高茎豌豆（Aa × Aa）杂交共获得 ${totalOffspring} 株子代植株。按孟德尔分离定律，理论上其中基因型为${targetZh}的植株约有多少株？`,
          promptEn: `In a Mendelian cross Aa × Aa yielding ${totalOffspring} F₂ offspring plants, how many plants are theoretically expected to have the ${targetEn} genotype?`,
          promptI18n: {
            ja: `メンデルの交配実験 Aa × Aa によって得られた子（F₂）が合計 ${totalOffspring} 個体あるとき、理論上、遺伝子型が${targetJa}となる個体はおよそ何個体ですか。`,
            ko: `멘델의 교배 실험 Aa × Aa를 통해 얻은 자손(F₂)이 총 ${totalOffspring}개체일 때, 이론적으로 유전자형이 ${targetKo}인 개체는 약 몇 개체입니까?`,
            ms: `Dalam kacukan Mendel Aa × Aa yang menghasilkan ${totalOffspring} pokok anak F₂, berapakah bilangan pokok yang dijangka mempunyai genotip ${targetMs} secara teori?`,
          },
          answer: `${expectedCount}`,
          explanationZh: `由庞氏方格（1 AA : 2 Aa : 1 aa），${targetZh}占总数的 ${fracStr}；故期望株数 = ${totalOffspring} × (${askHetero ? "1/2" : "1/4"}) = ${expectedCount} 株。`,
          explanationEn: `From the Punnett square (1 AA : 2 Aa : 1 aa), ${targetEn} accounts for ${fracStr} of offspring: ${totalOffspring} × (${askHetero ? "1/2" : "1/4"}) = ${expectedCount}.`,
          explanationI18n: {
            ja: `パネットの方形（交配表）より遺伝子型比は 1 AA : 2 Aa : 1 aa なので、${targetJa}の割合は ${fracStr} です。したがって ${totalOffspring} × (${askHetero ? "1/2" : "1/4"}) = ${expectedCount} 個体です。`,
            ko: `퍼넷 사각형에서 유전자형 비는 1 AA : 2 Aa : 1 aa이므로 ${targetKo}의 비율은 ${fracStr}입니다. 따라서 ${totalOffspring} × (${askHetero ? "1/2" : "1/4"}) = ${expectedCount}개체입니다.`,
            ms: `Daripada segi empat Punnett (1 AA : 2 Aa : 1 aa), nisbah ${targetMs} ialah ${fracStr}, maka ${totalOffspring} × (${askHetero ? "1/2" : "1/4"}) = ${expectedCount}.`,
          },
          scaffolds: [
            {
              promptZh: `第一步：在 Aa × Aa 的 4 格庞氏表中，${targetZh}占几分之几（写最简分数）？`,
              promptEn: `Step 1: What simplest fraction of the 4 Punnett cells has genotype ${askHetero ? "Aa" : "aa"}?`,
              promptI18n: {
                ja: `ステップ 1：パネットの方形（交配表）の 4 マスのうち、${askHetero ? "Aa" : "aa"} が占める割合を既約分数で答えなさい：`,
                ko: `1단계: 퍼넷 사각형 4칸 중 ${askHetero ? "Aa" : "aa"}가 차지하는 비율을 기약분수로 쓰시오:`,
                ms: `Langkah 1: Apakah pecahan termudah bagi ${askHetero ? "Aa" : "aa"} daripada 4 petak Punnett?`,
              },
              hintZh: askHetero ? `2/4 约分` : `4 格中占 1 格`,
              hintEn: askHetero ? `2 out of 4` : `1 out of 4`,
              hintI18n: {
                ja: askHetero ? `4 マス中 2 マス（約分する）` : `4 マス中 1 マス`,
                ko: askHetero ? `4칸 중 2칸(약분)` : `4칸 중 1칸`,
                ms: askHetero ? `2 daripada 4 petak` : `1 daripada 4 petak`,
              },
              expectedAnswer: askHetero ? `1/2` : `1/4`,
            },
            {
              promptZh: `第二步：乘以子代总数 ${totalOffspring}，求理论株数：`,
              promptEn: `Step 2: Multiply ${totalOffspring} by ${askHetero ? "1/2" : "1/4"}:`,
              promptI18n: {
                ja: `ステップ 2：全体の個体数 ${totalOffspring} に ${askHetero ? "1/2" : "1/4"} をかけなさい：`,
                ko: `2단계: 전체 개체 수 ${totalOffspring}에 ${askHetero ? "1/2" : "1/4"}을 곱하시오:`,
                ms: `Langkah 2: Darabkan ${totalOffspring} dengan ${askHetero ? "1/2" : "1/4"}:`,
              },
              hintZh: `${totalOffspring} ÷ ${askHetero ? 2 : 4}`,
              hintEn: `${totalOffspring} / ${askHetero ? 2 : 4}`,
              expectedAnswer: `${expectedCount}`,
            },
          ],
          distractors: [
            { text: `${otherCountTrap}`, misconceptionTag: "misc_bio_gambler_fallacy" },
            { text: `${domCountTrap}` },
            { text: `${totalOffspring}` },
          ],
          misconceptionsByValue: { [`${otherCountTrap}`]: "misc_bio_gambler_fallacy" },
        };
      } else {
        const mode = rng.pick(["hetero_hetero_rec", "hetero_hetero_dom", "test_cross"] as const);
        if (mode === "test_cross") {
          core = {
            promptZh: `在孟德尔豌豆杂交实验中，高茎杂合子（Aa）与矮茎隐性纯合子（aa）测交，子代出现矮茎（aa）的概率是多少（填百分数如 50%）？`,
            promptEn: `In a Mendelian test cross Aa × aa, what percentage of offspring are expected to be homozygous recessive (aa)?`,
            promptI18n: {
              ja: `メンデルの検定交雑 Aa × aa において、子のうち潜性ホモ接合体（aa）となるものは何 % と予想されますか。`,
              ko: `멘델의 검정 교배 Aa × aa에서 자손 중 열성 동형 접합자(aa)는 몇 %로 예상됩니까?`,
              ms: `Dalam kacukan uji Mendel Aa × aa, berapakah peratusan anak yang dijangka homozigot resesif (aa)?`,
            },
            answer: `50%`,
            acceptedEquivalents: ["1/2", "0.5", "50"],
            explanationZh: `Aa 产生 A、a 配子各占 1/2，aa 只产生 a 配子，子代基因型 Aa : aa = 1 : 1，故 aa 占 50%（每次受精独立同分布）。`,
            explanationEn: `Punnett square for Aa × aa yields 50% Aa and 50% aa.`,
            explanationI18n: {
              ja: `パネットの方形（交配表）より、Aa × aa の子は Aa が 50%、aa が 50% となります。`,
              ko: `퍼넷 사각형에 따르면 Aa × aa 자손은 Aa 50%, aa 50%입니다.`,
              ms: `Segi empat Punnett bagi Aa × aa menghasilkan 50% Aa dan 50% aa.`,
            },
            scaffolds: [
              {
                promptZh: `亲本 Aa 产生隐性配子 a 的概率是几分之几？`,
                promptEn: `Probability that parent Aa contributes allele 'a':`,
                promptI18n: {
                  ja: `親 Aa が対立遺伝子 a をもつ配偶子をつくる確率は分数でいくらですか？`,
                  ko: `어버이 Aa가 대립유전자 a를 물려줄 확률은 분수로 얼마입니까?`,
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
                  ja: `1/2 を百分率（%）で表しなさい：`,
                  ko: `1/2을 백분율(%)로 나타내시오:`,
                  ms: `Nyatakan 1/2 dalam bentuk peratusan:`,
                },
                hintZh: `乘以 100%`,
                hintEn: `Multiply by 100%`,
                hintI18n: {
                  ja: `100% をかけます`,
                  ko: `100%를 곱합니다`,
                  ms: `Darabkan dengan 100%`,
                },
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
              ja: `一遺伝子雑種の交配 Aa × Aa で、子のうち顕性の表現型（AA または Aa）を示すものは何 % ですか。`,
              ko: `단성 잡종 교배 Aa × Aa에서 자손 중 우성 표현형(AA 또는 Aa)을 나타내는 비율은 몇 %입니까?`,
              ms: `Dalam kacukan monohibrid Aa × Aa, berapakah peratusan anak yang menunjukkan fenotip dominan (AA atau Aa)?`,
            },
            answer: `75%`,
            acceptedEquivalents: ["3/4", "0.75", "75"],
            explanationZh: `Aa × Aa 庞氏表四格为 1 AA : 2 Aa : 1 aa，显性性状（AA + Aa）占 3/4 = 75%。`,
            explanationEn: `Punnett square gives 1 AA : 2 Aa : 1 aa, so 3/4 = 75% show the dominant trait.`,
            explanationI18n: {
              ja: `パネットの方形（交配表）より 1 AA : 2 Aa : 1 aa となるので、顕性形質を示す割合は 3/4 = 75% です。`,
              ko: `퍼넷 사각형에서 1 AA : 2 Aa : 1 aa이므로 우성 형질을 나타내는 비율은 3/4 = 75%입니다.`,
              ms: `Segi empat Punnett memberikan 1 AA : 2 Aa : 1 aa, maka 3/4 = 75% menunjukkan ciri dominan.`,
            },
            scaffolds: [
              {
                promptZh: `2×2 庞氏表共 4 种等可能组合，其中含至少一个 A 的有几格？`,
                promptEn: `Out of 4 Punnett cells (AA, Aa, aA, aa), how many carry at least one A?`,
                promptI18n: {
                  ja: `パネットの方形（交配表）の 4 マス（AA, Aa, aA, aa）のうち、A を少なくとも 1 つ含むのは何マスですか？`,
                  ko: `퍼넷 사각형의 4칸(AA, Aa, aA, aa) 중 A를 적어도 하나 가진 칸은 몇 개입니까?`,
                  ms: `Daripada 4 petak Punnett (AA, Aa, aA, aa), berapakah petak yang mengandungi sekurang-kurangnya satu A?`,
                },
                hintZh: `AA, Aa, aA`,
                hintEn: `Count cells with A`,
                hintI18n: { ja: `A を含むマスを数える`, ko: `A가 들어 있는 칸 세기`, ms: `Kira petak yang mengandungi A` },
                expectedAnswer: `3`,
              },
              {
                promptZh: `3/4 写成百分数是多少？`,
                promptEn: `Convert 3/4 to a percentage:`,
                promptI18n: {
                  ja: `3/4 を百分率（%）で表しなさい：`,
                  ko: `3/4을 백분율(%)로 나타내시오:`,
                  ms: `Tukarkan 3/4 kepada peratusan:`,
                },
                hintZh: `乘以 100%`,
                hintEn: `Multiply by 100%`,
                hintI18n: {
                  ja: `100% をかけます`,
                  ko: `100%를 곱합니다`,
                  ms: `Darabkan dengan 100%`,
                },
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
              ja: `保因者どうしの両親（Aa × Aa）には、すでに発症した子（aa）が 1 人います。次に生まれる子の遺伝子型が aa となる確率は何 % ですか。`,
              ko: `보인자인 부모(Aa × Aa) 사이에서 이미 형질이 발현된 자녀(aa)가 한 명 태어났습니다. 다음 자녀의 유전자형이 aa일 확률은 몇 %입니까?`,
              ms: `Dua ibu bapa pembawa (Aa × Aa) sudah mempunyai seorang anak yang terjejas (aa). Apakah kebarangkalian anak SETERUSNYA mempunyai genotip aa?`,
            },
            answer: `25%`,
            acceptedEquivalents: ["1/4", "0.25", "25"],
            explanationZh: `每次独立生殖事件互不影响（克服赌徒谬误）！Aa × Aa 产生 aa 的概率恒为 1/2 × 1/2 = 1/4 = 25%，绝不是“已经有1个患病所以接下来3个必正常（0%）”！`,
            explanationEn: `Each birth is an independent event! Aa × Aa always has a 1/4 = 25% chance of aa.`,
            explanationI18n: {
              ja: `出産はそれぞれ独立な事象です。パネットの方形（交配表）より、Aa × Aa から aa が生まれる確率は毎回 1/4 = 25% で変わりません。`,
              ko: `각각의 출산은 서로 독립적인 사건입니다. 퍼넷 사각형에 의해 Aa × Aa에서 aa가 나올 확률은 매번 1/4 = 25%입니다.`,
              ms: `Setiap kelahiran ialah peristiwa tak bersandar! Aa × Aa sentiasa mempunyai peluang 1/4 = 25% untuk menghasilkan aa.`,
            },
            scaffolds: [
              {
                promptZh: `二胎基因组合受头胎结果影响吗？直接算 Aa × Aa 得到 aa 的概率分数：`,
                promptEn: `Since births are independent, what fraction of Aa × Aa is aa?`,
                promptI18n: {
                  ja: `出産は独立なので、パネットの方形（交配表）で Aa × Aa のうち aa となる割合を分数で答えなさい：`,
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
                  ja: `1/4 を百分率（%）で表しなさい：`,
                  ko: `1/4을 백분율(%)로 나타내시오:`,
                  ms: `Tulis 1/4 sebagai peratusan:`,
                },
                hintZh: `乘以 100%`,
                hintEn: `Multiply by 100%`,
                hintI18n: {
                  ja: `100% をかけます`,
                  ko: `100%를 곱합니다`,
                  ms: `Darabkan dengan 100%`,
                },
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
      }
      break;
    }

    // 27. English: Relative clauses (multi-answer across which/where/whose/prep+which, ZERO scaffold leaks, full dTier split!)
    case "eng_relative_clause": {
      if (dTier === "challenge") {
        // Challenge: Preposition + relative pronoun (at which / in which / through which)
        const challengeItems = [
          {
            sentence: `"The temperature ______ pure water boils at standard atmospheric pressure is 100°C."`,
            ans: "at which",
            trap1: "which",
            trap2: "in that",
            trap3: "what",
            prepHint: "boils AT that temperature",
            explZh: `从句完整结构为 "pure water boils AT the temperature"，介词提前后修饰指物名词 temperature，应填 "at which"（介词后不能接 that，单填 which 则缺介词 at）。`,
            explEn: `The clause reconstructs as "pure water boils AT that temperature"; fronting the preposition before a non-human antecedent requires "at which".`,
            explJa: `元の文は "pure water boils AT the temperature" です。前置詞 at を前に出し、先行詞 temperature（物）を受けるため "at which" を用います。`,
            explKo: `원래 절은 "pure water boils AT the temperature"이므로 전치사 at과 사물 선행사를 받는 관계대명사가 결합한 "at which"가 정답입니다.`,
            explMs: `Klausa asal ialah "pure water boils AT the temperature"; kata sendi nama "at" diikuti kata ganti nama relatif "which" menghasilkan "at which".`,
          },
          {
            sentence: `"Optical fiber is a transparent medium ______ light signals travel with minimal loss."`,
            ans: "through which",
            trap1: "which",
            trap2: "through that",
            trap3: "whom",
            prepHint: "light signals travel THROUGH the medium",
            explZh: `从句语义为 "light signals travel THROUGH the medium"，介词 through 提前修饰 medium，必须使用 "through which"（介词后不可用 that）。`,
            explEn: `Light signals travel THROUGH the medium, so fronting the preposition gives "through which" ("that" cannot follow a preposition).`,
            explJa: `"light signals travel THROUGH the medium" の前置詞 through が前に出る形なので、"through which" が正解です（前置詞の直後に that は使えません）。`,
            explKo: `"light signals travel THROUGH the medium"에서 전치사 through가 앞으로 이동한 구조이므로 "through which"가 정답입니다(전치사 뒤에 that 불가).`,
            explMs: `Isyarat cahaya bergerak MELALUI medium itu ("travel through the medium"), maka bentuk yang betul ialah "through which".`,
          },
          {
            sentence: `"The researchers documented the exact conditions ______ the crystal structure remained stable."`,
            ans: "under which",
            trap1: "which",
            trap2: "under that",
            trap3: "whose",
            prepHint: "remained stable UNDER those conditions",
            explZh: `固定搭配为 "remain stable UNDER the conditions"，介词 under 提前后接指物关系代词，故填 "under which"。`,
            explEn: `Because a structure remains stable UNDER certain conditions, the fronted preposition + relative pronoun form is "under which".`,
            explJa: `「その条件下で（under the conditions）」を表すため、前置詞 + 関係代名詞の "under which" を選びます。`,
            explKo: `'그 조건 아래에서(under the conditions)'라는 부사구가 필요하므로 전치사 + 관계대명사 형태인 "under which"가 알맞습니다.`,
            explMs: `Kolokasi yang tepat ialah "under those conditions", maka gabungan kata sendi nama dan kata ganti nama relatif ialah "under which".`,
          },
        ] as const;
        const item = rng.pick(challengeItems);
        core = {
          promptZh: `【定语从句进阶：介词+关系代词】选择唯一语法严密的选项填空：\n${item.sentence}`,
          promptEn: `[Advanced Relative Clauses] Choose the grammatically accurate option to complete the sentence:\n${item.sentence}`,
          promptI18n: {
            ja: `【関係詞の応用：前置詞＋関係代名詞】文を完成させる最も適切な語句を選びなさい：\n${item.sentence}`,
            ko: `[관계사 심화: 전치사 + 관계대명사] 문장을 완성하기에 문법적으로 가장 알맞은 것을 고르시오:\n${item.sentence}`,
            ms: `[Klausa Relatif Lanjutan] Pilih jawapan yang paling tepat dari segi tatabahasa:\n${item.sentence}`,
          },
          answer: item.ans,
          answerEn: item.ans,
          explanationZh: item.explZh,
          explanationEn: item.explEn,
          explanationI18n: { ja: item.explJa, ko: item.explKo, ms: item.explMs },
          scaffolds: [
            {
              promptZh: `第一步：把先行词放回从句末尾还原搭配（${item.prepHint}），从句谓语是不及物还是及物？是否必须带介词？（填 yes 或 no）`,
              promptEn: `Step 1: Reconstruct the clause (${item.prepHint}). Is a preposition required to link the verb to the noun? (yes/no)`,
              promptI18n: {
                ja: `ステップ 1：先行詞を後ろに戻した形（${item.prepHint}）を考えると、動詞と名詞をつなぐ前置詞が必要ですか？（yes / no）`,
                ko: `1단계: 선행사를 절 뒤에 넣어 복원하면(${item.prepHint}), 동사와 명사를 연결하는 전치사가 필요합니까? (yes/no)`,
                ms: `Langkah 1: Berdasarkan binaan asal (${item.prepHint}), adakah kata sendi nama diperlukan? (yes/no)`,
              },
              hintZh: `不及物搭配需要介词`,
              hintEn: `Preposition is needed`,
              hintI18n: {
                ja: `自動詞の結びつきには前置詞が必要です`,
                ko: `자동사 구문이므로 전치사가 필요합니다`,
                ms: `Kata sendi nama diperlukan untuk menghubungkan kata kerja`,
              },
              expectedAnswer: `yes`,
            },
            {
              promptZh: `第二步：英语语法规定介词后面指物不能接 that，请选出正确的“介词 + 关系代词”组合：`,
              promptEn: `Step 2: Remember "that" cannot directly follow a preposition; select the valid preposition + relative pronoun pair:`,
              promptI18n: {
                ja: `ステップ 2：前置詞の直後に that は置けません。正しい「前置詞＋関係代名詞」を選びなさい：`,
                ko: `2단계: 전치사 바로 뒤에 that을 쓸 수 없다는 규칙을 적용하여 올바른 표현을 고르시오:`,
                ms: `Langkah 2: Ingat bahawa "that" tidak boleh mengikuti kata sendi nama secara terus; pilih gabungan yang betul:`,
              },
              hintZh: `介词 + 指物关系代词`,
              hintEn: `Preposition + relative pronoun for things`,
              hintI18n: {
                ja: `前置詞＋物の関係代名詞 which`,
                ko: `전치사 + 사물 관계대명사 which`,
                ms: `Kata sendi nama + kata ganti nama relatif benda`,
              },
              expectedAnswer: item.ans,
            },
          ],
          distractors: [
            { text: item.trap1, textEn: item.trap1, misconceptionTag: "misc_eng_place_always_where" },
            { text: item.trap2, textEn: item.trap2 },
            { text: item.trap3, textEn: item.trap3 },
          ],
        };
      } else if (dTier === "standard") {
        // Standard: Possessive "whose" vs locative "where" vs object "which"
        const stdItems = [
          {
            sentence: `"The engineer ______ team won the clean-energy award will speak at our school tomorrow."`,
            ans: "whose",
            trap1: "who",
            trap2: "whom",
            trap3: "which",
            explZh: `空白后紧接无冠词名词 "team"，语义为 "the engineer's team"，关系词在从句中作所属定语，必须用 whose！`,
            explEn: `The noun "team" needs a possessive determiner ("the engineer's team"), so "whose" is required.`,
            explJa: `空所の直後の名詞 "team" と「その技術者のチーム（the engineer's team）」という所有関係をつくるため、所有格の "whose" を選びます。`,
            explKo: `빈칸 뒤 명사 "team"과 '그 엔지니어의 팀(the engineer's team)'이라는 소유 관계를 이루므로 소유격 관계대명사 "whose"가 정답입니다.`,
            explMs: `Kata nama "team" memerlukan penentu milik ("the engineer's team"), maka kata ganti nama relatif milik "whose" diperlukan.`,
            roleHintEn: "possessive determiner before 'team'",
          },
          {
            sentence: `"They renovated the old observatory ______ roof had been damaged by the typhoon."`,
            ans: "whose",
            trap1: "which",
            trap2: "where",
            trap3: "its",
            explZh: `"whose" 既可指人也可指物！此处还原为 "the observatory's roof"，作定语修饰 roof，填 whose（若填 its 则两套谓语无连词，构成逗号连接病句）。`,
            explEn: `"Whose" applies to things as well as people ("the observatory's roof"); "its" cannot join two clauses without a conjunction.`,
            explJa: `所有格の "whose" は人だけでなく物（observatory）にも使えます（"the observatory's roof"）。"its" には節をつなぐ働きがありません。`,
            explKo: `소유격 관계대명사 "whose"는 사물 선행사(observatory)에도 쓰입니다("the observatory's roof"). "its"는 접속 기능이 없습니다.`,
            explMs: `"Whose" boleh merujuk kepada benda ("the observatory's roof"); "its" tidak dapat menghubungkan dua klausa.`,
            roleHintEn: "possessive determiner before 'roof'",
          },
          {
            sentence: `"The marine station ______ our class analyzed coral samples is located on the southern coast."`,
            ans: "where",
            trap1: "which",
            trap2: "whom",
            trap3: "what",
            explZh: `从句 "our class analyzed coral samples" 主谓宾齐全（SVO 完整），先行词 marine station 在从句中作地点状语（at the marine station），故必须用关系副词 where！`,
            explEn: `Because "our class analyzed coral samples" already has both subject and direct object, the relative word functions as a locative adverbial ("at the station") → "where".`,
            explJa: `関係詞節 "our class analyzed coral samples" は主語も目的語もそろった完全な文なので、場所の副詞節をつくる関係副詞 "where" を用います。`,
            explKo: `관계절 "our class analyzed coral samples"는 주어와 목적어를 모두 갖춘 완전한 절이므로 장소의 관계부사 "where"를 써야 합니다.`,
            explMs: `Klausa "our class analyzed coral samples" sudah mempunyai subjek dan objek lengkap, maka kata relatif berfungsi sebagai keterangan tempat → "where".`,
            roleHintEn: "locative adverbial modifying a complete SVO clause",
          },
        ] as const;
        const item = rng.pick(stdItems);
        core = {
          promptZh: `【定语从句成分诊断】分析从句所缺语法成分，选择正确的关系词：\n${item.sentence}`,
          promptEn: `[Relative Clause Clause-Role Check] Identify the missing syntactic role and choose the correct relative word:\n${item.sentence}`,
          promptI18n: {
            ja: `【関係詞の文構造チェック】関係詞節の中で欠けている働きを見極めて、正しい関係詞を選びなさい：\n${item.sentence}`,
            ko: `[관계절 성분 진단] 관계절 안에서 빈칸이 수행하는 문법적 역할을 파악하여 알맞은 관계사를 고르시오:\n${item.sentence}`,
            ms: `[Semakan Peranan Klausa Relatif] Kenal pasti peranan tatabahasa yang diperlukan dan pilih kata relatif yang betul:\n${item.sentence}`,
          },
          answer: item.ans,
          answerEn: item.ans,
          explanationZh: item.explZh,
          explanationEn: item.explEn,
          explanationI18n: { ja: item.explJa, ko: item.explKo, ms: item.explMs },
          scaffolds: [
            {
              promptZh: `第一步：观察空白后的词组结构——不加关系词时，后面的主谓宾及名词限定词是否已经完整？（填 yes 或 no）`,
              promptEn: `Step 1: Without the relative word, is the clause right after the blank already grammatically complete (including noun determiners)? (yes/no)`,
              promptI18n: {
                ja: `ステップ 1：空所の後ろの節は、関係詞がなくても（名詞の所有格・冠詞を含め）すでに完結した文になっていますか？（yes / no）`,
                ko: `1단계: 빈칸 뒤의 절은 관계사 없이도(명사 한정사 포함) 이미 문법적으로 완전한 절입니까? (yes/no)`,
                ms: `Langkah 1: Tanpa kata relatif, adakah klausa selepas tempat kosong sudah lengkap dari segi tatabahasa (termasuk penentu kata nama)? (yes/no)`,
              },
              hintZh: `先查从句主谓宾和冠词是否完整`,
              hintEn: `Check SVO completeness and noun determiners`,
              hintI18n: {
                ja: `主語・動詞・目的語と名詞の限定詞がそろっているか確認します`,
                ko: `주어·동사·목적어와 명사 한정사가 모두 갖추어졌는지 확인합니다`,
                ms: `Semak kelengkapan subjek-kata kerja-objek serta penentu kata nama`,
              },
              expectedAnswer: item.ans === "where" ? `yes` : `no`,
            },
            {
              promptZh: `第二步：根据该句法功能选出唯一匹配的关系词：`,
              promptEn: `Step 2: Select the relative word matching that exact syntactic role:`,
              promptI18n: {
                ja: `ステップ 2：その働きに対応する関係詞を選びなさい：`,
                ko: `2단계: 해당 문법 역할에 맞는 관계사를 고르시오:`,
                ms: `Langkah 2: Pilih kata relatif yang sepadan dengan peranan tersebut:`,
              },
              hintZh: `区分关系代词、所属格与关系副词`,
              hintEn: `Distinguish pronoun, possessive, and adverb`,
              hintI18n: {
                ja: `関係代名詞・所有格・関係副詞の働きを区別します`,
                ko: `관계대명사·소유격·관계부사의 역할을 구분합니다`,
                ms: `Bezakan kata ganti nama relatif, milik, dan keterangan tempat`,
              },
              expectedAnswer: item.ans,
            },
          ],
          distractors: [
            { text: item.trap1, textEn: item.trap1, misconceptionTag: "misc_eng_place_always_where" },
            { text: item.trap2, textEn: item.trap2 },
            { text: item.trap3, textEn: item.trap3 },
          ],
        };
      } else {
        // Basic: Contrast place noun as OBJECT (which) vs place noun as ADVERBIAL (where), with ZERO scaffold leaks!
        const scenarios = [
          {
            noun: "science museum",
            verbPhrase: "we visited last Friday",
            isObj: true,
            ans: "which",
            trap: "where",
          },
          {
            noun: "ancient city",
            verbPhrase: "the archaeologists discovered in 1986",
            isObj: true,
            ans: "which",
            trap: "where",
          },
          {
            noun: "community library",
            verbPhrase: "our school built two years ago",
            isObj: true,
            ans: "which",
            trap: "where",
          },
          {
            noun: "robotics hall",
            verbPhrase: "students test autonomous drones",
            isObj: false,
            ans: "where",
            trap: "which",
          },
        ] as const;
        const sc = rng.pick(scenarios);
        core = {
          promptZh: `【定语从句句法诊断】选择正确的关系词填空：\n"The ${sc.noun} ______ ${sc.verbPhrase} is open to the public on Saturdays."`,
          promptEn: `Choose the correct relative word to complete the sentence:\n"The ${sc.noun} ______ ${sc.verbPhrase} is open to the public on Saturdays."`,
          promptI18n: {
            ja: `正しい関係詞を選んで空所を補い、文を完成させなさい：\n"The ${sc.noun} ______ ${sc.verbPhrase} is open to the public on Saturdays."`,
            ko: `알맞은 관계사를 골라 빈칸을 채워 문장을 완성하시오:\n"The ${sc.noun} ______ ${sc.verbPhrase} is open to the public on Saturdays."`,
            ms: `Pilih kata relatif yang betul untuk melengkapkan ayat:\n"The ${sc.noun} ______ ${sc.verbPhrase} is open to the public on Saturdays."`,
          },
          answer: sc.ans,
          answerEn: sc.ans,
          explanationZh: sc.isObj
            ? `虽然先行词 "${sc.noun}" 表示地点，但代入从句 "${sc.verbPhrase}" 后充当及物动词的直接宾语，不能用关系副词，故填关系代词 which！`
            : `从句 "${sc.verbPhrase}" 主谓宾结构完整，先行词 "${sc.noun}" 在从句中作地点状语（in the ${sc.noun}），故填关系副词 where！`,
          explanationEn: sc.isObj
            ? `Even though "${sc.noun}" names a place, it serves as the direct OBJECT inside "${sc.verbPhrase}", requiring the relative pronoun "which".`
            : `Because "${sc.verbPhrase}" already has a complete subject-verb-object structure, the relative word acts as a place adverbial ("in the ${sc.noun}"), requiring "where".`,
          explanationI18n: {
            ja: sc.isObj
              ? `先行詞 "${sc.noun}" は場所ですが、関係詞節 "${sc.verbPhrase}" の中で他動詞の目的語になっているため、関係代名詞 "which" を使います。`
              : `関係詞節 "${sc.verbPhrase}" は主語・動詞・目的語がそろった完全な文なので、場所を表す関係副詞 "where" を使います。`,
            ko: sc.isObj
              ? `선행사 "${sc.noun}"는 장소 명사이지만 관계절 "${sc.verbPhrase}" 안에서 타동사의 목적어 역할을 하므로 관계대명사 "which"를 써야 합니다.`
              : `관계절 "${sc.verbPhrase}"는 주어·동사·목적어를 모두 갖춘 완전한 절이므로 장소의 관계부사 "where"를 써야 합니다.`,
            ms: sc.isObj
              ? `Walaupun "${sc.noun}" ialah kata nama tempat, ia berfungsi sebagai OBJEK langsung dalam "${sc.verbPhrase}", maka gunakan "which".`
              : `Klausa "${sc.verbPhrase}" sudah mempunyai subjek, kata kerja, dan objek yang lengkap, maka gunakan kata keterangan tempat "where".`,
          },
          scaffolds: [
            {
              promptZh: `第一步：把 "the ${sc.noun}" 放回从句 "${sc.verbPhrase}" 末尾——中间需要加介词 in/at 才能通顺吗？（填 yes 或 no）`,
              promptEn: `Step 1: Place "the ${sc.noun}" at the end of "${sc.verbPhrase}" — do you need a preposition like "in/at" before it? (yes/no)`,
              promptI18n: {
                ja: `ステップ 1："${sc.verbPhrase}" の後ろに "the ${sc.noun}" を戻すとき、前に in / at などの前置詞が必要ですか？（yes / no）`,
                ko: `1단계: "${sc.verbPhrase}" 뒤에 "the ${sc.noun}"를 이어 붙일 때 앞에 in/at 같은 전치사가 필요합니까? (yes/no)`,
                ms: `Langkah 1: Jika "the ${sc.noun}" diletakkan selepas "${sc.verbPhrase}", adakah kata sendi nama in/at diperlukan? (yes/no)`,
              },
              hintZh: `及物动词直连宾语不加介词，完整主谓宾后表地点需加介词`,
              hintEn: `Transitive verbs take direct objects without prepositions`,
              hintI18n: {
                ja: `他動詞は前置詞なしで直接目的語をとります`,
                ko: `타동사는 전치사 없이 직접 목적어를 취합니다`,
                ms: `Kata kerja transitif mengambil objek terus tanpa kata sendi nama`,
              },
              expectedAnswer: sc.isObj ? `no` : `yes`,
            },
            {
              promptZh: `第二步：无需介词（缺宾语）选指物关系代词，需要介词（缺地点状语）选关系副词——写出答案词：`,
              promptEn: `Step 2: Choose the relative pronoun (if direct object) or relative adverb (if place modifier):`,
              promptI18n: {
                ja: `ステップ 2：目的語なら関係代名詞、場所の修飾語なら関係副詞を選びなさい：`,
                ko: `2단계: 목적어 역할이면 관계대명사, 장소 부사어 역할이면 관계부사를 고르시오:`,
                ms: `Langkah 2: Pilih kata ganti nama relatif (jika objek) atau kata keterangan relatif tempat:`,
              },
              hintZh: `根据上一步是否需要介词判断`,
              hintEn: `Match grammatical role`,
              hintI18n: {
                ja: `文の中での文法的な働きに合わせます`,
                ko: `절 안에서의 문법적 역할에 맞춥니다`,
                ms: `Padankan mengikut peranan tatabahasa`,
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
      }
      break;
    }

    // 28. Computing: Binary place-value & Boolean logic (challenge adds bitwise AND!)
    case "cs_binary": {
      if (dTier === "challenge") {
        // 4-bit bitwise AND -> decimal value
        const pairs = [
          [13, 11], // 1101 & 1011 = 1001 = 9; OR = 15; XOR = 6
          [14, 11], // 1110 & 1011 = 1010 = 10; OR = 15; XOR = 5
          [13, 6],  // 1101 & 0110 = 0100 = 4; OR = 15; XOR = 11
          [11, 7],  // 1011 & 0111 = 0011 = 3; OR = 15; XOR = 12
          [14, 5],  // 1110 & 0101 = 0100 = 4; OR = 15; XOR = 11
          [15, 10], // 1111 & 1010 = 1010 = 10; OR = 15; XOR = 5
        ] as const;
        const [aDec, bDec] = rng.pick(pairs);
        const binA = aDec.toString(2).padStart(4, "0");
        const binB = bDec.toString(2).padStart(4, "0");
        const andDec = aDec & bDec;
        const andBin = andDec.toString(2).padStart(4, "0");
        const orTrap = aDec | bDec;
        const addTrap = aDec + bDec;
        core = {
          promptZh: `对两个 4 位无符号二进制数执行按位与（Bitwise AND）运算：(${binA})₂ AND (${binB})₂，将所得结果转换为十进制整数：`,
          promptEn: `Compute the bitwise AND of (${binA})₂ AND (${binB})₂, and convert the resulting binary value to a base-10 integer:`,
          promptI18n: {
            ja: `2 つの 4 ビット二進数に対してビットごとの論理積（AND）を計算し、(${binA})₂ AND (${binB})₂ の結果を十進数の整数で答えなさい：`,
            ko: `두 4비트 이진수에 대해 비트 논리곱(AND) 연산 (${binA})₂ AND (${binB})₂를 수행한 결과를 십진수 정수로 나타내시오:`,
            ms: `Lakukan operasi DAN mengikut bit (Bitwise AND) bagi (${binA})₂ AND (${binB})₂, kemudian tukarkan hasilnya kepada integer perpuluhan (asas 10):`,
          },
          answer: `${andDec}`,
          explanationZh: `按位与规则为“同为 1 才得 1”：(${binA})₂ AND (${binB})₂ = (${andBin})₂；按位权 8, 4, 2, 1 展开得十进制 ${andDec}（勿与按位或 OR = ${orTrap} 混淆）。`,
          explanationEn: `Bitwise AND outputs 1 only where BOTH bits are 1: (${binA})₂ AND (${binB})₂ = (${andBin})₂ = ${andDec} in base 10 (bitwise OR would give ${orTrap}).`,
          explanationI18n: {
            ja: `AND 演算は両方とも 1 の桁だけが 1 になるので (${andBin})₂ となり、十進数に直すと ${andDec} です（OR の ${orTrap} と混同しないこと）。`,
            ko: `AND 연산은 두 비트가 모두 1일 때만 1이 되므로 (${andBin})₂이고, 이를 십진수로 변환하면 ${andDec}입니다 (OR 연산 결과인 ${orTrap}와 혼동 주의).`,
            ms: `Operasi AND menghasilkan 1 hanya apabila kedua-dua bit ialah 1: (${andBin})₂ = ${andDec} dalam asas 10 (bukan OR = ${orTrap}).`,
          },
          scaffolds: [
            {
              promptZh: `第一步：逐位比较 ${binA} 与 ${binB}（同为 1 写 1，否则写 0），写出 4 位二进制结果：`,
              promptEn: `Step 1: Write the 4-bit binary result of ${binA} AND ${binB}:`,
              promptI18n: {
                ja: `ステップ 1：${binA} と ${binB} の各桁の AND をとり、4 桁の二進数で書きなさい：`,
                ko: `1단계: ${binA}과 ${binB}의 각 자리에 AND 연산을 적용한 4자리 이진수를 쓰시오:`,
                ms: `Langkah 1: Tulis hasil perduaan 4-bit bagi ${binA} AND ${binB}:`,
              },
              hintZh: `1&1=1，其余为 0`,
              hintEn: `1&1=1, else 0`,
              hintI18n: {
                ja: `両方 1 のときだけ 1、それ以外は 0`,
                ko: `둘 다 1일 때만 1, 나머지는 0`,
                ms: `1&1=1, selainnya 0`,
              },
              expectedAnswer: andBin,
            },
            {
              promptZh: `第二步：按位权 8, 4, 2, 1 将 (${andBin})₂ 换算为十进制整数：`,
              promptEn: `Step 2: Convert (${andBin})₂ to decimal using weights 8, 4, 2, 1:`,
              promptI18n: {
                ja: `ステップ 2：重み 8, 4, 2, 1 を使って (${andBin})₂ を十進数に直しなさい：`,
                ko: `2단계: 자릿값 8, 4, 2, 1을 이용해 (${andBin})₂를 십진수로 변환하시오:`,
                ms: `Langkah 2: Tukarkan (${andBin})₂ kepada perpuluhan menggunakan nilai tempat 8, 4, 2, 1:`,
              },
              hintZh: `把为 1 的对应位权相加`,
              hintEn: `Sum weights of '1' bits`,
              hintI18n: {
                ja: `ビットが 1 の桁の重みをたします`,
                ko: `비트가 1인 자리의 자릿값을 더합니다`,
                ms: `Jumlahkan nilai tempat bagi bit '1'`,
              },
              expectedAnswer: `${andDec}`,
            },
          ],
          distractors: [
            { text: `${orTrap}`, misconceptionTag: "misc_cs_power_start_one" },
            { text: `${andDec * 2}`, misconceptionTag: "misc_cs_power_start_one" },
            { text: `${addTrap}` },
          ],
          misconceptionsByValue: {
            [`${orTrap}`]: "misc_cs_power_start_one",
            [`${andDec * 2}`]: "misc_cs_power_start_one",
          },
        };
      } else {
        const dec = dTier === "standard" ? rng.int(19, 45) : rng.int(9, 18);
        const bin = dec.toString(2);
        const shiftTrap = dec * 2;
        core = {
          promptZh: `将无符号二进制数 (${bin})₂ 转换为十进制整数：`,
          promptEn: `Convert the unsigned binary number (${bin})₂ to base-10 decimal:`,
          promptI18n: {
            ja: `符号なしの二進数 (${bin})₂ を十進数の整数に変換しなさい：`,
            ko: `부호 없는 이진수 (${bin})₂를 십진수 정수로 변환하시오:`,
            ms: `Tukarkan nombor perduaan tanpa tanda (${bin})₂ kepada nombor perpuluhan (asas 10):`,
          },
          answer: `${dec}`,
          explanationZh: `从最右位（最低位 2⁰ = 1）向左按权展开相加，(${bin})₂ = ${dec}（注意最右边第一位权值是 2⁰ = 1 而非 2¹ = 2，否则会翻倍错算成 ${shiftTrap}）。`,
          explanationEn: `Expanding powers of 2 from right to left starting at 2⁰ = 1 gives (${bin})₂ = ${dec}.`,
          explanationI18n: {
            ja: `右端の桁（2⁰ = 1）から左へ順に 2 の累乗の重みをかけてたすと、(${bin})₂ = ${dec} です（右端を 2¹ = 2 とすると ${shiftTrap} と誤ってしまいます）。`,
            ko: `가장 오른쪽 자리(2⁰ = 1)부터 왼쪽으로 2의 거듭제곱 자릿값을 곱해 더하면 (${bin})₂ = ${dec}입니다 (가장 오른쪽을 2¹ = 2로 잡으면 ${shiftTrap}로 잘못 계산됩니다).`,
            ms: `Kembangkan kuasa 2 dari kanan ke kiri bermula dengan 2⁰ = 1 untuk mendapat (${bin})₂ = ${dec}.`,
          },
          scaffolds: [
            {
              promptZh: `二进制最右边末位代表 2⁰ 还是 2¹？写出它的位权数值：`,
              promptEn: `What is the place weight of the rightmost bit (2⁰)?`,
              promptI18n: {
                ja: `右端のビット（2⁰）の位の重みはいくつですか？`,
                ko: `가장 오른쪽 비트(2⁰)의 자릿값은 얼마입니까?`,
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
              hintZh: `从右往左权值依次为 1, 2, 4, 8, 16, 32`,
              hintEn: `Weights: 1, 2, 4, 8, 16, 32`,
              hintI18n: {
                ja: `右から順に重みは 1, 2, 4, 8, 16, 32`,
                ko: `오른쪽부터 자릿값: 1, 2, 4, 8, 16, 32`,
                ms: `Nilai tempat: 1, 2, 4, 8, 16, 32`,
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
      }
      break;
    }

    // 29. Geography: Map scale & timezones (challenge tests longitude timezone calculation!)
    case "geo_scale_time": {
      if (dTier === "challenge") {
        // Longitude & timezone: 15 degrees = 1 hour, East is ahead (+), West is behind (-)
        const lonPairs = [
          [120, 135, 9],  // UTC+8 at 9:00 -> 135°E (UTC+9) = 10:00; wrongWest = 8
          [120, 75, 14],  // 120°E at 14:00 -> 75°E (-3h) = 11:00; wrongEast = 17
          [135, 105, 15], // 135°E at 15:00 -> 105°E (-2h) = 13:00; wrongEast = 17
          [30, 120, 8],   // 30°E at 8:00 -> 120°E (+6h) = 14:00; wrongWest = 2
          [15, 105, 7],   // 15°E at 7:00 -> 105°E (+6h) = 13:00; wrongWest = 1
        ] as const;
        const [lonA, lonB, hourA] = rng.pick(lonPairs);
        const diffDeg = Math.abs(lonB - lonA);
        const diffHrs = diffDeg / 15;
        const isEastward = lonB > lonA;
        const hourB = isEastward ? hourA + diffHrs : hourA - diffHrs;
        const wrongDirTrap = isEastward ? hourA - diffHrs : hourA + diffHrs;
        core = {
          promptZh: `【经度与区时推算】地球每转过 15° 经度地方时相差 1 小时（东加西减）。当 ${lonA}°E 所在时区的区时为当日 ${hourA}:00 时，同一时刻 ${lonB}°E 所在时区的区时是当日几点整（只填 0–23 的小时整数，如 14）？`,
          promptEn: `[Timezones & Longitude] Every 15° of longitude corresponds to a 1-hour time difference (east is ahead, west is behind). When it is ${hourA}:00 on the same day at ${lonA}°E, what hour (0–23 integer) is it at ${lonB}°E?`,
          promptI18n: {
            ja: `【経度と時差】経度 15° ごとに 1 時間の時差が生じます（東ほど時刻が進みます）。東経 ${lonA}°（${lonA}°E）が当日 ${hourA}:00 のとき、東経 ${lonB}°（${lonB}°E）は当日何時ですか（0〜23 の整数のみ入力）。`,
            ko: `[경도와 시차] 경도 15°마다 1시간의 시차가 발생합니다(동쪽이 빠르고 서쪽이 느림). 동경 ${lonA}°(${lonA}°E)가 당일 ${hourA}:00일 때, 동경 ${lonB}°(${lonB}°E)는 당일 몇 시입니까? (0~23 사이의 정수만 입력)`,
            ms: `[Zon Masa & Longitud] Setiap 15° longitud bersamaan perbezaan masa 1 jam (timur lebih cepat, barat lebih lewat). Apabila waktu di ${lonA}°T ialah ${hourA}:00, pukul berapakah (integer jam 0–23) di ${lonB}°T pada hari yang sama?`,
          },
          answer: `${hourB}`,
          explanationZh: `两地经度差 Δλ = |${lonB}° - ${lonA}°| = ${diffDeg}°，时差 = ${diffDeg}° ÷ 15°/h = ${diffHrs} 小时；${lonB}°E 位于 ${lonA}°E 的${isEastward ? "东侧（东加）" : "西侧（西减）"}，故为 ${hourA} ${isEastward ? "+" : "-"} ${diffHrs} = ${hourB} 时。`,
          explanationEn: `Longitude difference = ${diffDeg}°, giving ${diffDeg}/15 = ${diffHrs} h difference. Since ${lonB}°E is ${isEastward ? "east (ahead)" : "west (behind)"} of ${lonA}°E, time = ${hourA} ${isEastward ? "+" : "-"} ${diffHrs} = ${hourB}:00.`,
          explanationI18n: {
            ja: `経度差は ${diffDeg}° なので時差は ${diffDeg} ÷ 15 = ${diffHrs} 時間です。${lonB}°E は ${lonA}°E より${isEastward ? "東にあるため進み" : "西にあるため遅れ"}、${hourA} ${isEastward ? "+" : "-"} ${diffHrs} = ${hourB} 時です。`,
            ko: `경도 차이는 ${diffDeg}°이므로 시차는 ${diffDeg} ÷ 15 = ${diffHrs}시간입니다. ${lonB}°E는 ${lonA}°E보다 ${isEastward ? "동쪽이므로 더하여" : "서쪽이므로 빼서"} ${hourB}시입니다.`,
            ms: `Beza longitud ialah ${diffDeg}°, maka beza masa = ${diffDeg}/15 = ${diffHrs} jam. Oleh sebab ${lonB}°T berada di sebelah ${isEastward ? "timur (+)" : "barat (-)"} ${lonA}°T, waktunya ialah ${hourB}:00.`,
          },
          scaffolds: [
            {
              promptZh: `第一步：两地经度相差 ${diffDeg}°，除以 15° 得到相差几小时？`,
              promptEn: `Step 1: Divide the longitude difference ${diffDeg}° by 15°/h:`,
              promptI18n: {
                ja: `ステップ 1：経度差 ${diffDeg}° を 15° でわって何時間の時差か求めなさい：`,
                ko: `1단계: 경도 차이 ${diffDeg}°를 15°로 나누어 몇 시간 차이인지 구하시오:`,
                ms: `Langkah 1: Bahagikan perbezaan longitud ${diffDeg}° dengan 15°:`,
              },
              hintZh: `${diffDeg} ÷ 15`,
              hintEn: `${diffDeg} / 15`,
              expectedAnswer: `${diffHrs}`,
            },
            {
              promptZh: `第二步：按“东加西减”计算 ${hourA} ${isEastward ? "+" : "-"} ${diffHrs} = ?`,
              promptEn: `Step 2: Apply ${isEastward ? "east (+)" : "west (-)"}: ${hourA} ${isEastward ? "+" : "-"} ${diffHrs} = ?`,
              promptI18n: {
                ja: `ステップ 2：${hourA} ${isEastward ? "+" : "-"} ${diffHrs} を計算しなさい：`,
                ko: `2단계: ${hourA} ${isEastward ? "+" : "-"} ${koP(diffHrs, "을", "를")} 계산하시오:`,
                ms: `Langkah 2: Hitung ${hourA} ${isEastward ? "+" : "-"} ${diffHrs}:`,
              },
              hintZh: `东加西减`,
              hintEn: `East +, West -`,
              hintI18n: {
                ja: `東は進み（+）、西は遅れます（-）`,
                ko: `동쪽은 더하고(+), 서쪽은 뺍니다(-)`,
                ms: `Timur tambah (+), Barat tolak (-)`,
              },
              expectedAnswer: `${hourB}`,
            },
          ],
          distractors: [
            { text: `${wrongDirTrap}`, misconceptionTag: "misc_geo_cm_km_zeros" },
            { text: `${diffHrs}` },
            { text: `${hourB + 1}` },
          ],
          misconceptionsByValue: { [`${wrongDirTrap}`]: "misc_geo_cm_km_zeros" },
        };
      } else {
        const mapCm = rng.int(3, 9);
        const scaleDenom = dTier === "standard" ? rng.pick([200000, 500000, 1000000]) : rng.pick([100000, 200000]);
        const kmPerCm = scaleDenom / 100000;
        const ansKm = mapCm * kmPerCm;
        const zeroTrap = ansKm * 10;
        core = {
          promptZh: `在一幅比例尺为 1 : ${scaleDenom} 的区域地形图上，量得甲、乙两座气象站的图上直线距离为 ${mapCm} cm，求两站的实地水平距离是多少 km？（提示：1 km = 100,000 cm）`,
          promptEn: `On a topographic map with scale 1 : ${scaleDenom}, two stations are ${mapCm} cm apart. Find the actual ground distance in km (Hint: 1 km = 100,000 cm):`,
          promptI18n: {
            ja: `縮尺 1 : ${scaleDenom} の地形図上で、2 つの気象観測所の間の長さをはかると ${mapCm} cm でした。実際の水平距離は何 km ですか（1 km = 100,000 cm）。`,
            ko: `축척이 1 : ${scaleDenom}인 지형도에서 두 기상 관측소 사이의 거리를 재었더니 ${mapCm} cm였습니다. 실제 거리는 몇 km입니까? (1 km = 100,000 cm)`,
            ms: `Pada peta topografi berskala 1 : ${scaleDenom}, jarak antara dua stesen ialah ${mapCm} cm. Cari jarak sebenar di atas tanah dalam km (1 km = 100,000 cm):`,
          },
          answer: `${ansKm}`,
          unit: "km",
          explanationZh: `实地距离 = ${mapCm} × ${scaleDenom} cm = ${mapCm * scaleDenom} cm；因为 1 km = 1000 m = 100,000 cm（去掉 5 个零），换算得 ${ansKm} km。`,
          explanationEn: `Ground distance = ${mapCm} × ${scaleDenom} cm = ${ansKm} km (dividing cm by 100,000).`,
          explanationI18n: {
            ja: `実際の距離 = ${mapCm} × ${scaleDenom} cm = ${mapCm * scaleDenom} cm であり、1 km = 100,000 cm でわると ${ansKm} km です。`,
            ko: `실제 거리 = ${mapCm} × ${scaleDenom} cm = ${mapCm * scaleDenom} cm이고, 1 km = 100,000 cm이므로 100,000으로 나누면 ${ansKm} km입니다.`,
            ms: `Jarak sebenar = ${mapCm} × ${scaleDenom} cm = ${mapCm * scaleDenom} cm; bahagikan dengan 100,000 untuk mendapat ${ansKm} km.`,
          },
          scaffolds: [
            {
              promptZh: `图上 1 cm 代表实地 ${scaleDenom} cm，换算成 km 是多少 km？`,
              promptEn: `How many km does 1 cm on a 1:${scaleDenom} map represent?`,
              promptI18n: {
                ja: `縮尺 1:${scaleDenom} の地図上の 1 cm は、実際には何 km を表しますか？`,
                ko: `축척 1:${scaleDenom}인 지도에서 1 cm는 실제로 몇 km를 나타냅니까?`,
                ms: `Berapakah km yang diwakili oleh 1 cm pada peta berskala 1:${scaleDenom}?`,
              },
              hintZh: `${scaleDenom} ÷ 100000`,
              hintEn: `Divide by 100,000`,
              hintI18n: { ja: `100,000 でわる`, ko: `100,000으로 나누기`, ms: `Bahagi dengan 100,000` },
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
      }
      break;
    }

    // 30. History: BCE/CE chronology (No Year 0! Challenge asks inverse CE year from BCE + elapsed span)
    case "his_chronology": {
      if (dTier === "challenge") {
        // Inverse chronology: created in `bce` BCE, unearthed exactly `span` full years later -> what CE year?
        // Since span = bce + ce - 1 => ce = span - bce + 1 (trap: span - bce!)
        const bce = rng.pick([221, 202, 44, 509]);
        const ceAns = rng.pick([1974, 1986, 2020, 2025]);
        const span = bce + ceAns - 1;
        const yearZeroTrap = span - bce; // ceAns - 1
        core = {
          promptZh: `【历史纪年逆推】一件古代青铜铭文器铸造于公元前 ${bce} 年（${bce} BCE），在整整 ${span} 周年后的同月同日被考古队发掘出土。由于公历没有“公元 0 年”，该文物出土于公元哪一年（只填公元年份数字）？`,
          promptEn: `[Inverse Chronology] A bronze inscription was cast in ${bce} BCE and unearthed on the exact same month and day ${span} full years later. Given that there is NO Year 0, in what CE year was it unearthed (enter year number only)?`,
          promptI18n: {
            ja: `【年代の逆算】ある青銅器が紀元前 ${bce} 年に鋳造され、ちょうど ${span} 年後の同じ月日に発掘されました。西暦に「紀元 0 年」がないことに注意すると、発掘されたのは西暦（紀元）何年ですか（数値のみ入力）。`,
            ko: `[연대 역산] 어느 청동기가 기원전 ${bce}년에 주조되어 정확히 ${span}년이 지난 같은 월일에 발굴되었습니다. 서력기원에 '0년'이 없다는 점에 유의할 때, 발굴된 해는 기원후(서기) 몇 년입니까? (숫자만 입력)`,
            ms: `[Kronologi Songsang] Satu artifak gangsa dihasilkan pada tahun ${bce} SM dan ditemui semula genap ${span} tahun kemudian pada tarikh yang sama. Memandangkan TIADA Tahun 0, pada tahun Masihi (M) berapakah ia ditemui?`,
          },
          answer: `${ceAns}`,
          explanationZh: `由跨公元周年公式 bce + ce - 1 = ${span}，反解得 ce = ${span} - ${bce} + 1 = ${ceAns} 年（若直接算 ${span} - ${bce} = ${yearZeroTrap} 则漏补了缺失的公元 0 年！）。`,
          explanationEn: `From bce + ce - 1 = ${span}, solving for ce gives ce = ${span} - ${bce} + 1 = ${ceAns} CE (simply computing ${span} - ${bce} = ${yearZeroTrap} forgets the missing Year 0).`,
          explanationI18n: {
            ja: `経過年数の式 ${bce} + ce - 1 = ${span} より、ce = ${span} - ${bce} + 1 = 西暦 ${ceAns} 年です（${yearZeroTrap} 年としないよう注意しましょう）。`,
            ko: `경과 연수 공식 ${bce} + ce - 1 = ${span}에서 ce = ${span} - ${bce} + 1 = 서기 ${ceAns}년입니다 (${yearZeroTrap}년으로 착각하지 마세요).`,
            ms: `Daripada rumus ${bce} + ce - 1 = ${span}, diperoleh ce = ${span} - ${bce} + 1 = tahun ${ceAns} M.`,
          },
          scaffolds: [
            {
              promptZh: `第一步：先算不考虑跨元修正的差值 ${span} - ${bce} = ?`,
              promptEn: `Step 1: First compute ${span} - ${bce}:`,
              promptI18n: {
                ja: `ステップ 1：まず ${span} - ${bce} を計算しなさい：`,
                ko: `1단계: 먼저 ${span} - ${koP(bce, "을", "를")} 계산하시오:`,
                ms: `Langkah 1: Mula-mula hitung ${span} - ${bce}:`,
              },
              hintZh: `${span} - ${bce}`,
              hintEn: `${span} - ${bce}`,
              expectedAnswer: `${yearZeroTrap}`,
            },
            {
              promptZh: `第二步：因为公元前 1 年直接跳到公元 1 年（无 0 年），需加 1 得到公元年份：`,
              promptEn: `Step 2: Add 1 to account for jumping directly from 1 BCE to 1 CE:`,
              promptI18n: {
                ja: `ステップ 2：紀元前 1 年の次が紀元 1 年なので、1 を加えて西暦年を求めなさい：`,
                ko: `2단계: 기원전 1년 다음이 바로 기원후 1년이므로 1을 더하여 서기 연도를 구하시오:`,
                ms: `Langkah 2: Tambahkan 1 kerana 1 SM terus diikuti oleh 1 M:`,
              },
              hintZh: `${yearZeroTrap} + 1`,
              hintEn: `${yearZeroTrap} + 1`,
              expectedAnswer: `${ceAns}`,
            },
          ],
          distractors: [
            { text: `${yearZeroTrap}`, misconceptionTag: "misc_his_year_zero" },
            { text: `${yearZeroTrap - 1}`, misconceptionTag: "misc_his_year_zero" },
            { text: `${span + bce}` },
          ],
          misconceptionsByValue: { [`${yearZeroTrap}`]: "misc_his_year_zero" },
        };
      } else {
        const bce = rng.pick([221, 202, 44, 509, 776]);
        const ce = dTier === "standard" ? rng.pick([1066, 1453, 2025, 2026]) : rng.pick([618, 2025]);
        const ansYears = bce + ce - 1;
        const yearZeroTrap = bce + ce;
        core = {
          promptZh: `【历史纪年跨度】公历纪年没有“公元 0 年”（公元前 1 年紧接公元 1 年）。从公元前 ${bce} 年（${bce} BCE）到公元 ${ce} 年（${ce} CE）同月同日，一共相距多少周年？`,
          promptEn: `[Historical Chronology] Since the Gregorian/Julian calendar has NO Year 0 (1 BCE is followed immediately by 1 CE), how many full years elapsed from ${bce} BCE to the same date in ${ce} CE?`,
          promptI18n: {
            ja: `【歴史の年代計算】西暦には「紀元 0 年」がありません（紀元前 1 年の次はすぐ紀元 1 年です）。紀元前 ${bce} 年から紀元 ${ce} 年の同じ月日までに、何年が経過しましたか。`,
            ko: `[역사 연대 계산] 서력기원에는 '0년'이 없습니다(기원전 1년 바로 다음 해가 기원후 1년입니다). 기원전 ${bce}년부터 기원후 ${ce}년의 같은 날짜까지 몇 년이 지났습니까?`,
            ms: `[Kronologi Sejarah] Oleh sebab kalendar Gregory/Julius TIDAK mempunyai Tahun 0 (1 SM diikuti terus oleh 1 M), berapakah bilangan tahun penuh yang berlalu dari tahun ${bce} SM hingga tarikh yang sama pada tahun ${ce} M?`,
          },
          answer: `${ansYears}`,
          explanationZh: `跨越公元元年时因不存在公元 0 年，周年跨度 = ${bce} + ${ce} - 1 = ${ansYears} 年（直接相加 ${bce} + ${ce} = ${yearZeroTrap} 会多算虚构的“公元 0 年”）。`,
          explanationEn: `Spanning 1 BCE → 1 CE requires subtracting 1 for the missing Year 0: ${bce} + ${ce} - 1 = ${ansYears} years.`,
          explanationI18n: {
            ja: `紀元前 1 年 → 紀元 1 年をまたぐときは、存在しない「紀元 0 年」の分として 1 を引きます：${bce} + ${ce} - 1 = ${ansYears} 年です（${yearZeroTrap} 年としないよう注意しましょう）。`,
            ko: `기원전 1년 → 기원후 1년을 넘어갈 때는 존재하지 않는 '0년'만큼 1을 빼야 합니다: ${bce} + ${ce} - 1 = ${ansYears}년입니다.`,
            ms: `Merentasi 1 SM → 1 M memerlukan penolakan 1 bagi Tahun 0 yang tidak wujud: ${bce} + ${ce} - 1 = ${ansYears} tahun.`,
          },
          scaffolds: [
            {
              promptZh: `若按普通数轴算 ${bce} + ${ce} 是多少？`,
              promptEn: `First sum ${bce} + ${ce}:`,
              promptI18n: {
                ja: `まず ${bce} + ${ce} を計算しなさい：`,
                ko: `먼저 ${bce} + ${koP(ce, "을", "를")} 계산하시오:`,
                ms: `Mula-mula jumlahkan ${bce} + ${ce}:`,
              },
              hintZh: `${bce} + ${ce}`,
              hintEn: `${bce} + ${ce}`,
              expectedAnswer: `${yearZeroTrap}`,
            },
            {
              promptZh: `扣除不存在的“公元 0 年”（减 1），实际相隔多少年？`,
              promptEn: `Subtract 1 for the non-existent Year 0:`,
              promptI18n: {
                ja: `存在しない「紀元 0 年」の分として 1 を引きなさい：`,
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
      }
      break;
    }
    default:
      return null;
  }
  return core;
}
