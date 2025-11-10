# Attendance Calendar App

A modern, responsive attendance tracking application for personal use.

**Created by Rahin Reza and Copilot**

## 🚀 AWS S3 Deployment Ready

This app is **optimized for AWS S3 static hosting** - deploy in minutes with zero backend costs!

📖 **Quick Deploy**: See `S3-QUICK-START.md`  
📚 **Full Guide**: See `S3-DEPLOYMENT-GUIDE.md`

## Features

✅ **Year-round Calendar** - View and manage all 12 months  
✅ **Mark Attendance** - Click any weekday to mark as present  
✅ **Out of Office Tracking** - Right-click to exclude dates from calculations  
✅ **Instant Feedback** - Popup notifications show action results at click location  
✅ **US Federal Holidays** - Pre-loaded with automatic detection  
✅ **Statistics Dashboard** - Monthly and quarterly attendance rates  
✅ **Username Management** - Personalize whose attendance you're tracking  
✅ **Export/Import** - JSON and Excel (CSV) formats  
✅ **Auto-Save** - Changes saved automatically to localStorage  
✅ **Dark Navy Theme** - Beautiful, compact design  
✅ **Local Storage** - All data stays on your device  
✅ **S3 Static Hosting** - Deploy to AWS S3 for pennies/month

## Quick Start

### Development server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Usage

### Marking Attendance
- **Left-click** on any weekday to mark as present
- Click again to unmark
- Green checkmark (✓) indicates present
- Unmarked weekdays are counted as absent
- **Popup notification** appears showing the action

### Marking Vacation/Out of Office
- **Right-click** on any weekday to mark as Vacation/OOO
- Right-click again to remove the marking
- Purple border with beach emoji (🏖️) indicates excluded dates
- These dates are completely excluded from all attendance calculations
- **Popup notification** confirms the change

### Visual Feedback
- 🟢 **Green popup**: "Marked Present ✓" or "Marked as Vacation/OOO 🏖️"
- 🔵 **Blue popup**: "Unmarked" or "Removed Vacation/OOO"
- 🟠 **Orange popup**: "Date is marked as Vacation/OOO" (warning)

### Key Indicators
- 🟢 **Green checkmark (✓)**: Present day
- 🟣 **Purple with 🏖️**: Vacation/OOO (excluded from calculations)
- 🔴 **Red underline**: US Federal Holiday (excluded from calculations)
- ⚫ **Unmarked**: Absent day
- 🔵 **Blue border**: Today

### Statistics
All statistics automatically adjust to exclude:
- Weekends
- US Federal Holidays  
- Vacation/OOO days

This gives you an accurate attendance rate based only on actual work days.

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

### Feature Documentation

- **[CLICK-POPUP-FEATURE.md](./CLICK-POPUP-FEATURE.md)** - Click popup notification system guide
- **[CLICK-POPUP-DEMO.md](./CLICK-POPUP-DEMO.md)** - Visual demo of popup notifications
- **[VACATION-OOO-FEATURE.md](./VACATION-OOO-FEATURE.md)** - Detailed guide on using the Vacation/Out of Office tracking feature
- **[MULTI-USER-SETUP.md](./MULTI-USER-SETUP.md)** - Setup instructions for multi-user file-based storage
- **[FILE-LOADING-GUIDE.md](./FILE-LOADING-GUIDE.md)** - Guide for loading attendance data from files
- **[AWS-ECS-DEPLOYMENT.md](./AWS-ECS-DEPLOYMENT.md)** - AWS deployment instructions
- **[CLOUD-SYNC-SUMMARY.md](./CLOUD-SYNC-SUMMARY.md)** - Cloud synchronization feature overview
