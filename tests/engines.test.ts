import assert from "node:assert/strict";
import { ALL_QUESTION_TEMPLATES } from "../src/data/canonical-graph";
import { generateQuestion } from "../src/lib/engines/item-generator";
import {
  areAlgebraicExpressionsEquivalent,
  gradeQuestionResponse,
  parseRational,
  areRationalsEqual,
} from "../src/lib/engines/grader";
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
import { CANONICAL_EDGES } from "../src/data/canonical-graph";

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
  console.log("  ✔ Grader: rational, percentage, mixed-fraction & algebraic identity checks passed");

  // 2. Test All 90 Parameterized Question Templates (Self-consistency + Anti-memorization Twin Variants)
  for (const tpl of ALL_QUESTION_TEMPLATES) {
    const q0 = generateQuestion({
      templateId: tpl.id,
      seed: "unit_test_seed",
      regionCode: "SG",
      variantIndex: 0,
    });
    const q0Same = generateQuestion({
      templateId: tpl.id,
      seed: "unit_test_seed",
      regionCode: "SG",
      variantIndex: 0,
    });
    assert.equal(q0.promptZh, q0Same.promptZh, `Deterministic seed check failed for ${tpl.id}`);
    assert.ok(q0.promptZh.length > 5 && q0.promptEn.length > 5, `Bilingual prompt missing on ${tpl.id}`);

    // Must grade its own canonical answer as 100% correct!
    const selfGrade = gradeQuestionResponse(q0, q0.answer);
    assert.equal(
      selfGrade.isCorrect,
      true,
      `Template ${tpl.id} failed self-grading for answer "${q0.answer}"`
    );

    // Unordered multi-root reversal check (e.g. quadratic roots "5, -1" vs "-1, 5")
    if (q0.unorderedMulti && q0.itemType === "numeric") {
      const reversed = q0.answer.split(",").map((s) => s.trim()).reverse().join(", ");
      const revGrade = gradeQuestionResponse(q0, reversed);
      assert.equal(revGrade.isCorrect, true, `Unordered multi-root reversal failed on ${tpl.id}`);
    }
  }
  console.log(`  ✔ Item Generator: all ${ALL_QUESTION_TEMPLATES.length} templates passed self-grading & determinism`);

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
  }
  console.log("  ✔ Privacy Shield: 9-region PII stripping & math-token preservation passed");

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
