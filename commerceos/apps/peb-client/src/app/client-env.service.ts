import { Injectable } from '@angular/core';

import { PeAppEnv } from '@pe/app-env';
import { AppType } from '@pe/common';

import { environment } from '../environments/environment';


@Injectable({ providedIn: 'root' })
export class PebClientEnv implements PeAppEnv {
  id = '';
  business = '';
  businessId = '';
  type = AppType.Client;
  host = '';
  api = environment.apis.backend.shop;
  ws = '';
  builder = environment.apis.backend.builderShop;
  mediaContainer = 'client';
}
