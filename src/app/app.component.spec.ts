import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { AppComponent } from './app.component';

// Helper: build a Date at local midnight (matches how the component keys dates).
const D = (y: number, m: number, d: number) => new Date(y, m, d);

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async () => {
    localStorage.clear();
    spyOn(window, 'alert');
    spyOn(window, 'confirm').and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    // Use a fully-past year so "date <= today" logic counts every marked day.
    component.currentYear = 2025;
    component.setHolidaysForYear(2025);
    component['updateTodayCache']();
    component['calendarDaysCache'].clear();
    component['hrMonthDaysCache'].clear();
    component.invalidateStatsCache();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct title', () => {
    expect(component.title).toContain('Attendance Calendar');
  });

  it('should render the header title', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Attendance Calendar');
  });

  describe('toolbar buttons (DOM)', () => {
    it('Import JSON button opens the JSON file input', () => {
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      const input = el.querySelector('#jsonFileInput') as HTMLInputElement;
      const spy = spyOn(input, 'click');
      (el.querySelector('.import-btn') as HTMLButtonElement).click();
      expect(spy).toHaveBeenCalled();
    });

    it('Import CSV button opens the CSV file input', () => {
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      const input = el.querySelector('#excelFileInput') as HTMLInputElement;
      const spy = spyOn(input, 'click');
      (el.querySelector('.import-excel-btn') as HTMLButtonElement).click();
      expect(spy).toHaveBeenCalled();
    });

    it('Save button persists data to localStorage', () => {
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      component.toggleAttendance(D(2025, 4, 14));
      (el.querySelector('.save-btn') as HTMLButtonElement).click();
      expect(localStorage.getItem('attendanceData')).toContain('2025-4-14');
    });

    it('clicking a weekday cell in the rendered calendar marks it In Office', () => {
      fixture.detectChanges();
      const el = fixture.nativeElement as HTMLElement;
      const cell = el.querySelector('.mini-calendar-day:not(.empty):not(.weekend):not(.holiday)') as HTMLElement;
      expect(cell).toBeTruthy();
      cell.click();
      fixture.detectChanges();
      expect(el.querySelector('.mini-calendar-day.marked-present')).toBeTruthy();
    });
  });

  describe('date key & weekday helpers', () => {
    it('getDateKey uses a 0-based month', () => {
      expect(component.getDateKey(D(2025, 0, 5))).toBe('2025-0-5');
      expect(component.getDateKey(D(2025, 11, 25))).toBe('2025-11-25');
    });

    it('isWeekday / isWeekend classify days correctly', () => {
      expect(component.isWeekday(D(2025, 4, 14))).toBeTrue();  // Wed
      expect(component.isWeekend(D(2025, 4, 14))).toBeFalse();
      expect(component.isWeekend(D(2025, 4, 17))).toBeTrue();  // Sat
      expect(component.isWeekday(D(2025, 4, 17))).toBeFalse();
      expect(component.isWeekday(null)).toBeFalse();
      expect(component.isWeekend(null)).toBeFalse();
    });

    it('isToday matches today and rejects other days', () => {
      const today = new Date();
      expect(component.isToday(today)).toBeTrue();
      expect(component.isToday(D(1999, 0, 1))).toBeFalse();
      expect(component.isToday(null)).toBeFalse();
    });

    it('isFuture detects dates after today', () => {
      expect(component.isFuture(D(2999, 0, 1))).toBeTrue();
      expect(component.isFuture(D(2000, 0, 1))).toBeFalse();
      expect(component.isFuture(null)).toBeFalse();
    });
  });

  describe('holidays', () => {
    it('registers fixed and floating US federal holidays for 2025', () => {
      expect(component.isHoliday(D(2025, 0, 1))).toBeTrue();   // New Year's Day
      expect(component.isHoliday(D(2025, 0, 20))).toBeTrue();  // MLK (3rd Mon)
      expect(component.isHoliday(D(2025, 4, 26))).toBeTrue();  // Memorial (last Mon)
      expect(component.isHoliday(D(2025, 8, 1))).toBeTrue();   // Labor (1st Mon)
      expect(component.isHoliday(D(2025, 10, 27))).toBeTrue(); // Thanksgiving (4th Thu)
      expect(component.isHoliday(D(2025, 11, 25))).toBeTrue(); // Christmas
      expect(component.getHolidayName(D(2025, 0, 1))).toContain("New Year");
      expect(component.isHoliday(D(2025, 4, 14))).toBeFalse(); // ordinary Wed
      expect(component.isHoliday(null)).toBeFalse();
    });

    it('shifts a Saturday holiday to the observed Friday', () => {
      component.setHolidaysForYear(2026); // Jul 4, 2026 is a Saturday
      expect(component.isHoliday(D(2026, 6, 3))).toBeTrue();
      expect(component.getHolidayName(D(2026, 6, 3))).toContain('Observed');
      expect(component.isHoliday(D(2026, 6, 4))).toBeFalse();
    });

    it('getNthWeekdayOfMonth / getLastWeekdayOfMonth compute the right dates', () => {
      expect(component.getNthWeekdayOfMonth(2025, 0, 1, 3).getDate()).toBe(20); // 3rd Mon Jan
      expect(component.getLastWeekdayOfMonth(2025, 4, 1).getDate()).toBe(26);   // last Mon May
    });
  });

  describe('HR-week accounting', () => {
    it('assigns a day to the month of its week Wednesday', () => {
      expect(component.getHRMonth(D(2025, 4, 14))).toBe(4); // Wed → May
      expect(component.getHRYear(D(2025, 4, 14))).toBe(2025);
    });

    it('getHRMonthDays returns dates for the current year only', () => {
      const days = component.getHRMonthDays(4);
      expect(days.length).toBeGreaterThan(0);
      expect(days.every(d => component.getHRMonth(d) === 4)).toBeTrue();
    });
  });

  describe('marking attendance', () => {
    it('toggleAttendance flips present state', () => {
      const d = D(2025, 4, 14);
      expect(component.isPresent(d)).toBeFalse();
      component.toggleAttendance(d);
      expect(component.isPresent(d)).toBeTrue();
      expect(component.isMarked(d)).toBeTrue();
      component.toggleAttendance(d);
      expect(component.isPresent(d)).toBeFalse();
    });

    it('selectDate left-click toggles a past weekday', () => {
      const d = D(2025, 4, 14);
      component.selectDate(d, false);
      expect(component.isPresent(d)).toBeTrue();
    });

    it('selectDate ignores weekends and holidays', () => {
      const weekend = D(2025, 4, 17);
      component.selectDate(weekend, false);
      expect(component.isPresent(weekend)).toBeFalse();
      const holiday = D(2025, 11, 25);
      component.selectDate(holiday, false);
      expect(component.isPresent(holiday)).toBeFalse();
    });

    it('selectDate right-click toggles out-of-office', () => {
      const d = D(2025, 4, 14);
      component.selectDate(d, true);
      expect(component.isExcluded(d)).toBeTrue();
    });

    it('selectDate on a future weekday marks a planned day', () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 5);
      while (component.isWeekend(future) || component.isHoliday(future)) {
        future.setDate(future.getDate() + 1);
      }
      component.selectDate(future, false);
      expect(component.isPlanned(future)).toBeTrue();
    });

    it('selectDate left-click on an excluded day leaves it excluded', () => {
      const d = D(2025, 4, 14);
      component.toggleExclusion(d);
      component.selectDate(d, false);
      expect(component.isPresent(d)).toBeFalse();
      expect(component.isExcluded(d)).toBeTrue();
    });

    it('markPresent / markAbsent / clearAttendance use selectedDate', () => {
      component.selectedDate = D(2025, 4, 14);
      component.markPresent();
      expect(component.isPresent(component.selectedDate)).toBeTrue();
      component.markAbsent();
      expect(component.isAbsent(component.selectedDate)).toBeTrue();
      component.clearAttendance();
      expect(component.isMarked(component.selectedDate)).toBeFalse();
    });

    it('getAttendanceStatus reports In Office / Remote', () => {
      const d = D(2025, 4, 14);
      expect(component.getAttendanceStatus(d)).toBe('Remote');
      component.toggleAttendance(d);
      expect(component.getAttendanceStatus(d)).toBe('In Office');
    });
  });

  describe('out of office (exclusion)', () => {
    it('toggleExclusion sets and clears a reason and removes attendance', () => {
      const d = D(2025, 4, 14);
      component.toggleAttendance(d);
      component.toggleExclusion(d);
      expect(component.isExcluded(d)).toBeTrue();
      expect(component.getExclusionReason(d)).toBe('Out of Office');
      expect(component.isPresent(d)).toBeFalse();
      component.toggleExclusion(d);
      expect(component.isExcluded(d)).toBeFalse();
    });

    it('does not exclude weekends', () => {
      const weekend = D(2025, 4, 17);
      component.toggleExclusion(weekend);
      expect(component.isExcluded(weekend)).toBeFalse();
    });
  });

  describe('planned / future attendance', () => {
    it('togglePlannedAttendance flips planned state', () => {
      const d = D(2999, 0, 6);
      component.togglePlannedAttendance(d);
      expect(component.isPlanned(d)).toBeTrue();
      component.togglePlannedAttendance(d);
      expect(component.isPlanned(d)).toBeFalse();
    });

    it('convertPlannedToPresent promotes a planned "today" to present', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      component.plannedDates.set(component.getDateKey(today), true);
      component['convertPlannedToPresent'](today);
      expect(component.isPresent(today)).toBeTrue();
      expect(component.isPlanned(today)).toBeFalse();
    });

    it('hasPlannedDates reflects the planned map', () => {
      expect(component.hasPlannedDates()).toBeFalse();
      component.togglePlannedAttendance(D(2999, 0, 6));
      expect(component.hasPlannedDates()).toBeTrue();
    });

    it('hasPlannedDatesInMonth is false for a past year', () => {
      component.togglePlannedAttendance(D(2025, 5, 10));
      expect(component.hasPlannedDatesInMonth(5)).toBeFalse();
    });

    it('hasPlannedDatesInMonth / Quarter detect planned future dates', () => {
      const futureYear = new Date().getFullYear() + 1;
      component.currentYear = futureYear;
      component['calendarDaysCache'].clear();
      component['hrMonthDaysCache'].clear();
      component.plannedDates.set(component.getDateKey(D(futureYear, 5, 10)), true);
      expect(component.hasPlannedDatesInMonth(5)).toBeTrue();
      expect(component.hasPlannedDatesInQuarter(1)).toBeTrue();
    });
  });

  describe('statistics', () => {
    it('getMonthStats increments present days after marking', () => {
      const before = component.getMonthStats(4).presentDays;
      component.toggleAttendance(D(2025, 4, 14));
      expect(component.getMonthStats(4).presentDays).toBe(before + 1);
    });

    it('getYearStats aggregates month stats', () => {
      component.toggleAttendance(D(2025, 4, 14));
      const stats = component.getYearStats();
      expect(stats.presentDays).toBeGreaterThanOrEqual(1);
      expect(stats.workDays).toBeGreaterThan(0);
      expect(stats.attendanceRate).toBeGreaterThan(0);
    });

    it('getMonthStats counts holidays and exclusions separately', () => {
      component.setHolidaysForYear(2025);
      const dec = component.getMonthStats(11);
      expect(dec.holidayCount).toBeGreaterThanOrEqual(1); // Christmas
      component.toggleExclusion(D(2025, 4, 14));
      expect(component.getMonthStats(4).excludedCount).toBeGreaterThanOrEqual(1);
    });

    it('getQuarterStats returns average and days-needed-for-target', () => {
      const q = component.getQuarterStats(0);
      expect(q.quarterNumber).toBe(1);
      expect(q.totalWeekdays).toBeGreaterThan(0);
      expect(q.daysNeededForTarget).toBeGreaterThanOrEqual(0);
    });

    it('getQuarterDetailedStats and getQuarterTargetCalc return data', () => {
      const detail = component.getQuarterDetailedStats(0);
      expect(detail.totalWeekdays).toBeGreaterThan(0);
      const calc = component.getQuarterTargetCalc(0);
      expect(calc.length).toBe(3);
      expect(calc.map(c => c.target)).toEqual([2.25, 3, 4]);
    });

    it('getAveragePerWeek returns a non-negative number', () => {
      expect(component.getAveragePerWeek(4)).toBeGreaterThanOrEqual(0);
      component.toggleAttendance(D(2025, 4, 14));
      expect(component.getAveragePerWeek(4)).toBeGreaterThan(0);
    });

    it('getStatsForMonth counts all weekdays in the month', () => {
      expect(component.getStatsForMonth(4, 2025).totalWeekdays).toBe(22);
    });

    it('getTotalWeekdaysInMonth excludes excluded dates', () => {
      expect(component.getTotalWeekdaysInMonth(4)).toBe(22);
      component.toggleExclusion(D(2025, 4, 14));
      expect(component.getTotalWeekdaysInMonth(4)).toBe(21);
    });

    it('getWeeksInMonth returns at least one week', () => {
      expect(component.getWeeksInMonth(4)).toBeGreaterThanOrEqual(1);
    });

    it('getMonthStats projects planned future days', () => {
      const futureYear = new Date().getFullYear() + 1;
      component.currentYear = futureYear;
      component['calendarDaysCache'].clear();
      component['hrMonthDaysCache'].clear();
      component.invalidateStatsCache();
      component.plannedDates.set(component.getDateKey(D(futureYear, 5, 10)), true);
      component.invalidateStatsCache();
      const stats = component.getMonthStats(5);
      expect(stats.projectedTotalDays).toBeGreaterThanOrEqual(1);
      expect(stats.projectedPresentDays).toBeGreaterThanOrEqual(stats.presentDays);
    });

    it('getAverageColor maps averages to color buckets', () => {
      expect(component.getAverageColor(0.5)).toBe('red');
      expect(component.getAverageColor(1.5)).toBe('yellow');
      expect(component.getAverageColor(2.0)).toBe('light-green');
      expect(component.getAverageColor(2.5)).toBe('dark-green');
    });
  });

  describe('calendar layout helpers', () => {
    it('getCalendarDays pads to 42 cells with correct offset', () => {
      const days = component.getCalendarDays(4); // May 2025 starts on Thursday
      expect(days.length).toBe(42);
      expect(days[0]).toBeNull();
      expect(days[4]?.getDate()).toBe(1);
    });

    it('getAllMonths / getMonthsInQuarter / getAllQuarters* are correct', () => {
      expect(component.getAllMonths().length).toBe(12);
      expect(component.getMonthsInQuarter(1)).toEqual([3, 4, 5]);
      expect(component.getAllQuartersSequential()).toEqual([0, 1, 2, 3]);
      expect(component.getAllQuarters().length).toBe(4);
    });

    it('getDayTitle describes holidays and cross-month days', () => {
      expect(component.getDayTitle(D(2025, 0, 1), 0)).toContain('New Year');
      expect(component.getDayTitle(null, 0)).toBe('');
    });

    it('getQuarterName / getCurrentQuarter / isCurrentQuarter / isCurrentMonth', () => {
      expect(component.getQuarterName(0)).toBe('Q1 2025');
      expect(component.getCurrentQuarter()).toBe(Math.floor(new Date().getMonth() / 3));
      expect(component.isCurrentQuarter(0)).toBeFalse(); // year 2025 != current year
      expect(component.isCurrentMonth(0)).toBeFalse();
    });
  });

  describe('quarter UI state', () => {
    it('toggleQuarter flips expansion', () => {
      const initial = component.quarterExpanded[0];
      component.toggleQuarter(0);
      expect(component.quarterExpanded[0]).toBe(!initial);
    });

    it('toggleQuarterInfo and onDocumentClick manage the active tooltip', () => {
      component.toggleQuarterInfo(1, { stopPropagation: () => {} } as unknown as Event);
      expect(component.activeQuarterInfo).toBe(1);
      component.onDocumentClick();
      expect(component.activeQuarterInfo).toBeNull();
    });
  });

  describe('year navigation', () => {
    it('nextYear / previousYear update the year and holidays', () => {
      component.nextYear();
      expect(component.currentYear).toBe(2026);
      expect(component.isHoliday(D(2026, 0, 1))).toBeTrue();
      component.previousYear();
      expect(component.currentYear).toBe(2025);
    });
  });

  describe('username', () => {
    it('saves and loads the username', () => {
      component.userName = 'Alice';
      component.saveUsername();
      expect(localStorage.getItem('userName')).toBe('Alice');
      component.userName = '';
      component.loadUsername();
      expect(component.userName).toBe('Alice');
    });

    it('editUsername / saveUsernameAndClose toggle edit mode', () => {
      component.editUsername();
      expect(component.isEditingUsername).toBeTrue();
      component.userName = 'Bob';
      component.saveUsernameAndClose();
      expect(component.isEditingUsername).toBeFalse();
      expect(component.showSaveIndicator).toBeTrue();
      expect(localStorage.getItem('userName')).toBe('Bob');
    });

    it('empty username falls back to "User"', () => {
      component.userName = '   ';
      component.saveUsernameAndClose();
      expect(component.userName).toBe('User');
    });
  });

  describe('persistence', () => {
    it('saveAttendanceData writes all maps to localStorage', () => {
      component.toggleAttendance(D(2025, 4, 14));
      component.toggleExclusion(D(2025, 4, 15));
      component.togglePlannedAttendance(D(2999, 0, 6));
      component.saveAttendanceData(false);
      expect(localStorage.getItem('attendanceData')).toContain('2025-4-14');
      expect(localStorage.getItem('excludedDates')).toContain('2025-4-15');
      expect(localStorage.getItem('plannedDates')).toBeTruthy();
      expect(localStorage.getItem('attendanceYear')).toBe('2025');
    });

    it('manual save shows the save indicator', () => {
      component.saveAttendanceData(true);
      expect(component.showSaveIndicator).toBeTrue();
    });

    it('loadAttendanceData restores maps from localStorage', () => {
      localStorage.setItem('attendanceData', JSON.stringify([['2025-4-14', true]]));
      localStorage.setItem('excludedDates', JSON.stringify([['2025-4-15', 'Out of Office']]));
      localStorage.setItem('plannedDates', JSON.stringify([['2025-5-10', true]]));
      localStorage.setItem('attendanceYear', '2025');
      component.loadAttendanceData();
      expect(component.isPresent(D(2025, 4, 14))).toBeTrue();
      expect(component.isExcluded(D(2025, 4, 15))).toBeTrue();
    });
  });

  describe('import / export', () => {
    it('exportData triggers a JSON download', () => {
      const clickSpy = spyOn(HTMLAnchorElement.prototype, 'click');
      spyOn(URL, 'createObjectURL').and.returnValue('blob:test');
      spyOn(URL, 'revokeObjectURL');
      component.toggleAttendance(D(2025, 4, 14));
      component.exportData();
      expect(clickSpy).toHaveBeenCalled();
    });

    it('exportToExcel triggers a CSV download', () => {
      const clickSpy = spyOn(HTMLAnchorElement.prototype, 'click');
      spyOn(URL, 'createObjectURL').and.returnValue('blob:test');
      spyOn(URL, 'revokeObjectURL');
      component.exportToExcel();
      expect(clickSpy).toHaveBeenCalled();
    });

    it('importJSON loads attendance, exclusions and username', (done) => {
      const json = JSON.stringify({
        userName: 'Imported',
        year: 2025,
        attendance: [['2025-4-14', true]],
        excludedDates: [['2025-4-15', 'Out of Office']],
        plannedDates: [],
      });
      const file = new File([json], 'a.json', { type: 'application/json' });
      const input = document.createElement('input');
      Object.defineProperty(input, 'files', { value: [file] });
      component.importJSON({ target: input } as unknown as Event);
      setTimeout(() => {
        expect(component.userName).toBe('Imported');
        expect(component.isPresent(D(2025, 4, 14))).toBeTrue();
        expect(component.isExcluded(D(2025, 4, 15))).toBeTrue();
        done();
      }, 150);
    });

    it('importExcel parses the DAILY DETAIL section', (done) => {
      const csv = [
        'Attendance Report,2025',
        'Name,Carol',
        '',
        'DAILY DETAIL',
        'Date,Day of Week,Status,Notes',
        '5/14/2025,Wed,In Office,',
        '5/15/2025,Thu,Excluded,"Out of Office"',
        '5/16/2025,Fri,Planned,"Planned attendance"',
      ].join('\n');
      const file = new File([csv], 'a.csv', { type: 'text/csv' });
      const input = document.createElement('input');
      Object.defineProperty(input, 'files', { value: [file] });
      component.importExcel({ target: input } as unknown as Event);
      setTimeout(() => {
        expect(component.userName).toBe('Carol');
        expect(component.isPresent(D(2025, 4, 14))).toBeTrue();
        expect(component.isExcluded(D(2025, 4, 15))).toBeTrue();
        expect(component.isPlanned(D(2025, 4, 16))).toBeTrue();
        done();
      }, 150);
    });

    it('loadFromFile imports a simple attendance file', (done) => {
      const json = JSON.stringify({ year: 2025, attendance: [['2025-4-14', true]] });
      const file = new File([json], 'a.json', { type: 'application/json' });
      const input = document.createElement('input');
      Object.defineProperty(input, 'files', { value: [file] });
      component.loadFromFile({ target: input } as unknown as Event);
      setTimeout(() => {
        expect(component.isPresent(D(2025, 4, 14))).toBeTrue();
        done();
      }, 150);
    });

    it('importJSON alerts on an invalid file', (done) => {
      const file = new File(['{"foo":1}'], 'bad.json', { type: 'application/json' });
      const input = document.createElement('input');
      Object.defineProperty(input, 'files', { value: [file] });
      component.importJSON({ target: input } as unknown as Event);
      setTimeout(() => {
        expect(window.alert).toHaveBeenCalled();
        done();
      }, 150);
    });

    it('clearAllData empties the maps after confirmation', () => {
      component.toggleAttendance(D(2025, 4, 14));
      component.toggleExclusion(D(2025, 4, 15));
      component.clearAllData();
      expect(component.attendanceData.size).toBe(0);
      expect(component.excludedDates.size).toBe(0);
    });
  });

  describe('misc helpers', () => {
    it('showClickPopup sets popup state', () => {
      component.showClickPopup('Hello', 10, 20, 'success');
      expect(component.showPopup).toBeTrue();
      expect(component.popupMessage).toBe('Hello');
      expect(component.popupType).toBe('success');
    });

    it('clearWeekendData removes weekend entries', () => {
      component.attendanceData.set('2025-4-17', true); // Saturday
      component.attendanceData.set('2025-4-14', true); // Wednesday
      component.clearWeekendData();
      expect(component.attendanceData.has('2025-4-17')).toBeFalse();
      expect(component.attendanceData.has('2025-4-14')).toBeTrue();
    });

    it('checkDateChange runs without error', () => {
      expect(() => component['checkDateChange']()).not.toThrow();
    });
  });

  describe('additional branch coverage', () => {
    it('importJSON handles malformed JSON', (done) => {
      const file = new File(['not valid json'], 'bad.json', { type: 'application/json' });
      const input = document.createElement('input');
      Object.defineProperty(input, 'files', { value: [file] });
      component.importJSON({ target: input } as unknown as Event);
      setTimeout(() => { expect(window.alert).toHaveBeenCalled(); done(); }, 150);
    });

    it('importExcel handles empty content without throwing', (done) => {
      const file = new File([''], 'bad.csv', { type: 'text/csv' });
      const input = document.createElement('input');
      Object.defineProperty(input, 'files', { value: [file] });
      expect(() => component.importExcel({ target: input } as unknown as Event)).not.toThrow();
      setTimeout(() => done(), 150);
    });

    it('loadFromFile rejects an invalid file', (done) => {
      const file = new File(['{"nope":true}'], 'bad.json', { type: 'application/json' });
      const input = document.createElement('input');
      Object.defineProperty(input, 'files', { value: [file] });
      component.loadFromFile({ target: input } as unknown as Event);
      setTimeout(() => { expect(window.alert).toHaveBeenCalled(); done(); }, 150);
    });

    it('importData delegates to loadFromFile', (done) => {
      const json = JSON.stringify({ year: 2025, attendance: [['2025-4-14', true]] });
      const file = new File([json], 'a.json', { type: 'application/json' });
      const input = document.createElement('input');
      Object.defineProperty(input, 'files', { value: [file] });
      component.importData({ target: input } as unknown as Event);
      setTimeout(() => { expect(component.isPresent(D(2025, 4, 14))).toBeTrue(); done(); }, 150);
    });

    it('getQuarterStats and getAveragePerWeek support projected mode', () => {
      component.togglePlannedAttendance(D(2999, 0, 6));
      expect(component.getQuarterStats(0, true).averagePerWeek).toBeGreaterThanOrEqual(0);
      expect(component.getAveragePerWeek(4, true)).toBeGreaterThanOrEqual(0);
    });

    it('selectDate right-click on a future weekday excludes it', () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 5);
      while (component.isWeekend(future)) { future.setDate(future.getDate() + 1); }
      component.selectDate(future, true);
      expect(component.isExcluded(future)).toBeTrue();
    });

    it('getDayTitle notes excluded, planned and cross-month days', () => {
      component.toggleExclusion(D(2025, 4, 14));
      expect(component.getDayTitle(D(2025, 4, 14), 4)).toContain('Out of Office');
      const futureYear = new Date().getFullYear() + 1;
      component.currentYear = futureYear;
      const future = D(futureYear, 5, 10);
      component.plannedDates.set(component.getDateKey(future), true);
      expect(component.getDayTitle(future, 5)).toContain('Planned');
      expect(component.getDayTitle(D(2025, 4, 14), 5)).toContain('counted in');
    });

    it('hasPlannedDatesInQuarter is false for a past year', () => {
      component.togglePlannedAttendance(D(2025, 5, 10));
      expect(component.hasPlannedDatesInQuarter(1)).toBeFalse();
    });

    it('initializeSampleData runs without throwing', () => {
      expect(() => component.initializeSampleData()).not.toThrow();
    });

    it('selectDate with an event shows popups (mark then unmark)', () => {
      const ev = { clientX: 10, clientY: 10 } as MouseEvent;
      const d = D(2025, 4, 14);
      component.selectDate(d, false, ev);
      expect(component.isPresent(d)).toBeTrue();
      expect(component.showPopup).toBeTrue();
      component.selectDate(d, false, ev);
      expect(component.isPresent(d)).toBeFalse();
    });

    it('selectDate with an event warns when the day is excluded', () => {
      const ev = { clientX: 10, clientY: 10 } as MouseEvent;
      const d = D(2025, 4, 14);
      component.toggleExclusion(d);
      component.selectDate(d, false, ev);
      expect(component.popupType).toBe('warning');
    });

    it('toggleExclusion with an event shows popups (add then remove)', () => {
      const ev = { clientX: 10, clientY: 10 } as MouseEvent;
      const d = D(2025, 4, 15);
      component.toggleExclusion(d, ev);
      expect(component.isExcluded(d)).toBeTrue();
      component.toggleExclusion(d, ev);
      expect(component.isExcluded(d)).toBeFalse();
    });

    it('togglePlannedAttendance with an event shows popups (add then remove)', () => {
      const ev = { clientX: 10, clientY: 10 } as MouseEvent;
      const d = D(2999, 0, 6);
      component.togglePlannedAttendance(d, ev);
      expect(component.isPlanned(d)).toBeTrue();
      component.togglePlannedAttendance(d, ev);
      expect(component.isPlanned(d)).toBeFalse();
    });

    it('selectDate future with an event plans the day', () => {
      const ev = { clientX: 10, clientY: 10 } as MouseEvent;
      const future = new Date();
      future.setFullYear(future.getFullYear() + 5);
      while (component.isWeekend(future)) { future.setDate(future.getDate() + 1); }
      component.selectDate(future, false, ev);
      expect(component.isPlanned(future)).toBeTrue();
    });

    it('importJSON imports a different year and defaults the username', (done) => {
      const json = JSON.stringify({ year: 2026, attendance: [['2026-4-14', true]] });
      const file = new File([json], 'a.json', { type: 'application/json' });
      const input = document.createElement('input');
      Object.defineProperty(input, 'files', { value: [file] });
      component.importJSON({ target: input } as unknown as Event);
      setTimeout(() => {
        expect(component.currentYear).toBe(2026);
        expect(component.userName).toBe('User');
        done();
      }, 150);
    });

    it('importExcel skips remote rows and reads a different year', (done) => {
      const csv = [
        'Attendance Report,2026',
        'Name,',
        '',
        'DAILY DETAIL',
        'Date,Day of Week,Status,Notes',
        '5/14/2026,Thu,Remote,',
        '5/15/2026,Fri,In Office,',
      ].join('\n');
      const file = new File([csv], 'a.csv', { type: 'text/csv' });
      const input = document.createElement('input');
      Object.defineProperty(input, 'files', { value: [file] });
      component.importExcel({ target: input } as unknown as Event);
      setTimeout(() => {
        expect(component.currentYear).toBe(2026);
        expect(component.isPresent(D(2026, 4, 15))).toBeTrue();
        expect(component.isPresent(D(2026, 4, 14))).toBeFalse();
        done();
      }, 150);
    });

    it('getMonthStats tolerates a future excluded day in projected mode', () => {
      const futureYear = new Date().getFullYear() + 1;
      component.currentYear = futureYear;
      component['calendarDaysCache'].clear();
      component['hrMonthDaysCache'].clear();
      component.excludedDates.set(component.getDateKey(D(futureYear, 5, 10)), 'Out of Office');
      component.invalidateStatsCache();
      expect(() => component.getMonthStats(5)).not.toThrow();
    });
  });
});

describe('AppComponent (server platform)', () => {
  let component: AppComponent;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    }).compileComponents();
    component = TestBed.createComponent(AppComponent).componentInstance;
  });

  it('guards browser-only APIs when rendered on the server', () => {
    expect(() => {
      component.loadAttendanceData();
      component.saveAttendanceData(false);
      component.saveAttendanceData(true);
      component.loadUsername();
      component.saveUsername();
      component.ngOnInit();
    }).not.toThrow();
    expect(component).toBeTruthy();
  });
});
