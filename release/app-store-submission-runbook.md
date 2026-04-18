# SonaKeep App Store Submission Runbook

This is the final manual runbook for submitting SonaKeep to App Review.

## Inputs required before starting
- Final release-candidate build uploaded and visible in App Store Connect / TestFlight
- Live Privacy Policy URL
- Live Support URL
- Final screenshot set
- Final metadata copy from `app-store/metadata.md`
- Final review notes from `app-store/review-notes.md`

## Recommended submission sequence

1. Confirm the latest release candidate is the intended build
2. Open App Store Connect for SonaKeep
3. Update app metadata
4. Upload/select screenshots in the intended order
5. Confirm category and age rating
6. Enter the Privacy Policy URL and Support URL
7. Review App Privacy answers one last time
8. Paste reviewer notes
9. Select the build for submission
10. Submit for review

## Submission checklist
- [ ] Correct build selected
- [ ] Correct version string selected
- [ ] Metadata pasted and reviewed for typos
- [ ] Screenshots uploaded and ordered
- [ ] Privacy Policy URL entered
- [ ] Support URL entered
- [ ] App Privacy answers reviewed
- [ ] Reviewer notes pasted
- [ ] No placeholder values remain

## Suggested reviewer notes to paste
Use the draft in `app-store/review-notes.md` and adjust only if product behavior changed.

## If App Review rejects the build
1. Read the rejection carefully
2. Map the rejection to one of these buckets:
   - metadata mismatch
   - privacy disclosure mismatch
   - app behavior / bug
   - missing support/privacy URL
   - reviewer confusion
3. Create a specific GitHub issue for the fix
4. Fix only the actual rejection cause, not five philosophical side quests
5. Resubmit with updated reviewer notes if needed

## After approval
- [ ] Release manually or on your intended schedule
- [ ] Verify public App Store page looks correct
- [ ] Verify support/privacy URLs still work
- [ ] Capture first post-launch bug reports in GitHub
