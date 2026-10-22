# Loading & Backing Up Data (Import / Export)

## Overview
The app stores everything in your browser's `localStorage`, so data is per-browser
and per-device. To back up, restore, or move data, use the **Import** / **Export**
buttons in the toolbar.

## Toolbar Buttons
```
[ Save ]  [ Import JSON ]  [ Export JSON ]  [ Import CSV ]  [ Export CSV ]
```
- **Save** — force a save to `localStorage` (changes also auto-save on every edit)
- **Export JSON** — download a full backup (`attendance-<name>-<year>.json`)
- **Import JSON** — load a backup; **replaces all current data**
- **Export CSV** — download a report (`attendance-report-<year>.csv`)
- **Import CSV** — load data from the report's `DAILY DETAIL` section

> There is no separate "Load From File", "Import", or "Clear All" button — use
> **Import JSON** to load a saved file.

## Loading a JSON Backup
1. Click **Import JSON** and choose your `.json` file
2. The app clears existing data, then loads the file's `userName`, `year`,
   `attendance`, `excludedDates`, and `plannedDates`
3. Data is saved to `localStorage` automatically

### JSON Format
```json
{
  "userName": "Jane Doe",
  "year": 2026,
  "attendance":    [["2026-0-15", true], ["2026-0-16", true]],
  "excludedDates": [["2026-0-20", "Out of Office"]],
  "plannedDates":  [["2026-1-3", true]]
}
```

### Date Key Format
- `YEAR-MONTH-DAY` with a **0-based month**
- `2026-0-15` → January 15, 2026
- `2026-9-1`  → October 1, 2026
- `2026-11-25` → December 25, 2026

Older files that omit `excludedDates` / `plannedDates` still import fine — those
fields are optional.

## Loading from CSV
**Import CSV** parses the `DAILY DETAIL` section of an exported report. Recognized
statuses: `In Office`/`Present` → in office, `Excluded` → out of office (with the
`Notes` value as the reason), `Planned` → planned day. `Remote`/`Absent` rows are
skipped.

## Multiple People
Each person uses their **own browser** with their **own** exported JSON file:
```
jane-attendance-2026.json
raj-attendance-2026.json
```
There is no shared server or account — data never leaves the browser except through
the files you export.

## Backup Tips
- Export JSON periodically and keep the files somewhere safe (or in version control)
- Because data lives in `localStorage`, clearing browser data will erase it — an
  exported backup is the only way to recover
