# SonaKeep Final Go / No-Go Checklist

Use this checklist immediately before App Store submission.

## Release decision rule

The release should proceed only if all P0 items are cleared and no unresolved P1 issue creates confusion or risk around:
- item integrity
- saved data persistence
- privacy mode
- biometric lock
- valuation correctness or rate-source labeling

## Build and versioning
- [ ] Confirm release candidate build number is final
- [ ] Confirm app version shown in app and App Store Connect match intended release
- [ ] Confirm no debug-only banners or development residue remain in the build
- [ ] Confirm app icon and launch assets are final enough for public release

## Product behavior
- [ ] Add item flow works on release candidate build
- [ ] Edit item flow works on release candidate build
- [ ] Delete item flow works on release candidate build
- [ ] Mark-as-sold flow works on release candidate build
- [ ] Privacy Mode hides value surfaces consistently
- [ ] Biometric lock behaves correctly on supported devices
- [ ] Rates screen labels live / cached / fallback state clearly
- [ ] Holdings search, filters, and sorting work correctly

## Data and trust
- [ ] User-entered item data persists across relaunches
- [ ] Settings persist across relaunches
- [ ] Cached rates persist and display coherently
- [ ] Privacy policy content still matches shipped product behavior
- [ ] Support page content still matches available support path
- [ ] Support email address is monitored

## App Store shell
- [ ] App name, subtitle, and keywords entered in App Store Connect
- [ ] Description and promotional text entered in App Store Connect
- [ ] What’s New text entered for the release
- [ ] Screenshots captured from the release-candidate build
- [ ] Screenshot captions/ordering feel coherent
- [ ] Category and age rating selected
- [ ] Privacy nutrition answers reviewed one final time
- [ ] Review notes pasted into App Store Connect

## URLs
- [ ] Marketing URL is live over HTTPS if used
- [ ] Privacy Policy URL is live over HTTPS
- [ ] Support URL is live over HTTPS
- [ ] All URLs open correctly from desktop and mobile

## Beta / validation
- [ ] At least one TestFlight cycle completed
- [ ] Beta feedback triaged
- [ ] All must-fix beta issues resolved or consciously waived
- [ ] Known non-blockers documented

## Final release call
- [ ] GO
- [ ] NO-GO

## Decision notes
Write a short note here on why the release is or is not ready.
