import { Inject, Injectable } from '@angular/core';

import { PeAppEnv } from '@pe/app-env';
import { AppType, EnvironmentConfigInterface, PE_ENV } from '@pe/common';


@Injectable()
export class PeSiteEnv implements PeAppEnv {
  id: string;
  business: string;
  type = AppType.Site;
  host: string;
  api: string;
  ws: string;
  builder: string;
  mediaContainer = 'site';

  constructor(
    @Inject(PE_ENV) env: EnvironmentConfigInterface,
  ) {
    this.host = env.primary.siteHost;
    this.api = env.backend.site;
    this.ws = env.backend.builderSiteWs;
    this.builder = env.backend.builderSite;
  }
}
