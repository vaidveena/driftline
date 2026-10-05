import test from "node:test";
import assert from "node:assert/strict";
import { driftDays, fromCsv, summarizeMilestones, toCsv, weeklyUpdate } from "../drift-utils.js";

const milestones = [
  { name: "API", owner: "Platform", baseline: "2026-10-10", forecast: "2026-10-17", status: "at-risk" },
  { name: "Pilot", owner: "Product", baseline: "2026-11-01", forecast: "2026-10-30", status: "on-track" },
  { name: "Launch", owner: "Program", baseline: "2026-12-01", forecast: "2026-12-01", status: "blocked" },
];

test("calculates positive, negative, and zero drift", () => { assert.equal(driftDays(milestones[0]), 7); assert.equal(driftDays(milestones[1]), -2); assert.equal(driftDays(milestones[2]), 0); });
test("summarizes schedule movement without treating early dates as slip", () => { assert.deepEqual(summarizeMilestones(milestones), { total: 3, slipped: 1, totalDrift: 7, blocked: 1 }); });
test("round-trips CSV including quoted values", () => { const original = [{ name: "Pilot, phase 1", owner: "Product", baseline: "2026-11-01", forecast: "2026-11-08", status: "at-risk" }]; const parsed = fromCsv(toCsv(original)); assert.equal(parsed[0].name, original[0].name); assert.equal(parsed[0].status, "at-risk"); });
test("rejects incomplete CSV schemas", () => { assert.throws(() => fromCsv("name,owner\nLaunch,Program"), /must contain/); });
test("generates a reviewable weekly update", () => { const output = weeklyUpdate(milestones); assert.match(output, /^# Weekly Schedule Update/); assert.match(output, /7 days late/); assert.match(output, /Dec 1/); });
