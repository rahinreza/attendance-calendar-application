# Quick Start — Out of Office & Attendance

A one-page cheat sheet for the calendar's core actions.

## Mouse Actions
| Action | On which day | Result | Popup |
|--------|--------------|--------|-------|
| **Left-click** | Past / today weekday | Toggle **In Office** ✓ | "In Office ✓" / "Unmarked" |
| **Left-click** | Future weekday | Toggle **Planned** 📅 | "Planned ✓📅" / "Removed Plan 📅" |
| **Right-click** | Any weekday | Toggle **Out of Office** 💼 | "Out of Office 💼" / "Removed 💼" |

Every change auto-saves to your browser (`localStorage`) and shows an **"Auto-saved"**
popup. Weekends and US holidays can't be marked.

## Day States
```
In Office        ┌──────┐
                 │  15 ✓│   green, checkmark
                 └──────┘

Out of Office    ┌──────┐
                 │ ̶1̶5̶ 💼│   purple border, strike-through
                 └──────┘

Planned (future) ┌ ─ ─ ─┐
                 │  15 📅│   dashed blue border
                 └ ─ ─ ─┘

Holiday          ┌──────┐
                 │  15  │   red underline (not clickable)
                 │ ━━━  │
                 └──────┘
```

## What the Stats Show
- **Year cards:** Days In Office · Days Remote · Holidays · Out of Office · Work Days · In Office Rate
- **Month cards:** In Office · Work Days · Holidays · OOO (if any) · Rate · avg/week
- **Quarter cards:** average days/week toward the **2.0** target, with days-needed hints

Out-of-office days and holidays are excluded from all rates. Weeks are counted in
the month/quarter containing that week's **Wednesday** (HR-week accounting).

## Data Formats

### JSON (`attendance-<name>-<year>.json`)
```json
{
  "userName": "Jane Doe",
  "year": 2026,
  "attendance": [["2026-0-15", true]],
  "excludedDates": [["2026-0-20", "Out of Office"]],
  "plannedDates": [["2026-1-3", true]]
}
```
> Date keys are `YEAR-MONTH-DAY` with a **0-based month** (`2026-0-15` = Jan 15, 2026).

### CSV (`attendance-report-<year>.csv`)
```csv
Date,Day of Week,Status,Notes
1/15/2026,Thu,In Office,
1/20/2026,Tue,Excluded,"Out of Office"
2/3/2026,Tue,Planned,"Planned attendance"
```

## Toolbar Buttons
**Save** · **Import JSON** · **Export JSON** · **Import CSV** · **Export CSV**
