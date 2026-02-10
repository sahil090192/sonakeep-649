# Sonakeep - Product Requirements Document

**Version:** 1.0
**Last Updated:** February 9, 2026
**Status:** Draft

---

## 1. Executive Summary

**Sonakeep** is a mobile-first personal gold inventory and portfolio management application that helps individuals track, organize, and monitor the value of their physical gold assets (jewelry, coins, bullion, and heirlooms).

**Problem:** People invest significantly in physical gold but lack a centralized, user-friendly way to track their holdings, monitor current values, and maintain records for insurance or estate planning.

**Solution:** A beautiful, secure mobile app that digitally catalogs gold assets, provides real-time valuation, and serves as a comprehensive portfolio management tool.

---

## 2. Target Users

### Primary Personas

1. **The Gold Investor** (Age 35-55)
   - Owns gold coins, bars, and bullion as investment
   - Wants to track ROI and current market value
   - Tech-comfortable, uses fintech apps

2. **The Jewelry Owner** (Age 30-60)
   - Owns significant jewelry collection (personal or inherited)
   - Needs inventory for insurance purposes
   - Values sentimental items alongside monetary value

3. **The Family Steward** (Age 45-65)
   - Manages family heirlooms and inherited gold
   - Needs documentation for estate planning
   - Tracks items across multiple family members

### Secondary Users
- Newlyweds organizing wedding jewelry
- Small jewelry business owners (personal inventory)
- Gold collectors and enthusiasts

---

## 3. Core Features

### 3.1 Portfolio Dashboard (MVP)
**Priority:** P0

- **Live Portfolio Value**: Real-time total worth based on current gold rates
- **Key Metrics Display**:
  - Total weight (grams/ounces)
  - Current gold rate (₹/g or $/oz)
  - Item count
  - Average purity
- **Daily Change Tracking**: Show gains/losses with percentage
- **Visual Summary**: Charts and graphs of holdings

### 3.2 Item Management (MVP)
**Priority:** P0

**Add Item Manually:**
- Item name and category (jewelry, coin, bar, heirloom)
- Weight (grams/ounces)
- Purity (22K, 24K, etc.)
- Purchase price and date
- Current location (optional)
- Photos (multiple angles)
- Notes/description

**Quick Actions:**
- Add new item
- Edit existing items
- Delete items
- Mark as sold/gifted

### 3.3 Receipt Scanning (MVP)
**Priority:** P1

- OCR-powered bill/receipt scanning
- Auto-extract: weight, purity, price, date, jeweler name
- Manual review and edit before saving
- Store receipt image with item

### 3.4 Holdings View (MVP)
**Priority:** P0

- List/grid view of all items
- Filter by: category, purity, date, location
- Search functionality
- Sort by: value, weight, date added
- Individual item detail view with full information

### 3.5 Real-Time Gold Rates (MVP)
**Priority:** P0

- Live gold rate updates (by region/country)
- Support for multiple purities (24K, 22K, 18K, etc.)
- Historical rate charts
- Price alerts (optional - P2)

### 3.6 Analytics & Insights (Post-MVP)
**Priority:** P2

- Portfolio performance over time
- Distribution by category/purity
- ROI calculations
- Cost basis vs current value
- Best/worst performing items

### 3.7 Security & Privacy (MVP)
**Priority:** P0

- Biometric authentication (Face ID/Touch ID)
- PIN code backup
- Local data encryption
- Optional cloud backup (encrypted)
- Privacy mode (hide values in public)

### 3.8 Insurance & Documentation (Post-MVP)
**Priority:** P2

- Generate inventory reports (PDF)
- Export data (CSV/Excel)
- Insurance valuation certificates
- Share specific items securely

---

## 4. User Stories

### Must Have (MVP)

```
As a gold owner, I want to:
- See the total current value of my gold portfolio at a glance
- Add new gold items quickly with all relevant details
- Scan purchase receipts to auto-populate item details
- View all my holdings in an organized list
- See real-time gold rates to know current market value
- Track individual items with photos and descriptions
- Secure my app with biometric authentication
```

### Should Have (V1.1)

```
As a user, I want to:
- Set price alerts when gold rates hit certain thresholds
- See charts showing my portfolio performance over time
- Generate PDF reports of my inventory for insurance
- Categorize items by location (home safe, bank locker, etc.)
- Track items gifted or sold separately from active holdings
- Add multiple photos per item from different angles
```

### Could Have (V2.0)

```
As an advanced user, I want to:
- Share my inventory with family members (view-only)
- Track making charges separately from gold value
- Add appraisal values from jewelers
- Set reminders for insurance renewals
- Compare my portfolio against gold ETFs/digital gold
- Track exchange rates for international valuations
```

---

## 5. Technical Requirements

### 5.1 Platform
- **Primary:** iOS and Android native apps (React Native / Flutter)
- **Future:** Web dashboard (view-only)

### 5.2 Technology Stack (Recommended)
- **Frontend:** React Native / Flutter
- **Backend:** Firebase / Supabase (serverless)
- **Database:** Cloud Firestore / PostgreSQL
- **Authentication:** Firebase Auth / Auth0
- **Storage:** Cloud Storage for images
- **OCR:** Google Cloud Vision API / AWS Textract
- **Gold Rates API:** GoldAPI.io or similar

### 5.3 Data Architecture

**Collections/Tables:**
```
Users
├── userId
├── profile (name, email, currency preference, region)
├── settings (biometric enabled, privacy mode, etc.)

Items
├── itemId
├── userId (foreign key)
├── name
├── category (jewelry/coin/bar/heirloom)
├── weight
├── purity
├── purchasePrice
├── purchaseDate
├── location
├── photos[] (URLs)
├── receiptImage (URL)
├── notes
├── status (active/sold/gifted)
├── createdAt
├── updatedAt

GoldRates (cached)
├── date
├── region
├── rates (24K, 22K, 18K per gram/ounce)
```

