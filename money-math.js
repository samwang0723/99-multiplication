(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MoneyMath = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const DENOMS = [100, 50, 10, 5, 1];
  const COIN_META = {
    1: { label: "1元", kind: "coin", color: "#d49a5a", ring: "#8a5a28", ink: "#3a2a14", size: 44, caption: "1元銅板" },
    5: { label: "5元", kind: "coin", color: "#e0b060", ring: "#9a7028", ink: "#3a2a14", size: 52, caption: "5元銅板" },
    10: { label: "10元", kind: "coin", color: "#d8d6d2", ring: "#6a6a6a", ink: "#2a2a2a", size: 58, caption: "10元銅板" },
    50: { label: "50元", kind: "coin", color: "#f2d24a", ring: "#b8860b", ink: "#5a3d00", size: 66, caption: "50元銅板" },
    100: { label: "100元", kind: "note", color: "#e85d6a", ring: "#9a2030", ink: "#fff", size: 86, caption: "100元鈔票" }
  };

  const LEVELS = ["coins", "word", "challenge"];
  const LEVEL_LABEL = {
    coins: "錢幣與付錢",
    word: "加減應用題",
    challenge: "挑戰題"
  };
  const TYPE_LABEL = {
    "count-coins": "數一數",
    "pay-exact": "付錢",
    "change": "找錢",
    "remaining": "剩下幾元",
    "total-pay": "共要付",
    "compare-more": "比多",
    "compare-less": "比少",
    "cheaper": "便宜",
    "unknown-part": "線段圖",
    "vertical-add": "直式加法",
    "vertical-sub": "直式減法",
    "two-step-give": "連續給錢",
    "unit-times": "買好幾個",
    "buy-change": "買了再找錢",
    "popularity": "人氣王"
  };

  const NAMES = ["小花", "小妍", "阿偉", "羅力", "奇奇", "小華", "小明", "婷婷", "小宇", "小樂", "小安"];
  const FAMILY = ["媽媽", "爸爸", "奶奶", "爺爺", "哥哥", "妹妹"];
  const ANIMALS = ["獅子", "河馬", "長頸鹿", "大象", "老虎", "熊貓", "兔子", "企鵝", "猴子", "斑馬"];

  const SHOP_ITEMS = [
    { id: "cake", name: "蛋糕", mw: "個", emoji: "🍰", price: 65 },
    { id: "bao", name: "包子", mw: "袋", emoji: "🥟", price: 20 },
    { id: "juice", name: "果汁", mw: "杯", emoji: "🧃", price: 25 },
    { id: "toy", name: "玩具", mw: "個", emoji: "🧸", price: 40 },
    { id: "crayon", name: "蠟筆", mw: "盒", emoji: "🖍️", price: 35 },
    { id: "pencil", name: "鉛筆", mw: "枝", emoji: "✏️", price: 10 },
    { id: "notebook", name: "筆記本", mw: "本", emoji: "📓", price: 30 },
    { id: "milk", name: "牛奶", mw: "瓶", emoji: "🥛", price: 28 }
  ];

  const BUY_ITEMS = [
    { name: "蛋糕", mw: "個", emoji: "🍰", prices: [25, 35, 45, 55, 65, 75] },
    { name: "包子", mw: "袋", emoji: "🥟", prices: [10, 15, 20, 25, 30] },
    { name: "果汁", mw: "杯", emoji: "🧃", prices: [15, 20, 25, 30, 35] },
    { name: "西瓜汁", mw: "杯", emoji: "🍉", prices: [15, 20, 25, 30] },
    { name: "芭樂汁", mw: "杯", emoji: "🧃", prices: [15, 20, 25, 30] },
    { name: "玩具", mw: "個", emoji: "🧸", prices: [40, 50, 60, 70] },
    { name: "蠟筆", mw: "盒", emoji: "🖍️", prices: [28, 35, 42, 48, 56] },
    { name: "鉛筆", mw: "枝", emoji: "✏️", prices: [8, 10, 12, 15] },
    { name: "筆記本", mw: "本", emoji: "📓", prices: [20, 25, 30, 35, 40] },
    { name: "牛奶", mw: "瓶", emoji: "🥛", prices: [18, 22, 25, 30] },
    { name: "優酪乳", mw: "瓶", emoji: "🥛", prices: [28, 35, 42, 63] },
    { name: "撲克牌", mw: "盒", emoji: "🃏", prices: [25, 35, 40, 45] },
    { name: "遊戲卡", mw: "盒", emoji: "🎴", prices: [48, 58, 68] },
    { name: "早餐", mw: "份", emoji: "🥐", prices: [38, 45, 48, 55] }
  ];

  const CN = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

  function emptyCounts() {
    return { 100: 0, 50: 0, 10: 0, 5: 0, 1: 0 };
  }

  function copyCounts(c) {
    const o = emptyCounts();
    DENOMS.forEach((d) => { o[d] = Math.max(0, Math.round(Number((c && c[d]) || 0))); });
    return o;
  }

  function coinTotal(counts) {
    return DENOMS.reduce((s, d) => s + d * ((counts && counts[d]) || 0), 0);
  }

  function coinsList(counts) {
    const out = [];
    DENOMS.forEach((d) => {
      const n = (counts && counts[d]) || 0;
      for (let i = 0; i < n; i++) out.push(d);
    });
    return out;
  }

  function countsFromList(list) {
    const o = emptyCounts();
    (list || []).forEach((d) => { if (o[d] != null) o[d] += 1; });
    return o;
  }

  function coinCount(counts) {
    return DENOMS.reduce((s, d) => s + ((counts && counts[d]) || 0), 0);
  }

  function isSubset(used, wallet) {
    return DENOMS.every((d) => ((used && used[d]) || 0) <= ((wallet && wallet[d]) || 0));
  }

  function greedy(amount) {
    const o = emptyCounts();
    let rest = Math.max(0, Math.round(Number(amount) || 0));
    DENOMS.forEach((d) => {
      o[d] = Math.floor(rest / d);
      rest -= o[d] * d;
    });
    return o;
  }

  function canMake(counts, amount) {
    const target = Math.round(Number(amount));
    if (!Number.isInteger(target) || target < 0) return false;
    if (target === 0) return true;
    const dp = new Array(target + 1).fill(false);
    dp[0] = true;
    for (let i = 0; i < DENOMS.length; i++) {
      const d = DENOMS[i];
      const c = (counts && counts[d]) || 0;
      const next = dp.slice();
      for (let a = 0; a <= target; a++) {
        if (!dp[a]) continue;
        for (let k = 1; k <= c && a + k * d <= target; k++) next[a + k * d] = true;
      }
      for (let a = 0; a <= target; a++) dp[a] = next[a];
    }
    return dp[target];
  }

  function randInt(rand, min, max) {
    const r = rand || Math.random;
    const lo = Math.ceil(min);
    const hi = Math.floor(max);
    if (hi < lo) return lo;
    return lo + Math.floor(r() * (hi - lo + 1));
  }

  function pick(arr, rand) {
    return arr[Math.floor((rand || Math.random)() * arr.length)];
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

  function numberChinese(n) {
    n = Math.round(Number(n) || 0);
    if (n < 0) n = 0;
    if (n <= 9) return CN[n];
    if (n === 10) return "十";
    if (n < 20) return "十" + CN[n - 10];
    if (n < 100) {
      const tens = Math.floor(n / 10);
      const ones = n % 10;
      return CN[tens] + "十" + (ones ? CN[ones] : "");
    }
    if (n === 100) return "一百";
    if (n < 200) {
      const rest = n - 100;
      if (rest === 0) return "一百";
      if (rest < 10) return "一百零" + CN[rest];
      return "一百" + numberChinese(rest);
    }
    if (n < 1000) {
      const hun = Math.floor(n / 100);
      const rest = n % 100;
      let s = CN[hun] + "百";
      if (!rest) return s;
      if (rest < 10) return s + "零" + CN[rest];
      return s + numberChinese(rest);
    }
    return String(n);
  }

  function yuanSpeech(n) {
    if (n === 2) return "兩元";
    return numberChinese(n) + "元";
  }

  function itemPhrase(item, qty) {
    qty = qty == null ? 1 : qty;
    const mw = item.mw || "個";
    if (qty === 1) return "一" + mw + item.name;
    return qty + mw + item.name;
  }

  function verticalOp(a, b, op) {
    a = Math.round(Number(a));
    b = Math.round(Number(b));
    const result = op === "+" ? a + b : a - b;
    const width = String(Math.max(a, b, result, 0)).length;
    function digitsOf(n) {
      const s = String(Math.max(0, n)).padStart(width, " ");
      return s.split("").map((ch) => (ch === " " ? null : Number(ch)));
    }
    const carries = new Array(width).fill(0);
    const borrowMarks = new Array(width).fill(null);
    if (op === "+") {
      let carry = 0;
      for (let i = width - 1; i >= 0; i--) {
        const da = digitsOf(a)[i] || 0;
        const db = digitsOf(b)[i] || 0;
        const sum = da + db + carry;
        const nextCarry = Math.floor(sum / 10);
        if (i > 0) carries[i - 1] = nextCarry;
        else if (nextCarry) {
          // overflow already included in width
        }
        carry = nextCarry;
      }
      // carries[i] = carry written above column i (into that column)
      // Recompute properly: carry into column i
      const into = new Array(width).fill(0);
      let c = 0;
      for (let col = 0; col < width; col++) {
        const i = width - 1 - col;
        into[i] = c;
        const da = digitsOf(a)[i] || 0;
        const db = digitsOf(b)[i] || 0;
        c = Math.floor((da + db + c) / 10);
      }
      for (let i = 0; i < width; i++) carries[i] = into[i];
    } else {
      // borrow marks: for each column, {needed, after}
      const ad = digitsOf(a).map((d) => (d == null ? 0 : d));
      const bd = digitsOf(b).map((d) => (d == null ? 0 : d));
      const work = ad.slice();
      for (let i = width - 1; i >= 0; i--) {
        if (work[i] < bd[i]) {
          let j = i - 1;
          while (j >= 0 && work[j] === 0) j--;
          if (j >= 0) {
            work[j] -= 1;
            for (let k = j + 1; k < i; k++) work[k] += 9;
            work[i] += 10;
            borrowMarks[i] = { borrowed: true, shown: work[i], leftAfter: work[j] };
          }
        }
        work[i] -= bd[i];
      }
    }
    return {
      a, b, op, result, width,
      aDigits: digitsOf(a),
      bDigits: digitsOf(b),
      resultDigits: digitsOf(result),
      carries,
      borrowMarks
    };
  }

  function explainVertical(v) {
    if (!v) return "";
    if (v.op === "+") {
      const hasCarry = v.carries.some((c) => c);
      return v.a + " + " + v.b + " = " + v.result + (hasCarry ? "（有進位）" : "");
    }
    const hasBorrow = (v.borrowMarks || []).some((m) => m && m.borrowed);
    return v.a + " − " + v.b + " = " + v.result + (hasBorrow ? "（有退位）" : "");
  }

  function baseQuestion(type, level) {
    return {
      type, level,
      typeLabel: TYPE_LABEL[type] || type,
      levelLabel: LEVEL_LABEL[level] || level,
      story: "",
      speech: "",
      prompt: "",
      hint: "",
      explain: "",
      answer: 0,
      answerUnit: "元",
      answerLabel: "",
      operation: null,
      formula: null,
      formulaAnswer: null,
      needsOp: false,
      needsFormula: false,
      picture: null,
      coinsShown: null,
      wallet: null,
      payTarget: null,
      line: null,
      vertical: null,
      choices: null,
      ranks: null
    };
  }

  function finish(q) {
    if (!q.answerLabel) {
      if (typeof q.answer === "number") q.answerLabel = q.answer + (q.answerUnit ? " " + q.answerUnit : "");
      else q.answerLabel = String(q.answer);
    }
    if (!q.speech) q.speech = (q.story || "") + (q.prompt || "");
    if (q.formula && !q.formulaAnswer) {
      q.formulaAnswer = [q.formula.a, q.formula.b, q.formula.result];
    }
    return q;
  }

  function randomCoinSet(rand, opts) {
    opts = opts || {};
    const minTotal = opts.minTotal == null ? 8 : opts.minTotal;
    const maxTotal = opts.maxTotal == null ? 100 : opts.maxTotal;
    const maxCoins = opts.maxCoins == null ? 8 : opts.maxCoins;
    for (let i = 0; i < 60; i++) {
      const c = emptyCounts();
      c[100] = (maxTotal >= 100 && rand() < 0.12) ? 1 : 0;
      c[50] = randInt(rand, 0, maxTotal >= 50 ? 2 : 0);
      c[10] = randInt(rand, 0, 5);
      c[5] = randInt(rand, 0, 3);
      c[1] = randInt(rand, 0, 4);
      const n = coinCount(c);
      const t = coinTotal(c);
      if (n >= 2 && n <= maxCoins && t >= minTotal && t <= maxTotal) return c;
    }
    const fb = emptyCounts();
    fb[50] = 1; fb[10] = 2; fb[5] = 1; fb[1] = 3;
    return fb;
  }

  function makeCountCoins(rand, fixed) {
    const q = baseQuestion("count-coins", "coins");
    const coins = (fixed && fixed.coins) ? copyCounts(fixed.coins) : randomCoinSet(rand, { minTotal: 6, maxTotal: 100, maxCoins: 8 });
    const total = coinTotal(coins);
    q.coinsShown = coins;
    q.picture = { coins: coins };
    q.answer = total;
    q.story = "看看這些錢幣。";
    q.prompt = "這些錢一共幾元？";
    q.speech = "看看這些錢幣。這些錢一共幾元？";
    q.hint = "先把同樣的錢幣加起來，再全部加在一起。100、50、10、5、1 慢慢加。";
    q.explain = "全部加起來是 " + total + " 元。";
    q.needsOp = false;
    return finish(q);
  }

  function makePayExact(rand, fixed) {
    const q = baseQuestion("pay-exact", "coins");
    let target, wallet;
    if (fixed && fixed.target != null && fixed.wallet) {
      target = fixed.target;
      wallet = copyCounts(fixed.wallet);
    } else {
      target = randInt(rand, 12, 95);
      const sol = greedy(target);
      wallet = copyCounts(sol);
      // Sometimes add extra coins so more than one way exists, but the solution remains possible
      if (rand() < 0.7) {
        const extras = [1, 5, 10, 50];
        const extra = pick(extras.filter((d) => d < 100), rand);
        if (coinCount(wallet) < 8) wallet[extra] = (wallet[extra] || 0) + 1;
      }
      if (rand() < 0.35 && coinCount(wallet) < 8) wallet[1] = (wallet[1] || 0) + randInt(rand, 1, 2);
    }
    const item = (fixed && fixed.item) || pick(BUY_ITEMS, rand);
    const price = target;
    q.wallet = wallet;
    q.payTarget = target;
    q.answer = target;
    q.picture = { item: item.name, emoji: item.emoji, mw: item.mw, price: price };
    q.story = itemPhrase(item, 1) + " " + price + " 元。請剛好付給老闆。";
    q.prompt = "請點選錢幣，剛好付 " + price + " 元。";
    q.speech = itemPhrase(item, 1) + " " + yuanSpeech(price) + "。請剛好付給老闆 " + yuanSpeech(price) + "。";
    q.hint = "可以先用比較大的錢幣，不夠再用小的。付的總額要剛好是 " + price + " 元。";
    q.explain = "要剛好付 " + price + " 元。例如可以這樣付：" + coinsList(greedy(target)).map((d) => d + "元").join("、") + "。";
    q.needsOp = false;
    return finish(q);
  }

  function makeChange(rand, fixed) {
    const q = baseQuestion("change", "coins");
    const paid = (fixed && fixed.paid) || (rand() < 0.55 ? 100 : 50);
    let price, item;
    if (fixed && fixed.price != null) {
      price = fixed.price;
      item = fixed.item || { name: "蛋糕", mw: "個", emoji: "🍰" };
    } else {
      const lo = paid === 50 ? 8 : 15;
      const hi = paid - 5;
      price = randInt(rand, lo, Math.min(hi, paid === 50 ? 45 : 95));
      item = pick(BUY_ITEMS.filter((it) => it.prices.some((p) => p < paid)) || BUY_ITEMS, rand);
    }
    const change = paid - price;
    q.picture = { item: item.name, emoji: item.emoji, mw: item.mw, price: price, paid: paid };
    q.answer = change;
    q.operation = "−";
    q.needsOp = true;
    q.formula = { a: paid, op: "−", b: price, result: change };
    q.vertical = verticalOp(paid, price, "−");
    q.story = "你拿了 " + paid + " 元，買" + itemPhrase(item, 1) + "要 " + price + " 元。";
    q.prompt = "老闆應該找你幾元？";
    q.speech = "你拿了" + yuanSpeech(paid) + "，買" + itemPhrase(item, 1) + "要" + yuanSpeech(price) + "。老闆應該找你幾元？";
    q.hint = "找錢要用減法：拿出的錢減掉要付的錢。";
    q.explain = paid + " − " + price + " = " + change + " 元。";
    return finish(q);
  }

  function makeRemaining(rand, fixed) {
    const q = baseQuestion("remaining", "word");
    const name = (fixed && fixed.name) || pick(NAMES, rand);
    const have = (fixed && fixed.have) || pick([50, 80, 100, 100, 90, 70], rand);
    let item, price;
    if (fixed && fixed.price != null) {
      price = fixed.price;
      item = fixed.item || { name: "蛋糕", mw: "個", emoji: "🍰" };
    } else {
      item = pick(BUY_ITEMS, rand);
      const cands = item.prices.filter((p) => p < have && have - p >= 1 && have - p <= 90);
      price = cands.length ? pick(cands, rand) : randInt(rand, 8, have - 5);
    }
    const left = have - price;
    q.answer = left;
    q.operation = "−";
    q.needsOp = true;
    q.needsFormula = true;
    q.formula = { a: have, op: "−", b: price, result: left };
    q.vertical = verticalOp(have, price, "−");
    q.picture = { item: item.name, emoji: item.emoji, mw: item.mw, price: price };
    q.story = name + "有 " + have + " 元，買了 " + price + " 元的" + item.name + "。";
    q.prompt = "剩下幾元？";
    q.speech = name + "有" + yuanSpeech(have) + "，買了" + yuanSpeech(price) + "的" + item.name + "，剩下幾元？";
    q.hint = "剩下的錢＝本來有的 − 花掉的。";
    q.explain = have + " − " + price + " = " + left + " 元。";
    q.line = {
      total: have, totalLabel: "本來有", unit: "元",
      parts: [
        { label: "買" + item.name, value: price },
        { label: "剩下", value: null, answer: left }
      ]
    };
    return finish(q);
  }

  function makeTotalPay(rand, fixed) {
    const q = baseQuestion("total-pay", "word");
    const name = (fixed && fixed.name) || pick(NAMES.concat(["羅力"]), rand);
    let a, b, itemA, itemB;
    if (fixed && fixed.a != null) {
      a = fixed.a; b = fixed.b; itemA = fixed.itemA; itemB = fixed.itemB;
    } else {
      const pair = shuffle(BUY_ITEMS, rand);
      itemA = pair[0]; itemB = pair[1];
      a = pick(itemA.prices, rand);
      b = pick(itemB.prices, rand);
      if (a + b > 200) { a = Math.min(a, 80); b = Math.min(b, 80); }
    }
    const sum = a + b;
    q.answer = sum;
    q.operation = "＋";
    q.needsOp = true;
    q.needsFormula = true;
    q.formula = { a, op: "＋", b, result: sum };
    q.vertical = verticalOp(a, b, "+");
    q.picture = { items: [
      { name: itemA.name, emoji: itemA.emoji, mw: itemA.mw, price: a },
      { name: itemB.name, emoji: itemB.emoji, mw: itemB.mw, price: b }
    ]};
    q.story = itemPhrase(itemA, 1) + " " + a + " 元，" + itemPhrase(itemB, 1) + " " + b + " 元。" + name + "各買 1 " + itemA.mw + "和 1 " + itemB.mw + "。";
    q.prompt = "共要付多少元？";
    q.speech = itemPhrase(itemA, 1) + yuanSpeech(a) + "，" + itemPhrase(itemB, 1) + yuanSpeech(b) + "，" + name + "各買一個，共要付多少元？";
    q.hint = "把兩樣東西的價錢加起來。";
    q.explain = a + " + " + b + " = " + sum + " 元。";
    q.line = {
      total: sum, totalLabel: "共", unit: "元",
      parts: [
        { label: itemA.name, value: a },
        { label: itemB.name, value: b }
      ]
    };
    return finish(q);
  }

  function makeCompare(rand, kind, fixed) {
    // kind: "more" | "less" | "cheaper"
    const type = kind === "more" ? "compare-more" : kind === "cheaper" ? "cheaper" : "compare-less";
    const q = baseQuestion(type, "word");
    const nameA = (fixed && fixed.nameA) || pick(NAMES, rand);
    let nameB = (fixed && fixed.nameB) || pick(NAMES.filter((n) => n !== nameA), rand);
    if (nameB === nameA) nameB = NAMES.find((n) => n !== nameA);
    q.nameA = nameA; q.nameB = nameB;

    if (kind === "cheaper") {
      const item = (fixed && fixed.item) || pick(BUY_ITEMS, rand);
      const original = (fixed && fixed.original) || pick(item.prices.concat([63, 80, 75, 52]), rand);
      let off = (fixed && fixed.off != null) ? fixed.off : randInt(rand, 8, 28);
      if (off >= original) off = Math.max(5, original - 6);
      const now = original - off;
      q.answer = now;
      q.operation = "−";
      q.needsOp = true;
      q.needsFormula = true;
      q.formula = { a: original, op: "−", b: off, result: now };
      q.vertical = verticalOp(original, off, "−");
      q.picture = { item: item.name, emoji: item.emoji, mw: item.mw, price: original };
      q.story = itemPhrase(item, 1) + "原來賣 " + original + " 元，活動期間比原來便宜 " + off + " 元。";
      q.prompt = "活動期間一" + item.mw + "賣幾元？";
      q.speech = itemPhrase(item, 1) + "原來賣" + yuanSpeech(original) + "，活動期間比原來便宜" + yuanSpeech(off) + "，活動期間賣幾元？";
      q.hint = "看到「便宜」，要用減法：原來的價錢減掉便宜的金額。";
      q.explain = "便宜要用減法。" + original + " − " + off + " = " + now + " 元。";
      q.compareKind = "cheaper";
      q.base = original;
      q.diff = off;
      return finish(q);
    }

    if (kind === "more") {
      const templates = [
        function () {
          const item = pick([{ name: "西瓜汁", mw: "杯", emoji: "🍉" }, { name: "果汁", mw: "杯", emoji: "🧃" }, { name: "牛奶", mw: "瓶", emoji: "🥛" }], rand);
          const other = item.name === "西瓜汁" ? { name: "芭樂汁", mw: "杯", emoji: "🧃" } : { name: "芭樂汁", mw: "杯", emoji: "🧃" };
          const base = (fixed && fixed.base) || randInt(rand, 28, 82);
          const more = (fixed && fixed.diff) || randInt(rand, 9, 25);
          const ans = base + more;
          if (ans > 200) return null;
          q.answer = ans;
          q.operation = "＋";
          q.formula = { a: base, op: "＋", b: more, result: ans };
          q.vertical = verticalOp(base, more, "+");
          q.picture = { items: [
            { name: item.name, emoji: item.emoji, value: base, unit: "杯" },
            { name: other.name, emoji: other.emoji, value: "?", unit: "杯" }
          ]};
          q.story = "果汁店賣出 " + base + " 杯" + item.name + "，" + other.name + "比" + item.name + "多賣出 " + more + " 杯。";
          q.prompt = other.name + "賣出幾杯？";
          q.speech = "果汁店賣出" + numberChinese(base) + "杯" + item.name + "，" + other.name + "比" + item.name + "多賣出" + numberChinese(more) + "杯。" + other.name + "賣出幾杯？";
          q.hint = "看到「比……多」，要用加法。";
          q.explain = other.name + "比較多，所以用加法。" + base + " + " + more + " = " + ans + " 杯。";
          q.answerUnit = "杯";
          q.line = {
            total: ans, totalLabel: other.name, unit: "杯",
            parts: [
              { label: item.name, value: base },
              { label: "多賣", value: more }
            ]
          };
          return true;
        },
        function () {
          const item = pick(BUY_ITEMS, rand);
          const base = (fixed && fixed.base) || pick(item.prices.concat([36, 42, 48]), rand);
          const more = (fixed && fixed.diff) || randInt(rand, 8, 24);
          const ans = base + more;
          if (ans > 200) return null;
          q.answer = ans;
          q.operation = "＋";
          q.formula = { a: base, op: "＋", b: more, result: ans };
          q.vertical = verticalOp(base, more, "+");
          q.picture = { item: item.name, emoji: item.emoji };
          q.picture = { item: "零用錢", emoji: "💰" };
          q.story = nameA + "有 " + base + " 元，" + nameB + "比" + nameA + "多 " + more + " 元。";
          q.prompt = nameB + "有多少元？";
          q.speech = nameA + "有" + yuanSpeech(base) + "，" + nameB + "比" + nameA + "多" + yuanSpeech(more) + "，" + nameB + "有多少元？";
          q.hint = "看到「比……多」，要用加法。先看清楚是誰比較多。";
          q.explain = nameB + "比較多，所以用加法。" + base + " + " + more + " = " + ans + " 元。";
          return true;
        }
      ];
      const ok = (fixed && fixed.storyKind === "juice") ? templates[0]() : pick(templates, rand)();
      if (!ok) {
        q.answer = 50; q.operation = "＋";
        q.formula = { a: 30, op: "＋", b: 20, result: 50 };
        q.story = nameA + "有 30 元，" + nameB + "比" + nameA + "多 20 元。";
        q.prompt = nameB + "有多少元？";
      }
      q.needsOp = true;
      q.needsFormula = true;
      q.compareKind = "more";
      q.base = q.formula.a;
      q.diff = q.formula.b;
      return finish(q);
    }

    // less
    const item = (fixed && fixed.item) || pick(BUY_ITEMS.concat([{ name: "早餐", mw: "份", emoji: "🥐", prices: [48, 45, 38] }]), rand);
    const base = (fixed && fixed.base) || pick((item.prices || [48, 56, 42]).concat([48, 56, 72]), rand);
    let less = (fixed && fixed.diff != null) ? fixed.diff : randInt(rand, 8, 24);
    if (less >= base) less = Math.max(5, base - 6);
    const ans = base - less;
    q.answer = ans;
    q.operation = "−";
    q.needsOp = true;
    q.needsFormula = true;
    q.formula = { a: base, op: "−", b: less, result: ans };
    q.vertical = verticalOp(base, less, "−");
    q.picture = { item: item.name, emoji: item.emoji };
    if (item.name === "早餐" || (fixed && fixed.storyKind === "spend") || rand() < 0.5) {
      q.story = nameA + "買早餐花了 " + base + " 元，" + nameB + "比" + (nameA === "小妍" ? "她" : nameA) + "少花 " + less + " 元。";
      q.prompt = nameB + "花了多少元？";
      q.speech = nameA + "買早餐花了" + yuanSpeech(base) + "，" + nameB + "比" + nameA + "少花" + yuanSpeech(less) + "，" + nameB + "花了多少元？";
    } else {
      q.picture = { item: "零用錢", emoji: "💰" };
      q.story = nameA + "有 " + base + " 元，" + nameB + "比" + nameA + "少 " + less + " 元。";
      q.prompt = nameB + "有多少元？";
      q.speech = nameA + "有" + yuanSpeech(base) + "，" + nameB + "比" + nameA + "少" + yuanSpeech(less) + "，" + nameB + "有多少元？";
    }
    q.hint = "看到「比……少」，要用減法。先看清楚是誰比較少。";
    q.explain = nameB + "比較少，所以用減法。" + base + " − " + less + " = " + ans + " 元。";
    q.compareKind = "less";
    q.base = base;
    q.diff = less;
    q.line = {
      total: base, totalLabel: nameA, unit: "元",
      parts: [
        { label: nameB, value: ans },
        { label: "少", value: less }
      ]
    };
    return finish(q);
  }

  function makeUnknownPart(rand, fixed) {
    const q = baseQuestion("unknown-part", "word");
    const templates = [
      {
        whoA: "妹妹", whoB: "媽媽", thing: "餅乾", mw: "片", verbA: "烤好", verbB: "烤了", emoji: "🍪",
        knownRole: "A",
        story: function (k, t) { return "妹妹烤好 " + k + " 片餅乾，媽媽也烤了一些，兩個人共烤了 " + t + " 片。"; },
        prompt: "媽媽烤了幾片？",
        partA: "妹妹烤", partB: "媽媽烤"
      },
      {
        whoA: "奶奶", whoB: "還要包", thing: "水餃", mw: "顆", verbA: "包了", emoji: "🥟",
        knownRole: "A",
        story: function (k, t) { return "奶奶包了 " + k + " 顆水餃，還要再包幾顆才會有 " + t + " 顆？"; },
        prompt: "還要再包幾顆？",
        partA: "已經包", partB: "還要包"
      },
      {
        whoA: "小花", whoB: "小明", thing: "貼紙", mw: "張", verbA: "有", emoji: "⭐",
        knownRole: "A",
        story: function (k, t) { return "小花有 " + k + " 張貼紙，和小明合起來共有 " + t + " 張。"; },
        prompt: "小明有幾張？",
        partA: "小花", partB: "小明"
      }
    ];
    const tmpl = (fixed && fixed.tmpl) || pick(templates, rand);
    let known = (fixed && fixed.known != null) ? fixed.known : randInt(rand, 6, 48);
    let total = (fixed && fixed.total != null) ? fixed.total : known + randInt(rand, 8, 40);
    if (total <= known) total = known + randInt(rand, 8, 20);
    if (total > 200) total = known + 20;
    const missing = total - known;
    q.answer = missing;
    q.answerUnit = tmpl.mw;
    q.operation = "−";
    q.needsOp = true;
    q.needsFormula = true;
    q.formula = { a: total, op: "−", b: known, result: missing };
    q.vertical = verticalOp(total, known, "−");
    q.picture = { emoji: tmpl.emoji, item: tmpl.thing };
    q.story = tmpl.story(known, total);
    q.prompt = tmpl.prompt;
    q.speech = q.story + tmpl.prompt;
    q.hint = "線段圖裡，全部減掉已經知道的那一段，就是不知道的那一段。";
    q.explain = "全部是 " + total + " " + tmpl.mw + "，已經知道 " + known + " " + tmpl.mw + "，" + total + " − " + known + " = " + missing + " " + tmpl.mw + "。";
    q.line = {
      total: total, totalLabel: "共", unit: tmpl.mw, hideTotal: false,
      parts: [
        { label: tmpl.partA, value: known },
        { label: tmpl.partB, value: null, answer: missing }
      ]
    };
    q.known = known;
    q.total = total;
    return finish(q);
  }

  function makeVertical(rand, op, fixed) {
    const type = op === "+" ? "vertical-add" : "vertical-sub";
    const q = baseQuestion(type, "word");
    let a, b;
    if (fixed && fixed.a != null) {
      a = fixed.a; b = fixed.b;
    } else if (op === "+") {
      // 2-digit (or 1+2) with frequent carry, sum <= 200
      a = randInt(rand, 7, 99);
      b = randInt(rand, 7, 99);
      if (a + b > 200) b = randInt(rand, 7, 200 - a);
      // bias toward carry
      if (rand() < 0.65 && ((a % 10) + (b % 10) < 10)) {
        b = b - (b % 10) + randInt(rand, 10 - (a % 10), 9);
        if (b > 99) b -= 10;
        if (a + b > 200) b = 200 - a;
      }
    } else {
      a = randInt(rand, 20, 99);
      b = randInt(rand, 3, a - 1);
      if (rand() < 0.65 && (a % 10) >= (b % 10)) {
        const ones = randInt(rand, 0, (a % 10) === 0 ? 0 : (a % 10) - 1);
        // force borrow: b ones > a ones
        const bOnes = randInt(rand, (a % 10) + 1, 9);
        const bTens = randInt(rand, 0, Math.floor(a / 10));
        b = bTens * 10 + bOnes;
        if (b >= a || b === 0) b = Math.max(1, a - randInt(rand, 8, 29));
      }
    }
    const result = op === "+" ? a + b : a - b;
    q.answer = result;
    q.answerUnit = "";
    q.operation = op === "+" ? "＋" : "−";
    q.needsOp = false;
    q.needsFormula = false;
    q.formula = { a, op: op === "+" ? "＋" : "−", b, result };
    q.vertical = verticalOp(a, b, op === "+" ? "+" : "−");
    q.story = "用直式算算看。";
    q.prompt = a + " " + (op === "+" ? "+" : "−") + " " + b + " = ？";
    q.speech = numberChinese(a) + (op === "+" ? "加" : "減") + numberChinese(b) + "等於多少？";
    q.hint = op === "+"
      ? "從個位開始加。個位相加滿 10，要向十位進 1。"
      : "從個位開始減。不夠減時，向十位借 1，個位就變成十幾。";
    q.explain = explainVertical(q.vertical);
    q.picture = null;
    return finish(q);
  }

  function makeTwoStepGive(rand, fixed) {
    const q = baseQuestion("two-step-give", "challenge");
    const giver = (fixed && fixed.giver) || pick(["媽媽", "爸爸", "奶奶", "爺爺"], rand);
    const rec1 = (fixed && fixed.rec1) || "哥哥";
    const rec2 = (fixed && fixed.rec2) || "妹妹";
    let start = (fixed && fixed.start) || pick([50, 60, 80, 100, 90, 70], rand);
    let g1 = (fixed && fixed.g1) || randInt(rand, 10, 30);
    let g2 = (fixed && fixed.g2) || randInt(rand, 5, 20);
    if (fixed && fixed.start == null) {
      // keep leftovers positive and friendly
      if (g1 + g2 >= start) {
        start = 50; g1 = 20; g2 = 10;
      }
    }
    if (g1 + g2 >= start) {
      g2 = Math.max(1, start - g1 - 5);
      if (g2 <= 0 || g1 + g2 >= start) { start = 80; g1 = 20; g2 = 15; }
    }
    const left = start - g1 - g2;
    q.answer = left;
    q.operation = "−";
    q.needsOp = true;
    q.needsFormula = true;
    q.formula = { a: start, op: "−", b: g1 + g2, result: left };
    q.vertical = verticalOp(start, g1 + g2, "−");
    q.stepsMath = [start + " − " + g1 + " = " + (start - g1), (start - g1) + " − " + g2 + " = " + left, "或 " + start + " −（" + g1 + " + " + g2 + "）= " + left];
    q.picture = { emoji: "💵" };
    q.story = giver + "有 " + start + " 元，給了" + rec1 + " " + g1 + " 元，" + rec2 + " " + g2 + " 元。";
    q.prompt = "剩下幾元？";
    q.speech = giver + "有" + yuanSpeech(start) + "，給了" + rec1 + yuanSpeech(g1) + "，" + rec2 + yuanSpeech(g2) + "，剩下幾元？";
    q.hint = "可以先把給出去的加起來，再用全部減掉；也可以一步一步減。";
    q.explain = "先算給出去的：" + g1 + " + " + g2 + " = " + (g1 + g2) + " 元。<br>再算剩下：" + start + " − " + (g1 + g2) + " = " + left + " 元。<br>也可以：" + start + " − " + g1 + " = " + (start - g1) + "，再 " + (start - g1) + " − " + g2 + " = " + left + " 元。";
    q.line = {
      total: start, totalLabel: "本來有", unit: "元",
      parts: [
        { label: "給" + rec1, value: g1 },
        { label: "給" + rec2, value: g2 },
        { label: "剩下", value: null, answer: left }
      ]
    };
    q.start = start; q.g1 = g1; q.g2 = g2;
    return finish(q);
  }

  function makeUnitTimes(rand, fixed) {
    const q = baseQuestion("unit-times", "challenge");
    const item = (fixed && fixed.item) || pick(BUY_ITEMS.filter((it) => it.prices.some((p) => p <= 40)), rand);
    let unit = (fixed && fixed.unit) || pick((item.prices || [20]).filter((p) => p <= 40).concat([10, 15, 20, 25, 30]), rand);
    let qty = (fixed && fixed.qty) || randInt(rand, 2, 9);
    if (unit * qty > 200) {
      qty = Math.max(2, Math.min(9, Math.floor(200 / unit)));
    }
    if (unit * qty > 200 || qty < 2) { unit = 20; qty = 3; }
    const total = unit * qty;
    q.answer = total;
    q.operation = "×";
    q.needsOp = true;
    q.needsFormula = true;
    q.formula = { a: unit, op: "×", b: qty, result: total };
    q.picture = { item: item.name, emoji: item.emoji, mw: item.mw, price: unit, qty: qty };
    q.story = "一" + item.mw + item.name + " " + unit + " 元，買 " + qty + " " + item.mw + item.name + "。";
    q.prompt = "一共要多少錢？";
    q.speech = "一" + item.mw + item.name + yuanSpeech(unit) + "，買" + numberChinese(qty) + item.mw + "，一共要多少錢？";
    q.hint = "一樣的東西買好幾個，可以用連加，也可以用乘法：單價 × 數量。";
    const add = Array(qty).fill(String(unit)).join(" + ");
    q.explain = add + " = " + total + " 元，也就是 " + unit + " × " + qty + " = " + total + " 元。";
    q.unitPrice = unit;
    q.qty = qty;
    return finish(q);
  }

  function makeBuyChange(rand, fixed) {
    const q = baseQuestion("buy-change", "challenge");
    const paid = (fixed && fixed.paid) || 100;
    const item = (fixed && fixed.item) || pick(BUY_ITEMS.filter((it) => it.prices.some((p) => p <= 40)), rand);
    let unit = (fixed && fixed.unit) || pick((item.prices || [20]).filter((p) => p <= 40), rand);
    let qty = (fixed && fixed.qty) || randInt(rand, 2, 6);
    while (unit * qty >= paid || unit * qty > 200) {
      if (qty > 2) qty -= 1;
      else { unit = Math.min(unit, 20); qty = 2; break; }
    }
    if (unit * qty >= paid) { unit = 20; qty = 3; }
    const cost = unit * qty;
    const change = paid - cost;
    q.answer = change;
    q.operation = "−";
    q.needsOp = true;
    q.needsFormula = true;
    q.formula = { a: paid, op: "−", b: cost, result: change };
    q.vertical = verticalOp(paid, cost, "−");
    q.picture = { item: item.name, emoji: item.emoji, mw: item.mw, price: unit, qty: qty, paid: paid };
    q.story = "一" + item.mw + item.name + " " + unit + " 元，買 " + qty + " " + item.mw + "，拿了 " + paid + " 元給老闆。";
    q.prompt = "要找幾元？";
    q.speech = "一" + item.mw + item.name + yuanSpeech(unit) + "，買" + numberChinese(qty) + item.mw + "，拿了" + yuanSpeech(paid) + "給老闆，要找幾元？";
    q.hint = "先算一共要付多少（單價 × 數量），再用拿出的錢減掉。";
    q.explain = "先算應付：" + unit + " × " + qty + " = " + cost + " 元。<br>再算找錢：" + paid + " − " + cost + " = " + change + " 元。";
    q.unitPrice = unit;
    q.qty = qty;
    q.cost = cost;
    q.paid = paid;
    return finish(q);
  }

  function makePopularity(rand, fixed) {
    const q = baseQuestion("popularity", "challenge");
    let names, k, target, d1, s, d2, votes;
    if (fixed && fixed.votes) {
      names = fixed.names;
      k = fixed.k; target = fixed.target; d1 = fixed.d1; s = fixed.s; d2 = fixed.d2;
      votes = fixed.votes.slice();
    } else {
      let found = null;
      for (let i = 0; i < 80; i++) {
        names = shuffle(ANIMALS, rand).slice(0, 4);
        k = randInt(rand, 5, 15);
        target = randInt(rand, 40, 80);
        const a = target - k;
        if (a <= 5) continue;
        d1 = randInt(rand, 8, 22);
        const b = a - d1;
        if (b <= 3) continue;
        const c = randInt(rand, Math.max(b + 8, 30), 90);
        s = b + c;
        if (s > 200) continue;
        d2 = randInt(rand, 8, 22);
        const d = c + d2;
        if (d > 200 || d <= 0) continue;
        votes = [a, b, c, d];
        if (new Set(votes).size !== 4) continue;
        if (votes.some((v) => v <= 0 || !Number.isInteger(v))) continue;
        found = true;
        break;
      }
      if (!found) {
        names = ["獅子", "河馬", "長頸鹿", "大象"];
        k = 8; target = 50; d1 = 17; s = 93; d2 = 19;
        votes = [42, 25, 68, 87];
      }
    }
    const records = names.map((n, i) => ({ name: n, votes: votes[i] }));
    const ranked = records.slice().sort((x, y) => y.votes - x.votes);
    q.ranks = ranked;
    q.votes = records;
    q.story = names[0] + "說：「我再差 " + k + " 票就有 " + target + " 票。」" +
      names[1] + "比" + names[0] + "少 " + d1 + " 票。" +
      names[2] + "和" + names[1] + "合起來共 " + s + " 票。" +
      names[3] + "比" + names[2] + "多 " + d2 + " 票。";
    q.picture = { emoji: "🏆", animals: names };
    q.hint = "一句一句算：先算" + names[0] + "，再算" + names[1] + "，再算" + names[2] + "，最後算" + names[3] + "。";
    const explainAll = names[0] + "：" + target + " − " + k + " = " + votes[0] + " 票。<br>" +
      names[1] + "：" + votes[0] + " − " + d1 + " = " + votes[1] + " 票。<br>" +
      names[2] + "：" + s + " − " + votes[1] + " = " + votes[2] + " 票。<br>" +
      names[3] + "：" + votes[2] + " + " + d2 + " = " + votes[3] + " 票。<br>" +
      "名次：" + ranked.map((r, i) => "第" + (i + 1) + "名 " + r.name + " " + r.votes + " 票").join("，") + "。";
    q.explain = explainAll;
    q.speech = q.story;

    const sub = (fixed && fixed.sub) || pick(["votes0", "votes1", "votes2", "votes3", "first", "place"], rand);
    q.sub = sub;
    if (sub.slice(0, 5) === "votes") {
      const idx = Number(sub.slice(5));
      q.answer = votes[idx];
      q.answerUnit = "票";
      q.prompt = names[idx] + "有幾票？";
      q.needsOp = false;
      q.operation = null;
    } else if (sub === "first") {
      q.answer = ranked[0].name;
      q.answerUnit = "";
      q.answerLabel = ranked[0].name;
      q.prompt = "誰是第 1 名？";
      q.choices = shuffle(names, rand);
      q.needsOp = false;
    } else {
      const place = randInt(rand, 1, 4);
      q.answer = ranked[place - 1].name;
      q.answerUnit = "";
      q.answerLabel = ranked[place - 1].name;
      q.prompt = "誰是第 " + place + " 名？";
      q.choices = shuffle(names, rand);
      q.needsOp = false;
      q.place = place;
    }
    q.speech = q.story + q.prompt;
    return finish(q);
  }

  function typePlan(level, n, rand) {
    const r = rand || Math.random;
    const pools = {
      coins: ["count-coins", "pay-exact", "change", "count-coins", "pay-exact", "change"],
      word: ["remaining", "total-pay", "compare-more", "compare-less", "cheaper", "unknown-part", "vertical-add", "vertical-sub"],
      challenge: ["two-step-give", "unit-times", "buy-change", "popularity", "two-step-give", "unit-times"]
    };
    const pool = pools[level] || pools.word;
    const out = [];
    const base = shuffle(pool, r);
    for (let i = 0; i < n; i++) out.push(base[i % base.length]);
    if (n > base.length) {
      // reshuffle extras for more variety
      const extra = shuffle(pool, r);
      for (let i = base.length; i < n; i++) out[i] = extra[(i - base.length) % extra.length];
    }
    return out;
  }

  function makeQuestion(type, level, rand, fixed) {
    rand = rand || Math.random;
    switch (type) {
      case "count-coins": return makeCountCoins(rand, fixed);
      case "pay-exact": return makePayExact(rand, fixed);
      case "change": return makeChange(rand, fixed);
      case "remaining": return makeRemaining(rand, fixed);
      case "total-pay": return makeTotalPay(rand, fixed);
      case "compare-more": return makeCompare(rand, "more", fixed);
      case "compare-less": return makeCompare(rand, "less", fixed);
      case "cheaper": return makeCompare(rand, "cheaper", fixed);
      case "unknown-part": return makeUnknownPart(rand, fixed);
      case "vertical-add": return makeVertical(rand, "+", fixed);
      case "vertical-sub": return makeVertical(rand, "-", fixed);
      case "two-step-give": return makeTwoStepGive(rand, fixed);
      case "unit-times": return makeUnitTimes(rand, fixed);
      case "buy-change": return makeBuyChange(rand, fixed);
      case "popularity": return makePopularity(rand, fixed);
      default: return makeRemaining(rand, fixed);
    }
  }

  function generateQuiz(level, count, rand) {
    rand = rand || Math.random;
    const n = Math.max(1, Math.round(Number(count) || 5));
    const types = typePlan(level, n, rand);
    return types.map((t) => makeQuestion(t, level, rand));
  }

  function answersMatch(q, given) {
    if (!q) return false;
    if (q.type === "pay-exact") {
      if (given && typeof given === "object" && !Array.isArray(given) && given.answer == null) {
        if (!isSubset(given, q.wallet)) return false;
        return coinTotal(given) === q.payTarget;
      }
      return Number(given) === Number(q.answer);
    }
    if (q.type === "popularity" && typeof q.answer === "string") {
      return String(given) === String(q.answer);
    }
    if (Array.isArray(given) && q.formulaAnswer) {
      if (given.length !== 3) return false;
      return Number(given[0]) === Number(q.formulaAnswer[0]) &&
        Number(given[1]) === Number(q.formulaAnswer[1]) &&
        Number(given[2]) === Number(q.formulaAnswer[2]);
    }
    if (typeof q.answer === "number") return Number(given) === Number(q.answer);
    return String(given) === String(q.answer);
  }

  function wordingOk(q) {
    if (!q || !q.story) return false;
    if (q.type === "compare-more") {
      if (!q.story.includes("多")) return false;
      if (q.formula && q.formula.result !== q.formula.a + q.formula.b) return false;
      if (q.answer !== q.base + q.diff && q.formula) {
        if (q.answer !== q.formula.result) return false;
      }
    }
    if (q.type === "compare-less") {
      if (!/少/.test(q.story)) return false;
      if (q.formula && q.formula.result !== q.formula.a - q.formula.b) return false;
    }
    if (q.type === "cheaper") {
      if (!q.story.includes("便宜")) return false;
      if (q.formula && q.formula.result !== q.formula.a - q.formula.b) return false;
    }
    if (q.type === "remaining" || q.type === "two-step-give") {
      if (!q.story.includes("有") || !q.prompt.includes("剩下")) return false;
    }
    if (q.type === "change" || q.type === "buy-change") {
      if (!/找/.test(q.prompt + q.story)) return false;
    }
    return true;
  }

  function validateQuestion(q) {
    if (!q || !q.type) return false;
    if (typeof q.answer === "number") {
      if (!Number.isInteger(q.answer) || q.answer < 0) return false;
      if (q.answer > 200 && q.type !== "popularity") return false;
    }
    if (q.type === "count-coins") {
      if (!q.coinsShown) return false;
      if (coinTotal(q.coinsShown) !== q.answer) return false;
      if (coinCount(q.coinsShown) < 1 || coinCount(q.coinsShown) > 12) return false;
    }
    if (q.type === "pay-exact") {
      if (q.payTarget !== q.answer) return false;
      if (!canMake(q.wallet, q.payTarget)) return false;
      if (q.payTarget <= 0) return false;
    }
    if (q.type === "change") {
      const paid = q.picture && q.picture.paid;
      const price = q.picture && q.picture.price;
      if (paid - price !== q.answer) return false;
      if (q.answer < 0) return false;
    }
    if (q.formula) {
      const f = q.formula;
      let r;
      if (f.op === "＋" || f.op === "+") r = f.a + f.b;
      else if (f.op === "−" || f.op === "-") r = f.a - f.b;
      else if (f.op === "×" || f.op === "*") r = f.a * f.b;
      else return false;
      if (r !== f.result) return false;
      if (q.type !== "popularity" && typeof q.answer === "number" && q.answer !== r && q.type !== "buy-change") {
        // buy-change answer is change, formula is paid - cost
      }
      if ((f.op === "−" || f.op === "-") && r < 0) return false;
    }
    if (q.type === "remaining") {
      if (q.formula.result !== q.answer) return false;
    }
    if (q.type === "two-step-give") {
      if (q.start - q.g1 - q.g2 !== q.answer) return false;
      if (q.answer < 0) return false;
    }
    if (q.type === "unit-times") {
      if (q.unitPrice * q.qty !== q.answer) return false;
      if (q.qty < 2 || q.qty > 9) return false;
      if (q.answer > 200) return false;
    }
    if (q.type === "buy-change") {
      if (q.unitPrice * q.qty !== q.cost) return false;
      if (q.paid - q.cost !== q.answer) return false;
    }
    if (q.type === "unknown-part") {
      if (q.total - q.known !== q.answer) return false;
      if (q.answer <= 0) return false;
    }
    if (q.type === "vertical-add") {
      if (q.vertical.result !== q.vertical.a + q.vertical.b) return false;
      if (q.answer !== q.vertical.result) return false;
    }
    if (q.type === "vertical-sub") {
      if (q.vertical.result !== q.vertical.a - q.vertical.b) return false;
      if (q.vertical.result < 0) return false;
    }
    if (q.type === "popularity") {
      if (!q.votes || q.votes.length !== 4) return false;
      const vs = q.votes.map((v) => v.votes);
      if (new Set(vs).size !== 4) return false;
      if (vs.some((v) => !Number.isInteger(v) || v <= 0)) return false;
      const ranked = q.votes.slice().sort((a, b) => b.votes - a.votes);
      if (q.sub === "first" && q.answer !== ranked[0].name) return false;
    }
    if (q.type === "compare-more" && q.formula && q.answer !== q.formula.result) return false;
    if (q.type === "compare-less" && q.formula && q.answer !== q.formula.result) return false;
    if (q.type === "cheaper" && q.formula && q.answer !== q.formula.result) return false;
    if (!wordingOk(q) && q.type !== "count-coins" && q.type !== "pay-exact" && q.type !== "vertical-add" && q.type !== "vertical-sub" && q.type !== "popularity" && q.type !== "unknown-part" && q.type !== "unit-times" && q.type !== "total-pay") {
      return false;
    }
    if (q.type === "unknown-part" || q.type === "unit-times" || q.type === "total-pay") {
      if (!q.story || !q.prompt) return false;
    }
    return true;
  }

  function demoQuestion(kind) {
    if (kind === "count-coins") {
      return makeCountCoins(Math.random, { coins: { 100: 1, 50: 1, 10: 2, 5: 1, 1: 3 } });
    }
    if (kind === "pay-exact") {
      return makePayExact(Math.random, {
        target: 35,
        wallet: { 100: 0, 50: 1, 10: 4, 5: 2, 1: 5 },
        item: { name: "蠟筆", mw: "盒", emoji: "🖍️" }
      });
    }
    if (kind === "change") {
      return makeChange(Math.random, { paid: 100, price: 65, item: { name: "蛋糕", mw: "個", emoji: "🍰" } });
    }
    if (kind === "remaining") {
      return makeRemaining(Math.random, { name: "小花", have: 100, price: 65, item: { name: "蛋糕", mw: "個", emoji: "🍰" } });
    }
    if (kind === "unknown-part" || kind === "line") {
      return makeUnknownPart(Math.random, {
        tmpl: {
          whoA: "妹妹", whoB: "媽媽", thing: "餅乾", mw: "片", emoji: "🍪",
          story: function (k, t) { return "妹妹烤好 " + k + " 片餅乾，媽媽也烤了一些，兩個人共烤了 " + t + " 片。"; },
          prompt: "媽媽烤了幾片？",
          partA: "妹妹烤", partB: "媽媽烤"
        },
        known: 8, total: 30
      });
    }
    if (kind === "two-step-give" || kind === "twostep") {
      return makeTwoStepGive(Math.random, { giver: "媽媽", rec1: "哥哥", rec2: "妹妹", start: 50, g1: 20, g2: 10 });
    }
    if (kind === "unit-times") {
      return makeUnitTimes(Math.random, { item: { name: "包子", mw: "袋", emoji: "🥟", prices: [20] }, unit: 20, qty: 3 });
    }
    if (kind === "vertical-add") {
      return makeVertical(Math.random, "+", { a: 74, b: 28 });
    }
    if (kind === "vertical-sub") {
      return makeVertical(Math.random, "-", { a: 53, b: 28 });
    }
    if (kind === "compare-less") {
      return makeCompare(Math.random, "less", { nameA: "小妍", nameB: "阿偉", base: 48, diff: 19, item: { name: "早餐", mw: "份", emoji: "🥐" }, storyKind: "spend" });
    }
    if (kind === "compare-more") {
      return makeCompare(Math.random, "more", { base: 82, diff: 19, storyKind: "juice" });
    }
    if (kind === "cheaper") {
      return makeCompare(Math.random, "cheaper", { item: { name: "優酪乳", mw: "瓶", emoji: "🥛" }, original: 63, off: 24 });
    }
    if (kind === "total-pay") {
      return makeTotalPay(Math.random, {
        name: "羅力", a: 58, b: 35,
        itemA: { name: "遊戲卡", mw: "盒", emoji: "🎴" },
        itemB: { name: "撲克牌", mw: "盒", emoji: "🃏" }
      });
    }
    if (kind === "popularity") {
      return makePopularity(Math.random, {
        names: ["獅子", "河馬", "長頸鹿", "大象"],
        k: 8, target: 50, d1: 17, s: 93, d2: 19,
        votes: [42, 25, 68, 87],
        sub: "first"
      });
    }
    if (kind === "buy-change") {
      return makeBuyChange(Math.random, { paid: 100, item: { name: "包子", mw: "袋", emoji: "🥟", prices: [20] }, unit: 20, qty: 3 });
    }
    return makeRemaining(Math.random, { name: "小花", have: 100, price: 65, item: { name: "蛋糕", mw: "個", emoji: "🍰" } });
  }

  function coinSvg(denom, opts) {
    opts = opts || {};
    const meta = COIN_META[denom] || COIN_META[1];
    if (meta.kind === "note") {
      const w = opts.size || 96;
      const h = Math.round(w * 0.52);
      return '<svg class="coin-svg money-note" viewBox="0 0 96 50" width="' + w + '" height="' + h + '" aria-label="100元鈔票" role="img">' +
        '<rect x="1.5" y="1.5" width="93" height="47" rx="6" fill="#f07a86" stroke="#9a2030" stroke-width="2"/>' +
        '<rect x="6" y="6" width="84" height="38" rx="3" fill="none" stroke="#fff3" stroke-width="1.5"/>' +
        '<circle cx="18" cy="25" r="10" fill="#ffd0d4" opacity="0.9"/>' +
        '<text x="18" y="29" text-anchor="middle" font-size="9" font-weight="800" fill="#9a2030">NT</text>' +
        '<text x="62" y="33" text-anchor="middle" font-size="22" font-weight="900" fill="#fff">100</text>' +
        '<text x="88" y="14" text-anchor="middle" font-size="8" font-weight="800" fill="#fff">元</text>' +
        "</svg>";
    }
    const s = opts.size || meta.size;
    const label = denom === 1 ? "1" : String(denom);
    return '<svg class="coin-svg" viewBox="0 0 80 80" width="' + s + '" height="' + s + '" aria-label="' + meta.caption + '" role="img">' +
      '<circle cx="40" cy="40" r="36" fill="' + meta.color + '" stroke="' + meta.ring + '" stroke-width="3.5"/>' +
      '<circle cx="40" cy="40" r="30" fill="none" stroke="' + meta.ring + '" stroke-width="1.2" opacity="0.45"/>' +
      '<text x="40" y="48" text-anchor="middle" font-size="' + (denom >= 10 ? 24 : 28) + '" font-weight="900" fill="' + meta.ink + '">' + label + "</text>" +
      "</svg>";
  }

  return {
    DENOMS,
    COIN_META,
    LEVELS,
    LEVEL_LABEL,
    TYPE_LABEL,
    SHOP_ITEMS,
    BUY_ITEMS,
    emptyCounts,
    copyCounts,
    coinTotal,
    coinsList,
    countsFromList,
    coinCount,
    isSubset,
    greedy,
    canMake,
    randInt,
    pick,
    shuffle,
    numberChinese,
    yuanSpeech,
    itemPhrase,
    verticalOp,
    explainVertical,
    typePlan,
    makeQuestion,
    generateQuiz,
    answersMatch,
    wordingOk,
    validateQuestion,
    demoQuestion,
    coinSvg
  };
});
