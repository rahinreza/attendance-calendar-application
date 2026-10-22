# Out of Office (OOO) / Vacation Feature

## Overview
You can mark any weekday as **Out of Office** to exclude it from all attendance
calculations. Use it for vacation, personal time off, sick leave, training, or any
day you are officially not expected in the office.

## How to Use

### Mark a day as Out of Office
- **Right-click** any weekday
- The day gets a **purple border**, a **strike-through** date number, and a **💼** icon
- A popup shows **"Out of Office 💼"**, followed by **"Auto-saved"**

### Remove the marking
- **Right-click** the same day again
- The day returns to normal; popup shows **"Removed 💼"**

### Notes
- Weekends and holidays can't be marked (they're already excluded)
- Left-clicking a day that's already Out of Office does nothing but show
  **"Already Out of Office 💼"** — right-click first to clear it

## Visual Indicators
- **Purple border** around the day (`#8b5cf6`)
- **Strike-through** on the date number
- **💼** icon in the corner
- Purple-themed "Out of Office" stat card / month stat

## Effect on Statistics
Out-of-office days are removed from the denominator of every calculation:
- **Year stats** show an **Out of Office** count
- **Month stats** show an **OOO** count when greater than 0
- **Work Days**, **In Office Rate**, and **avg/week** all ignore OOO days

> Attendance is computed per **HR week**: whole Sun–Sat weeks are attributed to the
> month/quarter that contains the week's **Wednesday**. Holidays are also excluded
> from the counts.

## Data Model
```typescript
excludedDates: Map<string, string>
// Key:   "YEAR-MONTH-DAY"  (month is 0-based, e.g. Jan 5 2026 = "2026-0-5")
// Value: reason string, defaults to "Out of Office"
```

### Persistence
Saved to `localStorage` under the key `excludedDates` (as an array of entries),
alongside `attendanceData`, `plannedDates`, `attendanceYear`, and `userName`.

### JSON export/import
```json
{
  "userName": "Jane Doe",
  "year": 2026,
  "attendance": [["2026-0-15", true]],
  "excludedDates": [["2026-0-20", "Out of Office"]],
  "plannedDates": []
}
```

### CSV export/import
Out-of-office days appear in the **DAILY DETAIL** section with the status
`Excluded`; the reason is written to the `Notes` column.
```csv
Date,Day of Week,Status,Notes
1/20/2026,Tue,Excluded,"Out of Office"
```
On import, rows whose status is `excluded` are loaded back into `excludedDates`
using the `Notes` value as the reason.

## Interaction Summary
| Action | Result |
|--------|--------|
| Left-click (past/today) | Toggle **In Office** (✓) |
| Left-click (future) | Toggle **Planned** (📅) |
| Right-click | Toggle **Out of Office** (💼) |

## Backwards Compatibility
Older exports without an `excludedDates` field still import correctly — the field
is optional.
