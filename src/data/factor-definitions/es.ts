/**
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from: app/lib/l10n/app_es.arb
 * Generated at: 2026-01-05T21:23:31.647Z
 * Language: es
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
    "title": "Zona Aurora",
    "description": "Mayor Zona Aurora = mejor visibilidad de auroras. La Zona Aurora de tu ubicación determina qué tan frecuentemente aparecen auroras en el cielo.",
    "statuses": {
      "perfect": {
        "label": "Perfecta",
        "description": "Above 62.0° - Excellent aurora visibility",
        "colorType": "success"
      },
      "good": {
        "label": "Buena",
        "description": "56.0° - 62.0° - Good aurora visibility",
        "colorType": "orange"
      },
      "acceptable": {
        "label": "Aceptable",
        "description": "50.0° - 56.0° - Fair aurora visibility",
        "colorType": "yellow"
      },
      "low": {
        "label": "Baja",
        "description": "Below 50.0° - No aurora visibility at these latitudes",
        "colorType": "danger"
      }
    }
  },
  "kp": {
    "icon": "📊",
    "title": "Índice Kp",
    "description": "Kp mide la perturbación magnética global. Mayor Kp = auroras más fuertes visibles en latitudes más bajas.",
    "statuses": {
      "storm": {
        "label": "Tormenta",
        "description": "Kp 6-9 - Tormenta geomagnética, auroras fuertes",
        "colorType": "success"
      },
      "good": {
        "label": "Bueno",
        "description": "Kp 3-6 - Actividad moderada, buenas condiciones",
        "colorType": "yellow"
      },
      "low": {
        "label": "Bajo",
        "description": "Kp 1-3 - Baja actividad, auroras débiles",
        "colorType": "orange"
      },
      "veryQuiet": {
        "label": "Muy Tranquilo",
        "description": "Kp 0-1 - Muy tranquilo, auroras mínimas",
        "colorType": "danger"
      }
    }
  },
  "weather": {
    "icon": "☁️",
    "title": "Impacto de las Condiciones Meteorológicas",
    "description": "Cielos despejados son esenciales para observar auroras. Las nubes bloquean la vista de las luces del norte. El porcentaje muestra la cobertura de nubes (0-25% clear, 85%+ overcast).",
    "statuses": {
      "clear": {
        "label": "Despejado",
        "description": "(0-25%) - Cielos despejados - Perfecto para ver auroras",
        "colorType": "success",
        "emoji": "☀️"
      },
      "partlyCloudy": {
        "label": "Parcialmente Nublado",
        "description": "(26-50%) - Algunas nubes - Puede bloquear parcialmente la vista",
        "colorType": "yellow",
        "emoji": "⛅"
      },
      "cloudy": {
        "label": "Nublado",
        "description": "(51-85%) - Nublado - Bloquea significativamente la aurora",
        "colorType": "orange",
        "emoji": "☁️"
      },
      "overcast": {
        "label": "Nublado",
        "description": "(85%+) - Cielo cubierto - Bloquea completamente la aurora",
        "colorType": "danger",
        "emoji": "☁️"
      }
    }
  },
  "moon": {
    "icon": "🌙",
    "title": "Luz Lunar",
    "description": "La luz lunar brillante puede opacar auroras débiles. La luna nueva proporciona cielos más oscuros para observación óptima.",
    "statuses": {
      "newMoon": {
        "label": "Luna Nueva",
        "description": "Cielos más oscuros - Mejor para auroras débiles",
        "colorType": "success",
        "emoji": "🌑"
      },
      "crescent": {
        "label": "Creciente",
        "description": "Luz lunar tenue - Bueno para observar",
        "colorType": "success",
        "emoji": "🌒"
      },
      "quarter": {
        "label": "Cuarto",
        "description": "Luz lunar moderada - Puede opacar auroras débiles",
        "colorType": "yellow",
        "emoji": "🌓"
      },
      "gibbous": {
        "label": "Gibosa",
        "description": "Luz lunar brillante - Reduce la visibilidad de la aurora",
        "colorType": "orange",
        "emoji": "🌔"
      },
      "full": {
        "label": "Luna Llena",
        "description": "Muy brillante - Solo auroras fuertes son visibles",
        "colorType": "danger",
        "emoji": "🌕"
      }
    }
  },
  "darkness": {
    "icon": "🌌",
    "title": "Oscuridad",
    "description": "Los cielos más oscuros son esenciales para ver auroras. El sol debe estar debajo del horizonte para que las auroras sean visibles.",
    "statuses": {
      "night": {
        "label": "Noche",
        "description": "Condiciones más oscuras - Óptimo para auroras",
        "colorType": "success"
      },
      "astronomical": {
        "label": "Crepúsculo Astronómico",
        "description": "Suficientemente oscuro - Buena observación de aurora",
        "colorType": "yellow"
      },
      "nautical": {
        "label": "Crepúsculo Náutico",
        "description": "Oscureciéndose - Pueden aparecer auroras débiles",
        "colorType": "orange"
      },
      "daylight": {
        "label": "Luz del día",
        "description": "El sol está sobre el horizonte - No hay aurora visible",
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