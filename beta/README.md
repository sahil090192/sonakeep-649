# SonaKeep Beta Operations Packet

This directory contains the repository-side preparation artifacts for the first TestFlight beta.

## Files
- `testflight-rollout-plan.md` — rollout goals, tester mix, release steps, triage rules, and exit criteria
- `feedback-template.md` — plain-text template for collecting tester feedback outside GitHub
- `.github/ISSUE_TEMPLATE/testflight-bug-report.md` — GitHub issue template for structured beta bug reports

## What still needs to happen manually
- Upload the release-candidate build to TestFlight
- Invite testers
- Send the beta charter to testers
- Capture screenshots and videos from real devices if needed
- Triage incoming feedback and fix only must-fix issues

## Recommended beta flow
1. Merge this packet
2. Create/upload the candidate build to TestFlight
3. Invite 5–15 testers
4. Use the feedback template or GitHub issue template
5. Triage feedback into P0 / P1 / P2
6. Fix blockers only
7. Cut a new candidate if required
