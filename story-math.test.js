"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const htmlPath = path.join(__dirname, "index.html");
const html = fs.readFileSync(htmlPath, "utf8");
const start = html.indexOf("/* STORY_GEN_START */");
const end = html.indexOf("/* STORY_GEN_END */");
assert.ok(start >= 0 && end > start, "STORY_GEN markers missing from index.html");
const code = html.slice(start, end + "/* STORY_GEN_END */".length);
const ctx = {};
vm.runInNewContext(code, ctx);

function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const selections = [[3], [7], [2, 5], [1], [9]];
let generated = 0;

for (const sel of selections) {
  const questions = ctx.generateStoryQuiz(sel, 400, mulberry32(sel.join("").length * 97 + sel[0] * 13));
  assert.strictEqual(questions.length, 400, "expected 400 questions for " + sel.join(","));
  for (const p of questions) {
    generated += 1;
    const errs = Array.from(ctx.validateStoryProblem(p) || []);
    assert.strictEqual(errs.length, 0, "invalid problem " + JSON.stringify({ sel, type: p.type, a: p.a, b: p.b, story: p.story, errs }));
    assert.ok(sel.indexOf(p.a) >= 0, "table a=" + p.a + " not in selection " + sel.join(",") + " story=" + p.story);
    assert.strictEqual(p.product, p.a * p.b, "wrong product");
    assert.ok(p.b >= 2 && p.b <= 9, "b out of range " + p.b);
  }

  // makeStoryProblem should not honor a forced table outside the selection
  const outsider = sel[0] === 7 ? 3 : 7;
  const forced = ctx.makeStoryProblem(sel, mulberry32(11), { a: outsider, b: 4, type: "mul" });
  assert.ok(forced, "expected a problem when forcing an outside table");
  assert.ok(sel.indexOf(forced.a) >= 0, "forced outside table leaked: a=" + forced.a + " sel=" + sel.join(","));
}

assert.strictEqual(ctx.generateStoryQuiz([], 5).length, 0);
assert.strictEqual(ctx.generateStoryQuiz(null, 5).length, 0);
assert.strictEqual(ctx.makeStoryProblem([], Math.random), null);

// All five story types still appear when only 7 or only 1 is selected
for (const sel of [[7], [1]]) {
  const types = new Set(ctx.generateStoryQuiz(sel, 50, mulberry32(42)).map((p) => p.type));
  for (const t of ["skip", "add", "bei", "mul", "names"]) {
    assert.ok(types.has(t), "missing type " + t + " for selection " + sel);
  }
}

console.log("story-math.test.js ok:", generated, "questions checked across", selections.length, "selections");
