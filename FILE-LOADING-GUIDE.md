# Auto-Load Attendance Data from File

## Overview
The attendance app can load data from a JSON file at any time using the "Load From File" button. This allows you to start with pre-existing attendance data.

## How to Use

### Method 1: Using the "Load From File" Button

1. Open the app at http://localhost:4200
2. Click the **"Load From File"** button (orange button in the data controls)
3. Select your JSON file
4. Data will be loaded and saved to browser's localStorage

### Method 2: Prepare Your Default Data File

Create a JSON file with this format:

**File: `my-attendance-data.json`**
```json
{
  "year": 2025,
  "attendance": [
    ["2025-0-1", true],
    ["2025-0-2", true],
    ["2025-0-3", false],
    ["2025-9-14", true],
    ["2025-9-15", true],
    ["2025-9-16", true]
  ]
}
```

### Date Format in JSON:
- Format: `"YEAR-MONTH-DAY"`
- Month: 0-indexed (0 = January, 9 = October, 11 = December)
- Day: 1-indexed (1-31)
- Value: `true` = Present, `false` = Absent (can be omitted for absent)

### Examples:
```json
"2025-0-15"  // January 15, 2025
"2025-9-1"   // October 1, 2025
"2025-11-25" // December 25, 2025
```

## Workflow

### 1. Create Initial Data File
```bash
# Create a file with your attendance data
cat > attendance-data.json << 'EOF'
{
  "year": 2025,
  "attendance": [
    ["2025-9-1", true],
    ["2025-9-2", true],
    ["2025-9-3", true],
    ["2025-9-6", true],
    ["2025-9-7", true],
    ["2025-9-8", true],
    ["2025-9-9", true],
    ["2025-9-10", true],
    ["2025-9-13", true],
    ["2025-9-14", true],
    ["2025-9-15", true],
    ["2025-9-16", true]
  ]
}
EOF
```

### 2. Load in Browser
1. Open app
2. Click "Load From File"
3. Select `attendance-data.json`
4. Data is now loaded and saved

### 3. Continue Tracking
- Mark additional days as you go
- Data is auto-saved to localStorage
- Export anytime to backup

## Multi-User Setup

### For Each User:
1. Each user opens the app in their browser
2. Each user clicks "Load From File"
3. Each user selects their own JSON file
4. Data is stored separately in each browser's localStorage

### Example Files:
```
john-attendance-2025.json   # John's data
mary-attendance-2025.json   # Mary's data
alice-attendance-2025.json  # Alice's data
```

## Data Management Buttons

1. **Load From File** (Orange) - Load attendance data from JSON file
2. **Save** (Purple) - Manually save to localStorage with confirmation
3. **Export JSON** (Green) - Download current data as JSON file
4. **Export Excel** (Dark Green) - Download as CSV for Excel
5. **Import** (Blue) - Import and replace current data
6. **Clear All** (Red) - Delete all attendance data

## Best Practices

### 1. Regular Backups
```bash
# Export your data weekly
# Click "Export JSON" button
# Save to: backups/attendance-2025-week-XX.json
```

### 2. Version Control
```bash
# Keep your data in git
git add attendance-data.json
git commit -m "Updated attendance for Oct 16"
git push
```

### 3. Sharing Template
Create a template file for new users:
```json
{
  "year": 2025,
  "attendance": []
}
```

## Automation (Advanced)

### Auto-generate attendance file from script:
```javascript
// generate-attendance.js
const fs = require('fs');

const data = {
  year: 2025,
  attendance: []
};

// Mark all weekdays in October as present
for (let day = 1; day <= 31; day++) {
  const date = new Date(2025, 9, day); // October = month 9
  if (date.getDay() !== 0 && date.getDay() !== 6) { // Not weekend
    data.attendance.push([`2025-9-${day}`, true]);
  }
}

fs.writeFileSync('october-attendance.json', JSON.stringify(data, null, 2));
console.log('Generated october-attendance.json');
```

Run:
```bash
node generate-attendance.js
```

## Troubleshooting

### "Invalid file format" Error
- Check JSON syntax is valid
- Ensure `year` is a number
- Ensure `attendance` is an array
- Date format: `"YEAR-MONTH-DAY"`

### Data Not Loading
- Check browser console for errors (F12)
- Verify file has `.json` extension
- Try opening file in text editor to verify format

### Data Disappeared
- Check if you cleared localStorage
- Import from your last export/backup
- Check browser's localStorage: F12 → Application → Local Storage

## Security Note

⚠️ **Data is stored locally in your browser**
- Data is not encrypted
- Anyone with access to your computer can see the data
- Always lock your computer when away
- Use browser profiles for privacy between users

## Summary

✅ Load initial data using "Load From File" button
✅ Each user loads their own file in their browser
✅ Data persists in browser's localStorage
✅ Export regularly for backups
✅ No server or database needed
