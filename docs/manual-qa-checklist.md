# SonaKeep Manual QA Checklist

Use this checklist for pre-TestFlight validation and release-candidate verification.

## Test setup

- Run the latest target branch locally or install the latest preview build
- Verify `.env` contains a valid `EXPO_PUBLIC_METAL_PRICE_API_KEY` when testing live-rate behavior
- Run at least one pass on a small iPhone-sized device and one pass on a larger iPhone size
- Start one pass from a fresh install / empty storage state
- Start another pass with several existing items already stored

## Severity definitions

### P0
- App crash
- Inability to launch app
- Data loss for existing items
- Add/edit/delete core flows do not work
- Navigation gets stuck or breaks critically

### P1
- A major feature works incorrectly but has a workaround
- Privacy or biometric behavior is inconsistent
- Rate-source state is misleading or obviously wrong
- Search/filter/sort produces wrong results

### P2
- Copy issue
- Visual glitch
- Spacing/layout issue
- Minor animation oddity

## Core flow checklist

### 1. Fresh install / empty state
- [ ] App launches cleanly on fresh install
- [ ] Home screen empty state explains what the app does
- [ ] Empty state CTA navigates to Add Item
- [ ] Holdings empty state is understandable
- [ ] Rates screen loads without crashing even before any successful live fetch

### 2. Add item flow
- [ ] Open Add Item from home
- [ ] Open Add Item from holdings
- [ ] Validation blocks empty item name
- [ ] Validation blocks invalid or zero weight
- [ ] Save a valid item successfully
- [ ] Newly saved item appears in holdings
- [ ] Newly saved item affects dashboard metrics
- [ ] Purchase date defaults correctly when left blank
- [ ] Optional fields (location, notes, purchase price) do not break save flow when blank

### 3. Item detail flow
- [ ] Tap a holdings card and open item detail
- [ ] Detail screen shows value, metadata, and category correctly
- [ ] Enter edit mode
- [ ] Edit name, weight, location, notes, and purchase price
- [ ] Save edits and confirm updated values persist
- [ ] Delete flow works and returns to previous screen
- [ ] Mark as Sold removes active item from active holdings views

### 4. Holdings screen
- [ ] Search finds item by name
- [ ] Search finds item by category text
- [ ] Search finds item by purity text
- [ ] Clear search resets results
- [ ] Category filters narrow the list correctly
- [ ] Sort by recent works
- [ ] Sort by value works
- [ ] Sort by weight works
- [ ] Sort by name works
- [ ] No-results state appears when expected

### 5. Dashboard screen
- [ ] Total portfolio value matches expected sum of active items
- [ ] Total weight matches expected sum of active items
- [ ] Item count matches holdings count
- [ ] Recent items open the correct detail screen
- [ ] Privacy mode hides value fields appropriately
- [ ] Empty state trust cards render cleanly on fresh install

### 6. Rates screen
- [ ] Live rates display when API key and network are available
- [ ] Cached state appears clearly when app reopens on the same day
- [ ] Fallback state appears clearly when live fetch is unavailable and no cache exists
- [ ] Last updated text is coherent in all three cases: live, cached, fallback
- [ ] 24K spot price and per-ounce values look reasonable
- [ ] 22K / 18K / 14K derived prices move consistently with 24K
- [ ] Daily change text behaves correctly when insufficient prior data exists

### 7. Settings / privacy / security
- [ ] Currency changes update valuation displays correctly
- [ ] Weight unit changes update displayed units correctly
- [ ] Privacy Mode hides monetary values across app surfaces
- [ ] Privacy Mode off restores values cleanly
- [ ] Biometric toggle can be enabled when device supports it
- [ ] App relocks correctly if biometric lock is enabled
- [ ] App behaves gracefully if biometric auth is cancelled or fails

### 8. Persistence / relaunch
- [ ] Force-close and reopen app; items remain present
- [ ] Force-close and reopen app; settings remain present
- [ ] Cached rate state remains coherent after relaunch
- [ ] Biometric lock state remains coherent after relaunch

### 9. Error / edge-case inputs
- [ ] Very long item names do not break layout badly
- [ ] Decimal weights save and display correctly
- [ ] Purchase price of 0 does not break P/L display
- [ ] Blank notes and blank location do not produce ugly placeholders
- [ ] Very large values do not overflow key screens badly

## Suggested smoke test sequence

If you only have 10–15 minutes:

1. Fresh install
2. Add one item
3. Confirm it appears on Dashboard, Holdings, and Item Detail
4. Toggle Privacy Mode
5. Toggle biometric lock if supported
6. Open Rates and verify source state text
7. Edit item and confirm persistence after relaunch

## Useful test IDs

### Add item
- `add-item-button`
- `item-name-input`
- `item-weight-input`
- `save-item-button`

### Holdings
- `holdings-add-button`
- `holdings-search-input`
- `holdings-search-clear-button`
- `holdings-filter-toggle`
- `holdings-filters-panel`
- `holdings-category-all`
- `holdings-category-<category>`
- `holdings-sort-<sort>`
- `holding-card-<item-id>`
- `holdings-empty-state`

### Item detail
- `item-detail-back-button`
- `item-detail-edit-button`
- `item-detail-delete-button`
- `item-detail-cancel-edit-button`
- `item-detail-save-edit-button`
- `item-detail-name-input`
- `item-detail-weight-input`
- `item-detail-purchase-price-input`
- `item-detail-location-input`
- `item-detail-notes-input`
- `item-detail-mark-sold-button`

### Settings
- `settings-currency-<currency>`
- `settings-weight-unit-<unit>`
- `settings-privacy-toggle`
- `settings-biometric-toggle`

## Release recommendation

Do not move to TestFlight beta unless all P0 issues are resolved and no unresolved P1 issue creates user confusion around privacy, valuation, or item integrity.
