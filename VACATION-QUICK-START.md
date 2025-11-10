# Quick Start Guide - Vacation/OOO Feature

## What's New?

You can now mark dates as **Vacation/Out of Office** to exclude them from attendance calculations!

## 🎯 How to Use

### Mark a Date as Vacation/OOO
```
1. Find the date in the calendar
2. RIGHT-CLICK on the date
3. Date turns purple with 🏖️ emoji
4. Auto-saved!
```

### Remove Vacation/OOO Marking
```
1. Find the purple date
2. RIGHT-CLICK again
3. Date returns to normal
4. Auto-saved!
```

## 📊 What Changes?

### Year Statistics
Before:
```
Days Present: 180
Days Absent: 40
Holidays: 10
Work Days: 230
Attendance Rate: 78.3%
```

After (with 5 vacation days):
```
Days Present: 180
Days Absent: 40
Holidays: 10
Vacation/OOO: 5 ← NEW!
Work Days: 225
Attendance Rate: 80.0% ← Better!
```

### Month Statistics
Shows vacation count if > 0:
```
Present: 15
Work Days: 19
Holidays: 1
Vacation: 2 ← NEW!
Rate: 83.3%
Avg/Week: 3.95
```

## 🎨 Visual Guide

### Calendar Day States

#### Normal Weekday (Unmarked)
```
┌──────┐
│  15  │ ← Click to mark present
│      │
└──────┘
```

#### Present Day
```
┌──────┐
│  15  │✓ ← Green checkmark
│      │
└──────┘
```

#### Vacation/OOO Day
```
┌──────┐
│  15  │🏖️ ← Beach emoji
│ ~~~  │ ← Strike-through
└──────┘
Purple border
```

#### Holiday
```
┌──────┐
│  15  │
│ ━━━  │ ← Red underline
└──────┘
```

#### Weekend
```
┌──────┐
│  15  │ ← Grayed out
│      │ ← No interaction
└──────┘
```

## ⌨️ Keyboard/Mouse Actions

| Action | Result |
|--------|--------|
| Left Click | Toggle Present/Absent |
| Right Click | Toggle Vacation/OOO |
| Hover | Show tooltip |

## 📁 Data Export

### JSON Format
```json
{
  "userName": "John Doe",
  "year": 2025,
  "attendance": [
    ["2025-9-15", true]
  ],
  "excludedDates": [
    ["2025-9-20", "Vacation/OOO"]
  ]
}
```

### CSV/Excel Format
```csv
Date,Day of Week,Status,Notes
10/15/2025,Wednesday,Present,
10/20/2025,Monday,Excluded,"Vacation/OOO"
```

## 🧮 Calculation Examples

### Example 1: October 2025
```
Total Weekdays: 23
- Holidays: 1 (Columbus Day)
- Vacation: 3
= Work Days: 19

Present Days: 15
Attendance Rate: 15/19 = 78.9%
Avg per Week: 3.95 days/week
```

### Example 2: Full Year
```
Total Weekdays: 260
- Holidays: 10
- Vacation: 15
= Work Days: 235

Present Days: 200
Attendance Rate: 200/235 = 85.1%
```

## 💡 Common Scenarios

### Planned 2-Week Vacation
1. Navigate to vacation months
2. Right-click each weekday (10 days total)
3. All marked purple with 🏖️
4. Statistics adjust automatically
5. No need to mark as present/absent during vacation

### Unexpected Sick Day
1. Right-click the sick day
2. Marked as excluded
3. Doesn't count against attendance
4. Can unmark later if partial day worked

### Company Shutdown Week
1. Right-click all weekdays in the week
2. All team members do the same
3. Statistics accurate for everyone
4. Export for records

## 🔧 Troubleshooting

### Can't Right-Click on Date
**Problem**: Right-click menu doesn't appear
**Solution**: The app prevents default browser menu. Just right-click, the date will change color.

### Weekend Won't Mark as Excluded
**Problem**: Can't right-click weekends
**Solution**: Weekends are already excluded by default. Only weekdays can be marked.

### Lost Vacation Markings
**Problem**: Vacation dates disappeared
**Solution**: Check localStorage wasn't cleared. Re-import your last JSON export.

### Statistics Don't Match
**Problem**: Numbers seem wrong
**Solution**: Check the purple "Vacation/OOO" count in statistics. Those dates are excluded.

## ✅ Best Practices

### DO:
✅ Mark vacation days in advance
✅ Mark sick days when appropriate
✅ Export data regularly for backup
✅ Use consistent approach (mark all or none)
✅ Right-click to remove if marked by mistake

### DON'T:
❌ Mark partial days as vacation
❌ Mark weekends (already excluded)
❌ Forget to export data before clearing browser
❌ Mix vacation and present markings
❌ Leave test markings in production data

## 🚀 Power User Tips

### Tip 1: Batch Planning
Export your attendance data → Mark all future vacation dates → Import back in

### Tip 2: Template Years
Create a template JSON with your planned vacation dates for the whole year

### Tip 3: Team Coordination
Share exported JSON files with managers to show vacation schedules

### Tip 4: Historical Records
Keep monthly exports showing vacation vs sick days for HR purposes

### Tip 5: Quick Audit
Filter Excel export by "Excluded" status to review all vacation dates at once

## 📞 Need Help?

1. Check **VACATION-OOO-FEATURE.md** for detailed documentation
2. Review this guide's examples
3. Test on a few dates first
4. Export data before major changes
5. Keep backups of your JSON files

## 🎉 Summary

**One simple gesture changes everything:**

**RIGHT-CLICK** = Vacation/OOO Toggle

That's it! The app handles the rest:
- Purple marking
- Beach emoji 🏖️
- Exclude from calculations
- Update all statistics
- Auto-save to storage
- Include in exports

Enjoy more accurate attendance tracking! 🎊
