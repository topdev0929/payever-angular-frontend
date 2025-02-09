import { isDevMode } from '@angular/core';

import { SHOWROOM_STAGE, STAGING_STAGE, DEV_STAGE, getReleaseStage } from '../../../common';
import { I18nConfig } from '../interfaces';

function isDevServer(): boolean {
  return getReleaseStage() === SHOWROOM_STAGE || getReleaseStage() === STAGING_STAGE || getReleaseStage() === DEV_STAGE;
}

export function getProdMode(config: I18nConfig): boolean {
  return typeof(config.isProd) === 'boolean' ? config.isProd : (!isDevMode() && !isDevServer());
}
