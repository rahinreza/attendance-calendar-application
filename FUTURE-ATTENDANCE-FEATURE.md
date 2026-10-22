# Future Attendance Planning

## Overview
Plan future office days to preview their impact on your statistics — a "what-if"
tool that answers questions like *"if I come in these days, what will my average
be?"* Planned days are also auto-marked as In Office once the date arrives.

## How to Use

### Plan a future day
- **Left-click** a **future** weekday (any weekday after today)
- The day gets a **dashed blue border**, an italic number, and a **📅** icon
- A popup shows **"Planned ✓📅"**

### Remove a plan
- **Left-click** the planned day again
- Popup shows **"Removed Plan 📅"**

> Left-clicking a **past or current** day marks **In Office** instead — planning
> only applies to future dates. Weekends and holidays can't be planned.

## Projected Statistics
There is **no manual toggle**. Whenever a month or quarter contains planned future
days, its cards automatically show two numbers, **actual / projected**:

```
Q1 2026        1.80 / 2.40 days/wk
               18 / 24 / 50 days
```

- **Actual** counts only real In-Office days up to today
- **Projected** adds your planned future days (and future weekdays to the divisor)
- Out-of-office days and holidays are excluded from both

## Auto-Conversion
When a planned day's date arrives, it is automatically converted to **In Office**:
- On app load (`convertPlannedToPresent`)
- On the periodic date-change check (runs about once a minute)

So if you planned today and open the app, today flips from 📅 to ✓ automatically.

## Data Model
```typescript
plannedDates: Map<string, boolean> = new Map();
// Key:   "YEAR-MONTH-DAY" (0-based month, e.g. "2026-1-3" = Feb 3, 2026)
// Value: true
```

### Persistence & Transfer
- Saved to `localStorage` under `plannedDates`
- JSON export/import includes a `plannedDates` array
- CSV export lists planned days with status `Planned` and note `Planned attendance`;
  CSV import restores rows whose status is `planned`

## Relevant Code
- `togglePlannedAttendance(date, event)` — toggles a planned day
- `isPlanned(date)` / `isFuture(date)` — state checks
- `getMonthStats(month)` — returns `projectedPresentDays`, `projectedTotalDays`,
  `projectedHolidayCount`, `projectedWorkDays`, `projectedRate`
- `getAveragePerWeek(month, useProjected)` and `getQuarterStats(quarter, useProjected)`
  — compute actual or projected values via the `useProjected` parameter
- `hasPlannedDatesInMonth(month)` / `hasPlannedDatesInQuarter(quarter)` — decide
  when the `actual / projected` display appears

## Styling
```css
.mini-calendar-day.planned {
  border: 2px dashed #4fc3f7;   /* dashed blue border */
  opacity: 0.8;
}
.mini-calendar-day.planned .mini-day-number {
  font-style: italic;
}
```
