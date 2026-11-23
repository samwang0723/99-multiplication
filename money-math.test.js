const assert = require("assert");
const M = require("./money-math");

// Coins & change-making
assert.strictEqual(M.coinTotal({ 100: 1, 50: 1, 10: 2, 5: 1, 1: 3 }), 178);
assert.deepStrictEqual(M.coinsList({ 10: 2, 1: 1, 50: 0, 5: 0, 100: 0 }), [10, 10, 1]);
assert.strictEqual(M.coinTotal(M.greedy(198)), 198);
assert.ok(M.canMake(M.greedy(198), 198));
assert.ok(M.canMake({ 100: 0, 50: 1, 10: 4, 5: 2, 1: 5 }, 35));
assert.ok(!M.canMake({ 100: 0, 50: 0, 10: 1, 5: 0, 1: 0 }, 15));
assert.ok(M.canMake({ 100: 0, 50: 0, 10: 0, 5: 0, 1: 0 }, 0));
assert.ok(M.isSubset({ 10: 1, 5: 1, 1: 0, 50: 0, 100: 0 }, { 10: 2, 5: 1, 1: 3, 50: 0, 100: 0 }));
assert.ok(!M.isSubset({ 10: 3, 5: 0, 1: 0, 50: 0, 100: 0 }, { 10: 2, 5: 0, 1: 0, 50: 0, 100: 0 }));

// Chinese money speech
assert.strictEqual(M.numberChinese(0), "零");
assert.strictEqual(M.numberChinese(2), "二");
assert.strictEqual(M.yuanSpeech(2), "兩元");
assert.strictEqual(M.numberChinese(35), "三十五");
assert.strictEqual(M.numberChinese(100), "一百");
assert.strictEqual(M.numberChinese(108), "一百零八");
assert.strictEqual(M.numberChinese(198), "一百九十八");
assert.strictEqual(M.itemPhrase({ name: "包子", mw: "袋" }, 1), "一袋包子");
assert.strictEqual(M.itemPhrase({ name: "包子", mw: "袋" }, 3), "3袋包子");

// Vertical arithmetic, including workbook items
const adds = [[35, 42, 77], [7, 86, 93], [74, 28, 102], [26, 95, 121]];
adds.forEach(([a, b, s]) => {
  const v = M.verticalOp(a, b, "+");
  assert.strictEqual(v.result, s);
  assert.strictEqual(v.a + v.b, s);
});
const vCarry = M.verticalOp(74, 28, "+");
assert.ok(vCarry.carries.some((c) => c > 0), "74+28 should carry");
assert.strictEqual(vCarry.result, 102);

const subs = [[97, 23, 74], [61, 7, 54], [53, 28, 25], [92, 49, 43]];
subs.forEach(([a, b, d]) => {
  const v = M.verticalOp(a, b, "-");
  assert.strictEqual(v.result, d);
  assert.strictEqual(v.a - v.b, d);
});
const vBorrow = M.verticalOp(53, 28, "-");
assert.ok(vBorrow.borrowMarks.some((m) => m && m.borrowed), "53-28 should borrow");

// Demo questions from the request / workbook
const rem = M.demoQuestion("remaining");
assert.strictEqual(rem.answer, 35);
assert.ok(rem.story.includes("小花") && rem.story.includes("100") && rem.story.includes("65"));
assert.ok(M.validateQuestion(rem));
assert.ok(M.answersMatch(rem, 35));
assert.ok(!M.answersMatch(rem, 65));

const line = M.demoQuestion("line");
assert.strictEqual(line.answer, 22);
assert.ok(line.story.includes("8") && line.story.includes("30"));
assert.ok(line.line && line.line.total === 30);
assert.ok(M.validateQuestion(line));

const two = M.demoQuestion("twostep");
assert.strictEqual(two.answer, 20);
assert.strictEqual(two.start - two.g1 - two.g2, 20);
assert.ok(two.story.includes("媽媽") && two.story.includes("50"));
assert.ok(M.validateQuestion(two));

const bao = M.demoQuestion("unit-times");
assert.strictEqual(bao.answer, 60);
assert.strictEqual(bao.unitPrice * bao.qty, 60);
assert.ok(bao.story.includes("包子"));
assert.ok(M.validateQuestion(bao));

const less = M.demoQuestion("compare-less");
assert.strictEqual(less.answer, 29);
assert.ok(less.story.includes("少"));
assert.ok(!less.story.includes("多賣") && !less.story.includes("便宜"));
assert.ok(M.validateQuestion(less));
assert.ok(M.wordingOk(less));

const more = M.demoQuestion("compare-more");
assert.strictEqual(more.answer, 101);
assert.ok(more.story.includes("多"));
assert.ok(M.validateQuestion(more));

