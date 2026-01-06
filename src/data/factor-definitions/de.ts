/**
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from: app/lib/l10n/app_de.arb
 * Generated at: 2026-01-05T21:23:31.646Z
 * Language: de
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
    "title": "Aurora-Zone",
    "description": "Höhere Aurora-Zone = bessere Aurora-Sichtbarkeit. Die Aurora-Zone Ihres Standorts bestimmt, wie oft Auroras über Ihnen erscheinen.",
    "statuses": {
      "perfect": {
        "label": "Perfekt",
        "description": "Über 62.0° - Exzellente Aurora-Sichtbarkeit (tägliche Aktivität)",
        "colorType": "success"
      },
      "good": {
        "label": "Gut",
        "description": "56.0° - 62.0° - Gute Aurora-Sichtbarkeit (regelmäßige Stürme)",
        "colorType": "orange"
      },
      "acceptable": {
        "label": "Akzeptabel",
        "description": "50.0° - 56.0° - Akzeptable Aurora-Sichtbarkeit (nur starke Stürme)",
        "colorType": "yellow"
      },
      "low": {
        "label": "Niedrig",
        "description": "Unter 50.0° - Schlechte Aurora-Sichtbarkeit (extreme Stürme)",
        "colorType": "danger"
      }
    }
  },
  "kp": {
    "icon": "📊",
    "title": "Kp-Index",
    "description": "Kp misst globale magnetische Störungen. Höheres Kp = stärkere Auroras, die bei niedrigeren Breitengraden sichtbar sind.",
    "statuses": {
      "storm": {
        "label": "Sturm",
        "description": "Kp 6-9 - Geomagnetischer Sturm, starke Auroren",
        "colorType": "success"
      },
      "good": {
        "label": "Gut",
        "description": "Kp 3-6 - Moderate Aktivität, gute Bedingungen",
        "colorType": "yellow"
      },
      "low": {
        "label": "Niedrig",
        "description": "Kp 1-3 - Niedrige Aktivität, schwache Auroras",
        "colorType": "orange"
      },
      "veryQuiet": {
        "label": "Sehr Ruhig",
        "description": "Kp 0-1 - Sehr ruhig, minimale Auroren",
        "colorType": "danger"
      }
    }
  },
  "weather": {
    "icon": "☁️",
    "title": "Auswirkung der Wetterbedingungen",
    "description": "Klarer Himmel ist wichtig für die Aurora-Beobachtung. Wolken blockieren die Sicht auf das Nordlicht. Der Prozentsatz zeigt die Bewölkung (0-25% clear, 85%+ overcast).",
    "statuses": {
      "clear": {
        "label": "Klar",
        "description": "(0-25%) - Klarer Himmel - Perfekt für Aurora-Beobachtung",
        "colorType": "success",
        "emoji": "☀️"
      },
      "partlyCloudy": {
        "label": "Teilweise bewölkt",
        "description": "(26-50%) - Einige Wolken - Könnte die Sicht teilweise blockieren",
        "colorType": "yellow",
        "emoji": "⛅"
      },
      "cloudy": {
        "label": "Bewölkt",
        "description": "(51-85%) - Bewölkt - Blockiert Aurora erheblich",
        "colorType": "orange",
        "emoji": "☁️"
      },
      "overcast": {
        "label": "Bedeckt",
        "description": "(85%+) - Bedeckt - Blockiert Aurora vollständig",
        "colorType": "danger",
        "emoji": "☁️"
      }
    }
  },
  "moon": {
    "icon": "🌙",
    "title": "Mondlicht",
    "description": "Helles Mondlicht kann schwache Auroren überblenden. Neumond bietet den dunkelsten Himmel für optimale Beobachtung.",
    "statuses": {
      "newMoon": {
        "label": "Neumond",
        "description": "Dunkelster Himmel - Am besten für schwache Auroras",
        "colorType": "success",
        "emoji": "🌑"
      },
      "crescent": {
        "label": "Mondsichel",
        "description": "Schwaches Mondlicht - Gut für Beobachtung",
        "colorType": "success",
        "emoji": "🌒"
      },
      "quarter": {
        "label": "Viertel",
        "description": "Moderates Mondlicht - Kann schwache Auroras überstrahlen",
        "colorType": "yellow",
        "emoji": "🌓"
      },
      "gibbous": {
        "label": "Dreiviertel",
        "description": "Helles Mondlicht - Reduziert Aurora-Sichtbarkeit",
        "colorType": "orange",
        "emoji": "🌔"
      },
      "full": {
        "label": "Vollmond",
        "description": "Sehr hell - Nur starke Auroren sichtbar",
        "colorType": "danger",
        "emoji": "🌕"
      }
    }
  },
  "darkness": {
    "icon": "🌌",
    "title": "Dunkelheit",
    "description": "Dunkler Himmel ist für Aurora-Beobachtung unerlässlich. Die Sonne muss unter dem Horizont stehen, damit Auroras sichtbar sind.",
    "statuses": {
      "night": {
        "label": "Nacht",
        "description": "Dunkelste Bedingungen - Optimal für Auroras",
        "colorType": "success"
      },
      "astronomical": {
        "label": "Astronomische Dämmerung",
        "description": "Dunkel genug - Gute Aurora-Beobachtung",
        "colorType": "yellow"
      },
      "nautical": {
        "label": "Nautische Dämmerung",
        "description": "Wird dunkler - Schwache Auroras können erscheinen",
        "colorType": "orange"
      },
      "daylight": {
        "label": "Tageslicht",
        "description": "Sonne über dem Horizont - Keine Aurora sichtbar",
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