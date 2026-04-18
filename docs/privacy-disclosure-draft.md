# SonaKeep Privacy Disclosure Draft

This document is the current working draft for App Store privacy disclosures and internal dependency/permission audit notes.

## Product behavior covered by this draft

SonaKeep v1 is a local-first gold portfolio tracker. Users manually enter portfolio items, app settings are stored locally on-device, and the app optionally fetches public gold price data from a third-party pricing API.

## Current data handling summary

### Data stored on device
- Gold item records entered by the user
- App settings such as currency, weight unit, privacy mode, and biometric-lock preference
- Cached gold price responses and timestamps used for display fallback behavior

### Data sent off device
- Requests to the configured gold-rate provider for public market pricing data

### Data not collected in v1
- Account registration data
- Email addresses
- Phone numbers
- Contacts
- Location
- Photos or media library content
- Precise or coarse device location
- Advertising identifiers
- Analytics or tracking events
- Purchases or payment credentials
- Health or fitness data

## Permission footprint

### Required runtime permissions
- Biometric / device authentication via `expo-local-authentication`

### Permissions intentionally not requested in v1
- Photo library access
- Camera access
- Location access
- Contacts access
- Push notification permissions

## Dependency audit notes

The following dependencies were removed during the issue #5 cleanup because they were not required by the current v1 feature set:

- `@expo/vector-icons`
- `@rork-ai/toolkit-sdk`
- `expo-blur`
- `expo-image`
- `expo-image-picker`
- `expo-location`
- `expo-symbols`
- `react-native-worklets`
- `zustand`

## Draft App Store privacy answers

### Data used to track the user
- None

### Data linked to the user
- None

### Data not linked to the user
- None, beyond transient network requests to the gold-rate provider for public price data

## Reviewer notes draft

SonaKeep is a local-first utility app for tracking physical gold holdings. User-entered holdings and settings are stored on-device using local persistence. The app does not require account creation and does not include advertising, tracking, or analytics SDKs in v1. The only external network traffic is public gold-rate fetching used to display current valuation data.
