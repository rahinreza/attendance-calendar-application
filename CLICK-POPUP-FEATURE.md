# Click Popup Notification Feature

## Overview
Every calendar action shows a small popup at the click location so you get
immediate, unambiguous feedback about what happened.

## Popup Types & Messages

**Success (green)**
- `In Office ✓` — left-click marks a past/today weekday as in office
- `Out of Office 💼` — right-click marks a day as out of office
- `Planned ✓📅` — left-click marks a future weekday as planned
- `Saved` — the **Save** button (centered on screen)

**Info (blue)**
- `Unmarked` — left-click removes an in-office mark
- `Removed 💼` — right-click clears an out-of-office day
- `Removed Plan 📅` — left-click clears a planned future day
- `Auto-saved` — shown after every change (centered near the top)
- `🔄 Data synced from another tab` — another browser tab changed the data

**Warning (orange)**
- `Already Out of Office 💼` — left-clicking a day that's marked out of office

## Behavior
- **Duration:** ~2 seconds, then fades out
- **Position:** centered just above the click point (`translate(-50%, -120%)`)
- **Non-blocking:** `pointer-events: none`, so it never intercepts clicks
- Action popups appear at the cursor; the follow-up `Auto-saved` popup appears
  centered near the top of the viewport

## Implementation

### State
```typescript
showPopup = false;
popupMessage = '';
popupX = 0;
popupY = 0;
popupType: 'success' | 'info' | 'warning' = 'info';
```

### Trigger
```typescript
showClickPopup(message: string, x: number, y: number,
               type: 'success' | 'info' | 'warning' = 'info') {
  this.popupMessage = message;
  this.popupX = x;
  this.popupY = y;
  this.popupType = type;
  this.showPopup = true;
  setTimeout(() => (this.showPopup = false), 2000);
}
```

### Template
```html
<div class="click-popup"
     *ngIf="showPopup"
     [class.success]="popupType === 'success'"
     [class.info]="popupType === 'info'"
     [class.warning]="popupType === 'warning'"
     [style.left.px]="popupX"
     [style.top.px]="popupY">
  {{ popupMessage }}
</div>
```

### Style
```css
.click-popup {
  position: fixed;
  transform: translate(-50%, -120%);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  color: white;
  pointer-events: none;
  z-index: 10000;
}
```

## Message Reference
| Trigger | Message | Type |
|---------|---------|------|
| Left-click past/today (mark) | `In Office ✓` | success |
| Left-click past/today (unmark) | `Unmarked` | info |
| Left-click on excluded day | `Already Out of Office 💼` | warning |
| Left-click future (plan) | `Planned ✓📅` | success |
| Left-click future (unplan) | `Removed Plan 📅` | info |
| Right-click (mark OOO) | `Out of Office 💼` | success |
| Right-click (clear OOO) | `Removed 💼` | info |
| After any change | `Auto-saved` | info |
| Save button | `Saved` | success |
| Cross-tab update | `🔄 Data synced from another tab` | info |
