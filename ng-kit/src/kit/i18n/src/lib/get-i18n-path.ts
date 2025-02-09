import { I18nConfig } from '../interfaces';

import { DEFAULT_DEV_I18N_PATH, DEFAULT_PROD_I18N_PATH } from '../constants';

export function getI18nPath(config: I18nConfig, prodMode: boolean): string {
  return config.i18nPath || (prodMode ? DEFAULT_PROD_I18N_PATH : DEFAULT_DEV_I18N_PATH);
}
