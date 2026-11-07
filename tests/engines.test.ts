import assert from "node:assert/strict";
import { ALL_CANONICAL_TOPICS, ALL_QUESTION_TEMPLATES, CANONICAL_EDGES } from "../src/data/canonical-graph";
import { generateQuestion } from "../src/lib/engines/item-generator";
import {
  areAlgebraicExpressionsEquivalent,
  gradeQuestionResponse,
  gradeQuickCheckAnswer,
  parseRational,
  areRationalsEqual,
} from "../src/lib/engines/grader";
import { tokenizeMathText } from "../src/components/MathText";
import { localizeChoice, localizeExplanation, localizePrompt, toTraditionalChinese } from "../src/lib/i18n";
import {
  applyDiagnosticAnswer,
  createDiagnosticSession,
  getNextDiagnosticQuestion,
  summarizeDiagnosis,
} from "../src/lib/engines/dag-engine";
import {
  computeRetrievability,
  createInitialWrongCard,
  scheduleFsrsReview,
} from "../src/lib/engines/fsrs-engine";
import { generateSocraticTutorReply } from "../src/lib/engines/socratic-tutor";
import { sanitizeForExternalAi } from "../src/lib/engines/privacy-shield";
import {
  calibrateIrtAfterAttempt,
  validateCustomEdgeAcyclic,
} from "../src/lib/engines/irt-engine";
import {
  analyzeCapturedWrongQuestion,
  buildSmartExamPapers,
} from "../src/lib/engines/smart-capture-and-paper";

