/**
 * Attendance Calendar Application
 * Created by: Rahin Reza
 * https://github.com/rreza200
 */

import { Component, Inject, PLATFORM_ID, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DayAttendance {
  date: Date;
  isPresent: boolean;
  isMarked: boolean;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.Default // Keep Default for now since we use two-way binding
})
export class AppComponent implements OnInit {
  title = 'Attendance Calendar created by Rahin Reza and Copilot';
  
  currentDate: Date = new Date();
  currentYear: number = this.currentDate.getFullYear();
  
  selectedDate: Date | null = null;
  attendanceData: Map<string, boolean> = new Map();
  excludedDates: Map<string, string> = new Map(); // Map of date key to reason (vacation, OOO, etc.)
  plannedDates: Map<string, boolean> = new Map(); // Map for future/planned attendance (what-if scenarios)
  
  // Toggle to show projected stats with planned future attendance
  showProjected: boolean = false;
  
  // Cache for month statistics to improve performance
  private monthStatsCache: Map<number, any> = new Map();
  private cacheVersion: number = 0;
  
  // Cache for calendar days to avoid recalculation
  private calendarDaysCache: Map<number, (Date | null)[]> = new Map();
  
  // Cache today's date (updated once per component lifecycle)
  private todayCache: Date = new Date();
  private todayKey: string = '';
  
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // US Federal Holidays
  holidays: Map<string, string> = new Map();
  
  // Quarter visibility state (true = expanded, false = collapsed)
  quarterExpanded: boolean[] = [true, true, true, true];
  
  // Auto-save indicator
  showSaveIndicator: boolean = false;
  
  // Username
  userName: string = 'User';
  isEditingUsername: boolean = false;
  
  // Popup notification
  showPopup: boolean = false;
  popupMessage: string = '';
  popupX: number = 0;
  popupY: number = 0;
  popupType: 'success' | 'info' | 'warning' = 'info';
  
