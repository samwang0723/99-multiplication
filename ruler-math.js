(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.RulerMath = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const RULER_MAX = 15;
  const GEOM = {
    viewW: 420,
    padL: 30,
    padR: 30,
    max: RULER_MAX,
    unit: 24
  };

  const LEVELS = ["from0", "not0", "compare"];
  const LEVEL_LABEL = {
    from0: "從0開始量",
    not0: "不從0開始量",
    compare: "兩條線比一比"
  };

  const SKINS = ["bar", "pencil", "crayon", "worm", "ribbon"];

  function xOf(cm, geom) {
    const g = geom || GEOM;
    return g.padL + Number(cm) * ((g.viewW - g.padL - g.padR) / g.max);
  }

  function randInt(rand, min, max) {
    const r = rand || Math.random;
    const lo = Math.ceil(min);
    const hi = Math.floor(max);
    return lo + Math.floor(r() * (hi - lo + 1));
  }

  function shuffle(arr, rand) {
    const r = rand || Math.random;
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function makeSegment(start, end) {
    const s = Math.round(Number(start));
    const e = Math.round(Number(end));
    return { start: s, end: e, length: e - s };
  }

  function inRuler(seg, max) {
    const m = max == null ? RULER_MAX : max;
    return !!seg && Number.isInteger(seg.start) && Number.isInteger(seg.end) &&
      seg.start >= 0 && seg.end <= m && seg.end > seg.start &&
      seg.length === seg.end - seg.start;
  }

  function makeFromZeroSegment(rand, max) {
    const m = max == null ? RULER_MAX : max;
    const length = randInt(rand, 3, Math.min(12, m));
    return makeSegment(0, length);
  }

  function makeOffsetSegment(rand, max) {
    const m = max == null ? RULER_MAX : max;
    const length = randInt(rand, 2, Math.min(9, m - 2));
    const maxStart = m - length;
    const start = randInt(rand, 1, Math.max(1, maxStart));
    return makeSegment(start, start + length);
  }

  function samePlace(a, b) {
    return a.start === b.start && a.end === b.end;
  }

  function makePair(rand, opts) {
    opts = opts || {};
    const max = opts.max == null ? RULER_MAX : opts.max;
    const allowEqual = !!opts.allowEqual;
    const forceUnequal = opts.forceUnequal !== false && !allowEqual;
    let a, b;
    for (let i = 0; i < 60; i++) {
      const aFrom0 = (opts.aFrom0 != null) ? opts.aFrom0 : (rand() < 0.22);
      const bFrom0 = (opts.bFrom0 != null) ? opts.bFrom0 : (rand() < 0.22);
      a = aFrom0 ? makeFromZeroSegment(rand, max) : makeOffsetSegment(rand, max);
      b = bFrom0 ? makeFromZeroSegment(rand, max) : makeOffsetSegment(rand, max);
      if (samePlace(a, b)) continue;
      if (forceUnequal && a.length === b.length) continue;
      if (allowEqual && a.length !== b.length) {
        // keep searching sometimes so equal pairs actually appear
        if (rand() < 0.7) continue;
      }
      if (allowEqual && a.length !== b.length && i < 40) continue;
      return { a, b };
    }
    // Fallback: construct a valid pair
    if (allowEqual) {
      a = makeSegment(2, 8);
      b = makeSegment(5, 11);
    } else {
      a = makeSegment(2, 11);
      b = makeSegment(5, 9);
    }
    return { a, b };
  }

  function compareSegments(a, b) {
    if (a.length > b.length) return { longer: "A", shorter: "B", diff: a.length - b.length, equal: false };
    if (b.length > a.length) return { longer: "B", shorter: "A", diff: b.length - a.length, equal: false };
    return { longer: null, shorter: null, diff: 0, equal: true };
  }

  function longerPrompt(cmp) {
    return cmp.longer + "比" + cmp.shorter + "長幾公分？";
  }

  function shorterPrompt(cmp) {
    return cmp.shorter + "比" + cmp.longer + "短幾公分？";
  }

  function formulaOf(seg) {
    return {
      left: seg.end,
      right: seg.start,
      result: seg.length,
      text: seg.end + " − " + seg.start + " = " + seg.length
    };
  }

  function explainLength(seg) {
    const hops = [];
    for (let i = 1; i <= seg.length; i++) hops.push(i);
    const formula = formulaOf(seg);
    return {
      start: seg.start,
      end: seg.end,
      length: seg.length,
      formula: formula.text + "公分",
      formulaParts: formula,
      hops,
      warnEndOnly: seg.start !== 0
        ? ("終點是 " + seg.end + "，可是不是 " + seg.end + " 公分喔！因為不是從 0 開始。長度是 " + formula.text + " 公分。")
        : ("從 0 開始量，終點指到 " + seg.end + "，就是 " + seg.length + " 公分。")
    };
  }

  function pickSkin(n, rand) {
    if (typeof n === "number" && n >= 0) return SKINS[n % SKINS.length];
    return SKINS[randInt(rand || Math.random, 0, SKINS.length - 1)];
  }

  function typePlan(level, count, rand) {
    let bag;
    if (level === "from0") bag = ["length", "length", "length", "formula"];
    else if (level === "not0") bag = ["length", "length", "formula", "length", "formula"];
    else bag = ["which", "diff-long", "diff-short", "total", "formula", "which", "diff-long", "length"];
    const out = [];
    for (let i = 0; i < count; i++) out.push(bag[i % bag.length]);
    return shuffle(out, rand);
  }

  function makeQuestion(type, level, rand, opts) {
    rand = rand || Math.random;
    opts = opts || {};
    const q = { type, level, a: null, b: null, prompt: "", speech: "", answer: null };
    if (level === "from0" || type === "length" && level !== "compare" && !opts.forceOffset) {
      if (level === "from0") q.a = opts.a || makeFromZeroSegment(rand);
      else if (level === "not0") q.a = opts.a || makeOffsetSegment(rand);
      else q.a = opts.a || (rand() < 0.3 ? makeFromZeroSegment(rand) : makeOffsetSegment(rand));
    } else if (level === "not0") {
      q.a = opts.a || makeOffsetSegment(rand);
    }

    if (type === "length" && level !== "compare") {
      if (level === "from0") q.a = opts.a || makeFromZeroSegment(rand);
      if (level === "not0") q.a = opts.a || makeOffsetSegment(rand);
      q.prompt = "這條線有幾公分？";
      q.speech = "看看這條線，從起點量到終點，一共有幾公分？";
      q.answer = q.a.length;
      q.formula = formulaOf(q.a);
    } else if (type === "formula" && level !== "compare") {
      if (level === "from0") q.a = opts.a || makeFromZeroSegment(rand);
      if (level === "not0") q.a = opts.a || makeOffsetSegment(rand);
      q.prompt = "請填寫算式：終點 − 起點 = 長度";
      q.speech = "請填寫終點減起點等於長度。";
      q.formula = formulaOf(q.a);
      q.answer = q.a.length;
      q.formulaAnswer = [q.a.end, q.a.start, q.a.length];
    } else {
      // compare-level types (and length/formula on compare)
      const allowEqual = type === "which" && (opts.allowEqual === true || (opts.allowEqual !== false && rand() < 0.16));
      const pair = opts.pair || makePair(rand, { allowEqual, forceUnequal: !allowEqual });
      q.a = pair.a;
      q.b = pair.b;
      const cmp = compareSegments(q.a, q.b);
      q.cmp = cmp;
      if (type === "which") {
        q.prompt = "A和B哪一條比較長？";
        q.speech = "A和B哪一條比較長？如果一樣長就選一樣長。";
        q.answer = cmp.equal ? "equal" : cmp.longer;
        q.options = ["A", "B", "equal"];
      } else if (type === "diff-long") {
        if (cmp.equal) {
          // regenerate unequal
          const p2 = makePair(rand, { allowEqual: false, forceUnequal: true });
          q.a = p2.a; q.b = p2.b;
          q.cmp = compareSegments(q.a, q.b);
        }
        q.prompt = longerPrompt(q.cmp);
        q.speech = q.prompt;
        q.answer = q.cmp.diff;
      } else if (type === "diff-short") {
        if (cmp.equal) {
          const p2 = makePair(rand, { allowEqual: false, forceUnequal: true });
          q.a = p2.a; q.b = p2.b;
          q.cmp = compareSegments(q.a, q.b);
        }
        q.prompt = shorterPrompt(q.cmp);
        q.speech = q.prompt;
        q.answer = q.cmp.diff;
      } else if (type === "total") {
        q.prompt = "如果把 A 和 B 接起來，一共有幾公分？";
        q.speech = "把 A 和 B 的長度加起來，一共有幾公分？";
        q.answer = q.a.length + q.b.length;
      } else if (type === "formula") {
        if (cmp.equal) {
          const p2 = makePair(rand, { allowEqual: false, forceUnequal: true });
          q.a = p2.a; q.b = p2.b;
          q.cmp = compareSegments(q.a, q.b);
        }
        const longer = q.cmp.longer === "A" ? q.a : q.b;
        const shorter = q.cmp.shorter === "A" ? q.a : q.b;
        q.prompt = "請填寫算式：長的 − 短的 = 相差幾公分";
        q.speech = "請填寫長的減短的，等於相差幾公分。";
        q.formulaAnswer = [longer.length, shorter.length, q.cmp.diff];
        q.answer = q.cmp.diff;
        q.formula = { left: longer.length, right: shorter.length, result: q.cmp.diff, text: longer.length + " − " + shorter.length + " = " + q.cmp.diff };
      } else if (type === "length") {
        const which = opts.whichLine || (rand() < 0.5 ? "A" : "B");
        q.whichLine = which;
        const seg = which === "A" ? q.a : q.b;
        q.prompt = which + " 這條線有幾公分？";
        q.speech = "請量量看 " + which + " 有幾公分。";
        q.answer = seg.length;
        q.formula = formulaOf(seg);
      } else {
        q.prompt = "A和B哪一條比較長？";
        q.speech = q.prompt;
        q.answer = cmp.equal ? "equal" : cmp.longer;
      }
    }
    q.explainA = explainLength(q.a);
    if (q.b) q.explainB = explainLength(q.b);
    return q;
  }

  function answersMatch(q, given) {
    if (!q) return false;
    if (q.type === "formula" && Array.isArray(given)) {
      const exp = q.formulaAnswer;
      return exp && given.length === 3 &&
        Number(given[0]) === Number(exp[0]) &&
        Number(given[1]) === Number(exp[1]) &&
        Number(given[2]) === Number(exp[2]);
    }
    if (q.type === "which") return String(given) === String(q.answer);
    return Number(given) === Number(q.answer);
  }

  function wordingOk(q) {
    if (q.type === "diff-long") {
      const m = q.prompt.match(/^([AB])比([AB])長幾公分？$/);
      if (!m) return false;
      if (m[1] !== q.cmp.longer || m[2] !== q.cmp.shorter) return false;
      if (q.cmp.equal) return false;
      const longer = q.cmp.longer === "A" ? q.a : q.b;
      const shorter = q.cmp.shorter === "A" ? q.a : q.b;
      return longer.length > shorter.length && q.answer === longer.length - shorter.length;
    }
    if (q.type === "diff-short") {
      const m = q.prompt.match(/^([AB])比([AB])短幾公分？$/);
      if (!m) return false;
      if (m[1] !== q.cmp.shorter || m[2] !== q.cmp.longer) return false;
      if (q.cmp.equal) return false;
      return q.answer === q.cmp.diff;
    }
    if (q.type === "which") {
      if (q.answer === "equal") return q.a.length === q.b.length;
      if (q.answer === "A") return q.a.length > q.b.length;
      if (q.answer === "B") return q.b.length > q.a.length;
      return false;
    }
    if (q.type === "total") return q.answer === q.a.length + q.b.length;
    if (q.type === "length") {
      const seg = q.whichLine === "B" ? q.b : q.a;
      return q.answer === seg.length;
    }
    if (q.type === "formula") {
      if (q.level === "compare") {
        return q.formulaAnswer[0] - q.formulaAnswer[1] === q.formulaAnswer[2] && q.answer === q.cmp.diff;
      }
      return q.formulaAnswer[0] === q.a.end && q.formulaAnswer[1] === q.a.start && q.formulaAnswer[2] === q.a.length;
    }
    return true;
  }

  function validateQuestion(q, max) {
    const m = max == null ? RULER_MAX : max;
    if (!q || !inRuler(q.a, m)) return false;
    if (q.b && !inRuler(q.b, m)) return false;
    if (q.level === "from0" && q.a.start !== 0) return false;
    if (q.level === "not0" && q.type !== "which" && q.a && !q.b && q.a.start === 0) return false;
    if (q.level === "not0" && !q.b && q.a.start === 0) return false;
    if ((q.type === "diff-long" || q.type === "diff-short") && q.a.length === q.b.length) return false;
    if (q.type !== "which" && q.b && q.a.length === q.b.length && q.type !== "total" && q.type !== "length") return false;
    return wordingOk(q);
  }

  function generateQuiz(level, count, rand) {
    rand = rand || Math.random;
    const n = Math.max(1, Math.round(Number(count) || 5));
    const types = typePlan(level, n, rand);
    return types.map((t) => makeQuestion(t, level, rand));
  }

  function demoQuestion(kind) {
    if (kind === "from0") {
      return makeQuestion("length", "from0", Math.random, { a: makeSegment(0, 8) });
    }
    if (kind === "not0") {
      return makeQuestion("length", "not0", Math.random, { a: makeSegment(3, 10) });
    }
    if (kind === "compare" || kind === "diff-long") {
      return makeQuestion("diff-long", "compare", Math.random, { pair: { a: makeSegment(2, 11), b: makeSegment(5, 9) }, allowEqual: false });
    }
    if (kind === "which") {
      return makeQuestion("which", "compare", Math.random, { pair: { a: makeSegment(2, 11), b: makeSegment(5, 9) }, allowEqual: false });
    }
    if (kind === "formula-offset") {
      return makeQuestion("formula", "not0", Math.random, { a: makeSegment(4, 12) });
    }
    return makeQuestion("diff-long", "compare", Math.random, { pair: { a: makeSegment(2, 11), b: makeSegment(5, 9) } });
  }

  return {
    RULER_MAX,
    GEOM,
    LEVELS,
    LEVEL_LABEL,
    SKINS,
    xOf,
    randInt,
    shuffle,
    makeSegment,
    inRuler,
    makeFromZeroSegment,
    makeOffsetSegment,
    makePair,
    compareSegments,
    longerPrompt,
    shorterPrompt,
    formulaOf,
    explainLength,
    pickSkin,
    typePlan,
    makeQuestion,
    answersMatch,
    wordingOk,
    validateQuestion,
    generateQuiz,
    demoQuestion
  };
});
