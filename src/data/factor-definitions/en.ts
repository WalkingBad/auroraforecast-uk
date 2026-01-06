/**
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from: app/lib/l10n/app_en.arb
 * Generated at: 2026-01-05T21:23:31.640Z
 * Language: en
 * Run 'npm run sync' to regenerate
 */

import { AuroraColors } from '../design-tokens.ts';

export type FactorColorType = 'success' | 'yellow' | 'orange' | 'danger';

export interface FactorStatusLevel {
  label: string;
  description?: string;
  colorType: FactorColorType;
  emoji?: string;
}

export interface FactorDefinition {
  icon: string;
  title: string;
  description: string;
  statuses: Record<string, FactorStatusLevel>;
}

export const factorDefinitions: Record<string, FactorDefinition> = {
  "magneticLatitude": {
    "icon": "🧭",
    "title": "Aurora Zone",
    "description": "Higher Aurora Zone = better aurora visibility. Your location's Aurora Zone determines how often auroras appear overhead.",
    "statuses": {
      "perfect": {
        "label": "Perfect",
        "description": "Above 62.0° - Excellent aurora visibility (daily activity)",
        "colorType": "success"
      },
      "good": {
        "label": "Good",
        "description": "56.0° - 62.0° - Good aurora visibility (regular storms)",
        "colorType": "orange"
      },
      "acceptable": {
        "label": "Acceptable",
        "description": "50.0° - 56.0° - Fair aurora visibility (strong storms only)",
        "colorType": "yellow"
      },
      "low": {
        "label": "Low",
        "description": "Below 50.0° - Poor aurora visibility (extreme storms)",
        "colorType": "danger"
      }
    }
  },
  "kp": {
    "icon": "📊",
    "title": "Kp index",
    "description": "Kp measures global magnetic disturbance. Higher Kp = stronger auroras visible at lower latitudes.",
    "statuses": {
      "storm": {
        "label": "Storm",
        "description": "Kp 6-9 - Geomagnetic storm, strong auroras",
        "colorType": "success"
      },
      "good": {
        "label": "Good",
        "description": "Kp 3-6 - Moderate activity, good conditions",
        "colorType": "yellow"
      },
      "low": {
        "label": "Low",
        "description": "Kp 1-3 - Low activity, weak auroras",
        "colorType": "orange"
      },
      "veryQuiet": {
        "label": "Very Quiet",
        "description": "Kp 0-1 - Very quiet, minimal auroras",
        "colorType": "danger"
      }
    }
  },
  "weather": {
    "icon": "☁️",
    "title": "Cloud Cover Impact",
    "description": "Clear skies are essential for aurora viewing. Clouds block your view of the northern lights. The percentage shows cloud coverage (0-25% = clear, 85%+ = overcast).",
    "statuses": {
      "clear": {
        "label": "Clear",
        "description": "Clear (0-25%) - Perfect for aurora viewing",
        "colorType": "success",
        "emoji": "☀️"
      },
      "partlyCloudy": {
        "label": "Partly Cloudy",
        "description": "Partly Cloudy (26-50%) - May partially block view",
        "colorType": "yellow",
        "emoji": "⛅"
      },
      "cloudy": {
        "label": "Cloudy",
        "description": "Cloudy (51-85%) - Significantly blocks aurora",
        "colorType": "orange",
        "emoji": "☁️"
      },
      "overcast": {
        "label": "Overcast",
        "description": "Overcast (85%+) - Blocks aurora completely",
        "colorType": "danger",
        "emoji": "☁️"
      }
    }
  },
  "moon": {
    "icon": "🌙",
    "title": "Moonlight",
    "description": "Bright moonlight can wash out faint auroras. New moon provides the darkest skies for optimal viewing.",
    "statuses": {
      "newMoon": {
        "label": "New Moon",
        "description": "Darkest skies - Best for faint auroras",
        "colorType": "success",
        "emoji": "🌑"
      },
      "crescent": {
        "label": "Crescent",
        "description": "Dim moonlight - Good for viewing",
        "colorType": "success",
        "emoji": "🌒"
      },
      "quarter": {
        "label": "Quarter",
        "description": "Moderate moonlight - May wash out weak auroras",
        "colorType": "yellow",
        "emoji": "🌓"
      },
      "gibbous": {
        "label": "Gibbous",
        "description": "Bright moonlight - Reduces aurora visibility",
        "colorType": "orange",
        "emoji": "🌔"
      },
      "full": {
        "label": "Full Moon",
        "description": "Very bright - Only strong auroras visible",
        "colorType": "danger",
        "emoji": "🌕"
      }
    }
  },
  "darkness": {
    "icon": "🌌",
    "title": "Darkness",
    "description": "Darker skies are essential for aurora viewing. The sun must be below the horizon for auroras to be visible.",
    "statuses": {
      "night": {
        "label": "Night",
        "description": "Darkest conditions - Optimal for auroras",
        "colorType": "success"
      },
      "astronomical": {
        "label": "Astronomical Twilight",
        "description": "Dark enough - Good aurora viewing",
        "colorType": "yellow"
      },
      "nautical": {
        "label": "Nautical Twilight",
        "description": "Getting darker - Weak auroras may appear",
        "colorType": "orange"
      },
      "daylight": {
        "label": "Daylight",
        "description": "Sun is above horizon - No aurora visible",
        "colorType": "danger"
      }
    }
  }
};

export function getStatusColor(colorType: FactorColorType): string {
  const colorMap = {
    success: AuroraColors.success || '#34C97B',
    yellow: AuroraColors.yellow || '#FFEB3B',
    orange: AuroraColors.orange || '#FF9800',
    danger: AuroraColors.danger || '#FF4747'
  };
  return colorMap[colorType] || colorMap.danger;
}