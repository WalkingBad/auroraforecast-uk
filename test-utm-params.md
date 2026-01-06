# UTM Parameters Testing Guide

## How to Test

1. Start dev server: `npm run dev`
2. Open browser to `http://localhost:4321`
3. Open browser console (F12)
4. Click any store badge button
5. Check console for: `"Store click tracked: {...}"`

## Expected UTM Parameters by Page

### Homepage (`/`)
**Hero section badge**:
```javascript
{
  platform: "ios" or "android",
  utmSource: "website",
  utmMedium: "organic",
  utmCampaign: "homepage",
  utmContent: "homepage_hero",
  pageType: "homepage"
}
```

**Footer badge**:
```javascript
{
  utmCampaign: "homepage",
  utmContent: "homepage_footer"
}
```

### City Page (e.g., `/fairbanks`)
**Hero CTA badge**:
```javascript
{
  utmCampaign: "fairbanks",
  utmContent: "city_hero"
}
```

**Timeline section badge**:
```javascript
{
  utmCampaign: "fairbanks",
  utmContent: "city_timeline"
}
```

**App screens CTA badge**:
```javascript
{
  utmCampaign: "fairbanks",
  utmContent: "city_app_screens_cta"
}
```

**Travel CTA badge**:
```javascript
{
  utmCampaign: "fairbanks",
  utmContent: "city_travel_cta"
}
```

**Sticky footer badge** (scroll to bottom):
```javascript
{
  utmCampaign: "fairbanks",
  utmContent: "city_sticky_footer"
}
```

### Best-Time Page (e.g., `/best-time/fairbanks`)
**CTA section badge**:
```javascript
{
  utmCampaign: "fairbanks",
  utmContent: "best_time_cta"
}
```

### Country Hub (e.g., `/country/united-states`)
**Hero badge**:
```javascript
{
  utmCampaign: "US",  // uppercase!
  utmContent: "country_hub_hero"
}
```

**Sticky footer badge**:
```javascript
{
  utmCampaign: "US",
  utmContent: "country_hub_sticky_footer"
}
```

### State Page (e.g., `/us/ak`)
**Footer badge**:
```javascript
{
  utmCampaign: "us_ak",  // lowercase!
  utmContent: "state_page_footer"
}
```

## Test Checklist

- [ ] Homepage hero → `homepage/homepage_hero`
- [ ] Homepage footer → `homepage/homepage_footer`
- [ ] City hero → `{citySlug}/city_hero`
- [ ] City timeline → `{citySlug}/city_timeline`
- [ ] City app screens → `{citySlug}/city_app_screens_cta`
- [ ] City travel CTA → `{citySlug}/city_travel_cta`
- [ ] City sticky footer → `{citySlug}/city_sticky_footer`
- [ ] Best-time CTA → `{citySlug}/best_time_cta`
- [ ] Country hub hero → `{COUNTRYCODE}/country_hub_hero`
- [ ] Country hub footer → `{COUNTRYCODE}/country_hub_sticky_footer`
- [ ] State page footer → `{country}_{state}/state_page_footer`

## What to Look For

✅ **Correct**:
- `utmCampaign` matches expected value
- `utmContent` matches expected format
- No "web" or "default" fallbacks
- Country codes are uppercase (US, CA)
- State slugs are lowercase (us_ak, ca_qc)

❌ **Incorrect**:
- `utmCampaign: "web"`
- `utmContent: "default"`
- `utmCampaign: "undefined_undefined"`
- Lowercase country codes (us instead of US)

## Quick Test Commands

```bash
# Test homepage
open http://localhost:4321

# Test city page
open http://localhost:4321/fairbanks

# Test best-time page
open http://localhost:4321/best-time/fairbanks

# Test country hub
open http://localhost:4321/country/united-states

# Test state page
open http://localhost:4321/us/ak
```

## Verification Script

Run this in browser console to check all badges on current page:

```javascript
document.querySelectorAll('.badge-link').forEach(badge => {
  console.log({
    href: badge.href,
    platform: badge.dataset.platform,
    utmSource: badge.dataset.utmSource,
    utmMedium: badge.dataset.utmMedium,
    utmCampaign: badge.dataset.utmCampaign,
    utmContent: badge.dataset.utmContent
  });
});
```

This will show all badges on the page without needing to click them.
