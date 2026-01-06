/**
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from: app/lib/l10n/app_fr.arb
 * Generated at: 2026-01-05T21:23:31.649Z
 * Language: fr
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
    "title": "Zone Aurore",
    "description": "Zone Aurorale plus élevée = meilleure visibilité des aurores. La Zone Aurorale de votre emplacement détermine à quelle fréquence les aurores apparaissent au-dessus de vous.",
    "statuses": {
      "perfect": {
        "label": "Parfait",
        "description": "Au-dessus de 62.0° - Excellente visibilité d'aurore (activité quotidienne)",
        "colorType": "success"
      },
      "good": {
        "label": "Bon",
        "description": "56.0° - 62.0° - Bonne visibilité d'aurore (tempêtes régulières)",
        "colorType": "orange"
      },
      "acceptable": {
        "label": "Acceptable",
        "description": "50.0° - 56.0° - Visibilité d'aurore acceptable (tempêtes fortes uniquement)",
        "colorType": "yellow"
      },
      "low": {
        "label": "Faible",
        "description": "En dessous de 50.0° - Mauvaise visibilité d'aurore (tempêtes extrêmes)",
        "colorType": "danger"
      }
    }
  },
  "kp": {
    "icon": "📊",
    "title": "Indice Kp",
    "description": "Kp mesure la perturbation magnétique globale. Kp plus élevé = aurores plus fortes visibles aux latitudes plus basses.",
    "statuses": {
      "storm": {
        "label": "Tempête",
        "description": "Kp 6-9 - Tempête géomagnétique, aurores fortes",
        "colorType": "success"
      },
      "good": {
        "label": "Bon",
        "description": "Kp 3-6 - Activité modérée, bonnes conditions",
        "colorType": "yellow"
      },
      "low": {
        "label": "Bas",
        "description": "Kp 1-3 - Faible activité, aurores faibles",
        "colorType": "orange"
      },
      "veryQuiet": {
        "label": "Très Calme",
        "description": "Kp 0-1 - Très calme, aurores minimales",
        "colorType": "danger"
      }
    }
  },
  "weather": {
    "icon": "☁️",
    "title": "Impact des Conditions Météorologiques",
    "description": "Un ciel dégagé est essentiel pour observer les aurores. Les nuages bloquent votre vue des aurores boréales. Le pourcentage indique la couverture nuageuse (0-25% clear, 85%+ overcast).",
    "statuses": {
      "clear": {
        "label": "Dégagé",
        "description": "(0-25%) - Ciel dégagé - Parfait pour observer l'aurore",
        "colorType": "success",
        "emoji": "☀️"
      },
      "partlyCloudy": {
        "label": "Partiellement Nuageux",
        "description": "(26-50%) - Quelques nuages - Peut partiellement bloquer la vue",
        "colorType": "yellow",
        "emoji": "⛅"
      },
      "cloudy": {
        "label": "Nuageux",
        "description": "(51-85%) - Nuageux - Bloque significativement l'aurore",
        "colorType": "orange",
        "emoji": "☁️"
      },
      "overcast": {
        "label": "Couvert",
        "description": "(85%+) - Couvert - Bloque complètement l'aurore",
        "colorType": "danger",
        "emoji": "☁️"
      }
    }
  },
  "moon": {
    "icon": "🌙",
    "title": "Clair de Lune",
    "description": "La lumière lunaire brillante peut masquer les aurores faibles. La nouvelle lune offre les ciels les plus sombres pour une observation optimale.",
    "statuses": {
      "newMoon": {
        "label": "Nouvelle Lune",
        "description": "Ciel le plus sombre - Idéal pour les aurores faibles",
        "colorType": "success",
        "emoji": "🌑"
      },
      "crescent": {
        "label": "Croissant",
        "description": "Clair de lune faible - Bon pour l'observation",
        "colorType": "success",
        "emoji": "🌒"
      },
      "quarter": {
        "label": "Quartier",
        "description": "Clair de lune modéré - Peut effacer les aurores faibles",
        "colorType": "yellow",
        "emoji": "🌓"
      },
      "gibbous": {
        "label": "Gibbeuse",
        "description": "Clair de lune brillant - Réduit la visibilité d'aurore",
        "colorType": "orange",
        "emoji": "🌔"
      },
      "full": {
        "label": "Pleine Lune",
        "description": "Très brillant - Seules les aurores fortes sont visibles",
        "colorType": "danger",
        "emoji": "🌕"
      }
    }
  },
  "darkness": {
    "icon": "🌌",
    "title": "Obscurité",
    "description": "Un ciel sombre est essentiel pour observer les aurores. Le soleil doit être sous l'horizon pour que les aurores soient visibles.",
    "statuses": {
      "night": {
        "label": "Nuit",
        "description": "Conditions les plus sombres - Optimal pour les aurores",
        "colorType": "success"
      },
      "astronomical": {
        "label": "Crépuscule Astronomique",
        "description": "Assez sombre - Bonne observation d'aurore",
        "colorType": "yellow"
      },
      "nautical": {
        "label": "Crépuscule Nautique",
        "description": "S'assombrit - Les aurores faibles peuvent apparaître",
        "colorType": "orange"
      },
      "daylight": {
        "label": "Lumière du jour",
        "description": "Le soleil est au-dessus de l'horizon - Aucune aurore visible",
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