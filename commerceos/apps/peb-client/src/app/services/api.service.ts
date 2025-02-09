import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { PebBrowserConfig, PebClientBootstrapData, PebElementDef, PebScript } from '@pe/builder/core';
import { runMigrations } from '@pe/builder/migrations';
import { ChannelSets } from '@pe/shared/checkout';

import { PebClientConfigService } from './config.service';
import { PebSsrStateService } from './ssr-state.service';

@Injectable()
export class PebClientApiService {
  constructor(
    @Inject(PLATFORM_ID) private platformId: string,
    private configService: PebClientConfigService,
    private PebSsrStateService: PebSsrStateService,
    private http: HttpClient,
  ) {
  }

  getElements$(themeId: string, pageId: string, version: number | undefined) {
    const config = this.configService.config;

    return from(isPlatformServer(this.platformId)
      ? this.getElementForServer(config, version ?? 0, themeId, pageId)
      : this.getElementForBrowser(config, version ?? 0, themeId, pageId)
    );
  }

  getScripts$(themeId: string, version: number) : Observable<PebScript[]> {
    const config = this.configService.config;
    const url = `${config.builderApiUrl}/api/script/theme/${themeId}/all/version/${version}?isEnable=true`;

    return this.http.get<PebScript[]>(url);
  }

  public async getElementForServer(
    config: PebBrowserConfig,
    version: number,
    themeId: string,
    pageId: string,
  ): Promise<PebElementDef[]> {    
    return await getPageElements(config, `${version}`, themeId, pageId);
  }

  private async getElementForBrowser(
    config: PebBrowserConfig,
    version: number,
    themeId: string,
    pageId: string,
  ): Promise<PebElementDef[]> {
    const url = `${document.location.origin}/api/themes/${themeId}/version/${version}/pages/${pageId}/elements`;
    const resp = await fetch(url);
    const data = await resp.json();

    return data;
  }

  public getApp$(): Observable<ChannelSets | null> {
    const config = this.configService.config;
    const appData: PebClientBootstrapData | undefined = this.PebSsrStateService.getAppData();

    if (!appData) {
      return of(null);
    }
    const url = `${config.apiUrl}/api/business/${appData.businessId}/${config.appType}/${appData.applicationId}`;
    
    return this.http.get(url).pipe(map((data: any) => data.channelSet));
  }
}

export async function getPageElements(
  config: PebBrowserConfig,
  version: string | number,
  themeId: string,
  pageId: string,
): Promise<PebElementDef[]> {
  const url = `${config.builderApiUrl}/api/theme/${themeId}/page/${pageId}/element/version/${version}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!data) {
    return [];
  }
  const elements = data.filter((elm: any) => !elm.deleted);
  const migrated = await runMigrations({ api: config.builderApiUrl }, { elements });

  return migrated.elements;
}
