import { Injectable } from '@angular/core';

import { PebIntegrationAppNamesEnum } from '../constants';

import { PebBaseAppConnector } from './base-app.connector';

@Injectable()
export class PebProductsConnector extends PebBaseAppConnector {
  id = 'products-app';
  title = 'payever Products';

  protected app = PebIntegrationAppNamesEnum.Products;
}
