# Driftline

Driftline shows where program milestones started, where they are currently forecast, and how far the schedule moved. It combines a visual baseline-versus-forecast timeline with a concise weekly schedule narrative.

## Why this exists

Schedule updates often show only current dates, quietly erasing the original commitment. Driftline preserves both dates so teams can discuss movement, causes, recovery, and downstream effects without confusing variance with failure.

## Features

- Capture milestone, owner, baseline, forecast, and status
- Calculate early, on-baseline, and slipped delivery in calendar days
- Visualize baseline-to-forecast movement on a shared timeline
- Track on-track, at-risk, and blocked status separately from variance
- Generate and export a Markdown weekly update
- Import and export CSV
- Persist milestone data in the browser
- Load a realistic example plan
- Test date arithmetic, summaries, CSV handling, and reporting

## Run locally

No package installation is required:

```bash
python3 -m http.server 8004
```

Visit `http://localhost:8004`. Run tests with `npm test`.

## Data model

Drift is the calendar-day difference between a milestone's current forecast and original baseline:

```text
drift = forecast date − baseline date
```

A positive number indicates a later forecast; a negative number indicates an earlier forecast. Status is deliberately separate: a milestone can be late but stable, or still on its baseline while blocked.

CSV imports require these headers:

```text
name,owner,baseline,forecast,status
```

Dates use `YYYY-MM-DD`. Status must be `on-track`, `at-risk`, or `blocked`.

## Learning goals

- Perform reliable date arithmetic without timezone drift
- Parse and generate CSV safely
- Render time-series data as SVG
- Separate objective variance from subjective status
- Generate a stakeholder-ready artifact from structured data

## Roadmap

- [ ] Edit milestone dates and owners inline
- [ ] Add notes explaining the cause of movement
- [ ] Group milestones by workstream
- [ ] Overlay dependency relationships
- [ ] Compare saved weekly snapshots
- [ ] Support business-day calculations

## License

[MIT](LICENSE)
