# Attendance Calendar App

A modern, responsive attendance tracking application for personal use.

**Created by Rahin Reza and Copilot**

## Overview

A single-page Angular 20 app for tracking office attendance across a full year. Mark the days you were in the office, plan future days, and track out-of-office / vacation time, with per-month, per-quarter, and yearly statistics geared toward a target of **2.0 in-office days per week**.

All data is stored **locally in your browser** (`localStorage`) — there is no backend, account, or cloud sync. Use the JSON / CSV export & import buttons to back up or move your data between browsers.

## Features

✅ **Year-round Calendar** - All 12 months on one page, grouped by quarter  
✅ **Mark In-Office Days** - Left-click a past/today weekday to toggle "In Office" (✓)  
✅ **Plan Future Days** - Left-click a future weekday to mark a planned day (📅)  
✅ **Out of Office / Vacation** - Right-click any weekday to exclude it from calculations (💼)  
✅ **Projected Stats** - Month/quarter cards show actual vs. projected values when planned days exist  
✅ **Instant Feedback** - Popup notifications show each action at the click location  
✅ **US Federal Holidays** - Auto-computed per year with observed-day shifting  
✅ **HR-Week Accounting** - Whole Sun–Sat weeks count toward the month/quarter of that week's Wednesday  
✅ **Statistics Dashboard** - Per-month, per-quarter, and yearly rates and averages  
✅ **Username** - Label whose attendance you're tracking  
✅ **Export / Import** - JSON and CSV (Excel) formats  
✅ **Auto-Save** - Every change is saved to `localStorage` automatically  
✅ **Server-Side Rendering** - Angular SSR (Express) with prerendering

## Quick Start

### Development server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Usage

### Marking In-Office Days
- **Left-click** a past or current weekday to toggle **In Office** (green ✓)
- Click again to unmark
- Unmarked weekdays count as **Remote**
- A popup ("In Office ✓" / "Unmarked") appears at the click location

### Planning Future Days
- **Left-click** a **future** weekday to mark it **Planned** (📅, dashed blue border)
- Click again to remove the plan ("Planned ✓📅" / "Removed Plan 📅")
- Month/quarter cards show projected values (actual / projected) while planned days exist
- When a planned day arrives, it is automatically converted to **In Office**

### Marking Out of Office / Vacation
- **Right-click** any weekday to toggle **Out of Office** (💼, purple, strike-through)
- Right-click again to remove it ("Out of Office 💼" / "Removed 💼")
- Out-of-office days are excluded from all attendance calculations
- The stored reason defaults to `Out of Office`

### Visual Feedback (popups)
- 🟢 **Green**: "In Office ✓", "Out of Office 💼", "Planned ✓📅"
- 🔵 **Blue**: "Unmarked", "Removed 💼", "Removed Plan 📅", "Auto-saved"
- 🟠 **Orange**: "Already Out of Office 💼" (when left-clicking an excluded day)

### Key Indicators
- 🟢 **Green ✓**: In office
- 🟣 **Purple 💼 (strike-through)**: Out of office (excluded)
- 📅 **Dashed blue border**: Planned future day
- 🔴 **Red underline**: US Federal holiday (excluded)
- ⚫ **Unmarked weekday**: Remote
- 🔵 **Blue border**: Today

### Statistics
All statistics automatically exclude:
- Weekends
- US Federal Holidays
- Out-of-office / vacation days

Weeks are attributed to the month/quarter containing that week's **Wednesday** (HR-week accounting), so a month's totals can include a few days from the adjacent calendar month.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

### Documentation Status

> ℹ️ This README is the source of truth. The docs below reflect the current build.

**Guides**
- **[VACATION-OOO-FEATURE.md](./VACATION-OOO-FEATURE.md)** – Out-of-office / vacation tracking
- **[VACATION-QUICK-START.md](./VACATION-QUICK-START.md)** – One-page cheat sheet for the core actions
- **[FUTURE-ATTENDANCE-FEATURE.md](./FUTURE-ATTENDANCE-FEATURE.md)** – Planned future days & projected stats
- **[CLICK-POPUP-FEATURE.md](./CLICK-POPUP-FEATURE.md)** / **[CLICK-POPUP-DEMO.md](./CLICK-POPUP-DEMO.md)** – Popup notifications
- **[VISUAL-GUIDE.md](./VISUAL-GUIDE.md)** – Visual reference for the UI
- **[FILE-LOADING-GUIDE.md](./FILE-LOADING-GUIDE.md)** – Importing, exporting, and backing up data
- **[PROJECTED-AVERAGES-ENHANCEMENT.md](./PROJECTED-AVERAGES-ENHANCEMENT.md)** – Projected averages
- **[PERFORMANCE-OPTIMIZATION.md](./PERFORMANCE-OPTIMIZATION.md)** – Caching strategy

**Deployment**
- **[.github/workflows/deploy.yml](./.github/workflows/deploy.yml)** – CI/CD: tests (80% coverage gate) then deploy to S3 static hosting; one-time IAM setup in [infra/github-deploy-role.yml](./infra/github-deploy-role.yml)
- **[WIFI-AUTOMARK-SETUP.md](./WIFI-AUTOMARK-SETUP.md)** – macOS WiFi auto-open helper (the app currently ignores the `automark` URL params)

**Historical (kept for reference; see the note at the top of each)**
- **[CHANGELOG.md](./CHANGELOG.md)**, **[IMPLEMENTATION-SUMMARY.md](./IMPLEMENTATION-SUMMARY.md)**, **[CALCULATION-FIX.md](./CALCULATION-FIX.md)**

> Removed: the former `CLOUD-SYNC-SUMMARY.md` (Firebase) and `MULTI-USER-SETUP.md`
> (`server-api.js` backend) described features that were never implemented — data is
> stored only in the browser's `localStorage`.
