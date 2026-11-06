import type { EdgeReasonOverlay } from "./overlay";

/**
 * Native ja / ko / ms text for every CANONICAL_EDGES reason.
 * Key format: `${prerequisiteId}->${topicId}`.
 */
export const EDGE_REASON_I18N: EdgeReasonOverlay = {
  // ==================== 1. MATHEMATICS WITHIN-SUBJECT DAG ====================
  "mt_math_place_value_ops->mt_math_frac_concept_equiv": {
    ja: "等分としての分数の意味や、約分・通分による同値な分数への変形は、整数のかけ算・わり算（逆演算の関係や約数・倍数）の習熟の上に成り立ちます",
    ko: "똑같이 나누기로서의 분수의 의미와 약분·통분을 통한 크기가 같은 분수로의 변형은 자연수의 곱셈·나눗셈(역연산 관계와 약수·배수)에 대한 숙달을 바탕으로 합니다",
    ms: "Maksud pecahan sebagai pembahagian sama rata serta permudahan pecahan setara bergantung pada kefasihan pendaraban dan pembahagian nombor bulat",
  },
  "mt_math_frac_concept_equiv->mt_math_frac_add_sub": {
    ja: "分母の異なる分数のたし算・ひき算では、まず同じ大きさの分数の性質を使って通分し、分母をそろえる必要があります",
    ko: "분모가 다른 분수의 덧셈과 뺄셈은 먼저 크기가 같은 분수의 성질을 이용해 통분하여 분모를 같게 해야 합니다",
    ms: "Penambahan atau penolakan pecahan yang berlainan penyebut memerlukan penukaran kepada pecahan setara yang mempunyai penyebut sepunya",
  },
  "mt_math_frac_concept_equiv->mt_math_frac_mul_div": {
    ja: "分数のかけ算・わり算での途中の約分や逆数をかける変形は、分数の基本的な性質に直接もとづいています",
    ko: "분수의 곱셈·나눗셈에서 약분과 역수를 곱하는 변형은 분수의 기본 성질에 직접 의존합니다",
    ms: "Pembatalan silang dan pendaraban dengan salingan bergantung secara langsung pada sifat pecahan setara",
  },
  "mt_math_frac_add_sub->mt_math_frac_mul_div": {
    ja: "分数の四則混合計算や「残り」を求める文章題では、先にたし算・ひき算で部分の量（1 - a/b）を求めてから、かけ算・わり算で対応させることがよくあります",
    ko: "분수의 혼합 계산과 '남은 양'을 구하는 문장제에서는 먼저 덧셈·뺄셈으로 부분의 양(1 - a/b)을 구한 뒤 곱셈·나눗셈을 적용하는 경우가 많습니다",
    ms: "Masalah berayat pecahan berbilang langkah menggabungkan baki pecahan (1 - a/b) dengan pendaraban dan pembahagian",
  },
  "mt_math_frac_mul_div->mt_math_ratio_percent": {
    ja: "比・百分率（割引など）や、シンガポール式のテープ図（バーモデル）による単位量の考え方は、分数のかけ算・わり算を一般化したものです",
    ko: "비, 백분율 변화(할인 등), 싱가포르식 막대 모델(바 모델)을 이용한 단위량 추론은 분수의 곱셈·나눗셈을 일반화한 것입니다",
    ms: "Nisbah, perubahan peratusan dan penaakulan unitari model bar (pendekatan CPA Singapura) merupakan pengitlakan pendaraban dan pembahagian pecahan",
  },
  "mt_math_place_value_ops->mt_math_geometry_area_perim": {
    ja: "周の長さ・面積の公式を使った計算や単位の換算は、整数の四則計算と十進位取り記数法の理解にもとづいています",
    ko: "둘레와 넓이 공식 계산 및 단위 환산은 자연수의 사칙연산과 십진 자릿값에 대한 이해를 바탕으로 합니다",
    ms: "Rumus luas dan perimeter serta penukaran unit metrik bergantung pada nilai tempat asas 10 dan empat operasi asas",
  },
  "mt_math_frac_mul_div->mt_math_geometry_area_perim": {
    ja: "三角形や台形の面積の公式には 1/2 が含まれ、底辺や高さを逆に求めるときには分数のかけ算・わり算の逆の関係を使います",
    ko: "삼각형과 사다리꼴의 넓이 공식에는 1/2이 들어 있어, 밑변이나 높이를 거꾸로 구할 때 분수의 곱셈과 나눗셈의 역관계를 이용합니다",
    ms: "Rumus luas segi tiga dan trapezium melibatkan faktor 1/2, dan mencari tinggi memerlukan operasi songsang iaitu pembahagian",
  },
  "mt_math_place_value_ops->mt_math_signed_numbers": {
    ja: "正負の数の四則計算や累乗は、0 以上の数での計算の順序のきまりを、数直線の正と負の両方向に広げたものです",
    ko: "유리수의 사칙연산과 거듭제곱은 음이 아닌 수에서의 연산 순서 규칙을 수직선의 양과 음 두 방향으로 확장한 것입니다",
    ms: "Aritmetik nombor nisbah bertanda memperluaskan tertib operasi nombor bulat ke arah positif dan negatif",
  },
  "mt_math_frac_add_sub->mt_math_signed_numbers": {
    ja: "負の分数を含む正負の数の加法・減法では、通分と符号のきまりを同時に使います",
    ko: "음의 분수를 포함한 유리수의 덧셈과 뺄셈에서는 통분과 부호 규칙을 함께 사용합니다",
    ms: "Penambahan dan penolakan nombor nisbah bertanda menggabungkan penyebut sepunya dengan petua tanda",
  },
  "mt_math_signed_numbers->mt_math_alg_expressions": {
    ja: "同類項をまとめることや、かっこの前の負の符号による符号の変化は、正負の数の符号のきまりに直接もとづいています",
    ko: "동류항 정리와 괄호 앞 음의 부호에 따른 부호 변화는 유리수의 부호 규칙에 직접 바탕을 둡니다",
    ms: "Menggabungkan sebutan serupa dan mengembangkan tanda negatif bergantung secara langsung pada petua nombor bertanda",
  },
  "mt_math_alg_expressions->mt_math_linear_eq_one": {
    ja: "一次方程式を解くときの、かっこをはずす・移項する・同類項をまとめるといった操作は、等式の両辺の式を同値変形することにほかなりません",
    ko: "일차방정식을 풀 때의 괄호 풀기, 이항, 동류항 정리는 본질적으로 등식 양변의 식을 같은 관계를 유지하며 변형하는 것입니다",
    ms: "Menyelesaikan persamaan linear memerlukan pengembangan kurungan dan penggabungan sebutan algebra dengan tepat",
  },
  "mt_math_frac_add_sub->mt_math_linear_eq_one": {
    ja: "分母を含む一次方程式で「両辺に最小公倍数をかけて分母をはらう」操作は、通分で身につけた公倍数の感覚にもとづいています",
    ko: "분모가 있는 일차방정식에서 '양변에 최소공배수를 곱해 분모를 없애는' 과정은 통분에서 익힌 공배수 감각에 바탕을 둡니다",
    ms: "Menghapuskan penyebut pecahan dalam persamaan linear bergantung pada kefasihan gandaan sepunya terkecil (GSTK) daripada penambahan pecahan",
  },
  "mt_math_linear_eq_one->mt_math_linear_systems": {
    ja: "連立方程式は、代入法や加減法で文字を消去すると、最終的に一次方程式を解くことに帰着します",
    ko: "연립일차방정식은 대입법이나 가감법으로 미지수를 소거하면 결국 일차방정식을 푸는 문제로 바뀝니다",
    ms: "Kaedah penghapusan dan penggantian menurunkan sistem persamaan linear 2x2 kepada persamaan linear satu pemboleh ubah",
  },
  "mt_math_linear_eq_one->mt_math_coord_linear_func": {
    ja: "一次関数 y = kx + b と x 軸との交点を求めたり、y の値から x を逆に求めたりするには、一次方程式を解く必要があります",
    ko: "일차함수 y = kx + b의 x절편을 구하거나 주어진 함숫값으로부터 x를 거꾸로 구하려면 일차방정식을 풀어야 합니다",
    ms: "Mencari pintasan-x dan nilai input bagi y = kx + b memerlukan penyelesaian persamaan linear",
  },
  "mt_math_linear_systems->mt_math_coord_linear_func": {
    ja: "2 点から直線の式 y = kx + b を決めたり、2 直線の交点の座標を求めたりするには、連立方程式を解く必要があります",
    ko: "두 점으로 직선의 식 y = kx + b를 정하거나 두 직선의 교점 좌표를 구하려면 연립일차방정식을 풀어야 합니다",
    ms: "Menentukan y = kx + b daripada dua titik dan mencari titik persilangan dua garis memerlukan penyelesaian sistem persamaan linear 2x2",
  },
  "mt_math_alg_expressions->mt_math_special_products_factor": {
    ja: "乗法公式（和と差の積・平方の公式）と因数分解は、分配法則による式の展開を逆にたどる構造的な操作です",
    ko: "곱셈 공식(합차 공식, 완전제곱식)과 인수분해는 분배법칙에 의한 다항식 전개를 거꾸로 하는 구조적인 연산입니다",
    ms: "Hasil darab khas dan pemfaktoran dibina secara langsung atas pengembangan polinomial dan hukum kalis agihan",
  },
  "mt_math_linear_eq_one->mt_math_rational_eq": {
    ja: "分数方程式は両辺に最小公分母をかけて分母をはらうと整式の方程式になり、それを解いたあとで解を確かめます",
    ko: "분수방정식은 양변에 최소공분모를 곱해 분모를 없애면 다항방정식이 되며, 이를 푼 뒤 근이 맞는지 확인합니다",
    ms: "Mendarab kedua-dua belah dengan penyebut sepunya terkecil menukarkan persamaan pecahan algebra kepada persamaan linear atau polinomial",
  },
  "mt_math_special_products_factor->mt_math_rational_eq": {
    ja: "多項式の分母の最小公分母を決めたり分数式を約分したりするには、まず分母を因数分解しなければなりません",
    ko: "다항식 분모의 최소공분모를 정하고 분수식을 약분하려면 먼저 분모를 인수분해해야 합니다",
    ms: "Mencari penyebut sepunya terkecil dan sekatan domain persamaan pecahan algebra memerlukan pemfaktoran penyebut",
  },
  "mt_math_geometry_area_perim->mt_math_radicals_pythagoras": {
    ja: "三平方の定理の面積を使った証明や直角三角形の辺の長さの計算は、平面図形の面積の考え方の上に成り立っています",
    ko: "피타고라스 정리의 넓이를 이용한 증명과 직각삼각형의 변의 길이 계산은 평면도형의 넓이 개념을 바탕으로 합니다",
    ms: "Pembuktian teorem Pythagoras dan aplikasi geometrinya berasaskan konsep luas poligon",
  },
  "mt_math_special_products_factor->mt_math_radicals_pythagoras": {
    ja: "a² + b² = c² の代数的な証明（趙爽の弦図など）や分母の有理化は、平方の公式や和と差の積の公式にもとづいています",
    ko: "a² + b² = c²의 대수적 증명(조상의 현도 등)과 분모의 유리화는 완전제곱식과 합차 공식에 의존합니다",
    ms: "Pembuktian algebra bagi a² + b² = c² dan perasionalan penyebut bergantung pada identiti hasil darab khas",
  },
  "mt_math_special_products_factor->mt_math_quad_complete_sq": {
    ja: "(x + b/2a)² の形をつくる平方完成や、因数分解による二次方程式の解法は、平方の公式やたすきがけに直接もとづいています",
    ko: "(x + b/2a)² 꼴을 만드는 완전제곱식 변형과 인수분해를 이용한 이차방정식 풀이는 완전제곱 공식에 직접 의존합니다",
    ms: "Penyempurnaan kuasa dua dan pemfaktoran ungkapan kuadratik bergantung secara langsung pada trinomial kuasa dua sempurna",
  },
  "mt_math_radicals_pythagoras->mt_math_quad_complete_sq": {
    ja: "平方根の考えを使った解法や、解の公式で √(b² - 4ac) を簡単にするには、根号を含む式の計算と正負の平方根の理解が欠かせません",
    ko: "제곱근을 이용한 풀이와 근의 공식에서 √(b² - 4ac)를 간단히 하려면 근호를 포함한 식의 계산과 양·음의 제곱근을 알아야 합니다",
    ms: "Menggunakan rumus kuadratik dan mencari punca kuasa dua memerlukan permudahan surd dengan tepat",
  },
  "mt_math_coord_linear_func->mt_math_quad_function_parabola": {
    ja: "二次関数のグラフをかくことや、軸・増加や減少の範囲を読み取ることは、座標平面と一次関数の理解の上に成り立ちます",
    ko: "이차함수 그래프 그리기와 축, 증가·감소 구간 해석은 좌표평면과 일차함수에 대한 이해를 바탕으로 합니다",
    ms: "Melakar graf parabola dan menganalisis selang bergantung pada kefasihan satah Cartes dan fungsi linear",
  },
  "mt_math_quad_complete_sq->mt_math_quad_function_parabola": {
    ja: "一般形を頂点の形 a(x-h)²+k に変形するには平方完成を使い、放物線と x 軸との交点を求めるには二次方程式 ax² + bx + c = 0 を解きます",
    ko: "일반형을 꼭짓점 형태 a(x-h)²+k로 바꿀 때는 완전제곱식을 이용하고, 포물선의 x절편을 구할 때는 이차방정식 ax² + bx + c = 0을 풉니다",
    ms: "Menukar kepada bentuk verteks a(x-h)²+k menggunakan penyempurnaan kuasa dua, dan mencari pintasan-x memerlukan penyelesaian ax² + bx + c = 0",
  },
  "mt_math_radicals_pythagoras->mt_math_trig_right_triangle": {
    ja: "2 辺から残りの辺を求めたり、30°・45°・60° の三角比の正確な値を導いたりするには、三平方の定理と根号の計算が必要です",
    ko: "두 변으로 나머지 변을 구하거나 30°, 45°, 60°의 정확한 삼각비 값을 유도하려면 피타고라스 정리와 근호 계산이 필요합니다",
    ms: "Menyelesaikan segi tiga bersudut tegak dan menerbitkan nilai tepat nisbah trigonometri 30°-45°-60° bergantung pada teorem Pythagoras dan surd",
  },
  "mt_math_ratio_percent->mt_math_trig_right_triangle": {
    ja: "正弦・余弦・正接は、相似な直角三角形で対応する辺の比が一定であることにもとづく値です",
    ko: "사인, 코사인, 탄젠트는 닮은 직각삼각형에서 대응변의 비가 일정하다는 데서 나온 값입니다",
    ms: "Sinus, kosinus dan tangen ialah nisbah sisi yang tetap bagi segi tiga bersudut tegak yang serupa",
  },
  "mt_math_quad_function_parabola->mt_math_calc_derivative_tangent": {
    ja: "微分は曲線の瞬間の変化率・接線・極値を調べるもので、二次関数や多項式関数のグラフの特徴がその直接の題材になります",
    ko: "미분은 곡선의 순간변화율, 접선, 극값을 다루며, 이차함수와 다항함수 그래프의 특징이 그 직접적인 소재가 됩니다",
    ms: "Pembezaan menganalisis kadar perubahan seketika dan titik ekstremum, bermula daripada lengkung kuadratik dan polinomial",
  },
  "mt_math_coord_linear_func->mt_math_calc_derivative_tangent": {
    ja: "微分係数の図形的な意味は割線の傾き Δy/Δx の極限であり、接線の方程式は 1 点と傾きから求める直線の式をそのまま使います",
    ko: "미분계수의 기하적 의미는 할선의 기울기 Δy/Δx의 극한이며, 접선의 방정식은 한 점과 기울기로 정하는 직선의 방정식을 그대로 사용합니다",
    ms: "Kecerunan tangen ialah had bagi kecerunan sekan Δy/Δx, dan persamaan garis tangen menggunakan bentuk titik-kecerunan",
  },

  // ==================== 2. PHYSICS + CROSS-SUBJECT BRIDGES ====================
  "mt_math_ratio_percent->mt_phy_measurement_density": {
    ja: "【数学ブリッジ】密度 ρ = m/V の比による定義と組立単位の換算は、数学の比例の考え方にもとづいています",
    ko: "【수학 브리지】 밀도 ρ = m/V의 비율 정의와 복합 단위 환산은 수학의 비례적 사고를 바탕으로 합니다",
    ms: "[Jambatan Matematik] Ketumpatan ρ = m/V dan penukaran unit terbitan bergantung pada penaakulan berkadaran",
  },
  "mt_phy_measurement_density->mt_phy_speed_motion_graphs": {
    ja: "運動の速さの測定は、国際単位系（SI）による長さ・時間の基本量の測定と単位の換算の上に成り立っています",
    ko: "운동에서의 속력 측정은 국제단위계(SI)의 길이와 시간 기본량 측정 및 단위 환산을 바탕으로 합니다",
    ms: "Kinematik dibina atas pengukuran unit asas SI serta penukaran unit terbitan",
  },
  "mt_math_coord_linear_func->mt_phy_speed_motion_graphs": {
    ja: "【数学ブリッジ】s-t グラフの直線の傾きは、そのまま速度 v = Δs/Δt に対応します（一次関数の傾きの応用）",
    ko: "【수학 브리지】 s-t 그래프에서 직선의 기울기는 곧 속도 v = Δs/Δt에 해당하며, 이는 일차함수의 기울기를 적용한 것입니다",
    ms: "[Jambatan Matematik] Mentafsir kecerunan graf s-t sebagai halaju v = Δs/Δt mengaplikasikan kecerunan fungsi linear",
  },
  "mt_phy_speed_motion_graphs->mt_phy_forces_newton": {
    ja: "ニュートンの運動の法則や加速度 a を理解するには、まず速度と運動のようすの表し方を身につける必要があります",
    ko: "뉴턴 운동 법칙과 가속도 a를 이해하려면 먼저 속도와 운동 상태를 나타내는 방법을 익혀야 합니다",
    ms: "Hukum gerakan Newton dan pecutan dibina secara langsung atas halaju dan graf gerakan",
  },
  "mt_math_linear_eq_one->mt_phy_forces_newton": {
    ja: "【数学ブリッジ】力の分析から合力の式 F_net = F_pull - f = ma を立てて未知の量を求めるには、一次方程式を解く必要があります",
    ko: "【수학 브리지】 힘의 분석으로 알짜힘 식 F_net = F_pull - f = ma를 세워 모르는 양을 구하려면 일차방정식을 풀어야 합니다",
    ms: "[Jambatan Matematik] Menyelesaikan F_net = F_pull - f = ma memerlukan persamaan linear",
  },
  "mt_phy_measurement_density->mt_phy_circuits_series_parallel": {
    ja: "電流計・電圧計の測定範囲（端子）の選び方や最小目盛りの読み取りは、物理の基本的な測定のきまりに従います",
    ko: "전류계와 전압계의 측정 범위 선택과 최소 눈금 읽기는 물리의 기본 측정 규칙을 따릅니다",
    ms: "Membaca ammeter dan voltmeter mengikut kemahiran asas pengukuran fizik",
  },
  "mt_math_linear_eq_one->mt_phy_circuits_series_parallel": {
    ja: "【数学ブリッジ】直列回路の電圧 U = U₁ + U₂ や並列回路の電流 I = I₁ + I₂ から未知の値を求めるには、一次方程式を立てます",
    ko: "【수학 브리지】 직렬 회로의 전압 U = U₁ + U₂와 병렬 회로의 전류 I = I₁ + I₂로부터 모르는 값을 구하려면 일차방정식을 세웁니다",
    ms: "[Jambatan Matematik] Mencari arus dan voltan cabang yang tidak diketahui menggunakan persamaan keabadian (U = U₁ + U₂, I = I₁ + I₂)",
  },
  "mt_phy_circuits_series_parallel->mt_phy_ohm_law": {
    ja: "オームの法則で回路を分析するには、まず直列・並列のつなぎ方と、各計器が何を測っているかを正しく判断する必要があります",
    ko: "옴의 법칙으로 회로를 분석하려면 먼저 직렬·병렬 연결 방식과 각 계기가 무엇을 측정하는지 정확히 판단해야 합니다",
    ms: "Mengaplikasikan hukum Ohm memerlukan pengenalpastian petua arus dan voltan bagi litar sesiri dan selari terlebih dahulu",
  },
  "mt_math_rational_eq->mt_phy_ohm_law": {
    ja: "【数学ブリッジ】並列の合成抵抗の式 1/R = 1/R₁ + 1/R₂ を変形して R を求めるのは、典型的な分数方程式の計算です",
    ko: "【수학 브리지】 병렬 합성 저항 식 1/R = 1/R₁ + 1/R₂를 변형해 R을 구하는 것은 전형적인 분수방정식 계산입니다",
    ms: "[Jambatan Matematik] Menyelesaikan rintangan selari 1/R = 1/R₁ + 1/R₂ memerlukan kefasihan persamaan pecahan algebra",
  },
  "mt_phy_forces_newton->mt_phy_work_kinetic_energy": {
    ja: "力がする仕事 W = Fs や、仕事と運動エネルギーの関係は、力の分析とニュートンの運動の法則にもとづいています",
    ko: "힘이 한 일 W = Fs와 일-운동 에너지 정리는 힘의 분석과 뉴턴 운동 법칙에 직접 바탕을 둡니다",
    ms: "Kerja W = Fs dan teorem kerja-tenaga bergantung secara langsung pada analisis daya dan hukum Newton",
  },
  "mt_math_quad_complete_sq->mt_phy_work_kinetic_energy": {
    ja: "【数学ブリッジ】運動エネルギー E_k = ½mv² は速さの 2 乗を含むため、エネルギーから速さを求めるには平方根をとって二次方程式を解きます",
    ko: "【수학 브리지】 운동 에너지 E_k = ½mv²는 속력의 제곱을 포함하므로, 에너지로부터 속력을 구하려면 제곱근을 이용해 이차방정식을 풀어야 합니다",
    ms: "[Jambatan Matematik] Tenaga kinetik E_k = ½mv² berubah secara kuadratik dengan v, jadi mencari laju daripada tenaga memerlukan punca kuasa dua",
  },

  // ==================== 3. CHEMISTRY ====================
  "mt_math_signed_numbers->mt_chem_atomic_periodic": {
    ja: "【数学ブリッジ】原子核の正電荷 (+Z) と電子の負電荷 (-N_e) から全体の電荷を求めるには、正負の数の加法を使います",
    ko: "【수학 브리지】 원자핵의 양전하 (+Z)와 전자의 음전하 (-N_e)로 알짜 전하를 구하는 것은 정수의 덧셈을 바탕으로 합니다",
    ms: "[Jambatan Matematik] Cas bersih ion (+Z) + (-N_e) bergantung pada penambahan integer bertanda",
  },
  "mt_chem_atomic_periodic->mt_chem_bonding_formula": {
    ja: "元素がとりやすい酸化数は、最外殻の価電子を何個失うか・受け取るかによって直接決まります",
    ko: "원소의 산화수는 가장 바깥 전자 껍질의 원자가 전자를 몇 개 잃거나 얻는지에 따라 직접 결정됩니다",
    ms: "Nombor pengoksidaan unsur terhasil secara langsung daripada penerimaan atau pelepasan elektron valens petala terluar",
  },
  "mt_math_linear_eq_one->mt_chem_bonding_formula": {
    ja: "【数学ブリッジ】化合物の酸化数の総和が 0（∑ n_i · v_i = 0）であることから中心原子の酸化数を求めるには、一次方程式を解きます",
    ko: "【수학 브리지】 화합물의 산화수 총합이 0(∑ n_i · v_i = 0)이라는 조건으로 중심 원자의 산화수를 구하려면 일차방정식을 풉니다",
    ms: "[Jambatan Matematik] Menyelesaikan ∑ n_i · v_i = 0 untuk nombor pengoksidaan atom pusat yang tidak diketahui menggunakan persamaan linear",
  },
  "mt_chem_bonding_formula->mt_chem_stoichiometry_conservation": {
    ja: "化学反応式の係数を合わせる前に、酸化数をもとに反応物と生成物の化学式を正しく書く必要があります",
    ko: "화학 반응식의 계수를 맞추기 전에 산화수를 바탕으로 반응물과 생성물의 화학식을 올바르게 써야 합니다",
    ms: "Mengimbangkan persamaan kimia memerlukan penulisan formula kimia yang betul terlebih dahulu",
  },
  "mt_math_ratio_percent->mt_chem_stoichiometry_conservation": {
    ja: "【数学ブリッジ】化学反応式にもとづく反応物と生成物の質量の計算は、比例式の計算にもとづいています",
    ko: "【수학 브리지】 화학 반응식에서 반응물과 생성물의 질량 계산은 비례식 계산을 바탕으로 합니다",
    ms: "[Jambatan Matematik] Pengiraan jisim bahan tindak balas kepada hasil tindak balas secara stoikiometri bergantung pada nisbah berkadaran",
  },
  "mt_chem_stoichiometry_conservation->mt_chem_molar_concentration": {
    ja: "溶液の反応（滴定）や希釈の計算は、物質量と質量保存の定量的な考え方を発展させたものです",
    ko: "용액 반응(적정)과 희석 계산은 물질의 양과 질량 보존에 대한 정량적 개념을 확장한 것입니다",
    ms: "Kemolaran larutan dan stoikiometri pencairan memperluaskan prinsip keabadian bilangan mol dan jisim",
  },
  "mt_math_linear_eq_one->mt_chem_molar_concentration": {
    ja: "【数学ブリッジ】希釈の式 c₁V₁ = c₂V₂ から未知の濃度や加える水の量を求めるには、一次方程式を解きます",
    ko: "【수학 브리지】 희석 식 c₁V₁ = c₂V₂로부터 모르는 농도나 넣을 물의 양을 구하려면 일차방정식을 풉니다",
    ms: "[Jambatan Matematik] Menyelesaikan hukum pencairan c₁V₁ = c₂V₂ untuk isi padu yang tidak diketahui menggunakan persamaan linear",
  },

  // ==================== 4. BIOLOGY ====================
  "mt_math_ratio_percent->mt_bio_cell_transport": {
    ja: "【数学ブリッジ】細胞膜の内外の溶質の質量パーセント濃度の比較や、細胞の表面積と体積の比は、百分率と比の考え方にもとづいています",
    ko: "【수학 브리지】 세포막 안팎의 용질 퍼센트 농도 비교와 세포의 표면적 대 부피의 비는 백분율과 비의 개념을 바탕으로 합니다",
    ms: "[Jambatan Matematik] Membandingkan peratusan zat terlarut dan nisbah luas permukaan kepada isi padu bergantung pada nisbah",
  },
  "mt_bio_cell_transport->mt_bio_photosynthesis_resp": {
    ja: "光合成（葉緑体）と呼吸（ミトコンドリア）による気体の交換は、細胞小器官の働きの分担と膜を通した拡散にもとづいています",
    ko: "광합성(엽록체)과 세포 호흡(미토콘드리아)에서의 기체 교환은 세포 소기관의 역할 분담과 막을 통한 확산을 바탕으로 합니다",
    ms: "Fotosintesis dan respirasi sel bergantung pada organel kloroplas dan mitokondria serta resapan gas",
  },
  "mt_chem_stoichiometry_conservation->mt_bio_photosynthesis_resp": {
    ja: "【化学ブリッジ】光合成と呼吸の反応式における CO₂ と O₂ の量的関係は、化学の質量保存の法則に従います",
    ko: "【화학 브리지】 광합성과 호흡 반응식에서 CO₂와 O₂의 양적 관계는 화학의 질량 보존 법칙을 따릅니다",
    ms: "[Jambatan Kimia] Stoikiometri pertukaran gas CO₂ dan O₂ dalam fotosintesis dan respirasi mematuhi hukum keabadian jisim",
  },
  "mt_bio_cell_transport->mt_bio_mendelian_genetics": {
    ja: "染色体が細胞の核にある遺伝情報の担い手であることの理解は、配偶子の形成やメンデルの遺伝の法則を理解する基礎になります",
    ko: "염색체가 세포핵 속 유전 물질의 운반체라는 이해는 생식세포 형성과 멘델 유전 법칙을 이해하는 기초가 됩니다",
    ms: "Memahami kromosom dalam nukleus sel menjadi asas kepada pemisahan alel Mendel",
  },
  "mt_math_ratio_percent->mt_bio_mendelian_genetics": {
    ja: "【数学ブリッジ】パネットの方形（遺伝子の組み合わせ表）による配偶子の組み合わせの確率や、3:1・1:2:1 の分離比は、分数と百分率にもとづいています",
    ko: "【수학 브리지】 퍼넷 사각형으로 구하는 생식세포 조합 확률과 3:1, 1:2:1 분리비는 분수와 백분율을 바탕으로 합니다",
    ms: "[Jambatan Matematik] Kebarangkalian genotip dan fenotip dalam petak Punnett serta nisbah 3:1 / 1:2:1 bergantung pada pecahan dan peratusan",
  },
  "mt_bio_photosynthesis_resp->mt_bio_population_ecology": {
    ja: "生態系のエネルギーピラミッドの出発点は生産者が光合成で固定した太陽エネルギーであり、各栄養段階での損失は呼吸による熱の放出から生じます",
    ko: "생태계 에너지 피라미드의 출발점은 생산자가 광합성으로 고정한 태양 에너지이며, 각 영양 단계의 손실은 호흡에 의한 열 방출에서 생깁니다",
    ms: "Aliran tenaga ekosistem bermula dengan produktiviti primer kasar dan bersih serta kehilangan haba melalui respirasi",
  },
  "mt_math_ratio_percent->mt_bio_population_ecology": {
    ja: "【数学ブリッジ】隣り合う栄養段階の 10%～20% のエネルギー転換効率から逆算するのは、百分率のかけ算・わり算をくり返す計算です",
    ko: "【수학 브리지】 인접한 영양 단계 사이의 10%~20% 에너지 전환 효율로 거꾸로 계산하는 것은 백분율의 곱셈과 나눗셈을 반복하는 계산입니다",
    ms: "[Jambatan Matematik] Had pemindahan tenaga 10%–20% merentasi beberapa aras trofik mengaplikasikan pendaraban dan pembahagian peratusan berturut-turut",
  },

  // ==================== 5. ENGLISH ====================
  "mt_eng_sentence_sva_tense->mt_eng_passive_participle": {
    ja: "述語動詞（主語との一致や時制の制約を受ける）と、修飾語としてはたらく非述語の分詞を見分けるには、まず文の骨格となる主語と動詞のきまりを身につける必要があります",
    ko: "술어 동사(수 일치와 시제의 제약을 받음)와 수식어로 쓰이는 비술어 분사를 구별하려면 먼저 문장의 뼈대인 주어-동사 구조를 익혀야 합니다",
    ms: "Membezakan kata kerja utama finit daripada partisipel tak finit dibina atas struktur subjek-kata kerja dalam klausa",
  },
  "mt_eng_sentence_sva_tense->mt_eng_relative_clauses": {
    ja: "関係詞節の中で主語と目的語のどちらが欠けているか、また節の中の動詞の単数・複数を分析するには、基本的な主語・動詞・目的語の文構造の理解が前提になります",
    ko: "관계절 안에서 주어와 목적어 중 무엇이 빠졌는지, 절 안 동사의 단수·복수를 분석하려면 기본적인 주어-동사-목적어 문장 구조를 알아야 합니다",
    ms: "Menganalisis ketiadaan subjek atau objek serta persetujuan kata kerja dalam klausa relatif memerlukan sintaksis asas klausa",
  },
  "mt_eng_passive_participle->mt_eng_conditionals_academic": {
    ja: "仮定法過去完了の `had + past participle` と `would have + past participle` をつくるには、過去分詞の形に習熟している必要があります",
    ko: "가정법 과거완료의 `had + past participle`와 `would have + past participle`를 만들려면 과거분사를 능숙하게 다룰 수 있어야 합니다",
    ms: "Membentuk `had + past participle` dan `would have + past participle` memerlukan penguasaan partisipel lampau",
  },
  "mt_eng_relative_clauses->mt_eng_conditionals_academic": {
    ja: "高度な学術的な長文では、関係詞節と仮定法の条件節が入れ子になって使われることがよくあります",
    ko: "수준 높은 학술적 장문에서는 관계절과 가정법 조건절이 겹쳐서 함께 쓰이는 경우가 많습니다",
    ms: "Ayat kompleks akademik menggabungkan penerang relatif dengan klausa syarat",
  },

  // ==================== 6. COMPUTING & AI ====================
  "mt_math_place_value_ops->mt_cs_binary_logic": {
    ja: "【数学ブリッジ】2 進数を 2ⁿ の位の重みで展開することは、10 進数を 10ⁿ の位で展開することと同じ構造です",
    ko: "【수학 브리지】 이진수를 2ⁿ 자리의 가중치로 전개하는 것은 십진수를 10ⁿ 자리로 전개하는 것과 같은 구조입니다",
    ms: "[Jambatan Matematik] Pengembangan nilai tempat asas 2 mengitlakkan struktur nilai tempat asas 10",
  },
  "mt_cs_binary_logic->mt_cs_loops_trace": {
    ja: "反復の継続・終了や分岐の条件は、論理式（ブール式）の真偽の判定によって決まります",
    ko: "반복의 계속·종료와 분기 조건은 논리식(불 식)의 참·거짓 판정에 따라 결정됩니다",
    ms: "Penerusan gelung dan syarat cabang dikawal oleh penilaian logik Boolean",
  },
  "mt_math_alg_expressions->mt_cs_loops_trace": {
    ja: "【数学ブリッジ】ループ変数の変化の追跡や等差数列の和の公式には、文字式を整理する力が必要です",
    ko: "【수학 브리지】 반복 변수의 변화를 추적하고 등차수열의 합 공식을 쓰려면 문자식을 간단히 하는 능력이 필요합니다",
    ms: "[Jambatan Matematik] Menjejak pemboleh ubah pengumpul gelung dan hasil tambah aritmetik dibina atas ungkapan algebra",
  },
  "mt_cs_loops_trace->mt_cs_arrays_binary_search": {
    ja: "二分探索は `while low <= high` のループの中で、左右の位置（`low`・`mid`・`high`）を動かして範囲を縮めていく処理です",
    ko: "이진 탐색은 `while low <= high` 반복문 안에서 왼쪽·오른쪽 위치(`low`, `mid`, `high`)를 움직여 범위를 줄여 나가는 방식으로 구현됩니다",
    ms: "Carian perduaan dilaksanakan dengan menjejak penuding `low`, `mid` dan `high` merentasi lelaran gelung `while low <= high`",
  },
  "mt_cs_arrays_binary_search->mt_cs_algo_complexity": {
    ja: "対数オーダー O(log n)・線形オーダー O(n)・2 乗オーダー O(n²) の効率の大きな差は、探索や整列のアルゴリズムを基準にして理解します",
    ko: "로그 시간 O(log n), 선형 시간 O(n), 제곱 시간 O(n²)의 큰 효율 차이는 탐색·정렬 알고리즘을 기준으로 이해합니다",
    ms: "Membandingkan kecekapan O(log n), O(n) dan O(n²) dibina secara langsung atas analisis gelung algoritma carian dan isihan",
  },
  "mt_math_quad_function_parabola->mt_cs_algo_complexity": {
    ja: "【数学ブリッジ】O(n²) のアルゴリズムで入力の規模が k 倍になると時間が k² 倍になることは、二次関数の増え方にそのまま対応します",
    ko: "【수학 브리지】 O(n²) 알고리즘에서 입력 크기가 k배가 되면 시간이 k²배가 되는 것은 이차함수의 증가 특성과 그대로 대응합니다",
    ms: "[Jambatan Matematik] Pertumbuhan masa larian kuadratik O(n²) mencerminkan penskalaan fungsi kuadratik",
  },

  // ==================== 7. GEOGRAPHY ====================
  "mt_math_ratio_percent->mt_geo_map_scale_timezones": {
    ja: "【数学ブリッジ】地図の縮尺 1 : N から実際の距離を求めることは、比による拡大・縮小そのものです",
    ko: "【수학 브리지】 지도 축척 1 : N으로 실제 거리를 환산하는 것은 본질적으로 비에 의한 확대·축소입니다",
    ms: "[Jambatan Matematik] Penukaran skala peta 1 : N kepada jarak sebenar mengaplikasikan penskalaan nisbah secara langsung",
  },
  "mt_math_signed_numbers->mt_geo_map_scale_timezones": {
    ja: "【数学ブリッジ】UTC+8 と UTC-5 のように東西の時差を計算することは、数直線上での正負の数の差（向きのある距離）を求めることです",
    ko: "【수학 브리지】 UTC+8과 UTC-5처럼 동서 시간대의 시차를 계산하는 것은 수직선 위에서 양수와 음수 사이의 방향 있는 거리를 구하는 것입니다",
    ms: "[Jambatan Matematik] Mengira perbezaan waktu merentasi zon UTC+ dan UTC- menggunakan penolakan nombor bertanda",
  },
  "mt_geo_map_scale_timezones->mt_geo_contour_elevation": {
    ja: "等高線の地形図を総合的に読み取るには、縮尺を使って傾斜や標高を見積もる力が必要です",
    ko: "등고선 지형도를 종합적으로 해석하려면 축척을 이용해 경사와 해발 고도를 추정할 수 있어야 합니다",
    ms: "Mentafsir relief kontur dan kecerunan cerun dibina atas kemahiran asas membaca peta",
  },
  "mt_math_coord_linear_func->mt_geo_contour_elevation": {
    ja: "【数学ブリッジ】対流圏で気温が高度とともに一定の割合で下がる T = T₀ - 6·Δh_km は、傾きが負の一次関数のモデルです",
    ko: "【수학 브리지】 대류권에서 기온이 고도에 따라 일정하게 낮아지는 T = T₀ - 6·Δh_km는 기울기가 음수인 일차함수 모델입니다",
    ms: "[Jambatan Matematik] Suhu troposfera T = T₀ - 6·Δh_km ialah fungsi linear dengan kecerunan negatif",
  },
  "mt_geo_contour_elevation->mt_geo_solar_angle_climate": {
    ja: "地域の気候の総合的な特徴は、緯度による太陽高度（日射量）と標高・地形によって決まります",
    ko: "지역 기후의 종합적 특징은 위도에 따른 태양 고도(일사량)와 해발 고도, 지형에 의해 함께 결정됩니다",
    ms: "Sintesis iklim serantau menggabungkan sinaran suria mengikut latitud dengan kesan ketinggian",
  },
  "mt_math_signed_numbers->mt_geo_solar_angle_climate": {
    ja: "【数学ブリッジ】南北の半球をまたぐ緯度差 |φ - δ| の計算は、数直線上の正負の数の絶対値（距離）をそのまま使います",
    ko: "【수학 브리지】 남북 반구에 걸친 위도 차 |φ - δ|의 계산은 수직선 위 양수와 음수의 절댓값 거리를 그대로 적용합니다",
    ms: "[Jambatan Matematik] Sudut suria merentas hemisfera |φ - δ| mengaplikasikan jarak nilai mutlak nombor bertanda",
  },

  // ==================== 8. HISTORY ====================
  "mt_math_signed_numbers->mt_his_chronology_evidence": {
    ja: "【数学ブリッジ】紀元前（BCE）と紀元後（CE）にまたがる年数の差は、数直線上の距離を使い、「0 年がない」ことによるずれを補正して求めます",
    ko: "【수학 브리지】 기원전(BCE)과 기원후(CE)에 걸친 연도 차는 수직선 위의 거리로 구하되 '0년이 없다'는 점을 보정해야 합니다",
    ms: "[Jambatan Matematik] Jangka masa dari SM (BCE) ke M (CE) dimodelkan sebagai selang nombor bertanda yang dilaraskan kerana tiada Tahun 0",
  },
  "mt_his_chronology_evidence->mt_his_trade_demographics": {
    ja: "歴史の経済統計表を読み解くには、まず世紀・年代による時期区分を押さえ、一次史料と後世の推計資料を見分ける必要があります",
    ko: "역사 속 경제 통계표를 해석하려면 먼저 세기와 연대에 따른 시기 구분을 파악하고 1차 사료와 후대의 추정 자료를 구별해야 합니다",
    ms: "Menilai jadual perdagangan sejarah memerlukan pembahagian zaman secara kronologi dan kritikan sumber",
  },
  "mt_math_ratio_percent->mt_his_trade_demographics": {
    ja: "【数学ブリッジ】経済史で「割合（%）の変化」と「絶対量の変化」を区別するには、百分率のもとにする量の考え方が直接必要です",
    ko: "【수학 브리지】 경제사에서 '비중(%)의 변화'와 '절대량의 변화'를 구별하려면 백분율의 기준량 개념이 직접 필요합니다",
    ms: "[Jambatan Matematik] Membezakan perubahan bahagian % daripada perubahan output mutlak bergantung pada penaakulan kuantiti asas peratusan",
  },
  "mt_his_trade_demographics->mt_his_industrial_modern": {
    ja: "二度の産業革命がもたらした世界市場の構造や都市化による人口の変化を分析するには、近代の貿易と人口に関する史料分析の基礎が必要です",
    ko: "두 차례의 산업 혁명이 가져온 세계 시장 구조와 도시화에 따른 인구 변화를 분석하려면 근대 무역과 인구 사료 분석의 기초가 필요합니다",
    ms: "Menganalisis kesan Revolusi Perindustrian dibina atas kemahiran menilai bukti demografi dan perdagangan global",
  },

  // ==================== 9. LITERACY & CRITICAL READING ====================
  "mt_lit_main_idea_structure->mt_lit_inference_rhetoric": {
    ja: "暗示された内容の深い推論や修辞・論証の鑑賞は、段落の中心となる主張と文章の構成を正確につかむことが前提になります",
    ko: "숨은 의미에 대한 깊은 추론과 수사적 논증 감상은 단락의 중심 주장과 글의 구조를 정확히 파악하는 것을 전제로 합니다",
    ms: "Inferens tersirat dan analisis retorik memerlukan pemahaman tesis serta struktur petikan terlebih dahulu",
  },
  "mt_lit_inference_rhetoric->mt_lit_logical_fallacy": {
    ja: "論証の欠陥（因果関係のこじつけ、生存者バイアスなど）を見抜くには、まず文章の暗黙の前提や限定語の範囲を取り出す必要があります",
    ko: "논증의 허점(억지 인과, 생존자 편향 등)을 검토하려면 먼저 글에 숨은 전제와 한정어의 범위를 가려내야 합니다",
    ms: "Mengaudit kesilapan logik (seperti sebab-akibat palsu dan bias kemandirian) dibina atas pengenalpastian andaian tersirat dan batas pengkuantiti",
  },
  "mt_cs_binary_logic->mt_lit_logical_fallacy": {
    ja: "【論理ブリッジ】「十分条件と必要条件」の区別や「逆は必ずしも真ならず」（P → Q と Q → P）の判断は、ブール論理の真理値表と同じ根をもちます",
    ko: "【논리 브리지】 '충분조건과 필요조건'의 구별과 '역은 항상 참이 아니다'(P → Q와 Q → P)라는 판단은 불 논리의 진리표와 뿌리가 같습니다",
    ms: "[Jambatan Logik] Membezakan P → Q daripada akasnya Q → P berkongsi logik nilai kebenaran Boolean yang formal",
  },
  "mt_lit_logical_fallacy->mt_lit_classical_comparative": {
    ja: "PISA 型の複数資料や統計グラフを総合して判断するには、資料間の誤った因果づけや一面的な判断基準を同時に排除する必要があります",
    ko: "PISA형 복합 자료와 통계 그래프를 종합해 판단하려면 자료 사이의 잘못된 인과 해석과 일면적인 판단 기준을 함께 걸러내야 합니다",
    ms: "Mensintesis teks dan carta pelbagai sumber memerlukan penapisan kesilapan logik secara kritis",
  },
  "mt_math_ratio_percent->mt_lit_classical_comparative": {
    ja: "【数学ブリッジ】非連続型テキストの統計グラフや表で、前年比・前期比や割合のしきい値を検証するには、数学の比と百分率の力が必要です",
    ko: "【수학 브리지】 비연속 텍스트의 통계 그래프와 표에서 전년 대비·전기 대비 변화와 비중의 기준값을 검증하려면 수학의 비와 백분율 능력이 필요합니다",
    ms: "[Jambatan Matematik] Mengesahkan nilai ambang dan trend peratusan dalam jadual teks bukan linear menggunakan kefasihan nisbah dan peratusan",
  },
};
