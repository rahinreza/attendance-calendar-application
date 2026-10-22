# Click Popup — Visual Demo

A walkthrough of the feedback popups. See
[CLICK-POPUP-FEATURE.md](./CLICK-POPUP-FEATURE.md) for the full reference.

## Scenario 1 — Mark a day In Office
```
Left-click a past/today weekday
        │
        ▼
   ┌──────────────┐
   │ In Office ✓  │   ← green popup, at the cursor
   └──────────────┘
        │  (~0.5s later)
        ▼
   ┌──────────────┐
   │ Auto-saved   │   ← blue popup, top-center
   └──────────────┘
```
Left-click the same day again → blue **"Unmarked"** popup.

## Scenario 2 — Mark a day Out of Office
```
Right-click a weekday
        │
        ▼
   ┌────────────────────┐
   │ Out of Office 💼   │   ← green popup
   └────────────────────┘

The day turns purple with a strike-through and a 💼 icon.
```
Right-click again → blue **"Removed 💼"** popup.

## Scenario 3 — Plan a future day
```
Left-click a FUTURE weekday
        │
        ▼
   ┌────────────────┐
   │ Planned ✓📅    │   ← green popup
   └────────────────┘

The day gets a dashed blue border and a 📅 icon.
```
Left-click again → blue **"Removed Plan 📅"** popup.

## Scenario 4 — Clicking an excluded day
```
Left-click a day already marked Out of Office
        │
        ▼
   ┌──────────────────────────┐
   │ Already Out of Office 💼 │   ← orange warning popup
   └──────────────────────────┘
```
Right-click first to clear it, then left-click to mark In Office.

## Colors
```
🟢 success  →  In Office ✓ · Out of Office 💼 · Planned ✓📅 · Saved
🔵 info     →  Unmarked · Removed 💼 · Removed Plan 📅 · Auto-saved
🟠 warning  →  Already Out of Office 💼
```

## Timing
- Appears instantly at the click point, centered just above the cursor
- Stays ~2 seconds, then fades out
- Never blocks clicks (`pointer-events: none`)
