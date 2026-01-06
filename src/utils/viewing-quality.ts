/**
 * Viewing Quality Assessment
 * Calculates aurora viewing quality based on magnetic latitude
 */

export interface ViewingQuality {
  label: string;
  description: string;
}

/**
 * Determines viewing quality based on magnetic latitude
 * @param mlat - Magnetic latitude
 * @param i18nHelper - Internationalization helper with t() method
 * @returns ViewingQuality object with label and description
 */
export function getViewingQuality(mlat: number | undefined, i18nHelper: any): ViewingQuality {
  const value = mlat ?? 0;

  if (value >= 65) {
    return {
      label: i18nHelper.t('bt_quality_excellent'),
      description: i18nHelper.t('bt_quality_excellent_desc')
    };
  }

  if (value >= 60) {
    return {
      label: i18nHelper.t('bt_quality_good'),
      description: i18nHelper.t('bt_quality_good_desc')
    };
  }

  if (value >= 55) {
    return {
      label: i18nHelper.t('bt_quality_fair'),
      description: i18nHelper.t('bt_quality_fair_desc')
    };
  }

  return {
    label: i18nHelper.t('bt_quality_challenging'),
    description: i18nHelper.t('bt_quality_challenging_desc')
  };
}