const DAY_MS = 24 * 60 * 60 * 1000;

export function parseDate(value) {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function driftDays(milestone) {
  const baseline = parseDate(milestone.baseline);
  const forecast = parseDate(milestone.forecast);
  if (!baseline || !forecast) return 0;
  return Math.round((forecast - baseline) / DAY_MS);
}

export function summarizeMilestones(milestones) {
  const drift = milestones.map(driftDays);
  return {
    total: milestones.length,
    slipped: drift.filter((days) => days > 0).length,
    totalDrift: drift.filter((days) => days > 0).reduce((sum, days) => sum + days, 0),
    blocked: milestones.filter((item) => item.status === "blocked").length,
  };
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(milestones) {
  return ["name,owner,baseline,forecast,status", ...milestones.map((item) => [item.name, item.owner, item.baseline, item.forecast, item.status].map(csvCell).join(","))].join("\n") + "\n";
}

function parseCsvRow(row) {
  const cells = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < row.length; index += 1) {
    const char = row[index];
    if (char === '"' && quoted && row[index + 1] === '"') { value += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { cells.push(value); value = ""; }
    else value += char;
  }
  cells.push(value);
  return cells;
}

export function fromCsv(csv) {
  const rows = csv.trim().split(/\r?\n/).filter(Boolean).map(parseCsvRow);
  const headers = rows.shift()?.map((value) => value.trim().toLowerCase()) || [];
  const required = ["name", "owner", "baseline", "forecast", "status"];
  if (!required.every((header) => headers.includes(header))) throw new Error(`CSV must contain: ${required.join(", ")}.`);
  return rows.map((row, index) => {
    const record = Object.fromEntries(headers.map((header, cell) => [header, row[cell]?.trim() || ""]));
    if (!record.name || !record.owner || !parseDate(record.baseline) || !parseDate(record.forecast)) throw new Error(`Row ${index + 2} contains missing or invalid milestone data.`);
    if (!["on-track", "at-risk", "blocked"].includes(record.status)) throw new Error(`Row ${index + 2} has an invalid status.`);
    return { id: `import-${Date.now()}-${index}`, ...record };
  });
}

function prettyDate(value) {
  const date = parseDate(value);
  return date ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }) : "TBD";
}

export function weeklyUpdate(milestones) {
  const summary = summarizeMilestones(milestones);
  const ordered = [...milestones].sort((a, b) => driftDays(b) - driftDays(a));
  const lines = ["# Weekly Schedule Update", "", `**Overall:** ${summary.slipped} of ${summary.total} milestones are forecast after baseline; ${summary.blocked} are blocked.`, "", "## Milestones"];
  if (!ordered.length) lines.push("No milestones recorded.");
  ordered.forEach((item) => { const drift = driftDays(item); const movement = drift > 0 ? `${drift} days late` : drift < 0 ? `${Math.abs(drift)} days early` : "on baseline"; lines.push(`- **${item.name}** — ${prettyDate(item.forecast)} (${movement}); ${item.status}; owner: ${item.owner}`); });
  lines.push("", "## Decisions and follow-up", "- Validate causes and recovery actions for slipped or blocked milestones.", "- Confirm downstream impacts before changing commitments.", "");
  return lines.join("\n");
}
