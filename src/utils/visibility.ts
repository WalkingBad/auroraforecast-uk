/**
 * Aurora Visibility Description Service
 * Ported from app/lib/services/aurora_visibility_description_service.dart
 */

interface MagLatRange {
    id: string;
    minInclusive: number;
    maxExclusive?: number;
}

const RANGES: MagLatRange[] = [
    { id: 'lt_32', minInclusive: 0.0, maxExclusive: 32.0 },
    { id: '32_40', minInclusive: 32.0, maxExclusive: 40.0 },
    { id: '40_48', minInclusive: 40.0, maxExclusive: 48.0 },
    { id: '48_60', minInclusive: 48.0, maxExclusive: 60.0 },
    { id: '60_70', minInclusive: 60.0, maxExclusive: 70.0 },
    { id: '70_plus', minInclusive: 70.0 },
];

const MATRIX: Record<string, Record<number, string>> = {
    '32_40': {
        18: 'aurora_look_horizon',
    },
    '40_48': {
        8: 'aurora_red_camera_horizon',
        9: 'aurora_red_camera_horizon',
        10: 'aurora_red_camera_horizon',
        11: 'aurora_red_camera_horizon',
        12: 'aurora_red_camera_low',
        13: 'aurora_red_camera_low',
        14: 'aurora_red_camera_high',
        15: 'aurora_red_camera_high',
        16: 'aurora_red_camera_overhead',
        17: 'aurora_red_camera_overhead',
        18: 'aurora_red_camera_overhead',
    },
    '48_60': {
        0: 'aurora_bright_pillars',
        1: 'aurora_bright_pillars',
        2: 'aurora_mixed_camera',
        3: 'aurora_mixed_camera',
        4: 'aurora_red_camera_low',
        5: 'aurora_red_camera_low',
        6: 'aurora_red_camera_low',
        7: 'aurora_red_camera_low',
        8: 'aurora_red_camera_high',
        9: 'aurora_red_camera_high',
        10: 'aurora_red_camera_overhead',
        11: 'aurora_red_camera_overhead',
        12: 'aurora_red_camera_overhead',
        13: 'aurora_red_camera_overhead',
        14: 'aurora_red_camera_overhead',
        15: 'aurora_red_camera_overhead',
        16: 'aurora_red_camera_overhead',
        17: 'aurora_red_camera_overhead',
        18: 'aurora_red_camera_overhead',
    },
    '60_70': {
        0: 'aurora_look_horizon',
        1: 'aurora_look_horizon',
        2: 'aurora_look_horizon',
        3: 'aurora_look_horizon',
        4: 'aurora_look_low',
        5: 'aurora_look_low',
        6: 'aurora_look_low',
        7: 'aurora_look_low',
        8: 'aurora_look_high',
        9: 'aurora_look_high',
        10: 'aurora_look_high',
        11: 'aurora_look_high',
        12: 'aurora_look_overhead',
        13: 'aurora_look_overhead',
        14: 'aurora_look_overhead',
        15: 'aurora_look_overhead',
        16: 'aurora_look_overhead',
        17: 'aurora_look_overhead',
        18: 'aurora_look_overhead',
    },
    '70_plus': {
        0: 'aurora_look_horizon',
        1: 'aurora_look_horizon',
        2: 'aurora_look_horizon',
        3: 'aurora_look_horizon',
        4: 'aurora_look_horizon',
        5: 'aurora_look_horizon',
        6: 'aurora_look_low',
        7: 'aurora_look_low',
        8: 'aurora_look_high',
        9: 'aurora_look_high',
        10: 'aurora_look_high',
        11: 'aurora_look_high',
        12: 'aurora_look_high',
        13: 'aurora_look_high',
        14: 'aurora_look_high',
        15: 'aurora_look_high',
        16: 'aurora_look_high',
        17: 'aurora_look_high',
        18: 'aurora_look_high',
    },
};

const DEFAULT_KEY = 'aurora_visibility_not_visible';

function kpToBucketIndex(kp: number | null | undefined): number {
    if (kp === null || kp === undefined || isNaN(kp)) {
        return 0;
    }
    // Clamp between 0 and 18 (kp * 2)
    return Math.min(Math.max(Math.round(kp * 2), 0), 18);
}

export function resolveVisibility(magneticLatitude: number | null | undefined, kpIndex: number | null | undefined): string {
    const absMagLat = Math.abs(magneticLatitude ?? NaN);

    if (isNaN(absMagLat)) {
        return DEFAULT_KEY;
    }

    const range = RANGES.find(r => {
        if (absMagLat < r.minInclusive) return false;
        if (r.maxExclusive !== undefined && absMagLat >= r.maxExclusive) return false;
        return true;
    }) || RANGES[RANGES.length - 1];

    const row = MATRIX[range.id];
    const kpBucket = kpToBucketIndex(kpIndex);

    // In the Dart code, if the key doesn't exist in the row map, it falls back to default.
    // The row map is sparse in Dart (e.g. '32_40' only has key 18).
    return row?.[kpBucket] ?? DEFAULT_KEY;
}
