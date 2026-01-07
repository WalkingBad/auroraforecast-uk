# Aurora Forecast UK — Architecture

## Overview

Static SEO-optimized website for `auroraforecast.uk` built with Astro. The site serves as a landing page promoting the AuroraMe mobile app while providing valuable aurora forecast content for UK cities.

## Tech Stack

- **Framework**: Astro 4.x (static site generation with islands architecture)
- **Hosting**: Firebase App Hosting (europe-west1)
- **Analytics**: Google Analytics 4 + Yandex.Metrika (ID: 106166738)
- **API**: Cloud Functions (europe-west1-aurorame-621f6.cloudfunctions.net)

## API Security

Cloud Functions (`seoSnapshot`, `allCitiesStatus`) are protected:
- **CORS**: Requests from whitelisted origins allowed automatically
- **API Key**: Non-browser clients require `x-api-key` header
- Secret stored in Firebase Secret Manager (`SEO_API_KEY`)

## Directory Structure

```
auroraforecast-uk/
├── assets/                    # Source assets (images, icons)
├── docs/                      # Documentation
├── public/                    # Static files (favicons, manifest, robots.txt)
├── scripts/                   # Build and sync scripts
├── src/
│   ├── assets/               # Astro-processed assets
│   ├── components/           # Astro components (~50 components)
│   ├── config/               # Configuration files
│   ├── data/                 # Static data (cities.json, translations)
│   ├── layouts/              # Page layouts (BaseLayout, GuideLayout, etc.)
│   ├── pages/                # Route pages
│   ├── scripts/              # Client-side scripts
│   ├── styles/               # Global and page-specific styles
│   └── utils/                # Utility functions (~25 modules)
├── apphosting.yaml           # Firebase App Hosting config
├── astro.config.mjs          # Astro configuration
├── server.mjs                # Custom server for preview/SSR
└── package.json
```

## Page Types

### Dynamic Routes
- `[city].astro` — City-specific aurora forecast pages
- `[lang]/[city].astro` — Localized city pages
- `[country]/[region]/[city].astro` — Country/region hierarchy

### Static Pages
- `index.astro` — Homepage with app promotion
- `aurora-tracker.astro` — Live aurora tracking
- `northern-lights-near-me.astro` — Location-based discovery
- `best-time/` — Best viewing time pages
- `checkout/` — Payment/subscription flows

### Utility Pages
- `sitemap.xml.js` — Dynamic sitemap generation
- `api/` — API endpoints (if any)
- `404.astro` — Error page

## Key Components

### Layout Components
- **BaseLayout** — Base HTML structure, meta tags, analytics, schema.org
- **GuideLayout** — Article/guide template with breadcrumbs, CTA sections

### UI Components
- **Header/FooterLinks** — Navigation
- **Hero/AppHero** — Landing sections
- **ForecastPreview/ForecastSection** — Aurora data display
- **CitySearch** — City lookup functionality
- **StoreBadges** — App store download buttons

### Data Components
- **AuroraStatusCard** — Current aurora status
- **KpIndexScale** — Kp index visualization
- **ComparisonTable** — Feature comparisons

## Utils Architecture

### Data Processing
- `city-helpers.ts` — City data manipulation
- `city-sorting.ts` — Geographic sorting
- `kp-calculator.ts` — Kp index calculations
- `kp-bands.ts` — Kp thresholds by latitude

### SEO & i18n
- `hreflang.ts` — Multilingual link generation
- `i18n-page.ts` — Page-level translations
- `seo-titles.ts` — Dynamic title generation (UK-specific)
- `slug-normalizer.ts` — URL slug handling

### API & Data
- `api-helpers.ts` — Backend API calls
- `global-status.ts` — Real-time aurora status
- `cross-links.ts` — Internal linking strategy

### Geo & Time
- `geo-utils.ts` — Geographic calculations
- `timezone-utils.ts` — Timezone handling (GMT/BST)
- `visibility.ts` — Aurora visibility calculations

## Data Flow

```
1. Build Time (Static Generation)
   └── scripts/sync.cjs → Sync data from Flutter app
   └── scripts/build-legacy-redirects.cjs → Generate _redirects

2. Page Generation
   └── src/data/cities.json → City data (UK only)
   └── src/utils/*.ts → Data processing
   └── src/components/*.astro → UI rendering

3. Runtime (Client)
   └── API calls to Cloud Functions
   └── Analytics tracking (GA4, Yandex)
```

## Build Process

```bash
npm run sync      # Sync cities data, build redirects
npm run build     # Astro static build
npm run start     # Run custom server (server.mjs)
```

### Prebuild Scripts
1. `build-legacy-redirects.cjs` — Generate `_redirects` for legacy URLs
2. `sync.cjs` — Sync content from Flutter app (optional)

## Environment Variables

Configured in `apphosting.yaml`:
- `PUBLIC_GA_TRACKING_ID` — Google Analytics ID
- `PUBLIC_GSC_VERIFICATION_CODE` — Search Console verification
- `SITE_COUNTRY_CODES` — Target countries (default: GB)

## SEO Features

- Server-side rendered pages
- Dynamic sitemap.xml
- Schema.org markup (WebSite, MobileApplication, Place, Article)
- Hreflang tags for multilingual support
- IndexNow integration
- Canonical URLs
- Open Graph / Twitter Card meta tags

## Performance Optimizations

- Static generation (no runtime JS for most pages)
- Minimal client-side JavaScript
- Optimized images (WebP format)
- Preconnect to external resources
- Service Worker for PWA functionality

## Regional Specifics

### Data Sources
- **Aurora data**: NOAA Space Weather Prediction Center
- **Weather data**: Met Office (UK-specific)

### Geographic Scope
- UK cities and regions only
- Scottish Highlands priority (best aurora visibility)
- Cities filtered by SITE_COUNTRY_CODES

### Timezone
- GMT/BST automatic handling
- All times displayed in local UK time

## Related Repositories

- **aurorame** — Flutter mobile app + Cloud Functions (main product)
- **aurora-forecast-usa** — USA version of this site
- **auroraforecast.me** — Main global site (web-seo folder in aurorame)
