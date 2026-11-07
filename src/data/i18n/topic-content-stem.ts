import type { TopicContentOverlay } from "./overlay";

/**
 * Native ja / ko / ms teaching content for the topics in src/data/canonical-topics-stem.ts.
 * Keyed by topic id. See ./overlay.ts for the shape.
 */
export const TOPIC_CONTENT_I18N_STEM: TopicContentOverlay = {
  // ==================== PHYSICS ====================
  mt_phy_measurement_density: {
    description: {
      ja: "密度は物質ごとに決まった固有の性質である（分割しても変わらない）ことを理解し、g/cm³ ↔ kg/m³ の単位換算と ρ = m / V の計算ができるようにします。",
      ko: "밀도는 물질마다 정해진 고유한 특성(나누어도 변하지 않음)임을 이해하고, g/cm³ ↔ kg/m³ 단위 환산과 ρ = m / V 계산을 할 수 있어요.",
      ms: "Memahami ketumpatan sebagai sifat intrinsik bahan (tidak berubah walaupun bahan dipotong), menukar unit g/cm³ ↔ kg/m³, dan menyelesaikan masalah ρ = m / V.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：水1滴とバケツ1杯の水では、どちらの密度が大きいでしょうか？消しゴムを半分に切ると、密度も半分になりますか？",
      ko: "아이에게 물어보세요: 물 한 방울과 물 한 양동이 중 어느 쪽의 밀도가 더 클까요? 지우개를 반으로 자르면 밀도도 반으로 줄어들까요?",
      ms: "Tanya anak: Yang manakah lebih tumpat—setitis air atau sebaldi air? Adakah ketumpatan pemadam menjadi separuh apabila pemadam itu dipotong dua?",
    },
    masteryCriteria: [
      {
        ja: "1 g/cm³ = 1000 kg/m³（数値が大きいほうが kg/m³）を正確に換算し、1000倍の向きを逆にしない",
        ko: "1 g/cm³ = 1000 kg/m³(수치가 큰 쪽이 kg/m³)를 정확히 환산하고, 1000배를 거꾸로 적용하지 않아요",
        ms: "Menukar 1 g/cm³ = 1000 kg/m³ dengan tepat (nilai dalam kg/m³ lebih besar) tanpa menyongsangkan faktor 1000",
      },
      {
        ja: "均質な固体を半分に切ると m も V も半分になるが、密度 ρ は変わらないことを理解している",
        ko: "균일한 고체를 반으로 자르면 m과 V는 모두 절반이 되지만 밀도 ρ는 변하지 않는다는 것을 알아요",
        ms: "Menyedari bahawa memotong pepejal seragam kepada dua menyebabkan m dan V menjadi separuh, tetapi ketumpatan ρ kekal sama",
      },
    ],
    intuition: {
      ja: "密度は「単位体積あたりにどれだけ質量がぎっしり詰まっているか」を表します。物体を半分にすると m も V も半分になるので、m/V はまったく変わりません！",
      ko: "밀도는 '단위 부피당 질량이 얼마나 빽빽하게 채워져 있는지'를 나타내요. 물체를 반으로 자르면 m과 V가 모두 절반이 되므로 m/V는 전혀 변하지 않아요!",
      ms: "Ketumpatan mengukur betapa padatnya jisim tersusun dalam setiap unit isi padu; jika objek dibahagi dua, m dan V sama-sama menjadi separuh, jadi nilai m/V tidak berubah!",
    },
    steps: [
      {
        title: {
          ja: "単位をそろえてから割り算する",
          ko: "단위를 먼저 통일한 뒤 나누기",
          ms: "Seragamkan Unit Sebelum Membahagi",
        },
        body: {
          ja: "質量 54 g、体積 20 cm³ の金属のかたまりでは、ρ = 54 / 20 = 2.7 g/cm³ = 2700 kg/m³（アルミニウム）です。",
          ko: "질량 54 g, 부피 20 cm³인 금속 덩어리는 ρ = 54 / 20 = 2.7 g/cm³ = 2700 kg/m³(알루미늄)예요.",
          ms: "Bagi bongkah logam berjisim m = 54 g dan berisi padu V = 20 cm³: ρ = 54 / 20 = 2.7 g/cm³ = 2700 kg/m³ (aluminium).",
        },
        checkQuestion: {
          ja: "質量 160 g、体積 20 cm³ の石の密度は何 g/cm³ ですか？",
          ko: "질량 160 g, 부피 20 cm³인 돌의 밀도는 몇 g/cm³일까요?",
          ms: "Cari ketumpatan (g/cm³) seketul batu berjisim 160 g dan berisi padu 20 cm³.",
        },
      },
    ],
    misconceptions: {
      misc_density_halved: {
        label: {
          ja: "質量が半分になると密度も半分になると考えたり、1 g/cm³ を 0.001 kg/m³ と換算したりする",
          ko: "질량이 절반이 되면 밀도도 절반이 된다고 생각하거나, 1 g/cm³를 0.001 kg/m³로 환산함",
          ms: "Menyangka ketumpatan menjadi separuh apabila jisim menjadi separuh, atau menukar 1 g/cm³ kepada 0.001 kg/m³",
        },
        wrongPattern: {
          ja: "2.7 g/cm³ を 2700 kg/m³ ではなく 0.0027 kg/m³ と換算してしまう",
          ko: "2.7 g/cm³를 2700 kg/m³가 아니라 0.0027 kg/m³로 환산함",
          ms: "Menukar 2.7 g/cm³ kepada 0.0027 kg/m³ dan bukannya 2700 kg/m³",
        },
        remediationTip: {
          ja: "1 m³ の中には 1 cm³ がちょうど100万（10⁶）個入ります！1 cm³ の水は 1 g、1 m³ の水は 1 t（1000 kg）なので、1000倍しましょう！",
          ko: "1 m³ 안에는 1 cm³가 무려 100만(10⁶) 개 들어 있어요! 물 1 cm³는 1 g이고 물 1 m³는 1톤(1000 kg)이므로 1000을 곱해야 해요!",
          ms: "1 m³ mengandungi sejuta (10⁶) cm³! 1 cm³ air berjisim 1 g, manakala 1 m³ air berjisim 1 tan metrik (1000 kg)—jadi darabkan dengan 1000!",
        },
      },
    },
  },

  mt_phy_speed_motion_graphs: {
    description: {
      ja: "全体の平均の速さを「総移動距離 ÷ 総時間」で求め、s-t グラフの傾きと v-t グラフの面積が表す意味を読み取ります。",
      ko: "전체 평균 속력을 '총 이동 거리 ÷ 총 걸린 시간'으로 구하고, s-t 그래프의 기울기와 v-t 그래프의 넓이가 의미하는 것을 해석해요.",
      ms: "Mengira laju purata keseluruhan perjalanan sebagai jumlah jarak dibahagi jumlah masa, serta mentafsir kecerunan graf s-t dan luas di bawah graf v-t.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：坂道を秒速 2 m で上り、同じ道を秒速 6 m で走って下りました。往復の平均の速さが (2+6)÷2 = 4 m/s ではなく 3 m/s になるのはなぜでしょうか？",
      ko: "아이에게 물어보세요: 언덕길을 2 m/s로 걸어 올라가고 같은 길을 6 m/s로 뛰어 내려왔어요. 왕복 평균 속력이 (2+6)÷2 = 4 m/s가 아니라 3 m/s인 이유는 무엇일까요?",
      ms: "Tanya anak: Berjalan mendaki bukit pada 2 m/s dan berlari turun melalui laluan yang sama pada 6 m/s—mengapakah laju purata pergi-balik ialah 3 m/s dan bukan (2+6)÷2 = 4 m/s?",
    },
    masteryCriteria: [
      {
        ja: "平均の速さは必ず「総移動距離 ÷ 総時間」で求め、同じ距離を進む場合でも (v₁ + v₂)/2 としない",
        ko: "평균 속력은 반드시 '총 이동 거리 ÷ 총 걸린 시간'으로 구하고, 같은 거리를 이동할 때에도 (v₁ + v₂)/2로 계산하지 않아요",
        ms: "Mengira laju purata melalui Jumlah Jarak / Jumlah Masa, dan tidak sekali-kali menggunakan (v₁ + v₂)/2 bagi jarak yang sama",
      },
      {
        ja: "s-t グラフの水平な線（静止）と v-t グラフの水平な線（等速直線運動）を区別できる",
        ko: "s-t 그래프의 수평선(정지)과 v-t 그래프의 수평선(등속 직선 운동)을 구별해요",
        ms: "Membezakan garis mengufuk pada graf s-t (pegun) dengan garis mengufuk pada graf v-t (halaju malar)",
      },
    ],
    intuition: {
      ja: "秒速 2 m の上りには、秒速 6 m の下りの 3 倍の時間がかかります（往復時間の 3/4）！平均の速さは時間で重みがつくので、必ず「総移動距離 ÷ 総時間」を使いましょう。",
      ko: "2 m/s로 올라갈 때는 6 m/s로 내려올 때보다 시간이 3배나 걸려요(전체 시간의 3/4)! 평균 속력은 시간에 따라 가중되므로 항상 '총 이동 거리 ÷ 총 걸린 시간'을 사용해요.",
      ms: "Anda menghabiskan masa 3× lebih lama mendaki pada 2 m/s berbanding menuruni pada 6 m/s (3/4 daripada jumlah masa)! Sentiasa gunakan Jumlah Jarak ÷ Jumlah Masa.",
    },
    steps: [
      {
        title: {
          ja: "まず縦軸を確認：s-t は傾き、v-t は面積",
          ko: "먼저 세로축 확인: s-t는 기울기, v-t는 넓이",
          ms: "Semak Label Paksi Dahulu: Kecerunan s-t vs. Luas v-t",
        },
        body: {
          ja: "片道を 12 m とすると、上りは 12/2 = 6 s、下りは 12/6 = 2 s となり、全体の v = 24 / (6 + 2) = 3 m/s です。",
          ko: "편도 거리를 12 m로 두면 올라갈 때 12/2 = 6 s, 내려올 때 12/6 = 2 s ⇒ 전체 v = 24 / (6 + 2) = 3 m/s예요.",
          ms: "Andaikan jarak sehala = 12 m: mendaki mengambil 12/2 = 6 s, menurun 12/6 = 2 s ⇒ v keseluruhan = 24 / (6 + 2) = 3 m/s.",
        },
        checkQuestion: {
          ja: "ある車が最初の 2 秒間に 6 m、次の 3 秒間に 14 m 進みました。5 秒間全体の平均の速さは何 m/s ですか？",
          ko: "어떤 자동차가 처음 2초 동안 6 m, 다음 3초 동안 14 m를 이동했어요. 전체 5초 동안의 평균 속력은 몇 m/s일까요?",
          ms: "Sebuah kereta bergerak 6 m dalam 2 s, kemudian 14 m dalam 3 s. Berapakah laju puratanya (m/s) bagi 5 saat itu?",
        },
      },
    ],
    misconceptions: {
      misc_avg_speed_mean: {
        label: {
          ja: "同じ距離を進む2区間の速さを (v₁ + v₂)/2 のように単純に平均してしまう",
          ko: "같은 거리를 이동한 두 구간의 속력을 (v₁ + v₂)/2처럼 단순 평균함",
          ms: "Mempuratakan dua laju sebagai (v₁ + v₂)/2 bagi dua bahagian yang sama jarak",
        },
        wrongPattern: {
          ja: "前半 2 m/s、後半 6 m/s のとき、24/8 = 3 m/s ではなく (2 + 6)/2 = 4 m/s と答える",
          ko: "앞 구간 2 m/s, 뒤 구간 6 m/s일 때 24/8 = 3 m/s가 아니라 (2 + 6)/2 = 4 m/s라고 답함",
          ms: "Menjawab (2 + 6)/2 = 4 m/s dan bukannya 24/8 = 3 m/s",
        },
        remediationTip: {
          ja: "具体的な距離（たとえば2つの速さの最小公倍数 12 m）を決めて t₁、t₂ をそれぞれ求め、総移動距離を総時間で割りましょう。これで必ず解けます！",
          ko: "구체적인 거리(예: 두 속력의 최소공배수인 12 m)를 정해 t₁, t₂를 각각 구한 뒤, 총 이동 거리를 총 걸린 시간으로 나누면 항상 정답이에요!",
          ms: "Gunakan jarak konkrit (contohnya 12 m, iaitu GSTK bagi kedua-dua laju) untuk mencari t₁ dan t₂, kemudian bahagikan jumlah jarak dengan jumlah masa.",
        },
      },
    },
  },

  mt_phy_forces_newton: {
    description: {
      ja: "物体にはたらく力を矢印で正しく図示し、等速運動では合力が 0 になること、加速する運動では F_net = ma が成り立つことを使い分けます。",
      ko: "물체에 작용하는 힘을 화살표로 나타낸 자유 물체 도형을 그리고, 등속 운동에서는 알짜힘이 0이며 가속 운동에서는 F_net = ma를 적용해요.",
      ms: "Melukis gambar rajah jasad bebas, mengenal pasti daya paduan sifar pada halaju malar, dan menggunakan F_net = ma bagi gerakan berpecutan.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：カーリングのストーンが手を離れたあと、まだ前向きに押している力はありますか？押す力がないのに、なぜすべり続けるのでしょうか？",
      ko: "아이에게 물어보세요: 컬링 스톤이 선수의 손을 떠난 뒤에도 앞으로 미는 힘이 있을까요? 미는 힘이 없는데 왜 계속 미끄러져 나갈까요?",
      ms: "Tanya anak: Selepas batu curling dilepaskan dari tangan pemain, adakah masih ada daya yang menolaknya ke hadapan? Mengapakah ia terus menggelongsor?",
    },
    masteryCriteria: [
      {
        ja: "動摩擦力は μ と垂直抗力だけで決まるので、引く力を大きくしても（面の粗さと垂直抗力が同じなら）一定であることを理解している",
        ko: "운동 마찰력은 μ와 수직항력에만 의존하므로, 당기는 힘을 키워도(면의 거칠기와 수직항력이 같으면) 일정하다는 것을 알아요",
        ms: "Menyedari bahawa daya geseran kinetik kekal malar (bergantung hanya pada μ dan daya normal) walaupun daya tarikan bertambah",
      },
      {
        ja: "a = F_net / m では、引く力だけでなく必ず合力（F_pull - f）を使う",
        ko: "a = F_net / m에서는 당기는 힘만이 아니라 반드시 알짜힘(F_pull - f)을 사용해요",
        ms: "Menggunakan daya paduan (F_pull - f), dan bukan daya tarikan sahaja, dalam a = F_net / m",
      },
    ],
    intuition: {
      ja: "力は速さを保つ原因ではなく、速さを変える（加速度 a を生む）原因です！等速直線運動をしているときは、はたらく力がつり合って合力がちょうど 0 になっています。",
      ko: "힘은 속도를 유지하는 원인이 아니라 속도를 바꾸는(가속도 a를 만드는) 원인이에요! 등속 직선 운동을 한다는 것은 모든 힘이 상쇄되어 알짜힘이 0이라는 뜻이에요.",
      ms: "Daya menyebabkan pecutan, BUKAN halaju! Halaju malar bermakna semua daya saling membatalkan sehingga daya paduan menjadi sifar.",
    },
    steps: [
      {
        title: {
          ja: "まず逆向きの摩擦力を引いて合力を求める",
          ko: "반대 방향 마찰력을 먼저 빼서 알짜힘 구하기",
          ms: "Tolak Daya Geseran yang Menentang Dahulu untuk Mendapatkan Daya Paduan",
        },
        body: {
          ja: "質量 2 kg の物体に右向き 10 N の引く力と左向き 4 N の摩擦力がはたらくとき、F_net = 10 - 4 = 6 N ⇒ a = 6 / 2 = 3 m/s² です。",
          ko: "질량 2 kg인 물체에 오른쪽으로 10 N의 당기는 힘과 왼쪽으로 4 N의 마찰력이 작용할 때 F_net = 10 - 4 = 6 N ⇒ a = 6 / 2 = 3 m/s²이에요.",
          ms: "Bagi m = 2 kg dengan daya tarikan 10 N ke kanan dan geseran 4 N ke kiri: F_net = 10 - 4 = 6 N ⇒ a = 6/2 = 3 m/s².",
        },
        checkQuestion: {
          ja: "質量 4 kg の箱に右向き 18 N の引く力と左向き 6 N の摩擦力がはたらいています。加速度 a は何 m/s² ですか？",
          ko: "질량 4 kg인 상자에 오른쪽으로 18 N의 당기는 힘과 왼쪽으로 6 N의 마찰력이 작용해요. 가속도 a는 몇 m/s²일까요?",
          ms: "Sebuah kotak 4 kg ditarik dengan daya 18 N ke kanan dan mengalami geseran 6 N. Cari pecutan a (m/s²).",
        },
      },
    ],
    misconceptions: {
      misc_newton_ignore_friction: {
        label: {
          ja: "逆向きの摩擦力を引き忘れ、引く力 F をそのまま質量 m で割って加速度を求める",
          ko: "반대 방향의 마찰력을 빼지 않고 당기는 힘 F를 그대로 질량 m으로 나누어 가속도를 구함",
          ms: "Membahagikan daya yang dikenakan F terus dengan m sambil mengabaikan geseran yang menentang",
        },
        wrongPattern: {
          ja: "a = (18 - 6) / 4 = 3 m/s² ではなく a = 18 / 4 = 4.5 m/s² と計算する",
          ko: "a = (18 - 6) / 4 = 3 m/s²가 아니라 a = 18 / 4 = 4.5 m/s²로 계산함",
          ms: "Mengira a = 18 / 4 = 4.5 m/s² dan bukannya (18 - 6) / 4 = 3 m/s²",
        },
        remediationTip: {
          ja: "F = ma の F は、いつでも「すべての力を合成した合力 ∑F」です！まず左右の矢印を打ち消し合わせましょう。",
          ko: "F = ma의 F는 언제나 '모든 힘을 합성한 알짜힘 ∑F'예요! 먼저 반대 방향 화살표끼리 상쇄하세요.",
          ms: "F dalam F = ma SENTIASA bermaksud daya paduan ∑F—tolak anak panah yang bertentangan dahulu!",
        },
      },
    },
  },

  mt_phy_circuits_series_parallel: {
    description: {
      ja: "直列回路では電流はどこでも等しく全体の電圧は各部分の電圧の和になり、並列回路では各枝の電圧が等しく全体の電流は各枝の電流の和になることを理解し、回路を分析します。",
      ko: "직렬연결에서는 전류가 어디서나 같고 전체 전압은 각 부분 전압의 합이며, 병렬연결에서는 각 갈래의 전압이 같고 전체 전류는 각 갈래 전류의 합이라는 것을 이용해 회로를 분석해요.",
      ms: "Menganalisis keabadian arus di simpang dan susutan voltan dalam litar bersiri berbanding litar selari: arus sama di semua titik dalam litar bersiri, manakala voltan sama merentasi setiap cabang litar selari.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：リビングの電球が1つ切れても寝室の明かりはついたままです。家の照明は直列つなぎでしょうか、並列つなぎでしょうか？",
      ko: "아이에게 물어보세요: 거실 전구 하나가 나가도 침실 전등은 계속 켜져 있어요. 집 안의 전등은 직렬연결일까요, 병렬연결일까요?",
      ms: "Tanya anak: Apabila satu mentol di ruang tamu terbakar, lampu bilik tidur masih menyala—adakah lampu di rumah disambung secara bersiri atau selari?",
    },
    masteryCriteria: [
      {
        ja: "直列回路では、2つの電球の抵抗が同じでも異なっていても、流れる電流はどこでも等しいことを理解している",
        ko: "직렬연결에서는 두 전구의 저항이 같든 다르든 흐르는 전류가 어디서나 같다는 것을 알아요",
        ms: "Menyedari bahawa arus adalah sama di semua titik dalam satu gelung litar bersiri walaupun rintangan berbeza",
      },
      {
        ja: "理想的な電流計は導線、電圧計は断線とみなして、複雑な回路のつながり方を整理できる",
        ko: "이상적인 전류계는 도선으로, 전압계는 끊어진 회로로 보고 복잡한 회로의 연결 방식을 단순화해요",
        ms: "Meringkaskan topologi litar dengan menganggap ammeter unggul sebagai wayar dan voltmeter sebagai litar terbuka",
      },
    ],
    intuition: {
      ja: "水の流れでたとえると：直列は1本の水道管で、流れる水の量（電流 I）はどこでも同じ、高さの差（電圧 U）は区間ごとに足し合わされます。並列は川が分かれてまた合流する形で、高さの差（電圧 U）はどの枝も同じ、水の量は I = I₁ + I₂ と足し合わされます！",
      ko: "물의 흐름에 비유하면: 직렬은 하나의 관이라 흐르는 물의 양(전류 I)이 어디서나 같고 높이 차(전압 U)는 구간별로 더해져요. 병렬은 물길이 갈라졌다가 다시 합쳐지는 것이라 높이 차(전압 U)는 모든 갈래에서 같고 물의 양은 I = I₁ + I₂로 더해져요!",
      ms: "Analogi paip air: litar bersiri = satu paip (aliran I sama, perbezaan ketinggian U ditambah); litar selari = saluran bercabang (susutan ketinggian U sama, aliran ditambah, I = I₁ + I₂).",
    },
    steps: [
      {
        title: {
          ja: "まず直列か並列かを見分ける",
          ko: "먼저 직렬인지 병렬인지 판단하기",
          ms: "Kenal Pasti Bersiri atau Selari Dahulu",
        },
        body: {
          ja: "電源電圧 9 V の直列回路で L₁ にかかる電圧が 3.5 V なら、L₂ にかかる電圧は 9 - 3.5 = 5.5 V になります。",
          ko: "전원 전압이 9 V인 직렬연결에서 L₁에 걸리는 전압이 3.5 V이면, L₂에 걸리는 전압은 반드시 9 - 3.5 = 5.5 V예요.",
          ms: "Dalam litar bersiri 9 V, jika voltan merentasi L₁ ialah 3.5 V, voltan merentasi L₂ mestilah 9 - 3.5 = 5.5 V.",
        },
        checkQuestion: {
          ja: "並列回路で、分かれる前の全体の電流が 1.2 A、枝1の電流が 0.5 A のとき、枝2の電流は何 A ですか？",
          ko: "병렬연결에서 전체 전류가 1.2 A이고 갈래 1의 전류가 0.5 A일 때, 갈래 2의 전류는 몇 A일까요?",
          ms: "Sebuah litar selari mempunyai arus utama 1.2 A dan arus 0.5 A dalam cabang 1. Cari arus dalam cabang 2 (A).",
        },
      },
    ],
    misconceptions: {
      misc_series_current_drop: {
        label: {
          ja: "直列回路で、電流が電球で「使われて」減っていくと考える",
          ko: "직렬연결에서 전류가 전구를 지나며 '소모되어' 줄어든다고 생각함",
          ms: "Mempercayai bahawa arus 'digunakan' oleh mentol dalam litar bersiri",
        },
        wrongPattern: {
          ja: "直列回路で、明るいほうの電球には暗い電球より大きな電流が流れると答える",
          ko: "직렬연결에서 더 밝은 전구에 어두운 전구보다 더 큰 전류가 흐른다고 주장함",
          ms: "Mendakwa mentol yang lebih terang dalam litar bersiri membawa arus yang lebih besar daripada mentol yang malap",
        },
        remediationTip: {
          ja: "電荷は保存されます！消費されるのは電気エネルギー（電圧の低下として表れる）で、1つの回路を1秒間に流れる電荷の量（電流）は減りません！",
          ko: "전하는 보존돼요! 소모되는 것은 전기 에너지(전압 강하로 나타남)이고, 하나의 회로에서 1초 동안 흐르는 전하의 양(전류)은 줄지 않아요!",
          ms: "Cas diabadikan! Yang berkurang merentasi perintang ialah tenaga (voltan), bukan kadar aliran cas (arus) dalam satu gelung.",
        },
      },
    },
  },

  mt_phy_ohm_law: {
    description: {
      ja: "抵抗 R は導体そのものによって決まる（V や I には関係しない）ことを理解し、I = V / R と P = VI を、1つの抵抗にも、合成抵抗を用いた直列・並列回路全体にも適用します。",
      ko: "저항 R은 도체 자체에 의해 결정됨(V, I와 무관)을 이해하고, I = V / R과 P = VI를 하나의 소자뿐 아니라 합성 저항을 이용해 직렬·병렬 회로 전체에도 적용해요.",
      ms: "Memahami bahawa rintangan R ditentukan oleh konduktor itu sendiri, dan menggunakan I = V / R serta P = VI bagi komponen tunggal dan keseluruhan rangkaian bersiri/selari melalui rintangan berkesan.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：トースターのプラグを抜いて電圧 V が 0 V になったら、電熱線の抵抗 R も 0 Ω になるでしょうか？",
      ko: "아이에게 물어보세요: 토스터의 플러그를 뽑아 전압 V가 0 V가 되면, 전열선의 저항 R도 0 Ω이 될까요?",
      ms: "Tanya anak: Apabila plag pembakar roti dicabut sehingga voltan V menjadi 0 V, adakah rintangan R wayar pemanasnya juga menjadi 0 ohm?",
    },
    masteryCriteria: [
      {
        ja: "V、I、R は必ず「同じ抵抗」の「同じ回路の状態」の値どうしを対応させる",
        ko: "V, I, R은 반드시 '같은 저항', '같은 회로 상태'의 값끼리 대응시켜요",
        ms: "Memadankan V, I dan R dengan ketat kepada perintang yang SAMA dan keadaan litar yang SAMA",
      },
      {
        ja: "並列の合成抵抗 R = R₁R₂/(R₁ + R₂)（1/R = 1/R₁ + 1/R₂）を正確に計算し、どの枝の抵抗よりも小さくなることを確かめる",
        ko: "병렬 합성 저항 R = R₁R₂/(R₁ + R₂)(1/R = 1/R₁ + 1/R₂)를 정확히 계산하고, 어느 갈래의 저항보다도 작다는 것을 확인해요",
        ms: "Mengira rintangan berkesan selari R = R₁R₂/(R₁ + R₂) dengan tepat (nilainya lebih kecil daripada rintangan mana-mana cabang)",
      },
    ],
    intuition: {
      ja: "R = V/I は抵抗を測るための式で、抵抗を決める式ではありません。抵抗は道路の狭さのようなもので、車が走っていなくても（V = 0）道幅は変わりません。並列につなぐのは車線を1本増やすことなので、全体の抵抗は必ず小さくなります！",
      ko: "R = V/I는 저항을 측정하는 식이지 저항을 결정하는 식이 아니에요. 저항은 도로의 좁은 정도와 같아서 차가 다니지 않아도(V = 0) 도로 폭은 그대로예요. 병렬연결은 차선을 하나 더 여는 것이므로 전체 저항은 반드시 작아져요!",
      ms: "Rintangan umpama kesempitan jalan—ia kekal walaupun V = 0 (R = V/I hanyalah formula pengukuran), dan membuka lorong selari tambahan sentiasa mengurangkan rintangan keseluruhan!",
    },
    steps: [
      {
        title: {
          ja: "V = I·R は必ず同じ抵抗に当てはめる",
          ko: "V = I·R은 정확히 같은 소자에 적용하기",
          ms: "Gunakan V = I·R pada Komponen yang Sama",
        },
        body: {
          ja: "R₁ = 4Ω と R₂ = 6Ω を直列にして 10V の電源につなぐと、R_eq = 10Ω ⇒ I = 10/10 = 1A ⇒ V₁ = 1×4 = 4V、V₂ = 6V になります。",
          ko: "R₁ = 4Ω과 R₂ = 6Ω을 직렬로 10V 전원에 연결하면 R_eq = 10Ω ⇒ I = 10/10 = 1A ⇒ V₁ = 1×4 = 4V, V₂ = 6V예요.",
          ms: "Perintang 4Ω dan 6Ω disambung secara bersiri pada bekalan 10V: R_eq = 10Ω ⇒ I = 1A ⇒ V₁ = 4V, V₂ = 6V.",
        },
        checkQuestion: {
          ja: "3 Ω と 6 Ω の抵抗を並列につないだときの合成抵抗は何 Ω ですか？",
          ko: "3 Ω과 6 Ω 저항을 병렬로 연결했을 때의 합성 저항은 몇 Ω일까요?",
          ms: "Cari rintangan berkesan (Ω) bagi perintang 3 Ω dan 6 Ω yang disambung secara selari.",
        },
      },
    ],
    misconceptions: {
      misc_ohm_parallel_add: {
        label: {
          ja: "並列の抵抗をそのまま足したり、1/R_eq を求めたあと最後に逆数をとるのを忘れたりする",
          ko: "병렬 저항을 그대로 더하거나, 1/R_eq를 구한 뒤 마지막에 역수를 취하는 것을 잊음",
          ms: "Menambah terus perintang selari atau terlupa menyongsangkan 1/R_eq pada langkah akhir",
        },
        wrongPattern: {
          ja: "1/2 の逆数をとって 2 Ω とせず、9 Ω や 0.5 Ω と答える",
          ko: "1/2의 역수를 취해 2 Ω을 구하지 않고 9 Ω 또는 0.5 Ω이라고 답함",
          ms: "Menjawab 9 Ω atau 0.5 Ω dan bukannya menyongsangkan 1/2 untuk mendapat 2 Ω",
        },
        remediationTip: {
          ja: "検算のコツ：並列の合成抵抗は、いちばん小さい枝の抵抗（2 Ω < 3 Ω）よりも必ず小さくなります！",
          ko: "검산 요령: 병렬 합성 저항은 반드시 가장 작은 갈래의 저항보다 작아요(2 Ω < 3 Ω)!",
          ms: "Semakan pantas: rintangan selari MESTI lebih kecil daripada rintangan cabang yang terkecil (2 Ω < 3 Ω)!",
        },
      },
    },
  },

  mt_phy_work_kinetic_energy: {
    description: {
      ja: "仕事 W = F·d·cos θ を計算し、摩擦のない場合に mgh₁ + ½mv₁² = mgh₂ + ½mv₂²（力学的エネルギー保存）を用いて速さや高さを求めます。",
      ko: "일 W = F·d·cos θ를 계산하고, 마찰이 없는 계에서 mgh₁ + ½mv₁² = mgh₂ + ½mv₂²(역학적 에너지 보존)를 이용해 속력과 높이를 구해요.",
      ms: "Mengira kerja mekanik W = F·d·kos θ dan menggunakan mgh₁ + ½mv₁² = mgh₂ + ½mv₂² dalam sistem tanpa geseran untuk mencari laju dan ketinggian.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：高速道路で速さが 60 km/h から 120 km/h へと2倍になると、急ブレーキの制動距離が2倍ではなく4倍になるのはなぜでしょうか？",
      ko: "아이에게 물어보세요: 고속도로에서 속력이 60 km/h에서 120 km/h로 2배가 되면, 급제동 거리가 2배가 아니라 4배로 늘어나는 이유는 무엇일까요?",
      ms: "Tanya anak: Apabila laju di lebuh raya berganda daripada 60 kepada 120 km/h, mengapakah jarak brek kecemasan menjadi empat kali ganda (4×) dan bukan dua kali ganda?",
    },
    masteryCriteria: [
      {
        ja: "力の向きと移動の向きが垂直なとき（バケツを持って水平に等速で歩くなど）、仕事は 0 J であることを理解している",
        ko: "힘의 방향이 이동 방향과 수직이면(양동이를 들고 수평으로 등속으로 걸을 때 등) 한 일이 0 J임을 알아요",
        ms: "Menyedari bahawa kerja adalah sifar apabila daya berserenjang dengan sesaran (contohnya membawa baldi sambil berjalan mendatar pada halaju malar)",
      },
      {
        ja: "速さが2倍になると運動エネルギー ½mv² と制動距離は4倍になることを理解している",
        ko: "속력이 2배가 되면 운동 에너지 ½mv²와 제동 거리가 4배가 된다는 것을 알아요",
        ms: "Menyedari bahawa menggandakan laju menjadikan tenaga kinetik ½mv² dan jarak brek empat kali ganda",
      },
    ],
    intuition: {
      ja: "運動エネルギーの式 ½mv² には速さの2乗 v² がかくれています！速さが2倍になるとエネルギーは4倍になり、一定の摩擦力でそれを使い切るには4倍の距離が必要です。",
      ko: "운동 에너지 식 ½mv²에는 속력의 제곱 v²가 숨어 있어요! 속력이 2배가 되면 에너지는 4배가 되고, 일정한 마찰력으로 그 에너지를 모두 없애려면 4배의 거리가 필요해요.",
      ms: "Tenaga kinetik berkadar dengan v²: laju 2× membawa tenaga 4×, jadi jarak 4× diperlukan untuk berhenti melawan daya geseran yang malar.",
    },
    steps: [
      {
        title: {
          ja: "減った位置エネルギー mgh ＝ 増えた運動エネルギー ½mv²",
          ko: "줄어든 위치 에너지 mgh = 늘어난 운동 에너지 ½mv²",
          ms: "Tenaga Keupayaan yang Hilang = Tenaga Kinetik yang Diperoleh",
        },
        body: {
          ja: "高さ h = 5 m のなめらかな斜面を静かにすべり下りる（g = 10 m/s² とする）：mgh = ½mv² ⇒ v = √(2gh) = √100 = 10 m/s（質量に関係しません！）。",
          ko: "높이 h = 5 m인 마찰 없는 빗면을 정지 상태에서 미끄러져 내려올 때(g = 10 m/s²): mgh = ½mv² ⇒ v = √(2gh) = √100 = 10 m/s (질량과 무관해요!).",
          ms: "Menggelongsor dari keadaan pegun pada ketinggian h = 5 m di atas satah licin (g = 10 m/s²): mgh = ½mv² ⇒ v = √(2gh) = √100 = 10 m/s, tidak bergantung pada jisim!",
        },
        checkQuestion: {
          ja: "質量 2 kg のボールが 6 m/s で運動しています。運動エネルギー E_k は何 J ですか？",
          ko: "질량 2 kg인 공이 6 m/s로 움직이고 있어요. 운동 에너지 E_k는 몇 J일까요?",
          ms: "Cari tenaga kinetik E_k (J) bagi sebiji bola 2 kg yang bergerak pada 6 m/s.",
        },
      },
    ],
    misconceptions: {
      misc_ke_linear_v: {
        label: {
          ja: "運動エネルギー ½mv² の計算で v を2乗し忘れたり、1/2 をかけ忘れたりする",
          ko: "운동 에너지 ½mv²를 계산할 때 v를 제곱하지 않거나 1/2을 곱하지 않음",
          ms: "Terlupa mengkuasaduakan halaju v atau meninggalkan faktor 1/2 dalam ½mv²",
        },
        wrongPattern: {
          ja: "m = 2、v = 6 の運動エネルギーを 0.5 × 2 × 36 = 36 J ではなく 2×6 = 12 J や 2×36 = 72 J とする",
          ko: "m = 2, v = 6일 때 운동 에너지를 0.5 × 2 × 36 = 36 J가 아니라 2×6 = 12 J 또는 2×36 = 72 J로 계산함",
          ms: "Mengira tenaga kinetik sebagai 12 J atau 72 J dan bukannya 0.5 × 2 × 36 = 36 J",
        },
        remediationTip: {
          ja: "代入するときは、まず v² を計算し（6² = 36）、次に m をかけ、最後に2で割りましょう！",
          ko: "대입할 때는 먼저 v²를 계산하고(6² = 36), m을 곱한 다음, 마지막으로 2로 나누세요!",
          ms: "Kuasaduakan v dahulu (6² = 36), darab dengan m, kemudian bahagi dua!",
        },
      },
    },
  },

  // ==================== CHEMISTRY ====================
  mt_chem_stoichiometry_conservation: {
    description: {
      ja: "化学変化の前後で原子の種類と数は変わらないことを理解し、化学式の右下の数字（添え字）は変えずに係数だけで化学反応式をつくり、質量比の計算をします。",
      ko: "화학 반응 전후에 원자의 종류와 개수가 변하지 않음을 이해하고, 화학식의 아래 첨자는 바꾸지 않고 계수만으로 화학 반응식을 완성해 질량비를 계산해요.",
      ms: "Mengimbangkan persamaan kimia menggunakan pekali stoikiometri tanpa mengubah subskrip dalam formula molekul, berdasarkan prinsip bahawa jenis dan bilangan atom tidak berubah sebelum dan selepas tindak balas.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：まきが燃えると軽い灰が少し残るだけです。質量が消えてしまったのでしょうか？残りの質量はどこへ行ったのでしょうか？",
      ko: "아이에게 물어보세요: 장작이 다 타면 가벼운 재만 조금 남아요. 질량이 사라진 걸까요? 나머지 질량은 어디로 갔을까요?",
      ms: "Tanya anak: Kayu api yang terbakar hanya meninggalkan sedikit abu yang ringan—adakah jisim telah hilang, atau ke manakah perginya baki jisim itu?",
    },
    masteryCriteria: [
      {
        ja: "係数を合わせるときは化学式の前の係数だけを変え、化学式の添え字は決して変えない（O₂ を O₃ にしない）",
        ko: "계수를 맞출 때는 화학식 앞의 계수만 조정하고 화학식의 아래 첨자는 절대 바꾸지 않아요(O₂를 O₃로 바꾸지 않음)",
        ms: "Melaraskan pekali di hadapan formula sahaja, dan tidak sekali-kali mengubah subskrip formula kimia (contohnya tidak menukar O₂ kepada O₃)",
      },
    ],
    intuition: {
      ja: "化学変化はレゴブロックを分解して組み立て直すようなものです。反応の前後で炭素・水素・酸素の原子の総数は1つも減りません。灰が軽くなるのは、気体の二酸化炭素が空気中に出ていくからです。",
      ko: "화학 반응은 레고 블록을 분해해서 다시 조립하는 것과 같아요. 반응 전후 탄소, 수소, 산소 원자의 총수는 하나도 줄지 않으며, 재가 가벼워지는 것은 기체인 이산화 탄소가 공기 중으로 날아가기 때문이에요.",
      ms: "Tindak balas kimia menyusun semula atom seperti blok LEGO; jumlah atom di sebelah kiri dan kanan mesti sama. Abu menjadi ringan kerana gas karbon dioksida terbebas ke udara.",
    },
    steps: [
      {
        title: {
          ja: "複雑な分子から先に合わせ、単体は最後に合わせる",
          ko: "복잡한 분자부터 맞추고 홑원소 물질은 마지막에 맞추기",
          ms: "Imbangkan Molekul Kompleks Dahulu, Unsur Tulen Terakhir",
        },
        body: {
          ja: "Fe₂O₃ + CO → Fe + CO₂ の係数を合わせます。3個の CO が酸素を3個うばって3個の CO₂ になるので、係数は順に 1, 3, 2, 3 となり、Fe₂O₃ + 3CO → 2Fe + 3CO₂ です。",
          ko: "Fe₂O₃ + CO → Fe + CO₂ 맞추기: CO 3개가 산소 3개를 빼앗아 CO₂ 3개가 되므로 계수는 차례로 1, 3, 2, 3 ⇒ Fe₂O₃ + 3CO → 2Fe + 3CO₂예요.",
          ms: "Imbangkan Fe₂O₃ + CO → Fe + CO₂: 3 CO mengambil 3 atom oksigen untuk membentuk 3 CO₂, jadi pekalinya 1, 3, 2, 3 ⇒ Fe₂O₃ + 3CO → 2Fe + 3CO₂.",
        },
        checkQuestion: {
          ja: "1 N₂ + ? H₂ → 2 NH₃ で、H₂ の係数はいくつですか？",
          ko: "1 N₂ + ? H₂ → 2 NH₃에서 H₂의 계수는 얼마일까요?",
          ms: "Dalam 1 N₂ + ? H₂ → 2 NH₃, berapakah pekali bagi H₂?",
        },
      },
    ],
    misconceptions: {
      misc_chem_alter_subscript: {
        label: {
          ja: "化学式の前の係数ではなく、右下の添え字を変えて原子の数を合わせてしまう",
          ko: "앞의 계수가 아니라 화학식의 아래 첨자를 바꿔서 원자 수를 맞춤",
          ms: "Mengubah subskrip kimia dan bukannya pekali stoikiometri di hadapan formula",
        },
        wrongPattern: {
          ja: "2H₂ + O₂ → 2H₂O とせず、H₂O を H₂O₂ に変えてしまう（過酸化水素になってしまう！）",
          ko: "2H₂ + O₂ → 2H₂O로 맞추지 않고 H₂O를 H₂O₂로 바꿔 버림(과산화 수소가 되어 버려요!)",
          ms: "Menukar H₂O kepada H₂O₂ (menjadi hidrogen peroksida!) dan bukannya mengimbangkan 2H₂ + O₂ → 2H₂O",
        },
        remediationTip: {
          ja: "添え字を変えるとまったく別の物質になります（水が過酸化水素に変わる）！変えてよいのは、分子の個数を表す前の係数だけです。",
          ko: "아래 첨자를 바꾸면 완전히 다른 물질이 돼요(물이 과산화 수소로 변함)! 바꿀 수 있는 것은 분자의 개수를 나타내는 앞의 계수뿐이에요.",
          ms: "Subskrip menentukan identiti molekul (air boleh bertukar menjadi hidrogen peroksida)! Hanya pekali di hadapan yang mengira bilangan molekul.",
        },
      },
    },
  },

  // ==================== BIOLOGY ====================
  mt_bio_mendelian_genetics: {
    description: {
      ja: "遺伝子型（AA/Aa/aa）と表現型を区別し、配偶子の分離とパネットの方形（交配表）を使って子に形質が現れる確率を求めます。",
      ko: "유전자형(AA/Aa/aa)과 표현형을 구별하고, 생식세포의 분리와 퍼넷 사각형을 이용해 자손에게 형질이 나타날 확률을 계산해요.",
      ms: "Membezakan genotip (AA/Aa/aa) daripada fenotip dan mengira kebarangkalian ciri pada anak menggunakan pemisahan gamet dan segi empat Punnett.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：茶色い目で潜性遺伝子をもつ両親（Aa）から、青い目（aa）の子が生まれる確率が 25% になるのはなぜでしょうか？また、1人目の子が青い目だと、2人目の確率は変わりますか？",
      ko: "아이에게 물어보세요: 갈색 눈이면서 열성 유전자를 가진 부모(Aa)에게서 파란 눈(aa)의 아이가 태어날 확률이 25%인 이유는 무엇일까요? 또 첫째 아이가 파란 눈이면 둘째의 확률이 달라질까요?",
      ms: "Tanya anak: Bagaimanakah dua ibu bapa bermata perang yang membawa gen resesif (Aa) boleh mempunyai 25% peluang mendapat anak bermata biru (aa), dan adakah kelahiran pertama mempengaruhi kelahiran kedua?",
    },
    masteryCriteria: [
      {
        ja: "Aa × Aa のかけ合わせで、子の遺伝子型の比 1:2:1、表現型の比 3:1（潜性形質が現れる確率 25%）を導ける",
        ko: "Aa × Aa 교배에서 자손의 유전자형 비 1:2:1과 표현형 비 3:1(열성 형질이 나타날 확률 25%)을 구할 수 있어요",
        ms: "Menerbitkan nisbah genotip 1:2:1 dan nisbah fenotip 3:1 bagi kacukan monohibrid Aa × Aa (kebarangkalian resesif 25%)",
      },
    ],
    intuition: {
      ja: "子が生まれるたびに、両親がそれぞれ A と a が書かれたコインを1枚ずつ独立に投げるようなものです。2枚とも a が出る確率は毎回 (1/2) × (1/2) = 1/4（25%）です！",
      ko: "아이가 생길 때마다 부모가 각각 A와 a가 적힌 동전을 하나씩 독립적으로 던지는 것과 같아요. 둘 다 a가 나올 확률은 매번 (1/2) × (1/2) = 1/4(25%)이에요!",
      ms: "Setiap ibu bapa melambung syiling A/a secara bebas; hasil 'aa' berlaku dengan kebarangkalian (1/2)×(1/2) = 25% bagi setiap kehamilan.",
    },
    steps: [
      {
        title: {
          ja: "パネットの方形（交配表）に配偶子の組み合わせを書く",
          ko: "2×2 생식세포 표 그리기",
          ms: "Lukis Grid Gamet 2×2",
        },
        body: {
          ja: "Aa × aa の交配では、配偶子 (A, a) × (a, a) より、子は Aa（顕性）が 50%、aa（潜性）が 50% になります。",
          ko: "Aa × aa 교배: 생식세포 (A, a) × (a, a) → 자손은 Aa(우성) 50%, aa(열성) 50%예요.",
          ms: "Kacukan Aa × aa: gamet (A, a) × (a, a) → anak 50% Aa (dominan) dan 50% aa (resesif).",
        },
        checkQuestion: {
          ja: "遺伝子型がどちらも Aa の親どうしをかけ合わせたとき、潜性形質（aa）を示す子の割合は何 % ですか（数字のみ答えましょう）？",
          ko: "유전자형이 모두 Aa인 부모를 교배했을 때, 열성 형질(aa)을 나타내는 자손의 비율은 몇 %일까요? (숫자만 쓰세요)",
          ms: "Dalam kacukan Aa × Aa, berapakah peratusan anak yang menunjukkan fenotip resesif (aa)? (nombor sahaja)",
        },
      },
    ],
    misconceptions: {
      misc_bio_gambler_fallacy: {
        label: {
          ja: "確率 25% を「4人生まれれば必ず1人は潜性」という決まった結果だと考える（ギャンブラーの誤謬）",
          ko: "확률 25%를 '아이 4명 중 반드시 1명은 열성'이라는 확정된 결과로 여김(도박사의 오류)",
          ms: "Menganggap kebarangkalian 25% sebagai jaminan pasti bahawa seorang daripada 4 anak adalah resesif (kekeliruan penjudi)",
        },
        wrongPattern: {
          ja: "1人目がすでに aa だったので「4分の1の枠」は使い切られ、2人目は aa にならないと考える",
          ko: "첫째가 이미 aa였으니 '4분의 1 자리'를 다 써서 둘째는 aa일 수 없다고 생각함",
          ms: "Mempercayai bahawa anak kedua tidak mungkin aa kerana anak pertama sudah 'menggunakan' peluang 1 dalam 4",
        },
        remediationTip: {
          ja: "受精は1回1回が独立した確率的なできごとです。何人目でも確率はいつも 25% です！",
          ko: "수정은 매번 독립적인 확률적 사건이에요. 몇째 아이든 확률은 항상 25%예요!",
          ms: "Setiap persenyawaan ialah peristiwa kebarangkalian yang tidak bersandar—kebarangkaliannya sentiasa 25%!",
        },
      },
    },
  },

  // ==================== ENGLISH ====================
  mt_eng_relative_clauses: {
    description: {
      ja: "先行詞と、関係詞節の中で欠けている文の要素（主語・目的語が欠けていれば which/that/who、副詞のはたらきなら where/when、所有なら whose）を分析して、関係代名詞と関係副詞を正しく選びます。",
      ko: "선행사와 관계절 안에서 빠진 문장 성분(주어·목적어가 빠지면 which/that/who, 부사 역할이면 where/when, 소유를 나타내면 whose)을 분석해 관계대명사와 관계부사를 정확히 골라요.",
      ms: "Memilih kata ganti nama relatif atau adverba relatif dengan menganalisis unsur sintaksis yang hilang dalam klausa relatif (subjek/objek → which/that/who, keterangan → where/when, milikan → whose).",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：'the museum ___ we visited' と 'the museum ___ we worked' を比べると、同じ博物館なのに、なぜ一方は which、もう一方は where が入るのでしょうか？",
      ko: "아이에게 물어보세요: 'the museum ___ we visited'와 'the museum ___ we worked'를 비교해 보면, 같은 박물관인데 왜 하나는 which, 다른 하나는 where가 들어갈까요?",
      ms: "Tanya anak: Bandingkan 'the museum ___ we visited' dengan 'the museum ___ we worked'—mengapakah satu menggunakan 'which' dan satu lagi 'where'?",
    },
    masteryCriteria: [
      {
        ja: "先行詞が場所を表す名詞（museum など）でも、やみくもに where を選ばない。節の中で目的語が欠けていれば（visited ___）which/that を選ぶ",
        ko: "선행사가 장소 명사(museum 등)라도 무조건 where를 고르지 않아요. 관계절에 목적어가 빠져 있으면(visited ___) which/that을 써요",
        ms: "Menganalisis transitiviti klausa: kata nama tempat (seperti museum) tetap menggunakan 'which/that' apabila berfungsi sebagai objek langsung dalam klausa (visited ___)",
      },
    ],
    intuition: {
      ja: "先行詞が場所や時を表すかどうかだけで判断せず、先行詞を節の中に戻してみましょう！visit the museum なら他動詞の目的語なので which、work in the museum なら前置詞句で副詞のはたらきなので where を使います。",
      ko: "선행사가 장소나 시간인지만 보지 말고, 선행사를 관계절 안에 다시 넣어 보세요! visit the museum(타동사의 목적어 → which), work in the museum(전치사구로 부사 역할 → where).",
      ms: "Masukkan semula anteseden ke dalam klausa: 'visit [the museum]' memerlukan kata ganti nama 'which' (objek), manakala 'work [in the museum]' memerlukan adverba 'where' (keterangan).",
    },
    steps: [
      {
        title: {
          ja: "2ステップで節を復元：①先行詞を見つける ②節の動詞に目的語が欠けているか確かめる",
          ko: "두 단계 복원법: ① 선행사 찾기 ② 관계절 동사에 목적어가 빠졌는지 확인하기",
          ms: "Pembinaan Semula Klausa Dua Langkah: Cari Anteseden, Semak Objek yang Hilang",
        },
        body: {
          ja: "I still remember the day (which/that) we spent together.（spend の目的語が欠けている → which/that）と the day when we met.（meet に目的語は欠けておらず、on that day が副詞のはたらき → when）を比べましょう。",
          ko: "I still remember the day (which/that) we spent together.(spend의 목적어가 빠짐 → which/that)와 the day when we met.(meet은 목적어가 빠지지 않았고 on that day가 부사 역할 → when)을 비교해요.",
          ms: "Bandingkan I still remember the day (which/that) we spent together. ('spent [the day]', objek hilang → which/that) dengan the day when we met. ('met [on the day]', keterangan masa → when).",
        },
        checkQuestion: {
          ja: "This is the factory ___ produces electric cars. の空欄には which と where のどちらが入りますか？",
          ko: "which와 where 중 알맞은 것을 쓰세요: This is the factory ___ produces electric cars.",
          ms: "Isikan 'which' atau 'where': This is the factory ___ produces electric cars.",
        },
      },
    ],
    misconceptions: {
      misc_eng_place_always_where: {
        label: {
          ja: "場所を表す名詞を見ると機械的に where を選び、節に主語や目的語が欠けていることを見落とす",
          ko: "장소 명사만 보면 기계적으로 where를 고르고, 관계절에 주어나 목적어가 빠진 것을 놓침",
          ms: "Memilih 'where' secara mekanikal selepas sebarang kata nama tempat walaupun klausa itu kekurangan subjek atau objek",
        },
        wrongPattern: {
          ja: "'The factory ___ produces cars' で、主語が欠けているのに where を選んでしまう",
          ko: "'The factory ___ produces cars'에서 주어가 빠졌는데도 where를 고름",
          ms: "Memilih 'where' dalam 'The factory ___ produces cars' walaupun subjek tiada",
        },
        remediationTip: {
          ja: "produces には主語が必要です！where は副詞なので主語にはなれません。関係代名詞 which/that を使いましょう。",
          ko: "produces에는 주어가 필요해요! where는 부사라서 주어가 될 수 없으므로 관계대명사 which/that을 써야 해요.",
          ms: "'produces' memerlukan subjek! 'where' ialah adverba dan tidak boleh menjadi subjek—gunakan 'which/that'.",
        },
      },
    },
  },

  // ==================== COMPUTING ====================
  mt_cs_binary_logic: {
    description: {
      ja: "2ⁿ の位の重み（1, 2, 4, 8, 16, 32…）を使って2進数と10進数を相互に変換し、AND・OR・NOT を組み合わせた論理式の値を求めます。",
      ko: "2ⁿ 자릿값(1, 2, 4, 8, 16, 32…)을 이용해 이진수와 십진수를 서로 변환하고, AND·OR·NOT을 조합한 논리식의 값을 구해요.",
      ms: "Menukar antara nombor perduaan dan perpuluhan menggunakan kuasa 2 (1, 2, 4, 8, 16, 32…) dan menilai ungkapan Boolean majmuk (AND / OR / NOT).",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：片手の指は5本しかないのに、指を立てる・曲げるだけで、どうして 0 から 31 までの 32 通りの数を表せるのでしょうか？",
      ko: "아이에게 물어보세요: 한 손의 손가락은 5개뿐인데, 손가락을 펴고 접는 것만으로 어떻게 0부터 31까지 32개의 수를 나타낼 수 있을까요?",
      ms: "Tanya anak: Dengan hanya 5 jari pada sebelah tangan (diangkat atau dilipat), bagaimanakah saintis komputer boleh membilang dari 0 hingga 31?",
    },
    masteryCriteria: [
      {
        ja: "2⁰, 2¹, 2², 2³… の位の重みを使って、8ビットまでの2進数を10進数に変換できる",
        ko: "2⁰, 2¹, 2², 2³… 자릿값을 이용해 8비트 이하의 이진수를 십진수로 변환해요",
        ms: "Menukar nombor perduaan sehingga 8 bit kepada perpuluhan menggunakan kuasa 2 (2⁰, 2¹, 2², 2³…)",
      },
    ],
    intuition: {
      ja: "10進法は10で位が1つ上がり（位の重み 1, 10, 100）、2進法は2で位が1つ上がります（1, 2, 4, 8, 16）。n ビットで 2ⁿ 通りの状態を表せるので、5本の指なら 2⁵ = 32 通りです！",
      ko: "십진법은 10이 되면 자리가 하나 올라가고(자릿값 1, 10, 100), 이진법은 2가 되면 자리가 올라가요(1, 2, 4, 8, 16). n비트로 2ⁿ가지 상태를 나타낼 수 있으니 손가락 5개면 2⁵ = 32가지예요!",
      ms: "Setiap bit perduaan menggandakan nilai tempat (1, 2, 4, 8, 16), jadi n bit boleh mewakili 2ⁿ keadaan berbeza—5 jari memberikan 2⁵ = 32 gabungan!",
    },
    steps: [
      {
        title: {
          ja: "各ビットの上に 8-4-2-1 を書き、1 の位の重みを足す",
          ko: "각 비트 위에 8-4-2-1을 적고 1인 자리의 값을 더하기",
          ms: "Labelkan 8-4-2-1 di Atas Bit dan Jumlahkan Bit 1",
        },
        body: {
          ja: "2進数 1101₂ は 1×8 + 1×4 + 0×2 + 1×1 = 13 になります。",
          ko: "이진수 1101₂는 1×8 + 1×4 + 0×2 + 1×1 = 13이에요.",
          ms: "Nombor perduaan 1101₂ = 1×8 + 1×4 + 0×2 + 1×1 = 13.",
        },
        checkQuestion: {
          ja: "2進数 1011₂ を10進数に変換するといくつですか？",
          ko: "이진수 1011₂를 십진수로 바꾸면 얼마일까요?",
          ms: "Tukarkan nombor perduaan 1011₂ kepada nombor perpuluhan.",
        },
      },
    ],
    misconceptions: {
      misc_cs_power_start_one: {
        label: {
          ja: "いちばん右のビットの重みを 2⁰ = 1 ではなく 2 から始めてしまう（全体が2倍になる）",
          ko: "가장 오른쪽 비트의 자릿값을 2⁰ = 1이 아니라 2부터 시작함(전체 값이 2배가 됨)",
          ms: "Memulakan pemberat bit paling kanan dengan 2 dan bukannya 2⁰ = 1 (nilai keseluruhan menjadi berganda)",
        },
        wrongPattern: {
          ja: "101₂ を 4 + 0 + 1 = 5 ではなく 8 + 0 + 2 = 10 と計算する",
          ko: "101₂를 4 + 0 + 1 = 5가 아니라 8 + 0 + 2 = 10으로 계산함",
          ms: "Menilai 101₂ sebagai 8 + 0 + 2 = 10 dan bukannya 4 + 0 + 1 = 5",
        },
        remediationTip: {
          ja: "いちばん右のビットの重みはいつも 2⁰ = 1 です！奇数ならいちばん右は必ず 1、偶数なら必ず 0 になります。",
          ko: "가장 오른쪽 비트의 자릿값은 항상 2⁰ = 1이에요! 홀수는 맨 오른쪽 비트가 반드시 1, 짝수는 반드시 0이에요.",
          ms: "Bit paling kanan sentiasa mempunyai pemberat 2⁰ = 1 (nombor ganjil sentiasa berakhir dengan 1, nombor genap dengan 0)!",
        },
      },
    },
  },

  // ==================== GEOGRAPHY ====================
  mt_geo_map_scale_timezones: {
    description: {
      ja: "地図の縮尺から実際の距離を求め（1 km = 100,000 cm）、経度の差（経度 15° = 1時間、東ほど時刻が進む）から時差を計算します。",
      ko: "지도의 축척으로 실제 거리를 구하고(1 km = 100,000 cm), 경도 차이로 시차를 계산해요(경도 15° = 1시간, 동쪽일수록 시각이 빠름).",
      ms: "Mengira jarak sebenar daripada skala peta (1 km = 100,000 cm) dan perbezaan waktu merentasi longitud (15° = 1 jam; timur tambah, barat tolak).",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：ロンドン（UTC+0）で午後1時（13:00）に始まるサッカーの試合は、シンガポール・北京（UTC+8）では何時でしょうか？",
      ko: "아이에게 물어보세요: 런던(UTC+0)에서 오후 1시(13:00)에 시작하는 축구 경기는 싱가포르·베이징(UTC+8)에서는 몇 시일까요?",
      ms: "Tanya anak: Jika sesuatu perlawanan bermula pada 13:00 di London (UTC+0), pukul berapakah waktu di Singapura/Beijing (UTC+8)?",
    },
    masteryCriteria: [
      {
        ja: "1 km = 1000 m = 100,000 cm（0が5つ）を使って、cm を km に正確に換算できる",
        ko: "1 km = 1000 m = 100,000 cm(0이 5개)를 이용해 cm를 km로 정확히 환산해요",
        ms: "Menukar sentimeter kepada kilometer dengan tepat menggunakan 1 km = 1000 m = 100,000 cm (lima sifar)",
      },
    ],
    intuition: {
      ja: "地球は西から東へ 24 時間で 360° 自転するので、1時間に 360 ÷ 24 = 15° 回ります。東にある場所ほど早く日の出をむかえ、時刻が進んでいます！",
      ko: "지구는 서쪽에서 동쪽으로 24시간에 360° 자전하므로 1시간에 360 ÷ 24 = 15°씩 돌아요. 동쪽에 있는 곳일수록 해가 먼저 뜨고 시각이 앞서요!",
      ms: "Bumi berputar 360° dari barat ke timur dalam 24 jam (360 ÷ 24 = 15° sejam)—tempat yang lebih ke timur mendahului dari segi waktu (timur tambah, barat tolak)!",
    },
    steps: [
      {
        title: {
          ja: "縮尺の0を5つ取って「1 cm が何 km か」に直す",
          ko: "축척에서 0을 5개 지워 '1 cm가 몇 km인지'로 바꾸기",
          ms: "Buang Lima Sifar untuk Menukar Skala cm kepada km",
        },
        body: {
          ja: "縮尺 1 : 200,000 は0を5つ取ると「地図上の 1 cm が実際の 2 km」；地図上の 4 cm は実際の 8 km です。",
          ko: "축척 1 : 200,000에서 0을 5개 지우면 '지도상 1 cm = 실제 2 km'; 지도상 4 cm는 실제 8 km예요.",
          ms: "Skala 1 : 200,000 bermaksud 1 cm di peta = 2 km sebenar (buang lima sifar); 4 cm di peta bersamaan 8 km di atas tanah.",
        },
        checkQuestion: {
          ja: "縮尺 1 : 300000 の地図上で、2つの町の距離が 5 cm です。実際の距離は何 km ですか？",
          ko: "축척 1 : 300000인 지도에서 두 마을 사이의 거리가 5 cm예요. 실제 거리는 몇 km일까요?",
          ms: "Pada peta berskala 1 : 300,000, dua buah pekan terletak 5 cm jauhnya. Berapakah jarak sebenar dalam km?",
        },
      },
    ],
    misconceptions: {
      misc_geo_cm_km_zeros: {
        label: {
          ja: "1 km を 100,000 cm ではなく 1,000 cm だと思い込む（m から cm への0を2つ忘れる）",
          ko: "1 km를 100,000 cm가 아니라 1,000 cm로 착각함(m에서 cm로 갈 때의 0 두 개를 잊음)",
          ms: "Mengelirukan 1 km dengan 1,000 cm dan bukannya 100,000 cm (terlupa dua sifar daripada m ke cm)",
        },
        wrongPattern: {
          ja: "0を3つしか取らずに、15 km ではなく 1,500 km と計算する",
          ko: "0을 3개만 지워서 15 km가 아니라 1,500 km로 계산함",
          ms: "Mengira 1,500 km dan bukannya 15 km kerana membuang tiga sifar sahaja",
        },
        remediationTip: {
          ja: "1 km = 1000 m、1 m = 100 cm なので、1000 × 100 = 100,000 cm（ちょうど0が5つ）です！",
          ko: "1 km = 1000 m, 1 m = 100 cm이므로 1000 × 100 = 100,000 cm(정확히 0이 5개)예요!",
          ms: "1 km = 1,000 m dan 1 m = 100 cm, jadi 1,000 × 100 = 100,000 cm (lima sifar)!",
        },
      },
    },
  },

  // ==================== HISTORY ====================
  mt_his_chronology_evidence: {
    description: {
      ja: "歴史の年代には「紀元0年」がないこと（紀元前と紀元後にまたがる年数は A + B - 1）を理解して正確に計算し、当事者が残した一次史料と後世の研究による二次資料を区別して信頼性を評価します。",
      ko: "역사 연대에는 '0년'이 없다는 것(기원전과 기원후에 걸친 기간은 A + B - 1)을 이해해 정확히 계산하고, 당시 사람이 남긴 1차 사료와 후대의 연구 저술인 2차 사료를 구별해 신뢰성을 평가해요.",
      ms: "Mengira tempoh masa merentasi SM/M dengan tepat dengan mengambil kira ketiadaan Tahun 0 (A + B - 1), serta membezakan sumber primer (bahan sezaman) daripada sumber sekunder (kajian kemudian) untuk menilai kebolehpercayaan sumber.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：紀元前1年に生まれた赤ちゃんは、紀元後1年の同じ日に何歳になるでしょうか？1歳ですか、2歳ですか？（ヒント：紀元0年はありません！）",
      ko: "아이에게 물어보세요: 기원전 1년에 태어난 아기는 기원후 1년의 같은 날에 만 몇 살이 될까요? 1살일까요, 2살일까요? (힌트: 0년은 없어요!)",
      ms: "Tanya anak: Seorang bayi yang lahir pada 1 SM menyambut hari jadi yang keberapa pada tarikh yang sama dalam tahun 1 M—pertama atau kedua? (Petunjuk: tiada Tahun 0!)",
    },
    masteryCriteria: [
      {
        ja: "紀元前 A 年から紀元後 B 年までの年数を A + B - 1 で正確に求める（紀元前1年のすぐ次が紀元後1年だから）",
        ko: "기원전 A년부터 기원후 B년까지의 햇수를 A + B - 1로 정확히 구해요(기원전 1년 바로 다음이 기원후 1년이기 때문)",
        ms: "Menolak 1 apabila merentasi SM ke M (A + B - 1) kerana 1 SM terus diikuti oleh 1 M",
      },
    ],
    intuition: {
      ja: "数学の数直線には 0 がありますが、西暦は紀元前1年（-1）から紀元後1年（+1）へ直接とび、0年がありません。だから紀元前と紀元後にまたがるときは、足したあとで1を引きます！",
      ko: "수학의 수직선에는 0이 있지만, 서력기원은 기원전 1년(-1)에서 기원후 1년(+1)으로 바로 넘어가 0년이 없어요. 그래서 기원전과 기원후에 걸칠 때는 더한 뒤 1을 빼야 해요!",
      ms: "Tidak seperti garis nombor matematik, kalendar melompat terus dari 1 SM (-1) ke 1 M (+1) tanpa Tahun 0—jadi apabila merentasi SM/M, tambah kemudian tolak 1!",
    },
    steps: [
      {
        title: {
          ja: "同じ側どうしは引き算、紀元前と紀元後をまたぐときは足して1を引く",
          ko: "같은 쪽끼리는 빼고, 기원전·기원후에 걸치면 더한 뒤 1 빼기",
          ms: "Era Sama: Tolak; Merentasi SM/M: Tambah Kemudian Tolak 1",
        },
        body: {
          ja: "たとえば紀元前 221 年に秦が中国を統一してから紀元後 2026 年までは、221 + 2026 - 1 = 2246 年です。",
          ko: "예를 들어 기원전 221년 진나라의 중국 통일부터 기원후 2026년까지는 221 + 2026 - 1 = 2246년이에요.",
          ms: "Contohnya, dari 221 SM (penyatuan China oleh Dinasti Qin) hingga 2026 M ialah 221 + 2026 - 1 = 2246 tahun.",
        },
        checkQuestion: {
          ja: "ある歴史上のできごとが紀元前 202 年に起こりました。紀元後 200 年の同じ日までは何年たっていますか？",
          ko: "어떤 역사적 사건이 기원전 202년에 일어났어요. 기원후 200년의 같은 날까지 몇 년이 지났을까요?",
          ms: "Berapa tahunkah telah berlalu dari 202 SM hingga tarikh yang sama pada tahun 200 M?",
        },
      },
    ],
    misconceptions: {
      misc_his_year_zero: {
        label: {
          ja: "紀元0年があると考え、A + B - 1 ではなく A + B と計算する",
          ko: "0년이 있다고 생각해 A + B - 1이 아니라 A + B로 계산함",
          ms: "Menganggap Tahun 0 wujud dan mengira A + B dan bukannya A + B - 1",
        },
        wrongPattern: {
          ja: "紀元前 202 年から紀元後 200 年までを 401 年ではなく 202 + 200 = 402 年とする",
          ko: "기원전 202년부터 기원후 200년까지를 401년이 아니라 202 + 200 = 402년으로 계산함",
          ms: "Mengira 202 + 200 = 402 tahun dan bukannya 401 tahun",
        },
        remediationTip: {
          ja: "極端な例で確かめましょう：紀元前1年から紀元後1年まではたった1年（1 + 1 - 1 = 1）で、2年ではありません！",
          ko: "극단적인 예로 확인해요: 기원전 1년부터 기원후 1년까지는 단 1년(1 + 1 - 1 = 1)이지 2년이 아니에요!",
          ms: "Semakan pantas: 1 SM hingga 1 M hanyalah 1 tahun (1 + 1 - 1 = 1), bukan 2!",
        },
      },
    },
  },
};
