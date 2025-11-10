# CHANGELOG

## Version 2.1.0 - October 17, 2025

### 🎉 New Feature: Vacation/Out of Office Tracking

Track official time-off and exclude it from attendance calculations!

#### ✨ What's New

**Mark Dates as Vacation/OOO**
- Right-click any weekday to mark as Vacation/Out of Office
- Purple border with beach emoji (🏖️) indicator
- Automatically excluded from all attendance calculations

**Updated Statistics**
- New "Vacation/OOO" count in year statistics
- Month statistics show vacation days (when > 0)
- Work days calculation excludes vacation dates
- Attendance rate recalculates without vacation days

**Data Persistence**
- Vacation dates saved to localStorage automatically
- Included in JSON exports
- Included in CSV/Excel exports
- Import/export fully compatible

#### 🎨 Visual Improvements

**New Indicators**
- 🟣 Purple border around excluded dates
- 🏖️ Beach emoji in corner
- Strike-through date number
- Purple color theme

**Updated Instructions**
- Added right-click guidance
- Clarified vacation vs. holiday handling
- Updated visual legend

#### 📊 How It Works

**Before:**
```
Work Days = Total Weekdays - Holidays
Attendance Rate = Present Days / Work Days
```

**After:**
```
Work Days = Total Weekdays - Holidays - Vacation Days
Attendance Rate = Present Days / Work Days
```

**Example:**
```
October 2025 (without vacation tracking):
- Total Weekdays: 23
- Holidays: 1
- Work Days: 22
- Present: 17
- Attendance Rate: 77.3%

October 2025 (with 3 vacation days marked):
- Total Weekdays: 23
- Holidays: 1
- Vacation: 3
- Work Days: 19
- Present: 17
- Attendance Rate: 89.5% ← More accurate!
```

#### 🚀 Usage

**Mark a Date:**
1. Find the date in calendar
2. Right-click the date
3. Date turns purple with 🏖️
4. Auto-saved!

**Remove Marking:**
1. Right-click the purple date again
2. Returns to normal state
3. Auto-saved!

**View Statistics:**
- Year stats show total vacation days
- Month stats show vacation count
- All rates exclude vacation days

#### 📁 Data Format

**JSON Export:**
```json
{
  "userName": "John Doe",
  "year": 2025,
  "attendance": [...],
  "excludedDates": [
    ["2025-9-20", "Vacation/OOO"],
    ["2025-9-21", "Vacation/OOO"]
  ]
}
```

**CSV Export:**
```csv
Date,Status,Notes
10/20/2025,Excluded,"Vacation/OOO"
```

#### 🔧 Technical Details

- No breaking changes
- Backwards compatible with old data
- Old exports still import correctly
- New field optional in imports
- Zero performance impact
- No new dependencies

#### 📖 Documentation

New documentation files:
- `VACATION-OOO-FEATURE.md` - Detailed feature guide
- `VACATION-QUICK-START.md` - Quick start guide
- `IMPLEMENTATION-SUMMARY.md` - Technical summary

Updated files:
- `README.md` - Added feature and usage info

#### ⚠️ Important Notes

**What Gets Excluded:**
✅ Vacation/OOO dates (right-click to mark)
✅ US Federal Holidays (automatic)
✅ Weekends (automatic)

**What Counts Toward Attendance:**
- All unmarked weekdays (= absent)
- Marked present days (= present)

**Pro Tips:**
- Mark vacation in advance for planning
- Export data regularly for backup
- Right-click works on any weekday
- Can't mark weekends (already excluded)

#### 🐛 Bug Fixes

None - This is a new feature release.

#### 🔮 Coming Soon

Possible future enhancements:
- Custom exclusion reasons
- Bulk date range selection
- Different exclusion types
- Exclusion history/audit

---

## Version 2.0.0 - Previous Release

[Previous changelog entries...]

---

## How to Update

**For Development:**
```bash
git pull origin main
npm install
npm start
```

**For Users:**
Just refresh your browser! Your data is safe in localStorage.

**Data Migration:**
No migration needed. Existing data works unchanged.

---

## Feedback

Questions or issues? Check:
1. `VACATION-QUICK-START.md` for how-to
2. `VACATION-OOO-FEATURE.md` for details
3. `README.md` for general info

---

**Enjoy more accurate attendance tracking!** 🎊
