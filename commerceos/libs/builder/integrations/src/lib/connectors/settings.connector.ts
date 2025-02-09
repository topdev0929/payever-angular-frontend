import { Injectable } from '@angular/core';

import { PebIntegrationAppNamesEnum } from '../constants';

import { PebBaseAppConnector } from './base-app.connector';

@Injectable()
export class PebSettingsConnector extends PebBaseAppConnector {
  id = 'settings-app';
  title = 'payever Settings';

  protected app = PebIntegrationAppNamesEnum.Settings;
}
