# App Review Notes Draft

## Reviewer notes
SonaKeep is a local-first utility app for tracking physical gold holdings.

### Important context
- User-entered holdings and settings are stored on-device using local persistence.
- The app does not require account creation in the current version.
- The app does not include advertising or user-tracking SDKs in the current version.
- The app fetches public gold pricing data to estimate valuation and clearly labels whether the data shown is live, cached, or fallback.
- Biometric lock is optional and user-enabled on supported devices.

### If you are testing core flows
1. Launch the app
2. Add an item from the home screen or holdings screen
3. Open the Rates screen to verify pricing state labels
4. Open Settings to verify Privacy Mode and biometric lock controls

## App Privacy / nutrition labels draft

### Data used to track the user
- None

### Data linked to the user
- None in the current version

### Data not linked to the user
- None stored by the developer in the current version

## Permission summary
- No location permission
- No photo library permission
- No camera permission
- No contacts permission
- Optional biometric/device authentication on supported devices

## Submission reminders
- Replace support and privacy URLs with live HTTPS URLs before submission
- Confirm the support email address is monitored
- Re-check privacy answers if analytics, auth, or cloud sync are added later