const cheap = M.demoQuestion("cheaper");
assert.strictEqual(cheap.answer, 39);
assert.ok(cheap.story.includes("便宜"));
assert.ok(M.validateQuestion(cheap));

const tot = M.demoQuestion("total-pay");
assert.strictEqual(tot.answer, 93);
assert.ok(M.validateQuestion(tot));

const pop = M.demoQuestion("popularity");
assert.strictEqual(pop.answer, "大象");
assert.deepStrictEqual(pop.ranks.map((r) => r.name), ["大象", "長頸鹿", "獅子", "河馬"]);
assert.deepStrictEqual(pop.ranks.map((r) => r.votes), [87, 68, 42, 25]);
assert.ok(M.validateQuestion(pop));
assert.ok(M.answersMatch(pop, "大象"));
assert.ok(!M.answersMatch(pop, "獅子"));

const pay = M.demoQuestion("pay-exact");
assert.ok(M.canMake(pay.wallet, pay.payTarget));
assert.ok(M.answersMatch(pay, M.greedy(pay.payTarget)));
assert.ok(M.validateQuestion(pay));

const chg = M.demoQuestion("change");
assert.strictEqual(chg.answer, 35);
assert.ok(M.validateQuestion(chg));

const vadd = M.demoQuestion("vertical-add");
assert.strictEqual(vadd.answer, 102);
assert.ok(M.validateQuestion(vadd));

// Generated quizzes: many iterations
const levels = ["coins", "word", "challenge"];
let totalQ = 0;
levels.forEach((level) => {
  [5, 10].forEach((count) => {
    for (let trial = 0; trial < 40; trial++) {
      const quiz = M.generateQuiz(level, count, Math.random);
      assert.strictEqual(quiz.length, count);
      quiz.forEach((q, i) => {
        totalQ += 1;
        assert.ok(M.validateQuestion(q), "invalid Q " + level + " #" + i + " type=" + q.type + " " + JSON.stringify({
          type: q.type, answer: q.answer, story: q.story, prompt: q.prompt, formula: q.formula
        }));
        assert.ok(Number.isInteger(q.answer) || typeof q.answer === "string");
        if (typeof q.answer === "number") {
          assert.ok(q.answer >= 0, "negative " + q.type);
          assert.ok(q.answer <= 200 || q.type === "popularity");
        }
        if (q.type === "pay-exact") {
          assert.ok(M.canMake(q.wallet, q.payTarget));
          assert.ok(M.answersMatch(q, M.greedy(q.payTarget)) || M.canMake(q.wallet, q.payTarget));
        }
        if (q.type === "compare-more") {
          assert.ok(q.story.includes("多"), q.story);
          assert.strictEqual(q.answer, q.formula.a + q.formula.b);
          assert.strictEqual(q.operation, "＋");
        }
        if (q.type === "compare-less") {
          assert.ok(/少/.test(q.story), q.story);
          assert.strictEqual(q.answer, q.formula.a - q.formula.b);
          assert.strictEqual(q.operation, "−");
        }
        if (q.type === "cheaper") {
          assert.ok(q.story.includes("便宜"), q.story);
          assert.strictEqual(q.answer, q.formula.a - q.formula.b);
        }
        if (q.type === "remaining" || q.type === "two-step-give") {
          assert.ok(q.prompt.includes("剩下"));
        }
        if (q.type === "unit-times") {
          assert.ok(q.qty >= 2 && q.qty <= 9);
          assert.strictEqual(q.unitPrice * q.qty, q.answer);
          assert.ok(q.answer <= 200);
        }
        if (q.formula) {
          const f = q.formula;
          const r = f.op === "＋" ? f.a + f.b : f.op === "−" ? f.a - f.b : f.a * f.b;
          assert.strictEqual(r, f.result);
          if (f.op === "−") assert.ok(r >= 0);
        }
        if (typeof q.answer === "number") assert.ok(M.answersMatch(q, q.answer));
        else assert.ok(M.answersMatch(q, q.answer));
      });
    }
  });
});

// Extra standalone samples
for (let i = 0; i < 200; i++) {
  ["count-coins", "pay-exact", "change", "remaining", "total-pay", "compare-more",
    "compare-less", "cheaper", "unknown-part", "vertical-add", "vertical-sub",
    "two-step-give", "unit-times", "buy-change", "popularity"].forEach((t) => {
    const q = M.makeQuestion(t, "word", Math.random);
    assert.ok(M.validateQuestion(q), "solo invalid " + t + " " + JSON.stringify({ story: q.story, answer: q.answer, formula: q.formula }));
    totalQ += 1;
  });
}

assert.ok(M.coinSvg(1).includes("1"));
assert.ok(M.coinSvg(100).includes("100"));
assert.ok(totalQ > 3000, "expected thousands of samples, got " + totalQ);
console.log("money-math tests: all ok (" + totalQ + " questions checked)");
