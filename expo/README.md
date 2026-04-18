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
└── package.json            # Dependencies and scripts
```

## Development notes

- Primary development target for v1 is iOS.
- Gold item data is currently stored locally on-device.
- This repo is being hardened for TestFlight and App Store submission in tracked GitHub issues.

## Shipping roadmap

See the GitHub issues in this repository for the v1 release backlog, starting with the epic issue for TestFlight and App Store readiness.
