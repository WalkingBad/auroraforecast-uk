/**
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from: app/lib/l10n/app_no.arb
 * Generated at: 2026-01-05T21:23:31.645Z
 * Language: no
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
    "title": "Nordlyssone",
    "description": "Høyere Nordlyssone = bedre nordlyssyn. Din posisjons Nordlyssone bestemmer hvor ofte nordlys vises over deg.",
    "statuses": {
      "perfect": {
        "label": "Perfekt",
        "description": "Over 62.0° - Utmerket nordlyssyn",
        "colorType": "success"
      },
      "good": {
        "label": "Bra",
        "description": "56.0° - 62.0° - God nordlyssyn",
        "colorType": "orange"
      },
      "acceptable": {
        "label": "Akseptabel",
        "description": "50.0° - 56.0° - Akseptabel nordlyssyn",
        "colorType": "yellow"
      },
      "low": {
        "label": "Lav",
        "description": "Under 50.0° - Dårlig nordlyssyn",
        "colorType": "danger"
      }
    }
  },
  "kp": {
    "icon": "📊",
    "title": "Kp-indeks",
    "description": "Kp måler global magnetisk forstyrrelse. Høyere Kp = sterkere nordlys synlige på lavere breddegrader.",
    "statuses": {
      "storm": {
        "label": "Storm",
        "description": "Kp 6-9 - Geomagnetisk storm, sterke nordlys",
        "colorType": "success"
      },
      "good": {
        "label": "Bra",
        "description": "Kp 3-6 - Moderat aktivitet, gode forhold",
        "colorType": "yellow"
      },
      "low": {
        "label": "Lav",
        "description": "Kp 1-3 - Lav aktivitet, svake nordlys",
        "colorType": "orange"
      },
      "veryQuiet": {
        "label": "Meget Rolig",
        "description": "Kp 0-1 - Meget rolig, minimale nordlys",
        "colorType": "danger"
      }
    }
  },
  "weather": {
    "icon": "☁️",
    "title": "Værforholds Påvirkning",
    "description": "Klar himmel er essensielt for å se nordlys. Skyer blokkerer synet av nordlyset. Prosenten viser skydekke (0-25% clear, 85%+ overcast).",
    "statuses": {
      "clear": {
        "label": "Klart",
        "description": "(0-25%) - Klar himmel - Perfekt for nordlysvisning",
        "colorType": "success",
        "emoji": "☀️"
      },
      "partlyCloudy": {
        "label": "Delvis Skyet",
        "description": "(26-50%) - Noen skyer - Kan delvis blokkere synet",
        "colorType": "yellow",
        "emoji": "⛅"
      },
      "cloudy": {
        "label": "Skyet",
        "description": "(51-85%) - Skyet - Blokkerer betydelig nordlys",
        "colorType": "orange",
        "emoji": "☁️"
      },
      "overcast": {
        "label": "Overskyet",
        "description": "(85%+) - Overskyet - Blokkerer nordlys fullstendig",
        "colorType": "danger",
        "emoji": "☁️"
      }
    }
  },
  "moon": {
    "icon": "🌙",
    "title": "Månelys",
    "description": "Sterkt månelys kan vaske ut svake nordlys. Nymåne gir den mørkeste himmelen for optimal observasjon.",
    "statuses": {
      "newMoon": {
        "label": "Nymåne",
        "description": "Mørkeste himmel - Best for svake nordlys",
        "colorType": "success",
        "emoji": "🌑"
      },
      "crescent": {
        "label": "Månesigd",
        "description": "Svakt månelys - Bra for observasjon",
        "colorType": "success",
        "emoji": "🌒"
      },
      "quarter": {
        "label": "Halvmåne",
        "description": "Moderat månelys - Kan utvaske svake nordlys",
        "colorType": "yellow",
        "emoji": "🌓"
      },
      "gibbous": {
        "label": "Puklet",
        "description": "Sterkt månelys - Reduserer nordlyssyn",
        "colorType": "orange",
        "emoji": "🌔"
      },
      "full": {
        "label": "Fullmåne",
        "description": "Meget lyst - Kun sterke nordlys synlige",
        "colorType": "danger",
        "emoji": "🌕"
      }
    }
  },
  "darkness": {
    "icon": "🌌",
    "title": "Mørke",
    "description": "Mørk himmel er avgjørende for nordlysobservasjon. Solen må være under horisonten for at nordlys skal være synlige.",
    "statuses": {
      "night": {
        "label": "Natt",
        "description": "Mørkeste forhold - Optimalt for nordlys",
        "colorType": "success"
      },
      "astronomical": {
        "label": "Astronomisk Skumring",
        "description": "Mørkt nok - God nordlysobservasjon",
        "colorType": "yellow"
      },
      "nautical": {
        "label": "Nautisk Skumring",
        "description": "Blir mørkere - Svake nordlys kan vises",
        "colorType": "orange"
      },
      "daylight": {
        "label": "Dagslys",
        "description": "Sol over horisont - Ingen nordlys synlig",
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