  // Review modal
  showReviewModal: boolean = false;
  markedDates: Array<{dateKey: string, date: Date, dayName: string, isWeekend: boolean, isHoliday: boolean}> = [];
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Initialize with some sample attendance data
    this.updateTodayCache();
    this.initializeHolidays();
    this.loadAttendanceData();
    this.initializeQuarterVisibility();
    this.loadUsername();
  }

  ngOnInit() {
    // Check if today was planned and convert to present
    if (isPlatformBrowser(this.platformId)) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      this.convertPlannedToPresent(today);
      
      // Check for date changes every minute
      setInterval(() => {
        this.checkDateChange();
      }, 60000); // Check every minute
      
      // Listen for localStorage changes from other tabs
      window.addEventListener('storage', (event) => {
        if (event.key === 'attendanceData' || event.key === 'plannedDates' || event.key === 'excludedDates') {
          // Reload data from localStorage when other tabs make changes
          this.loadAttendanceData();
          
          // Show notification that data was updated
          const centerX = window.innerWidth / 2;
          const centerY = window.scrollY + 100;
          this.showClickPopup('🔄 Data synced from another tab', centerX, centerY, 'info');
        }
      });
    }
  }

  private checkDateChange() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const nowKey = this.getDateKey(now);
    
    if (nowKey !== this.todayKey) {
      // Date has changed - update everything
      this.currentDate = new Date();
      this.updateTodayCache();
      
      // Auto-convert planned dates to present when the day arrives
      this.convertPlannedToPresent(now);
      
      this.invalidateStatsCache();
    }
  }
  
  private convertPlannedToPresent(today: Date) {
    const todayKey = this.getDateKey(today);
    
    // If today was marked as planned, convert it to present
    // (This handles manual app opens without WiFi script)
    if (this.plannedDates.has(todayKey) && !this.attendanceData.has(todayKey)) {
      this.attendanceData.set(todayKey, true);
      this.plannedDates.delete(todayKey);
      this.saveAttendanceData(false);
    }
  }
  
  private updateTodayCache() {
    this.todayCache = new Date();
    this.todayCache.setHours(0, 0, 0, 0);
    this.todayKey = this.getDateKey(this.todayCache);
  }
  
  initializeQuarterVisibility() {
    // Auto-expand current quarter, collapse others
    const currentMonth = this.currentDate.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);
    
    this.quarterExpanded = [false, false, false, false];
    this.quarterExpanded[currentQuarter] = true;
  }
  
  toggleQuarter(quarter: number) {
    this.quarterExpanded[quarter] = !this.quarterExpanded[quarter];
  }
  
  getMonthsInQuarter(quarter: number): number[] {
    const startMonth = quarter * 3;
    return [startMonth, startMonth + 1, startMonth + 2];
  }
  
  initializeSampleData() {
    // Mark some random weekdays as present
    const today = new Date();
    
    // Mark today as present if it's a weekday
    if (this.isWeekday(today)) {
      this.attendanceData.set(this.getDateKey(today), true);
    }
    
    // Mark some past weekdays
    for (let i = 1; i <= 10; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      // Only mark weekdays, randomly mark as present or absent
      if (this.isWeekday(date)) {
        this.attendanceData.set(this.getDateKey(date), Math.random() > 0.3);
      }
    }
    
    // Clear any weekend data that might exist
    this.clearWeekendData();
  }
  
  clearWeekendData() {
    const keysToDelete: string[] = [];
    this.attendanceData.forEach((value, key) => {
      const [year, month, day] = key.split('-').map(Number);
      const date = new Date(year, month, day);
      if (this.isWeekend(date)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.attendanceData.delete(key));
  }
  
  initializeHolidays() {
    this.setHolidaysForYear(this.currentYear);
  }
  
  setHolidaysForYear(year: number) {
    this.holidays.clear();
    
    // Fixed date holidays
    this.holidays.set(`${year}-0-1`, "New Year's Day");
    this.holidays.set(`${year}-5-19`, "Juneteenth");
    this.holidays.set(`${year}-6-4`, "Independence Day");
    this.holidays.set(`${year}-11-25`, "Christmas Day");
    
    // MLK Day - Third Monday in January
    const mlkDay = this.getNthWeekdayOfMonth(year, 0, 1, 3);
    this.holidays.set(this.getDateKey(mlkDay), "Martin Luther King Jr. Day");
    
    // Memorial Day - Last Monday in May
    const memorialDay = this.getLastWeekdayOfMonth(year, 4, 1);
    this.holidays.set(this.getDateKey(memorialDay), "Memorial Day");
    
    // Labor Day - First Monday in September
    const laborDay = this.getNthWeekdayOfMonth(year, 8, 1, 1);
    this.holidays.set(this.getDateKey(laborDay), "Labor Day");
    
    // Thanksgiving - Fourth Thursday in November
    const thanksgiving = this.getNthWeekdayOfMonth(year, 10, 4, 4);
    this.holidays.set(this.getDateKey(thanksgiving), "Thanksgiving");
  }
  
  getNthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): Date {
    const firstDay = new Date(year, month, 1);
    const firstWeekday = firstDay.getDay();
    const offset = (weekday - firstWeekday + 7) % 7;
    const date = 1 + offset + (n - 1) * 7;
    return new Date(year, month, date);
  }
  
  getLastWeekdayOfMonth(year: number, month: number, weekday: number): Date {
    const lastDay = new Date(year, month + 1, 0);
    const lastWeekday = lastDay.getDay();
    const offset = (lastWeekday - weekday + 7) % 7;
    return new Date(year, month, lastDay.getDate() - offset);
  }
  
  isHoliday(date: Date | null): boolean {
    if (!date) return false;
    return this.holidays.has(this.getDateKey(date));
  }
  
  getHolidayName(date: Date | null): string {
    if (!date) return '';
    return this.holidays.get(this.getDateKey(date)) || '';
  }
  
  loadUsername() {
    if (isPlatformBrowser(this.platformId)) {
      const savedUsername = localStorage.getItem('userName');
      if (savedUsername && savedUsername.trim()) {
        this.userName = savedUsername;
      } else {
        this.userName = 'User';
      }
    }
  }
  
  saveUsername() {
    if (isPlatformBrowser(this.platformId)) {
      const nameToSave = this.userName && this.userName.trim() ? this.userName : 'User';
      localStorage.setItem('userName', nameToSave);
    }
  }
  
  editUsername() {
    this.isEditingUsername = true;
  }
  
  saveUsernameAndClose() {
    this.isEditingUsername = false;
    if (!this.userName.trim()) {
      this.userName = 'User';
    }
    this.saveUsername();
    this.showSaveIndicator = true;
    setTimeout(() => {
      this.showSaveIndicator = false;
    }, 5000);
  }
  
  saveAttendanceData(showAlert: boolean = true) {
    if (isPlatformBrowser(this.platformId)) {
      const dataArray = Array.from(this.attendanceData.entries());
      const excludedArray = Array.from(this.excludedDates.entries());
      const plannedArray = Array.from(this.plannedDates.entries());
      localStorage.setItem('attendanceData', JSON.stringify(dataArray));
      localStorage.setItem('excludedDates', JSON.stringify(excludedArray));
      localStorage.setItem('plannedDates', JSON.stringify(plannedArray));
      localStorage.setItem('attendanceYear', this.currentYear.toString());
      
      if (showAlert) {
        // Manual save - show "Saved" popup at center of screen
        const centerX = window.innerWidth / 2;
        const centerY = window.scrollY + (window.innerHeight / 2);
        this.showClickPopup('Saved', centerX, centerY, 'success');
      }
      
      // Show auto-save indicator briefly
      this.showSaveIndicator = true;
      setTimeout(() => {
        this.showSaveIndicator = false;
      }, 5000);
    }
  }
  
  loadAttendanceData() {
    if (isPlatformBrowser(this.platformId)) {
      const savedData = localStorage.getItem('attendanceData');
      const savedYear = localStorage.getItem('attendanceYear');
      const savedExcludedDates = localStorage.getItem('excludedDates');
      const savedPlannedDates = localStorage.getItem('plannedDates');
      
      if (savedData) {
        const dataArray = JSON.parse(savedData);
        this.attendanceData = new Map(dataArray);
      } else {
        // Initialize with sample data if no saved data exists
        this.initializeSampleData();
      }
      
      if (savedExcludedDates) {
        const excludedArray = JSON.parse(savedExcludedDates);
        this.excludedDates = new Map(excludedArray);
      }
      
      if (savedPlannedDates) {
        const plannedArray = JSON.parse(savedPlannedDates);
        this.plannedDates = new Map(plannedArray);
      }
      
      if (savedYear) {
        this.currentYear = parseInt(savedYear);
        this.setHolidaysForYear(this.currentYear);
      }
      
      // Invalidate cache after loading data
      this.invalidateStatsCache();
    } else {
      // Initialize with sample data for SSR
      this.initializeSampleData();
    }
  }
  
  exportData() {
    const dataArray = Array.from(this.attendanceData.entries());
    const excludedArray = Array.from(this.excludedDates.entries());
    const plannedArray = Array.from(this.plannedDates.entries());
    const exportUserName = this.userName && this.userName.trim() ? this.userName : 'User';
    const dataStr = JSON.stringify({
      userName: exportUserName,
      year: this.currentYear,
      attendance: dataArray,
      excludedDates: excludedArray,
      plannedDates: plannedArray
    }, null, 2);
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    const safeUserName = (this.userName && this.userName.trim() ? this.userName : 'User').replace(/\s+/g, '-');
    link.download = `attendance-${safeUserName}-${this.currentYear}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  importJSON(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.year && data.attendance) {
          // Clear existing data
          this.attendanceData.clear();
          
          // Import username if available
          if (data.userName && data.userName.trim()) {
            this.userName = data.userName.trim();
            this.saveUsername();
          } else {
            this.userName = 'User';
          }
          
          // Import attendance data
          data.attendance.forEach((entry: [string, boolean]) => {
            this.attendanceData.set(entry[0], entry[1]);
          });
          
          // Import excluded dates if available
          if (data.excludedDates) {
            this.excludedDates.clear();
            data.excludedDates.forEach((entry: [string, string]) => {
              this.excludedDates.set(entry[0], entry[1]);
            });
          }
          
          // Import planned dates if available
          if (data.plannedDates) {
            this.plannedDates.clear();
            data.plannedDates.forEach((entry: [string, boolean]) => {
              this.plannedDates.set(entry[0], entry[1]);
            });
          }
          
          // Update year if different
          if (data.year !== this.currentYear) {
            this.currentYear = data.year;
            this.setHolidaysForYear(this.currentYear);
          }
          
          // Invalidate cache after importing data
          this.invalidateStatsCache();
          
          this.saveAttendanceData();
          const displayName = this.userName && this.userName.trim() ? this.userName : 'User';
          alert(`Data imported successfully for ${displayName}!`);
        } else {
          alert('Invalid file format. Please select a valid attendance JSON file.');
        }
      } catch (error) {
        alert('Error reading file. Please ensure it is a valid JSON file.');
        console.error('Import error:', error);
      }
      
      // Reset input
      input.value = '';
    };
    
    reader.readAsText(file);
  }

  importExcel(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n');
        
        // Clear existing data
        this.attendanceData.clear();
        
        // Find the year from the first line
        const yearMatch = lines[0].match(/\d{4}/);
        if (yearMatch) {
          const year = parseInt(yearMatch[0]);
          if (year !== this.currentYear) {
            this.currentYear = year;
            this.setHolidaysForYear(this.currentYear);
          }
        }
        
        // Find the username from the second line
        if (lines[1] && lines[1].includes('Name,')) {
          const nameParts = lines[1].split(',');
          if (nameParts.length > 1 && nameParts[1].trim()) {
            this.userName = nameParts[1].trim();
            this.saveUsername();
          } else {
            this.userName = 'User';
          }
        }
        
        // Find the "MONTHLY DETAIL" section
        let inMonthlySection = false;
        let headerPassed = false;
        
        for (const line of lines) {
          if (line.includes('MONTHLY DETAIL')) {
            inMonthlySection = true;
            continue;
          }
          
          if (inMonthlySection) {
            if (line.includes('Month,Date,Day,Status')) {
              headerPassed = true;
              continue;
            }
            
            if (headerPassed && line.trim()) {
              const parts = line.split(',');
              if (parts.length >= 4) {
                const dateStr = parts[1]?.trim();
                const status = parts[3]?.trim().toLowerCase();
                
                if (dateStr && status === 'present') {
                  this.attendanceData.set(dateStr, true);
                }
              }
            }
          }
        }
        
        this.saveAttendanceData();
        alert('Excel data imported successfully!');
      } catch (error) {
        alert('Error reading file. Please ensure it is a valid CSV file.');
        console.error('Import error:', error);
      }
      
      // Reset input
      input.value = '';
    };
    
    reader.readAsText(file);
  }
  
  exportToExcel() {
    // Create CSV content with detailed calculations
    const exportUserName = this.userName && this.userName.trim() ? this.userName : 'User';
    let csv = 'Attendance Report,' + this.currentYear + '\n';
    csv += 'Name,' + exportUserName + '\n\n';
    
    // Year Summary
    const yearStats = this.getYearStats();
    csv += 'YEAR SUMMARY\n';
    csv += 'Days Present,' + yearStats.presentDays + '\n';
    csv += 'Days Absent,' + yearStats.absentDays + '\n';
    csv += 'Holidays,' + yearStats.holidayCount + '\n';
    csv += 'Work Days (Weekdays - Holidays),' + yearStats.workDays + '\n';
    csv += 'Attendance Rate,' + yearStats.attendanceRate.toFixed(2) + '%\n\n';
    
    // Quarterly Summary
    csv += 'QUARTERLY SUMMARY\n';
    csv += 'Quarter,Present Days,Total Weekdays,Holidays,Work Days,Avg per Week,Status\n';
    for (let q = 0; q < 4; q++) {
      const qStats = this.getQuarterStats(q);
      const qMonthStats = this.getQuarterDetailedStats(q);
      const avgPerWeek = qStats.averagePerWeek.toFixed(2);
      const status = this.getAverageColor(qStats.averagePerWeek);
      csv += `Q${q + 1},${qStats.presentDays},${qStats.totalWeekdays},${qMonthStats.holidayCount},${qMonthStats.workDays},${avgPerWeek},${status}\n`;
    }
    csv += '\n';
    
    // Monthly Detail
    csv += 'MONTHLY DETAIL\n';
    csv += 'Month,Present Days,Absent Days,Holidays,Total Weekdays,Work Days,Attendance Rate,Avg per Week\n';
    for (let m = 0; m < 12; m++) {
      const mStats = this.getMonthStats(m);
      const avgPerWeek = this.getAveragePerWeek(m).toFixed(2);
      csv += `${this.monthNames[m]},${mStats.presentDays},${mStats.absentDays},${mStats.holidayCount},${mStats.totalDays},${mStats.workDays},${mStats.attendanceRate.toFixed(2)}%,${avgPerWeek}\n`;
    }
    csv += '\n';
    
    // Daily Detail
    csv += 'DAILY DETAIL\n';
    csv += 'Date,Day of Week,Status,Notes\n';
    for (let m = 0; m < 12; m++) {
      const days = this.getCalendarDays(m);
      days.forEach(date => {
        if (date) {
          const dateStr = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
          const dayName = this.weekDays[date.getDay()];
          let status = '';
          let notes = '';
          
          if (this.isWeekend(date)) {
            status = 'Weekend';
          } else if (this.isExcluded(date)) {
            status = 'Excluded';
            notes = this.getExclusionReason(date);
          } else if (this.isHoliday(date)) {
            status = 'Holiday';
            notes = this.getHolidayName(date);
          } else if (this.isPresent(date)) {
            status = 'Present';
          } else if (date <= new Date()) {
            status = 'Absent';
          } else {
            status = 'Future';
          }
          
          csv += `${dateStr},${dayName},${status},"${notes}"\n`;
        }
      });
    }
    
    // Create and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-report-${this.currentYear}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
  
  loadFromFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.attendance && Array.isArray(data.attendance)) {
          this.attendanceData = new Map(data.attendance);
          if (data.year) {
            this.currentYear = data.year;
            this.setHolidaysForYear(this.currentYear);
          }
          this.saveAttendanceData(false);
          alert('Attendance data loaded from file successfully!');
        } else {
          alert('Invalid file format!');
        }
      } catch (error) {
        alert('Error reading file!');
      }
    };
    
    reader.readAsText(file);
    // Reset input to allow loading the same file again
    input.value = '';
  }
  
  importData(event: Event) {
    // Same as loadFromFile
    this.loadFromFile(event);
  }
  
  clearAllData() {
    if (confirm('Are you sure you want to clear all attendance data? This cannot be undone.')) {
      this.attendanceData.clear();
      this.excludedDates.clear();
      this.saveAttendanceData(false);
      alert('All attendance data cleared!');
    }
  }
  
  isExcluded(date: Date | null): boolean {
    if (!date) return false;
    return this.excludedDates.has(this.getDateKey(date));
  }
  
  isPlanned(date: Date | null): boolean {
    if (!date) return false;
    return this.plannedDates.get(this.getDateKey(date)) === true;
  }
  
  isFuture(date: Date | null): boolean {
    if (!date) return false;
    return date > this.todayCache;
  }
  
  getExclusionReason(date: Date | null): string {
    if (!date) return '';
    return this.excludedDates.get(this.getDateKey(date)) || '';
  }
  
  toggleExclusion(date: Date | null, event?: MouseEvent) {
    if (!date || this.isWeekend(date)) return;
    
    const key = this.getDateKey(date);
    if (this.excludedDates.has(key)) {
      // Remove exclusion
      this.excludedDates.delete(key);
      if (event) {
        this.showClickPopup('Removed 💼', event.clientX, event.clientY, 'info');
      }
    } else {
      // Mark as excluded - could prompt for reason, default to "Out of Office"
      this.excludedDates.set(key, 'Out of Office');
      // Also remove from attendance if marked
      this.attendanceData.delete(key);
      if (event) {
        this.showClickPopup('Out of Office 💼', event.clientX, event.clientY, 'success');
      }
    }
    // Invalidate cache when data changes
    this.invalidateStatsCache();
    this.saveAttendanceData(false);
    // Show auto-saved popup at current scroll position
    if (event) {
      setTimeout(() => {
        const centerX = window.innerWidth / 2;
        const centerY = window.scrollY + 100;
        this.showClickPopup('Auto-saved', centerX, centerY, 'info');
      }, 500);
    }
  }
  
  showClickPopup(message: string, x: number, y: number, type: 'success' | 'info' | 'warning' = 'info') {
    this.popupMessage = message;
    this.popupX = x;
    this.popupY = y;
    this.popupType = type;
    this.showPopup = true;
    
    // Auto-hide after 2 seconds
    setTimeout(() => {
      this.showPopup = false;
    }, 2000);
  }
  
  getDateKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }
  
  getCalendarDays(month: number): (Date | null)[] {
    // Check cache first
    if (this.calendarDaysCache.has(month)) {
      return this.calendarDaysCache.get(month)!;
    }
    
    const firstDay = new Date(this.currentYear, month, 1);
    const lastDay = new Date(this.currentYear, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const calendarDays: (Date | null)[] = [];
    
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(new Date(this.currentYear, month, day));
    }
    
    // Fill remaining slots to make exactly 42 cells (6 weeks x 7 days)
    // This ensures all months have the same height
    const totalCells = 42;
    while (calendarDays.length < totalCells) {
      calendarDays.push(null);
    }
    
    // Cache the result
    this.calendarDaysCache.set(month, calendarDays);
    
    return calendarDays;
  }
  
  getAllMonths(): number[] {
    return Array.from({ length: 12 }, (_, i) => i);
  }
  
  previousYear() {
    this.currentYear--;
    this.setHolidaysForYear(this.currentYear);
    this.calendarDaysCache.clear();
    this.invalidateStatsCache();
    this.saveAttendanceData(false);
    
    // Reset quarter expansion based on year
    const actualCurrentYear = new Date().getFullYear();
    if (this.currentYear === actualCurrentYear) {
      const currentQuarter = Math.floor(this.currentDate.getMonth() / 3);
      this.quarterExpanded = [false, false, false, false];
      this.quarterExpanded[currentQuarter] = true;
    } else {
      this.quarterExpanded = [false, false, false, false];
    }
  }
  
  nextYear() {
    this.currentYear++;
    this.setHolidaysForYear(this.currentYear);
    this.calendarDaysCache.clear();
    this.invalidateStatsCache();
    this.saveAttendanceData(false);
    
    // Reset quarter expansion based on year
    const actualCurrentYear = new Date().getFullYear();
    if (this.currentYear === actualCurrentYear) {
      const currentQuarter = Math.floor(this.currentDate.getMonth() / 3);
      this.quarterExpanded = [false, false, false, false];
      this.quarterExpanded[currentQuarter] = true;
    } else {
      this.quarterExpanded = [false, false, false, false];
    }
  }
  
  selectDate(date: Date | null, isRightClick: boolean = false, event?: MouseEvent) {
    // Don't allow marking holidays - they're excluded like weekends
    if (date && !this.isWeekend(date) && !this.isHoliday(date)) {
      this.selectedDate = date;
      const isFutureDate = this.isFuture(date);
      const isShiftClick = event?.shiftKey;
      
      if (isRightClick) {
        // Right-click toggles exclusion (vacation/OOO)
        this.toggleExclusion(date, event);
      } else if (isFutureDate && isShiftClick) {
        // Shift+Click on future date toggles planned attendance
        this.togglePlannedAttendance(date, event);
      } else if (isFutureDate) {
        // Regular click on future date shows info
        if (event) {
          this.showClickPopup('Shift+Click to plan future attendance 📅', event.clientX, event.clientY, 'info');
        }
        return; // Don't save for info messages
      } else {
        // Left-click toggles actual attendance (but not if excluded)
        if (!this.isExcluded(date)) {
          const wasPresent = this.isPresent(date);
          this.toggleAttendance(date);
          if (event) {
            if (wasPresent) {
              this.showClickPopup('Unmarked', event.clientX, event.clientY, 'info');
            } else {
              this.showClickPopup('Present ✓', event.clientX, event.clientY, 'success');
            }
          }
        } else if (event) {
          this.showClickPopup('Already Out of Office 💼', event.clientX, event.clientY, 'warning');
        }
      }
      this.saveAttendanceData(false); // Auto-save without manual save popup
      // Show auto-saved popup at current scroll position
      if (event) {
        setTimeout(() => {
          const centerX = window.innerWidth / 2;
          const centerY = window.scrollY + 100;
          this.showClickPopup('Auto-saved', centerX, centerY, 'info');
        }, 500);
      }
    }
  }
  
  togglePlannedAttendance(date: Date, event?: MouseEvent) {
    const key = this.getDateKey(date);
    if (this.plannedDates.has(key)) {
      this.plannedDates.delete(key);
      if (event) {
        this.showClickPopup('Removed Plan 📅', event.clientX, event.clientY, 'info');
      }
    } else {
      this.plannedDates.set(key, true);
      if (event) {
        this.showClickPopup('Planned ✓📅', event.clientX, event.clientY, 'success');
      }
    }
    this.invalidateStatsCache();
  }
  
  toggleAttendance(date: Date) {
    const key = this.getDateKey(date);
    if (this.attendanceData.has(key)) {
      // If already marked, remove it (turn off)
      this.attendanceData.delete(key);
    } else {
      // If not marked, mark as present (turn on)
      this.attendanceData.set(key, true);
    }
    // Invalidate cache when data changes
    this.invalidateStatsCache();
  }
  
  invalidateStatsCache() {
    this.cacheVersion++;
    this.monthStatsCache.clear();
  }
  
  isWeekday(date: Date | null): boolean {
    if (!date) return false;
    const day = date.getDay();
    return day >= 1 && day <= 5; // Monday = 1, Friday = 5
  }
  
  isWeekend(date: Date | null): boolean {
    if (!date) return false;
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
  }
  
  isToday(date: Date | null): boolean {
    if (!date) return false;
    return this.getDateKey(date) === this.todayKey;
  }
  
  isSelected(date: Date | null): boolean {
    if (!date || !this.selectedDate) return false;
    return date.getDate() === this.selectedDate.getDate() &&
           date.getMonth() === this.selectedDate.getMonth() &&
           date.getFullYear() === this.selectedDate.getFullYear();
  }
  
  isMarked(date: Date | null): boolean {
    if (!date) return false;
    return this.attendanceData.has(this.getDateKey(date));
  }
  
  isPresent(date: Date | null): boolean {
    if (!date) return false;
    return this.attendanceData.get(this.getDateKey(date)) === true;
  }
  
  isAbsent(date: Date | null): boolean {
    if (!date) return false;
    return this.attendanceData.get(this.getDateKey(date)) === false;
  }
  
  markPresent() {
    if (this.selectedDate) {
      this.attendanceData.set(this.getDateKey(this.selectedDate), true);
    }
  }
  
  markAbsent() {
    if (this.selectedDate) {
      this.attendanceData.set(this.getDateKey(this.selectedDate), false);
    }
  }
  
  clearAttendance() {
    if (this.selectedDate) {
      this.attendanceData.delete(this.getDateKey(this.selectedDate));
    }
  }
  
  getAttendanceStatus(date: Date | null): string {
    if (!date) return '';
    return this.isPresent(date) ? 'Present' : 'Absent';
  }
  
  getYearStats() {
    // Aggregate from cached month stats instead of recalculating
    let presentDays = 0;
    let absentDays = 0;
    let totalDays = 0;
    let holidayCount = 0;
    let excludedCount = 0;
    
    for (let month = 0; month < 12; month++) {
      const stats = this.getMonthStats(month);
      presentDays += stats.presentDays;
      absentDays += stats.absentDays;
      totalDays += stats.totalDays;
      holidayCount += stats.holidayCount;
      excludedCount += stats.excludedCount;
    }
    
    const workDays = totalDays; // Include holidays as workdays
    const attendanceRate = workDays > 0 ? (presentDays / workDays) * 100 : 0;
    
    return { presentDays, absentDays, totalDays, holidayCount, workDays, attendanceRate, excludedCount };
  }
  
  getMonthStats(month: number) {
    // Check cache first
    const cacheKey = month;
    if (this.monthStatsCache.has(cacheKey)) {
      return this.monthStatsCache.get(cacheKey);
    }
    
    // Calculate stats
    let presentDays = 0;
    let absentDays = 0;
    let totalDays = 0;
    let holidayCount = 0;
    let excludedCount = 0;
    
    const days = this.getCalendarDays(month);
    const today = this.todayCache;
    
    days.forEach(date => {
      if (date && date <= today && this.isWeekday(date)) {
        if (this.isHoliday(date)) {
          // Holidays are completely excluded from calculations
          holidayCount++;
        } else if (this.isExcluded(date)) {
          excludedCount++;
        } else {
          totalDays++;
          if (this.isPresent(date)) {
            presentDays++;
          } else {
            absentDays++;
          }
        }
      }
    });
    
    const workDays = totalDays; // Include holidays as workdays
    const attendanceRate = workDays > 0 ? (presentDays / workDays) * 100 : 0;
    
    // Calculate projected stats including future planned dates
    let projectedPresentDays = presentDays;
    let projectedTotalDays = totalDays;
    let projectedHolidayCount = holidayCount;
    
    days.forEach(date => {
      if (date && date > today && this.isWeekday(date)) {
        if (this.isHoliday(date)) {
          // Holidays are completely excluded from calculations
          projectedHolidayCount++;
        } else if (this.isExcluded(date)) {
          // Already counted in excludedCount
        } else {
          projectedTotalDays++;
          if (this.isPlanned(date)) {
            projectedPresentDays++;
          }
        }
      }
    });
    
    const projectedWorkDays = projectedTotalDays; // Include holidays as workdays
    const projectedRate = projectedWorkDays > 0 ? (projectedPresentDays / projectedWorkDays) * 100 : 0;
    
    const stats = { 
      presentDays, 
      absentDays, 
      totalDays, 
      holidayCount, 
      workDays, 
      attendanceRate, 
      excludedCount,
      projectedPresentDays,
      projectedTotalDays,
      projectedHolidayCount,
      projectedWorkDays,
      projectedRate
    };
    
    // Cache the result
    this.monthStatsCache.set(cacheKey, stats);
    
    return stats;
  }
  
  getWeeksInMonth(month: number): number {
    const days = this.getCalendarDays(month);
    const today = this.todayCache;
    let weekdayCount = 0;
    
    for (const date of days) {
      if (date && date <= today && this.isWeekday(date)) {
        weekdayCount++;
      }
    }
    
    return Math.ceil(weekdayCount / 5) || 1;
  }
  
  getTotalWeekdaysInMonth(month: number): number {
    // Count ALL weekdays in the month (not just up to today), excluding vacation/OOO
    // Use cached calendar days instead of regenerating
    let weekdayCount = 0;
    const days = this.getCalendarDays(month);
    
    for (const date of days) {
      if (date && this.isWeekday(date) && !this.isExcluded(date)) {
        weekdayCount++;
      }
    }
    
    return weekdayCount;
  }
  
  getAveragePerWeek(month: number, useProjected: boolean = false): number {
    const stats = this.getMonthStats(month);
    
    // Excel formula: =SUM(Present) / COUNT(Weekdays only, no weekends) * 5
    // Count only weekdays in the month (excluding weekends)
    const days = this.getCalendarDays(month);
    let totalWeekdays = 0;
    
    for (const date of days) {
      if (date && this.isWeekday(date) && !this.isHoliday(date)) {
        totalWeekdays++;
      }
    }
    
    // Use projected or actual stats based on parameter
    const presentDays = useProjected ? stats.projectedPresentDays : stats.presentDays;
    return totalWeekdays > 0 ? (presentDays / totalWeekdays) * 5 : 0;
  }
  
  getQuarterStats(quarter: number, useProjected: boolean = false) {
    const quarterStartMonth = quarter * 3;
    const quarterEndMonth = quarterStartMonth + 2;
    
    let presentDays = 0;
    let totalWeekdaysInQuarter = 0;
    
    // Calculate for all months in the quarter
    for (let month = quarterStartMonth; month <= quarterEndMonth; month++) {
      const monthStats = this.getMonthStats(month);
      const days = this.getCalendarDays(month);
      
      // Use projected or actual stats based on parameter
      presentDays += useProjected ? monthStats.projectedPresentDays : monthStats.presentDays;
      
      // Count only weekdays (excluding weekends and holidays) to match Excel COUNT(weekday dates)
      for (const date of days) {
        if (date && this.isWeekday(date) && !this.isHoliday(date)) {
          totalWeekdaysInQuarter++;
        }
      }
    }
    
    // Excel formula: =SUM(O4:O69) / COUNT(N4:N69) * 5
    // COUNT only counts weekdays (no weekends)
    const averagePerWeek = totalWeekdaysInQuarter > 0 ? (presentDays / totalWeekdaysInQuarter) * 5 : 0;
    
    // Calculate days needed to reach 2.0 average
    // Target: (presentDays + daysNeeded) / totalWeekdays * 5 = 2.0
    // Solve: daysNeeded = (2.0 * totalWeekdays / 5) - presentDays
    const targetAverage = 2.0;
    let daysNeededForTarget = Math.max(0, Math.ceil((targetAverage * totalWeekdaysInQuarter / 5) - presentDays));
    
    // If average is already >= 2.0, force daysNeeded to 0
    if (averagePerWeek >= 2.0) {
      daysNeededForTarget = 0;
    }
    
    return {
      presentDays,
      totalWeekdays: totalWeekdaysInQuarter,
      averagePerWeek,
      daysNeededForTarget,
      quarterNumber: quarter + 1
    };
  }
  
  getQuarterDetailedStats(quarter: number) {
    const quarterStartMonth = quarter * 3;
    const quarterEndMonth = quarterStartMonth + 2;
    
    let presentDays = 0;
    let absentDays = 0;
    let totalWeekdays = 0;
    let holidayCount = 0;
    
    for (let month = quarterStartMonth; month <= quarterEndMonth; month++) {
      const monthStats = this.getMonthStats(month);
      // Use projected stats if showProjected is enabled
      presentDays += this.showProjected ? monthStats.projectedPresentDays : monthStats.presentDays;
      absentDays += monthStats.absentDays;
      totalWeekdays += this.showProjected ? monthStats.projectedTotalDays : monthStats.totalDays;
      holidayCount += this.showProjected ? monthStats.projectedHolidayCount : monthStats.holidayCount;
    }
    
    const workDays = totalWeekdays - holidayCount;
    const attendanceRate = workDays > 0 ? (presentDays / workDays) * 100 : 0;
    
    return {
      presentDays,
      absentDays,
      totalWeekdays,
      holidayCount,
      workDays,
      attendanceRate
    };
  }
  
  getStatsForMonth(month: number, year: number) {
    let presentDays = 0;
    let totalWeekdays = 0;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      if (date <= today && this.isWeekday(date)) {
        totalWeekdays++;
        if (this.isPresent(date)) {
          presentDays++;
        }
      }
    }
    
    return { presentDays, totalWeekdays };
  }
  
  getAverageColor(average: number): string {
    if (average < 1) return 'red';
    if (average >= 1 && average < 1.995) return 'yellow';
    if (average >= 1.995 && average < 2.25) return 'light-green';
    return 'dark-green';
  }
  
  getQuarterName(quarter: number): string {
    return `Q${quarter + 1} ${this.currentYear}`;
  }
  
  getAllQuarters(): number[] {
    // Get current quarter
    const currentMonth = this.currentDate.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);
    const actualCurrentYear = new Date().getFullYear();
    
    // Only reorder if viewing the actual current year (2025)
    if (this.currentYear === actualCurrentYear) {
      // Put current quarter first, then the rest in order
      const reordered = [currentQuarter];
      
      for (let i = 0; i < 4; i++) {
        if (i !== currentQuarter) {
          reordered.push(i);
        }
      }
      
      return reordered;
    } else {
      // For other years, show Q1, Q2, Q3, Q4 in normal order
      return [0, 1, 2, 3];
    }
  }
  
  getAllQuartersSequential(): number[] {
    // For average cards: always Q1, Q2, Q3, Q4 order
    return [0, 1, 2, 3];
  }
  
  getCurrentQuarter(): number {
    const today = new Date();
    const currentMonth = today.getMonth();
    return Math.floor(currentMonth / 3);
  }

  isCurrentQuarter(quarter: number): boolean {
    // Check if the quarter is in the current year AND is the current quarter
    const today = new Date();
    const actualCurrentYear = today.getFullYear();
    const currentQuarter = this.getCurrentQuarter();
    
    return this.currentYear === actualCurrentYear && quarter === currentQuarter;
  }

  isCurrentMonth(month: number): boolean {
    // Check if the month is the current month in the current year
    const today = new Date();
    const actualCurrentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    return this.currentYear === actualCurrentYear && month === currentMonth;
  }

  hasPlannedDates(): boolean {
    // Check if there are any planned future dates
    return this.plannedDates.size > 0;
  }

  hasPlannedDatesInMonth(month: number): boolean {
    // Check if there are planned dates in this specific month
    const today = this.todayCache;
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Only show projected for current month and future months
    if (this.currentYear < currentYear) return false;
    if (this.currentYear === currentYear && month < currentMonth) return false;
    
    // Check if any planned dates exist in this month
    const days = this.getCalendarDays(month);
    for (const date of days) {
      if (date && date > today && this.isPlanned(date)) {
        return true;
      }
    }
    return false;
  }

  hasPlannedDatesInQuarter(quarter: number): boolean {
    // Check if there are planned dates in this specific quarter
    const today = this.todayCache;
    const currentMonth = today.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);
    const currentYear = today.getFullYear();
    
    // Only show projected for current quarter and future quarters
    if (this.currentYear < currentYear) return false;
    if (this.currentYear === currentYear && quarter < currentQuarter) return false;
    
    // Check if any planned dates exist in this quarter's months
    const quarterStartMonth = quarter * 3;
    const quarterEndMonth = quarterStartMonth + 2;
    
    for (let month = quarterStartMonth; month <= quarterEndMonth; month++) {
      const days = this.getCalendarDays(month);
      for (const date of days) {
        if (date && date > today && this.isPlanned(date)) {
          return true;
        }
      }
    }
    return false;
  }
}
