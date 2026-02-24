# Aurora Forecast UK — CLAUDE.md

Regional SEO site for UK market. Astro 4.x static site on Firebase App Hosting (europe-west1).

Part of AuroraMe multi-site: auroraforecast.me (global), aurora-forecast-usa.com (US), **auroraforecast.uk** (UK).

## Regional Rules

- Data sources: Met Office for weather, NOAA for aurora (not US-only terminology)
- Geographic scope: UK cities and regions only, GMT/BST
- Terminology: "Northern Lights" preferred, British English
- Guides live only on main site — no duplicate content
- Unique meta descriptions via `seo-titles.ts`

## Architecture

- `npm run sync` pulls shared data from main site
- Regional overrides in `config/regional.ts`
- All Cloud Functions live in `aurorame` repo — CORS must include this domain
- API security: browser requests auto-allowed via CORS, direct access needs `x-api-key`

## Commands

```bash
npm run dev       # Local dev
npm run build     # Production build
npm run sync      # Sync from aurorame
```

Deploy: automatic on push to main. Manual: `firebase apphosting:backends:update`