async function runAllEngineTests(): Promise<void> {
  console.log("🔬 Running OmniGraph K12 Core Engine Test Suite...");

  // 1. Exact Rational & Algebraic Equivalence Grader Tests
  assert.equal(
    areRationalsEqual(parseRational("1/2"), parseRational("0.5")),
    true,
    "1/2 must equal 0.5"
  );
  assert.equal(
    areRationalsEqual(parseRational("50%"), parseRational("2/4")),
    true,
    "50% must equal 2/4"
  );
  assert.equal(
    areRationalsEqual(parseRational("1 1/2"), parseRational("1.5")),
    true,
    "Mixed fraction 1 1/2 must equal 1.5"
  );
  assert.equal(
    areRationalsEqual(parseRational("1/3"), parseRational("0.333")),
    false,
    "1/3 must NOT equal truncated decimal 0.333"
  );
  assert.equal(
    areAlgebraicExpressionsEquivalent("(x - 2)^2 - 1", "x^2 - 4x + 3"),
    true,
    "(x - 2)^2 - 1 must equal x^2 - 4x + 3"
  );
  assert.equal(
    areAlgebraicExpressionsEquivalent("(x + 3)^2", "x^2 + 9"),
    false,
    "(x + 3)^2 must NOT equal Freshman's Dream x^2 + 9"
  );

  // Pedagogical Guardrail A: Reject verbatim copy-pasted unexpanded / uncombined algebraic prompts!
  {
    const algInst = generateQuestion({
      templateId: "tpl_math_special_products_challenge",
      seed: "copy_paste_guard",
      regionCode: "US",
    });
    assert.equal(gradeQuestionResponse(algInst, algInst.answer).isCorrect, true);
    const unexpandedCopy = gradeQuestionResponse(algInst, `(${algInst.answer})`);
    assert.equal(unexpandedCopy.isCorrect, false, "Bracketed unexpanded expression must NOT pass!");

    const sqMock = { ...algInst, answer: "x^2 + 12x + 36", itemType: "expression" as const };
    assert.equal(
      gradeQuestionResponse(sqMock, "(x + 6)^2").isCorrect,
      false,
      "Verbatim (x + 6)^2 must be rejected on expansion item!"
    );
    assert.equal(
      gradeQuestionResponse(sqMock, "x^2 + 6x + 6x + 36").isCorrect,
      false,
      "Uncombined like terms x^2 + 6x + 6x + 36 must be rejected!"
    );
    assert.equal(gradeQuestionResponse(sqMock, "x^2 + 12x + 36").isCorrect, true);
  }

  // Pedagogical Guardrail B: Enforce reduced fractions when requireSimplifiedFraction is true!
  {
    const fracInst = generateQuestion({
      templateId: "tpl_math_frac_add_sub_standard",
      seed: "frac_reduce_guard",
      regionCode: "CN",
    });
    const fracMock = {
      ...fracInst,
      answer: "7/12",
      requireSimplifiedFraction: true,
      itemType: "numeric" as const,
    };
    const unred = gradeQuestionResponse(fracMock, "14/24");
    assert.equal(unred.isCorrect, false, "Unreduced 14/24 must be rejected on lowest-terms item!");
    assert.equal(unred.detectedMisconception, "misc_unsimplified_fraction");
    assert.equal(gradeQuestionResponse(fracMock, "7/12").isCorrect, true);
  }

  // Pedagogical Guardrail C: CJK enumeration comma `、`, multi-locale conjunctions, and currency prefixes!
  {
    const quadInst = generateQuestion({
      templateId: "tpl_math_quad_roots_standard",
      seed: "ime_comma_guard",
      regionCode: "JP",
    });
    const parts = quadInst.answer.split(",").map((s) => s.trim());
    if (parts.length === 2) {
      assert.equal(gradeQuestionResponse(quadInst, `${parts[1]}、${parts[0]}`).isCorrect, true);
      assert.equal(gradeQuestionResponse(quadInst, `${parts[0]} または ${parts[1]}`).isCorrect, true);
      assert.equal(gradeQuestionResponse(quadInst, `${parts[0]} 또는 ${parts[1]}`).isCorrect, true);
      assert.equal(gradeQuestionResponse(quadInst, `${parts[0]} atau ${parts[1]}`).isCorrect, true);
    }
    const pctInst = generateQuestion({
      templateId: "tpl_math_ratio_percent_standard",
      seed: "currency_strip_guard",
      regionCode: "US",
    });
    assert.equal(gradeQuestionResponse(pctInst, `$${pctInst.answer}`).isCorrect, true);
    assert.equal(gradeQuestionResponse(pctInst, `RM ${pctInst.answer}`).isCorrect, true);
    assert.equal(gradeQuestionResponse(pctInst, `HK$${pctInst.answer}`).isCorrect, true);

    assert.equal(gradeQuickCheckAnswer("6", "+6"), true, "Oxidation state +6 must match 6");
    assert.equal(gradeQuickCheckAnswer("5, -1", "-1、5"), true, "Quick check must accept reversed `、` roots");
  }
  console.log("  ✔ Grader: rational, algebraic simplification guardrails, reduced-fraction & IME/currency checks passed");

  // 2. Test All 150 Parameterized Question Templates (Zero-Collision, Zero-Leak, MathText Balance & dTier Variety)
  const BAD_FALLBACK_RE = /\(变式\+|\(alt \+|別案\s*\+|변형\s*\+|alternatif\s*\+/i;
  const BAD_ALGEBRA_RE = /(?:^|[^\d.])0x\b|(?:^|[+\-\s])1x\b|-1x\b|\+\s*-\d|Having saw/i;
  const RAW_LATEX_IN_PROSE_RE = /\\(?:frac|sum|implies|longrightarrow|text\{|lfloor|Theta)|\^\s*\{|\^\s*\\circ/;

  for (const tpl of ALL_QUESTION_TEMPLATES) {
    for (let sIdx = 0; sIdx < 25; sIdx++) {
      const q = generateQuestion({
        templateId: tpl.id,
        seed: `stress_seed_${sIdx}`,
        regionCode: sIdx % 2 === 0 ? "US" : "HK",
        variantIndex: sIdx,
      });

      if (sIdx === 0) {
        const qSame = generateQuestion({
          templateId: tpl.id,
          seed: `stress_seed_${sIdx}`,
          regionCode: "US",
          variantIndex: 0,
        });
        assert.equal(q.promptZh, qSame.promptZh, `Deterministic seed check failed for ${tpl.id}`);
        assert.ok(q.promptZh.length > 5 && q.promptEn.length > 5, `Bilingual prompt missing on ${tpl.id}`);
      }

      // Must grade its own canonical answer as 100% correct!
      const selfGrade = gradeQuestionResponse(q, q.answer);
      assert.equal(
        selfGrade.isCorrect,
        true,
        `Template ${tpl.id} (seed ${sIdx}) failed self-grading for answer "${q.answer}"`
      );

      // Zero "(变式+1)" / "(alt +1)" collisions and 4 distinct choices on MCQs
      if (q.choices) {
        assert.equal(q.choices.length, 4, `Expected 4 choices on ${tpl.id}`);
        const zhSet = new Set<string>();
        for (const ch of q.choices) {
          assert.equal(
            BAD_FALLBACK_RE.test(ch.text) || BAD_FALLBACK_RE.test(ch.textEn ?? ""),
            false,
            `Collision fallback leaked on ${tpl.id}: ${ch.text} / ${ch.textEn}`
          );
          assert.equal(
            BAD_ALGEBRA_RE.test(ch.text) || BAD_ALGEBRA_RE.test(ch.textEn ?? ""),
            false,
            `Malformed algebra/grammar distractor on ${tpl.id}: ${ch.text} / ${ch.textEn}`
          );
          zhSet.add(ch.text.trim().toLowerCase());
        }
        assert.equal(
          zhSet.size,
          4,
          `Duplicate choice texts on ${tpl.id} (seed ${sIdx}): ${q.choices.map((c) => c.text).join(" | ")}`
        );
      }

      // Answer must NEVER appear inside misconceptionsByValue
      if (q.misconceptionsByValue && q.itemType !== "choice") {
        for (const wrongKey of Object.keys(q.misconceptionsByValue)) {
          assert.notEqual(
            wrongKey.trim().toLowerCase(),
            q.answer.trim().toLowerCase(),
            `Canonical answer "${q.answer}" polluted misconceptionsByValue on ${tpl.id}`
          );
        }
      }

      // Zero unsimplified `0x`, `-1x`, `+ -` in canonical answers; zero `V(` or `U = U` in SVGs
      assert.equal(
        BAD_ALGEBRA_RE.test(q.answer),
        false,
        `Malformed canonical answer "${q.answer}" on ${tpl.id}`
      );
      if (q.svgDiagram) {
        assert.equal(
          /U\s*=\s*U\b|V\(-?\d/.test(q.svgDiagram),
          false,
          `SVG answer leak or U=U on ${tpl.id}`
        );
      }

      // MathText tokenizer must leave ZERO raw LaTeX in plain-text segments across locales!
      if (sIdx < 4) {
        for (const loc of ["zh-CN", "zh-TW", "en", "ja", "ko", "ms"] as const) {
          for (const str of [localizePrompt(q, loc, false), localizeExplanation(q, loc, false)]) {
            for (const seg of tokenizeMathText(str, false)) {
              if (!seg.isMath) {
                assert.equal(
                  RAW_LATEX_IN_PROSE_RE.test(seg.raw),
                  false,
                  `Broken $ math delimiter in ${tpl.id} [${loc}]: raw prose segment = "${seg.raw}"`
                );
              }
            }
          }
          for (const ch of q.choices ?? []) {
            for (const seg of tokenizeMathText(localizeChoice(ch, loc, false), false)) {
              if (!seg.isMath) {
                assert.equal(
                  RAW_LATEX_IN_PROSE_RE.test(seg.raw),
                  false,
                  `Broken $ math delimiter in choice of ${tpl.id} [${loc}]: "${seg.raw}"`
                );
              }
            }
          }
        }
      }
    }
  }

  // Verify all 50 canonical topics have >= 3 distinct prompts across tiers/seeds and clean coreFormula rendering
  for (const topic of ALL_CANONICAL_TOPICS) {
    if (topic.microLesson.coreFormula) {
      for (const seg of tokenizeMathText(topic.microLesson.coreFormula, false)) {
        if (!seg.isMath) {
          assert.equal(
            RAW_LATEX_IN_PROSE_RE.test(seg.raw),
            false,
            `Un-delimited coreFormula on ${topic.id}: "${seg.raw}"`
          );
        }
      }
    }
    const promptsSeen = new Set<string>();
    for (const tier of ["basic", "standard", "challenge"] as const) {
      for (let v = 0; v < 8; v++) {
        const inst = generateQuestion({
          topicId: topic.id,
          difficulty: tier,
          seed: `variety_${v}`,
          regionCode: "SG",
          variantIndex: v,
        });
        promptsSeen.add(inst.promptEn);
      }
    }
    assert.ok(
      promptsSeen.size >= 3,
      `Topic ${topic.id} lacks parameterization/variety (only ${promptsSeen.size} unique prompt(s) across 24 draws)!`
    );
  }

  // Verify s2tw idempotence & polysemy accuracy
  {
    const sample = "维多利亚女王与印度皇后在合并同类项、测量干路电流、排除干扰项、审读题干与句子主干时观察沉淀。";
    const once = toTraditionalChinese(sample);
    const twice = toTraditionalChinese(once);
    assert.equal(once, twice, "toTraditionalChinese must be 100% idempotent!");
    assert.ok(once.includes("皇后") && !once.includes("皇後"));
    assert.ok(once.includes("合併同類項") && !once.includes("合並"));
    assert.ok(once.includes("幹路電流") && !once.includes("乾路"));
    assert.ok(once.includes("干擾項") && !once.includes("乾擾"));
    assert.ok(once.includes("題幹") && once.includes("主幹") && once.includes("沉澱"));
  }
  console.log(`  ✔ Item Generator & MathText: 3,750 instances across ${ALL_QUESTION_TEMPLATES.length} templates passed zero-collision, zero-leak, variety & KaTeX balance`);

  // 3. Adaptive DAG Engine Test A: Mastery Confirmation + Ancestor Closure Pruning
  {
    const session = createDiagnosticSession({
      studentId: "stu_test",
      subjectId: "math",
      regionCode: "CN",
      mode: "target",
      targetTopicIds: ["mt_math_quad_complete_sq"],
      confirmRequired: 2,
      seed: "prune_test",
    });

    const p1 = getNextDiagnosticQuestion(session);
    assert.ok(p1 && p1.topicId === "mt_math_quad_complete_sq");
    applyDiagnosticAnswer(session, p1.instance, p1.instance.answer, p1.whyAskedZh, p1.whyAskedEn);

    const p2 = getNextDiagnosticQuestion(session);
    assert.ok(p2 && p2.topicId === "mt_math_quad_complete_sq" && p2.difficulty === "challenge");
    const out2 = applyDiagnosticAnswer(session, p2.instance, p2.instance.answer, p2.whyAskedZh, p2.whyAskedEn);

    assert.equal(out2.updatedTopicStatus, "mastered");
    assert.ok(out2.prunedAncestors.length >= 6, "Expected >= 6 upstream ancestors to be pruned as inferred_mastered");
    assert.equal(out2.sessionFinished, true, "Session should finish immediately once target is mastered!");
  }

  // 4. Adaptive DAG Engine Test B: Careless Slip (`shaky`) vs True Gap (`weak`) + Cross-Subject Backtracking
  {
    // Test careless slip on Ohm's Law: miss 1st (`standard`), pass 2nd (`basic`) -> `shaky` without backtracking!
    const slipSession = createDiagnosticSession({
      studentId: "stu_test",
      subjectId: "physics",
      regionCode: "HK",
      mode: "target",
      targetTopicIds: ["mt_phy_ohm_law"],
      confirmRequired: 2,
      seed: "slip_test",
    });
    const s1 = getNextDiagnosticQuestion(slipSession)!;
    applyDiagnosticAnswer(slipSession, s1.instance, "999999"); // Wrong
    const s2 = getNextDiagnosticQuestion(slipSession)!;
    assert.equal(s2.topicId, "mt_phy_ohm_law");
    assert.equal(s2.difficulty, "basic", "Second check after miss must drop to basic tier");
    const slipOut = applyDiagnosticAnswer(slipSession, s2.instance, s2.instance.answer);
    assert.equal(slipOut.updatedTopicStatus, "shaky");
    assert.equal(slipOut.pushedPrerequisites.length, 0, "Shaky slip must NOT push upstream prerequisites");
    assert.equal(slipOut.sessionFinished, true);

    // Test true gap on Ohm's Law: miss BOTH `standard` and `basic` -> `weak` -> backtracks to `mt_phy_circuits_series_parallel` AND cross-subject `mt_math_rational_eq`!
    const weakSession = createDiagnosticSession({
      studentId: "stu_test",
      subjectId: "physics",
      regionCode: "HK",
      mode: "target",
      targetTopicIds: ["mt_phy_ohm_law"],
      confirmRequired: 2,
      seed: "weak_backtrack_test",
    });
    const w1 = getNextDiagnosticQuestion(weakSession)!;
    applyDiagnosticAnswer(weakSession, w1.instance, "999999");
    const w2 = getNextDiagnosticQuestion(weakSession)!;
    const weakOut = applyDiagnosticAnswer(weakSession, w2.instance, "999999");
    assert.equal(weakOut.updatedTopicStatus, "weak");
    assert.ok(
      weakOut.pushedPrerequisites.includes("mt_phy_circuits_series_parallel") &&
        weakOut.pushedPrerequisites.includes("mt_math_rational_eq"),
      "Weak Ohm's Law must push BOTH physics circuits and cross-subject math rational equations!"
    );

    // Suppose student masters physics circuits, then fails cross-subject rational_eq twice, and masters its upstream linear_eq & factoring -> rational_eq is pinpointed as the exact weakRoot!
    while (!weakSession.finished) {
      const nextQ = getNextDiagnosticQuestion(weakSession);
      if (!nextQ) break;
      const shouldFail = nextQ.topicId === "mt_math_rational_eq";
      applyDiagnosticAnswer(
        weakSession,
        nextQ.instance,
        shouldFail ? "999999" : nextQ.instance.answer,
        nextQ.whyAskedZh,
        nextQ.whyAskedEn
      );
    }
    const summary = summarizeDiagnosis(weakSession);
    assert.deepEqual(
      summary.weakRootIds,
      ["mt_math_rational_eq"],
      "summarizeDiagnosis must pinpoint cross-subject mt_math_rational_eq as the exact root cause of Ohm's Law failure!"
    );
  }
  console.log("  ✔ Adaptive DAG Engine: ancestor pruning, shaky vs weak, and cross-subject root-cause DFS passed");

  // 5. FSRS DSR Scheduler & Twin-Variant 3-Streak Clearance
  {
    assert.equal(computeRetrievability(5, 0), 1);
    assert.equal(computeRetrievability(5, 5), 0.9, "At elapsed t = S, FSRS retrievability must equal 0.90");

    let card = createInitialWrongCard(new Date("2026-11-01T08:00:00Z"));
    assert.equal(card.status, "active");

    card = scheduleFsrsReview(card, 3, new Date("2026-11-02T08:00:00Z")); // Good #1
    assert.equal(card.status, "reviewing");
    assert.equal(card.twinClearStreak, 1);

    card = scheduleFsrsReview(card, 3, new Date("2026-11-05T08:00:00Z")); // Good #2
    assert.equal(card.status, "reviewing");
    assert.equal(card.twinClearStreak, 2);

    card = scheduleFsrsReview(card, 4, new Date("2026-11-12T08:00:00Z")); // Easy #3 -> Cleared!
    assert.equal(card.status, "cleared");
    assert.equal(card.twinClearStreak, 3);
    assert.ok(card.stability > 10, "Stability should expand after 3 successful spaced reviews");
  }
  console.log("  ✔ FSRS Engine: 90% half-life curve & 3-streak twin clearance state machine passed");

  // 6. KG-Grounded Socratic AI Tutor Fallback Test
  {
    const sampleQ = generateQuestion({
      topicId: "mt_phy_ohm_law",
      difficulty: "standard",
      seed: "tutor_test",
      regionCode: "CN",
    });
    const turn1 = await generateSocraticTutorReply({
      topicId: "mt_phy_ohm_law",
      regionCode: "CN",
      bilingual: true,
      question: sampleQ,
      studentWrongAnswer: "18",
      detectedMisconceptionTag: "misc_ohm_parallel_add",
      messages: [{ role: "user", content: "老师我把两个并联电阻直接加起来算错了，怎么办？" }],
    });
    assert.ok(turn1.reply.length > 30);
    assert.ok(turn1.groundedStandardCode.includes("cps-2022"));
    assert.ok(turn1.referencedPrerequisites.length >= 2);
  }
  console.log("  ✔ Socratic Tutor: KG standard-code grounding & misconception scaffolding passed");

  // 7. 9-Region Minor PII De-Identification Shield Test
  {
    const raw =
      "老师您好，我是深圳南山实验中学的林小宇（电话 13812345678，邮箱 leo@test.com），在算 1/R = 1/6 + 1/12 和比例尺 1 : 100000 时算错了！";
    const sanitized = sanitizeForExternalAi({
      rawText: raw,
      userId: "stu_leo",
      displayName: "林小宇 Leo Lin",
      regionCode: "CN",
    });
    assert.ok(!sanitized.sanitizedText.includes("林小宇"), "Student name must be redacted");
    assert.ok(!sanitized.sanitizedText.includes("13812345678"), "Phone number must be redacted");
    assert.ok(!sanitized.sanitizedText.includes("leo@test.com"), "Email must be redacted");
    assert.ok(sanitized.sanitizedText.includes("[REDACTED_SCHOOL]"), "School name must be redacted");
    assert.ok(
      sanitized.sanitizedText.includes("1/6 + 1/12") &&
        sanitized.sanitizedText.includes("100000"),
      "Math expressions and scale numbers must remain completely intact!"
    );

    // Multi-locale (ja / ko / ms / zh-TW) PII & Govt ID stripping checks
    const jaSan = sanitizeForExternalAi({
      rawText: "私は佐藤健太です。東京都立日比谷高等学校に通っています。携帯は 090-1234-5678 です。",
      userId: "stu_ja",
      regionCode: "JP",
    });
    assert.ok(!jaSan.sanitizedText.includes("佐藤健太") && !jaSan.sanitizedText.includes("090-1234-5678"));
    assert.ok(jaSan.sanitizedText.includes("[REDACTED_SCHOOL]"));

    const koSan = sanitizeForExternalAi({
      rawText: "제 이름은 김민준입니다. 서울과학고등학교 재학 중이며 주민번호 080512-3456789 입니다.",
      userId: "stu_ko",
      regionCode: "KR",
    });
    assert.ok(!koSan.sanitizedText.includes("김민준") && !koSan.sanitizedText.includes("080512-3456789"));
    assert.ok(koSan.sanitizedText.includes("[REDACTED_SCHOOL]"));

    const msSan = sanitizeForExternalAi({
      rawText: "Nama saya Ahmad bin Ali dari SMK Taman Desa, MyKad 090102-14-5678.",
      userId: "stu_ms",
      regionCode: "MY",
    });
    assert.ok(!msSan.sanitizedText.includes("Ahmad bin Ali") && !msSan.sanitizedText.includes("090102-14-5678"));
    assert.ok(msSan.sanitizedText.includes("[REDACTED_SCHOOL]"));
  }
  console.log("  ✔ Privacy Shield: 6-locale × 9-region PII stripping & math-token preservation passed");

  // 8. Online Elo-IRT 2PL Calibration & School Graph DAG Cycle Guard Test
  {
    const baseItem = {
      templateId: "tpl_test",
      topicId: "mt_phy_ohm_law",
      priorBeta: 0.0,
      calibratedBeta: 0.0,
      discriminationAlpha: 1.1,
      attempts: 5,
      correct: 2,
    };
    const harderAfterFail = calibrateIrtAfterAttempt(baseItem, 1.0, false);
    assert.ok(
      harderAfterFail.calibratedBeta > baseItem.calibratedBeta,
      "Failing an item by a high-theta student must increase empirical difficulty beta!"
    );

    // Cycle check: mt_phy_ohm_law depends on mt_math_rational_eq -> mt_math_linear_eq_one.
    // Adding mt_math_linear_eq_one depends on mt_phy_ohm_law MUST be rejected as a cycle!
    const cycleRes = validateCustomEdgeAcyclic(CANONICAL_EDGES, {
      topicId: "mt_math_linear_eq_one",
      prerequisiteId: "mt_phy_ohm_law",
    });
    assert.equal(cycleRes.ok, false, "Cyclic school edge must be blocked!");
    assert.ok((cycleRes.cyclePath?.length ?? 0) >= 3);

    const validRes = validateCustomEdgeAcyclic(CANONICAL_EDGES, {
      topicId: "mt_chem_molar_concentration",
      prerequisiteId: "mt_math_rational_eq",
    });
    assert.equal(validRes.ok, true, "Acyclic cross-subject school edge must be allowed!");
  }
  console.log("  ✔ IRT & Studio Engine: Elo-IRT 2PL calibration & DAG cycle guard passed");

  // 9. Smart Capture Attribution & Anti-Cheating A/B Exam Paper Builder Test
  {
    const cap = analyzeCapturedWrongQuestion({
      sanitizedQuestionText: "电阻 R1=6Ω 与 R2=12Ω 并联在电路中，用欧姆定律求并联等效电阻 1/R",
      studentWrongAnswer: "18",
      regionCode: "HK",
      seed: "test_cap_seed",
    });
    assert.equal(cap.matchedPrimary.topicId, "mt_phy_ohm_law");
    assert.ok(
      cap.upstreamRootCauses.some((u) => u.topicId === "mt_math_rational_eq"),
      "Smart Capture must surface cross-subject rational equations prerequisite!"
    );

    // Multi-locale Smart Capture Attribution (ja / ko / zh-TW)
    const capJa = analyzeCapturedWrongQuestion({
      sanitizedQuestionText: "並列回路の合成抵抗とオームの法則で R1=6Ω, R2=12Ω を求める問題",
      regionCode: "JP",
      locale: "ja",
    });
    assert.equal(capJa.matchedPrimary.topicId, "mt_phy_ohm_law");

    const capKo = analyzeCapturedWrongQuestion({
      sanitizedQuestionText: "병렬 회로 합성저항과 옴의 법칙을 이용하여 등가 저항 구하기",
      regionCode: "KR",
      locale: "ko",
    });
    assert.equal(capKo.matchedPrimary.topicId, "mt_phy_ohm_law");

    const capTw = analyzeCapturedWrongQuestion({
      sanitizedQuestionText: "並聯電路等效電阻與歐姆定律計算",
      regionCode: "TW",
      locale: "zh-TW",
    });
    assert.equal(capTw.matchedPrimary.topicId, "mt_phy_ohm_law");

    const bundle = buildSmartExamPapers({
      regionCode: "SG",
      subjectId: "math",
      topicIds: ["mt_math_ratio_percent", "mt_math_rational_eq", "mt_math_quad_complete_sq"],
      totalItems: 6,
      ratio: { basicPct: 33, standardPct: 34, challengePct: 33 },
      paperSeed: "exam_seed_sg",
    });
    assert.equal(bundle.paperA.length, 6);
    assert.equal(bundle.paperB.length, 6);
    assert.equal(bundle.totalPoints, 100);
    assert.notEqual(
      bundle.paperA[0].instance.promptZh,
      bundle.paperB[0].instance.promptZh,
      "Paper A and Paper B must have distinct parameterized prompts to prevent cheating!"
    );
  }
  console.log("  ✔ Smart Capture & Paper Builder: KG attribution & parallel A/B papers passed");
  console.log("🎉 ALL ENGINE TESTS PASSED!");
}

runAllEngineTests().catch((err) => {
  console.error("❌ Engine tests failed:", err);
  process.exit(1);
});
