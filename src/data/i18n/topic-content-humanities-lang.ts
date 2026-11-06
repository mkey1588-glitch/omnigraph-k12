import type { TopicContentOverlay } from "./overlay";

/**
 * Native ja / ko / ms teaching content for the topics in src/data/canonical-topics-humanities-lang.ts.
 * Keyed by topic id. See ./overlay.ts for the shape.
 */
export const TOPIC_CONTENT_I18N_HUMANITIES_LANG: TopicContentOverlay = {
  // ==================== ENGLISH ====================
  mt_eng_sentence_sva_tense: {
    description: {
      ja: "`of ...`・`with ...`・`along with ...` などの前置詞句に惑わされず、中心となる名詞（本当の主語）の単数・複数に合わせて動詞を決めます。",
      ko: "`of ...`, `with ...`, `along with ...` 같은 전치사구에 흔들리지 않고, 핵심 주어(중심 명사)의 단수·복수에 맞춰 동사를 정해요.",
      ms: "Abaikan frasa sendi nama yang menyelit (`of...`, `along with...`) dan padankan kata kerja dengan subjek teras (kata nama inti) yang sebenar.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：「A box of apples ___ heavy（りんご1箱は重い）」の動詞は、単数の「box（箱）」と複数の「apples（りんご）」のどちらに合わせますか？",
      ko: "아이에게 물어보세요: 'A box of apples ___ heavy(사과 한 상자는 무거워요)'에서 동사는 단수 'box(상자)'와 복수 'apples(사과들)' 중 어느 쪽에 맞춰야 할까요?",
      ms: "Tanya anak: Dalam ayat 'A box of apples ___ heavy' (sekotak epal itu berat), adakah kata kerja dipadankan dengan 'box' (tunggal) atau 'apples' (jamak)?",
    },
    masteryCriteria: [
      {
        ja: "`The list of items is/are` の構文で、複数形の `items` に惑わされず、単数の中心名詞 `list` に合わせて `is` を選べる",
        ko: "`The list of items is/are` 구조에서 복수 목적어 `items`에 흔들리지 않고 단수 중심 명사 `list`에 맞춰 `is`를 고를 수 있어요",
        ms: "Memadankan kata nama inti tunggal `The list` dengan `is` dalam struktur `The list of items is/are`, tanpa terkeliru dengan objek jamak `items`",
      },
    ],
    intuition: {
      ja: "前置詞句 `(of ...)` をカッコでくくって隠してみましょう。残った中心名詞が動詞の形を決めます！",
      ko: "전치사구 `(of ...)`를 괄호로 묶어 가려 보세요. 남은 중심 명사가 동사의 형태를 결정해요!",
      ms: "Kurungkan frasa sendi nama `(of ...)` supaya 'tersembunyi': kata nama inti yang tinggal itulah yang menentukan bentuk kata kerja!",
    },
    steps: [
      {
        title: {
          ja: "修飾語をカッコで外す",
          ko: "수식어구를 괄호로 묶어 빼기",
          ms: "Kurungkan dan Ketepikan Penerang",
        },
        body: {
          ja: "`The quality [of these sensors] ___ (is / are) reliable.` では `[of these sensors]` を隠すと、主語は不可算・単数の `quality` なので `is` を入れます。",
          ko: "`The quality [of these sensors] ___ (is / are) reliable.`에서 `[of these sensors]`를 가리면 주어는 셀 수 없는 단수 명사 `quality`이므로 `is`를 써요.",
          ms: "Dalam `The quality [of these sensors] ___ (is / are) reliable.`, ketepikan `[of these sensors]`: subjek teras `quality` ialah kata nama tak boleh dikira (tunggal), maka isikan `is`.",
        },
        checkQuestion: {
          ja: "空所に入る語を選びましょう：`The results of the experiment ___ (show / shows) a clear trend.`",
          ko: "빈칸을 채우세요: `The results of the experiment ___ (show / shows) a clear trend.`",
          ms: "Isi tempat kosong: `The results of the experiment ___ (show / shows) a clear trend.`",
        },
      },
    ],
    misconceptions: {
      misc_eng_proximity_trap: {
        label: {
          ja: "近接の誤り：前置詞句の中にある、動詞にいちばん近い名詞に動詞を合わせてしまう",
          ko: "근접 오류: 전치사구 안에서 동사와 가장 가까운 명사에 동사를 맞춰요",
          ms: "Kesilapan kedekatan: memadankan kata kerja dengan kata nama terdekat di dalam frasa sendi nama",
        },
        wrongPattern: {
          ja: "`The list of participants is...` とすべきところを `The list of participants are...` と書いてしまう",
          ko: "`The list of participants is...` 대신 `The list of participants are...`라고 써요",
          ms: "Menulis `The list of participants are...` dan bukannya `is...`",
        },
        remediationTip: {
          ja: "前置詞の後ろの名詞はあくまで脇役（前置詞の目的語）です。主節の動詞を決めることは絶対にありません！",
          ko: "전치사 뒤의 명사는 전치사의 목적어일 뿐, 절대 주절의 동사를 결정하지 않아요!",
          ms: "Objek kepada kata sendi nama tidak sekali-kali menentukan kata kerja ayat utama!",
        },
      },
    },
  },

  mt_eng_passive_participle: {
    description: {
      ja: "分詞の意味上の主語（主節の主語または修飾される名詞）を見つけ、それが動作をする側なら `-ing`（現在分詞）、動作を受ける側なら過去分詞を選びます。",
      ko: "분사의 의미상 주어(주절의 주어 또는 수식받는 명사)를 찾아, 그 주어가 동작을 하면 `-ing`(현재분사), 동작을 받으면 과거분사를 골라요.",
      ms: "Kenal pasti subjek logik bagi partisipel (subjek ayat utama atau kata nama yang diterangkan), kemudian pilih `-ing` jika subjek itu pelaku (aktif) atau partisipel lepas jika subjek itu penerima perbuatan (pasif).",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：「Seeing from the hilltop, the city looked tiny.」という文は、なぜ「街が自分の目で見ている」という意味になってしまうのでしょう？",
      ko: "아이에게 물어보세요: 'Seeing from the hilltop, the city looked tiny.'라는 문장은 왜 '도시가 직접 눈으로 본다'는 뜻이 되어 버릴까요?",
      ms: "Tanya anak: Mengapakah ayat 'Seeing from the hilltop, the city looked tiny.' secara tidak sengaja menyatakan bahawa bandar itu mempunyai mata?",
    },
    masteryCriteria: [
      {
        ja: "分詞（`Seeing` か `Seen` か）の能動・受動を主節の主語に正しく対応させ、懸垂分詞を防げる",
        ko: "분사(`Seeing` 또는 `Seen`)의 능동·수동을 주절의 주어와 정확히 맞춰 현수 분사 오류를 피할 수 있어요",
        ms: "Memadankan ragam partisipel (`Seeing` atau `Seen`) dengan subjek ayat utama dan mengelakkan partisipel tergantung (dangling participle)",
      },
    ],
    intuition: {
      ja: "文頭の分詞に主語が書かれていないときは、コンマの後ろにある主節の主語を借ります。`the city` は「見られる」側なので受動の `Seen` を使い、能動の `Seeing` は使えません！",
      ko: "문장 앞 분사에 주어가 없으면 쉼표 뒤 주절의 주어를 빌려 써요. `the city`는 '보이는' 대상이므로 능동 `Seeing`이 아니라 수동 `Seen`을 써야 해요!",
      ms: "Partisipel di awal ayat 'meminjam' subjek ayat utama: `the city` ialah benda yang dilihat (pasif `Seen`), bukan yang melihat (`Seeing`)!",
    },
    steps: [
      {
        title: {
          ja: "意味上の主語を探す → 能動か受動かを判断する",
          ko: "의미상 주어 찾기 → 능동/수동 판단하기",
          ms: "Cari Subjek Logik → Tentukan Aktif atau Pasif",
        },
        body: {
          ja: "`______ (Build / Built) in 1920, the bridge still stands.` の意味上の主語は `the bridge`（建てられた側）なので、過去分詞 `Built` を入れます。",
          ko: "`______ (Build / Built) in 1920, the bridge still stands.`에서 의미상 주어는 `the bridge`(지어진 대상)이므로 과거분사 `Built`를 써요.",
          ms: "Dalam `______ (Build / Built) in 1920, the bridge still stands.`, subjek logiknya ialah `the bridge` (jambatan itu dibina), maka isikan partisipel lepas `Built`.",
        },
        checkQuestion: {
          ja: "空所に入る語を選びましょう：`______ (Writing / Written) in clear English, the manual is easy to follow.`",
          ko: "빈칸을 채우세요: `______ (Writing / Written) in clear English, the manual is easy to follow.`",
          ms: "Isi tempat kosong: `______ (Writing / Written) in clear English, the manual is easy to follow.`",
        },
      },
    ],
    misconceptions: {
      misc_eng_dangling_ing: {
        label: {
          ja: "懸垂分詞の誤り：主節の主語が動作を受ける側なのに、能動の `-ing` 分詞で文を始めてしまう",
          ko: "현수 분사 오류: 주절의 주어가 동작을 받는 대상인데도 능동 `-ing` 분사로 문장을 시작해요",
          ms: "Partisipel tergantung: memulakan ayat dengan partisipel aktif `-ing` walhal subjek ayat utama ialah penerima perbuatan",
        },
        wrongPattern: {
          ja: "`Designed by students, the robot won` とすべきところを `Designing by students, the robot won` と書いてしまう",
          ko: "`Designed by students, the robot won` 대신 `Designing by students, the robot won`이라고 써요",
          ms: "Menulis `Designing by students, the robot won` dan bukannya `Designed`",
        },
        remediationTip: {
          ja: "いつも「コンマの後ろの主語は動作をする側か、される側か？」と確かめましょう。される側なら迷わず過去分詞です！",
          ko: "항상 '쉼표 뒤의 주어가 동작을 하는 쪽인가, 받는 쪽인가?'를 확인하세요. 받는 쪽이면 망설이지 말고 과거분사예요!",
          ms: "Sentiasa tanya: adakah subjek ayat utama melakukan perbuatan atau menerima perbuatan? Jika menerima, pilih partisipel lepas!",
        },
      },
    },
  },

  mt_eng_conditionals_academic: {
    description: {
      ja: "過去の事実に反する仮定を表すときは、条件節の `If + 過去完了（had + p.p.）` と、帰結節の `would/could have + p.p.` を正しく組み合わせます。",
      ko: "과거 사실과 반대되는 가정을 할 때는 조건절의 `If + 과거완료(had + p.p.)`와 결과절의 `would/could have + p.p.`를 짝지어 써요.",
      ms: "Pasangkan `If + past perfect (had + p.p.)` dalam klausa syarat dengan `would/could have + p.p.` dalam klausa hasil untuk andaian yang bertentangan dengan fakta lampau.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：「If I would have studied, I would have passed.」は、なぜ正式な（アカデミックな）英語では誤りとされるのでしょう？",
      ko: "아이에게 물어보세요: 'If I would have studied, I would have passed.'는 왜 격식 있는 학술 영어에서 바르지 않은 표현일까요?",
      ms: "Tanya anak: Mengapakah ayat 'If I would have studied, I would have passed' dianggap tidak standard dalam bahasa Inggeris akademik?",
    },
    masteryCriteria: [
      {
        ja: "仮定法過去完了の if 節の中では `would have` を絶対に使わない（`If I would have...` を避ける）",
        ko: "가정법 과거완료의 `if`절 안에는 절대 `would have`를 쓰지 않아요(`If I would have...` 피하기)",
        ms: "Tidak sekali-kali menggunakan `would have` di dalam klausa `if` ayat bersyarat jenis ketiga (elakkan `If I would have...`)",
      },
    ],
    intuition: {
      ja: "過去に実現しなかったことを表すには、時制をさらに一段階過去へずらします：`If + had done` → `would have done`。",
      ko: "과거에 일어나지 않은 일을 가정할 때는 시제를 한 단계 더 과거로 옮겨요: `If + had done` → `would have done`.",
      ms: "Untuk menyatakan andaian lampau yang tidak berlaku, anjakkan kala selangkah lagi ke belakang: `If + had done` → `would have done`.",
    },
    steps: [
      {
        title: {
          ja: "条件節と帰結節の時制の組み合わせを確認する",
          ko: "조건절과 결과절의 시제 짝 확인하기",
          ms: "Semak Pasangan Kala Klausa",
        },
        body: {
          ja: "帰結節に `would have arrived` があれば、if 節は必ず `had left` になります（`left` や `would have left` ではありません）。",
          ko: "결과절에 `would have arrived`가 있으면 `if`절은 반드시 `had left`여야 해요(`left`나 `would have left`가 아니에요).",
          ms: "Apabila klausa hasil mengandungi `would have arrived`, klausa `if` mesti menggunakan `had left` (bukan `left` atau `would have left`).",
        },
        checkQuestion: {
          ja: "動詞 check を使い、英語2語で完成させましょう：`If the team ______ the sensor yesterday, the launch would have succeeded.`",
          ko: "동사 check를 사용해 영어 두 단어로 완성하세요: `If the team ______ the sensor yesterday, the launch would have succeeded.`",
          ms: "Lengkapkan dengan dua perkataan bahasa Inggeris (gunakan kata kerja check): `If the team ______ the sensor yesterday, the launch would have succeeded.`",
        },
      },
    ],
    misconceptions: {
      misc_eng_if_would_have: {
        label: {
          ja: "if 節の中に `had + p.p.` ではなく `would have` を入れてしまう",
          ko: "`if`절 안에 `had + p.p.` 대신 `would have`를 넣어요",
          ms: "Memasukkan `would have` ke dalam klausa `if` dan bukannya `had + p.p.`",
        },
        wrongPattern: {
          ja: "`If she had known...` とすべきところを `If she would have known...` と書いてしまう",
          ko: "`If she had known...` 대신 `If she would have known...`라고 써요",
          ms: "Menulis `If she would have known...` dan bukannya `If she had known...`",
        },
        remediationTip: {
          ja: "合言葉は「if 節に `would` は入れない」！過去の事実に反する仮定は `If ... had + p.p.` で表します。",
          ko: "기억하세요: `if`절에는 `would`를 넣지 않아요! 과거 사실의 반대는 `If ... had + p.p.`로 써요.",
          ms: "Jauhkan `would` daripada klausa `if`; gunakan `had + past participle`.",
        },
      },
    },
  },

  // ==================== GEOGRAPHY ====================
  mt_geo_contour_elevation: {
    description: {
      ja: "等高線から標高差 Δh を読み取り、対流圏では標高が 100 m 上がるごとに気温が約 0.6°C 下がる（6°C/km）ことを使って、山頂や盆地の気温を推定します。",
      ko: "등고선에서 해발 고도 차 Δh를 읽고, 대류권에서 고도가 100 m 높아질 때마다 기온이 약 0.6°C 낮아진다는 사실(6°C/km)을 이용해 산꼭대기나 분지의 기온을 추정해요.",
      ms: "Tentukan beza ketinggian Δh daripada peta kontur dan gunakan kadar tukaran suhu troposfera, iaitu suhu turun kira-kira 0.6°C bagi setiap kenaikan 100 m (6°C/km), untuk menganggar suhu di puncak gunung atau lembangan.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：夏、山のふもとが 30°C で暑いとき、ふもとより 2000 m 高い山頂の気温はおよそ何度でしょう？上着は必要かな？",
      ko: "아이에게 물어보세요: 여름에 산기슭이 30°C로 더울 때, 산기슭보다 2000 m 높은 산꼭대기의 기온은 대략 몇 도일까요? 겉옷을 챙겨야 할까요?",
      ms: "Tanya anak: Jika suhu di kaki gunung ialah 30°C, kira-kira berapakah suhu di puncak yang 2000 m lebih tinggi? Perlukah membawa jaket?",
    },
    masteryCriteria: [
      {
        ja: "標高が上がるときは 100 m ごとに 0.6°C を引き、下がるときは 100 m ごとに 0.6°C を足す（符号を逆にしない）",
        ko: "고도가 높아지면 100 m마다 0.6°C를 빼고, 낮아지면 100 m마다 0.6°C를 더할 수 있어요(부호를 거꾸로 하지 않기)",
        ms: "Menolak 0.6°C bagi setiap kenaikan 100 m dan menambah 0.6°C bagi setiap penurunan 100 m (tanpa menterbalikkan tanda)",
      },
    ],
    intuition: {
      ja: "対流圏の空気は主に地面からの放射で暖められるので、地面から離れるほど寒くなります！1000 m 登るごとに気温は 6°C 下がります。",
      ko: "대류권의 공기는 주로 지표면에서 나오는 복사 에너지로 데워져요. 그래서 지표면에서 멀어질수록 추워요! 1000 m 올라갈 때마다 기온이 6°C씩 낮아져요.",
      ms: "Troposfera dipanaskan dari permukaan bumi ke atas, jadi semakin jauh dari permukaan, semakin sejuk! Setiap kenaikan 1000 m menurunkan suhu udara sebanyak 6°C.",
    },
    steps: [
      {
        title: {
          ja: "標高差 Δh（km）を求めて 6°C をかける",
          ko: "고도 차 Δh(km)를 구해 6°C 곱하기",
          ms: "Cari Δh dalam km, Darab dengan 6°C",
        },
        body: {
          ja: "ふもと（標高 500 m）の気温が 24°C、山頂の標高が 2500 m のとき：Δh = 2000 m = 2 km、気温の低下は 2 × 6 = 12°C なので、山頂は 12°C です。",
          ko: "산기슭(해발 500 m) 기온이 24°C이고 산꼭대기 해발이 2500 m이면: Δh = 2000 m = 2 km, 기온 하강은 2 × 6 = 12°C이므로 산꼭대기는 12°C예요.",
          ms: "Dari kaki gunung 500 m (24°C) ke puncak 2500 m: Δh = 2000 m = 2 km, suhu turun 2 × 6 = 12°C, maka suhu di puncak ialah 12°C.",
        },
        checkQuestion: {
          ja: "標高 200 m 地点の気温が 21°C のとき、標高 1200 m 地点の気温は理論上何 °C ですか？",
          ko: "해발 200 m 지점의 기온이 21°C일 때, 해발 1200 m 지점의 이론상 기온은 몇 °C일까요?",
          ms: "Pada ketinggian 200 m, suhu ialah 21°C. Anggarkan suhu (°C) pada ketinggian 1200 m:",
        },
      },
    ],
    misconceptions: {
      misc_geo_lapse_use_abs_h: {
        label: {
          ja: "標高差 Δh = h₂ - h₁ ではなく山頂の標高そのもので気温の低下を計算してしまう（または低下を上昇として計算する）",
          ko: "고도 차 Δh = h₂ - h₁ 대신 산꼭대기의 해발 고도 자체로 기온 하강을 계산해요(또는 하강을 상승으로 계산해요)",
          ms: "Menggunakan ketinggian mutlak puncak dan bukannya ketinggian relatif Δh = h₂ - h₁ (atau mengira penurunan suhu sebagai kenaikan)",
        },
        wrongPattern: {
          ja: "ふもと 500 m（24°C）から山頂 2500 m までを、2500 m のまま 0.6 × (2500/100) = 15°C 下がると計算し、9°C としてしまう（正しくは 0.6 × ((2500-500)/100)）",
          ko: "산기슭 500 m(24°C)에서 산꼭대기 2500 m까지를 2500 m 그대로 0.6 × (2500/100) = 15°C 내려간다고 계산해 9°C라고 답해요(올바른 식은 0.6 × ((2500-500)/100))",
          ms: "Dari kaki gunung 500 m (24°C) ke puncak 2500 m, mengira penurunan 0.6 × (2500/100) = 15°C lalu mendapat 9°C, sedangkan yang betul ialah 0.6 × ((2500-500)/100)",
        },
        remediationTip: {
          ja: "ふもとの気温は標高 500 m で測ったものです。必ず先に標高差 Δh = 2500 - 500 を求めましょう！",
          ko: "산기슭의 기온은 해발 500 m에서 잰 값이에요. 반드시 먼저 고도 차 Δh = 2500 - 500을 구하세요!",
          ms: "Suhu di kaki gunung diukur pada 500 m. Sentiasa tolak ketinggian stesen asas dahulu untuk mendapat Δh = 2500 - 500!",
        },
      },
    },
  },

  mt_geo_solar_angle_climate: {
    description: {
      ja: "南中高度 H = 90° - |緯度 - 太陽が真上にくる地点の緯度| を使い、春分・秋分・夏至・冬至にある地点の太陽の南中高度を求めます（同じ半球なら緯度を引き、異なる半球なら足します）。",
      ko: "남중 고도 H = 90° - |위도 - 태양이 수직으로 비추는 지점의 위도|를 이용해 춘분·추분·하지·동지에 어떤 지역의 태양 남중 고도를 구해요(같은 반구면 위도를 빼고, 다른 반구면 더해요).",
      ms: "Kira sudut ketinggian matahari tengah hari H = 90° - |latitud - latitud matahari tegak| pada ekuinoks dan solstis (tolak latitud jika dalam hemisfera yang sama, tambah jika berlainan hemisfera).",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：冬至の日には太陽が南回帰線（南緯 23.5°）の真上にきます。なぜ北半球にいる私たちの正午の影は、1年でいちばん長くなるのでしょう？",
      ko: "아이에게 물어보세요: 동짓날에는 태양이 남회귀선(남위 23.5°)을 수직으로 비춰요. 왜 북반구에 사는 우리의 정오 그림자는 1년 중 가장 길어질까요?",
      ms: "Tanya anak: Pada solstis Disember, matahari berada tegak di atas Garisan Jadi (23.5°S). Mengapakah bayang-bayang pada waktu tengah hari paling panjang di Hemisfera Utara?",
    },
    masteryCriteria: [
      {
        ja: "観測地点と太陽が真上にくる地点が南北の異なる半球にあるときは、緯度差を両者の和 |φ - (-δ)| = φ + δ として求められる",
        ko: "관측 지점과 태양이 수직으로 비추는 지점이 서로 다른 반구에 있을 때 위도 차를 두 값의 합 |φ - (-δ)| = φ + δ로 구할 수 있어요",
        ms: "Menambah latitud apabila pemerhati dan kedudukan matahari tegak berada di hemisfera yang berlainan: |φ - (-δ)| = φ + δ",
      },
    ],
    intuition: {
      ja: "太陽が真上にくる地点では南中高度は 90° です。そこから緯度が 1° 離れるごとに、南中高度は 1° ずつ低くなります！",
      ko: "태양이 수직으로 비추는 지점에서는 남중 고도가 90°예요. 그 지점에서 위도가 1° 멀어질 때마다 남중 고도가 1°씩 낮아져요!",
      ms: "Di kedudukan matahari tegak, sudut matahari ialah 90°; setiap 1° perbezaan latitud dari titik itu merendahkan sudut matahari tengah hari sebanyak 1°.",
    },
    steps: [
      {
        title: {
          ja: "北緯を +、南緯を - として |φ - δ| を求める",
          ko: "북위는 +, 남위는 -로 두고 |φ - δ| 구하기",
          ms: "Tetapkan U = +, S = - dan Kira |φ - δ|",
        },
        body: {
          ja: "春分の日（太陽は赤道の真上、δ = 0°）の北緯 40° の南中高度：H = 90° - |40° - 0°| = 50°。",
          ko: "춘분(태양이 적도를 수직으로 비춤, δ = 0°)에 북위 40°의 남중 고도: H = 90° - |40° - 0°| = 50°.",
          ms: "Pada 40°U semasa ekuinoks (matahari tegak di atas khatulistiwa, δ = 0°): H = 90° - |40° - 0°| = 50°.",
        },
        checkQuestion: {
          ja: "春分の日、太陽は赤道（0°）の真上にきます。北緯 30° の地点の南中高度は何度ですか？",
          ko: "춘분에 태양은 적도(0°)를 수직으로 비춰요. 북위 30° 지역의 남중 고도는 몇 도일까요?",
          ms: "Pada ekuinoks (matahari tegak di atas 0°), cari sudut matahari tengah hari (°) di 30°U:",
        },
      },
    ],
    misconceptions: {
      misc_geo_solar_same_sign: {
        label: {
          ja: "観測地点と太陽が真上にくる地点が異なる半球にあるのに、緯度を足さずに引いてしまう（例：冬至に北緯 40° で |40 - 23.5| と計算する）",
          ko: "관측 지점과 태양이 수직으로 비추는 지점이 다른 반구에 있는데 위도를 더하지 않고 빼요(예: 동지에 북위 40°에서 |40 - 23.5|로 계산)",
          ms: "Menolak latitud dan bukannya menambahnya apabila pemerhati dan kedudukan matahari tegak berada di hemisfera berlainan (cth. 40°U pada solstis Disember dikira |40 - 23.5|)",
        },
        wrongPattern: {
          ja: "冬至の日（太陽は南緯 23.5° の真上）、北緯 40° の緯度差を 40° - 23.5° = 16.5° と計算してしまう（正しくは 40 - (-23.5) = 63.5°）",
          ko: "동지(태양이 남위 23.5°를 수직으로 비춤)에 북위 40°의 위도 차를 40° - 23.5° = 16.5°로 계산해요(올바른 값은 40 - (-23.5) = 63.5°)",
          ms: "Menggunakan 40 - 23.5 = 16.5° dan bukannya 40 - (-23.5) = 63.5°",
        },
        remediationTip: {
          ja: "赤道をまたぐのは数直線の 0 をまたぐのと同じです：北緯 +40° から南緯 -23.5° までの距離は |+40 - (-23.5)| = 63.5° です！",
          ko: "적도를 넘는 것은 수직선에서 0을 넘는 것과 같아요: 북위 +40°에서 남위 -23.5°까지의 거리는 |+40 - (-23.5)| = 63.5°예요!",
          ms: "Anggap U sebagai + dan S sebagai - pada garis nombor: |+40 - (-23.5)| = 63.5°!",
        },
      },
    },
  },

  // ==================== HISTORY ====================
  mt_his_trade_demographics: {
    description: {
      ja: "歴史上の貿易収支（輸出額 - 輸入額）を計算して「出超（輸出 > 輸入で銀が流入）」と「入超（貿易赤字）」を区別し、「割合の低下」と「総量の減少」を混同しないようにします。",
      ko: "역사 속 무역 수지(수출액 - 수입액)를 계산해 '흑자(수출 > 수입, 은 유입)'와 '적자'를 구별하고, '비중 감소'와 '절대량 감소'를 혼동하지 않아요.",
      ms: "Kira imbangan perdagangan dalam sumber sejarah (eksport tolak import), bezakan lebihan dagangan (eksport > import, perak mengalir masuk) daripada defisit, dan jangan keliru antara penurunan peratus bahagian dengan penurunan jumlah mutlak.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：GDP に占める農業の割合が 80% から 50% に下がった一方で、GDP 全体が 3 倍になったとしたら、農業の生産量は減ったでしょうか、増えたでしょうか？",
      ko: "아이에게 물어보세요: GDP에서 농업이 차지하는 비중이 80%에서 50%로 줄었지만 GDP 전체가 3배로 늘었다면, 농업 생산량은 줄었을까요, 늘었을까요?",
      ms: "Tanya anak: Jika bahagian pertanian dalam KDNK turun daripada 80% kepada 50% tetapi jumlah KDNK meningkat 3 kali ganda, adakah hasil pertanian berkurang atau bertambah?",
    },
    masteryCriteria: [
      {
        ja: "輸出額 - 輸入額を正しく計算して出超・入超を判断し、歴史統計表で割合（%）の変化と絶対量の変化を区別できる",
        ko: "수출액 - 수입액을 정확히 계산해 흑자·적자를 판단하고, 역사 통계표에서 비중(%) 변화와 절대량 변화를 구별할 수 있어요",
        ms: "Mengira eksport - import dengan tepat untuk menentukan lebihan atau defisit, serta membezakan perubahan peratus bahagian daripada perubahan kuantiti mutlak dalam jadual sejarah",
      },
    ],
    intuition: {
      ja: "歴史資料問題の最大の落とし穴：割合（%）の低下 ≠ 絶対量の低下！ケーキ全体が 3 倍に大きくなれば、取り分の割合が小さくなっても、もらえるケーキの量はかえって増えます。",
      ko: "역사 자료 문제의 가장 큰 함정: 비중(%) 감소 ≠ 절대량 감소! 케이크 전체가 3배로 커지면 내 몫의 비율이 줄어도 실제로 받는 양은 오히려 더 많아져요.",
      ms: "Perangkap utama soalan sumber sejarah: penurunan peratus bahagian ≠ penurunan jumlah mutlak! Kepingan yang lebih kecil (%) daripada kek yang jauh lebih besar masih boleh menjadi jumlah yang LEBIH BESAR.",
    },
    steps: [
      {
        title: {
          ja: "まず表の単位を確認：銀の量（絶対量）か、割合（%）か",
          ko: "먼저 표의 단위 확인하기: 은의 양(절대량)인가, 비중(%)인가",
          ms: "Semak Unit Dahulu: Jumlah Perak (Mutlak) atau Peratus Bahagian (%)",
        },
        body: {
          ja: "ある港の生糸・茶の輸出額が 420 万両、毛織物の輸入額が 290 万両なら → 出超（貿易黒字）= 420 - 290 = 130 万両です。",
          ko: "어느 항구의 비단·차 수출액이 420만 냥, 모직물 수입액이 290만 냥이면 → 무역 흑자 = 420 - 290 = 130만 냥이에요.",
          ms: "Sebuah pelabuhan mengeksport sutera dan teh bernilai 420 unit perak dan mengimport kain bulu bernilai 290 unit → lebihan dagangan = 420 - 290 = 130 unit.",
        },
        checkQuestion: {
          ja: "ある史料によると、ある年の甲国の乙国への輸出額は 380 万銀元、輸入額は 230 万銀元でした。この年の甲国の貿易黒字（出超）は何万銀元ですか？",
          ko: "사료에 따르면 어느 해 갑국의 을국에 대한 수출액은 380만 은화, 수입액은 230만 은화였어요. 이해 갑국의 무역 흑자는 몇만 은화일까요?",
          ms: "Eksport = 380 puluh ribu dolar perak (3.8 juta), import = 230 puluh ribu (2.3 juta). Cari lebihan dagangan dalam unit 10,000 dolar perak:",
        },
      },
    ],
    misconceptions: {
      misc_his_share_vs_abs: {
        label: {
          ja: "「輸出 - 輸入」の向きを逆に計算したり、「割合の低下」を「絶対額の減少」と誤解したりする",
          ko: "'수출 - 수입'의 순서를 거꾸로 계산하거나, '비중 감소'를 '절대액 감소'로 오해해요",
          ms: "Menterbalikkan eksport - import atau menyamakan penurunan peratus bahagian dengan penurunan mutlak",
        },
        wrongPattern: {
          ja: "輸出 380・輸入 230 のとき、貿易黒字を合計の 610 やマイナスの値として計算してしまう",
          ko: "수출 380, 수입 230일 때 무역 흑자를 합계인 610이나 음수로 계산해요",
          ms: "Bagi eksport 380 dan import 230, mengira lebihan dagangan sebagai jumlah 610 (eksport + import) atau nilai negatif",
        },
        remediationTip: {
          ja: "貿易総額 = 輸出 + 輸入、貿易収支（黒字・赤字）= 輸出 - 輸入！問われているのが「総額」か「収支」かをよく確認しましょう。",
          ko: "무역 총액 = 수출 + 수입, 무역 수지(흑자·적자) = 수출 - 수입! 문제가 '총액'을 묻는지 '수지'를 묻는지 꼭 확인하세요.",
          ms: "Jumlah dagangan = X + M; imbangan dagangan bersih = X - M. Baca soalan dengan teliti: adakah ia bertanya tentang jumlah atau imbangan?",
        },
      },
    },
  },

  mt_his_industrial_modern: {
    description: {
      ja: "第一次産業革命（石炭・改良された蒸気機関・鉄道・工場制）と第二次産業革命（電力・内燃機関・石油化学・科学と技術の結びつき）を正確に区別し、歴史の「根本的な原因」と「直接のきっかけ」を見分けます。",
      ko: "제1차 산업 혁명(석탄·개량된 증기 기관·철도·공장제)과 제2차 산업 혁명(전기·내연 기관·석유 화학·과학과 기술의 긴밀한 결합)을 정확히 구별하고, 역사의 '근본 원인'과 '직접적 계기'를 구분해요.",
      ms: "Bezakan Revolusi Perindustrian Pertama (arang batu, enjin wap yang diperbaiki, kereta api, sistem kilang) dengan Revolusi Perindustrian Kedua (elektrik, enjin pembakaran dalam, petrokimia, penyelidikan berasaskan sains), serta bezakan 'sebab utama' dengan 'pencetus langsung'.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：1820 年のロンドンを舞台にした映画に、蒸気機関車と電球の両方が出てきたら、時代に合わない（時代錯誤の）ものはどちらでしょう？",
      ko: "아이에게 물어보세요: 1820년 런던을 배경으로 한 영화에 증기 기관차와 전구가 모두 나온다면, 시대에 맞지 않는(시대착오적인) 것은 어느 쪽일까요?",
      ms: "Tanya anak: Dalam filem berlatarkan London pada tahun 1820, jika anda nampak kereta api wap dan mentol lampu elektrik, yang manakah merupakan anakronisme sejarah?",
    },
    masteryCriteria: [
      {
        ja: "内燃機関・電灯・飛行機など第二次産業革命の成果を第一次産業革命に入れてしまう時代錯誤（アナクロニズム）を避けられる",
        ko: "내연 기관·전등·비행기 같은 제2차 산업 혁명의 성과를 제1차 산업 혁명에 넣는 시대착오(아나크로니즘)를 피할 수 있어요",
        ms: "Mengelakkan anakronisme antara era wap abad ke-18 dengan era elektrik dan minyak lewat abad ke-19 (cth. meletakkan enjin pembakaran dalam atau lampu elektrik dalam Revolusi Perindustrian Pertama)",
      },
    ],
    intuition: {
      ja: "第一次産業革命（約 1760–1840 年）＝石炭＋蒸気機関＋綿工業の機械化、第二次産業革命（約 1870–1914 年）＝電力＋石油＋内燃機関。第一次は職人の経験から、第二次は電磁気学や熱力学など実験室の科学から生まれました！",
      ko: "제1차 산업 혁명(약 1760–1840년) = 석탄 + 증기 기관 + 면직물 생산의 기계화, 제2차 산업 혁명(약 1870–1914년) = 전기 + 석유 + 내연 기관. 제1차는 장인의 경험에서, 제2차는 전자기학·열역학 같은 실험실 과학에서 비롯되었어요!",
      ms: "Revolusi Perindustrian Pertama (~1760–1840) = Arang Batu + Wap + Tekstil Berjentera; Revolusi Perindustrian Kedua (~1870–1914) = Elektrik + Minyak + Enjin Pembakaran Dalam.",
    },
    steps: [
      {
        title: {
          ja: "エネルギー源・動力で時代を見分ける",
          ko: "에너지원과 동력으로 시기 구분하기",
          ms: "Tentukan Era Berdasarkan Sumber Tenaga",
        },
        body: {
          ja: "ワットが改良した蒸気機関（1780 年代）やスチーブンソンの蒸気機関車（1814/1825）は第一次、発電機・内燃機関の自動車・電話は第二次産業革命に属します。",
          ko: "와트가 개량한 증기 기관(1780년대)과 스티븐슨의 증기 기관차(1814/1825)는 제1차, 발전기·내연 기관 자동차·전화는 제2차 산업 혁명에 속해요.",
          ms: "Enjin wap yang diperbaiki oleh James Watt (1780-an) dan lokomotif wap George Stephenson (1814/1825) tergolong dalam Revolusi Perindustrian Pertama; dinamo, kereta berenjin pembakaran dalam dan telefon tergolong dalam Revolusi Perindustrian Kedua.",
        },
      },
    ],
    misconceptions: {
      misc_his_ir_anachronism: {
        label: {
          ja: "時代錯誤（アナクロニズム）：内燃機関や電力の利用を第一次産業革命に入れてしまう",
          ko: "시대착오(아나크로니즘): 내연 기관이나 전력 이용을 제1차 산업 혁명에 넣어요",
          ms: "Anakronisme: meletakkan enjin pembakaran dalam atau grid elektrik dalam Revolusi Perindustrian Pertama",
        },
        wrongPattern: {
          ja: "1851 年のロンドン万国博覧会（第1回万博）にカール・ベンツの内燃機関自動車が展示されたと考えてしまう",
          ko: "1851년 런던 제1회 만국 박람회에 카를 벤츠의 내연 기관 자동차가 전시되었다고 생각해요",
          ms: "Menganggap kereta petrol Karl Benz dipamerkan di Pameran Besar Crystal Palace 1851 di London",
        },
        remediationTip: {
          ja: "1851 年の水晶宮（クリスタル・パレス）の万博は蒸気の時代の頂点でした。自動車や電灯が登場するのは 1870–1880 年代になってからです！",
          ko: "1851년 수정궁 박람회는 증기 시대의 절정이었어요. 자동차와 전등은 1870–1880년대에 들어서야 등장해요!",
          ms: "Pameran Crystal Palace 1851 mempamerkan jentera wap pada kemuncak era wap; lampu elektrik dan kereta hanya muncul pada tahun 1870-an hingga 1880-an.",
        },
      },
    },
  },

  // ==================== LITERACY / CRITICAL READING ====================
  mt_lit_main_idea_structure: {
    description: {
      ja: "「確かに～。しかし／ところが（However/Yet）」のような逆接の後に置かれる筆者の中心的な主張をとらえ、具体例（「ある都市を例にとると」など）を文章全体の要旨と取り違えないようにします。",
      ko: "'물론 ~지만/그러나(However/Yet)' 같은 역접 표현 뒤에 오는 글쓴이의 핵심 주장을 찾고, 구체적인 예시(예: '한 도시를 예로 들면')를 글 전체의 중심 생각으로 착각하지 않아요.",
      ms: "Kenal pasti dakwaan utama penulis selepas penanda pertentangan (seperti 'walaupun... tetapi', 'namun', However/Yet) dan jangan tersilap menganggap contoh ilustrasi (cth. 'ambil contoh sebuah bandar') sebagai tesis utama petikan.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：文章が「多くの人は問題をたくさん解けば成績が上がると考えている」と始まり、すぐに「しかし、間違えた原因を振り返らなければ同じ間違いを繰り返すだけだ」と続くとき、筆者が本当に伝えたいのは前半ですか、それとも「しかし」の後ですか？",
      ko: "아이에게 물어보세요: 글이 '많은 사람은 문제를 많이 풀면 성적이 오른다고 생각한다'로 시작하고 곧바로 '그러나 틀린 원인을 돌아보지 않으면 같은 실수를 반복할 뿐이다'가 이어진다면, 글쓴이가 정말 강조하고 싶은 것은 앞부분일까요, '그러나' 뒷부분일까요?",
      ms: "Tanya anak: Apabila penulis menulis 'Ramai menyangka banyak membuat latihan akan meningkatkan markah; namun, tanpa mengenal pasti punca kesilapan, kesilapan yang sama akan berulang', bahagian manakah yang membawa tesis sebenar penulis?",
    },
    masteryCriteria: [
      {
        ja: "局所的な具体例だけを言い換えた選択肢を除外し、段落全体をまとめる一般的な主張を選べる",
        ko: "부분적인 예시만 되풀이한 선택지를 제외하고, 문단 전체를 아우르는 일반적인 주장을 고를 수 있어요",
        ms: "Menyingkirkan pilihan pengganggu yang hanya mengulang contoh sempit dan memilih dakwaan umum yang merangkumi keseluruhan perenggan",
      },
    ],
    intuition: {
      ja: "要旨をつかむ黄金ルール：「確かに～／多くの人は～」は前置きにすぎず、逆接の「しかし」の後に筆者の主張が登場します。「例えば」の後は主張を支えるための具体例です！",
      ko: "중심 생각을 찾는 황금 법칙: '물론 ~/많은 사람은 ~'은 도입(양보)일 뿐이고, 역접 '그러나' 뒤에 글쓴이의 주장이 나와요. '예를 들어' 뒤는 주장을 뒷받침하는 예시예요!",
      ms: "Konsesi ('Walaupun.../Ramai menyangka...') hanya pembuka; penanda pertentangan ('Namun...') menyampaikan tesis; 'Contohnya...' sekadar menghuraikannya.",
    },
    steps: [
      {
        title: {
          ja: "要旨をつかむ3ステップ",
          ko: "중심 생각 찾기 3단계",
          ms: "3 Langkah Mengenal Pasti Tesis",
        },
        body: {
          ja: "① 逆接・転換の語（しかし／実際には／However）に丸をつける。② 「例えば～」の具体例をカッコでくくって外す。③ 残った中心文をまとめている選択肢を選ぶ。",
          ko: "① 역접·전환 표지(그러나/사실은/However)에 동그라미 치기 ② '예를 들어…'의 구체적 사례를 괄호로 묶어 빼기 ③ 남은 핵심 문장을 아우르는 선택지 고르기",
          ms: "1. Bulatkan penanda pertentangan (namun/sebenarnya/However); 2. Kurungkan contoh 'Contohnya...'; 3. Padankan dengan pilihan yang merumuskan dakwaan menyeluruh.",
        },
      },
    ],
    misconceptions: {
      misc_lit_example_as_thesis: {
        label: {
          ja: "例を要旨と取り違える：文中の生き生きとした具体例を、文章全体の要旨として選んでしまう",
          ko: "예시를 중심 생각으로 착각: 글 속의 생생한 구체적 예시를 글 전체의 중심 생각으로 골라요",
          ms: "Memilih contoh sokongan yang menarik dan bukannya tesis menyeluruh",
        },
        wrongPattern: {
          ja: "ミツバチのダンスを例に動物の情報伝達を説明している文章なのに、要旨として「ミツバチはどのようにダンスをするか」を選んでしまう",
          ko: "꿀벌의 춤을 예로 들어 동물의 의사소통을 설명한 글인데, 중심 생각으로 '꿀벌은 어떻게 춤을 추는가'를 골라요",
          ms: "Memilih 'Bagaimana lebah menari' walhal lebah hanyalah satu contoh komunikasi haiwan",
        },
        remediationTip: {
          ja: "具体例は主張を証明するためにあるだけです！局所的な事例名だけを挙げ、中心となる一般的な原理が抜けている選択肢は消しましょう。",
          ko: "예시는 주장을 증명하기 위해 있을 뿐이에요! 좁은 사례 이름만 언급하고 핵심 원리를 빠뜨린 선택지는 지우세요.",
          ms: "Contoh hanya menyokong dakwaan! Jika sesuatu pilihan hanya menyebut kes sempit dan meninggalkan prinsip umum, potong pilihan itu!",
        },
      },
    },
  },

  mt_lit_inference_rhetoric: {
    description: {
      ja: "本文に書かれた情報に厳密に基づいて妥当な推論を行い、「すべて」「必ず」「唯一」などの絶対的な言葉へのすり替えによる行き過ぎた推論を見抜きます。",
      ko: "본문에 주어진 정보에 엄격히 근거하여 타당한 추론을 하고, '모든', '반드시', '유일한' 같은 절대적 표현으로 바꿔치기한 지나친 추론을 가려내요.",
      ms: "Buat inferens yang sah berdasarkan bukti teks dan tolak lompatan mutlak yang melampau ('sentiasa', 'hanya', 'sepenuhnya').",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：本文に「毎日ジョギングをすると睡眠の改善に役立つ」とあるとき、「毎日ジョギングさえすれば絶対に不眠にならない」という選択肢は、どの言葉が言い過ぎなのでしょう？",
      ko: "아이에게 물어보세요: 본문에 '매일 조깅하면 수면 개선에 도움이 된다'고 했는데, 선택지가 '매일 조깅만 하면 절대 불면증에 걸리지 않는다'라면 어떤 말이 너무 지나친 걸까요?",
      ms: "Tanya anak: Jika petikan menyatakan 'Berjoging setiap hari membantu memperbaiki tidur', mengapakah pilihan 'Berjoging setiap hari pasti menyembuhkan semua masalah insomnia' merupakan inferens yang tidak sah?",
    },
    masteryCriteria: [
      {
        ja: "本文の「可能性がある／一部／役立つ」を「必ず／すべて／決定的」に書き換えた、行き過ぎた推論のわなを見抜ける",
        ko: "본문의 '~일 수 있다/일부/도움이 된다'를 '반드시/모두/결정적'으로 바꾼 지나친 추론의 함정을 알아챌 수 있어요",
        ms: "Mengesan pembesaran modaliti ('membantu' → 'menjamin', 'sebahagian' → 'semua') dalam pilihan jawapan",
      },
    ],
    intuition: {
      ja: "客観的な推論の鉄則は「根拠がある分だけ言う」こと：範囲の拡大（一部→すべて）、可能性から必然へのすり替え（かもしれない→必ず）、時間的な前後関係から因果関係へのすり替えに注意しましょう！",
      ko: "객관적 추론의 철칙은 '근거만큼만 말하기'예요: 범위 확대(일부→전부), 가능성을 필연으로 바꾸기(~일 수도→반드시), 시간적 선후를 인과로 바꾸기를 조심하세요!",
      ms: "Inferens yang sah tidak sekali-kali membesarkan skop ('sebahagian' → 'semua') atau kepastian ('mungkin' → 'mesti'), dan tidak menukar urutan masa menjadi sebab-akibat, melebihi bukti teks.",
    },
    steps: [
      {
        title: {
          ja: "限定語を一語ずつ見比べる",
          ko: "한정어 꼼꼼히 비교하기",
          ms: "Bandingkan Kata Bilangan & Kata Modal",
        },
        body: {
          ja: "選択肢の数量を表す語（すべて／大部分／一部）と、可能性・必然性を表す語（必ず／たぶん／唯一）を、本文と一語ずつ照らし合わせましょう。",
          ko: "선택지의 수량 표현(모두/대부분/일부)과 양태 표현(반드시/아마/유일한)을 본문과 한 단어씩 대조해 보세요.",
          ms: "Semak kata bilangan (semua/kebanyakan/sebahagian) dan kata modal (mesti/boleh/mungkin) terus dengan ayat asal dalam petikan.",
        },
      },
    ],
    misconceptions: {
      misc_lit_absolutist_leap: {
        label: {
          ja: "可能性を必然に・一部を全体に：選択肢の「唯一」「完全に」「必ず」などの絶対的な限定語を見落とす",
          ko: "가능성을 필연으로·부분을 전체로: 선택지의 '유일한', '완전히', '반드시' 같은 절대적 한정어를 놓쳐요",
          ms: "Menerima generalisasi mutlak yang melampau ('hanya', 'pasti') yang tidak disokong oleh teks",
        },
        wrongPattern: {
          ja: "本文の「重要な要因の一つ」を「唯一の決定要因」と同じだと考えてしまう",
          ko: "본문의 '중요한 요인 중 하나'를 '유일한 결정 요인'과 같다고 여겨요",
          ms: "Menyamakan 'salah satu faktor utama' dengan 'satu-satunya penentu'",
        },
        remediationTip: {
          ja: "学術的な文章や試験の読解では、正しい記述ほど言い過ぎを避けています。「唯一」「決して～ない」「すべて」を見たら赤信号、本文に戻って確かめましょう！",
          ko: "학술적인 글이나 시험 독해에서 정확한 진술일수록 단정을 피해요. '유일한', '결코', '모든'이 보이면 빨간불을 켜고 본문으로 돌아가 확인하세요!",
          ms: "Anggap kata-kata melampau ('satu-satunya', 'sentiasa', 'tidak pernah') sebagai amaran yang memerlukan bukti jelas dalam teks.",
        },
      },
    },
  },

  mt_lit_logical_fallacy: {
    description: {
      ja: "論証の中の「同時に起こる・前後して起こる ≠ 因果関係（アイスクリームの売上と水難事故はどちらも夏の暑さの影響を受ける）」、「生存者バイアス」、「P ならば Q から Q ならば P を導く誤り（逆の誤謬）」を見抜きます。",
      ko: "논증 속에서 '함께 변하거나 앞뒤로 일어남 ≠ 인과 관계(아이스크림 판매량과 물놀이 사고는 모두 여름 더위의 영향을 받음)', '생존자 편향', 'P이면 Q에서 Q이면 P로 잘못 추론하기(역의 오류)'를 찾아내요.",
      ms: "Kenal pasti pemboleh ubah ketiga yang mengelirukan dalam korelasi palsu (jualan aiskrim dan kes lemas sama-sama dipengaruhi cuaca panas), bias kemandirian, dan kesilapan logik mengiakan akibat (jika P maka Q → jika Q maka P).",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：第二次世界大戦で無事に帰還した飛行機を調べると、弾痕の多くは翼にあり、エンジンにはほとんどありませんでした。統計学者エイブラハム・ウォールドは、なぜ翼ではなく弾痕のないエンジンこそ装甲を厚くすべきだと考えたのでしょう？",
      ko: "아이에게 물어보세요: 제2차 세계 대전 때 무사히 돌아온 비행기를 조사해 보니 총알 자국이 대부분 날개에 있고 엔진에는 거의 없었어요. 통계학자 에이브러햄 왈드는 왜 날개가 아니라 총알 자국이 없는 엔진의 장갑을 강화해야 한다고 했을까요?",
      ms: "Tanya anak: Kapal terbang yang pulang semasa Perang Dunia Kedua mempunyai kesan tembakan pada sayap tetapi hampir tiada pada enjin. Mengapakah ahli statistik Abraham Wald mencadangkan supaya enjin, bukan sayap, diperkukuh dengan perisai?",
    },
    masteryCriteria: [
      {
        ja: "相関するデータの背後にある共通の第三の変数（交絡因子）を指摘でき、見かけ上の同時増減にまどわされない",
        ko: "상관관계 데이터 뒤에 숨은 공통의 제3 변수(교란 변수)를 짚어 내고, 겉으로 보이는 동시 증감에 속지 않아요",
        ms: "Mengenal pasti pemboleh ubah pengganggu tersembunyi di sebalik trend yang berkorelasi tanpa terpedaya oleh perubahan serentak yang kelihatan",
      },
    ],
    intuition: {
      ja: "エンジンに被弾した飛行機は、そもそも帰還できずに統計に含まれなかったのです（生存者バイアス）！同じように、冷たい飲み物がよく売れる時期には熱中症も増えますが、冷たい飲み物が熱中症を起こすのではなく、第三の変数「暑さ」が両方を押し上げているのです。",
      ko: "엔진에 맞은 비행기는 아예 돌아오지 못해 통계에 포함되지 않았어요(생존자 편향)! 마찬가지로 여름에 찬 음료가 많이 팔릴 때 열사병도 늘지만, 찬 음료가 열사병을 일으키는 것이 아니라 제3 변수인 '더위'가 둘 다 끌어올리는 거예요.",
      ms: "Kapal terbang yang terkena tembakan pada enjin tidak pulang untuk dikira (bias kemandirian)! Begitu juga, apabila jualan minuman sejuk meningkat, kes strok haba turut meningkat. Bukan minuman sejuk yang menyebabkannya, tetapi pemboleh ubah ketiga, iaitu cuaca panas. Sentiasa tanya: kes atau pemboleh ubah ketiga apakah yang tidak kelihatan?",
    },
    steps: [
      {
        title: {
          ja: "誤謬を見抜く3つの問い",
          ko: "오류를 찾는 세 가지 질문",
          ms: "Audit Kesilapan Logik dengan 3 Soalan",
        },
        body: {
          ja: "① サンプルから、表に出てこない失敗例が抜け落ちていないか？ ② A と B が一緒に変化するのは、共通の背後要因 C のせいではないか？ ③ 十分条件を必要条件と取り違えていないか（P→Q を Q→P にひっくり返していないか）？",
          ko: "① 표본에서 드러나지 않은 실패 사례가 빠지지 않았나요? ② A와 B가 함께 변하는 것이 공통의 숨은 요인 C 때문은 아닌가요? ③ 충분조건을 필요조건으로 착각하지 않았나요(P→Q를 Q→P로 뒤집지 않았나요)?",
          ms: "1. Adakah sampel yang gagal tertinggal? 2. Adakah pemboleh ubah ketiga C mempengaruhi kedua-dua A dan B? 3. Adakah P→Q diterbalikkan menjadi Q→P (syarat cukup disangka syarat perlu)?",
        },
      },
    ],
    misconceptions: {
      misc_lit_spurious_cause: {
        label: {
          ja: "表面的な相関や偏った生存者のサンプルを、そのまま因果関係だと信じ込む",
          ko: "겉으로 보이는 상관관계나 편향된 생존자 표본을 곧바로 인과 관계로 믿어요",
          ms: "Menganggap korelasi statistik atau sampel 'yang terselamat' yang berat sebelah sebagai sebab-akibat langsung",
        },
        wrongPattern: {
          ja: "「家に本が多い子どもは読解の点数が高い」というデータから、「本を部屋いっぱいに買えば、読まなくても点数が上がる」と結論づけてしまう",
          ko: "'집에 책이 많은 아이는 읽기 점수가 높다'는 자료를 보고 '책을 방 가득 사 두기만 하면 읽지 않아도 점수가 오른다'고 결론 내려요",
          ms: "Menganggap membeli buku yang tidak dibaca secara langsung meningkatkan markah, tanpa mengambil kira tabiat membaca keluarga",
        },
        remediationTip: {
          ja: "相関はあくまで手がかりです。背後にある交絡因子（家庭の読書習慣など）を確かめて、はじめて厳密な論証になります。",
          ko: "상관관계는 단서일 뿐이에요. 그 뒤의 교란 변수(예: 가정의 독서 분위기)를 점검해야 엄밀한 논증이 돼요.",
          ms: "Cari mekanisme sebenar atau faktor pengganggu (cth. budaya membaca dalam keluarga) sebelum mendakwa wujudnya sebab-akibat.",
        },
      },
    },
  },

  mt_lit_classical_comparative: {
    description: {
      ja: "文章による説明資料と複数項目の統計表を統合し、基準となる条件や変化率を照らし合わせて、二重の条件を満たす判断を下します。",
      ko: "글로 된 설명 자료와 여러 항목의 통계표를 통합해 기준 조건과 변화율을 교차 확인하고, 이중 조건을 모두 만족하는 결정을 내려요.",
      ms: "Sintesiskan peraturan dalam teks dengan jadual data berbilang lajur untuk mengesahkan dakwaan dan membuat keputusan yang memenuhi pelbagai kekangan.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：「身長 1.2 m 以上かつ 1.5 m 未満は半額」のような文章の規則と料金表を組み合わせるとき、表の数字だけを見て「かつ」や「ただし～を除く」といった注意書きを見落とすと、なぜ間違えやすいのでしょう？",
      ko: "아이에게 물어보세요: '키 1.2 m 이상 그리고 1.5 m 미만은 반값'처럼 글로 된 규칙과 요금표를 함께 볼 때, 표의 숫자만 보고 '그리고'나 '단, ~ 제외' 같은 단서를 놓치면 왜 틀리기 쉬울까요?",
      ms: "Tanya anak: Apabila menggabungkan peraturan bertulis (cth. 'tinggi 1.2 m ke atas DAN kurang daripada 1.5 m mendapat separuh harga') dengan jadual harga, mengapakah kebanyakan kesilapan berlaku kerana terlepas satu nota kaki 'DAN / KECUALI'?",
    },
    masteryCriteria: [
      {
        ja: "文章の条件にある「かつ／または」の二重の基準と表の各行のデータを同時に照合し、条件を一つも見落とさない",
        ko: "글의 조건에 있는 '그리고/또는'의 이중 기준과 표의 각 행 데이터를 동시에 대조해 어떤 조건도 빠뜨리지 않아요",
        ms: "Merujuk silang SEMUA syarat 'dan' dalam teks dengan baris jadual yang tepat tanpa terlepas satu kekangan pun",
      },
    ],
    intuition: {
      ja: "文章は判定の条件を、表は実際の数値を与えてくれます。鍵を鍵穴に合わせるように、すべての条件をチェックリストとして一つずつ確かめましょう！",
      ko: "글은 판단 조건을, 표는 실제 수치를 알려 줘요. 열쇠를 열쇠 구멍에 맞추듯 모든 조건을 체크리스트로 하나씩 확인하세요!",
      ms: "Teks memberikan syarat peraturan; jadual memberikan data sebenar. Nilai setiap syarat seperti senarai semak!",
    },
    steps: [
      {
        title: {
          ja: "文章の条件をチェックリストにする",
          ko: "글의 조건을 체크리스트로 만들기",
          ms: "Jadikan Peraturan Teks Senarai Semak",
        },
        body: {
          ja: "規則：補助金を受けるには ① グリーン電力の割合 ≥ 60% かつ ② 単位当たりのエネルギー消費量 ≤ 45 の両方を満たす必要があります。表を1行ずつ見て、どちらか一つでも基準を満たさない案を除外します。",
          ko: "규칙: 보조금을 받으려면 ① 친환경 전력 비율 ≥ 60% 그리고 ② 단위당 에너지 소비량 ≤ 45를 모두 만족해야 해요. 표를 한 줄씩 보며 하나라도 기준에 못 미치는 안을 제외하세요.",
          ms: "Peraturan: subsidi hanya diberi jika memenuhi ① peratus tenaga hijau ≥ 60% DAN ② penggunaan tenaga per unit ≤ 45. Tapis calon dalam jadual baris demi baris dan singkirkan mana-mana yang gagal satu syarat.",
        },
      },
    ],
    misconceptions: {
      misc_lit_single_criterion: {
        label: {
          ja: "一方に気を取られてもう一方を見落とす：表で目立つ一つ目の指標だけを確認し、文章にある二つ目の追加条件を見落とす",
          ko: "하나만 보고 다른 하나를 놓침: 표에서 눈에 띄는 첫 번째 지표만 확인하고 글에 있는 두 번째 추가 조건을 빠뜨려요",
          ms: "Menyemak hanya lajur pertama yang menonjol dalam jadual sambil mengabaikan kekangan kedua dalam teks",
        },
        wrongPattern: {
          ja: "グリーン電力の割合が最も高いという理由だけで選び、エネルギー消費量が基準を超えていて二つ目の条件に違反していることを見落とす",
          ko: "친환경 전력 비율이 가장 높다는 이유만으로 선택하고, 에너지 소비량이 기준을 넘어 두 번째 조건을 어긴 것을 놓쳐요",
          ms: "Memilih skor tertinggi dalam Lajur A walaupun Lajur B melanggar had yang ditetapkan",
        },
        remediationTip: {
          ja: "文章の条件すべてに ①②③ と番号をふり、表の各行の横にチェックを入れましょう。全部にチェックがついたものだけが合格です！",
          ko: "글에 있는 모든 조건에 ①②③ 번호를 붙이고, 표의 각 행 옆에 체크하세요. 모두 체크된 것만 통과예요!",
          ms: "Nomborkan setiap syarat peraturan ①②③ dan semak kesemuanya bagi setiap baris; hanya yang lulus semua syarat boleh dipilih!",
        },
      },
    },
  },
};
