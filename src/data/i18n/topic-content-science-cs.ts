import type { TopicContentOverlay } from "./overlay";

/**
 * Native ja / ko / ms teaching content for the topics in src/data/canonical-topics-science-cs.ts.
 * Keyed by topic id. See ./overlay.ts for the shape.
 */
export const TOPIC_CONTENT_I18N_SCIENCE_CS: TopicContentOverlay = {
  // ==================== CHEMISTRY ====================
  mt_chem_atomic_periodic: {
    description: {
      ja: "原子番号 Z = 陽子の数 = 中性原子の電子の数であることを理解し、電子殻の配置（2, 8, 8）から価電子の数を求めて、イオンの電荷を予想します。",
      ko: "원자 번호 Z = 양성자 수 = 중성 원자의 전자 수임을 이해하고, 전자 껍질 배치(2, 8, 8)로 원자가 전자 수를 구해 이온의 전하를 예측해요.",
      ms: "Mengaitkan nombor atom Z dengan bilangan proton dan petala elektron (2, 8, 8), serta meramalkan cas ion daripada elektron valens.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：中性のナトリウム原子（Z=11）が負の電荷をもつ電子を 1 個失うと、なぜ負ではなく正の電荷をもつ Na⁺ になるのでしょうか？",
      ko: "아이에게 물어보세요: 중성 나트륨 원자(Z=11)가 음전하를 띤 전자 1개를 잃으면 왜 음전하가 아니라 양전하를 띤 Na⁺가 될까요?",
      ms: "Tanya anak anda: Apabila atom natrium neutral (Z=11) kehilangan 1 elektron yang bercas negatif, mengapakah ia menjadi Na⁺ yang bercas positif?",
    },
    masteryCriteria: [
      {
        ja: "陽イオン（e⁻ を失う → +）と陰イオン（e⁻ を受け取る → -）を区別できる",
        ko: "양이온(e⁻을 잃음 → +)과 음이온(e⁻을 얻음 → -)을 구별할 수 있어요",
        ms: "Mengenal pasti kation (kehilangan e⁻ → +) dan anion (penerimaan e⁻ → -)",
      },
      {
        ja: "2-8-8 の電子殻の規則を使って、Z ≤ 18 の元素の価電子の数を求めることができる",
        ko: "2-8-8 전자 껍질 규칙을 이용해 Z ≤ 18인 원소의 원자가 전자 수를 구할 수 있어요",
        ms: "Menentukan bilangan elektron valens bagi Z ≤ 18 menggunakan susunan petala 2-8-8",
      },
    ],
    intuition: {
      ja: "陽子は原子核の中にしっかり固定された「正電荷のいかり」（+Z）です。化学変化で陽子は動かず、増えたり減ったりするのは外側の負の電子だけです！負の電荷が 1 つ減れば、正の電荷が +1 だけ余ります。",
      ko: "양성자는 원자핵 안에 단단히 고정된 '양전하의 닻'(+Z)이에요. 화학 반응에서 양성자는 움직이지 않고, 바깥쪽의 음전하를 띤 전자만 늘거나 줄어들어요! 음전하가 하나 줄면 양전하가 +1만큼 남아요.",
      ms: "Proton kekal terkunci di dalam nukleus (+Z); tindak balas kimia hanya menambah atau mengurangkan elektron negatif di bahagian luar. Kehilangan satu elektron negatif meninggalkan cas bersih +1!",
    },
    steps: [
      {
        title: {
          ja: "2-8-8 の電子殻の規則ですばやく求める",
          ko: "2-8-8 전자 껍질 규칙으로 빠르게 구하기",
          ms: "Petua Petala 2-8-8",
        },
        body: {
          ja: "第 1 殻には最大 2 個、第 2 殻には最大 8 個の電子が入ります。たとえば Mg（Z=12）の電子配置は 2-8-2 で、価電子 2 個を失いやすく、Mg²⁺（電子 10 個）になります。",
          ko: "첫 번째 껍질에는 최대 2개, 두 번째 껍질에는 최대 8개의 전자가 들어가요. 예를 들어 Mg(Z=12)의 전자 배치는 2-8-2이고, 원자가 전자 2개를 잃기 쉬워 Mg²⁺(전자 10개)이 돼요.",
          ms: "Petala pertama memuatkan maksimum 2 elektron dan petala kedua maksimum 8. Contohnya, Mg (Z=12) mempunyai susunan 2-8-2 dan melepaskan 2 elektron valens untuk membentuk Mg²⁺ (10 e⁻).",
        },
        checkQuestion: {
          ja: "Al（Z = 13、電子配置 2-8-3）が陽イオン Al³⁺ になったとき、電子は何個残っていますか？",
          ko: "Al(Z = 13, 전자 배치 2-8-3)이 양이온 Al³⁺이 되면 전자는 몇 개 남을까요?",
          ms: "Berapakah bilangan elektron yang tinggal dalam ion Al³⁺ (Z = 13, susunan 2-8-3)?",
        },
      },
    ],
    misconceptions: {
      misc_chem_ion_sign_flip: {
        label: {
          ja: "陽イオンなのに電子の数を引かずに足してしまう（「電子を失う」を電子が増えると誤解する）",
          ko: "양이온인데 전자 수를 빼지 않고 더하기('전자를 잃음'을 전자가 늘어나는 것으로 착각)",
          ms: "Menambah elektron dan bukannya menolak bagi kation bercas positif",
        },
        wrongPattern: {
          ja: "Mg²⁺（Z=12）の電子の数を 10 ではなく 12 + 2 = 14 と計算する",
          ko: "Mg²⁺(Z=12)의 전자 수를 10이 아니라 12 + 2 = 14로 계산함",
          ms: "Mengira bilangan elektron dalam Mg²⁺ (Z=12) sebagai 12 + 2 = 14 dan bukannya 10",
        },
        remediationTip: {
          ja: "電子は 1 個あたり -1 の電荷をもちます。+2 の電荷は電子が陽子より 2 個少ないことを意味するので、電子の数 = Z - 2 = 12 - 2 = 10 です。",
          ko: "전자는 하나당 -1의 전하를 띠어요. +2의 전하는 전자가 양성자보다 2개 적다는 뜻이므로 전자 수 = Z - 2 = 12 - 2 = 10이에요.",
          ms: "Setiap elektron membawa cas -1; cas +2 bermaksud bilangan elektron adalah 2 kurang daripada proton: Z - 2 = 12 - 2 = 10.",
        },
      },
    },
  },

  mt_chem_bonding_formula: {
    description: {
      ja: "化合物では各元素の酸化数の総和が 0 になるという規則を使って、未知の酸化数を求め、イオンからなる物質の化学式の添え字を正しく書きます。",
      ko: "화합물에서 각 원소의 산화수 총합이 0이 된다는 규칙을 이용해 모르는 산화수를 구하고, 이온 화합물의 화학식 아래 첨자를 바르게 써요.",
      ms: "Menggunakan petua jumlah cas sifar untuk menentukan nombor pengoksidaan yang tidak diketahui dan mengimbangkan subskrip formula sebatian ion.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：炭酸カルシウム CaCO₃ は全体として電荷をもちません。Ca が +2、3 個の O がそれぞれ -2 のとき、真ん中の C の酸化数はいくつでしょうか？",
      ko: "아이에게 물어보세요: 탄산 칼슘 CaCO₃는 전체적으로 전하를 띠지 않아요. Ca가 +2, O 3개가 각각 -2일 때 가운데 C의 산화수는 얼마일까요?",
      ms: "Tanya anak anda: CaCO₃ adalah neutral secara keseluruhan, dengan Ca = +2 dan tiga atom O masing-masing -2. Apakah nombor pengoksidaan C yang mengimbangkannya?",
    },
    masteryCriteria: [
      {
        ja: "基準となる H(+1)・O(-2) を使って一次方程式を立て、中心原子の未知の酸化数を求めることができる",
        ko: "기준이 되는 H(+1)과 O(-2)를 이용해 일차방정식을 세워 중심 원자의 모르는 산화수를 구할 수 있어요",
        ms: "Menentukan nombor pengoksidaan atom pusat yang tidak diketahui menggunakan H(+1) dan O(-2)",
      },
    ],
    intuition: {
      ja: "電荷をもたない化合物は、収支がぴったり合った家計簿のようなものです。正の酸化数の合計と負の酸化数の合計を足すと、必ず 0 になります！",
      ko: "전기적으로 중성인 화합물은 수입과 지출이 딱 맞는 장부와 같아요. 모든 양의 산화수와 음의 산화수를 더하면 반드시 0이 돼요!",
      ms: "Setiap sebatian neutral ialah lejar yang seimbang: jumlah semua nombor pengoksidaan positif dan negatif sama dengan 0!",
    },
    steps: [
      {
        title: {
          ja: "和がゼロの式を立てて未知の酸化数を求める",
          ko: "합이 0인 식을 세워 모르는 산화수 구하기",
          ms: "Bina Persamaan Jumlah Sifar",
        },
        body: {
          ja: "たとえば KMnO₄ 中の Mn の酸化数は、(+1) + x + 4×(-2) = 0 ⇒ x = +7 と求めます。",
          ko: "예를 들어 KMnO₄에서 Mn의 산화수는 (+1) + x + 4×(-2) = 0 ⇒ x = +7로 구해요.",
          ms: "Contohnya, dalam KMnO₄: (+1) + x + 4×(-2) = 0 ⇒ x = +7.",
        },
        checkQuestion: {
          ja: "H₂SO₄ 中（H は +1、O は -2）の硫黄 S の酸化数を求めましょう。",
          ko: "H₂SO₄에서(H는 +1, O는 -2) 황 S의 산화수를 구하세요.",
          ms: "Cari nombor pengoksidaan S dalam H₂SO₄ (H = +1, O = -2):",
        },
      },
    ],
    misconceptions: {
      misc_chem_valence_ignore_sub: {
        label: {
          ja: "酸化数の総和を計算するとき、原子の数（添え字）をかけ忘れる",
          ko: "산화수 합을 계산할 때 원자 수(아래 첨자)를 곱하는 것을 잊기",
          ms: "Terlupa mendarab nombor pengoksidaan -2 oksigen dengan subskripnya",
        },
        wrongPattern: {
          ja: "H₂SO₄ の S の酸化数を、2(+1) + x + 4(-2) = 0 ではなく (+1) + x + (-2) = 0 として +1 と求める",
          ko: "H₂SO₄에서 S의 산화수를 2(+1) + x + 4(-2) = 0이 아니라 (+1) + x + (-2) = 0으로 세워 +1로 구함",
          ms: "Menulis (+1) + x + (-2) = 0 dan bukannya 2(+1) + x + 4(-2) = 0",
        },
        remediationTip: {
          ja: "原子 1 個 1 個がそれぞれ電荷を受けもっています。添え字がいくつなら、必ずその数をかけましょう！",
          ko: "원자 하나하나가 각각 전하를 가져요. 아래 첨자가 몇이면 반드시 그 수만큼 곱하세요!",
          ms: "Darabkan nombor pengoksidaan setiap unsur dengan subskrip bilangan atomnya.",
        },
      },
    },
  },

  mt_chem_molar_concentration: {
    description: {
      ja: "c = n/V（mL は L に換算する）を使ってモル濃度を計算し、水を加えて薄めても溶質の物質量は変わらない（c₁V₁ = c₂V₂）ことを用いて定量的な計算を行います。",
      ko: "c = n/V(mL는 L로 환산)를 이용해 몰 농도를 계산하고, 물을 넣어 희석해도 용질의 몰수는 변하지 않는다는 원리(c₁V₁ = c₂V₂)로 양적 계산을 해요.",
      ms: "Mengira kemolaran c = n/V (dengan menukar mL kepada L) dan mengaplikasikan keabadian zat terlarut c₁V₁ = c₂V₂ semasa pencairan.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：濃いジュースに水を加えて全体の体積を 2 倍にすると、中に入っている果汁そのものの量は変わりますか？濃さはもとの何分の何になりますか？",
      ko: "아이에게 물어보세요: 진한 주스에 물을 부어 전체 부피를 2배로 묽히면 그 안에 든 순수한 과즙의 양은 변할까요? 농도는 처음의 몇 분의 몇이 될까요?",
      ms: "Tanya anak anda: Apabila jus dicairkan dengan air sehingga jumlah isi padunya menjadi dua kali ganda, adakah jumlah jus tulen berubah? Apakah yang berlaku kepada kepekatannya?",
    },
    masteryCriteria: [
      {
        ja: "体積を mL から L に換算（1000 で割る）してから c = n/V に代入できる",
        ko: "부피를 mL에서 L로 환산(1000으로 나눔)한 뒤 c = n/V에 대입할 수 있어요",
        ms: "Menukar isi padu daripada mL kepada L sebelum mengira c = n/V",
      },
      {
        ja: "「V₂ になるまで水を加える」と「水を加えた量」を区別し、希釈後の溶液全体の体積 V₂ を使って c₁V₁ = c₂V₂ を適用できる",
        ko: "'V₂가 될 때까지 물을 넣음'과 '넣은 물의 양'을 구별하여 희석 후 용액 전체 부피 V₂로 c₁V₁ = c₂V₂를 적용할 수 있어요",
        ms: "Mengaplikasikan c₁V₁ = c₂V₂ menggunakan jumlah isi padu akhir larutan V₂ (bukan isi padu air yang ditambah)",
      },
    ],
    intuition: {
      ja: "水を加えて薄めても、増えるのは溶媒の水だけで、溶質の粒子は 1 個も増えも減りもしません！だから溶質の物質量 n = c₁V₁ = c₂V₂ は一定に保たれます。",
      ko: "물을 넣어 희석하면 용매인 물만 늘어날 뿐, 용질 입자는 하나도 늘거나 줄지 않아요! 그래서 용질의 몰수 n = c₁V₁ = c₂V₂는 일정하게 보존돼요.",
      ms: "Menambah air mengubah jumlah isi padu V, tetapi bilangan mol zat terlarut n = cV kekal malar: c₁V₁ = c₂V₂.",
    },
    steps: [
      {
        title: {
          ja: "希釈は反比例ですばやく計算する",
          ko: "희석은 반비례로 빠르게 계산하기",
          ms: "Penskalaan Songsang dalam Pencairan",
        },
        body: {
          ja: "2 mol/L の NaCl 水溶液 100 mL に水を加えて 500 mL にすると、体積が 5 倍になるので、濃度は 2 ÷ 5 = 0.4 mol/L になります。",
          ko: "2 mol/L NaCl 수용액 100 mL에 물을 넣어 500 mL로 만들면 부피가 5배가 되므로 농도는 2 ÷ 5 = 0.4 mol/L가 돼요.",
          ms: "Mencairkan 100 mL larutan NaCl 2 mol/L kepada 500 mL menjadikan isi padu 5 kali ganda, maka c₂ = 2 ÷ 5 = 0.4 mol/L.",
        },
        checkQuestion: {
          ja: "溶質 0.5 mol を溶かして 250 mL（0.25 L）の溶液をつくりました。モル濃度は何 mol/L ですか？",
          ko: "용질 0.5 mol을 녹여 250 mL(0.25 L)의 용액을 만들었어요. 몰 농도는 몇 mol/L일까요?",
          ms: "0.5 mol zat terlarut dilarutkan untuk menyediakan 250 mL (0.25 L) larutan. Cari kemolarannya (mol/L):",
        },
      },
    ],
    misconceptions: {
      misc_chem_ml_not_liter: {
        label: {
          ja: "mL を L に換算せずに c = n/V に代入してしまい、1000 倍ずれる",
          ko: "mL를 L로 환산하지 않고 c = n/V에 대입하여 1000배 차이가 나기",
          ms: "Membahagi bilangan mol terus dengan mL dan bukannya L (berbeza 1000 kali)",
        },
        wrongPattern: {
          ja: "0.5 mol を 500 mL に溶かしたとき、1 mol/L ではなく 0.5 / 500 = 0.001 mol/L と計算する",
          ko: "0.5 mol을 500 mL에 녹였을 때 1 mol/L가 아니라 0.5 / 500 = 0.001 mol/L로 계산함",
          ms: "Mengira 0.5 mol / 500 mL = 0.001 mol/L dan bukannya 1 mol/L",
        },
        remediationTip: {
          ja: "単位 mol/L の分母ははっきり L と書いてあります！mL を見たら、まず 1000 で割って L に直しましょう。",
          ko: "단위 mol/L의 분모는 분명히 L예요! mL를 보면 먼저 1000으로 나누어 L로 바꾸세요.",
          ms: "Sentiasa tukar mL → L (÷ 1000) sebelum membahagi n / V.",
        },
      },
    },
  },

  // ==================== BIOLOGY ====================
  mt_bio_cell_transport: {
    description: {
      ja: "植物細胞と動物細胞のつくり（細胞壁・葉緑体・液胞）を区別し、半透膜を通して水が濃度の低い溶液（低張液）から濃度の高い溶液（高張液）へ移動するしくみを理解します。",
      ko: "식물 세포와 동물 세포의 구조(세포벽, 엽록체, 액포)를 구별하고, 반투과성 막을 통해 물이 농도가 낮은 용액(저장액)에서 농도가 높은 용액(고장액)으로 이동하는 원리를 이해해요.",
      ms: "Membandingkan organel sel tumbuhan dan haiwan (dinding sel, kloroplas, vakuol) serta meramalkan pergerakan air merentasi membran separa telap daripada larutan cair (hipotonik) ke larutan pekat (hipertonik).",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：切ったキュウリに塩をふると、しばらくして水がたくさん出てきます。塩が細胞の中に入ったのでしょうか、それとも細胞の中の水が濃い塩水のほうへ出てきたのでしょうか？",
      ko: "아이에게 물어보세요: 썬 오이에 소금을 뿌리면 잠시 후 물이 많이 나와요. 소금이 세포 안으로 들어간 걸까요, 아니면 세포 속 물이 진한 소금물 쪽으로 빠져나온 걸까요?",
      ms: "Tanya anak anda: Apabila garam ditabur pada hirisan timun dan air keluar, ke arah manakah air bergerak merentasi membran sel, dan mengapa?",
    },
    masteryCriteria: [
      {
        ja: "濃い食塩水の中で植物細胞が水を失う（原形質分離）ことと、真水の中で水を吸ってふくらむことを正しく予想できる",
        ko: "진한 소금물에서 식물 세포가 물을 잃는 것(원형질 분리)과 맑은 물에서 물을 흡수해 팽팽해지는 것을 정확히 예측할 수 있어요",
        ms: "Meramalkan plasmolisis dalam larutan garam hipertonik dan kesegahan sel dalam air suling",
      },
    ],
    intuition: {
      ja: "水分子にはいつも「濃いほうを薄めに行く」性質があります。溶質の濃度が高い（水の割合が低い）ほうへ、水は半透膜を通って移動します！",
      ko: "물 분자는 늘 '진한 쪽을 묽히러 가는' 성질이 있어요. 용질 농도가 높은(물의 비율이 낮은) 쪽으로 물이 반투과성 막을 지나 이동해요!",
      ms: "Air bergerak merentasi membran separa telap ke arah kepekatan zat terlarut yang lebih tinggi untuk menyamakan kepekatan.",
    },
    steps: [
      {
        title: {
          ja: "膜の内側と外側の溶質の濃度（%）を比べる",
          ko: "막 안팎의 용질 농도(%) 비교하기",
          ms: "Bandingkan Peratusan Zat Terlarut di Dalam dan di Luar Sel",
        },
        body: {
          ja: "細胞液の濃度が 2%、外液のショ糖水溶液の濃度が 10% なら → 外のほうが濃い → 水は細胞の外へ出ていき、細胞の質量は減ります。",
          ko: "세포액 농도가 2%, 바깥 설탕 용액 농도가 10%이면 → 바깥이 더 진함 → 물이 세포 밖으로 빠져나가 세포의 질량이 줄어들어요.",
          ms: "Jika sap sel mengandungi 2% zat terlarut dan larutan sukrosa di luar ialah 10%, air keluar dari sel dan jisim sel berkurang.",
        },
        checkQuestion: {
          ja: "細胞液の濃度が 3% のジャガイモの棒を 0.5% のうすい食塩水に入れました。ジャガイモの質量は増える（1）、減る（2）のどちらですか？",
          ko: "세포액 농도가 3%인 감자 막대를 0.5%의 묽은 소금물에 넣었어요. 감자 막대의 질량은 증가(1)할까요, 감소(2)할까요?",
          ms: "Jalur kentang (zat terlarut dalaman 3%) dimasukkan ke dalam larutan 0.5%. Adakah jisimnya bertambah (1) atau berkurang (2)?",
        },
      },
    ],
    misconceptions: {
      misc_bio_osmosis_reverse: {
        label: {
          ja: "溶質の拡散の向きと水の浸透の向きを混同し、水は濃い溶液から薄い溶液へ移動すると考える",
          ko: "용질의 확산 방향과 물의 삼투 방향을 혼동하여 물이 진한 용액에서 묽은 용액으로 이동한다고 생각하기",
          ms: "Mengelirukan kepekatan zat terlarut dengan keupayaan air (meramalkan air bergerak dari kepekatan zat terlarut tinggi ke rendah)",
        },
        wrongPattern: {
          ja: "10% の食塩水のほうが濃いので、水は 10% の液から 2% の細胞の中へ流れ込むと答える",
          ko: "10% 소금물이 더 진하므로 물이 10% 용액에서 2% 세포 안으로 흘러 들어간다고 답함",
          ms: "Menyatakan air mengalir dari larutan garam 10% ke dalam sel 2%",
        },
        remediationTip: {
          ja: "10% の食塩水は水が 90% しかなく、2% の細胞液は水が 98% です！水は 98% のほう → 90% のほう、つまり濃い食塩水のほうへ移動します。",
          ko: "10% 소금물은 물이 90%뿐이고, 2% 세포액은 물이 98%예요! 물은 98% → 90% 쪽, 즉 진한 소금물 쪽으로 이동해요.",
          ms: "Garam 10% = 90% air, manakala 2% = 98% air; air mengalir dari 98% → 90%, iaitu ke arah larutan garam yang pekat!",
        },
      },
    },
  },

  mt_bio_photosynthesis_resp: {
    description: {
      ja: "植物は光が当たっているあいだも光合成と呼吸を同時に行っていることを理解し、真の光合成速度 = 見かけの光合成速度（測定した O₂ 放出量または CO₂ 吸収量）+ 暗所での呼吸速度 として計算します。",
      ko: "식물은 빛을 받는 동안에도 광합성과 세포 호흡을 동시에 한다는 것을 이해하고, 총광합성량 = 순광합성량(측정한 O₂ 방출량 또는 CO₂ 흡수량) + 어두운 곳에서의 호흡량으로 계산해요.",
      ms: "Mengira kadar fotosintesis kasar sebagai pertukaran gas bersih yang diukur ditambah kadar respirasi sel dalam gelap.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：ある植物が光の下で O₂ を見かけ上 12 mg/h 放出し、呼吸で 4 mg/h 消費しているとき、葉緑体が実際につくった O₂ はどれだけでしょうか？",
      ko: "아이에게 물어보세요: 어떤 식물이 빛을 받을 때 O₂를 12 mg/h 순방출하고 호흡으로 4 mg/h를 소비한다면, 엽록체가 실제로 만든 O₂는 얼마일까요?",
      ms: "Tanya anak anda: Jika sebatang tumbuhan membebaskan 12 mg/h O₂ bersih dalam cahaya sambil menggunakan 4 mg/h untuk respirasi, berapakah O₂ yang sebenarnya dihasilkan oleh kloroplasnya?",
    },
    masteryCriteria: [
      {
        ja: "P_gross = P_net + R_dark（真の光合成速度 = 見かけの光合成速度 + 呼吸速度）を、呼吸量を足し忘れずに正確に使える",
        ko: "P_gross = P_net + R_dark(총광합성량 = 순광합성량 + 호흡량)를 호흡량을 빠뜨리지 않고 정확히 적용할 수 있어요",
        ms: "Mengaplikasikan P_gross = P_net + R_dark dengan tepat tanpa tertinggal kadar respirasi",
      },
    ],
    intuition: {
      ja: "葉緑体はお金をかせぐ工場（真の光合成）、ミトコンドリアは一日中お金を使う係（呼吸）です。葉の外のセンサーで測った「見かけの O₂ 放出量」は、自分の呼吸で使った分を差し引いた残りなので、真の光合成 = 見かけの光合成 + 呼吸 となります！",
      ko: "엽록체는 돈을 버는 공장(총광합성), 미토콘드리아는 하루 종일 돈을 쓰는 곳(호흡)이에요. 잎 밖의 센서로 잰 '순 O₂ 방출량'은 스스로 호흡에 쓴 양을 빼고 남은 양이므로 총광합성 = 순광합성 + 호흡이에요!",
      ms: "Pembebasan O₂ yang diukur ialah keuntungan BERSIH selepas ditolak respirasi mitokondria yang berterusan: Kasar = Bersih + Respirasi.",
    },
    steps: [
      {
        title: {
          ja: "暗所で呼吸速度、明所で見かけの光合成速度を測る",
          ko: "어두운 곳에서 호흡량, 밝은 곳에서 순광합성량 측정하기",
          ms: "Gelap Mengukur R, Cahaya Mengukur P_net",
        },
        body: {
          ja: "暗所で O₂ を 5 mg/h 吸収（R = 5）、光の下で O₂ を見かけ上 13 mg/h 放出（P_net = 13）なら、葉緑体による真の光合成の O₂ 生成量 = 13 + 5 = 18 mg/h です。",
          ko: "어두운 곳에서 O₂를 5 mg/h 흡수(R = 5)하고 빛을 받을 때 O₂를 13 mg/h 순방출(P_net = 13)하면, 엽록체의 총광합성 O₂ 생성량 = 13 + 5 = 18 mg/h예요.",
          ms: "Jika pengambilan O₂ dalam gelap R = 5 mg/h dan pembebasan O₂ bersih dalam cahaya P_net = 13 mg/h, maka P_gross = 13 + 5 = 18 mg/h.",
        },
        checkQuestion: {
          ja: "ある植物の暗所での CO₂ 放出速度は 4 mg/h、光の下での CO₂ の見かけの吸収速度は 11 mg/h です。真の光合成による CO₂ 固定速度は何 mg/h ですか？",
          ko: "어떤 식물이 어두운 곳에서 CO₂를 4 mg/h 방출하고, 빛을 받을 때 CO₂를 11 mg/h 순흡수해요. 총광합성에 의한 CO₂ 고정 속도는 몇 mg/h일까요?",
          ms: "Pembebasan CO₂ dalam gelap = 4 mg/h; pengambilan CO₂ bersih dalam cahaya = 11 mg/h. Cari kadar pengikatan CO₂ kasar (mg/h):",
        },
      },
    ],
    misconceptions: {
      misc_bio_net_minus_resp: {
        label: {
          ja: "真の光合成速度を求めるのに呼吸速度を引いてしまう（光が当たると呼吸が止まると誤解する）",
          ko: "총광합성량을 구할 때 호흡량을 빼기(빛을 받으면 호흡이 멈춘다고 착각)",
          ms: "Menolak respirasi dan bukannya menambahkannya kepada fotosintesis bersih",
        },
        wrongPattern: {
          ja: "見かけの O₂ 放出 13、呼吸による消費 5 のとき、真の光合成を 13 + 5 = 18 ではなく 13 - 5 = 8 と計算する",
          ko: "순 O₂ 방출 13, 호흡 소비 5일 때 총광합성을 13 + 5 = 18이 아니라 13 - 5 = 8로 계산함",
          ms: "Mengira P_gross = 13 - 5 = 8 dan bukannya 13 + 5 = 18",
        },
        remediationTip: {
          ja: "植物は昼間も休まず呼吸しています！葉緑体は、まず呼吸で使う 5 をまかない、さらに外へ 13 を出しているので、合計 18 をつくっています。",
          ko: "식물은 낮에도 쉬지 않고 호흡해요! 엽록체는 먼저 호흡에 쓰이는 5를 채우고 다시 밖으로 13을 내보내므로 모두 18을 만든 거예요.",
          ms: "Respirasi berlaku sepanjang masa; kloroplas mesti membekalkan R secara dalaman DAN P_net yang dibebaskan, jadi jumlahnya 5 + 13 = 18.",
        },
      },
    },
  },

  mt_bio_population_ecology: {
    description: {
      ja: "生態系ではエネルギーが一方向に流れ、栄養段階が上がるごとに減っていくことを理解し、隣り合う栄養段階の 10%–20% の転換効率を使って最大・最小のエネルギー量を計算します。",
      ko: "생태계에서 에너지는 한 방향으로 흐르며 영양 단계가 올라갈수록 줄어든다는 것을 이해하고, 인접한 영양 단계 사이의 10%–20% 전환 효율로 최대·최소 에너지양을 계산해요.",
      ms: "Memodelkan aliran tenaga sehala merentasi aras trofik menggunakan had pemindahan tenaga 10%–20%.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：草原では草が一面に広がり、ヒツジは草よりずっと少なく、オオカミはヒツジよりさらに少ないのはなぜでしょうか？栄養段階を 1 つ上がるごとに、エネルギーはどこへ行ってしまうのでしょうか？",
      ko: "아이에게 물어보세요: 초원에서 풀은 넓게 펼쳐져 있고 양은 풀보다 훨씬 적으며 늑대는 양보다도 훨씬 드문 이유는 무엇일까요? 한 단계 올라갈 때마다 에너지는 어디로 갈까요?",
      ms: "Tanya anak anda: Di padang rumput, mengapakah rumput tumbuh meluas, biri-biri jauh lebih sedikit daripada rumput, dan serigala jauh lebih jarang daripada biri-biri? Ke manakah perginya tenaga pada setiap aras ke atas?",
    },
    masteryCriteria: [
      {
        ja: "上位の栄養段階の増加量から生産者の量を求めるとき、「少なくとも」なら最大効率 20%（0.2 で割る）、「多くとも」なら 10% を選べる",
        ko: "상위 영양 단계의 증가량으로 생산자의 양을 구할 때 '최소'이면 최대 효율 20%(0.2로 나눔), '최대'이면 10%를 선택할 수 있어요",
        ms: "Menggunakan kecekapan pemindahan 20% untuk jumlah minimum pengeluar yang diperlukan dan 10% untuk jumlah maksimum",
      },
    ],
    intuition: {
      ja: "各栄養段階のエネルギーのおよそ 80%–90% は、呼吸による熱や利用されない部分として失われ、次の段階の体（生物量）になるのは 10%–20% だけです！",
      ko: "각 영양 단계 에너지의 약 80%–90%는 호흡에 의한 열과 이용되지 않은 부분으로 빠져나가고, 다음 단계의 몸(생물량)이 되는 것은 10%–20%뿐이에요!",
      ms: "Hanya 10%–20% tenaga pada satu aras trofik menjadi biojisim pada aras seterusnya; selebihnya hilang sebagai haba.",
    },
    steps: [
      {
        title: {
          ja: "「生産者は少なくとも」には最大効率 20% を使う（1 段階ごとに ×5）",
          ko: "'생산자 최소량'에는 최대 효율 20% 사용하기(단계마다 ×5)",
          ms: "Pengeluar Minimum Menggunakan Kecekapan 20% (×5 bagi setiap langkah)",
        },
        body: {
          ja: "草 → ウサギ → タカ：タカが 1 kg 増えるには、ウサギが少なくとも 1 ÷ 0.2 = 5 kg、草が少なくとも 5 ÷ 0.2 = 25 kg 必要です。",
          ko: "풀 → 토끼 → 매: 매가 1 kg 늘려면 토끼가 최소 1 ÷ 0.2 = 5 kg, 풀이 최소 5 ÷ 0.2 = 25 kg 필요해요.",
          ms: "Rumput → Arnab → Helang: pertambahan 1 kg helang memerlukan sekurang-kurangnya 1 / 0.2 = 5 kg arnab dan 5 / 0.2 = 25 kg rumput.",
        },
        checkQuestion: {
          ja: "「植物プランクトン → 小魚 → 大型の魚」の食物連鎖で、大型の魚が 2 kg 増えるには、効率 20% で計算すると植物プランクトンが少なくとも何 kg 必要ですか？",
          ko: "'식물성 플랑크톤 → 작은 물고기 → 큰 물고기' 먹이 사슬에서 큰 물고기가 2 kg 늘려면(효율 20%로 계산할 때) 식물성 플랑크톤이 최소 몇 kg 필요할까요?",
          ms: "Dalam rantai Fitoplankton → Ikan Kecil → Ikan Besar, pada kecekapan 20%, berapakah sekurang-kurangnya kg fitoplankton yang diperlukan untuk pertambahan 2 kg Ikan Besar?",
        },
      },
    ],
    misconceptions: {
      misc_bio_trophic_wrong_bound: {
        label: {
          ja: "「生産者は少なくとも何 kg 必要か」と問われているのに、20% ではなく 10% を使う（または 1 段階分しか計算しない）",
          ko: "'생산자가 최소 몇 kg 필요한가'를 묻는데 20%가 아닌 10%를 사용하기(또는 한 단계만 계산하기)",
          ms: "Menggunakan 10% dan bukannya 20% apabila diminta jumlah MINIMUM pengeluar yang diperlukan",
        },
        wrongPattern: {
          ja: "生産者の最小量を求めるのに、5×5 = 25 倍ではなく 10×10 = 100 倍してしまう",
          ko: "생산자 최소량을 구할 때 5×5 = 25배가 아니라 10×10 = 100배를 곱함",
          ms: "Mendarab dengan 10×10 = 100 dan bukannya 5×5 = 25 untuk pengeluar minimum",
        },
        remediationTip: {
          ja: "「原料が少なくてすむ」のは転換効率がいちばん高いときです。だから上限の 20%（1 段階さかのぼるごとに ×5）を選びます！",
          ko: "'원료가 가장 적게 드는' 경우는 전환 효율이 가장 높을 때예요. 그래서 상한인 20%(한 단계 거슬러 올라갈 때마다 ×5)를 선택해요!",
          ms: "'Input minimum yang diperlukan' sepadan dengan kecekapan maksimum (20%, iaitu ×5 bagi setiap aras trofik).",
        },
      },
    },
  },

  // ==================== COMPUTING & AI ====================
  mt_cs_loops_trace: {
    description: {
      ja: "`for i in range(1, n)` のようなループで累積変数の値の変化を追跡し、範囲の終わりの値が含まれるかどうか（半開区間か閉区間か）に注意します。",
      ko: "`for i in range(1, n)` 같은 반복문에서 누적 변수의 변화를 추적하고, 범위의 끝값이 포함되는지(반열린 구간인지 닫힌 구간인지)에 주의해요.",
      ms: "Menjejak kemas kini pemboleh ubah pengumpul merentasi lelaran gelung seperti `for i in range(1, n)` dan memerhati sempadan gelung inklusif atau eksklusif.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：Python で `for i in range(1, 5)` と書いてロボットに数を数えさせると、最後に言う数は 4 と 5 のどちらでしょうか？",
      ko: "아이에게 물어보세요: 파이썬에서 `for i in range(1, 5)`로 로봇에게 수를 세게 하면 마지막에 말하는 수는 4일까요, 5일까요?",
      ms: "Tanya anak anda: Dalam Python, jika robot mengira `for i in range(1, 5)`, adakah nombor terakhir yang disebutnya 4 atau 5?",
    },
    masteryCriteria: [
      {
        ja: "`range(1, n)` は `n - 1` で終わる（半開区間で、上限 `n` は含まれない）ことがわかる",
        ko: "`range(1, n)`은 `n - 1`에서 멈춘다는 것(반열린 구간으로 상한 `n`은 포함되지 않음)을 알아요",
        ms: "Mengenal pasti bahawa `range(1, n)` berhenti pada `n - 1` (selang separuh terbuka)",
      },
    ],
    intuition: {
      ja: "Python の `range(a, b)` は半開区間 `[a, b)` の「電車」です。`a` 駅で乗って、`b` 駅の看板が見えたらその手前で降ります（`b` は実行しません）！",
      ko: "파이썬의 `range(a, b)`는 반열린 구간 `[a, b)`의 '기차'예요. `a`역에서 타고 `b`역 표지판이 보이면 바로 내려요(`b`는 실행하지 않아요)!",
      ms: "`range(a, b)` ialah selang separuh terbuka `[a, b)`: ia bermula pada `a` dan berhenti sejurus SEBELUM mencapai `b`.",
    },
    steps: [
      {
        title: {
          ja: "i と s の 2 行のトレース表を書く",
          ko: "i와 s의 2행 추적표 작성하기",
          ms: "Tulis Jadual Surih 2 Baris (i, s)",
        },
        body: {
          ja: "`s = 0; for i in range(1, 5): s += i` では、i は 1, 2, 3, 4 の順に変わり、最終的に s = 1+2+3+4 = 10 になります（15 ではありません！）。",
          ko: "`s = 0; for i in range(1, 5): s += i`에서 i는 1, 2, 3, 4를 차례로 가지며 최종적으로 s = 1+2+3+4 = 10이 돼요(15가 아니에요!).",
          ms: "Bagi `s = 0; for i in range(1, 5): s += i`, `i` mengambil nilai 1, 2, 3, 4, menghasilkan s = 1+2+3+4 = 10 (bukan 15!).",
        },
        checkQuestion: {
          ja: "`s = 0; for i in range(1, 6): s += i` を実行したあと、s の値はいくつですか？",
          ko: "`s = 0; for i in range(1, 6): s += i`를 실행한 뒤 s의 최종 값은 얼마일까요?",
          ms: "Selepas `s = 0; for i in range(1, 6): s += i` dilaksanakan, apakah nilai `s`?",
        },
      },
    ],
    misconceptions: {
      misc_cs_off_by_one_range: {
        label: {
          ja: "1 つずれるエラー（Off-by-One）：`range(1, n)` の終わりの値 `n` まで足してしまう",
          ko: "하나 차이 오류(Off-by-One): `range(1, n)`의 끝값 `n`까지 더해 버리기",
          ms: "Ralat beza satu (off-by-one): memasukkan nilai henti eksklusif `n` dalam `range(1, n)`",
        },
        wrongPattern: {
          ja: "`range(1, 5)` の合計を 10 ではなく 1+2+3+4+5 = 15 と計算する",
          ko: "`range(1, 5)`의 합을 10이 아니라 1+2+3+4+5 = 15로 계산함",
          ms: "Menilai hasil tambah `range(1, 5)` sebagai 15 dan bukannya 10",
        },
        remediationTip: {
          ja: "`range(a, b)` に含まれる数は `b - a` 個で、いちばん大きいのは `b - 1` です！",
          ko: "`range(a, b)`에 포함된 수는 `b - a`개이고, 가장 큰 수는 `b - 1`이에요!",
          ms: "`range(a, b)` menghasilkan `b - a` lelaran, berakhir pada `b - 1`.",
        },
      },
    },
  },

  mt_cs_arrays_binary_search: {
    description: {
      ja: "二分探索はデータが順番に整列済みであることが前提で、1 回の比較で候補の範囲の半分を除外できることを理解し、最悪の場合の比較回数 ⌊log₂ N⌋ + 1 を計算します。",
      ko: "이진 탐색은 데이터가 정렬되어 있어야 한다는 전제 아래 한 번 비교할 때마다 후보 범위의 절반을 제외한다는 것을 이해하고, 최악의 경우 비교 횟수 ⌊log₂ N⌋ + 1을 계산해요.",
      ms: "Mengaplikasikan carian perduaan pada tatasusunan yang telah diisih dan mengira bilangan perbandingan kes terburuk ⌊log₂ N⌋ + 1.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：1 から 100 までの整数を 1 つ思い浮かべてもらい、「もっと大きい／もっと小さい／当たり」だけで答える数当てゲームをすると、なぜ 7 回あれば必ず当てられるのでしょうか？",
      ko: "아이에게 물어보세요: 1부터 100까지의 정수 하나를 떠올리고 '더 크다/더 작다/맞았다'로만 답하는 숫자 맞히기 게임에서 왜 7번이면 반드시 맞힐 수 있을까요?",
      ms: "Tanya anak anda: Dalam permainan 'Teka Nombor Saya' dari 1 hingga 100 dengan petunjuk Lebih Besar/Lebih Kecil, mengapakah 7 tekaan SENTIASA mencukupi?",
    },
    masteryCriteria: [
      {
        ja: "N = 2^k - 1 個（7, 15, 31, 63, 127 など）の整列済みデータに対する二分探索の最大比較回数 k を正確に求めることができる",
        ko: "N = 2^k - 1개(7, 15, 31, 63, 127 등)의 정렬된 데이터에서 이진 탐색의 최대 비교 횟수 k를 정확히 구할 수 있어요",
        ms: "Mengira bilangan perbandingan kes terburuk k dengan tepat bagi N = 2^k - 1 unsur yang telah diisih",
      },
    ],
    intuition: {
      ja: "毎回ちょうど真ん中の数を聞けば、候補の範囲は一気に半分になります！2⁷ = 128 ≥ 100 なので、100 個の数でも最大 7 回で必ず見つかります。",
      ko: "매번 정가운데 수를 물어보면 후보 범위가 단번에 절반으로 줄어들어요! 2⁷ = 128 ≥ 100이므로 100개의 수라도 최대 7번이면 반드시 찾을 수 있어요.",
      ms: "Setiap semakan titik tengah membahagi dua ruang carian; oleh sebab 2⁷ = 128 ≥ 100, paling banyak 7 perbandingan sudah cukup untuk mencari sebarang unsur.",
    },
    steps: [
      {
        title: {
          ja: "2 のべき乗で半分にする回数を数える",
          ko: "2의 거듭제곱으로 절반 줄이기 횟수 세기",
          ms: "Kiraan Pembahagian Dua melalui Kuasa 2",
        },
        body: {
          ja: "N = 15 のとき、15 → 7 → 3 → 1 → 0 となり、2³ ≤ 15 < 2⁴ から最大 3 + 1 = 4 回の比較が必要です。",
          ko: "N = 15일 때 15 → 7 → 3 → 1 → 0이 되어, 2³ ≤ 15 < 2⁴이므로 최대 3 + 1 = 4번 비교가 필요해요.",
          ms: "Bagi N = 15 item yang telah diisih, 2³ ≤ 15 < 2⁴, maka perbandingan kes terburuk = 3 + 1 = 4.",
        },
        checkQuestion: {
          ja: "昇順に並んだ 31 個の要素をもつ配列で二分探索を行うとき、最悪の場合、比較は最大何回必要ですか？",
          ko: "오름차순으로 정렬된 31개의 원소를 가진 배열에서 이진 탐색을 할 때 최악의 경우 최대 몇 번 비교해야 할까요?",
          ms: "Dalam tatasusunan terisih yang mengandungi 31 unsur, berapakah bilangan maksimum perbandingan carian perduaan?",
        },
      },
    ],
    misconceptions: {
      misc_cs_bsearch_half_linear: {
        label: {
          ja: "二分探索の最悪の比較回数を ⌊log₂ N⌋ + 1 ではなく N/2 と計算する（くり返し半分にすることと、1 回だけ半分にすることの混同）",
          ko: "이진 탐색의 최악 비교 횟수를 ⌊log₂ N⌋ + 1이 아니라 N/2로 계산하기(반복해서 절반으로 줄이는 것과 한 번만 절반으로 줄이는 것을 혼동)",
          ms: "Mengira perbandingan kes terburuk carian perduaan sebagai N/2 dan bukannya ⌊log₂ N⌋ + 1",
        },
        wrongPattern: {
          ja: "31 個の要素の二分探索の最大比較回数を、5 回ではなく 15 回や 16 回と答える",
          ko: "31개 원소의 이진 탐색 최대 비교 횟수를 5번이 아니라 15번이나 16번으로 답함",
          ms: "Menyatakan 31 unsur memerlukan 15 perbandingan dan bukannya 5",
        },
        remediationTip: {
          ja: "半分にするのは 1 回だけではなく、「毎回くり返し半分にする」のです！2 の何乗で N をおおえるかを考えましょう。",
          ko: "절반으로 줄이는 것은 한 번이 아니라 '매번 계속' 하는 거예요! 2의 몇 제곱이 N을 덮을 수 있는지 생각해 보세요.",
          ms: "Carian perduaan membahagi dua BERULANG KALI pada setiap langkah: kira kuasa 2, bukan N ÷ 2!",
        },
      },
    },
  },

  mt_cs_algo_complexity: {
    description: {
      ja: "二重ループの内側の文が実行される総回数を数え、データの規模が k 倍になると O(n²) のアルゴリズムの実行時間は k² 倍になることを理解します。",
      ko: "이중 반복문 안쪽 문장이 실행되는 총횟수를 세고, 데이터 크기가 k배가 되면 O(n²) 알고리즘의 실행 시간이 k²배가 된다는 것을 이해해요.",
      ms: "Mengira bilangan pelaksanaan gelung dalam bagi gelung bersarang dan meramalkan penskalaan masa larian k² apabila saiz input digandakan k kali.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：クラス全員が自分以外の全員と 1 回ずつ握手するとき、人数が 20 人から 40 人に 2 倍になると、握手の総回数は 2 倍になるでしょうか、それともおよそ 4 倍になるでしょうか？",
      ko: "아이에게 물어보세요: 반 전체가 자기를 뺀 모든 사람과 한 번씩 악수할 때, 인원이 20명에서 40명으로 2배가 되면 악수 총횟수는 2배가 될까요, 아니면 약 4배가 될까요?",
      ms: "Tanya anak anda: Jika setiap orang dalam bilik bersalaman dengan semua orang lain, apabila bilangan orang berganda daripada 20 kepada 40, adakah jumlah salaman berganda dua atau lebih kurang empat kali ganda?",
    },
    masteryCriteria: [
      {
        ja: "O(n²) のアルゴリズムで入力の規模が k 倍になったとき、実行時間が k² 倍になる（T(k·n) = k² · T(n)）ことを正確に予測できる",
        ko: "O(n²) 알고리즘에서 입력 크기가 k배가 될 때 실행 시간이 k²배가 됨(T(k·n) = k² · T(n))을 정확히 예측할 수 있어요",
        ms: "Meramalkan T(k·n) = k² · T(n) bagi algoritma kuadratik O(n²)",
      },
    ],
    intuition: {
      ja: "外側のループが n 回まわり、その 1 回ごとに内側が n 回まわるので、合計の回数は正方形の面積 n×n = n² と同じです！1 辺を 3 倍にすれば、面積は 3² = 9 倍になります。",
      ko: "바깥 반복문이 n번 돌고, 한 번 돌 때마다 안쪽이 n번 돌므로 총횟수는 정사각형의 넓이 n×n = n²과 같아요! 한 변을 3배로 늘리면 넓이는 3² = 9배가 돼요.",
      ms: "Gelung bersarang n × n berkelakuan seperti luas segi empat sama: menskalakan sisi n sebanyak k kali menskalakan kerja sebanyak k²!",
    },
    steps: [
      {
        title: {
          ja: "2 乗の倍率ですばやく見積もる",
          ko: "제곱 배율로 빠르게 어림하기",
          ms: "Faktor Penskalaan Kuadratik",
        },
        body: {
          ja: "バブルソートで 1000 件のデータの処理に 2 秒かかるとき、データ量が 3 倍の 3000 件になると、時間はおよそ 2 × 3² = 18 秒になります。",
          ko: "버블 정렬로 1000개의 데이터를 처리하는 데 2초가 걸리면, 데이터가 3배인 3000개가 될 때 시간은 약 2 × 3² = 18초가 돼요.",
          ms: "Jika isihan O(n²) mengambil masa 2 s untuk N = 1000, maka bagi N = 3000 (3×) masa yang diambil ≈ 2 × 3² = 18 s.",
        },
        checkQuestion: {
          ja: "ある O(n²) のアルゴリズムで N=500 の処理に 3 秒かかります。N=1000（2 倍）のとき、およそ何秒かかりますか？",
          ko: "어떤 O(n²) 알고리즘이 N=500을 처리하는 데 3초가 걸려요. N=1000(2배)일 때 약 몇 초가 걸릴까요?",
          ms: "Satu algoritma O(n²) mengambil masa 3 s untuk N=500. Anggarkan masa larian (s) bagi N=1000:",
        },
      },
    ],
    misconceptions: {
      misc_cs_quad_linear_scale: {
        label: {
          ja: "O(n²) の実行時間を k² 倍ではなく k 倍の比例で見積もってしまう（倍率の 2 乗を忘れる）",
          ko: "O(n²)의 실행 시간을 k²배가 아니라 k배로 비례 계산하기(배율의 제곱을 빠뜨림)",
          ms: "Menskalakan masa larian O(n²) secara linear dengan k dan bukannya secara kuadratik dengan k²",
        },
        wrongPattern: {
          ja: "規模が 3 倍になったとき、もとの 2 秒を 2 × 9 = 18 秒ではなく 2 × 3 = 6 秒と計算する",
          ko: "크기가 3배가 될 때 원래 2초를 2 × 9 = 18초가 아니라 2 × 3 = 6초로 계산함",
          ms: "Meramalkan 2 × 3 = 6 s dan bukannya 2 × 9 = 18 s",
        },
        remediationTip: {
          ja: "O(n²) は指数の 2 に注目しましょう！入力を k 倍にしたら、時間は必ず k² 倍になります。",
          ko: "O(n²)에서는 지수 2에 주목하세요! 입력이 k배가 되면 시간은 반드시 k²배가 돼요.",
          ms: "Dalam O(n²), mendarab saiz input dengan k mendarab bilangan operasi dengan k².",
        },
      },
    },
  },
};
