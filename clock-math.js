(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.ClockMath = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const CN = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

  function normalizeHour(h) {
    let n = Number(h);
    if (!Number.isFinite(n)) n = 12;
    n = Math.round(n);
    return ((n - 1) % 12 + 12) % 12 + 1;
  }

  function normalizeMinute(m) {
    let n = Number(m);
    if (!Number.isFinite(n)) n = 0;
    n = Math.round(n);
    return ((n % 60) + 60) % 60;
  }

  function hourAngle(h, m) {
    const hour = normalizeHour(h);
    const minute = normalizeMinute(m);
    return (hour % 12) * 30 + minute * 0.5;
  }

  function minuteAngle(m) {
    return normalizeMinute(m) * 6;
  }

  function addMinutes(h, m, delta) {
    const hour = normalizeHour(h);
    const minute = normalizeMinute(m);
    let total = hour * 60 + minute + Number(delta || 0);
    total = ((total % (12 * 60)) + 12 * 60) % (12 * 60);
    let nh = Math.floor(total / 60);
    const nm = total % 60;
    if (nh === 0) nh = 12;
    return { hour: nh, minute: nm };
  }

  function hourChinese(h) {
    const n = normalizeHour(h);
    if (n === 2) return "兩";
    if (n <= 9) return CN[n];
    if (n === 10) return "十";
    if (n === 11) return "十一";
    return "十二";
  }

  function numberChinese(n) {
    n = Math.round(Number(n) || 0);
    if (n < 0) n = 0;
    if (n <= 9) return CN[n];
    if (n === 10) return "十";
    if (n < 20) return "十" + CN[n - 10];
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    const tensWord = ["", "十", "二十", "三十", "四十", "五十"][tens];
    return tensWord + (ones ? CN[ones] : "");
  }

  function minuteChinese(m) {
    return numberChinese(normalizeMinute(m));
  }

  function readTime(h, m, style) {
    const hour = normalizeHour(h);
    const minute = normalizeMinute(m);
    const hs = hourChinese(hour);
    if (style === "long") {
      if (minute === 0) return hs + "點整";
      return hs + "點" + minute + "分";
    }
    if (minute === 0) return hs + "點";
    if (minute === 30) return hs + "點半";
    return hs + "點" + minuteChinese(minute) + "分";
  }

  function digitalTime(h, m) {
    return normalizeHour(h) + ":" + String(normalizeMinute(m)).padStart(2, "0");
  }

  function minuteNumberPointed(m) {
    const minute = normalizeMinute(m);
    if (minute % 5 !== 0) return null;
    const n = minute / 5;
    return n === 0 ? 12 : n;
  }

  function describeHands(h, m) {
    const hour = normalizeHour(h);
    const minute = normalizeMinute(m);
    const next = hour === 12 ? 1 : hour + 1;
    let hourDesc;
    if (minute === 0) {
      hourDesc = "時針正好指在 " + hour;
    } else {
      hourDesc = "時針過了 " + hour + "，在 " + hour + " 和 " + next + " 中間，所以是 " + hour + " 點，不是 " + next + " 點";
    }
    let minDesc;
    if (minute === 0) minDesc = "分針指在 12，就是 0 分（整點）";
    else if (minute === 30) minDesc = "分針指在 6，就是 30 分（半點）";
    else if (minute % 5 === 0) {
      minDesc = "分針指在 " + minuteNumberPointed(minute) + "，一大格 5 分，是 " + minute + " 分";
    } else {
      const base = Math.floor(minute / 5) * 5;
      const baseNum = base === 0 ? 12 : base / 5;
      const extra = minute - base;
      minDesc = "分針過了 " + baseNum + "（" + base + " 分），再走 " + extra + " 小格，是 " + minute + " 分";
    }
    return {
      hour: hourDesc,
      minute: minDesc,
      text: hourDesc + "。" + minDesc + "。現在是 " + readTime(hour, minute) + "。",
      label: readTime(hour, minute)
    };
  }

  function swappedHandsTime(h, m) {
    const ha = hourAngle(h, m);
    const ma = minuteAngle(m);
    let wrongHour = Math.round(ma / 30);
    if (wrongHour === 0) wrongHour = 12;
    const wrongMin = Math.round(ha / 6) % 60;
    return { hour: normalizeHour(wrongHour), minute: normalizeMinute(wrongMin) };
  }

  function sameTime(a, b) {
    return normalizeHour(a.hour) === normalizeHour(b.hour) &&
      normalizeMinute(a.minute) === normalizeMinute(b.minute);
  }

  function uniqueTimes(list) {
    const seen = new Set();
    const out = [];
    (list || []).forEach((t) => {
      const hour = normalizeHour(t.hour);
      const minute = normalizeMinute(t.minute);
      const k = hour + ":" + minute;
      if (seen.has(k)) return;
      seen.add(k);
      out.push({ hour, minute });
    });
    return out;
  }

  function distractors(h, m) {
    const hour = normalizeHour(h);
    const minute = normalizeMinute(m);
    const cands = [
      swappedHandsTime(hour, minute),
      addMinutes(hour, minute, 60),
      addMinutes(hour, minute, -60),
      addMinutes(hour, minute, 5),
      addMinutes(hour, minute, -5),
      addMinutes(hour, minute, 30),
      { hour, minute: 0 },
      { hour, minute: 30 }
    ];
    if (minute % 5 === 0 && minute !== 0) cands.push({ hour, minute: minute / 5 });
    if (minute > 0 && minute < 12) cands.push({ hour: minute === 0 ? 12 : minute, minute: hour === 12 ? 0 : hour * 5 });
    return uniqueTimes(cands).filter((t) => t.hour !== hour || t.minute !== minute);
  }

  function timesEqual(h, m, h2, m2) {
    return normalizeHour(h) === normalizeHour(h2) && normalizeMinute(m) === normalizeMinute(m2);
  }

  return {
    normalizeHour,
    normalizeMinute,
    hourAngle,
    minuteAngle,
    addMinutes,
    hourChinese,
    minuteChinese,
    numberChinese,
    readTime,
    digitalTime,
    describeHands,
    swappedHandsTime,
    distractors,
    uniqueTimes,
    sameTime,
    timesEqual,
    minuteNumberPointed
  };
});
