# CLAUDE.md

**Last updated:** 2025-01-07

## Overview

**Aurora Forecast UK** — Regional SEO landing site for the UK market. Part of the AuroraMe multi-site architecture.

| Site | Domain | Target Market |
|------|--------|---------------|
| Main | auroraforecast.me | Global |
| USA | aurora-forecast-usa.com | United States |
| **UK (this)** | auroraforecast.uk | United Kingdom |

## Repositories

**This Repo**: `/Volumes/SSD/Repos/auroraforecast-uk` — Astro static site for UK market

**Related Projects**:
- `/Volumes/SSD/Repos/aurorame` — Flutter mobile app + Firebase Cloud Functions
- `/Volumes/SSD/Repos/aurora-forecast-usa` — USA regional site (sister project)

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Technical architecture
- [docs/hosting-setup.md](docs/hosting-setup.md) — Firebase App Hosting configuration

## Tech Stack

- **Framework**: Astro 4.x (static site generation)
- **Hosting**: Firebase App Hosting (europe-west1)
- **Analytics**: Google Analytics 4 + Yandex.Metrika
- **API**: Cloud Functions from aurorame (europe-west1)

## Regional Differentiation

### UK-specific content
- Data source references: **Met Office** (UK weather), NOAA (aurora)
- Geographic focus: UK cities and regions only
- Time zones: GMT/BST
- SEO titles: Suffix with "UK" or "United Kingdom"
- Terminology: "Northern Lights" preferred, British English

### Shared with main site (auroraforecast.me)
- Cloud Functions API (CORS configured for all domains)
- City database structure
- Core component architecture
- Analytics integration

## Critical Rules

### Content Uniqueness
1. **No duplicate guides** — Guides live only on main site (auroraforecast.me)
2. **Regional data sources** — Reference Met Office for weather, NOAA for aurora
3. **Geographic filtering** — Only UK cities in search/lists
4. **Unique meta descriptions** — Regional variations in seo-titles.ts

### Architecture
1. **Sync from main site** — Use `npm run sync` to pull shared data
2. **Regional overrides** — config/regional.ts for UK-specific settings
3. **Shared API** — All Cloud Functions in aurorame repo

### DO NOT
1. Create duplicate content that exists on auroraforecast.me
2. Reference US-specific terminology (NOAA forecasts for weather)
3. Deploy Cloud Functions from this repo (they're in aurorame)
4. Create .md files describing "what was done" (use git commits)

## Commands

```bash
npm run dev       # Local development
npm run build     # Production build
npm run sync      # Sync data from aurorame
npm run preview   # Preview production build
```

## Deployment

Automatic via Firebase App Hosting on push to main branch.

Manual deployment (if needed):
```bash
firebase apphosting:backends:update
```

## CORS Configuration

API calls go to Cloud Functions in aurorame repo. CORS whitelist in:
- `aurorame/functions/src/functions/*.ts`

All functions must include `https://auroraforecast.uk` in ALLOWED_ORIGINS.
