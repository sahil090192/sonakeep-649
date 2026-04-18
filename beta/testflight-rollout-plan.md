# SonaKeep TestFlight Rollout Plan

This document is the operating plan for the first TestFlight beta.

## Goals of the beta

- Confirm core flows are stable on real devices outside Expo Go
- Catch confusing UX around privacy mode, biometric lock, and valuation states
- Validate that rates source labeling makes sense to normal users
- Find any data-integrity or persistence issues before App Review

## Beta scope

This beta is for validating the existing v1 product, not for introducing new features.

### In scope
- Add, edit, delete, and mark-as-sold flows
- Dashboard and holdings consistency
- Rates screen live/cache/fallback behavior
- Settings, privacy mode, and biometric lock behavior
- General stability and layout

### Out of scope
- OCR or receipt scanning
- Cloud sync or account creation
- Family sharing
- Advanced analytics or exports
- Monetization / subscriptions

## Recommended tester pool

Start with 5–15 testers.

Suggested mix:
- 2–3 people who are detail-oriented and willing to report bugs carefully
- 2–3 people who are representative end users and less forgiving of confusing UX
- 1–2 people with smaller iPhones
- 1–2 people with larger iPhones
- 1–2 people likely to care about privacy and discretion

## Pre-flight checklist before inviting testers

- [ ] Latest release-candidate build created with production or preview profile
- [ ] Privacy/support pages are live
- [ ] App icon and branding are final enough for beta
- [ ] Manual QA smoke test completed on at least one real device
- [ ] No known P0 bugs remain
- [ ] No known P1 bug risks user confusion around item integrity, privacy, or valuation

## TestFlight release steps

1. Build the release candidate
2. Upload to TestFlight
3. Add external/internal testers
4. Send testers a short charter instead of a vague "try it out"
5. Capture all feedback in one place
6. Triage feedback within 24 hours of receiving it
7. Fix must-fix issues only
8. Cut a new candidate if necessary

## Suggested tester message

Hi — I’m sharing an early TestFlight build of SonaKeep, a local-first app for tracking physical gold holdings.

What I’d love you to test:
- adding an item
- editing an item
- deleting an item
- checking the Rates screen
- trying Privacy Mode
- trying biometric lock if your phone supports it

If something feels broken or confusing, please send:
- what you were trying to do
- what happened instead
- whether the issue is repeatable
- screenshots if relevant

## Must-ask questions for testers

1. Did anything feel confusing or untrustworthy?
2. Did the app ever make you unsure whether your data had saved?
3. Did the Rates screen make sense?
4. Did Privacy Mode behave as expected?
5. Did anything feel awkward enough that you would stop using the app?

## Triage rules

### P0 — must fix before continuing beta
- crashes
- launch failure
- item data disappears or corrupts
- add/edit/delete flows break
- biometric lock traps user or prevents app use incorrectly

### P1 — likely fix before App Review
- rates state is misleading or obviously wrong
- privacy mode misses obvious value surfaces
- search/filter/sort results are incorrect
- layout breaks on supported iPhone sizes
- severe UX confusion around core flows

### P2 — backlog unless clustered
- copy polish
- spacing issues
- animation oddities
- small cosmetic inconsistencies

## Exit criteria for beta

- At least one full TestFlight cycle completed
- No unresolved P0 issues
- No unresolved P1 issues around trust, privacy, valuation, or item integrity
- Known non-blockers documented explicitly
