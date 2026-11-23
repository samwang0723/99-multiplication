const assert = require("assert");
const C = require("./clock-math");

// Angles: hour hand moves realistically with minutes
assert.strictEqual(C.hourAngle(12, 0), 0);
assert.strictEqual(C.hourAngle(3, 0), 90);
assert.strictEqual(C.hourAngle(3, 30), 105);
assert.strictEqual(C.hourAngle(6, 0), 180);
assert.strictEqual(C.hourAngle(9, 0), 270);
assert.strictEqual(C.hourAngle(12, 30), 15);
assert.strictEqual(C.hourAngle(1, 0), 30);
assert.strictEqual(C.hourAngle(4, 24), 4 * 30 + 24 * 0.5);
assert.strictEqual(C.minuteAngle(0), 0);
assert.strictEqual(C.minuteAngle(15), 90);
assert.strictEqual(C.minuteAngle(30), 180);
assert.strictEqual(C.minuteAngle(45), 270);
assert.strictEqual(C.minuteAngle(17), 102);
assert.strictEqual(C.minuteAngle(60), 0);

// 12-hour wrap
assert.strictEqual(C.normalizeHour(0), 12);
assert.strictEqual(C.normalizeHour(12), 12);
assert.strictEqual(C.normalizeHour(13), 1);
assert.strictEqual(C.normalizeHour(24), 12);
assert.strictEqual(C.normalizeHour(-1), 11);
assert.strictEqual(C.normalizeMinute(60), 0);
assert.strictEqual(C.normalizeMinute(-1), 59);

// Add minutes wraps across 12
assert.deepStrictEqual(C.addMinutes(2, 50, 30), { hour: 3, minute: 20 });
assert.deepStrictEqual(C.addMinutes(3, 0, 30), { hour: 3, minute: 30 });
assert.deepStrictEqual(C.addMinutes(11, 50, 20), { hour: 12, minute: 10 });
assert.deepStrictEqual(C.addMinutes(12, 0, -1), { hour: 11, minute: 59 });
assert.deepStrictEqual(C.addMinutes(12, 5, -10), { hour: 11, minute: 55 });
assert.deepStrictEqual(C.addMinutes(1, 0, -1), { hour: 12, minute: 59 });
assert.deepStrictEqual(C.addMinutes(12, 0, 60), { hour: 1, minute: 0 });

// Chinese readings: 0 → X點 / X點整, 30 → X點半 / X點30分, 兩點 not 二點
assert.strictEqual(C.hourChinese(2), "兩");
assert.notStrictEqual(C.hourChinese(2), "二");
assert.strictEqual(C.readTime(2, 0), "兩點");
assert.strictEqual(C.readTime(2, 0, "long"), "兩點整");
assert.strictEqual(C.readTime(3, 30), "三點半");
assert.strictEqual(C.readTime(3, 30, "long"), "三點30分");
assert.strictEqual(C.readTime(3, 15), "三點十五分");
assert.strictEqual(C.readTime(12, 5), "十二點五分");
assert.strictEqual(C.readTime(12, 0), "十二點");
assert.strictEqual(C.readTime(10, 0), "十點");
assert.strictEqual(C.readTime(11, 55), "十一點五十五分");
assert.strictEqual(C.readTime(1, 1), "一點一分");
assert.strictEqual(C.readTime(9, 20), "九點二十分");
assert.ok(!C.readTime(2, 15).includes("二點"));
assert.ok(!C.readTime(2, 30).includes("二點"));
assert.ok(!C.readTime(2, 0, "long").includes("二點"));
assert.strictEqual(C.digitalTime(3, 7), "3:07");
assert.strictEqual(C.digitalTime(12, 0), "12:00");
assert.strictEqual(C.digitalTime(13, 5), "1:05");

// Describe hands + distractors include swapped hands and off-by-one hour
const d250 = C.describeHands(2, 50);
assert.ok(d250.text.includes("不是 3 點"));
assert.ok(d250.label === "兩點五十分");
const sw = C.swappedHandsTime(3, 0);
assert.deepStrictEqual(sw, { hour: 12, minute: 15 });
const dist = C.distractors(2, 50);
assert.ok(dist.some((t) => t.hour === 3 && t.minute === 50), "2:50 should have 3:50 distractor");
assert.ok(C.timesEqual(2, 0, 14, 0));

console.log("clock-math tests: all ok");