### 5.4 Performance Requirements
- App launch: < 2 seconds
- Portfolio calculation: < 500ms
- Image upload: < 5 seconds (with compression)
- OCR processing: < 10 seconds
- Offline mode: View all data (sync when online)

### 5.5 Security Requirements
- End-to-end encryption for data at rest
- HTTPS for all API calls
- No plain text storage of sensitive data
- Automatic logout after 5 minutes of inactivity
- Secure photo storage with access controls
- GDPR/privacy compliance

---

## 6. Design Requirements

### 6.1 Design Principles
- **Luxurious but approachable**: Premium feel without intimidation
- **Data-dense yet clean**: Show key info without clutter
- **Delightful animations**: Smooth, meaningful micro-interactions
- **Trust and security**: Visual cues that data is safe

### 6.2 Key Screens (MVP)
1. **Home/Dashboard**: Portfolio value, stats, quick actions
2. **Add Item**: Form with photo upload and manual entry
3. **Scan Receipt**: Camera interface with OCR processing
4. **Holdings List**: All items with filters and search
5. **Item Detail**: Full item information with photos
6. **Gold Rates**: Live rates with historical charts
7. **Settings**: Profile, security, preferences

### 6.3 Accessibility
- Support for larger text sizes
- Color contrast ratios (WCAG AA)
- Screen reader compatibility
- Haptic feedback for key actions

---

## 7. Success Metrics

### 7.1 Acquisition Metrics
- App downloads: 10,000 in first 3 months
- User registration rate: >60% of downloads
- Activation rate: >50% add at least one item

### 7.2 Engagement Metrics
- Daily Active Users (DAU): 30% of registered users
- Weekly Active Users (WAU): 60% of registered users
- Average items per user: 8+ items
- Session length: 3-5 minutes average

### 7.3 Retention Metrics
- Day 1 retention: >60%
- Day 7 retention: >40%
- Day 30 retention: >25%
- 6-month retention: >15%

### 7.4 Feature Adoption
- Receipt scanning usage: >40% of items added via scan
- Portfolio views: Daily check-ins by >50% of active users
- Photo uploads: >80% of items have at least one photo

---

## 8. Launch Strategy

### 8.1 MVP Timeline
- **Week 1-2**: Design system and UI/UX
- **Week 3-6**: Core features development (portfolio, add item, holdings)
- **Week 7-8**: Receipt scanning and gold rates integration
- **Week 9-10**: Security implementation and testing
- **Week 11-12**: Beta testing and bug fixes
- **Week 13**: Launch to app stores

### 8.2 Go-to-Market
**Target Markets (Phase 1):**
- India (largest gold consumer market)
- UAE (high gold ownership)
- USA (investment-focused users)

**Marketing Channels:**
- Instagram/Facebook ads (targeting jewelry enthusiasts)
- Google Search ads ("gold portfolio tracker", "jewelry inventory app")
- Partnership with jewelers for co-marketing
- Personal finance/investment communities

### 8.3 Monetization Strategy (Future)

**Free Tier:**
- Up to 20 items
- Basic portfolio tracking
- Manual entry only

**Premium Tier ($4.99/month or $49.99/year):**
- Unlimited items
- Receipt scanning (OCR)
- Advanced analytics and charts
- PDF export for insurance
- Priority support
- Cloud backup

**Premium+ Tier ($9.99/month):**
- All Premium features
- Family sharing (up to 5 members)
- Professional appraisal tools
- API access for jewelers/professionals

---

## 9. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| Gold rate API downtime | High | Medium | Cache rates, use multiple providers |
| OCR accuracy issues | Medium | High | Allow manual editing, improve over time |
| Data privacy concerns | High | Low | Strong encryption, transparent privacy policy |
| Competition from fintech | Medium | Medium | Focus on physical gold niche, superior UX |
| Low adoption | High | Medium | Strong marketing, solve real pain points |

---

## 10. Future Roadmap

### Phase 2 (3-6 months post-launch)
- Family sharing and collaboration
- Integration with digital gold platforms
- Advanced analytics dashboard
- Price alerts and notifications
- Multi-currency support

### Phase 3 (6-12 months)
- Insurance marketplace integration
- Jeweler partnerships (certified appraisals)
- Web dashboard
- API for B2B (jewelers, insurance companies)
- AI-powered item identification from photos

### Phase 4 (12+ months)
- Blockchain-based provenance tracking
- Peer-to-peer gold marketplace
- Gold loan comparison tools
- Estate planning features
- NFT certificates for rare pieces

---

## 11. Open Questions

1. Should we support other precious metals (silver, platinum) from day one?
2. What's the right balance between manual entry flexibility and structured data?
3. How do we handle making charges vs pure gold value calculations?
4. Should we allow public/social features (show off collections)?
5. What certifications/partnerships would build trust (insurance companies, jewelers)?

---

## 12. Appendix

### A. Competitive Analysis
- **JewelTrack**: Basic inventory, outdated UI, no live rates
- **GoldPrice**: Only rate tracking, no inventory features
- **MyGold**: Digital gold only, not physical inventory
- **Opportunity**: No comprehensive solution for physical gold portfolio management

### B. Market Size
- Global gold jewelry market: $250B annually
- 200M+ households own significant gold
- TAM: 50M potential users globally
- SAM: 10M users in target markets
- SOM: 500K users in Year 1

---

**Document Owner:** Product Team
**Stakeholders:** Engineering, Design, Marketing
**Next Review:** Post-MVP Launch
