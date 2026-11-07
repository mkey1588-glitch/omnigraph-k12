import type { TopicContentOverlay } from "./overlay";

/**
 * Native ja / ko / ms teaching content for the topics in src/data/canonical-topics-math.ts.
 * Keyed by topic id. See ./overlay.ts for the shape.
 */
export const TOPIC_CONTENT_I18N_MATH: TopicContentOverlay = {
  mt_math_place_value_ops: {
    description: {
      ja: "多けたの数の各位が表す大きさ（十進位取り記数法）を理解し、たし算とひき算、かけ算とわり算が逆の関係にあることや、あまりのあるわり算の関係式を使えるようにします。",
      ko: "여러 자리 수에서 각 자리의 숫자가 나타내는 값(십진법 자릿값)을 이해하고, 덧셈과 뺄셈, 곱셈과 나눗셈의 역관계와 나머지가 있는 나눗셈의 관계식을 활용해요.",
      ms: "Memahami nilai tempat setiap digit dalam nombor berbilang digit (asas 10) dan menggunakan hubungan songsang antara tambah dengan tolak serta darab dengan bahagi, termasuk hubungan bahagi yang ada baki.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：クッキーを 6 人の子どもに 7 まいずつ配ると 4 まいあまりました。はじめに何まいあったかをいちばん早く求めるにはどうすればよいですか？ あまりが 6 まいになることはありますか？",
      ko: "아이에게 물어보세요: 과자를 6명에게 7개씩 나누어 주었더니 4개가 남았어요. 처음에 과자가 몇 개였는지 가장 빨리 구하는 방법은? 나머지가 6개일 수도 있을까요?",
      ms: "Tanya anak anda: Biskut dibahagikan kepada 6 orang kanak-kanak, setiap orang dapat 7 keping dan berbaki 4 keping. Bagaimanakah cara paling cepat untuk mengira bilangan asal biskut? Bolehkah bakinya 6?",
    },
    masteryCriteria: [
      {
        ja: "「わられる数 = 商 × わる数 + あまり（あまり < わる数）」を使って、わり算の答えを確かめられる",
        ko: "‘나누어지는 수 = 몫 × 나누는 수 + 나머지 (나머지 < 나누는 수)’를 이용해 나눗셈을 검산할 수 있어요",
        ms: "Menyemak jawapan bahagi menggunakan Nombor yang dibahagi = Hasil bahagi × Pembahagi + Baki (Baki < Pembahagi)",
      },
      {
        ja: "かっこのある式や四則の混じった式で、かけ算・わり算を先に計算するきまりを正しく使える",
        ko: "괄호가 있는 혼합 계산에서 곱셈과 나눗셈을 덧셈과 뺄셈보다 먼저 계산하는 규칙을 정확히 적용할 수 있어요",
        ms: "Mengaplikasikan tertib operasi dengan tepat termasuk tanda kurung (darab dan bahagi dahulu sebelum tambah dan tolak)",
      },
    ],
    intuition: {
      ja: "わり算はただの九九ではなく、「同じ数ずつ分けて、残りを数える」ことの逆です。あまりでもう 1 組つくれるなら、商を 1 ふやさなければなりません。",
      ko: "나눗셈은 외우는 구구단이 아니라 ‘똑같이 묶어 나누고 남은 것을 세는’ 과정을 거꾸로 하는 거예요. 나머지로 한 묶음을 더 만들 수 있다면 몫을 1 늘려야 해요.",
      ms: "Bahagi ialah songsangan bagi pengumpulan sama banyak; jika baki masih cukup untuk membentuk satu kumpulan lagi, hasil bahagi mesti bertambah 1.",
    },
    steps: [
      {
        title: {
          ja: "ステップ1：全体と同じ大きさのまとまりを見る",
          ko: "1단계: 전체와 똑같은 묶음 살펴보기",
          ms: "Langkah 1: Keseluruhan vs. Bahagian Sama Besar",
        },
        body: {
          ja: "全体を 1 本のテープと考えます。1 つ分の長さがわる数 d で、それが q 個並び、最後にはみ出した部分が r です。",
          ko: "전체를 하나의 긴 막대로 생각해요. 한 칸의 길이가 나누는 수 d이고, 그런 칸이 q개 있으며, 끝에 남는 부분이 r이에요.",
          ms: "Modelkan jumlah sebagai satu bar yang terdiri daripada q bahagian sama panjang bersaiz d, ditambah satu baki r di hujungnya.",
        },
        checkQuestion: {
          ja: "ある数を 5 でわると、商が 8 であまりが 3 になります。ある数を求めましょう。",
          ko: "어떤 수를 5로 나누었더니 몫이 8, 나머지가 3이에요. 어떤 수는 얼마일까요?",
          ms: "Suatu nombor dibahagi dengan 5 memberikan hasil bahagi 8 dan baki 3. Apakah nombor itu?",
        },
      },
    ],
    misconceptions: {
      misc_order_left_to_right: {
        label: {
          ja: "計算の順序を無視して、左から順に計算してしまう",
          ko: "계산 순서를 무시하고 무조건 왼쪽부터 계산하기",
          ms: "Mengabaikan tertib operasi (mengira dari kiri ke kanan sahaja)",
        },
        wrongPattern: {
          ja: "12 + 8 × 3 を (12 + 8) × 3 = 60 と計算する",
          ko: "12 + 8 × 3을 (12 + 8) × 3 = 60으로 계산함",
          ms: "Mengira 12 + 8 × 3 sebagai (12 + 8) × 3 = 60",
        },
        remediationTip: {
          ja: "かけ算は「同じ数のまとまり」です。先に 8 × 3 のまとまりを計算してから、ばらの 12 をたしましょう。",
          ko: "곱셈은 ‘같은 수의 묶음’이에요. 8 × 3 묶음을 먼저 계산한 뒤 낱개 12를 더해요.",
          ms: "Pendaraban menghimpunkan kumpulan; kira 8 × 3 dahulu, kemudian barulah tambah 12.",
        },
      },
    },
  },

  mt_math_frac_concept_equiv: {
    description: {
      ja: "分母と分子に同じ数（0 以外）をかけても、同じ数でわっても分数の大きさは変わらないことを理解し、最大公約数を使って約分し、最小公倍数を使って通分します。",
      ko: "분모와 분자에 0이 아닌 같은 수를 곱하거나 나누어도 분수의 크기가 같다는 것을 이해하고, 최대공약수로 약분하고 최소공배수로 통분해요.",
      ms: "Menjana pecahan setara, memudahkan pecahan kepada sebutan terendah menggunakan FSTB, dan mencari penyebut sepunya menggunakan GSTK.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：2/3 と 4/6 では切り分けたケーキの数がちがうのに、食べる量が同じなのはなぜですか？",
      ko: "아이에게 물어보세요: 2/3와 4/6은 자른 케이크 조각 수가 다른데, 왜 먹는 양은 똑같을까요?",
      ms: "Tanya anak anda: 2/3 dan 4/6 mempunyai bilangan potongan yang berbeza — mengapakah jumlah kek yang diperoleh tetap sama?",
    },
    masteryCriteria: [
      {
        ja: "2 つの数の最大公約数を求めて、分数を既約分数（これ以上約分できない分数）にできる",
        ko: "두 수의 최대공약수를 구해 분수를 기약분수로 나타낼 수 있어요",
        ms: "Memudahkan pecahan kepada sebutan terendah menggunakan FSTB",
      },
      {
        ja: "最小公倍数を使って分母のちがう分数を通分し、大きさを比べられる",
        ko: "최소공배수를 이용해 분모가 다른 분수를 통분하고 크기를 비교할 수 있어요",
        ms: "Menukar pecahan tak sama penyebut kepada penyebut sepunya terkecil menggunakan GSTK dan membandingkannya",
      },
    ],
    intuition: {
      ja: "通分とは「目もりをそろえる」ことです。1 つ分を k 倍細かく切れば、とる個数も k 倍になるので、全体の量はまったく変わりません。",
      ko: "통분은 ‘눈금을 똑같이 맞추는’ 일이에요. 한 조각을 k배로 잘게 자르면 가지는 조각 수도 k배가 되므로 전체 양은 전혀 변하지 않아요.",
      ms: "Mencari penyebut sepunya bermakna memilih pembaris yang lebih halus supaya kedua-dua pecahan menggunakan saiz unit yang sama — setiap bahagian dipotong k kali lebih kecil, bilangan bahagian turut didarab k, maka jumlahnya tidak berubah.",
    },
    steps: [
      {
        title: {
          ja: "いちばん小さい共通の目もりを見つける",
          ko: "가장 작은 공통 눈금 찾기",
          ms: "Cari Grid Sepunya Terkecil",
        },
        body: {
          ja: "3/4 と 5/6 を比べるときは、4 と 6 の最小公倍数 12 を使って 9/12 と 10/12 に直すと、ひと目でわかります。",
          ko: "3/4와 5/6을 비교할 때는 4와 6의 최소공배수 12를 이용해 9/12와 10/12로 고치면 한눈에 알 수 있어요.",
          ms: "Untuk 3/4 dan 5/6, gunakan GSTK(4, 6) = 12 untuk menulis semula sebagai 9/12 dan 10/12.",
        },
        checkQuestion: {
          ja: "12/18 を約分して既約分数にしましょう。",
          ko: "12/18을 기약분수로 나타내세요.",
          ms: "Permudahkan 12/18 kepada sebutan terendah.",
        },
      },
    ],
    misconceptions: {
      misc_frac_add_const: {
        label: {
          ja: "分母と分子に同じ数をたしても分数の大きさは変わらないと思いこむ",
          ko: "분모와 분자에 같은 수를 더해도 분수의 크기가 같다고 생각하기",
          ms: "Menambah nombor yang sama kepada pengangka dan penyebut",
        },
        wrongPattern: {
          ja: "2/3 = (2+2)/(3+2) = 4/5 と考える",
          ko: "2/3 = (2+2)/(3+2) = 4/5라고 생각함",
          ms: "Menganggap 2/3 sama dengan (2+2)/(3+2) = 4/5",
        },
        remediationTip: {
          ja: "分数の性質は「同じ数をかける・わる」ときに成り立ち、たす・ひくでは成り立ちません！ 1/2 の分母と分子に 1 ずつたすと 2/3 になり、明らかに大きくなっています。",
          ko: "분수의 성질은 같은 수를 ‘곱하거나 나눌’ 때만 성립하고, 더하거나 빼면 성립하지 않아요! 1/2의 분모와 분자에 1씩 더하면 2/3가 되어 분명히 커져요.",
          ms: "Kesetaraan berlaku melalui darab atau bahagi, bukan tambah atau tolak! Tambah 1 kepada pengangka dan penyebut 1/2 menjadi 2/3, yang jelas lebih besar: 1/2 ≠ 2/3.",
        },
      },
    },
  },

  mt_math_frac_add_sub: {
    description: {
      ja: "分母のちがう分数は通分して同じ分母にしてからたしたりひいたりし、答えは約分して簡単な分数にします。テープ図を使って分数の文章題も解きます。",
      ko: "분모가 다른 분수는 통분하여 분모를 같게 만든 뒤 더하거나 빼고, 결과는 기약분수로 나타내요. 띠 모형을 이용해 분수 문장제도 해결해요.",
      ms: "Menambah dan menolak pecahan tak sama penyebut melalui penyebut sepunya terkecil, dan menyelesaikan masalah berayat pelbagai langkah menggunakan model bar.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：1/2 + 1/3 が 2/5 にならないのはなぜですか？（1/2 だけですでに半分なのに、2/5 は半分より小さいですね！）",
      ko: "아이에게 물어보세요: 1/2 + 1/3은 왜 2/5가 될 수 없을까요? (1/2만으로도 이미 절반인데, 2/5는 절반보다 작아요!)",
      ms: "Tanya anak anda: Mengapakah 1/2 + 1/3 tidak boleh sama dengan 2/5? (Petunjuk: 1/2 sudah separuh, sedangkan 2/5 kurang daripada separuh!)",
    },
    masteryCriteria: [
      {
        ja: "分母のちがう分数のたし算・ひき算では必ず先に通分し、「分子どうし・分母どうしをたす」まちがいをしない",
        ko: "분모가 다른 분수의 덧셈·뺄셈에서는 반드시 먼저 통분하고, ‘분자끼리, 분모끼리 더하는’ 실수를 하지 않아요",
        ms: "Menukar kepada penyebut sepunya terlebih dahulu tanpa menambah penyebut secara terus",
      },
      {
        ja: "計算の答えを約分して、もっとも簡単な形で表せる",
        ko: "계산 결과를 약분하여 가장 간단한 형태로 나타낼 수 있어요",
        ms: "Menyatakan hasil tambah atau beza dalam bentuk termudah",
      },
    ],
    intuition: {
      ja: "りんご 1 個とすいか 1 個をたして「りんごすいか 2 個」とは言えません。1/2 と 1/3 は単位分数の大きさがちがうので、どちらも同じ大きさの 1/6 に切り分けてから数えます。",
      ko: "사과 1개와 수박 1개를 더해서 ‘사과수박 2개’라고 할 수는 없어요. 1/2과 1/3은 단위분수의 크기가 다르므로, 둘 다 같은 크기인 1/6로 잘라야 합쳐서 셀 수 있어요.",
      ms: "1 biji epal tambah 1 biji tembikai tidak menjadi '2 biji epal-tembikai'. Separuh dan pertiga tidak boleh ditambah sehingga kedua-duanya dipotong menjadi perenam — saiz unit yang sama.",
    },
    steps: [
      {
        title: {
          ja: "通分して単位をそろえてから、分子をたしひきする",
          ko: "통분으로 단위를 맞춘 뒤 분자끼리 계산하기",
          ms: "Samakan Penyebut, Kemudian Gabungkan Pengangka",
        },
        body: {
          ja: "1/2 + 1/3 は、まず 3/6 + 2/6 に直して 5/6 になります。分母 6 は 1 つ分の大きさを表すので、そのまま変えません。",
          ko: "1/2 + 1/3은 먼저 3/6 + 2/6으로 고쳐서 5/6이 돼요. 분모 6은 한 조각의 크기를 나타내므로 그대로 둬요.",
          ms: "1/2 + 1/3 = 3/6 + 2/6 = 5/6; setelah disamakan, penyebut 6 mewakili saiz unit dan tidak berubah.",
        },
        checkQuestion: {
          ja: "1/3 + 1/4 を計算しましょう（a/b の形で答えましょう）。",
          ko: "1/3 + 1/4를 계산하세요. (a/b 꼴로 답하세요)",
          ms: "Hitung 1/3 + 1/4 (dalam bentuk a/b).",
        },
      },
    ],
    misconceptions: {
      misc_frac_add_denom: {
        label: {
          ja: "分子どうし・分母どうしをそのままたしてしまう（a/b + c/d = (a+c)/(b+d)）",
          ko: "분자끼리, 분모끼리 그대로 더하기 (a/b + c/d = (a+c)/(b+d))",
          ms: "Menambah pengangka dengan pengangka dan penyebut dengan penyebut secara terus (a/b + c/d = (a+c)/(b+d))",
        },
        wrongPattern: {
          ja: "1/3 + 1/4 を 2/7 と計算する",
          ko: "1/3 + 1/4를 2/7로 계산함",
          ms: "Mengira 1/3 + 1/4 sebagai 2/7",
        },
        remediationTip: {
          ja: "数の感覚で確かめましょう：2/7 は 1/3 より小さい！ 正の数をたして小さくなるはずがありません。必ず先に通分して、十二分のいくつかに直しましょう。",
          ko: "수 감각으로 확인해 봐요: 2/7은 1/3보다 작아요! 양수를 더했는데 더 작아질 수는 없어요. 반드시 먼저 통분해서 12분의 몇으로 바꿔요.",
          ms: "Semak kewajaran: 2/7 lebih kecil daripada 1/3! Menambah nombor positif tidak mungkin menjadikannya lebih kecil. Sentiasa cari penyebut sepunya (perdua belas) terlebih dahulu.",
        },
      },
    },
  },

  mt_math_frac_mul_div: {
    description: {
      ja: "分数をかけることを「何倍か」を表す意味としてとらえ、「0 でない数でわることは、その逆数をかけることと同じ」を理解して、先に約分してから計算します。",
      ko: "분수의 곱셈을 ‘몇 배’의 의미로 이해하고, ‘0이 아닌 수로 나누는 것은 그 수의 역수를 곱하는 것과 같다’는 것을 알고 약분을 먼저 한 뒤 계산해요.",
      ms: "Mentafsir pendaraban pecahan sebagai penskalaan dan membahagi pecahan dengan mendarab salingan pembahagi, serta memansuhkan faktor sepunya sebelum mengira.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：2 L のジュースを 1/4 L ずつコップに入れると、1/4 でわったのに答えが小さくならず、8 ぱいと大きくなるのはなぜですか？",
      ko: "아이에게 물어보세요: 주스 2 L를 1/4 L씩 컵에 따르면, 1/4로 나누었는데 왜 답이 작아지지 않고 8컵으로 커질까요?",
      ms: "Tanya anak anda: Jika 2 liter jus dituang ke dalam cawan 1/4 liter, mengapakah membahagi dengan 1/4 menjadikan jawapan lebih besar (8 cawan)?",
    },
    masteryCriteria: [
      {
        ja: "分数や整数の逆数を正しく書け、分数のわり算ではわる数だけを逆数にし、わられる数はひっくり返さない",
        ko: "분수나 자연수의 역수를 정확히 쓰고, 분수의 나눗셈에서는 나누는 수만 역수로 바꾸고 나누어지는 수는 바꾸지 않아요",
        ms: "Menyongsangkan pembahagi sahaja (bukan nombor yang dibahagi) semasa membahagi pecahan",
      },
      {
        ja: "「ある量の何分のいくつかを求める（かけ算）」と「何分のいくつかにあたる量からもとの量を求める（わり算）」を区別できる",
        ko: "‘어떤 양의 몇 분의 몇 구하기(곱셈)’와 ‘몇 분의 몇에 해당하는 양으로 전체 구하기(나눗셈)’를 구별할 수 있어요",
        ms: "Membezakan antara mencari pecahan daripada suatu kuantiti (darab) dengan mencari keseluruhan daripada bahagian pecahan (bahagi)",
      },
    ],
    intuition: {
      ja: "1/b でわるとは「1/b がいくつ入っているか」を考えることです。1 の中には 1/b が b 個入っているので、答えは必ず b 倍になります！",
      ko: "1/b로 나누는 것은 ‘1/b가 몇 개 들어 있는지’ 묻는 거예요. 1 안에는 1/b가 b개 들어 있으니, 답은 반드시 b배가 돼요!",
      ms: "Membahagi dengan 1/b bertanya berapa banyak bahagian 1/b yang muat di dalamnya; oleh sebab b bahagian muat dalam setiap 1, anda mendarab dengan b.",
    },
    steps: [
      {
        title: {
          ja: "わられる数はそのまま、÷ を × に、わる数を逆数に",
          ko: "나누어지는 수는 그대로, ÷를 ×로, 나누는 수는 역수로",
          ms: "Kekal – Tukar – Songsang (Pembahagi Sahaja)",
        },
        body: {
          ja: "(3/4) ÷ (9/8) = (3/4) × (8/9) で、たすきがけに約分すると 2/3 になります。",
          ko: "(3/4) ÷ (9/8) = (3/4) × (8/9)이고, 대각선으로 약분하면 2/3이 돼요.",
          ms: "(3/4) ÷ (9/8) = (3/4) × (8/9) = 2/3 selepas pemansuhan silang.",
        },
        checkQuestion: {
          ja: "(2/3) ÷ (4/9) を計算し、もっとも簡単な形で答えましょう。",
          ko: "(2/3) ÷ (4/9)를 계산하여 가장 간단한 형태로 나타내세요.",
          ms: "Hitung (2/3) ÷ (4/9) dalam bentuk termudah.",
        },
      },
    ],
    misconceptions: {
      misc_flip_dividend: {
        label: {
          ja: "わられる数を逆数にしてしまう、または逆数にせずそのままかけてしまう",
          ko: "나누어지는 수를 역수로 바꾸거나, 역수로 바꾸지 않고 그대로 곱하기",
          ms: "Menyongsangkan nombor yang dibahagi dan bukannya pembahagi, atau terus mendarab tanpa menyongsangkan",
        },
        wrongPattern: {
          ja: "(2/3) ÷ (4/9) を、4/9 を逆数にせずに (2/3) × (4/9) = 8/27 と計算する",
          ko: "(2/3) ÷ (4/9)를 4/9를 역수로 바꾸지 않고 (2/3) × (4/9) = 8/27로 계산함",
          ms: "Mengira (2/3) ÷ (4/9) sebagai 8/27 tanpa menyongsangkan 4/9",
        },
        remediationTip: {
          ja: "逆数にするのは「÷ の後ろのわる数」だけ！ わられる数は分けられる全体の量なので、そのままにします。",
          ko: "역수로 바꾸는 것은 ‘÷ 뒤에 있는 나누는 수’뿐이에요! 나누어지는 수는 나눌 전체의 양이므로 그대로 둬요.",
          ms: "Songsangkan pembahagi sahaja (nombor yang MEMBAHAGI)! Nombor yang dibahagi ialah jumlah keseluruhan dan kekal di tempatnya.",
        },
      },
    },
  },

  mt_math_ratio_percent: {
    description: {
      ja: "比例式では外側の項の積と内側の項の積が等しい（ad = bc）ことを使って比例式を解き、比例配分や割引、百分率の増減の問題を解きます。",
      ko: "비례식에서 외항의 곱과 내항의 곱이 같다는 성질을 이용해 비례식을 풀고, 비례배분, 할인, 백분율의 증가와 감소 문제를 해결해요.",
      ms: "Menyelesaikan kadaran melalui pendaraban silang, membahagikan kuantiti mengikut nisbah, dan mengira peratus kenaikan dan penurunan.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：服の値段が 20% 上がったあと 2 割引き（20% 値下げ）になると、もとの値段にもどりますか？ それはなぜでしょうか？",
      ko: "아이에게 물어보세요: 옷값이 20% 오른 뒤 다시 20% 할인되면 원래 가격으로 돌아올까요? 왜 그럴까요?",
      ms: "Tanya anak anda: Jika harga jaket naik 20% kemudian turun 20%, adakah harganya kembali kepada harga asal? Mengapa tidak?",
    },
    masteryCriteria: [
      {
        ja: "増加率・減少率を求めるとき、変化する前の「もとにする量」を分母にできる",
        ko: "증가율·감소율을 구할 때 변하기 전의 기준량을 분모로 정확히 사용해요",
        ms: "Menggunakan kuantiti asal (sebelum perubahan) sebagai penyebut dalam peratus perubahan",
      },
      {
        ja: "a : b = c : d ⇔ ad = bc を使って比例式を解ける",
        ko: "a : b = c : d ⇔ ad = bc를 이용해 비례식을 풀 수 있어요",
        ms: "Mengaplikasikan pendaraban silang ad = bc untuk menyelesaikan kadaran",
      },
    ],
    intuition: {
      ja: "百分率は必ず「もとにする量（1）」とセットです。100 の 20% 増しは 120、その 120 から 20% 減らすと 24 減って 96 になります！",
      ko: "백분율은 항상 ‘기준량(1)’과 짝을 이뤄요. 100에서 20% 오르면 120이 되고, 그 120에서 20% 내리면 24가 줄어 96이 돼요!",
      ms: "Setiap peratus bertindak ke atas asas tertentu: +20% daripada 100 memberikan 120, kemudian -20% daripada 120 menolak 24 dan tinggal 96!",
    },
    steps: [
      {
        title: {
          ja: "もとにする量をはっきりさせる",
          ko: "기준량을 확실히 정하기",
          ms: "Berpaut pada Nilai Asal",
        },
        body: {
          ja: "80 から 100 に増えると増加率は (100-80)/80 = 25%、100 から 80 にもどると減少率は (100-80)/100 = 20% です。",
          ko: "80에서 100으로 늘면 증가율은 (100-80)/80 = 25%이고, 100에서 80으로 줄면 감소율은 (100-80)/100 = 20%예요.",
          ms: "Daripada 80 kepada 100 ialah +25% (20/80), manakala daripada 100 turun kepada 80 ialah -20% (20/100).",
        },
        checkQuestion: {
          ja: "もとの値段が 80 円の品物が 100 円になりました。何 % 上がりましたか（数だけ答えましょう）。",
          ko: "원래 80원이던 물건이 지금 100원이 되었어요. 몇 % 올랐나요? (숫자만 쓰세요)",
          ms: "Harga naik daripada 80 kepada 100. Berapakah peratus kenaikan? (nombor sahaja)",
        },
      },
    ],
    misconceptions: {
      misc_percent_wrong_base: {
        label: {
          ja: "増加率を求めるとき、変化したあとの新しい値を分母にしてしまう",
          ko: "증가율을 구할 때 변한 뒤의 새 값을 분모로 사용하기",
          ms: "Membahagi dengan nilai baharu dan bukannya nilai asal dalam peratus perubahan",
        },
        wrongPattern: {
          ja: "80 から 100 に上がったのに (100-80)/100 = 20% と計算する（正しくは 20/80 = 25%）",
          ko: "80에서 100으로 올랐는데 (100-80)/100 = 20%로 계산함 (바르게는 20/80 = 25%)",
          ms: "Mengira (100-80)/100 = 20% dan bukannya 20/80 = 25%",
        },
        remediationTip: {
          ja: "変化の割合は必ず「出発点（もとの値 Old）」でわります。到着点（新しい値 New）でわってはいけません！",
          ko: "변화율은 항상 ‘출발점(원래 값 Old)’으로 나눠요. 도착점(새 값 New)으로 나누면 안 돼요!",
          ms: "Sentiasa bahagikan perubahan dengan nilai permulaan (Old), bukan nilai akhir (New).",
        },
      },
    },
  },

  mt_math_geometry_area_perim: {
    description: {
      ja: "1 次元のまわりの長さ（周の長さ）と 2 次元の広さ（面積）を区別し、切ったりつなげたりして形を変えることで、平行四辺形・三角形・台形の面積の公式を導きます。",
      ko: "1차원인 둘레의 길이와 2차원인 넓이를 구별하고, 도형을 자르고 붙여 바꾸는 방법으로 평행사변형, 삼각형, 사다리꼴의 넓이 공식을 이끌어 내요.",
      ms: "Membezakan perimeter dengan luas dan menerbitkan rumus luas bagi segi empat selari, segi tiga dan trapezium melalui kaedah potong dan cantum.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：長方形の木のわくをおして、かたむいた平行四辺形にすると、4 本の木の長さの合計（周の長さ）は変わりませんが、中の面積は変わりますか？",
      ko: "아이에게 물어보세요: 직사각형 나무틀을 밀어서 비스듬한 평행사변형으로 만들면, 네 막대 길이의 합(둘레)은 그대로인데 안쪽 넓이는 변할까요?",
      ms: "Tanya anak anda: Jika bingkai kayu segi empat tepat ditolak menjadi segi empat selari yang condong, perimeternya kekal sama — adakah luasnya berubah?",
    },
    masteryCriteria: [
      {
        ja: "三角形や平行四辺形の面積を求めるとき、必ず垂直に交わる「底辺と高さ」の組を選べる",
        ko: "삼각형과 평행사변형의 넓이를 구할 때 서로 수직인 ‘밑변과 높이’ 한 쌍을 정확히 골라요",
        ms: "Memasangkan tapak dengan tinggi yang berserenjang dengannya sahaja",
      },
      {
        ja: "三角形と台形の面積を求めるとき、「÷ 2」を忘れない",
        ko: "삼각형과 사다리꼴의 넓이를 구할 때 ‘÷ 2’를 빠뜨리지 않아요",
        ms: "Mengingati faktor 1/2 semasa mengira luas segi tiga dan trapezium",
      },
    ],
    intuition: {
      ja: "合同な三角形を 2 つ組み合わせると、底辺と高さが等しい平行四辺形がいつもできます。だから三角形の面積は ÷ 2 をするのです。木のわくをかたむけると高さが低くなるので、面積も小さくなります。",
      ko: "똑같은 삼각형 두 개를 붙이면 언제나 밑변과 높이가 같은 평행사변형이 돼요. 그래서 삼각형의 넓이는 ÷ 2를 해요. 나무틀을 비스듬히 밀면 높이가 낮아지므로 넓이도 줄어들어요.",
      ms: "Dua segi tiga yang sama membentuk sebuah segi empat selari dengan tapak dan tinggi serenjang yang sama — itulah sebabnya kita ÷2. Apabila bingkai dicondongkan, tingginya berkurang dan luasnya turut mengecil.",
    },
    steps: [
      {
        title: {
          ja: "直角の記号を見て、底辺に対応する高さを見つける",
          ko: "직각 표시를 보고 밑변에 대응하는 높이 찾기",
          ms: "Padankan Tapak dengan Tinggi Serenjang",
        },
        body: {
          ja: "ななめの辺の長さは周の長さには関係しますが、面積を決めるのは垂直な高さ h です。ななめの辺を高さとしてかけてはいけません。",
          ko: "비스듬한 변의 길이는 둘레에 영향을 주지만, 넓이를 정하는 것은 수직인 높이 h예요. 비스듬한 변을 높이 대신 곱하면 안 돼요.",
          ms: "Sisi condong dikira dalam perimeter, tetapi bukan sebagai tinggi; luas ditentukan oleh tinggi serenjang h. Cari tanda sudut tegak.",
        },
        checkQuestion: {
          ja: "底辺が 10 cm、高さが 6 cm の三角形の面積は何 cm² ですか。",
          ko: "밑변이 10 cm, 높이가 6 cm인 삼각형의 넓이는 몇 cm²인가요?",
          ms: "Cari luas (cm²) segi tiga dengan tapak 10 cm dan tinggi serenjang 6 cm.",
        },
      },
    ],
    misconceptions: {
      misc_triangle_forget_half: {
        label: {
          ja: "三角形や台形の面積で ÷ 2 を忘れる、またはとなりの辺を高さとしてかける",
          ko: "삼각형이나 사다리꼴의 넓이에서 ÷ 2를 빠뜨리거나, 옆변을 높이로 착각해 곱하기",
          ms: "Terlupa membahagi dengan 2 bagi segi tiga/trapezium, atau mendarab dengan sisi condong",
        },
        wrongPattern: {
          ja: "底辺 10、高さ 6 の三角形の面積を 10 × 6 = 60 と計算する（正しくは 30）",
          ko: "밑변 10, 높이 6인 삼각형의 넓이를 10 × 6 = 60으로 계산함 (바르게는 30)",
          ms: "Mengira luas segi tiga sebagai 10 × 6 = 60 dan bukannya 30",
        },
        remediationTip: {
          ja: "10 × 6 は三角形を囲む長方形（平行四辺形）の面積です。三角形はそのちょうど半分です！",
          ko: "10 × 6은 삼각형을 둘러싼 직사각형(평행사변형)의 넓이예요. 삼각형은 그 절반이에요!",
          ms: "b × h ialah luas segi empat selari yang melingkunginya; segi tiga ialah tepat separuh daripadanya.",
        },
      },
    },
  },

  mt_math_signed_numbers: {
    description: {
      ja: "数直線を使って反対の数と絶対値を理解し、正負の数の四則計算をすらすら行い、(-a)² と -a² をはっきり区別します。",
      ko: "수직선을 이용해 부호가 반대인 수와 절댓값을 이해하고, 양수와 음수의 사칙계산을 능숙하게 하며, (-a)²과 -a²을 정확히 구별해요.",
      ms: "Mengendalikan operasi nombor nisbah positif dan negatif dengan lancar pada garis nombor, memahami nilai mutlak, dan membezakan (-a)^2 daripada -a^2.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：気温が -5°C から +3°C になると、何度上がりましたか？ また、-3² と (-3)² の符号は同じですか？",
      ko: "아이에게 물어보세요: 기온이 -5°C에서 +3°C로 바뀌면 몇 도 올랐나요? 또 -3²과 (-3)²의 부호는 같을까요?",
      ms: "Tanya anak anda: Berapa darjah suhu meningkat daripada -5°C kepada +3°C? Selain itu, adakah -3² dan (-3)² mempunyai tanda yang sama?",
    },
    masteryCriteria: [
      {
        ja: "「負の数をひくことは、その反対の数をたすことと同じ」と「負 × 負 = 正」を使える",
        ko: "‘음수를 빼는 것은 부호를 바꾸어 더하는 것과 같다’와 ‘(음수) × (음수) = (양수)’를 적용할 수 있어요",
        ms: "Mengaplikasikan a - (-b) = a + b dan petua tanda bagi darab dan bahagi (negatif × negatif = positif)",
      },
      {
        ja: "(-3)² = 9（底は -3）と -3² = -9（底は 3）のちがいを正しく区別できる",
        ko: "(-3)² = 9 (밑이 -3)와 -3² = -9 (밑이 3)의 차이를 정확히 구별해요",
        ms: "Membezakan (-3)^2 = 9 (asasnya -3) daripada -3^2 = -9 (asasnya 3)",
      },
    ],
    intuition: {
      ja: "指数 2 は、すぐ左にあるひとまとまりにだけかかります。かっこがある (-3)² は負の符号ごと 2 乗して +9、かっこがない -3² は先に 3² を計算してから負の符号をつけて -9 です！",
      ko: "지수 2는 바로 왼쪽에 붙어 있는 덩어리에만 작용해요. 괄호가 있는 (-3)²은 음의 부호까지 함께 제곱해서 +9, 괄호가 없는 -3²은 3²을 먼저 계산한 뒤 음의 부호를 붙여서 -9예요!",
      ms: "Eksponen hanya terikat pada apa yang berada betul-betul di sebelah kirinya: dengan tanda kurung, (-3)² merangkumi tanda negatif dan memberi +9; tanpa tanda kurung, -3² dikuasaduakan dahulu kemudian dinegatifkan menjadi -9!",
    },
    steps: [
      {
        title: {
          ja: "かっこを見て累乗の底を決める",
          ko: "괄호를 보고 거듭제곱의 밑 정하기",
          ms: "Semak Tanda Kurung untuk Mengenal Pasti Asas",
        },
        body: {
          ja: "-2² + (-3)×(-4) を計算します。まず -2² = -4、次に (-3)×(-4) = +12、たして 8 です。",
          ko: "-2² + (-3)×(-4)를 계산해요. 먼저 -2² = -4, 다음으로 (-3)×(-4) = +12, 더하면 8이에요.",
          ms: "-2² + (-3)×(-4): kira -2² = -4 dahulu, kemudian (-3)×(-4) = +12, jumlahnya 8.",
        },
        checkQuestion: {
          ja: "-3² + (-2)² を計算しましょう。",
          ko: "-3² + (-2)²을 계산하세요.",
          ms: "Nilaikan -3² + (-2)².",
        },
      },
    ],
    misconceptions: {
      misc_neg_square_sign: {
        label: {
          ja: "-a² と (-a)² を混同し、-3² を +9 と計算してしまう",
          ko: "-a²과 (-a)²을 혼동하여 -3²을 +9로 계산하기",
          ms: "Mengelirukan -a^2 dengan (-a)^2 dan menilai -3^2 sebagai +9",
        },
        wrongPattern: {
          ja: "-3² + 4 を 9 + 4 = 13 と計算する",
          ko: "-3² + 4를 9 + 4 = 13으로 계산함",
          ms: "Menilai -3^2 + 4 sebagai 9 + 4 = 13",
        },
        remediationTip: {
          ja: "負の符号がかっこでくくられていなければ、累乗が先です：-3² = -(3 × 3) = -9 になります！",
          ko: "음의 부호가 괄호로 묶여 있지 않으면 거듭제곱을 먼저 계산해요: -3² = -(3 × 3) = -9!",
          ms: "Kuasa dikira sebelum penegatifan kecuali tanda kurung merangkumi tanda negatif: -3^2 = -(3·3) = -9.",
        },
      },
    },
  },

  mt_math_alg_expressions: {
    description: {
      ja: "同類項を見分け、分配法則を使ってかっこをはずし（特にかっこの前が - のときは、かっこの中のすべての項の符号が変わる）、式を簡単にして式の値を求めます。",
      ko: "동류항을 찾고 분배법칙으로 괄호를 풀어(특히 괄호 앞이 -일 때는 괄호 안 모든 항의 부호가 바뀌어요) 식을 간단히 하고 식의 값을 구해요.",
      ms: "Memudahkan ungkapan algebra dengan mengembangkan pendarab negatif merentasi tanda kurung dan menggabungkan sebutan serupa.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：5x - (2x - 3) を簡単にすると、最後は +3 ですか、-3 ですか？「3 点の減点を取り消す」のは 3 点たすことですか、それともひくことですか？",
      ko: "아이에게 물어보세요: 5x - (2x - 3)을 간단히 하면 마지막은 +3일까요, -3일까요? ‘감점 3점을 취소하는 것’은 3점을 더하는 걸까요, 빼는 걸까요?",
      ms: "Tanya anak anda: Apabila memudahkan 5x - (2x - 3), adakah hasilnya berakhir dengan +3 atau -3? Fikirkan: membatalkan penalti 3 mata itu menambah atau menolak 3?",
    },
    masteryCriteria: [
      {
        ja: "かっこの前の係数が負のとき（例：-2(3x - 4)）、2 つ目の項の符号も正しく変えて -6x + 8 にできる",
        ko: "괄호 앞의 계수가 음수일 때(예: -2(3x - 4)) 둘째 항의 부호도 정확히 바꾸어 -6x + 8로 만들 수 있어요",
        ms: "Menukar tanda SEMUA sebutan dalam tanda kurung apabila mengembangkan faktor negatif (cth. -2(3x - 4) = -6x + 8)",
      },
      {
        ja: "文字も次数もまったく同じ同類項だけをまとめられる",
        ko: "문자와 차수가 모두 같은 동류항끼리만 모아서 계산해요",
        ms: "Menggabungkan hanya sebutan serupa yang mempunyai pemboleh ubah dan eksponen yang sama",
      },
    ],
    intuition: {
      ja: "かっこの前の - は「中身全体の符号を反対にする」という意味です。「3 円の支出（-3）」をひくことは、3 円ふえる（+3）ことと同じです。いちばん多いミスは、2 つ目の項の符号の変え忘れです！",
      ko: "괄호 앞의 -는 ‘괄호 안 전체의 부호를 바꾼다’는 뜻이에요. ‘지출 3원(-3)’을 빼는 것은 3원이 늘어나는(+3) 것과 같아요. 가장 흔한 실수는 둘째 항의 부호를 바꾸지 않는 거예요!",
      ms: "Tanda tolak di hadapan tanda kurung menukar tanda SETIAP sebutan di dalamnya — menolak hutang 3 bermakna menambah +3. Kesilapan paling biasa ialah lupa menukar tanda sebutan kedua!",
    },
    steps: [
      {
        title: {
          ja: "符号をふくめた係数を、すべての項にかける",
          ko: "부호를 포함한 계수를 모든 항에 곱하기",
          ms: "Kembangkan Faktor Bertanda kepada Setiap Sebutan",
        },
        body: {
          ja: "4x - 2(x - 5) を簡単にします。-2 を x と -5 にそれぞれかけて、4x - 2x + 10 = 2x + 10 になります。",
          ko: "4x - 2(x - 5)를 간단히 해요. -2를 x와 -5에 각각 곱하면 4x - 2x + 10 = 2x + 10이 돼요.",
          ms: "4x - 2(x - 5) = 4x + (-2)(x) + (-2)(-5) = 2x + 10.",
        },
        checkQuestion: {
          ja: "x = 2 のとき、式 5x - 2(x - 3) の値を求めましょう。",
          ko: "x = 2일 때, 식 5x - 2(x - 3)의 값을 구하세요.",
          ms: "Nilaikan 5x - 2(x - 3) apabila x = 2.",
        },
      },
    ],
    misconceptions: {
      misc_dist_neg_sign: {
        label: {
          ja: "- のついたかっこをはずすとき、かっこの中の 2 つ目の項の符号を変え忘れる",
          ko: "앞에 -가 있는 괄호를 풀 때 괄호 안 둘째 항의 부호를 바꾸지 않기",
          ms: "Gagal menukar tanda sebutan kedua semasa membuka tanda kurung bertanda negatif",
        },
        wrongPattern: {
          ja: "5x - 2(x - 3) を 5x - 2x - 6 と展開する",
          ko: "5x - 2(x - 3)을 5x - 2x - 6으로 전개함",
          ms: "Mengembangkan 5x - 2(x - 3) sebagai 5x - 2x - 6",
        },
        remediationTip: {
          ja: "- を係数にくっつけて (-2) と考え、(-2) × (-3) = +6 とします。すべての項に矢印をかいて符号を確かめましょう！",
          ko: "-를 계수에 붙여 (-2)로 보고 (-2) × (-3) = +6으로 계산해요. 모든 항에 화살표를 그려 부호를 확인해요!",
          ms: "Anggap pendarab sebagai (-2) dan lukis anak panah ke SETIAP sebutan: (-2)·(-3) = +6.",
        },
      },
    },
  },

  mt_math_linear_eq_one: {
    description: {
      ja: "等式の性質にもとづいて、分母をはらう・かっこをはずす・移項する（符号を変える）・x の係数で両辺をわる という手順で方程式を解き、方程式をつくって身近な問題を解きます。",
      ko: "등식의 성질을 바탕으로 분모 없애기, 괄호 풀기, 이항(부호 바꾸기), 계수로 나누기의 순서로 방정식을 풀고, 방정식을 세워 실생활 문제를 해결해요.",
      ms: "Menyelesaikan persamaan linear pelbagai langkah dengan pekali pecahan melalui penghapusan penyebut, membuka tanda kurung, memindahkan sebutan (tukar tanda) dan mengimbangkan kedua-dua belah persamaan.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：(x+1)/2 - 1 = 3 を解くとき、両辺に 2 をかけて分母をはらいますが、まん中の「-1」にも 2 をかけますか？",
      ko: "아이에게 물어보세요: (x+1)/2 - 1 = 3을 풀 때 양변에 2를 곱해 분모를 없애는데, 가운데의 ‘-1’에도 2를 곱해야 할까요?",
      ms: "Tanya anak anda: Apabila mendarab kedua-dua belah (x+1)/2 - 1 = 3 dengan 2 untuk menghapuskan pecahan, adakah '-1' juga perlu didarab dengan 2?",
    },
    masteryCriteria: [
      {
        ja: "両辺に分母の公倍数をかけて分母をはらうとき、分母のない整数の項にもかけ忘れない",
        ko: "양변에 분모의 최소공배수를 곱해 분모를 없앨 때 분모가 없는 정수항에도 빠짐없이 곱해요",
        ms: "Mendarab SETIAP sebutan (termasuk sebutan integer) dengan GSTK semasa menghapuskan penyebut",
      },
      {
        ja: "移項するときは符号を変え、分子が多項式のときは分母をはらうときにかっこをつけて守る",
        ko: "이항할 때는 부호를 바꾸고, 분자가 다항식이면 분모를 없앨 때 괄호로 묶어요",
        ms: "Menukar tanda apabila memindahkan sebutan merentasi tanda sama dengan, dan membungkus pengangka polinomial dengan tanda kurung semasa menghapuskan garis pecahan",
      },
    ],
    intuition: {
      ja: "等式はてんびんのようなものです。左の皿に 2 つの物がのっているとき、左側全体を 2 倍にするなら、それぞれの物をすべて 2 倍にしないと、てんびんはかたむいてしまいます！",
      ko: "등식은 양팔 저울과 같아요. 왼쪽 접시에 물건이 두 개 있을 때 왼쪽 전체를 2배로 하려면, 물건 하나하나를 모두 2배로 해야 저울이 기울지 않아요!",
      ms: "Persamaan ialah sebuah neraca: menggandakan satu belah memerlukan SETIAP benda di atas piring itu digandakan, barulah neraca tidak senget!",
    },
    steps: [
      {
        title: {
          ja: "分母をはらう 2 つの鉄則：整数の項にもかける・分子の多項式にかっこをつける",
          ko: "분모를 없앨 때의 두 가지 철칙: 정수항에도 곱하기, 분자 다항식은 괄호로 묶기",
          ms: "Dua Peraturan Utama Menghapuskan Penyebut",
        },
        body: {
          ja: "(2x+1)/3 - 1 = x/2 を解きます。両辺に 6 をかけて 2(2x+1) - 6 = 3x ⇒ 4x + 2 - 6 = 3x ⇒ x = 4 です。",
          ko: "(2x+1)/3 - 1 = x/2를 풀어요. 양변에 6을 곱하면 2(2x+1) - 6 = 3x ⇒ 4x + 2 - 6 = 3x ⇒ x = 4예요.",
          ms: "Darab setiap sebutan (2x+1)/3 - 1 = x/2 dengan 6: 2(2x+1) - 6 = 3x ⇒ 4x + 2 - 6 = 3x ⇒ x = 4.",
        },
        checkQuestion: {
          ja: "方程式 (x + 2)/3 - 1 = 2 を解き、x の値を求めましょう。",
          ko: "방정식 (x + 2)/3 - 1 = 2를 풀어 x의 값을 구하세요.",
          ms: "Selesaikan (x + 2)/3 - 1 = 2 untuk x.",
        },
      },
    ],
    misconceptions: {
      misc_eq_skip_const_lcd: {
        label: {
          ja: "分母をはらうとき、分母のない定数項にかけ忘れる",
          ko: "분모를 없앨 때 분모가 없는 상수항에 곱하는 것을 빠뜨리기",
          ms: "Terlupa mendarab sebutan integer yang berdiri sendiri dengan GSTK",
        },
        wrongPattern: {
          ja: "(x+2)/3 - 1 = 2 の両辺に 3 をかけて x + 2 - 1 = 6 と書く（-1 に 3 をかけ忘れている。正しくは x + 2 - 3 = 6）",
          ko: "(x+2)/3 - 1 = 2의 양변에 3을 곱해 x + 2 - 1 = 6으로 씀 (-1에 3을 곱하지 않음, 바르게는 x + 2 - 3 = 6)",
          ms: "Menulis x + 2 - 1 = 6 dan bukannya x + 2 - 3 = 6",
        },
        remediationTip: {
          ja: "計算を始める前に、方程式のひとつひとつの項（定数項もふくむ）を丸で囲み、どの丸にも公倍数をかけたか確かめましょう！",
          ko: "계산을 시작하기 전에 방정식의 각 항(상수항 포함)에 동그라미를 치고, 모든 동그라미에 최소공배수를 곱했는지 확인해요!",
          ms: "Bulatkan setiap sebutan secara berasingan sebelum mendarab dengan GSTK supaya pemalar yang berdiri sendiri tidak tertinggal.",
        },
      },
    },
  },

  mt_math_linear_systems: {
    description: {
      ja: "「文字を消去して、1 つの文字の方程式にする」という考え方をつかみ、加減法や代入法で連立方程式を解き、つるかめ算や速さの問題などを方程式で表して解きます。",
      ko: "‘미지수를 없애 하나로 줄이는’ 핵심 아이디어를 이해하고, 가감법이나 대입법으로 연립일차방정식을 풀며, 개수·속력 등의 활용 문제를 식으로 세워 해결해요.",
      ms: "Menghapuskan pemboleh ubah secara sistematik melalui kaedah penggantian atau penghapusan untuk menyelesaikan sistem 2×2, serta memodelkan masalah sebenar.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：ミルクティー 2 杯とケーキ 1 個で 32 ドル、ミルクティー 2 杯とケーキ 3 個で 56 ドルです。方程式を使わずに、ケーキ 2 個分の値段をひと目で見つけるには？（それが加減法です！）",
      ko: "아이에게 물어보세요: 밀크티 2잔과 케이크 1개는 32달러, 밀크티 2잔과 케이크 3개는 56달러예요. 방정식을 세우지 않고 케이크 2개의 값을 한눈에 알아내려면? (이것이 바로 가감법이에요!)",
      ms: "Tanya anak anda: 2 cawan teh dan 1 kek berharga RM32, manakala 2 cawan teh dan 3 kek berharga RM56. Bagaimanakah anda dapat mengenal pasti harga 2 kek dengan serta-merta? (Itulah kaedah penghapusan!)",
    },
    masteryCriteria: [
      {
        ja: "2 つの式をひいて文字を消去するとき、ひく式の各項の符号を正しく変えられる",
        ko: "두 식을 빼서 미지수를 없앨 때 빼는 식의 각 항의 부호를 정확히 바꿔요",
        ms: "Menolak persamaan dengan teliti tanpa kesilapan tanda pada sebutan negatif",
      },
      {
        ja: "2 つの文字の値を求めたら、もとの 2 つの式の両方に代入して確かめられる",
        ko: "두 미지수의 값을 구한 뒤 처음 두 방정식 모두에 대입하여 확인해요",
        ms: "Mengesahkan penyelesaian dalam KEDUA-DUA persamaan asal",
      },
    ],
    intuition: {
      ja: "2 枚のレシートを比べて差額を見つけることが、加減法の直感的なもとになっています。同じ部分は打ち消し合い、残った差額は 1 つの未知数だけから生まれます。",
      ko: "두 장의 영수증을 비교해 차액을 찾는 것이 가감법의 직관적인 원리예요. 같은 부분은 서로 없어지고, 남은 차액은 미지수 하나만으로 생겨요.",
      ms: "Membandingkan dua resit dengan bilangan teh yang sama akan memansuhkan teh dan mengasingkan harga kek — itulah kaedah penghapusan.",
    },
    steps: [
      {
        title: {
          ja: "同符号ならひく、異符号ならたす",
          ko: "부호가 같으면 빼고, 다르면 더하기",
          ms: "Tanda Sama Tolak, Tanda Berlawanan Tambah",
        },
        body: {
          ja: "係数をそろえたあと、y の係数が +2y と -2y のように符号だけちがうなら、2 つの式をそのままたすのがいちばんまちがえにくい方法です！",
          ko: "계수를 맞춘 뒤 y의 계수가 +2y와 -2y처럼 부호만 다르면, 두 식을 그대로 더하는 것이 가장 실수가 적어요!",
          ms: "Apabila pekali mempunyai tanda berlawanan (+2y dan -2y), tambahkan persamaan secara terus untuk mengelakkan perangkap tanda semasa menolak.",
        },
        checkQuestion: {
          ja: "連立方程式 x + y = 7, x - y = 3 を解き、x の値を求めましょう。",
          ko: "연립방정식 x + y = 7, x - y = 3을 풀어 x의 값을 구하세요.",
          ms: "Selesaikan x + y = 7 dan x - y = 3. Berapakah nilai x?",
        },
      },
    ],
    misconceptions: {
      misc_sys_sub_sign: {
        label: {
          ja: "2 つの式をひいて消去するとき、ひく式の負の項の符号を変え忘れる",
          ko: "두 식을 빼서 소거할 때 빼는 식의 음수 항 부호를 바꾸지 않기",
          ms: "Kesilapan tanda apabila menolak persamaan yang mengandungi sebutan negatif",
        },
        wrongPattern: {
          ja: "(2x + y = 8) から (2x - 3y = 0) をひいて、4y = 8 ではなく -2y = 8 としてしまう",
          ko: "(2x + y = 8)에서 (2x - 3y = 0)을 빼서 4y = 8이 아니라 -2y = 8로 계산함",
          ms: "Mengira y - (-3y) sebagai -2y dan bukannya +4y",
        },
        remediationTip: {
          ja: "ひき算は符号のミスが起こりやすいので、2 つ目の式の両辺に -1 をかけてから「たす」のがおすすめです！",
          ko: "빼기는 부호 실수가 잦으니, 둘째 식의 양변에 -1을 곱한 뒤 ‘더하는’ 방법을 추천해요!",
          ms: "Darab persamaan kedua dengan -1 dahulu, kemudian TAMBAH — lebih selamat daripada menolak secara mental!",
        },
      },
    },
  },

  mt_math_coord_linear_func: {
    description: {
      ja: "式と直線を結びつけます。傾き k = Δy/Δx は一定の変化の割合（増え方・減り方）を表し、b は直線が y 軸と交わる点（切片）を表すことを理解します。",
      ko: "식과 직선을 연결해요. 기울기 k = Δy/Δx는 일정한 변화율(증가·감소)을 나타내고, b는 직선이 y축과 만나는 점(y절편)을 나타낸다는 것을 이해해요.",
      ms: "Menghubungkan persamaan dengan garis lurus: mentafsir kecerunan k = Δy/Δx sebagai kadar perubahan malar dan b sebagai pintasan-y.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：タクシーの初乗りが 10 ドルで、1 km ごとに 3 ドル（y = 3x + 10）のとき、グラフの出発点の高さと傾きぐあいは、それぞれどの数で決まりますか？",
      ko: "아이에게 물어보세요: 택시 기본요금이 10달러이고 1 km마다 3달러씩(y = 3x + 10) 올라간다면, 그래프의 출발 높이와 기울어진 정도는 각각 어떤 수가 정할까요?",
      ms: "Tanya anak anda: Teksi mengenakan tambang asas RM10 dan RM3 sekilometer (y = 3x + 10). Nombor manakah yang menentukan ketinggian permulaan dan nombor manakah yang menentukan kecuraman?",
    },
    masteryCriteria: [
      {
        ja: "2 点の座標から傾き k = (y₂ - y₁)/(x₂ - x₁) を、分母と分子を逆にせずに正しく求められる",
        ko: "두 점의 좌표로 기울기 k = (y₂ - y₁)/(x₂ - x₁)를 분모와 분자를 뒤바꾸지 않고 정확히 구해요",
        ms: "Mengira kecerunan dengan tepat sebagai Δy / Δx (jarak mencancang ÷ jarak mengufuk)",
      },
      {
        ja: "k と b の正負から、直線が通る象限や、y が増加するか減少するかをすぐに判断できる",
        ko: "k와 b의 부호로 직선이 지나는 사분면과 함수의 증가·감소를 바로 판단해요",
        ms: "Menentukan sukuan yang dilalui garis dan sama ada fungsi menokok atau menyusut berdasarkan tanda k dan b",
      },
    ],
    intuition: {
      ja: "傾き k は「右へ 1 進むと、高さがどれだけ変わるか（Δy/Δx）」です。k > 0 なら上り坂、k < 0 なら下り坂、b は x = 0 のときのはじめの高さです。",
      ko: "기울기 k는 ‘오른쪽으로 1칸 갈 때 높이가 얼마나 변하는지(Δy/Δx)’예요. k > 0이면 오르막, k < 0이면 내리막이고, b는 x = 0일 때의 처음 높이예요.",
      ms: "Kecerunan k ialah kenaikan mencancang bagi setiap satu langkah mengufuk (Δy/Δx); k > 0 mendaki, k < 0 menurun, dan b ialah titik garis menyilang paksi-y apabila x = 0.",
    },
    steps: [
      {
        title: {
          ja: "縦の変化 Δy が分子、横の変化 Δx が分母",
          ko: "세로 변화 Δy는 분자, 가로 변화 Δx는 분모",
          ms: "Perubahan Mencancang Dibahagi Perubahan Mengufuk",
        },
        body: {
          ja: "2 点 (1, 3) と (3, 7) を通る直線では、k = (7 - 3)/(3 - 1) = 2 です。これを代入すると 3 = 2(1) + b ⇒ b = 1 になります。",
          ko: "두 점 (1, 3)과 (3, 7)을 지나는 직선은 k = (7 - 3)/(3 - 1) = 2이고, 대입하면 3 = 2(1) + b ⇒ b = 1이에요.",
          ms: "Melalui (1, 3) dan (3, 7): k = (7 - 3)/(3 - 1) = 2, maka b = 3 - 2(1) = 1.",
        },
        checkQuestion: {
          ja: "2 点 (0, 2) と (2, 8) を通る一次関数の傾き k を求めましょう。",
          ko: "두 점 (0, 2)와 (2, 8)을 지나는 일차함수의 기울기 k를 구하세요.",
          ms: "Cari kecerunan k bagi garis lurus yang melalui (0, 2) dan (2, 8).",
        },
      },
    ],
    misconceptions: {
      misc_slope_run_over_rise: {
        label: {
          ja: "傾きを Δy / Δx ではなく Δx / Δy と逆に計算してしまう",
          ko: "기울기를 Δy / Δx가 아니라 Δx / Δy로 거꾸로 계산하기",
          ms: "Menyongsangkan kecerunan sebagai Δx / Δy dan bukannya Δy / Δx",
        },
        wrongPattern: {
          ja: "(0,2) と (2,8) を通る直線の傾きを (2-0)/(8-2) = 1/3 と計算する（正しくは 3）",
          ko: "(0,2)와 (2,8)을 지나는 직선의 기울기를 (2-0)/(8-2) = 1/3로 계산함 (바르게는 3)",
          ms: "Mengira kecerunan sebagai (2-0)/(8-2) = 1/3 dan bukannya 3",
        },
        remediationTip: {
          ja: "坂の急さは「上がった高さ ÷ 進んだ横の長さ」で決まります。Δy はいつも分子です！",
          ko: "경사가 가파른지는 ‘올라간 높이 ÷ 나아간 가로 거리’로 정해져요. Δy는 항상 분자예요!",
          ms: "Kecuraman ialah jarak mencancang dibahagi jarak mengufuk: Δy sentiasa di atas!",
        },
      },
    },
  },

  mt_math_special_products_factor: {
    description: {
      ja: "式の展開と因数分解を自在に行き来できるようにします。(a±b)² = a²±2ab+b²、a²-b² = (a+b)(a-b) を使って展開したり逆に因数分解したりし、x² + bx + c の形の二次式も因数分解します。",
      ko: "다항식의 곱셈과 인수분해를 자유롭게 오가요. (a±b)² = a²±2ab+b², a²-b² = (a+b)(a-b)를 이용해 전개하고 거꾸로 인수분해하며, x² + bx + c 꼴의 이차식도 인수분해해요.",
      ms: "Menguasai kembangan dan pemfaktoran dua hala bagi (a±b)², a²-b², dan trinomial kuadratik x² + bx + c.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：1 辺が (a + b) の大きな正方形には、小さな正方形 a² と b² のほかに、すみにどんな長方形が 2 つありますか？（(a+b)² が a²+b² にならないのはなぜでしょうか？）",
      ko: "아이에게 물어보세요: 한 변이 (a + b)인 큰 정사각형에는 작은 정사각형 a²과 b² 말고도 모서리에 어떤 직사각형 두 개가 더 있을까요? ((a+b)²이 a²+b²이 아닌 이유는?)",
      ms: "Tanya anak anda: Sebuah segi empat sama bersisi (a+b) mengandungi segi empat sama a² dan b² — apakah dua segi empat tepat yang mengisi ruang selebihnya sehingga (a+b)² ≠ a² + b²?",
    },
    masteryCriteria: [
      {
        ja: "(a ± b)² を展開するとき、まん中の項 ±2ab を絶対に書き忘れない",
        ko: "(a ± b)²을 전개할 때 가운데 항 ±2ab를 절대 빠뜨리지 않아요",
        ms: "Tidak sekali-kali meninggalkan sebutan tengah ±2ab semasa mengembangkan (a ± b)²",
      },
      {
        ja: "x² + bx に定数項 (b/2)² を加えて、すばやく完全平方式をつくれる",
        ko: "x² + bx에 상수항 (b/2)²을 더해 빠르게 완전제곱식을 만들 수 있어요",
        ms: "Melengkapkan x² + bx menjadi trinomial kuasa dua sempurna dengan menambah (b/2)²",
      },
    ],
    intuition: {
      ja: "面積図を見れば、いちばん多い思いこみはすぐに解消します。1 辺が (a+b) の正方形は、a²、b²、そして縦 a・横 b の長方形 2 つの 4 つに分かれます。まん中の項 2ab は決して消えません！",
      ko: "넓이 그림을 보면 가장 흔한 오해가 바로 풀려요. 한 변이 (a+b)인 정사각형은 a², b², 그리고 가로 a, 세로 b인 직사각형 두 개, 이렇게 네 부분으로 나뉘어요. 가운데 항 2ab는 절대 사라지지 않아요!",
      ms: "Sebuah segi empat sama (a+b)×(a+b) terbahagi kepada empat kawasan: a², b², dan DUA segi empat tepat a×b — menjadikan 2ab mustahil dilupakan.",
    },
    steps: [
      {
        title: {
          ja: "はじめの 2 乗、終わりの 2 乗、まん中は積の 2 倍",
          ko: "앞의 제곱, 뒤의 제곱, 가운데는 두 수의 곱의 2배",
          ms: "Kuasa Dua Pertama, Kuasa Dua Akhir, Dua Kali Hasil Darab di Tengah",
        },
        body: {
          ja: "(x - 5)² = x² - 2·x·5 + 25 = x² - 10x + 25 です。逆に x² - 10x + k を完全平方式にするには、k = (-10/2)² = 25 とします。",
          ko: "(x - 5)² = x² - 2·x·5 + 25 = x² - 10x + 25예요. 거꾸로 x² - 10x + k가 완전제곱식이 되려면 k = (-10/2)² = 25예요.",
          ms: "(x - 5)² = x² - 2·x·5 + 25 = x² - 10x + 25; untuk menjadikan x² - 10x + k kuasa dua sempurna, k = (-10/2)² = 25.",
        },
        checkQuestion: {
          ja: "x² + 8x + k が完全平方式になるとき、定数 k の値を求めましょう。",
          ko: "x² + 8x + k가 완전제곱식일 때, 상수 k의 값을 구하세요.",
          ms: "Jika x² + 8x + k ialah trinomial kuasa dua sempurna, apakah nilai k?",
        },
      },
    ],
    misconceptions: {
      misc_freshman_dream: {
        label: {
          ja: "まん中の項 2ab を忘れて、(a + b)² を a² + b² としてしまう",
          ko: "가운데 항 2ab를 빠뜨려 (a + b)²을 a² + b²으로 쓰기",
          ms: "Meninggalkan sebutan tengah 2ab (menganggap (a+b)² = a² + b²)",
        },
        wrongPattern: {
          ja: "(x + 3)² を x² + 9 と展開し、+6x を書き忘れる",
          ko: "(x + 3)²을 x² + 9로 전개하여 +6x를 빠뜨림",
          ms: "Mengembangkan (x + 3)² sebagai x² + 9 tanpa +6x",
        },
        remediationTip: {
          ja: "数を代入して確かめましょう：(2+3)² = 25 ですが、2²+3² = 13 です。足りない 12 がちょうど 2×2×3 です！",
          ko: "수를 넣어 확인해 봐요: (2+3)² = 25인데 2²+3² = 13이에요. 모자란 12가 바로 2×2×3이에요!",
          ms: "Uji dengan nombor: (2+3)² = 25, manakala 2²+3² = 13. Selisih 12 itu ialah 2·2·3!",
        },
      },
    },
  },

  mt_math_rational_eq: {
    description: {
      ja: "分母に文字をふくむ式（物理の I = U/R、1/R = 1/R₁ + 1/R₂ など）を変形し、分数方程式を解いて、分母が 0 になる不適な解（無縁解）を必ず除きます。",
      ko: "분모에 문자가 있는 식(물리의 I = U/R, 1/R = 1/R₁ + 1/R₂ 등)을 변형하고, 분수방정식을 풀어 분모가 0이 되지 않는지 반드시 확인해요(무연근 제외).",
      ms: "Memanipulasi rumus algebra dengan pemboleh ubah pada penyebut (cth. I = U/R, 1/R = 1/R₁ + 1/R₂) dan menyelesaikan persamaan pecahan sambil menyemak punca luar (penyebut tidak boleh sifar).",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：分数方程式を解いて x = 2 が出たとき、すぐに答えにせず、もとの方程式の分母が x - 2 でないかを確かめるのはなぜでしょうか？",
      ko: "아이에게 물어보세요: 분수방정식을 풀어 x = 2가 나왔을 때, 왜 바로 답으로 쓰지 않고 원래 방정식의 분모가 x - 2인지 다시 확인해야 할까요?",
      ms: "Tanya anak anda: Selepas menyelesaikan persamaan pecahan dan mendapat x = 2, mengapakah anda perlu menyemak sama ada (x - 2) terdapat pada penyebut persamaan asal?",
    },
    masteryCriteria: [
      {
        ja: "I = U/R を R = U/I と変形したり、1/f = 1/u + 1/v を通分して f を求めたりと、物理や図形の公式を自在に変形できる",
        ko: "I = U/R를 R = U/I로 바꾸거나 1/f = 1/u + 1/v를 통분해 f를 구하는 등, 물리·도형 공식을 자유롭게 변형할 수 있어요",
        ms: "Mengubah perkara rumus pecahan seperti R = U/I dan rintangan selari 1/R = 1/R₁ + 1/R₂",
      },
      {
        ja: "分数方程式を解いたら、必ず分母に代入して確かめ、分母を 0 にする不適な解（無縁解）を除ける",
        ko: "분수방정식을 푼 뒤에는 반드시 분모에 대입해 확인하고, 분모를 0으로 만드는 무연근은 버려요",
        ms: "Menyemak penyelesaian calon terhadap penyebut sifar untuk menolak punca luar",
      },
    ],
    intuition: {
      ja: "両辺に (x - 2) をかけて分母をはらうとき、もし x = 2 なら両辺に 0 をかけたことになります（0 をかければ何でも等しくなります）。こうして、もとの分母を 0 にしてしまう「不適な解（無縁解）」が生まれてしまうのです！",
      ko: "양변에 (x - 2)를 곱해 분모를 없앨 때 만약 x = 2라면 양변에 0을 곱한 셈이에요(0을 곱하면 무엇이든 같아져요). 그래서 원래 분모를 0으로 만드는 ‘가짜 해(무연근)’가 생겨나요!",
      ms: "Mendarab dengan (x - 2) tidak sah jika x = 2 kerana mendarab dengan sifar memusnahkan kesetaraan (apa-apa sahaja didarab sifar menjadi sama) dan mewujudkan punca luar.",
    },
    steps: [
      {
        title: {
          ja: "① 分母をはらう → ② 解く → ③ 分母 ≠ 0 を確かめる",
          ko: "① 분모 없애기 → ② 풀기 → ③ 분모 ≠ 0 확인하기",
          ms: "Hapuskan Penyebut → Selesaikan → Semak Penyebut ≠ 0",
        },
        body: {
          ja: "この計算は、物理のオームの法則 R = U/I や、並列抵抗の公式を支える数学の土台にもなっています。",
          ko: "이 계산 방법은 물리의 옴의 법칙 R = U/I와 병렬 저항 공식을 떠받치는 수학적 바탕이기도 해요.",
          ms: "Kemahiran ini menjadi asas langsung kepada hukum Ohm R = U/I serta persamaan kanta dan perintang selari dalam Fizik.",
        },
        checkQuestion: {
          ja: "分数方程式 12 / (x + 1) = 3 を解き、x の値を求めましょう。",
          ko: "분수방정식 12 / (x + 1) = 3을 풀어 x의 값을 구하세요.",
          ms: "Selesaikan 12 / (x + 1) = 3 untuk x.",
        },
      },
    ],
    misconceptions: {
      misc_rational_invert_sum: {
        label: {
          ja: "1/R = 1/R₁ + 1/R₂ の各項をそのまま逆数にして R = R₁ + R₂ としてしまう",
          ko: "1/R = 1/R₁ + 1/R₂의 각 항을 그대로 역수로 바꿔 R = R₁ + R₂로 쓰기",
          ms: "Menyongsangkan sebutan demi sebutan: menukar 1/R = 1/a + 1/b menjadi R = a + b",
        },
        wrongPattern: {
          ja: "1/R = 1/3 + 1/6 を R = 3 + 6 = 9 と計算する（正しくは R = 2）",
          ko: "1/R = 1/3 + 1/6을 R = 3 + 6 = 9로 계산함 (바르게는 R = 2)",
          ms: "Menyelesaikan 1/R = 1/3 + 1/6 sebagai R = 9 dan bukannya R = 2",
        },
        remediationTip: {
          ja: "まず右辺を通分して 1 つの分数 (R₁+R₂)/(R₁R₂) にまとめ、そのあとで全体を逆数にして R = R₁R₂/(R₁+R₂) とします！ 例：1/3 + 1/6 = 3/6 = 1/2 ⇒ R = 2 です。",
          ko: "먼저 우변을 통분해 하나의 분수 (R₁+R₂)/(R₁R₂)로 합친 다음, 마지막에 전체를 역수로 바꿔 R = R₁R₂/(R₁+R₂)를 얻어요! 예: 1/3 + 1/6 = 3/6 = 1/2 ⇒ R = 2",
          ms: "Gabungkan sebelah kanan menjadi satu pecahan TERLEBIH DAHULU: 1/3 + 1/6 = 3/6 = 1/2 ⇒ R = 2! Secara umum, R = R₁R₂/(R₁+R₂).",
        },
      },
    },
  },

  mt_math_radicals_pythagoras: {
    description: {
      ja: "平方根の意味を理解して根号をふくむ数を簡単にし、三平方の定理を使って直角三角形の辺の長さや、座標平面上の 2 点間の距離を求めます。",
      ko: "제곱근의 뜻을 이해하고 근호를 포함한 수를 간단히 하며, 피타고라스 정리를 이용해 직각삼각형의 변의 길이와 좌표평면 위 두 점 사이의 거리를 구해요.",
      ms: "Memudahkan punca kuasa dua dan mengaplikasikan a² + b² = c² dalam segi tiga bersudut tegak serta masalah jarak pada satah Cartes.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：分度器がなくても、大工さんがロープで 3 m・4 m・5 m をはかってぴんと張るだけで、正確な直角のかどがつくれるのはなぜでしょうか？",
      ko: "아이에게 물어보세요: 각도기가 없어도 목수가 밧줄로 3 m, 4 m, 5 m를 재서 팽팽하게 당기기만 하면 정확한 직각 모서리를 만들 수 있는 이유는 무엇일까요?",
      ms: "Tanya anak anda: Tanpa protraktor, mengapakah tukang kayu mengukur tali sepanjang 3 m, 4 m dan 5 m untuk memastikan sudut 90° yang tepat?",
    },
    masteryCriteria: [
      {
        ja: "直角の向かいにあるいちばん長い辺を斜辺 c と見分け、ほかの辺を求めるときはたすのではなく c² - a² を使える",
        ko: "직각과 마주 보는 가장 긴 변을 빗변 c로 찾고, 다른 변을 구할 때는 더하지 않고 c² - a²을 이용해요",
        ms: "Mengenal pasti hipotenus (bertentangan dengan sudut 90°); tolak kuasa dua apabila mencari sisi lain",
      },
      {
        ja: "正の平方根 √9 = 3 と、方程式 x² = 9 の 2 つの解 x = ±3 を区別できる",
        ko: "양의 제곱근 √9 = 3과 방정식 x² = 9의 두 해 x = ±3을 구별해요",
        ms: "Membezakan punca kuasa dua prinsipal √9 = 3 daripada dua penyelesaian x = ±3 bagi x² = 9",
      },
    ],
    intuition: {
      ja: "三平方の定理は、どんな 3 辺でも 2 乗してたせばよいというものではありません。「直角をはさむ 2 辺の上の正方形の面積の和が、斜辺の上の大きな正方形の面積にちょうど等しい」ということです。",
      ko: "피타고라스 정리는 아무 세 변이나 제곱해서 더하는 것이 아니에요. ‘직각을 낀 두 변 위의 정사각형 넓이의 합이 빗변 위의 큰 정사각형 넓이와 정확히 같다’는 뜻이에요.",
      ms: "Teorem Pythagoras bukan sekadar menambah kuasa dua mana-mana sisi: jumlah luas segi empat sama pada dua sisi yang berserenjang adalah tepat sama dengan luas segi empat sama pada hipotenus.",
    },
    steps: [
      {
        title: {
          ja: "まず 90° の向かいの斜辺 c を見つけ、たすかひくかを決める",
          ko: "먼저 90°와 마주 보는 빗변 c를 찾고, 더할지 뺄지 정하기",
          ms: "Kenal Pasti Hipotenus Dahulu",
        },
        body: {
          ja: "よく出る 3 辺の組は (3,4,5)、(5,12,13)、(6,8,10)、(8,15,17) です。斜辺 13 と 1 辺 5 がわかっていれば、もう 1 辺 = √(13² - 5²) = 12 です。",
          ko: "자주 나오는 피타고라스 수: (3,4,5), (5,12,13), (6,8,10), (8,15,17). 빗변이 13이고 한 변이 5이면, 나머지 한 변 = √(13² - 5²) = 12예요.",
          ms: "Kenali tigaan Pythagoras klasik: (3,4,5), (5,12,13), (6,8,10), (8,15,17). Diberi hipotenus 13 dan satu sisi 5, sisi yang satu lagi = √(13² - 5²) = 12.",
        },
        checkQuestion: {
          ja: "斜辺の長さが 10、1 辺の長さが 6 の直角三角形で、残りの辺の長さを求めましょう。",
          ko: "빗변의 길이가 10이고 한 변의 길이가 6인 직각삼각형에서 나머지 한 변의 길이를 구하세요.",
          ms: "Sebuah segi tiga bersudut tegak mempunyai hipotenus 10 dan satu sisi 6. Cari sisi yang satu lagi.",
        },
      },
    ],
    misconceptions: {
      misc_pythag_always_add: {
        label: {
          ja: "どれが斜辺かを確かめず、問題にある 2 辺を機械的に 2 乗してたしてしまう",
          ko: "어느 변이 빗변인지 확인하지 않고 주어진 두 변을 기계적으로 제곱해서 더하기",
          ms: "Menambah kuasa dua mana-mana dua sisi secara mekanikal walaupun salah satunya ialah hipotenus",
        },
        wrongPattern: {
          ja: "斜辺 10、1 辺 6 なのに √(10² + 6²) = √136 と計算する",
          ko: "빗변 10, 한 변 6인데 √(10² + 6²) = √136으로 계산함",
          ms: "Mengira √(10² + 6²) = √136 sedangkan 10 sudah pun sisi terpanjang (hipotenus)",
        },
        remediationTip: {
          ja: "斜辺 c はいつもいちばん長い辺です！ 斜辺がわかっていてほかの辺を求めるときは、ひき算を使います：b = √(c² - a²) です。",
          ko: "빗변 c는 항상 가장 긴 변이에요! 빗변을 알고 다른 변을 구할 때는 뺄셈을 써요: b = √(c² - a²).",
          ms: "Hipotenus sentiasa sisi terpanjang; tolak untuk mencari sisi lain: b = √(c² - a²).",
        },
      },
    },
  },

  mt_math_quad_complete_sq: {
    description: {
      ja: "x² + bx + c = 0 を平方完成して (x + b/2)² = k の形にし、次数を下げて解きます。解の公式と、判別式 D = b^2 - 4ac で実数解の個数を調べる方法も身につけます。",
      ko: "x² + bx + c = 0을 완전제곱식 (x + b/2)² = k 꼴로 바꾸어 차수를 낮춰 풀고, 근의 공식과 판별식 Δ = b² - 4ac로 실근의 개수를 판단해요.",
      ms: "Menukar persamaan kuadratik kepada (x + h)² = k melalui penyempurnaan kuasa dua, mengaplikasikan rumus kuadratik, dan menganalisis Δ = b² - 4ac untuk menentukan bilangan punca nyata.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：(x - 3)² = 16 を解くと、なぜ答えが 2 つ（7 と -1）あるのでしょうか？ 7 だけ答えると、どんな場合を見落としていますか？",
      ko: "아이에게 물어보세요: (x - 3)² = 16을 풀면 왜 답이 두 개(7과 -1)일까요? 7만 답하면 어떤 경우를 빠뜨린 걸까요?",
      ms: "Tanya anak anda: Apabila menyelesaikan (x - 3)² = 16, mengapakah terdapat DUA jawapan (7 dan -1) dan bukan 7 sahaja?",
    },
    masteryCriteria: [
      {
        ja: "x² の係数を 1 にしたあと、両辺に「x の係数の半分の 2 乗 (b/2)²」を正しく加えられる",
        ko: "이차항의 계수를 1로 만든 뒤, 양변에 ‘일차항 계수의 절반의 제곱 (b/2)²’을 정확히 더해요",
        ms: "Menambah (b/2)² kepada kedua-dua belah selepas menjadikan pekali sebutan x² sama dengan 1",
      },
      {
        ja: "平方根をとるとき x + h = ±√k と正負の両方を残し、負の解を落とさない",
        ko: "제곱근을 구할 때 x + h = ±√k로 양과 음을 모두 쓰고, 음의 근을 빠뜨리지 않아요",
        ms: "Mengambil kedua-dua punca kuasa dua positif dan negatif (±√k) tanpa tertinggal punca negatif",
      },
    ],
    intuition: {
      ja: "二次方程式がむずかしいのは、x² と bx が混ざっていてそのまま移項できないからです。平方完成は (b/2)² を補って 2 つを 1 つの 2 乗のかっこ (x + b/2)² にまとめ、一気に一次方程式に変えてしまいます！",
      ko: "이차방정식이 어려운 이유는 x²과 bx가 섞여 있어 바로 이항할 수 없기 때문이에요. 완전제곱식 만들기는 (b/2)²을 보태 둘을 하나의 제곱 (x + b/2)²으로 묶어 단숨에 일차방정식으로 바꿔 줘요!",
      ms: "Penyempurnaan kuasa dua membungkus x² dan bx ke dalam satu binomial kuasa dua (x + b/2)², membolehkan punca kuasa dua menurunkan darjah 2 kepada darjah 1.",
    },
    steps: [
      {
        title: {
          ja: "定数項を移項 → (b/2)² を加える → ± をつけて平方根をとる",
          ko: "상수항 이항 → (b/2)² 더하기 → ±를 붙여 제곱근 구하기",
          ms: "Pindahkan Pemalar → Tambah (b/2)² → Ambil ±√",
        },
        body: {
          ja: "x² - 6x + 5 = 0 を解きます。移項して x² - 6x = -5 ⇒ 両辺に (-3)² = 9 を加えて (x - 3)² = 4 ⇒ x - 3 = ±2 ⇒ x₁ = 5, x₂ = 1 です。",
          ko: "x² - 6x + 5 = 0을 풀어요. 이항하면 x² - 6x = -5 ⇒ 양변에 (-3)² = 9를 더하면 (x - 3)² = 4 ⇒ x - 3 = ±2 ⇒ x₁ = 5, x₂ = 1이에요.",
          ms: "Selesaikan x² - 6x + 5 = 0: x² - 6x = -5 ⇒ tambah (-3)² = 9 pada kedua-dua belah: (x - 3)² = 4 ⇒ x - 3 = ±2 ⇒ x₁ = 5, x₂ = 1.",
        },
        checkQuestion: {
          ja: "方程式 (x - 2)² = 9 の 2 つの実数解を求めましょう（コンマで区切って答えましょう）。",
          ko: "방정식 (x - 2)² = 9의 두 실근을 구하세요. (쉼표로 구분하세요)",
          ms: "Cari kedua-dua penyelesaian bagi (x - 2)² = 9 (pisahkan dengan koma).",
        },
      },
    ],
    misconceptions: {
      misc_quad_drop_neg_root: {
        label: {
          ja: "平方根をとるときに ± を書き忘れて解を 1 つ落とす、または左辺だけに (b/2)² を加えて右辺に加え忘れる",
          ko: "제곱근을 구할 때 ±를 빠뜨려 근 하나를 잃거나, 좌변에만 (b/2)²을 더하고 우변에는 더하지 않기",
          ms: "Tertinggal punca kuasa dua negatif (±) atau menambah (b/2)² pada sebelah persamaan sahaja",
        },
        wrongPattern: {
          ja: "(x - 2)² = 9 から x - 2 = 3、つまり x = 5 だけを書き、x = -1 を落とす",
          ko: "(x - 2)² = 9에서 x - 2 = 3, 즉 x = 5만 쓰고 x = -1을 빠뜨림",
          ms: "Menyelesaikan (x - 2)² = 9 sebagai x = 5 sahaja, tertinggal x = -1",
        },
        remediationTip: {
          ja: "(+3)² = 9 で、(-3)² = 9 でもあります。正の数の平方根は必ず正と負の 2 つあるので、平方根をとったらすぐに ± を書きましょう！",
          ko: "(+3)² = 9이고 (-3)² = 9이기도 해요. 양수의 제곱근은 항상 양수와 음수 두 개이니, 제곱근을 구하면 바로 ±를 써요!",
          ms: "Kedua-dua (+3)² dan (-3)² bersamaan 9 — sentiasa tulis ± sebaik sahaja mengambil punca kuasa dua!",
        },
      },
    },
  },

  mt_math_quad_function_parabola: {
    description: {
      ja: "平方完成によって一般形を y = a(x - h)² + k の形に直し、グラフの向き（下に凸か上に凸か）、頂点 (h, k)、軸 x = h、およびある範囲での最大値・最小値を求めます。",
      ko: "완전제곱식을 이용해 일반형을 표준형 y = a(x - h)² + k로 바꾸어, 그래프의 볼록한 방향, 꼭짓점 (h, k), 대칭축 x = h, 주어진 범위에서의 최댓값과 최솟값을 구해요.",
      ms: "Menukar fungsi kuadratik kepada bentuk verteks y = a(x - h)² + k untuk menentukan arah bukaan graf, verteks (h, k), paksi simetri x = h, serta nilai maksimum atau minimum.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：シュートしたボールの軌道が y = -(x - 3)² + 5 で表されるとき、ボールは水平距離何 m のところでいちばん高くなりますか？ そのときの高さは何 m ですか？",
      ko: "아이에게 물어보세요: 농구공이 그리는 포물선이 y = -(x - 3)² + 5라면, 공은 수평 거리 몇 m에서 가장 높이 올라갈까요? 가장 높은 곳은 몇 m일까요?",
      ms: "Tanya anak anda: Jika lengkung bola keranjang mengikut y = -(x - 3)² + 5, pada jarak mengufuk x berapakah bola mencapai titik tertinggi, dan berapakah ketinggian maksimumnya?",
    },
    masteryCriteria: [
      {
        ja: "y = a(x - h)² + k から頂点の座標 (h, k) を正しく読み取り、かっこの中の符号につられて (-h, k) としない",
        ko: "y = a(x - h)² + k에서 꼭짓점의 좌표 (h, k)를 정확히 읽고, 괄호 안의 부호 때문에 (-h, k)로 착각하지 않아요",
        ms: "Membaca koordinat verteks dengan tepat sebagai (h, k) daripada y = a(x - h)² + k, bukan (-h, k)",
      },
      {
        ja: "グラフの向き（a > 0 なら最小値 k、a < 0 なら最大値 k）と合わせて、面積や利益を最大・最小にする問題を解ける",
        ko: "그래프의 모양(a > 0이면 최솟값 k, a < 0이면 최댓값 k)과 연결해 넓이나 이익을 최대·최소로 하는 문제를 해결해요",
        ms: "Menyelesaikan masalah pengoptimuman luas atau keuntungan menggunakan sifat verteks parabola (a > 0 nilai minimum k, a < 0 nilai maksimum k)",
      },
    ],
    intuition: {
      ja: "(x - h)² ≥ 0 で、2 乗の部分はいつも 0 以上です。x = h のときちょうど 0 になり、関数は頂点の値 k をとります！ だから、かっこの中が「-」のとき、頂点の x 座標は +h になるのです。",
      ko: "(x - h)² ≥ 0이라 제곱 부분은 항상 0 이상이에요. x = h일 때 제곱 부분이 0이 되어 함수가 꼭짓점의 값 k를 가져요! 그래서 괄호 안이 ‘-’일 때 꼭짓점의 x좌표는 +h예요.",
      ms: "Oleh sebab (x - h)² ≥ 0 dan menjadi sifar tepat pada x = h, fungsi mencapai nilai ekstremum k di situ — maka verteks berada di (+h, k), bukan (-h, k)!",
    },
    steps: [
      {
        title: {
          ja: "かっこの中を 0 にして、軸と頂点の x 座標を求める",
          ko: "괄호 안을 0으로 만들어 대칭축과 꼭짓점의 x좌표 찾기",
          ms: "Jadikan Sebutan Kuasa Dua Sifar untuk Mencari h",
        },
        body: {
          ja: "y = 2(x + 3)² - 4 では、x + 3 = 0 から h = -3 となります。よって頂点は (-3, -4) で、グラフは下に凸なので最小値は -4 です。",
          ko: "y = 2(x + 3)² - 4에서 x + 3 = 0이면 h = -3이므로 꼭짓점은 (-3, -4)이고, 아래로 볼록하므로 최솟값은 -4예요.",
          ms: "Dalam y = 2(x + 3)² - 4, menetapkan x + 3 = 0 memberikan h = -3, maka verteks ialah (-3, -4); graf terbuka ke atas dengan nilai minimum -4.",
        },
        checkQuestion: {
          ja: "二次関数 y = -(x - 4)² + 9 の最大値を求めましょう。",
          ko: "이차함수 y = -(x - 4)² + 9의 최댓값을 구하세요.",
          ms: "Apakah nilai maksimum bagi y = -(x - 4)² + 9?",
        },
      },
    ],
    misconceptions: {
      misc_vertex_h_sign: {
        label: {
          ja: "y = a(x - h)² + k から頂点を読むとき、x 座標の符号を逆にしてしまう",
          ko: "표준형 y = a(x - h)² + k에서 꼭짓점을 읽을 때 x좌표의 부호를 반대로 읽기",
          ms: "Menyongsangkan tanda h semasa membaca verteks daripada y = a(x - h)² + k",
        },
        wrongPattern: {
          ja: "y = 2(x - 3)² + 5 の頂点を (-3, 5) と読む（正しくは (3, 5)）",
          ko: "y = 2(x - 3)² + 5의 꼭짓점을 (-3, 5)로 읽음 (바르게는 (3, 5))",
          ms: "Membaca verteks y = 2(x - 3)² + 5 sebagai (-3, 5) dan bukannya (3, 5)",
        },
        remediationTip: {
          ja: "「どんな x のとき、かっこの中が 0 になる？」と考えましょう。x = 3 のとき (x - 3)² = 0 なので、頂点の x 座標は +3 です！",
          ko: "‘x가 얼마일 때 괄호 안이 0이 될까?’를 생각해요. x = 3일 때 (x - 3)² = 0이므로 꼭짓점의 x좌표는 +3이에요!",
          ms: "Tanya 'nilai x manakah yang menjadikan (x - 3) sifar?' Jawapannya x = +3!",
        },
      },
    },
  },

  mt_math_trig_right_triangle: {
    description: {
      ja: "正弦・余弦・正接は角の大きさだけで決まる辺の比であることを理解し、30°・45°・60° の三角比の値を覚えて、仰角・俯角の問題や力の分解に使います。",
      ko: "사인, 코사인, 탄젠트는 각의 크기에 따라 하나로 정해지는 변의 길이의 비임을 이해하고, 30°, 45°, 60°의 삼각비 값을 기억해 올려본각·내려본각 문제와 힘의 분해에 활용해요.",
      ms: "Mentakrifkan nisbah sinus, kosinus dan tangen dalam segi tiga bersudut tegak, mengingati nilai tepat bagi 30°, 45° dan 60°, serta menggunakannya untuk sudut dongak, sudut tunduk dan leraian daya.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：鉄塔から 30 m はなれた地面に立ち、塔のてっぺんを見上げた角（仰角）が 45° のとき、塔にのぼらずに高さをすぐに知るにはどうすればよいでしょうか？",
      ko: "아이에게 물어보세요: 철탑에서 30 m 떨어진 땅에 서서 탑 꼭대기를 올려본각이 45°라면, 탑에 오르지 않고 높이를 바로 알 수 있는 방법은?",
      ms: "Tanya anak anda: Berdiri 30 m dari sebuah menara dan mendongak pada sudut 45°, bagaimanakah anda boleh mengetahui ketinggian menara itu dengan serta-merta tanpa memanjatnya?",
    },
    masteryCriteria: [
      {
        ja: "選んだ鋭角 θ に応じて、「対辺」と「隣辺」を正しく入れかえられる",
        ko: "기준이 되는 예각 θ에 따라 ‘마주 보는 변’과 ‘이웃한 변’을 정확히 바꿔 생각해요",
        ms: "Menukar sisi bertentangan dan sisi bersebelahan dengan tepat berdasarkan sudut tirus θ yang dipilih",
      },
      {
        ja: "sin 30° = 1/2, cos 60° = 1/2, tan 45° = 1 などの特別な角の値を覚えている",
        ko: "sin 30° = 1/2, cos 60° = 1/2, tan 45° = 1 등 특수각의 삼각비 값을 기억해요",
        ms: "Mengingati nilai tepat nisbah trigonometri bagi sudut khas seperti sin 30° = 1/2, kos 60° = 1/2, tan 45° = 1",
      },
    ],
    intuition: {
      ja: "角の大きさが決まれば、直角三角形はどれだけ拡大・縮小しても相似です。だから「対辺 / 斜辺（sin）」などの比はいつも一定なのです！",
      ko: "각의 크기가 정해지면 직각삼각형은 아무리 확대하거나 축소해도 서로 닮음이에요. 그래서 ‘마주 보는 변 / 빗변(sin)’ 같은 비는 언제나 일정해요!",
      ms: "Semua segi tiga bersudut tegak yang berkongsi sudut tirus θ adalah serupa, maka nisbah sisinya (cth. sisi bertentangan/hipotenus untuk sin) kekal sama walau diperbesar atau diperkecil.",
    },
    steps: [
      {
        title: {
          ja: "まず斜辺に印をつけ、次に角 θ の向かいの対辺を見つける",
          ko: "먼저 빗변을 표시하고, 각 θ와 마주 보는 변 찾기",
          ms: "Labelkan Hipotenus Dahulu, Kemudian Sisi Bertentangan θ",
        },
        body: {
          ja: "物理で斜面上の重力 mg を分解するとき、斜面に沿って下向きの分力は mg·sin θ、斜面に垂直な分力は mg·cos θ です。",
          ko: "물리에서 경사면 위의 중력 mg를 분해하면, 경사면을 따라 아래로 향하는 분력은 mg·sin θ, 경사면에 수직인 분력은 mg·cos θ예요.",
          ms: "Pada satah condong bersudut θ, daya graviti mg dileraikan kepada mg·sin θ (selari dengan satah) dan mg·kos θ (normal kepada satah).",
        },
        checkQuestion: {
          ja: "∠C = 90° の直角三角形 ABC で、斜辺 AB = 10、∠A = 30° のとき、対辺 BC の長さを求めましょう。",
          ko: "∠C = 90°인 직각삼각형 ABC에서 빗변 AB = 10, ∠A = 30°일 때, 변 BC의 길이를 구하세요.",
          ms: "Dalam segi tiga bersudut tegak △ABC (∠C = 90°), hipotenus AB = 10 dan ∠A = 30°. Cari sisi bertentangan BC.",
        },
      },
    ],
    misconceptions: {
      misc_trig_swap_sin_cos: {
        label: {
          ja: "対辺と隣辺を取りちがえ、sin θ と cos θ を逆に使ってしまう",
          ko: "마주 보는 변과 이웃한 변을 혼동해 sin θ와 cos θ를 바꿔 쓰기",
          ms: "Menukar ganti sisi bertentangan dengan sisi bersebelahan (mengelirukan sin θ dengan kos θ)",
        },
        wrongPattern: {
          ja: "斜辺 10 と ∠A = 30° から対辺を求めるのに、cos 30°（隣辺 / 斜辺）を使ってしまう",
          ko: "빗변 10과 ∠A = 30°로 마주 보는 변을 구하는데 cos 30°(이웃한 변 / 빗변)를 사용함",
          ms: "Menggunakan kos 30° (sisi bersebelahan/hipotenus) dan bukannya sin 30° (sisi bertentangan/hipotenus) untuk mencari sisi bertentangan",
        },
        remediationTip: {
          ja: "角 θ の頂点から三角形の中へ矢を放ってみましょう。矢が当たる正面の辺が対辺（sin）、角のすぐとなりにある直角をはさむ辺が隣辺（cos）です！",
          ko: "각 θ의 꼭짓점에서 삼각형 안쪽으로 화살을 쏘아 봐요. 화살이 맞는 정면의 변이 마주 보는 변(sin)이고, 각 바로 옆에 붙은 변이 이웃한 변(cos)이에요!",
          ms: "Bayangkan anak panah ditembak dari sudut θ merentasi segi tiga — sisi yang terkena ialah sisi bertentangan (sin), manakala sisi tegak yang bersebelahan dengan sudut ialah sisi bersebelahan (kos)!",
        },
      },
    },
  },

  mt_math_calc_derivative_tangent: {
    description: {
      ja: "割線の傾き Δy/Δx の極限から、微分係数 f'(x₀) が接線の傾きを表すことを理解し、多項式の微分法を使って関数の増減や極値を調べます。",
      ko: "할선의 기울기 Δy/Δx의 극한으로 미분계수 f'(x₀)가 접선의 기울기를 뜻한다는 것을 이해하고, 다항함수의 미분법으로 증가·감소 구간과 극값을 구해요.",
      ms: "Mentafsir terbitan f'(x₀) sebagai kecerunan tangen (had bagi kecerunan sekan Δy/Δx), membezakan polinomial menggunakan petua kuasa, dan mencari nilai ekstremum setempat apabila f'(x) = 0.",
    },
    homeCheckPrompt: {
      ja: "お子さんに聞いてみましょう：車のスピードメーターが示す「時速 80 km」と、全体の道のりを全体の時間でわって求めた速さとでは、本質的に何がちがうでしょうか？",
      ko: "아이에게 물어보세요: 자동차 계기판이 가리키는 ‘시속 80 km’와 전체 거리를 전체 시간으로 나누어 구한 속력은 본질적으로 무엇이 다를까요?",
      ms: "Tanya anak anda: Apakah perbezaan antara bacaan meter laju kereta 80 km/j pada satu ketika dengan jumlah jarak dibahagi jumlah masa perjalanan?",
    },
    masteryCriteria: [
      {
        ja: "(xⁿ)' = n·xⁿ⁻¹ を使って正しく微分し（定数の微分は 0）、指定された点での接線の傾きを求められる",
        ko: "(xⁿ)' = n·xⁿ⁻¹을 이용해 정확히 미분하고(상수의 미분은 0), 주어진 점에서의 접선의 기울기를 구해요",
        ms: "Membezakan sebutan polinomial menggunakan (xⁿ)' = n·xⁿ⁻¹ (terbitan pemalar ialah 0) dan mengira kecerunan tangen pada titik tertentu",
      },
      {
        ja: "f'(x) = 0 を解き、その前後で f'(x) の符号が変わるかを調べて極大値・極小値を求められる",
        ko: "f'(x) = 0을 풀고 그 앞뒤에서 f'(x)의 부호가 바뀌는지 확인해 극댓값과 극솟값을 구해요",
        ms: "Mencari titik pegun dengan menyelesaikan f'(x) = 0 dan menyemak perubahan tanda untuk menentukan nilai maksimum atau minimum setempat",
      },
    ],
    intuition: {
      ja: "一次関数の傾きはどこでも同じですが、曲線は点ごとに急さが変わります。2 点の間隔 Δx を限りなく小さくしていくと、割線の傾きはその点での接線の傾き f'(x) になります！",
      ko: "일차함수의 기울기는 어디서나 같지만, 곡선은 점마다 가파른 정도가 달라요. 두 점 사이의 간격 Δx를 한없이 작게 하면 할선의 기울기가 그 점에서의 접선의 기울기 f'(x)가 돼요!",
      ms: "Kecerunan fungsi linear sama di mana-mana, tetapi kecuraman lengkung berubah pada setiap titik. Apabila jarak Δx antara dua titik dikecilkan tanpa had, kecerunan sekan menjadi kecerunan tangen f'(x) pada titik itu!",
    },
    steps: [
      {
        title: {
          ja: "指数を前に出して係数にかけ、指数を 1 減らし、定数は 0 に",
          ko: "지수를 앞으로 내려 계수에 곱하고, 지수는 1 줄이고, 상수는 0으로",
          ms: "Turunkan Kuasa, Tolak 1, Pemalar Lenyap",
        },
        body: {
          ja: "f(x) = x³ - 3x + 2 を微分すると f'(x) = 3x² - 3 になります。x = 2 における接線の傾きは 3(4) - 3 = 9 です。",
          ko: "f(x) = x³ - 3x + 2를 미분하면 f'(x) = 3x² - 3이고, x = 2에서 접선의 기울기는 3(4) - 3 = 9예요.",
          ms: "Bagi f(x) = x³ - 3x + 2, f'(x) = 3x² - 3; pada x = 2, kecerunan tangen ialah 3(4) - 3 = 9.",
        },
        checkQuestion: {
          ja: "関数 f(x) = x² - 4x + 7 の x = 3 における接線の傾き f'(3) を求めましょう。",
          ko: "함수 f(x) = x² - 4x + 7의 x = 3에서의 접선의 기울기 f'(3)을 구하세요.",
          ms: "Cari kecerunan tangen f'(3) bagi f(x) = x² - 4x + 7.",
        },
      },
    ],
    misconceptions: {
      misc_deriv_const_keep: {
        label: {
          ja: "微分するとき、定数項の微分が 0 になることを忘れて、そのまま残してしまう",
          ko: "미분할 때 상수항의 미분이 0이라는 것을 잊고 그대로 남기기",
          ms: "Mengekalkan sebutan pemalar dan bukannya membezakannya menjadi 0",
        },
        wrongPattern: {
          ja: "(x² + 5)' を 2x + 5 と計算する（正しくは 2x）",
          ko: "(x² + 5)'을 2x + 5로 계산함 (바르게는 2x)",
          ms: "Membezakan x² + 5 sebagai 2x + 5 dan bukannya 2x",
        },
        remediationTip: {
          ja: "定数 +5 は曲線全体を上下に平行移動させるだけで、どの点の傾き（接線の傾き）もまったく変えません。だから定数の微分は必ず 0 です！",
          ko: "상수 +5는 곡선 전체를 위아래로 평행이동시킬 뿐, 어느 점의 기울기도 전혀 바꾸지 않아요. 그래서 상수의 미분은 반드시 0이에요!",
          ms: "Menambah +5 hanya menganjakkan graf secara mencancang tanpa mengubah kecondongannya di mana-mana titik — maka kadar perubahannya ialah 0!",
        },
      },
    },
  },
};
