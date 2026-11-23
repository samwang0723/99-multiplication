const assert = require("assert");
const R = require("./ruler-math");

// Geometry: ticks are evenly spaced, endpoints map exactly to cm
assert.strictEqual(R.GEOM.unit, 24);
assert.strictEqual(R.xOf(0), 30);
assert.strictEqual(R.xOf(15), 390);
assert.strictEqual(R.xOf(15) - R.xOf(0), 15 * R.GEOM.unit);
for (let cm = 0; cm <= 15; cm++) {
  assert.strictEqual(R.xOf(cm), 30 + cm * 24);
  if (cm > 0) assert.strictEqual(R.xOf(cm) - R.xOf(cm - 1), 24);
}

// Segments
const s = R.makeSegment(3, 10);
assert.strictEqual(s.length, 7);
assert.ok(R.inRuler(s));
assert.ok(!R.inRuler(R.makeSegment(-1, 4)));
assert.ok(!R.inRuler(R.makeSegment(0, 16)));
assert.ok(!R.inRuler(R.makeSegment(5, 5)));
assert.ok(!R.inRuler(R.makeSegment(8, 3)));

// From zero / offset generators
for (let i = 0; i < 80; i++) {
  const z = R.makeFromZeroSegment(Math.random);
  assert.strictEqual(z.start, 0);
  assert.ok(R.inRuler(z));
  assert.ok(z.length >= 3 && z.length <= 12);
  const o = R.makeOffsetSegment(Math.random);
  assert.ok(o.start >= 1);
  assert.ok(R.inRuler(o));
  assert.ok(o.length >= 2);
}

// Pairs: unequal by default, within ruler, often not from 0
let notFrom0 = 0;
for (let i = 0; i < 80; i++) {
  const p = R.makePair(Math.random, { allowEqual: false, forceUnequal: true });
  assert.ok(R.inRuler(p.a) && R.inRuler(p.b));
  assert.notStrictEqual(p.a.length, p.b.length);
  assert.ok(!(p.a.start === p.b.start && p.a.end === p.b.end));
  if (p.a.start !== 0 || p.b.start !== 0) notFrom0++;
}
assert.ok(notFrom0 > 40, "compare pairs should often not start at 0");

let equals = 0;
for (let i = 0; i < 40; i++) {
  const p = R.makePair(Math.random, { allowEqual: true });
  assert.ok(R.inRuler(p.a) && R.inRuler(p.b));
  if (p.a.length === p.b.length) equals++;
}
assert.ok(equals > 0, "allowEqual should be able to produce equal lengths");

// Compare + wording
const c1 = R.compareSegments(R.makeSegment(2, 11), R.makeSegment(5, 9));
assert.deepStrictEqual(c1, { longer: "A", shorter: "B", diff: 5, equal: false });
assert.strictEqual(R.longerPrompt(c1), "A比B長幾公分？");
assert.strictEqual(R.shorterPrompt(c1), "B比A短幾公分？");
const c2 = R.compareSegments(R.makeSegment(5, 9), R.makeSegment(1, 12));
assert.strictEqual(c2.longer, "B");
assert.strictEqual(R.longerPrompt(c2), "B比A長幾公分？");
assert.strictEqual(R.shorterPrompt(c2), "A比B短幾公分？");
const c3 = R.compareSegments(R.makeSegment(1, 6), R.makeSegment(8, 13));
assert.ok(c3.equal);

// Explain / common mistake 3到10 is 7 not 10
const ex = R.explainLength(R.makeSegment(3, 10));
assert.strictEqual(ex.length, 7);
assert.ok(ex.formula.includes("10 − 3 = 7"));
assert.ok(ex.warnEndOnly.includes("不是 10 公分"));
assert.deepStrictEqual(ex.hops, [1, 2, 3, 4, 5, 6, 7]);
const ex0 = R.explainLength(R.makeSegment(0, 8));
assert.ok(ex0.warnEndOnly.includes("8 公分"));
assert.ok(!ex0.warnEndOnly.includes("不是 8 公分"));

