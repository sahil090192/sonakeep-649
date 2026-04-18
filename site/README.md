# SonaKeep Site

This folder contains a minimal static site for SonaKeep with:

- `index.html` — landing page
- `privacy.html` — privacy policy
- `support.html` — support page

## Publish options

### Option 1: GitHub Pages

You can publish this folder using GitHub Pages by either:

1. moving these files into a Pages-published directory such as `/docs`, or
2. configuring your Pages workflow to deploy the `/site` directory

Once published, use the resulting HTTPS URLs in App Store Connect for:

- Privacy Policy URL
- Support URL

### Option 2: Custom domain / static host

You can also deploy the contents of this directory to any static hosting provider and point a custom domain such as `sonakeep.app` at it.

## Recommended URL mapping

- `/` → landing page
- `/privacy` or `/privacy.html` → privacy policy
- `/support` or `/support.html` → support page

## Pre-submission reminder

Before public App Store submission, confirm that:

- the support email address is one you control
- the published URLs are live over HTTPS
- the privacy policy text still matches the shipped product behavior
