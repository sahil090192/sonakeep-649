# SonaKeep

SonaKeep is a mobile-first gold inventory and portfolio tracker built with Expo Router and React Native. It helps users catalog physical gold holdings, monitor live rates, and keep sensitive portfolio data private on-device.

## Current product scope

SonaKeep currently supports:

- Portfolio dashboard with current value, weight, and purity summaries
- Gold holdings list with search, sorting, and category filters
- Add, edit, delete, and mark-as-sold item flows
- Live gold rate display with local caching and fallback behavior
- Privacy mode to hide monetary values in the UI
- Biometric lock for app access on supported devices
- Local persistence using AsyncStorage

## Tech stack

- Expo + React Native
- Expo Router
- TypeScript
- React Query
- AsyncStorage

## Getting started

### Prerequisites

- Node.js
- Bun

### Install dependencies

```bash
cd expo
bun install
```

### Configure environment variables

Copy the example file and provide your Metalprice API key:

```bash
cp .env.example .env
```

Required variables:

- `EXPO_PUBLIC_METAL_PRICE_API_KEY` — used for live gold rate fetching
- `EXPO_PUBLIC_METAL_PRICE_API_URL` — optional endpoint override; defaults to Metalprice latest rates API

If the API key is not configured, SonaKeep will skip live rate fetches and fall back to cached or built-in default values.

### Start the app

```bash
bun run start
```

### Start web preview

```bash
bun run start-web
```

### Run lint

```bash
bun run lint
```

## EAS build and release workflow

SonaKeep uses `expo/eas.json` to define three iOS-oriented build profiles:

- `development` — internal development client build
- `preview` — internal distribution build suitable for device testing before TestFlight
- `production` — App Store / TestFlight-ready release build with remote version auto-increment

### Authenticate with Expo / EAS

```bash
bunx eas-cli login
bunx eas-cli whoami
```

### Configure build credentials

Run this once per app/account if the project has not been connected to EAS before:

```bash
bunx eas-cli build:configure
```

### Set EAS secrets for build-time environment variables

At minimum, configure the Metalprice API key in EAS so cloud builds can fetch live gold rates:

```bash
bunx eas-cli secret:create --scope project --name EXPO_PUBLIC_METAL_PRICE_API_KEY --value <your_api_key>
```

If you intentionally need a non-default endpoint, also configure:

```bash
bunx eas-cli secret:create --scope project --name EXPO_PUBLIC_METAL_PRICE_API_URL --value https://api.metalpriceapi.com/v1/latest
```

### Build commands

```bash
bun run build:ios:development
bun run build:ios:preview
bun run build:ios:production
```

### Submit production build to TestFlight / App Store Connect

```bash
bun run submit:ios:production
```

### Intended release flow

1. Create a `preview` build for internal device validation
2. Verify installability and core flows outside Expo Go
3. Create a `production` build once release candidate quality is reached
4. Submit the production build to TestFlight
5. After beta validation, submit the same lane through App Store Connect review

## Privacy and permission footprint

Current v1 behavior is intentionally narrow:

- user-entered holdings and settings are stored locally on-device
- the app performs external network requests only for public gold-rate fetching
- the app does not require account creation, analytics, ad tracking, photo library access, or location access
- the app currently relies on biometric/device authentication only when the user enables app lock

A draft App Store privacy disclosure note lives in `../docs/privacy-disclosure-draft.md`.

## Project structure

```text
expo/
├── app/                    # Expo Router screens and layouts
├── assets/                 # App icons and static images
├── components/             # Reusable UI components
├── config/                 # Runtime configuration helpers
├── constants/              # Design tokens and domain constants
├── contexts/               # App state providers
├── types/                  # Shared TypeScript types
├── utils/                  # Calculations and service helpers
├── app.json                # Expo app configuration
├── eas.json                # EAS build and submit profiles
└── package.json            # Dependencies and scripts
```

## Development notes

- Primary development target for v1 is iOS.
- Gold item data is currently stored locally on-device.
- This repo is being hardened for TestFlight and App Store submission in tracked GitHub issues.

## Shipping roadmap

See the GitHub issues in this repository for the v1 release backlog, starting with the epic issue for TestFlight and App Store readiness.
