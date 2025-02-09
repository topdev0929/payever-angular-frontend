import { Injectable } from '@angular/core';

import { PebIntegrationAppNamesEnum } from '../constants';

import { PebBaseAppConnector } from './base-app.connector';

@Injectable()
export class PebMessageConnector extends PebBaseAppConnector {
  id = 'message-app';
  title = 'payever Message';

  protected app = PebIntegrationAppNamesEnum.Message;
}
