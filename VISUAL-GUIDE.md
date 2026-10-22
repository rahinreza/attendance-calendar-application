# Visual Guide

A visual reference for the Attendance Calendar UI.

## Year Statistics Bar
```
┌────────────┬────────────┬───────────┬───────────────┬────────────┬────────────────┐
│ Days In    │ Days       │ Holidays  │ Out of Office │ Work Days  │ In Office Rate │
│ Office 🟢  │ Remote ⚫  │  🔴       │ 💼            │  🔵        │  %             │
├────────────┼────────────┼───────────┼───────────────┼────────────┼────────────────┤
│    180     │     40     │    10     │      5        │    220     │     81.8%      │
└────────────┴────────────┴───────────┴───────────────┴────────────┴────────────────┘
```

## Quarterly Average Cards
Each quarter shows **average in-office days/week** toward the **2.0** target, colored
by how close it is, plus a hint for how many more days are needed. Click the **i**
badge for a per-target breakdown (2.25 / 3 / 4 days/wk).
```
red < 1.0   ·   yellow 1.0–1.99   ·   light-green 2.0–2.24   ·   dark-green ≥ 2.25
```

## Calendar Day States
```
┌────┬────┬────┬────┬────┬────┬────┐
│ Su │ Mo │ Tu │ We │ Th │ Fr │ Sa │
├────┼────┼────┼────┼────┼────┼────┤
│    │  ✓ │    │  ✓ │ 💼 │ 📅 │    │
└────┴────┴────┴────┴────┴────┴────┘

✓   In Office   — left-click a past/today weekday (green)
💼  Out of Office — right-click a weekday (purple border, strike-through)
📅  Planned     — left-click a future weekday (dashed blue border)
    Remote      — an unmarked past weekday (counts against your rate)
━━  Holiday     — US federal holiday, red underline (not clickable)
    Weekend     — grayed out, not clickable
🔵  Today       — blue border
```

## Interactions
```
┌──────┐   LEFT-CLICK (past / today)  ──►  Toggle In Office  ✓
│  15  │   LEFT-CLICK (future)        ──►  Toggle Planned    📅
└──────┘   RIGHT-CLICK                ──►  Toggle Out of Office 💼
```
Weekends and holidays are not markable. Every change auto-saves and shows a popup.

## How Attendance Is Counted
```
Weekdays in the HR month
  − US federal holidays        (excluded)
  − Out-of-office / vacation   (excluded)
  = Work Days
        of which:
          In Office  →  counts toward your rate
          Remote     →  the rest

Avg per week = In Office ÷ Work-day weekdays × 5      (target: 2.0)
Rate         = In Office ÷ Work Days × 100%
```

> **HR weeks:** a whole Sun–Sat week is assigned to the month/quarter that contains
> that week's **Wednesday**, so a month's grid and totals can include a few days
> from the neighboring calendar month. Such days are tagged in their tooltip.

## Projected Values
When you have **planned** future days (📅), month and quarter cards show two numbers,
`actual / projected`, so you can preview the impact of your plans. Planned days are
automatically converted to In Office once the date arrives.

## Color Palette
```
🟢 Green   — In Office / success
🟣 Purple  — Out of Office / excluded   (#8b5cf6)
🔵 Blue    — Planned (dashed) / Work Days / info   (#4fc3f7)
🔴 Red     — Holidays / low average
⚫ Gray    — Weekends / disabled
```

## Toolbar
```
[ Save ]  [ Import JSON ]  [ Export JSON ]  [ Import CSV ]  [ Export CSV ]
```
