# Alertly - Smart Alarm & Reminder Application

A cross-platform mobile alarm and reminder management application built with **Capacitor**, **Vite**, and native integrations for iOS and Android.

## Overview

Alertly is a feature-rich alarm and event reminder app with local data storage, user authentication, and native alarm scheduling. It provides a clean, modern interface for managing daily alarms, recurring events, and personalized reminders—all data stays securely on your device.

## Key Features

- **Local Account Management**: Create secure local accounts with name, email, phone, and password verification
- **Dashboard**: View upcoming alarms and events at a glance
- **Alarm & Event Management**: Create standalone alarms or event reminders with customizable settings
- **Flexible Scheduling**:
  - Single or recurring alarms (Daily, Weekdays, Weekends, Weekly, Monthly, Yearly)
  - Custom time selection with interactive time wheel picker
  - Event-specific multiple alarm times
  - Burst alerts that repeat during the day at configurable intervals
  
- **Categories**: Organize alarms by Work, Health, Personal, Focus, or Rest
- **Profile Customization**: 
  - Profile image upload
  - Avatar presets (Wave, Sun, Mint, Night)
  - Nickname support
  
- **Settings & Preferences**:
  - Dark mode toggle
  - Smart snooze suggestions
  - Gradual volume ramping
  - Vibration/haptics control
  - Compact card display
  
- **Views**: 
  - Dashboard: Overview of upcoming alarms
  - Schedule: Calendar-based view
  - Alerts: Dedicated alarm management
  - Settings: User preferences and profile
  
- **Native Features**:
  - Camera integration for profile photos
  - Local notifications via Capacitor
  - Cross-platform support (iOS & Android)

## Tech Stack

- **Framework**: Capacitor (for cross-platform mobile)
- **Build Tool**: Vite
- **Languages**: 
  - JavaScript (57.4%) - Main application logic
  - CSS (26.8%) - Styling and responsive design
  - HTML (13.9%) - UI markup
  - Java (1.7%) - Android native integration
  - TypeScript (0.2%) - Type definitions
- **Storage**: LocalStorage (browser-based local vault)
- **UI**: Custom HTML/CSS responsive design

### Dependencies

```json
{
  "@capacitor/core": "latest",
  "@capacitor/cli": "latest",
  "@capacitor/camera": "^8.2.0",
  "@capacitor/local-notifications": "^8.2.0",
  "@capacitor/splash-screen": "^8.0.1",
  "vite": "^7.3.1",
  "typescript": "^6.0.3"
}
```

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/eduxlevis-bit/Alertly--application.git
cd Alertly--application

# Install dependencies
npm install
```

### Running the App

#### Development Mode
```bash
npm start
```
This launches the development server with Vite at `http://localhost:5173`

#### Build for Production
```bash
npm run build
```

#### Preview Production Build
```bash
npm run preview
```

## Project Structure

```
Alertly--application/
├── src/
│   ├── app.js                 # Main application logic (JavaScript)
│   ├── index.html             # Main UI template (HTML)
│   ├── styles.css             # Styling and responsive design (CSS)
│   └── ...
├── android/                   # Android native project (Java)
│   └── app/src/main/java/com/alertly/app/MainActivity.java
├── package.json               # Dependencies and scripts
├── vite.config.js             # Vite configuration
└── README.md
```

## Usage

### Creating an Account
1. Launch the app
2. Fill in your name, email, phone, and set a verification password
3. Optionally add a profile image
4. Click "Enter dashboard"

### Managing Alarms
1. Click the **+** button (FAB) to create a new alarm
2. Set:
   - Label/name
   - Time (using the interactive time wheel)
   - Type (Standalone Alarm or Event Reminder)
   - Recurrence pattern
   - Category
   - Optional burst settings
   - Notes
3. Toggle "Enabled" to activate/deactivate
4. Click "Save alert"

### Navigation
- **Dashboard**: Quick overview of upcoming alarms
- **Schedule**: Calendar view with event details
- **Alerts**: Dedicated alarm management interface
- **Settings**: Configure preferences and manage profile

## Features in Detail

### Time Picker
- Interactive rotating wheel for intuitive time selection
- Toggle between 12-hour and 24-hour formats
- Support for multiple times in event reminders

### Recurrence Options
- **Once**: Single alarm
- **Daily**: Every day
- **Weekdays**: Monday–Friday
- **Weekends**: Saturday–Sunday
- **Weekly**: Select specific days
- **Monthly**: On specific day of month
- **Yearly**: On specific month and day

### Burst Alarms
Enable "Repeat the event alarm during that day" to have the alarm ring at multiple intervals (configurable in minutes, hours, days, weeks, or months)

### Data Storage
All user data is stored in the browser's LocalStorage under the key `alertly-local-vault-v1`. The vault includes:
- Account information (encrypted password)
- All alarms and events
- User preferences and settings
- Profile customization

## Browser/Device Compatibility

- iOS (via Capacitor)
- Android (via Capacitor)
- Modern browsers with LocalStorage support
- Requires Capacitor CLI for native builds

## Security

- Local password authentication (4+ character minimum)
- All data stored locally on device—no cloud sync
- No external server dependencies

## Development

### Key Application States
- **Onboarding**: Account creation and login
- **Unlocked**: Authenticated user with full app access
- **Settings**: User preferences and profile management

### Event System
The app uses a custom event listener system for:
- Form submissions (alarm creation/update)
- Navigation between views
- Dialog management
- Settings updates

## Language Composition

The project uses a multi-language approach optimized for cross-platform development:
- **JavaScript (57.4%)**: Core application logic, state management, and event handling
- **CSS (26.8%)**: Responsive styling, animations, and dark mode theming
- **HTML (13.9%)**: Semantic markup and UI structure
- **Java (1.7%)**: Android native bridge and native activity extensions
- **TypeScript (0.2%)**: Type definitions for Capacitor plugins

## License

ISC

## Author

Created with [`@capacitor/create-app`](https://github.com/ionic-team/create-capacitor-app)

---

For more information, visit the [GitHub repository](https://github.com/eduxlevis-bit/Alertly--application).
