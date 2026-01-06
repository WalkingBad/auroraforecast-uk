/**
 * Seasonal Patterns
 * Functions for calculating seasonal and hourly aurora viewing patterns
 */

export interface MonthPattern {
  month: string;
  score: number;
  reason: string;
  darkness: number;
  highlights: string[];
}

export interface HourlyPattern {
  peak: string;
  good: string;
  description: string;
  factors: string[];
}

/**
 * Generates seasonal patterns based on magnetic latitude
 * @param mlat - Magnetic latitude
 * @param i18nHelper - Internationalization helper with t() method
 * @returns Array of month patterns sorted by score
 */
export function getSeasonalPatterns(mlat: number, i18nHelper: any): MonthPattern[] {
  const patterns: MonthPattern[] = [];

  // September Equinox Peak
  patterns.push({
    month: i18nHelper.t('bt_month_september'),
    score: 95,
    reason: i18nHelper.t('bt_reason_autumn_equinox'),
    darkness: mlat > 60 ? 14 : 10,
    highlights: [
      i18nHelper.t('bt_highlight_sep_1'),
      i18nHelper.t('bt_highlight_sep_2'),
      i18nHelper.t('bt_highlight_sep_3')
    ]
  });

  // October - Extended Peak
  patterns.push({
    month: i18nHelper.t('bt_month_october'),
    score: 92,
    reason: i18nHelper.t('bt_reason_extended_equinox'),
    darkness: mlat > 60 ? 16 : 11,
    highlights: [
      i18nHelper.t('bt_highlight_oct_1'),
      i18nHelper.t('bt_highlight_oct_2'),
      i18nHelper.t('bt_highlight_oct_3')
    ]
  });

  // March Equinox
  patterns.push({
    month: i18nHelper.t('bt_month_march'),
    score: 88,
    reason: i18nHelper.t('bt_reason_spring_equinox'),
    darkness: mlat > 60 ? 12 : 10,
    highlights: [
      i18nHelper.t('bt_highlight_mar_1'),
      i18nHelper.t('bt_highlight_mar_2'),
      i18nHelper.t('bt_highlight_mar_3')
    ]
  });

  // Winter months - Best darkness
  if (mlat > 55) {
    patterns.push({
      month: i18nHelper.t('bt_month_december'),
      score: 85,
      reason: i18nHelper.t('bt_reason_max_darkness'),
      darkness: mlat > 65 ? 20 : 15,
      highlights: [
        i18nHelper.t('bt_highlight_dec_1'),
        i18nHelper.t('bt_highlight_dec_2'),
        i18nHelper.t('bt_highlight_dec_3')
      ]
    });

    patterns.push({
      month: i18nHelper.t('bt_month_january'),
      score: 84,
      reason: i18nHelper.t('bt_reason_peak_winter'),
      darkness: mlat > 65 ? 20 : 15,
      highlights: [
        i18nHelper.t('bt_highlight_jan_1'),
        i18nHelper.t('bt_highlight_jan_2'),
        i18nHelper.t('bt_highlight_jan_3')
      ]
    });
  }

  // April - Spring bonus
  patterns.push({
    month: i18nHelper.t('bt_month_april'),
    score: 82,
    reason: i18nHelper.t('bt_reason_late_spring'),
    darkness: mlat > 60 ? 10 : 9,
    highlights: [
      i18nHelper.t('bt_highlight_apr_1'),
      i18nHelper.t('bt_highlight_apr_2'),
      i18nHelper.t('bt_highlight_apr_3')
    ]
  });

  // November - Early winter
  patterns.push({
    month: i18nHelper.t('bt_month_november'),
    score: 80,
    reason: i18nHelper.t('bt_reason_early_winter'),
    darkness: mlat > 60 ? 18 : 12,
    highlights: [
      i18nHelper.t('bt_highlight_nov_1'),
      i18nHelper.t('bt_highlight_nov_2'),
      i18nHelper.t('bt_highlight_nov_3')
    ]
  });

  // February - Late winter
  patterns.push({
    month: i18nHelper.t('bt_month_february'),
    score: 78,
    reason: i18nHelper.t('bt_reason_late_winter'),
    darkness: mlat > 60 ? 17 : 13,
    highlights: [
      i18nHelper.t('bt_highlight_feb_1'),
      i18nHelper.t('bt_highlight_feb_2'),
      i18nHelper.t('bt_highlight_feb_3')
    ]
  });

  // Summer months - Challenging
  if (mlat < 65) {
    patterns.push({
      month: i18nHelper.t('bt_month_august'),
      score: 45,
      reason: i18nHelper.t('bt_reason_late_summer'),
      darkness: mlat > 60 ? 8 : 7,
      highlights: [
        i18nHelper.t('bt_highlight_aug_1'),
        i18nHelper.t('bt_highlight_aug_2'),
        i18nHelper.t('bt_highlight_aug_3')
      ]
    });
  }

  // May - Limited viewing
  patterns.push({
    month: i18nHelper.t('bt_month_may'),
    score: 35,
    reason: i18nHelper.t('bt_reason_late_spring_twilight'),
    darkness: mlat > 60 ? 6 : 8,
    highlights: [
      i18nHelper.t('bt_highlight_may_1'),
      i18nHelper.t('bt_highlight_may_2'),
      i18nHelper.t('bt_highlight_may_3')
    ]
  });

  // June/July - Midnight sun challenges
  patterns.push({
    month: i18nHelper.t('bt_month_june'),
    score: 15,
    reason: mlat > 66 ? i18nHelper.t('bt_reason_midnight_sun') : i18nHelper.t('bt_reason_white_nights'),
    darkness: mlat > 66 ? 0 : 4,
    highlights: [
      mlat > 66 ? i18nHelper.t('bt_highlight_jun_1_polar') : i18nHelper.t('bt_highlight_jun_1_normal'),
      i18nHelper.t('bt_highlight_jun_2'),
      i18nHelper.t('bt_highlight_jun_3')
    ]
  });

  patterns.push({
    month: i18nHelper.t('bt_month_july'),
    score: 18,
    reason: mlat > 66 ? i18nHelper.t('bt_reason_polar_day') : i18nHelper.t('bt_reason_summer_twilight'),
    darkness: mlat > 66 ? 0 : 5,
    highlights: [
      i18nHelper.t('bt_highlight_jul_1'),
      i18nHelper.t('bt_highlight_jul_2'),
      i18nHelper.t('bt_highlight_jul_3')
    ]
  });

  return patterns.sort((a, b) => b.score - a.score);
}

/**
 * Generates hourly viewing patterns based on magnetic latitude
 * @param mlat - Magnetic latitude
 * @param i18nHelper - Internationalization helper with t() method
 * @returns HourlyPattern object
 */
export function getHourlyPatterns(mlat: number | undefined, i18nHelper: any): HourlyPattern {
  const latitude = mlat || 60;

  // Peak hours based on magnetic midnight (approximately 22:00-02:00 local)
  return {
    peak: latitude > 65 ? '22:00-02:00' : '23:00-01:00',
    good: latitude > 65 ? '21:00-03:00' : '22:00-02:00',
    description: i18nHelper.t('bt_hourly_magnetic_desc'),
    factors: [
      i18nHelper.t('bt_hourly_factor_1'),
      i18nHelper.t('bt_hourly_factor_2'),
      i18nHelper.t('bt_hourly_factor_3'),
      i18nHelper.t('bt_hourly_factor_4')
    ]
  };
}