// Demo questions
const d0 = R.demoQuestion("from0");
assert.strictEqual(d0.a.start, 0);
assert.strictEqual(d0.answer, 8);
assert.ok(R.validateQuestion(d0));
const d1 = R.demoQuestion("not0");
assert.deepStrictEqual([d1.a.start, d1.a.end, d1.answer], [3, 10, 7]);
assert.ok(R.validateQuestion(d1));
const d2 = R.demoQuestion("compare");
assert.strictEqual(d2.prompt, "A比B長幾公分？");
assert.strictEqual(d2.answer, 5);
assert.ok(R.validateQuestion(d2));
assert.ok(R.answersMatch(d2, 5));
assert.ok(!R.answersMatch(d2, 9));
assert.ok(!R.answersMatch(d2, 11));

// Generated quizzes: many iterations
const levels = ["from0", "not0", "compare"];
levels.forEach((level) => {
  [5, 10].forEach((count) => {
    for (let trial = 0; trial < 25; trial++) {
      const quiz = R.generateQuiz(level, count, Math.random);
      assert.strictEqual(quiz.length, count);
      quiz.forEach((q, i) => {
        assert.ok(R.validateQuestion(q), "invalid Q " + level + " #" + i + " type=" + q.type + " " + JSON.stringify(q));
        assert.ok(R.inRuler(q.a));
        if (q.b) assert.ok(R.inRuler(q.b));
        if (level === "from0") assert.strictEqual(q.a.start, 0, "from0 must start at 0");
        if (level === "not0" && !q.b) assert.ok(q.a.start > 0, "not0 single line must not start at 0");
        if (q.type === "diff-long") {
          assert.ok(q.prompt.includes("長幾公分"));
          const longer = q.cmp.longer === "A" ? q.a : q.b;
          const shorter = q.cmp.shorter === "A" ? q.a : q.b;
          assert.ok(longer.length > shorter.length);
          assert.strictEqual(q.answer, longer.length - shorter.length);
          assert.ok(q.prompt.startsWith(q.cmp.longer + "比" + q.cmp.shorter));
        }
        if (q.type === "diff-short") {
          assert.ok(q.prompt.includes("短幾公分"));
          assert.ok(q.prompt.startsWith(q.cmp.shorter + "比" + q.cmp.longer));
          assert.strictEqual(q.answer, q.cmp.diff);
        }
        if (q.type === "which") {
          if (q.answer === "equal") assert.strictEqual(q.a.length, q.b.length);
          else assert.notStrictEqual(q.a.length, q.b.length);
        } else if (q.b && q.type !== "total" && q.type !== "length") {
          assert.notStrictEqual(q.a.length, q.b.length, q.type + " should avoid equal lengths");
        }
        if (q.type === "total") assert.strictEqual(q.answer, q.a.length + q.b.length);
        if (q.type === "length") {
          const seg = q.whichLine === "B" ? q.b : q.a;
          assert.strictEqual(q.answer, seg.length);
        }
        if (q.type === "formula") {
          const fa = q.formulaAnswer;
          assert.strictEqual(fa[0] - fa[1], fa[2]);
          assert.ok(R.answersMatch(q, fa));
          assert.ok(!R.answersMatch(q, [fa[0], fa[1], fa[2] + 1]));
        } else if (q.type !== "which") {
          assert.ok(R.answersMatch(q, q.answer));
        } else {
          assert.ok(R.answersMatch(q, q.answer));
          assert.ok(!R.answersMatch(q, q.answer === "A" ? "B" : "A"));
        }
      });
    }
  });
});

// answersMatch for formula order matters
const fq = R.demoQuestion("formula-offset");
assert.deepStrictEqual(fq.formulaAnswer, [12, 4, 8]);
assert.ok(R.answersMatch(fq, [12, 4, 8]));
assert.ok(!R.answersMatch(fq, [4, 12, 8]));

console.log("ruler-math tests: all ok");
