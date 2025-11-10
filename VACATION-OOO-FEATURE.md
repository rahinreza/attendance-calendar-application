# Vacation / Out of Office (OOO) Feature

## Overview
Added functionality to mark specific dates as "Vacation/OOO" which excludes them from all attendance calculations. This is useful for tracking official vacation days, personal time off, sick leave, or any other dates where the person is officially not expected to be present.

## Features

### 1. Mark Dates as Vacation/OOO
- **Right-click** any weekday to mark it as Vacation/OOO
- Right-click again to remove the exclusion
- Excluded dates cannot be marked as present/absent (they're completely excluded)
- Weekends cannot be marked as excluded (they're already not counted)

### 2. Visual Indicators
- **Purple border** around excluded dates
- **Beach emoji (🏖️)** in the top-right corner of excluded dates
- **Strike-through** text on the date number
- **Purple color** theme throughout

### 3. Updated Statistics
All statistics automatically exclude vacation/OOO dates:
- **Year stats**: Shows count of excluded days
- **Month stats**: Shows count of excluded days (if any)
- **Work Days calculation**: Excludes vacation/OOO dates
- **Attendance Rate**: Calculated without vacation/OOO dates
- **Average per week**: Calculated without vacation/OOO dates

### 4. Data Persistence
- Excluded dates are saved to localStorage automatically
- Included in JSON export/import
- Included in Excel/CSV export (marked as "Excluded" status)
- Survives page refresh and browser restarts

## How to Use

### Marking a Date as Vacation/OOO
1. Navigate to the month containing the date
2. **Right-click** on the weekday you want to exclude
3. The date will turn purple with a beach emoji 🏖️
4. Data is auto-saved

### Removing Vacation/OOO Marking
1. **Right-click** the excluded date again
2. The purple marking and emoji will disappear
3. The date returns to normal state

### Viewing Statistics
- **Year Statistics Bar**: Shows total vacation/OOO days for the year
- **Month Statistics**: Shows vacation/OOO count for each month (only if > 0)
- All calculations automatically exclude these dates

## Technical Details

### Data Structure
```typescript
excludedDates: Map<string, string>
// Key: "YEAR-MONTH-DAY"
// Value: "Vacation/OOO" (reason for exclusion)
```

### Storage
```javascript
localStorage.setItem('excludedDates', JSON.stringify(excludedArray))
```

### Export Format (JSON)
```json
{
  "userName": "John Doe",
  "year": 2025,
  "attendance": [
    ["2025-9-15", true],
    ["2025-9-16", true]
  ],
  "excludedDates": [
    ["2025-9-20", "Vacation/OOO"],
    ["2025-9-21", "Vacation/OOO"]
  ]
}
```

### Export Format (CSV/Excel)
```csv
Date,Day of Week,Status,Notes
10/20/2025,Monday,Excluded,"Vacation/OOO"
```

## Calculation Impact

### Before (without exclusions)
```
Work Days = Total Weekdays - Holidays
Attendance Rate = Present Days / Work Days * 100%
```

### After (with exclusions)
```
Work Days = Total Weekdays - Holidays - Excluded Days
Attendance Rate = Present Days / Work Days * 100%
```

### Example
**October 2025:**
- Total Weekdays: 23
- Holidays: 1 (Columbus Day)
- Vacation/OOO: 3
- Present: 15
- Absent: 4

**Calculations:**
- Work Days: 23 - 1 - 3 = 19
- Attendance Rate: 15 / 19 = 78.9%
- Average per Week: (15 / 19) * 5 = 3.95 days/week

## Use Cases

### 1. Planned Vacation
Mark your 2-week vacation in advance:
- Right-click each weekday in the vacation period
- Statistics will update to show expected work days
- When vacation happens, no need to mark as present/absent

### 2. Sick Leave
Mark sick days that should be excluded:
- Right-click the sick day
- It won't count against attendance rate
- Can be unmarked later if day was partially worked

### 3. Official Leave
Mark company-wide shutdowns, training days, etc.:
- Right-click each affected date
- Everyone's calculations adjust automatically

### 4. Sabbatical / Extended Leave
Mark long-term leave:
- Right-click all affected weekdays
- Attendance tracking continues for other dates
- Statistics reflect actual work days only

## Migration

### Existing Data
- No migration needed
- Existing attendance data remains unchanged
- Start marking exclusions as needed
- Old exports without excludedDates still import correctly

### Backwards Compatibility
- Old JSON exports (without excludedDates) import fine
- New exports include excludedDates field
- Can share data between old and new versions safely

## UI/UX

### Color Scheme
- **Green**: Present (✓)
- **Red**: Holidays (underline)
- **Purple**: Vacation/OOO (🏖️)
- **Gray**: Weekends
- **Blue**: Current day

### Interactions
- **Left-click**: Toggle present/absent (if not excluded)
- **Right-click**: Toggle vacation/OOO exclusion
- **Hover**: Shows tooltip with reason

### Visual Hierarchy
1. Present days: Most prominent (green checkmark)
2. Excluded days: Medium prominence (purple, emoji)
3. Absent days: Least prominent (no marking)
4. Holidays: Special indicator (red underline)

## Best Practices

### 1. Mark in Advance
- Mark vacation days before they happen
- Helps with planning and forecasting
- Statistics adjust automatically

### 2. Be Consistent
- Use for all official time off
- Include sick leave if company policy excludes it
- Don't use for partial days

### 3. Regular Review
- Review excluded dates monthly
- Remove any marked in error
- Export data for records

### 4. Documentation
- Keep external record of why dates are excluded
- Use consistent reasoning (vacation, sick, training, etc.)
- Include in performance reviews if needed

## Troubleshooting

### Can't mark a date as excluded
**Reason**: It's a weekend
**Solution**: Weekends are automatically excluded, no need to mark

### Can't mark a date as present
**Reason**: It's marked as excluded
**Solution**: Right-click to remove exclusion first

### Statistics seem wrong
**Reason**: Excluded dates might not be counted
**Solution**: Check excluded dates count in statistics

### Lost excluded dates after import
**Reason**: Imported file doesn't have excludedDates field
**Solution**: Re-mark dates or export from newer version

## Future Enhancements (Possible)

- [ ] Custom reasons for exclusion (vacation, sick, training, etc.)
- [ ] Bulk mark date ranges as excluded
- [ ] Calendar view showing only excluded dates
- [ ] Report showing excluded dates summary
- [ ] Different types of exclusions with different calculations
- [ ] Approval workflow for exclusions
- [ ] Integration with company HR systems

## Summary

✅ **Right-click to exclude dates** from calculations
✅ **Purple indicator** with beach emoji
✅ **Automatic statistics updates** 
✅ **Data persistence** in localStorage and exports
✅ **No impact on existing data** or features
✅ **Simple, intuitive** user interface

This feature makes the attendance tracker more powerful and accurate by allowing you to exclude dates that shouldn't count toward attendance calculations.
